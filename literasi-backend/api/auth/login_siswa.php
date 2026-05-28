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
      $siswa_id = isset($data->id) ? $data->id : null;
      $rombel_id = isset($data->rombel_id) ? $data->rombel_id : null;
      $pin = isset($data->pin) ? trim($data->pin) : null;
      if ($siswa_id && $rombel_id && $pin) {
            $stmt = $db->prepare("SELECT u.id, u.nama, u.username, u.role, u.foto_profile, u.xp, r.nama_kelas, r.kode_unik 
                              FROM users u 
                              JOIN rombel r ON u.rombel_id = r.id 
                              WHERE u.id = :id AND u.rombel_id = :rombel_id AND u.pin = :pin AND u.role = 'siswa' LIMIT 1");
            $stmt->execute([':id' => $siswa_id, ':rombel_id' => $rombel_id, ':pin' => $pin]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                  echo json_encode([
                        "status" => "success",
                        "message" => "Selamat datang, " . $user['nama'] . "!",
                        "user" => $user
                  ]);
            } else {
                  echo json_encode(["status" => "error", "message" => "PIN salah. Coba ingat-ingat lagi ya!"]);
            }
      } else {
            echo json_encode(["status" => "error", "message" => "PIN wajib diisi."]);
      }
} catch (Throwable $e) {
      echo json_encode(["status" => "error", "message" => "Terjadi kesalahan server: " . $e->getMessage()]);
}
