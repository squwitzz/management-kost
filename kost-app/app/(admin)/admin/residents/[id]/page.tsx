'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, Payment, Room } from '@/app/types';
import AdminHeader from '@/app/components/AdminHeader';
import AdminBottomNav from '@/app/components/AdminBottomNav';
import { ApiClient, getApiUrl, getBaseUrl } from '@/app/lib/api';
import { showSuccess, showError, showConfirm } from '@/app/lib/sweetalert';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ResidentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const residentId = params.id as string;

  const [resident, setResident] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignRoomModal, setShowAssignRoomModal] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

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

    fetchResidentDetail();
    fetchPayments();
  }, [residentId, router]);

  const fetchResidentDetail = async () => {
    try {
      const data = await ApiClient.getResident(parseInt(residentId));
      console.log('Resident data:', data);
      console.log('Resident room_id:', data.user?.room_id);
      console.log('Resident room:', data.user?.room);
      setResident(data.user);
    } catch (err) {
      console.error('Failed to fetch resident:', err);
      await showError('Error', 'Failed to load resident details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const data = await ApiClient.getRooms();
      const emptyRooms = (data.rooms || []).filter((room: Room) => room.status === 'Kosong');
      setAvailableRooms(emptyRooms);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      await showError('Error', 'Failed to load available rooms');
    }
  };

  const handleAssignRoom = async () => {
    if (!selectedRoomId) {
      await showError('Error', 'Please select a room');
      return;
    }

    const result = await showConfirm(
      'Assign Room',
      `Assign this resident to the selected room?`,
      'Assign'
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      const API_URL = getApiUrl();
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/users/${residentId}/assign-room`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({ room_id: selectedRoomId }),
        cache: 'no-store' as RequestCache,
        credentials: 'include' as RequestCredentials,
      });

      if (response.ok) {
        await showSuccess('Success!', 'Room assigned successfully!');
        setShowAssignRoomModal(false);
        fetchResidentDetail();
      } else {
        const error = await response.json();
        await showError('Error', error.error || 'Failed to assign room');
      }
    } catch (err: any) {
      console.error('Failed to assign room:', err);
      await showError('Error', err.message || 'Failed to assign room');
    }
  };

  const openAssignRoomModal = () => {
    fetchAvailableRooms();
    setShowAssignRoomModal(true);
  };

  const fetchPayments = async () => {
    try {
      const data = await ApiClient.getAdminPayments();
      const residentPayments = data.payments.filter(
        (p: Payment) => p.user_id === parseInt(residentId)
      );
      setPayments(residentPayments);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    }
  };

  const generatePDF = () => {
    if (!resident) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(76, 78, 80);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RESIDENT BIODATA', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('The Curator - Property Management System', pageWidth / 2, 30, { align: 'center' });

    // Resident ID
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Resident ID: #CUR-${resident.id.toString().padStart(4, '0')}`, 20, 50);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 20, 50, { align: 'right' });

    // Personal Information Section
    let yPos = 65;
    doc.setTextColor(0, 62, 198);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PERSONAL INFORMATION', 20, yPos);
    
    yPos += 3;
    doc.setDrawColor(0, 62, 198);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Name
    doc.setFont('helvetica', 'bold');
    doc.text('Full Name:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(resident.nama, 60, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('NIK:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(resident.nik, 60, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Phone Number:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(resident.nomor_telepon, 60, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Email:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(resident.email || '-', 60, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Address:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    const address = resident.alamat_domisili || '-';
    const addressLines = doc.splitTextToSize(address, 130);
    doc.text(addressLines, 60, yPos);
    yPos += (addressLines.length - 1) * 5;

    // Room Information Section
    yPos += 15;
    doc.setTextColor(0, 62, 198);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ROOM INFORMATION', 20, yPos);
    
    yPos += 3;
    doc.setDrawColor(0, 62, 198);
    doc.line(20, yPos, 190, yPos);

    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.setFont('helvetica', 'bold');
    doc.text('Room Number:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(resident.room?.nomor_kamar || '-', 60, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Room Type:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text('Standard Suite', 60, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Rate:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(resident.room ? `Rp ${resident.room.tarif_dasar.toLocaleString('id-ID')}` : '-', 60, yPos);

    // Payment History Section
    if (payments.length > 0) {
      yPos += 15;
      doc.setTextColor(0, 62, 198);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT HISTORY', 20, yPos);
      
      yPos += 3;
      doc.setDrawColor(0, 62, 198);
      doc.line(20, yPos, 190, yPos);

      yPos += 5;

      const tableData = payments.map((payment) => [
        payment.bulan_dibayar,
        payment.tanggal_upload
          ? new Date(payment.tanggal_upload).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : '-',
        `Rp ${payment.jumlah_tagihan.toLocaleString('id-ID')}`,
        payment.status_bayar === 'Lunas' ? 'Paid' : payment.status_bayar === 'Menunggu Verifikasi' ? 'Pending' : 'Unpaid',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Billing Period', 'Payment Date', 'Amount', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [0, 62, 198],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        margin: { left: 20, right: 20 },
      });
    }

    // Footer
    const finalY = (doc as any).lastAutoTable?.finalY || yPos + 20;
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('This document is generated automatically by The Curator Property Management System', pageWidth / 2, finalY + 20, { align: 'center' });
    doc.text('For inquiries, please contact the property management office', pageWidth / 2, finalY + 25, { align: 'center' });

    // Save PDF
    doc.save(`Resident_Biodata_${resident.nama.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Resident not found</p>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <AdminHeader title="Resident Profile" showBackButton={true} showMenu={false} />

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-12">
        {/* Quick Action Bar */}
        <div className="flex items-center justify-between bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-xl">person</span>
            </div>
            <div>
              <p className="font-headline font-bold text-primary">{resident.nama}</p>
              <p className="font-label text-xs text-on-surface-variant">
                Room {resident.room?.nomor_kamar || '-'} 
                {(!resident.room || !resident.room_id) && (
                  <span className="ml-2 px-2 py-0.5 bg-error-container text-on-error-container text-[10px] font-bold rounded-full">
                    No Room Assigned
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Always show for testing - will fix condition later */}
            <button
              onClick={() => {
                console.log('=== DEBUG RESIDENT DATA ===');
                console.log('resident:', resident);
                console.log('resident.room_id:', resident.room_id);
                console.log('resident.room:', resident.room);
                console.log('!resident.room:', !resident.room);
                console.log('!resident.room_id:', !resident.room_id);
                console.log('resident.room_id === null:', resident.room_id === null);
                alert(`room_id: ${resident.room_id}\nroom: ${JSON.stringify(resident.room)}\nCondition (!resident.room || !resident.room_id): ${!resident.room || !resident.room_id}`);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">bug_report</span>
              <span className="hidden md:inline">Debug</span>
            </button>
            
            {/* Show assign room button - testing */}
            <button
              onClick={openAssignRoomModal}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">meeting_room</span>
              <span className="hidden md:inline">Assign Room</span>
            </button>
            
            <button
              onClick={generatePDF}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span className="hidden md:inline">Export Biodata</span>
            </button>
          </div>
        </div>

        {/* Biodata Section: Bento Style Card */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Profile Column */}
          <div className="md:col-span-5 bg-surface-container-lowest rounded-[2rem] p-8 transition-all hover:bg-surface-container-low border border-outline-variant/15">
            <div className="relative group">
              <img
                alt={resident.nama}
                className="w-full aspect-square object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700"
                src={
                  resident.foto_penghuni
                    ? `${getBaseUrl()}/storage/${resident.foto_penghuni}`
                    : 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUe_fqSs_mEXImBn1Td_tce-oeWCz2RBOuzeAboY3q2ZSX3x1uhrrYkxyULXIOX-K8gQ7Gwf_Fewm-Dv05BdoAqlylRvBeuzeOje2aH2__JR3wjlyUbdLvM57eBZW52YNy7NHprIBSPZdV0nAq9pgCb4ALVjfkw_NqusJdPlOsrujJK-1utnB_yWit4dwKrwmjHjTlCZQAjqxk3wcTGByTJZPI6r1j8XXvOCoUDWUFX7jxjK0OPESkDug1XkKIWMg9cYssyxUnL40'
                }
              />
              <div className="absolute top-4 right-4">
                <span className="px-4 py-1.5 bg-secondary/10 text-secondary label-text text-[10px] uppercase tracking-widest font-bold rounded-full backdrop-blur-md">
                  Active Resident
                </span>
              </div>
            </div>
            <div className="mt-8 space-y-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-primary">{resident.nama}</h2>
              <p className="label-text text-on-surface-variant/60 text-sm">
                Resident ID: #CUR-{resident.id.toString().padStart(4, '0')}
              </p>
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={generatePDF}
                className="flex-1 py-3 px-4 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 transition-opacity active:scale-95 duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Export PDF
              </button>
              {/* Always show for testing */}
              <button 
                onClick={openAssignRoomModal}
                className="flex-1 py-3 px-4 bg-secondary text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity active:scale-95 duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">meeting_room</span>
                Assign Room
              </button>
              <button className="p-3 bg-secondary-container/10 text-secondary rounded-xl hover:bg-secondary-container/20 transition-colors">
                <span className="material-symbols-outlined">chat_bubble</span>
              </button>
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-7 space-y-6">
            <div className="bg-surface-container-low rounded-[2rem] p-10 h-full flex flex-col justify-between">
              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-on-surface-variant/50 mb-8 label-text">  
                Verification &amp; Contact
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-10 gap-x-8">
                <div className="space-y-2">
                  <label className="label-text text-[11px] uppercase font-bold text-on-surface-variant/40 tracking-wider">
                    National Identity (NIK)
                  </label>
                  <p className="text-lg font-semibold tracking-tight text-primary flex items-center gap-2">
                    {resident.nik.substring(0, 4)}************{resident.nik.substring(12)}
                    <span
                      className="material-symbols-outlined text-sm text-secondary"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="label-text text-[11px] uppercase font-bold text-on-surface-variant/40 tracking-wider">
                    Phone Number
                  </label>
                  <p className="text-lg font-semibold tracking-tight text-primary">{resident.nomor_telepon}</p>
                </div>
                <div className="space-y-2">
                  <label className="label-text text-[11px] uppercase font-bold text-on-surface-variant/40 tracking-wider">
                    Email Address
                  </label>
                  <p className="text-lg font-semibold tracking-tight text-primary underline underline-offset-4 decoration-outline-variant/30">
                    {resident.email || '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="label-text text-[11px] uppercase font-bold text-on-surface-variant/40 tracking-wider">
                    Alamat Domisili
                  </label>
                  <p className="text-lg font-semibold tracking-tight text-primary">
                    {resident.alamat_domisili || '-'}
                  </p>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-outline-variant/10 flex items-center justify-between">
                <div>
                  <p className="label-text text-xs text-on-surface-variant/40 font-medium">Assigned Unit</p>
                  <p className="text-xl font-extrabold text-primary">
                    Room {resident.room?.nomor_kamar || '-'} — Standard Suite
                  </p>
                </div>
                <span className="material-symbols-outlined text-outline-variant">domain</span>
              </div>
            </div>
          </div>
        </section>

        {/* Transaction History Section */}
        <section className="space-y-8">
          <div className="flex items-end justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold tracking-tight text-primary">Payment History</h3>
              <p className="label-text text-sm text-on-surface-variant/50">
                Tracking regular billings and service fees
              </p>
            </div>
            <a className="text-secondary font-bold text-sm hover:underline underline-offset-8" href="#">
              View All Records
            </a>
          </div>
          <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden border border-outline-variant/15">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-high/50 border-b border-outline-variant/10">
                  <tr>
                    <th className="px-8 py-5 label-text text-[11px] uppercase font-bold text-on-surface-variant/50 tracking-widest">
                      Billing Period
                    </th>
                    <th className="px-8 py-5 label-text text-[11px] uppercase font-bold text-on-surface-variant/50 tracking-widest">
                      Payment Date
                    </th>
                    <th className="px-8 py-5 label-text text-[11px] uppercase font-bold text-on-surface-variant/50 tracking-widest">
                      Amount
                    </th>
                    <th className="px-8 py-5 label-text text-[11px] uppercase font-bold text-on-surface-variant/50 tracking-widest text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-on-surface-variant">
                        No payment history available
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-secondary/5 flex items-center justify-center text-secondary">
                              <span className="material-symbols-outlined text-xl">payments</span>
                            </div>
                            <span className="font-bold text-primary">{payment.bulan_dibayar}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 label-text text-sm text-on-surface-variant">
                          {payment.tanggal_upload
                            ? new Date(payment.tanggal_upload).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="px-8 py-6 font-bold text-primary">
                          Rp {payment.jumlah_tagihan.toLocaleString('id-ID')}
                        </td>
                        <td className="px-8 py-6 text-right">
                          {payment.status_bayar === 'Lunas' ? (
                            <span className="inline-flex items-center px-4 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                              Paid
                            </span>
                          ) : payment.status_bayar === 'Menunggu Verifikasi' ? (
                            <span className="inline-flex items-center px-4 py-1 bg-surface-container-highest text-on-surface-variant text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-4 py-1 bg-error-container text-on-error-container text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                              Unpaid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <AdminBottomNav />

      {/* Assign Room Modal */}
      {showAssignRoomModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-2xl font-bold text-primary">Assign Room</h3>
              <button
                onClick={() => setShowAssignRoomModal(false)}
                className="p-2 hover:bg-surface-container rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="font-label text-xs font-semibold text-on-surface-variant uppercase tracking-widest block mb-2">
                  Select Available Room
                </label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-highest rounded-xl border-none focus:ring-2 focus:ring-secondary/20 transition-all font-body text-primary"
                >
                  <option value="">Choose a room...</option>
                  {availableRooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.nomor_kamar} - Rp {room.tarif_dasar.toLocaleString('id-ID')}/month
                    </option>
                  ))}
                </select>
                {availableRooms.length === 0 && (
                  <p className="text-xs text-error mt-2">No available rooms</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAssignRoomModal(false)}
                  className="flex-1 px-6 py-3 border border-outline-variant/50 text-primary rounded-xl font-label text-sm font-bold hover:bg-surface-container-low transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignRoom}
                  disabled={!selectedRoomId || availableRooms.length === 0}
                  className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-label text-sm font-bold hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-secondary/20"
                >
                  Assign Room
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
