import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence, useSpring } from 'framer-motion';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Globe, 
  Users, 
  Calendar, 
  Layers, 
  Sparkles, 
  Clock, 
  ChevronRight,
  Monitor,
  Layout,
  Database,
  Lock,
  ArrowUpRight,
  Activity,
  Box,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScrollBasedVelocity } from '@/components/ui/scroll-based-velocity';
import { reviewAPI } from '../services/api';

// Assets
import uni360Logo from '../assets/uni360-logo.svg';
import libImg from '../assets/lib.jpg';
import sliitImg from '../assets/sliit.jpg';
import sliit2Img from '../assets/sliit2.jpg';
import sliit3Img from '../assets/sliit3.jpg';
import sliitLibImg from '../assets/sliitlib.jpg';
import sliitLibAltImg from '../assets/sliitlib.png';

const CheckCircle2 = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="3">
    <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GlowingBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <motion.div 
      animate={{ 
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.4, 0.3]
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      style={{ willChange: 'transform, opacity' }}
      className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-sky-400/15 blur-[120px] rounded-full"
    />
    <motion.div 
      animate={{ 
        scale: [1.1, 1, 1.1],
        opacity: [0.2, 0.3, 0.2]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ willChange: 'transform, opacity' }}
      className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] bg-indigo-500/10 blur-[120px] rounded-full"
    />
  </div>
);

