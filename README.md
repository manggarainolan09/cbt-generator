# 🎓 Generator CBT Pro & Studio Video Panduan

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](LICENSE)

Aplikasi pembuat ujian **CBT (Computer Based Test)** interaktif modern untuk sekolah, madrasah, dan perguruan tinggi di Indonesia. Menghasilkan **1 file tunggal `.HTML` mandiri** yang dapat dijalankan secara **offline** di laboratorium komputer maupun **online** melalui Google Sites, lengkap dengan integrasi **Google Sheets gratis** dan **Studio Video Panduan Interaktif**.

---

## 🌟 Fitur Utama

### 1. 🎬 Studio Video Panduan Interaktif
- **Pemutar Video Tutorial HD:** 6 bab materi terstruktur dari konfigurasi hingga publikasi file.
- **Suara Narasi Bahasa Indonesia:** Dilengkapi narasi suara otomatis (*Text-to-Speech*) dan takarir teks (*Closed Captions / CC*).
- **Tombol "Lompat & Praktekkan":** Membawa pengguna langsung ke modul yang sedang dipelajari dalam aplikasi.
- **Unduh Rangkuman Panduan:** Berisi lembar rangkuman panduan cepat format Markdown/PDF.

### 2. 📝 Bank Soal 6 Variasi & Rich Text Editor (Dukungan Copas Gambar & LaTeX)
- **Rich Text Editor Lengkap:** Dukungan salin-tempel gambar langsung dari clipboard (`Ctrl+V` / screenshot), drag-and-drop file gambar, serta tombol format teks tebal, miring, garis bawah, coret, dan kode.
- **Pilihan Ganda (PG):** 1 jawaban benar dengan opsi acak (*shuffle*).
- **Pilihan Ganda Kompleks (PGK):** Multi-jawaban benar dengan opsi penilaian parsial.
- **Benar / Salah (B/S):** Tabel pernyataan dengan kunci evaluasi kebenaran.
- **Menjodohkan:** Pasangan pernyataan kiri dan kanan (*matching pairs*).
- **Isian Singkat:** Pencocokan teks jawaban otomatis dengan dukungan banyak kata kunci alternatif (`kunci1|kunci2`).
- **Uraian / Essay:** Kotak uraian luas untuk evaluasi manual oleh guru.
- **Formula Matematika KaTeX:** Mendukung penulisan rumus LaTeX pecahan, pangkat, akar kuadrat, integral, matriks, dan simbol Yunani.

### 3. 👥 Manajemen Roster Siswa & Cetak Kartu A4
- **Dua Metode Autentikasi:**
  - *Mode Bebas:* Siswa mengetik Nama, Kelas, dan Asal Sekolah sendiri.
  - *Mode Login Akun:* Wajib memasukkan Username & Password terdaftar.
- **Impor Massal Excel (.xlsx / .csv):** Seret dan lepas (*drag & drop*) file data siswa dengan SheetJS.
- **Cetak Kartu Login A4:** Format cetak rapi 4 kartu per lembar kertas A4 lengkap dengan logo sekolah, nama siswa, kelas, username, password, dan token ruang.
- **Cetak Naskah Soal Kertas:** Cetak naskah soal tanpa kunci jawaban untuk cadangan tes berbasis kertas.

### 4. 🛡️ Keamanan Ujian & Anti-Kecurangan
- **Kunci Layar Penuh (Fullscreen Lock):** Memaksa browser masuk ke mode fullscreen saat ujian dimulai.
- **Pendeteksi Pergantian Tab:** Mencatat frekuensi siswa keluar fullscreen atau membuka aplikasi lain, dengan opsi pengakhiran otomatis jika melewati batas pelanggaran (*Max Tab Switches*).
- **Kamera Pengawas (Live Webcam Proctoring):** Memotret wajah siswa secara berkala menggunakan kamera perangkat dan mengirimkannya ke spreadsheet pengawas.
- **Anti-Salin & Anti-Klik Kanan:** Mencegah penyalinan teks soal dan inspeksi elemen.
- **Blokir Pengerjaan Ulang:** Mencegah siswa mengerjakan ulang setelah menekan tombol selesai.

