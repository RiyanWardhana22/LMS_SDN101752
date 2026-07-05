<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

ini_set('display_errors', 0);
error_reporting(E_ALL);
include_once '../../config/database.php';

try {
    $db = $conn;

    // Ambil parameter dari GET
    $rombel_id = isset($_GET['rombel_id']) ? intval($_GET['rombel_id']) : null;
    $mapel     = isset($_GET['mapel']) ? trim($_GET['mapel']) : null;

    // Bangun query dasar
    $query = "SELECT id, judul, tipe, tenggat, created_at, mata_pelajaran 
              FROM tugas_kuis 
              WHERE 1=1";
    $params = [];

    // Filter berdasarkan rombel_id jika diberikan
    if ($rombel_id) {
        $query .= " AND rombel_id = ?";
        $params[] = $rombel_id;
    }

    // Filter berdasarkan mata_pelajaran jika diberikan
    if ($mapel) {
        $query .= " AND mata_pelajaran = ?";
        $params[] = $mapel;
    }

    $query .= " ORDER BY tenggat ASC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $tugas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Tambahkan status expired
    $current_time = new DateTime();
    foreach ($tugas as &$t) {
        $tenggat_waktu = new DateTime($t['tenggat']);
        $t['is_expired'] = $current_time > $tenggat_waktu;
    }

    echo json_encode(["status" => "success", "data" => $tugas]);

} catch (Throwable $e) {
    echo json_encode(["status" => "error", "message" => "Terjadi kesalahan server: " . $e->getMessage()]);
}
?>