'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Room, User } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { ApiClient } from '@/app/lib/api';
import { showSuccess, showError, showDeleteConfirm } from '@/app/lib/sweetalert';

export default function RoomsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
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

    if (parsedUser.role !== 'Admin') {
      router.push('/dashboard');
      return;
    }

    setUser(parsedUser);
    fetchRooms();
  }, [router]);

  const fetchRooms = async () => {
    try {
      const data = await ApiClient.getRooms();
      setRooms(data.rooms);
    } catch (err: any) {
      console.error('Failed to fetch rooms:', err);
      await showError('Error', err.message || 'Gagal memuat data kamar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId: number, roomNumber: string) => {
    const result = await showDeleteConfirm(`Kamar ${roomNumber}`);
    if (!result.isConfirmed) return;

    try {
      await ApiClient.deleteRoom(roomId);
      await showSuccess('Success!', 'Kamar berhasil dihapus');
      fetchRooms();
    } catch (err: any) {
      await showError('Error', err.message || 'Gagal menghapus kamar');
      console.error('Delete error:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'Terisi').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/20">
      <AdminHeader />

      <main className="max-w-5xl mx-auto px-8 pt-12 pb-32">
        {/* Header Section */}
        <div className="mb-16">
          <p className="font-label text-secondary font-semibold tracking-widest uppercase text-[10px] mb-3">
            Inventory Overview
          </p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-headline font-extrabold text-5xl md:text-6xl text-primary tracking-tighter leading-none">
              Property <br />
              Directory.
            </h2>
            <div className="flex gap-3">
              <div className="bg-surface-container-low px-6 py-4 rounded-xl flex flex-col gap-1 min-w-[140px]">
                <span className="font-label text-[10px] text-outline font-bold uppercase tracking-wider">
                  Total Rooms
                </span>
                <span className="font-headline text-2xl font-bold">{totalRooms}</span>
              </div>
              <div className="bg-secondary-container/10 px-6 py-4 rounded-xl flex flex-col gap-1 min-w-[140px]">
                <span className="font-label text-[10px] text-secondary font-bold uppercase tracking-wider">
                  Occupied
                </span>
                <span className="font-headline text-2xl font-bold text-secondary">{occupancyRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Room List */}
        <div className="flex flex-col gap-0 border-t border-outline-variant/15">
          {rooms.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-on-surface-variant text-lg">Belum ada kamar. Silakan tambahkan kamar baru.</p>
            </div>
          ) : (
            rooms.map((room, index) => {
              const resident = room.users && room.users.length > 0 ? room.users[0] : null;
              const isOverdue = false; // You can add payment logic here

              return (
                <div key={room.id}>
                  <div className="group flex items-center justify-between py-6 md:py-10 transition-all hover:bg-surface-container-low/50 px-4 -mx-4 rounded-2xl">
                    {/* Left Side - Room Number & Resident */}
                    <div className="flex items-center gap-4 md:gap-20 flex-1 min-w-0">
                      {/* Room Number */}
                      <div className="flex flex-col flex-shrink-0">
                        <span className="font-label text-[10px] md:text-[11px] text-outline font-bold uppercase tracking-[0.2em] mb-1">
                          Room
                        </span>
                        <span className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-tight">
                          {room.nomor_kamar}
                        </span>
                      </div>
                      
                      {/* Resident Name */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-label text-[10px] md:text-[11px] text-outline font-bold uppercase tracking-[0.2em] mb-1">
                          Resident
                        </span>
                        <span className="font-headline text-base md:text-xl text-on-surface font-medium truncate">
                          {resident ? resident.nama : '-'}
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Rate, Status & Actions */}
                    <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                      {/* Rate - Hidden on mobile, shown on desktop */}
                      <div className="hidden md:flex flex-col">
                        <span className="font-label text-[11px] text-outline font-bold uppercase tracking-[0.2em] mb-1">
                          Rate
                        </span>
                        <span className="font-headline text-lg text-on-surface font-medium">
                          Rp {room.tarif_dasar.toLocaleString('id-ID')}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col items-end">
                        <span className="font-label text-[10px] md:text-[11px] text-outline font-bold uppercase tracking-[0.2em] mb-1 md:mb-2">
                          Status
                        </span>
                        {room.status === 'Kosong' ? (
                          <span className="bg-surface-container-highest text-on-surface-variant font-label text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 md:gap-1.5">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-outline"></span>
                            Kosong
                          </span>
                        ) : isOverdue ? (
                          <span className="bg-error-container text-on-error-container font-label text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 md:gap-1.5">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-error"></span>
                            Overdue
                          </span>
                        ) : (
                          <span className="bg-surface-container-highest text-on-surface-variant font-label text-[9px] md:text-[10px] font-bold px-2 md:px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 md:gap-1.5">
                            <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-secondary"></span>
                            Paid
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 md:gap-3">
                        {room.status === 'Kosong' && (
                          <button
                            onClick={() => handleDeleteRoom(room.id, room.nomor_kamar)}
                            className="text-error hover:text-error/80 transition-colors duration-200"
                            title="Delete Room"
                          >
                            <span className="material-symbols-outlined text-xl md:text-2xl">delete</span>
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/admin/rooms/${room.id}`)}
                          className="text-primary hover:text-secondary transition-colors duration-200"
                        >
                          <span className="material-symbols-outlined text-xl md:text-2xl">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < rooms.length - 1 && <div className="h-px w-full bg-surface-container-high"></div>}
                </div>
              );
            })
          )}
        </div>

        {/* Add Room Button */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => router.push('/admin/rooms/add')}
            className="group flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-full font-label font-bold text-sm hover:opacity-90 transition-all active:scale-95 shadow-2xl shadow-primary/20"
          >
            <span>Add New Room</span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              add
            </span>
          </button>
        </div>
      </main>

      <AdminBottomNav />
    </div>
  );
}
