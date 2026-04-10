import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([
    { id: 1, facility: 'Auditorium', date: '2026-04-15', time: '10:00 AM', booked_by: 'John Doe', status: 'Confirmed' },
    { id: 2, facility: 'Lab A', date: '2026-04-16', time: '2:00 PM', booked_by: 'Jane Smith', status: 'Pending' },
  ]);

  const [maintenance, setMaintenance] = useState([
    { id: 1, facility: 'Building A', issue: 'Roof leak', priority: 'High', assigned_tech: 'Unassigned', status: 'Open' },
    { id: 2, facility: 'Lab B', issue: 'Broken AC', priority: 'Medium', assigned_tech: 'Ahmed Khan', status: 'In Progress' },
  ]);

  const [technicians, setTechnicians] = useState([
    { id: 1, name: 'Ahmed Khan', specialty: 'Electrical', available: true, current_assignment: 1 },
    { id: 2, name: 'Ali Hassan', specialty: 'Plumbing', available: true, current_assignment: null },
    { id: 3, name: 'Fatima Al-Mansouri', specialty: 'HVAC', available: false, current_assignment: 2 },
  ]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);

  const [newBooking, setNewBooking] = useState({ facility: '', date: '', time: '', booked_by: '' });
  const [newMaintenance, setNewMaintenance] = useState({ facility: '', issue: '', priority: 'Medium' });
  const [technicianAssignment, setTechnicianAssignment] = useState({ maintenance_id: '', technician_id: '' });

  const handleAddBooking = () => {
    if (!newBooking.facility || !newBooking.date || !newBooking.time || !newBooking.booked_by) {
      toast.error('Please fill all fields');
      return;
    }
    const booking = {
      id: bookings.length + 1,
      ...newBooking,
      status: 'Confirmed'
    };
    setBookings([...bookings, booking]);
    setNewBooking({ facility: '', date: '', time: '', booked_by: '' });
    setShowBookingModal(false);
    toast.success('Booking added successfully');
  };

  const handleAddMaintenance = () => {
    if (!newMaintenance.facility || !newMaintenance.issue) {
      toast.error('Please fill all fields');
      return;
    }
    const issue = {
      id: maintenance.length + 1,
      ...newMaintenance,
      assigned_tech: 'Unassigned',
      status: 'Open'
    };
    setMaintenance([...maintenance, issue]);
    setNewMaintenance({ facility: '', issue: '', priority: 'Medium' });
    setShowMaintenanceModal(false);
    toast.success('Maintenance request added');
  };

  const handleAssignTechnician = () => {
    if (!technicianAssignment.maintenance_id || !technicianAssignment.technician_id) {
      toast.error('Please select both maintenance and technician');
      return;
    }

    const maintenanceIndex = maintenance.findIndex(m => m.id === parseInt(technicianAssignment.maintenance_id));
    const technicianIndex = technicians.findIndex(t => t.id === parseInt(technicianAssignment.technician_id));

    if (maintenanceIndex !== -1 && technicianIndex !== -1) {
      const updatedMaintenance = [...maintenance];
      updatedMaintenance[maintenanceIndex].assigned_tech = technicians[technicianIndex].name;
      updatedMaintenance[maintenanceIndex].status = 'In Progress';
      setMaintenance(updatedMaintenance);

      const updatedTechnicians = [...technicians];
      updatedTechnicians[technicianIndex].current_assignment = parseInt(technicianAssignment.maintenance_id);
      updatedTechnicians[technicianIndex].available = false;
      setTechnicians(updatedTechnicians);

      setTechnicianAssignment({ maintenance_id: '', technician_id: '' });
      setShowTechnicianModal(false);
      toast.success('Technician assigned successfully');
    }
  };

  const handleBookingStatusChange = (id, newStatus) => {
    const updated = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBookings(updated);
    toast.success(`Booking status updated to ${newStatus}`);
  };

  const handleMaintenanceStatusChange = (id, newStatus) => {
    const updated = maintenance.map(m => m.id === id ? { ...m, status: newStatus } : m);
    setMaintenance(updated);
    toast.success(`Maintenance status updated to ${newStatus}`);
  };

  const deletBooking = (id) => {
    setBookings(bookings.filter(b => b.id !== id));
    toast.success('Booking deleted');
  };

  const deleteMaintenance = (id) => {
    setMaintenance(maintenance.filter(m => m.id !== id));
    toast.success('Maintenance request deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-slate-600 mt-2">Welcome back, {user?.username}! Manage your facilities and maintenance efficiently.</p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-slate-600 text-sm font-medium">Total Bookings</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{bookings.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-slate-600 text-sm font-medium">Pending Bookings</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{bookings.filter(b => b.status === 'Pending').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <p className="text-slate-600 text-sm font-medium">Open Maintenance</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{maintenance.filter(m => m.status === 'Open').length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <p className="text-slate-600 text-sm font-medium">Available Techs</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{technicians.filter(t => t.available).length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'bookings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📅 Bookings
            </button>
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'maintenance'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔧 Maintenance
            </button>
            <button
              onClick={() => setActiveTab('technicians')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'technicians'
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👨‍🔧 Assign Technician
            </button>
          </div>

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Facility Bookings</h2>
                <button
                  onClick={() => setShowBookingModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  + New Booking
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Facility</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Time</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Booked By</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4">{booking.facility}</td>
                        <td className="py-3 px-4">{booking.date}</td>
                        <td className="py-3 px-4">{booking.time}</td>
                        <td className="py-3 px-4">{booking.booked_by}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            booking.status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={booking.status}
                            onChange={(e) => handleBookingStatusChange(booking.id, e.target.value)}
                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm mr-2"
                          >
                            <option>Confirmed</option>
                            <option>Pending</option>
                            <option>Cancelled</option>
                          </select>
                          <button
                            onClick={() => deletBooking(booking.id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Maintenance Requests</h2>
                <button
                  onClick={() => setShowMaintenanceModal(true)}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                  + New Request
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Facility</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Issue</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Assigned Tech</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map(maint => (
                      <tr key={maint.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="py-3 px-4">{maint.facility}</td>
                        <td className="py-3 px-4">{maint.issue}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            maint.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : maint.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {maint.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">{maint.assigned_tech}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            maint.status === 'Open'
                              ? 'bg-red-100 text-red-800'
                              : maint.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {maint.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <select
                            value={maint.status}
                            onChange={(e) => handleMaintenanceStatusChange(maint.id, e.target.value)}
                            className="px-3 py-1 border border-slate-300 rounded-lg text-sm mr-2"
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                          </select>
                          <button
                            onClick={() => deleteMaintenance(maint.id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Assign Technician Tab */}
          {activeTab === 'technicians' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Technician Assignments</h2>
                <button
                  onClick={() => setShowTechnicianModal(true)}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                >
                  + Assign Technician
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Available Technicians */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-emerald-600 rounded-full"></span>
                    Available Technicians
                  </h3>
                  <div className="space-y-3">
                    {technicians.filter(t => t.available).map(tech => (
                      <div key={tech.id} className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="font-semibold text-slate-900">{tech.name}</p>
                        <p className="text-sm text-slate-600">{tech.specialty}</p>
                        <p className="text-xs text-emerald-600 mt-1">✓ Available</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Busy Technicians */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                    Busy Technicians
                  </h3>
                  <div className="space-y-3">
                    {technicians.filter(t => !t.available).map(tech => (
                      <div key={tech.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="font-semibold text-slate-900">{tech.name}</p>
                        <p className="text-sm text-slate-600">{tech.specialty}</p>
                        <p className="text-xs text-red-600 mt-1">✗ Currently Assigned (Task #{tech.current_assignment})</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Add New Booking</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Facility Name"
                value={newBooking.facility}
                onChange={(e) => setNewBooking({ ...newBooking, facility: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="time"
                value={newBooking.time}
                onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Booked By"
                value={newBooking.booked_by}
                onChange={(e) => setNewBooking({ ...newBooking, booked_by: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBooking}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Add Maintenance Request</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Facility Name"
                value={newMaintenance.facility}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, facility: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="Issue Description"
                value={newMaintenance.issue}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, issue: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
              <select
                value={newMaintenance.priority}
                onChange={(e) => setNewMaintenance({ ...newMaintenance, priority: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMaintenanceModal(false)}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMaintenance}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {showTechnicianModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Assign Technician</h3>
            <div className="space-y-4">
              <select
                value={technicianAssignment.maintenance_id}
                onChange={(e) => setTechnicianAssignment({ ...technicianAssignment, maintenance_id: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Select Maintenance Task</option>
                {maintenance.map(m => (
                  <option key={m.id} value={m.id}>{m.facility} - {m.issue}</option>
                ))}
              </select>
              <select
                value={technicianAssignment.technician_id}
                onChange={(e) => setTechnicianAssignment({ ...technicianAssignment, technician_id: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              >
                <option value="">Select Technician</option>
                {technicians.filter(t => t.available).map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.specialty})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTechnicianModal(false)}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTechnician}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
