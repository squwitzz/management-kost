'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AdminHeader, AdminBottomNav } from '@/app/components';
import { MaintenanceRequest } from '@/app/types';

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [catatan, setCatatan] = useState('');
  const [prioritas, setPrioritas] = useState('');
  const [status, setStatus] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/maintenance-requests/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.request);
        setCatatan(data.request.catatan_admin || '');
        setPrioritas(data.request.prioritas);
        setStatus(data.request.status);
      }
    } catch (err) {
      console.error('Failed to fetch request:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/maintenance-requests/${params.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          prioritas,
          status,
          catatan_admin: catatan,
        }),
      });

      if (response.ok) {
        alert('Request updated successfully');
        fetchRequest();
      }
    } catch (err) {
      console.error('Failed to update request:', err);
      alert('Failed to update request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader title="Request Details" showBackButton />
        <div className="text-center py-12">
          <p className="text-outline">Loading...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader title="Request Details" showBackButton />
        <div className="text-center py-12">
          <p className="text-outline">Request not found</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <AdminHeader title="Request Details" showBackButton />

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info Card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="font-headline text-3xl font-bold text-primary mb-2">{request.kategori}</h2>
                  <p className="text-outline font-label text-sm">Request #{request.id}</p>
                </div>
                <span
                  className={`px-4 py-2 text-xs font-label font-extrabold uppercase tracking-wider rounded-full ${
                    status === 'New'
                      ? 'bg-secondary-container text-on-secondary-container'
                      : status === 'In Progress'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-label text-xs text-outline uppercase tracking-wider mb-2">Description</p>
                  <p className="text-primary leading-relaxed">{request.deskripsi}</p>
                </div>

                {request.foto && (
                  <div>
                    <p className="font-label text-xs text-outline uppercase tracking-wider mb-2">Photo Evidence</p>
                    <div
                      className="rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setShowImageModal(true)}
                    >
                      <img
                        src={`http://127.0.0.1:8000/storage/${request.foto}`}
                        alt="Request photo"
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <p className="text-xs text-outline mt-2">Click to view full size</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div>
                    <p className="font-label text-xs text-outline uppercase tracking-wider mb-1">Submitted</p>
                    <p className="text-primary font-medium">{formatDate(request.created_at)}</p>
                  </div>
                  {request.resolved_at && (
                    <div>
                      <p className="font-label text-xs text-outline uppercase tracking-wider mb-1">Resolved</p>
                      <p className="text-primary font-medium">{formatDate(request.resolved_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resident Info Card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
              <h3 className="font-headline text-xl font-bold text-primary mb-6">Resident Information</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-surface-container-high overflow-hidden">
                  <img
                    src={
                      request.user?.foto_penghuni
                        ? `http://127.0.0.1:8000/storage/${request.user.foto_penghuni}`
                        : 'https://via.placeholder.com/150'
                    }
                    alt={request.user?.nama}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-headline text-lg font-bold text-primary">{request.user?.nama}</p>
                  <p className="text-outline text-sm">Room {request.user?.room?.nomor_kamar || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-label text-xs text-outline uppercase tracking-wider mb-1">Phone</p>
                  <p className="text-primary">{request.user?.nomor_telepon}</p>
                </div>
                {request.user?.email && (
                  <div>
                    <p className="font-label text-xs text-outline uppercase tracking-wider mb-1">Email</p>
                    <p className="text-primary">{request.user.email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="space-y-6">
            {/* Update Form */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
              <h3 className="font-headline text-lg font-bold text-primary mb-6">Update Request</h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-label text-xs text-outline uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 font-body text-primary focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label text-xs text-outline uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    value={prioritas}
                    onChange={(e) => setPrioritas(e.target.value)}
                    className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 font-body text-primary focus:ring-2 focus:ring-secondary/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label text-xs text-outline uppercase tracking-wider mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full bg-surface-container-high border-none rounded-lg py-3 px-4 font-body text-primary focus:ring-2 focus:ring-secondary/20 resize-none"
                    rows={4}
                    placeholder="Add notes about this request..."
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  className="w-full bg-primary text-white py-3 rounded-lg font-label font-bold hover:opacity-90 transition-all"
                >
                  Update Request
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
              <h3 className="font-headline text-lg font-bold text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full py-3 border border-outline-variant/30 text-primary rounded-lg text-sm font-label font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  Message Resident
                </button>
                <button className="w-full py-3 border border-outline-variant/30 text-primary rounded-lg text-sm font-label font-semibold hover:bg-surface-container transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image Modal */}
      {showImageModal && request.foto && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:opacity-70 transition-opacity"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            <img
              src={`http://127.0.0.1:8000/storage/${request.foto}`}
              alt="Request photo"
              className="max-w-full max-h-[90vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
}
