'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserHeader, UserBottomNav } from '@/app/components';
import { useAuth } from '@/app/lib/useAuth';
import { User } from '@/app/types';

interface Peraturan {
  id: number;
  judul: string;
  deskripsi: string;
  kategori: string;
  urutan: number;
  is_active: boolean;
  icon: string;
  created_at: string;
  updated_at: string;
}

export default function RulesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth('Penghuni');
  const [user, setUser] = useState<User | null>(null);
  const [peraturan, setPeraturan] = useState<Peraturan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState<string>('All');

  const kategoris = ['All', 'Umum', 'Keamanan', 'Kebersihan', 'Fasilitas', 'Pembayaran', 'Lainnya'];

  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser) {
      setUser(authUser);
      fetchPeraturan();
    }
  }, [authLoading, isAuthenticated, authUser]);

  const fetchPeraturan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://127.0.0.1:8000/api/peraturan', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPeraturan(data.peraturan || []);
    } catch (err) {
      console.error('Failed to fetch peraturan:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconColor = (kategori: string) => {
    switch (kategori) {
      case 'Keamanan':
        return 'bg-error/10 text-error';
      case 'Kebersihan':
        return 'bg-secondary/10 text-secondary';
      case 'Fasilitas':
        return 'bg-tertiary/10 text-tertiary';
      case 'Pembayaran':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const filteredPeraturan = selectedKategori === 'All' 
    ? peraturan 
    : peraturan.filter(p => p.kategori === selectedKategori);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <UserHeader user={user} title="Peraturan Kost" />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-32">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-primary font-headline text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
            Peraturan & Tata Tertib
          </h2>
          <p className="text-outline text-sm md:text-base">
            Harap patuhi peraturan yang berlaku untuk kenyamanan bersama
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {kategoris.map((kategori) => (
              <button
                key={kategori}
                onClick={() => setSelectedKategori(kategori)}
                className={`px-4 py-2 rounded-xl font-label text-sm font-bold transition-all ${
                  selectedKategori === kategori
                    ? 'bg-primary text-white'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {kategori}
              </button>
            ))}
          </div>
        </div>

        {/* Rules List */}
        {filteredPeraturan.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">rule</span>
            <p className="text-outline text-lg">Belum ada peraturan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPeraturan.map((rule, index) => (
              <div
                key={rule.id}
                className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 hover:shadow-lg transition-all"
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(rule.kategori)}`}>
                    <span className="material-symbols-outlined text-2xl">
                      {rule.icon || 'rule'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-headline font-bold text-primary text-lg">
                            {index + 1}. {rule.judul}
                          </span>
                        </div>
                        <span className="inline-block px-3 py-1 bg-surface-container rounded-full text-xs font-label font-bold text-on-surface-variant">
                          {rule.kategori}
                        </span>
                      </div>
                    </div>
                    <p className="text-on-surface-variant text-sm leading-relaxed mt-3">
                      {rule.deskripsi}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-secondary/5 border border-secondary/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-secondary text-3xl">info</span>
            <div>
              <h3 className="font-headline font-bold text-primary mb-2">Informasi Penting</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Pelanggaran terhadap peraturan dapat mengakibatkan teguran hingga pemutusan kontrak sewa. 
                Jika ada pertanyaan, silakan hubungi pengelola kost.
              </p>
            </div>
          </div>
        </div>
      </main>

      <UserBottomNav />
    </div>
  );
}
