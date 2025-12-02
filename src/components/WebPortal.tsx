import { useState, useEffect } from 'react';
import { Home, Database, FileText, Mail, Megaphone, Settings, Globe, LogOut, ArrowLeft, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UploadDataModal } from './UploadDataModal';
import { supabase } from '../lib/supabase';

interface UserData {
  id?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  full_name?: string;
  company_name?: string;
  client_id?: string;
  [key: string]: any;
}

export function WebPortal() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeMenu, setActiveMenu] = useState('Home');
  const [dataSubPage, setDataSubPage] = useState<string | null>(null); // 'main' | 'audiences' | null
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('arkenix_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // If parsing fails, try to fetch from Supabase using username
        fetchUserData();
      }
    } else {
      // If no stored user, redirect to home
      navigate('/');
    }
  }, [navigate]);

  const fetchUserData = () => {
    // Fallback: redirect to home if no user data
    navigate('/');
  };

  // Get full name - concatenate first_name + last_name
  const getDisplayName = () => {
    if (!userData) return 'User';
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    // Fallback to other fields if first_name/last_name not available
    return userData.full_name || userData.name || userData.username || 'User';
  };

  // Get first name for greeting
  const getFirstName = () => {
    if (!userData) return 'User';
    return userData.first_name || 'User';
  };

  // Get company name
  const getCompanyName = () => {
    if (!userData) return '';
    return userData.company_name || '';
  };

  // Get client ID
  const getClientId = () => {
    if (!userData) return '';
    return userData.client_id || userData.id || '';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData) return 'US';
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();
    }
    const name = getDisplayName();
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('arkenix_user');
    navigate('/');
  };

  const menuItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Data', icon: Database, label: 'Data' },
    { id: 'Templates', icon: FileText, label: 'Templates' },
    { id: 'AI Emails', icon: Mail, label: 'AI Emails' },
    { id: 'Campaigns', icon: Megaphone, label: 'Campaigns' },
    { id: 'Domains', icon: Globe, label: 'Domains' },
  ];

  // Handle menu click - reset sub-page when switching menus
  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    if (menuId !== 'Data') {
      setDataSubPage(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-[#072741] to-[#0a3d5c] border-r border-white/10 flex flex-col">
        {/* Top Logo Section */}
        <div className="p-6">
          <div
            className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Arkenix
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-[#348ADC] text-white shadow-md shadow-[#348ADC]/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Settings and Logout Buttons at Bottom */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => setActiveMenu('Settings')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${activeMenu === 'Settings'
                ? 'bg-[#348ADC] text-white shadow-md shadow-[#348ADC]/20'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
              }
            `}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-white/80 hover:bg-red-500/20 hover:text-red-300"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <LogOut size={20} />
            <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white px-6 py-4 flex items-center justify-between">
          {/* Left: Company Name */}
          {getCompanyName() && (
            <div 
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#348ADC] to-[#65C9D4] rounded-full shadow-lg shadow-[#348ADC]/20"
              data-client-id={getClientId()}
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span
                className="text-white font-semibold text-sm tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {getCompanyName()}
              </span>
            </div>
          )}

          {/* Right: User Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full">
              <span
                className="text-[#072741] font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {getDisplayName()}
              </span>
              <div className="w-10 h-10 rounded-full bg-[#348ADC] flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {activeMenu === 'Home' && (
                  <h1
                    className="text-3xl font-bold text-[#072741] mb-2"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Hello {getFirstName()}!
                  </h1>
                )}
                {activeMenu !== 'Home' && (
                  <div className="flex items-center gap-3">
                    {dataSubPage === 'audiences' && (
                      <button
                        onClick={() => setDataSubPage(null)}
                        className="text-[#072741] hover:text-[#348ADC] transition-colors"
                      >
                        <ArrowLeft size={24} />
                      </button>
                    )}
                    <h1
                      className="text-3xl font-bold text-[#072741]"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {dataSubPage === 'audiences' ? 'Manage Audiences' : activeMenu}
                    </h1>
                  </div>
                )}
                <p
                  className="text-[#072741] opacity-60"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {activeMenu === 'Home' && 'Welcome to your dashboard'}
                  {activeMenu === 'Data' && dataSubPage !== 'audiences' && 'Manage your data infrastructure'}
                  {activeMenu === 'Data' && dataSubPage === 'audiences' && 'Upload and create audiences for your campaigns'}
                  {activeMenu === 'Templates' && 'Create and manage templates'}
                  {activeMenu === 'AI Emails' && 'AI-powered email generation'}
                  {activeMenu === 'Campaigns' && 'Manage your marketing campaigns'}
                  {activeMenu === 'Domains' && 'Manage your domains'}
                  {activeMenu === 'Settings' && 'Configure your account settings'}
                </p>
              </div>

              {/* Action Buttons - Only show for Data module main page */}
              {activeMenu === 'Data' && dataSubPage === null && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-4 py-2 bg-[#348ADC] hover:bg-[#2a6fb0] text-white rounded-lg transition-all duration-200 font-medium"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Upload Data
                  </button>
                  <button
                    onClick={() => setDataSubPage('audiences')}
                    className="px-4 py-2 border border-[#348ADC] text-[#348ADC] hover:bg-[#348ADC] hover:text-white rounded-lg transition-all duration-200 font-medium"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Manage Audiences
                  </button>
                </div>
              )}
            </div>

            {/* Content Area */}
            {activeMenu === 'Data' && dataSubPage === 'audiences' ? (
              <ManageAudiencesView />
            ) : activeMenu === 'Data' && dataSubPage === null ? (
              <ClientsDataTable clientId={getClientId()} />
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
                <div className="flex items-center justify-center h-full">
                  <p
                    className="text-[#072741] opacity-40 text-center"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {activeMenu} content coming soon...
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Upload Data Modal */}
        <UploadDataModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </div>
    </div>
  );
}

// Manage Audiences Component
function ManageAudiencesView() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
      <div className="flex flex-col items-center justify-center h-full gap-6">
        <button
          className="w-full max-w-md px-6 py-4 bg-[#348ADC] hover:bg-[#2a6fb0] text-white rounded-xl transition-all duration-200 font-semibold text-lg"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Upload Audience
        </button>
        <button
          className="w-full max-w-md px-6 py-4 border-2 border-[#348ADC] text-[#348ADC] hover:bg-[#348ADC] hover:text-white rounded-xl transition-all duration-200 font-semibold text-lg"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Create Audience
        </button>
      </div>
    </div>
  );
}

// Clients Data Table Component
interface ClientsDataTableProps {
  clientId: string;
}

function ClientsDataTable({ clientId }: ClientsDataTableProps) {
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[400px] max-h-[calc(100vh-300px)] flex flex-col">
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="border-b-2 border-gray-300">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-sm font-semibold text-[#072741] bg-gray-50 whitespace-nowrap"
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
                    className="px-4 py-3 text-sm text-[#072741] whitespace-nowrap"
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
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-[#072741] opacity-60" style={{ fontFamily: 'Inter, sans-serif' }}>
          Showing {data.length} row{data.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
