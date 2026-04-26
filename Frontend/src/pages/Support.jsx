import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const supportChannels = [
  {
    title: 'Platform Support Desk',
    description: 'Get help with account access, role permissions, and workspace navigation.',
    eta: 'Response target: under 4 hours',
  },
  {
    title: 'Booking & Facility Support',
    description: 'Resolve booking conflicts, room availability issues, and resource scheduling concerns.',
    eta: 'Response target: same day',
  },
  {
    title: 'Technical Incident Support',
    description: 'Report system issues, outages, and operational blockers for immediate triage.',
    eta: 'Priority incidents: under 1 hour',
  },
];

const Support = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_90%_10%,#dbeafe,transparent_28%),radial-gradient(circle_at_0%_100%,#cffafe,transparent_32%),#f8fafc] px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_90px_-50px_rgba(2,132,199,0.5)]">
          <div className="bg-gradient-to-r from-slate-900 via-sky-900 to-slate-900 px-7 py-10 sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">Support Center</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
              Campus Support and Review Hub
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-sky-100 sm:text-base">
              Contact support for operations help and share your platform review. Real student feedback is now published on the home page.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to={isAuthenticated() ? '/support/review' : '/login'}
                className="rounded-2xl bg-cyan-300 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-cyan-200"
              >
                {isAuthenticated() ? 'Write a Review' : 'Sign In to Add Review'}
              </Link>
              <Link
                to="/reviews"
                className="rounded-2xl border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                View All Reviews
              </Link>
              <Link
                to="/"
                className="rounded-2xl border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="grid gap-5 p-7 sm:grid-cols-2 sm:p-10 lg:grid-cols-3">
            {supportChannels.map((channel) => (
              <article
                key={channel.title}
                className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50 to-white p-5 shadow-sm"
              >
                <h2 className="text-lg font-bold text-slate-900">{channel.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{channel.description}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-sky-700">{channel.eta}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
