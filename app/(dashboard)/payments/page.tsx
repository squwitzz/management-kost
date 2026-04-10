'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/app/types';
import UserHeader from '@/app/components/UserHeader';
import UserBottomNav from '@/app/components/UserBottomNav';
import { ApiClient } from '@/app/lib/api';

interface Payment {
  id: number;
  jumlah_tagihan: number;
  status_bayar: string;
  bulan_dibayar: string;
  due_date: string;
  bukti_bayar?: string;
}

export default function UserPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    if (parsedUser.role !== 'Penghuni') {
      router.push('/admin/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchPayments();
  }, [router]);

  const fetchPayments = async () => {
    try {
      const data = await ApiClient.getPayments();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const unpaidPayments = payments.filter(p => p.status_bayar === 'Belum Lunas');
  const pendingPayments = payments.filter(p => p.status_bayar === 'Menunggu Verifikasi');
  const paidPayments = payments.filter(p => p.status_bayar === 'Lunas');

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/20 min-h-screen pb-32">
      <UserHeader />

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-12">
        {/* Header */}
        <div className="mb-12">
          <p className="font-label text-secondary font-semibold tracking-widest uppercase text-[10px] mb-3">
            Payment History
          </p>
          <h2 className="font-headline font-extrabold text-4xl md:text-6xl text-primary tracking-tighter leading-none">
            My Payments
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-error-container/10 px-4 py-3 rounded-xl">
            <span className="font-label text-[10px] text-error font-bold uppercase tracking-wider block mb-1">
              Unpaid
            </span>
            <span className="font-headline text-2xl font-bold text-error">{unpaidPayments.length}</span>
          </div>
          <div className="bg-tertiary-container/10 px-4 py-3 rounded-xl">
            <span className="font-label text-[10px] text-tertiary font-bold uppercase tracking-wider block mb-1">
              Pending
            </span>
            <span className="font-headline text-2xl font-bold text-tertiary">{pendingPayments.length}</span>
          </div>
          <div className="bg-secondary-container/10 px-4 py-3 rounded-xl">
            <span className="font-label text-[10px] text-secondary font-bold uppercase tracking-wider block mb-1">
              Paid
            </span>
            <span className="font-headline text-2xl font-bold text-secondary">{paidPayments.length}</span>
          </div>
        </div>

        {/* Unpaid Payments */}
        {unpaidPayments.length > 0 && (
          <div className="mb-8">
            <h3 className="font-headline text-lg font-bold text-error mb-4">Belum Dibayar</h3>
            <div className="space-y-3">
              {unpaidPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-surface-container-lowest rounded-xl p-4 md:p-6 hover:bg-surface-container-low transition-colors cursor-pointer"
                  onClick={() => router.push(`/payments/upload/${payment.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-headline font-bold text-primary">{payment.bulan_dibayar}</h4>
                      <p className="font-label text-xs text-on-surface-variant">
                        Due: {new Date(payment.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline text-xl font-bold text-primary">
                        Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                      </p>
                      <span className="inline-block px-3 py-1 bg-error-container text-on-error-container text-[10px] font-label font-bold rounded-full uppercase mt-1">
                        Unpaid
                      </span>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-6 py-3 bg-gradient-to-br from-secondary to-secondary-container text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-secondary/20">
                    Upload Bukti Pembayaran
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <div className="mb-8">
            <h3 className="font-headline text-lg font-bold text-tertiary mb-4">Menunggu Verifikasi</h3>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-surface-container-lowest rounded-xl p-4 md:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-headline font-bold text-primary">{payment.bulan_dibayar}</h4>
                      <p className="font-label text-xs text-on-surface-variant">
                        Uploaded • Waiting for admin verification
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline text-xl font-bold text-primary">
                        Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                      </p>
                      <span className="inline-block px-3 py-1 bg-tertiary-container/10 text-tertiary text-[10px] font-label font-bold rounded-full uppercase mt-1">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Paid Payments */}
        {paidPayments.length > 0 && (
          <div className="mb-8">
            <h3 className="font-headline text-lg font-bold text-secondary mb-4">Lunas</h3>
            <div className="space-y-3">
              {paidPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-surface-container-lowest rounded-xl p-4 md:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-headline font-bold text-primary">{payment.bulan_dibayar}</h4>
                      <p className="font-label text-xs text-on-surface-variant">
                        Verified • Payment confirmed
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline text-xl font-bold text-primary">
                        Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                      </p>
                      <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-label font-bold rounded-full uppercase mt-1">
                        Paid
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {payments.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">receipt_long</span>
            <p className="text-on-surface-variant text-lg">Belum ada tagihan</p>
          </div>
        )}
      </main>

      <UserBottomNav />
    </div>
  );
}
