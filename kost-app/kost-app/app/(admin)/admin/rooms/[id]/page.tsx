'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Room, Payment } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
import { showSuccess, showError, showConfirm } from '@/app/lib/sweetalert';

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  
  const [room, setRoom] = useState<Room | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

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
    fetchPayments();
  }, [roomId, router]);

  const fetchRoomDetail = async () => {
    try {
      console.log('Fetching room detail for ID:', roomId);
      const data = await ApiClient.getRoom(parseInt(roomId));
      console.log('Room data:', data);
      if (data.room) {
        setRoom(data.room);
      } else {
        await showError('Error', 'Room not found');
        router.push('/admin/rooms');
      }
    } catch (err: any) {
      console.error('Failed to fetch room:', err);
      await showError('Error', err.message || 'Failed to load room details');
      router.push('/admin/rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await ApiClient.getAdminPayments();
      // Filter payments for this room's residents
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  };

  const handleRemoveResident = async () => {
    const result = await showConfirm(
      'Kosongkan Kamar?',
      `Apakah Anda yakin ingin mengosongkan kamar ini dari penghuni ${resident?.nama}? Penghuni akan dihapus dari kamar ini dan status kamar akan menjadi "Kosong".`,
      'Ya, Kosongkan'
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      const API_URL = getApiUrl();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/rooms/${roomId}/remove-resident`, {
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
                    ? `${getBaseUrl()}/storage/${resident.foto_penghuni}`
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
                <div>
                  <p className="text-[10px] font-label font-bold uppercase tracking-wider text-on-surface-variant">
                    Monthly Rate
                  </p>
                  <p className="text-2xl font-headline font-bold text-on-background">
                    Rp {room.tarif_dasar.toLocaleString('id-ID')}
                  </p>
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
            <h3 className="text-2xl font-headline font-extrabold tracking-tight">Payment History</h3>
            <button className="text-secondary font-label font-bold text-xs uppercase tracking-widest hover:underline underline-offset-4">
              View All Statement
            </button>
          </div>
          <div className="bg-surface-container-low rounded-xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 px-8 py-4 bg-surface-container-high text-[10px] font-label font-black uppercase tracking-widest text-on-surface-variant opacity-60">
              <div>Billing Period</div>
              <div>Transaction Date</div>
              <div className="text-right">Amount</div>
              <div className="text-right">Status</div>
            </div>

            {/* Payment Rows */}
            <div className="divide-y divide-outline-variant/10">
              {roomPayments.length === 0 ? (
                <div className="px-8 py-12 text-center text-on-surface-variant">
                  <p>No payment history available</p>
                </div>
              ) : (
                roomPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="grid grid-cols-4 px-8 py-6 items-center hover:bg-surface-container-lowest transition-colors"
                  >
                    <div className="font-headline font-bold text-on-background">{payment.bulan_dibayar}</div>
                    <div className="font-label text-sm text-on-surface-variant">
                      {payment.tanggal_upload
                        ? new Date(payment.tanggal_upload).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </div>
                    <div className="text-right font-headline font-black text-on-background">
                      Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                    </div>
                    <div className="flex justify-end">
                      {payment.status_bayar === 'Lunas' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/10 text-secondary text-[9px] font-bold uppercase tracking-wider border border-secondary/20">
                          <span
                            className="material-symbols-outlined text-[12px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            check_circle
                          </span>
                          Paid
                        </span>
                      ) : payment.status_bayar === 'Menunggu Verifikasi' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary text-[9px] font-bold uppercase tracking-wider border border-tertiary/20">
                          <span className="material-symbols-outlined text-[12px]">schedule</span>
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container/10 text-error text-[9px] font-bold uppercase tracking-wider border border-error/20">
                          <span className="material-symbols-outlined text-[12px]">cancel</span>
                          Unpaid
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
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
                <strong>{resident?.nama}</strong>? Penghuni akan dihapus dari kamar ini dan status kamar akan
                menjadi "Kosong".
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
    </div>
  );
}
