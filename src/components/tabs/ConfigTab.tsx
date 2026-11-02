import React, { useRef } from 'react';
import { 
  Building, BookOpen, Clock, Award, Key, ShieldAlert, FileText, 
  Image as ImageIcon, Calendar, Palette, Camera, CheckSquare, Lock
} from 'lucide-react';
import { AppState, ExamConfig } from '../../types/cbt';

interface ConfigTabProps {
  state: AppState;
  onChangeConfig: (newCfg: Partial<ExamConfig>) => void;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({
  state,
  onChangeConfig
}) => {
  const cfg = state.cfg;
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onChangeConfig({ logo: event.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      onChangeConfig({ icon: event.target?.result as string });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* 1. Core Exam Information */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-indigo-600" />
            <span>Informasi Utama & Konfigurasi Ujian</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas asesmen yang akan tampil pada lembar soal dan kartu akses siswa
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Judul Ujian / Asesmen <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={cfg.title}
              onChange={(e) => onChangeConfig({ title: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              placeholder="Contoh: Penilaian Akhir Semester Ganjil"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Sekolah / Instansi
            </label>
            <input
              type="text"
              value={cfg.school}
              onChange={(e) => onChangeConfig({ school: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              placeholder="Contoh: SD Negeri 01 Nusantara"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mata Pelajaran
            </label>
            <input
              type="text"
              value={cfg.subject}
              onChange={(e) => onChangeConfig({ subject: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              placeholder="Contoh: Literasi Bahasa Indonesia & Numerasi"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Durasi Pengerjaan (Menit, 0 = Tanpa Batas)
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={cfg.duration}
                onChange={(e) => onChangeConfig({ duration: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white pr-14"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium">Menit</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              KKM / Batas Kelulusan (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={cfg.kkm}
              onChange={(e) => onChangeConfig({ kkm: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Token Ruang Ujian (Opsional)
            </label>
            <input
              type="text"
              value={cfg.token}
              onChange={(e) => onChangeConfig({ token: e.target.value.toUpperCase() })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white uppercase font-mono tracking-wider"
              placeholder="Contoh: TKA2026"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Batas Toleransi Keluar Layar Penuh (0 = Nonaktif)
            </label>
            <input
              type="number"
              min="0"
              value={cfg.maxSw}
              onChange={(e) => onChangeConfig({ maxSw: parseInt(e.target.value, 10) || 0 })}
              className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              title="Jika siswa keluar layar penuh atau ganti tab sebanyak angka ini, ujian diakhiri otomatis"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Petunjuk & Tata Tertib Ujian untuk Siswa
          </label>
          <textarea
            rows={3}
            value={cfg.instr}
            onChange={(e) => onChangeConfig({ instr: e.target.value })}
            className="w-full p-3 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white leading-relaxed"
            placeholder="Ketik tata tertib ujian di sini..."
          />
        </div>
      </div>

      {/* 2. Scheduling Options */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Penjadwalan Waktu Ujian</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tentukan apakah ujian dapat dimulai kapan saja atau hanya pada tanggal dan rentang jam tertentu
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label 
            onClick={() => onChangeConfig({ scheduleMode: 'full' })}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
              cfg.scheduleMode !== 'scheduled'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="scheduleMode"
              checked={cfg.scheduleMode !== 'scheduled'}
              onChange={() => onChangeConfig({ scheduleMode: 'full' })}
              className="mt-1"
            />
            <div>
              <span className="block text-sm font-bold text-slate-900">1. Bebas Waktu (Kapan Saja)</span>
              <span className="text-xs text-slate-500 mt-0.5 block">
                Siswa dapat langsung memulai ujian segera setelah membuka file HTML
              </span>
            </div>
          </label>

          <label 
            onClick={() => onChangeConfig({ scheduleMode: 'scheduled' })}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3 ${
              cfg.scheduleMode === 'scheduled'
                ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="scheduleMode"
              checked={cfg.scheduleMode === 'scheduled'}
              onChange={() => onChangeConfig({ scheduleMode: 'scheduled' })}
              className="mt-1"
            />
            <div>
              <span className="block text-sm font-bold text-slate-900">2. Sesuai Jadwal Waktu</span>
              <span className="text-xs text-slate-500 mt-0.5 block">
                Menampilkan layar hitung mundur sampai jam mulai dan menutup setelah jam berakhir
              </span>
            </div>
          </label>
        </div>

        {cfg.scheduleMode === 'scheduled' && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal Ujian</label>
              <input
                type="date"
                value={cfg.scheduleDate}
                onChange={(e) => onChangeConfig({ scheduleDate: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Jam Mulai</label>
              <input
                type="time"
                value={cfg.scheduleStartTime}
                onChange={(e) => onChangeConfig({ scheduleStartTime: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Jam Berakhir</label>
              <input
                type="time"
                value={cfg.scheduleEndTime}
                onChange={(e) => onChangeConfig({ scheduleEndTime: e.target.value })}
                className="w-full p-2.5 border rounded-xl text-xs bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Branding, Logo & Theme */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-indigo-600" />
            <span>Identitas Logo & Tema Visual CBT</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Kustomisasi logo sekolah dan warna tema tampilan siswa</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden p-2 shrink-0">
            {cfg.logo ? (
              <img src={cfg.logo} alt="Logo" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-[11px] text-slate-400 text-center font-medium">Belum ada logo</span>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kementerian / Dinas Naungan</label>
              <input
                type="text"
                value={cfg.ministry}
                onChange={(e) => onChangeConfig({ ministry: e.target.value })}
                className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                placeholder="Contoh: Kementerian Pendidikan Dasar dan Menengah"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Unggah Logo Sekolah
              </button>
              {cfg.logo && (
                <button
                  type="button"
                  onClick={() => onChangeConfig({ logo: '' })}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition"
                >
                  Hapus Logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Warna Utama Header & Tombol</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cfg.themePrimary || '#4f46e5'}
                onChange={(e) => onChangeConfig({ themePrimary: e.target.value })}
                className="w-10 h-10 border border-slate-300 rounded-xl cursor-pointer p-0.5 bg-white shrink-0"
              />
              <input
                type="text"
                value={cfg.themePrimary || '#4f46e5'}
                onChange={(e) => onChangeConfig({ themePrimary: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Warna Latar Belakang Ujian</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cfg.themeBackground || '#f8fafc'}
                onChange={(e) => onChangeConfig({ themeBackground: e.target.value })}
                className="w-10 h-10 border border-slate-300 rounded-xl cursor-pointer p-0.5 bg-white shrink-0"
              />
              <input
                type="text"
                value={cfg.themeBackground || '#f8fafc'}
                onChange={(e) => onChangeConfig({ themeBackground: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Anti-Cheat & Security Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <span>Pengacakan Soal & Keamanan Ujian</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">Proteksi integritas kejujuran pengerjaan ujian siswa</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { key: 'shuffleQ', label: 'Acak Urutan Soal', desc: 'Urutan butir soal berbeda untuk tiap siswa' },
            { key: 'shuffleO', label: 'Acak Opsi Pilihan', desc: 'Posisi opsi jawaban diacak' },
            { key: 'show', label: 'Tampilkan Nilai Akhir', desc: 'Siswa langsung melihat skor setelah selesai' },
            { key: 'noCopy', label: 'Anti-Salin & Blokir Klik', desc: 'Mencegah seleksi teks dan klik kanan' },
            { key: 'camera', label: 'Kamera Pengawas (Live)', desc: 'Mengambil foto periodik siswa lewat webcam' }
          ].map(toggle => (
            <label 
              key={toggle.key}
              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 cursor-pointer transition flex items-start gap-2.5"
            >
              <input
                type="checkbox"
                checked={Boolean((cfg as any)[toggle.key])}
                onChange={(e) => onChangeConfig({ [toggle.key]: e.target.checked } as any)}
                className="mt-0.5 rounded text-indigo-600"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900 leading-tight">{toggle.label}</span>
                <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">{toggle.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
