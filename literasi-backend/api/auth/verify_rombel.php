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
            $kode_unik = isset($data->kode_unik) ? trim($data->kode_unik) : '';
            if (!empty($kode_unik)) {
                        $stmt_kelas = $db->prepare("SELECT id, nama_kelas FROM rombel WHERE kode_unik = :kode LIMIT 1");
                        $stmt_kelas->execute([':kode' => $kode_unik]);
                        $kelas = $stmt_kelas->fetch(PDO::FETCH_ASSOC);
                        if ($kelas) {
                                    $stmt_siswa = $db->prepare("SELECT id, nama, username, foto_profile FROM users WHERE role = 'siswa' AND rombel_id = :rombel_id ORDER BY nama ASC");
                                    $stmt_siswa->execute([':rombel_id' => $kelas['id']]);
                                    $siswa = $stmt_siswa->fetchAll(PDO::FETCH_ASSOC);
                                    echo json_encode([
                                                "status" => "success",
                                                "kelas" => $kelas,
                                                "siswa" => $siswa
                                    ]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Kode Kelas tidak ditemukan. Coba periksa lagi ya!"]);
                        }
            } else {
                        echo json_encode(["status" => "error", "message" => "Kode Kelas tidak boleh kosong."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => "Terjadi kesalahan server: " . $e->getMessage()]);
}
