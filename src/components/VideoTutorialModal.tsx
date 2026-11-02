import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2, 
  ChevronRight, ChevronLeft, CheckCircle2, ArrowRight, Sparkles, 
  Tv, BookmarkCheck, FileText, Download, MousePointer, ShieldCheck
} from 'lucide-react';
import { VIDEO_TUTORIAL_CHAPTERS } from '../data/videoChapters';
import { VideoChapter } from '../types/cbt';

interface VideoTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
}

export const VideoTutorialModal: React.FC<VideoTutorialModalProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCC, setShowCC] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const currentChapter: VideoChapter = VIDEO_TUTORIAL_CHAPTERS[activeChapterIndex] || VIDEO_TUTORIAL_CHAPTERS[0];

  // Speech narration setup
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (isPlaying && !isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentChapter.narration);
      utterance.lang = 'id-ID';
      utterance.rate = playbackSpeed * 0.95;
      utterance.pitch = 1.0;

      // Select Indonesian voice if available
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) utterance.voice = idVoice;

      utterance.onend = () => {
        // Auto advance to next chapter if ended
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [activeChapterIndex, isPlaying, isMuted, playbackSpeed, isOpen]);

  // Video progress timer simulation
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const nextTime = prev + 0.5 * playbackSpeed;
        if (nextTime >= currentChapter.duration) {
          // Advance to next chapter if exists
          if (activeChapterIndex < VIDEO_TUTORIAL_CHAPTERS.length - 1) {
            setActiveChapterIndex(idx => idx + 1);
            return 0;
          } else {
            setIsPlaying(false);
            return currentChapter.duration;
          }
        }
        return nextTime;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, activeChapterIndex, currentChapter.duration, playbackSpeed]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(ratio * currentChapter.duration);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleNextChapter = () => {
    if (activeChapterIndex < VIDEO_TUTORIAL_CHAPTERS.length - 1) {
      setActiveChapterIndex(i => i + 1);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handlePrevChapter = () => {
    if (activeChapterIndex > 0) {
      setActiveChapterIndex(i => i - 1);
      setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleJumpToApp = (tabId: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onSelectTab(tabId);
    onClose();
  };

  const handleDownloadGuide = () => {
    const text = `# PANDUAN LENGKAP PENGGUNAAN GENERATOR CBT PRO
Dibuat untuk Asesmen Nasional, TKA SD/SMP/SMA, dan Ujian Sekolah

## 1. PENGATURAN UJIAN
- Tentukan Judul Ujian, Nama Sekolah, Mata Pelajaran, dan Durasi Ujian.
- Atur KKM (Kriteria Kelulusan Minimal) dan Token Ruang (misal: PAS2026 / TKA2026).
- Tentukan batas toleransi keluar layar penuh (anti-cheat).
- Unggah logo resmi sekolah dan pilih warna tema aplikasi.

## 2. PENGELOLAAN PESERTA
- Pilih Mode Bebas (siswa mengisi sendiri) atau Mode Login Akun (username & password).
- Tambahkan peserta manual atau impor massal melalui file Excel (.xlsx / .csv).
- Cetak Kartu Login peserta (format 4 kartu per lembar A4).

## 3. BANK SOAL & FORMULA
- Mendukung 6 tipe soal: Pilihan Ganda, PG Kompleks, Benar/Salah, Menjodohkan, Isian Singkat, Uraian.
- Dukungan rumus matematika KaTeX LaTeX: pecahan, integral, matriks, simbol Yunani.
- Sisipkan gambar stimulus dan atur bobot nilai tiap butir soal.

## 4. INTEGRASI GOOGLE SHEETS
- Buat spreadsheet baru di sheets.new.
- Buka menu Extensions -> Apps Script, tempel kode yang tersedia, jalankan setupDatabase.
- Deploy sebagai Web App dengan akses "Anyone".
- Masukkan URL Web App ke Generator CBT dan uji koneksi.

## 5. GENERATE CBT & PUBLIKASI
- Klik "Hasilkan Kode HTML", periksa validasi.
- Unduh file .HTML atau salin kode sematan untuk Google Sites.
- Bagikan file ke siswa melalui flashdisk (offline) atau Google Drive/Sites (online).
`;
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Panduan_Generator_CBT_Pro.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const progressPercent = Math.min(100, (currentTime / currentChapter.duration) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        ref={containerRef}
        className="w-full max-w-6xl max-h-[95vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Studio Video Panduan Interaktif
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  HD 1080p Tutorial
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Langkah demi langkah membuat ujian CBT, impor soal, roster siswa & Google Sheets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadGuide}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Rangkuman PDF/MD
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
              aria-label="Tutup video"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Video Canvas & Chapters Sidebar Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-[460px]">
          {/* Main Video Screen Area (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-950 flex flex-col justify-between relative overflow-hidden group">
            {/* Simulated Animated Screen Visualizer */}
            <div className="flex-1 p-6 relative flex flex-col justify-center items-center overflow-hidden">
              {/* Dynamic screen animation based on chapter */}
              <div className="w-full max-w-2xl aspect-video rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl relative overflow-hidden flex flex-col p-4">
                {/* Simulated App Header Mockup */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                    <span className="text-[11px] font-mono text-slate-400 ml-2">
                      cbt-builder.id &bull; {currentChapter.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10">
                    Modul {currentChapter.number} / 06
                  </span>
                </div>

                {/* Simulated Screen Content per chapter */}
                <div className="flex-1 py-4 flex flex-col justify-center relative">
                  {currentChapter.screenType === 'overview' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-xl">
                        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-white">Generator CBT Pro Standalone</div>
                          <div className="text-[11px] text-indigo-200">1 File HTML Mandiri &bull; Tanpa Server Berat &bull; Mendukung Kamera</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">1. Konfigurasi</div>
                        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">2. Peserta</div>
                        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">3. Bank Soal</div>
                        <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200">4. Spreadsheet</div>
                        <div className="p-2 rounded-lg bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 font-bold">5. Hasil .HTML</div>
                      </div>
                    </div>
                  )}

                  {currentChapter.screenType === 'config' && (
                    <div className="space-y-2.5 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700">
                          <span className="text-[10px] text-slate-400">Judul Ujian:</span>
                          <div className="font-bold text-white mt-0.5">Penilaian Akhir Semester Ganjil</div>
                        </div>
                        <div className="bg-slate-800/70 p-2.5 rounded-lg border border-slate-700">
                          <span className="text-[10px] text-slate-400">Durasi & KKM:</span>
                          <div className="font-bold text-indigo-300 mt-0.5">90 Menit &bull; KKM 70</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
                        <span className="text-[11px] text-emerald-300 font-semibold">Keamanan: Mode Layar Penuh & Anti-Pindah Tab</span>
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                  )}

                  {currentChapter.screenType === 'students' && (
                    <div className="space-y-2 text-xs">
                      <div className="p-3 border-2 border-dashed border-indigo-500/50 rounded-xl bg-indigo-950/20 text-center">
                        <span className="text-xl">📊</span>
                        <div className="text-xs font-bold text-indigo-300 mt-1">Impor Excel / CSV Sekali Klik</div>
                        <div className="text-[10px] text-slate-400">Kolom: username, password, nama, kelas</div>
                      </div>
                      <div className="flex justify-between items-center bg-slate-800/80 p-2 rounded-lg border border-slate-700 text-[11px]">
                        <span>Daftar 30 Siswa Terdaftar (VI-A s/d VI-C)</span>
                        <span className="font-bold text-indigo-400">Cetak Kartu A4 (4 per lembar)</span>
                      </div>
                    </div>
                  )}

                  {currentChapter.screenType === 'questions' && (
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-200 mt-1">
                          {'Berapakah nilai dari persamaan $E = mc^2$ dan $\\frac{a}{b}$ ?'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-indigo-600/30 border border-indigo-500 rounded-lg text-white font-semibold">A. Formula Terverifikasi (Kunci)</div>
                        <div className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300">B. Opsi Jawaban Lain</div>
                      </div>
                    </div>
                  )}

                  {currentChapter.screenType === 'sheets' && (
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                        <div className="text-xs font-bold text-emerald-300">Google Apps Script Web App Endpoint</div>
                        <div className="font-mono text-[10px] text-slate-300 truncate mt-1">https://script.google.com/macros/s/.../exec</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="p-2 rounded bg-slate-800 border border-slate-700">Tab Hasil Ujian</div>
                        <div className="p-2 rounded bg-slate-800 border border-slate-700">Live Monitoring</div>
                        <div className="p-2 rounded bg-slate-800 border border-slate-700">Foto Kamera</div>
                      </div>
                    </div>
                  )}

                  {currentChapter.screenType === 'generate' && (
                    <div className="space-y-3 text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 rounded-full text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Validasi Sukses: 21 Soal Siap Generate
                      </div>
                      <div className="p-3 bg-slate-800/90 rounded-xl border border-slate-700 text-xs">
                        <div className="font-bold text-white">File Output: CBT_Ujian_2026.html (Mandiri)</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">Dapat dibuka offline di browser siswa atau di-embed ke Google Sites</div>
                      </div>
                    </div>
                  )}

                  {/* Simulated Animated Cursor pointer */}
                  <div 
                    className="absolute z-20 pointer-events-none transition-all duration-700 ease-out flex items-center gap-1.5"
                    style={{
                      top: `${30 + (currentTime % 5) * 8}%`,
                      left: `${20 + ((currentTime * 12) % 60)}%`
                    }}
                  >
                    <MousePointer className="w-5 h-5 text-indigo-400 fill-indigo-400 drop-shadow-[0_2px_8px_rgba(79,70,229,0.8)]" />
                    <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded shadow">
                      Klik Disini
                    </span>
                  </div>
                </div>

                {/* Subtitle / Closed Caption Bar */}
                {showCC && (
                  <div className="mt-auto bg-black/85 backdrop-blur-md rounded-xl p-3 border border-white/10 text-center">
                    <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                      "{currentChapter.narration}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Player Control Bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
              {/* Timeline Progress Bar (Seekable) */}
              <div 
                onClick={handleSeek}
                className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer relative group/timeline"
              >
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/timeline:scale-100 transition-transform"
                  style={{ left: `calc(${progressPercent}% - 7px)` }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition"
                    title={isPlaying ? 'Jeda' : 'Putar'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={handlePrevChapter}
                    disabled={activeChapterIndex === 0}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition"
                    title="Bab Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNextChapter}
                    disabled={activeChapterIndex === VIDEO_TUTORIAL_CHAPTERS.length - 1}
                    className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 transition"
                    title="Bab Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white transition"
                    title="Ulangi Bab Ini"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono text-slate-400">
                    {Math.floor(currentTime)}s / {currentChapter.duration}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCC(!showCC)}
                    className={`px-2 py-1 rounded text-[11px] font-bold border transition ${
                      showCC ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                    title="Teks Teks Suara (CC)"
                  >
                    CC
                  </button>

                  {/* Narration Voice Mute Button */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 text-slate-400 hover:text-white transition"
                    title={isMuted ? 'Aktifkan Suara Narasi' : 'Bisukan Narasi'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                  </button>

                  {/* Playback Speed Selector */}
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs py-1 px-2 font-mono outline-none"
                  >
                    <option value="1">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2">2.0x</option>
                  </select>

                  {/* Jump To Step in CBT Button */}
                  <button
                    onClick={() => handleJumpToApp(currentChapter.targetTab)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md"
                  >
                    <span>Lompat & Praktekkan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters Sidebar & Key Steps (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 flex flex-col justify-between overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daftar Bab Panduan ({VIDEO_TUTORIAL_CHAPTERS.length} Modul)
                </span>
                <span className="text-xs font-semibold text-indigo-400">
                  {Math.round(((activeChapterIndex + 1) / VIDEO_TUTORIAL_CHAPTERS.length) * 100)}% Selesai
                </span>
              </div>
            </div>

            {/* Chapter List Scrollable */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {VIDEO_TUTORIAL_CHAPTERS.map((chap, idx) => {
                const isActive = idx === activeChapterIndex;
                const isPassed = idx < activeChapterIndex;

                return (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setActiveChapterIndex(idx);
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition border flex items-start gap-3 ${
                      isActive
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isPassed
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700/60 text-slate-400'
                    }`}>
                      {isPassed ? '✓' : chap.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{chap.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">{chap.duration}s</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{chap.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Chapter Details & Checklist */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Ringkasan Materi Bab Ini:</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 pl-1">
                {currentChapter.keyPoints.slice(0, 3).map((pt, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                    <span className="text-[11px] leading-tight text-slate-300">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
