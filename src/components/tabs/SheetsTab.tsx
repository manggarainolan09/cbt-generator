import React, { useState } from 'react';
import { 
  FileSpreadsheet, Copy, Check, ExternalLink, Send, Shield, Key
} from 'lucide-react';
import { AppState, ExamConfig } from '../../types/cbt';
import { buildGasCode } from '../../utils/gasCode';

interface SheetsTabProps {
  state: AppState;
  onChangeConfig: (patch: Partial<ExamConfig>) => void;
}

export const SheetsTab: React.FC<SheetsTabProps> = ({
  state,
  onChangeConfig
}) => {
  const [copied, setCopied] = useState(false);
  const cfg = state.cfg;
  const gasCode = buildGasCode(cfg);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gasCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = () => {
    if (!cfg.sheetUrl.trim()) {
      alert('Harap masukkan URL Web App Google Apps Script terlebih dahulu!');
      return;
    }
    window.open(cfg.sheetUrl + (cfg.sheetUrl.includes('?') ? '&' : '?') + 'ping=1', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Kirim Rekap Nilai ke Google Sheets Otomatis</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Jawaban dan skor akhir siswa langsung terkirim ke spreadsheet tanpa perlu server sewa berbayar
          </p>
        </div>

        {/* Proctor Location Notice Card */}
        <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-emerald-950">
              Lokasi Panel Pengawas & Analisis Psikometrik Lengkap
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Sesuai desain modular CBT, <b>Panel Pengawas berada langsung di dalam file HTML yang di-generate</b>, bukan di generator ini.
              Ketika pengawas membuka file HTML ujian di laptopnya, tepat di bawah tombol <i>"Mulai Ujian Sekarang"</i> klik tombol <b>"👮 Masuk Panel Pengawas"</b>.
              Pengawas dapat memantau pengerjaan langsung (Live Monitoring), foto webcam, reset login, reset nilai, serta mengakses <b>Analisis Psikometrik Selengkap-lengkapnya (Daya Beda, Tingkat Kesukaran, Matriks Jawaban, Ekspor Excel 5-Sheet & PDF)</b>.
            </p>
          </div>
        </div>

        {/* Endpoint Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              URL Web App Google Apps Script (Berakhiran <code>/exec</code>)
            </label>
            <input
              type="text"
              value={cfg.sheetUrl}
              onChange={(e) => onChangeConfig({ sheetUrl: e.target.value.trim(), syncEnabled: !!e.target.value.trim() })}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full p-3 font-mono text-xs border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
            <div className="md:col-span-3">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Kredensial Pengawas & Token Sinkronisasi</span>
              </span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Gunakan kredensial ini untuk login ke Panel Monitoring Pengawas di aplikasi ujian
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Username Pengawas</label>
              <input
                type="text"
                value={cfg.adminUser}
                onChange={(e) => onChangeConfig({ adminUser: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password Pengawas</label>
              <input
                type="text"
                value={cfg.adminPass}
                onChange={(e) => onChangeConfig({ adminPass: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-xl bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Sync Token (Opsional)</label>
              <input
                type="text"
                value={cfg.syncToken}
                onChange={(e) => onChangeConfig({ syncToken: e.target.value })}
                placeholder="TOKEN_RAHASIA"
                className="w-full p-2.5 text-xs border rounded-xl bg-white font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Kode Berhasil Disalin!' : 'Salin Kode Google Apps Script'}</span>
            </button>

            <button
              onClick={handleTestConnection}
              className="px-4 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Uji Koneksi Endpoint</span>
            </button>

            <a
              href="https://sheets.new"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto"
            >
              <span>Buka Google Sheets Baru (sheets.new)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 text-xs text-slate-700">
          <h4 className="font-bold text-slate-900">Petunjuk 4 Langkah Penyiapan Google Spreadsheet:</h4>
          <ol className="list-decimal list-inside space-y-2 leading-relaxed">
            <li>
              Buka Google Sheets baru di <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">sheets.new</a>.
            </li>
            <li>
              Klik menu <b>Ekstensi (Extensions)</b> &rarr; <b>Apps Script</b>.
            </li>
            <li>
              Hapus kode default yang ada, lalu tempel kode dari tombol <b>"Salin Kode Google Apps Script"</b> di atas.
            </li>
            <li>
              Pilih fungsi <code>setupDatabase</code> pada toolbar atas, lalu klik <b>Run (Jalankan)</b> untuk membuat tabel database otomatis.
            </li>
            <li>
              Klik <b>Terapkan (Deploy)</b> &rarr; <b>Penerapan baru (New deployment)</b> &rarr; pilih jenis <b>Aplikasi Web (Web app)</b>.
              <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-600">
                <li>Jalankan sebagai (Execute as): <b>Saya (Me)</b></li>
                <li>Siapa yang memiliki akses (Who has access): <b>Siapa saja (Anyone)</b></li>
              </ul>
            </li>
            <li>
              Salin URL Web App yang berakhiran <code>/exec</code> dan tempelkan ke kolom URL di atas.
            </li>
          </ol>
        </div>

        {/* Code Preview */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">
            Pratinjau Kode Google Apps Script (Auto-Generated):
          </label>
          <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-56 leading-relaxed">
            {gasCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
