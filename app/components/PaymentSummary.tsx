'use client';

import { Payment } from '@/app/types';

interface PaymentSummaryProps {
  payments: Payment[];
  title?: string;
}

export default function PaymentSummary({ payments, title = 'Payment Summary' }: PaymentSummaryProps) {
  const totalPaid = payments.filter((p) => p.status_bayar === 'Lunas').length;
  const totalPending = payments.filter((p) => p.status_bayar === 'Menunggu Verifikasi').length;
  const totalUnpaid = payments.filter((p) => p.status_bayar === 'Belum Bayar').length;
  const totalAmountPaid = payments
    .filter((p) => p.status_bayar === 'Lunas')
    .reduce((sum, p) => sum + p.jumlah_tagihan, 0);
  const totalAmountPending = payments
    .filter((p) => p.status_bayar === 'Menunggu Verifikasi')
    .reduce((sum, p) => sum + p.jumlah_tagihan, 0);

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-outline-variant/10">
      <h4 className="text-xs uppercase tracking-widest font-bold text-on-surface-variant/50 mb-6 label-text">
        {title}
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Payments */}
        <div className="bg-surface-container-lowest rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/50 tracking-wider">
              Total
            </span>
          </div>
          <p className="text-2xl font-headline font-black text-primary">{payments.length}</p>
          <p className="text-xs text-on-surface-variant mt-1">Payments</p>
        </div>

        {/* Paid */}
        <div className="bg-surface-container-lowest rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="material-symbols-outlined text-secondary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/50 tracking-wider">
              Paid
            </span>
          </div>
          <p className="text-2xl font-headline font-black text-secondary">{totalPaid}</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Rp {totalAmountPaid.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Pending */}
        <div className="bg-surface-container-lowest rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-tertiary text-lg">schedule</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/50 tracking-wider">
              Pending
            </span>
          </div>
          <p className="text-2xl font-headline font-black text-tertiary">{totalPending}</p>
          <p className="text-xs text-on-surface-variant mt-1">
            Rp {totalAmountPending.toLocaleString('id-ID')}
          </p>
        </div>

        {/* Unpaid */}
        <div className="bg-surface-container-lowest rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-error text-lg">cancel</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/50 tracking-wider">
              Unpaid
            </span>
          </div>
          <p className="text-2xl font-headline font-black text-error">{totalUnpaid}</p>
          <p className="text-xs text-on-surface-variant mt-1">Outstanding</p>
        </div>

        {/* Payment Rate */}
        <div className="bg-surface-container-lowest rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
            <span className="text-[10px] uppercase font-bold text-on-surface-variant/50 tracking-wider">
              Rate
            </span>
          </div>
          <p className="text-2xl font-headline font-black text-primary">
            {payments.length > 0 ? Math.round((totalPaid / payments.length) * 100) : 0}%
          </p>
          <p className="text-xs text-on-surface-variant mt-1">Payment Rate</p>
        </div>
      </div>
    </div>
  );
}
