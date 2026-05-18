<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->judul) && !empty($data->guru_id)) {
            try {
                        $db->beginTransaction();
                        $query = "INSERT INTO materi (guru_id, mata_pelajaran, kelas, judul, konten, visibilitas) 
                  VALUES (:guru_id, :mapel, :kelas, :judul, :konten, :visibilitas)";
                        $stmt = $db->prepare($query);

                        $stmt->bindParam(':guru_id', $data->guru_id);
                        $stmt->bindParam(':mapel', $data->mata_pelajaran);
                        $stmt->bindParam(':kelas', $data->kelas);
                        $stmt->bindParam(':judul', $data->judul);
                        $stmt->bindParam(':konten', $data->konten);
                        $stmt->bindParam(':visibilitas', $data->visibilitas);

                        $stmt->execute();

                        $materi_id = $db->lastInsertId();
                        if (!empty($data->media)) {
                                    $query_media = "INSERT INTO materi_media (materi_id, tipe_media, url_atau_path) 
                            VALUES (:materi_id, :tipe, :url)";
                                    $stmt_media = $db->prepare($query_media);

                                    foreach ($data->media as $media) {
                                                $stmt_media->bindParam(':materi_id', $materi_id);
                                                $stmt_media->bindParam(':tipe', $media->type); // video_link, video_cloud, atau ar_mind
                                                $stmt_media->bindParam(':url', $media->url);
                                                $stmt_media->execute();
                                    }
                        }
                        $db->commit();
                        echo json_encode(["status" => "success", "message" => "Materi berhasil disimpan!"]);
            } catch (Exception $e) {
                        $db->rollBack();
                        echo json_encode(["status" => "error", "message" => "Gagal menyimpan: " . $e->getMessage()]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "Data judul dan ID guru tidak boleh kosong."]);
}
