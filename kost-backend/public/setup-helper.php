<?php
/**
 * Laravel Setup Helper for cPanel
 * 
 * IMPORTANT: DELETE THIS FILE AFTER SETUP IS COMPLETE!
 * 
 * This file helps you setup Laravel on cPanel when you don't have SSH access.
 * Access this file via: http://yourdomain.com/setup-helper.php
 */

// Security: Only allow access from specific IPs (optional)
// $allowed_ips = ['your.ip.address.here'];
// if (!in_array($_SERVER['REMOTE_ADDR'], $allowed_ips)) {
//     die('Access denied');
// }

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

?>
<!DOCTYPE html>
<html>
<head>
    <title>Laravel Setup Helper</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .info { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; margin: 10px 0; border-radius: 5px; }
        button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🚀 Laravel Setup Helper</h1>
    
    <div class="warning">
        <strong>⚠️ SECURITY WARNING:</strong> DELETE THIS FILE AFTER SETUP IS COMPLETE!
    </div>

    <?php
    $action = $_GET['action'] ?? 'menu';

    if ($action === 'menu') {
        ?>
        <div class="info">
            <h3>Setup Steps:</h3>
            <ol>
                <li>Make sure .env file is configured</li>
                <li>Run migrations</li>
                <li>Cache configuration</li>
                <li>Test the application</li>
                <li><strong>DELETE THIS FILE!</strong></li>
            </ol>
        </div>

        <h2>Available Actions:</h2>
        
        <div style="margin: 20px 0;">
            <h3>1. Check Environment</h3>
            <a href="?action=check"><button>Check Environment</button></a>
        </div>

        <div style="margin: 20px 0;">
            <h3>2. Run Migrations</h3>
            <a href="?action=migrate"><button>Run Migrations</button></a>
        </div>

        <div style="margin: 20px 0;">
            <h3>3. Seed Database (Optional)</h3>
            <a href="?action=seed"><button>Seed Database</button></a>
        </div>

        <div style="margin: 20px 0;">
            <h3>4. Cache Configuration</h3>
            <a href="?action=cache"><button>Cache Config</button></a>
        </div>

        <div style="margin: 20px 0;">
            <h3>5. Clear Cache</h3>
            <a href="?action=clear"><button>Clear All Cache</button></a>
        </div>

        <div style="margin: 20px 0;">
            <h3>6. Test Database Connection</h3>
            <a href="?action=test-db"><button>Test Database</button></a>
        </div>
        <?php
    } elseif ($action === 'check') {
        echo '<h2>Environment Check</h2>';
        
        // Check PHP version
        $phpVersion = phpversion();
        echo $phpVersion >= '8.1' 
            ? "<div class='success'>✓ PHP Version: $phpVersion (OK)</div>"
            : "<div class='error'>✗ PHP Version: $phpVersion (Need 8.1+)</div>";
        
        // Check .env file
        $envExists = file_exists(__DIR__.'/../.env');
        echo $envExists
            ? "<div class='success'>✓ .env file exists</div>"
            : "<div class='error'>✗ .env file not found</div>";
        
        // Check vendor folder
        $vendorExists = is_dir(__DIR__.'/../vendor');
        echo $vendorExists
            ? "<div class='success'>✓ Vendor folder exists</div>"
            : "<div class='error'>✗ Vendor folder not found (run composer install)</div>";
        
        // Check storage permissions
        $storageWritable = is_writable(__DIR__.'/../storage');
        echo $storageWritable
            ? "<div class='success'>✓ Storage folder is writable</div>"
            : "<div class='error'>✗ Storage folder is not writable (chmod 755)</div>";
        
        // Check bootstrap/cache permissions
        $cacheWritable = is_writable(__DIR__.'/../bootstrap/cache');
        echo $cacheWritable
            ? "<div class='success'>✓ Bootstrap/cache folder is writable</div>"
            : "<div class='error'>✗ Bootstrap/cache folder is not writable (chmod 755)</div>";
        
        echo '<br><a href="?action=menu"><button>Back to Menu</button></a>';
        
    } elseif ($action === 'migrate') {
        echo '<h2>Running Migrations...</h2>';
        try {
            ob_start();
            $status = $kernel->call('migrate', ['--force' => true]);
            $output = ob_get_clean();
            
            echo "<div class='success'>✓ Migrations completed successfully!</div>";
            echo "<pre>$output</pre>";
        } catch (Exception $e) {
            echo "<div class='error'>✗ Migration failed: " . $e->getMessage() . "</div>";
        }
        echo '<br><a href="?action=menu"><button>Back to Menu</button></a>';
        
    } elseif ($action === 'seed') {
        echo '<h2>Seeding Database...</h2>';
        try {
            ob_start();
            $status = $kernel->call('db:seed', ['--force' => true]);
            $output = ob_get_clean();
            
            echo "<div class='success'>✓ Database seeded successfully!</div>";
            echo "<pre>$output</pre>";
        } catch (Exception $e) {
            echo "<div class='error'>✗ Seeding failed: " . $e->getMessage() . "</div>";
        }
        echo '<br><a href="?action=menu"><button>Back to Menu</button></a>';
        
    } elseif ($action === 'cache') {
        echo '<h2>Caching Configuration...</h2>';
        try {
            $kernel->call('config:cache');
            echo "<div class='success'>✓ Config cached</div>";
            
            $kernel->call('route:cache');
            echo "<div class='success'>✓ Routes cached</div>";
            
            $kernel->call('view:cache');
            echo "<div class='success'>✓ Views cached</div>";
            
        } catch (Exception $e) {
            echo "<div class='error'>✗ Caching failed: " . $e->getMessage() . "</div>";
        }
        echo '<br><a href="?action=menu"><button>Back to Menu</button></a>';
        
    } elseif ($action === 'clear') {
        echo '<h2>Clearing Cache...</h2>';
        try {
            $kernel->call('config:clear');
            echo "<div class='success'>✓ Config cache cleared</div>";
            
            $kernel->call('route:clear');
            echo "<div class='success'>✓ Route cache cleared</div>";
            
            $kernel->call('view:clear');
            echo "<div class='success'>✓ View cache cleared</div>";
            
            $kernel->call('cache:clear');
            echo "<div class='success'>✓ Application cache cleared</div>";
            
        } catch (Exception $e) {
            echo "<div class='error'>✗ Clear cache failed: " . $e->getMessage() . "</div>";
        }
        echo '<br><a href="?action=menu"><button>Back to Menu</button></a>';
        
    } elseif ($action === 'test-db') {
        echo '<h2>Testing Database Connection...</h2>';
        try {
            $pdo = DB::connection()->getPdo();
            echo "<div class='success'>✓ Database connection successful!</div>";
            
            $dbName = DB::connection()->getDatabaseName();
            echo "<div class='info'>Connected to database: <strong>$dbName</strong></div>";
            
            // Try to get tables
            $tables = DB::select('SHOW TABLES');
            echo "<div class='info'>Tables in database: " . count($tables) . "</div>";
            
            if (count($tables) > 0) {
                echo "<pre>";
                foreach ($tables as $table) {
                    $tableName = array_values((array)$table)[0];
                    echo "- $tableName\n";
                }
                echo "</pre>";
            }
            
        } catch (Exception $e) {
            echo "<div class='error'>✗ Database connection failed: " . $e->getMessage() . "</div>";
            echo "<div class='info'>Check your .env file database configuration</div>";
        }
        echo '<br><a href="?action=menu"><button>Back to Menu</button></a>';
    }
    ?>

    <hr style="margin: 40px 0;">
    <div class="warning">
        <strong>🔒 IMPORTANT:</strong> After completing the setup, DELETE this file for security!
        <br><br>
        File location: <code>/public/setup-helper.php</code>
    </div>

</body>
</html>
