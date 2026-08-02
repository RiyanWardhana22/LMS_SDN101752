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
    // Ambil data ID dan Nama Kelas dari tabel rombel
    $stmt = $conn->query("SELECT id, nama_kelas FROM rombel ORDER BY nama_kelas ASC");
    $rombels = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["status" => "success", "data" => $rombels]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}