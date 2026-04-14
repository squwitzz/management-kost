'use client';

import { Payment } from '@/app/types';

interface PaymentHistoryTableProps {
  payments: Payment[];
  loading?: boolean;
  emptyMessage?: string;
  showUserInfo?: boolean;
  showRoomInfo?: boolean;
  onViewDetails?: (payment: Payment) => void;
}

export default function PaymentHistoryTable({
  payments,
  loading = false,
  emptyMessage = 'No payment history available',
  showUserInfo = false,
  showRoomInfo = false,
  onViewDetails,
}: PaymentHistoryTableProps) {
  if (loading) {
    return (
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-12 text-center text-on-surface-variant">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4">Loading payment history...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Lunas':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/10 text-secondary text-[9px] font-bold uppercase tracking-wider border border-secondary/20">
            <span
              className="material-symbols-outlined text-[12px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            Paid
          </span>
        );
      case 'Menunggu Verifikasi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary text-[9px] font-bold uppercase tracking-wider border border-tertiary/20">
            <span className="material-symbols-outlined text-[12px]">schedule</span>
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container/10 text-error text-[9px] font-bold uppercase tracking-wider border border-error/20">
            <span className="material-symbols-outlined text-[12px]">cancel</span>
            Unpaid
          </span>
        );
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      {/* Header */}
      <div className={`grid ${showUserInfo ? 'grid-cols-5' : showRoomInfo ? 'grid-cols-5' : 'grid-cols-4'} px-8 py-4 bg-surface-container-high text-[10px] font-label font-black uppercase tracking-widest text-on-surface-variant opacity-60`}>
        {showUserInfo && <div>Resident</div>}
        {showRoomInfo && <div>Room</div>}
        <div>Billing Period</div>
        <div>Transaction Date</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Status</div>
      </div>

      {/* Payment Rows */}
      <div className="divide-y divide-outline-variant/10">
        {payments.length === 0 ? (
          <div className="px-8 py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-20 mb-4 block">receipt_long</span>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className={`grid ${showUserInfo ? 'grid-cols-5' : showRoomInfo ? 'grid-cols-5' : 'grid-cols-4'} px-8 py-6 items-center hover:bg-surface-container-lowest transition-colors ${
                onViewDetails ? 'cursor-pointer' : ''
              }`}
              onClick={() => onViewDetails?.(payment)}
            >
              {showUserInfo && payment.user && (
                <div className="font-label text-sm text-on-surface-variant">
                  <div className="font-semibold text-on-background">{payment.user.nama}</div>
                  <div className="text-xs opacity-60">{payment.user.nomor_telepon}</div>
                </div>
              )}
              {showRoomInfo && payment.room && (
                <div className="font-headline font-bold text-on-background">
                  Room {payment.room.nomor_kamar}
                </div>
              )}
              <div className="font-headline font-bold text-on-background">{payment.bulan_dibayar}</div>
              <div className="font-label text-sm text-on-surface-variant">
                {formatDate(payment.tanggal_upload)}
              </div>
              <div className="text-right font-headline font-black text-on-background">
                Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
              </div>
              <div className="flex justify-end">{getStatusBadge(payment.status_bayar)}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
