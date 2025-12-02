import { useState, useEffect } from 'react';
import { Home, Database, FileText, Mail, Megaphone, Settings, Globe, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserData {
  id?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  full_name?: string;
  [key: string]: any;
}

export function WebPortal() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeMenu, setActiveMenu] = useState('Home');
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

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Top Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div
            className="text-2xl font-bold"
            style={{ fontFamily: 'Poppins, sans-serif', color: '#072741' }}
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
                onClick={() => setActiveMenu(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-[#348ADC] text-white shadow-md shadow-[#348ADC]/20'
                    : 'text-[#072741] hover:bg-gray-50'
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
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => setActiveMenu('Settings')}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${activeMenu === 'Settings'
                ? 'bg-[#348ADC] text-white shadow-md shadow-[#348ADC]/20'
                : 'text-[#072741] hover:bg-gray-50'
              }
            `}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[#072741] hover:bg-red-50 hover:text-red-600"
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {/* Left: Logo (hidden on web portal, but keeping structure) */}
          <div className="w-32"></div>

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
            {activeMenu === 'Home' && (
              <h1
                className="text-3xl font-bold text-[#072741] mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Hello {getFirstName()}!
              </h1>
            )}
            {activeMenu !== 'Home' && (
              <h1
                className="text-3xl font-bold text-[#072741] mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {activeMenu}
              </h1>
            )}
            <p
              className="text-[#072741] opacity-60 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {activeMenu === 'Home' && 'Welcome to your dashboard'}
              {activeMenu === 'Data' && 'Manage your data infrastructure'}
              {activeMenu === 'Templates' && 'Create and manage templates'}
              {activeMenu === 'AI Emails' && 'AI-powered email generation'}
              {activeMenu === 'Campaigns' && 'Manage your marketing campaigns'}
              {activeMenu === 'Domains' && 'Manage your domains'}
              {activeMenu === 'Settings' && 'Configure your account settings'}
            </p>

            {/* Content Area - Placeholder for now */}
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
          </div>
        </main>
      </div>
    </div>
  );
}
