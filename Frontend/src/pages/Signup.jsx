import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import mediaUpload from '../utils/mediaUpload';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    address: '',
    age: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
  };

  const validateForm = () => {
    if (!formData.name || !formData.username || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      let profileImageUrl = null;
      
      // Upload image to Supabase if selected
      if (profileImage) {
        toast.loading('Uploading profile image...');
        profileImageUrl = await mediaUpload(profileImage);
        toast.dismiss();
      }
      
      await register({ 
        ...formData, 
        age: formData.age ? parseInt(formData.age) : null,
        profileImageUrl 
      });
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || error || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
            Join Our University<br />Community
          </h1>
          <p className="text-sky-200 text-lg leading-relaxed max-w-sm">
            Create your account and start your journey towards academic excellence.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white bg-opacity-10 backdrop-blur-sm">
            <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-medium">Secure & Private</div>
              <div className="text-sky-200 text-sm">Your data is protected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-7/12 items-center justify-center p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-sky-900 to-sky-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">U</span>
            </div>
            <span className="text-sky-900 font-bold text-xl">UNI 360</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-sky-900 mb-2">Create account</h2>
            <p className="text-slate-400">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-6">
              <label className="block text-sm font-medium text-slate-600 mb-3">
                Profile Photo
              </label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-24 h-24 rounded-full object-cover border-4 border-sky-200 shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 rounded-full border-4 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-sky-400 hover:bg-sky-50 transition-all">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-xs text-slate-400 mt-1">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2">Max 5MB (JPG, PNG)</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
              />
            </div>

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
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
              />
            </div>

            {/* Age & Role Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Your age"
                  min="1"
                  max="150"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all cursor-pointer"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your address"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
              />
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
                  placeholder="Create a password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
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
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 outline-none transition-all"
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
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-linear-to-r from-sky-900 to-sky-500 text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-500 font-semibold hover:text-sky-600 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
