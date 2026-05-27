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
            $guru_id = isset($_GET['guru_id']) ? $_GET['guru_id'] : null;
            if (!$guru_id) {
                        echo json_encode(["status" => "error", "message" => "ID Guru diperlukan."]);
                        exit();
            }
            $stmtTasks = $db->prepare("SELECT id, judul, tipe FROM tugas_kuis WHERE guru_id = :guru_id ORDER BY created_at ASC");
            $stmtTasks->execute([':guru_id' => $guru_id]);
            $tasks = $stmtTasks->fetchAll(PDO::FETCH_ASSOC);
            $stmtStudents = $db->prepare("SELECT id, nama FROM users WHERE role = 'siswa' ORDER BY nama ASC");
            $stmtStudents->execute();
            $students = $stmtStudents->fetchAll(PDO::FETCH_ASSOC);
            $grades = [];
            if (count($tasks) > 0) {
                        $taskIds = array_column($tasks, 'id');
                        $inQuery = implode(',', array_fill(0, count($taskIds), '?'));
                        $stmtGrades = $db->prepare("SELECT tugas_id, siswa_id, nilai FROM pengumpulan_tugas WHERE tugas_id IN ($inQuery)");
                        $stmtGrades->execute($taskIds);
                        $gradesData = $stmtGrades->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($gradesData as $g) {
                                    $grades[$g['siswa_id']][$g['tugas_id']] = $g['nilai'];
                        }
            }
            $report = [];
            foreach ($students as $student) {
                        $studentGrades = [];
                        foreach ($tasks as $task) {
                                    $val = isset($grades[$student['id']][$task['id']]) ? $grades[$student['id']][$task['id']] : null;
                                    $studentGrades[$task['id']] = $val;
                        }
                        $report[] = [
                                    'siswa_id' => $student['id'],
                                    'nama_siswa' => $student['nama'],
                                    'grades' => $studentGrades
                        ];
            }

            echo json_encode([
                        "status" => "success",
                        "tasks" => $tasks,
                        "report" => $report
            ]);
} catch (Throwable $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
