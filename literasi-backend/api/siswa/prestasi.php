<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");

require_once '../../config/database.php';

// Ambil siswa_id dari query parameter
$siswa_id = isset($_GET['siswa_id']) ? intval($_GET['siswa_id']) : 0;

if ($siswa_id <= 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Parameter siswa_id tidak valid."
    ]);
    exit;
}

try {
    // $conn sudah tersedia dari database.php
    global $conn;

    // Query 1: Ambil XP dari tabel users
    $stmt = $conn->prepare("SELECT xp FROM users WHERE id = ? AND role = 'siswa'");
    $stmt->execute([$siswa_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode([
            "status" => "error",
            "message" => "Siswa tidak ditemukan."
        ]);
        exit;
    }

    // Query 2: Hitung total tugas dikumpulkan & nilai terbaik dari pengumpulan_tugas
    $stmt = $conn->prepare("
        SELECT 
            COUNT(*) as total_tugas,
            MAX(nilai) as nilai_terbaik
        FROM pengumpulan_tugas 
        WHERE siswa_id = ?
    ");
    $stmt->execute([$siswa_id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "data" => [
            "xp" => intval($user['xp']),
            "total_tugas" => intval($stats['total_tugas']),
            "nilai_terbaik" => $stats['nilai_terbaik'] !== null ? intval($stats['nilai_terbaik']) : null
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Gagal memuat data prestasi."
    ]);
}