import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user, isAuthenticated } = useAuth();

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

  const stats = [
    { num: '10K+', label: 'Active Students' },
    { num: '500+', label: 'Courses' },
    { num: '200+', label: 'Teachers' },
    { num: '98%', label: 'Satisfaction' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-sky-900/5 via-transparent to-sky-400/5" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-sky-400 opacity-10 blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-sky-900 opacity-10 blur-3xl -translate-x-1/2 translate-y-1/2" />
        
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm mb-8">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-slate-600">Smart Campus Operations Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-sky-900 leading-tight mb-6">
              Welcome to{' '}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-900 to-sky-400">
                UNI 360
              </span>
            </h1>
            
            <p className="text-xl text-slate-500 leading-relaxed mb-10">
              Your complete university learning and helping hub. Access courses, 
              connect with peers, and achieve academic excellence.
            </p>

            {isAuthenticated() ? (
              <div className="inline-flex items-center gap-4 p-6 rounded-2xl bg-white border border-slate-100 shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-sky-900 to-sky-400 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-left">
                  <div className="text-xl font-semibold text-sky-900">Welcome, {user?.name}!</div>
                  <div className="text-slate-400">{user?.role}</div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 rounded-xl bg-linear-to-r from-sky-900 to-sky-500 text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 rounded-xl bg-white text-sky-900 font-semibold border-2 border-slate-200 hover:border-sky-400 transition-all"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-sky-900 mb-4">Everything You Need</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              All the tools for a successful academic journey in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group p-6 rounded-2xl bg-white border border-slate-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sky-100 to-sky-50 flex items-center justify-center text-sky-700 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-sky-900 mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl bg-linear-to-r from-sky-900 to-sky-500 p-12 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-4 left-4 w-32 h-32 rounded-full border border-white opacity-20" />
              <div className="absolute bottom-4 right-4 w-48 h-48 rounded-full border border-white opacity-20" />
            </div>
            
            <div className="relative grid md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.num}</div>
                  <div className="text-sky-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated() && (
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-sky-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-500 mb-8">
              Join thousands of students already using UNI 360
            </p>
            <Link
              to="/signup"
              className="inline-block px-10 py-4 rounded-xl bg-linear-to-r from-sky-900 to-sky-500 text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-sky-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white bg-opacity-10 flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-white font-semibold text-lg">UNI 360</span>
            </div>
            <p className="text-sky-300 text-sm">
              © 2026 UNI 360 - Smart Campus Operations Hub
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
