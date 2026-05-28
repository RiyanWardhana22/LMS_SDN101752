<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
      exit(0);
}

ini_set('display_errors', 0);
error_reporting(E_ALL);
include_once '../../config/database.php';
try {
      $db = $conn;
      $raw_input = file_get_contents("php://input");
      $data = json_decode($raw_input);

      if (!$data) {
            echo json_encode(["status" => "error", "message" => "Format data tidak valid. Pastikan mengirim JSON."]);
            exit();
      }
      $guru_id = isset($data->guru_id) ? $data->guru_id : null;
      $rombel_id = isset($data->rombel_id) ? $data->rombel_id : null;
      $mata_pelajaran = isset($data->mata_pelajaran) ? $data->mata_pelajaran : '';
      $kelas = isset($data->kelas) ? $data->kelas : '';
      $judul = isset($data->judul) ? $data->judul : '';
      $konten = isset($data->konten) ? $data->konten : '';
      $visibilitas = isset($data->visibilitas) ? $data->visibilitas : 'draft';
      if (!empty($judul) && !empty($mata_pelajaran) && !empty($guru_id) && !empty($rombel_id)) {
            $query = "INSERT INTO materi (guru_id, rombel_id, mata_pelajaran, kelas, judul, konten, visibilitas) 
                  VALUES (:guru_id, :rombel_id, :mata_pelajaran, :kelas, :judul, :konten, :visibilitas)";
            $stmt = $db->prepare($query);
            $stmt->bindValue(':guru_id', $guru_id);
            $stmt->bindValue(':rombel_id', $rombel_id);
            $stmt->bindValue(':mata_pelajaran', $mata_pelajaran);
            $stmt->bindValue(':kelas', $kelas);
            $stmt->bindValue(':judul', $judul);
            $stmt->bindValue(':konten', $konten);
            $stmt->bindValue(':visibilitas', $visibilitas);

            $stmt->execute();
            $materi_id = $db->lastInsertId();
            if (isset($data->media) && is_array($data->media) && count($data->media) > 0) {
                  $query_media = "INSERT INTO materi_media (materi_id, type, url) VALUES (:materi_id, :type, :url)";
                  $stmt_media = $db->prepare($query_media);
                  foreach ($data->media as $med) {
                        if (!empty($med->url)) {
                              $stmt_media->bindValue(':materi_id', $materi_id);
                              $stmt_media->bindValue(':type', $med->type);
                              $stmt_media->bindValue(':url', $med->url);
                              $stmt_media->execute();
                        }
                  }
            }

            echo json_encode(["status" => "success", "message" => "Materi berhasil diterbitkan!"]);
      } else {
            echo json_encode(["status" => "error", "message" => "Rombel, Judul, Mata Pelajaran, dan ID Guru wajib diisi."]);
      }
} catch (Throwable $e) {
      echo json_encode(["status" => "error", "message" => "Terjadi kesalahan sistem: " . $e->getMessage()]);
}
