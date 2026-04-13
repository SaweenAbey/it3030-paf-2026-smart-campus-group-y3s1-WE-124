export default function BookingCard({
  booking, onCancel, onEdit, showActions, onApprove, onReject
}) {
  const fmt = (dt) => {
    if (!dt) return 'N/A';
    return new Date(dt).toLocaleString('en-US', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  };

  return (
    <div className="card" style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px'
      }}>

        {/* Left: Info */}
        <div style={{ flex: 1 }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', marginBottom: '12px'
          }}>
            <h3 style={{ color: '#0e4d7b', fontSize: '16px', fontWeight: '700' }}>
              🏛️ {booking.resourceId}
            </h3>
            <span className={`status-badge status-${booking.status}`}>
              {booking.status}
            </span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              #{booking.id}
            </span>
          </div>

          {/* Booking Time */}
          <div style={{
            background: '#f0f4f8', borderRadius: '8px',
            padding: '10px 14px', marginBottom: '10px'
          }}>
            <p style={{ fontSize: '14px', color: '#0e4d7b', fontWeight: '600', marginBottom: '2px' }}>
              📅 Booking Period
            </p>
            <p style={{ fontSize: '14px', color: '#1a2332' }}>
              {fmt(booking.startTime)} → {fmt(booking.endTime)}
            </p>
          </div>

          {/* Details */}
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>📝 Purpose:</strong> {booking.purpose}
          </p>
          {booking.expectedAttendees && (
            <p style={{ fontSize: '14px', marginBottom: '6px' }}>
              <strong>👥 Attendees:</strong> {booking.expectedAttendees} people
            </p>
          )}
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>👤 User:</strong> {booking.userId}
          </p>

          {/* Rejection Reason */}
          {booking.rejectionReason && (
            <div style={{
              background: '#fee2e2', borderRadius: '8px',
              padding: '8px 12px', marginBottom: '8px'
            }}>
              <p style={{ fontSize: '13px', color: '#991b1b' }}>
                ❌ <strong>Rejection Reason:</strong> {booking.rejectionReason}
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div style={{
            borderTop: '1px solid #e2e8f0', paddingTop: '8px',
            marginTop: '8px', display: 'flex', gap: '20px', flexWrap: 'wrap'
          }}>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              🕐 <strong>Created:</strong> {fmt(booking.createdAt)}
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8' }}>
              🔄 <strong>Updated:</strong> {fmt(booking.updatedAt)}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: '8px', minWidth: '130px'
        }}>
          {/* User: Edit PENDING */}
          {onEdit && booking.status === 'PENDING' && (
            <button onClick={() => onEdit(booking)} style={{
              background: '#1a6fa8', color: 'white', border: 'none',
              padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
              fontWeight: '600', fontSize: '13px'
            }}>
              ✏️ Edit
            </button>
          )}

          {/* User: Cancel PENDING */}
          {onCancel && booking.status === 'PENDING' && !showActions && (
            <button className="btn-danger"
              onClick={() => onCancel(booking.id)}>
              🚫 Cancel
            </button>
          )}

          {/* Admin: Approve/Reject PENDING */}
          {showActions && booking.status === 'PENDING' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button className="btn-success"
                onClick={() => onApprove(booking.id)}>
                ✅ Approve
              </button>
              <button className="btn-danger"
                onClick={() => onReject(booking.id)}>
                ❌ Reject
              </button>
            </div>
          )}

          {/* Admin: Cancel APPROVED */}
          {showActions && booking.status === 'APPROVED' && (
            <button className="btn-danger"
              onClick={() => onCancel(booking.id)}>
              🚫 Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}