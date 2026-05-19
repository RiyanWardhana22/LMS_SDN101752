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
                        echo json_encode(["status" => "error", "message" => "Format data tidak valid."]);
                        exit();
            }
            $guru_id = isset($data->guru_id) ? $data->guru_id : null;
            $judul = isset($data->judul) ? $data->judul : '';
            $deskripsi = isset($data->deskripsi) ? $data->deskripsi : '';
            $tipe = isset($data->tipe) ? $data->tipe : 'tugas';
            $tenggat = isset($data->tenggat) ? $data->tenggat : '';
            if (!empty($judul) && !empty($guru_id) && !empty($tenggat)) {
                        $query = "INSERT INTO tugas_kuis (guru_id, judul, deskripsi, tipe, tenggat) 
                  VALUES (:guru_id, :judul, :deskripsi, :tipe, :tenggat)";
                        $stmt = $db->prepare($query);

                        $stmt->bindValue(':guru_id', $guru_id);
                        $stmt->bindValue(':judul', $judul);
                        $stmt->bindValue(':deskripsi', $deskripsi);
                        $stmt->bindValue(':tipe', $tipe);
                        $stmt->bindValue(':tenggat', $tenggat);

                        $stmt->execute();

                        echo json_encode(["status" => "success", "message" => ucfirst($tipe) . " berhasil diterbitkan!"]);
            } else {
                        echo json_encode(["status" => "error", "message" => "Judul, ID Guru, dan Tenggat Waktu wajib diisi."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => "Terjadi kesalahan sistem: " . $e->getMessage()]);
}
