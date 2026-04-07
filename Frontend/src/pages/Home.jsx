import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY || 0);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const heroTilt = useMemo(() => clamp(scrollY * 0.03, 0, 12), [scrollY]);
  const heroLift = useMemo(() => clamp(scrollY * 0.15, 0, 40), [scrollY]);
  const dashboardPath = useMemo(() => {
    const normalizedRole = (user?.role || '').toUpperCase();
    return ['STUDENT', 'USER'].includes(normalizedRole)
      ? '/dashboard?tab=profile'
      : '/dashboard';
  }, [user?.role]);

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Course Management',
      desc: 'Access all your courses and materials',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Schedule',
      desc: 'Track classes and deadlines',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community',
      desc: 'Connect and collaborate',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Analytics',
      desc: 'Track your progress',
    },
  ];

  const motionCards = [
    {
      title: 'Live Campus Pulse',
      text: 'Realtime updates from classrooms, labs, and student services.',
      accent: 'from-cyan-500 to-sky-600',
    },
    {
      title: 'Role-Based Intelligence',
      text: 'Every dashboard is personalized for student, teacher, admin, and technician workflows.',
      accent: 'from-blue-600 to-indigo-700',
    },
    {
      title: 'Smart Automation',
      text: 'Streamline bookings, alerts, and operations from one connected platform.',
      accent: 'from-sky-500 to-teal-500',
    },
  ];

  const stats = [
    { num: '10K+', label: 'Active Students' },
    { num: '500+', label: 'Courses' },
    { num: '200+', label: 'Teachers' },
    { num: '98%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e0f2fe,transparent_35%),radial-gradient(circle_at_bottom_left,#bae6fd,transparent_40%),#f8fafc]">
      <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 shadow-sm">
                Smart Campus Experience
              </p>
              <h1 className="mt-5 text-5xl font-black leading-[1.05] text-slate-900 sm:text-6xl">
                Professional Campus Platform
                
              </h1>
              <p className="mt-6 max-w-xl text-lg text-slate-600">
                UNI 360 combines learning, bookings, operations, and role-based dashboards in one modern digital hub.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                {isAuthenticated() ? (
                  <>
                    <Link
                      to={dashboardPath}
                      className="rounded-2xl bg-slate-900 px-7 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open Dashboard
                    </Link>
                    <p className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600">
                      Signed in as <span className="font-semibold text-slate-900">{user?.role}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signup"
                      className="rounded-2xl bg-slate-900 px-7 py-3 font-semibold text-white transition hover:bg-slate-800"
                    >
                      Create Account
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-2xl border border-slate-300 bg-white px-7 py-3 font-semibold text-slate-700 transition hover:border-slate-400"
                    >
                      Sign In
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="[perspective:1200px]">
              <div
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_35px_80px_-35px_rgba(2,132,199,0.35)] transition-transform duration-300"
                style={{
                  transform: `translateY(${-heroLift}px) rotateX(${heroTilt}deg) rotateY(${-heroTilt * 0.45}deg)`,
                }}
              >
                <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-700">Campus Activity Stream</p>
                  <p className="text-xs font-semibold text-emerald-600">Live</p>
                </div>
                <div className="space-y-3">
                  {[
                    'Teacher uploaded new lecture resources',
                    '3 new booking requests pending approval',
                    'System maintenance completed successfully',
                  ].map((item) => (
                    <div key={item} className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Core Platform Features</h2>
              <p className="mt-2 text-slate-500">Built to support every role across a smart campus ecosystem.</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
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
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 p-8 sm:p-10">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Scroll 3D Animation</p>
                <h3 className="mt-2 text-3xl font-bold text-white">Motion that reacts to your scroll</h3>
              </div>
              <p className="max-w-md text-sm text-sky-100">
                As you scroll, these cards rotate and lift in 3D space to create a modern interactive homepage experience.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3 [perspective:1300px]">
              {motionCards.map((card, index) => {
                const depth = clamp((scrollY - 250) * 0.06 - index * 8, -25, 30);
                const rotateX = clamp((scrollY - 120) * 0.015 - index * 3.2, -10, 12);
                const rotateY = clamp(index % 2 === 0 ? depth * 0.35 : -depth * 0.35, -10, 10);

                return (
                  <article
                    key={card.title}
                    className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-transform duration-200"
                    style={{
                      transform: `translateZ(${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
                    }}
                  >
                    <div className={`inline-flex rounded-full bg-gradient-to-r ${card.accent} px-3 py-1 text-xs font-semibold text-white`}>
                      Motion Layer {index + 1}
                    </div>
                    <h4 className="mt-4 text-xl font-semibold text-white">{card.title}</h4>
                    <p className="mt-2 text-sm text-sky-100">{card.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 sm:p-10">
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
            <h3 className="text-3xl font-bold text-slate-900">Ready to modernize your campus workflow?</h3>
            <p className="mx-auto mt-3 max-w-xl text-slate-500">
              Create your UNI 360 account and access smart tools for learning, operations, and collaboration.
            </p>
            <Link
              to="/signup"
              className="mt-7 inline-block rounded-2xl bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Get Started
            </Link>
          </div>
        </section>
      )}

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-10 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">U</div>
            <p className="font-semibold text-slate-900">UNI 360</p>
          </div>
          <p className="text-sm text-slate-500">© 2026 UNI 360 Smart Campus Operations Hub</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
