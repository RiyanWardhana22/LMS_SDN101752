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
            $tugas_id = isset($data->tugas_id) ? $data->tugas_id : null;
            $siswa_id = isset($data->siswa_id) ? $data->siswa_id : null;
            $jawaban = isset($data->jawaban) ? $data->jawaban : '';
            $nilai = isset($data->nilai) ? $data->nilai : null;
            if ($tugas_id && $siswa_id && $jawaban !== '') {
                        $cek = $db->prepare("SELECT id FROM pengumpulan_tugas WHERE tugas_id = :tugas_id AND siswa_id = :siswa_id");
                        $cek->execute([':tugas_id' => $tugas_id, ':siswa_id' => $siswa_id]);
                        if ($cek->rowCount() > 0) {
                                    echo json_encode(["status" => "error", "message" => "Kamu sudah pernah mengumpulkan tugas ini!"]);
                                    exit();
                        }
                        $query = "INSERT INTO pengumpulan_tugas (tugas_id, siswa_id, jawaban, nilai) VALUES (:tugas_id, :siswa_id, :jawaban, :nilai)";
                        $stmt = $db->prepare($query);
                        $stmt->execute([
                                    ':tugas_id' => $tugas_id,
                                    ':siswa_id' => $siswa_id,
                                    ':jawaban' => $jawaban,
                                    ':nilai' => $nilai
                        ]);

                        echo json_encode(["status" => "success", "message" => "Tugas berhasil dikumpulkan!"]);
            } else {
                        echo json_encode(["status" => "error", "message" => "Data pengumpulan tidak lengkap."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
