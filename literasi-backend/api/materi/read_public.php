<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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

            $rombelId = isset($_GET['rombel_id']) && $_GET['rombel_id'] !== ''
                ? (int) $_GET['rombel_id']
                : null;

            $query = "SELECT id, mata_pelajaran, kelas, judul, created_at FROM materi WHERE visibilitas = 'publik'";

            if ($rombelId) {
                        // rombel_id IS NULL = materi umum, tetap tampil untuk semua kelas
                        $query .= " AND (rombel_id = :rombel_id OR rombel_id IS NULL)";
            }

            $query .= " ORDER BY created_at DESC";

            $stmt = $db->prepare($query);

            if ($rombelId) {
                        $stmt->bindParam(':rombel_id', $rombelId, PDO::PARAM_INT);
            }

            $stmt->execute();
            $materi = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["status" => "success", "data" => $materi]);
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => "Terjadi kesalahan server: " . $e->getMessage()]);
}