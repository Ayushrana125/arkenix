import { X, Upload, FileSpreadsheet } from 'lucide-react';
import { useState, useRef } from 'react';

interface UploadDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadDataModal({ isOpen, onClose }: UploadDataModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    } else {
      alert('Please upload only .xlsx or .csv files');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    } else {
      alert('Please upload only .xlsx or .csv files');
    }
  };

  const isValidFile = (file: File): boolean => {
    const validExtensions = ['.xlsx', '.csv'];
    const fileName = file.name.toLowerCase();
    return validExtensions.some(ext => fileName.endsWith(ext));
  };

  const handleUpload = () => {
    if (selectedFile) {
      // TODO: Implement actual upload logic
      console.log('Uploading file:', selectedFile.name);
      alert(`File "${selectedFile.name}" will be uploaded.`);
      // Reset and close
      setSelectedFile(null);
      onClose();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm text-[#072741]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 relative animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-[#BCC4C9] hover:text-[#072741] transition-colors"
        >
          <X size={24} />
        </button>

        <h2
          className="text-3xl font-bold text-[#072741] mb-2"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Upload Data
        </h2>
        <p
          className="text-[#BCC4C9] mb-6"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Upload your data files (.xlsx or .csv)
        </p>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragging
              ? 'border-[#348ADC] bg-[#348ADC]/5'
              : selectedFile
              ? 'border-[#348ADC] bg-[#348ADC]/5'
              : 'border-[#BCC4C9] hover:border-[#348ADC] hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileSelect}
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
                  className="text-sm text-[#BCC4C9]"
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
              <Upload size={48} className="mx-auto text-[#BCC4C9]" />
              <div>
                <p
                  className="text-[#072741] font-semibold mb-1"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Drag and drop your file here
                </p>
                <p
                  className="text-sm text-[#BCC4C9]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  or click to browse
                </p>
                <p
                  className="text-xs text-[#BCC4C9] mt-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Supports .xlsx and .csv files only
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[#BCC4C9] text-[#072741] rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="flex-1 px-4 py-3 bg-[#348ADC] hover:bg-[#2a6fb0] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
}

