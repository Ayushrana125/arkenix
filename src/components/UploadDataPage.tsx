import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, FileText, Download, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';

interface UploadDataPageProps {
  onClose: () => void;
  clientId: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ValidatedRow {
  [key: string]: string;
}

const ALLOWED_HEADERS = [
  'first_name',
  'last_name',
  'title',
  'official_email',
  'mobile_number',
  'company',
  'industry',
  'user_type'
];

const HEADER_NORMALIZATIONS: { [key: string]: string } = {
  'firstname': 'first_name',
  'first name': 'first_name',
  'firstname': 'first_name',
  'lastname': 'last_name',
  'last name': 'last_name',
  'email': 'official_email',
  'e-mail': 'official_email',
  'mobile': 'mobile_number',
  'mobile number': 'mobile_number',
  'phone': 'mobile_number',
  'phonenumber': 'mobile_number',
  'phone number': 'mobile_number',
};

const MAX_ROWS = 10000;
const MAX_STRING_LENGTH = 255;
const PREVIEW_ROWS = 5;

export function UploadDataPage({ onClose, clientId }: UploadDataPageProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validRows, setValidRows] = useState<ValidatedRow[]>([]);
  const [errorRows, setErrorRows] = useState<ValidationError[]>([]);
  const [allRows, setAllRows] = useState<any[]>([]);
  const [normalizedHeaders, setNormalizedHeaders] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse Excel/CSV file
  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let workbook;
          
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            workbook = XLSX.read(data, { type: 'string' });
          } else {
            // Parse Excel
            workbook = XLSX.read(data, { type: 'array' });
          }
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse file. Please ensure it is a valid Excel or CSV file.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file.'));
      };

      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Normalize headers
  const normalizeHeaders = (headers: string[]): { normalized: string[], errors: ValidationError[] } => {
    const normalized: string[] = [];
    const errors: ValidationError[] = [];
    const headerMap: { [key: string]: number } = {};

    headers.forEach((header, index) => {
      const trimmed = header.trim().toLowerCase();
      const normalizedHeader = HEADER_NORMALIZATIONS[trimmed] || trimmed;

      if (ALLOWED_HEADERS.includes(normalizedHeader)) {
        if (headerMap[normalizedHeader] !== undefined) {
          errors.push({
            row: 0,
            field: header,
            message: `Duplicate header: "${header}" (normalized to "${normalizedHeader}")`
          });
        } else {
          normalized.push(normalizedHeader);
          headerMap[normalizedHeader] = index;
        }
      } else {
        errors.push({
          row: 0,
          field: header,
          message: `Unknown header: "${header}". Allowed headers: ${ALLOWED_HEADERS.join(', ')}`
        });
      }
    });

    return { normalized, errors };
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Validate mobile number
  const validateMobile = (mobile: string): boolean => {
    const cleaned = mobile.trim().replace(/\s+/g, '');
    // Optional +, then 7-15 digits
    const mobileRegex = /^\+?\d{7,15}$/;
    return mobileRegex.test(cleaned);
  };

  // Validate a single row
  const validateRow = (row: any, rowIndex: number, headers: string[]): { isValid: boolean; errors: ValidationError[] } => {
    const errors: ValidationError[] = [];
    
    // Check if row is completely empty
    const isEmpty = headers.every(header => {
      const value = row[header];
      return !value || String(value).trim() === '';
    });
    
    if (isEmpty) {
      return { isValid: false, errors: [] }; // Skip empty rows silently
    }

    // Validate each field
    headers.forEach(header => {
      let value = row[header];
      
      // Trim whitespace
      if (value !== null && value !== undefined) {
        value = String(value).trim();
        row[header] = value;
      } else {
        value = '';
      }

      // Check max length
      if (value.length > MAX_STRING_LENGTH) {
        errors.push({
          row: rowIndex + 1,
          field: header,
          message: `Value exceeds maximum length of ${MAX_STRING_LENGTH} characters`
        });
      }

      // Field-specific validations
      if (header === 'official_email') {
        if (!value) {
          errors.push({
            row: rowIndex + 1,
            field: header,
            message: 'Email is required'
          });
        } else if (!validateEmail(value)) {
          errors.push({
            row: rowIndex + 1,
            field: header,
            message: 'Invalid email format'
          });
        }
      }

      if (header === 'mobile_number' && value) {
        if (!validateMobile(value)) {
          errors.push({
            row: rowIndex + 1,
            field: header,
            message: 'Invalid mobile number format. Must be 7-15 digits with optional + prefix'
          });
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  };

  // Process file
  const handleFileSelect = async (file: File) => {
    // File type validation
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      alert('Please upload only .csv or .xlsx files');
      return;
    }

    setIsProcessing(true);
    setSelectedFile(file);
    setValidRows([]);
    setErrorRows([]);
    setAllRows([]);

    try {
      // Parse file
      const rawData = await parseFile(file);

      // Check max rows
      if (rawData.length > MAX_ROWS) {
        alert(`File contains ${rawData.length} rows. Maximum allowed is ${MAX_ROWS} rows.`);
        setIsProcessing(false);
        return;
      }

      if (rawData.length === 0) {
        alert('File appears to be empty or invalid.');
        setIsProcessing(false);
        return;
      }

      // Get headers from first row
      const rawHeaders = Object.keys(rawData[0]);
      
      // Normalize headers
      const { normalized, errors: headerErrors } = normalizeHeaders(rawHeaders);
      
      if (normalized.length === 0) {
        alert('No valid headers found in the file.');
        setIsProcessing(false);
        return;
      }

      setNormalizedHeaders(normalized);
      setErrorRows(headerErrors);

      // Validate each row
      const valid: ValidatedRow[] = [];
      const errors: ValidationError[] = [...headerErrors];

      rawData.forEach((row: any, index: number) => {
        // Map raw headers to normalized headers
        const normalizedRow: any = {};
        rawHeaders.forEach((rawHeader, idx) => {
          const trimmed = rawHeader.trim().toLowerCase();
          const normalizedHeader = HEADER_NORMALIZATIONS[trimmed] || trimmed;
          if (ALLOWED_HEADERS.includes(normalizedHeader)) {
            normalizedRow[normalizedHeader] = row[rawHeader];
          }
        });

        const { isValid, errors: rowErrors } = validateRow(normalizedRow, index, normalized);
        
        if (isValid) {
          valid.push(normalizedRow);
        } else {
          errors.push(...rowErrors);
        }
      });

      setValidRows(valid);
      setErrorRows(errors);
      setAllRows(rawData);

    } catch (error: any) {
      alert(`Error processing file: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const preparePayload = () => {
    // Return validated rows without client_id (Edge Function will add it)
    return validRows;
  };

  // Upload to Supabase Edge Function
  const handleUploadToSupabase = async () => {
    if (validRows.length === 0) {
      setToastMessage({ type: 'error', message: 'No valid rows to upload.' });
      return;
    }

    if (!clientId) {
      setToastMessage({ type: 'error', message: 'Client ID is missing. Please log in again.' });
      return;
    }

    setIsUploading(true);
    setToastMessage(null);

    try {
      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase URL is not configured');
      }

      // Call Edge Function - send rows without client_id (will be added by Edge Function)
      const response = await fetch(`${supabaseUrl}/functions/v1/import_client_users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          client_id: clientId,
          rows: validRows, // Send validated rows (client_id will be added by Edge Function)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Upload failed');
      }

      if (result.status === 'success') {
        setToastMessage({
          type: 'success',
          message: `Upload complete — ${result.inserted} users imported successfully.`
        });

        // Trigger data table refresh
        window.dispatchEvent(new CustomEvent('refreshDataTable'));

        // Reset state after a short delay
        setTimeout(() => {
          setSelectedFile(null);
          setValidRows([]);
          setErrorRows([]);
          setAllRows([]);
          setNormalizedHeaders([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          onClose();
        }, 2000);
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setToastMessage({
        type: 'error',
        message: error.message || 'Failed to upload data. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    // Legacy handler - redirects to new handler
    await handleUploadToSupabase();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidRows([]);
    setErrorRows([]);
    setAllRows([]);
    setNormalizedHeaders([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download sample file
  const downloadSampleFile = () => {
    const sampleData = [
      {
        first_name: 'John',
        last_name: 'Doe',
        title: 'Marketing Manager',
        official_email: 'john.doe@example.com',
        mobile_number: '+1234567890',
        company: 'Acme Corp',
        industry: 'Technology',
        user_type: 'lead'
      },
      {
        first_name: 'Jane',
        last_name: 'Smith',
        title: 'Sales Director',
        official_email: 'jane.smith@example.com',
        mobile_number: '+1987654321',
        company: 'Tech Solutions',
        industry: 'Software',
        user_type: 'prospect'
      },
      {
        first_name: 'Bob',
        last_name: 'Johnson',
        title: 'CEO',
        official_email: 'bob.johnson@example.com',
        mobile_number: '+1555123456',
        company: 'Innovation Labs',
        industry: 'Consulting',
        user_type: 'user'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Data');
    XLSX.writeFile(wb, 'sample_data_upload.xlsx');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FA] overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white shadow-sm">
        <h2
          className="text-2xl font-bold text-[#072741]"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Upload Data
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} className="text-[#072741]" />
        </button>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Side - Upload Area & Guidelines */}
        <div className="w-1/2 border-r border-gray-200 p-6 overflow-y-auto bg-[#F5F7FA]">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-semibold text-[#072741]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Upload File
                </h3>
                <button
                  onClick={downloadSampleFile}
                  className="flex items-center gap-2 px-4 py-2 text-sm border border-[#348ADC] text-[#348ADC] hover:bg-[#348ADC] hover:text-white rounded-lg transition-all duration-200 font-medium"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Download size={16} />
                  Download Sample
                </button>
              </div>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                  ${selectedFile
                    ? 'border-[#348ADC] bg-gradient-to-br from-[#348ADC]/10 to-[#65C9D4]/5'
                    : 'border-gray-300 hover:border-[#348ADC] hover:bg-white shadow-sm hover:shadow-md'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-4">
                    <FileSpreadsheet size={48} className="mx-auto text-[#348ADC]" />
                    <div>
                      <p
                        className="text-[#072741] font-semibold mb-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {selectedFile.name}
                      </p>
                      <p
                        className="text-sm text-gray-500"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="text-sm text-red-600 hover:text-red-700"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload size={48} className="mx-auto text-gray-400" />
                    <div>
                      <p
                        className="text-[#072741] font-semibold mb-1"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Drag and drop your file here
                      </p>
                      <p
                        className="text-sm text-gray-500"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        or click to browse
                      </p>
                      <p
                        className="text-xs text-gray-400 mt-2"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        Supports .csv and .xlsx files only (Max {MAX_ROWS.toLocaleString()} rows)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Processing file...</p>
                </div>
              )}
            </div>

            {/* Guidelines */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3
                className="text-lg font-semibold text-[#072741] mb-4 flex items-center gap-2"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <FileText size={20} className="text-[#348ADC]" />
                Guidelines
              </h3>
              
              <div className="space-y-4 text-sm text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div>
                  <p className="font-semibold mb-2">Allowed Headers:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>first_name, last_name, title</li>
                    <li>official_email (required)</li>
                    <li>mobile_number (7-15 digits, optional +)</li>
                    <li>company, industry, user_type</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Header Variations Accepted:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>firstname → first_name</li>
                    <li>email → official_email</li>
                    <li>mobile/phone → mobile_number</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Validation Rules:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Email format validation</li>
                    <li>Mobile: digits only, 7-15 characters</li>
                    <li>Max 255 characters per field</li>
                    <li>Empty rows are skipped</li>
                    <li>Whitespace is automatically trimmed</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">File Limits:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Maximum {MAX_ROWS.toLocaleString()} rows per file</li>
                    <li>Supported formats: .csv, .xlsx</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Summary */}
            {selectedFile && !isProcessing && (
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3
                  className="text-lg font-semibold text-[#072741] mb-4"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Validation Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={20} />
                    <span className="font-medium">{validRows.length} valid rows</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle size={20} />
                    <span className="font-medium">{errorRows.length} errors found</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Success/Errors & Preview */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Success Panel or Errors Section */}
          <div className="flex-1 p-6 overflow-y-auto border-b border-gray-200 bg-[#F5F7FA]">
            {errorRows.length === 0 && validRows.length > 0 ? (
              // Success Panel
              <div className="bg-white rounded-xl p-8 shadow-lg border border-green-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                  <h3
                    className="text-2xl font-bold text-[#072741] mb-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    All Good — No Validation Errors
                  </h3>
                  <p
                    className="text-gray-600"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Your file has been validated successfully and is ready to upload.
                  </p>
                </div>

                {/* Proceed Button */}
                <button
                  id="proceed-upload-button"
                  onClick={handleUploadToSupabase}
                  disabled={isUploading}
                  className="w-full px-6 py-3 bg-[#348ADC] hover:bg-[#2a6fb0] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-semibold shadow-md shadow-[#348ADC]/20 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Uploading…
                    </>
                  ) : (
                    'Proceed to Upload'
                  )}
                </button>
              </div>
            ) : (
              // Errors Section
              <>
                <h3
                  className="text-lg font-semibold text-[#072741] mb-4 flex items-center gap-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <AlertCircle size={20} className="text-red-600" />
                  Validation Errors
                </h3>

                {errorRows.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                    <p style={{ fontFamily: 'Inter, sans-serif' }}>
                      Upload a file to see validation results
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {errorRows.map((error, index) => (
                      <div
                        key={index}
                        className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-900">
                              Row {error.row} - {error.field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            <p className="text-sm text-red-700 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {error.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Preview Section */}
          <div className="h-64 p-6 border-t border-gray-200 overflow-y-auto bg-white">
            <h3
              className="text-lg font-semibold text-[#072741] mb-4"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Data Preview
            </h3>

            {allRows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p style={{ fontFamily: 'Inter, sans-serif' }}>
                  Upload a file to see preview
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#072741] to-[#0a3d5c]">
                      {normalizedHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-2 py-2 text-left font-semibold text-white border border-gray-300"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allRows.slice(0, PREVIEW_ROWS).map((row, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        {normalizedHeaders.map((header) => {
                          const rawHeader = Object.keys(allRows[0] || {}).find(
                            h => {
                              const trimmed = h.trim().toLowerCase();
                              const normalized = HEADER_NORMALIZATIONS[trimmed] || trimmed;
                              return normalized === header;
                            }
                          );
                          return (
                            <td
                              key={header}
                              className="px-2 py-2 text-[#072741] border border-gray-200"
                              style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                              {rawHeader ? (row[rawHeader] || '-') : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allRows.length > PREVIEW_ROWS && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Showing first {PREVIEW_ROWS} of {allRows.length} rows
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white shadow-lg flex items-center justify-between">
        <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          {selectedFile && !isProcessing && (
            <>
              <span className="text-green-600 font-medium">{validRows.length} valid</span>
              {' • '}
              <span className="text-red-600 font-medium">{errorRows.length} errors</span>
              {' • '}
              <span className="text-[#072741] font-medium">{allRows.length} total rows</span>
            </>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-[#072741] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Cancel
          </button>
          {errorRows.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing || validRows.length === 0 || isUploading}
              className="px-6 py-2.5 bg-[#348ADC] hover:bg-[#2a6fb0] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-md shadow-[#348ADC]/20"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isProcessing ? 'Processing...' : isUploading ? 'Uploading...' : `Upload ${validRows.length} Valid Rows`}
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`
              px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]
              ${toastMessage.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
              }
            `}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            )}
            <p className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
              {toastMessage.message}
            </p>
            <button
              onClick={() => setToastMessage(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

