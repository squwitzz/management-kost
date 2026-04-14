'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { ApiClient } from '@/app/lib/api';
import { showSuccess, showError, showLoading, closeLoading } from '@/app/lib/sweetalert';

export default function EditResidentPage() {
  const router = useRouter();
  const params = useParams();
  const residentId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resident, setResident] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nomor_telepon: '',
    email: '',
    alamat: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    pekerjaan: '',
    kontak_darurat: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
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

    fetchResident();
  }, [residentId]);

  const fetchResident = async () => {
    try {
      const data = await ApiClient.getResident(Number(residentId));
      setResident(data.user);
      setFormData({
        nama: data.user.nama || '',
        nomor_telepon: data.user.nomor_telepon || '',
        email: data.user.email || '',
        alamat: data.user.alamat || '',
        tanggal_lahir: data.user.tanggal_lahir || '',
        jenis_kelamin: data.user.jenis_kelamin || '',
        pekerjaan: data.user.pekerjaan || '',
        kontak_darurat: data.user.kontak_darurat || '',
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      console.error('Failed to fetch resident:', err);
      showError('Error', err.message || 'Failed to fetch resident data');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) newErrors.nama = 'Name is required';
    if (!formData.nomor_telepon.trim()) newErrors.nomor_telepon = 'Phone number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    // Password validation (only if password is provided)
    if (formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    showLoading('Saving...', 'Please wait while we update the resident information');
    
    try {
      // Prepare data - only include password if it's provided
      const updateData: any = {
        nama: formData.nama,
        nomor_telepon: formData.nomor_telepon,
        email: formData.email,
        alamat: formData.alamat,
        tanggal_lahir: formData.tanggal_lahir,
        jenis_kelamin: formData.jenis_kelamin,
        pekerjaan: formData.pekerjaan,
        kontak_darurat: formData.kontak_darurat,
      };

      if (formData.password) {
        updateData.password = formData.password;
        updateData.password_confirmation = formData.confirmPassword;
      }

      await ApiClient.updateResident(Number(residentId), updateData);
      
      closeLoading();
      await showSuccess('Success!', 'Resident updated successfully');
      router.push('/admin/residents');
    } catch (err: any) {
      console.error('Failed to update resident:', err);
      closeLoading();
      showError('Update Failed', err.message || 'Failed to update resident');
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
    <div className="bg-surface text-on-surface min-h-screen pb-24">
      <AdminHeader />

      <main className="px-6 mt-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-primary mb-4"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="font-label font-bold">Back</span>
          </button>
          <h1 className="text-2xl font-headline font-bold text-on-surface">Edit Resident</h1>
          <p className="font-label text-sm text-on-surface-variant mt-1">
            Update resident information
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-label text-sm font-bold text-on-surface mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 ${
                errors.nama ? 'border-error' : 'border-transparent'
              } focus:border-primary focus:outline-none transition-colors`}
              placeholder="Enter full name"
            />
            {errors.nama && <p className="text-error text-xs mt-1">{errors.nama}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block font-label text-sm font-bold text-on-surface mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="nomor_telepon"
              value={formData.nomor_telepon}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 ${
                errors.nomor_telepon ? 'border-error' : 'border-transparent'
              } focus:border-primary focus:outline-none transition-colors`}
              placeholder="08123456789"
            />
            {errors.nomor_telepon && <p className="text-error text-xs mt-1">{errors.nomor_telepon}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block font-label text-sm font-bold text-on-surface mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 ${
                errors.email ? 'border-error' : 'border-transparent'
              } focus:border-primary focus:outline-none transition-colors`}
              placeholder="email@example.com"
            />
            {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block font-label text-sm font-bold text-on-surface mb-2">
              Address
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors resize-none"
              placeholder="Enter address"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="block font-label text-sm font-bold text-on-surface mb-2">
              Birth Date
            </label>
            <input
              type="date"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block font-label text-sm font-bold text-on-surface mb-2">
              Gender
            </label>
            <select
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">Select gender</option>
              <option value="Laki-laki">Male</option>
              <option value="Perempuan">Female</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block font-label text-sm font-bold text-on-surface mb-2">
              Occupation
            </label>
            <input
              type="text"
              name="pekerjaan"
              value={formData.pekerjaan}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="Enter occupation"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <label className="block font-label text-sm font-bold text-on-surface mb-2">
              Emergency Contact
            </label>
            <input
              type="tel"
              name="kontak_darurat"
              value={formData.kontak_darurat}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-colors"
              placeholder="08123456789"
            />
          </div>

          {/* Password Section */}
          <div className="pt-4 border-t border-outline-variant">
            <h3 className="font-headline font-bold text-on-surface mb-4">Change Password (Optional)</h3>
            <p className="font-label text-xs text-on-surface-variant mb-4">
              Leave blank if you don't want to change the password
            </p>

            {/* New Password */}
            <div className="mb-4">
              <label className="block font-label text-sm font-bold text-on-surface mb-2">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 ${
                  errors.password ? 'border-error' : 'border-transparent'
                } focus:border-primary focus:outline-none transition-colors`}
                placeholder="Enter new password"
              />
              {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-label text-sm font-bold text-on-surface mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 bg-surface-container-highest rounded-xl border-2 ${
                  errors.confirmPassword ? 'border-error' : 'border-transparent'
                } focus:border-primary focus:outline-none transition-colors`}
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-primary text-on-primary font-label font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <AdminBottomNav />
    </div>
  );
}
