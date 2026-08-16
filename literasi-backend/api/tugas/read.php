<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
      exit(0);
}

include_once '../../config/database.php';

try {
      $db = $conn;
      $query = "SELECT t.*, r.nama_kelas, r.kode_unik, u.nama as nama_guru_pembuat
              FROM tugas_kuis t
              LEFT JOIN rombel r ON t.rombel_id = r.id
              LEFT JOIN users u ON t.guru_id = u.id
              ORDER BY t.created_at DESC";

      $stmt = $db->prepare($query);
      $stmt->execute();
      $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

      echo json_encode(["status" => "success", "data" => $data]);
} catch (Throwable $e) {
      echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
