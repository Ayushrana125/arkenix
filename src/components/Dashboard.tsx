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
const StatCard = ({ title, value, subtitle, breakdown }: any) => (
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
    {breakdown && (
      <div className="flex gap-4 mt-2 text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span>Prospect: {breakdown.prospect.toLocaleString()}</span>
        <span>Lead: {breakdown.lead.toLocaleString()}</span>
        <span>User: {breakdown.user.toLocaleString()}</span>
      </div>
    )}
  </div>
);

const ChartCard = ({ title, children }: any) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <h3 className="text-lg font-semibold text-[#072741] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {title}
    </h3>
    {children}
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
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Row 1 - Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Total Contacts" 
          value={mockData.summaryCards.totalContacts.value}
          breakdown={mockData.summaryCards.totalContacts.breakdown}
        />
        <StatCard 
          title="Emails Sent" 
          value={mockData.summaryCards.emailsSent.value}
          subtitle={mockData.summaryCards.emailsSent.subtitle}
        />
        <StatCard 
          title="WhatsApp Messages Sent" 
          value={mockData.summaryCards.whatsappSent.value}
          subtitle={mockData.summaryCards.whatsappSent.subtitle}
        />
        <StatCard 
          title="AI Emails Generated" 
          value={mockData.summaryCards.aiEmails.value}
          subtitle={mockData.summaryCards.aiEmails.subtitle}
        />
        <StatCard 
          title="Upcoming Meetings" 
          value={mockData.summaryCards.upcomingMeetings.value}
          subtitle={mockData.summaryCards.upcomingMeetings.subtitle}
        />
      </div>

      {/* Row 2 - Contact Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top 5 Cities">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.topCities}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#348ADC" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Countries Split">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockData.countrySplit}
                cx="50%"
                cy="50%"
                outerRadius={80}
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

      {/* Row 3 - Contact Growth Over Time */}
      <ChartCard title="New Contacts Added Over Time">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData.contactGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="contacts" stroke="#348ADC" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Row 4 - Data Completeness Score */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        <ChartCard title="Coming Soon">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
              Future analytics widget will be added here
            </p>
          </div>
        </ChartCard>
      </div>

      {/* Row 5 - Recent Activity Feed */}
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