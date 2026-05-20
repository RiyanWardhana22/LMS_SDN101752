<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}
require_once '../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

include_once __DIR__ . '/../../config/database.php';
$data = json_decode(file_get_contents("php://input"));
if (!empty($data->username) && !empty($data->password)) {
    $query = "SELECT id, role, password_hash, email FROM users WHERE username = ? LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->username]);
    $user = $stmt->fetch();
    if ($user && password_verify($data->password, $user['password_hash'])) {
        $token = sprintf("%06d", mt_rand(1, 999999));
        $expires = date("Y-m-d H:i:s", strtotime('+10 minutes'));
        $update_query = "UPDATE users SET verification_token = ?, token_expires_at = ? WHERE id = ?";
        $update_stmt = $conn->prepare($update_query);
        $update_stmt->execute([$token, $expires, $user['id']]);

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'lmssdn101752@gmail.com';
            $mail->Password   = 'tzwo qymv lmyg kzwu';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
            $mail->Port       = 465;

            $mail->setFrom('lmssdn101752@gmail.com', 'Keamanan LiteraSI');
            $mail->addAddress($user['email']);

            $mail->isHTML(true);
            $mail->Subject = 'Kode Verifikasi Login LiteraSI';
            $mail->Body    = "
                <div style='font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;'>
                    <h2 style='color: #ff6b35;'>Verifikasi Login LiteraSI</h2>
                    <p style='color: #555;'>Seseorang sedang mencoba masuk ke akun Anda. Jika itu Anda, gunakan kode keamanan 6 digit di bawah ini:</p>
                    <div style='font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #3498db; background: #ebf5fb; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                        {$token}
                    </div>
                    <p style='color: #888; font-size: 12px;'>Kode ini hanya berlaku selama 10 menit.<br>Jika Anda tidak merasa login, abaikan pesan ini.</p>
                </div>
            ";

            $mail->send();

            echo json_encode([
                "status" => "success",
                "message" => "Kredensial valid. Kode telah dikirim ke email Anda.",
                "role" => $user['role']
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Sistem gagal mengirim email: {$mail->ErrorInfo}"]);
        }
    } else {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Username atau password salah."]);
    }
} else {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Username dan password harus diisi."]);
}
