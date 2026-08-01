<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once '../../config/database.php';

try {
    $db = $conn;
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        echo json_encode(["status" => "error", "message" => "ID materi tidak valid."]);
        exit();
    }

    // Ambil data materi
    $query = "SELECT * FROM materi WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindValue(':id', $id);
    $stmt->execute();
    $materi = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$materi) {
        echo json_encode(["status" => "error", "message" => "Materi tidak ditemukan."]);
        exit();
    }

    // Ambil media (termasuk is_ar_output dan model_config)
    $query_media = "SELECT 
                        tipe_media as type, 
                        url_atau_path as url, 
                        is_ar_output, 
                        nama_file,
                        model_config
                    FROM materi_media 
                    WHERE materi_id = :materi_id";
    $stmt_media = $db->prepare($query_media);
    $stmt_media->bindValue(':materi_id', $id);
    $stmt_media->execute();
    $media = $stmt_media->fetchAll(PDO::FETCH_ASSOC);

    // Decode model_config dari JSON string ke array
    foreach ($media as &$item) {
        if (isset($item['model_config']) && is_string($item['model_config'])) {
            $item['model_config'] = json_decode($item['model_config'], true);
        }
        // Konversi is_ar_output ke integer
        $item['is_ar_output'] = (int)$item['is_ar_output'];
    }
    unset($item); // Hapus referensi

    $materi['media'] = $media;

    echo json_encode(["status" => "success", "data" => $materi]);
} catch (Throwable $e) {
    echo json_encode(["status" => "error", "message" => "Gagal memuat data: " . $e->getMessage()]);
}
?>