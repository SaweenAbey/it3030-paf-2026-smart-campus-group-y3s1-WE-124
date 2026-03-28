import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'users', label: 'Manage Users', icon: '👥' },
    { key: 'permissions', label: 'Permissions', icon: '🔐' },
    { key: 'reports', label: 'System Reports', icon: '📈' },
    { key: 'security', label: 'Security Logs', icon: '🛡️' },
    { key: 'settings', label: 'System Settings', icon: '⚙️' },
    { key: 'activity', label: 'Activity', icon: '🕐' },
  ];

  const stats = [
    { label: 'Total Users', value: '1,234', icon: '👥' },
    { label: 'System Health', value: '99.8%', icon: '💚' },
    { label: 'Active Sessions', value: '456', icon: '🔌' },
    { label: 'Security Alerts', value: '3', icon: '⚠️' },
  ];

  const SectionCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'users') {
      return (
        <SectionCard title="Manage Users" subtitle="View and manage all users in the system.">
          <div className="space-y-3">
            {[
              { name: 'John Doe', role: 'Teacher', email: 'john@example.com', status: 'Active' },
              { name: 'Jane Smith', role: 'Student', email: 'jane@example.com', status: 'Active' },
              { name: 'Mike Johnson', role: 'Technician', email: 'mike@example.com', status: 'Inactive' },
              { name: 'Sarah Wilson', role: 'Student', email: 'sarah@example.com', status: 'Active' },
            ].map((usr) => (
              <div
                key={usr.email}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex justify-between items-center hover:bg-white hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-semibold text-slate-800">{usr.name}</p>
                  <p className="text-sm text-slate-500">{usr.email}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                    {usr.role}
                  </span>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      usr.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {usr.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'permissions') {
      return (
        <SectionCard title="Role Permissions" subtitle="Configure role-based access control.">
          <div className="space-y-4">
            {[
              { role: 'Admin', permissions: ['Full Access', 'User Management', 'System Config'] },
              { role: 'Teacher', permissions: ['Class Management', 'Grade Management', 'Student View'] },
              { role: 'Student', permissions: ['View Courses', 'Submit Assignments', 'View Grades'] },
              { role: 'Technician', permissions: ['Asset Management', 'Maintenance', 'Ticket System'] },
            ].map((perm) => (
              <div key={perm.role} className="rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
                <h3 className="font-semibold text-slate-800 mb-3">{perm.role}</h3>
                <div className="flex flex-wrap gap-2">
                  {perm.permissions.map((p) => (
                    <span key={p} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'reports') {
      return (
        <SectionCard title="System Reports" subtitle="View comprehensive system reports and analytics.">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: 'User Analytics', metrics: '1,234 total | 456 active | 12% growth' },
              { title: 'System Performance', metrics: '99.8% uptime | 45ms avg response' },
              { title: 'Security Incidents', metrics: '3 alerts | 0 critical | Last: 2h ago' },
              { title: 'Resource Usage', metrics: 'CPU: 45% | Memory: 62% | Disk: 78%' },
            ].map((report) => (
              <div
                key={report.title}
                className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 hover:shadow-md transition-all"
              >
                <h4 className="font-semibold text-slate-800">{report.title}</h4>
                <p className="text-sm text-slate-500 mt-2">{report.metrics}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'security') {
      return (
        <SectionCard title="Security Logs" subtitle="Monitor and review system security events.">
          <div className="space-y-3">
            {[
              {
                event: 'Failed Login Attempt',
                user: 'unknown',
                time: '2 hours ago',
                severity: 'high',
              },
              { event: 'User Role Changed', user: 'admin@school.edu', time: '5 hours ago', severity: 'medium' },
              { event: 'System Backup Complete', user: 'system', time: '1 day ago', severity: 'low' },
              { event: 'Unauthorized Access Attempt', user: 'unknown', time: '3 days ago', severity: 'high' },
            ].map((log, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 flex justify-between items-center ${
                  log.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : log.severity === 'medium'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-green-50 border-green-200'
                }`}
              >
                <div>
                  <p className="font-semibold text-slate-800">{log.event}</p>
                  <p className="text-sm text-slate-500">User: {log.user}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'settings') {
      return (
        <SectionCard title="System Settings" subtitle="Configure system-wide settings and preferences.">
          <div className="space-y-4">
            {[
              { setting: 'Email Notifications', status: 'Enabled', icon: '📧' },
              { setting: 'Two-Factor Authentication', status: 'Required', icon: '🔐' },
              { setting: 'Data Backup', status: 'Daily at 2 AM', icon: '💾' },
              { setting: 'Maintenance Mode', status: 'Disabled', icon: '🔧' },
              { setting: 'API Rate Limit', status: '1000 req/min', icon: '⚡' },
            ].map((item) => (
              <div key={item.setting} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{item.setting}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-blue-600">{item.status}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'activity') {
      return (
        <SectionCard title="Recent Activity" subtitle="System-wide activity log.">
          <div className="space-y-3">
            {[
              '✓ Admin login: admin@school.edu',
              '✓ User created: new.teacher@school.edu',
              '✓ System backup completed successfully',
              '⚠ Failed login attempt detected',
              '✓ Role permissions updated',
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-700 font-medium">{item}</p>
                <p className="text-xs text-slate-400 mt-1">Just now</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    return (
      <SectionCard title="Overview" subtitle="Administrative dashboard summary and quick stats.">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4  mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-100 p-6 bg-gradient-to-br from-rose-500/10 to-orange-400/10">
            <h3 className="font-semibold text-slate-800 mb-4">Platform Status</h3>
            <div className="space-y-3">
              {[
                { service: 'API Server', status: '✓ Online' },
                { service: 'Database', status: '✓ Healthy' },
                { service: 'Email Service', status: '✓ Working' },
              ].map((item) => (
                <div key={item.service} className="flex justify-between">
                  <span className="text-slate-600">{item.service}</span>
                  <span className="text-green-600 font-semibold">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 p-6 bg-gradient-to-br from-blue-500/10 to-cyan-400/10">
            <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition">
                Create New User
              </button>
              <button className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium transition">
                Generate Report
              </button>
              <button className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition">
                Backup System
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
        <div className="rounded-3xl bg-gradient-to-r from-rose-500 to-orange-400 p-6 md:p-8 text-white shadow-2xl mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs tracking-wider uppercase mb-4">
            🛡️ Platform Control
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-white/90 text-base md:text-lg">Welcome back, {user?.name || 'Administrator'}.</p>
          <p className="text-white/75 text-sm mt-2">Full platform access and control</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <Sidebar items={sidebarItems} />
          <main>{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
