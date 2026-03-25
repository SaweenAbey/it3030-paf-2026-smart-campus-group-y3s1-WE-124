import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleConfig = {
  ADMIN: {
    title: 'Admin Dashboard',
    accent: 'from-rose-500 to-orange-400',
    badge: 'Platform Control',
    actions: ['Manage all users', 'Monitor system health', 'Review security logs'],
  },
  TEACHER: {
    title: 'Teacher Dashboard',
    accent: 'from-indigo-500 to-cyan-400',
    badge: 'Academic Hub',
    actions: ['Publish lecture notes', 'Track student performance', 'Create assessments'],
  },
  TECHNICIAN: {
    title: 'Technician Dashboard',
    accent: 'from-emerald-500 to-teal-400',
    badge: 'Operations Center',
    actions: ['Handle service tickets', 'Track campus assets', 'Schedule maintenance'],
  },
  STUDENT: {
    title: 'User Dashboard',
    accent: 'from-sky-700 to-blue-500',
    badge: 'Learning Space',
    actions: ['View courses', 'Check assignments', 'Connect with teachers'],
  },
  USER: {
    title: 'User Dashboard',
    accent: 'from-sky-700 to-blue-500',
    badge: 'Learning Space',
    actions: ['View courses', 'Check assignments', 'Connect with teachers'],
  },
};

const quickStats = [
  { label: 'Today Tasks', value: '08' },
  { label: 'Unread Alerts', value: '03' },
  { label: 'Completion', value: '92%' },
];

const sidebarItems = [
  { key: 'overview', label: 'Overview' },
  { key: 'profile', label: 'Profile' },
  { key: 'actions', label: 'Role Actions' },
  { key: 'activity', label: 'Activity' },
];

const SectionCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
    <div className="mt-6">{children}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const roleKey = useMemo(() => (user?.role || 'STUDENT').toUpperCase(), [user?.role]);
  const config = roleConfig[roleKey] || roleConfig.STUDENT;
  const activeTab = sidebarItems.some((item) => item.key === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'overview';

  const openTab = (tab) => {
    setSearchParams({ tab });
  };

  const renderMainContent = () => {
    if (activeTab === 'profile') {
      return (
        <SectionCard title="Profile" subtitle="Your account details and role information.">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-400">Name</p>
              <p className="font-semibold text-slate-800 mt-1">{user?.name || 'N/A'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-400">Role</p>
              <p className="font-semibold text-slate-800 mt-1">{user?.role || 'STUDENT'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-400">Username</p>
              <p className="font-semibold text-slate-800 mt-1">{user?.username || 'N/A'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-semibold text-slate-800 mt-1">{user?.email || 'N/A'}</p>
            </div>
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'actions') {
      return (
        <SectionCard title="Role Actions" subtitle="Tools available for your role.">
          <div className="grid md:grid-cols-3 gap-4">
            {config.actions.map((action) => (
              <button
                key={action}
                type="button"
                className="text-left rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-md transition-all bg-slate-50 hover:bg-white"
              >
                <p className="font-semibold text-slate-700">{action}</p>
                <p className="text-sm text-slate-400 mt-1">Open workspace</p>
              </button>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'activity') {
      return (
        <SectionCard title="Recent Activity" subtitle="Your latest platform actions.">
          <div className="space-y-3">
            {[
              'Profile viewed',
              'Dashboard opened',
              'Role permissions synced',
              'Security checks completed',
            ].map((item) => (
              <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-slate-700 font-medium">{item}</p>
                <p className="text-xs text-slate-400 mt-1">Just now</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    return (
      <SectionCard title="Overview" subtitle="Quick insights from your dashboard.">
        <div className="grid md:grid-cols-3 gap-4">
          {quickStats.map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <div className={`rounded-3xl bg-gradient-to-r ${config.accent} p-6 md:p-8 text-white shadow-2xl mb-6`}>
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs tracking-wider uppercase mb-4">
            {config.badge}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{config.title}</h1>
          <p className="text-white/90 text-base md:text-lg">Welcome back, {user?.name || 'User'}.</p>
          <p className="text-white/75 text-sm mt-2">Signed in as {user?.role || 'STUDENT'}</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm h-fit">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold px-3 py-2">Workspace</p>
            <nav className="space-y-1 mt-2">
              {sidebarItems.map((item) => {
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => openTab(item.key)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
                      active
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main>{renderMainContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
