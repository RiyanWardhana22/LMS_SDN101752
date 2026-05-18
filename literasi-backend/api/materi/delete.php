<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
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
            $data = json_decode(file_get_contents("php://input"));
            $id = isset($data->id) ? $data->id : null;
            if (!empty($id)) {
                        $query = "DELETE FROM materi WHERE id = :id";
                        $stmt = $db->prepare($query);
                        $stmt->bindValue(':id', $id);
                        if ($stmt->execute()) {
                                    echo json_encode(["status" => "success", "message" => "Materi berhasil dihapus!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Gagal menghapus materi dari database."]);
                        }
            } else {
                        echo json_encode(["status" => "error", "message" => "ID materi tidak valid."]);
            }
} catch (Throwable $e) {
            echo json_encode([
                        "status" => "error",
                        "message" => "Terjadi kesalahan di sistem PHP: " . $e->getMessage()
            ]);
}
