import { useState, useEffect, useMemo } from 'react';
import {
  Loader,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Calendar,
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
  const [selectedUserType, setSelectedUserType] = useState<string>('Prospect'); // Default
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // columnFilters kept for future extension (sorting / filtering)
  const [columnFiltersVersion, setColumnFiltersVersion] = useState(0);

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
  // DATE PARSE HELPER
  // ----------------------------------------------------------
  const parseDate = (value: string | null | undefined): Date | null => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
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
        filtered = filtered.filter((row) =>
          columns.some((col) => {
            const v = row[col];
            return v != null && String(v).toLowerCase().includes(search);
          })
        );
      }

      // 3) DATE RANGE FILTER
      if (dateFrom || dateTo) {
        filtered = filtered.filter((row) => {
          try {
            const raw = row['registration_date'];
            const rowDate = parseDate(raw);
            if (!rowDate) return false;

            if (dateFrom) {
              const dFrom = new Date(dateFrom);
              dFrom.setHours(0, 0, 0, 0);
              if (rowDate < dFrom) return false;
            }

            if (dateTo) {
              const dTo = new Date(dateTo);
              dTo.setHours(23, 59, 59, 999);
              if (rowDate > dTo) return false;
            }

            return true;
          } catch {
            return true;
          }
        });
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
            No data found for this client.
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

        {/* GLOBAL SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search across all columns..."
            value={globalSearch}
            onChange={(e) => {
              setGlobalSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#348ADC] text-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
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
          TABLE
      ------------------------------ */}
      <div className="w-full h-full overflow-auto border border-gray-200 rounded-lg" style={{ height: 'calc(100vh - 350px)' }}>
        <table className="w-full border-collapse min-w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b border-gray-200">
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
                <td colSpan={columns.length} className="px-3 py-8 text-center text-sm text-gray-500">
                  No data matches the current filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
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

