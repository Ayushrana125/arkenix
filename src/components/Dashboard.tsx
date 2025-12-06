import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '../lib/supabase';

// Animated Counter Hook
const useAnimatedCounter = (target: number, shouldAnimate: boolean, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(target);
      return;
    }

    if (target === 0) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + (target - startValue) * easeOutQuart);
      
      setCount(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(target);
        setHasAnimated(true);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 100);

    return () => clearTimeout(timer);
  }, [target, shouldAnimate, duration]);

  return count;
};

// Animated Counter Component
const AnimatedCounter = ({ value, shouldAnimate, duration = 1500 }: { value: number; shouldAnimate: boolean; duration?: number }) => {
  const animatedValue = useAnimatedCounter(value, shouldAnimate, duration);
  return <>{animatedValue.toLocaleString()}</>;
};

// Mock Data
const mockData = {
  summaryCards: {
    totalContacts: { value: 8260, breakdown: { prospect: 3200, lead: 2800, user: 2260 } },
    emailsSent: { value: 1847, subtitle: "This Week" },
    whatsappSent: { value: 923, subtitle: "This Week" },
    aiEmails: { value: 156, subtitle: "AI Usage" },
    upcomingMeetings: { value: 7, subtitle: "Dec 15, 2024" }
  },
  upcomingMeetings: [
    { name: "John Smith", email: "john.smith@company.com", date: "Dec 16, 2024", time: "10:00 AM" },
    { name: "Sarah Johnson", email: "sarah.j@startup.io", date: "Dec 16, 2024", time: "2:30 PM" },
    { name: "Michael Chen", email: "m.chen@techcorp.com", date: "Dec 17, 2024", time: "11:15 AM" },
    { name: "Emily Davis", email: "emily.davis@enterprise.com", date: "Dec 17, 2024", time: "3:45 PM" },
    { name: "Robert Wilson", email: "r.wilson@business.net", date: "Dec 18, 2024", time: "9:30 AM" }
  ],
  topCities: [
    { name: 'New York', value: 3200 },
    { name: 'London', value: 1800 },
    { name: 'Singapore', value: 1450 },
    { name: 'Dubai', value: 900 },
    { name: 'Toronto', value: 700 }
  ],
  countrySplit: [
    { name: 'India', value: 65, color: '#348ADC' },
    { name: 'US', value: 20, color: '#65C9D4' },
    { name: 'UK', value: 10, color: '#072741' },
    { name: 'Others', value: 5, color: '#94a3b8' }
  ],
  contactGrowth: [
    { week: 'Week 1', contacts: 300 },
    { week: 'Week 2', contacts: 540 },
    { week: 'Week 3', contacts: 810 },
    { week: 'Week 4', contacts: 1000 },
    { week: 'Week 5', contacts: 1350 }
  ],
  dataCompleteness: {
    overall: 78,
    email: 90,
    phone: 82,
    company: 70
  },
  recentActivity: [
    { id: 1, text: "Imported 150 new contacts from CSV.", time: "2 hours ago" },
    { id: 2, text: "Sent email campaign to 120 leads.", time: "4 hours ago" },
    { id: 3, text: "Scheduled meeting with Kunal Sharma.", time: "6 hours ago" },
    { id: 4, text: "Generated 18 AI emails.", time: "8 hours ago" },
    { id: 5, text: "Updated contact: Neha Desai.", time: "1 day ago" }
  ]
};

// Reusable Components

const ChartCard = ({ title, children, size = 'normal' }: any) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${
    size === 'small' ? 'p-4' : 'p-6'
  }`}>
    <h3 className={`font-semibold text-[#072741] mb-4 ${
      size === 'small' ? 'text-base' : 'text-lg'
    }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
      {title}
    </h3>
    {children}
  </div>
);

