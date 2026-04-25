import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ArrowLeft, Send, CheckCircle2, Info, User as UserIcon } from 'lucide-react';

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
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    supportTopic: supportTopics[0],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || formData.title.trim().length < 5) {
      toast.error('Title must be at least 5 characters');
      return;
    }
    if (!formData.comment.trim() || formData.comment.trim().length < 20) {
      toast.error('Please provide more details (min 20 characters)');
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
      toast.success('Your feedback has been published!');
      navigate('/support/review-submitted', { state: { review: response.data } });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const userInitials = (user?.name || user?.username || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e0f2fe,transparent_35%),#f8fafc] pb-20 pt-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Navigation */}
        <Link 
          to="/support" 
          className="group mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 transition hover:text-sky-600"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Support
        </Link>

        <div className="grid gap-10 lg:grid-cols-12">
          
          {/* Left Column: Context & Profile */}
          <div className="lg:col-span-5 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h1 className="mt-6 text-3xl font-black leading-tight text-slate-900">
                Share Your <span className="text-sky-600">Story</span>
              </h1>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-500">
                Your feedback helps us build a better UNI 360. All verified reviews are featured on our community board.
              </p>

              <div className="mt-10 rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                <div className="flex items-center gap-4">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt={user.name} 
                      className="h-12 w-12 rounded-2xl object-cover ring-4 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white shadow-lg ring-4 ring-white">
                      {userInitials}
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Posting as</p>
                    <p className="text-sm font-black text-slate-900">{user?.name || user?.username}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  'Verified by community badge',
                  'Published on community board',
                  'Supports platform growth'
                ].map(text => (
                  <div key={text} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[2rem] border border-sky-100 bg-sky-50/50 p-6"
            >
              <div className="flex gap-4">
                <Info className="h-5 w-5 shrink-0 text-sky-500" />
                <p className="text-xs font-medium leading-relaxed text-sky-700">
                  Reviews are public. Avoid sharing sensitive information like phone numbers or student IDs in your comments.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: The Form */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[2.5rem] border border-white bg-white p-8 shadow-2xl shadow-slate-200/60 sm:p-10"
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Interactive Rating */}
                <div className="text-center sm:text-left">
                  <label className="mb-4 block text-xs font-black uppercase tracking-widest text-slate-400">
                    Your Overall Experience
                  </label>
                  <div className="flex justify-center sm:justify-start gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onMouseEnter={() => setHoverRating(val)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setFormData(prev => ({ ...prev, rating: val }))}
                        className="group relative p-1 outline-none"
                      >
                        <Star 
                          className={`h-10 w-10 transition-all duration-300 ${
                            val <= (hoverRating || formData.rating) 
                              ? 'fill-amber-400 text-amber-400 scale-110' 
                              : 'text-slate-200'
                          } group-hover:drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]`}
                        />
                        {val === formData.rating && (
                          <motion.div 
                            layoutId="rating-glow"
                            className="absolute inset-0 -z-10 blur-xl bg-amber-400/20"
                          />
                        )}
                      </button>
                    ))}
                    <span className="ml-4 flex items-center text-sm font-black text-amber-500">
                      {formData.rating}/5
                    </span>
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Review Title</label>
                    <input
                      type="text"
                      maxLength={120}
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Exceptional Support Response"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                    />
                    <div className="mt-2 flex justify-end">
                      <span className={`text-[10px] font-bold ${formData.title.length < 5 ? 'text-red-400' : 'text-slate-300'}`}>
                        {formData.title.length}/120
                      </span>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Support Topic</label>
                    <div className="relative">
                      <select
                        value={formData.supportTopic}
                        onChange={(e) => setFormData(prev => ({ ...prev, supportTopic: e.target.value }))}
                        className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                      >
                        {supportTopics.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">
                        <ArrowLeft className="h-4 w-4 -rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Review Details</label>
                    <textarea
                      rows={6}
                      maxLength={1200}
                      value={formData.comment}
                      onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your detailed experience with us..."
                      className="w-full resize-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                    />
                    <div className="mt-2 flex justify-end">
                      <span className={`text-[10px] font-bold ${formData.comment.length < 20 ? 'text-red-400' : 'text-slate-300'}`}>
                        {formData.comment.length}/1200
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-slate-900 py-4 font-black text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <AnimatePresence mode="wait">
                      {submitting ? (
                        <motion.div 
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                          Publishing Feedback...
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="submit"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          Submit Public Review
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  <p className="mt-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    By submitting, you agree to our community guidelines
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmitPage;
