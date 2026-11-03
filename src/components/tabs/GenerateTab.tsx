import React, { useState, useEffect } from 'react';
import { 
  FileCode, Play, Download, Copy, Check, ExternalLink, 
  CheckCircle2, Globe, Sparkles, Send, QrCode, Share2, 
  MessageCircle, Eye, AlertCircle, RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import { AppState, SchoolAccount } from '../../types/cbt';
import { buildCBTHTML } from '../../utils/htmlGenerator';
import { apiService } from '../../utils/apiService';

interface GenerateTabProps {
  state: AppState;
  schoolUser?: SchoolAccount | null;
  onOpenExamPreview: () => void;
  onOpenExamPlayer?: (examId: string) => void;
}

export const GenerateTab: React.FC<GenerateTabProps> = ({
  state,
  schoolUser,
  onOpenExamPreview,
  onOpenExamPlayer
}) => {
  const [outputCode, setOutputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Publish state
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishedData, setPublishedData] = useState<{
    id: string;
    title: string;
    publicUrl: string;
    isOpen: boolean;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Automatically generate code on initial load or state changes
  useEffect(() => {
    if (state.qs.length && state.cfg.title.trim()) {
      try {
        const code = buildCBTHTML(state);
        setOutputCode(code);
        const sizeKB = Math.round(code.length / 1024);
        setStatusMessage(`✅ File CBT Siap (${sizeKB} KB, ${state.qs.length} Butir Soal). Anda dapat langsung menerbitkan secara online atau mengunduh file.`);
      } catch (e) {
        console.error(e);
      }
    }
  }, [state]);

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

  // PUBLISH EXAM ONLINE
  const handlePublishOnline = async () => {
    if (!validateState()) return;

    setPublishLoading(true);
    try {
      const payload = {
        schoolId: schoolUser?.id || 'sch-default',
        schoolName: schoolUser?.name || state.cfg.school || 'Sekolah CBT',
        title: state.cfg.title,
        subject: state.cfg.subject || 'Mata Pelajaran',
        duration: Number(state.cfg.duration) || 60,
        kkm: Number(state.cfg.kkm) || 75,
        token: state.cfg.token,
        questionCount: state.qs.length,
        studentAuthMode: state.cfg.authMode,
        examData: state
      };

      const res = await apiService.publishExam(payload);
      if (res.success && res.exam) {
        setPublishedData({
          id: res.exam.id,
          title: res.exam.title,
          publicUrl: `${window.location.origin}/?exam=${res.exam.id}`,
          isOpen: true
        });

        // Generate QR Code
        const fullUrl = `${window.location.origin}/?exam=${res.exam.id}`;
        const qrUrl = await QRCode.toDataURL(fullUrl, {
          width: 320,
          margin: 2,
          color: { dark: '#1e1b4b', light: '#ffffff' }
        });
        setQrDataUrl(qrUrl);
      }
    } catch (err: any) {
      alert('Gagal menerbitkan ujian: ' + (err.message || 'Kesalahan sistem'));
    } finally {
      setPublishLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!publishedData) return;
    navigator.clipboard.writeText(publishedData.publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
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

  const handleDownloadStandaloneGenerator = async () => {
    try {
      const res = await fetch('/generator-cbt.html');
      if (res.ok) {
        const text = await res.text();
        const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Generator-CBT-Pro-Offline.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    // Fallback
    const blob = new Blob(['<!DOCTYPE html>\n' + document.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Generator-CBT-Pro-Offline.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInNewTab = () => {
    const code = outputCode || buildCBTHTML(state);
    const blob = new Blob([code], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleCopyCode = () => {
    const code = outputCode || buildCBTHTML(state);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const waShareText = publishedData
    ? `Halo siswa/siswi, berikut adalah tautan pengerjaan Ujian CBT: "${publishedData.title}".\n\nSilakan klik tautan berikut untuk memulai:\n${publishedData.publicUrl}\n\nSelamat mengerjakan & semoga sukses!`
    : '';

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* SECTION 1: FITUR UTAMA PUBLISH ONLINE */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-700/50 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fitur Unggulan Sekolah: Terbitkan CBT Online</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Terbitkan Ujian Online (Langsung Publish)
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              Setelah selesai membuat bank soal, sekolah dapat langsung mempublikasikan ujian ke server. Siswa cukup membuka link atau memindai QR Code untuk memulai ujian tanpa instalasi apapun!
            </p>
          </div>

          <button
            onClick={handlePublishOnline}
            disabled={publishLoading}
            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 text-sm shrink-0 disabled:opacity-50"
          >
            {publishLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Mempublikasikan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>🚀 Terbitkan Ujian Sekarang</span>
              </>
            )}
          </button>
        </div>

        {/* If published, display Live Exam Panel */}
        {publishedData && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/40 text-white space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">Ujian Berhasil Diterbitkan Secara Live!</h4>
                  <p className="text-xs text-emerald-300">
                    ID Publik: <span className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">{publishedData.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenExamPlayer && onOpenExamPlayer(publishedData.id)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Buka Ujian Siswa</span>
                </button>
                <button
                  onClick={() => setQrModalOpen(true)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Lihat QR Code</span>
                </button>
              </div>
            </div>

            {/* Link Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-200">
                <span>Tautan Pengerjaan Siswa (Bagikan ke Siswa / WhatsApp Kelas):</span>
                <button
                  onClick={handleCopyLink}
                  className="text-emerald-300 hover:text-white font-bold flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Tersalin ke Clipboard!' : 'Salin Tautan'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publishedData.publicUrl}
                  className="flex-1 px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-white font-mono text-xs select-all focus:outline-none"
                />

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(waShareText)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shrink-0"
                  title="Bagikan langsung ke WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Bagikan WA</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: UNDUH FILE CBT STANDALONE & GENERATOR OFFLINE */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-600" />
            <span>Generate & Unduh File Mandiri (.HTML Standalone)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Selain publikasi online, Anda tetap dapat mengunduh ujian dan generator dalam 1 file HTML tunggal untuk keperluan offline tanpa internet.
          </p>
        </div>

        {/* Action Buttons Grid */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownload}
            className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-md shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>1. Unduh File CBT Soal (.HTML)</span>
          </button>

          <button
            onClick={handleDownloadStandaloneGenerator}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-md"
            title="Unduh seluruh aplikasi Generator CBT ini dalam 1 file HTML offline"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>2. Unduh Generator CBT (1 File HTML Offline)</span>
          </button>

          <button
            onClick={onOpenExamPreview}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-md shadow-purple-600/20"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>3. Simulasi Ujian (In-App)</span>
          </button>

          <button
            onClick={handleOpenInNewTab}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition flex items-center gap-2 shadow-md shadow-blue-600/20"
            title="Buka file CBT hasil generate langsung di tab browser baru untuk pengujian cepat"
          >
            <ExternalLink className="w-4 h-4" />
            <span>4. Buka di Tab Baru</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-2xl text-xs transition flex items-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
          </button>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Google Sites Publishing Guide Banner */}
        <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-sky-950">Publikasi Alternatif Lewat Google Sites:</span>
          </div>
          <p className="text-xs text-sky-900 leading-relaxed">
            Untuk menyematkan ujian ke portal Google Sites sekolah Anda:
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
            rows={8}
            value={outputCode}
            placeholder="Kode HTML CBT otomatis ter-generate di sini..."
            className="w-full p-4 font-mono text-xs border border-slate-300 rounded-2xl bg-slate-950 text-emerald-400 outline-none leading-relaxed"
          />
        </div>
      </div>

      {/* QR Code Modal */}
      {qrModalOpen && publishedData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-scale-up">
            <h3 className="font-extrabold text-slate-900 text-base">{publishedData.title}</h3>
            <p className="text-xs text-slate-500">
              Pindai QR Code ini untuk langsung membuka ujian CBT siswa.
            </p>

            <div className="p-4 bg-white rounded-2xl border-2 border-indigo-100 inline-block shadow-inner">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${publishedData.title}`}
                  className="w-56 h-56 mx-auto object-contain"
                />
              )}
            </div>

            <div className="text-[11px] font-mono text-indigo-700 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
              Kode Ujian: <b>{publishedData.id}</b>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <a
                href={qrDataUrl}
                download={`QR_CBT_${publishedData.id}.png`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar QR</span>
              </a>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
