<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
}
include_once '../../config/database.php';
try {
            $db = $conn;
            $guru_id = isset($_GET['guru_id']) ? $_GET['guru_id'] : null;
            if (!empty($guru_id)) {
                        $query = "SELECT * FROM tugas_kuis WHERE guru_id = :guru_id ORDER BY created_at DESC";
                        $stmt = $db->prepare($query);
                        $stmt->bindValue(':guru_id', $guru_id);
            } else {
                        $query = "SELECT * FROM tugas_kuis ORDER BY created_at DESC";
                        $stmt = $db->prepare($query);
            }
            $stmt->execute();
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $data]);
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
