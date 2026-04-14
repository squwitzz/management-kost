'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/app/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nomor_telepon: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await ApiClient.login(formData.nomor_telepon, formData.password);
      
      // Save token and user data
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // Set cookie for middleware
      document.cookie = `token=${response.access_token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

      // Redirect based on role
      if (response.user.role === 'Admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-24">
        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 items-center">
          {/* Left Column: Branding & Messaging */}
          <div className="flex flex-col space-y-8 md:pr-12">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl">roofing</span>
              </div>
              <span className="font-headline font-extrabold text-2xl tracking-tighter text-primary uppercase">
                Kost Management
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="font-headline font-extrabold text-5xl md:text-6xl text-on-surface tracking-tighter leading-none">
                Welcome Back
              </h1>
              <p className="font-body text-xl text-on-surface-variant max-w-md leading-relaxed">
                Sign in to manage your stay or property through our management portal.
              </p>
            </div>

            {/* Subtle Decorative Element */}
            <div className="hidden md:block pt-8">
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">verified_user</span>
                  </div>
                  <div>
                    <p className="label-font text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
                      Secure Access
                    </p>
                    <p className="font-body text-sm text-on-surface">
                      End-to-end encrypted management portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Card */}
          <div className="relative group">
            {/* Decorative Backdrop */}
            <div className="absolute -inset-4 bg-secondary/5 rounded-[2rem] blur-2xl group-hover:bg-secondary/10 transition-all duration-500"></div>

            <div className="relative bg-surface-container-lowest p-8 md:p-12 rounded-[1.5rem] shadow-[0_32px_64px_rgba(25,28,30,0.04)]">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                {/* Phone Number Field */}
                <div className="space-y-2">
                  <label
                    className="label-font text-[0.75rem] font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                    htmlFor="nomor_telepon"
                  >
                    Nomor Telepon
                  </label>
                  <div className="relative">
                    <input
                      className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-outline transition-all focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest"
                      id="nomor_telepon"
                      placeholder="081234567890"
                      type="tel"
                      value={formData.nomor_telepon}
                      onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label
                      className="label-font text-[0.75rem] font-bold uppercase tracking-widest text-on-surface-variant"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <a
                      className="label-font text-[0.75rem] font-bold text-secondary hover:underline transition-all"
                      href="#"
                    >
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-outline transition-all focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest"
                      id="password"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary transition-colors"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Primary CTA */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary text-white font-headline font-bold py-5 rounded-xl text-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(0,62,198,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Login'}
                  </button>
                </div>

                {/* Secondary Option */}
                <div className="pt-6 text-center">
                  <p className="font-body text-on-surface-variant">
                    Don&apos;t have an account?{' '}
                    <a className="text-on-surface font-bold hover:text-secondary transition-colors ml-1" href="#">
                      Contact Management
                    </a>
                  </p>
                </div>
              </form>
            </div>

            {/* Abstract Visual Element */}
            <div className="mt-12 overflow-hidden rounded-2xl h-48 md:h-64 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
              <img
                alt="Minimalist modern office interior"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCszPg_qWbtvOVQ1gogUFhGwtHEX6A3vawTOgfsre9CRtke2_Z6IrqT38Qtm_fRHzDG9tel8hzrob4h5gkwwb52r75dh5TMEJgpOyYos6gJm4A4wqAupmBCNH00uYlxRYc9dUKgrwpMcJxj7l0-A_iGJCRM9fp2chBIbvv8lWW3FoOl_JcxRWkyAhILPBbvECb7MKjmlG3I_SrwFdQByNsLtI9XQ4YWiHGQUi_pYxCpI0xrr8RkB0V4m2nVWJEEY5vbvDOCCe1kTbc"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <span className="label-font text-[10px] text-white/70 uppercase tracking-[0.2em]">
                  Curated Environments
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Space */}
      <footer className="py-8 px-6 text-center">
        <p className="label-font text-[10px] text-outline uppercase tracking-[0.3em]">
          © 2024 Kost Management. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
