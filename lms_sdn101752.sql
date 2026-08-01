-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 28, 2026 at 07:21 AM
-- Server version: 8.0.30
-- PHP Version: 8.3.24

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
(20, 3, 1, 'Matematika', 'Kelas 4A', 'Penjumlahan dan Pengurangan', '<p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Penjumlahan&nbsp;dan&nbsp;pengurangan&nbsp;adalah&nbsp;dua&nbsp;operasi&nbsp;aritmatika&nbsp;utama&nbsp;di&nbsp;mana&nbsp;kita&nbsp;belajar&nbsp;menambahkan&nbsp;dan&nbsp;mengurangi&nbsp;dua&nbsp;atau&nbsp;lebih&nbsp;angka&nbsp;atau&nbsp;nilai&nbsp;matematika&nbsp;apa&nbsp;pun.&nbsp;Dua&nbsp;operasi&nbsp;matematika&nbsp;dasar&nbsp;lainnya&nbsp;adalah&nbsp;perkalian&nbsp;dan&nbsp;pembagian.&nbsp;Simbol&nbsp;untuk&nbsp;penjumlahan&nbsp;adalah&nbsp;&#39;+&#39;&nbsp;(tanda&nbsp;tambah)&nbsp;dan&nbsp;pengurangan&nbsp;adalah&nbsp;&#39;-&#39;&nbsp;(tanda&nbsp;minus).</span></p><p></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Penjumlahan&nbsp;dan&nbsp;pengurangan&nbsp;adalah&nbsp;operasi&nbsp;kebalikan&nbsp;satu&nbsp;sama&nbsp;lain.&nbsp;Misalnya,&nbsp;jika&nbsp;9&nbsp;+&nbsp;1&nbsp;=&nbsp;10,&nbsp;maka&nbsp;10&nbsp;–&nbsp;1&nbsp;=&nbsp;9.&nbsp;Itu&nbsp;menunjukkan&nbsp;bahwa&nbsp;jika&nbsp;1&nbsp;ditambahkan&nbsp;ke&nbsp;9&nbsp;maka&nbsp;hasilnya&nbsp;adalah&nbsp;10,&nbsp;sedangkan&nbsp;jika&nbsp;1&nbsp;dikurangi&nbsp;dari&nbsp;10,&nbsp;maka&nbsp;hasilnya&nbsp;adalah&nbsp;9.</span></p><p></p><h2><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Apa&nbsp;itu&nbsp;Penjumlahan?</span></h2><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Penjumlahan&nbsp;berarti&nbsp;menjumlahkan&nbsp;dua&nbsp;angka&nbsp;atau&nbsp;lebih&nbsp;untuk&nbsp;mendapatkan&nbsp;angka&nbsp;lain.&nbsp;Misalnya,&nbsp;jika&nbsp;kita&nbsp;menjumlahkan&nbsp;2&nbsp;dan&nbsp;3,&nbsp;kita&nbsp;mendapatkan&nbsp;5&nbsp;sebagai&nbsp;hasilnya.</span></p><p></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">2&nbsp;+&nbsp;3&nbsp;=&nbsp;5</span></p><p></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Sekarang,&nbsp;mari&nbsp;kita&nbsp;pahami&nbsp;penjumlahan&nbsp;2&nbsp;dan&nbsp;3&nbsp;secara&nbsp;praktis.&nbsp;Misalkan,&nbsp;kita&nbsp;memiliki&nbsp;2&nbsp;apel&nbsp;dalam&nbsp;sebuah&nbsp;keranjang&nbsp;dan&nbsp;3&nbsp;apel&nbsp;lagi&nbsp;ditambahkan&nbsp;ke&nbsp;keranjang&nbsp;yang&nbsp;sama,&nbsp;jadi&nbsp;berapa&nbsp;jumlah&nbsp;apel&nbsp;semuanya?</span></p><p></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">2&nbsp;→&nbsp;1&nbsp;+&nbsp;1</span></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">3&nbsp;→&nbsp;1&nbsp;+&nbsp;1&nbsp;+&nbsp;1</span></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">2&nbsp;+&nbsp;3&nbsp;=&nbsp;1&nbsp;+&nbsp;1&nbsp;+&nbsp;1&nbsp;+&nbsp;1&nbsp;+&nbsp;1</span></p><p></p><h2><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Apa&nbsp;itu&nbsp;pengurangan?</span></h2><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Pengurangan&nbsp;berarti&nbsp;mengurangi&nbsp;suatu&nbsp;nilai&nbsp;dari&nbsp;nilai&nbsp;lain&nbsp;untuk&nbsp;mendapatkan&nbsp;nilai&nbsp;yang&nbsp;diinginkan.</span></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Sebagai&nbsp;contoh,&nbsp;mengurangi&nbsp;3&nbsp;dari&nbsp;5&nbsp;menghasilkan&nbsp;2.</span></p><p></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">5&nbsp;–&nbsp;3&nbsp;=&nbsp;2</span></p><p></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Sekarang,&nbsp;jika&nbsp;kita&nbsp;bayangkan&nbsp;ada&nbsp;5&nbsp;apel&nbsp;dalam&nbsp;sebuah&nbsp;keranjang&nbsp;dan&nbsp;kita&nbsp;mengambil&nbsp;3&nbsp;apel&nbsp;dari&nbsp;keranjang&nbsp;tersebut,&nbsp;maka&nbsp;berapa&nbsp;apel&nbsp;yang&nbsp;tersisa?</span></p><p></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">Jawabannya&nbsp;adalah&nbsp;2&nbsp;buah&nbsp;apel.</span></p><p><span style=\"background-color: rgb(255, 255, 255); color: rgb(68, 68, 68);\">5&nbsp;–&nbsp;3&nbsp;=&nbsp;1&nbsp;+&nbsp;1&nbsp;+&nbsp;1&nbsp;+&nbsp;1&nbsp;+&nbsp;1&nbsp;–&nbsp;1&nbsp;–&nbsp;1&nbsp;–&nbsp;1&nbsp;=&nbsp;2</span></p><p></p>', 'publik', '2026-06-13 07:23:32'),
(22, 3, 1, 'IPA', 'Kelas 4A', 'Tumbuhan', '<p>tes</p>', 'publik', '2026-06-16 07:32:34'),
(23, 3, 1, 'IPA', 'Kelas 4A', 'Tata Surya', '<p>Ini&nbsp;tata&nbsp;surya&nbsp;ya</p>', 'publik', '2026-07-03 10:07:03'),
(26, 3, 1, 'AWOKAWOK', 'Kelas 4A', 'AWOKAWOK', '<p>123</p>', 'publik', '2026-07-28 06:19:48');

