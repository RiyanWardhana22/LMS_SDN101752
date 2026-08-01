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

    // Proses setiap media: konversi is_ar_output ke integer dan decode model_config
    foreach ($media as &$item) {
        // Konversi is_ar_output ke integer (0/1) agar jelas di frontend
        $item['is_ar_output'] = (int)$item['is_ar_output'];
        
        // Decode model_config jika ada dan berupa string JSON
        if (isset($item['model_config']) && is_string($item['model_config'])) {
            $decoded = json_decode($item['model_config'], true);
            // Jika decode berhasil, gunakan array; jika gagal, set null
            $item['model_config'] = ($decoded !== null) ? $decoded : null;
        } else {
            $item['model_config'] = null;
        }
    }
    unset($item); // Hapus referensi untuk menghindari efek samping

    // Sertakan media ke dalam data materi
    $materi['media'] = $media;

    // Kirim respons sukses dengan data
    echo json_encode(["status" => "success", "data" => $materi]);

} catch (Throwable $e) {
    // Tangani error dan kirim pesan
    echo json_encode(["status" => "error", "message" => "Gagal memuat data: " . $e->getMessage()]);
}
?>
