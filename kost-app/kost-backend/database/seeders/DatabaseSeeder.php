<?php

namespace Database\Seeders;

use App\Models\FoodItem;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'nama' => 'Admin Kost',
            'nomor_telepon' => '081234567890',
            'nik' => '1234567890123456',
            'email' => 'admin@kost.com',
            'password' => Hash::make('admin123'),
            'role' => 'Admin',
        ]);

        // Create Sample Rooms
        $rooms = [
            ['nomor_kamar' => '101', 'tarif_dasar' => 1000000, 'status' => 'Kosong'],
            ['nomor_kamar' => '102', 'tarif_dasar' => 1000000, 'status' => 'Kosong'],
            ['nomor_kamar' => '201', 'tarif_dasar' => 1200000, 'status' => 'Kosong'],
            ['nomor_kamar' => '202', 'tarif_dasar' => 1200000, 'status' => 'Kosong'],
            ['nomor_kamar' => '301', 'tarif_dasar' => 1500000, 'status' => 'Kosong'],
        ];

        foreach ($rooms as $room) {
            Room::create($room);
        }

        // Create Sample Food Items
        $foodItems = [
            [
                'nama_makanan' => 'Nasi Goreng',
                'nama_vendor' => 'Warung Pak Budi',
                'harga' => 15000,
                'status_stok' => 'Tersedia',
                'deskripsi' => 'Nasi goreng spesial dengan telur dan ayam',
            ],
            [
                'nama_makanan' => 'Mie Ayam',
                'nama_vendor' => 'Mie Ayam Bakso Mas Joko',
                'harga' => 12000,
                'status_stok' => 'Tersedia',
                'deskripsi' => 'Mie ayam dengan bakso dan pangsit',
            ],
            [
                'nama_makanan' => 'Ayam Geprek',
                'nama_vendor' => 'Geprek Bensu',
                'harga' => 18000,
                'status_stok' => 'Tersedia',
                'deskripsi' => 'Ayam geprek dengan sambal level 1-5',
            ],
            [
                'nama_makanan' => 'Soto Ayam',
                'nama_vendor' => 'Soto Lamongan',
                'harga' => 13000,
                'status_stok' => 'Tersedia',
                'deskripsi' => 'Soto ayam lamongan dengan nasi',
            ],
            [
                'nama_makanan' => 'Nasi Uduk',
                'nama_vendor' => 'Warung Pak Budi',
                'harga' => 10000,
                'status_stok' => 'Tersedia',
                'deskripsi' => 'Nasi uduk dengan lauk lengkap',
            ],
        ];

        foreach ($foodItems as $item) {
            FoodItem::create($item);
        }

        echo "✅ Database seeded successfully!\n";
        echo "📧 Admin Login:\n";
        echo "   Nomor Telepon: 081234567890\n";
        echo "   Password: admin123\n";
    }
}
