<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Bypass cPanel symlink restrictions by serving storage files via dynamic routing
Route::get('/storage/{path}', function ($path) {
    if (preg_match('/\.\./', $path)) {
        abort(403);
    }
    
    $file = storage_path('app/public/' . $path);
    
    if (!file_exists($file)) {
        return "Not found physical file at: " . $file;
    }
    
    $mimeType = \Illuminate\Support\Facades\File::mimeType($file);
    return response()->file($file, ['Content-Type' => $mimeType]);
})->where('path', '.*');

Route::get('/debug-storage', function() {
    $dir = storage_path('app/public/maintenance_photos');
    if (!is_dir($dir)) return "No dir: " . $dir;
    return response()->json(array_diff(scandir($dir), ['..', '.']));
});

Route::get('/image', function() {
    $path = request()->query('file');
    if (!$path || preg_match('/\.\./', $path)) abort(403);
    $file = storage_path('app/public/' . $path);
    if (!file_exists($file)) abort(404);
    $mimeType = \Illuminate\Support\Facades\File::mimeType($file);
    return response()->file($file, ['Content-Type' => $mimeType]);
});
