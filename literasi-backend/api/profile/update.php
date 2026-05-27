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

            if (!$data || empty($data->id) || empty($data->nama) || empty($data->username)) {
                        echo json_encode(["status" => "error", "message" => "Data profil utama (Nama dan Username) tidak lengkap."]);
                        exit();
            }
            $id = $data->id;
            $nama = $data->nama;
            $username = $data->username;
            $email = $data->email;
            $foto_profile = isset($data->foto_profile) ? $data->foto_profile : null;
            $password = isset($data->password) ? $data->password : '';
            $check_user = $db->prepare("SELECT id FROM users WHERE username = :username AND id != :id LIMIT 1");
            $check_user->execute([':username' => $username, ':id' => $id]);
            if ($check_user->rowCount() > 0) {
                        echo json_encode(["status" => "error", "message" => "Username sudah digunakan oleh orang lain."]);
                        exit();
            }
            if (!empty($password)) {
                        $password_hash = password_hash($password, PASSWORD_BCRYPT);
                        $query = "UPDATE users SET nama = :nama, username = :username, email = :email, foto_profile = :foto, password_hash = :pass WHERE id = :id";
                        $stmt = $db->prepare($query);
                        $stmt->bindValue(':pass', $password_hash);
            } else {
                        $query = "UPDATE users SET nama = :nama, username = :username, email = :email, foto_profile = :foto WHERE id = :id";
                        $stmt = $db->prepare($query);
            }

            $stmt->bindValue(':nama', $nama);
            $stmt->bindValue(':username', $username);
            $stmt->bindValue(':email', $email);
            $stmt->bindValue(':foto', $foto_profile);
            $stmt->bindValue(':id', $id);
            if ($stmt->execute()) {
                        $get_updated = $db->prepare("SELECT id, username, nama, role, email, foto_profile FROM users WHERE id = :id LIMIT 1");
                        $get_updated->execute([':id' => $id]);
                        $user_updated = $get_updated->fetch(PDO::FETCH_ASSOC);

                        echo json_encode([
                                    "status" => "success",
                                    "message" => "Profil Anda berhasil diperbarui!",
                                    "user" => $user_updated
                        ]);
            } else {
                        echo json_encode(["status" => "error", "message" => "Gagal memperbarui data di database."]);
            }
} catch (Throwable $e) {
            echo json_encode([
                        "status" => "error",
                        "message" => "Terjadi kesalahan di sistem PHP: " . $e->getMessage()
            ]);
}
