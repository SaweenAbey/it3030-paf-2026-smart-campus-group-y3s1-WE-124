import { useNavigate } from 'react-router-dom';

const RoleSelector = () => {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'Student / Tutor',
      description: 'Access your courses, assignments, and academic resources',
      icon: '👤',
      bgGradient: 'from-blue-500 to-cyan-500',
      path: '/login',
    },
    {
      id: 'manager',
      title: 'Manager Portal',
      description: 'Manage bookings, maintenance, and technician assignments',
      icon: '👨‍💼',
      bgGradient: 'from-emerald-500 to-teal-500',
      path: '/manager-login',
    },
    {
      id: 'admin',
      title: 'Admin Portal',
      description: 'Manage users, resources, and system configuration',
      icon: '🔐',
      bgGradient: 'from-purple-500 to-pink-500',
      path: '/admin-login',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 via-sky-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-blue-600 text-3xl font-bold text-white shadow-lg">
              U
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            UNI 360 Campus Hub
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Select your login portal to get started
          </p>
        </div>

        {/* Role cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => navigate(role.path)}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />

              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-4 text-5xl">{role.icon}</div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {role.title}
                </h2>

                {/* Description */}
                <p className="text-slate-600 mb-6">
                  {role.description}
                </p>

                {/* Button-like text */}
                <div className={`inline-flex items-center gap-2 font-semibold text-white px-6 py-3 rounded-lg bg-gradient-to-r ${role.bgGradient} group-hover:shadow-lg transition-shadow`}>
                  Enter Portal
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
