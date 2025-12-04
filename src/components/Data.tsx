import { useState, useEffect, useRef } from 'react';
import { Loader, ChevronLeft, ChevronRight, Search, ChevronDown, X, Calendar, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientsDataTableProps {
  clientId: string;
}

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

  // Filter states
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<string>('Prospect'); // Default to Prospect
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<Record<string, ColumnFilter>>({});
  const [openFilterDropdown, setOpenFilterDropdown] = useState<string | null>(null);
  
  // Refs for dropdowns
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

        if (fetchError) {
          throw fetchError;
        }

        setData(tableData || []);
        setCurrentPage(1); // Reset to first page when data changes
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchData();

    // Auto-refresh every 2 minutes (120000 ms)
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 120000); // 2 minutes

    // Listen for manual refresh events (triggered after upload)
    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('refreshDataTable', handleRefresh);

    // Cleanup
    return () => {
      clearInterval(refreshInterval);
      window.removeEventListener('refreshDataTable', handleRefresh);
    };
  }, [clientId]);

  if (!clientId) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
        <div className="flex items-center justify-center h-full">
          <p
            className="text-[#072741] opacity-40 text-center"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
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
          <p
            className="text-red-600 text-center"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
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
          <p
            className="text-[#072741] opacity-40 text-center"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            No data found for this client.
          </p>
        </div>
      </div>
    );
  }

  // Get all unique column names from all rows to handle varying columns
  // Exclude 'id' and 'client_id' as they are internal fields
  const getAllColumns = () => {
    try {
      if (!data || data.length === 0) return [];
    const columnSet = new Set<string>();
    data.forEach((row) => {
        if (row && typeof row === 'object') {
      Object.keys(row).forEach((key) => columnSet.add(key));
        }
    });
    // Filter out internal columns that shouldn't be displayed
    const allColumns = Array.from(columnSet);
    return allColumns.filter(col => col !== 'id' && col !== 'client_id');
    } catch (error) {
      console.error('Error getting columns:', error);
      return [];
    }
  };

  const columns = getAllColumns();

  // Get unique values for a column (for dynamic filters)
  const getUniqueValuesForColumn = (column: string): string[] => {
    try {
      if (!data || data.length === 0 || !column) return [];
      const values = new Set<string>();
      data.forEach((row) => {
        try {
          const value = row?.[column];
          if (value !== null && value !== undefined && value !== '') {
            values.add(String(value));
          }
        } catch {
          // Skip this row if error
        }
      });
      return Array.from(values).sort();
    } catch (error) {
      console.error('Error getting unique values:', error);
      return [];
    }
  };

  // Check if a column is a date column (registration_date or similar)
  const isDateColumn = (column: string): boolean => {
    const lowerColumn = column.toLowerCase();
    return lowerColumn.includes('date') || lowerColumn.includes('registration');
  };

  // Parse date string to Date object
  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Apply all filters to data
  const getFilteredData = (): any[] => {
    try {
      if (!data || data.length === 0) return [];
      
      let filtered = [...data];

      // 1. User Type filter (only apply if user_type column exists and has matching data)
      if (selectedUserType) {
        const hasUserTypeColumn = columns.some(col => 
          col.toLowerCase() === 'user_type' || col.toLowerCase() === 'usertype'
        );
        
        if (hasUserTypeColumn) {
          const beforeFilter = filtered.length;
          filtered = filtered.filter((row) => {
            try {
              const userType = row.user_type || row.userType || row.User_Type || '';
              return String(userType).toLowerCase() === selectedUserType.toLowerCase();
            } catch {
              return true; // Include row if error parsing
            }
          });
          
          // If filter results in empty data, show all data instead (user type might not exist in data)
          if (filtered.length === 0 && beforeFilter > 0) {
            filtered = [...data]; // Reset to show all data
          }
        }
      }

      // 2. Global search filter
      if (globalSearch.trim()) {
        const searchTerm = globalSearch.toLowerCase();
        filtered = filtered.filter((row) => {
          try {
            return columns.some((col) => {
              const value = row[col];
              if (value === null || value === undefined) return false;
              return String(value).toLowerCase().includes(searchTerm);
            });
          } catch {
            return true; // Include row if error
          }
        });
      }

      // 3. Date range filter (for registration_date or similar)
      if (dateFrom || dateTo) {
        filtered = filtered.filter((row) => {
          try {
            const dateColumn = columns.find((col) => isDateColumn(col));
            if (!dateColumn) return true;

            const rowDate = parseDate(row[dateColumn]);
            if (!rowDate) return false;

            if (dateFrom) {
              const fromDate = new Date(dateFrom);
              if (isNaN(fromDate.getTime())) return true; // Invalid date, include row
              fromDate.setHours(0, 0, 0, 0);
              if (rowDate < fromDate) return false;
            }

            if (dateTo) {
              const toDate = new Date(dateTo);
              if (isNaN(toDate.getTime())) return true; // Invalid date, include row
              toDate.setHours(23, 59, 59, 999);
              if (rowDate > toDate) return false;
            }

            return true;
          } catch {
            return true; // Include row if error
          }
        });
      }

      // 4. Column-specific filters
      Object.entries(columnFilters).forEach(([column, filter]) => {
        if (filter && filter.selectedValues && filter.selectedValues.size > 0) {
          filtered = filtered.filter((row) => {
            try {
              const value = row[column];
              return filter.selectedValues.has(String(value ?? ''));
            } catch {
              return true; // Include row if error
            }
          });
        }
      });

      // 5. Apply sorting
      Object.entries(columnFilters).forEach(([column, filter]) => {
        if (filter && filter.sortDirection) {
          try {
            filtered.sort((a, b) => {
              const aVal = a[column];
              const bVal = b[column];
              
              // Handle null/undefined
              if (aVal === null || aVal === undefined) return 1;
              if (bVal === null || bVal === undefined) return -1;

              // Handle dates
              if (isDateColumn(column)) {
                const aDate = parseDate(aVal);
                const bDate = parseDate(bVal);
                if (!aDate || !bDate) return 0;
                return filter.sortDirection === 'asc' 
                  ? aDate.getTime() - bDate.getTime()
                  : bDate.getTime() - aDate.getTime();
              }

              // Handle strings/numbers
              const aStr = String(aVal).toLowerCase();
              const bStr = String(bVal).toLowerCase();
              
              if (filter.sortDirection === 'asc') {
                return aStr.localeCompare(bStr);
              } else {
                return bStr.localeCompare(aStr);
              }
            });
          } catch {
            // If sorting fails, continue without sorting
          }
        }
      });

      return filtered;
    } catch (error) {
      console.error('Error filtering data:', error);
      return data; // Return original data if filtering fails
    }
  };

  const filteredData = getFilteredData() || [];

  // Handle column filter toggle
  const toggleColumnFilterValue = (column: string, value: string) => {
    setColumnFilters((prev) => {
      const current = prev[column] || { selectedValues: new Set(), sortDirection: null };
      const newSelectedValues = new Set(current.selectedValues);
      
      if (newSelectedValues.has(value)) {
        newSelectedValues.delete(value);
      } else {
        newSelectedValues.add(value);
      }

      return {
        ...prev,
        [column]: {
          ...current,
          selectedValues: newSelectedValues,
        },
      };
    });
    setCurrentPage(1);
  };

  // Handle column sort
  const handleColumnSort = (column: string, direction: 'asc' | 'desc') => {
    setColumnFilters((prev) => {
      const current = prev[column] || { selectedValues: new Set(), sortDirection: null };
      return {
        ...prev,
        [column]: {
          ...current,
          sortDirection: current.sortDirection === direction ? null : direction,
        },
      };
    });
    setCurrentPage(1);
  };

  // Clear column filter
  const clearColumnFilter = (column: string) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
    setOpenFilterDropdown(null);
    setCurrentPage(1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([column, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          if (openFilterDropdown === column) {
            setOpenFilterDropdown(null);
          }
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openFilterDropdown]);

  // Pagination calculations (using filtered data)
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filters change (handled in individual filter handlers to avoid infinite loops)

  // Handle page changes
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Show last page
      pages.push(totalPages);
    }

    return pages;
  };

  // Early return if no columns (shouldn't happen, but safety check)
  if (columns.length === 0 && !isLoading && !error && data.length > 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-[#072741] opacity-40 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            Unable to display data. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col h-full">
      {/* Filters Section */}
      <div className="mb-4 space-y-4">
        {/* Global Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search across all columns..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348ADC] focus:border-transparent text-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>

        {/* User Type Filter Cards */}
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

        {/* Registration Date Range Filter */}
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
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#348ADC] focus:border-transparent"
              style={{ fontFamily: 'Inter, sans-serif' }}
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
              className="px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-[#348ADC] focus:border-transparent"
              style={{ fontFamily: 'Inter, sans-serif' }}
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
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Responsive scrollable table container */}
      <div 
        className="w-full h-full overflow-auto border border-gray-200 rounded-lg"
        style={{ height: 'calc(100vh - 350px)' }}
      >
        <table className="w-full border-collapse min-w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b border-gray-200">
              {columns.map((column) => {
                const columnFilter = columnFilters[column];
                const hasFilter = columnFilter && (columnFilter.selectedValues.size > 0 || columnFilter.sortDirection);
                const uniqueValues = getUniqueValuesForColumn(column);
                
                return (
                <th
                  key={column}
                    className="px-3 py-2 text-left text-xs font-medium text-[#072741] bg-gray-50 whitespace-nowrap relative"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                    <div className="flex items-center justify-between gap-2">
                      <span>{column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenFilterDropdown(openFilterDropdown === column ? null : column);
                          }}
                          className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                            hasFilter ? 'text-[#348ADC]' : 'text-gray-400'
                          }`}
                        >
                          <ChevronDown size={14} />
                        </button>
                        
                        {openFilterDropdown === column && (
                          <div
                            ref={(el) => (dropdownRefs.current[column] = el)}
                            className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 border-b border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-[#072741]">Filter & Sort</span>
                                {hasFilter && (
                                  <button
                                    onClick={() => clearColumnFilter(column)}
                                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                                  >
                                    <X size={12} />
                                    Clear
                                  </button>
                                )}
                              </div>
                              
                              {/* Sort Options */}
                              <div className="flex gap-1 mb-2">
                                <button
                                  onClick={() => handleColumnSort(column, 'asc')}
                                  className={`flex-1 px-2 py-1 text-xs rounded border transition-colors flex items-center justify-center gap-1 ${
                                    columnFilter?.sortDirection === 'asc'
                                      ? 'bg-[#348ADC] text-white border-[#348ADC]'
                                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                  }`}
                                >
                                  <ArrowUp size={12} />
                                  Asc
                                </button>
                                <button
                                  onClick={() => handleColumnSort(column, 'desc')}
                                  className={`flex-1 px-2 py-1 text-xs rounded border transition-colors flex items-center justify-center gap-1 ${
                                    columnFilter?.sortDirection === 'desc'
                                      ? 'bg-[#348ADC] text-white border-[#348ADC]'
                                      : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                                  }`}
                                >
                                  <ArrowDown size={12} />
                                  Desc
                                </button>
                              </div>
                            </div>
                            
                            {/* Filter Values */}
                            {uniqueValues.length > 0 && (
                              <div className="p-2 max-h-64 overflow-y-auto">
                                <div className="text-xs font-semibold text-gray-600 mb-2">Filter by value:</div>
                                {uniqueValues.slice(0, 50).map((value) => {
                                  const isSelected = columnFilter?.selectedValues.has(value) || false;
                                  return (
                                    <label
                                      key={value}
                                      className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleColumnFilterValue(column, value)}
                                        className="rounded border-gray-300 text-[#348ADC] focus:ring-[#348ADC]"
                                      />
                                      <span className="text-xs text-[#072741] truncate flex-1">{value}</span>
                                    </label>
                                  );
                                })}
                                {uniqueValues.length > 50 && (
                                  <div className="text-xs text-gray-500 px-2 py-1">
                                    Showing first 50 of {uniqueValues.length} values
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-gray-500">
                  No data matches the current filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
              <tr
                key={startIndex + index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > 0 && (
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Page Info */}
          <div className="text-xs text-[#072741] opacity-50" style={{ fontFamily: 'Inter, sans-serif' }}>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredData.length)} of {filteredData.length} row{filteredData.length !== 1 ? 's' : ''}
            {filteredData.length !== data.length && (
              <span className="ml-2 text-gray-400">(filtered from {data.length} total)</span>
            )}
          </div>

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-2.5 py-1.5 rounded-md border transition-all duration-200 flex items-center gap-1 text-xs ${
                  currentPage === 1
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-[#348ADC] text-[#348ADC] hover:bg-[#348ADC] hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <ChevronLeft size={14} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && handlePageClick(page)}
                    disabled={typeof page === 'string'}
                    className={`px-2.5 py-1.5 rounded-md border transition-all duration-200 text-xs ${
                      typeof page === 'string'
                        ? 'border-transparent text-gray-400 cursor-default'
                        : page === currentPage
                        ? 'border-[#348ADC] bg-[#348ADC] text-white'
                        : 'border-gray-300 text-[#072741] hover:border-[#348ADC] hover:text-[#348ADC]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-2.5 py-1.5 rounded-md border transition-all duration-200 flex items-center gap-1 text-xs ${
                  currentPage === totalPages
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-[#348ADC] text-[#348ADC] hover:bg-[#348ADC] hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