const MeetingsTable = () => (
  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#072741] rounded-2xl flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[#072741]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Upcoming Meetings
        </h3>
      </div>
      <button className="px-4 py-2 text-sm text-[#348ADC] hover:text-white hover:bg-[#348ADC] border border-[#348ADC]/30 hover:border-[#348ADC] rounded-xl font-medium transition-all duration-200" style={{ fontFamily: 'Inter, sans-serif' }}>
        View All
      </button>
    </div>
    <div className="space-y-3">
      {mockData.upcomingMeetings.map((meeting, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/50 rounded-2xl transition-all duration-200 group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#348ADC] to-[#65C9D4] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
              {meeting.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold text-[#072741] group-hover:text-[#348ADC] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                {meeting.name}
              </div>
              <div className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                {meeting.email}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-[#072741]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {meeting.date}
            </div>
            <div className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              {meeting.time}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ProgressBar = ({ label, percentage }: any) => (
  <div className="mb-4">
    <div className="flex justify-between text-sm mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
      <span className="text-gray-700 font-medium">{label}</span>
      <span className="text-[#072741] font-bold">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-3">
      <div 
        className="bg-gradient-to-r from-[#348ADC] to-[#65C9D4] h-3 rounded-full transition-all duration-500 shadow-sm"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);



interface DashboardProps {
  clientId?: string;
}

export function Dashboard({ clientId }: DashboardProps = {}) {
  const [contactCounts, setContactCounts] = useState({
    total: 0,
    prospect: 0,
    lead: 0,
    user: 0
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldAnimateCounters, setShouldAnimateCounters] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(() => {
    return sessionStorage.getItem('dashboardAnimated') === 'true';
  });

  useEffect(() => {
    if (!clientId) return;

    const fetchContactCounts = async () => {
      try {
        // Fetch all data in batches to get accurate count
        let allData: any[] = [];
        let from = 0;
        const batchSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data: batchData, error } = await supabase
            .from('clients_user_data')
            .select('user_type')
            .eq('client_id', clientId)
            .range(from, from + batchSize - 1);

          if (error) throw error;

          if (batchData && batchData.length > 0) {
            allData = [...allData, ...batchData];
            from += batchSize;
            hasMore = batchData.length === batchSize;
          } else {
            hasMore = false;
          }
        }

        const counts = {
          total: allData.length,
          prospect: allData.filter(item => item.user_type?.toLowerCase() === 'prospect').length,
          lead: allData.filter(item => item.user_type?.toLowerCase() === 'lead').length,
          user: allData.filter(item => item.user_type?.toLowerCase() === 'user').length
        };

        setContactCounts(counts);
        setIsDataLoaded(true);
        setIsLoading(false);
        if (!hasInitialLoad) {
          setShouldAnimateCounters(true);
          setHasInitialLoad(true);
          sessionStorage.setItem('dashboardAnimated', 'true');
        }
      } catch (error) {
        console.error('Error fetching contact counts:', error);
        // Set fallback data on error
        setContactCounts({ total: 8260, prospect: 3200, lead: 2800, user: 2260 });
        setIsDataLoaded(true);
        setIsLoading(false);
        if (!hasInitialLoad) {
          setShouldAnimateCounters(true);
          setHasInitialLoad(true);
          sessionStorage.setItem('dashboardAnimated', 'true');
        }
      }
    };

    fetchContactCounts();

    // Listen for user upload events (triggers animation)
    const handleUserUpload = () => {
      setIsDataLoaded(false);
      setShouldAnimateCounters(false);
      setTimeout(() => {
        fetchContactCounts();
        setShouldAnimateCounters(true);
      }, 100);
    };

    // Listen for regular refresh events (no animation)
    const handleRefresh = () => {
      fetchContactCounts();
    };
    window.addEventListener('refreshDataTable', handleRefresh);
    window.addEventListener('userDataUploaded', handleUserUpload);

    return () => {
      window.removeEventListener('refreshDataTable', handleRefresh);
      window.removeEventListener('userDataUploaded', handleUserUpload);
    };
  }, [clientId]);

  // Initialize with fallback data if no clientId
  useEffect(() => {
    if (!clientId) {
      setContactCounts({ total: 8260, prospect: 3200, lead: 2800, user: 2260 });
      setIsDataLoaded(true);
      setIsLoading(false);
      setShouldAnimateCounters(true);
      setHasInitialLoad(true);
      sessionStorage.setItem('dashboardAnimated', 'true');
    }
  }, [clientId]);
  return (
    <div className="space-y-10 p-6 max-w-7xl mx-auto">
      {/* Section 1 - Hero Metrics (Modern SaaS Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Primary Hero Card - Total Contacts */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-br from-[#348ADC] to-[#65C9D4] rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium opacity-90 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Total Contacts
                </h3>
                <div className="text-5xl font-bold mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isLoading ? (
                    <div className="w-32 h-12 bg-white/20 rounded-lg animate-pulse"></div>
                  ) : (
                    <AnimatedCounter value={contactCounts.total} shouldAnimate={shouldAnimateCounters} duration={2000} />
                  )}
                </div>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isLoading ? (
                    <div className="w-16 h-6 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <AnimatedCounter value={contactCounts.prospect} shouldAnimate={shouldAnimateCounters} duration={1800} />
                  )}
                </div>
                <div className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Prospects</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isLoading ? (
                    <div className="w-16 h-6 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <AnimatedCounter value={contactCounts.lead} shouldAnimate={shouldAnimateCounters} duration={1600} />
                  )}
                </div>
                <div className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Leads</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {isLoading ? (
                    <div className="w-16 h-6 bg-white/20 rounded animate-pulse"></div>
                  ) : (
                    <AnimatedCounter value={contactCounts.user} shouldAnimate={shouldAnimateCounters} duration={1400} />
                  )}
                </div>
                <div className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Cards Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emails Sent */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                This Week
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Emails Sent</h3>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <AnimatedCounter value={mockData.summaryCards.emailsSent.value} shouldAnimate={shouldAnimateCounters} duration={1200} />
            </div>
          </div>

          {/* WhatsApp Messages */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                This Week
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>WhatsApp Messages</h3>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <AnimatedCounter value={mockData.summaryCards.whatsappSent.value} shouldAnimate={shouldAnimateCounters} duration={1000} />
            </div>
          </div>

          {/* AI Emails Generated */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                AI Usage
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>AI Emails Generated</h3>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <AnimatedCounter value={mockData.summaryCards.aiEmails.value} shouldAnimate={shouldAnimateCounters} duration={800} />
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Dec 15, 2024
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Upcoming Meetings</h3>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <AnimatedCounter value={mockData.summaryCards.upcomingMeetings.value} shouldAnimate={shouldAnimateCounters} duration={600} />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 - Meetings Table */}
      <MeetingsTable />

      {/* Section 3 - Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#072741] rounded-2xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#072741]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Data Completeness
            </h3>
          </div>
          <div className="mb-8">
            <div className="text-5xl font-bold text-[#072741] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <AnimatedCounter value={mockData.dataCompleteness.overall} shouldAnimate={shouldAnimateCounters} duration={1500} />%
            </div>
            <p className="text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Overall Score
            </p>
          </div>
          <div className="space-y-6">
            <ProgressBar label="Contacts with Email" percentage={mockData.dataCompleteness.email} />
            <ProgressBar label="Contacts with Phone" percentage={mockData.dataCompleteness.phone} />
            <ProgressBar label="Contacts with Company" percentage={mockData.dataCompleteness.company} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-[#072741] rounded-2xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#072741]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Contact Growth
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={mockData.contactGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="contacts" 
                stroke="url(#gradient)" 
                strokeWidth={3} 
                dot={{ fill: '#348ADC', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#348ADC' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#348ADC" />
                  <stop offset="100%" stopColor="#65C9D4" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 4 - Tertiary Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#072741] rounded-xl flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#072741]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Top Cities
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={mockData.topCities}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
              <Bar dataKey="value" fill="#348ADC" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-[#072741] rounded-xl flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#072741]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Countries
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={mockData.countrySplit}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {mockData.countrySplit.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Section 5 - Recent Activity */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#072741] rounded-2xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="9,11 12,14 22,4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[#072741]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Recent Activity
          </h3>
        </div>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {mockData.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50/50 hover:bg-gray-100/50 rounded-2xl transition-all duration-200 group">
              <div className="w-2 h-2 bg-[#348ADC] rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-[#072741] group-hover:text-[#348ADC] transition-colors" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {activity.text}
                </p>
                <span className="text-sm text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}