### 5. 👮 Panel Pengawas Tersemat & Analisis Hasil Ujian Selengkap-lengkapnya
*Panel Pengawas terintegrasi langsung di dalam file HTML yang di-generate (klik tombol "👮 Masuk Panel Pengawas" pada halaman pembuka ujian):*
- **📡 Monitoring Realtime:** Pantau siswa aktif, belum login, sedang mengerjakan, atau telah selesai; rekam waktu aktif terakhir, progress pengerjaan butir, pelanggaran pindah tab, pratinjau foto webcam pengawas, tombol **Reset Login** dan **Reset Nilai**.
- **👥 Roster Peserta:** Cetak lembar akun resmi langsung dari peramban.
- **📊 Analisis Statistik & Psikometrik Selengkap-lengkapnya:**
  - **Statistik Deskriptif:** Mean, Median, Modus, Nilai Minimum, Nilai Maksimum, Jangkauan (Range), Variansi ($s^2$), Standar Deviasi ($s$), Kuartil 1 ($Q_1$), Kuartil 3 ($Q_3$), Jangkauan Antarkuartil ($IQR$), serta Persentase Kelulusan KKM.
  - **Histogram Sebaran Nilai:** Grafik batang 10 interval (0-9, 10-19, ..., 90-100).
  - **Distribusi Mutu Nilai:** Klasifikasi Grade A ($\ge 85$), B (75-84), C (65-74), D (50-64), dan E (<50).
  - **Komparasi Kinerja per Kelas:** Tabel komparasi mean, median, min, max, std dev, dan % kelulusan tiap kelas.
  - **Analisis Butir Soal (Item Analysis):** Tingkat kesukaran butir ($P$) berkategori Sukar/Sedang/Mudah, Daya Pembeda ($D$) metode kelompok atas 27% vs bawah 27% (Sangat Baik, Baik, Cukup, Jelek), dan Analisis Efektivitas Pengecoh/Distraktor opsi A, B, C, D.
  - **Matriks Diagnostik Jawaban Siswa:** Grid interaktif seluruh siswa $\times$ seluruh butir soal dengan status Benar ($✓$), Parsial ($◐$), Salah ($✗$), Kosong ($–$), dan Esai ($●$).
  - **Daftar Peringkat Nilai:** Peringkat nilai lengkap dengan rincian benar, salah, kosong, pelanggaran layar, dan foto verifikasi.
  - **Ekspor Dokumen Lengkap:**
    - 📊 **Excel 5-Sheets (.xlsx):** Sheet 1 Ringkasan Statistik, Sheet 2 Rekap per Kelas, Sheet 3 Analisis Butir Soal, Sheet 4 Matriks Jawaban, Sheet 5 Nilai & Peringkat Siswa.
    - 📄 **Laporan PDF Resmi:** Desain kop surat formal siap cetak via jsPDF & autoTable.
    - 📋 **Unduh CSV:** Format UTF-8 standar.

### 6. 🌐 Integrasi Google Sheets Gratis & Publikasi Mandiri
- **Tanpa Biaya Server:** Nilai dan monitoring siswa tersimpan aman di Google Spreadsheet milik sekolah via Google Apps Script (GAS).
- **1 File .HTML Mandiri:** Dapat dijalankan offline tanpa internet maupun disematkan online ke Google Sites sekolah.

---

## 🚀 Panduan Memulai Cepat (Quick Start)

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih tinggi
- npm / yarn / pnpm

### Instalasi & Menjalankan Lokal

```bash
# 1. Clone repositori ini
git clone https://github.com/username/generator-cbt-pro.git

# 2. Masuk ke direktori proyek
cd generator-cbt-pro

# 3. Instal dependensi
npm install

# 4. Jalankan server pengembangan
npm run dev
```

Buka peramban Anda di `http://localhost:3000`.

### Build untuk Produksi

