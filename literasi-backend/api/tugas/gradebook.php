<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit(0);
}
include_once '../../config/database.php';
try {
            $db = $conn;
            $rombel_id = isset($_GET['rombel_id']) ? $_GET['rombel_id'] : null;
            if (!$rombel_id) {
                        echo json_encode(["status" => "error", "message" => "Pilih kelas (Rombel) terlebih dahulu."]);
                        exit;
            }
            $stmtSiswa = $db->prepare("SELECT id, nama, username FROM users WHERE role = 'siswa' AND rombel_id = :r ORDER BY nama ASC");
            $stmtSiswa->execute([':r' => $rombel_id]);
            $siswa = $stmtSiswa->fetchAll(PDO::FETCH_ASSOC);
            $stmtTasks = $db->prepare("SELECT id, judul, mata_pelajaran, tipe FROM tugas_kuis WHERE rombel_id = :r ORDER BY created_at ASC");
            $stmtTasks->execute([':r' => $rombel_id]);
            $tasks = $stmtTasks->fetchAll(PDO::FETCH_ASSOC);

            $scores = [];
            if (count($tasks) > 0) {
                        $taskIds = array_column($tasks, 'id');
                        $inQuery = implode(',', array_fill(0, count($taskIds), '?'));
                        $stmtScores = $db->prepare("SELECT siswa_id, tugas_id, nilai FROM pengumpulan_tugas WHERE tugas_id IN ($inQuery) AND status_koreksi = 'sudah'");
                        $stmtScores->execute($taskIds);
                        $scoresData = $stmtScores->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($scoresData as $row) {
                                    $scores[$row['siswa_id']][$row['tugas_id']] = $row['nilai'];
                        }
            }

            echo json_encode([
                        "status" => "success",
                        "siswa" => $siswa,
                        "tasks" => $tasks,
                        "scores" => $scores
            ]);
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => "Terjadi kesalahan sistem: " . $e->getMessage()]);
}
