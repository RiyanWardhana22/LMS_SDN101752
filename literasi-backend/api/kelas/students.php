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
  $rombel_id = isset($_GET['rombel_id']) ? $_GET['rombel_id'] : null;
  $query = "SELECT id, nama, username, email, foto_profile, xp, pin FROM users WHERE role = 'siswa'";
  $params = [];
  if ($rombel_id) {
    $query .= " AND rombel_id = :rombel_id";
    $params[':rombel_id'] = $rombel_id;
  }

  $query .= " ORDER BY xp DESC, nama ASC";
  $stmt = $db->prepare($query);
  $stmt->execute($params);
  $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo json_encode(["status" => "success", "data" => $students]);
} catch (Throwable $e) {
  echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
