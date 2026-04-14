'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { useAuth } from '@/app/lib/useAuth';
import { ApiClient } from '@/app/lib/api';
import { User } from '@/app/types';

export default function AdminProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth('Admin');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    nama: '',
    email: '',
    nomor_telepon: '',
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser) {
      setUser(authUser);
      setProfileForm({
        nama: authUser.nama || '',
        email: authUser.email || '',
        nomor_telepon: authUser.nomor_telepon || '',
      });
    }
  }, [authLoading, isAuthenticated, authUser]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const data = await ApiClient.updateProfile(profileForm);

      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    try {
      await ApiClient.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        new_password_confirmation: passwordForm.new_password_confirmation,
      });

      setMessage({ type: 'success', text: 'Password changed successfully!' });
      
      // Clear password form
      setPasswordForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-8">
      <AdminHeader title="Admin Profile" showBackButton />

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-6 md:pt-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-primary font-headline text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
            Profile Settings
          </h2>
          <p className="text-outline text-sm md:text-base">
            Manage your account information and security
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-secondary-container text-on-secondary-container' 
              : 'bg-error-container text-on-error-container'
          }`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">
                {message.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-outline-variant/20">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-label font-bold text-sm transition-all ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-outline hover:text-primary'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 font-label font-bold text-sm transition-all ${
              activeTab === 'password'
                ? 'text-primary border-b-2 border-primary'
                : 'text-outline hover:text-primary'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Profile Form */}
        {activeTab === 'profile' && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.nama}
                  onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                  className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-outline transition-all focus:ring-2 focus:ring-secondary/20"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-outline transition-all focus:ring-2 focus:ring-secondary/20"
                  placeholder="admin@example.com"
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.nomor_telepon}
                  onChange={(e) => setProfileForm({ ...profileForm, nomor_telepon: e.target.value })}
                  className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-outline transition-all focus:ring-2 focus:ring-secondary/20"
                  placeholder="081234567890"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-headline font-bold py-4 rounded-xl text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Form */}
        {activeTab === 'password' && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8">
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-outline transition-all focus:ring-2 focus:ring-secondary/20"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showCurrentPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-outline transition-all focus:ring-2 focus:ring-secondary/20"
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showNewPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.new_password_confirmation}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-4 font-body text-on-surface placeholder:text-outline transition-all focus:ring-2 focus:ring-secondary/20"
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-secondary transition-colors"
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-surface-container p-4 rounded-xl">
                <p className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Password Requirements
                </p>
                <ul className="space-y-1 text-sm text-on-surface-variant">
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Minimum 6 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    Passwords must match
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-headline font-bold py-4 rounded-xl text-base hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <AdminBottomNav />
    </div>
  );
}