-- --------------------------------------------------------

--
-- Table structure for table `materi_media`
--

CREATE TABLE `materi_media` (
  `id` int NOT NULL,
  `materi_id` int NOT NULL,
  `tipe_media` enum('video_link','video_cloud','ar_mind') NOT NULL,
  `url_atau_path` varchar(500) NOT NULL,
  `nama_file` varchar(255) DEFAULT NULL,
  `is_ar_output` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `materi_media`
--

INSERT INTO `materi_media` (`id`, `materi_id`, `tipe_media`, `url_atau_path`, `nama_file`, `is_ar_output`) VALUES
(14, 22, 'video_link', 'https://youtu.be/Lamxt6IHoXI?si=529rJCPZf4vNSdMY', NULL, 0),
(15, 23, 'ar_mind', 'https://res.cloudinary.com/dbteh8sbe/raw/upload/v1783073209/dljz0vtvuttgeuknzwzn.mind', NULL, 0),
(20, 26, 'ar_mind', 'https://res.cloudinary.com/dbteh8sbe/raw/upload/v1785219491/pqvo0cei5xjlhnog4voe.mind', NULL, 0),
(21, 26, 'video_cloud', 'https://res.cloudinary.com/dbteh8sbe/video/upload/v1785219578/sfbq6q8suzwrkm4zezvu.mp4', NULL, 1);

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

--
-- Dumping data for table `pengumpulan_tugas`
--

INSERT INTO `pengumpulan_tugas` (`id`, `tugas_id`, `siswa_id`, `jawaban`, `nilai`, `dikumpulkan_pada`) VALUES
(3, 5, 6, 'Nggak tau', NULL, '2026-07-05 07:15:59'),
(4, 6, 6, '{\"1783072047511\":\"a\"}', 100, '2026-07-05 07:16:26'),
(5, 7, 6, '{\"1\":\"15\",\"2\":\"35\",\"3\":\"100\",\"4\":\"86\",\"5\":\"73\"}', NULL, '2026-07-05 15:55:03');

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
(2, 'Kelas 4B', 'ABC234', '2026-06-01 15:32:51');

-- --------------------------------------------------------

--
-- Table structure for table `tugas_kuis`
--

CREATE TABLE `tugas_kuis` (
  `id` int NOT NULL,
  `guru_id` int NOT NULL,
  `rombel_id` int DEFAULT NULL,
  `mata_pelajaran` varchar(100) DEFAULT NULL,
  `judul` varchar(255) NOT NULL,
  `deskripsi` text,
  `tipe` enum('tugas','kuis') NOT NULL DEFAULT 'tugas',
  `tenggat` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tugas_kuis`
--

INSERT INTO `tugas_kuis` (`id`, `guru_id`, `rombel_id`, `mata_pelajaran`, `judul`, `deskripsi`, `tipe`, `tenggat`, `created_at`) VALUES
(5, 3, 1, 'IPA', 'Materi Tumbuhan', '<p>gaydwtaydawdawda</p>', 'tugas', '2026-07-17 16:47:00', '2026-07-03 09:47:10'),
(6, 3, 1, 'IPA', 'Pilihan Ganda', '[{\"id\":1783072047511,\"pertanyaan\":\"Hello guys\",\"a\":\"hello guys 1\",\"b\":\"g\",\"c\":\"hello guys 2\",\"d\":\"h\",\"kunci\":\"a\"}]', 'kuis', '2026-07-17 16:48:00', '2026-07-03 09:48:17'),
(7, 3, 1, 'Matematika', 'Tugas Materi KPK', '<ol><li>Jadwal&nbsp;latihan&nbsp;tiga&nbsp;tim&nbsp;bola&nbsp;voli&nbsp;untuk&nbsp;bermain&nbsp;di&nbsp;lapangan&nbsp;yang&nbsp;sama&nbsp;adalah:&nbsp;tim&nbsp;pertama&nbsp;latihan&nbsp;4&nbsp;hari&nbsp;sekali,&nbsp;tim&nbsp;kedua&nbsp;latihan&nbsp;5&nbsp;hari&nbsp;sekali,&nbsp;dan&nbsp;tim&nbsp;ketiga&nbsp;latihan&nbsp;6&nbsp;hari&nbsp;sekali.&nbsp;Jika&nbsp;tanggal&nbsp;1&nbsp;Desember&nbsp;2000&nbsp;ketiga&nbsp;tim&nbsp;itu&nbsp;mengadakan&nbsp;latihan&nbsp;bersama,&nbsp;mereka&nbsp;akan&nbsp;latihan&nbsp;bersama&nbsp;lagi&nbsp;pada&nbsp;tanggal...</li><li>Jika&nbsp;suatu&nbsp;bilangan&nbsp;dikali&nbsp;dengan&nbsp;5,&nbsp;maka&nbsp;hasilnya&nbsp;sama&nbsp;dengan&nbsp;jumlah&nbsp;bilangan&nbsp;tersebut&nbsp;dengan&nbsp;20.&nbsp;Berapa&nbsp;bilangan&nbsp;tersebut?</li><li>Bu&nbsp;Indra&nbsp;akan&nbsp;memberikan&nbsp;24&nbsp;buah&nbsp;mangga&nbsp;dan&nbsp;16&nbsp;buah&nbsp;jeruk&nbsp;kepada&nbsp;beberapa&nbsp;orang&nbsp;siswa.&nbsp;Jika&nbsp;setiap&nbsp;siswa&nbsp;harus&nbsp;memperoleh&nbsp;bagian&nbsp;yang&nbsp;sama&nbsp;banyak&nbsp;untuk&nbsp;setiap&nbsp;jenis,&nbsp;paling&nbsp;banyak&nbsp;berapa&nbsp;orang&nbsp;siswa&nbsp;yang&nbsp;akan&nbsp;mendapat&nbsp;buah&nbsp;tersebut?</li><li>Diketahui&nbsp;lebar&nbsp;sebuah&nbsp;persegi&nbsp;panjang&nbsp;dinyatakan&nbsp;dalam&nbsp;x&nbsp;cm&nbsp;dan&nbsp;panjangnya&nbsp;3&nbsp;cm&nbsp;lebih&nbsp;panjang&nbsp;dari&nbsp;lebar.&nbsp;Jika&nbsp;kelilingnya&nbsp;adalah&nbsp;24&nbsp;cm,&nbsp;maka&nbsp;berapa&nbsp;lebar&nbsp;persegi&nbsp;panjang&nbsp;tersebut?</li><li>Diketahui&nbsp;umur&nbsp;Bounty&nbsp;sekarang&nbsp;adalah&nbsp;5&nbsp;tahun&nbsp;lebih&nbsp;tua&nbsp;dari&nbsp;umur&nbsp;Naja&nbsp;sekarang.&nbsp;Jika&nbsp;umur&nbsp;keduanya&nbsp;adalah&nbsp;45&nbsp;tahun,&nbsp;maka&nbsp;umur&nbsp;Bounty&nbsp;pada&nbsp;10&nbsp;tahun&nbsp;yang&nbsp;akan&nbsp;datang&nbsp;adalah...</li></ol>', 'tugas', '2026-07-12 08:45:00', '2026-07-05 01:48:52');

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
(1, 'Admin Utama', 'admin', NULL, 0, 'admin', 'riyanwardhana2@gmail.com', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, '907875', '2026-07-05 01:45:31', '2026-05-17 11:35:44', '2026-07-05 01:40:31'),
(2, 'Budi', 'siswa', 1, 122, NULL, NULL, NULL, NULL, '1234', 'ABC123', NULL, NULL, '2026-05-17 11:35:44', '2026-05-28 03:45:34'),
(3, 'Riyan Wardhana', 'guru', NULL, 0, 'riyan22', 'nur23aisyah11@gmail.com', 'https://res.cloudinary.com/dbteh8sbe/image/upload/v1779897441/zwisbpk3n6nxnmrnwpda.jpg', '$2y$10$uD//dYpN70LzHzmgjGmC8u63aJIyJOywCeN9P2OlAh28PhU/JKpgK', NULL, NULL, NULL, NULL, '2026-05-17 16:01:19', '2026-07-28 05:52:42'),
(4, 'Riyan Wardhana', 'siswa', 1, 0, 'riyan607', NULL, NULL, NULL, '2205', NULL, NULL, NULL, '2026-05-28 03:49:49', '2026-06-16 08:37:52'),
(5, 'Riyan', 'siswa', 2, 0, 'riyan176', NULL, NULL, NULL, '2206', NULL, NULL, NULL, '2026-06-01 16:21:11', '2026-06-01 16:21:11'),
(6, 'Burhan', 'siswa', 1, 250, 'burhan499', NULL, NULL, NULL, '1504', NULL, NULL, NULL, '2026-06-29 03:36:47', '2026-07-05 15:55:03');

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `materi_media`
--
ALTER TABLE `materi_media`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `pengumpulan_tugas`
--
ALTER TABLE `pengumpulan_tugas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `rombel`
--
ALTER TABLE `rombel`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tugas_kuis`
--
ALTER TABLE `tugas_kuis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

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
