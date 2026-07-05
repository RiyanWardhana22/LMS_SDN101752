<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

ini_set('display_errors', 0);
error_reporting(E_ALL);

include_once '../../config/database.php';

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}

try {
    $db = $conn;
    $id = isset($_GET['id']) ? intval($_GET['id']) : null;
    $siswa_id = isset($_GET['siswa_id']) ? intval($_GET['siswa_id']) : null;

    if (!$id) {
        sendError('ID tugas tidak valid.', 400);
    }

    // Ambil data tugas
    $stmt = $db->prepare("SELECT * FROM tugas_kuis WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendError('Tugas tidak ditemukan.', 404);
    }

    // Cek tenggat
    $tenggat = new DateTime($data['tenggat']);
    $sekarang = new DateTime();
    $data['is_expired'] = $sekarang > $tenggat;

    // Jika siswa_id diberikan, cek status submit
    if ($siswa_id) {
        // Cek apakah sudah submit
        $cekSubmit = $db->prepare("SELECT id, jawaban, nilai, dikumpulkan_pada 
                                   FROM pengumpulan_tugas 
                                   WHERE tugas_id = :tugas_id AND siswa_id = :siswa_id");
        $cekSubmit->execute([
            ':tugas_id' => $id,
            ':siswa_id' => $siswa_id
        ]);
        $submitData = $cekSubmit->fetch(PDO::FETCH_ASSOC);

        if ($submitData) {
            $data['sudah_dikumpulkan'] = true;
            $data['jawaban_sebelumnya'] = $submitData['jawaban'];
            $data['nilai_sebelumnya'] = $submitData['nilai'];
            $data['dikumpulkan_pada'] = $submitData['dikumpulkan_pada'];
        } else {
            $data['sudah_dikumpulkan'] = false;
            $data['jawaban_sebelumnya'] = null;
            $data['nilai_sebelumnya'] = null;
            $data['dikumpulkan_pada'] = null;
        }
    } else {
        $data['sudah_dikumpulkan'] = false;
        $data['jawaban_sebelumnya'] = null;
        $data['nilai_sebelumnya'] = null;
        $data['dikumpulkan_pada'] = null;
    }

    echo json_encode(["status" => "success", "data" => $data]);

} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}
?>