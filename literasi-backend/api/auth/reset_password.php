<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
}

include_once __DIR__ . '/../../config/database.php';
$data = json_decode(file_get_contents("php://input"));

if (!empty($data->email) && !empty($data->token) && !empty($data->new_password)) {
            $query = "SELECT id, verification_token, token_expires_at FROM users WHERE email = ? LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->execute([$data->email]);
            $user = $stmt->fetch();
            if ($user) {
                        if ($user['verification_token'] === $data->token) {
                                    if (strtotime($user['token_expires_at']) > time()) {
                                                $new_password_hash = password_hash($data->new_password, PASSWORD_DEFAULT);
                                                $update_query = "UPDATE users SET password_hash = ?, verification_token = NULL, token_expires_at = NULL WHERE id = ?";
                                                $update_stmt = $conn->prepare($update_query);
                                                if ($update_stmt->execute([$new_password_hash, $user['id']])) {
                                                            echo json_encode(["status" => "success", "message" => "Kata sandi berhasil diperbarui."]);
                                                } else {
                                                            http_response_code(500);
                                                            echo json_encode(["status" => "error", "message" => "Gagal memperbarui kata sandi di database."]);
                                                }
                                    } else {
                                                http_response_code(400);
                                                echo json_encode(["status" => "error", "message" => "Kode pemulihan sudah kadaluarsa. Silakan minta kode baru."]);
                                    }
                        } else {
                                    http_response_code(400);
                                    echo json_encode(["status" => "error", "message" => "Kode pemulihan yang Anda masukkan salah."]);
                        }
            } else {
                        http_response_code(404);
                        echo json_encode(["status" => "error", "message" => "Email tidak terdaftar."]);
            }
} else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Semua kolom wajib diisi."]);
}
