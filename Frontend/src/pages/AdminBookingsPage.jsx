import { useEffect, useState } from 'react';
import { getAllBookings, approveBooking, rejectBooking, cancelBooking } from '../api/bookingApi';
import BookingCard from '../components/BookingCard';
import '../styles/theme.css';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await getAllBookings();
      setBookings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleApprove = async (id) => {
    if (window.confirm('Approve this booking?')) {
      try {
        await approveBooking(id);
        fetchAll();
      } catch (e) {
        alert(e.response?.data?.error || 'Failed to approve');
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (required):');
    if (reason && reason.trim()) {
      try {
        await rejectBooking(id, reason);
        fetchAll();
      } catch (e) {
        alert(e.response?.data?.error || 'Failed to reject');
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Cancel this approved booking? This will free up the time slot.')) {
      try {
        await cancelBooking(id);
        fetchAll();
      } catch (e) {
        alert(e.response?.data?.error || 'Failed to cancel');
      }
    }
  };

  const filters = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
  const filtered = filter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const counts = filters.reduce((acc, f) => {
    acc[f] = f === 'ALL'
      ? bookings.length
      : bookings.filter(b => b.status === f).length;
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">🛠️ Admin Panel</h2>
          <p style={{ color: '#5a7184', fontSize: '14px', marginTop: '4px' }}>
            Manage all booking requests
          </p>
        </div>
        <button className="btn-primary" onClick={fetchAll}>🔄 Refresh</button>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px', marginBottom: '24px'
      }}>
        {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <div key={s} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{
              fontSize: '24px', fontWeight: '800', color: '#0e4d7b',
              marginBottom: '4px'
            }}>
              {counts[s]}
            </div>
            <span className={`status-badge status-${s}`}>{s}</span>
          </div>
        ))}
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 16px', borderRadius: '20px', cursor: 'pointer',
            fontWeight: '600', fontSize: '13px', border: 'none',
            background: filter === f ? '#0e4d7b' : 'white',
            color: filter === f ? 'white' : '#5a7184',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s'
          }}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#5a7184' }}>
          ⏳ Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: '#5a7184' }}>No {filter} bookings found.</p>
        </div>
      ) : (
        filtered.map(b => (
          <BookingCard key={b.id} booking={b}
            showActions={true}
            onApprove={handleApprove}
            onReject={handleReject}
            onCancel={handleCancel}
          />
        ))
      )}
    </div>
  );
}

