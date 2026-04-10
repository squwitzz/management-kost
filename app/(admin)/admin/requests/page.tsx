'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminHeader, AdminBottomNav } from '@/app/components';
import { MaintenanceRequest } from '@/app/types';

export default function AdminRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    high_priority: 0,
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, priorityFilter]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/maintenance-requests', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/maintenance-requests/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.user?.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.user?.room?.nomor_kamar.includes(searchQuery)
      );
    }

    // Priority filter
    if (priorityFilter !== 'All') {
      filtered = filtered.filter((r) => r.prioritas === priorityFilter);
    }

    setFilteredRequests(filtered);
  };

  const updateRequest = async (id: number, updates: Partial<MaintenanceRequest>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://127.0.0.1:8000/api/maintenance-requests/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchRequests();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to update request:', err);
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
        return 'text-error';
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

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <AdminHeader title="Maintenance Ops" />

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Dashboard Header */}
        <div className="mb-12">
          <h2 className="text-primary font-headline text-5xl font-extrabold tracking-tight mb-2">
            Maintenance Ops
          </h2>
          <p className="text-outline text-lg font-normal max-w-2xl">
            Manage resident requests with precision. Orchestrating repairs, priorities, and workflow efficiency in real-time.
          </p>
        </div>

        {/* Filter & Search Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12 items-end">
          {/* Search: 7 cols */}
          <div className="lg:col-span-7">
            <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2 ml-1">
              Universal Search
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-secondary transition-colors">
                search
              </span>
              <input
                className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-secondary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/50 font-body"
                placeholder="Search by name, room, or issue..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Priority Filter: 5 cols */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-label text-[10px] uppercase tracking-widest text-outline mb-2 ml-1">
                Priority Filter
              </label>
              <div className="flex bg-surface-container-low p-1.5 rounded-xl">
                {['All', 'High', 'Medium', 'Low'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setPriorityFilter(filter)}
                    className={`flex-1 py-2 text-xs font-label font-semibold rounded-lg transition-colors ${
                      priorityFilter === filter
                        ? 'bg-surface-container-lowest shadow-sm text-primary'
                        : 'text-outline hover:text-primary'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="font-label text-xs text-outline uppercase mb-1">Total</p>
            <p className="font-headline text-2xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="font-label text-xs text-outline uppercase mb-1">New</p>
            <p className="font-headline text-2xl font-bold text-secondary">{stats.new}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="font-label text-xs text-outline uppercase mb-1">In Progress</p>
            <p className="font-headline text-2xl font-bold text-orange-600">{stats.in_progress}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="font-label text-xs text-outline uppercase mb-1">Resolved</p>
            <p className="font-headline text-2xl font-bold text-emerald-600">{stats.resolved}</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl">
            <p className="font-label text-xs text-outline uppercase mb-1">High Priority</p>
            <p className="font-headline text-2xl font-bold text-error">{stats.high_priority}</p>
          </div>
        </div>

        {/* Maintenance Requests Cards */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-outline">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">build</span>
            <p className="text-outline text-lg">No maintenance requests found</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-24">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 hover:shadow-2xl hover:shadow-secondary/5 transition-all duration-300 group"
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
                      <p className="font-label text-xs text-outline">
                        {request.user?.room?.nomor_kamar || 'N/A'} • {request.user?.nama}
                      </p>
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
                <div className="flex gap-3">
                  {request.status === 'New' && (
                    <button
                      onClick={() => updateRequest(request.id, { status: 'In Progress' })}
                      className="flex-1 py-3 bg-secondary text-white rounded-lg text-xs font-label font-bold hover:bg-secondary/90 transition-all"
                    >
                      Start Work
                    </button>
                  )}
                  {request.status === 'In Progress' && (
                    <button
                      onClick={() => updateRequest(request.id, { status: 'Resolved' })}
                      className="flex-1 py-3 bg-emerald-600 text-white rounded-lg text-xs font-label font-bold hover:bg-emerald-700 transition-all"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {request.status === 'Resolved' && (
                    <button className="flex-1 py-3 border border-outline-variant/30 text-primary rounded-lg text-xs font-label font-bold hover:bg-surface-container transition-all">
                      Archive
                    </button>
                  )}
                  <button
                    onClick={() => router.push(`/admin/requests/${request.id}`)}
                    className="px-3 py-3 border border-outline-variant/30 text-outline rounded-lg hover:bg-surface-container transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">more_horiz</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>

      <AdminBottomNav />
    </div>
  );
}
