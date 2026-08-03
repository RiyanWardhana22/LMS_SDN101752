<?php
// Izinkan akses dari React
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

include_once __DIR__ . '/../../config/database.php';

$type = isset($_GET['type']) ? $_GET['type'] : '';

// 1. LAPORAN PENGGUNAAN BULANAN (Aktivitas LMS)
if ($type === 'bulanan') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="Laporan_Penggunaan_LMS_Bulanan.csv"');
    $output = fopen('php://output', 'w');
    
    // Header Kolom Excel
    fputcsv($output, array('Bulan', 'Total Login', 'Tugas Dikerjakan', 'Materi Diakses'));
    
    // Data Dummy Bulanan (Bisa diganti query tabel log/aktivitas nanti)
    $data = [
        ['Januari 2026', 120, 85, 110],
        ['Februari 2026', 250, 190, 230],
        ['Maret 2026', 310, 275, 305],
        ['April 2026', 280, 240, 270],
        ['Mei 2026', 400, 350, 390],
    ];
    
    foreach ($data as $row) fputcsv($output, $row);
    fclose($output);
    exit;
}

// 2. LAPORAN CAPAIAN PEMBELAJARAN PER KELAS
elseif ($type === 'capaian') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="Laporan_Capaian_Pembelajaran.csv"');
    $output = fopen('php://output', 'w');
    
    fputcsv($output, array('ID Siswa', 'Nama Siswa', 'Kelas', 'Total Tugas', 'Nilai Rata-rata', 'Status Kelulusan'));
    
    // Query mengambil nilai rata-rata siswa (Sesuaikan dengan tabel aslinya)
    $query = "
        SELECT u.id, u.nama, r.nama_kelas, 
               COUNT(bn.id) as total_tugas, 
               COALESCE(AVG(bn.nilai), 0) as rata_rata
        FROM users u
        LEFT JOIN rombel r ON u.rombel_id = r.id
        LEFT JOIN buku_nilai bn ON u.id = bn.siswa_id
        WHERE u.role = 'siswa'
        GROUP BY u.id
        ORDER BY r.nama_kelas ASC, u.nama ASC
    ";
    
    $stmt = $conn->query($query);
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $rata_rata = round((float)$row['rata_rata'], 2);
        $status = $rata_rata >= 70 ? 'Tuntas' : 'Perlu Bimbingan';
        fputcsv($output, array($row['id'], $row['nama'], $row['nama_kelas'], $row['total_tugas'], $rata_rata, $status));
    }
    fclose($output);
    exit;
}

// 3. LAPORAN KEAKTIFAN GURU
elseif ($type === 'guru') {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="Laporan_Keaktifan_Guru.csv"');
    $output = fopen('php://output', 'w');
    
    fputcsv($output, array('Nama Guru', 'Materi Dibuat', 'Kuis Dibuat', 'Siswa Dibimbing', 'Login Terakhir'));
    
    // Query Guru (menggunakan tabel users)
    $query = "SELECT nama, created_at FROM users WHERE role = 'guru' ORDER BY nama ASC";
    $stmt = $conn->query($query);
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Simulasi jumlah data, karena belum ada tabel relasi materi_guru
        $materi = rand(5, 20); 
        $kuis = rand(2, 10);
        $siswa = rand(20, 40);
        fputcsv($output, array($row['nama'], $materi, $kuis, $siswa, $row['created_at']));
    }
    fclose($output);
    exit;
}

else {
    echo "Parameter tipe laporan tidak valid.";
}
?>