<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        echo json_encode(["status" => "error", "message" => "Server PHP Crash: " . $error['message']]);
        exit;
    }
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit(0); }
if (!ini_get('allow_url_fopen')) {
    echo json_encode(["status" => "error", "message" => "Fitur 'allow_url_fopen' di PHP Anda nonaktif."]);
    exit;
}

$api_keys = @include '../../config/ai_keys.php';
if (!$api_keys || !is_array($api_keys)) {
    echo json_encode(["status" => "error", "message" => "File config/ai_keys.php tidak ditemukan atau salah format."]);
    exit;
}

$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input);
$user_prompt = isset($data->prompt) ? $data->prompt : '';
$system_instruction = isset($data->system_instruction) ? $data->system_instruction : '';

if (empty($user_prompt)) {
    echo json_encode(["status" => "error", "message" => "Prompt tidak boleh kosong."]);
    exit;
}

$requestBody = ["contents" => [ [ "parts" => [ ["text" => $user_prompt] ] ] ] ];

if (!empty($system_instruction)) {
    $requestBody["system_instruction"] = ["parts" => [ ["text" => $system_instruction] ] ];
}

$jsonBody = json_encode($requestBody);

$success = false;
$response_text = "";
$error_msg = "";
$models = ['gemini-3.5-flash', 'gemini-2.5-flash'];
foreach ($models as $model_name) {
    foreach ($api_keys as $index => $key) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model_name}:generateContent?key=" . trim($key);
        $options = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/json\r\n" .
                             "Content-Length: " . strlen($jsonBody) . "\r\n",
                'content' => $jsonBody,
                'ignore_errors' => true 
            ],
            'ssl' => [
                'verify_peer'      => false,
                'verify_peer_name' => false
            ]
        ];

        $context  = stream_context_create($options);
        $response = @file_get_contents($url, false, $context);
        $http_code = 500;
        if (isset($http_response_header) && is_array($http_response_header)) {
            foreach ($http_response_header as $header) {
                if (preg_match('#^HTTP/\d+(?:\.\d+)?\s+(\d+)#', $header, $matches)) {
                    $http_code = intval($matches[1]);
                    break;
                }
            }
        }

        if ($response !== false && $http_code == 200) {
            $result = json_decode($response, true);
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                $response_text = $result['candidates'][0]['content']['parts'][0]['text'];
                $success = true;
                break 2; 
            }
        } else {
            $error_msg .= "[$model_name | API " . ($index + 1) . " -> HTTP $http_code] ";
            if ($http_code == 503 || $http_code == 500) {
                break; 
            } else if ($http_code == 429) {
                continue;
            } else {
                continue;
            }
        }
    }
}

if ($success) {
    echo json_encode(["status" => "success", "data" => $response_text]);
} else {
    echo json_encode(["status" => "error", "message" => "Layanan AI sedang mengalami gangguan massal atau limit kuota.", "debug" => $error_msg]);
}
?>