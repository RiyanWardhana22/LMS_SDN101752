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
            $nama = isset($data->nama) ? trim($data->nama) : '';
            $pin = isset($data->pin) ? trim($data->pin) : '';
            $rombel_id = isset($data->rombel_id) ? $data->rombel_id : null;
            if ($nama && $pin && $rombel_id) {
                        $username = strtolower(str_replace(' ', '', explode(' ', $nama)[0])) . rand(100, 999);
                        $query = "INSERT INTO users (nama, username, role, pin, rombel_id, xp) VALUES (:nama, :username, 'siswa', :pin, :rombel_id, 0)";
                        $stmt = $db->prepare($query);
                        $stmt->execute([':nama' => $nama, ':username' => $username, ':pin' => $pin, ':rombel_id' => $rombel_id]);
                        echo json_encode(["status" => "success", "message" => "Siswa berhasil ditambahkan!"]);
            } else {
                        echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
