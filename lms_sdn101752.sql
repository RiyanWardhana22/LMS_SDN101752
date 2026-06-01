-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jun 01, 2026 at 04:14 PM
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
  `rombel_id` int DEFAULT NULL,
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

INSERT INTO `materi` (`id`, `guru_id`, `rombel_id`, `mata_pelajaran`, `kelas`, `judul`, `konten`, `visibilitas`, `created_at`) VALUES
(1, 3, NULL, 'IPA (Sains)', 'Kelas 4', 'Halo ini malam RABU', '<p>halo&nbsp;saya&nbsp;adalah&nbsp;malam&nbsp;<strong>Selasa&nbsp;</strong>silahkan&nbsp;buka&nbsp;link&nbsp;berikut&nbsp;<a href=\"https://gemini.google.com/\" rel=\"noopener noreferrer\" target=\"_blank\">https://gemini.google.com/</a></p>', 'publik', '2026-05-18 16:30:33'),
(9, 3, 1, 'Sejarah', 'Kelas 4A', 'Raditya Dika', '', 'publik', '2026-05-28 04:44:19'),
(19, 3, 2, 'Sejarah', 'Kelas 4B', 'Raditya Dika (Salinan)', '', 'draft', '2026-06-01 16:13:57');

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
(2, 1, 'video_link', 'https://youtu.be/sbT4shi1Xqk?si=sjs1-lzIrODwaZrl'),
(3, 9, 'video_link', 'https://www.youtube.com/watch?v=xj3xEisC7D4'),
(10, 19, 'video_link', 'https://www.youtube.com/watch?v=xj3xEisC7D4');

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
-- Table structure for table `rombel`
--

