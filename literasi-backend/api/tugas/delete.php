<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
}
include_once '../../config/database.php';
try {
            $db = $conn;
            $data = json_decode(file_get_contents("php://input"));
            $id = isset($data->id) ? $data->id : null;
            if (!empty($id)) {
                        $query = "DELETE FROM tugas_kuis WHERE id = :id";
                        $stmt = $db->prepare($query);
                        $stmt->bindValue(':id', $id);
                        $stmt->execute();
                        echo json_encode(["status" => "success", "message" => "Evaluasi berhasil dihapus!"]);
            } else {
                        echo json_encode(["status" => "error", "message" => "ID tidak valid."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
