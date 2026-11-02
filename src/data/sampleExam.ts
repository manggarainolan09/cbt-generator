import { AppState } from '../types/cbt';

function sampleSVGData(svg: string): string {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function samplePieSVGData(): string {
  let sectors = '';
  for (let i = 0; i < 8; i++) {
    const start = (-90 + i * 45) * Math.PI / 180;
    const end = (-90 + (i + 1) * 45) * Math.PI / 180;
    const x1 = 90 + 64 * Math.cos(start);
    const y1 = 82 + 64 * Math.sin(start);
    const x2 = 90 + 64 * Math.cos(end);
    const y2 = 82 + 64 * Math.sin(end);
    sectors += `<path d="M90 82 L${x1.toFixed(1)} ${y1.toFixed(1)} A64 64 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${i < 3 ? '#f97316' : '#fde68a'}" stroke="#ffffff" stroke-width="3"/>`;
  }
  return sampleSVGData(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="190" viewBox="0 0 240 190">
      <rect width="240" height="190" rx="16" fill="#fff7ed"/>
      <text x="120" y="22" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="#7c2d12">Kue dipotong menjadi 8 bagian</text>
      <g transform="translate(30 12)">${sectors}</g>
      <text x="120" y="176" text-anchor="middle" font-family="Arial" font-size="12" fill="#475569">3 bagian telah dimakan</text>
    </svg>`
  );
}

export function getSampleSDData(): AppState {
  const imgGarden = sampleSVGData(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="250" viewBox="0 0 640 250">
      <rect width="640" height="250" rx="18" fill="#e0f2fe"/>
      <circle cx="548" cy="48" r="24" fill="#fbbf24"/>
      <path d="M0 176 Q150 140 290 178 T640 165 V250 H0Z" fill="#86efac"/>
      <rect x="42" y="74" width="178" height="99" rx="5" fill="#fef3c7" stroke="#92400e" stroke-width="3"/>
      <path d="M30 78 L130 22 L230 78Z" fill="#b45309"/>
      <rect x="112" y="112" width="42" height="61" fill="#92400e"/>
      <rect x="58" y="98" width="35" height="30" fill="#bae6fd"/>
      <rect x="167" y="98" width="35" height="30" fill="#bae6fd"/>
      <path d="M262 195 h310" stroke="#854d0e" stroke-width="5"/>
      <path d="M286 194 v-42 q22-28 44 0 v42 M382 194 v-52 q25-32 50 0 v52 M484 194 v-38 q24-30 48 0 v38" fill="#22c55e" stroke="#15803d" stroke-width="3"/>
      <path d="M264 215 h310" stroke="#a16207" stroke-width="14" stroke-dasharray="3 7"/>
      <text x="130" y="62" text-anchor="middle" font-family="Arial" font-size="14" font-weight="700" fill="#fff">SD TUNAS</text>
      <text x="420" y="48" text-anchor="middle" font-family="Arial" font-size="16" font-weight="700" fill="#166534">KEBUN RESAPAN</text>
      <text x="420" y="238" text-anchor="middle" font-family="Arial" font-size="12" fill="#713f12">Air hujan diarahkan ke tanah dan tanaman</text>
    </svg>`
  );

  const imgStory = sampleSVGData(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="250" viewBox="0 0 640 250">
      <rect width="640" height="250" rx="18" fill="#f0f9ff"/>
      <rect y="184" width="640" height="66" fill="#bbf7d0"/>
      <path d="M60 183 V70 H580 V183" fill="#fff" stroke="#94a3b8" stroke-width="5"/>
      <rect x="95" y="90" width="175" height="92" fill="#dbeafe" stroke="#60a5fa" stroke-width="4"/>
      <rect x="370" y="90" width="150" height="92" fill="#fef3c7" stroke="#f59e0b" stroke-width="4"/>
      <circle cx="320" cy="145" r="24" fill="#fbbf24"/>
      <path d="M298 147 q22-36 44 0 v43 h-44Z" fill="#2563eb"/>
      <circle cx="320" cy="111" r="17" fill="#f5c99b"/>
      <path d="M306 107 q3-25 28-14 l6 17" fill="#7c2d12"/>
      <path d="M320 190 q-30 10-46 30 M320 190 q34 4 54 28" stroke="#166534" stroke-width="5"/>
      <path d="M374 182 q22-16 46 0" stroke="#16a34a" stroke-width="5"/>
      <circle cx="431" cy="171" r="8" fill="#f97316"/>
      <circle cx="448" cy="178" r="7" fill="#f97316"/>
      <text x="320" y="34" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#1e3a8a">Lani membantu anak burung dengan hati-hati</text>
      <text x="182" y="207" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Jendela ruang kelas</text>
    </svg>`
  );

  const imgCup = sampleSVGData(
    `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="210" viewBox="0 0 280 210">
      <rect width="280" height="210" rx="16" fill="#eff6ff"/>
      <text x="140" y="28" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#1e3a8a">Gelas ukur 1 liter</text>
      <path d="M92 48 H188 L176 174 Q140 188 104 174Z" fill="#ffffff" stroke="#475569" stroke-width="4"/>
      <path d="M104 116 H176 L171 169 Q140 180 109 169Z" fill="#38bdf8" opacity=".8"/>
      <path d="M188 75 h22 M185 98 h25 M181 121 h29 M178 145 h32" stroke="#475569" stroke-width="3"/>
      <text x="222" y="102" font-family="Arial" font-size="12" fill="#334155">1 L</text>
      <text x="140" y="151" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#075985">1/2 L</text>
      <text x="140" y="198" text-anchor="middle" font-family="Arial" font-size="12" fill="#475569">Isi awal</text>
    </svg>`
  );

  const imgPlot = sampleSVGData(
    `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="240" viewBox="0 0 420 240">
      <rect width="420" height="240" rx="16" fill="#f0fdf4"/>
      <text x="210" y="28" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#14532d">Denah kebun sekolah</text>
      <rect x="100" y="62" width="220" height="125" rx="4" fill="#bbf7d0" stroke="#166534" stroke-width="4"/>
      <path d="M155 62 v125 M210 62 v125 M265 62 v125 M100 124 h220" stroke="#86efac" stroke-width="3"/>
      <path d="M100 202 h220 M82 62 v125" stroke="#334155" stroke-width="2"/>
      <text x="210" y="222" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155">12 m</text>
      <text x="47" y="128" text-anchor="middle" font-family="Arial" font-size="13" fill="#334155" transform="rotate(-90 47 128)">8 m</text>
      <circle cx="130" cy="90" r="10" fill="#f97316"/>
      <circle cx="185" cy="90" r="10" fill="#f97316"/>
      <circle cx="240" cy="90" r="10" fill="#f97316"/>
      <circle cx="295" cy="90" r="10" fill="#f97316"/>
    </svg>`
  );

  const imgVisitors = sampleSVGData(
    `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="270" viewBox="0 0 460 270">
      <rect width="460" height="270" rx="16" fill="#fff"/>
      <text x="230" y="28" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#0f172a">Pengunjung Perpustakaan</text>
      <path d="M60 48 V218 H420" fill="none" stroke="#475569" stroke-width="2"/>
      <g stroke="#cbd5e1" stroke-width="1">
        <path d="M60 178 H420 M60 138 H420 M60 98 H420 M60 58 H420"/>
      </g>
      <g fill="#0e7490">
        <rect x="90" y="118" width="48" height="100"/>
        <rect x="170" y="68" width="48" height="150"/>
        <rect x="250" y="93" width="48" height="125"/>
        <rect x="330" y="143" width="48" height="75"/>
      </g>
      <g font-family="Arial" font-size="12" fill="#334155" text-anchor="middle">
        <text x="114" y="112">12</text>
        <text x="194" y="62">18</text>
        <text x="274" y="87">15</text>
        <text x="354" y="137">9</text>
        <text x="114" y="239">Sen</text>
        <text x="194" y="239">Sel</text>
        <text x="274" y="239">Rab</text>
        <text x="354" y="239">Kam</text>
      </g>
      <text x="23" y="130" font-family="Arial" font-size="11" fill="#475569" transform="rotate(-90 23 130)">Jumlah siswa</text>
    </svg>`
  );

  let gridCells = '';
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      gridCells += `<rect x="${72 + c * 43}" y="${48 + r * 35}" width="37" height="29" rx="4" fill="${r === 0 ? '#fb923c' : '#e2e8f0'}" stroke="#64748b"/>`;
    }
  }
  const imgGrid = sampleSVGData(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="220" viewBox="0 0 300 220">
      <rect width="300" height="220" rx="16" fill="#fff7ed"/>
      <text x="150" y="28" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#7c2d12">Petak bibit cabai</text>
      ${gridCells}
      <text x="150" y="208" text-anchor="middle" font-family="Arial" font-size="12" fill="#475569">4 dari 16 petak berwarna</text>
    </svg>`
  );

  const imgCube = sampleSVGData(
    `<svg xmlns="http://www.w3.org/2000/svg" width="280" height="220" viewBox="0 0 280 220">
      <rect width="280" height="220" rx="16" fill="#eff6ff"/>
      <text x="140" y="28" text-anchor="middle" font-family="Arial" font-size="15" font-weight="700" fill="#1e3a8a">Kubus satuan</text>
      <path d="M82 82 L140 50 L198 82 L140 115Z" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="3"/>
      <path d="M82 82 V151 L140 184 V115Z" fill="#60a5fa" stroke="#1d4ed8" stroke-width="3"/>
      <path d="M140 115 V184 L198 151 V82Z" fill="#2563eb" stroke="#1d4ed8" stroke-width="3"/>
      <text x="140" y="207" text-anchor="middle" font-family="Arial" font-size="12" fill="#334155">Rusuk 4 cm</text>
    </svg>`
  );

  return {
    cfg: {
      title: 'Tes Kemampuan Akademik (TKA) - Jenjang SD',
      school: 'SD Negeri 01 Nusantara',
      subject: 'TKA SD - Literasi Bahasa Indonesia & Numerasi Matematika',
      duration: 90,
      kkm: 70,
      token: 'TKA2026',
      maxSw: 3,
      instr: 'Bacalah setiap stimulus dengan cermat dan gunakan informasi pada teks atau gambar untuk menjawab. Ujian berjalan dalam mode layar penuh. Dilarang membuka tab lain atau keluar dari layar penuh.',
      shuffleQ: true,
      shuffleO: true,
      show: true,
      noCopy: true,
      camera: false,
      authMode: 'list',
      syncEnabled: false,
      sheetUrl: '',
      syncToken: '',
      ministry: 'Kementerian Pendidikan Dasar dan Menengah',
      logo: 'https://tka.kemendikdasmen.go.id/assets/img/logo.png',
      icon: '',
      themePrimary: '#4f46e5',
      themeBackground: '#f8fafc',
      adminUser: 'pengawas',
      adminPass: 'pengawas2026',
      scheduleMode: 'full',
      scheduleDate: '',
      scheduleStartTime: '',
      scheduleEndTime: '',
      editorType: 'builtin'
    },
    students: [
      { u: 'siswa01', p: '12345', n: 'Ahmad Fauzi', k: 'VI-A' },
      { u: 'siswa02', p: '12345', n: 'Siti Nurhaliza', k: 'VI-A' },
      { u: 'siswa03', p: '12345', n: 'Budi Santoso', k: 'VI-A' },
      { u: 'siswa04', p: '12345', n: 'Dewi Lestari', k: 'VI-A' },
      { u: 'siswa05', p: '12345', n: 'Rizky Pratama', k: 'VI-A' },
      { u: 'siswa06', p: '12345', n: 'Nabila Putri', k: 'VI-A' },
      { u: 'siswa07', p: '12345', n: 'Farhan Maulana', k: 'VI-A' },
      { u: 'siswa08', p: '12345', n: 'Anisa Rahma', k: 'VI-A' },
      { u: 'siswa09', p: '12345', n: 'Dimas Saputra', k: 'VI-A' },
      { u: 'siswa10', p: '12345', n: 'Zahra Aulia', k: 'VI-A' },
      { u: 'siswa11', p: '12345', n: 'Eko Prasetyo', k: 'VI-B' },
      { u: 'siswa12', p: '12345', n: 'Indah Permata', k: 'VI-B' },
      { u: 'siswa13', p: '12345', n: 'Fajar Ramadhan', k: 'VI-B' },
      { u: 'siswa14', p: '12345', n: 'Melati Sari', k: 'VI-B' },
      { u: 'siswa15', p: '12345', n: 'Raka Wijaya', k: 'VI-B' },
      { u: 'siswa16', p: '12345', n: 'Putri Amelia', k: 'VI-B' },
      { u: 'siswa17', p: '12345', n: 'Aditya Nugraha', k: 'VI-B' },
      { u: 'siswa18', p: '12345', n: 'Safira Dewi', k: 'VI-B' },
      { u: 'siswa19', p: '12345', n: 'Bagas Setiawan', k: 'VI-B' },
      { u: 'siswa20', p: '12345', n: 'Kirana Ayu', k: 'VI-B' },
      { u: 'siswa21', p: '12345', n: 'Yusuf Hidayat', k: 'VI-C' },
      { u: 'siswa22', p: '12345', n: 'Aisyah Putri', k: 'VI-C' },
      { u: 'siswa23', p: '12345', n: 'Reza Firmansyah', k: 'VI-C' },
      { u: 'siswa24', p: '12345', n: 'Tiara Mulyani', k: 'VI-C' },
      { u: 'siswa25', p: '12345', n: 'Aldi Kurniawan', k: 'VI-C' },
      { u: 'siswa26', p: '12345', n: 'Salma Nabila', k: 'VI-C' },
      { u: 'siswa27', p: '12345', n: 'Bayu Pangestu', k: 'VI-C' },
      { u: 'siswa28', p: '12345', n: 'Raisa Amalia', k: 'VI-C' },
      { u: 'siswa29', p: '12345', n: 'Naufal Hakim', k: 'VI-C' },
      { u: 'siswa30', p: '12345', n: 'Sekar Arum', k: 'VI-C' }
    ],
    qs: [
      {
        t: 'pg',
        q: '<b>[Bahasa Indonesia | Pemahaman Tekstual]</b> Bacalah teks berikut.<br><br>Setiap musim hujan, halaman SD Tunas sering tergenang. Air dari atap mengalir cepat ke selokan dan membawa tanah ke jalan. Pada bulan Oktober, kelas VI mengajak warga sekolah membuat kebun resapan di sudut halaman. Mereka menggemburkan tanah, menanam pandan, serai, dan bunga kertas, lalu menyusun batu kecil di jalur air. Air hujan dari talang diarahkan ke kebun itu, bukan langsung ke selokan. Bu Rini menjelaskan bahwa tanah dan akar membantu air meresap perlahan. Kebun ini juga membuat halaman lebih sejuk dan menarik kupu-kupu.<br><br><b>Gagasan utama teks tersebut adalah ...</b>',
        img: imgGarden,
        o: [
          'Kegiatan warga sekolah membuat dan merawat kebun resapan.',
          'Cara menanam bunga kertas saat musim kemarau.',
          'Penyebab kupu-kupu datang ke halaman sekolah.',
          'Perlombaan kebersihan antarkelas di SD Tunas.'
        ],
        a: 0,
        w: 2
      },
      {
        t: 'pg',
        q: '<b>[Bahasa Indonesia | Pemahaman Tekstual]</b> Berdasarkan teks dan gambar di atas, ke mana air dari talang diarahkan?',
        img: imgGarden,
        o: [
          'Langsung ke jalan raya utama.',
          'Ke tempat sampah terpilah.',
          'Ke kebun resapan di sudut halaman.',
          'Ke pot bunga di dalam ruang guru.'
        ],
        a: 2,
        w: 1
      },
      {
        t: 'pgk',
        q: '<b>[Bahasa Indonesia | Evaluasi dan Refleksi]</b> Berdasarkan bacaan, pilihlah tindakan yang sesuai agar kebun resapan tetap berfungsi optimal. <i>(Pilih semua yang benar)</i>',
        img: imgGarden,
        o: [
          'Membiarkan satu kelompok saja yang merawat setiap hari.',
          'Membuat jadwal perawatan tanaman dan pembersihan sampah secara bergiliran.',
          'Memeriksa saluran air dari talang dan mengganti tanaman yang layu.',
          'Menutup jalur air agar tanah tidak menjadi basah.'
        ],
        a: [1, 2],
        s: 'partial',
        w: 2
      },
      {
        t: 'pg',
        q: '<b>[Bahasa Indonesia | Pemahaman Cerita]</b> Bacalah cerita berikut.<br><br>Sabtu pagi, Lani membantu Pak Damar menyiram tanaman sekolah. Di bawah pohon jambu, ia menemukan seekor anak burung yang terjatuh dari sarang. Lani mulanya ingin membawanya pulang. Namun Pak Damar mengingatkan bahwa induknya mungkin sedang mencari makan di sekitar. Mereka meletakkan keranjang terbuka sebagai pelindung dari kucing liar, lalu menjauh beberapa meter agar induk burung tidak takut mendekat. Beberapa menit kemudian, induk burung kembali membawa pakan.<br><br><b>Di mana Lani menemukan anak burung tersebut?</b>',
        img: imgStory,
        o: [
          'Di dekat pintu gerbang sekolah.',
          'Di bawah pohon jambu.',
          'Di dalam laci ruang kelas.',
          'Di atas atap kantin sekolah.'
        ],
        a: 1,
        w: 1
      },
      {
        t: 'bs',
        q: '<b>[Bahasa Indonesia | Analisis Pernyataan]</b> Tentukan kebenaran pernyataan berikut sesuai dengan kisah Lani dan anak burung:',
        img: imgStory,
        st: [
          { s: 'Lani dan Pak Damar menjauh agar induk burung tidak takut mendekati anaknya.', a: true },
          { s: 'Lani membawa anak burung pulang ke rumahnya untuk dipelihara di sangkar.', a: false },
          { s: 'Bantuan yang baik terkadang cukup dengan menciptakan kondisi aman tanpa merusak habitat alami.', a: true }
        ],
        s: 'partial',
        w: 2
      },
      {
        t: 'pg',
        q: '<b>[Matematika | Pecahan]</b> Sebuah loyang kue dipotong rata menjadi 8 bagian sama besar. Tiga bagian telah dimakan oleh adik. Berapa bagian kue yang masih tersisa?',
        img: samplePieSVGData(),
        o: [
          '$$\\frac{3}{8}$$ bagian',
          '$$\\frac{5}{8}$$ bagian',
          '$$\\frac{1}{2}$$ bagian',
          '$$\\frac{5}{6}$$ bagian'
        ],
        a: 1,
        w: 2
      },
      {
        t: 'pg',
        q: '<b>[Matematika | Pengukuran Volume]</b> Gelas ukur mula-mula berisi $$\\frac{1}{2}$$ liter air. Kemudian dituangkan lagi air sebanyak $$\\frac{1}{4}$$ liter. Berapa liter total volume air di dalam gelas sekarang?',
        img: imgCup,
        o: [
          '$$\\frac{1}{4}$$ liter',
          '$$\\frac{1}{2}$$ liter',
          '$$\\frac{3}{4}$$ liter',
          '$$1$$ liter'
        ],
        a: 2,
        w: 2
      },
      {
        t: 'pg',
        q: '<b>[Matematika | Keliling Bangun Datar]</b> Kebun sekolah berbentuk persegi panjang dengan panjang $12\\text{ m}$ dan lebar $8\\text{ m}$. Berapa meter panjang pagar yang diperlukan untuk mengelilingi seluruh tepi kebun?',
        img: imgPlot,
        o: [
          '$$20\\text{ meter}$$',
          '$$32\\text{ meter}$$',
          '$$40\\text{ meter}$$',
          '$$96\\text{ meter}$$'
        ],
        a: 2,
        w: 2
      },
      {
        t: 'pg',
        q: '<b>[Matematika | Pengolahan Data]</b> Perhatikan diagram batang pengunjung perpustakaan sekolah. Berapa selisih pengunjung antara hari Selasa dan hari Kamis?',
        img: imgVisitors,
        o: [
          '$$6\\text{ siswa}$$',
          '$$9\\text{ siswa}$$',
          '$$12\\text{ siswa}$$',
          '$$27\\text{ siswa}$$'
        ],
        a: 1,
        w: 2
      },
      {
        t: 'pg',
        q: '<b>[Matematika | Persentase]</b> Dari 16 petak tanah persemaian, terdapat 4 petak yang telah ditanami bibit cabai. Berapa persentase petak tanah yang telah ditanami cabai?',
        img: imgGrid,
        o: [
          '$$20\\%$$',
          '$$25\\%$$',
          '$$40\\%$$',
          '$$75\\%$$'
        ],
        a: 1,
        w: 2
      },
      {
        t: 'pg',
        q: '<b>[Matematika | Geometri Ruang]</b> Sebuah kubus satuan memiliki panjang rusuk $4\\text{ cm}$. Berapakah volume kubus tersebut?',
        img: imgCube,
        o: [
          '$$16\\text{ cm}^3$$',
          '$$32\\text{ cm}^3$$',
          '$$64\\text{ cm}^3$$',
          '$$96\\text{ cm}^3$$'
        ],
        a: 2,
        w: 2
      },
      {
        t: 'jd',
        q: '<b>[Matematika | Konversi Satuan]</b> Pasangkan satuan panjang dan waktu berikut dengan nilai padanannya yang tepat:',
        pairs: [
          { l: '1 meter', r: '100 sentimeter' },
          { l: '1 kilometer', r: '1.000 meter' },
          { l: '1 jam', r: '60 menit' },
          { l: '1 kilogram', r: '1.000 gram' }
        ],
        s: 'partial',
        w: 2
      },
      {
        t: 'isi',
        q: '<b>[Bahasa Indonesia | Kosakata]</b> Lawan kata (antonim) dari kata <i>“gembur”</i> dalam istilah tanah adalah ...',
        a: 'padat|keras|tandus',
        w: 1
      },
      {
        t: 'ur',
        q: '<b>[Literasi Lingkungan | Uraian]</b> Jelaskan 2 manfaat utama menanam tanaman berakar serabut dan pohon pelindung di halaman sekolah terhadap kelestarian air tanah!',
        w: 3
      }
    ]
  };
}
