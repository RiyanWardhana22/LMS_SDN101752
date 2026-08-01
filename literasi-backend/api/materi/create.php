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
        // Insert materi
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

        // Insert media (termasuk is_ar_output, nama_file, dan model_config)
        if (isset($data->media) && is_array($data->media) && count($data->media) > 0) {
            $query_media = "INSERT INTO materi_media 
                            (materi_id, tipe_media, url_atau_path, is_ar_output, nama_file, model_config) 
                            VALUES 
                            (:materi_id, :tipe_media, :url_atau_path, :is_ar_output, :nama_file, :model_config)";
            $stmt_media = $db->prepare($query_media);
            
            foreach ($data->media as $med) {
                if (!empty($med->url)) {
                    $is_ar_output = isset($med->is_ar_output) ? (int)$med->is_ar_output : 0;
                    $nama_file = isset($med->nama_file) ? $med->nama_file : null;
                    
                    // ✅ Handle model_config untuk model 3D
                    $model_config = null;
                    if (
                        ($med->type === 'model_3d' || $med->type === 'model_3d_animated') 
                        && isset($med->model_config)
                    ) {
                        $model_config = is_string($med->model_config) 
                            ? $med->model_config 
                            : json_encode($med->model_config);
                    }
                    
                    $stmt_media->bindValue(':materi_id', $materi_id);
                    $stmt_media->bindValue(':tipe_media', $med->type);
                    $stmt_media->bindValue(':url_atau_path', $med->url);
                    $stmt_media->bindValue(':is_ar_output', $is_ar_output);
                    $stmt_media->bindValue(':nama_file', $nama_file);
                    $stmt_media->bindValue(':model_config', $model_config);
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
?>