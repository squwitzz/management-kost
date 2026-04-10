'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { useAuth } from '@/app/lib/useAuth';
import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
import { showSuccess, showError, showDeleteConfirm } from '@/app/lib/sweetalert';

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

export default function AdminRulesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth('Admin');
  const [peraturan, setPeraturan] = useState<Peraturan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Umum',
    urutan: 0,
    is_active: true,
    icon: 'rule',
  });

  const kategoris = ['Umum', 'Keamanan', 'Kebersihan', 'Fasilitas', 'Pembayaran', 'Lainnya'];
  const icons = ['rule', 'security', 'cleaning_services', 'home', 'payments', 'info', 'warning', 'check_circle'];

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPeraturan();
    }
  }, [authLoading, isAuthenticated]);

  const fetchPeraturan = async () => {
    try {
      console.log('Fetching rules...');
      const API_URL = getApiUrl();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/peraturan/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to fetch rules');
      }

      const data = await response.json();
      console.log('Rules data:', data);
      setPeraturan(data.peraturan || []);
    } catch (err: any) {
      console.error('Failed to fetch peraturan:', err);
      if (err.message?.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
      } else {
        setMessage({ type: 'error', text: err.message || 'Failed to load rules' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (editingId) {
        await ApiClient.updateRule(editingId, formData);
        setMessage({ type: 'success', text: 'Peraturan updated!' });
      } else {
        await ApiClient.createRule(formData);
        setMessage({ type: 'success', text: 'Peraturan created!' });
      }
      
      setShowModal(false);
      resetForm();
      fetchPeraturan();
    } catch (error: any) {
      if (error.message?.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
        return;
      }
      setMessage({ type: 'error', text: error.message || 'Failed to save' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule: Peraturan) => {
    setEditingId(rule.id);
    setFormData({
      judul: rule.judul,
      deskripsi: rule.deskripsi,
      kategori: rule.kategori,
      urutan: rule.urutan,
      is_active: rule.is_active,
      icon: rule.icon,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const result = await showDeleteConfirm('peraturan ini');

    if (!result.isConfirmed) {
      return;
    }

    try {
      await ApiClient.deleteRule(id);
      setMessage({ type: 'success', text: 'Peraturan deleted!' });
      fetchPeraturan();
    } catch (error: any) {
      if (error.message?.includes('401')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        window.location.href = '/login';
        return;
      }
      setMessage({ type: 'error', text: error.message || 'Failed to delete' });
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      const API_URL = getApiUrl();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/peraturan/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          window.location.href = '/login';
          return;
        }
        throw new Error('Failed to toggle');
      }

      fetchPeraturan();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const resetForm = () => {
    setFormData({
      judul: '',
      deskripsi: '',
      kategori: 'Umum',
      urutan: 0,
      is_active: true,
      icon: 'rule',
    });
    setEditingId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-8">
      <AdminHeader title="Manage Rules" />

      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-primary font-headline text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Peraturan Kost
            </h2>
            <p className="text-outline text-sm md:text-base">
              Kelola peraturan dan tata tertib kost
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-primary text-white px-6 py-3 rounded-xl font-label font-bold text-sm flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Rule
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-secondary-container text-on-secondary-container' 
              : 'bg-error-container text-on-error-container'
          }`}>
            {message.text}
          </div>
        )}

        {/* Rules List */}
        <div className="space-y-4">
          {peraturan.map((rule) => (
            <div
              key={rule.id}
              className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    {rule.icon}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-headline font-bold text-primary text-lg mb-1">
                        {rule.judul}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-label font-bold">
                          {rule.kategori}
                        </span>
                        <span className="px-3 py-1 bg-surface-container rounded-full text-xs font-label font-bold">
                          Urutan: {rule.urutan}
                        </span>
                        <button
                          onClick={() => handleToggleActive(rule.id)}
                          className={`px-3 py-1 rounded-full text-xs font-label font-bold ${
                            rule.is_active
                              ? 'bg-secondary-container text-on-secondary-container'
                              : 'bg-error-container text-on-error-container'
                          }`}
                        >
                          {rule.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {rule.deskripsi}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-primary">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-2 rounded-xl bg-error-container hover:bg-error-container/80 transition-colors"
                      >
                        <span className="material-symbols-outlined text-error">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="font-headline font-bold text-primary text-2xl mb-6">
              {editingId ? 'Edit Peraturan' : 'Tambah Peraturan'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Judul
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-3 font-body text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                  Deskripsi
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-3 font-body text-on-surface min-h-[100px]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Kategori
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-3 font-body text-on-surface"
                  >
                    {kategoris.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-3 font-body text-on-surface"
                  >
                    {icons.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={formData.urutan}
                    onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) })}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-3 font-body text-on-surface"
                  />
                </div>

                <div>
                  <label className="label-font text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                    Status
                  </label>
                  <select
                    value={formData.is_active ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    className="w-full bg-surface-container-highest border-none rounded-xl px-5 py-3 font-body text-on-surface"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-surface-container text-on-surface py-3 rounded-xl font-label font-bold hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary text-white py-3 rounded-xl font-label font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
}
