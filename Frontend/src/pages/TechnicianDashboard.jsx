import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TicketCenter from '../tickets/pages/TicketCenter';
import ticketApi from '../tickets/api/ticketApi';
import { Ticket, Clock, Zap, Search, ChevronRight, Layers, LayoutGrid } from 'lucide-react';

const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: '🔧' },
    { key: 'accept-requests', label: 'Accept Requests', icon: '📬' },
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

  const loadPendingRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const response = await ticketApi.getAssignedToMe();
      const tickets = response.data || [];
      // Filter for OPEN tickets that are assigned to current user (pending acceptance)
      const pending = tickets.filter((ticket) => ticket.status === 'OPEN');
      setPendingRequests(pending);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load pending requests');
      setPendingRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  const extractAssignmentDetails = (comments) => {
    if (!comments || comments.length === 0) return '';
    const note = [...comments]
      .reverse()
      .find((comment) => (comment.content || '').startsWith('Admin assignment details:'));
    return note ? note.content.replace('Admin assignment details:', '').trim() : '';
  };

  const onAcceptRequest = async (ticketId) => {
    try {
      await ticketApi.updateStatus(ticketId, { status: 'IN_PROGRESS' });
      await loadPendingRequests();
      toast.success('Assignment request accepted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept request');
    }
  };

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
          <TicketCenter compact />
        </SectionCard>
      );
    }

    if (activeTab === 'accept-requests') {
      return (
        <SectionCard title="Accept Requests" subtitle="Review and accept assignment requests from admin.">
          {loadingRequests && <p className="text-sm text-slate-500">Loading pending requests...</p>}

          {!loadingRequests && pendingRequests.length === 0 && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-6 text-center">
              <p className="text-lg font-semibold text-emerald-800">✓ All Clear!</p>
              <p className="text-sm text-emerald-700 mt-2">You have no pending assignment requests.</p>
            </div>
          )}

          {!loadingRequests && pendingRequests.length > 0 && (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-5 hover:shadow-md transition"
                >
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Ticket ID</p>
                      <p className="text-lg font-bold text-slate-800">{request.ticketCode}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Admin Assigned By</p>
                      <p className="text-lg font-bold text-slate-800">
                        {request.reviewedByName || request.reviewedByUsername || 'System Administrator'}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg bg-white p-3 border border-blue-100">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Assignment Details</p>
                    <p className="text-sm text-slate-700">
                      {extractAssignmentDetails(request.comments) || 'No additional details provided'}
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Ticket:</span> {request.title}
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Priority:</span> {request.priority}
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Category:</span> {request.category}
                    </p>
                  </div>

                  <button
                    onClick={() => onAcceptRequest(request.id)}
                    className="mt-4 w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    ✓ Accept Request
                  </button>
                </div>
              ))}
            </div>
          )}
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
      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
         {/* Tech Stats Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Assigned Tickets', value: '12', trend: 'Active', icon: Ticket, color: 'sky' },
              { label: 'Avg Resolution', value: '4.2h', trend: '-15%', icon: Clock, color: 'emerald' },
              { label: 'Device Health', value: '94%', trend: 'Stable', icon: Zap, color: 'indigo' },
              { label: 'Critical Alerts', value: '2', trend: 'High', icon: Search, color: 'rose' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:rotate-6 transition-transform`}>
                       <stat.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend === 'Active' ? 'bg-sky-50 text-sky-600' : stat.trend === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                       {stat.trend}
                    </span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                 <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
              </div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="space-y-6">
               {/* Performance Chart */}
               <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Resolution Performance</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ticket closure rates over 24 hours</p>
                     </div>
                     <div className="flex gap-2">
                        {['6H', '12H', '24H'].map(t => (
                          <button key={t} className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${t === '24H' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                            {t}
                          </button>
                        ))}
                     </div>
                  </div>
                  
                  <div className="relative h-[260px] w-full bg-slate-50/20 rounded-3xl overflow-hidden">
                     <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                        <defs>
                           <linearGradient id="techChartGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                           </linearGradient>
                        </defs>
                        <path 
                          d="M0,200 C150,220 200,100 300,120 C400,140 500,50 600,80 C700,110 750,40 800,20 L800,300 L0,300 Z" 
                          fill="url(#techChartGrad)"
                        />
                        <path 
                          d="M0,200 C150,220 200,100 300,120 C400,140 500,50 600,80 C700,110 750,40 800,20" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        {[50, 100, 150, 200, 250].map(y => (
                          <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeDasharray="8 8" />
                        ))}
                     </svg>
                  </div>
               </div>

               {/* System Health / Alerts */}
               <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">High Priority Alerts</h3>
                  <div className="space-y-4">
                     {[
                       { type: 'CRITICAL', msg: 'Core Switch #2 Failure (Block C)', time: '5m ago', color: 'rose' },
                       { type: 'WARNING', msg: 'UPS Battery Low - Server Room B', time: '22m ago', color: 'amber' },
                       { type: 'INFO', msg: 'Scheduled Backup Completed (Node 4)', time: '2h ago', color: 'sky' },
                     ].map((alert, i) => (
                       <div key={i} className={`flex items-center justify-between p-5 rounded-2xl border-2 ${alert.type === 'CRITICAL' ? 'border-rose-100 bg-rose-50/30' : 'border-slate-50 bg-white'} transition-all hover:shadow-md group`}>
                          <div className="flex items-center gap-4">
                             <div className={`w-10 h-10 rounded-xl bg-${alert.color}-50 text-${alert.color}-600 flex items-center justify-center`}>
                                <Zap className="w-5 h-5" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900">{alert.msg}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{alert.type} • {alert.time}</p>
                             </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                       </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               {/* Maintenance Calendar */}
               <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                     <h4 className="text-lg font-black text-slate-900">Maintenance</h4>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
                     </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-slate-300 uppercase mb-4">
                     {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                     {Array.from({ length: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() }, (_, i) => {
                       const day = i + 1;
                       const isToday = day === new Date().getDate();
                       return (
                         <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer ${isToday ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                           {day}
                         </div>
                       );
                     })}
                  </div>
               </div>

               {/* Quick Tools */}
               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-200">
                  <Layers className="w-8 h-8 mb-4 text-emerald-400" />
                  <h4 className="text-xl font-black mb-2">Inventory Sync</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">Refresh the central equipment registry for the latest telemetry.</p>
                  <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-400 hover:text-white transition-all shadow-lg">
                     Run Telemetry Sync
                  </button>
               </div>

               {/* Asset Status */}
               <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                  <h4 className="text-lg font-black text-slate-900 mb-6">Active Zones</h4>
                  <div className="space-y-4">
                     {[
                       { label: 'Academic Block', val: 98, color: 'emerald' },
                       { label: 'Innovation Hub', val: 92, color: 'sky' },
                       { label: 'Admin North', val: 45, color: 'rose' },
                     ].map((zone, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between items-center">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{zone.label}</span>
                             <span className="text-xs font-black text-slate-900">{zone.val}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                             <div className={`bg-${zone.color}-500 h-full w-[${zone.val}%]`} />
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
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
