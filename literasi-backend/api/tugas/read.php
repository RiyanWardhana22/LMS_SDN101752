<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
}
include_once '../../config/database.php';
try {
            $db = $conn;
            $guru_id = isset($_GET['guru_id']) ? $_GET['guru_id'] : null;
            if ($guru_id) {
                        $query = "SELECT t.*, r.nama_kelas, r.kode_unik 
                  FROM tugas_kuis t 
                  LEFT JOIN rombel r ON t.rombel_id = r.id 
                  WHERE t.guru_id = :guru_id 
                  ORDER BY t.created_at DESC";
                        $stmt = $db->prepare($query);
                        $stmt->execute([':guru_id' => $guru_id]);
                        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

                        echo json_encode(["status" => "success", "data" => $data]);
            } else {
                        echo json_encode(["status" => "error", "message" => "ID Guru diperlukan."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
