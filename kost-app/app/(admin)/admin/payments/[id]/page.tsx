'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';

interface PaymentDetail {
  id: number;
  user_id: number;
  tarif_dasar: number;
  total_additional_charges: number;
  total_discount: number;
  jumlah_tagihan: number;
  status_bayar: string;
  bulan_dibayar: string;
  due_date: string;
  bukti_bayar?: string;
  notes?: string;
  is_finalized: boolean;
  finalized_at?: string;
  tanggal_upload?: string;
  tanggal_verifikasi?: string;
  user?: {
    id: number;
    nama: string;
    nomor_telepon: string;
    email?: string;
    room?: {
      nomor_kamar: string;
    };
  };
  additional_charges?: Array<{
    id: number;
    charge_type: string;
    amount: number;
    description?: string;
  }>;
}

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

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
    fetchPaymentDetail();
  }, [router, paymentId]);

  const fetchPaymentDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayment(data.payment);
      } else {
        // Payment not found or error
        console.error('Failed to fetch payment details');
        // Redirect back to payments list
        setTimeout(() => {
          router.push('/admin/payments');
        }, 2000);
      }
    } catch (err) {
      console.error('Failed to fetch payment:', err);
      // Redirect back to payments list on error
      setTimeout(() => {
        router.push('/admin/payments');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const getChargeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      electricity: 'Listrik',
      water: 'Air',
      maintenance: 'Maintenance',
      late_fee: 'Denda Keterlambatan',
      other: 'Lainnya',
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Lunas') {
      return (
        <span className="px-4 py-1.5 bg-secondary-container text-on-secondary-container text-xs font-label font-bold rounded-full uppercase">
          Paid
        </span>
      );
    } else if (status === 'Menunggu Verifikasi') {
      return (
        <span className="px-4 py-1.5 bg-tertiary-container/10 text-tertiary text-xs font-label font-bold rounded-full uppercase">
          Pending
        </span>
      );
    } else {
      return (
        <span className="px-4 py-1.5 bg-error-container text-on-error-container text-xs font-label font-bold rounded-full uppercase">
          Unpaid
        </span>
      );
    }
  };

  const handleVerifyPayment = async (status: 'Lunas' | 'Belum Lunas') => {
    const confirmMessage = status === 'Lunas' 
      ? 'Konfirmasi pembayaran ini sebagai LUNAS?' 
      : 'Tolak pembayaran ini?';
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setVerifying(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/payments/${paymentId}/verify`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          status_bayar: status,
        }),
      });

      if (response.ok) {
        alert(`Pembayaran berhasil ${status === 'Lunas' ? 'dikonfirmasi' : 'ditolak'}!`);
        fetchPaymentDetail();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to verify payment');
      }
    } catch (err) {
      console.error('Failed to verify:', err);
      alert('Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Payment Detail" showBackButton={true} />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-on-surface-variant">Loading payment details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!payment) {
    return (
      <>
        <AdminHeader title="Payment Detail" showBackButton={true} />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">Payment Not Found</h2>
            <p className="text-on-surface-variant mb-6">
              The payment you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => router.push('/admin/payments')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Back to Payments
            </button>
          </div>
        </div>
        <AdminBottomNav />
      </>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/20 min-h-screen pb-32">
      <AdminHeader title="Payment Detail" showBackButton={true} showMenu={false} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-secondary to-secondary-container rounded-2xl p-6 md:p-8 text-white mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="font-label text-xs uppercase tracking-widest opacity-80 mb-2">Payment ID</p>
              <h2 className="font-headline text-3xl md:text-4xl font-bold">#{payment.id}</h2>
            </div>
            {getStatusBadge(payment.status_bayar)}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-label text-xs uppercase tracking-widest opacity-80 mb-1">Periode</p>
              <p className="font-headline text-lg font-bold">{payment.bulan_dibayar}</p>
            </div>
            <div>
              <p className="font-label text-xs uppercase tracking-widest opacity-80 mb-1">Jatuh Tempo</p>
              <p className="font-headline text-lg font-bold">
                {new Date(payment.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Resident Info */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 mb-6">
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Informasi Penghuni</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm">Nama</span>
              <span className="font-headline font-bold text-primary">{payment.user?.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm">No. Telepon</span>
              <span className="font-body text-primary">{payment.user?.nomor_telepon}</span>
            </div>
            {payment.user?.email && (
              <div className="flex justify-between">
                <span className="text-on-surface-variant text-sm">Email</span>
                <span className="font-body text-primary">{payment.user.email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-on-surface-variant text-sm">Kamar</span>
              <span className="font-headline font-bold text-primary">
                {payment.user?.room?.nomor_kamar || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 mb-6">
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Rincian Tagihan</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-on-surface-variant">Tarif Dasar</span>
              <span className="font-headline font-bold text-primary">
                Rp {payment.tarif_dasar.toLocaleString('id-ID')}
              </span>
            </div>

            {payment.additional_charges && payment.additional_charges.length > 0 && (
              <>
                <div className="border-t border-outline-variant/10 pt-3">
                  <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-3">
                    Biaya Tambahan
                  </p>
                  {payment.additional_charges.map((charge) => (
                    <div key={charge.id} className="flex justify-between py-2">
                      <div>
                        <span className="text-on-surface">{getChargeTypeLabel(charge.charge_type)}</span>
                        {charge.description && (
                          <p className="text-xs text-on-surface-variant">{charge.description}</p>
                        )}
                      </div>
                      <span className="font-body text-primary">
                        Rp {charge.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {payment.total_discount > 0 && (
              <div className="flex justify-between py-2 text-secondary">
                <span>Diskon</span>
                <span className="font-headline font-bold">
                  - Rp {payment.total_discount.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            <div className="border-t-2 border-primary/20 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-headline text-lg font-bold text-primary">Total Tagihan</span>
                <span className="font-headline text-2xl font-bold text-primary">
                  Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 mb-6">
            <h3 className="font-headline text-lg font-bold text-primary mb-3">Catatan</h3>
            <p className="text-on-surface-variant text-sm">{payment.notes}</p>
          </div>
        )}

        {/* Payment Proof */}
        {payment.bukti_bayar && (
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 mb-6">
            <h3 className="font-headline text-lg font-bold text-primary mb-4">Bukti Pembayaran</h3>
            <div 
              className="relative w-full max-w-md rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={`http://127.0.0.1:8000/storage/${payment.bukti_bayar}`}
                alt="Bukti Pembayaran"
                className="w-full rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-4xl opacity-0 hover:opacity-100 transition-opacity">
                  zoom_in
                </span>
              </div>
            </div>
            {payment.tanggal_upload && (
              <p className="text-xs text-on-surface-variant mt-3">
                Diupload: {new Date(payment.tanggal_upload).toLocaleString('id-ID')}
              </p>
            )}
            
            {/* Verification Actions */}
            {payment.status_bayar === 'Menunggu Verifikasi' && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => handleVerifyPayment('Belum Lunas')}
                  disabled={verifying}
                  className="flex-1 px-6 py-3 border border-error/50 text-error rounded-xl font-label text-sm font-bold hover:bg-error/10 transition-all active:scale-95 disabled:opacity-50"
                >
                  {verifying ? 'Processing...' : 'Tolak'}
                </button>
                <button
                  onClick={() => handleVerifyPayment('Lunas')}
                  disabled={verifying}
                  className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-secondary/20"
                >
                  {verifying ? 'Processing...' : 'Konfirmasi Lunas'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8">
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Timeline</h3>
          <div className="space-y-4">
            {payment.finalized_at && (
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-secondary mt-2"></div>
                <div>
                  <p className="font-label text-sm font-bold text-primary">Tagihan Dikirim</p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(payment.finalized_at).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}
            {payment.tanggal_upload && (
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-tertiary mt-2"></div>
                <div>
                  <p className="font-label text-sm font-bold text-primary">Bukti Pembayaran Diupload</p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(payment.tanggal_upload).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}
            {payment.tanggal_verifikasi && (
              <div className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-secondary-container mt-2"></div>
                <div>
                  <p className="font-label text-sm font-bold text-primary">Pembayaran Diverifikasi</p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(payment.tanggal_verifikasi).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && payment?.bukti_bayar && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <img
              src={`http://127.0.0.1:8000/storage/${payment.bukti_bayar}`}
              alt="Bukti Pembayaran"
              className="w-full h-auto rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
}
