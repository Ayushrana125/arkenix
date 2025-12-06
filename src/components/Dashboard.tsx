import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

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
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-semibold text-[#072741]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Upcoming Meetings
      </h3>
      <button className="text-sm text-[#348ADC] hover:text-[#2a6fb0] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
        View All Meetings
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Name</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Email</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Date</th>
            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700" style={{ fontFamily: 'Inter, sans-serif' }}>Time</th>
          </tr>
        </thead>
        <tbody>
          {mockData.upcomingMeetings.map((meeting, index) => (
            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-2 text-sm font-medium text-[#072741]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {meeting.name}
              </td>
              <td className="py-4 px-2 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {meeting.email}
              </td>
              <td className="py-4 px-2 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {meeting.date}
              </td>
              <td className="py-4 px-2 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                {meeting.time}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ProgressBar = ({ label, percentage }: any) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
      <span className="text-gray-600">{label}</span>
      <span className="text-[#072741] font-medium">{percentage}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className="bg-gradient-to-r from-[#348ADC] to-[#65C9D4] h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

const ActivityItem = ({ text, time }: any) => (
  <div className="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0">
    <p className="text-sm text-[#072741] flex-1" style={{ fontFamily: 'Inter, sans-serif' }}>
      {text}
    </p>
    <span className="text-xs text-gray-500 ml-4 whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
      {time}
    </span>
  </div>
);

export function Dashboard() {
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
                  {mockData.summaryCards.totalContacts.value.toLocaleString()}
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
                  {mockData.summaryCards.totalContacts.breakdown.prospect.toLocaleString()}
                </div>
                <div className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Prospects</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {mockData.summaryCards.totalContacts.breakdown.lead.toLocaleString()}
                </div>
                <div className="text-sm opacity-80" style={{ fontFamily: 'Inter, sans-serif' }}>Leads</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {mockData.summaryCards.totalContacts.breakdown.user.toLocaleString()}
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
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                This Week
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Emails Sent</h3>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {mockData.summaryCards.emailsSent.value.toLocaleString()}
            </div>
          </div>

          {/* WhatsApp Messages */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                This Week
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>WhatsApp Messages</h3>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {mockData.summaryCards.whatsappSent.value.toLocaleString()}
            </div>
          </div>

          {/* AI Emails Generated */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
              </div>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                AI Usage
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>AI Emails Generated</h3>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {mockData.summaryCards.aiEmails.value.toLocaleString()}
            </div>
          </div>

          {/* Upcoming Meetings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                Dec 15, 2024
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Upcoming Meetings</h3>
            <div className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {mockData.summaryCards.upcomingMeetings.value}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2 - Meetings Table */}
      <MeetingsTable />

      {/* Section 3 - Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Data Completeness Score">
          <div className="mb-6">
            <div className="text-3xl font-bold text-[#072741] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {mockData.dataCompleteness.overall}%
            </div>
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
              Overall Score
            </p>
          </div>
          <div className="space-y-4">
            <ProgressBar label="Contacts with Email" percentage={mockData.dataCompleteness.email} />
            <ProgressBar label="Contacts with Phone" percentage={mockData.dataCompleteness.phone} />
            <ProgressBar label="Contacts with Company" percentage={mockData.dataCompleteness.company} />
          </div>
        </ChartCard>

        <ChartCard title="Contact Growth">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={mockData.contactGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="contacts" stroke="#348ADC" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Section 4 - Tertiary Insights (Smallest Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top 5 Cities" size="small">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={mockData.topCities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#348ADC" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Countries Split" size="small">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={mockData.countrySplit}
                cx="50%"
                cy="50%"
                outerRadius={60}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {mockData.countrySplit.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Section 5 - Recent Activity (Full Width) */}
      <ChartCard title="Recent Activity">
        <div className="max-h-80 overflow-y-auto">
          {mockData.recentActivity.map((activity) => (
            <ActivityItem key={activity.id} text={activity.text} time={activity.time} />
          ))}
        </div>
      </ChartCard>
    </div>
  );
}