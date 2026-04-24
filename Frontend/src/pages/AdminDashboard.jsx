import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, notificationAPI, userAPI } from '../services/api';
import AdminSkyStatusButton from '../components/AdminSkyStatusButton';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import TicketCenter from '../tickets/pages/TicketCenter';
import { Users, Zap, Clock, Search, ChevronRight, LayoutGrid } from 'lucide-react';

const ROLE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All roles' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'TEACHER', label: 'Tutor' },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
];

const displayRole = (role) => {
  if (role === 'TEACHER') return 'Tutor';
  return role || '—';
};

const AudienceNotificationRequest = {
  ALL_USERS: 'ALL_USERS',
  SPECIFIC_ROLE: 'SPECIFIC_ROLE',
  SPECIFIC_USERS: 'SPECIFIC_USERS',
};

/** One row per send: merge rows that share content, creator, and send time (~5s window for DB batch saves). */
const groupAdminNotifications = (rows) => {
  const map = new Map();
  const bucketMs = 5000;
  for (const n of rows) {
    const createdBucket =
      n.createdAt != null ? Math.floor(new Date(n.createdAt).getTime() / bucketMs) : 0;
    const key = [
      n.title || '',
      n.message || '',
      n.type || '',
      n.actionUrl || '',
      n.createdByUsername || '',
      String(createdBucket),
    ].join('\u0001');

    if (!map.has(key)) {
      map.set(key, {
        title: n.title,
        message: n.message,
        type: n.type,
        actionUrl: n.actionUrl,
        createdByUsername: n.createdByUsername,
        createdAt: n.createdAt,
        recipients: [],
      });
    }
    const g = map.get(key);
    g.recipients.push({
      username: n.recipientUsername,
      role: n.recipientRole,
    });
  }
  return [...map.values()].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [userSection, setUserSection] = useState('all');
  const [users, setUsers] = useState([]);
  const [pendingTutors, setPendingTutors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusToggleId, setStatusToggleId] = useState(null);

  const [createFormData, setCreateFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    phoneNumber: '',
    department: '',
    specialization: '',
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'STUDENT',
    phoneNumber: '',
    address: '',
    age: '',
    campusId: '',
    department: '',
    specialization: '',
    password: '',
    confirmPassword: '',
  });

  const [adminNotifications, setAdminNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSubmitting, setNotifSubmitting] = useState(false);
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    type: 'INFO',
    actionUrl: '',
    audienceType: AudienceNotificationRequest.ALL_USERS,
    roles: [],
    userIds: [],
  });
  const [notifFilter, setNotifFilter] = useState({
    search: '',
    type: 'ALL',
    recipientRole: 'ALL',
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadAdminNotificationsLight = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await notificationAPI.getAllForAdmin();
      setAdminNotifications(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load notifications');
    } finally {
      setNotifLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      toast.error('Access denied: Admin only');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadUsers();
    loadPendingTutors();
  }, []);

  useEffect(() => {
    if (activeTab === 'notifications') {
      loadAdminNotificationsLight();
    }
  }, [activeTab, loadAdminNotificationsLight]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingTutors = async () => {
    try {
      const response = await userAPI.getPendingTutors();
      setPendingTutors(response.data || []);
    } catch (error) {
      console.error('Failed to load pending tutors:', error);
    }
  };

  const filteredUsers = useMemo(() => {
    if (roleFilter === 'ALL') return users;
    return users.filter((u) => u.role === roleFilter);
  }, [users, roleFilter]);

  const handleCreateUserChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (createFormData.password !== createFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!createFormData.name || !createFormData.username || !createFormData.email || !createFormData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: createFormData.name,
        username: createFormData.username,
        email: createFormData.email,
        password: createFormData.password,
        confirmPassword: createFormData.confirmPassword,
        role: createFormData.role,
        phoneNumber: createFormData.phoneNumber,
        department: createFormData.department,
        specialization: createFormData.specialization,
      };

      if (createFormData.role === 'MANAGER') {
        await adminAPI.createManager(payload);
      } else {
        await userAPI.createAdminUser(payload);
      }

      toast.success(`${displayRole(createFormData.role)} account created successfully!`);
      resetCreateForm();
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserActive = async (targetUser) => {
    if (!targetUser?.id) return;
    if (user?.id && targetUser.id === user.id) {
      toast.error('You cannot disable your own account from here');
      return;
    }

    const next = !targetUser.isActive;
    setStatusToggleId(targetUser.id);
    try {
      await userAPI.updateActiveStatus(targetUser.id, next);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: next } : u))
      );
      toast.success(next ? 'Account enabled' : 'Account disabled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusToggleId(null);
    }
  };

  const openEditUserModal = (targetUser) => {
    if (!targetUser?.id) return;
    setEditingUserId(targetUser.id);
    setEditFormData({
      name: targetUser.name || '',
      username: targetUser.username || '',
      email: targetUser.email || '',
      role: targetUser.role || 'STUDENT',
      phoneNumber: targetUser.phoneNumber || '',
      address: targetUser.address || '',
      age: targetUser.age ?? '',
      campusId: targetUser.campusId || '',
      department: targetUser.department || '',
      specialization: targetUser.specialization || '',
      password: '',
      confirmPassword: '',
    });
    setIsEditModalOpen(true);
  };

  const closeEditUserModal = () => {
    setIsEditModalOpen(false);
    setEditingUserId(null);
    setEditFormData({
      name: '',
      username: '',
      email: '',
      role: 'STUDENT',
      phoneNumber: '',
      address: '',
      age: '',
      campusId: '',
      department: '',
      specialization: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUserProfile = async (e) => {
    e.preventDefault();
    if (!editingUserId) return;

    if (!editFormData.name || !editFormData.username || !editFormData.email) {
      toast.error('Name, username and email are required');
      return;
    }

    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const payload = {
      name: editFormData.name.trim(),
      username: editFormData.username.trim(),
      email: editFormData.email.trim(),
      role: editFormData.role,
      phoneNumber: editFormData.phoneNumber.trim() || null,
      address: editFormData.address.trim() || null,
      age: editFormData.age === '' ? null : Number(editFormData.age),
      campusId: editFormData.campusId.trim() || null,
      department: editFormData.department.trim() || null,
      specialization: editFormData.specialization.trim() || null,
      password: editFormData.password ? editFormData.password : null,
      confirmPassword: editFormData.password ? editFormData.confirmPassword : null,
    };

    setEditSubmitting(true);
    try {
      const response = await userAPI.updateProfile(editingUserId, payload);
      const updated = response.data;
      setUsers((prev) => prev.map((u) => (u.id === editingUserId ? { ...u, ...updated } : u)));
      toast.success('User profile updated successfully');
      closeEditUserModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user profile');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleApproveTutor = async (tutorId) => {
    try {
      await userAPI.approveTutor(tutorId);
      toast.success('Tutor account approved!');
      loadPendingTutors();
      loadUsers();
    } catch (error) {
      toast.error('Failed to approve tutor');
    }
  };

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="font-medium text-gray-800">Are you sure you want to logout?</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              logout();
              toast.success('Logged out successfully');
              navigate('/login');
            }}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const resetCreateForm = () => {
    setCreateFormData({
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'STUDENT',
      phoneNumber: '',
      department: '',
      specialization: '',
    });
  };

  const toggleNotifRole = (role) => {
    setNotifForm((prev) => {
      const has = prev.roles.includes(role);
      return {
        ...prev,
        roles: has ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
      };
    });
  };

  const toggleNotifUserId = (id) => {
    setNotifForm((prev) => {
      const has = prev.userIds.includes(id);
      return {
        ...prev,
        userIds: has ? prev.userIds.filter((x) => x !== id) : [...prev.userIds, id],
      };
    });
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      toast.error('Title and message are required');
      return;
    }

    const payloadBase = {
      title: notifForm.title.trim(),
      message: notifForm.message.trim(),
      type: notifForm.type,
      actionUrl: notifForm.actionUrl.trim() || undefined,
    };

    if (notifForm.audienceType === AudienceNotificationRequest.SPECIFIC_ROLE && notifForm.roles.length === 0) {
      toast.error('Select at least one role');
      return;
    }
    if (notifForm.audienceType === AudienceNotificationRequest.SPECIFIC_USERS && notifForm.userIds.length === 0) {
      toast.error('Select at least one recipient');
      return;
    }

    setNotifSubmitting(true);
    try {
      let body;
      if (notifForm.audienceType === AudienceNotificationRequest.ALL_USERS) {
        body = { ...payloadBase, audienceType: AudienceNotificationRequest.ALL_USERS };
      } else if (notifForm.audienceType === AudienceNotificationRequest.SPECIFIC_ROLE) {
        body = {
          ...payloadBase,
          audienceType: AudienceNotificationRequest.SPECIFIC_ROLE,
          roles: notifForm.roles,
        };
      } else {
        body = {
          ...payloadBase,
          audienceType: AudienceNotificationRequest.SPECIFIC_USERS,
          userIds: notifForm.userIds,
        };
      }

      const res = await notificationAPI.createByAudience(body);
      const count = res.data?.count ?? 0;
      toast.success(`Notification sent to ${count} recipient(s)`);

      // Immediately refresh navbar bell (same tab + other tabs).
      try {
        window.dispatchEvent(new Event('uni360:notifications:refresh'));
      } catch (_) {
        // ignore
      }
      try {
        const bc = new BroadcastChannel('uni360-notifications');
        bc.postMessage({ type: 'refresh' });
        bc.close();
      } catch (_) {
        // ignore (unsupported)
      }

      setNotifForm((prev) => ({
        ...prev,
        title: '',
        message: '',
        actionUrl: '',
        roles: [],
        userIds: [],
      }));
      await loadAdminNotificationsLight();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send notification');
    } finally {
      setNotifSubmitting(false);
    }
  };

  const activeUsers = users.filter((u) => u.isActive).length;
  const adminUsers = users.filter((u) => u.role === 'ADMIN').length;

  const stats = [
    { label: 'Total Users', value: users.length },
    { label: 'Active Accounts', value: activeUsers },
    { label: 'Pending Tutors', value: pendingTutors.length },
    { label: 'Admin Accounts', value: adminUsers },
  ];

  const sidebarItems = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'incidents', label: 'Incident Tickets' },
    { key: 'inquiries', label: 'Inquiries' },
    { key: 'bookings', label: 'Booking Details' },
    { key: 'reviews', label: 'Reviews' },
  ];

  const groupedNotifications = useMemo(
    () => groupAdminNotifications(adminNotifications),
    [adminNotifications]
  );

  const filteredNotificationGroups = useMemo(() => {
    const q = notifFilter.search.trim().toLowerCase();
    return groupedNotifications.filter((g) => {
      if (notifFilter.type !== 'ALL' && g.type !== notifFilter.type) return false;
      if (notifFilter.recipientRole !== 'ALL') {
        const anyRole = g.recipients.some((r) => r.role === notifFilter.recipientRole);
        if (!anyRole) return false;
      }
      if (q) {
        const t = (g.title || '').toLowerCase();
        const m = (g.message || '').toLowerCase();
        const byRecipient = g.recipients.some((r) => (r.username || '').toLowerCase().includes(q));
        if (!t.includes(q) && !m.includes(q) && !byRecipient) return false;
      }
      return true;
    });
  }, [groupedNotifications, notifFilter]);

  const typeBadgeClass = (t) => {
    switch (t) {
      case 'SUCCESS':
        return 'bg-sky-100 text-sky-800';
      case 'WARNING':
        return 'bg-sky-200/80 text-sky-900';
      case 'ERROR':
        return 'bg-slate-200 text-slate-800';
      default:
        return 'bg-sky-50 text-sky-800 ring-1 ring-sky-200/80';
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.04),transparent_40%),linear-gradient(180deg,#f8fafc_0%,#ffffff_44%,#f8fafc_100%)]">
      <main className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Sidebar items={sidebarItems} activeTab={activeTab} onTabChange={setActiveTab} title="Admin Console">
            <div className="rounded-xl border border-sky-100 bg-linear-to-b from-white to-sky-50/50 p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Signed in as</p>
              <p className="mt-1 text-sm font-bold text-slate-800 truncate">{user?.name || user?.username}</p>
              <button
                onClick={handleLogout}
                className="mt-4 w-full rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-bold text-red-600 shadow-sm transition hover:bg-red-50 hover:border-red-200 hover:text-red-700"
              >
                Sign Out
              </button>
            </div>
          </Sidebar>

          <section className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 {/* Admin Stats Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Platform Users', value: users.length, trend: '+14%', icon: Users, color: 'sky' },
                      { label: 'Active Sessions', value: activeUsers, trend: '+5%', icon: Zap, color: 'emerald' },
                      { label: 'Pending Approvals', value: pendingTutors.length, trend: '-2%', icon: Clock, color: 'rose' },
                      { label: 'System Health', value: '99.9%', trend: 'Stable', icon: Search, color: 'indigo' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-md transition-all group">
                         <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:rotate-6 transition-transform`}>
                               <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : stat.trend === 'Stable' ? 'bg-sky-50 text-sky-600' : 'bg-rose-50 text-rose-600'}`}>
                               {stat.trend}
                            </span>
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{stat.label}</p>
                         <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                      </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
                    <div className="space-y-6">
                       {/* Growth Chart */}
                       <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                          <div className="flex justify-between items-center mb-8">
                             <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">User Acquisition Trend</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Platform growth over the last 8 months</p>
                             </div>
                             <div className="flex gap-2">
                                {['DAILY', 'WEEKLY', 'MONTHLY'].map(t => (
                                  <button key={t} className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest transition-all ${t === 'MONTHLY' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                                    {t}
                                  </button>
                                ))}
                             </div>
                          </div>
                          
                          <div className="relative h-[300px] w-full bg-slate-50/20 rounded-3xl overflow-hidden">
                             <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="none">
                                <defs>
                                   <linearGradient id="adminChartGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                                   </linearGradient>
                                </defs>
                                <path 
                                  d="M0,280 C150,250 200,180 300,150 C400,120 500,200 600,100 C700,40 750,80 800,20 L800,300 L0,300 Z" 
                                  fill="url(#adminChartGrad)"
                                />
                                <path 
                                  d="M0,280 C150,250 200,180 300,150 C400,120 500,200 600,100 C700,40 750,80 800,20" 
                                  fill="none" 
                                  stroke="#6366f1" 
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                />
                                {[50, 100, 150, 200, 250].map(y => (
                                  <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeDasharray="8 8" />
                                ))}
                             </svg>
                          </div>
                       </div>

                       {/* Recent Approvals / Tasks */}
                       <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-6">Critical System Feed</h3>
                          <div className="space-y-4">
                             {[
                               { type: 'USER', msg: 'New Tutor Application: Dr. Aris Thorne', time: '2m ago', color: 'sky' },
                               { type: 'ALERT', msg: 'High Server Latency in US-East Node', time: '15m ago', color: 'rose' },
                               { type: 'SYSTEM', msg: 'Daily Automated Database Backup Success', time: '1h ago', color: 'emerald' },
                               { type: 'SEC', msg: 'Failed Admin Login Attempt (IP: 192.168.1.1)', time: '3h ago', color: 'indigo' },
                             ].map((feed, i) => (
                               <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-2 h-2 rounded-full bg-${feed.color}-500 shadow-[0_0_10px_rgba(0,0,0,0.1)] shadow-${feed.color}-200`} />
                                     <div>
                                        <p className="text-sm font-black text-slate-900">{feed.msg}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{feed.type} • {feed.time}</p>
                                     </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       {/* Admin Calendar */}
                       <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                             <h4 className="text-lg font-black text-slate-900">Governance</h4>
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
                                 <div key={i} className={`aspect-square rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer ${isToday ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`}>
                                   {day}
                                 </div>
                               );
                             })}
                          </div>
                       </div>

                       {/* Action Cards */}
                       <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
                          <Zap className="w-8 h-8 mb-4 text-indigo-200" />
                          <h4 className="text-xl font-black mb-2">System Audit</h4>
                          <p className="text-sm text-indigo-100 font-medium leading-relaxed mb-6">A full security and performance audit is recommended for this cycle.</p>
                          <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all">
                             Start Audit Now
                          </button>
                       </div>

                       {/* System Status Mini */}
                       <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-8 shadow-sm">
                          <h4 className="text-lg font-black text-slate-900 mb-6">Node Status</h4>
                          <div className="space-y-4">
                             {['Database Cluster', 'Media Storage', 'Auth Service'].map((node, i) => (
                               <div key={i} className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-slate-600">{node}</span>
                                  <div className="flex gap-1">
                                     {[1, 2, 3, 4, 5].map(dot => <div key={dot} className="w-1.5 h-4 rounded-full bg-emerald-500/20 last:bg-emerald-500" />)}
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            <section className="rounded-4xl border border-slate-200/70 bg-white p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)] sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700">Administration Console</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Campus Operations Command Center
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage user lifecycle, operational notifications, service requests, bookings, and reviews from a single governed workspace.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className={`mt-2 inline-flex rounded-xl bg-white px-3 py-2 text-2xl font-semibold text-slate-900 ring-1 ring-slate-200`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {activeTab === 'users' && (
              <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_50px_-34px_rgba(15,23,42,0.25)]">
                <div className="border-b border-slate-200 p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700">User Management</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Users</h2>
                  <p className="mt-1 text-sm text-slate-500">Manage accounts, tutor approvals, and account creation.</p>
                </div>

                <div className="p-6">
                  <div className="mb-6 flex flex-wrap gap-3 border-b border-slate-200 pb-3">
                    <button
                      onClick={() => setUserSection('all')}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        userSection === 'all'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All Users
                    </button>
                    <button
                      onClick={() => setUserSection('pending')}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        userSection === 'pending'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Pending Tutors
                    </button>
                    <button
                      onClick={() => setUserSection('create')}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        userSection === 'create'
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Create User
                    </button>
                  </div>

                  {userSection === 'all' && (
                    <>
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex flex-col gap-1 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-3">
                          <span className="font-medium text-slate-700">Filter by role</span>
                          <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                          >
                            {ROLE_FILTER_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <p className="text-sm text-slate-500">
                          Showing <span className="font-semibold text-slate-800">{filteredUsers.length}</span> of{' '}
                          {users.length} users
                        </p>
                      </div>

                      {loading ? (
                        <p className="text-slate-600">Loading users...</p>
                      ) : filteredUsers.length === 0 ? (
                        <p className="text-slate-600">No users match this filter</p>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700">Name</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700">Username</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                                  <td className="px-4 py-3 text-slate-600">{u.username}</td>
                                  <td className="px-4 py-3 text-slate-600">{u.email || '—'}</td>
                                  <td className="px-4 py-3">
                                    <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                                      {displayRole(u.role)}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                        u.isActive ? 'bg-sky-100 text-sky-800' : 'bg-slate-200 text-slate-600'
                                      }`}
                                    >
                                      {u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => openEditUserModal(u)}
                                        className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                                      >
                                        Edit
                                      </button>
                                      <AdminSkyStatusButton
                                        active={Boolean(u.isActive)}
                                        disabled={user?.id === u.id}
                                        busy={statusToggleId === u.id}
                                        onToggle={() => handleToggleUserActive(u)}
                                      />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}

                  {userSection === 'pending' && (
                    <div className="space-y-4">
                      {pendingTutors.length === 0 ? (
                        <p className="text-slate-600">No pending tutor requests</p>
                      ) : (
                        pendingTutors.map((tutor) => (
                          <div
                            key={tutor.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 transition hover:bg-slate-50"
                          >
                            <div>
                              <p className="font-semibold text-slate-900">{tutor.name}</p>
                              <p className="text-sm text-slate-600">{tutor.email}</p>
                              <p className="mt-1 text-xs text-slate-500">Username: {tutor.username}</p>
                            </div>
                            <button
                              onClick={() => handleApproveTutor(tutor.id)}
                              className="rounded-xl bg-linear-to-r from-sky-600 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-sky-700 hover:to-sky-600"
                            >
                              Approve Tutor
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {userSection === 'create' && (
                    <form onSubmit={handleCreateUser} className="space-y-5">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Full Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={createFormData.name}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Username *</label>
                          <input
                            type="text"
                            name="username"
                            value={createFormData.username}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="john_doe"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={createFormData.email}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="john@example.com"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Role *</label>
                          <select
                            name="role"
                            value={createFormData.role}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Tutor</option>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="MANAGER">Manager</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Password *</label>
                          <input
                            type="password"
                            name="password"
                            value={createFormData.password}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password *</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={createFormData.confirmPassword}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="••••••••"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={createFormData.phoneNumber}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="+1234567890"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
                          <input
                            type="text"
                            name="department"
                            value={createFormData.department}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="IT Department"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-slate-700">Specialization</label>
                          <input
                            type="text"
                            name="specialization"
                            value={createFormData.specialization}
                            onChange={handleCreateUserChange}
                            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={resetCreateForm}
                          className="rounded-xl border border-slate-300 px-6 py-2.5 text-slate-900 transition hover:bg-slate-50"
                        >
                          Reset
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="rounded-xl bg-linear-to-r from-sky-600 to-sky-500 px-6 py-2.5 font-semibold text-white shadow-md shadow-sky-200/40 transition hover:from-sky-700 hover:to-sky-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {loading ? 'Creating...' : 'Create User'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {isEditModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
                    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
                      <div className="border-b border-slate-200 p-6">
                        <h3 className="text-xl font-semibold text-slate-900">Edit User Profile</h3>
                        <p className="mt-1 text-sm text-slate-500">Update account details for this user.</p>
                      </div>

                      <form onSubmit={handleUpdateUserProfile} className="space-y-5 p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={editFormData.name}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Username *</label>
                            <input
                              type="text"
                              name="username"
                              value={editFormData.username}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Email *</label>
                            <input
                              type="email"
                              name="email"
                              value={editFormData.email}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Role *</label>
                            <select
                              name="role"
                              value={editFormData.role}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                              <option value="STUDENT">Student</option>
                              <option value="TEACHER">Tutor</option>
                              <option value="TECHNICIAN">Technician</option>
                              <option value="MANAGER">Manager</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={editFormData.phoneNumber}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Campus ID</label>
                            <input
                              type="text"
                              name="campusId"
                              value={editFormData.campusId}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Department</label>
                            <input
                              type="text"
                              name="department"
                              value={editFormData.department}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Specialization</label>
                            <input
                              type="text"
                              name="specialization"
                              value={editFormData.specialization}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Age</label>
                            <input
                              type="number"
                              name="age"
                              min="1"
                              max="150"
                              value={editFormData.age}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
                            <input
                              type="text"
                              name="address"
                              value={editFormData.address}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">New Password (optional)</label>
                            <input
                              type="password"
                              name="password"
                              value={editFormData.password}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                              placeholder="Leave blank to keep current password"
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={editFormData.confirmPassword}
                              onChange={handleEditUserChange}
                              className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          <button
                            type="button"
                            onClick={closeEditUserModal}
                            disabled={editSubmitting}
                            className="rounded-xl border border-slate-300 px-6 py-2.5 text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={editSubmitting}
                            className="rounded-xl bg-linear-to-r from-sky-600 to-sky-500 px-6 py-2.5 font-semibold text-white shadow-md shadow-sky-200/40 transition hover:from-sky-700 hover:to-sky-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {editSubmitting ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-white p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700">Communication Center</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Notifications</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Create announcements and review everything sent across the platform.
                  </p>
                </div>

                <div className="grid gap-0 lg:grid-cols-2">
                  <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
                    <h3 className="text-lg font-bold text-slate-900">Create notification</h3>
                    <p className="mt-1 text-sm text-slate-500">Compose and choose who receives it.</p>

                    <form onSubmit={handleNotificationSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Title *</label>
                        <input
                          value={notifForm.title}
                          onChange={(e) => setNotifForm((p) => ({ ...p, title: e.target.value }))}
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Campus update"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Message *</label>
                        <textarea
                          rows={4}
                          value={notifForm.message}
                          onChange={(e) => setNotifForm((p) => ({ ...p, message: e.target.value }))}
                          className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                          placeholder="Write your announcement..."
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Type</label>
                          <select
                            value={notifForm.type}
                            onChange={(e) => setNotifForm((p) => ({ ...p, type: e.target.value }))}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                          >
                            <option value="INFO">Info</option>
                            <option value="SUCCESS">Success</option>
                            <option value="WARNING">Warning</option>
                            <option value="ERROR">Error</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-slate-700">Action URL (optional)</label>
                          <input
                            value={notifForm.actionUrl}
                            onChange={(e) => setNotifForm((p) => ({ ...p, actionUrl: e.target.value }))}
                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Audience</label>
                        <select
                          value={notifForm.audienceType}
                          onChange={(e) =>
                            setNotifForm((p) => ({
                              ...p,
                              audienceType: e.target.value,
                              roles: [],
                              userIds: [],
                            }))
                          }
                          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value={AudienceNotificationRequest.ALL_USERS}>All active users</option>
                          <option value={AudienceNotificationRequest.SPECIFIC_ROLE}>Specific roles</option>
                          <option value={AudienceNotificationRequest.SPECIFIC_USERS}>Specific users</option>
                        </select>
                      </div>

                      {notifForm.audienceType === AudienceNotificationRequest.SPECIFIC_ROLE && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-3 text-sm font-medium text-slate-700">Select roles</p>
                          <div className="flex flex-wrap gap-2">
                            {['STUDENT', 'TEACHER', 'TECHNICIAN', 'ADMIN'].map((role) => (
                              <button
                                key={role}
                                type="button"
                                onClick={() => toggleNotifRole(role)}
                                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                  notifForm.roles.includes(role)
                                    ? 'bg-sky-600 text-white'
                                    : 'bg-white text-slate-600 ring-1 ring-sky-100 hover:bg-sky-50'
                                }`}
                              >
                                {displayRole(role)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {notifForm.audienceType === AudienceNotificationRequest.SPECIFIC_USERS && (
                        <div className="max-h-48 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="mb-3 text-sm font-medium text-slate-700">Select recipients</p>
                          {users.length === 0 ? (
                            <p className="text-sm text-slate-500">Load users from the Users tab first.</p>
                          ) : (
                            <ul className="space-y-2">
                              {users.map((u) => (
                                <li key={u.id}>
                                  <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white px-3 py-2 ring-1 ring-slate-100 hover:bg-slate-50">
                                    <input
                                      type="checkbox"
                                      checked={notifForm.userIds.includes(u.id)}
                                      onChange={() => toggleNotifUserId(u.id)}
                                      className="h-4 w-4 rounded border-slate-300 text-sky-600"
                                    />
                                    <span className="text-sm text-slate-800">
                                      {u.name}{' '}
                                      <span className="text-slate-500">({u.username}) · {displayRole(u.role)}</span>
                                    </span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={notifSubmitting}
                        className="w-full rounded-2xl bg-linear-to-r from-sky-600 to-sky-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-200/40 transition hover:from-sky-700 hover:to-sky-600 disabled:opacity-50"
                      >
                        {notifSubmitting ? 'Sending…' : 'Send notification'}
                      </button>
                    </form>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Sent notifications</h3>
                        <p className="text-sm text-slate-500">
                          Each card is one send. Recipients are grouped when the same announcement went out together.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={loadAdminNotificationsLight}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <input
                        placeholder="Search title, message, username…"
                        value={notifFilter.search}
                        onChange={(e) => setNotifFilter((p) => ({ ...p, search: e.target.value }))}
                        className="min-w-50 flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <select
                        value={notifFilter.type}
                        onChange={(e) => setNotifFilter((p) => ({ ...p, type: e.target.value }))}
                        className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="ALL">All types</option>
                        <option value="INFO">Info</option>
                        <option value="SUCCESS">Success</option>
                        <option value="WARNING">Warning</option>
                        <option value="ERROR">Error</option>
                      </select>
                      <select
                        value={notifFilter.recipientRole}
                        onChange={(e) => setNotifFilter((p) => ({ ...p, recipientRole: e.target.value }))}
                        className="rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="ALL">All recipient roles</option>
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Tutor</option>
                        <option value="TECHNICIAN">Technician</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </div>

                    <div className="mt-4 text-sm text-slate-500">
                      Showing {filteredNotificationGroups.length} send
                      {filteredNotificationGroups.length !== 1 ? 's' : ''} ({adminNotifications.length} inbox rows)
                    </div>

                    <div className="mt-4 max-h-130 space-y-3 overflow-y-auto pr-1">
                      {notifLoading ? (
                        <p className="text-slate-600">Loading…</p>
                      ) : filteredNotificationGroups.length === 0 ? (
                        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                          No notifications match your filters.
                        </p>
                      ) : (
                        filteredNotificationGroups.map((g, idx) => (
                          <article
                            key={`${g.title}-${g.createdAt}-${idx}`}
                            className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4 shadow-sm transition hover:border-sky-200 hover:bg-white"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <h4 className="font-semibold text-slate-900">{g.title}</h4>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${typeBadgeClass(g.type)}`}>
                                {g.type}
                              </span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{g.message}</p>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              <span>
                                <strong className="text-slate-700">{g.recipients.length}</strong> recipient
                                {g.recipients.length !== 1 ? 's' : ''}
                              </span>
                              {g.createdByUsername && (
                                <span>
                                  By: <strong className="text-slate-700">{g.createdByUsername}</strong>
                                </span>
                              )}
                              <span>{g.createdAt ? new Date(g.createdAt).toLocaleString() : ''}</span>
                            </div>
                            <details className="mt-3 rounded-xl border border-slate-200 bg-white/60 px-3 py-2 text-xs text-slate-600">
                              <summary className="cursor-pointer font-medium text-slate-700">View recipients</summary>
                              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">
                                {g.recipients.map((r, i) => (
                                  <li key={`${r.username}-${i}`}>
                                    <span className="font-medium text-slate-800">{r.username}</span>
                                    <span className="text-slate-500"> · {displayRole(r.role)}</span>
                                  </li>
                                ))}
                              </ul>
                            </details>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inquiries' && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.25)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700">Service Desk</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Inquiries</h2>
                <p className="mt-1 text-sm text-slate-500">Track and respond to support requests submitted by users.</p>
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  Professional inquiries section created. Add inquiry API integration when backend endpoint is ready.
                </div>
              </div>
            )}

            {activeTab === 'incidents' && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.25)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700">Incident Workflow</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Student Incident Review</h2>
                <p className="mt-1 text-sm text-slate-500">Review student incident tickets and assign technicians for resolution.</p>
                <div className="mt-6">
                  <TicketCenter />
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.25)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700">Resource Planning</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Booking Details</h2>
                <p className="mt-1 text-sm text-slate-500">Monitor booking status, schedules, and resource allocations.</p>
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  Professional booking details section created. Connect this to booking endpoints for real-time data.
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.25)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-sky-700">Quality Review</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Reviews</h2>
                <p className="mt-1 text-sm text-slate-500">View feedback analytics and service quality reviews.</p>
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
                  Professional reviews section created. Plug in review metrics and moderation features here.
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
