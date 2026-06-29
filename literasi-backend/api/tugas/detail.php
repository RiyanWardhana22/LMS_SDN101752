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
            $id = isset($_GET['id']) ? $_GET['id'] : null;

            if ($id) {
                        $stmt = $db->prepare("SELECT * FROM tugas_kuis WHERE id = :id");
                        $stmt->execute([':id' => $id]);
                        $data = $stmt->fetch(PDO::FETCH_ASSOC);

                        if ($data) echo json_encode(["status" => "success", "data" => $data]);
                        else echo json_encode(["status" => "error", "message" => "Tugas tidak ditemukan."]);
            } else {
                        echo json_encode(["status" => "error", "message" => "ID tidak valid."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
