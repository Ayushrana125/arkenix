import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Loader,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  X,
  Calendar,
  Mail,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientsDataTableProps {
  clientId: string;
}

// SAFER column filter type for future use
interface ColumnFilter {
  selectedValues: Set<string>;
  sortDirection: 'asc' | 'desc' | null;
}

export function ClientsDataTable({ clientId }: ClientsDataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

  // -----------------------------
  // FILTER STATES
  // -----------------------------
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedSearchColumns, setSelectedSearchColumns] = useState<string[]>([]); // Empty = all columns
  const [isSearchColumnDropdownOpen, setIsSearchColumnDropdownOpen] = useState(false);
  const searchColumnDropdownRef = useRef<HTMLDivElement | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string>('Prospect'); // Default
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // columnFilters kept for future extension (sorting / filtering)
  const [columnFiltersVersion, setColumnFiltersVersion] = useState(0);

  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // ----------------------------------------------------------
  // FETCH DATA FROM SUPABASE
  // ----------------------------------------------------------
  useEffect(() => {
    if (!clientId) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data: tableData, error: fetchError } = await supabase
          .from('clients_user_data')
          .select('*')
          .eq('client_id', clientId);

        if (fetchError) throw fetchError;

        setData(tableData || []);
        setCurrentPage(1);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);

    const handleRefresh = () => fetchData();
    window.addEventListener('refreshDataTable', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshDataTable', handleRefresh);
    };
  }, [clientId]);

  // ----------------------------------------------------------
  // NORMALIZE ALL COLUMN NAMES SAFELY
  // ----------------------------------------------------------
  const getAllColumns = () => {
    try {
      if (!Array.isArray(data) || data.length === 0) return [];

      const colSet = new Set<string>();
      for (const row of data) {
        if (row && typeof row === 'object') {
          for (const key of Object.keys(row)) {
            colSet.add(key);
          }
        }
      }

      const allColumns = Array.from(colSet);

      // remove internal fields
      return allColumns.filter(
        (c) => c !== 'id' && c !== 'client_id'
      );
    } catch (err) {
      console.error('Column generation failed:', err);
      return [];
    }
  };

  const columns = useMemo(() => {
    try {
      const cols = getAllColumns();
      if (!Array.isArray(cols)) return [];
      return cols.filter(Boolean);
    } catch (err) {
      console.error('Error creating columns memo:', err);
      return [];
    }
  }, [data]);

  // ----------------------------------------------------------
  // DATE PARSE HELPER - Handles ISO 8601 with timezones (including incomplete formats)
  // ----------------------------------------------------------
  const parseDate = (value: string | null | undefined): Date | null => {
    if (!value) return null;
    try {
      let dateStr = String(value).trim();
      
      // Handle incomplete timezone formats (e.g., "2025-12-02T21:13:56.964185+" or "2025-12-02T21:13:56.964185-")
      // If it ends with just + or -, append "00:00" to make it valid
      if (dateStr.endsWith('+') || dateStr.endsWith('-')) {
        dateStr = dateStr + '00:00';
      }
      
      // Try parsing the date
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        // If parsing fails, try extracting just the date part (YYYY-MM-DD)
        const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          const dateOnly = new Date(dateMatch[1] + 'T00:00:00Z');
          if (!isNaN(dateOnly.getTime())) {
            return dateOnly;
          }
        }
        return null;
      }
      return d;
    } catch {
      return null;
    }
  };

  // Get date-only string (YYYY-MM-DD) for comparison
  // Uses UTC to avoid timezone conversion issues
  const getDateOnly = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if a column is a date column
  const isDateColumn = (columnName: string): boolean => {
    const lower = columnName.toLowerCase();
    return lower.includes('date') || lower.includes('registration');
  };

  // ----------------------------------------------------------
  // APPLY ALL FILTERS SAFELY
  // ----------------------------------------------------------
  const filteredData = useMemo(() => {
    try {
      if (!Array.isArray(data)) return [];

      let filtered = [...data];

      // 1) USER TYPE FILTER
      if (selectedUserType) {
        const lowered = selectedUserType.toLowerCase();
        filtered = filtered.filter((row) => {
          try {
            const val = row.user_type;
            return val && String(val).toLowerCase() === lowered;
          } catch {
            return true;
          }
        });
      }

      // 2) GLOBAL SEARCH
      if (globalSearch.trim()) {
        const search = globalSearch.toLowerCase();
        const columnsToSearch = selectedSearchColumns.length > 0 ? selectedSearchColumns : columns;
        filtered = filtered.filter((row) =>
          columnsToSearch.some((col) => {
            const v = row[col];
            return v != null && String(v).toLowerCase().includes(search);
          })
        );
      }

      // 3) DATE RANGE FILTER - Works with ISO 8601 dates with timezones
      if (dateFrom || dateTo) {
        // Find the date column dynamically
        const dateColumn = columns.find(col => isDateColumn(col));
        
        if (dateColumn) {
          filtered = filtered.filter((row) => {
            try {
              const rawValue = row[dateColumn];
              if (!rawValue || rawValue === '-' || rawValue === null || rawValue === undefined) {
                return false; // Skip rows with no date value
              }
              
              const rowDate = parseDate(rawValue);
              if (!rowDate) {
                // If parsing fails, try to extract date from string directly
                const dateMatch = String(rawValue).match(/^(\d{4}-\d{2}-\d{2})/);
                if (!dateMatch) return false;
                
                // Use the extracted date for comparison
                const extractedDate = dateMatch[1];
                if (dateFrom && extractedDate < dateFrom) return false;
                if (dateTo && extractedDate > dateTo) return false;
                return true;
              }

              // Get date-only strings for comparison (YYYY-MM-DD)
              const rowDateOnly = getDateOnly(rowDate);

              // Compare date-only strings (ignores time and timezone)
              // dateFrom and dateTo are already in YYYY-MM-DD format from the date input
              if (dateFrom) {
                if (rowDateOnly < dateFrom) return false;
              }

              if (dateTo) {
                if (rowDateOnly > dateTo) return false;
              }

              return true;
            } catch (err) {
              // Log error for debugging but don't break the filter
              console.warn('Date filter error:', err, row[dateColumn]);
              return false; // Exclude row if error parsing
            }
          });
        }
      }

      return filtered;
    } catch (err) {
      console.error('Filter application failed:', err);
      return data;
    }
  }, [
    data,
    columns,
    globalSearch,
    selectedSearchColumns,
    selectedUserType,
    dateFrom,
    dateTo,
    columnFiltersVersion,
  ]);

  // ----------------------------------------------------------
  // PAGINATION
  // ----------------------------------------------------------
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePageClick = (page: number) => setCurrentPage(page);

  // ----------------------------------------------------------
  // SELECTION HANDLERS
  // ----------------------------------------------------------
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.size === paginatedData.length) {
      // Deselect all on current page
      setSelectedUserIds(new Set());
    } else {
      // Select all on current page
      const allIds = new Set(selectedUserIds);
      paginatedData.forEach((row) => {
        if (row.id) {
          allIds.add(String(row.id));
        }
      });
      setSelectedUserIds(allIds);
    }
  };

  // ----------------------------------------------------------
  // DELETE FUNCTIONALITY
  // ----------------------------------------------------------
  const handleDeleteSelected = async () => {
    if (selectedUserIds.size === 0) {
      alert('Please select at least one user to delete.');
      return;
    }

    const confirmMessage = selectedUserIds.size === 1
      ? 'Are you sure you want to delete this user? This action cannot be undone.'
      : `Are you sure you want to delete ${selectedUserIds.size} users? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      const userIds = Array.from(selectedUserIds);
      
      // Call Supabase Edge Function
      const { data: supabaseData } = await supabase.functions.invoke('delete_client_users', {
        body: {
          client_id: clientId,
          user_ids: userIds,
        },
      });

      if (supabaseData?.status === 'success' || supabaseData?.status === 'partial_success') {
        // Refresh data
        window.dispatchEvent(new Event('refreshDataTable'));
        // Clear selection
        setSelectedUserIds(new Set());
        alert(`Successfully deleted ${supabaseData.deleted || userIds.length} user(s).`);
      } else {
        throw new Error(supabaseData?.message || 'Failed to delete users');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(`Error deleting users: ${error.message || 'Unknown error'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // ----------------------------------------------------------
  // SEND EMAIL FUNCTIONALITY (Placeholder)
  // ----------------------------------------------------------
  const handleSendEmail = () => {
    if (selectedUserIds.size === 0) {
      alert('Please select at least one user to send email to.');
      return;
    }
    // TODO: Implement email functionality
    alert(`Send email to ${selectedUserIds.size} selected user(s) - Feature coming soon!`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');

      pages.push(totalPages);
    }

    return pages;
  };

  // -----------------------------------------
  //              JSX RETURN
  // -----------------------------------------
  if (!clientId) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <p className="text-[#072741] opacity-40 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            Client ID not found. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <Loader className="animate-spin text-[#348ADC]" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-600 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            Error: {error}
          </p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <p className="text-[#072741] opacity-40 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            Upload data to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col h-full">
      {/* ------------------------------
          FILTERS SECTION
      ------------------------------ */}
      <div className="mb-4 space-y-4">

        {/* GLOBAL SEARCH WITH COLUMN SELECTOR */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={selectedSearchColumns.length > 0 
                ? `Search in ${selectedSearchColumns.length} column${selectedSearchColumns.length > 1 ? 's' : ''}...`
                : "Search across all columns..."}
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348ADC] text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
          
          {/* Column Selector Dropdown */}
          <div className="relative" ref={searchColumnDropdownRef}>
            <button
              onClick={() => setIsSearchColumnDropdownOpen(!isSearchColumnDropdownOpen)}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors ${
                selectedSearchColumns.length > 0 ? 'bg-[#348ADC]/10 border-[#348ADC] text-[#348ADC]' : 'bg-white text-gray-700'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span className="whitespace-nowrap">
                {selectedSearchColumns.length === 0 
                  ? 'Search in: All' 
                  : `Search in: ${selectedSearchColumns.length}`}
              </span>
              <ChevronDown size={16} className={`transition-transform ${isSearchColumnDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSearchColumnDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="text-xs font-semibold text-[#072741]">Select Columns</span>
                    <button
                      onClick={() => {
                        setSelectedSearchColumns([]);
                        setIsSearchColumnDropdownOpen(false);
                      }}
                      className="text-xs text-[#348ADC] hover:text-[#2a6fb0]"
                    >
                      Clear
                    </button>
                  </div>
                  
                  <div className="border-b border-gray-200 mb-2"></div>
                  
                  <label className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedSearchColumns.length === 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSearchColumns([]);
                        }
                      }}
                      className="rounded border-gray-300 text-[#348ADC] focus:ring-[#348ADC]"
                    />
                    <span className="text-xs text-[#072741] font-medium">All Columns</span>
                  </label>
                  
                  <div className="border-b border-gray-200 my-2"></div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {columns.map((column) => {
                      const isSelected = selectedSearchColumns.includes(column);
                      return (
                        <label
                          key={column}
                          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSearchColumns([...selectedSearchColumns, column]);
                              } else {
                                setSelectedSearchColumns(selectedSearchColumns.filter(c => c !== column));
                              }
                            }}
                            className="rounded border-gray-300 text-[#348ADC] focus:ring-[#348ADC]"
                          />
                          <span className="text-xs text-[#072741] truncate flex-1">
                            {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* USER TYPE CARDS */}
        <div className="flex flex-wrap gap-2">
          {['Prospect', 'Lead', 'User'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedUserType(type);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedUserType === type
                  ? 'bg-[#348ADC] text-white shadow-md'
                  : 'bg-gray-100 text-[#072741] hover:bg-gray-200'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* DATE RANGE FILTER */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#348ADC]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#348ADC]"
            />
          </div>

          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setCurrentPage(1);
              }}
              className="px-2 py-1 text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------
          ACTION BUTTONS
      ------------------------------ */}
      {selectedUserIds.size > 0 && (
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={handleSendEmail}
            disabled={isDeleting}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Mail size={16} />
            Send Email {selectedUserIds.size > 1 ? `(${selectedUserIds.size})` : ''}
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Trash2 size={16} />
            {isDeleting ? 'Deleting...' : `Delete Selected ${selectedUserIds.size > 1 ? 'Users' : 'User'}`}
          </button>
          <span className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
            {selectedUserIds.size} selected
          </span>
        </div>
      )}

      {/* ------------------------------
          TABLE
      ------------------------------ */}
      <div className="w-full h-full overflow-auto border border-gray-200 rounded-lg" style={{ height: 'calc(100vh - 350px)' }}>
        <table className="w-full border-collapse min-w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-[#072741] bg-gray-50 whitespace-nowrap w-12">
                <input
                  type="checkbox"
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.filter((r) => r.id).length > 0 &&
                    paginatedData
                      .filter((r) => r.id)
                      .every((r) => selectedUserIds.has(String(r.id)))
                  }
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-[#348ADC] focus:ring-[#348ADC] cursor-pointer"
                />
              </th>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-3 py-2 text-left text-xs font-medium text-[#072741] bg-gray-50 whitespace-nowrap"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-8 text-center text-sm text-gray-500">
                  No data matches the current filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => {
                const userId = row.id ? String(row.id) : '';
                const isSelected = userId && selectedUserIds.has(userId);
                return (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => userId && toggleUserSelection(userId)}
                        disabled={!userId}
                        className="rounded border-gray-300 text-[#348ADC] focus:ring-[#348ADC] cursor-pointer disabled:cursor-not-allowed"
                      />
                    </td>
                    {columns.map((column) => (
                      <td
                        key={column}
                        className="px-3 py-2 text-xs text-[#072741] whitespace-nowrap"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        {row[column] !== null && row[column] !== undefined
                          ? String(row[column])
                          : '-'}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------------------
          PAGINATION
      ------------------------------ */}
      {filteredData.length > 0 && (
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* LEFT SIDE: Showing X-Y of Z */}
          <div className="text-xs text-[#072741] opacity-50" style={{ fontFamily: 'Inter, sans-serif' }}>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} rows
            {filteredData.length !== data.length && (
              <span className="ml-2 text-gray-400">(filtered from {data.length} total)</span>
            )}
          </div>

          {/* RIGHT SIDE: Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">

              {/* PREVIOUS */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-2.5 py-1.5 rounded-md border text-xs flex items-center gap-1 transition ${
                  currentPage === 1
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-[#348ADC] text-[#348ADC] hover:bg-[#348ADC] hover:text-white'
                }`}
              >
                <ChevronLeft size={14} /> <span className="hidden sm:inline">Previous</span>
              </button>

              {/* PAGE NUMBERS */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, i) => (
                  <button
                    key={i}
                    disabled={typeof page !== 'number'}
                    onClick={() => typeof page === 'number' && handlePageClick(page)}
                    className={`px-2.5 py-1.5 rounded-md border text-xs transition ${
                      typeof page !== 'number'
                        ? 'border-transparent text-gray-400'
                        : page === currentPage
                        ? 'bg-[#348ADC] border-[#348ADC] text-white'
                        : 'border-gray-300 text-[#072741] hover:border-[#348ADC] hover:text-[#348ADC]'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* NEXT */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-2.5 py-1.5 rounded-md border text-xs flex items-center gap-1 transition ${
                  currentPage === totalPages
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-[#348ADC] text-[#348ADC] hover:bg-[#348ADC] hover:text-white'
                }`}
              >
                <span className="hidden sm:inline">Next</span> <ChevronRight size={14} />
              </button>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

