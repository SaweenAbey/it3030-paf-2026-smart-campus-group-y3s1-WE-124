import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import '../styles/theme.css';

export default function CreateBookingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    resourceId: '', userId: '', startTime: '',
    endTime: '', purpose: '', expectedAttendees: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await bookingAPI.createBooking({
        ...form,
        expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null
      });
      setSuccess('Booking created! Status: PENDING');
      setTimeout(() => navigate('/bookings'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '580px' }}>
      <div className="card">
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ color: '#0e4d7b', fontSize: '22px', fontWeight: '700', marginBottom: '6px' }}>
            📋 New Booking Request
          </h2>
          <p style={{ color: '#5a7184', fontSize: '14px' }}>
            Fill in the details to request a resource booking
          </p>
        </div>

        {error && <div className="error-box">⚠️ {error}</div>}
        {success && <div className="success-box">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Resource ID</label>
            <input name="resourceId" value={form.resourceId}
              onChange={handleChange} placeholder="e.g. LAB-101, HALL-A" required />
          </div>

          <div className="form-group">
            <label>Your User ID</label>
            <input name="userId" value={form.userId}
              onChange={handleChange} placeholder="e.g. user123" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Start Date & Time</label>
              <input type="datetime-local" name="startTime"
                value={form.startTime} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Date & Time</label>
              <input type="datetime-local" name="endTime"
                value={form.endTime} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Purpose</label>
            <textarea name="purpose" value={form.purpose}
              onChange={handleChange} rows={3}
              placeholder="Describe the reason for booking..." required />
          </div>

          <div className="form-group">
            <label>Expected Attendees (optional)</label>
            <input type="number" name="expectedAttendees"
              value={form.expectedAttendees} onChange={handleChange}
              min="1" placeholder="Number of people" />
          </div>

          <button className="btn-primary" type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '13px', fontSize: '15px' }}>
            {loading ? '⏳ Submitting...' : '🚀 Submit Booking Request'}
          </button>
        </form>
      </div>
    </div>
  );
}