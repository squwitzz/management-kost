'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Payment } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [drafts, setDrafts] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'drafts'>('all');
  const [selectedDrafts, setSelectedDrafts] = useState<number[]>([]);
  const [bulkFinalizing, setBulkFinalizing] = useState(false);

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
    fetchPayments();
    fetchDrafts();
  }, [router]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrafts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/billing/drafts', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDrafts(data.drafts || []);
      }
    } catch (err) {
      console.error('Failed to fetch drafts:', err);
    }
  };

  const toggleDraftSelection = (id: number) => {
    setSelectedDrafts((prev) =>
      prev.includes(id) ? prev.filter((draftId) => draftId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDrafts.length === drafts.length) {
      setSelectedDrafts([]);
    } else {
      setSelectedDrafts(drafts.map((d: any) => d.id));
    }
  };

  const handleBulkFinalize = async () => {
    if (selectedDrafts.length === 0) {
      alert('Pilih minimal 1 draft untuk di-finalize');
      return;
    }

    if (!confirm(`Finalize ${selectedDrafts.length} tagihan? Tagihan akan dikirim ke penghuni.`)) {
      return;
    }

    setBulkFinalizing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/billing/payments/bulk-finalize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          payment_ids: selectedDrafts,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Berhasil finalize ${data.finalized_count} tagihan!`);
        setSelectedDrafts([]);
        fetchPayments();
        fetchDrafts();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to finalize payments');
      }
    } catch (err) {
      console.error('Failed to bulk finalize:', err);
      alert('Failed to finalize payments');
    } finally {
      setBulkFinalizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const finalizedPayments = payments.filter((p: any) => p.is_finalized);
  const pendingVerification = finalizedPayments.filter((p: any) => p.status_bayar === 'Menunggu Verifikasi');
  const totalAmount = finalizedPayments.reduce((sum, p) => sum + p.jumlah_tagihan, 0);
  const paidCount = finalizedPayments.filter((p) => p.status_bayar === 'Lunas').length;
  const unpaidCount = finalizedPayments.filter((p) => p.status_bayar === 'Belum Lunas').length;

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/20">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 md:pt-12 pb-32">
        {/* Header Section */}
        <div className="mb-12 md:mb-16">
          <p className="font-label text-secondary font-semibold tracking-widest uppercase text-[10px] mb-3">
            Financial Management
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-headline font-extrabold text-4xl md:text-6xl text-primary tracking-tighter leading-none">
              Payment <br className="md:hidden" />
              Management.
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/payments/generate')}
                className="flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-secondary/20"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Generate Tagihan
              </button>
              <button
                onClick={() => router.push('/admin/payments/settings')}
                className="flex items-center gap-2 px-6 py-3 bg-surface-container-low text-primary rounded-xl font-label text-sm font-bold hover:bg-surface-container-high transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-lg">settings</span>
                <span className="hidden md:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-surface-container-lowest px-6 py-4 rounded-xl">
            <span className="font-label text-[10px] text-outline font-bold uppercase tracking-wider block mb-1">
              Total Tagihan
            </span>
            <span className="font-headline text-2xl font-bold text-primary">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-secondary-container/10 px-6 py-4 rounded-xl">
            <span className="font-label text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">
              Lunas
            </span>
            <span className="font-headline text-2xl font-bold text-secondary">{paidCount}</span>
          </div>
          <div className="bg-error-container/10 px-6 py-4 rounded-xl">
            <span className="font-label text-[10px] text-error font-bold uppercase tracking-wider block mb-1">
              Belum Lunas
            </span>
            <span className="font-headline text-2xl font-bold text-error">{unpaidCount}</span>
          </div>
          <div className="bg-tertiary-container/10 px-6 py-4 rounded-xl">
            <span className="font-label text-[10px] text-tertiary font-bold uppercase tracking-wider block mb-1">
              Pending
            </span>
            <span className="font-headline text-2xl font-bold text-tertiary">{pendingVerification.length}</span>
          </div>
          <div className="bg-tertiary-container/10 px-6 py-4 rounded-xl">
            <span className="font-label text-[10px] text-tertiary font-bold uppercase tracking-wider block mb-1">
              Draft
            </span>
            <span className="font-headline text-2xl font-bold text-tertiary">{drafts.length}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between mb-6 border-b border-outline-variant/15">
          <div className="flex gap-4">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedDrafts([]);
              }}
              className={`pb-3 px-2 font-label text-sm font-bold transition-all ${
                activeTab === 'all'
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              All Payments ({finalizedPayments.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('drafts');
                setSelectedDrafts([]);
              }}
              className={`pb-3 px-2 font-label text-sm font-bold transition-all ${
                activeTab === 'drafts'
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Drafts ({drafts.length})
            </button>
          </div>

          {activeTab === 'drafts' && drafts.length > 0 && (
            <div className="flex items-center gap-3 pb-3">
              {selectedDrafts.length > 0 && (
                <>
                  <span className="text-xs text-on-surface-variant font-label">
                    {selectedDrafts.length} dipilih
                  </span>
                  <button
                    onClick={handleBulkFinalize}
                    disabled={bulkFinalizing}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-label text-xs font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">send</span>
                    {bulkFinalizing ? 'Mengirim...' : 'Finalize Terpilih'}
                  </button>
                </>
              )}
              <button
                onClick={toggleSelectAll}
                className="text-xs font-label font-bold text-secondary hover:underline"
              >
                {selectedDrafts.length === drafts.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </button>
            </div>
          )}
        </div>

        {/* Payments List */}
        <div className="bg-surface-container-lowest rounded-xl overflow-hidden">
          {activeTab === 'all' ? (
            <div className="divide-y divide-outline-variant/10">
              {finalizedPayments.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-on-surface-variant text-lg">Belum ada tagihan. Silakan generate tagihan baru.</p>
                </div>
              ) : (
                finalizedPayments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 md:p-6 hover:bg-surface-container-low transition-colors"
                  >
                    <div 
                      className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/admin/payments/${payment.id}`)}
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-secondary text-xl">payments</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-headline font-bold text-primary truncate">
                          {payment.user?.nama || 'Unknown'}
                        </h3>
                        <p className="font-label text-xs text-on-surface-variant">
                          {payment.bulan_dibayar} • Room {payment.user?.room?.nomor_kamar || '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right hidden md:block">
                        <p className="font-headline font-bold text-primary">
                          Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                        </p>
                        <p className="font-label text-xs text-on-surface-variant">
                          Due: {payment.due_date ? new Date(payment.due_date).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>
                      {payment.status_bayar === 'Lunas' ? (
                        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-label font-bold rounded-full uppercase">
                          Paid
                        </span>
                      ) : payment.status_bayar === 'Menunggu Verifikasi' ? (
                        <>
                          <span className="px-3 py-1 bg-tertiary-container/10 text-tertiary text-[10px] font-label font-bold rounded-full uppercase">
                            Pending
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/admin/payments/${payment.id}`);
                            }}
                            className="hidden md:flex items-center gap-1 px-3 py-1.5 bg-secondary text-white rounded-lg font-label text-xs font-bold hover:opacity-90 transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Konfirmasi
                          </button>
                        </>
                      ) : (
                        <span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-label font-bold rounded-full uppercase">
                          Unpaid
                        </span>
                      )}
                      <span 
                        className="material-symbols-outlined text-outline-variant cursor-pointer"
                        onClick={() => router.push(`/admin/payments/${payment.id}`)}
                      >
                        chevron_right
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/10">
              {drafts.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-on-surface-variant text-lg">Tidak ada draft tagihan.</p>
                </div>
              ) : (
                drafts.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 md:p-6 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        className="w-5 h-5 rounded border-outline-variant text-secondary focus:ring-secondary cursor-pointer"
                        checked={selectedDrafts.includes(payment.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleDraftSelection(payment.id);
                        }}
                      />
                      <div
                        className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
                        onClick={() => router.push(`/admin/payments/${payment.id}/edit`)}
                      >
                        <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-tertiary text-xl">draft</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-headline font-bold text-primary truncate">
                            {payment.user?.nama || 'Unknown'}
                          </h3>
                          <p className="font-label text-xs text-on-surface-variant">
                            {payment.bulan_dibayar} • Room {payment.user?.room?.nomor_kamar || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-4 flex-shrink-0 cursor-pointer"
                      onClick={() => router.push(`/admin/payments/${payment.id}/edit`)}
                    >
                      <div className="text-right hidden md:block">
                        <p className="font-headline font-bold text-primary">
                          Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                        </p>
                        <p className="font-label text-xs text-tertiary">Draft - Not sent</p>
                      </div>
                      <span className="px-3 py-1 bg-tertiary-container/10 text-tertiary text-[10px] font-label font-bold rounded-full uppercase">
                        Draft
                      </span>
                      <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <AdminBottomNav />
    </div>
  );
}
