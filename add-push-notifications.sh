#!/bin/bash

# Script to add push notification triggers to all controllers
# Run this from the kost-backend directory

echo "🔔 Adding Push Notification Integration..."
echo ""

# Check if we're in the right directory
if [ ! -d "app/Http/Controllers/Api" ]; then
    echo "❌ Error: Please run this script from the kost-backend directory"
    exit 1
fi

# Backup files first
echo "📦 Creating backups..."
mkdir -p backups
cp app/Http/Controllers/Api/MaintenanceRequestController.php backups/ 2>/dev/null
cp app/Http/Controllers/Api/PaymentController.php backups/ 2>/dev/null
cp app/Http/Controllers/Api/BillingController.php backups/ 2>/dev/null
cp app/Http/Controllers/Api/FoodOrderController.php backups/ 2>/dev/null
echo "✅ Backups created in backups/ directory"
echo ""

# Function to add use statement if not exists
add_use_statement() {
    local file=$1
    if ! grep -q "use App\\\\Http\\\\Controllers\\\\Api\\\\PushNotificationController;" "$file"; then
        # Find the last 'use' statement and add after it
        sed -i '/^use /a use App\\Http\\Controllers\\Api\\PushNotificationController;' "$file"
        echo "  ✅ Added use statement to $file"
    else
        echo "  ℹ️  Use statement already exists in $file"
    fi
}

# 1. MaintenanceRequestController.php
echo "1️⃣  Updating MaintenanceRequestController.php..."
FILE="app/Http/Controllers/Api/MaintenanceRequestController.php"
if [ -f "$FILE" ]; then
    add_use_statement "$FILE"
    
    # Add push notification after admin notification creation (line ~160)
    sed -i '/Notification::create(\[/{
        N
        N
        N
        N
        N
        N
        /'\''tipe'\'' => '\''laporan'\'',/{
            N
            /'\''is_read'\'' => false,/{
                N
                /]);/{
                    a\            \n            // Send push notification\n            PushNotificationController::sendPushNotification(\n                $admin->id,\n                '\''Laporan Baru'\'',\n                "Laporan baru dari {$user->nama}: {$request->judul}",\n                '\''/admin/requests'\''\n            );
                }
            }
        }
    }' "$FILE"
    
    echo "  ✅ MaintenanceRequestController.php updated"
else
    echo "  ⚠️  File not found: $FILE"
fi
echo ""

# 2. PaymentController.php
echo "2️⃣  Updating PaymentController.php..."
FILE="app/Http/Controllers/Api/PaymentController.php"
if [ -f "$FILE" ]; then
    add_use_statement "$FILE"
    echo "  ✅ PaymentController.php updated"
    echo "  ℹ️  Please manually add push notifications after each Notification::create()"
else
    echo "  ⚠️  File not found: $FILE"
fi
echo ""

# 3. BillingController.php
echo "3️⃣  Updating BillingController.php..."
FILE="app/Http/Controllers/Api/BillingController.php"
if [ -f "$FILE" ]; then
    add_use_statement "$FILE"
    echo "  ✅ BillingController.php updated"
    echo "  ℹ️  Please manually add push notifications after each Notification::create()"
else
    echo "  ⚠️  File not found: $FILE"
fi
echo ""

# 4. FoodOrderController.php (if exists)
echo "4️⃣  Updating FoodOrderController.php..."
FILE="app/Http/Controllers/Api/FoodOrderController.php"
if [ -f "$FILE" ]; then
    add_use_statement "$FILE"
    echo "  ✅ FoodOrderController.php updated"
    echo "  ℹ️  Please manually add push notifications after each Notification::create()"
else
    echo "  ℹ️  FoodOrderController.php not found (skipping)"
fi
echo ""

echo "✅ Script completed!"
echo ""
echo "📝 Next steps:"
echo "1. Review the changes in each controller"
echo "2. Manually add PushNotificationController::sendPushNotification() calls"
echo "3. Use PUSH_NOTIFICATION_INTEGRATION.md as reference"
echo "4. Test each notification type"
echo ""
echo "💾 Backups are saved in backups/ directory"
