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
      $raw_input = file_get_contents("php://input");
      $data = json_decode($raw_input);
      if (!$data) {
            echo json_encode(["status" => "error", "message" => "Format data yang dikirim tidak valid."]);
            exit();
      }
      $guru_id = isset($data->guru_id) ? $data->guru_id : null;
      $judul = isset($data->judul) ? $data->judul : '';
      $mapel = isset($data->mata_pelajaran) ? $data->mata_pelajaran : 'Umum';
      $kelas = isset($data->kelas) ? $data->kelas : 'Umum';
      $konten = isset($data->konten) ? $data->konten : '';
      $visibilitas = isset($data->visibilitas) ? $data->visibilitas : 'publik';
      $media = isset($data->media) ? $data->media : [];
      if (!empty($judul) && !empty($guru_id)) {
            $db->beginTransaction();
            $query = "INSERT INTO materi (guru_id, mata_pelajaran, kelas, judul, konten, visibilitas) 
                  VALUES (:guru_id, :mapel, :kelas, :judul, :konten, :visibilitas)";
            $stmt = $db->prepare($query);

            $stmt->bindValue(':guru_id', $guru_id);
            $stmt->bindValue(':mapel', $mapel);
            $stmt->bindValue(':kelas', $kelas);
            $stmt->bindValue(':judul', $judul);
            $stmt->bindValue(':konten', $konten);
            $stmt->bindValue(':visibilitas', $visibilitas);

            $stmt->execute();
            $materi_id = $db->lastInsertId();
            if (!empty($media)) {
                  $query_media = "INSERT INTO materi_media (materi_id, tipe_media, url_atau_path) 
                            VALUES (:materi_id, :tipe, :url)";
                  $stmt_media = $db->prepare($query_media);
                  foreach ($media as $m) {
                        $tipe = isset($m->type) ? $m->type : 'unknown';
                        $url = isset($m->url) ? $m->url : '';

                        $stmt_media->bindValue(':materi_id', $materi_id);
                        $stmt_media->bindValue(':tipe', $tipe);
                        $stmt_media->bindValue(':url', $url);
                        $stmt_media->execute();
                  }
            }

            $db->commit();
            echo json_encode(["status" => "success", "message" => "Materi berhasil disimpan di Database!"]);
      } else {
            echo json_encode(["status" => "error", "message" => "Data Judul dan ID Guru tidak boleh kosong."]);
      }
} catch (Throwable $e) {
      if (isset($db) && $db->inTransaction()) {
            $db->rollBack();
      }
      echo json_encode([
            "status" => "error",
            "message" => "Terjadi kesalahan di sistem PHP: " . $e->getMessage()
      ]);
}
