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
    // [READ] AMBIL DATA KELAS
    if ($method === 'GET') {
        $stmt = $conn->query("
            SELECT r.id, r.nama_kelas, COUNT(u.id) as total_siswa 
            FROM rombel r 
            LEFT JOIN users u ON r.id = u.rombel_id AND u.role = 'siswa'
            GROUP BY r.id, r.nama_kelas 
            ORDER BY r.nama_kelas ASC
        ");
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } 
    
    // [CREATE] TAMBAH KELAS BARU
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->nama_kelas)) {
            http_response_code(400); echo json_encode(["status" => "error", "message" => "Nama Kelas wajib diisi."]); exit;
        }

        $stmt = $conn->prepare("INSERT INTO rombel (nama_kelas) VALUES (?)");
        if ($stmt->execute([$data->nama_kelas])) {
            echo json_encode(["status" => "success", "message" => "Kelas berhasil ditambahkan."]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Gagal menambah kelas."]);
        }
    }

    // [UPDATE] UBAH NAMA KELAS
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));
        if (empty($data->id) || empty($data->nama_kelas)) {
            http_response_code(400); echo json_encode(["status" => "error", "message" => "ID dan Nama Kelas wajib diisi."]); exit;
        }

        $stmt = $conn->prepare("UPDATE rombel SET nama_kelas = ? WHERE id = ?");
        if ($stmt->execute([$data->nama_kelas, $data->id])) {
            echo json_encode(["status" => "success", "message" => "Nama kelas berhasil diperbarui."]);
        } else {
            http_response_code(500); echo json_encode(["status" => "error", "message" => "Gagal memperbarui kelas."]);
        }
    }

    // [DELETE] HAPUS KELAS
    elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        if ($id > 0) {
            $stmt = $conn->prepare("DELETE FROM rombel WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Kelas berhasil dihapus."]);
            } else {
                http_response_code(500); echo json_encode(["status" => "error", "message" => "Gagal menghapus kelas."]);
            }
        } else {
            http_response_code(400); echo json_encode(["status" => "error", "message" => "ID Kelas tidak valid."]);
        }
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}
?>