<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Tambahkan PUT
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include_once __DIR__ . '/../../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    // =================================================================
    // [READ] MENGAMBIL DAFTAR PENGGUNA
    // =================================================================
    if ($method === 'GET') {
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
    
    // =================================================================
    // [CREATE] MENAMBAH PENGGUNA & IMPORT CSV
    // =================================================================
    elseif ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        
        // 1. LOGIKA IMPORT CSV MASSAL
        if (isset($data->action) && $data->action === 'import_siswa') {
            if (!isset($data->siswa) || !is_array($data->siswa)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Data CSV tidak valid."]);
                exit;
            }

            $inserted = 0;
            $stmt = $conn->prepare("INSERT INTO users (nama, role, pin, rombel_id) VALUES (?, 'siswa', ?, ?)");
            
            foreach ($data->siswa as $s) {
                if (!empty($s->nama) && !empty($s->pin) && !empty($s->rombel_id)) {
                    if ($stmt->execute([$s->nama, $s->pin, $s->rombel_id])) {
                        $inserted++;
                    }
                }
            }
            echo json_encode(["status" => "success", "message" => "$inserted data siswa berhasil diimpor!"]);
            exit;
        }

        // 2. LOGIKA TAMBAH MANUAL (SATUAN)
        if (empty($data->nama) || empty($data->role)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Nama dan Role wajib diisi."]);
            exit;
        }

        if ($data->role === 'siswa') {
            if (empty($data->pin) || empty($data->rombel_id)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "PIN dan ID Kelas wajib diisi."]);
                exit;
            }
            $stmt = $conn->prepare("INSERT INTO users (nama, role, pin, rombel_id) VALUES (?, ?, ?, ?)");
            if ($stmt->execute([$data->nama, $data->role, $data->pin, $data->rombel_id])) {
                echo json_encode(["status" => "success", "message" => "Siswa berhasil ditambahkan."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Gagal menyimpan data siswa."]);
            }
        } else {
            if (empty($data->username) || empty($data->password)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Username dan Password wajib diisi."]);
                exit;
            }

            // Cek username bentrok
            $check_stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
            $check_stmt->execute([$data->username]);
            if ($check_stmt->rowCount() > 0) {
                http_response_code(409);
                echo json_encode(["status" => "error", "message" => "Username sudah digunakan."]);
                exit;
            }

            $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
            $stmt = $conn->prepare("INSERT INTO users (nama, role, username, password_hash) VALUES (?, ?, ?, ?)");
            
            if ($stmt->execute([$data->nama, $data->role, $data->username, $password_hash])) {
                echo json_encode(["status" => "success", "message" => "Pengguna berhasil ditambahkan."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Gagal menyimpan data pengguna."]);
            }
        }
    }

    // =================================================================
    // [UPDATE] MENGUBAH DATA PENGGUNA (EDIT)
    // =================================================================
    elseif ($method === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (empty($data->id) || empty($data->nama)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID dan Nama wajib diisi."]);
            exit;
        }

        if ($data->role === 'siswa') {
            $stmt = $conn->prepare("UPDATE users SET nama = ?, pin = ?, rombel_id = ? WHERE id = ?");
            $success = $stmt->execute([$data->nama, $data->pin, $data->rombel_id, $data->id]);
        } else {
            // Update password hanya jika diisi (tidak kosong)
            if (!empty($data->password)) {
                $password_hash = password_hash($data->password, PASSWORD_BCRYPT);
                $stmt = $conn->prepare("UPDATE users SET nama = ?, username = ?, password_hash = ? WHERE id = ?");
                $success = $stmt->execute([$data->nama, $data->username, $password_hash, $data->id]);
            } else {
                $stmt = $conn->prepare("UPDATE users SET nama = ?, username = ? WHERE id = ?");
                $success = $stmt->execute([$data->nama, $data->username, $data->id]);
            }
        }

        if ($success) {
            echo json_encode(["status" => "success", "message" => "Data berhasil diperbarui."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Gagal memperbarui data."]);
        }
    }

    // =================================================================
    // [DELETE] MENGHAPUS PENGGUNA
    // =================================================================
    elseif ($method === 'DELETE') {
        $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
        
        if ($id > 0) {
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            if ($stmt->execute([$id])) {
                echo json_encode(["status" => "success", "message" => "Pengguna berhasil dihapus."]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Gagal menghapus pengguna."]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "ID Pengguna tidak valid."]);
        }
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
}