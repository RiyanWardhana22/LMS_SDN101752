<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
include_once __DIR__ . '/../../config/database.php';
$method = $_SERVER['REQUEST_METHOD'];
try {
    if ($method === 'GET') {
        $stmt = $conn->query("
            SELECT r.id, r.nama_kelas, r.kode_unik,
                   COUNT(u_siswa.id) as total_siswa,
                   u_guru.id as guru_id,
                   u_guru.nama as guru_nama
            FROM rombel r 
            LEFT JOIN users u_siswa ON r.id = u_siswa.rombel_id AND u_siswa.role = 'siswa'
            LEFT JOIN users u_guru ON r.id = u_guru.rombel_id AND u_guru.role = 'guru'
            GROUP BY r.id, r.nama_kelas, r.kode_unik, u_guru.id, u_guru.nama
            ORDER BY r.nama_kelas ASC
        ");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->nama_kelas)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Nama Kelas wajib diisi."]);
            exit;
        }
        $kode_unik = isset($data->kode_unik) ? $data->kode_unik : '';
        $conn->beginTransaction();
        $stmt = $conn->prepare("INSERT INTO rombel (nama_kelas, kode_unik) VALUES (?, ?)");
        if ($stmt->execute([$data->nama_kelas, $kode_unik])) {
            $new_rombel_id = $conn->lastInsertId();
            if (!empty($data->guru_id)) {
                $stmtGuru = $conn->prepare("UPDATE users SET rombel_id = ? WHERE id = ? AND role = 'guru'");
                $stmtGuru->execute([$new_rombel_id, $data->guru_id]);
            }

            $conn->commit();
            echo json_encode(["status" => "success", "message" => "Kelas berhasil ditambahkan."]);
        } else {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal menambah kelas."]);
        }
    } elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->id) || empty($data->nama_kelas)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID dan Nama Kelas wajib diisi."]);
            exit;
        }

        $kode_unik = isset($data->kode_unik) ? $data->kode_unik : '';

        $conn->beginTransaction();
        $stmt = $conn->prepare("UPDATE rombel SET nama_kelas = ?, kode_unik = ? WHERE id = ?");
        if ($stmt->execute([$data->nama_kelas, $kode_unik, $data->id])) {
            $stmtResetGuru = $conn->prepare("UPDATE users SET rombel_id = NULL WHERE rombel_id = ? AND role = 'guru'");
            $stmtResetGuru->execute([$data->id]);
            if (!empty($data->guru_id)) {
                $stmtUpdateGuru = $conn->prepare("UPDATE users SET rombel_id = ? WHERE id = ? AND role = 'guru'");
                $stmtUpdateGuru->execute([$data->id, $data->guru_id]);
            }

            $conn->commit();
            echo json_encode(["status" => "success", "message" => "Data kelas berhasil diperbarui."]);
        } else {
            $conn->rollBack();
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal memperbarui kelas."]);
        }
    } elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id > 0) {
            $stmt = $conn->prepare("DELETE FROM rombel WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Kelas berhasil dihapus."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Gagal menghapus kelas."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID Kelas tidak valid."]);
        }
    }
} catch (PDOException $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
