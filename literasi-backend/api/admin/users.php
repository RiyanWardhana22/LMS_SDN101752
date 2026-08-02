<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once __DIR__ . '/../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // [READ] Mengambil daftar pengguna
        $role = isset($_GET['role']) ? $_GET['role'] : null;
        $query = "SELECT u.id, u.nama, u.role, u.username, u.email, u.xp, u.pin, u.created_at, r.nama_kelas 
                  FROM users u LEFT JOIN rombel r ON u.rombel_id = r.id";
        
        if ($role) {
            $query .= " WHERE u.role = :role";
        }
        $query .= " ORDER BY u.created_at DESC";
        
        $stmt = $conn->prepare($query);
        if ($role) $stmt->bindParam(':role', $role);
        $stmt->execute();
        
        echo json_encode(["status" => "success", "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } 
    
    elseif ($method === 'POST') {
        // [CREATE] Menambah pengguna baru
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->nama) || empty($data->role)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Nama dan Role wajib diisi."]);
            exit;
        }

        if ($data->role === 'siswa') {
            // === LOGIKA KHUSUS SISWA ===
            if (empty($data->pin) || empty($data->rombel_id)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "PIN dan ID Kelas wajib diisi untuk siswa."]);
                exit;
            }

            $insert_query = "INSERT INTO users (nama, role, pin, rombel_id) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($insert_query);
            
            if ($stmt->execute([$data->nama, $data->role, $data->pin, $data->rombel_id])) {
                echo json_encode(["status" => "success", "message" => "Siswa berhasil ditambahkan."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Gagal menyimpan data siswa."]);
            }

        } else {
            // === LOGIKA KHUSUS GURU & ADMIN ===
            if (empty($data->username) || empty($data->password)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Username dan Password wajib diisi."]);
                exit;
            }

            // Cek apakah username sudah dipakai
            $check_stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
            $check_stmt->execute([$data->username]);
            if ($check_stmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Username sudah digunakan."]);
                exit;
            }

            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            $insert_query = "INSERT INTO users (nama, role, username, password_hash) VALUES (?, ?, ?, ?)";
            $stmt = $conn->prepare($insert_query);
            
            if ($stmt->execute([$data->nama, $data->role, $data->username, $password_hash])) {
                echo json_encode(["status" => "success", "message" => "Pengguna berhasil ditambahkan."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Gagal menyimpan data pengguna."]);
            }
        }
    }

    elseif ($method === 'DELETE') {
        // [DELETE] Menghapus pengguna (Belum diubah, tetap sama)
        $data = json_decode(file_get_contents("php://input"));
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$data->id]);
        echo json_encode(["status" => "success"]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}