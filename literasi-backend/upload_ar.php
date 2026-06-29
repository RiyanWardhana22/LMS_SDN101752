<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json; charset=UTF-8");

$target_dir = "../literasi-frontend/public/ar_markers/";
if (!file_exists($target_dir)) {
            mkdir($target_dir, 0777, true);
}

if (isset($_FILES["file"])) {
            $file_extension = pathinfo($_FILES["file"]["name"], PATHINFO_EXTENSION);
            if ($file_extension !== "mind") {
                        echo json_encode(["status" => "error", "message" => "Hanya file .mind yang diperbolehkan!"]);
                        exit();
            }
            $new_filename = uniqid() . "_" . basename($_FILES["file"]["name"]);
            $target_file = $target_dir . $new_filename;
            if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_file)) {
                        echo json_encode([
                                    "status" => "success",
                                    "message" => "File berhasil diunggah",
                                    "file_path" => "/ar_markers/" . $new_filename
                        ]);
            } else {
                        echo json_encode(["status" => "error", "message" => "Gagal memindahkan file."]);
            }
} else {
            echo json_encode(["status" => "error", "message" => "Tidak ada file yang dikirim."]);
}
