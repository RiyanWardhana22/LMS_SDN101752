<?php
include_once __DIR__ . '/../../config/database.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->username) && !empty($data->password)) {
            $query = "SELECT id, role, password_hash FROM users WHERE username = ? LIMIT 1";
            $stmt = $conn->prepare($query);
            $stmt->execute([$data->username]);
            $user = $stmt->fetch();
            if ($user && password_verify($data->password, $user['password_hash'])) {
                        $token = sprintf("%06d", mt_rand(1, 999999));
                        $expires = date("Y-m-d H:i:s", strtotime('+10 minutes'));

                        $update_query = "UPDATE users SET verification_token = ?, token_expires_at = ? WHERE id = ?";
                        $update_stmt = $conn->prepare($update_query);
                        $update_stmt->execute([$token, $expires, $user['id']]);
                        echo json_encode([
                                    "status" => "success",
                                    "message" => "Kredensial valid. Lanjut ke verifikasi token.",
                                    "role" => $user['role'],
                                    "debug_token" => $token
                        ]);
            } else {
                        http_response_code(401);
                        echo json_encode(["status" => "error", "message" => "Username atau password salah."]);
            }
} else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Username dan password harus diisi."]);
}
