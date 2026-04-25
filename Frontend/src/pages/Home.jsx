import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ScrollBasedVelocity } from '@/components/ui/scroll-based-velocity';
import { reviewAPI } from '../services/api';

import uni360Logo from '../assets/uni360-logo.svg';
import libImg from '../assets/lib.jpg';
import sliitImg from '../assets/sliit.jpg';
import sliit2Img from '../assets/sliit2.jpg';
import sliit3Img from '../assets/sliit3.jpg';
import sliitLibImg from '../assets/sliitlib.jpg';
import sliitLibAltImg from '../assets/sliitlib.png';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const homeRef = useRef(null);

  const slides = useMemo(() => ([
    {
      src: sliitImg,
      alt: 'University campus building exterior',
      tag: 'Campus Intelligence',
      title: 'Run Learning Spaces with Real-Time Clarity',
      description: 'Coordinate classrooms, labs, and student resources with one connected operating layer.',
      metric: '98.7%',
      metricLabel: 'On-time room readiness',
    },
    {
      src: libImg,
      alt: 'University library and study spaces',
      tag: 'Academic Operations',
      title: 'Transform Library & Asset Access into a Seamless Flow',
      description: 'Give students faster access to study areas, digital resources, and support services.',
      metric: '500K+',
      metricLabel: 'Learning assets indexed',
    },
    {
      src: sliit2Img,
      alt: 'University facilities and learning spaces',
      tag: 'Facilities Performance',
      title: 'Book, Approve, and Track Every Space with Confidence',
      description: 'Prevent conflicts and keep capacity visible across departments and student services.',
      metric: '120+',
      metricLabel: 'Smart spaces connected',
    },
    {
      src: sliitLibImg,
      alt: 'University library building',
      tag: 'Service Reliability',
      title: 'Resolve Maintenance Issues Before They Disrupt Learning',
      description: 'Prioritize incidents, assign technicians quickly, and close with a complete audit trail.',
      metric: '< 6h',
      metricLabel: 'Average resolution time',
    },
    {
      src: sliitLibAltImg,
      alt: 'University library interior and collections',
      tag: 'Governance & Insight',
      title: 'Make Every Decision Backed by Trusted Campus Data',
      description: 'Enable role-based dashboards for students, staff, technicians, and administrators.',
      metric: '24/7',
      metricLabel: 'Operational visibility',
    },
    {
      src: sliit3Img,
      alt: 'University campus operations and facilities',
      tag: 'Unified Experience',
      title: 'Deliver One Professional Platform Across the Entire Campus',
      description: 'Unify booking, incidents, notifications, and reporting in a polished digital experience.',
      metric: '4 Roles',
      metricLabel: 'Securely supported',
    },
  ]), []);

  useEffect(() => {
    if (isSliderPaused) return undefined;

    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [isSliderPaused, slides.length]);

  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const fetchHomeReviews = async () => {
      try {
        const response = await reviewAPI.getPublicReviews(6);
        setReviews(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Failed to fetch reviews for home page:', error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchHomeReviews();
  }, []);

  useEffect(() => {
    if (!homeRef.current) return;

    const revealTargets = Array.from(homeRef.current.querySelectorAll('section, article'));

    revealTargets.forEach((el, index) => {
      el.classList.add('reveal-on-scroll');
      el.style.setProperty('--reveal-delay', `${Math.min((index % 8) * 70, 420)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    revealTargets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  const roleKey = useMemo(() => (user?.role || '').toUpperCase(), [user?.role]);
  const dashboardPath = useMemo(() => {
    const normalizedRole = (user?.role || '').toUpperCase();
    return ['STUDENT', 'USER'].includes(normalizedRole)
      ? '/dashboard?tab=profile'
      : '/dashboard';
  }, [user?.role]);

  const opsPath = useMemo(() => {
    if (roleKey === 'TECHNICIAN') return '/dashboard?tab=incidents';
    if (roleKey === 'ADMIN') return '/dashboard';
    return dashboardPath;
  }, [dashboardPath, roleKey]);

  const featurePillars = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Facility & Asset Bookings',
      desc: 'Reserve rooms, labs, and equipment with availability, approvals, and conflict prevention.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      title: 'Maintenance & Incident Handling',
      desc: 'Report faults, assign technicians, track updates, and close resolutions with clear ownership.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2z" />
        </svg>
      ),
      title: 'Role-Based Access',
      desc: 'Students, staff, admins, and technicians see only what they need, with permissions enforced.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l4 4v12a2 2 0 01-2 2z" />
        </svg>
      ),
      title: 'Auditability & Accountability',
      desc: 'Every booking and incident is traceable: who requested, approved, updated, and resolved it.',
    },
  ];

  const primaryModules = [
    {
      title: 'Facility & Asset Bookings',
      subtitle: 'Rooms • Labs • Equipment',
      description:
        'Request and manage bookings with availability checks, approval flows, and reliable scheduling.',
      bullets: ['Availability & conflict prevention', 'Approval workflow (optional)', 'Booking history & audit trail'],
      primaryCta: { label: 'Go to Bookings', to: '/bookings' },
      secondaryCta: { label: 'Open Dashboard', to: dashboardPath },
      accent: 'from-sky-500 to-cyan-600',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Maintenance & Incidents',
      subtitle: 'Fault reports • Assignments • Updates',
      description:
        'Report issues, triage and assign technicians, track progress, and close resolutions with full accountability.',
      bullets: ['Triage → assign → update → resolve', 'Technician status updates', 'Resolution notes with timestamps'],
      primaryCta: { label: 'Open Operations', to: opsPath },
      secondaryCta: { label: 'Create Notification', to: '/notifications/create' },
      accent: 'from-indigo-600 to-sky-600',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 17c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  const workflowSteps = [
    {
      title: 'Request / Report',
      desc: 'Submit a booking request or fault report with location, asset, and details.',
    },
    {
      title: 'Review & Triage',
      desc: 'Approvers validate bookings; admins triage incidents and set priority.',
    },
    {
      title: 'Assign & Execute',
      desc: 'Technicians get assigned, update status, and record actions taken.',
    },
    {
      title: 'Resolve & Audit',
      desc: 'Close with resolution notes. Keep a complete, time-stamped audit trail.',
    },
  ];

  const roleCards = [
    {
      role: 'Students / Staff',
      desc: 'Request bookings, submit fault reports, and track status.',
      tags: ['Create requests', 'View status', 'History'],
    },
    {
      role: 'Approvers / Managers',
      desc: 'Approve bookings, monitor utilization, and enforce policies.',
      tags: ['Approve/deny', 'Oversight', 'Policy'],
    },
    {
      role: 'Technicians',
      desc: 'Manage assigned incidents, updates, and resolutions.',
      tags: ['Assignments', 'Updates', 'Resolutions'],
    },
    {
      role: 'Admins',
      desc: 'Role management, reporting, and audit oversight.',
      tags: ['RBAC', 'Reports', 'Audit'],
    },
  ];

  const stats = [
    { num: 'Bookings', label: 'Requests → Approvals → History' },
    { num: 'Incidents', label: 'Triage → Assign → Resolve' },
    { num: 'RBAC', label: 'Role-based access control' },
    { num: 'Audit', label: 'Traceable actions & timestamps' },
  ];

  return (
    <div ref={homeRef} className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e0f2fe,transparent_35%),radial-gradient(circle_at_bottom_left,#bae6fd,transparent_40%),#f8fafc]">
      <section className="relative overflow-hidden px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-slate-100 shadow-[0_45px_90px_-45px_rgba(2,132,199,0.45)]"
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            <div className="relative h-[70vh] min-h-140 max-h-190 sm:min-h-155">
              {slides.map((s, idx) => (
                <img
                  key={s.src}
                  src={s.src}
                  alt={s.alt}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
                    idx === activeSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
              ))}

              <div className="absolute inset-0 bg-linear-to-r from-[#020617]/80 via-[#0f172a]/40 to-[#020617]/70" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.45),transparent_34%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_100%,rgba(59,130,246,0.28),transparent_40%)]" />

              <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-4 sm:inset-x-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-md sm:px-4">
                  <img src={uni360Logo} alt="UNI360" className="h-6 w-6 rounded-full bg-white/80 p-1" />
                  UNI 360 Campus OS
                </div>
                <div className="hidden rounded-full border border-emerald-300/40 bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-md sm:block">
                  {isSliderPaused ? 'Showcase Paused' : 'Live Status: All Systems Healthy'}
                </div>
              </div>

              <div className="absolute bottom-28 left-5 right-5 grid items-end gap-5 lg:grid-cols-[1fr_auto] sm:left-8 sm:right-8">
                <div className="max-w-2xl rounded-3xl border border-white/20 bg-slate-900/40 p-5 backdrop-blur-lg sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">{slides[activeSlide].tag}</p>
                  <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-[3.25rem] lg:leading-[1.05]">
                    {slides[activeSlide].title}
                  </h1>
                  <p className="mt-3 max-w-lg text-sm text-slate-100/90 sm:text-base">
                    {slides[activeSlide].description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/bookings"
                      className="rounded-2xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-cyan-300"
                    >
                      Explore Resources
                    </Link>
                    <Link
                      to={isAuthenticated() ? dashboardPath : '/login'}
                      className="rounded-2xl border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      {isAuthenticated() ? 'Open Workspace' : 'Sign In'}
                    </Link>
                  </div>

                  <div className="mt-6 overflow-hidden rounded-2xl border border-cyan-200/25 bg-slate-950/45 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/90">Current Slide Insight</p>
                    <div className="mt-2 flex items-end gap-3">
                      <p className="text-3xl font-black leading-none text-white">{slides[activeSlide].metric}</p>
                      <p className="pb-1 text-xs font-medium text-slate-200">{slides[activeSlide].metricLabel}</p>
                    </div>
                  </div>
                </div>

                <div className="grid w-full max-w-70 gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:justify-self-end">
                  {[
                    { label: 'Learning Assets', value: '500K+' },
                    { label: 'Smart Spaces', value: '120+' },
                    { label: 'Avg. Resolution', value: '< 6h' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/20 bg-slate-900/35 p-3.5 text-white backdrop-blur-lg">
                      <p className="text-xs uppercase tracking-widest text-slate-200/80">{item.label}</p>
                      <p className="mt-1 text-[1.7rem] font-black leading-none">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between sm:left-8 sm:right-8">
                <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-slate-900/30 px-3 py-2 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={goToPrevSlide}
                    className="rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                    aria-label="Previous slide"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2.5 rounded-full transition-all ${
                        idx === activeSlide ? 'w-8 bg-cyan-300' : 'w-2.5 bg-white/60 hover:bg-white/90'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={goToNextSlide}
                    className="rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
                    aria-label="Next slide"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-md">
                  {activeSlide + 1} / {slides.length}
                  <svg className="h-4 w-4 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-7 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-sky-300/35 bg-linear-to-r from-slate-900/70 via-sky-950/60 to-slate-900/70 p-5 shadow-xl backdrop-blur-md sm:p-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">Core Capabilities in Motion</p>
              <p className="text-[11px] font-medium text-sky-100/80">Scroll to feel the velocity effect</p>
            </div>

            <ScrollBasedVelocity
              text="Bookings • Learning Hub • Maintenance • Incidents • Role-Based Access • Audit Trail • Notifications • Reports"
              default_velocity={1.2}
              className="font-display text-center text-base font-bold tracking-[-0.01em] text-sky-100 drop-shadow sm:text-xl"
            />
          </div>
        </div>
      </section>

      {/* University Learning Hub Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 bg-linear-to-b from-slate-50 to-blue-50">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Learning Excellence</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">University Learning Hub</h2>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-600">
              Explore comprehensive learning resources, facilities, and support systems designed for student success
            </p>
          </div>

          {/* Learning Resources Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            {[
              {
                title: "Digital Library",
                desc: "Access to 500,000+ academic resources, journals, and e-books available 24/7",
                image: "https://images.unsplash.com/photo-150784272343-583f20270319?w=600&h=400&fit=crop",
                icon: "📚"
              },
              {
                title: "Smart Classrooms",
                desc: "State-of-the-art learning spaces with interactive boards and collaborative tools",
                image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
                icon: "🎓"
              },
              {
                title: "Research Labs",
                desc: "Modern facilities equipped for cutting-edge research and practical learning",
                image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
                icon: "🔬"
              },
              {
                title: "Study Spaces",
                desc: "Dedicated quiet zones and collaborative study areas for all learning styles",
                image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop",
                icon: "✏️"
              },
              {
                title: "Tutoring Center",
                desc: "Expert tutors and peer mentoring programs across all subjects and courses",
                image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
                icon: "👨‍🏫"
              },
              {
                title: "Tech Lab",
                desc: "Computer labs with latest software for coding, design, and digital skills",
                image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop",
                icon: "💻"
              }
            ].map((resource, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300">
                <div className="relative h-48 overflow-hidden bg-linear-to-br from-sky-400 to-sky-600">
                  <img 
                    src={resource.image} 
                    alt={resource.title}
                    className="h-full w-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-4xl">{resource.icon}</div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">{resource.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{resource.desc}</p>
                  <button className="mt-4 inline-block text-sm font-semibold text-sky-600 hover:text-sky-700 transition">
                    Learn More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Reviews & Testimonials Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Verified Reviews</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl"> Support Feedback</h2>
           
          </div>

          <div className="relative">
            {reviewsLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="h-52 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-linear-to-r from-slate-50 to-sky-50 px-6 py-10 text-center">
                <p className="text-base font-semibold text-slate-900">No reviews submitted yet.</p>
                <p className="mt-2 text-sm text-slate-600">Be the first to share your support experience with UNI 360.</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${reviews.length === 1 ? 'mx-auto max-w-xl grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
                {reviews.map((review) => {
                  const date = review.createdAt
                    ? new Date(review.createdAt).toLocaleDateString()
                    : 'Recently';
                  const initials = (review.userName || review.username || 'U')
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0]?.toUpperCase())
                    .join('');

                  return (
                    <article
                      key={review.id}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-linear-to-b from-white to-slate-50 p-6 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_50px_-28px_rgba(2,132,199,0.35)]"
                    >
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {review.userProfileImageUrl ? (
                            <img
                              src={review.userProfileImageUrl}
                              alt={review.userName || review.username}
                              className="h-12 w-12 rounded-full border border-sky-100 object-cover ring-2 ring-white"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-sky-700 to-cyan-500 text-sm font-bold text-white ring-2 ring-white">
                              {initials || 'U'}
                            </div>
                          )}
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">{review.userName || review.username}</h3>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">{review.userRole}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-500 transition-colors group-hover:bg-sky-100 group-hover:text-sky-600">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M7.17 6A5.99 5.99 0 0 0 3 11.74V18h6.26v-6.26H6.3A3.01 3.01 0 0 1 8.78 9.3L10 9.09V6H7.17Zm9 0A5.99 5.99 0 0 0 12 11.74V18h6.26v-6.26H15.3a3.01 3.01 0 0 1 2.48-2.44L19 9.09V6h-2.83Z" />
                            </svg>
                          </span>
                          <p className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">{date}</p>
                        </div>
                      </div>

                      <div className="mb-4 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold tracking-wide text-amber-600">{'★'.repeat(Math.max(1, Math.min(5, review.rating || 5)))}</p>
                        {review.supportTopic ? (
                          <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-cyan-700">
                            {review.supportTopic}
                          </span>
                        ) : null}
                      </div>

                      <h4 className="text-lg font-bold leading-snug text-slate-900">{review.title}</h4>
                      <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-12 text-center">
            <Link 
              to="/reviews" 
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 text-sm font-black text-white transition hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-100"
            >
              <span>Explore All Verified Reviews</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Start with the two core workflows</h2>
              <p className="mt-2 max-w-2xl text-slate-500">
                Navigate by outcomes: book resources or resolve issues. Everything else is supporting workflow and audit.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {primaryModules.map((m) => (
              <article key={m.title} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className={`inline-flex items-center gap-2 rounded-full bg-linear-to-r ${m.accent} px-3 py-1 text-xs font-semibold text-white`}>
                      <span className="inline-flex">{m.icon}</span>
                      {m.subtitle}
                    </div>
                    <h3 className="mt-4 text-2xl font-bold text-slate-900">{m.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{m.description}</p>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  {m.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={m.primaryCta.to}
                    className="rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    {m.primaryCta.label}
                  </Link>
                  <Link
                    to={isAuthenticated() ? m.secondaryCta.to : '/login'}
                    className="rounded-2xl border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
                  >
                    {isAuthenticated() ? m.secondaryCta.label : 'Sign in for access'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Built for Operations, Not Just Pages</h2>
              <p className="mt-2 text-slate-500">Clear workflows, role-based access, and a complete record of decisions and updates.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featurePillars.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sky-700">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{feature.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-slate-200 bg-linear-to-br from-slate-900 via-sky-900 to-slate-900 p-8 sm:p-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Workflow-first</p>
                <h3 className="mt-2 text-3xl font-bold text-white">From request to resolution</h3>
              </div>
              <p className="max-w-md text-sm text-sky-100">
                Bookings and incidents follow predictable, auditable steps so teams can move faster without losing control.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              {workflowSteps.map((step, idx) => (
                <article key={step.title} className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Step {idx + 1}</p>
                  <h4 className="mt-3 text-lg font-semibold text-white">{step.title}</h4>
                  <p className="mt-2 text-sm text-sky-100">{step.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Role-based access by design</h3>
              <p className="mt-2 max-w-2xl text-slate-500">
                Each role gets the right view and actions. This reduces mistakes, speeds up workflows, and strengthens governance.
              </p>
            </div>
            <Link
              to={isAuthenticated() ? opsPath : '/login'}
              className="rounded-2xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {isAuthenticated() ? 'Open My Workspace' : 'Sign in to continue'}
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {roleCards.map((r) => (
              <article key={r.role} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h4 className="text-lg font-semibold text-slate-900">{r.role}</h4>
                <p className="mt-2 text-sm text-slate-600">{r.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.tags.map((t) => (
                    <span key={t} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
          <div className="mb-8 grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">Auditability you can trust</h3>
              <p className="mt-2 text-slate-500">
                Every operation leaves a trail: requester, approvals, technician updates, timestamps, and closure notes. This supports compliance, accountability, and post-incident learning.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Audit fields</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>• Who created / approved / updated</li>
                <li>• When each status changed</li>
                <li>• What was changed (before/after)</li>
                <li>• Resolution summary and evidence</li>
              </ul>
            </div>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-slate-50 p-6 text-center">
                <p className="text-4xl font-black text-slate-900">{stat.num}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!isAuthenticated() && (
        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <h3 className="text-3xl font-bold text-slate-900">Ready to modernize campus operations?</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Sign in to manage bookings, report incidents, and keep a complete operational record across facilities and assets.
            </p>
            <Link
              to="/login"
              className="mt-7 inline-block rounded-2xl bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Sign In to Continue
            </Link>
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
