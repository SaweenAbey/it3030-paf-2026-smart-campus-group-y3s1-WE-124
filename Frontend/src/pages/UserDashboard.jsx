import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { getMyBookings, cancelBooking } from '../api/bookingApi';

const UserDashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Fetch user bookings
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    setBookingError(null);
    try {
      const response = await getMyBookings();
      setBookings(response.data || []);
    } catch (error) {
      setBookingError('Failed to load bookings. Please try again.');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        setBookings(bookings.filter(b => b.id !== bookingId));
        alert('Booking cancelled successfully');
      } catch (error) {
        alert('Failed to cancel booking. Please try again.');
        console.error('Error cancelling booking:', error);
      }
    }
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return 'N/A';
    return new Date(datetime).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'APPROVED': 'bg-green-100 text-green-700',
      'REJECTED': 'bg-red-100 text-red-700',
      'CANCELLED': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-blue-100 text-blue-700';
  };

  const sidebarItems = [
    { key: 'profile', label: 'My Profile', icon: '👤' },
    { key: 'overview', label: 'Overview', icon: '📚' },
    { key: 'courses', label: 'My Courses', icon: '🎓' },
    { key: 'bookings', label: 'My Bookings', icon: '📅' },
    { key: 'assignments', label: 'Assignments', icon: '📝' },
    { key: 'grades', label: 'Grades', icon: '📊' },
    { key: 'schedule', label: 'Schedule', icon: '📌' },
    { key: 'resources', label: 'Resources', icon: '📖' },
    { key: 'messages', label: 'Messages', icon: '💬' },
  ];

  const stats = [
    { label: 'Enrolled Courses', value: '5', icon: '🎓' },
    { label: 'Active Assignments', value: '3', icon: '📝' },
    { label: 'Avg. GPA', value: '3.8', icon: '⭐' },
    { label: 'Attendance', value: '94%', icon: '✓' },
  ];

  const SectionCard = ({ title, subtitle, children }) => (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );

  const renderContent = () => {
    if (activeTab === 'profile') {
      return (
        <SectionCard title="My Profile" subtitle="Your account information and student details.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{user?.name || 'Not provided'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Username</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{user?.username || 'Not provided'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{user?.email || 'Not provided'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{user?.role || 'STUDENT'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Department</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{user?.department || 'Not provided'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-500">Campus ID</p>
              <p className="mt-1 text-lg font-semibold text-slate-800">{user?.campusId || 'Not provided'}</p>
            </div>
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'courses') {
      return (
        <SectionCard title="My Courses" subtitle="View all your enrolled courses.">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                name: 'Computer Science 101',
                instructor: 'Dr. Smith',
                progress: 75,
                grade: 'A-',
              },
              {
                name: 'Data Structures',
                instructor: 'Dr. Johnson',
                progress: 60,
                grade: 'B+',
              },
              { name: 'Web Development', instructor: 'Prof. Davis', progress: 85, grade: 'A' },
              {
                name: 'Database Systems',
                instructor: 'Dr. Wilson',
                progress: 50,
                grade: 'B',
              },
            ].map((course) => (
              <div
                key={course.name}
                className="rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:bg-gradient-to-br hover:from-sky-50 hover:to-blue-50 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-slate-800">{course.name}</h3>
                  <span className="text-sm font-bold text-blue-600">{course.grade}</span>
                </div>
                <p className="text-sm text-slate-600 mb-3">👨‍🏫 {course.instructor}</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2">{course.progress}% Complete</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'bookings') {
      return (
        <SectionCard title="My Bookings" subtitle="View and manage your resource bookings.">
          {loadingBookings ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-slate-600">Loading your bookings...</p>
              </div>
            </div>
          ) : bookingError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-red-700">❌ {bookingError}</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-slate-600 text-lg">No bookings yet</p>
              <p className="text-slate-500 text-sm mt-2">Create a booking to reserve a resource</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all bg-gradient-to-r from-slate-50 to-white"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-800">
                          📒 {booking.resourceId || 'Resource'}
                        </h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">Booking ID: #{booking.id}</p>
                    </div>
                  </div>

                  {/* Booking Period */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4 border border-blue-100">
                    <p className="text-xs uppercase tracking-wide text-slate-600 font-semibold mb-2 flex items-center gap-2">
                      📅 Booking Period
                    </p>
                    <p className="text-slate-800 font-medium">
                      {formatDateTime(booking.startTime)} → {formatDateTime(booking.endTime)}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Purpose</p>
                      <p className="text-slate-800 font-medium mt-1">{booking.purpose || 'N/A'}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">👥 Expected Attendees</p>
                      <p className="text-slate-800 font-medium mt-1">{booking.expectedAttendees || 'Not specified'}</p>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {booking.rejectionReason && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
                      <p className="text-red-700 text-sm">
                        <strong>❌ Rejection Reason:</strong> {booking.rejectionReason}
                      </p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-slate-500 flex gap-6 flex-wrap mb-4 pt-3 border-t border-slate-200">
                    <span>🕐 Created: {formatDateTime(booking.createdAt)}</span>
                    <span>🔄 Updated: {formatDateTime(booking.updatedAt)}</span>
                  </div>

                  {/* Actions */}
                  {booking.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors"
                      >
                        🚫 Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      );
    }

    if (activeTab === 'assignments') {
      return (
        <SectionCard title="My Assignments" subtitle="Track your current assignments and deadlines.">
          <div className="space-y-3">
            {[
              {
                title: 'Programming Project 1',
                course: 'CS 101',
                dueDate: 'Apr 15, 2026',
                status: 'In Progress',
              },
              {
                title: 'Database Design',
                course: 'Database Systems',
                dueDate: 'Apr 20, 2026',
                status: 'Not Started',
              },
              {
                title: 'Web App Development',
                course: 'Web Development',
                dueDate: 'Apr 10, 2026',
                status: 'Submitted',
              },
              {
                title: 'Data Structures HW',
                course: 'Data Structures',
                dueDate: 'Apr 22, 2026',
                status: 'In Progress',
              },
            ].map((assign) => (
              <div key={assign.title} className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all bg-gradient-to-r from-slate-50 to-white">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-slate-800">{assign.title}</h4>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      assign.status === 'Submitted'
                        ? 'bg-green-100 text-green-700'
                        : assign.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {assign.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{assign.course}</p>
                <p className="text-sm font-medium text-slate-700">📅 Due: {assign.dueDate}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'grades') {
      return (
        <SectionCard title="My Grades" subtitle="View your grades and performance metrics.">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-3 font-semibold text-slate-700">Course</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Current Grade</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Participation</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { course: 'CS 101', grade: 'A-', participation: 'Excellent', status: '✓ On Track' },
                  { course: 'Database Systems', grade: 'B', participation: 'Good', status: '✓ On Track' },
                  { course: 'Web Development', grade: 'A', participation: 'Excellent', status: '✓ Excellent' },
                  { course: 'Data Structures', grade: 'B+', participation: 'Good', status: '✓ On Track' },
                ].map((student) => (
                  <tr key={student.course} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-3 text-slate-700 font-medium">{student.course}</td>
                    <td className="p-3 font-semibold text-slate-800 text-lg">{student.grade}</td>
                    <td className="p-3 text-slate-700">{student.participation}</td>
                    <td className="p-3 text-green-600 font-semibold">{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'schedule') {
      return (
        <SectionCard title="Class Schedule" subtitle="Your weekly class schedule and important dates.">
          <div className="space-y-3">
            {[
              { day: 'Monday', classes: ['CS 101 - 10:00 AM', 'Web Dev - 1:00 PM'] },
              { day: 'Tuesday', classes: ['Database - 2:00 PM'] },
              { day: 'Wednesday', classes: ['CS 101 - 10:00 AM', 'Data Structures - 11:30 AM'] },
              { day: 'Thursday', classes: ['Database - 2:00 PM', 'Web Dev - 4:00 PM'] },
              { day: 'Friday', classes: ['CS 101 - 10:00 AM', 'Lab Session - 2:00 PM'] },
            ].map((day) => (
              <div key={day.day} className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition bg-gradient-to-r from-slate-50 to-white">
                <h4 className="font-semibold text-slate-800 mb-2">{day.day}</h4>
                <div className="space-y-1">
                  {day.classes.map((cls, idx) => (
                    <p key={idx} className="text-sm text-slate-600">🕐 {cls}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'resources') {
      return (
        <SectionCard title="Course Resources" subtitle="Access lecture notes, materials, and study guides.">
          <div className="space-y-3">
            {[
              {
                name: 'Lecture Notes - Week 1-5',
                course: 'CS 101',
                type: 'PDF',
                size: '12 MB',
              },
              { name: 'Practice Problems', course: 'Data Structures', type: 'Document', size: '2.1 MB' },
              { name: 'Code Examples & Tutorials', course: 'Web Development', type: 'ZIP', size: '45 MB' },
              { name: 'Database Design Guide', course: 'Database Systems', type: 'PDF', size: '5.3 MB' },
            ].map((resource) => (
              <div
                key={resource.name}
                className="rounded-xl border border-slate-200 p-4 flex justify-between items-center hover:bg-slate-50 transition cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-slate-800">{resource.name}</p>
                  <p className="text-sm text-slate-500">{resource.course}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500">{resource.size}</span>
                  <span className="text-xs font-semibold bg-sky-100 text-sky-700 px-3 py-1 rounded-full">
                    {resource.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    if (activeTab === 'messages') {
      return (
        <SectionCard
          title="Messages & Announcements"
          subtitle="Communication with instructors and classmates."
        >
          <div className="space-y-3">
            {[
              {
                from: 'Dr. Smith',
                type: 'Announcement',
                message: 'Class cancelled tomorrow due to conference',
                time: '2 hours ago',
              },
              {
                from: 'Prof. Davis',
                type: 'Message',
                message: 'Your project was graded. Check the feedback.',
                time: '5 hours ago',
              },
              {
                from: 'Classmate - Alex',
                type: 'Message',
                message: 'Want to study together for the exam?',
                time: '1 day ago',
              },
            ].map((msg, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition cursor-pointer bg-gradient-to-r from-slate-50 to-white">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-slate-800">{msg.from}</p>
                  <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {msg.type}
                  </span>
                </div>
                <p className="text-slate-600">{msg.message}</p>
                <p className="text-xs text-slate-400 mt-2">{msg.time}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      );
    }

    return (
      <SectionCard title="Overview" subtitle="Your learning space dashboard.">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-100 p-6 hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-sky-100 p-6 bg-gradient-to-br from-sky-50 to-blue-50">
            <h3 className="font-semibold text-slate-800 mb-4">📌 Upcoming Deadlines</h3>
            <div className="space-y-3">
              {[
                '📝 CS 101 Project - Apr 15',
                '📝 Database Assignment - Apr 20',
                '📝 Web Dev HW - Apr 22',
              ].map((deadline, idx) => (
                <p key={idx} className="text-slate-700 text-sm">
                  {deadline}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
            <h3 className="font-semibold text-slate-800 mb-4">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 font-medium transition">
                View Messages
              </button>
              <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium transition">
                Download Resources
              </button>
              <button className="w-full px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg hover:bg-cyan-200 font-medium transition">
                Check Grades
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
        <div className="rounded-3xl bg-gradient-to-r from-sky-700 to-blue-500 p-6 md:p-8 text-white shadow-2xl mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs tracking-wider uppercase mb-4">
            📚 Learning Space
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Student Dashboard</h1>
          <p className="text-white/90 text-base md:text-lg">Welcome back, {user?.name || 'Student'}.</p>
          <p className="text-white/75 text-sm mt-2">Stay on top of your courses and assignments</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          <Sidebar items={sidebarItems} />
          <main>{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
