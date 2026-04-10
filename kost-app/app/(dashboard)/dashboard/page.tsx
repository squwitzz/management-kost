'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Payment, Room } from '@/app/types';
import { UserHeader, UserBottomNav } from '@/app/components';
import { useAuth } from '@/app/lib/useAuth';
import { ApiClient } from '@/app/lib/api';

// Custom hook for counter animation
const useCountUp = (end: number, duration: number = 2000, start: number = 0) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(start + (end - start) * easeOutQuart);

      countRef.current = currentCount;
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    startTimeRef.current = null;
    requestAnimationFrame(animate);
  }, [end, duration, start]);

  return count;
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth('Penghuni');
  const [user, setUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate amounts first (before any conditional returns)
  const latestPayment = payments.length > 0 ? payments[0] : null;
  const isPaid = latestPayment?.status_bayar === 'Lunas';
  const isPending = latestPayment?.status_bayar === 'Menunggu Verifikasi';
  const monthlyRate = room?.tarif_dasar || 0;
  const outstandingBalance = latestPayment && !isPaid ? latestPayment.jumlah_tagihan : 0;
  const displayAmount = outstandingBalance || monthlyRate;

  // Animated counter - must be called before any conditional returns
  const animatedAmount = useCountUp(displayAmount, 2000);

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser) {
      setUser(authUser);
      setLoading(false);
      
      // Fetch data in parallel without blocking UI
      Promise.all([
        fetchRoomData(authUser.room_id),
        fetchPaymentData(authUser.id)
      ]);
    }
  }, [authLoading, isAuthenticated, authUser]);

  const fetchRoomData = async (roomId: number | undefined) => {
    if (!roomId) {
      console.log('No room_id found for user');
      return;
    }
    
    try {
      const data = await ApiClient.getRoom(roomId);
      setRoom(data.room);
    } catch (err) {
      console.error('Failed to fetch room:', err);
    }
  };

  const fetchPaymentData = async (userId: number) => {
    try {
      const data = await ApiClient.getPayments();
      const userPayments = data.payments.filter((p: Payment) => p.user_id === userId);
      setPayments(userPayments);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <UserHeader user={user} title="Cendana Kost" />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pb-32 pt-4 md:pt-8">
        {/* Hero Section */}
        <div className="mb-8 md:mb-12">
          <p className="text-secondary font-semibold font-label tracking-widest uppercase text-[9px] md:text-[10px] mb-1 md:mb-2">
            Resident Dashboard
          </p>
          <h2 className="text-3xl md:text-5xl font-extrabold font-headline tracking-tight text-primary mb-1 md:mb-2">
            Hello, {user?.nama || 'Guest'}
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base max-w-md">
            Your stay at The Boarding House is currently active. Here&apos;s a summary of your account and room status.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
          {/* Balance Card */}
          <div className="md:col-span-8 bg-surface-container-lowest rounded-xl p-6 md:p-10 flex flex-col justify-between min-h-[240px] md:min-h-[320px] transition-all hover:translate-y-[-4px]">
            <div>
              <div className="flex justify-between items-start mb-8 md:mb-12">
                <div>
                  <span className="font-label text-[9px] md:text-[10px] uppercase tracking-widest text-outline mb-1 block">
                    {outstandingBalance > 0 ? 'Outstanding Balance' : 'Monthly Rate'}
                  </span>
                  <h3 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tighter tabular-nums">
                    Rp {animatedAmount.toLocaleString('id-ID')}
                  </h3>
                </div>
                {outstandingBalance > 0 ? (
                  <div className="bg-error-container text-on-error-container px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[9px] md:text-[11px] font-bold font-label uppercase tracking-tighter">
                    Payment Due
                  </div>
                ) : isPending ? (
                  <div className="bg-tertiary-container/10 text-tertiary px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[9px] md:text-[11px] font-bold font-label uppercase tracking-tighter">
                    Pending
                  </div>
                ) : isPaid ? (
                  <div className="bg-secondary-container text-on-secondary-container px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[9px] md:text-[11px] font-bold font-label uppercase tracking-tighter">
                    Paid
                  </div>
                ) : (
                  <div className="bg-surface-container-highest text-on-surface-variant px-2 md:px-4 py-0.5 md:py-1 rounded-full text-[9px] md:text-[11px] font-bold font-label uppercase tracking-tighter">
                    No Payment
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3 md:gap-6 md:flex-row md:items-center">
              {outstandingBalance > 0 && (
                <button 
                  onClick={() => router.push(`/payments/upload/${latestPayment?.id}`)}
                  className="btn-primary-gradient text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-sm tracking-wide shadow-2xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>

          {/* Room Info Section */}
          <div className="md:col-span-4 bg-secondary rounded-xl p-6 md:p-8 text-on-secondary flex flex-col justify-between overflow-hidden relative min-h-[200px] md:min-h-auto">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div>
              <span className="font-label text-[9px] md:text-[10px] uppercase tracking-widest opacity-70 mb-4 md:mb-8 block">
                Property Assignment
              </span>
              <p className="text-xs md:text-sm font-medium opacity-80 mb-1">Standard Suite</p>
              <h4 className="text-3xl md:text-4xl font-extrabold font-headline tracking-tight mb-4">
                Unit {room?.nomor_kamar || '---'}
              </h4>
            </div>
            <div className="flex items-center gap-3 md:gap-4 bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 border border-white/10">
              <div className="w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></div>
              <div>
                <p className="text-[9px] md:text-[10px] font-label uppercase tracking-tighter opacity-70">Status</p>
                <p className="font-bold text-xs md:text-sm">{room ? 'Active Resident' : 'No Room Assigned'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">

            <div 
              onClick={() => router.push('/requests/create')}
              className="group bg-surface-container-low p-4 md:p-8 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl md:text-3xl">add_circle</span>
                </div>
                <div>
                  <h5 className="font-bold text-sm md:text-lg text-primary">Maintenance Request</h5>
                  <p className="text-[10px] md:text-xs text-on-surface-variant font-label">Report property issues</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity text-lg md:text-xl">
                arrow_forward_ios
              </span>
            </div>

            <div 
              onClick={() => router.push('/payments')}
              className="group bg-surface-container-low p-4 md:p-8 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl md:text-3xl">history</span>
                </div>
                <div>
                  <h5 className="font-bold text-sm md:text-lg text-primary">View History</h5>
                  <p className="text-[10px] md:text-xs text-on-surface-variant font-label">Previous logs &amp; bills</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity text-lg md:text-xl">
                arrow_forward_ios
              </span>
            </div>

            <div 
              onClick={() => router.push('/rules')}
              className="group bg-surface-container-low p-4 md:p-8 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 md:gap-6">
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-white flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl md:text-3xl">rule</span>
                </div>
                <div>
                  <h5 className="font-bold text-sm md:text-lg text-primary">Peraturan Kost</h5>
                  <p className="text-[10px] md:text-xs text-on-surface-variant font-label">View rules &amp; regulations</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline opacity-0 group-hover:opacity-100 transition-opacity text-lg md:text-xl">
                arrow_forward_ios
              </span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="md:col-span-12 mt-4">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h3 className="text-xl md:text-2xl font-bold font-headline text-primary">Recent Activity</h3>
              <div className="h-[1px] flex-grow mx-4 md:mx-8 bg-outline-variant/20"></div>
            </div>
            <div className="space-y-3 md:space-y-4">
              {payments.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-on-surface-variant text-sm">No recent activity</p>
                </div>
              ) : (
                payments.slice(0, 3).map((payment) => (
                  <div
                    key={payment.id}
                    className={`flex items-center justify-between py-4 md:py-6 px-3 md:px-4 rounded-xl ${
                      payment.status_bayar === 'Lunas'
                        ? 'bg-surface-container-low border-l-4 border-secondary'
                        : 'hover:bg-surface-container-low'
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          payment.status_bayar === 'Lunas'
                            ? 'bg-secondary-container/10 text-secondary'
                            : payment.status_bayar === 'Menunggu Verifikasi'
                            ? 'bg-tertiary-container/10 text-tertiary'
                            : 'bg-error-container/10 text-error'
                        }`}
                      >
                        <span
                          className="material-symbols-outlined text-lg md:text-xl"
                          style={
                            payment.status_bayar === 'Lunas' ? { fontVariationSettings: "'FILL' 1" } : {}
                          }
                        >
                          {payment.status_bayar === 'Lunas'
                            ? 'check_circle'
                            : payment.status_bayar === 'Menunggu Verifikasi'
                            ? 'schedule'
                            : 'cancel'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-primary text-sm md:text-base truncate">
                          {payment.status_bayar === 'Lunas'
                            ? 'Payment Confirmed'
                            : payment.status_bayar === 'Menunggu Verifikasi'
                            ? 'Payment Pending'
                            : 'Payment Due'}
                        </p>
                        <p className="text-[10px] md:text-xs text-on-surface-variant font-label mt-0.5 md:mt-1 truncate">
                          {payment.bulan_dibayar} - Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] md:text-xs font-bold font-label text-outline uppercase tracking-tighter flex-shrink-0 ml-2">
                      {payment.tanggal_upload
                        ? new Date(payment.tanggal_upload).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <UserBottomNav />
    </>
  );
}
