<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../config/database.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->username) && !empty($data->token)) {
            $query = "SELECT id, role, token_expires_at FROM users WHERE username = ? AND verification_token = ? LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->execute([$data->username, $data->token]);
            $user = $stmt->fetch();
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
                                                            "role" => $user['role'],
                                                            "username" => $data->username
                                                ]
                                    ]);
                        } else {
                                    http_response_code(401);
                                    echo json_encode(["status" => "error", "message" => "Token sudah kedaluwarsa. Silakan login kembali."]);
                        }
            } else {
                        http_response_code(401);
                        echo json_encode(["status" => "error", "message" => "Token tidak valid."]);
            }
} else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Username dan token harus diisi."]);
}
