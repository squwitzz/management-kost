export interface User {
  id: number;
  nama: string;
  nomor_telepon: string;
  nik: string;
  alamat_domisili?: string;
  email?: string;
  role: 'Admin' | 'Penghuni';
  foto_penghuni?: string;
  room_id?: number;
  room?: Room;
}

export interface Room {
  id: number;
  nomor_kamar: string;
  status: 'Kosong' | 'Terisi';
  tarif_dasar: number;
  users?: User[];
}

export interface Payment {
  id: number;
  user_id: number;
  jumlah_tagihan: number;
  status_bayar: 'Belum Lunas' | 'Belum Bayar' | 'Menunggu Verifikasi' | 'Lunas';
  bulan_dibayar: string;
  bukti_bayar?: string;
  tanggal_upload?: string;
  tanggal_verifikasi?: string;
  user?: User;
  room?: Room;
}

export interface FoodItem {
  id: number;
  nama_makanan: string;
  nama_vendor: string;
  harga: number;
  gambar?: string;
  status_stok: 'Tersedia' | 'Habis';
  deskripsi?: string;
}

export interface FoodOrder {
  id: number;
  user_id: number;
  food_id: number;
  jumlah: number;
  total_harga: number;
  status_pesanan: 'Pending' | 'Diproses Vendor' | 'Selesai';
  catatan?: string;
  user?: User;
  foodItem?: FoodItem;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  judul: string;
  pesan: string;
  tipe: 'Tagihan' | 'Pembayaran' | 'Pesanan' | 'Sistem';
  is_read: boolean;
  created_at: string;
}

export interface MaintenanceRequest {
  id: number;
  user_id: number;
  kategori: 'Plumbing' | 'Electrical' | 'Furniture' | 'HVAC' | 'Appliances';
  deskripsi: string;
  foto?: string;
  prioritas: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'In Progress' | 'Resolved';
  is_draft: boolean;
  catatan_admin?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface LoginResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}
