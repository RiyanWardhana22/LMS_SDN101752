<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
}

ini_set('display_errors', 0);
error_reporting(E_ALL);
include_once '../../config/database.php';
try {
            $db = $conn;
            $guru_id = isset($_GET['guru_id']) ? $_GET['guru_id'] : null;
            if (!empty($guru_id)) {
                        $query = "SELECT * FROM materi WHERE guru_id = :guru_id ORDER BY created_at DESC";
                        $stmt = $db->prepare($query);
                        $stmt->bindValue(':guru_id', $guru_id);
            } else {
                        $query = "SELECT * FROM materi ORDER BY created_at DESC";
                        $stmt = $db->prepare($query);
            }

            $stmt->execute();
            $materi = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["status" => "success", "data" => $materi]);
} catch (Throwable $e) {
            echo json_encode([
                        "status" => "error",
                        "message" => "Terjadi kesalahan di sistem PHP: " . $e->getMessage()
            ]);
}
