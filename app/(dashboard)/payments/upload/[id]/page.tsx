'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@/app/types';
import { ApiClient } from '@/app/lib/api';
import { showSuccess, showError, showConfirm } from '@/app/lib/sweetalert';

interface Payment {
  id: number;
  jumlah_tagihan: number;
  status_bayar: string;
  bulan_dibayar: string;
  due_date: string;
}

export default function UploadPaymentProofPage() {
  const router = useRouter();
  const params = useParams();
  const paymentId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    console.log('=== UPLOAD PAGE AUTH CHECK ===');
    console.log('Token exists:', !!token);
    console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('User data exists:', !!userData);

    if (!token || !userData) {
      console.error('❌ Missing authentication data - redirecting to login');
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      console.log('✅ User parsed successfully');
      console.log('User ID:', parsedUser.id);
      console.log('User role:', parsedUser.role);
      console.log('User name:', parsedUser.nama);

      if (parsedUser.role !== 'Penghuni') {
        console.error('❌ User is not Penghuni, redirecting to admin');
        router.push('/admin/dashboard');
        return;
      }

      console.log('✅ Auth check passed, setting user');
      setUser(parsedUser);
    } catch (error) {
      console.error('❌ Failed to parse user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  }, [router]);

  const fetchPaymentDetail = async () => {
    if (!user) {
      console.error('User not set yet, skipping fetch');
      return;
    }
    
    try {
      console.log('=== FETCHING PAYMENT DETAIL ===');
      console.log('Payment ID:', paymentId);
      console.log('Current User ID:', user.id);
      console.log('Current User Name:', user.nama);
      console.log('Current User Role:', user.role);
      
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ No token found');
        throw new Error('No authentication token found. Please login again.');
      }
      
      console.log('✅ Token exists, calling API...');
      const data = await ApiClient.getPayment(parseInt(paymentId));
      console.log('✅ Payment data received:', data);
      
      // Backend may return { payment: {...} } or { data: {...} } or direct object
      const paymentData = data.payment || data.data || data;
      
      if (!paymentData) {
        console.error('❌ Payment data structure:', data);
        throw new Error('Payment data not found in response');
      }
      
      console.log('✅ Payment data parsed');
      console.log('Payment User ID:', paymentData.user_id);
      console.log('Current User ID:', user.id);
      console.log('Payment User ID type:', typeof paymentData.user_id);
      console.log('Current User ID type:', typeof user.id);
      console.log('Match?', paymentData.user_id == user.id);
      
      // Validate payment belongs to current user (use == for loose comparison to handle type mismatch)
      if (Number(paymentData.user_id) !== user.id) {
        console.error('❌ AUTHORIZATION FAILED');
        console.error('Payment belongs to user:', paymentData.user_id);
        console.error('But current user is:', user.id);
        throw new Error('You are not authorized to access this payment');
      }
      
      console.log('✅ All checks passed, setting payment');
      setPayment(paymentData);
    } catch (err: any) {
      console.error('❌ Failed to fetch payment:', err);
      console.error('Error details:', {
        message: err.message,
        paymentId,
        userId: user?.id
      });
      
      // Handle specific error cases
      if (err.message.includes('Unauthorized') || err.message.includes('401') || err.message.includes('Invalid token')) {
        await showError('Session Expired', 'Your session has expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        router.push('/login');
      } else if (err.message.includes('not belong to you')) {
        await showError('Access Denied', 'This payment does not belong to your account.');
        router.push('/payments');
      } else if (err.message.includes('404') || err.message.includes('not found')) {
        await showError('Payment Not Found', 'The payment you are looking for does not exist.');
        router.push('/payments');
      } else {
        await showError('Error', err.message || 'Failed to fetch payment details');
        router.push('/payments');
      }
    } finally {
      setLoading(false);
    }
  };

  // Separate useEffect to fetch payment after user is set
  useEffect(() => {
    if (user && paymentId) {
      fetchPaymentDetail();
    }
  }, [user, paymentId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Error', 'File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        showError('Error', 'Only JPG and PNG files are allowed');
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      await showError('Error', 'Please select a file');
      return;
    }

    const result = await showConfirm(
      'Submit Payment Proof?',
      'This will send your proof to admin for verification.',
      'Submit',
      'Cancel'
    );

    if (!result.isConfirmed) return;

    setUploading(true);

    try {
      await ApiClient.uploadBuktiBayar(parseInt(paymentId), selectedFile);
      await showSuccess('Success!', 'Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.');
      router.push('/payments');
    } catch (err: any) {
      await showError('Error', err.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
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

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="hover:opacity-80 transition-opacity scale-95 active:duration-100 text-primary"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline text-xl font-bold tracking-tight text-primary">
            Submit Payment
          </h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-24 space-y-10">
        {/* Payment Type Selection */}
        <section className="space-y-4">
          <p className="font-label text-xs font-semibold uppercase tracking-wider text-outline">
            Payment Category
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 p-4 bg-secondary-container text-on-secondary rounded-xl transition-all scale-95 active:scale-90 ring-2 ring-secondary/20">
              <span className="material-symbols-outlined">home</span>
              <span className="font-label font-bold text-sm">Room Payment</span>
            </button>
            <button 
              disabled
              className="flex items-center justify-center gap-3 p-4 bg-surface-container-low text-primary rounded-xl opacity-50 cursor-not-allowed"
            >
              <span className="material-symbols-outlined">restaurant</span>
              <span className="font-label font-bold text-sm">Food Order</span>
            </button>
          </div>
        </section>

        {/* Summary Section */}
        <section className="bg-surface-container-low rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-primary">
              {payment.bulan_dibayar}
            </h2>
            <p className="font-label text-sm text-outline">
              Due: {new Date(payment.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • ID: #{payment.id}
            </p>
          </div>
          <div className="text-right">
            <span className="text-4xl font-extrabold text-secondary tracking-tighter">
              Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
            </span>
            <p className="font-label text-xs font-bold uppercase tracking-widest text-on-secondary-fixed-variant mt-1">
              {payment.status_bayar === 'Belum Lunas' ? 'Pending Payment' : payment.status_bayar}
            </p>
          </div>
        </section>

        {/* Upload Receipt Area */}
        <section className="space-y-4">
          <p className="font-label text-xs font-semibold uppercase tracking-wider text-outline">
            Proof of Transaction
          </p>
          <div className="relative group">
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileSelect}
            />
            {!previewUrl ? (
              <label
                htmlFor="fileInput"
                className="block border-2 border-dashed border-outline-variant bg-surface-container-lowest rounded-3xl p-12 cursor-pointer transition-all hover:bg-secondary/5 hover:border-secondary"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                  </div>
                  <p className="font-headline font-bold text-lg text-on-surface">
                    Drag and drop your receipt
                  </p>
                  <p className="font-label text-sm text-outline mt-1">
                    Supports PNG, JPG (Max 5MB)
                  </p>
                  <div className="mt-6 px-6 py-2 bg-primary text-on-primary rounded-full font-label text-sm font-bold hover:bg-primary-container transition-colors">
                    Browse Files
                  </div>
                </div>
              </label>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full rounded-3xl shadow-lg"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  className="absolute top-4 right-4 w-10 h-10 bg-error text-white rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <label
                  htmlFor="fileInput"
                  className="absolute bottom-4 right-4 px-4 py-2 bg-primary text-white rounded-full font-label text-sm font-bold hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
                >
                  Change File
                </label>
              </div>
            )}
          </div>
        </section>

        {/* Optional Notes */}
        <section className="space-y-4">
          <label className="font-label text-xs font-semibold uppercase tracking-wider text-outline">
            Optional Notes
          </label>
          <textarea
            className="w-full bg-surface-container-highest border-none rounded-xl p-4 focus:ring-2 focus:ring-secondary/50 focus:bg-surface-container-lowest transition-all font-body text-on-surface placeholder:text-outline"
            placeholder="Add any details about your transfer (e.g., Bank Name, Reference ID)"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </section>

        {/* Primary Submit Button */}
        <section className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="w-full bg-gradient-to-br from-secondary to-secondary-container text-on-secondary py-5 rounded-2xl font-headline font-extrabold text-lg shadow-[0_20px_50px_rgba(0,62,198,0.2)] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{uploading ? 'Uploading...' : 'Submit Payment Proof'}</span>
            <span className="material-symbols-outlined">send</span>
          </button>
          <p className="text-center font-label text-[10px] text-outline mt-6 uppercase tracking-widest leading-relaxed">
            By submitting, you confirm that the attached document <br />
            is a valid and authentic record of transaction.
          </p>
        </section>
      </main>

      {/* BottomNavBar - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pt-3 pb-8 bg-surface/70 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.04)] rounded-t-3xl z-50">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex flex-col items-center justify-center text-primary opacity-60 hover:text-secondary transition-all scale-90 active:duration-150"
        >
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-wider">Home</span>
        </button>
        <button
          onClick={() => router.push('/payments')}
          className="flex flex-col items-center justify-center text-secondary bg-secondary/10 rounded-xl px-3 py-1 scale-90 active:duration-150"
        >
          <span className="material-symbols-outlined">receipt_long</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-wider">Payments</span>
        </button>
        <button 
          onClick={() => router.push('/requests')}
          className="flex flex-col items-center justify-center text-primary opacity-60 hover:text-secondary transition-all scale-90 active:duration-150"
        >
          <span className="material-symbols-outlined">build</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-wider">Requests</span>
        </button>
        <button className="flex flex-col items-center justify-center text-primary opacity-60 hover:text-secondary transition-all scale-90 active:duration-150">
          <span className="material-symbols-outlined">restaurant</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-wider">Food</span>
        </button>
        <button 
          onClick={() => router.push('/profile')}
          className="flex flex-col items-center justify-center text-primary opacity-60 hover:text-secondary transition-all scale-90 active:duration-150"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-[10px] font-semibold uppercase tracking-wider">Profile</span>
        </button>
      </nav>
    </div>
  );
}
