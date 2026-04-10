'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';

interface AdditionalCharge {
  type: string;
  amount: number;
  description: string;
}

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
  notes?: string;
  is_finalized: boolean;
  user?: {
    nama: string;
    nomor_telepon: string;
    room?: {
      nomor_kamar: string;
    };
  };
  additional_charges?: Array<{
    charge_type: string;
    amount: number;
    description?: string;
  }>;
}

export default function EditPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharge[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

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
      
      if (!token) {
        alert('Token tidak ditemukan. Silakan login kembali.');
        router.push('/login');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/api/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const p = data.payment;
        
        if (p.is_finalized) {
          alert('Tagihan sudah finalized, tidak bisa diedit');
          router.push('/admin/payments');
          return;
        }

        setPayment(p);
        setDiscount(p.total_discount || 0);
        setNotes(p.notes || '');
        
        if (p.additional_charges && p.additional_charges.length > 0) {
          setAdditionalCharges(
            p.additional_charges.map((c: any) => ({
              type: c.charge_type,
              amount: c.amount,
              description: c.description || '',
            }))
          );
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        alert(`Failed to fetch payment details: ${errorData.error || response.statusText}`);
        router.back();
      }
    } catch (err) {
      console.error('Failed to fetch payment:', err);
      alert(`Failed to fetch payment details: ${err}`);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const addCharge = () => {
    setAdditionalCharges([...additionalCharges, { type: 'electricity', amount: 0, description: '' }]);
  };

  const removeCharge = (index: number) => {
    setAdditionalCharges(additionalCharges.filter((_, i) => i !== index));
  };

  const updateCharge = (index: number, field: keyof AdditionalCharge, value: string | number) => {
    const updated = [...additionalCharges];
    updated[index] = { ...updated[index], [field]: value };
    setAdditionalCharges(updated);
  };

  const calculateTotal = () => {
    if (!payment) return 0;
    const additionalTotal = additionalCharges.reduce((sum, c) => sum + (c.amount || 0), 0);
    return payment.tarif_dasar + additionalTotal - discount;
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/billing/payments/${paymentId}/charges`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          additional_charges: additionalCharges,
          discount,
          notes,
        }),
      });

      if (response.ok) {
        alert('Tagihan berhasil disimpan!');
        fetchPaymentDetail();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save payment');
      }
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!confirm('Finalize tagihan ini? Setelah finalized, tagihan tidak bisa diedit lagi dan akan dikirim ke penghuni.')) {
      return;
    }

    setFinalizing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/billing/payments/${paymentId}/finalize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        alert('Tagihan berhasil dikirim ke penghuni!');
        router.push('/admin/payments');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to finalize payment');
      }
    } catch (err) {
      console.error('Failed to finalize:', err);
      alert('Failed to finalize payment');
    } finally {
      setFinalizing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Hapus draft tagihan ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/billing/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        alert('Draft tagihan berhasil dihapus!');
        router.push('/admin/payments');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete payment');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('Failed to delete payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!payment) {
    return null;
  }

  const total = calculateTotal();

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-secondary/20 min-h-screen pb-32">
      <AdminHeader title="Edit Tagihan" showBackButton={true} showMenu={false} />

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-8">
        {/* Header Info */}
        <div className="bg-tertiary-container/10 rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-tertiary text-2xl">draft</span>
            <h2 className="font-headline text-2xl font-bold text-primary">Draft Tagihan</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">Penghuni</p>
              <p className="font-headline font-bold text-primary">{payment.user?.nama}</p>
            </div>
            <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">Kamar</p>
              <p className="font-headline font-bold text-primary">{payment.user?.room?.nomor_kamar || '-'}</p>
            </div>
            <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">Periode</p>
              <p className="font-headline font-bold text-primary">{payment.bulan_dibayar}</p>
            </div>
            <div>
              <p className="font-label text-xs uppercase tracking-wider text-on-surface-variant mb-1">Jatuh Tempo</p>
              <p className="font-headline font-bold text-primary">
                {new Date(payment.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </div>
        </div>

        {/* Base Rate */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 mb-6">
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Tarif Dasar</h3>
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant">Tarif Kamar</span>
            <span className="font-headline text-2xl font-bold text-primary">
              Rp {payment.tarif_dasar.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Additional Charges */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-lg font-bold text-primary">Biaya Tambahan</h3>
            <button
              onClick={addCharge}
              className="flex items-center gap-2 px-4 py-2 bg-secondary/10 text-secondary rounded-xl font-label text-sm font-bold hover:bg-secondary/20 transition-all"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              Tambah
            </button>
          </div>

          {additionalCharges.length === 0 ? (
            <p className="text-on-surface-variant text-sm text-center py-8">
              Belum ada biaya tambahan. Klik tombol "Tambah" untuk menambahkan.
            </p>
          ) : (
            <div className="space-y-4">
              {additionalCharges.map((charge, index) => (
                <div key={index} className="bg-surface-container-high rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <select
                        className="w-full px-4 py-2 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary text-sm"
                        value={charge.type}
                        onChange={(e) => updateCharge(index, 'type', e.target.value)}
                      >
                        <option value="electricity">Listrik</option>
                        <option value="water">Air</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="late_fee">Denda Keterlambatan</option>
                        <option value="other">Lainnya</option>
                      </select>
                      
                      <input
                        type="number"
                        className="w-full px-4 py-2 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary text-sm"
                        placeholder="Jumlah (Rp)"
                        value={charge.amount || ''}
                        onChange={(e) => updateCharge(index, 'amount', parseFloat(e.target.value) || 0)}
                      />
                      
                      <input
                        type="text"
                        className="w-full px-4 py-2 bg-surface-container-highest rounded-lg border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary text-sm"
                        placeholder="Deskripsi (opsional)"
                        value={charge.description}
                        onChange={(e) => updateCharge(index, 'description', e.target.value)}
                      />
                    </div>
                    
                    <button
                      onClick={() => removeCharge(index)}
                      className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 mb-6">
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Diskon</h3>
          <input
            type="number"
            className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary"
            placeholder="Jumlah diskon (Rp)"
            value={discount || ''}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Notes */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 mb-6">
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Catatan</h3>
          <textarea
            className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary resize-none"
            placeholder="Catatan tambahan (opsional)"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Total */}
        <div className="bg-gradient-to-br from-secondary to-secondary-container rounded-2xl p-6 md:p-8 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-label text-xs uppercase tracking-widest opacity-80 mb-1">Total Tagihan</p>
              <p className="font-headline text-4xl font-bold">Rp {total.toLocaleString('id-ID')}</p>
            </div>
            <span className="material-symbols-outlined text-5xl opacity-20">payments</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleDelete}
            className="px-6 py-3 border border-error/50 text-error rounded-xl font-label text-sm font-bold hover:bg-error/10 transition-all"
          >
            Hapus Draft
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-surface-container-high text-primary rounded-xl font-label text-sm font-bold hover:bg-surface-container-highest transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Simpan Draft'}
          </button>
          <button
            onClick={handleFinalize}
            disabled={finalizing}
            className="px-6 py-3 bg-secondary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-secondary/20"
          >
            {finalizing ? 'Mengirim...' : 'Finalize & Kirim'}
          </button>
        </div>
      </main>

      <AdminBottomNav />
    </div>
  );
}
