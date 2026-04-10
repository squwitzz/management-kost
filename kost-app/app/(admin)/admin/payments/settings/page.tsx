'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
import { showSuccess, showError } from '@/app/lib/sweetalert';

interface BillingSettings {
  billing_cycle_days: number;
  due_date_day: number;
  late_fee_percentage: number | null;
  late_fee_amount: number | null;
  grace_period_days: number;
  auto_generate: boolean;
  auto_generate_day: number;
  enable_late_fee: boolean;
  late_fee_type: 'percentage' | 'fixed';
}

export default function BillingSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<BillingSettings>({
    billing_cycle_days: 30,
    due_date_day: 5,
    late_fee_percentage: null,
    late_fee_amount: 50000,
    grace_period_days: 3,
    auto_generate: false,
    auto_generate_day: 25,
    enable_late_fee: false,
    late_fee_type: 'fixed',
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
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    try {
      const data = await ApiClient.getPaymentSettings();
      setSettings(data.settings);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await ApiClient.updatePaymentSettings(settings);
      await showSuccess('Berhasil!', 'Settings berhasil disimpan!');
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      await showError('Error', err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
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
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/20 min-h-screen pb-32">
      <AdminHeader title="Billing Settings" showBackButton={true} showMenu={false} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 space-y-8">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary mb-2">Pengaturan Billing</h2>
            <p className="text-on-surface-variant text-sm">
              Konfigurasi sistem billing dan tagihan bulanan
            </p>
          </div>

          {/* Billing Cycle */}
          <div className="space-y-4">
            <h3 className="font-headline text-lg font-bold text-primary">Siklus Tagihan</h3>
            
            <div>
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                Periode Billing (Hari)
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSettings({ ...settings, billing_cycle_days: 25 })}
                  className={`flex-1 px-4 py-3 rounded-xl font-label text-sm font-bold transition-all ${
                    settings.billing_cycle_days === 25
                      ? 'bg-secondary text-white'
                      : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                  }`}
                >
                  25 Hari
                </button>
                <button
                  onClick={() => setSettings({ ...settings, billing_cycle_days: 28 })}
                  className={`flex-1 px-4 py-3 rounded-xl font-label text-sm font-bold transition-all ${
                    settings.billing_cycle_days === 28
                      ? 'bg-secondary text-white'
                      : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                  }`}
                >
                  28 Hari
                </button>
                <button
                  onClick={() => setSettings({ ...settings, billing_cycle_days: 30 })}
                  className={`flex-1 px-4 py-3 rounded-xl font-label text-sm font-bold transition-all ${
                    settings.billing_cycle_days === 30
                      ? 'bg-secondary text-white'
                      : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                  }`}
                >
                  30 Hari
                </button>
              </div>
            </div>

            <div>
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                Tanggal Jatuh Tempo
              </label>
              <select
                className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary"
                value={settings.due_date_day}
                onChange={(e) => setSettings({ ...settings, due_date_day: parseInt(e.target.value) })}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Setiap tanggal {day}
                  </option>
                ))}
              </select>
              <p className="text-xs text-on-surface-variant mt-1">
                Tagihan akan jatuh tempo setiap tanggal ini setiap bulan
              </p>
            </div>
          </div>

          {/* Late Fee */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-primary">Denda Keterlambatan</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.enable_late_fee}
                  onChange={(e) => setSettings({ ...settings, enable_late_fee: e.target.checked })}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>

            {settings.enable_late_fee && (
              <>
                <div>
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                    Tipe Denda
                  </label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSettings({ ...settings, late_fee_type: 'fixed' })}
                      className={`flex-1 px-4 py-3 rounded-xl font-label text-sm font-bold transition-all ${
                        settings.late_fee_type === 'fixed'
                          ? 'bg-secondary text-white'
                          : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                      }`}
                    >
                      Nominal Tetap
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, late_fee_type: 'percentage' })}
                      className={`flex-1 px-4 py-3 rounded-xl font-label text-sm font-bold transition-all ${
                        settings.late_fee_type === 'percentage'
                          ? 'bg-secondary text-white'
                          : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                      }`}
                    >
                      Persentase
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                    {settings.late_fee_type === 'fixed' ? 'Jumlah Denda (Rp)' : 'Persentase Denda (%)'}
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary"
                    value={settings.late_fee_type === 'fixed' ? settings.late_fee_amount || '' : settings.late_fee_percentage || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (settings.late_fee_type === 'fixed') {
                        setSettings({ ...settings, late_fee_amount: value });
                      } else {
                        setSettings({ ...settings, late_fee_percentage: value });
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                    Masa Tenggang (Hari)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary"
                    value={settings.grace_period_days}
                    onChange={(e) => setSettings({ ...settings, grace_period_days: parseInt(e.target.value) || 0 })}
                  />
                  <p className="text-xs text-on-surface-variant mt-1">
                    Denda akan dikenakan setelah masa tenggang berakhir
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Auto Generate */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-lg font-bold text-primary">Auto Generate</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.auto_generate}
                  onChange={(e) => setSettings({ ...settings, auto_generate: e.target.checked })}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-secondary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
              </label>
            </div>

            {settings.auto_generate && (
              <div>
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                  Tanggal Auto Generate
                </label>
                <select
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary"
                  value={settings.auto_generate_day}
                  onChange={(e) => setSettings({ ...settings, auto_generate_day: parseInt(e.target.value) })}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>
                      Setiap tanggal {day}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-on-surface-variant mt-1">
                  Sistem akan otomatis generate tagihan setiap tanggal ini
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-outline-variant/50 text-primary rounded-xl font-label text-sm font-bold hover:bg-surface-container-low transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-secondary/20"
            >
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      </main>

      <AdminBottomNav />
    </div>
  );
}
