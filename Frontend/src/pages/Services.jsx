import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import uni360Logo from '../assets/uni360-logo.svg';
import sliitImg from '../assets/sliit.jpg';
import libImg from '../assets/lib.jpg';
import sliit2Img from '../assets/sliit2.jpg';
import sliit3Img from '../assets/sliit3.jpg';
import sliitLibImg from '../assets/sliitlib.jpg';
import sliitLibAltImg from '../assets/sliitlib.png';

const Services = () => {
  const { isAuthenticated } = useAuth();

  const services = useMemo(() => ([
    {
      title: 'Facility & Room Booking',
      desc: 'Book lecture halls, meeting rooms, labs, and shared spaces with clear availability and approval rules.',
      image: sliitImg,
      tags: ['Availability', 'Approvals', 'Conflict-free'],
      to: '/bookings',
    },
    {
      title: 'Equipment & Asset Booking',
      desc: 'Reserve projectors, cameras, lab kits, and other trackable assets with check-in/out accountability.',
      image: libImg,
      tags: ['Inventory', 'Check-in/out', 'History'],
      to: '/bookings',
    },
    {
      title: 'Fault Reporting & Incidents',
      desc: 'Report facility or IT faults, attach details, and track progress from triage to resolution.',
      image: sliit2Img,
      tags: ['Triage', 'Status updates', 'Closure'],
      to: isAuthenticated() ? '/dashboard' : '/login',
    },
    {
      title: 'Technician Updates & Resolution',
      desc: 'Assign technicians, capture work updates, and close incidents with a complete audit trail.',
      image: sliitLibImg,
      tags: ['Assignments', 'Timeline', 'Accountability'],
      to: isAuthenticated() ? '/dashboard' : '/login',
    },
    {
      title: 'Operations Oversight',
      desc: 'Central dashboards for utilization, recurring issues, and operational transparency across campus.',
      image: sliitLibAltImg,
      tags: ['Dashboards', 'Trends', 'SLA support'],
      to: isAuthenticated() ? '/dashboard' : '/login',
    },
    {
      title: 'Notifications & Communication',
      desc: 'Send targeted notifications to roles or users to keep the campus informed and aligned.',
      image: sliit3Img,
      tags: ['Role targeting', 'Action links', 'Audit'],
      to: isAuthenticated() ? '/notifications/create' : '/login',
    },
  ]), [isAuthenticated]);

  const process = [
    { title: 'Request', desc: 'Create a booking request or fault report with the right details.' },
    { title: 'Review', desc: 'Approvers and admins validate and prioritize work.' },
    { title: 'Execute', desc: 'Technicians update status and record actions taken.' },
    { title: 'Close', desc: 'Resolutions are signed off with time-stamped audit records.' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#e0f2fe,transparent_35%),radial-gradient(circle_at_bottom_left,#bae6fd,transparent_40%),#f8fafc]">
      <section className="px-4 pt-10 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Our Services</h2>
              <p className="mt-2 max-w-2xl text-slate-500">
                Purpose-built modules for bookings and maintenance workflows, designed for role-based access and strong auditability.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <article
                key={s.title}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative h-44 bg-slate-100">
                  <img src={s.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5">
                    <Link
                      to={s.to}
                      className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Open
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-900 via-sky-900 to-slate-900 p-8 sm:p-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Workflow</p>
                <h3 className="mt-2 text-3xl font-bold text-white">A clear operational process</h3>
              </div>
              <p className="max-w-md text-sm text-sky-100">
                A consistent workflow improves accountability and makes it easier to deliver reliable service across campus.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {process.map((p, idx) => (
                <article key={p.title} className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Step {idx + 1}</p>
                  <h4 className="mt-3 text-lg font-semibold text-white">{p.title}</h4>
                  <p className="mt-2 text-sm text-sky-100">{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <h3 className="text-3xl font-bold text-slate-900">Need a single hub for campus operations?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            UNI 360 brings booking workflows and maintenance handling into one auditable platform with role-based access.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/bookings"
              className="rounded-2xl bg-slate-900 px-8 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Start with Bookings
            </Link>
            <Link
              to={isAuthenticated() ? '/dashboard' : '/login'}
              className="rounded-2xl border border-slate-300 bg-white px-8 py-3 font-semibold text-slate-700 transition hover:border-slate-400"
            >
              {isAuthenticated() ? 'Open Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/80 px-4 py-10 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={uni360Logo} alt="UNI 360" className="h-9 w-auto" draggable="false" />
          </div>
          <p className="text-sm text-slate-500">© 2026 UNI 360 Smart University Operations Hub</p>
        </div>
      </footer>
    </div>
  );
};

export default Services;

