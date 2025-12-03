import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ClientsDataTableProps {
  clientId: string;
}

export function ClientsDataTable({ clientId }: ClientsDataTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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
  const getAllColumns = () => {
    const columnSet = new Set<string>();
    data.forEach((row) => {
      Object.keys(row).forEach((key) => columnSet.add(key));
    });
    return Array.from(columnSet);
  };

  const columns = getAllColumns();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col">
      {/* Responsive scrollable table container */}
      <div 
        className="w-full h-full overflow-auto border border-gray-200 rounded-lg"
        style={{ height: 'calc(100vh - 260px)' }}
      >
        <table className="w-full border-collapse min-w-full">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b-2 border-gray-300">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-3 py-3 sm:px-4 text-left text-xs sm:text-sm font-semibold text-[#072741] bg-gray-50 whitespace-nowrap"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-3 py-3 sm:px-4 text-xs sm:text-sm text-[#072741] whitespace-nowrap"
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
      {data.length > 0 && (
        <div className="mt-4 text-xs sm:text-sm text-[#072741] opacity-60" style={{ fontFamily: 'Inter, sans-serif' }}>
          Showing {data.length} row{data.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

