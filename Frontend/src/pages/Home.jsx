import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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

  const slides = useMemo(() => ([
    { src: sliitImg, alt: 'University campus building exterior' },
    { src: libImg, alt: 'University library and study spaces' },
    { src: sliit2Img, alt: 'University facilities and learning spaces' },
    { src: sliitLibImg, alt: 'University library building' },
    { src: sliitLibAltImg, alt: 'University library interior and collections' },
    { src: sliit3Img, alt: 'University campus operations and facilities' },
  ]), []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [slides.length]);

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e0f2fe,transparent_35%),radial-gradient(circle_at_bottom_left,#bae6fd,transparent_40%),#f8fafc]">
      <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="[perspective:1200px]">
              <div
                className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-[0_35px_80px_-35px_rgba(2,132,199,0.35)] transition-transform duration-300"
              >
                {/* Full-bleed image slider */}
                <div className="relative h-[420px] sm:h-[520px] lg:h-[560px]">
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

                  {/* Overlays for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/15 to-slate-950/10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/35 via-transparent to-transparent" />

                  {/* Hero text overlay */}
                  <div className="absolute left-5 top-5 right-5">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/90 backdrop-blur-md">
                      Welcome to UNI 360
                      <span className="h-1 w-1 rounded-full bg-white/60" />
                      Operations Hub
                    </div>
                    <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                      Smart University Operations Hub
                    </h2>
                    <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
                      Bookings • Maintenance • Incidents • Audit trail
                    </p>
                  </div>

                  {/* Dots */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-end">
                    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveSlide(idx)}
                          className={`h-2.5 rounded-full transition-all ${
                            idx === activeSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/55 hover:bg-white/80'
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Scroll indicator */}
                  <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-md animate-bounce">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                    <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${m.accent} px-3 py-1 text-xs font-semibold text-white`}>
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
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 p-8 sm:p-10">
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

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-10 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
           <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">U</div>
            <p className="font-semibold text-slate-900">UNI 360</p>
          </div>
          <p className="text-sm text-slate-500">© 2026 UNI 360 Smart University Operations Hub</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
