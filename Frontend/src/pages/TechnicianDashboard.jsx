import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: '🔧' },
    { key: 'tickets', label: 'Support Tickets', icon: '🎫' },
    { key: 'assets', label: 'Asset Management', icon: '📦' },
    { key: 'maintenance', label: 'Maintenance Schedule', icon: '📋' },
    { key: 'incidents', label: 'Incidents', icon: '⚠️' },
    { key: 'equipment', label: 'Equipment Status', icon: '⚙️' },
    { key: 'reports', label: 'Reports', icon: '📊' },
  ];

  const stats = [
    { label: 'Open Tickets', value: '8', icon: '🎫', color: 'from-emerald-500' },
    { label: 'Equipment Online', value: '24/26', icon: '⚙️', color: 'from-teal-500' },
    { label: 'Maintenance Tasks', value: '5', icon: '📋', color: 'from-cyan-500' },
    { label: 'System Health', value: '94%', icon: '💚', color: 'from-green-500' },
  ];

  const SectionCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'tickets') {
      return (
        <SectionCard title="Support Tickets" subtitle="Manage service requests and support tickets.">
          <div className="space-y-3">
            {[
              {
                id: 'TKT-001',
                title: 'Lab Printer Not Working',
                priority: 'High',
                status: 'Open',
                location: 'Lab A',
              },
              {
                id: 'TKT-002',
                title: 'Network Connection Issues',
                priority: 'Medium',
                status: 'In Progress',
                location: 'Building C',
              },
              {
                id: 'TKT-003',
                title: 'Software License Renewal',
                priority: 'Low',
                status: 'Pending',
                location: 'IT Office',
              },
              {
                id: 'TKT-004',
                title: 'Server Maintenance',
                priority: 'High',
                status: 'Scheduled',
                location: 'Data Center',
              },
            ].map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all bg-gradient-to-r from-slate-50 to-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-800">{ticket.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">Ticket: {ticket.id}</p>
                    <p className="text-sm text-slate-500 mt-1">📍 {ticket.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        ticket.priority === 'High'
                          ? 'bg-red-100 text-red-700'
                          : ticket.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {ticket.priority}
                    </span>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        ticket.status === 'Open'
                          ? 'bg-blue-100 text-blue-700'
                          : ticket.status === 'In Progress'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'assets') {
      return (
        <SectionCard title="Asset Management" subtitle="Track and manage campus equipment and assets.">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Desktop Computers', total: 45, functional: 42, location: 'Computer Labs' },
              { name: 'Printers', total: 12, functional: 11, location: 'Various Locations' },
              { name: 'Projectors', total: 8, functional: 7, location: 'Classrooms' },
              { name: 'Network Switches', total: 6, functional: 6, location: 'Building Hubs' },
            ].map((asset) => (
              <div
                key={asset.name}
                className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-md transition-all"
              >
                <h4 className="font-semibold text-slate-800">{asset.name}</h4>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-slate-600">📊 Total: {asset.total}</p>
                  <p className="text-sm text-slate-600">✓ Functional: {asset.functional}</p>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(asset.functional / asset.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">📍 {asset.location}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'maintenance') {
      return (
        <SectionCard title="Maintenance Schedule" subtitle="Plan and track maintenance activities.">
          <div className="space-y-3">
            {[
              {
                task: 'Server Backup & Cleanup',
                date: 'Apr 28, 2026',
                time: '2:00 AM - 4:00 AM',
                status: 'Scheduled',
              },
              {
                task: 'Network Switch Update',
                date: 'Apr 30, 2026',
                time: '10:00 PM - 11:00 PM',
                status: 'Scheduled',
              },
              {
                task: 'Printer Maintenance',
                date: 'Apr 25, 2026',
                time: '3:00 PM - 4:00 PM',
                status: 'In Progress',
              },
              {
                task: 'Generator Testing',
                date: 'Apr 22, 2026',
                time: '9:00 AM - 10:30 AM',
                status: 'Completed',
              },
            ].map((maint, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800">{maint.task}</h4>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      maint.status === 'Completed'
                        ? 'bg-green-100 text-green-700'
                        : maint.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {maint.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600">📅 {maint.date}</p>
                <p className="text-sm text-slate-600">🕐 {maint.time}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'incidents') {
      return (
        <SectionCard title="Incidents & Issues" subtitle="Track and resolve system incidents.">
          <div className="space-y-3">
            {[
              {
                incident: 'Internet Outage - Building A',
                severity: 'Critical',
                resolved: 'No',
                reported: '2 hours ago',
              },
              {
                incident: 'Lab Printer Malfunction',
                severity: 'High',
                resolved: 'No',
                reported: '4 hours ago',
              },
              {
                incident: 'Email Server Slow Response',
                severity: 'Medium',
                resolved: 'No',
                reported: '6 hours ago',
              },
              {
                incident: 'Computer Lab Display Issue',
                severity: 'Low',
                resolved: 'Yes',
                reported: '1 day ago',
              },
            ].map((incident, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 ${
                  incident.severity === 'Critical'
                    ? 'bg-red-50 border-red-200'
                    : incident.severity === 'High'
                      ? 'bg-orange-50 border-orange-200'
                      : incident.severity === 'Medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-800">{incident.incident}</h4>
                    <p className="text-sm text-slate-500 mt-1">Reported: {incident.reported}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      incident.resolved
                        ? 'bg-green-100 text-green-700'
                        : incident.severity === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {incident.resolved ? 'Resolved' : incident.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'equipment') {
      return (
        <SectionCard title="Equipment Status" subtitle="Real-time status of all campus equipment.">
          <div className="space-y-3">
            {[
              { name: 'Main Server', status: '✓ Online', uptime: '99.8%', temp: '32°C' },
              { name: 'Backup Server', status: '✓ Online', uptime: '99.5%', temp: '35°C' },
              { name: 'Network Router', status: '✓ Online', uptime: '99.9%', temp: '28°C' },
              { name: 'WiFi Access Point', status: '✓ Online', uptime: '98.7%', temp: '25°C' },
            ].map((equip, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4 grid grid-cols-4 gap-4 items-center hover:bg-slate-50 transition">
                <div>
                  <p className="font-semibold text-slate-800">{equip.name}</p>
                </div>
                <p className="text-sm text-green-600 font-medium">{equip.status}</p>
                <p className="text-sm text-slate-700">⏱️ {equip.uptime}</p>
                <p className="text-sm text-slate-700">🌡️ {equip.temp}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'reports') {
      return (
        <SectionCard title="Reports & Analytics" subtitle="Generate and view maintenance reports.">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                title: 'Monthly Maintenance Report',
                description: '14 tasks completed, 2 pending',
                icon: '📋',
              },
              { title: 'Asset Inventory Report', description: '94 total assets, 1 offline', icon: '📦' },
              { title: 'Uptime Summary', description: 'Average 99.2% system uptime', icon: '📊' },
              { title: 'Cost Analysis', description: 'Maintenance costs: $2,450 this month', icon: '💰' },
            ].map((report) => (
              <div
                key={report.title}
                className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-3">{report.icon}</div>
                <h4 className="font-semibold text-slate-800">{report.title}</h4>
                <p className="text-sm text-slate-600 mt-2">{report.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    return (
      <SectionCard title="Overview" subtitle="Operations center status and summary.">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color}/10 rounded-2xl border border-${stat.color}/20 p-6 hover:shadow-lg transition-all`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
            <h3 className="font-semibold text-slate-800 mb-4">🎫 Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Tickets This Month', value: '34' },
                { label: 'Avg Resolution Time', value: '4.2 hours' },
                { label: 'Hardware Failures', value: '2' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6 bg-gradient-to-br from-cyan-50 to-blue-50">
            <h3 className="font-semibold text-slate-800 mb-4">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 font-medium transition">
                Create Ticket
              </button>
              <button className="w-full px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 font-medium transition">
                Schedule Maintenance
              </button>
              <button className="w-full px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 font-medium transition">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-400 p-6 md:p-8 text-white shadow-2xl mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs tracking-wider uppercase mb-4">
            🔧 Operations Center
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Technician Dashboard</h1>
          <p className="text-white/90 text-base md:text-lg">Welcome back, {user?.name || 'Technician'}.</p>
          <p className="text-white/75 text-sm mt-2">Monitor and manage campus operations</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <Sidebar items={sidebarItems} />
          <main>{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
