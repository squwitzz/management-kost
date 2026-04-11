'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserHeader, UserBottomNav } from '@/app/components';
import { User } from '@/app/types';
import { ApiClient, getApiUrl, getImageUrl } from '@/app/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Changed to false by default
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [alamatDomisili, setAlamatDomisili] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Change password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    // Load from localStorage first for immediate display
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setNama(userData.nama || '');
        setEmail(userData.email || '');
        setNomorTelepon(userData.nomor_telepon || '');
        setAlamatDomisili(userData.alamat_domisili || '');
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
      }
    }
    
    // Then fetch fresh data from API in background
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await ApiClient.getMe();
      setUser(data.user);
      setNama(data.user.nama || '');
      setEmail(data.user.email || '');
      setNomorTelepon(data.user.nomor_telepon || '');
      setAlamatDomisili(data.user.alamat_domisili || '');
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      setError('Failed to load profile data');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setFoto(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('nama', nama);
      formData.append('email', email);
      formData.append('nomor_telepon', nomorTelepon);
      formData.append('alamat_domisili', alamatDomisili);
      if (foto) {
        formData.append('foto_penghuni', foto);
      }

      const token = localStorage.getItem('token');
      const API_URL = getApiUrl();
      const response = await fetch(`${API_URL}/profile/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      if (response.ok) {
        setSuccess('Profile updated successfully');
        setEditing(false);
        fetchUserData();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      await ApiClient.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      setSuccess('Password changed successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const maskNIK = (nik: string) => {
    if (!nik) return 'N/A';
    return nik.substring(0, 3) + '************' + nik.substring(nik.length - 2);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <header className="w-full top-0 sticky z-40 bg-[#F7F9FB] dark:bg-[#121212] flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-[#4C4E50] dark:text-[#E1E2E4] hover:bg-[#F2F4F6] dark:hover:bg-[#1C1C1C] transition-colors p-2 rounded-xl active:scale-95 duration-200"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline font-bold text-2xl tracking-tight text-[#4C4E50] dark:text-[#E1E2E4]">
            Profile
          </h1>
        </div>
        <button
          onClick={() => setEditing(!editing)}
          className="text-[#4C4E50] dark:text-[#E1E2E4] hover:bg-[#F2F4F6] dark:hover:bg-[#1C1C1C] transition-colors p-2 rounded-xl active:scale-95 duration-200"
        >
          <span className="material-symbols-outlined">{editing ? 'close' : 'edit'}</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-8 pb-32">
        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-emerald-100 text-emerald-700 rounded-xl">
            {success}
          </div>
        )}

        {/* Hero Profile Section */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 mb-12 items-end">
          <div className="relative group">
            <div className="w-48 h-48 rounded-2xl overflow-hidden bg-surface-container-highest border-4 border-surface-container-lowest shadow-lg">
              <img
                alt="Profile"
                className="w-full h-full object-cover"
                src={
                  preview ||
                  (user?.foto_penghuni
                    ? getImageUrl(user.foto_penghuni)
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUe_fqSs_mEXImBn1Td_tce-oeWCz2RBOuzeAboY3q2ZSX3x1uhrrYkxyULXIOX-K8gQ7Gwf_Fewm-Dv05BdoAqlylRvBeuzeOje2aH2__JR3wjlyUbdLvM57eBZW52YNy7NHprIBSPZdV0nAq9pgCb4ALVjfkw_NqusJdPlOsrujJK-1utnB_yWit4dwKrwmjHjTlCZQAjqxk3wcTGByTJZPI6r1j8XXvOCoUDWUFX7jxjK0OPESkDug1XkKIWMg9cYssyxUnL40')
                }
              />
            </div>
            {editing && (
              <label className="absolute bottom-2 right-6 bg-secondary text-on-secondary p-3 rounded-full shadow-lg border-4 border-surface-container-lowest cursor-pointer hover:opacity-90 transition-opacity">
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </label>
            )}
            {!editing && (
              <div className="absolute bottom-2 right-6 bg-secondary text-on-secondary p-2 rounded-full shadow-lg border-4 border-surface-container-lowest">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              {editing ? (
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="font-headline font-extrabold text-4xl tracking-tight text-primary bg-surface-container-low rounded-lg px-4 py-2 border-none focus:ring-2 focus:ring-secondary/20"
                />
              ) : (
                <h2 className="font-headline font-extrabold text-4xl tracking-tight text-primary">
                  {nama || user?.nama || 'Loading...'}
                </h2>
              )}
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-label font-bold uppercase tracking-widest">
                Verified Resident
              </span>
            </div>
            <p className="text-on-surface-variant font-label text-sm uppercase tracking-[0.2em]">
              Room {user?.room?.nomor_kamar || 'N/A'}
            </p>
            <div className="h-[2px] w-24 bg-secondary mt-4"></div>
          </div>
        </section>

        {/* Bento Grid Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Contact Card */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-8 flex flex-col justify-between min-h-[200px]">
            <h3 className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-6">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-label font-bold text-outline uppercase tracking-wider">
                    Email Address
                  </p>
                  {editing ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full font-body font-bold text-primary bg-surface-container-low rounded-lg px-3 py-1 border-none focus:ring-2 focus:ring-secondary/20"
                    />
                  ) : (
                    <p className="font-body font-bold text-primary">{email || user?.email || 'Not set'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-low flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined">phone_iphone</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-label font-bold text-outline uppercase tracking-wider">
                    Phone Number
                  </p>
                  {editing ? (
                    <input
                      type="text"
                      value={nomorTelepon}
                      onChange={(e) => setNomorTelepon(e.target.value)}
                      className="w-full font-body font-bold text-primary bg-surface-container-low rounded-lg px-3 py-1 border-none focus:ring-2 focus:ring-secondary/20"
                    />
                  ) : (
                    <p className="font-body font-bold text-primary">{nomorTelepon || user?.nomor_telepon}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* NIK Verification Card */}
          <div className="bg-primary text-on-primary-container rounded-xl p-8 flex flex-col justify-between bg-gradient-to-br from-primary to-primary-container">
            <div>
              <h3 className="font-label text-xs font-bold uppercase tracking-widest text-surface-variant mb-6 opacity-60">
                Identity Document
              </h3>
              <p className="font-headline font-bold text-2xl tracking-tighter text-white mb-2">NIK Verified</p>
              <p className="font-label text-xs text-surface-variant tracking-widest">{maskNIK(user?.nik || '')}</p>
            </div>
            <div className="flex justify-end">
              <span className="material-symbols-outlined text-4xl opacity-20">id_card</span>
            </div>
          </div>
        </div>

        {/* Address Section */}
        {editing && (
          <div className="bg-surface-container-lowest rounded-xl p-8 mb-12">
            <h3 className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-4">
              Home Address
            </h3>
            <textarea
              value={alamatDomisili}
              onChange={(e) => setAlamatDomisili(e.target.value)}
              className="w-full font-body text-primary bg-surface-container-low rounded-lg px-4 py-3 border-none focus:ring-2 focus:ring-secondary/20 resize-none"
              rows={3}
              placeholder="Enter your home address"
            />
          </div>
        )}

        {!editing && (user?.alamat_domisili || alamatDomisili) && (
          <div className="bg-surface-container-lowest rounded-xl p-8 mb-12">
            <h3 className="font-label text-xs font-bold uppercase tracking-widest text-outline mb-4">
              Home Address
            </h3>
            <p className="font-body text-primary">{alamatDomisili || user?.alamat_domisili}</p>
          </div>
        )}

        {/* Save Button */}
        {editing && (
          <div className="mb-12">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-secondary text-white py-4 rounded-xl font-label font-bold hover:opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Account Actions */}
        <div className="bg-surface-container-low rounded-xl p-4">
          <h3 className="px-4 pt-4 pb-2 font-label text-xs font-bold uppercase tracking-widest text-outline">
            Account Actions
          </h3>
          <div className="space-y-1">
            {/* Change Password */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-surface-container-lowest transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">
                  lock_reset
                </span>
                <span className="font-body font-bold text-primary">Change Password</span>
              </div>
              <span className="material-symbols-outlined text-outline opacity-40">chevron_right</span>
            </button>

            {/* Logout */}
            <div className="my-4 h-px bg-surface-container-highest mx-4"></div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-error-container/30 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-error">logout</span>
                <span className="font-body font-bold text-error">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-2xl font-bold text-primary">Change Password</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-outline hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block font-label text-xs text-outline uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 font-body text-primary focus:ring-2 focus:ring-secondary/20"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block font-label text-xs text-outline uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 font-body text-primary focus:ring-2 focus:ring-secondary/20"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block font-label text-xs text-outline uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 font-body text-primary focus:ring-2 focus:ring-secondary/20"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 py-3 border border-outline-variant/30 text-primary rounded-lg font-label font-semibold hover:bg-surface-container transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex-1 py-3 bg-secondary text-white rounded-lg font-label font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {changingPassword ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <UserBottomNav />
    </div>
  );
}
