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
                        $stmt = $db->prepare("SELECT * FROM materi WHERE id = :id");
                        $stmt->execute([':id' => $id]);
                        $orig = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($orig) {
                                    $new_title = $orig['judul'] . " (Salinan)";
                                    $ins = $db->prepare("INSERT INTO materi (guru_id, rombel_id, mata_pelajaran, kelas, judul, konten, visibilitas) VALUES (:g, :r, :m, :k, :j, :c, :v)");
                                    $ins->execute([
                                                ':g' => $orig['guru_id'],
                                                ':r' => $orig['rombel_id'],
                                                ':m' => $orig['mata_pelajaran'],
                                                ':k' => $orig['kelas'],
                                                ':j' => $new_title,
                                                ':c' => $orig['konten'],
                                                ':v' => 'draft'
                                    ]);
                                    $new_id = $db->lastInsertId();
                                    $media = $db->prepare("SELECT * FROM materi_media WHERE materi_id = :id");
                                    $media->execute([':id' => $id]);
                                    $mediaList = $media->fetchAll(PDO::FETCH_ASSOC);
                                    foreach ($mediaList as $med) {
                                                $insMed = $db->prepare("INSERT INTO materi_media (materi_id, tipe_media, url_atau_path) VALUES (?, ?, ?)");
                                                $insMed->execute([$new_id, $med['tipe'], $med['url']]);
                                    }
                                    echo json_encode(["status" => "success", "message" => "Materi berhasil diduplikat ke Draft!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Materi asli tidak ditemukan."]);
                        }
            } else {
                        echo json_encode(["status" => "error", "message" => "ID tidak valid."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => "Error sistem: " . $e->getMessage()]);
}
