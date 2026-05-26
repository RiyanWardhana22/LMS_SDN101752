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
            $tugas_id = isset($_GET['tugas_id']) ? $_GET['tugas_id'] : null;
            if ($tugas_id) {
                        $query = "SELECT p.*, u.nama as nama_siswa 
                  FROM pengumpulan_tugas p 
                  JOIN users u ON p.siswa_id = u.id 
                  WHERE p.tugas_id = :tugas_id 
                  ORDER BY p.dikumpulkan_pada DESC";
                        $stmt = $db->prepare($query);
                        $stmt->execute([':tugas_id' => $tugas_id]);
                        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $q_tugas = $db->prepare("SELECT judul, tipe FROM tugas_kuis WHERE id = :id");
                        $q_tugas->execute([':id' => $tugas_id]);
                        $info_tugas = $q_tugas->fetch(PDO::FETCH_ASSOC);

                        echo json_encode(["status" => "success", "info_tugas" => $info_tugas, "data" => $data]);
            } else {
                        echo json_encode(["status" => "error", "message" => "ID Tugas tidak valid."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
