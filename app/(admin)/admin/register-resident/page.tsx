'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
import { showSuccess, showError } from '@/app/lib/sweetalert';
import { Room, User } from '@/app/types';

export default function RegisterResidentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nama: '',
    nik: '',
    nomor_telepon: '',
    alamat_domisili: '',
    email: '',
    password: '',
    room_id: '',
    foto_penghuni: null as File | null,
    acceptTerms: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    if (parsedUser.role !== 'Admin') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchRooms();
    setLoading(false);
  }, [router]);

  const fetchRooms = async () => {
    try {
      const data = await ApiClient.getRooms();
      // Filter only available rooms
      const availableRooms = data.rooms.filter((room: Room) => room.status === 'Kosong');
      setRooms(availableRooms);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setFormData({ ...formData, foto_penghuni: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (!formData.room_id) {
      setError('Please select a room');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nama', formData.nama);
      formDataToSend.append('nik', formData.nik);
      formDataToSend.append('nomor_telepon', formData.nomor_telepon);
      formDataToSend.append('alamat_domisili', formData.alamat_domisili || '');
      formDataToSend.append('email', formData.email || '');
      formDataToSend.append('password', formData.password);
      formDataToSend.append('room_id', formData.room_id);

      if (formData.foto_penghuni) {
        formDataToSend.append('foto_penghuni', formData.foto_penghuni);
      }

      const API_URL = getApiUrl();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/rooms/register-penghuni`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        body: formDataToSend,
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      const data = await response.json();

      if (response.ok) {
        await showSuccess('Berhasil!', 'Penghuni berhasil didaftarkan!');
        router.push('/admin/residents');
      } else {
        setError(data.error || data.errors ? JSON.stringify(data.errors) : 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#F7F9FB]/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold tracking-tight text-lg text-primary">Register Resident</h1>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <span className="font-label text-[10px] uppercase tracking-widest font-semibold text-neutral-400">
              Step 01/01
            </span>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern pointer-events-none"></div>

        <div className="w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-[420px_1fr] gap-12 items-start relative z-10">
          {/* Left Section */}
          <section className="space-y-8">
            <div className="space-y-2">
              <h2 className="font-headline text-[3.5rem] leading-[1.1] font-extrabold tracking-tight text-primary">
                Join the <span className="text-secondary">Curated</span> Sphere.
              </h2>
              <p className="text-primary-container font-body body-lg max-w-[320px]">
                Define your digital footprint in the architectural landscape of property management.
              </p>
            </div>

            <div className="hidden md:block p-8 bg-surface-container-low rounded-xl space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <div>
                  <p className="font-headline font-bold text-primary">Identity Secured</p>
                  <p className="font-label text-xs text-on-surface-variant mt-1">
                    Advanced NIK verification powered by secondary blockchain layers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  encrypted
                </span>
                <div>
                  <p className="font-headline font-bold text-primary">End-to-End Vault</p>
                  <p className="font-label text-xs text-on-surface-variant mt-1">
                    Your personal credentials reside in cold storage logic.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Section - Form */}
          <section className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(25,28,30,0.04)]">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Error Message */}
              {error && (
                <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center border-2 border-dashed border-outline-variant group-hover:border-secondary transition-colors">
                      {photoPreview ? (
                        <img alt="Preview" className="w-full h-full object-cover" src={photoPreview} />
                      ) : (
                        <>
                          <img
                            alt=""
                            className="w-full h-full object-cover opacity-20"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnZfIN6ldKWnBFmuhisGg69Wtr4TWJyswQMWMj-x-n4-n4R87k36UoNOOBSDEglwCS1hHWzfrMMemrxuMAVKR-PdPJm-snbyKcspM6mzndLhj1L7F3VLDeCgF9B-Ow2xONafFBlP55NvZJRK04IjoWA3IhcTmxmhkhybm267EzGoWPhDd1nLPZB7fs7GBBhp8CbqjQjsQxxuKsDQHHJmTjBm73voe32mm1fjTKA0ODY85t-t6z8mwj9F0Hr_mTPFA9asJ05Hyn6Q4"
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant group-hover:text-secondary transition-colors">
                            <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary p-2 rounded-full shadow-lg">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        edit
                      </span>
                    </div>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-headline font-bold text-primary">Profile Portrait</h3>
                  <p className="font-label text-[10px] uppercase tracking-widest text-outline mt-1">
                    JPG or PNG • Max 5MB
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                    Full Name
                  </label>
                  <input
                    className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-body text-primary placeholder:text-outline/50"
                    placeholder="Johnathan Doe"
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>

                {/* NIK */}
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                    NIK (Identity Number)
                  </label>
                  <input
                    className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-body text-primary placeholder:text-outline/50"
                    placeholder="3201**********0001"
                    type="text"
                    maxLength={16}
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
                </div>

                {/* Alamat Domisili */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                    Alamat Domisili
                  </label>
                  <textarea
                    className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-body text-primary placeholder:text-outline/50 resize-none"
                    placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                    rows={3}
                    value={formData.alamat_domisili}
                    onChange={(e) => setFormData({ ...formData, alamat_domisili: e.target.value })}
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-3 bg-surface-container-highest rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-secondary/20 focus-within:bg-surface-container-lowest transition-all">
                    <span className="font-label text-sm text-outline border-r border-outline-variant pr-3">+62</span>
                    <input
                      className="flex-1 bg-transparent border-none p-0 focus:ring-0 font-body text-primary placeholder:text-outline/50"
                      placeholder="812 3456 7890"
                      type="tel"
                      value={formData.nomor_telepon}
                      onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="flex flex-col gap-2">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                    Email (Optional)
                  </label>
                  <input
                    className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-body text-primary placeholder:text-outline/50"
                    placeholder="john@example.com"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Room Selection */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                    Select Room
                  </label>
                  <select
                    className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-body text-primary"
                    value={formData.room_id}
                    onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                    required
                  >
                    <option value="">Choose available room...</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        Room {room.nomor_kamar} - Rp {room.tarif_dasar.toLocaleString('id-ID')}/month
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                    Password
                  </label>
                  <div className="flex items-center gap-3 bg-surface-container-highest rounded-xl px-4 py-3.5 focus-within:ring-2 focus-within:ring-secondary/20 focus-within:bg-surface-container-lowest transition-all">
                    <input
                      className="flex-1 bg-transparent border-none p-0 focus:ring-0 font-body text-primary placeholder:text-outline/50"
                      placeholder="••••••••"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                    <span
                      className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-3 pt-4">
                <input
                  className="w-5 h-5 rounded-lg border-outline-variant text-secondary focus:ring-secondary"
                  id="terms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                />
                <label className="font-body text-sm text-on-surface-variant" htmlFor="terms">
                  I accept the{' '}
                  <a className="text-secondary font-semibold hover:underline" href="#">
                    Terms of Service
                  </a>{' '}
                  and acknowledge the{' '}
                  <a className="text-secondary font-semibold hover:underline" href="#">
                    Privacy Policy
                  </a>
                  .
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="font-body text-sm text-primary hover:text-secondary transition-colors"
                >
                  ← Back to Dashboard
                </button>
                <button
                  className="w-full md:w-auto btn-gradient px-12 py-4 rounded-xl text-on-primary font-headline font-bold text-lg shadow-[0_16px_32px_rgba(76,78,80,0.15)] hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Finalize Registration'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>

      <style jsx>{`
        .bg-pattern {
          background-image: radial-gradient(#c3c5d9 0.5px, transparent 0.5px);
          background-size: 24px 24px;
          opacity: 0.15;
        }
        .btn-gradient {
          background: linear-gradient(135deg, #4c4e50 0%, #656668 100%);
        }
      `}</style>
    </div>
  );
}
