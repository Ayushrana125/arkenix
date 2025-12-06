import { useState, useEffect } from 'react';
import { Home, Database, FileText, Mail, Megaphone, Settings, Globe, LogOut, ArrowLeft, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UploadDataPage } from './UploadDataPage';
import { ClientsDataTable } from './Data';
import { Dashboard } from './Dashboard';

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
  const [isUploadPageOpen, setIsUploadPageOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
      {/* Left Sidebar - Fixed & Collapsible */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-gradient-to-br from-[#072741] to-[#0a3d5c] border-r border-white/10 flex flex-col z-30 overflow-y-auto transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Top Logo Section */}
        <div className={`p-4 flex items-center justify-between ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          {!isSidebarCollapsed && (
            <div
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Arkenix
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center gap-3 rounded-lg transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-[#348ADC] text-white shadow-md shadow-[#348ADC]/20'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                  ${isSidebarCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5'}
                `}
                style={{ fontFamily: 'Inter, sans-serif' }}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {isSidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Settings and Logout Buttons at Bottom */}
        <div className={`p-2 border-t border-white/10 space-y-1 ${isSidebarCollapsed ? 'px-2' : ''}`}>
          <button
            onClick={() => setActiveMenu('Settings')}
            className={`
              w-full flex items-center gap-3 rounded-lg transition-all duration-200 group relative
              ${activeMenu === 'Settings'
                ? 'bg-[#348ADC] text-white shadow-md shadow-[#348ADC]/20'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
              }
              ${isSidebarCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5'}
            `}
            style={{ fontFamily: 'Inter, sans-serif' }}
            title={isSidebarCollapsed ? 'Settings' : ''}
          >
            <Settings size={18} className="flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-sm font-medium">Settings</span>
            )}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 rounded-lg transition-all duration-200 text-white/70 hover:bg-red-500/20 hover:text-red-300 group relative ${
              isSidebarCollapsed ? 'justify-center px-3 py-2.5' : 'px-3 py-2.5'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
            title={isSidebarCollapsed ? 'Log Out' : ''}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!isSidebarCollapsed && (
              <span className="text-sm font-medium">Log Out</span>
            )}
            {isSidebarCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                Log Out
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-0 md:ml-64'}`}>
        {/* Top Bar - Fixed */}
        <header className={`fixed top-0 right-0 bg-white px-4 sm:px-5 py-2.5 flex items-center justify-between flex-shrink-0 z-20 border-b border-gray-200 h-14 transition-all duration-300 ${
          isSidebarCollapsed ? 'left-16' : 'left-0 md:left-64'
        }`}>
          {/* Left: Company Name */}
          <div className="flex items-center min-w-0 flex-1 mr-2">
            {getCompanyName() && (
              <div 
                className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#348ADC] to-[#65C9D4] rounded-full shadow-lg shadow-[#348ADC]/20"
                data-client-id={getClientId()}
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse flex-shrink-0"></div>
                <span
                  className="text-white font-medium text-xs tracking-wide truncate max-w-[120px] sm:max-w-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {getCompanyName()}
                </span>
              </div>
            )}
          </div>

          {/* Right: User Info */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 px-2 sm:px-3 py-1.5 rounded-full">
              <span
                className="text-[#072741] font-medium text-xs whitespace-nowrap hidden md:inline max-w-[100px] sm:max-w-[120px] truncate"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {getDisplayName()}
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#348ADC] flex items-center justify-center text-white font-medium text-xs flex-shrink-0">
                {getUserInitials()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-14 pb-4 px-4 sm:px-5 overflow-hidden">
        <div className="max-w-full mx-auto h-full flex flex-col min-h-0 overflow-hidden">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 flex-shrink-0 pt-4">
              <div className="flex-1 min-w-0">
                {activeMenu === 'Home' && (
                  <h1
                    className="text-xl font-semibold text-[#072741] mb-1"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Hello {getFirstName()}!
                  </h1>
                )}
                {activeMenu !== 'Home' && (
                  <div className="flex items-center gap-2">
                    {dataSubPage === 'audiences' && (
                      <button
                        onClick={() => setDataSubPage(null)}
                        className="text-[#072741] hover:text-[#348ADC] transition-colors flex-shrink-0"
                      >
                        <ArrowLeft size={18} />
                      </button>
                    )}
                    <h1
                      className="text-xl font-semibold text-[#072741]"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {dataSubPage === 'audiences' ? 'Manage Audiences' : activeMenu}
                    </h1>
                  </div>
                )}
                <p
                  className="text-xs text-[#072741] opacity-50"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {activeMenu === 'Home' && 'Welcome to your dashboard'}
                  {activeMenu === 'Data' && dataSubPage !== 'audiences' && 'Manage your user data and analytics'}
                  {activeMenu === 'Data' && dataSubPage === 'audiences' && 'Upload and create audiences for your campaigns'}
                  {activeMenu === 'Templates' && 'Create and manage templates'}
                  {activeMenu === 'AI Emails' && 'AI-powered email generation'}
                  {activeMenu === 'Campaigns' && 'Manage your marketing campaigns'}
                  {activeMenu === 'Domains' && 'Manage your domains'}
                  {activeMenu === 'Settings' && 'Configure your account settings'}
                </p>
              </div>

              {/* Action Buttons - Data module main page */}
              {activeMenu === 'Data' && dataSubPage === null && (
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      // Trigger Add User functionality in Data component
                      window.dispatchEvent(new CustomEvent('openAddUser'));
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-[#348ADC] to-[#65C9D4] hover:from-[#2a6fb0] hover:to-[#4fb3c7] text-white rounded-full transition-all duration-200 font-medium text-xs whitespace-nowrap shadow-md hover:shadow-lg flex items-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <line x1="19" y1="8" x2="19" y2="14"></line>
                      <line x1="22" y1="11" x2="16" y2="11"></line>
                    </svg>
                    Add User
                  </button>
                  <button
                    onClick={() => setIsUploadPageOpen(true)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-[#072741] to-[#0a3d5c] hover:from-[#0a3d5c] hover:to-[#0d4a6b] text-white rounded-full transition-all duration-200 font-medium text-xs whitespace-nowrap shadow-md hover:shadow-lg flex items-center gap-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Add Multiple Users
                  </button>
                  <button
                    onClick={() => setDataSubPage('audiences')}
                    className="flex-1 sm:flex-none px-3 py-2 border border-[#348ADC]/30 text-[#348ADC] hover:bg-[#348ADC]/10 hover:border-[#348ADC] rounded-full transition-all duration-200 font-medium text-xs whitespace-nowrap shadow-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Manage Audiences
                  </button>
                </div>
              )}

              {/* Action Buttons - Manage Audiences page */}
              {activeMenu === 'Data' && dataSubPage === 'audiences' && (
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      // TODO: Handle Upload Audience action
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-[#348ADC] to-[#65C9D4] hover:from-[#2a6fb0] hover:to-[#4fb3c7] text-white rounded-full transition-all duration-200 font-medium text-xs whitespace-nowrap shadow-md hover:shadow-lg"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Upload Audience
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Handle Create Audience action
                    }}
                    className="flex-1 sm:flex-none px-3 py-2 border border-[#348ADC]/30 text-[#348ADC] hover:bg-[#348ADC]/10 hover:border-[#348ADC] rounded-full transition-all duration-200 font-medium text-xs whitespace-nowrap shadow-sm"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Create Audience
                  </button>
                </div>
              )}
            </div>

            {/* Content Area - Scrollable table container */}
            <div className="flex-1 min-h-0 relative">
              <div className="absolute inset-0 overflow-auto">
                {activeMenu === 'Home' ? (
                  <Dashboard clientId={getClientId()} />
                ) : activeMenu === 'Data' && dataSubPage === 'audiences' ? (
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
            </div>
            
          </div>
        </main>

        {/* Upload Data Page */}
        {isUploadPageOpen && (
          <UploadDataPage
            onClose={() => setIsUploadPageOpen(false)}
            clientId={getClientId()}
          />
        )}
      </div>
    </div>
  );
}

// Manage Audiences Component
function ManageAudiencesView() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[400px]">
      <div className="flex items-center justify-center h-full">
        {/* Blank content area - will be populated later */}
      </div>
    </div>
  );
}

