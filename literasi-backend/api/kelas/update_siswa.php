<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
}
include_once '../../config/database.php';

try {
            $db = $conn;
            $data = json_decode(file_get_contents("php://input"));
            $id = isset($data->id) ? $data->id : null;
            $nama = isset($data->nama) ? trim($data->nama) : null;
            $pin = isset($data->pin) ? trim($data->pin) : null;

            if ($id) {
                        $updates = [];
                        $params = [':id' => $id];
                        if ($nama) {
                                    $updates[] = "nama = :nama";
                                    $params[':nama'] = $nama;
                        }
                        if ($pin) {
                                    $updates[] = "pin = :pin";
                                    $params[':pin'] = $pin;
                        }

                        if (count($updates) > 0) {
                                    $query = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = :id AND role = 'siswa'";
                                    $stmt = $db->prepare($query);
                                    $stmt->execute($params);
                                    echo json_encode(["status" => "success", "message" => "Data siswa berhasil diperbarui!"]);
                        } else {
                                    echo json_encode(["status" => "error", "message" => "Tidak ada data yang diubah."]);
                        }
            } else {
                        echo json_encode(["status" => "error", "message" => "ID Siswa tidak valid."]);
            }
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
