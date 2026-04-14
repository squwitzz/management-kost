'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserHeader, UserBottomNav } from '@/app/components';
import { User } from '@/app/types';
import { ApiClient } from '@/app/lib/api';

export default function CreateRequestPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [kategori, setKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFoto(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    if (!kategori || !deskripsi) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('kategori', kategori);
      formData.append('deskripsi', deskripsi);
      formData.append('is_draft', isDraft ? '1' : '0');
      if (foto) {
        formData.append('foto', foto);
      }

      await ApiClient.createMaintenanceRequest(formData);
      router.push('/requests');
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <UserHeader user={user} title="Submit Request" showBackButton />

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-32">
        {/* Editorial Header */}
        <div className="mb-16 max-w-2xl">
          <span className="font-label text-secondary font-semibold tracking-widest text-[10px] uppercase mb-4 block">
            Service Desk
          </span>
          <h2 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-[1.1] mb-6">
            Maintenance <br />
            <span className="text-secondary/80">Request.</span>
          </h2>
          <p className="text-lg text-on-surface-variant font-light leading-relaxed">
            Experience management, curated. Describe the issue with your residence and our facility experts will be deployed within 24 hours.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl">
            {error}
          </div>
        )}

        {/* Asymmetrical Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Form (65%) */}
          <div className="lg:col-span-8 space-y-12">
            <div className="bg-surface-container-low rounded-3xl p-8 md:p-12">
              <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                {/* Category Selection */}
                <div className="space-y-4">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    Issue Category
                  </label>
                  <div className="relative group">
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="w-full bg-surface-container-highest border-none rounded-xl py-5 px-6 appearance-none font-body text-primary focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all"
                    >
                      <option value="">Select the nature of the issue</option>
                      <option value="Plumbing">Plumbing & Waterworks</option>
                      <option value="Electrical">Electrical & Lighting</option>
                      <option value="Furniture">Furniture & Cabinetry</option>
                      <option value="HVAC">Climate & HVAC</option>
                      <option value="Appliances">Kitchen Appliances</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Description Area */}
                <div className="space-y-4">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    Problem Description
                  </label>
                  <textarea
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full bg-surface-container-highest border-none rounded-xl py-5 px-6 font-body text-primary focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all resize-none"
                    placeholder="Tell us more about what's happening. The more detail, the faster we can solve it."
                    rows={6}
                  />
                </div>

                {/* Upload Photo */}
                <div className="space-y-4">
                  <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold ml-1">
                    Visual Evidence
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="md:col-span-2 group flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 rounded-xl py-12 hover:bg-surface-container-lowest hover:border-secondary transition-all cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="w-14 h-14 rounded-full bg-secondary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-secondary">cloud_upload</span>
                      </div>
                      <span className="font-body text-sm font-medium text-primary">Upload Photo</span>
                      <span className="font-label text-[10px] text-on-surface-variant mt-1">
                        PNG, JPG up to 10MB
                      </span>
                    </label>
                    {preview && (
                      <div className="rounded-xl overflow-hidden aspect-square md:aspect-auto md:h-full relative shadow-md">
                        <img className="w-full h-full object-cover absolute inset-0" src={preview} alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 flex items-center gap-6">
                  <button
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-primary-container text-on-primary font-body font-bold py-5 px-12 rounded-xl active:scale-[0.98] transition-all flex items-center gap-3 disabled:opacity-50"
                    type="button"
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                  <button
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    className="text-primary font-body text-sm font-semibold hover:underline underline-offset-8 transition-all disabled:opacity-50"
                    type="button"
                  >
                    Save as Draft
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right: Info (35%) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Status Card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1.5 h-10 bg-secondary rounded-full"></div>
                <h3 className="font-headline text-xl font-bold">Facility Insights</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-surface-container rounded-lg">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-label text-[10px] uppercase font-bold text-on-surface-variant">
                      Active Technicians
                    </span>
                    <span className="font-headline text-xl font-bold text-secondary">12</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-3/4 rounded-full"></div>
                  </div>
                </div>
                <div className="p-4 bg-surface-container rounded-lg">
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-label text-[10px] uppercase font-bold text-on-surface-variant">
                      Avg. Response Time
                    </span>
                    <span className="font-headline text-xl font-bold text-primary">2.4h</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/4 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-secondary text-on-secondary p-8 rounded-xl shadow-lg shadow-secondary/10">
              <p className="font-headline text-lg font-bold mb-2">Urgent Issue?</p>
              <p className="font-body text-sm opacity-80 mb-6">
                For gas leaks or major flooding, please call our 24/7 emergency line immediately.
              </p>
              <a
                className="inline-flex items-center gap-3 font-label text-xs font-black uppercase tracking-widest bg-on-secondary text-secondary px-6 py-3 rounded-full"
                href="tel:1800LODGE"
              >
                <span className="material-symbols-outlined text-sm">call</span>
                Call Concierge
              </a>
            </div>
          </div>
        </div>
      </main>

      <UserBottomNav />
    </div>
  );
}
