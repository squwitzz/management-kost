<?php
require __DIR__."/../vendor/autoload.php";
$app = require_once __DIR__."/../bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create("/api/billing/settings", "GET");
$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "<br>";
echo "Content: " . $response->getContent() . "<br>";
try {
    $settings = \App\Models\BillingSetting::getSettings();
    echo "Settings DB OK.<br>";
} catch (\Exception $e) {
    echo "Error Settings: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "<br>";
}
try {
    $users = \App\Models\User::whereNotNull("room_id")->where("role", "Penghuni")->with("room")->get();
    echo "Users query OK.<br>";
} catch (\Exception $e) {
    echo "Error Users: " . $e->getMessage() . "<br>";
}

