import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();

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
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.username || formData.username.trim() === '') {
      newErrors.username = 'Username is required';
      isValid = false;
    }

    if (!formData.password || formData.password.trim() === '') {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ username: true, password: true });

    if (!isValid) {
      // Show toast for empty fields
      const emptyFields = [];
      if (newErrors.username) emptyFields.push('Username');
      if (newErrors.password) emptyFields.push('Password');
      toast.error(`${emptyFields.join(' and ')} ${emptyFields.length > 1 ? 'are' : 'is'} required`);
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(formData);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      // Handle different error types
      const errorData = error.response?.data;
      
      if (errorData?.errors) {
        // Validation errors from backend
        setErrors(errorData.errors);
        const errorMessages = Object.values(errorData.errors).join(', ');
        toast.error(errorMessages || 'Please check your input');
      } else if (error.response?.status === 401) {
        // Invalid credentials
        toast.error('Invalid username or password');
      } else if (error.response?.status === 404) {
        // User not found
        toast.error('User not found. Please check your username');
      } else {
        // Generic error
        toast.error(errorData?.message || 'Login failed. Please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-4 py-3 rounded-xl border-2 bg-white text-slate-800 placeholder-slate-400 focus:ring-4 outline-none transition-all";
    const hasError = touched[fieldName] && errors[fieldName];
    
    if (hasError) {
      return `${baseClass} border-red-400 focus:border-red-400 focus:ring-red-100`;
    }
    return `${baseClass} border-slate-200 focus:border-sky-400 focus:ring-sky-100`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 bg-linear-to-br from-sky-900 via-sky-800 to-sky-500 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white opacity-5" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white opacity-5" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-lg">
              <span className="text-sky-900 font-bold text-xl">U</span>
            </div>
            <span className="text-white font-semibold text-xl tracking-wide">UNI 360</span>
          </div>
          
          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            University Learning<br />& Helping Hub
          </h1>
          <p className="text-sky-200 text-lg leading-relaxed max-w-sm">
            Access courses, connect with peers, and achieve academic excellence.
          </p>
        </div>

        <div className="relative z-10 flex gap-12">
          <div>
            <div className="text-2xl font-bold text-white">10K+</div>
            <div className="text-sky-300 text-sm">Students</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-sky-300 text-sm">Courses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="text-sky-300 text-sm">Satisfaction</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-7/12 items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sky-900 to-sky-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-sky-900 font-bold text-xl">UNI 360</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-sky-900 mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Username <span className="text-red-400">*</span>
              </label>
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
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Password <span className="text-red-400">*</span>
              </label>
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
                <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-linear-to-r from-sky-900 to-sky-500 text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-sky-500 font-semibold hover:text-sky-600 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
