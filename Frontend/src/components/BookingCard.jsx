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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '18px', height: '18px', color: '#0e4d7b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              </svg>
              <h3 style={{ color: '#0e4d7b', fontSize: '16px', fontWeight: '700' }}>
                {booking.resourceId}
              </h3>
            </div>
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
            <p style={{ fontSize: '14px', color: '#0e4d7b', fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Booking Period
            </p>
            <p style={{ fontSize: '14px', color: '#1a2332' }}>
              {fmt(booking.startTime)} → {fmt(booking.endTime)}
            </p>
          </div>

          {/* Details */}
          <p style={{ fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <svg style={{ width: '16px', height: '16px', marginTop: '2px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span><strong>Purpose:</strong> {booking.purpose}</span>
          </p>
          {booking.expectedAttendees && (
            <p style={{ fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-2a6 6 0 0112 0v2z" />
              </svg>
              <span><strong>Attendees:</strong> {booking.expectedAttendees} people</span>
            </p>
          )}
          <p style={{ fontSize: '14px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span><strong>User:</strong> {booking.userId}</span>
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