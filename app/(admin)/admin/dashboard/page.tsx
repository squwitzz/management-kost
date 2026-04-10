'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';

interface DashboardStats {
  totalRevenue: number;
  occupancyRate: number;
  occupiedRooms: number;
  totalRooms: number;
  pendingPayments: number;
  recentActivities: Array<{
    id: number;
    user_name: string;
    room_number: string;
    amount: number;
    time: string;
    status: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    occupancyRate: 0,
    occupiedRooms: 0,
    totalRooms: 0,
    pendingPayments: 0,
    recentActivities: [],
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
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch rooms
      const roomsResponse = await fetch('http://127.0.0.1:8000/api/rooms', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      // Fetch payments
      const paymentsResponse = await fetch('http://127.0.0.1:8000/api/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (roomsResponse.ok && paymentsResponse.ok) {
        const roomsData = await roomsResponse.json();
        const paymentsData = await paymentsResponse.json();

        const rooms = roomsData.rooms || [];
        const payments = paymentsData.payments || [];

        // Calculate stats
        const totalRooms = rooms.length;
        const occupiedRooms = rooms.filter((r: any) => r.status === 'Terisi').length;
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

        // Calculate total revenue from paid payments
        const paidPayments = payments.filter((p: any) => p.status_bayar === 'Lunas');
        const totalRevenue = paidPayments.reduce((sum: number, p: any) => sum + p.jumlah_tagihan, 0);

        // Count pending payments
        const pendingPayments = payments.filter((p: any) => p.status_bayar === 'Menunggu Verifikasi').length;

        // Get recent activities (last 5 verified payments)
        const recentActivities = paidPayments
          .sort((a: any, b: any) => new Date(b.tanggal_verifikasi || b.created_at).getTime() - new Date(a.tanggal_verifikasi || a.created_at).getTime())
          .slice(0, 5)
          .map((p: any) => ({
            id: p.id,
            user_name: p.user?.nama || 'Unknown',
            room_number: p.user?.room?.nomor_kamar || '-',
            amount: p.jumlah_tagihan,
            time: getTimeAgo(p.tanggal_verifikasi || p.created_at),
            status: 'Verified',
          }));

        setStats({
          totalRevenue,
          occupancyRate,
          occupiedRooms,
          totalRooms,
          pendingPayments,
          recentActivities,
        });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/20">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-6 md:px-8 pt-6 md:pt-8 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Hero Section: Total Monthly Revenue */}
        <section className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-8 md:p-10 flex flex-col justify-between min-h-[300px] md:min-h-[320px] relative overflow-hidden">
          <div className="z-10">
            <span className="font-label text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-outline/80">
              Total Revenue (Paid)
            </span>
            <div className="mt-2 flex flex-col md:flex-row md:items-baseline md:gap-4">
              <h2 className="font-headline font-extrabold text-[3.5rem] md:text-[4rem] leading-none tracking-tighter text-primary">
                Rp {stats.totalRevenue.toLocaleString('id-ID')}
              </h2>
            </div>
          </div>
          <div className="absolute right-[-10%] bottom-[-10%] w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
          <div className="z-10 flex flex-row gap-3 mt-8">
            <button 
              onClick={() => router.push('/admin/payments')}
              className="flex-1 md:flex-none bg-primary text-white px-6 md:px-8 py-4 rounded-2xl font-label text-sm font-bold tracking-tight active:scale-95 transition-all shadow-lg shadow-primary/10"
            >
              View Payments
            </button>
            <button 
              onClick={() => router.push('/admin/rooms')}
              className="flex-1 md:flex-none border border-outline-variant/50 text-primary px-6 md:px-8 py-4 rounded-2xl font-label text-sm font-bold tracking-tight hover:bg-surface-container-low transition-all"
            >
              Manage Rooms
            </button>
          </div>
        </section>

        {/* Occupancy Rate Circular Gauge */}
        <section className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <span className="font-label text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-outline/80 mb-8">
            Occupancy Rate
          </span>
          <div className="relative w-44 h-44 md:w-48 md:h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                className="text-surface-container-highest"
                cx="50%"
                cy="50%"
                fill="transparent"
                r="40%"
                stroke="currentColor"
                strokeWidth="12"
              ></circle>
              <circle
                className="text-secondary rounded-full"
                cx="50%"
                cy="50%"
                fill="transparent"
                r="40%"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * stats.occupancyRate) / 100}
                strokeLinecap="round"
                strokeWidth="12"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-headline font-extrabold text-4xl md:text-5xl text-primary">{stats.occupancyRate}%</span>
              <span className="font-label text-[10px] text-outline font-bold mt-1">
                {stats.occupiedRooms} / {stats.totalRooms} ROOMS
              </span>
            </div>
          </div>
          <p className="mt-8 font-body text-sm text-on-surface-variant font-medium leading-relaxed">
            {stats.occupancyRate >= 80 ? 'Optimal performance.' : 'Room availability.'}
            <br />{stats.totalRooms - stats.occupiedRooms} rooms available.
          </p>
        </section>

        {/* Pending Payments Bento Card */}
        <section 
          onClick={() => router.push('/admin/payments')}
          className="md:col-span-4 bg-secondary text-on-secondary-container rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between min-h-[280px] cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="z-10 relative">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-2xl text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  payments
                </span>
              </div>
              {stats.pendingPayments > 0 && (
                <span className="bg-white/20 px-3 py-1.5 rounded-full font-label text-[9px] font-extrabold tracking-widest uppercase text-white">
                  Urgent
                </span>
              )}
            </div>
            <div className="mt-10">
              <h3 className="font-headline font-extrabold text-5xl text-white">
                {stats.pendingPayments.toString().padStart(2, '0')}
              </h3>
              <p className="font-label text-[10px] font-bold opacity-80 uppercase tracking-[0.15em] mt-2">
                Pending Verification
              </p>
            </div>
          </div>
          <button className="relative z-10 w-full bg-white text-secondary py-4 rounded-2xl font-label text-sm font-extrabold active:scale-95 transition-all shadow-xl shadow-black/10">
            Review Payments
          </button>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none"></div>
        </section>

        {/* Recent Activities Feed */}
        <section className="md:col-span-8 bg-surface-container-low/50 rounded-2xl p-8 md:p-10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-headline font-extrabold text-xl md:text-2xl text-primary">Recent Activities</h3>
            <button 
              onClick={() => router.push('/admin/payments')}
              className="font-label text-[11px] font-extrabold text-secondary uppercase tracking-wider hover:opacity-70 transition-opacity"
            >
              View All
            </button>
          </div>
          <div className="space-y-2">
            {stats.recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-3">receipt_long</span>
                <p className="text-on-surface-variant">No recent activities</p>
              </div>
            ) : (
              stats.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-container-lowest transition-colors group"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-surface-container-lowest flex items-center justify-center border border-outline-variant/10 shadow-sm">
                      <span className="material-symbols-outlined text-secondary text-2xl">person</span>
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-primary text-sm md:text-base">
                        {activity.user_name}
                      </h4>
                      <p className="font-label text-[11px] text-outline font-medium mt-0.5 uppercase tracking-wide">
                        Room {activity.room_number} • {activity.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-headline font-extrabold text-primary md:text-lg">
                      Rp {activity.amount.toLocaleString('id-ID')}
                    </span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
                      <span className="font-label text-[9px] text-secondary font-bold uppercase tracking-widest">
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-28 right-6 md:right-8 z-50">
        <button 
          onClick={() => router.push('/admin/register-resident')}
          className="w-14 h-14 md:w-16 md:h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 active:scale-90 transition-transform hover:scale-105"
        >
          <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            add
          </span>
        </button>
      </div>

      <AdminBottomNav />
    </div>
  );
}
