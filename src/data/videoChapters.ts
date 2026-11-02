import { VideoChapter } from '../types/cbt';

export const VIDEO_TUTORIAL_CHAPTERS: VideoChapter[] = [
  {
    id: 'ch-overview',
    number: '01',
    title: 'Pengenalan & Alur Kerja CBT',
    duration: 32,
    description: 'Gambaran umum cara kerja Generator CBT dari penyiapan soal hingga ujian berjalan mandiri.',
    targetTab: 'guide',
    narration: 'Selamat datang di Generator CBT Pro. Aplikasi ini memungkinkan Bapak dan Ibu Guru membuat paket ujian interaktif berbasis web tanpa perlu instalasi server rumit. Hasil generate berupa satu file HTML mandiri yang siap dibagikan ke siswa secara offline maupun online dengan sinkronisasi Google Sheets.',
    keyPoints: [
      'Menghasilkan 1 file HTML mandiri tanpa ketergantungan server rumit',
      'Bisa dijalankan offline lewat flashdisk atau online lewat Google Sites',
      'Dilengkapi proteksi fullscreen, anti-kecurangan, dan kamera proctoring',
      'Hasil ujian langsung masuk ke spreadsheet sekolah secara otomatis'
    ],
    screenType: 'overview',
    highlights: ['Alur: Atur → Peserta → Soal → Sync → Generate', 'Mendukung offline & online', 'Multi-perangkat laptop & smartphone']
  },
  {
    id: 'ch-config',
    number: '02',
    title: 'Pengaturan Ujian & Jadwal',
    duration: 38,
    description: 'Menyesuaikan identitas sekolah, durasi, KKM, token ujian, jadwal, serta warna tema.',
    targetTab: 'config',
    narration: 'Pada tab Pengaturan Ujian, tentukan judul asesmen, nama sekolah, mata pelajaran, serta durasi dalam menit. Anda juga bisa mengatur KKM, batas toleransi perpindahan tab, token ruang, dan mengunggah logo resmi sekolah. Jika ingin ujian dimulai serentak pada jam tertentu, aktifkan mode Penjadwalan Waktu.',
    keyPoints: [
      'Isi Judul, Sekolah, Mata Pelajaran, dan Durasi Ujian',
      'Atur Token Ruang opsional (misal: PAS2026 atau TKA2026)',
      'Tentukan batas maksimal keluar layar penuh (0 = tanpa batas)',
      'Pilih mode Bebas Kapan Saja atau Sesuai Jadwal Waktu dengan hitung mundur',
      'Unggah Logo Sekolah dan atur palet warna tema ujian'
    ],
    screenType: 'config',
    highlights: ['Form Identitas Ujian', 'Penjadwalan Tanggal & Jam', 'Batas Pindah Tab (Anti-Curang)', 'Kustomisasi Logo & Favicon']
  },
  {
    id: 'ch-students',
    number: '03',
    title: 'Kelola Peserta & Cetak Kartu A4',
    duration: 42,
    description: 'Memilih metode login bebas atau akun, impor Excel/CSV, dan cetak kartu akses peserta.',
    targetTab: 'students',
    narration: 'Tab Akun Peserta menyediakan dua opsi autentikasi: Mode Bebas di mana siswa mengetikkan identitasnya sendiri, atau Mode Login Akun dengan username dan password terdaftar. Anda dapat menambahkan siswa satu per satu, mengunggah file Excel berisi ratusan peserta secara instan, lalu mencetak Kartu Login rapi 4 kartu per lembar A4.',
    keyPoints: [
      'Pilih Mode Bebas atau Mode Login Akun',
      'Impor massal dari format Excel (.xlsx, .xls) atau CSV',
      'Unduh template Excel dengan kolom username, password, nama, kelas',
      'Cetak Kartu Login resmi format A4 berisi logo, kredensial, dan token ruang',
      'Siswa tidak bisa mengerjakan ulang setelah menekan tombol selesai'
    ],
    screenType: 'students',
    highlights: ['Pilihan Metode Login', 'Drag & Drop File Excel Siswa', 'Tombol Cetak Kartu Login A4', 'Tabel Manajemen Akun Siswa']
  },
  {
    id: 'ch-questions',
    number: '04',
    title: 'Bank Soal, Media & LaTeX',
    duration: 48,
    description: 'Membuat 6 tipe soal, format teks kaya, gambar stimulus, dan rumus matematika KaTeX.',
    targetTab: 'questions',
    narration: 'Generator CBT mendukung 6 jenis soal kurikulum merdeka dan ANBK: Pilihan Ganda biasa, PG Kompleks multi-jawaban, Benar/Salah, Menjodohkan, Isian Singkat, dan Uraian. Anda dapat menyisipkan ilustrasi gambar dan formula matematika LaTeX dengan menekan tombol rumus. Jangan lupa gunakan fitur Pratinjau untuk melihat tampilan soal di layar siswa.',
    keyPoints: [
      'Mendukung 6 tipe soal: PG, PGK, Benar/Salah, Menjodohkan, Isian, Uraian',
      'Sisipkan formula matematika pecahan, akar, integral dengan asisten LaTeX KaTeX',
      'Unggah gambar langsung dari perangkat atau gunakan tautan gambar',
      'Atur bobot skor dan penilaian parsial pada soal kompleks',
      'Periksa tampilan soal secara langsung dengan modal Pratinjau Soal',
      'Tersedia fitur Cetak Lembar Soal tanpa kunci untuk cadangan kertas'
    ],
    screenType: 'questions',
    highlights: ['Toolbar Editor Format Teks', 'Asisten Formula Matematika KaTeX', 'Upload Gambar Soal & Pilihan', 'Modal Pratinjau Tampilan Siswa']
  },
  {
    id: 'ch-sheets',
    number: '05',
    title: 'Integrasi Google Sheets & Pengawas',
    duration: 45,
    description: 'Menghubungkan aplikasi ujian ke spreadsheet gratis via Google Apps Script & monitoring langsung.',
    targetTab: 'sheets',
    narration: 'Untuk merekap nilai siswa secara otomatis, buka Google Sheets baru, buka menu Extensions ke Apps Script, lalu tempelkan kode yang disediakan Generator CBT. Deploy sebagai Web App dengan akses publik, lalu tempel URL-nya di sini. Guru dapat login ke Panel Pengawas untuk memantau progress siswa secara live dan melihat foto pengawasan kamera.',
    keyPoints: [
      'Buka Google Sheets di sheets.new dan salin kode Apps Script (GAS) 1-klik',
      'Jalankan fungsi setupDatabase untuk membuat tab Hasil dan Monitoring',
      'Deploy Web App dengan Execute as Me dan Who has access Anyone',
      'Uji koneksi dengan tombol Uji Koneksi dan Kirim Data Uji',
      'Pengawas dapat memantau status pengerjaan, mereset login, dan melihat foto proctoring'
    ],
    screenType: 'sheets',
    highlights: ['Salin Kode Google Apps Script', 'Uji Koneksi & Kirim Data Sampel', 'Konfigurasi Akun Pengawas', 'Monitoring Real-time Peserta']
  },
  {
    id: 'ch-generate',
    number: '06',
    title: 'Generate File CBT & Publikasi',
    duration: 36,
    description: 'Membuat file HTML mandiri, uji coba simulasi ujian, dan cara sematkan di Google Sites.',
    targetTab: 'generate',
    narration: 'Langkah terakhir adalah menekan tombol Hasilkan Kode HTML. Anda dapat langsung menguji alur login dan mengerjakan soal melalui tombol Pratinjau Ujian. Setelah yakin, unduh file .HTML untuk dibagikan via WhatsApp, Google Drive, atau disematkan ke Google Sites sekolah melalui kode embed. Siswa cukup membuka file tersebut di browser manapun.',
    keyPoints: [
      'Validasi kelengkapan ujian dilakukan otomatis sebelum file dibuat',
      'Coba pengerjaan langsung di tombol Pratinjau Ujian tanpa mengunduh',
      'Unduh file tunggal .HTML yang dapat dibuka langsung di Chrome/Edge/Firefox',
      'Gunakan panduan Embed Google Sites untuk publikasi online gratis',
      'Ujian otomatis mengunci layar penuh dan merekam aktivitas siswa'
    ],
    screenType: 'generate',
    highlights: ['Tombol 1-Klik Hasilkan Kode HTML', 'Simulasi Pratinjau Ujian Lengkap', 'Unduh File Mandiri .HTML', 'Panduan Publikasi Google Sites']
  }
];
