'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
import { showSuccess, showError, showConfirm } from '@/app/lib/sweetalert';

interface PreviewItem {
  user_id: number;
  user_name: string;
  room_number: string;
  tarif_dasar: number;
  jumlah_tagihan: number;
}

export default function GeneratePaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [periode, setPeriode] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [generateAll, setGenerateAll] = useState(true);

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
    
    // Set default periode to next month
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    setPeriode(`${monthNames[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`);
    
    setLoading(false);
  }, [router]);

  const handlePreview = async () => {
    if (!periode) {
      await showError('Error', 'Silakan pilih periode');
      return;
    }

    try {
      console.log('Previewing payments for periode:', periode);
      const API_URL = getApiUrl();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/billing/preview`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          periode,
        }),
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      console.log('Preview response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Preview data:', data);
        setPreview(data.preview);
        setDueDate(data.due_date);
      } else {
        const error = await response.json();
        console.error('Preview error:', error);
        await showError('Error', error.error || 'Failed to preview payments');
      }
    } catch (err: any) {
      console.error('Failed to preview:', err);
      await showError('Error', err.message || 'Failed to preview payments');
    }
  };

  const handleGenerate = async () => {
    if (!periode) {
      await showError('Error', 'Silakan pilih periode');
      return;
    }

    if (preview.length === 0) {
      await showError('Error', 'Silakan preview terlebih dahulu');
      return;
    }

    const result = await showConfirm(
      'Generate Tagihan',
      `Generate ${preview.length} tagihan untuk periode ${periode}?`,
      'Generate'
    );

    if (!result.isConfirmed) {
      return;
    }

    setGenerating(true);

    try {
      console.log('Generating payments for periode:', periode, 'due_date:', dueDate);
      const API_URL = getApiUrl();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/billing/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          periode,
          due_date: dueDate,
        }),
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      console.log('Generate response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Generate data:', data);
        await showSuccess('Berhasil!', `Berhasil generate ${data.generated_count} tagihan!`);
        router.push('/admin/payments');
      } else {
        const error = await response.json();
        console.error('Generate error:', error);
        await showError('Error', error.error || 'Failed to generate payments');
      }
    } catch (err: any) {
      console.error('Failed to generate:', err);
      await showError('Error', err.message || 'Failed to generate payments');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const totalAmount = preview.reduce((sum, item) => sum + item.jumlah_tagihan, 0);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/20 min-h-screen pb-32">
      <AdminHeader title="Generate Tagihan" showBackButton={true} showMenu={false} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary mb-2">Generate Tagihan Bulanan</h2>
            <p className="text-on-surface-variant text-sm">
              Generate tagihan untuk semua penghuni aktif. Anda dapat edit tagihan sebelum mengirimkannya.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                Periode Tagihan
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary"
                placeholder="Januari 2026"
                value={periode}
                onChange={(e) => setPeriode(e.target.value)}
              />
              <p className="text-xs text-on-surface-variant mt-1">Format: Januari 2026 atau 2026-01</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="generateAll"
                className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary"
                checked={generateAll}
                onChange={(e) => setGenerateAll(e.target.checked)}
              />
              <label htmlFor="generateAll" className="font-body text-sm text-on-surface">
                Generate untuk semua penghuni aktif
              </label>
            </div>

            <button
              onClick={handlePreview}
              className="w-full px-6 py-3 bg-surface-container-high text-primary rounded-xl font-label text-sm font-bold hover:bg-surface-container-highest transition-all active:scale-95"
            >
              Preview Tagihan
            </button>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-lg font-bold text-primary">Preview Tagihan</h3>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">Jatuh Tempo</p>
                  <p className="font-label text-sm font-bold text-primary">
                    {new Date(dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="bg-surface-container-high rounded-xl overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {preview.map((item) => (
                    <div
                      key={item.user_id}
                      className="flex items-center justify-between p-4 border-b border-outline-variant/10 last:border-0"
                    >
                      <div>
                        <p className="font-headline font-bold text-primary">{item.user_name}</p>
                        <p className="font-label text-xs text-on-surface-variant">Room {item.room_number}</p>
                      </div>
                      <p className="font-headline font-bold text-primary">
                        Rp {item.jumlah_tagihan.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary-container/10 rounded-xl">
                <div>
                  <p className="font-label text-xs text-secondary uppercase tracking-wider">Total Tagihan</p>
                  <p className="font-headline text-2xl font-bold text-secondary">
                    Rp {totalAmount.toLocaleString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-label text-xs text-on-surface-variant">Total Penghuni</p>
                  <p className="font-headline text-2xl font-bold text-primary">{preview.length}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border border-outline-variant/50 text-primary rounded-xl font-label text-sm font-bold hover:bg-surface-container-low transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-secondary/20"
                >
                  {generating ? 'Generating...' : 'Generate Tagihan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <AdminBottomNav />
    </div>
  );
}
