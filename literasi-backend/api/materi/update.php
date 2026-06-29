<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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
            $rombel_id = isset($data->rombel_id) ? $data->rombel_id : null;
            $judul = isset($data->judul) ? $data->judul : '';
            $mapel = isset($data->mata_pelajaran) ? $data->mata_pelajaran : '';
            $kelas = isset($data->kelas) ? $data->kelas : '';
            $konten = isset($data->konten) ? $data->konten : '';
            $visibilitas = isset($data->visibilitas) ? $data->visibilitas : 'publik';
            $media = isset($data->media) ? $data->media : [];
            if (!empty($id) && !empty($judul) && !empty($rombel_id)) {
                        $db->beginTransaction();
                        $query = "UPDATE materi 
                  SET judul = :judul, konten = :konten, rombel_id = :rombel_id, mata_pelajaran = :mapel, kelas = :kelas, visibilitas = :visibilitas 
                  WHERE id = :id";
                        $stmt = $db->prepare($query);

                        $stmt->bindValue(':id', $id);
                        $stmt->bindValue(':rombel_id', $rombel_id);
                        $stmt->bindValue(':judul', $judul);
                        $stmt->bindValue(':konten', $konten);
                        $stmt->bindValue(':mapel', $mapel);
                        $stmt->bindValue(':kelas', $kelas);
                        $stmt->bindValue(':visibilitas', $visibilitas);
                        $stmt->execute();
                        $query_del_media = "DELETE FROM materi_media WHERE materi_id = :materi_id";
                        $stmt_del = $db->prepare($query_del_media);
                        $stmt_del->bindValue(':materi_id', $id);
                        $stmt_del->execute();
                        if (!empty($media)) {
                                    $query_ins_media = "INSERT INTO materi_media (materi_id, tipe_media, url_atau_path) VALUES (:materi_id, :tipe_media, :url_atau_path)";
                                    $stmt_ins = $db->prepare($query_ins_media);
                                    foreach ($media as $m) {
                                                $tipe = isset($m->type) ? $m->type : 'unknown';
                                                $url = isset($m->url) ? $m->url : '';
                                                $stmt_ins->bindValue(':materi_id', $id);
                                                $stmt_ins->bindValue(':tipe_media', $tipe);
                                                $stmt_ins->bindValue(':url_atau_path', $url);
                                                $stmt_ins->execute();
                                    }
                        }
                        $db->commit();
                        echo json_encode(["status" => "success", "message" => "Materi berhasil diperbarui!"]);
            } else {
                        echo json_encode(["status" => "error", "message" => "Data tidak lengkap untuk pembaruan."]);
            }
} catch (Throwable $e) {
            if (isset($db) && $db->inTransaction()) {
                        $db->rollBack();
            }
            echo json_encode(["status" => "error", "message" => "Gagal memperbarui: " . $e->getMessage()]);
}