const SectionHeading = ({ tag, title, description, light = false }) => (
  <div className="mb-16">
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${light ? 'border-white/20 bg-white/10 text-sky-300' : 'border-sky-100 bg-sky-50 text-sky-600'} mb-6`}
    >
      <Sparkles className="w-3 h-3" />
      <span className="text-[9px] font-black uppercase tracking-[0.2em]">{tag}</span>
    </motion.div>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`text-4xl sm:text-6xl font-black tracking-tighter leading-[0.95] mb-6 ${light ? 'text-white' : 'text-slate-900'}`}
    >
      {title}
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className={`max-w-xl text-lg font-medium leading-relaxed ${light ? 'text-slate-400' : 'text-slate-500'}`}
    >
      {description}
    </motion.p>
  </div>
);

const BentoCard = ({ title, desc, icon: Icon, className, color }) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.01 }}
    className={`group relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-500 ${className}`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
    <div className="relative z-10 flex flex-col h-full">
      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform">
        <Icon className="w-6 h-6 text-slate-900" />
      </div>
      <h3 className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tight mb-3">{title}</h3>
      <p className="text-slate-500 group-hover:text-white/80 transition-colors text-sm font-medium leading-relaxed">
        {desc}
      </p>
      <div className="mt-auto pt-8 flex items-center gap-2 text-slate-900 group-hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">
        Learn More <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </motion.div>
);

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  // Performance optimization: Removed expensive backgroundColor transform
  // const bgColor = useTransform(smoothProgress, [0, 0.3, 0.6, 0.9], ["#FAFAFA", "#EEF2FF", "#F0FDFA", "#FAFAFA"]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await reviewAPI.getPublicReviews(6);
        setReviews(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen bg-slate-50 font-sans selection:bg-sky-200"
    >
      <GlowingBackground />

      {/* Hero: Irregular Geometry Style */}
      <section className="relative min-h-screen flex items-center pt-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
          
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="px-4 py-1.5 bg-slate-900 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                NEW ERA
              </div>
              <div className="w-12 h-[1px] bg-slate-300" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">UNI360 PLATFORM v3.0</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-7xl sm:text-9xl font-black text-slate-900 tracking-tighter leading-[0.85] mb-8"
            >
              CRAFTING <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">SMART</span> <br />
              CAMPUSES
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-500 max-w-xl mb-12 font-medium leading-relaxed"
            >
              Experience a paradigm shift in campus operations. Unified intelligence for space, assets, and infrastructure in one stunning interface.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-6"
            >
              <Link to="/bookings" className="group relative h-16 px-10 bg-slate-900 text-white rounded-full flex items-center gap-4 overflow-hidden shadow-2xl transition-all active:scale-95">
                <span className="relative z-10 text-xs font-black uppercase tracking-[0.2em]">Get Started</span>
                <div className="relative z-10 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-sky-400 transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:text-slate-900 transition-colors" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <button className="h-16 px-10 border-2 border-slate-200 rounded-full text-xs font-black uppercase tracking-[0.2em] text-slate-900 hover:border-sky-400 hover:text-sky-600 transition-all active:scale-95">
                View Demo
              </button>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "circOut" }}
              className="relative aspect-square w-full"
            >
              {/* Irregular Shape Container */}
              <div 
                className="absolute inset-0 bg-slate-900 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)]"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 90%, 0 100%, 0 10%)' }}
              >
                <img 
                  src={sliitImg} 
                  alt="Hero" 
                  style={{ willChange: 'transform' }}
                  className="w-full h-full object-cover opacity-60 hover:scale-110 transition-transform duration-[10s]" 
                />
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-indigo-600/30" />
                
                <div className="absolute top-10 left-10 right-10">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-slate-900" />
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                      <span className="text-[9px] font-black text-white uppercase tracking-widest">Active Ops</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 w-32 h-32 bg-white rounded-[2rem] shadow-2xl flex flex-col items-center justify-center p-4 border border-slate-100"
              >
                <div className="text-3xl font-black text-sky-600">98%</div>
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center mt-1">Uptime</div>
              </motion.div>

              <motion.div 
                animate={{ x: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 px-6 py-4 bg-white rounded-[1.5rem] shadow-2xl flex items-center gap-3 border border-slate-100"
              >
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Instant Booking</span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid: The Uncommon Dive */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeading 
            tag="THE ECOSYSTEM"
            title="Unified Campus Control"
            description="Our modular architecture adapts to your needs. One platform, infinite possibilities."
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <BentoCard 
              title="Space Hub" 
              desc="Next-gen resource management for labs, halls and equipment."
              icon={Box}
              className="md:col-span-2 bg-white border-slate-100"
              color="from-sky-600 to-sky-400"
            />
            <BentoCard 
              title="Incident AI" 
              desc="Intelligent fault tracking and resolution workflow."
              icon={Activity}
              className="bg-white border-slate-100"
              color="from-indigo-600 to-indigo-400"
            />
            <BentoCard 
              title="Security" 
              desc="Enterprise-grade RBAC for every user role."
              icon={Fingerprint}
              className="bg-white border-slate-100"
              color="from-slate-900 to-slate-700"
            />
            
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="md:col-span-4 h-64 bg-slate-900 rounded-[3rem] overflow-hidden group relative flex items-center px-12"
            >
              <img src={libImg} className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt="" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent" />
              <div className="relative z-10 max-w-lg">
                <h3 className="text-3xl font-black text-white tracking-tight mb-4">Deep Learning Integration</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">Access our digital archive of 500,000+ academic resources synced across all devices.</p>
                <button className="text-sky-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                  Browse Catalogue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Showcase: Parallax Scroll */}
      <section className="relative py-40 px-6 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <SectionHeading 
              light
              tag="REAL-TIME MONITORING"
              title="Visualize Your Operations"
              description="Monitor campus health, track incidents, and oversee facility utilization in high fidelity."
            />
            <div className="space-y-12">
              {[
                { title: "Live Feed", desc: "Real-time updates for all campus critical systems." },
                { title: "Role Isolation", desc: "Dedicated views for technicians and managers." },
                { title: "Audit Trail", desc: "Every action logged with permanent cryptographic verification." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-sky-500 group-hover:border-sky-400 transition-all duration-500">
                    <Zap className="w-5 h-5 text-sky-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white tracking-tight mb-2 uppercase">{item.title}</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative">
            <motion.div 
              style={{ rotateX: 10, rotateY: -10 }}
              className="relative z-10 rounded-[3rem] border border-white/20 bg-white/5 p-4 backdrop-blur-md shadow-2xl"
            >
              <div className="rounded-[2.2rem] overflow-hidden bg-slate-800 aspect-video group">
                <img 
                  src={sliitLibAltImg} 
                  style={{ willChange: 'transform' }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[15s]" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-10 left-10">
                  <div className="text-white text-3xl font-black italic">UI/UX v3.0</div>
                </div>
              </div>
            </motion.div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-500/30 blur-[100px] rounded-full" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/20 blur-[100px] rounded-full" />
          </div>
        </div>
      </section>

      {/* Reviews: The Moving Wall */}
      <section className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">Validated by Campus</h2>
            <div className="h-2 w-32 bg-sky-500 mx-auto rounded-full" />
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (i % 3) * 0.1 }}
                className="break-inside-avoid p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl group-hover:bg-sky-500 transition-colors">
                    {review.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 uppercase tracking-tight">{review.userName || 'Anonymous'}</h4>
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">{review.userRole}</p>
                  </div>
                </div>
                <p className="text-slate-500 font-medium italic leading-relaxed text-sm">"{review.comment}"</p>
                <div className="mt-6 flex text-amber-400 gap-1">
                   {Array.from({ length: 5 }).map((_, idx) => (
                      <span key={idx} className={idx < (review.rating || 5) ? 'opacity-100' : 'opacity-20'}>★</span>
                   ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: Final Impact */}
      <section className="pb-40 px-6">
        <div className="max-w-7xl mx-auto relative rounded-[5rem] overflow-hidden group">
          <div className="absolute inset-0 bg-slate-900" />
          <img src={sliit3Img} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-110 transition-transform duration-[20s]" alt="" />
          <div className="absolute inset-0 bg-gradient-to-br from-sky-600/40 via-transparent to-indigo-600/40" />
          
          <div className="relative z-10 px-8 py-24 lg:py-32 text-center">
            <motion.h2 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="text-5xl sm:text-8xl font-black text-white tracking-tighter leading-[0.8] mb-12 uppercase italic"
            >
              Future Proof <br />
              Your Campus
            </motion.h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <Link to="/signup" className="px-12 py-6 bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-sky-400 hover:scale-105 active:scale-95 transition-all">
                Launch My Workspace
              </Link>
              {!isAuthenticated() && (
                <Link to="/login" className="text-white font-black text-[10px] uppercase tracking-[0.3em] hover:text-sky-400 transition-colors border-b-2 border-transparent hover:border-sky-400 pb-1">
                  Access Portal
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Global Activity indicator */}
      <div className="fixed bottom-10 right-10 z-[60] pointer-events-none">
        <motion.div 
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          className="bg-white/80 backdrop-blur-md border border-slate-200 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4"
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest whitespace-nowrap">Global Nodes Active</span>
        </motion.div>
      </div>

    </div>
  );
};

export default Home;
