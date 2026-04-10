'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserHeader, UserBottomNav } from '@/app/components';
import { User, MaintenanceRequest } from '@/app/types';

export default function RequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
    
    // Fetch requests without blocking initial render
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/maintenance-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-secondary-container text-on-secondary-container';
      case 'In Progress':
        return 'bg-orange-100 text-orange-700';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-surface-container text-on-surface';
    }
  };

  const getPriorityColor = (prioritas: string) => {
    switch (prioritas) {
      case 'Critical':
      case 'High':
        return 'text-error';
      case 'Medium':
        return 'text-tertiary';
      case 'Low':
        return 'text-outline';
      default:
        return 'text-outline';
    }
  };

  const getIcon = (kategori: string) => {
    switch (kategori) {
      case 'Plumbing':
        return 'water_drop';
      case 'Electrical':
        return 'light';
      case 'Furniture':
        return 'chair';
      case 'HVAC':
        return 'ac_unit';
      case 'Appliances':
        return 'kitchen';
      default:
        return 'build';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const newRequests = requests.filter((r) => r.status === 'New');
  const inProgressRequests = requests.filter((r) => r.status === 'In Progress');
  const resolvedRequests = requests.filter((r) => r.status === 'Resolved');

  return (
    <div className="min-h-screen bg-surface pb-24 md:pb-8">
      <UserHeader user={user} title="My Requests" />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-32">
        {/* Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-primary font-headline text-3xl md:text-5xl font-extrabold tracking-tight mb-1 md:mb-2">
                Maintenance Requests
              </h2>
              <p className="text-outline text-sm md:text-lg font-normal">
                Track your maintenance requests and their status
              </p>
            </div>
            {/* Desktop Button */}
            <button
              onClick={() => router.push('/requests/create')}
              className="hidden md:flex bg-primary text-white px-6 py-3 rounded-xl font-label font-semibold text-sm items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              New Request
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label text-xs text-outline uppercase tracking-wider mb-2">New</p>
                <p className="font-headline text-3xl font-bold text-secondary">{newRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary">pending</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label text-xs text-outline uppercase tracking-wider mb-2">In Progress</p>
                <p className="font-headline text-3xl font-bold text-orange-600">{inProgressRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-orange-600">engineering</span>
              </div>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-4 md:p-6 rounded-xl border border-outline-variant/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label text-xs text-outline uppercase tracking-wider mb-2">Resolved</p>
                <p className="font-headline text-3xl font-bold text-emerald-600">{resolvedRequests.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-outline">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">build</span>
            <p className="text-outline text-lg">No maintenance requests yet</p>
            <button
              onClick={() => router.push('/requests/create')}
              className="mt-6 bg-primary text-white px-6 py-3 rounded-xl font-label font-semibold text-sm"
            >
              Create Your First Request
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 hover:shadow-2xl hover:shadow-secondary/5 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary">
                        {getIcon(request.kategori)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-primary text-lg">{request.kategori}</h3>
                      <p className="font-label text-xs text-outline">Request #{request.id}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-[10px] font-label font-extrabold uppercase tracking-wider rounded-full ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="space-y-4 mb-6">
                  <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-3">
                    {request.deskripsi}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-label text-outline">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-xs">calendar_today</span>
                      {formatDate(request.created_at)}
                    </span>
                    <span className={`flex items-center gap-1.5 font-semibold ${getPriorityColor(request.prioritas)}`}>
                      <span className="material-symbols-outlined text-xs">priority_high</span>
                      {request.prioritas}
                    </span>
                  </div>
                </div>
                {request.foto && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={`http://127.0.0.1:8000/storage/${request.foto}`}
                      alt="Request photo"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                {request.catatan_admin && (
                  <div className="mb-4 p-3 bg-surface-container rounded-lg">
                    <p className="font-label text-xs text-outline uppercase tracking-wider mb-1">Admin Note</p>
                    <p className="text-sm text-primary">{request.catatan_admin}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button - Mobile Only */}
      <button
        onClick={() => router.push('/requests/create')}
        className="md:hidden fixed bottom-28 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all z-40"
        aria-label="Create new request"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      <UserBottomNav />
    </div>
  );
}
