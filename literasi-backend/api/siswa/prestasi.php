<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Matikan error display agar tidak merusak JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once '../../config/database.php';

// Ambil siswa_id dari query parameter
$siswa_id = isset($_GET['siswa_id']) ? intval($_GET['siswa_id']) : 0;

if ($siswa_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "Parameter siswa_id tidak valid."
    ]);
    exit;
}

try {
    global $conn;
    
    // Koneksi database
    if (!isset($conn) || !$conn instanceof PDO) {
        throw new Exception("Koneksi database tidak tersedia.");
    }

    // ============================================================
    // 1. Ambil XP dari tabel users (sumber kebenaran)
    // ============================================================
    $stmt = $conn->prepare("SELECT xp FROM users WHERE id = ? AND role = 'siswa'");
    $stmt->execute([$siswa_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode([
            "status" => "error",
            "message" => "Siswa tidak ditemukan."
        ]);
        exit;
    }

    // ============================================================
    // 2. Hitung statistik dari pengumpulan_tugas
    // ============================================================
    
    // 2a. Total tugas yang sudah dikumpulkan (termasuk yang belum dinilai)
    $stmt = $conn->prepare("
        SELECT COUNT(*) as total_submitted
        FROM pengumpulan_tugas 
        WHERE siswa_id = ?
    ");
    $stmt->execute([$siswa_id]);
    $submitted = $stmt->fetch(PDO::FETCH_ASSOC);

    // 2b. Statistik nilai (hanya yang sudah dinilai)
    $stmt = $conn->prepare("
        SELECT 
            MAX(nilai) as nilai_terbaik,
            AVG(nilai) as rata_rata_nilai,
            COUNT(CASE WHEN nilai IS NOT NULL THEN 1 END) as total_dinilai
        FROM pengumpulan_tugas 
        WHERE siswa_id = ? AND nilai IS NOT NULL
    ");
    $stmt->execute([$siswa_id]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // ============================================================
    // 3. Siapkan response
    // ============================================================
    $response = [
        "status" => "success",
        "data" => [
            "xp" => intval($user['xp']),
            "total_tugas" => intval($submitted['total_submitted'] ?? 0),
            "nilai_terbaik" => $stats['nilai_terbaik'] !== null ? intval($stats['nilai_terbaik']) : null,
            "rata_rata_nilai" => $stats['rata_rata_nilai'] !== null ? round(floatval($stats['rata_rata_nilai']), 1) : null,
            "total_dinilai" => intval($stats['total_dinilai'] ?? 0),
        ]
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    // Log error untuk debugging
    error_log("Prestasi API Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Gagal memuat data prestasi. Silakan coba lagi nanti."
    ]);
} catch (Throwable $e) {
    // Log error untuk debugging
    error_log("Prestasi API Throwable: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Terjadi kesalahan pada server."
    ]);
}
?>