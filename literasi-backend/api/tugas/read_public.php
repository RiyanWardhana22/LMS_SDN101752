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
            $query = "SELECT id, judul, tipe, tenggat, created_at FROM tugas_kuis ORDER BY tenggat ASC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $tugas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $current_time = new DateTime();
            foreach ($tugas as &$t) {
                        $tenggat_waktu = new DateTime($t['tenggat']);
                        $t['is_expired'] = $current_time > $tenggat_waktu;
            }
            echo json_encode(["status" => "success", "data" => $tugas]);
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => "Terjadi kesalahan server: " . $e->getMessage()]);
}
