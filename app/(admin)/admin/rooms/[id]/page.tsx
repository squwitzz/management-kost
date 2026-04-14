'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Room, Payment } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import PaymentHistoryTable from '@/app/components/PaymentHistoryTable';
import PaymentSummary from '@/app/components/PaymentSummary';
import { ApiClient, getApiUrl, getImageUrl } from '@/app/lib/api';
import { showSuccess, showError, showConfirm } from '@/app/lib/sweetalert';

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showEditPriceModal, setShowEditPriceModal] = useState(false);
  const [newPrice, setNewPrice] = useState<string>('');
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

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

    fetchRoomDetail();
  }, [roomId, router]);

  const fetchRoomDetail = async () => {
    try {
      const data = await ApiClient.getRoom(parseInt(roomId));
      const roomData = data.room || data.data || data;
      
      if (roomData && roomData.id) {
        setRoom(roomData);
        fetchPayments(roomData);
      } else {
        await showError('Error', 'Room tidak ditemukan');
      }
    } catch (err: any) {
      await showError('Error', err.message || 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (roomData: Room) => {
    try {
      // Try to fetch room-specific payments first
      try {
        const data = await ApiClient.getRoomPayments(parseInt(roomId));
        const paymentsData = data.payments || data.data || [];
        setPayments(paymentsData);
        return;
      } catch (roomErr) {
        // Fallback to all payments
      }
      
      // Fallback: fetch all payments and filter by room
      const data = await ApiClient.getAdminPayments();
      const allPayments = data.payments || data.data || [];
      
      // Get user IDs from room users
      const roomUserIds = roomData?.users?.map(u => u.id) || [];
      
      // Alternative: filter payments where user.room_id matches this room
      const roomPayments = allPayments.filter((p: Payment) => {
        // Check if payment has user data with room_id
        if (p.user && p.user.room_id) {
          return Number(p.user.room_id) === Number(roomData.id);
        }
        
        // Fallback: check if user_id is in roomUserIds
        if (roomUserIds.length > 0) {
          return roomUserIds.includes(p.user_id);
        }
        
        return false;
      });
      
      setPayments(roomPayments);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  };

  const handleRemoveResident = async () => {
    const result = await showConfirm(
      'Kosongkan Kamar?',
      `Apakah Anda yakin ingin mengosongkan kamar ini? Penghuni ${resident?.nama} hanya akan dilepas dari unit ini, namun data akun penghuni TIDAK akan dihapus.`,
      'Ya, Kosongkan'
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl()}/rooms/${roomId}/remove-resident`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      if (response.ok) {
        await showSuccess('Berhasil!', 'Penghuni berhasil dikosongkan dari kamar!');
        setShowRemoveModal(false);
        fetchRoomDetail(); // Refresh room data
      } else {
        const data = await response.json();
        await showError('Error', data.error || 'Gagal mengosongkan kamar');
      }
    } catch (err) {
      await showError('Error', 'Gagal mengosongkan kamar');
      console.error('Remove resident error:', err);
    }
  };

  const handleEditPrice = () => {
    setNewPrice(room?.tarif_dasar.toString() || '');
    setShowEditPriceModal(true);
  };

  const handleUpdatePrice = async () => {
    if (!newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
      await showError('Error', 'Masukkan harga yang valid');
      return;
    }

    const result = await showConfirm(
      'Update Harga Kamar?',
      `Apakah Anda yakin ingin mengubah harga kamar dari Rp ${room?.tarif_dasar.toLocaleString('id-ID')} menjadi Rp ${Number(newPrice).toLocaleString('id-ID')}?`,
      'Ya, Update'
    );

    if (!result.isConfirmed) {
      return;
    }

    setIsUpdatingPrice(true);
    try {
      await ApiClient.updateRoom(parseInt(roomId), {
        tarif_dasar: Number(newPrice),
      });

      await showSuccess('Berhasil!', 'Harga kamar berhasil diupdate!');
      setShowEditPriceModal(false);
      fetchRoomDetail(); // Refresh room data
    } catch (err: any) {
      console.error('Update price error:', err);
      await showError('Error', err.message || 'Gagal mengupdate harga kamar');
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Room not found</p>
      </div>
    );
  }

  const resident = room.users && room.users.length > 0 ? room.users[0] : null;
  const roomPayments = resident ? payments.filter(p => p.user_id === resident.id) : [];

  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-24">
      <AdminHeader title="Room Details" showBackButton={true} showMenu={false} />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Resident Profile Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-7 bg-surface-container-lowest p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <img
                alt={resident?.nama || 'No Resident'}
                className="w-32 h-32 rounded-full object-cover"
                src={
                  resident?.foto_penghuni
                    ? getImageUrl(resident.foto_penghuni)
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUe_fqSs_mEXImBn1Td_tce-oeWCz2RBOuzeAboY3q2ZSX3x1uhrrYkxyULXIOX-K8gQ7Gwf_Fewm-Dv05BdoAqlylRvBeuzeOje2aH2__JR3wjlyUbdLvM57eBZW52YNy7NHprIBSPZdV0nAq9pgCb4ALVjfkw_NqusJdPlOsrujJK-1utnB_yWit4dwKrwmjHjTlCZQAjqxk3wcTGByTJZPI6r1j8XXvOCoUDWUFX7jxjK0OPESkDug1XkKIWMg9cYssyxUnL40'
                }
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider font-label shadow-sm">
                {room.status === 'Terisi' ? 'Active Resident' : 'Vacant'}
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <div className="text-primary-fixed-variant text-sm font-label font-semibold tracking-widest uppercase opacity-60">
                Primary Resident
              </div>
              <h2 className="text-3xl font-headline font-extrabold tracking-tight text-on-background">
                {resident?.nama || 'No Resident'}
              </h2>
              {resident && (
                <>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant font-medium">
                    <span className="material-symbols-outlined text-secondary scale-75">call</span>
                    <span className="font-label">{resident.nomor_telepon}</span>
                  </div>
                  {resident.email && (
                    <div className="flex items-center justify-center md:justify-start gap-2 text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-secondary scale-75">mail</span>
                      <span className="font-label">{resident.email}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Room Stats Card */}
          <div className="md:col-span-5 bg-surface-container-low p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-label font-bold uppercase tracking-widest text-primary opacity-50 mb-4">
                Current Unit
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-headline font-black text-secondary">{room.nomor_kamar}</span>
                <span className="text-xl font-headline font-bold text-primary">Standard Suite</span>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-outline-variant/15 space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex-1">
                  <p className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant">
                    Monthly Rate
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-headline font-bold text-on-background">
                      Rp {room.tarif_dasar.toLocaleString('id-ID')}
                    </p>
                    <button
                      onClick={handleEditPrice}
                      className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors group"
                      title="Edit harga kamar"
                    >
                      <span className="material-symbols-outlined text-primary text-lg group-hover:scale-110 transition-transform">
                        edit
                      </span>
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant">
                    Status
                  </p>
                  <p className="text-sm font-label font-medium text-on-background">{room.status}</p>
                </div>
              </div>
              {room.status === 'Terisi' && resident && (
                <button
                  onClick={() => setShowRemoveModal(true)}
                  className="w-full bg-error/10 hover:bg-error/20 text-error px-4 py-3 rounded-xl font-label text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">person_remove</span>
                  Kosongkan Kamar
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Payment History */}
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-headline font-extrabold tracking-tight">Payment History</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                All payments for Room {room.nomor_kamar}
              </p>
            </div>
            <button className="text-secondary font-label font-bold text-xs uppercase tracking-widest hover:underline underline-offset-4">
              View All Statement
            </button>
          </div>
          
          {/* Payment Summary */}
          <PaymentSummary payments={roomPayments} title={`Room ${room.nomor_kamar} Payment Summary`} />
          
          {/* Payment Table */}
          <PaymentHistoryTable
            payments={roomPayments}
            loading={loading}
            emptyMessage="No payment history available for this room"
            showUserInfo={true}
          />
        </section>
      </main>

      <AdminBottomNav />

      {/* Remove Resident Confirmation Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-error text-3xl">warning</span>
              </div>
              <h3 className="font-headline text-2xl font-bold text-primary">Kosongkan Kamar?</h3>
              <p className="text-on-surface-variant text-sm">
                Apakah Anda yakin ingin mengosongkan kamar ini dari penghuni{' '}
                <strong>{resident?.nama}</strong>? Penghuni hanya akan dilepas dari unit ini, namun <strong>data akun penghuni TIDAK akan dihapus</strong>.
              </p>
              <div className="flex gap-3 w-full pt-4">
                <button
                  onClick={() => setShowRemoveModal(false)}
                  className="flex-1 px-6 py-3.5 border border-outline-variant/50 text-primary rounded-xl font-label text-sm font-bold hover:bg-surface-container-low transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleRemoveResident}
                  className="flex-1 px-6 py-3.5 bg-error text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-error/20"
                >
                  Ya, Kosongkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Price Modal */}
      {showEditPriceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">payments</span>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold text-primary">Edit Harga Kamar</h3>
                  <p className="text-sm text-on-surface-variant">Room {room?.nomor_kamar}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
                  Harga Saat Ini
                </label>
                <div className="px-4 py-3 bg-surface-container-high rounded-xl">
                  <p className="text-lg font-headline font-bold text-on-surface-variant">
                    Rp {room?.tarif_dasar.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="newPrice" className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
                  Harga Baru
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-semibold">
                    Rp
                  </span>
                  <input
                    id="newPrice"
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Masukkan harga baru"
                    className="w-full pl-12 pr-4 py-3 bg-surface-container-high border-2 border-outline-variant/20 rounded-xl font-headline text-lg font-bold text-on-background placeholder:text-on-surface-variant/40 focus:border-primary focus:outline-none transition-colors"
                    disabled={isUpdatingPrice}
                  />
                </div>
                {newPrice && !isNaN(Number(newPrice)) && Number(newPrice) > 0 && (
                  <p className="text-xs text-on-surface-variant pl-1">
                    = Rp {Number(newPrice).toLocaleString('id-ID')}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditPriceModal(false);
                    setNewPrice('');
                  }}
                  className="flex-1 px-6 py-3.5 border border-outline-variant/50 text-primary rounded-xl font-label text-sm font-bold hover:bg-surface-container-low transition-all"
                  disabled={isUpdatingPrice}
                >
                  Batal
                </button>
                <button
                  onClick={handleUpdatePrice}
                  className="flex-1 px-6 py-3.5 bg-primary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={isUpdatingPrice || !newPrice || isNaN(Number(newPrice)) || Number(newPrice) <= 0}
                >
                  {isUpdatingPrice ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">check</span>
                      Update Harga
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
