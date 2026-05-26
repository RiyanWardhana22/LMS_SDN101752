-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 26, 2026 at 07:37 AM
-- Server version: 8.0.42
-- PHP Version: 8.3.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms_sdn101752`
--

-- --------------------------------------------------------

--
-- Table structure for table `materi`
--

CREATE TABLE `materi` (
  `id` int NOT NULL,
  `guru_id` int NOT NULL,
  `mata_pelajaran` varchar(100) NOT NULL,
  `kelas` varchar(50) NOT NULL,
  `judul` varchar(255) NOT NULL,
  `konten` text,
  `visibilitas` enum('publik','draft') DEFAULT 'publik',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `materi`
--

INSERT INTO `materi` (`id`, `guru_id`, `mata_pelajaran`, `kelas`, `judul`, `konten`, `visibilitas`, `created_at`) VALUES
(1, 3, 'IPA (Sains)', 'Kelas 4', 'Halo ini malam RABU', '<p>halo&nbsp;saya&nbsp;adalah&nbsp;malam&nbsp;<strong>Selasa&nbsp;</strong>silahkan&nbsp;buka&nbsp;link&nbsp;berikut&nbsp;<a href=\"https://gemini.google.com/\" rel=\"noopener noreferrer\" target=\"_blank\">https://gemini.google.com/</a></p>', 'publik', '2026-05-18 16:30:33');

-- --------------------------------------------------------

--
-- Table structure for table `materi_media`
--

CREATE TABLE `materi_media` (
  `id` int NOT NULL,
  `materi_id` int NOT NULL,
  `tipe_media` enum('video_link','video_cloud','ar_mind') NOT NULL,
  `url_atau_path` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `materi_media`
--

INSERT INTO `materi_media` (`id`, `materi_id`, `tipe_media`, `url_atau_path`) VALUES
(2, 1, 'video_link', 'https://youtu.be/sbT4shi1Xqk?si=sjs1-lzIrODwaZrl');

-- --------------------------------------------------------

--
-- Table structure for table `pengumpulan_tugas`
--

CREATE TABLE `pengumpulan_tugas` (
  `id` int NOT NULL,
  `tugas_id` int NOT NULL,
  `siswa_id` int NOT NULL,
  `jawaban` text NOT NULL,
  `nilai` int DEFAULT NULL,
  `dikumpulkan_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tugas_kuis`
--

CREATE TABLE `tugas_kuis` (
  `id` int NOT NULL,
  `guru_id` int NOT NULL,
  `judul` varchar(255) NOT NULL,
  `deskripsi` text,
  `tipe` enum('tugas','kuis') NOT NULL DEFAULT 'tugas',
  `tenggat` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tugas_kuis`
--

INSERT INTO `tugas_kuis` (`id`, `guru_id`, `judul`, `deskripsi`, `tipe`, `tenggat`, `created_at`) VALUES
(1, 3, 'Pilihan Berganda Matkul Pemrograman Web', '[{\"id\":1779779867568,\"pertanyaan\":\"Dalam pengembangan web, HTML digunakan untuk …\",\"a\":\"Mengatur tampilan halaman web\",\"b\":\"Membuat struktur halaman web\",\"c\":\"Mengelola basis data\",\"d\":\"Menjalankan logika server\",\"kunci\":\"b\"},{\"id\":1779779983421,\"pertanyaan\":\"Fungsi utama CSS pada pemrograman web adalah …\",\"a\":\"Menghubungkan website ke database\",\"b\":\"Menjalankan script interaktif\",\"c\":\"Mengatur tampilan dan desain halaman web\",\"d\":\"Membuat server web\",\"kunci\":\"c\"},{\"id\":1779780021174,\"pertanyaan\":\"Perintah JavaScript berikut digunakan untuk menampilkan pesan di browser:\\n\\nalert(\\\"Hello World\\\");\\n\\nFungsi alert() adalah untuk …\",\"a\":\"Menyimpan data pengguna\",\"b\":\"Menampilkan pesan pop-up\",\"c\":\"Menghapus elemen HTML\",\"d\":\"Membuat koneksi database\",\"kunci\":\"b\"},{\"id\":1779780075807,\"pertanyaan\":\"Tag HTML yang digunakan untuk membuat hyperlink adalah …\",\"a\":\"<img>\",\"b\":\"<p>\",\"c\":\"<a>\",\"d\":\"<table>\",\"kunci\":\"c\"},{\"id\":1779780222789,\"pertanyaan\":\"PHP termasuk bahasa pemrograman yang berjalan di …\",\"a\":\"Client-side\",\"b\":\"Browser\",\"c\":\"Server-side\",\"d\":\"Database\",\"kunci\":\"c\"}]', 'kuis', '2026-08-26 14:25:00', '2026-05-26 07:25:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `role` enum('siswa','guru','admin') NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `kode_unik` varchar(6) DEFAULT NULL,
  `verification_token` varchar(6) DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `role`, `username`, `email`, `password_hash`, `kode_unik`, `verification_token`, `token_expires_at`, `created_at`, `updated_at`) VALUES
(1, 'Admin Utama', 'admin', 'admin', 'riyanwardhana2@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, NULL, '2026-05-17 11:35:44', '2026-05-20 17:20:44'),
(2, 'Budi', 'siswa', NULL, NULL, NULL, 'ABC123', NULL, NULL, '2026-05-17 11:35:44', '2026-05-17 11:35:44'),
(3, 'Guru Budi', 'guru', 'gurudemo', 'riyanwardhana55@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, NULL, '2026-05-17 16:01:19', '2026-05-26 07:12:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `materi`
--
ALTER TABLE `materi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guru_id` (`guru_id`);

--
-- Indexes for table `materi_media`
--
ALTER TABLE `materi_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `materi_id` (`materi_id`);

--
-- Indexes for table `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tugas_id` (`tugas_id`),
  ADD KEY `siswa_id` (`siswa_id`);

--
-- Indexes for table `tugas_kuis`
--
ALTER TABLE `tugas_kuis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guru_id` (`guru_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `kode_unik` (`kode_unik`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `materi`
--
ALTER TABLE `materi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `materi_media`
--
ALTER TABLE `materi_media`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tugas_kuis`
--
ALTER TABLE `tugas_kuis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `materi`
--
ALTER TABLE `materi`
  ADD CONSTRAINT `materi_ibfk_1` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `materi_media`
--
ALTER TABLE `materi_media`
  ADD CONSTRAINT `materi_media_ibfk_1` FOREIGN KEY (`materi_id`) REFERENCES `materi` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  ADD CONSTRAINT `pengumpulan_tugas_ibfk_1` FOREIGN KEY (`tugas_id`) REFERENCES `tugas_kuis` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pengumpulan_tugas_ibfk_2` FOREIGN KEY (`siswa_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tugas_kuis`
--
ALTER TABLE `tugas_kuis`
  ADD CONSTRAINT `tugas_kuis_ibfk_1` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
