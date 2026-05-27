# LOGIN

Terdapat 3 Akun atau Role dari Website yang telah dibuat yaitu Siswa, Guru, Admin.

Sebelum kalian login harap ganti dulu email yang tertera dari akun/role GURU dan ADMIN dikarenakan emailnya masih menggunakan emailku di database, jadi harap ganti emailnya terlebih dulu karna ketika login Role ADMIN dan GURU diminta kode verifikasi yang dikirim via email.

- ROLE ADMIN:
  Username = admin
  password = password

- ROLE GURU:
  Username = riyan22
  password = riyan2206

- ROLE SISWA: abc123

## Catatan

Untuk saat ini SISWA login masih menggunakan kode statis yaitu abc123 nantinya ini akan kita buat dimanis yang dapat di buat oleh role GURU kemudian siswa dapat menggunakan kode yang telah dibuat.

# MODUL 1: PORTAL SISWA

Ini adalah bagian paling kritis dari keseluruhan sistem karena targetnya anak usia 6–12 tahun.
Desain harus terasa seperti "dunia petualangan belajar", bukan ruang kelas digital yang
membosankan.

## 1.1 Halaman Beranda Siswa ("Rumah Belajarku")

Tampilan beranda berbentuk peta dunia petualangan — bukan daftar menu biasa. Setiap mata
pelajaran ditampilkan sebagai "wilayah" atau "pulau" di peta (misalnya Pulau Matematika,
Hutan Bahasa Indonesia, Kota Sains). Siswa mengklik wilayah tersebut untuk masuk ke materi.
Di pojok layar terdapat avatar siswa yang bisa dikustomisasi (pilih karakter, baju, aksesori)
sebagai motivasi personal. Terdapat juga papan notifikasi bergambar yang menampilkan tugas
baru, pengumuman, dan pencapaian terbaru.

## 1.2 Sistem Poin & Gamifikasi ("Bintang Belajar")

Ini adalah fitur motivasi utama. Setiap aktivitas memberikan reward:

- Membaca materi → dapat koin bintang
- Mengerjakan latihan soal → dapat poin XP
- Nilai bagus di kuis → dapat lencana (badge) khusus
- Hadir belajar online saat kondisi darurat → dapat badge "Pejuang Belajar"
- Menyelesaikan semua tugas mingguan → dapat trofi

  Sistem level karakter: siswa naik level dari "Benih Ilmu" → "Tunas Cerdas" → "Pohon
  Pengetahuan" → "Bintang Literasi". Setiap naik level, avatar siswa berubah tampilan. Terdapat
  papan peringkat kelas (leaderboard) yang bisa dipantau semua siswa — ini mendorong
  kompetisi sehat. Namun perlu diperhatikan, leaderboard hanya menampilkan nama
  panggilan/avatar agar tidak mempermalukan siswa dengan nilai rendah.

## 1.3 Ruang Materi ("Perpustakaan Ajaib")

Materi pelajaran ditampilkan dalam format yang sangat visual:

- Video pembelajaran pendek (3–7 menit) dengan karakter animasi
- Buku digital interaktif yang bisa "dibolak-balik" dengan animasi halaman
- Infografis bergambar yang bisa di-zoom
- Audio narasi untuk setiap materi (penting untuk siswa kelas 1–2 yang masih belajar
  membaca)
- Teks yang bisa diperbesar ukurannya untuk kenyamanan membaca
  Setiap materi dilengkapi tombol "Coba di AR!" yang membuka pengalaman Augmented Reality
  langsung di browser tanpa perlu mengunduh aplikasi (WebAR). Misalnya, materi tentang tata
  surya langsung menampilkan planet-planet yang berputar di atas meja ketika kamera dibuka.

## 1.4 Modul AR Interaktif ("Dunia Ajaib AR")

Ini adalah fitur unggulan yang membedakan LMS ini dari yang lain. Menggunakan teknologi
WebAR (berbasis browser, tidak perlu install aplikasi), siswa cukup membuka halaman dan
mengizinkan akses kamera.
Contoh konten AR yang bisa dikembangkan sesuai kurikulum SD:

- AR Siklus Air: menampilkan animasi 3D siklus hujan, penguapan, dan awan di atas meja
- AR Anatomi Tubuh: organ tubuh manusia bisa diputar dan diklik untuk melihat
  fungsinya
- AR Bangun Ruang: kubus, balok, tabung bisa dimanipulasi ukurannya secara langsung
- AR Ekosistem: hutan, sawah, laut muncul di atas marker cetak untuk melihat rantai
  makanan
