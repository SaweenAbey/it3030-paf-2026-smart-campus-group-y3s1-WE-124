import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { reviewAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Filter, Search, User, Calendar, Quote, ArrowRight, MessageCircle } from 'lucide-react';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0); // 0 means all
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await reviewAPI.getPublicReviews(100); // Get a lot of reviews
      setReviews(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, breakdown: [0, 0, 0, 0, 0] };
    
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / total).toFixed(1);
    
    const breakdown = [0, 0, 0, 0, 0];
    reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[5 - r.rating]++;
      }
    });
    
    return { avg, total, breakdown };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      const matchesRating = filterRating === 0 || r.rating === filterRating;
      const matchesSearch = !searchQuery || 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.userName || r.username || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRating && matchesSearch;
    });
  }, [reviews, filterRating, searchQuery]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#f0f9ff,transparent_40%),#f8fafc] pb-20 pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-sky-600"
          >
            <MessageSquare className="h-3 w-3" />
            Community Feedback
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl"
          >
            The Voice of <span className="text-sky-600">UNI 360</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate-500"
          >
            Real experiences from students, staff, and administrators who use our platform every day to streamline campus operations.
          </motion.p>
        </div>

        <div className="grid gap-10 lg:grid-cols-12">
          
          {/* Sidebar / Stats */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl"
            >
              <h2 className="text-xl font-black text-slate-900">Platform Rating</h2>
              
              <div className="mt-8 flex items-end gap-4">
                <p className="text-6xl font-black text-slate-900">{stats.avg}</p>
                <div className="mb-2">
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} className={`h-5 w-5 ${i <= Math.round(stats.avg) ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">{stats.total} TOTAL REVIEWS</p>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                {stats.breakdown.map((count, idx) => {
                  const rating = 5 - idx;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-4">
                      <span className="w-10 text-xs font-black text-slate-500">{rating} ★</span>
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 bg-amber-400"
                        />
                      </div>
                      <span className="w-10 text-right text-xs font-bold text-slate-400">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-10 border-t border-slate-100 pt-8">
                <Link 
                  to="/support/review" 
                  className="group flex w-full items-center justify-between rounded-2xl bg-slate-900 px-6 py-4 text-sm font-black text-white transition hover:bg-sky-600"
                >
                  <span>Share Your Story</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>

            {/* Filter Section */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-xl shadow-slate-200/50 backdrop-blur-xl"
            >
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-4 w-4 text-sky-500" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Filter Reviews</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterRating(0)}
                  className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${filterRating === 0 ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map(rating => (
                  <button 
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${filterRating === rating ? 'bg-amber-400 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                  >
                    {rating} ★
                  </button>
                ))}
              </div>

              <div className="mt-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-10 py-3.5 text-xs font-bold text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/5"
                />
              </div>
            </motion.div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div className="grid gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-64 animate-pulse rounded-[2.5rem] bg-white/50 border border-slate-100" />
                  ))}
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="grid gap-6">
                  {filteredReviews.map((review, idx) => {
                    const initials = (review.userName || review.username || 'U')
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map(p => p[0]?.toUpperCase())
                      .join('');
                      
                    return (
                      <motion.article 
                        key={review.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative overflow-hidden rounded-[2.5rem] border border-white bg-white/80 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl transition-all hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-100/50"
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] transition-opacity group-hover:opacity-[0.07]">
                          <Quote className="h-24 w-24 rotate-180" />
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {review.userProfileImageUrl ? (
                                <img 
                                  src={review.userProfileImageUrl} 
                                  alt={review.userName} 
                                  className="h-14 w-14 rounded-2xl object-cover ring-4 ring-slate-50"
                                />
                              ) : (
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-slate-900 to-slate-700 text-lg font-black text-white ring-4 ring-slate-50">
                                  {initials}
                                </div>
                              )}
                              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500 text-white shadow-lg">
                                <MessageCircle className="h-3 w-3" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-slate-900">{review.userName || review.username}</h3>
                              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">{review.userRole || 'STUDENT'}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className={`h-4 w-4 ${i <= review.rating ? 'fill-current' : 'text-slate-100'}`} />
                              ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-8">
                          {review.supportTopic && (
                            <span className="inline-flex items-center rounded-lg bg-sky-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-sky-700 border border-sky-100 mb-4">
                              {review.supportTopic}
                            </span>
                          )}
                          <h4 className="text-xl font-black text-slate-900 leading-snug">{review.title}</h4>
                          <p className="mt-4 text-[15px] leading-relaxed text-slate-600 font-medium italic">
                            "{review.comment}"
                          </p>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center rounded-[3rem] border border-dashed border-slate-200 bg-slate-50/50 py-24 text-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <Search className="h-8 w-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-black text-slate-900">No matching reviews</h3>
                  <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or search query.</p>
                  <button 
                    onClick={() => { setFilterRating(0); setSearchQuery(''); }}
                    className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-sky-600 hover:text-sky-700"
                  >
                    Clear All Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage;
