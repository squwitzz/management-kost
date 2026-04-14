<?php
/**
 * Manual Password Reset - Input Database Credentials
 * 
 * IMPORTANT: DELETE THIS FILE AFTER USE!
 */

session_start();

// Check if database credentials are set
$dbConfigured = isset($_SESSION['db_host']) && isset($_SESSION['db_name']);

?>
<!DOCTYPE html>
<html>
<head>
    <title>Reset Password - Manual</title>
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
        .form-group { margin: 15px 0; }
        label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }
        .credentials { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; font-family: monospace; }
        h1 { color: #333; margin-bottom: 10px; }
        small { color: #666; display: block; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 Reset Password (Manual)</h1>
        
        <div class="warning">
            <strong>⚠️ SECURITY WARNING:</strong> DELETE THIS FILE AFTER USE!
        </div>

        <?php
        $action = $_POST['action'] ?? $_GET['action'] ?? ($dbConfigured ? 'list' : 'config');

        if ($action === 'config') {
            ?>
            <div class="info">
                <p><strong>Step 1: Database Configuration</strong></p>
                <p>Enter your database credentials. You can find these in your cPanel or .env file.</p>
            </div>

            <form method="POST" action="">
                <input type="hidden" name="action" value="connect">
                
                <div class="form-group">
                    <label>Database Host:</label>
                    <input type="text" name="db_host" value="localhost" required>
                    <small>Usually "localhost" for cPanel</small>
                </div>

                <div class="form-group">
                    <label>Database Name:</label>
                    <input type="text" name="db_name" placeholder="intg7785_kost" required>
                    <small>Your database name (e.g., username_kost)</small>
                </div>

                <div class="form-group">
                    <label>Database Username:</label>
                    <input type="text" name="db_user" placeholder="intg7785_kost" required>
                    <small>Your database username</small>
                </div>

                <div class="form-group">
                    <label>Database Password:</label>
                    <input type="password" name="db_pass" required>
                    <small>Your database password</small>
                </div>

                <button type="submit">Connect to Database</button>
            </form>
            <?php
            
        } elseif ($action === 'connect') {
            $dbHost = $_POST['db_host'] ?? 'localhost';
            $dbName = $_POST['db_name'] ?? '';
            $dbUser = $_POST['db_user'] ?? '';
            $dbPass = $_POST['db_pass'] ?? '';
            
            try {
                $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4", $dbUser, $dbPass);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                // Save to session
                $_SESSION['db_host'] = $dbHost;
                $_SESSION['db_name'] = $dbName;
                $_SESSION['db_user'] = $dbUser;
                $_SESSION['db_pass'] = $dbPass;
                
                echo '<div class="success">✅ Database connected successfully!</div>';
                echo '<meta http-equiv="refresh" content="1;url=?action=list">';
                
            } catch (PDOException $e) {
                echo '<div class="error"><strong>Connection failed:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
                echo '<br><a href="?action=config"><button>Try Again</button></a>';
            }
            
        } elseif ($action === 'list') {
            if (!$dbConfigured) {
                header('Location: ?action=config');
                exit;
            }
            
            try {
                $pdo = new PDO(
                    "mysql:host={$_SESSION['db_host']};dbname={$_SESSION['db_name']};charset=utf8mb4",
                    $_SESSION['db_user'],
                    $_SESSION['db_pass']
                );
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                ?>
                <div class="info">
                    <p><strong>Database:</strong> <?= htmlspecialchars($_SESSION['db_name']) ?></p>
                    <p>Select a user below to reset their password.</p>
                </div>

                <?php
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
                
                echo '<br><a href="?action=disconnect"><button style="background: #6c757d;">Disconnect Database</button></a>';
                
            } catch (PDOException $e) {
                echo '<div class="error"><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
                echo '<br><a href="?action=config"><button>Reconfigure Database</button></a>';
            }
            
        } elseif ($action === 'reset') {
            if (!$dbConfigured) {
                header('Location: ?action=config');
                exit;
            }
            
            $userId = $_GET['id'] ?? null;
            
            if (!$userId) {
                echo '<div class="error">User ID not provided</div>';
                echo '<br><a href="?action=list"><button>Back to List</button></a>';
            } else {
                try {
                    $pdo = new PDO(
                        "mysql:host={$_SESSION['db_host']};dbname={$_SESSION['db_name']};charset=utf8mb4",
                        $_SESSION['db_user'],
                        $_SESSION['db_pass']
                    );
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    
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
                            
                            <div class="form-group">
                                <label>New Password:</label>
                                <input type="text" name="password" value="password123" required>
                                <small>Enter a new password for this user</small>
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
            if (!$dbConfigured) {
                header('Location: ?action=config');
                exit;
            }
            
            $userId = $_POST['id'] ?? null;
            $password = $_POST['password'] ?? '';
            
            if (!$userId || empty($password)) {
                echo '<div class="error">User ID or password not provided</div>';
            } else {
                try {
                    $pdo = new PDO(
                        "mysql:host={$_SESSION['db_host']};dbname={$_SESSION['db_name']};charset=utf8mb4",
                        $_SESSION['db_user'],
                        $_SESSION['db_pass']
                    );
                    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                    
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
                        echo '1. <a href="https://management-kost.vercel.app/login" target="_blank" style="color: #0c5460; font-weight: bold;">Test login at Vercel</a><br>';
                        echo '2. <strong style="color: #dc3545;">DELETE THIS FILE</strong> for security!<br>';
                        echo '3. Change the password after first login';
                        echo '</div>';
                    }
                } catch (PDOException $e) {
                    echo '<div class="error"><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</div>';
                }
            }
            
            echo '<br><a href="?action=list"><button>Back to List</button></a>';
            
        } elseif ($action === 'disconnect') {
            session_destroy();
            header('Location: ?action=config');
            exit;
        }
        ?>

        <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
        <div class="warning">
            <strong>🔒 IMPORTANT:</strong> After resetting passwords, DELETE this file immediately!
            <br><br>
            File location: <code>/public/reset-password-manual.php</code>
        </div>
    </div>
</body>
</html>
