<?php
// Script Pembuat Folder Storage cPanel
echo "<h2 style=\"font-family:sans-serif\">Proses Pemasangan Storage Foto</h2>";
try {
    $target = __DIR__ . "/../storage/app/public";
    $link = __DIR__ . "/storage";
    
    if (file_exists($link)) {
        echo "<h3 style=\"color:orange\">Folder/Link storage sudah pernah dibuat! Anda aman.</h3>";
    } else {
        symlink($target, $link);
        echo "<h3 style=\"color:green\">BERHASIL! Jalur foto sudah tersambung di cPanel.</h3>";
    }
} catch (\Exception $e) {
    echo "<h3 style=\"color:red\">GAGAL: " . $e->getMessage() . "</h3>";
    echo "<p>Lakukan cara manual: Buka File Manager cPanel, masuk folder <b>storage/app</b>, klik kanan pada folder <b>public</b> lalu pilih Copy menjadi sebuah folder baru bernama <b>storage</b> di dalam folder <b>public_html/public</b> Anda.</p>";
}
echo "<p><i>Coba buka kembali sistem foto request maintenance Anda.</i></p>";
?>