```bash
npm run build
```

Hasil build siap saji akan berada di folder `dist/` dan dapat di-deploy ke Vercel, Netlify, Cloudflare Pages, atau GitHub Pages.

---

## 📂 Struktur Proyek

```text
├── index.html                   # HTML Entry Point & font stylesheets
├── metadata.json                # Metadata & permissions konfigurasi AI Studio
├── package.json                 # Daftar dependensi & scripts
├── tsconfig.json                # Konfigurasi TypeScript
├── vite.config.ts               # Konfigurasi Vite & Tailwind CSS v4
├── src/
│   ├── main.tsx                 # Titik masuk React
│   ├── App.tsx                  # Komponen utama & state manager
│   ├── index.css                # Global stylesheet & Tailwind setup
│   ├── types/
│   │   └── cbt.ts               # Tipe data TypeScript (Config, Question, Student)
│   ├── data/
│   │   ├── sampleExam.ts        # Paket contoh Asesmen TKA SD (21 soal berilustrasi)
│   │   └── videoChapters.ts     # Naskah & durasi 6 bab video panduan
│   ├── utils/
│   │   ├── gasCode.ts           # Generator kode backend Google Apps Script
│   │   ├── htmlGenerator.ts     # Kompiler file tunggal CBT (.HTML)
│   │   └── printUtils.ts        # Generator cetak kartu A4 & lembar soal
│   └── components/
│       ├── Navbar.tsx           # Navigasi atas (Top Bar Contract)
│       ├── VideoTutorialModal.tsx # Studio Video Panduan Interaktif
│       ├── ExamPreviewModal.tsx # Simulator ujian in-app (tampilan siswa)
│       ├── MathFormulaModal.tsx # Asisten rumus matematika KaTeX LaTeX
│       ├── QuestionPreviewModal.tsx # Pratinjau butir soal per nomor
│       └── tabs/
│           ├── GuideTab.tsx     # Tab panduan alur & peluncur video
│           ├── ConfigTab.tsx    # Tab pengaturan ujian, durasi & tema
│           ├── StudentsTab.tsx  # Tab roster siswa & impor Excel
│           ├── QuestionsTab.tsx # Tab kelola bank soal & media
│           ├── QuickImportTab.tsx # Tab impor cepat dari teks Word
│           ├── SheetsTab.tsx    # Tab konfigurasi Google Spreadsheet & GAS
│           └── GenerateTab.tsx  # Tab ekspor HTML & publikasi Google Sites
```

---

## 📋 Langkah Penggunaan

1. **Atur Ujian:** Tentukan judul asesmen, nama sekolah, durasi, KKM, token ruang, jadwal, serta warna tema.
2. **Kelola Peserta:** Pilih Mode Login Akun, impor daftar siswa dari file Excel template, lalu cetak Kartu Login resmi format A4.
3. **Susun Soal:** Buat soal melalui antarmuka editor visual atau tempel naskah pada tab Impor Teks. Manfaatkan modal LaTeX untuk rumus matematika dan sisipkan gambar stimulus.
4. **Hubungkan Google Sheets (Opsional):** Buat spreadsheet di [sheets.new](https://sheets.new), salin kode Apps Script, jalankan `setupDatabase`, lalu *Deploy sebagai Web App* dengan akses *Anyone*.
5. **Generate & Bagikan:** Uji coba alur ujian pada fitur **Simulasi Ujian**, lalu klik **Unduh File .HTML** untuk dibagikan ke siswa atau di-embed ke Google Sites sekolah.

---

## 🤝 Kontribusi

Kontribusi dan saran perbaikan sangat diterima! Silakan buka *Issue* atau kirimkan *Pull Request*.

1. Fork repositori ini
2. Buat branch fitur baru (`git checkout -b fitur/fitur-keren`)
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur keren'`)
4. Push ke branch Anda (`git push origin fitur/fitur-keren`)
5. Buka Pull Request

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi Apache 2.0. Lihat berkas `LICENSE` untuk informasi lebih lanjut.
