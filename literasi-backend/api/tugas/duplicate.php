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
                        $stmt = $db->prepare("SELECT * FROM tugas_kuis WHERE id = :id");
                        $stmt->execute([':id' => $id]);
                        $orig = $stmt->fetch(PDO::FETCH_ASSOC);

                        if ($orig) {
                                    $new_title = $orig['judul'] . " (Salinan)";
                                    $ins = $db->prepare("INSERT INTO tugas_kuis (guru_id, rombel_id, mata_pelajaran, judul, deskripsi, tipe, tenggat) VALUES (:g, :r, :m, :j, :d, :t, :tg)");
                                    $ins->execute([
                                                ':g' => $orig['guru_id'],
                                                ':r' => $orig['rombel_id'],
                                                ':m' => $orig['mata_pelajaran'],
                                                ':j' => $new_title,
                                                ':d' => $orig['deskripsi'],
                                                ':t' => $orig['tipe'],
                                                ':tg' => $orig['tenggat']
                                    ]);
                                    echo json_encode(["status" => "success", "message" => "Evaluasi berhasil diduplikat!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Evaluasi tidak ditemukan."]);
                        }
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => "Error sistem: " . $e->getMessage()]);
}