- AR Bencana Banjir (kontekstual): animasi edukatif tentang penyebab banjir dan cara
  menghadapinya — sangat relevan dengan kondisi sekolah mitra
  Setiap sesi AR dilengkapi pertanyaan singkat setelah interaksi ("Apa yang kamu lihat tadi? Pilih
  jawabannya!") untuk memastikan ada pemahaman, bukan sekadar hiburan.

## 1.5 Ruang Latihan & Kuis ("Arena Tantangan")

Tampilan kuis dibuat seperti game show atau kuis anak-anak di televisi:

- Soal pilihan ganda dengan ilustrasi gambar yang besar
- Timer berbentuk lingkaran yang berputar dengan efek suara lembut
- Animasi tepuk tangan atau bintang jatuh ketika jawaban benar
- Karakter maskot yang memberikan semangat saat jawaban salah ("Hampir benar! Coba
  lagi!")
- Soal bergambar untuk siswa kelas rendah (kelas 1–3)
  Tipe soal yang tersedia: pilihan ganda bergambar, menjodohkan (drag and drop), isian singkat
  dengan keyboard virtual, dan soal cerita (literasi) dengan teks bergambar.
  Bank soal literasi dirancang mengacu pada kerangka PISA yang diadaptasi untuk SD —
  pertanyaan berbasis bacaan pendek dengan konteks kehidupan nyata anak-anak Indonesia (jajan
  di warung, bermain di sungai, membantu orang tua, dan sebagainya).

## 1.6 Kotak Tugas ("Misi Belajar")

Tugas-tugas ditampilkan seperti daftar misi dalam game:

- Setiap tugas memiliki ikon, judul menarik, dan tenggat waktu bergambar kalender
- Status tugas: Misi Baru (biru), Sedang Dikerjakan (kuning), Selesai (hijau dengan tanda
  centang bintang), Terlambat (merah lembut)
- Pengumpulan tugas bisa berupa teks, foto (siswa bisa foto hasil kerja tulis tangan), atau
  audio rekaman suara untuk siswa yang belum lancar mengetik
- Sistem pengingat otomatis: notifikasi push atau pesan di dalam aplikasi 1 hari dan 1 jam
  sebelum tenggat waktu

## 1.7 Mode Darurat ("Belajar dari Rumah")

Ini adalah fitur khusus yang lahir langsung dari konteks banjir di proposal. Ketika sekolah
diumumkan libur darurat, admin mengaktifkan "Mode Darurat" yang langsung mengubah
tampilan beranda siswa menjadi mode belajar mandiri. Fitur yang diaktifkan dalam mode ini:

- Materi dapat diunduh untuk dibaca offline (cache di browser)
- Kuis darurat dengan soal ringan yang tetap bisa dikerjakan tanpa koneksi penuh
- Pesan semangat dari guru yang muncul otomatis
- Badge khusus "Tetap Semangat Belajar" untuk siswa yang tetap aktif saat darurat

## 1.8 Pesan & Komunikasi ("Kotak Surat")

Fitur komunikasi sederhana yang aman untuk anak SD:

- Siswa hanya bisa menerima pesan dari guru, tidak bisa mengirim pesan bebas
- Siswa bisa mengirim pertanyaan ke guru dengan memilih dari kategori pertanyaan yang
  sudah tersedia (untuk keamanan konten)
- Notifikasi tugas baru, nilai keluar, dan pengumuman kelas masuk ke kotak ini

# MODUL 2: PORTAL GURU

Guru SD umumnya tidak terbiasa dengan software kompleks, sehingga desain portal guru harus
bersih, navigasi langsung ke poin, dan tidak membutuhkan banyak klik untuk menyelesaikan
satu tugas.

## 2.1 Dasbor Guru ("Meja Kerja Digital")

Beranda guru menampilkan ringkasan yang langsung actionable:

- Jumlah siswa aktif hari ini vs total siswa
- Tugas yang belum dikoreksi (dengan tombol "Koreksi Sekarang" langsung)
- Kuis yang sedang berjalan dan hasil sementaranya
- Grafik sederhana perkembangan kelas minggu ini
- Tombol cepat: Buat Tugas Baru, Mulai Kuis, Tambah Materi, Kirim Pengumuman

## 2.2 Manajemen Materi ("Papan Materi")

Guru bisa membuat dan mengelola materi dengan editor yang mudah:

- Editor WYSIWYG (What You See Is What You Get) — mirip seperti menulis di Google
  Docs, tidak perlu kode apapun
- Upload video dari perangkat atau embed dari YouTube
- Upload file PDF, gambar, dan presentasi
- Tombol "Tambahkan Konten AR" yang menghubungkan materi dengan objek AR yang
  sudah tersedia di library
- Pengaturan visibilitas: kapan materi mulai tampil ke siswa dan berapa lama
- Fitur duplikasi materi untuk kelas berbeda sehingga guru tidak perlu membuat ulang

## 2.3 Manajemen Tugas & Evaluasi

Membuat tugas dirancang semudah mengisi formulir:

- Pilih jenis tugas: kuis otomatis, tugas unggah file, tugas teks, atau tugas foto
- Atur tenggat waktu dengan kalender visual
- Pilih siswa atau kelas yang mendapat tugas
- Untuk kuis: buat soal dengan editor soal yang mendukung penambahan gambar ke setiap
  pertanyaan
- Fitur koreksi otomatis untuk pilihan ganda — guru tidak perlu menilai manual
- Untuk tugas esai atau foto: guru menilai dengan slider nilai dan komentar teks atau voice
  note

## 2.4 Bank Soal Literasi ("Gudang Soal")

Ini adalah fitur strategis yang sangat relevan dengan proposal. Terdapat library soal literasi yang
dikategorikan berdasarkan:

- Kelas (1–6)
- Tema teks (alam, lingkungan, keluarga, bencana, kesehatan, dll)
- Jenis kemampuan literasi (memahami informasi tersurat, menyimpulkan, mengevaluasi)
- Tingkat kesulitan
  Guru bisa mengambil soal dari bank dan memasukkannya ke kuis, atau membuat soal baru dan
  menyimpannya ke bank agar bisa dipakai kembali. Soal yang dibuat melalui Workshop Prompt
  Engineering AI akan langsung tersimpan di bank soal ini.

## 2.5 Integrasi AI Assistant ("Asisten Guru AI")

Ini adalah fitur inovatif yang langsung menjawab kebutuhan proposal tentang Prompt
Engineering. Guru memiliki akses ke asisten berbasis AI yang membantu:

- Generator Soal Literasi: Guru memasukkan topik atau teks bacaan, AI menghasilkan
  5–10 soal pilihan ganda berbasis literasi yang siap pakai. Guru tinggal mengedit jika
  perlu.
- Generator Teks Bacaan: Guru menentukan tema, kelas, dan panjang teks, AI membuat
  teks bacaan yang sesuai.
- Saran Media Pembelajaran: Guru mengetikkan topik, AI menyarankan jenis media
  yang cocok (video, infografis, AR, dll).
- Penyederhanaan Bahasa: Guru paste teks dari buku, AI menyederhanakannya agar
  sesuai level baca siswa SD.
- Fitur ini dibuat dengan antarmuka chat yang mudah — guru mengetik perintah dalam
  bahasa Indonesia sehari-hari, tidak perlu memahami teknis AI.

## 2.6 Pemantauan Siswa ("Laporan Kelas")

Guru bisa memantau perkembangan setiap siswa:

- Grafik nilai per siswa per mata pelajaran
- Rekap kehadiran belajar online
- Siswa mana yang belum mengerjakan tugas (dengan tombol kirim pengingat langsung)
- Siswa mana yang paling banyak berinteraksi dengan konten AR
- Ekspor laporan ke PDF atau Excel untuk dilaporkan ke kepala sekolah

## 2.7 Mode Siaran Smartboard ("Layar Kelas")

Fitur khusus untuk digunakan saat pembelajaran tatap muka di kelas dengan Smartboard. Guru
mengaktifkan "Mode Smartboard" yang mengubah tampilan menjadi layar presentasi besar:

- Materi tampil dalam format layar penuh yang mudah dibaca dari belakang kelas
- Kuis kelas langsung: semua siswa menjawab bersamaan dari gawai masing-masing, dan
  hasilnya tampil real-time di Smartboard (seperti Kahoot, tapi terintegrasi penuh)
- Demo AR ditampilkan di Smartboard untuk seluruh kelas melihat bersama

# MODUL 3: PORTAL KEPALA SEKOLAH & ADMIN

## 3.1 Dasbor Monitoring Sekolah

Tampilan executive dashboard yang memberikan gambaran menyeluruh:

- Statistik keaktifan belajar seluruh siswa dalam seminggu terakhir
- Perbandingan nilai rata-rata antar kelas
- Guru mana yang paling aktif membuat konten
- Materi dan kuis mana yang paling banyak diakses siswa
- Grafik tren penggunaan platform dari bulan ke bulan

## 3.2 Manajemen Pengguna

Admin bisa mengelola akun seluruh pengguna: menambahkan siswa baru, menonaktifkan akun,
mengatur kelas, dan mereset password. Untuk kemudahan, tersedia fitur import data siswa dari
file Excel/CSV sehingga tidak perlu input satu per satu.

## 3.3 Manajemen Mode Darurat

Kepala sekolah atau admin dapat mengaktifkan Mode Darurat dengan satu tombol — langsung
mengubah seluruh sistem ke mode belajar dari rumah. Bisa juga dijadwalkan otomatis
berdasarkan kalender (misalnya jika ada prediksi cuaca buruk).

## 3.4 Laporan & Dokumentasi

Semua aktivitas pembelajaran terdokumentasi otomatis dan bisa diunduh sebagai laporan:

- Laporan penggunaan LMS bulanan
- Laporan capaian pembelajaran per kelas
- Laporan keaktifan guru
- Dokumentasi ini sangat berguna untuk laporan akhir kegiatan pengabdian masyarakat
  kepada pihak perguruan tinggi.

# MODUL 4: RUANG WORKSHOP AI & PROMPT ENGINEERING

Ini adalah modul unik yang membedakan platform ini secara signifikan dari LMS biasa. Modul
ini ditujukan khusus untuk guru sebagai ruang belajar dan praktik mandiri.

## 4.1 Kursus Dasar AI untuk Guru

Modul pembelajaran mandiri berisi:

- Video singkat (5–10 menit) tentang apa itu AI, bagaimana cara kerjanya secara
  sederhana, dan bagaimana menggunakannya secara etis
- Contoh kasus nyata penggunaan AI di pendidikan dasar
- Panduan etika penggunaan AI: apa yang boleh dan tidak boleh dilakukan
- Kuis pemahaman singkat di akhir setiap sesi

## 4.2 Laboratorium Prompt Engineering ("Studio Guru")

Ini adalah ruang praktik langsung. Guru bisa mencoba membuat prompt dan melihat hasilnya
secara real-time:

- Tersedia template prompt siap pakai yang bisa dimodifikasi (misalnya: "Buatkan teks
  bacaan tentang [topik] untuk siswa kelas [X] dengan panjang [Y] kata yang mengandung
  pertanyaan literasi tentang [aspek]")
- Koleksi prompt terbaik yang sudah divalidasi oleh tim pengabdian tersimpan di
  "Perpustakaan Prompt" dan bisa dipakai semua guru
- Guru bisa menyimpan prompt buatan sendiri dan berbagi ke sesama guru di sekolah
- Histori percakapan tersimpan sehingga guru bisa kembali ke sesi sebelumnya

## 4.3 Generator Instrumen Literasi Berbasis PISA

Fitur khusus yang paling kuat: guru memasukkan parameter (tema teks, kelas, jumlah soal, jenis
pertanyaan literasi yang diinginkan), sistem menghasilkan instrumen literasi lengkap dengan
teks bacaan + soal-soal berbasis pemahaman yang diadaptasi dari kerangka literasi PISA untuk
SD. Hasilnya langsung bisa diedit, disimpan ke bank soal, dan dijadikan kuis.

# Fitur Lintas Modul (Cross-cutting Features)

- Notifikasi Cerdas: Sistem mengirimkan notifikasi yang tepat sasaran — siswa mendapat
  pengingat tugas, guru mendapat info ada siswa yang butuh perhatian (nilai terus menurun), dan
  kepala sekolah mendapat laporan mingguan otomatis.
- Aksesibilitas & Inklusivitas: Ukuran font bisa diperbesar, kontras warna tinggi untuk
  keterbacaan, dukungan audio narasi untuk siswa yang kesulitan membaca, dan antarmuka yang
  bekerja baik di layar kecil (smartphone murah) hingga layar besar (Smartboard).
- Keamanan Data Anak: Karena targetnya anak-anak, sistem tidak mengumpulkan data pribadi
  yang berlebihan. Login siswa menggunakan kode unik yang diberikan guru, tidak memerlukan
  email atau nomor telepon. Tidak ada fitur komunikasi bebas antar siswa.
- Performa Ringan: Mengingat koneksi internet di daerah bisa tidak stabil, semua halaman harus
  dirancang ringan. Gambar dikompres otomatis, video di-stream adaptif (kualitas menyesuaikan
  kecepatan internet), dan fitur Service Worker memungkinkan sebagian konten tetap bisa diakses
  saat offline.
- Dukungan Multi-perangkat: Tampilan responsif yang optimal di smartphone (portrait dan
  landscape), tablet, laptop, dan Smartboard. Khusus Smartboard, tersedia mode layar penuh yang
  mengoptimalkan ukuran teks dan tombol untuk interaksi layar sentuh besar.
