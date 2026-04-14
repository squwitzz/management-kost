<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ResidentSeeder extends Seeder
{
    public function run(): void
    {
        // Get available rooms
        $rooms = Room::where('status', 'Kosong')->take(3)->get();

        if ($rooms->count() === 0) {
            echo "❌ No available rooms found!\n";
            return;
        }

        $residents = [
            [
                'nama' => 'Budi Santoso',
                'nomor_telepon' => '081234567891',
                'nik' => '3201234567890123',
                'email' => 'budi@example.com',
                'password' => Hash::make('password123'),
                'role' => 'Penghuni',
                'alamat_domisili' => 'Jakarta Selatan',
            ],
            [
                'nama' => 'Siti Nurhaliza',
                'nomor_telepon' => '081234567892',
                'nik' => '3201234567890124',
                'email' => 'siti@example.com',
                'password' => Hash::make('password123'),
                'role' => 'Penghuni',
                'alamat_domisili' => 'Jakarta Timur',
            ],
            [
                'nama' => 'Ahmad Fauzi',
                'nomor_telepon' => '081234567893',
                'nik' => '3201234567890125',
                'email' => 'ahmad@example.com',
                'password' => Hash::make('password123'),
                'role' => 'Penghuni',
                'alamat_domisili' => 'Jakarta Barat',
            ],
        ];

        foreach ($residents as $index => $residentData) {
            if (!isset($rooms[$index])) break;

            $room = $rooms[$index];
            $residentData['room_id'] = $room->id;
            
            $resident = User::create($residentData);
            
            $room->update(['status' => 'Terisi']);

            echo "✅ Created: {$resident->nama} - Room {$room->nomor_kamar}\n";
        }

        echo "\n📧 Test Login Credentials:\n";
        echo "   Nomor Telepon: 081234567891\n";
        echo "   Password: password123\n";
    }
}
