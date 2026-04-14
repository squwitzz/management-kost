<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Peraturan;

class PeraturanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $peraturan = [
            [
                'judul' => 'Jam Malam',
                'deskripsi' => 'Pintu utama kost akan ditutup pada pukul 23.00 WIB. Penghuni yang pulang lewat dari jam tersebut diharapkan memberitahu pengelola terlebih dahulu.',
                'kategori' => 'Keamanan',
                'urutan' => 1,
                'is_active' => true,
                'icon' => 'schedule',
            ],
            [
                'judul' => 'Tamu Berkunjung',
                'deskripsi' => 'Tamu diperbolehkan berkunjung pada pukul 08.00 - 21.00 WIB. Tamu wajib melapor ke pengelola dan meninggalkan identitas. Tamu lawan jenis tidak diperbolehkan masuk ke kamar.',
                'kategori' => 'Keamanan',
                'urutan' => 2,
                'is_active' => true,
                'icon' => 'group',
            ],
            [
                'judul' => 'Kebersihan Kamar',
                'deskripsi' => 'Penghuni wajib menjaga kebersihan kamar masing-masing. Sampah harus dibuang pada tempat yang telah disediakan. Pembersihan kamar dilakukan minimal 2x seminggu.',
                'kategori' => 'Kebersihan',
                'urutan' => 3,
                'is_active' => true,
                'icon' => 'cleaning_services',
            ],
            [
                'judul' => 'Kebersihan Area Umum',
                'deskripsi' => 'Penghuni wajib menjaga kebersihan area umum seperti dapur, kamar mandi, dan ruang tamu. Setelah menggunakan fasilitas umum, harap dibersihkan kembali.',
                'kategori' => 'Kebersihan',
                'urutan' => 4,
                'is_active' => true,
                'icon' => 'home_work',
            ],
            [
                'judul' => 'Pembayaran Sewa',
                'deskripsi' => 'Pembayaran sewa kamar dilakukan setiap tanggal 1-5 setiap bulannya. Keterlambatan pembayaran akan dikenakan denda Rp 50.000 per hari. Bukti pembayaran wajib diunggah melalui aplikasi.',
                'kategori' => 'Pembayaran',
                'urutan' => 5,
                'is_active' => true,
                'icon' => 'payments',
            ],
            [
                'judul' => 'Penggunaan Listrik',
                'deskripsi' => 'Penghuni diharapkan menggunakan listrik secara bijak. Matikan lampu dan peralatan elektronik saat tidak digunakan. Penggunaan listrik berlebihan akan dikenakan biaya tambahan.',
                'kategori' => 'Fasilitas',
                'urutan' => 6,
                'is_active' => true,
                'icon' => 'bolt',
            ],
            [
                'judul' => 'Penggunaan Air',
                'deskripsi' => 'Gunakan air secukupnya dan pastikan keran tertutup rapat setelah digunakan. Jangan membuang sampah atau benda asing ke dalam toilet atau saluran air.',
                'kategori' => 'Fasilitas',
                'urutan' => 7,
                'is_active' => true,
                'icon' => 'water_drop',
            ],
            [
                'judul' => 'Kebisingan',
                'deskripsi' => 'Hindari membuat kebisingan yang mengganggu penghuni lain, terutama pada malam hari (22.00 - 06.00 WIB). Penggunaan speaker atau alat musik harus dengan volume yang wajar.',
                'kategori' => 'Umum',
                'urutan' => 8,
                'is_active' => true,
                'icon' => 'volume_down',
            ],
            [
                'judul' => 'Hewan Peliharaan',
                'deskripsi' => 'Hewan peliharaan tidak diperbolehkan di dalam kost kecuali mendapat izin khusus dari pengelola. Jika diizinkan, pemilik bertanggung jawab penuh atas kebersihan dan keamanan.',
                'kategori' => 'Umum',
                'urutan' => 9,
                'is_active' => true,
                'icon' => 'pets',
            ],
            [
                'judul' => 'Merokok',
                'deskripsi' => 'Merokok hanya diperbolehkan di area yang telah ditentukan. Dilarang merokok di dalam kamar atau area umum tertutup. Buang puntung rokok pada tempat yang disediakan.',
                'kategori' => 'Umum',
                'urutan' => 10,
                'is_active' => true,
                'icon' => 'smoke_free',
            ],
            [
                'judul' => 'Barang Berharga',
                'deskripsi' => 'Pengelola tidak bertanggung jawab atas kehilangan barang berharga milik penghuni. Penghuni diharapkan menjaga barang berharganya sendiri dan mengunci kamar saat keluar.',
                'kategori' => 'Keamanan',
                'urutan' => 11,
                'is_active' => true,
                'icon' => 'lock',
            ],
            [
                'judul' => 'Perbaikan dan Maintenance',
                'deskripsi' => 'Jika ada kerusakan fasilitas kamar atau area umum, segera laporkan kepada pengelola melalui aplikasi. Jangan melakukan perbaikan sendiri tanpa izin pengelola.',
                'kategori' => 'Fasilitas',
                'urutan' => 12,
                'is_active' => true,
                'icon' => 'build',
            ],
            [
                'judul' => 'Parkir Kendaraan',
                'deskripsi' => 'Parkir kendaraan hanya di area yang telah ditentukan. Kendaraan harus terkunci dan pengelola tidak bertanggung jawab atas kehilangan atau kerusakan kendaraan.',
                'kategori' => 'Fasilitas',
                'urutan' => 13,
                'is_active' => true,
                'icon' => 'local_parking',
            ],
            [
                'judul' => 'Aktivitas Ilegal',
                'deskripsi' => 'Dilarang keras melakukan aktivitas ilegal seperti perjudian, narkoba, atau tindak kriminal lainnya. Pelanggaran akan dilaporkan ke pihak berwajib dan kontrak sewa akan diputus.',
                'kategori' => 'Keamanan',
                'urutan' => 14,
                'is_active' => true,
                'icon' => 'warning',
            ],
            [
                'judul' => 'Perpanjangan Kontrak',
                'deskripsi' => 'Perpanjangan kontrak sewa harus dilakukan minimal 1 bulan sebelum masa sewa berakhir. Konfirmasi perpanjangan dapat dilakukan melalui pengelola atau aplikasi.',
                'kategori' => 'Pembayaran',
                'urutan' => 15,
                'is_active' => true,
                'icon' => 'event_repeat',
            ],
        ];

        foreach ($peraturan as $rule) {
            Peraturan::create($rule);
        }
    }
}
