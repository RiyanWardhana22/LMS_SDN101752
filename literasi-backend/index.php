<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            exit();
}
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/literasi-backend';
$path = str_replace($base_path, '', $request_uri);
$path = parse_url($path, PHP_URL_PATH);

switch ($path) {
            case '/api/auth/verify_credentials':
                        require __DIR__ . '/api/auth/verify_credentials.php';
                        break;

            case '/api/auth/verify_token':
                        require __DIR__ . '/api/auth/verify_token.php';
                        break;

            default:
                        http_response_code(404);
                        echo json_encode(["status" => "error", "message" => "Endpoint tidak ditemukan: " . $path]);
                        break;
}
