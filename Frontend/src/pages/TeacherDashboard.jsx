import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: '📚' },
    { key: 'classes', label: 'My Classes', icon: '🎓' },
    { key: 'assignments', label: 'Assignments', icon: '📝' },
    { key: 'grades', label: 'Grade Management', icon: '📊' },
    { key: 'students', label: 'Student Performance', icon: '👨‍🎓' },
    { key: 'resources', label: 'Course Resources', icon: '📖' },
    { key: 'messages', label: 'Messages', icon: '💬' },
  ];

  const stats = [
    { label: 'Active Classes', value: '4', icon: '🎓' },
    { label: 'Students', value: '87', icon: '👥' },
    { label: 'Pending Submissions', value: '12', icon: '📥' },
    { label: 'Avg Grade', value: '7.8/10', icon: '⭐' },
  ];

  const SectionCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'classes') {
      return (
        <SectionCard title="My Classes" subtitle="Manage and view your courses.">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Computer Science 101', students: 28, time: 'MWF 10:00 AM' },
              { name: 'Data Structures', students: 32, time: 'TTh 2:00 PM' },
              { name: 'Web Development', students: 15, time: 'MWF 1:00 PM' },
              { name: 'Database Systems', students: 22, time: 'TTh 10:00 AM' },
            ].map((cls) => (
              <div
                key={cls.name}
                className="rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:bg-gradient-to-br hover:from-indigo-50 hover:to-cyan-50 transition-all cursor-pointer"
              >
                <h3 className="font-semibold text-slate-800 text-lg">{cls.name}</h3>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-slate-600">👥 {cls.students} Students</p>
                  <p className="text-sm text-slate-600">🕐 {cls.time}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'assignments') {
      return (
        <SectionCard title="Assignments" subtitle="Create and manage assignments for your classes.">
          <div className="space-y-4">
            {[
              {
                title: 'Programming Project 1',
                class: 'CS 101',
                dueDate: 'Apr 15, 2026',
                submissions: '20/28',
              },
              {
                title: 'Database Design',
                class: 'Database Systems',
                dueDate: 'Apr 20, 2026',
                submissions: '18/22',
              },
              {
                title: 'Web App Development',
                class: 'Web Development',
                dueDate: 'Apr 10, 2026',
                submissions: '15/15',
              },
            ].map((assign) => (
              <div key={assign.title} className="rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all bg-gradient-to-r from-slate-50 to-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-800">{assign.title}</h4>
                    <p className="text-sm text-slate-500 mt-1">{assign.class}</p>
                  </div>
                  <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                    {assign.submissions}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-3">📅 Due: {assign.dueDate}</p>
              </div>
            ))}
            <button className="w-full px-6 py-3 mt-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">
              + Create New Assignment
            </button>
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'grades') {
      return (
        <SectionCard title="Grade Management" subtitle="Enter and manage student grades.">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-semibold text-slate-700">Student Name</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Class</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Current Grade</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Alice Johnson', class: 'CS 101', grade: '8.5', status: '📈 Excellent' },
                  { name: 'Bob Smith', class: 'CS 101', grade: '7.2', status: '✓ Good' },
                  { name: 'Carol Davis', class: 'CS 101', grade: '6.8', status: '⚠ Needs Help' },
                  { name: 'David Wilson', class: 'CS 101', grade: '9.1', status: '⭐ Outstanding' },
                ].map((student) => (
                  <tr key={student.name} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-700">{student.name}</td>
                    <td className="p-3 text-slate-700">{student.class}</td>
                    <td className="p-3 font-semibold text-slate-800">{student.grade}/10</td>
                    <td className="p-3">{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'students') {
      return (
        <SectionCard title="Student Performance" subtitle="Monitor your students' academic progress.">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'Alice Johnson', avg: '8.5', attendance: '95%', trend: '📈 Up' },
              { name: 'Bob Smith', avg: '7.2', attendance: '88%', trend: '→ Stable' },
              { name: 'Carol Davis', avg: '6.8', attendance: '82%', trend: '📉 Down' },
              { name: 'David Wilson', avg: '9.1', attendance: '98%', trend: '📈 Up' },
            ].map((student) => (
              <div
                key={student.name}
                className="rounded-xl border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-all"
              >
                <h4 className="font-semibold text-slate-800">{student.name}</h4>
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-slate-600">📊 Avg: {student.avg}/10</p>
                  <p className="text-sm text-slate-600">✓ Attendance: {student.attendance}</p>
                  <p className="text-sm text-slate-600">{student.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'resources') {
      return (
        <SectionCard title="Course Resources" subtitle="Manage lecture notes, materials, and files.">
          <div className="space-y-3">
            {[
              { name: 'Lecture Notes - Week 1', type: 'PDF', size: '2.4 MB', uploaded: '2 weeks ago' },
              { name: 'Programming Tutorial.mp4', type: 'Video', size: '45 MB', uploaded: '1 week ago' },
              { name: 'Code Examples.zip', type: 'Archive', size: '1.8 MB', uploaded: '3 days ago' },
              { name: 'Practice Problems', type: 'Document', size: '512 KB', uploaded: '1 day ago' },
            ].map((resource) => (
              <div
                key={resource.name}
                className="rounded-xl border border-slate-200 p-4 flex justify-between items-center hover:bg-slate-50 transition"
              >
                <div>
                  <p className="font-semibold text-slate-800">{resource.name}</p>
                  <p className="text-sm text-slate-500">{resource.size} • {resource.uploaded}</p>
                </div>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  {resource.type}
                </span>
              </div>
            ))}
            <button className="w-full px-6 py-3 mt-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
              + Upload Resource
            </button>
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'messages') {
      return (
        <SectionCard
          title="Messages"
          subtitle="Communicate with students and other teachers."
        >
          <div className="space-y-3">
            {[
              { from: 'Alice Johnson', message: 'Can you review my project submission?', time: '2 hours ago' },
              { from: 'Bob Smith', message: 'I need extra time on the assignment', time: '4 hours ago' },
              { from: 'Principal Davis', message: 'Department meeting next Friday', time: '1 day ago' },
            ].map((msg) => (
              <div key={msg.from} className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition cursor-pointer">
                <p className="font-semibold text-slate-800">{msg.from}</p>
                <p className="text-slate-600 mt-1">{msg.message}</p>
                <p className="text-xs text-slate-400 mt-2">{msg.time}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    return (
      <SectionCard title="Overview" subtitle="Your teaching dashboard summary.">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-2xl border border-indigo-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-indigo-100 p-6 bg-gradient-to-br from-indigo-50 to-cyan-50">
            <h3 className="font-semibold text-slate-800 mb-4">📅 Upcoming Events</h3>
            <div className="space-y-3">
              {[
                'CS 101 - Tomorrow 10:00 AM',
                'Grade Submission Deadline - Apr 20',
                'Department Meeting - Apr 25',
              ].map((event, idx) => (
                <p key={idx} className="text-slate-700 text-sm">
                  • {event}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 p-6 bg-gradient-to-br from-cyan-50 to-blue-50">
            <h3 className="font-semibold text-slate-800 mb-4">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-medium transition">
                Create Assignment
              </button>
              <button className="w-full px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 font-medium transition">
                Post Announcement
              </button>
              <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition">
                Grade Submissions
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <Sidebar items={sidebarItems} title="Teacher Hub">
            <div className="rounded-xl border border-indigo-100 bg-gradient-to-b from-white to-indigo-50/50 p-4">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Signed in as</p>
              <p className="mt-1 text-sm font-bold text-slate-800 truncate">{user?.name || 'Teacher'}</p>
            </div>
          </Sidebar>

          <section className="space-y-6">
            <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-500 to-cyan-400 p-6 sm:p-8 text-white shadow-lg shadow-indigo-200/50">
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wider uppercase mb-4 border border-white/20">
                🎓 Academic Hub
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Teacher Dashboard</h1>
              <p className="text-white/90 text-sm sm:text-base">Welcome back, {user?.name || 'Teacher'}. Manage your classes and students.</p>
            </div>
            
            {renderContent()}
          </section>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
