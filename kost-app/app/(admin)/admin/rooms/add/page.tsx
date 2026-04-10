'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddRoomPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nomor_kamar: '',
    tarif_dasar: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'exists' : 'missing');

      const requestBody = {
        nomor_kamar: formData.nomor_kamar,
        tarif_dasar: parseInt(formData.tarif_dasar),
        status: 'Kosong',
      };
      console.log('Request body:', requestBody);

      const response = await fetch('http://127.0.0.1:8000/api/rooms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log('Response text:', text);
        throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
      }
      
      console.log('Response data:', data);

      if (response.ok) {
        alert('Kamar berhasil ditambahkan!');
        router.push('/admin/rooms');
      } else {
        const errorMsg = data.error || (data.errors ? JSON.stringify(data.errors) : `HTTP ${response.status}: ${response.statusText}`);
        setError(errorMsg);
        console.error('Error:', errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to add room';
      setError(errorMsg);
      console.error('Exception:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#F7F9FB]/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 w-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-primary hover:opacity-80 transition-opacity active:scale-95 duration-200"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold tracking-tight text-lg text-primary">Add New Room</h1>
          </div>
        </div>
      </header>

      <main className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-surface-container-lowest p-8 md:p-12 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(25,28,30,0.04)]">
            <div className="mb-8">
              <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Room Details</h2>
              <p className="text-on-surface-variant text-sm">Enter the room information below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm">
                  <strong>Error:</strong> {error}
                  <br />
                  <small>Jika error "Unauthorized", silakan logout dan login kembali.</small>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                  Room Number
                </label>
                <input
                  className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-body text-primary placeholder:text-outline/50"
                  placeholder="101"
                  type="text"
                  value={formData.nomor_kamar}
                  onChange={(e) => setFormData({ ...formData, nomor_kamar: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
                  Base Rate (Rp/month)
                </label>
                <input
                  className="w-full px-4 py-3.5 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all font-body text-primary placeholder:text-outline/50"
                  placeholder="1500000"
                  type="number"
                  value={formData.tarif_dasar}
                  onChange={(e) => setFormData({ ...formData, tarif_dasar: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="font-body text-sm text-primary hover:text-secondary transition-colors"
                >
                  ← Cancel
                </button>
                <button
                  className="w-full md:w-auto px-12 py-4 rounded-xl text-on-primary font-headline font-bold text-lg shadow-[0_16px_32px_rgba(76,78,80,0.15)] hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
