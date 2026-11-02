import React from 'react';
import { 
  Play, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, 
  FileSpreadsheet, Users, HelpCircle, Laptop, Download, BookOpen
} from 'lucide-react';
import { AppState } from '../../types/cbt';

interface GuideTabProps {
  state: AppState;
  onOpenVideoTutorial: () => void;
  onSelectTab: (tabId: string) => void;
  onLoadSample: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({
  state,
  onOpenVideoTutorial,
  onSelectTab,
  onLoadSample
}) => {
  return (
    <div className="space-y-6">
      {/* Featured Video Tutorial Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-10 border border-indigo-800/60 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur Baru &bull; Studio Video Panduan Interaktif</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Buat & Distribusikan Ujian CBT Berbasis Komputer Lebih Mudah
          </h2>

          <p className="text-sm sm:text-base text-indigo-200 leading-relaxed">
            Ikuti video tutorial interaktif lengkap berdurasi singkat yang memandu Anda dari pengaturan jadwal, 
            impor massal akun siswa Excel, pembuatan bank soal berilustrasi & formula matematika, hingga 
            penyematan ke Google Sites dan monitoring live pengawas.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenVideoTutorial}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Putar Video Panduan Sekarang</span>
            </button>

            <button
              onClick={onLoadSample}
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl text-sm border border-white/20 transition"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Muat 21 Soal Contoh TKA SD</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Step Interactive Workflow Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Alur Pembuatan Ujian Mandiri</h3>
          <p className="text-xs text-slate-500 mt-1">6 langkah praktis dari persiapan data hingga ujian siap dikerjakan siswa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              num: '01',
              title: 'Pengaturan Ujian',
              desc: 'Atur judul, sekolah, durasi, KKM, token ruang, batas pelanggaran tab, dan jadwal pengerjaan.',
              tab: 'config',
              actionText: 'Buka Pengaturan'
            },
            {
              num: '02',
              title: 'Akun Peserta & Kartu',
              desc: 'Pilih login bebas atau akun terdaftar, impor roster Excel/CSV, dan cetak kartu akses A4.',
              tab: 'students',
              actionText: 'Kelola Peserta'
            },
            {
              num: '03',
              title: 'Bank Soal & Formula',
              desc: 'Buat 6 variasi soal (PG, PGK, B/S, Jodohkan, Isian, Uraian) dengan gambar dan rumus KaTeX.',
              tab: 'questions',
              actionText: 'Buka Bank Soal'
            },
            {
              num: '04',
              title: 'Impor Teks Cepat',
              desc: 'Konversi naskah soal dari teks Word atau dokumen teks secara otomatis dalam hitungan detik.',
              tab: 'import',
              actionText: 'Impor Teks'
            },
            {
              num: '05',
              title: 'Google Sheets & Monitor',
              desc: 'Hubungkan formulir ke spreadsheet gratis untuk rekap nilai otomatis & proctoring pengawas.',
              tab: 'sheets',
              actionText: 'Atur Spreadsheet'
            },
            {
              num: '06',
              title: 'Generate & Bagikan',
              desc: 'Uji simulasi pengerjaan siswa, lalu unduh 1 file HTML mandiri untuk dibagikan secara offline/online.',
              tab: 'generate',
              actionText: 'Generate .HTML'
            }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-2">
                <span className="text-xs font-black text-indigo-600 font-mono tracking-widest">{item.num}</span>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <button
                onClick={() => onSelectTab(item.tab)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights & Security Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Anti-Kecurangan & Layar Penuh</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ujian otomatis meminta izin Layar Penuh (Fullscreen). Jika siswa mencoba keluar atau berganti tab/jendela, 
            sistem akan mencatat pelanggaran dan dapat mengakhiri ujian otomatis jika melampaui batas toleransi.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Sinkronisasi Spreadsheet Gratis</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Menggunakan Google Apps Script gratis tanpa biaya hosting server. Nilai, rincian jawaban per butir, 
            serta rekapitulasi kelulusan langsung tersimpan rapi di Google Sheets sekolah.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Laptop className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Offline & Online Fleksibel</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            File .HTML mandiri dapat disimpan di flashdisk untuk laboratorium komputer tanpa koneksi internet, 
            atau disematkan ke Google Sites / portal sekolah untuk asesmen jarak jauh secara online.
          </p>
        </div>
      </div>
    </div>
  );
};
