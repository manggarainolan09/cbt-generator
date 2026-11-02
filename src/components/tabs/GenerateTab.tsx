import React, { useState } from 'react';
import { 
  FileCode, Play, Download, Copy, Check, ExternalLink, 
  AlertTriangle, CheckCircle2, Globe, Sparkles
} from 'lucide-react';
import { AppState } from '../../types/cbt';
import { buildCBTHTML } from '../../utils/htmlGenerator';

interface GenerateTabProps {
  state: AppState;
  onOpenExamPreview: () => void;
}

export const GenerateTab: React.FC<GenerateTabProps> = ({
  state,
  onOpenExamPreview
}) => {
  const [outputCode, setOutputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const validateState = () => {
    if (!state.qs.length) {
      alert('Validasi Gagal: Bank soal masih kosong. Tambahkan minimal 1 soal.');
      return false;
    }
    if (!state.cfg.title.trim()) {
      alert('Validasi Gagal: Judul Ujian wajib diisi pada tab Pengaturan.');
      return false;
    }
    if (state.cfg.authMode === 'list' && !state.students.length) {
      alert('Validasi Gagal: Mode Login Akun dipilih, tetapi daftar siswa masih kosong.');
      return false;
    }
    return true;
  };

  const handleGenerate = () => {
    if (!validateState()) return;
    const code = buildCBTHTML(state);
    setOutputCode(code);
    const sizeKB = Math.round(code.length / 1024);
    setStatusMessage(`✅ File CBT Berhasil Dibuat! Ukuran file: ${sizeKB} KB (${state.qs.length} Butir Soal).`);
  };

  const handleDownload = () => {
    if (!outputCode) {
      if (!validateState()) return;
      const code = buildCBTHTML(state);
      setOutputCode(code);
    }
    const codeToDownload = outputCode || buildCBTHTML(state);
    const cleanTitle = (state.cfg.title || 'Ujian').replace(/[^a-z0-9]/gi, '_');
    const blob = new Blob([codeToDownload], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CBT_${cleanTitle}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    const code = outputCode || buildCBTHTML(state);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <span>Generate File Aplikasi CBT Mandiri (.HTML)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Satukan seluruh konfigurasi, peserta, media gambar, dan bank soal menjadi satu file HTML siap jalan
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Hasilkan Kode HTML</span>
          </button>

          <button
            onClick={onOpenExamPreview}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-md shadow-purple-600/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>2. Coba Simulasi Ujian (In-App)</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>3. Unduh File .HTML</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-2xl text-xs transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Google Sites Publishing Guide Banner */}
        <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-sky-950">Publikasi Gratis Lewat Google Sites:</span>
          </div>
          <p className="text-xs text-sky-900 leading-relaxed">
            Untuk ujian online jarak jauh tanpa biaya hosting, Anda dapat menyematkan kode HTML ini ke Google Sites sekolah:
          </p>
          <ol className="list-decimal list-inside text-xs text-sky-800 space-y-1 pl-1">
            <li>Salin seluruh kode HTML melalui tombol <b>"Salin Kode"</b> di atas.</li>
            <li>Buka halaman Google Sites sekolah Anda di <a href="https://sites.new" target="_blank" rel="noopener noreferrer" className="font-bold underline">sites.new</a>.</li>
            <li>Pilih menu <b>Sematkan (Embed)</b> &rarr; pilih tab <b>Sematkan Kode (Embed code)</b>, lalu tempel kode.</li>
            <li>Klik <b>Berikutnya</b> lalu <b>Sisipkan</b>, lebarkan kotak embed memenuhi layar, lalu klik <b>Publikasikan</b>!</li>
          </ol>
        </div>

        {/* Output HTML Code Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-600">
            Pratinjau Kode HTML CBT (Standalone):
          </label>
          <textarea
            readOnly
            rows={10}
            value={outputCode}
            placeholder="Klik tombol 'Hasilkan Kode HTML' di atas untuk melihat kode output..."
            className="w-full p-4 font-mono text-xs border border-slate-300 rounded-2xl bg-slate-950 text-emerald-400 outline-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
