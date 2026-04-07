import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [otpStep, setOtpStep] = useState(false);
  const [challengeUser, setChallengeUser] = useState('');
  const [challengeEmail, setChallengeEmail] = useState('');

  const { login, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';
    if (!value || value.trim() === '') {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }
    if (name === 'otp' && value && !/^\d{6}$/.test(value)) {
      error = 'OTP must be a 6-digit code';
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!otpStep) {
      if (!formData.username || formData.username.trim() === '') {
        newErrors.username = 'Username is required';
        isValid = false;
      }

      if (!formData.password || formData.password.trim() === '') {
        newErrors.password = 'Password is required';
        isValid = false;
      }
    } else {
      if (!formData.otp || formData.otp.trim() === '') {
        newErrors.otp = 'OTP is required';
        isValid = false;
      } else if (!/^\d{6}$/.test(formData.otp.trim())) {
        newErrors.otp = 'OTP must be a 6-digit code';
        isValid = false;
      }
    }

    setErrors(newErrors);
    setTouched(otpStep ? { otp: true } : { username: true, password: true });

    if (!isValid) {
      toast.error('Please complete the required fields');
    }

    return isValid;
  };

  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return 'your registered email';
    const [local, domain] = email.split('@');
    const prefix = local.length <= 2 ? local.charAt(0) : local.slice(0, 2);
    return `${prefix}***@${domain}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (!otpStep) {
        const result = await login({ username: formData.username, password: formData.password });

        // Check if user is admin or technician
        if (result?.role && !['ADMIN', 'TECHNICIAN'].includes(result.role)) {
          toast.error('Admin Portal: Only ADMIN and TECHNICIAN accounts can access here');
          setLoading(false);
          return;
        }

        if (result?.otpRequired) {
          setOtpStep(true);
          setChallengeUser(result.username || formData.username);
          setChallengeEmail(maskEmail(result.email));
          setFormData((prev) => ({ ...prev, otp: '' }));
          setTouched({});
          setErrors({});
          toast.success('OTP sent to your registered email');
        } else if (result?.token) {
          toast.success('Welcome to Admin Portal!');
          navigate('/admin-dashboard');
        }
      } else {
        const verified = await verifyLoginOtp({
          username: challengeUser || formData.username,
          otp: formData.otp.trim(),
        });

        // Check role again
        if (verified?.role && !['ADMIN', 'TECHNICIAN'].includes(verified.role)) {
          toast.error('Admin Portal: Only ADMIN and TECHNICIAN accounts can access here');
          setLoading(false);
          return;
        }

        toast.success('Welcome to Admin Portal!');
        navigate('/admin-dashboard');
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.errors) {
        setErrors(errorData.errors);
        const errorMessages = Object.values(errorData.errors).join(', ');
        toast.error(errorMessages || 'Please check your input');
      } else if (error.response?.status === 401) {
        toast.error(otpStep ? 'Invalid or expired OTP' : 'Invalid username or password');
      } else if (error.response?.status === 404) {
        toast.error('User not found. Please check your username');
      } else {
        toast.error(errorData?.message || 'Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const backToCredentialsStep = () => {
    setOtpStep(false);
    setFormData((prev) => ({ ...prev, otp: '' }));
    setErrors({});
    setTouched({});
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full rounded-xl border bg-white px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:ring-4";
    const hasError = touched[fieldName] && errors[fieldName];
    
    if (hasError) {
      return `${baseClass} border-red-400 focus:border-red-400 focus:ring-red-100`;
    }
    return `${baseClass} border-slate-300 focus:border-purple-500 focus:ring-purple-100`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 via-purple-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-purple-300/25 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[42%_58%]">
        <section className="hidden bg-gradient-to-br from-slate-900 via-purple-900 to-purple-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-purple-900">🔐</div>
              <span className="text-xl font-semibold tracking-wide">Admin Portal</span>
            </div>
            <h1 className="mt-14 text-4xl font-bold leading-tight">Secure Administration Dashboard</h1>
            <p className="mt-4 max-w-xs text-purple-100">
              Manage campus operations, users, and system resources with elevated privileges.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/10 px-2 py-3">
              <p className="text-xl font-bold">100%</p>
              <p className="text-xs text-purple-100">Secure</p>
            </div>
            <div className="rounded-xl bg-white/10 px-2 py-3">
              <p className="text-xl font-bold">24/7</p>
              <p className="text-xs text-purple-100">Available</p>
            </div>
            <div className="rounded-xl bg-white/10 px-2 py-3">
              <p className="text-xl font-bold">∞</p>
              <p className="text-xs text-purple-100">Control</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">{otpStep ? 'Verify Identity' : 'Admin Sign In'}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {otpStep
                  ? `Enter the 6-digit code sent to ${challengeEmail || 'your registered email'}`
                  : 'Access the administration panel with your credentials.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!otpStep && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your admin username"
                      className={getInputClassName('username')}
                    />
                    {touched.username && errors.username && (
                      <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Enter your password"
                        className={getInputClassName('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" fillRule="evenodd" />
                            <path d="M15.171 13.576l1.474 1.474a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.014 10.014 0 00.458 10c1.274 4.057 5.064 7 9.542 7 2.04 0 3.991-.588 5.631-1.609z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {touched.password && errors.password && (
                      <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.password}
                      </p>
                    )}
                  </div>
                </>
              )}

              {otpStep && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">One-Time Password (OTP)</label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    className={getInputClassName('otp')}
                  />
                  {touched.otp && errors.otp && (
                    <p className="mt-1.5 flex items-center gap-1 text-sm text-red-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.otp}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 py-3 font-semibold text-white transition hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : (otpStep ? 'Verify OTP' : 'Sign In')}
              </button>
            </form>

            {otpStep && (
              <button
                type="button"
                onClick={backToCredentialsStep}
                className="w-full mt-3 text-sm text-slate-600 hover:text-slate-900 transition"
              >
                ← Back to credentials
              </button>
            )}

            <div className="mt-6 text-center text-sm text-slate-600">
              <Link to="/" className="font-semibold text-purple-600 hover:text-purple-700 transition">
                Back to role selector
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminLogin;
