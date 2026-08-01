<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

ini_set('display_errors', 0);
error_reporting(E_ALL);

include_once '../../config/database.php';

// 🔥 Konstanta XP per jenis tugas (bisa disesuaikan)
const XP_TUGAS_ESAI = 100;
const XP_KUIS = 50;

function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}

function sendSuccess($message, $xpBaru = null, $xpDitambahkan = null) {
    $response = ['status' => 'success', 'message' => $message];
    if ($xpBaru !== null) {
        $response['xp_baru'] = $xpBaru;
    }
    if ($xpDitambahkan !== null) {
        $response['xp_ditambahkan'] = $xpDitambahkan;
    }
    echo json_encode($response);
    exit;
}

try {
    $db = $conn;
    $data = json_decode(file_get_contents("php://input"));
    
    $tugas_id = isset($data->tugas_id) ? intval($data->tugas_id) : null;
    $siswa_id = isset($data->siswa_id) ? intval($data->siswa_id) : null;
    $jawaban = isset($data->jawaban) ? $data->jawaban : '';
    $nilai = isset($data->nilai) ? (is_null($data->nilai) ? null : intval($data->nilai)) : null;

    // Validasi
    if (!$tugas_id || !$siswa_id) {
        sendError('Data pengumpulan tidak lengkap (tugas_id dan siswa_id wajib).');
    }

    if ($jawaban === '') {
        sendError('Jawaban tidak boleh kosong.');
    }

    // 1. Cek apakah tugas ada dan ambil tenggat & tipe
    $cekTugas = $db->prepare("SELECT tenggat, tipe FROM tugas_kuis WHERE id = :tugas_id");
    $cekTugas->execute([':tugas_id' => $tugas_id]);
    $tugas = $cekTugas->fetch(PDO::FETCH_ASSOC);

    if (!$tugas) {
        sendError('Tugas tidak ditemukan.', 404);
    }

    // 2. Cek tenggat
    $tenggat = new DateTime($tugas['tenggat']);
    $sekarang = new DateTime();
    
    if ($sekarang > $tenggat) {
        sendError('Tenggat pengumpulan sudah berakhir. Tugas ini tidak bisa dikerjakan lagi.', 403);
    }

    // 3. Cek apakah sudah pernah submit
    $cekSubmit = $db->prepare("SELECT id FROM pengumpulan_tugas WHERE tugas_id = :tugas_id AND siswa_id = :siswa_id");
    $cekSubmit->execute([
        ':tugas_id' => $tugas_id,
        ':siswa_id' => $siswa_id
    ]);
    $sudahSubmit = $cekSubmit->rowCount() > 0;

    // 🔥 Mulai transaction untuk atomic operation
    $db->beginTransaction();

    try {
        $xpTambahan = 0;
        $isNewSubmission = false;

        if ($sudahSubmit) {
            // ============================================================
            // UPDATE: Siswa mengedit jawaban yang sudah pernah dikumpulkan
            // ============================================================
            $query = "UPDATE pengumpulan_tugas 
                      SET jawaban = :jawaban, nilai = NULL, dikumpulkan_pada = CURRENT_TIMESTAMP 
                      WHERE tugas_id = :tugas_id AND siswa_id = :siswa_id";
            $stmt = $db->prepare($query);
            $stmt->execute([
                ':jawaban' => $jawaban,
                ':tugas_id' => $tugas_id,
                ':siswa_id' => $siswa_id
            ]);
            $message = "Jawaban berhasil diperbarui!";
            // 🔥 XP TIDAK ditambahkan untuk edit - hanya update jawaban
            $xpTambahan = 0;
        } else {
            // ============================================================
            // INSERT: Siswa pertama kali mengumpulkan tugas ini
            // 🔥 XP HANYA diberikan di sini!
            // ============================================================
            $query = "INSERT INTO pengumpulan_tugas (tugas_id, siswa_id, jawaban, nilai) 
                      VALUES (:tugas_id, :siswa_id, :jawaban, :nilai)";
            $stmt = $db->prepare($query);
            $stmt->execute([
                ':tugas_id' => $tugas_id,
                ':siswa_id' => $siswa_id,
                ':jawaban' => $jawaban,
                ':nilai' => $nilai
            ]);
            
            // 🔥 Tentukan XP berdasarkan tipe tugas
            if ($tugas['tipe'] === 'kuis') {
                $xpTambahan = XP_KUIS;
            } else {
                $xpTambahan = XP_TUGAS_ESAI;
            }
            
            // 🔥 Tambah XP ke users - query terpisah dalam transaction
            $updateXp = $db->prepare("UPDATE users SET xp = xp + :xp WHERE id = :siswa_id");
            $updateXp->execute([
                ':xp' => $xpTambahan,
                ':siswa_id' => $siswa_id
            ]);
            
            $isNewSubmission = true;
            $message = "Tugas berhasil dikumpulkan!";
        }

        // 🔥 Ambil XP terbaru siswa (setelah update)
        $getXp = $db->prepare("SELECT xp FROM users WHERE id = :siswa_id");
        $getXp->execute([':siswa_id' => $siswa_id]);
        $xpBaru = $getXp->fetch(PDO::FETCH_ASSOC)['xp'];

        // 🔥 Commit transaction - semua operasi berhasil
        $db->commit();

        // 🔥 Kirim response dengan XP terbaru
        sendSuccess($message, intval($xpBaru), $isNewSubmission ? $xpTambahan : 0);

    } catch (PDOException $e) {
        // 🔥 Rollback jika terjadi error - tidak ada perubahan yang disimpan
        $db->rollBack();
        throw $e;
    }

} catch (PDOException $e) {
    sendError('Database error: ' . $e->getMessage(), 500);
} catch (Throwable $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}
?>
