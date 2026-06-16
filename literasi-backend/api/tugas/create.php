<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
      exit(0);
}
include_once '../../config/database.php';

try {
      $db = $conn;
      $data = json_decode(file_get_contents("php://input"));
      $guru_id = isset($data->guru_id) ? $data->guru_id : null;
      $rombel_id = isset($data->rombel_id) ? $data->rombel_id : null;
      $mata_pelajaran = isset($data->mata_pelajaran) ? $data->mata_pelajaran : 'Umum';
      $judul = isset($data->judul) ? $data->judul : '';
      $deskripsi = isset($data->deskripsi) ? $data->deskripsi : '';
      $tipe = isset($data->tipe) ? $data->tipe : 'tugas';
      $tenggat = isset($data->tenggat) ? $data->tenggat : '';

      if (!empty($judul) && !empty($guru_id) && !empty($tenggat) && !empty($rombel_id)) {
            $query = "INSERT INTO tugas_kuis (guru_id, rombel_id, mata_pelajaran, judul, deskripsi, tipe, tenggat) 
                  VALUES (:guru_id, :rombel_id, :mata_pelajaran, :judul, :deskripsi, :tipe, :tenggat)";
            $stmt = $db->prepare($query);
            $stmt->execute([
                  ':guru_id' => $guru_id,
                  ':rombel_id' => $rombel_id,
                  ':mata_pelajaran' => $mata_pelajaran,
                  ':judul' => $judul,
                  ':deskripsi' => $deskripsi,
                  ':tipe' => $tipe,
                  ':tenggat' => $tenggat
            ]);
            echo json_encode(["status" => "success", "message" => ucfirst($tipe) . " berhasil diterbitkan!"]);
      } else {
            echo json_encode(["status" => "error", "message" => "Data tidak lengkap."]);
      }
} catch (Throwable $e) {
      echo json_encode(["status" => "error", "message" => "Error sistem: " . $e->getMessage()]);
}
