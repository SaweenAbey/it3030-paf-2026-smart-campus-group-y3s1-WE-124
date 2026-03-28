import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
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
  const [challengePhone, setChallengePhone] = useState('');

  const { login, verifyLoginOtp, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google login failed. Missing credential token');
      return;
    }

    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Signed in with Google');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
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

  const maskPhone = (phone) => {
    if (!phone || phone.length < 4) return '******';
    return `******${phone.slice(-4)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (!otpStep) {
        const result = await login({ username: formData.username, password: formData.password });

        if (result?.otpRequired) {
          setOtpStep(true);
          setChallengeUser(result.username || formData.username);
          setChallengePhone(maskPhone(result.phoneNumber));
          setFormData((prev) => ({ ...prev, otp: '' }));
          setTouched({});
          setErrors({});
          toast.success('OTP sent to your registered phone number');
        } else if (result?.token) {
          toast.success('Welcome back!');
          navigate('/dashboard');
        }
      } else {
        await verifyLoginOtp({
          username: challengeUser || formData.username,
          otp: formData.otp.trim(),
        });
        toast.success('Login successful');
        navigate('/dashboard');
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
    return `${baseClass} border-slate-300 focus:border-sky-500 focus:ring-sky-100`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-100 via-sky-50 to-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-sky-300/25 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-[42%_58%]">
        <section className="hidden bg-gradient-to-br from-slate-900 via-sky-900 to-sky-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-slate-900">U</div>
              <span className="text-xl font-semibold tracking-wide">UNI 360</span>
            </div>
            <h1 className="mt-14 text-4xl font-bold leading-tight">Secure sign in for your campus workspace</h1>
            <p className="mt-4 max-w-xs text-sky-100">
              Access your personalized dashboard, notifications, and role-based tools.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-white/10 px-2 py-3">
              <p className="text-xl font-bold">10K+</p>
              <p className="text-xs text-sky-100">Students</p>
            </div>
            <div className="rounded-xl bg-white/10 px-2 py-3">
              <p className="text-xl font-bold">500+</p>
              <p className="text-xs text-sky-100">Courses</p>
            </div>
            <div className="rounded-xl bg-white/10 px-2 py-3">
              <p className="text-xl font-bold">98%</p>
              <p className="text-xs text-sky-100">Satisfaction</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">{otpStep ? 'Verify OTP' : 'Sign In'}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {otpStep
                  ? `Enter the 6-digit code sent to ${challengePhone || 'your registered phone'}`
                  : 'Welcome back. Continue to your account.'}
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
                    placeholder="Enter your username"
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
                      className={`${getInputClassName('password')} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                <label className="mb-2 block text-sm font-medium text-slate-700">One-Time Password</label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
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

                <button
                  type="button"
                  onClick={backToCredentialsStep}
                  className="mt-3 text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  Use a different account
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {otpStep ? 'Verifying OTP...' : 'Signing in...'}
                </>
              ) : (
                otpStep ? 'Verify OTP' : 'Sign In'
              )}
            </button>
          </form>

            {!otpStep && (
              <>
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs uppercase tracking-wide text-slate-400">or continue with</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google login cancelled or failed')}
                    useOneTap={false}
                    theme="outline"
                    size="large"
                    shape="pill"
                  />
                </div>
              </>
            )}

            <p className="mt-7 text-center text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-semibold text-sky-600 transition hover:text-sky-700">
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
