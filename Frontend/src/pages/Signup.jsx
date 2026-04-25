import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import mediaUpload from '../utils/mediaUpload';
import toast from 'react-hot-toast';

const PASSWORD_MIN_LENGTH = 8;

const getPasswordRules = (password) => ({
  minLength: password.length >= PASSWORD_MIN_LENGTH,
  uppercase: /[A-Z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});

const isPasswordValid = (password) => {
  const r = getPasswordRules(password);
  return r.minLength && r.uppercase && r.number && r.special;
};

/** Derive a login-safe username from the email local part (before @). */
const usernameFromEmail = (email) => {
  const raw = (email || '').trim().split('@')[0] || '';
  let s = raw.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
  if (s.startsWith('.')) s = s.replace(/^\./, '');
  if (s.length > 32) s = s.slice(0, 32);
  return s;
};

const inputClass =
  'w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100/80';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  /** When true, username stays in sync with the email local-part. */
  const [usernameFollowsEmail, setUsernameFollowsEmail] = useState(true);
  const fileInputRef = useRef(null);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const passwordRules = useMemo(() => getPasswordRules(formData.password), [formData.password]);
  const passwordOk = useMemo(
    () => isPasswordValid(formData.password),
    [formData.password]
  );
  const passwordsMatch =
    formData.password.length > 0 && formData.password === formData.confirmPassword;

  const validateStep1 = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.username.trim()) {
      toast.error('Please enter your name, email, and username');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    const sliitEmailRegex = /^it\d+@my\.sliit\.lk$/;
    if (!sliitEmailRegex.test(formData.email)) {
      toast.error('Email must be a valid IT number format (e.g., it23748330@my.sliit.lk)');
      return false;
    }
    // Username is derived from email; still ensure it is usable
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phoneNumber.trim() || !phoneRegex.test(formData.phoneNumber)) {
      toast.error('Telephone number must be exactly 10 digits');
      return false;
    }
    if (!formData.role) {
      toast.error('Please select a role');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!isPasswordValid(formData.password)) {
      toast.error('Password must meet all requirements');
      return false;
    }
    if (!passwordsMatch) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!validateStep3()) return;
      setStep(4);
      return;
    }
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleGoogleSignup = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google sign up failed. Missing credential token');
      return;
    }

    setLoading(true);
    try {
      await loginWithGoogle(credentialResponse.credential);
      toast.success('Account ready with Google');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Google sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'username') {
      setUsernameFollowsEmail(false);
      setFormData((prev) => ({ ...prev, username: value }));
      return;
    }

    if (name === 'email') {
      setFormData((prev) => {
        const next = { ...prev, email: value };
        if (usernameFollowsEmail) {
          next.username = usernameFromEmail(value);
        }
        return next;
      });
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resyncUsernameFromEmail = () => {
    setUsernameFollowsEmail(true);
    setFormData((prev) => ({ ...prev, username: usernameFromEmail(prev.email) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedImageFile(null);
      setImagePreviewUrl('');
      return;
    }

    const isSupportedType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!isSupportedType) {
      toast.error('Please select a JPG, PNG, or WEBP image');
      e.target.value = '';
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error('Image size should be less than 5MB');
      e.target.value = '';
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const syntheticEvent = {
      target: {
        files: [file],
        value: '',
      },
    };

    handleImageChange(syntheticEvent);
  };

  const handleRemoveImage = (e) => {
    e?.stopPropagation?.();
    setSelectedImageFile(null);
    setImagePreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.username || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    const sliitEmailRegex = /^it\d+@my\.sliit\.lk$/;
    if (!sliitEmailRegex.test(formData.email)) {
      toast.error('Email must be a valid IT number format (e.g., it23748330@my.sliit.lk)');
      return false;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error('Telephone number must be exactly 10 digits');
      return false;
    }
    if (!isPasswordValid(formData.password)) {
      toast.error('Password must meet every requirement below');
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
      let profileImageUrl = '';
      if (selectedImageFile) {
        try {
          profileImageUrl = await mediaUpload(selectedImageFile);
        } catch (uploadError) {
          console.warn('Profile image upload skipped:', uploadError?.message || uploadError);
          profileImageUrl = '';
        }
      }

      const result = await register({
        ...formData,
        profileImageUrl,
      });
      toast.success(result?.message || 'Account created! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-sky-50/40 to-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-cyan-200/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-px w-[min(80%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-200/60 to-transparent" />
      </div>

      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl overflow-hidden rounded-[2rem] border border-sky-100/60 bg-white/90 shadow-2xl shadow-sky-200/30 backdrop-blur-sm lg:grid-cols-[minmax(0,44%)_1fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-700 via-sky-600 to-cyan-600 p-10 text-white lg:flex">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute -right-10 top-20 h-40 w-40 rounded-full border border-white/20" />
            <div className="absolute -bottom-6 left-10 h-56 w-56 rounded-full border border-white/10" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/95 text-xl font-bold text-sky-700 shadow-lg shadow-sky-900/20">
                U
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight">UNI 360</span>
                <p className="text-xs font-medium text-sky-100">Smart Campus Hub</p>
              </div>
            </div>
            <h1 className="mt-12 text-4xl font-bold leading-[1.15] tracking-tight">
              Create your campus account in minutes
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-sky-50">
              Secure sign-up, role-based access, and a dashboard tailored for students and tutors.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md">
            <p className="text-sm font-medium text-white">Tip</p>
            <p className="mt-1 text-sm text-sky-50">
              Your username is generated from your email—you can change it anytime before registering.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8 lg:p-10 lg:py-12">
          <div className="w-full max-w-lg">
            <div className="mb-8 text-center lg:text-left">
              <span className="inline-flex rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-700">
                New member
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Create account</h2>
              <p className="mt-2 text-sm text-slate-500">Fill in your details—password rules are checked live.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  {[1, 2, 3, 4].map((n) => {
                    const done = step > n;
                    const active = step === n;
                    return (
                      <div key={n} className="flex flex-1 items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            done
                              ? 'bg-emerald-500 text-white'
                              : active
                                ? 'bg-sky-600 text-white'
                                : 'bg-white text-slate-400 ring-1 ring-slate-200'
                          }`}
                        >
                          {done ? '✓' : String(n).padStart(2, '0')}
                        </div>
                        <div className="hidden text-xs font-semibold text-slate-600 sm:block">
                          {n === 1 ? 'Profile' : n === 2 ? 'Photo' : n === 3 ? 'Contact' : 'Security'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {step === 1 && (
                <div className="rounded-2xl border border-sky-100/90 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm shadow-sky-100/50 sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b border-sky-100/80 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[11px] font-bold text-sky-800">
                      01
                    </span>
                    Profile
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Full name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Alex Perera"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@university.edu"
                        autoComplete="email"
                        className={inputClass}
                      />
                      <p className="mt-1.5 text-xs text-slate-500">
                        We use the part before <span className="font-mono text-slate-600">@</span> to suggest your username.
                      </p>
                    </div>

                    <div>
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <label className="text-sm font-semibold text-slate-700">Username</label>
                        {usernameFollowsEmail && (
                          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-800">
                            Auto from email
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="your.login.name"
                        autoComplete="username"
                        className={inputClass}
                      />
                      {!usernameFollowsEmail && (
                        <button
                          type="button"
                          onClick={resyncUsernameFromEmail}
                          className="mt-2 text-xs font-semibold text-sky-600 underline-offset-2 hover:text-sky-800 hover:underline"
                        >
                          Reset username from email
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="rounded-2xl border border-sky-100/90 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm shadow-sky-100/50 sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b border-sky-100/80 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[11px] font-bold text-sky-800">
                      02
                    </span>
                    Photo <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span>
                  </h3>
                  <div
                    className={`cursor-pointer rounded-2xl border-2 border-dashed bg-white/80 px-5 py-5 shadow-inner transition ${
                      isDragging ? 'border-sky-400 bg-sky-50' : 'border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex items-center gap-5">
                      <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border border-white bg-white shadow-lg">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-100 to-cyan-100" />
                        <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white ring-4 ring-white">
                          {imagePreviewUrl ? (
                            <img src={imagePreviewUrl} alt="Profile preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sky-700">
                              <svg className="h-11 w-11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {!imagePreviewUrl && (
                          <div className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-sky-600 text-white shadow-md">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4.5v15m-7.5-7.5h15" />
                            </svg>
                          </div>
                        )}

                        {imagePreviewUrl && (
                          <button
                            type="button"
                            className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-white shadow-md transition hover:bg-red-600"
                            onClick={handleRemoveImage}
                            title="Remove photo"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        {imagePreviewUrl ? (
                          <>
                            <p className="mb-1 text-sm font-semibold text-slate-900">Photo selected</p>
                            <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-sm font-medium text-sky-700">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span className="truncate">{selectedImageFile?.name}</span>
                            </span>
                            <p className="mt-1 text-xs text-slate-500">Click anywhere in this box to change the photo.</p>
                          </>
                        ) : (
                          <>
                            <p className="mb-1 text-sm font-semibold text-slate-700">Upload your photo</p>
                            <button
                              type="button"
                              className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                              </svg>
                              Browse file
                            </button>
                            <p className="mt-2 text-xs leading-5 text-slate-500">or drag &amp; drop · JPG, PNG, WEBP · max 5 MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    {imagePreviewUrl && (
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    id="profileImage"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </div>
              )}

              {step === 3 && (
                <div className="rounded-2xl border border-sky-100/90 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm shadow-sky-100/50 sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b border-sky-100/80 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[11px] font-bold text-sky-800">
                      03
                    </span>
                    Contact &amp; role
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Phone</label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="e.g. +94771234567"
                        autoComplete="tel"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className={`${inputClass} cursor-pointer`}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TEACHER">Tutor</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="rounded-2xl border border-sky-100/90 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm shadow-sky-100/50 sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 border-b border-sky-100/80 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-sky-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-[11px] font-bold text-sky-800">
                      04
                    </span>
                    Security
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create password"
                          autoComplete="new-password"
                          aria-invalid={formData.password.length > 0 && !passwordOk}
                          className={`w-full rounded-2xl border bg-white px-4 py-3.5 pr-12 text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                            formData.password.length === 0
                              ? 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                              : passwordOk
                                ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
                                : 'border-amber-300 focus:border-sky-400 focus:ring-sky-100'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-sky-500"
                        >
                          {showPassword ? (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <ul className="mt-3 space-y-2 rounded-xl border border-sky-100 bg-sky-50/50 px-3 py-3 text-xs sm:text-sm" aria-live="polite">
                        {[
                          { key: 'minLength', met: passwordRules.minLength, label: `At least ${PASSWORD_MIN_LENGTH} characters` },
                          { key: 'uppercase', met: passwordRules.uppercase, label: 'One uppercase letter (A–Z)' },
                          { key: 'number', met: passwordRules.number, label: 'One number (0–9)' },
                          { key: 'special', met: passwordRules.special, label: 'One special character (!@#$…)' },
                        ].map((rule) => (
                          <li
                            key={rule.key}
                            className={`flex items-center gap-2 font-medium transition-colors ${
                              rule.met ? 'text-emerald-700' : 'text-slate-500'
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none ${
                                rule.met
                                  ? 'border-emerald-500 bg-emerald-500 text-white'
                                  : 'border-slate-300 bg-white text-slate-300'
                              }`}
                              aria-hidden
                            >
                              {rule.met ? '✓' : '○'}
                            </span>
                            {rule.label}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-slate-700">Confirm password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-slate-800 shadow-sm outline-none transition focus:ring-4 ${
                          formData.confirmPassword.length === 0
                            ? 'border-slate-200 focus:border-sky-400 focus:ring-sky-100'
                            : passwordsMatch
                              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100'
                              : 'border-amber-300 focus:border-sky-400 focus:ring-sky-100'
                        }`}
                      />
                      {formData.confirmPassword.length > 0 && (
                        <p
                          className={`mt-1.5 text-xs font-medium ${
                            passwordsMatch ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match yet'}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !isPasswordValid(formData.password) || formData.password !== formData.confirmPassword}
                    className="mt-2 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-300/40 transition hover:from-sky-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? 'Creating Account…' : 'Create Account'}
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={step === 1}
                  className="rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>

                {step < 4 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-sky-200/40 transition hover:from-sky-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Next
                  </button>
                )}
              </div>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs uppercase tracking-wide text-slate-400">or continue with</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => toast.error('Google sign up cancelled or failed')}
                useOneTap={false}
                theme="outline"
                size="large"
                shape="pill"
              />
            </div>

            <p className="mt-7 text-center text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-sky-600 transition hover:text-sky-700">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Signup;
