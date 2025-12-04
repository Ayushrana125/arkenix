import { useState, useEffect } from 'react';
import { Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientsDataTableProps {
  clientId: string;
}

export function ClientsDataTable({ clientId }: ClientsDataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 100;

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
    const columnSet = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => columnSet.add(key));
    });
    // Filter out internal columns that shouldn't be displayed
    const allColumns = Array.from(columnSet);
    return allColumns.filter(col => col !== 'id' && col !== 'client_id');
  };

  const columns = getAllColumns();

  // Pagination calculations
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex flex-col h-full">
      {/* Responsive scrollable table container */}
      <div 
        className="w-full h-full overflow-auto border border-gray-200 rounded-lg"
        style={{ height: 'calc(100vh - 200px)' }}
      >
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
            {paginatedData.map((row, index) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {data.length > 0 && (
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Page Info */}
          <div className="text-xs text-[#072741] opacity-50" style={{ fontFamily: 'Inter, sans-serif' }}>
            Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} row{data.length !== 1 ? 's' : ''}
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

