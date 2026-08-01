<?php
/**
 * API Endpoint: Peta Belajar Siswa
 * 
 * Method: GET
 * Parameter: siswa_id (int)
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Matikan error reporting untuk production
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

// Include database connection (PDO)
require_once '../../config/database.php';

// Fungsi helper
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode(['status' => 'error', 'message' => $message]);
    exit;
}

function sendSuccess($data) {
    echo json_encode(['status' => 'success', 'data' => $data]);
    exit;
}

// ============================================================
// 1. Validasi parameter
// ============================================================
$siswa_id = isset($_GET['siswa_id']) ? intval($_GET['siswa_id']) : 0;

if ($siswa_id <= 0) {
    sendError('Parameter siswa_id wajib diisi dengan angka valid.', 400);
}

// ============================================================
// 2. Gunakan koneksi PDO dari database.php
// ============================================================
try {
    if (!isset($conn) || !$conn instanceof PDO) {
        sendError('Koneksi database tidak tersedia.', 500);
    }
} catch (Exception $e) {
    sendError('Koneksi database error: ' . $e->getMessage(), 500);
}

// ============================================================
// 3. Ambil data siswa (rombel_id)
// ============================================================
try {
    $stmt = $conn->prepare("SELECT rombel_id FROM users WHERE id = ? AND role = 'siswa'");
    $stmt->execute([$siswa_id]);
    $siswa = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    sendError('Query siswa gagal: ' . $e->getMessage(), 500);
}

if (!$siswa || !$siswa['rombel_id']) {
    sendError('Siswa tidak ditemukan atau belum memiliki kelas (rombel).', 404);
}

$rombel_id = $siswa['rombel_id'];

// ============================================================
// 4. Ambil daftar mata pelajaran unik
// ============================================================
try {
    $query = "
        SELECT DISTINCT mata_pelajaran 
        FROM (
            SELECT mata_pelajaran FROM materi WHERE rombel_id = ? AND visibilitas = 'publik'
            UNION
            SELECT mata_pelajaran FROM tugas_kuis WHERE rombel_id = ?
        ) AS mapel
        ORDER BY mata_pelajaran ASC
    ";
    $stmt = $conn->prepare($query);
    $stmt->execute([$rombel_id, $rombel_id]);
    $mapels = $stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (PDOException $e) {
    sendError('Query mapel gagal: ' . $e->getMessage(), 500);
}

if (empty($mapels)) {
    sendSuccess([]);
}

// ============================================================
// 5. Hitung progress per mapel
// ============================================================
$data = [];

foreach ($mapels as $mapel) {
    try {
        // 5a. Total tugas
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM tugas_kuis WHERE rombel_id = ? AND mata_pelajaran = ?");
        $stmt->execute([$rombel_id, $mapel]);
        $totalTugas = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        // ============================================================
        // 🔥 PERBAIKAN UTAMA: Tugas selesai = ada baris di pengumpulan_tugas
        // TANPA syarat nilai IS NOT NULL
        // ============================================================
        $stmt = $conn->prepare("
            SELECT COUNT(*) as selesai 
            FROM pengumpulan_tugas pt
            JOIN tugas_kuis tk ON pt.tugas_id = tk.id
            WHERE tk.rombel_id = ? 
              AND tk.mata_pelajaran = ? 
              AND pt.siswa_id = ?
        ");
        $stmt->execute([$rombel_id, $mapel, $siswa_id]);
        $tugasSelesai = $stmt->fetch(PDO::FETCH_ASSOC)['selesai'];

        // 5c. Progress
        $progress = 0;
        if ($totalTugas > 0) {
            $progress = round(($tugasSelesai / $totalTugas) * 100);
        }

        // 5d. Status - "selesai" jika semua tugas sudah dikumpulkan
        $status = 'aktif';
        if ($totalTugas > 0 && $tugasSelesai == $totalTugas) {
            $status = 'selesai';
        }

        // 5e. Total materi
        $stmt = $conn->prepare("SELECT COUNT(*) as total FROM materi WHERE rombel_id = ? AND mata_pelajaran = ? AND visibilitas = 'publik'");
        $stmt->execute([$rombel_id, $mapel]);
        $totalMateri = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

        $data[] = [
            'mata_pelajaran'   => $mapel,
            'total_materi'     => (int)$totalMateri,
            'total_tugas'      => (int)$totalTugas,
            'tugas_selesai'    => (int)$tugasSelesai,
            'progress_percent' => (int)$progress,
            'status'           => $status,
        ];
    } catch (PDOException $e) {
        // Jika error untuk satu mapel, skip dan lanjutkan
        error_log("Error processing mapel {$mapel}: " . $e->getMessage());
        continue;
    }
}

sendSuccess($data);
?>