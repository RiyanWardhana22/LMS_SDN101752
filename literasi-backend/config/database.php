<?php
$host = 'localhost';
$db_name = 'lms_sdn101752';
$username = 'root';
$password = '';

try {
            $conn = new PDO("mysql:host={$host};dbname={$db_name}", $username, $password);
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $exception) {
            echo "Koneksi database error: " . $exception->getMessage();
            exit;
}
