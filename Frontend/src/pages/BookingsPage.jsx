import { useEffect, useState } from 'react';
import { getMyBookings, cancelBooking, updateBooking } from '../api/bookingApi';
import BookingCard from '../components/BookingCard';
import { Link } from 'react-router-dom';
import '../styles/theme.css';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('user123');
  const [editingBooking, setEditingBooking] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getMyBookings(userId);
      setBookings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id);
        fetchBookings();
      } catch (e) {
        alert(e.response?.data?.error || 'Failed to cancel');
      }
    }
  };

  const handleEditOpen = (booking) => {
    setEditingBooking(booking);
    setEditForm({
      startTime: booking.startTime.slice(0, 16),
      endTime: booking.endTime.slice(0, 16),
      purpose: booking.purpose,
      expectedAttendees: booking.expectedAttendees || ''
    });
    setEditError('');
    setEditSuccess('');
  };

  const handleEditSave = async () => {
    setEditError('');
    setEditSuccess('');
    try {
      await updateBooking(editingBooking.id, {
        startTime: editForm.startTime,
        endTime: editForm.endTime,
        purpose: editForm.purpose,
        expectedAttendees: editForm.expectedAttendees
          ? parseInt(editForm.expectedAttendees) : null
      });
      setEditSuccess('Booking updated successfully!');
      setTimeout(() => {
        setEditingBooking(null);
        fetchBookings();
      }, 1000);
    } catch (e) {
      setEditError(e.response?.data?.error || 'Failed to update booking');
    }
  };

  const fmt = (dt) => {
    if (!dt) return 'N/A';
    return new Date(dt).toLocaleString('en-US', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">📅 My Bookings</h2>
        <Link to="/bookings/new">
          <button className="btn-primary">+ New Booking</button>
        </Link>
      </div>

      {/* User ID Search */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ margin: 0, whiteSpace: 'nowrap' }}>👤 User ID:</label>
          <input value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
            style={{ margin: 0 }} />
          <button className="btn-primary" onClick={fetchBookings}>
            🔍 Search
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingBooking && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card" style={{
            width: '540px', maxWidth: '90vw', maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '16px', marginBottom: '20px'
            }}>
              <h3 style={{ color: '#0e4d7b', fontSize: '18px', fontWeight: '700' }}>
                ✏️ Edit Booking
              </h3>
              <p style={{ color: '#5a7184', fontSize: '13px', marginTop: '4px' }}>
                🏛️ Resource: <strong>{editingBooking.resourceId}</strong>
                &nbsp;|&nbsp; Booking #<strong>{editingBooking.id}</strong>
              </p>
            </div>

            {/* Timestamps Info */}
            <div style={{
              background: '#f0f4f8', borderRadius: '8px',
              padding: '12px 16px', marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600',
                    textTransform: 'uppercase', marginBottom: '2px' }}>
                    Created At
                  </p>
                  <p style={{ fontSize: '13px', color: '#1a2332', fontWeight: '500' }}>
                    🕐 {fmt(editingBooking.createdAt)}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600',
                    textTransform: 'uppercase', marginBottom: '2px' }}>
                    Last Updated
                  </p>
                  <p style={{ fontSize: '13px', color: '#1a2332', fontWeight: '500' }}>
                    🔄 {fmt(editingBooking.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {editError && <div className="error-box">⚠️ {editError}</div>}
            {editSuccess && <div className="success-box">✅ {editSuccess}</div>}

            {/* Form */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'
            }}>
              <div className="form-group">
                <label>📅 Start Date & Time</label>
                <input type="datetime-local" value={editForm.startTime}
                  onChange={e => setEditForm({
                    ...editForm, startTime: e.target.value
                  })} />
              </div>
              <div className="form-group">
                <label>📅 End Date & Time</label>
                <input type="datetime-local" value={editForm.endTime}
                  onChange={e => setEditForm({
                    ...editForm, endTime: e.target.value
                  })} />
              </div>
            </div>

            <div className="form-group">
              <label>📝 Purpose</label>
              <textarea rows={3} value={editForm.purpose}
                onChange={e => setEditForm({
                  ...editForm, purpose: e.target.value
                })} />
            </div>

            <div className="form-group">
              <label>👥 Expected Attendees</label>
              <input type="number" min="1"
                value={editForm.expectedAttendees}
                onChange={e => setEditForm({
                  ...editForm, expectedAttendees: e.target.value
                })}
                placeholder="Number of people" />
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex', gap: '10px',
              justifyContent: 'flex-end', marginTop: '8px',
              paddingTop: '16px', borderTop: '1px solid #e2e8f0'
            }}>
              <button onClick={() => setEditingBooking(null)} style={{
                padding: '10px 20px', borderRadius: '8px',
                border: '1px solid #d1dde8', cursor: 'pointer',
                background: 'white', fontWeight: '600', color: '#5a7184'
              }}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleEditSave}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#5a7184' }}>
          ⏳ Loading bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ fontSize: '32px', marginBottom: '12px' }}>📭</p>
          <p style={{ color: '#5a7184', fontSize: '16px', marginBottom: '16px' }}>
            No bookings found for "<strong>{userId}</strong>"
          </p>
          <Link to="/bookings/new">
            <button className="btn-primary">Create First Booking</button>
          </Link>
        </div>
      ) : (
        <>
          <p style={{ color: '#5a7184', fontSize: '14px', marginBottom: '16px' }}>
            Found <strong>{bookings.length}</strong> booking(s) for
            "<strong>{userId}</strong>"
          </p>
          {bookings.map(b => (
            <BookingCard key={b.id} booking={b}
              onCancel={handleCancel}
              onEdit={handleEditOpen} />
          ))}
        </>
      )}
    </div>
  );
}
