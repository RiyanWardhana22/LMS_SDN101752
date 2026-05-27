# LOGIN

Terdapat 3 Akun atau Role dari Website yang telah dibuat yaitu Siswa, Guru, Admin.

Sebelum kalian login harap ganti dulu email yang tertera dari akun/role GURU dan ADMIN dikarenakan emailnya masih menggunakan emailku di database, jadi harap ganti emailnya terlebih dulu karna ketika login Role ADMIN dan GURU diminta kode verifikasi yang dikirim via emai.

- ROLE ADMIN:
  Username = admin
  password = password

- ROLE GURU:
  Username = gurudemo
  password = password

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
