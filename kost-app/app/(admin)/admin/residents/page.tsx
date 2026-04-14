'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Payment } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { ApiClient, getImageUrl } from '@/app/lib/api';
import { showSuccess, showError, showDeleteConfirm } from '@/app/lib/sweetalert';

export default function ResidentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [residents, setResidents] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    fetchResidents();
    fetchPayments();
  }, [router]);

  const fetchResidents = async () => {
    try {
      console.log('Fetching residents...');
      // Try dedicated residents endpoint first
      try {
        const data = await ApiClient.getResidents();
        console.log('Residents data:', data);
        // API may return { users: [...] } or { residents: [...] } or an array
        const residentList = data.users || data.residents || data.data || data || [];
        const list = Array.isArray(residentList) ? residentList : [];
        console.log('All residents:', list);
        setResidents(list);
      } catch (directErr) {
        console.warn('Direct residents endpoint failed, falling back to rooms:', directErr);
        // Fallback: extract from rooms
        const data = await ApiClient.getRooms();
        console.log('Rooms data:', data);
        const allResidents: User[] = [];
        const roomList = data.rooms || data.data || data || [];
        (Array.isArray(roomList) ? roomList : []).forEach((room: any) => {
          if (room.users && room.users.length > 0) {
            room.users.forEach((resident: User) => {
              allResidents.push({ ...resident, room });
            });
          }
        });
        console.log('All residents (from rooms):', allResidents);
        setResidents(allResidents);
      }
    } catch (err: any) {
      console.error('Failed to fetch residents:', err);
      await showError('Error', err.message || 'Gagal memuat data penghuni');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const data = await ApiClient.getAdminPayments();
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  };

  const getPaymentStatus = (residentId: number) => {
    const residentPayments = payments.filter((p) => p.user_id === residentId);
    if (residentPayments.length === 0) return 'Pending';

    const latestPayment = residentPayments[0];
    if (latestPayment.status_bayar === 'Lunas') return 'Paid';
    if (latestPayment.status_bayar === 'Menunggu Verifikasi') return 'Pending';
    return 'Overdue';
  };

  const handleDeleteResident = async (resident: User) => {
    const result = await showDeleteConfirm(`${resident.nama} (Room ${resident.room?.nomor_kamar || '-'})`);
    
    if (result.isConfirmed) {
      try {
        await ApiClient.deleteResident(resident.id);
        
        // Remove from list
        setResidents(residents.filter((r) => r.id !== resident.id));
        showSuccess('Deleted!', 'Resident has been deleted successfully');
      } catch (err: any) {
        console.error('Failed to delete resident:', err);
        showError('Delete Failed', err.message || 'Failed to delete resident');
      }
    }
  };

  const handleEditResident = (resident: User, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/residents/${resident.id}/edit`);
  };

  const handleDeleteClick = (resident: User, e: React.MouseEvent) => {
    e.stopPropagation();
    handleDeleteResident(resident);
  };

  const filteredResidents = residents.filter((resident) => {
    const query = searchQuery.toLowerCase();
    return (
      resident.nama.toLowerCase().includes(query) ||
      resident.nomor_telepon.includes(query) ||
      (resident.room?.nomor_kamar && resident.room.nomor_kamar.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24">
      <AdminHeader />

      <main className="px-6 mt-4">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              className="w-full pl-12 pr-4 py-4 bg-surface-container-highest border-none rounded-xl focus:ring-2 focus:ring-secondary focus:bg-surface-container-lowest transition-all placeholder:text-on-surface-variant/60 font-label text-sm"
              placeholder="Search residents or room numbers..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-label font-bold uppercase tracking-widest text-primary/60">
            Active Residents
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full">
            <span className="text-[10px] font-label font-bold text-on-surface-variant">
              TOTAL: {filteredResidents.length}
            </span>
          </div>
        </div>

        {/* Residents List */}
        <div className="space-y-4">
          {filteredResidents.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-on-surface-variant text-lg">
                {searchQuery ? 'No residents found' : 'No residents yet'}
              </p>
            </div>
          ) : (
            filteredResidents.map((resident) => {
              const status = getPaymentStatus(resident.id);
              return (
                <div
                  key={resident.id}
                  className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl hover:bg-surface-container-low transition-colors group cursor-pointer"
                  onClick={() => router.push(`/admin/residents/${resident.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        alt={resident.nama}
                        className="w-12 h-12 rounded-full object-cover"
                        src={
                          resident.foto_penghuni
                            ? getImageUrl(resident.foto_penghuni)
                            : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUe_fqSs_mEXImBn1Td_tce-oeWCz2RBOuzeAboY3q2ZSX3x1uhrrYkxyULXIOX-K8gQ7Gwf_Fewm-Dv05BdoAqlylRvBeuzeOje2aH2__JR3wjlyUbdLvM57eBZW52YNy7NHprIBSPZdV0nAq9pgCb4ALVjfkw_NqusJdPlOsrujJK-1utnB_yWit4dwKrwmjHjTlCZQAjqxk3wcTGByTJZPI6r1j8XXvOCoUDWUFX7jxjK0OPESkDug1XkKIWMg9cYssyxUnL40'
                        }
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-surface-container-lowest rounded-full ${
                          status === 'Paid' ? 'bg-green-500' : status === 'Pending' ? 'bg-secondary' : 'bg-error'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">{resident.nama}</h3>
                      <p className="font-label text-xs text-on-surface-variant font-medium">
                        Room {resident.room?.nomor_kamar || '-'} • Standard Suite
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-end gap-2">
                      {status === 'Paid' ? (
                        <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-label font-bold rounded-full uppercase tracking-tighter">
                          Paid
                        </span>
                      ) : status === 'Pending' ? (
                        <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-label font-bold rounded-full uppercase tracking-tighter">
                          Pending
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-error-container text-on-error-container text-[10px] font-label font-bold rounded-full uppercase tracking-tighter">
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => handleEditResident(resident, e)}
                        className="p-2 hover:bg-surface-container-high rounded-lg transition-colors"
                        title="Edit Profile"
                      >
                        <span className="material-symbols-outlined text-primary text-lg">edit</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(resident, e)}
                        className="p-2 hover:bg-error-container rounded-lg transition-colors"
                        title="Delete Resident"
                      >
                        <span className="material-symbols-outlined text-error text-lg">delete</span>
                      </button>
                      <span className="material-symbols-outlined text-outline-variant text-lg">chevron_right</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-12 mb-24 text-center">
          <p className="font-label text-[10px] uppercase tracking-widest text-primary/40 font-bold">
            End of directory
          </p>
        </div>
      </main>

      <AdminBottomNav />

      {/* Floating Action Button */}
      <button
        onClick={() => router.push('/admin/register-resident')}
        className="fixed bottom-24 right-6 w-14 h-14 bg-secondary rounded-full flex items-center justify-center text-white shadow-[0_16px_32px_rgba(0,62,198,0.2)] active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined">person_add</span>
      </button>
    </div>
  );
}
