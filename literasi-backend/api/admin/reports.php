<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once __DIR__ . '/../../config/database.php';

try {
    // 1. Ringkasan Kartu (Total Pengguna)
    $stmt_summary = $conn->query("SELECT role, COUNT(id) as total FROM users GROUP BY role");
    $summary_data = $stmt_summary->fetchAll(PDO::FETCH_ASSOC);
    
    $summary = ["siswa" => 0, "guru" => 0, "admin" => 0];
    foreach ($summary_data as $row) {
        $summary[$row['role']] = (int)$row['total'];
    }

    // 2. Distribusi Siswa per Kelas (Untuk Grafik Bar Pertama)
    $stmt_rombel = $conn->query("
        SELECT r.id, r.nama_kelas, COUNT(u.id) as total_siswa 
        FROM rombel r 
        LEFT JOIN users u ON r.id = u.rombel_id AND u.role = 'siswa'
        GROUP BY r.id, r.nama_kelas
    ");
    $kelas_data = $stmt_rombel->fetchAll(PDO::FETCH_ASSOC);

    // 3. Rata-rata Nilai per Kelas (Untuk Grafik Bar Kedua)
    // Menyesuaikan dengan asumsi tabel buku_nilai / pengumpulan tugas
    $stmt_nilai = $conn->query("
        SELECT r.nama_kelas, COALESCE(AVG(bn.nilai), 0) as rata_rata 
        FROM rombel r
        LEFT JOIN users u ON r.id = u.rombel_id
        LEFT JOIN buku_nilai bn ON u.id = bn.siswa_id
        GROUP BY r.id, r.nama_kelas
    ");
    $nilai_data = $stmt_nilai->fetchAll(PDO::FETCH_ASSOC);
    
    // Format nilai rata-rata agar berbentuk angka desimal rapi (float)
    foreach ($nilai_data as &$nd) {
        $nd['rata_rata'] = round((float)$nd['rata_rata'], 1);
    }
    unset($nd);

    // 4. Tren Aktivitas Bulanan (Untuk Grafik Garis)
    $aktivitas_bulanan = [
        ["bulan" => "Jan", "kunjungan" => 120],
        ["bulan" => "Feb", "kunjungan" => 250],
        ["bulan" => "Mar", "kunjungan" => 310],
        ["bulan" => "Apr", "kunjungan" => 280],
        ["bulan" => "Mei", "kunjungan" => 400],
    ];

    echo json_encode([
        "status" => "success", 
        "data" => [
            "summary" => $summary,
            "distribusi_kelas" => $kelas_data,
            "rata_rata_nilai" => $nilai_data,
            "aktivitas" => $aktivitas_bulanan
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}