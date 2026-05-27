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
include_once __DIR__ . '/../../config/database.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->username) && !empty($data->token)) {
            $query = "SELECT id, username, nama, role, email, foto_profile, token_expires_at FROM users WHERE username = ? AND verification_token = ? LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->execute([$data->username, $data->token]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user) {
                        $current_time = date("Y-m-d H:i:s");
                        if ($user['token_expires_at'] > $current_time) {
                                    $clear_query = "UPDATE users SET verification_token = NULL, token_expires_at = NULL WHERE id = ?";
                                    $clear_stmt = $conn->prepare($clear_query);
                                    $clear_stmt->execute([$user['id']]);
                                    echo json_encode([
                                                "status" => "success",
                                                "message" => "Verifikasi berhasil! Selamat datang.",
                                                "user" => [
                                                            "id" => $user['id'],
                                                            "username" => $user['username'],
                                                            "nama" => $user['nama'],
                                                            "role" => $user['role'],
                                                            "email" => $user['email'],
                                                            "foto_profile" => $user['foto_profile']
                                                ]
                                    ]);
                        } else {
                                    http_response_code(401);
                                    echo json_encode(["status" => "error", "message" => "Token sudah kedaluwarsa. Silakan login kembali."]);
                        }
            } else {
                        http_response_code(401);
                        echo json_encode(["status" => "error", "message" => "Token tidak valid atau salah."]);
            }
} else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Username dan token harus diisi."]);
}
