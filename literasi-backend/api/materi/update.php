<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 0);
error_reporting(E_ALL);
include_once '../../config/database.php';

try {
    $db = $conn;
    $data = json_decode(file_get_contents("php://input"));
    
    if (!$data) {
        echo json_encode(["status" => "error", "message" => "Format data tidak valid. Pastikan mengirim JSON."]);
        exit();
    }

    // Ambil data dari request
    $id = isset($data->id) ? (int)$data->id : null;
    $rombel_id = isset($data->rombel_id) ? (int)$data->rombel_id : null;
    $judul = isset($data->judul) ? trim($data->judul) : '';
    $mapel = isset($data->mata_pelajaran) ? trim($data->mata_pelajaran) : '';
    $kelas = isset($data->kelas) ? trim($data->kelas) : '';
    $konten = isset($data->konten) ? $data->konten : '';
    $visibilitas = isset($data->visibilitas) ? $data->visibilitas : 'publik';
    $media = isset($data->media) && is_array($data->media) ? $data->media : [];

    // Validasi field wajib
    if (empty($id) || empty($judul) || empty($rombel_id) || empty($mapel)) {
        echo json_encode(["status" => "error", "message" => "ID, Judul, Rombel, dan Mata Pelajaran wajib diisi."]);
        exit();
    }

    // Cek apakah materi dengan id tersebut ada
    $check = $db->prepare("SELECT id FROM materi WHERE id = :id");
    $check->bindValue(':id', $id, PDO::PARAM_INT);
    $check->execute();
    if ($check->rowCount() === 0) {
        echo json_encode(["status" => "error", "message" => "Materi tidak ditemukan."]);
        exit();
    }

    // Mulai transaksi
    $db->beginTransaction();

    // Update data materi
    $query = "UPDATE materi 
              SET judul = :judul, 
                  konten = :konten, 
                  rombel_id = :rombel_id, 
                  mata_pelajaran = :mapel, 
                  kelas = :kelas, 
                  visibilitas = :visibilitas 
              WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindValue(':id', $id, PDO::PARAM_INT);
    $stmt->bindValue(':rombel_id', $rombel_id, PDO::PARAM_INT);
    $stmt->bindValue(':judul', $judul);
    $stmt->bindValue(':konten', $konten);
    $stmt->bindValue(':mapel', $mapel);
    $stmt->bindValue(':kelas', $kelas);
    $stmt->bindValue(':visibilitas', $visibilitas);
    $stmt->execute();

    // Hapus semua media lama untuk materi ini
    $query_del = "DELETE FROM materi_media WHERE materi_id = :materi_id";
    $stmt_del = $db->prepare($query_del);
    $stmt_del->bindValue(':materi_id', $id, PDO::PARAM_INT);
    $stmt_del->execute();

    // Insert media baru jika ada
    if (!empty($media)) {
        $query_ins = "INSERT INTO materi_media 
                      (materi_id, tipe_media, url_atau_path, is_ar_output, nama_file, model_config) 
                      VALUES 
                      (:materi_id, :tipe_media, :url_atau_path, :is_ar_output, :nama_file, :model_config)";
        $stmt_ins = $db->prepare($query_ins);

        foreach ($media as $m) {
            // Skip jika URL kosong
            if (empty($m->url)) continue;

            $tipe = isset($m->type) ? $m->type : '';
            $url = $m->url;
            $is_ar_output = isset($m->is_ar_output) ? (int)$m->is_ar_output : 0;
            $nama_file = isset($m->nama_file) ? $m->nama_file : null;

            // Proses model_config untuk model 3D
            $model_config = null;
            if (($tipe === 'model_3d' || $tipe === 'model_3d_animated') && isset($m->model_config)) {
                if (is_object($m->model_config) || is_array($m->model_config)) {
                    $model_config = json_encode($m->model_config);
                } elseif (is_string($m->model_config)) {
                    // Jika sudah string JSON, gunakan langsung
                    $model_config = $m->model_config;
                }
            }

            $stmt_ins->bindValue(':materi_id', $id, PDO::PARAM_INT);
            $stmt_ins->bindValue(':tipe_media', $tipe);
            $stmt_ins->bindValue(':url_atau_path', $url);
            $stmt_ins->bindValue(':is_ar_output', $is_ar_output, PDO::PARAM_INT);
            $stmt_ins->bindValue(':nama_file', $nama_file);
            $stmt_ins->bindValue(':model_config', $model_config);
            $stmt_ins->execute();
        }
    }

    // Commit transaksi
    $db->commit();

    echo json_encode(["status" => "success", "message" => "Materi berhasil diperbarui!"]);

} catch (Throwable $e) {
    // Rollback jika terjadi error
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    echo json_encode(["status" => "error", "message" => "Gagal memperbarui: " . $e->getMessage()]);
}
?>