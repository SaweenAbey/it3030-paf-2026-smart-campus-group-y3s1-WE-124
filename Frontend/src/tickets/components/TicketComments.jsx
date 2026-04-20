import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import ticketApi from '../api/ticketApi';

const TicketComments = ({ ticket, currentUser, isAdmin, onCommentsChanged }) => {
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const comments = useMemo(() => ticket?.comments || [], [ticket?.comments]);

  const canManageComment = (comment) => {
    return isAdmin || comment.authorUsername === currentUser?.username;
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      await ticketApi.addComment(ticket.id, commentText.trim());
      setCommentText('');
      onCommentsChanged?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const saveEditedComment = async () => {
    if (!editingText.trim() || !editingId) return;
    try {
      await ticketApi.updateComment(ticket.id, editingId, editingText.trim());
      setEditingId(null);
      setEditingText('');
      onCommentsChanged?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update comment');
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await ticketApi.deleteComment(ticket.id, commentId);
      onCommentsChanged?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-800">Comments</h3>

      <div className="mt-4 space-y-3">
        {comments.length === 0 && <p className="text-sm text-slate-500">No comments yet.</p>}

        {comments.map((comment) => (
          <div key={comment.id} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-700">{comment.authorName || comment.authorUsername}</p>
              <p className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</p>
            </div>

            {editingId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEditedComment}
                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditingText('');
                    }}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-700">{comment.content}</p>
            )}

            {canManageComment(comment) && editingId !== comment.id && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditingText(comment.content || '');
                  }}
                  className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        <textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Add comment"
        />
        <button
          onClick={addComment}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
        >
          Add Comment
        </button>
      </div>
    </div>
  );
};

export default TicketComments;
