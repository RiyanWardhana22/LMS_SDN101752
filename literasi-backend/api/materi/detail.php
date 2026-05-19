<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
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
            $id = isset($_GET['id']) ? $_GET['id'] : null;
            if (!empty($id)) {
                        $query = "SELECT * FROM materi WHERE id = :id";
                        $stmt = $db->prepare($query);
                        $stmt->bindValue(':id', $id);
                        $stmt->execute();
                        $materi = $stmt->fetch(PDO::FETCH_ASSOC);
                        if ($materi) {
                                    $query_media = "SELECT id, tipe_media as type, url_atau_path as url FROM materi_media WHERE materi_id = :materi_id";
                                    $stmt_media = $db->prepare($query_media);
                                    $stmt_media->bindValue(':materi_id', $id);
                                    $stmt_media->execute();
                                    $media = $stmt_media->fetchAll(PDO::FETCH_ASSOC);

                                    $materi['media'] = $media;
                                    echo json_encode(["status" => "success", "data" => $materi]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Materi tidak ditemukan."]);
                        }
            } else {
                        echo json_encode(["status" => "error", "message" => "ID materi diperlukan."]);
            }
} catch (Throwable $e) {
            echo json_encode([
                        "status" => "error",
                        "message" => "Terjadi kesalahan di sistem PHP: " . $e->getMessage()
            ]);
}
