<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
}
include_once '../../config/database.php';
try {
            $db = $conn;
            $data = json_decode(file_get_contents("php://input"));
            $id = isset($data->id) ? $data->id : null;

            if ($id) {
                        $stmt = $db->prepare("DELETE FROM users WHERE id = :id AND role = 'siswa'");
                        $stmt->execute([':id' => $id]);
                        echo json_encode(["status" => "success", "message" => "Siswa berhasil dikeluarkan dari kelas."]);
            } else {
                        echo json_encode(["status" => "error", "message" => "ID tidak valid."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
