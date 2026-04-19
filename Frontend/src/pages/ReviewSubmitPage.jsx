import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext';
import { reviewAPI } from '../services/api';

const supportTopics = [
  'General Platform Experience',
  'Booking and Resources',
  'Maintenance and Incidents',
  'Account and Access',
  'Support Team Response',
];

const ReviewSubmitPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    supportTopic: supportTopics[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a review title');
      return;
    }
    if (!formData.comment.trim()) {
      toast.error('Please enter your review details');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        rating: formData.rating,
        title: formData.title.trim(),
        comment: formData.comment.trim(),
        supportTopic: formData.supportTopic,
      };

      const response = await reviewAPI.createReview(payload);
      toast.success('Review submitted successfully');
      navigate('/support/review-submitted', { state: { review: response.data } });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,#e0f2fe,transparent_30%),#f8fafc] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_30px_90px_-60px_rgba(2,132,199,0.55)] sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Submit Review</p>
          <h1 className="mt-3 text-3xl font-black text-slate-900">Share Your Support Experience</h1>
          <p className="mt-2 text-sm text-slate-600">
            Signed in as <span className="font-semibold text-slate-900">{user?.name || user?.username}</span>. Your review will appear on the Home page.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Rating</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rating: value }))}
                    className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                      value <= formData.rating
                        ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {value}★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Review Title</label>
              <input
                type="text"
                maxLength={120}
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                placeholder="Example: Fast support and clear updates"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Support Topic</label>
              <select
                value={formData.supportTopic}
                onChange={(e) => setFormData((prev) => ({ ...prev, supportTopic: e.target.value }))}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                disabled={submitting}
              >
                {supportTopics.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Review Details</label>
              <textarea
                rows={5}
                maxLength={1200}
                value={formData.comment}
                onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                placeholder="Tell us what worked well and where we can improve."
                disabled={submitting}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <Link
                to="/support"
                className="rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitPage;
