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

    // Query JOIN users dengan rombel
    $stmt = $conn->prepare("
        SELECT 
            u.nama,
            u.kode_unik,
            u.xp,
            r.nama_kelas
        FROM users u
        LEFT JOIN rombel r ON u.rombel_id = r.id
        WHERE u.id = ? AND u.role = 'siswa'
    ");
    $stmt->execute([$siswa_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profile) {
        echo json_encode([
            "status" => "error",
            "message" => "Siswa tidak ditemukan."
        ]);
        exit;
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "nama" => $profile['nama'],
            "kode_unik" => $profile['kode_unik'],
            "xp" => intval($profile['xp']),
            "kelas" => $profile['nama_kelas'] ?? null
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Gagal memuat data profil."
    ]);
}