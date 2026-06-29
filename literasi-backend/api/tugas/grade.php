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
            $pengumpulan_id = isset($data->pengumpulan_id) ? $data->pengumpulan_id : null;
            $nilai = isset($data->nilai) ? $data->nilai : null;
            if ($pengumpulan_id && $nilai !== null) {
                        $query = "UPDATE pengumpulan_tugas SET nilai = :nilai WHERE id = :id";
                        $stmt = $db->prepare($query);
                        $stmt->execute([':nilai' => $nilai, ':id' => $pengumpulan_id]);

                        echo json_encode(["status" => "success", "message" => "Nilai berhasil disimpan!"]);
            } else {
                        echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
