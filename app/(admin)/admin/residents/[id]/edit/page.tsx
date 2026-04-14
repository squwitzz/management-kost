'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { ApiClient } from '@/app/lib/api';
import { showSuccess, showError } from '@/app/lib/sweetalert';

interface Room {
  id: number;
  nomor_kamar: string;
  status: string;
  tarif_dasar: number;
}

export default function EditResidentPage() {
  const router = useRouter();
  const params = useParams();
  const residentId = params.id as string;

  const [resident, setResident] = useState<User | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [nama, setNama] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [email, setEmail] = useState('');
  const [roomId, setRoomId] = useState<number | null>(null);

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

    fetchResidentData();
    fetchAvailableRooms();
  }, [residentId, router]);

  const fetchResidentData = async () => {
    try {
      const data = await ApiClient.getResident(parseInt(residentId));
      const residentData = data.user || data.data || data;
      
      setResident(residentData);
      setNama(residentData.nama || '');
      setNomorTelepon(residentData.nomor_telepon || '');
      setEmail(residentData.email || '');
      setRoomId(residentData.room_id || null);
    } catch (err: any) {
      console.error('Failed to fetch resident:', err);
      await showError('Error', err.message || 'Gagal memuat data penghuni');
      router.push('/admin/residents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const data = await ApiClient.getRooms();
      const roomList = data.rooms || data.data || data || [];
      // Show rooms that are empty OR the current resident's room
      const available = (Array.isArray(roomList) ? roomList : []).filter(
        (room: Room) => room.status === 'Kosong' || room.id === roomId
      );
      setAvailableRooms(available);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama || !nomorTelepon) {
      await showError('Error', 'Nama dan nomor telepon harus diisi');
      return;
    }

    setSaving(true);
    try {
      const originalRoomId = resident?.room_id;
      
      // If room changed, assign new room first
      if (roomId !== originalRoomId && roomId !== null) {
        await ApiClient.assignRoom(parseInt(residentId), roomId);
      }

      // Update resident data
      await ApiClient.updateResident(parseInt(residentId), {
        nama,
        nomor_telepon: nomorTelepon,
        email: email || undefined,
      });

      await showSuccess('Success', 'Data penghuni berhasil diperbarui');
      router.push('/admin/residents');
    } catch (err: any) {
      console.error('Failed to update resident:', err);
      await showError('Error', err.message || 'Gagal memperbarui data penghuni');
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

  if (!resident) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Resident not found</p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <AdminHeader title="Edit Resident" showBackButton={true} showMenu={false} />

      <main className="max-w-2xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-headline font-bold text-primary">Personal Information</h3>

            <div className="space-y-2">
              <label className="font-label text-sm text-on-surface-variant">
                Nama Lengkap <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary font-label text-sm"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-label text-sm text-on-surface-variant">
                Nomor Telepon <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                value={nomorTelepon}
                onChange={(e) => setNomorTelepon(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary font-label text-sm"
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="font-label text-sm text-on-surface-variant">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary font-label text-sm"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Room Assignment */}
          <div className="bg-surface-container-lowest rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-headline font-bold text-primary">Room Assignment</h3>
              {resident.room_id && (
                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-label font-bold rounded-full">
                  Currently: Room {resident.room?.nomor_kamar}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="font-label text-sm text-on-surface-variant">
                Pilih Kamar
              </label>
              <select
                value={roomId || ''}
                onChange={(e) => setRoomId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary font-label text-sm"
              >
                <option value="">-- Tidak Ada Kamar --</option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.nomor_kamar} - Rp {room.tarif_dasar.toLocaleString('id-ID')} 
                    {room.id === resident.room_id ? ' (Current)' : ''}
                  </option>
                ))}
              </select>
              {availableRooms.length === 0 && !resident.room_id && (
                <p className="text-xs text-error">Tidak ada kamar tersedia</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/residents')}
              className="flex-1 px-4 py-3 bg-surface-container-highest text-on-surface rounded-xl font-label font-bold hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-3 bg-secondary text-white rounded-xl font-label font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>

      <AdminBottomNav />
    </div>
  );
}
