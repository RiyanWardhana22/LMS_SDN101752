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
    $response = [];

    // 1. Statistik Keaktifan Belajar Siswa (Seminggu Terakhir)
    // Menghitung siswa unik yang mengumpulkan tugas dalam 7 hari terakhir
    $stmt1 = $conn->query("
        SELECT COUNT(DISTINCT siswa_id) as total_aktif 
        FROM pengumpulan_tugas 
        WHERE dikumpulkan_pada >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    ");
    $response['siswa_aktif_mingguan'] = $stmt1->fetch(PDO::FETCH_ASSOC)['total_aktif'];

    // 2. Perbandingan Nilai Rata-rata Antar Kelas
    $stmt2 = $conn->query("
        SELECT r.nama_kelas, ROUND(AVG(p.nilai), 2) as rata_rata 
        FROM pengumpulan_tugas p 
        JOIN users u ON p.siswa_id = u.id 
        JOIN rombel r ON u.rombel_id = r.id 
        WHERE p.nilai IS NOT NULL 
        GROUP BY r.id
    ");
    $response['rata_rata_kelas'] = $stmt2->fetchAll(PDO::FETCH_ASSOC);

    // 3. Guru Paling Aktif Membuat Konten
    $stmt3 = $conn->query("
        SELECT u.nama, COUNT(m.id) as total_materi 
        FROM materi m 
        JOIN users u ON m.guru_id = u.id 
        GROUP BY u.id 
        ORDER BY total_materi DESC LIMIT 5
    ");
    $response['guru_aktif'] = $stmt3->fetchAll(PDO::FETCH_ASSOC);

    // 4. Kuis/Tugas Paling Banyak Dikerjakan Siswa
    $stmt4 = $conn->query("
        SELECT tk.judul, COUNT(p.id) as total_pengerjaan 
        FROM pengumpulan_tugas p 
        JOIN tugas_kuis tk ON p.tugas_id = tk.id 
        GROUP BY tk.id 
        ORDER BY total_pengerjaan DESC LIMIT 5
    ");
    $response['tugas_populer'] = $stmt4->fetchAll(PDO::FETCH_ASSOC);

    // 5. Grafik Tren Penggunaan (Aktivitas Pengumpulan per Bulan)
    $stmt5 = $conn->query("
        SELECT DATE_FORMAT(dikumpulkan_pada, '%Y-%m') as bulan, COUNT(id) as total_aktivitas 
        FROM pengumpulan_tugas 
        GROUP BY bulan 
        ORDER BY bulan ASC LIMIT 6
    ");
    $response['tren_bulanan'] = $stmt5->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $response]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}