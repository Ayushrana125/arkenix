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
const HeroStatCard = ({ title, value, subtitle, breakdown }: any) => (
  <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
    <h3 className="text-lg font-semibold text-gray-700 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      {title}
    </h3>
    <div className="text-4xl font-bold text-[#072741] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    {subtitle && (
      <p className="text-sm text-gray-500 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
        {subtitle}
      </p>
    )}
    {breakdown && (
      <div className="flex gap-6 mt-4 text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span className="font-medium">Prospect: {breakdown.prospect.toLocaleString()}</span>
        <span className="font-medium">Lead: {breakdown.lead.toLocaleString()}</span>
        <span className="font-medium">User: {breakdown.user.toLocaleString()}</span>
      </div>
    )}
  </div>
);

const SecondaryStatCard = ({ title, value, subtitle }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-sm font-medium text-gray-600 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
      {title}
    </h3>
    <div className="text-2xl font-bold text-[#072741] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    {subtitle && (
      <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
        {subtitle}
      </p>
    )}
  </div>
);

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
      {/* Section 1 - Hero Metrics (Large Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <HeroStatCard 
          title="Total Contacts" 
          value={mockData.summaryCards.totalContacts.value}
          breakdown={mockData.summaryCards.totalContacts.breakdown}
        />
        <HeroStatCard 
          title="Emails Sent" 
          value={mockData.summaryCards.emailsSent.value}
          subtitle={mockData.summaryCards.emailsSent.subtitle}
        />
        <HeroStatCard 
          title="WhatsApp Messages Sent" 
          value={mockData.summaryCards.whatsappSent.value}
          subtitle={mockData.summaryCards.whatsappSent.subtitle}
        />
        <HeroStatCard 
          title="AI Emails Generated" 
          value={mockData.summaryCards.aiEmails.value}
          subtitle={mockData.summaryCards.aiEmails.subtitle}
        />
        <HeroStatCard 
          title="Upcoming Meetings" 
          value={mockData.summaryCards.upcomingMeetings.value}
          subtitle={mockData.summaryCards.upcomingMeetings.subtitle}
        />
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