CREATE TABLE `rombel` (
  `id` int NOT NULL,
  `nama_kelas` varchar(50) NOT NULL,
  `kode_unik` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `rombel`
--

INSERT INTO `rombel` (`id`, `nama_kelas`, `kode_unik`, `created_at`) VALUES
(1, 'Kelas 4A', 'ABC123', '2026-05-27 17:39:51'),
(2, 'Kelas 4B', 'ABC1234', '2026-06-01 15:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `tugas_kuis`
--

CREATE TABLE `tugas_kuis` (
  `id` int NOT NULL,
  `guru_id` int NOT NULL,
  `rombel_id` int DEFAULT NULL,
  `judul` varchar(255) NOT NULL,
  `deskripsi` text,
  `tipe` enum('tugas','kuis') NOT NULL DEFAULT 'tugas',
  `tenggat` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tugas_kuis`
--

INSERT INTO `tugas_kuis` (`id`, `guru_id`, `rombel_id`, `judul`, `deskripsi`, `tipe`, `tenggat`, `created_at`) VALUES
(1, 3, NULL, 'Pilihan Berganda Matkul Pemrograman Web', '[{\"id\":1779779867568,\"pertanyaan\":\"Dalam pengembangan web, HTML digunakan untuk …\",\"a\":\"Mengatur tampilan halaman web\",\"b\":\"Membuat struktur halaman web\",\"c\":\"Mengelola basis data\",\"d\":\"Menjalankan logika server\",\"kunci\":\"b\"},{\"id\":1779779983421,\"pertanyaan\":\"Fungsi utama CSS pada pemrograman web adalah …\",\"a\":\"Menghubungkan website ke database\",\"b\":\"Menjalankan script interaktif\",\"c\":\"Mengatur tampilan dan desain halaman web\",\"d\":\"Membuat server web\",\"kunci\":\"c\"},{\"id\":1779780021174,\"pertanyaan\":\"Perintah JavaScript berikut digunakan untuk menampilkan pesan di browser:\\n\\nalert(\\\"Hello World\\\");\\n\\nFungsi alert() adalah untuk …\",\"a\":\"Menyimpan data pengguna\",\"b\":\"Menampilkan pesan pop-up\",\"c\":\"Menghapus elemen HTML\",\"d\":\"Membuat koneksi database\",\"kunci\":\"b\"},{\"id\":1779780075807,\"pertanyaan\":\"Tag HTML yang digunakan untuk membuat hyperlink adalah …\",\"a\":\"<img>\",\"b\":\"<p>\",\"c\":\"<a>\",\"d\":\"<table>\",\"kunci\":\"c\"},{\"id\":1779780222789,\"pertanyaan\":\"PHP termasuk bahasa pemrograman yang berjalan di …\",\"a\":\"Client-side\",\"b\":\"Browser\",\"c\":\"Server-side\",\"d\":\"Database\",\"kunci\":\"c\"}]', 'kuis', '2026-08-26 14:25:00', '2026-05-26 07:25:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `role` enum('siswa','guru','admin') NOT NULL,
  `rombel_id` int DEFAULT NULL,
  `xp` int DEFAULT '0',
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `foto_profile` varchar(500) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `pin` varchar(10) DEFAULT NULL,
  `kode_unik` varchar(6) DEFAULT NULL,
  `verification_token` varchar(6) DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `nama`, `role`, `rombel_id`, `xp`, `username`, `email`, `foto_profile`, `password_hash`, `pin`, `kode_unik`, `verification_token`, `token_expires_at`, `created_at`, `updated_at`) VALUES
(1, 'Admin Utama', 'admin', NULL, 0, 'admin', 'riyanwardhana2@gmail.com', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, NULL, NULL, '2026-05-17 11:35:44', '2026-05-27 14:26:49'),
(2, 'Budi', 'siswa', 1, 122, NULL, NULL, NULL, NULL, '1234', 'ABC123', NULL, NULL, '2026-05-17 11:35:44', '2026-05-28 03:45:34'),
(3, 'Riyan Wardhana', 'guru', NULL, 0, 'riyan22', 'riyanwardhana55@gmail.com', 'https://res.cloudinary.com/dbteh8sbe/image/upload/v1779897441/zwisbpk3n6nxnmrnwpda.jpg', '$2y$10$uD//dYpN70LzHzmgjGmC8u63aJIyJOywCeN9P2OlAh28PhU/JKpgK', NULL, NULL, NULL, NULL, '2026-05-17 16:01:19', '2026-06-01 15:08:36'),
(4, 'Riyan', 'siswa', 1, 0, 'riyan607', NULL, NULL, NULL, '2206', NULL, NULL, NULL, '2026-05-28 03:49:49', '2026-05-28 03:49:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `materi`
--
ALTER TABLE `materi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guru_id` (`guru_id`),
  ADD KEY `fk_materi_rombel` (`rombel_id`);

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
-- Indexes for table `rombel`
--
ALTER TABLE `rombel`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_unik` (`kode_unik`);

--
-- Indexes for table `tugas_kuis`
--
ALTER TABLE `tugas_kuis`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guru_id` (`guru_id`),
  ADD KEY `fk_tugas_rombel` (`rombel_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `kode_unik` (`kode_unik`),
  ADD KEY `fk_user_rombel` (`rombel_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `materi`
--
ALTER TABLE `materi`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `materi_media`
--
ALTER TABLE `materi_media`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rombel`
--
ALTER TABLE `rombel`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tugas_kuis`
--
ALTER TABLE `tugas_kuis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `materi`
--
ALTER TABLE `materi`
  ADD CONSTRAINT `fk_materi_rombel` FOREIGN KEY (`rombel_id`) REFERENCES `rombel` (`id`) ON DELETE CASCADE,
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
  ADD CONSTRAINT `fk_tugas_rombel` FOREIGN KEY (`rombel_id`) REFERENCES `rombel` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tugas_kuis_ibfk_1` FOREIGN KEY (`guru_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_rombel` FOREIGN KEY (`rombel_id`) REFERENCES `rombel` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
