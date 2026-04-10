<?php
/**
 * Create Admin User Helper
 * 
 * IMPORTANT: DELETE THIS FILE AFTER USE!
 * 
 * This file creates a default admin user for testing.
 * Access: http://yourdomain.com/create-admin.php
 */

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

?>
<!DOCTYPE html>
<html>
<head>
    <title>Create Admin User</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; margin: 10px 0; border-radius: 5px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .credentials { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; font-family: monospace; }
    </style>
</head>
<body>
    <h1>🔐 Create Admin User</h1>
    
    <div class="warning">
        <strong>⚠️ SECURITY WARNING:</strong> DELETE THIS FILE AFTER USE!
    </div>

    <?php
    $action = $_GET['action'] ?? 'form';

    if ($action === 'form') {
        ?>
        <div class="info">
            <p>This will create a default admin user for your application.</p>
            <p>You can customize the credentials below before creating.</p>
        </div>

        <form method="GET" action="">
            <input type="hidden" name="action" value="create">
            
            <div style="margin: 20px 0;">
                <label><strong>Nama:</strong></label><br>
                <input type="text" name="nama" value="Admin" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>

            <div style="margin: 20px 0;">
                <label><strong>Nomor Telepon:</strong></label><br>
                <input type="text" name="nomor_telepon" value="081234567890" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>

            <div style="margin: 20px 0;">
                <label><strong>Password:</strong></label><br>
                <input type="text" name="password" value="admin123" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>

            <div style="margin: 20px 0;">
                <label><strong>Email:</strong></label><br>
                <input type="email" name="email" value="admin@kost.com" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>

            <div style="margin: 20px 0;">
                <label><strong>NIK:</strong></label><br>
                <input type="text" name="nik" value="1234567890123456" style="width: 100%; padding: 8px; margin-top: 5px;">
            </div>

            <button type="submit">Create Admin User</button>
        </form>
        <?php
    } elseif ($action === 'create') {
        try {
            $nama = $_GET['nama'] ?? 'Admin';
            $nomor_telepon = $_GET['nomor_telepon'] ?? '081234567890';
            $password = $_GET['password'] ?? 'admin123';
            $email = $_GET['email'] ?? 'admin@kost.com';
            $nik = $_GET['nik'] ?? '1234567890123456';

            // Check if user already exists
            $existingUser = User::where('nomor_telepon', $nomor_telepon)->first();
            
            if ($existingUser) {
                echo '<div class="warning">';
                echo '<strong>⚠️ User already exists!</strong><br>';
                echo 'A user with this phone number already exists in the database.';
                echo '</div>';
                
                echo '<div class="credentials">';
                echo '<strong>Existing User:</strong><br>';
                echo 'Nama: ' . $existingUser->nama . '<br>';
                echo 'Nomor Telepon: ' . $existingUser->nomor_telepon . '<br>';
                echo 'Role: ' . $existingUser->role . '<br>';
                echo '</div>';
            } else {
                // Create admin user
                $admin = User::create([
                    'nama' => $nama,
                    'nomor_telepon' => $nomor_telepon,
                    'password' => Hash::make($password),
                    'role' => 'admin',
                    'nik' => $nik,
                    'email' => $email,
                ]);

                echo '<div class="success">';
                echo '<strong>✅ Admin user created successfully!</strong>';
                echo '</div>';

                echo '<div class="credentials">';
                echo '<strong>Login Credentials:</strong><br>';
                echo 'Nomor Telepon: <strong>' . $nomor_telepon . '</strong><br>';
                echo 'Password: <strong>' . $password . '</strong><br>';
                echo 'Role: <strong>admin</strong>';
                echo '</div>';

                echo '<div class="info">';
                echo '<strong>Next Steps:</strong><br>';
                echo '1. Test login at: <a href="https://management-kost.vercel.app/login" target="_blank">https://management-kost.vercel.app/login</a><br>';
                echo '2. <strong>DELETE THIS FILE</strong> for security!<br>';
                echo '3. Change the password after first login';
                echo '</div>';
            }

            echo '<br><a href="?action=form"><button>Create Another User</button></a>';
            
        } catch (\Exception $e) {
            echo '<div class="error">';
            echo '<strong>✗ Error creating user:</strong><br>';
            echo $e->getMessage();
            echo '</div>';
            
            echo '<br><a href="?action=form"><button>Try Again</button></a>';
        }
    }
    ?>

    <hr style="margin: 40px 0;">
    <div class="warning">
        <strong>🔒 IMPORTANT:</strong> After creating the admin user, DELETE this file immediately!
        <br><br>
        File location: <code>/public/create-admin.php</code>
    </div>

</body>
</html>
