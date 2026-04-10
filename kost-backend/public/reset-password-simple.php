<?php
/**
 * Simple Password Reset - Direct Database Access
 * 
 * IMPORTANT: DELETE THIS FILE AFTER USE!
 * 
 * This version connects directly to database without Laravel
 */

// Load .env file
$envFile = __DIR__.'/../.env';
if (!file_exists($envFile)) {
    die('Error: .env file not found');
}

$env = parse_ini_file($envFile);

// Database configuration from .env
$dbHost = $env['DB_HOST'] ?? 'localhost';
$dbName = $env['DB_DATABASE'] ?? '';
$dbUser = $env['DB_USERNAME'] ?? '';
$dbPass = $env['DB_PASSWORD'] ?? '';

if (empty($dbName) || empty($dbUser)) {
    die('Error: Database configuration not found in .env file');
}

// Connect to database
try {
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die('Database connection failed: ' . $e->getMessage());
}

?>
<!DOCTYPE html>
<html>
<head>
    <title>Reset Password - Simple</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 50px auto; padding: 20px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; margin: 10px 0; border-radius: 5px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; font-size: 14px; }
        button:hover { background: #0056b3; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: bold; }
        input[type="text"], input[type="password"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box; }
        .credentials { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; font-family: monospace; }
        h1 { color: #333; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 Reset Password (Simple Version)</h1>
        
        <div class="warning">
            <strong>⚠️ SECURITY WARNING:</strong> DELETE THIS FILE AFTER USE!
        </div>

        <?php
        $action = $_POST['action'] ?? $_GET['action'] ?? 'list';

        if ($action === 'list') {
            ?>
            <div class="info">
                <p><strong>Database Connected:</strong> <?= htmlspecialchars($dbName) ?></p>
                <p>Select a user below to reset their password.</p>
            </div>

            <?php
            try {
                $stmt = $pdo->query("SELECT id, nama, nomor_telepon, role FROM users ORDER BY id");
                $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (count($users) === 0) {
                    echo '<div class="warning">No users found in database.</div>';
                } else {
                    echo '<table>';
                    echo '<tr><th>ID</th><th>Nama</th><th>Nomor Telepon</th><th>Role</th><th>Action</th></tr>';
                    
                    foreach ($users as $user) {
                        echo '<tr>';
                        echo '<td>' . htmlspecialchars($user['id']) . '</td>';
                        echo '<td>' . htmlspecialchars($user['nama']) . '</td>';
                        echo '<td>' . htmlspecialchars($user['nomor_telepon']) . '</td>';
                        echo '<td>' . htmlspecialchars($user['role']) . '</td>';
                        echo '<td><a href="?action=reset&id=' . $user['id'] . '"><button>Reset Password</button></a></td>';
                        echo '</tr>';
                    }
                    
                    echo '</table>';
                }
            } catch (PDOException $e) {
                echo '<div class="error"><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
            }
            ?>
            
        <?php } elseif ($action === 'reset') {
            $userId = $_GET['id'] ?? null;
            
            if (!$userId) {
                echo '<div class="error">User ID not provided</div>';
                echo '<br><a href="?action=list"><button>Back to List</button></a>';
            } else {
                try {
                    $stmt = $pdo->prepare("SELECT id, nama, nomor_telepon, role FROM users WHERE id = ?");
                    $stmt->execute([$userId]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if (!$user) {
                        echo '<div class="error">User not found</div>';
                    } else {
                        ?>
                        <div class="info">
                            <strong>Reset password for:</strong><br>
                            ID: <?= htmlspecialchars($user['id']) ?><br>
                            Nama: <?= htmlspecialchars($user['nama']) ?><br>
                            Nomor Telepon: <?= htmlspecialchars($user['nomor_telepon']) ?><br>
                            Role: <?= htmlspecialchars($user['role']) ?>
                        </div>

                        <form method="POST" action="">
                            <input type="hidden" name="action" value="confirm">
                            <input type="hidden" name="id" value="<?= htmlspecialchars($userId) ?>">
                            
                            <div style="margin: 20px 0;">
                                <label><strong>New Password:</strong></label><br>
                                <input type="text" name="password" value="password123" required>
                                <small style="color: #666; display: block; margin-top: 5px;">Enter a new password for this user</small>
                            </div>

                            <button type="submit">Reset Password</button>
                            <a href="?action=list"><button type="button">Cancel</button></a>
                        </form>
                        <?php
                    }
                } catch (PDOException $e) {
                    echo '<div class="error"><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
                }
                
                echo '<br><a href="?action=list"><button>Back to List</button></a>';
            }
            
        } elseif ($action === 'confirm') {
            $userId = $_POST['id'] ?? null;
            $password = $_POST['password'] ?? 'password123';
            
            if (!$userId || empty($password)) {
                echo '<div class="error">User ID or password not provided</div>';
            } else {
                try {
                    // Get user first
                    $stmt = $pdo->prepare("SELECT id, nama, nomor_telepon, role FROM users WHERE id = ?");
                    $stmt->execute([$userId]);
                    $user = $stmt->fetch(PDO::FETCH_ASSOC);
                    
                    if (!$user) {
                        echo '<div class="error">User not found</div>';
                    } else {
                        // Hash password using bcrypt (same as Laravel)
                        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
                        
                        // Update password
                        $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                        $stmt->execute([$hashedPassword, $userId]);
                        
                        echo '<div class="success">';
                        echo '<strong>✅ Password reset successfully!</strong>';
                        echo '</div>';

                        echo '<div class="credentials">';
                        echo '<strong>New Login Credentials:</strong><br>';
                        echo 'Nomor Telepon: <strong>' . htmlspecialchars($user['nomor_telepon']) . '</strong><br>';
                        echo 'Password: <strong>' . htmlspecialchars($password) . '</strong><br>';
                        echo 'Role: <strong>' . htmlspecialchars($user['role']) . '</strong>';
                        echo '</div>';

                        echo '<div class="info">';
                        echo '<strong>✅ Next Steps:</strong><br>';
                        echo '1. Test login at: <a href="https://management-kost.vercel.app/login" target="_blank" style="color: #0c5460; font-weight: bold;">https://management-kost.vercel.app/login</a><br>';
                        echo '2. <strong style="color: #dc3545;">DELETE THIS FILE</strong> for security!<br>';
                        echo '3. Change the password after first login from profile page';
                        echo '</div>';
                    }
                } catch (PDOException $e) {
                    echo '<div class="error"><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
                }
            }
            
            echo '<br><a href="?action=list"><button>Back to List</button></a>';
        }
        ?>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
        <div class="warning">
            <strong>🔒 IMPORTANT:</strong> After resetting passwords, DELETE this file immediately!
            <br><br>
            File location: <code>/public/reset-password-simple.php</code>
        </div>
    </div>
</body>
</html>
