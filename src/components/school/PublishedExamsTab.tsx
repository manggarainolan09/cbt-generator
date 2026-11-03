import React, { useState, useEffect } from 'react';
import {
  FileText,
  Share2,
  Copy,
  Check,
  QrCode,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Download,
  PlusCircle,
  MessageCircle,
  Users,
  BarChart3
} from 'lucide-react';
import QRCode from 'qrcode';
import { PublishedExamItem, SchoolAccount } from '../../types/cbt';
import { apiService } from '../../utils/apiService';
import { buildCBTHTML } from '../../utils/htmlGenerator';
import { ExamMonitoringModal } from '../monitoring/ExamMonitoringModal';

interface PublishedExamsTabProps {
  school: SchoolAccount;
  onOpenCreateExam: () => void;
  onOpenExamPlayer: (examId: string) => void;
}

export const PublishedExamsTab: React.FC<PublishedExamsTabProps> = ({
  school,
  onOpenCreateExam,
  onOpenExamPlayer
}) => {
  const [exams, setExams] = useState<PublishedExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // QR Modal
  const [qrModalExam, setQrModalExam] = useState<PublishedExamItem | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Monitoring & Analysis Modal
  const [monitoringExam, setMonitoringExam] = useState<PublishedExamItem | null>(null);

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPublishedExams(school.id);
      setExams(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, [school.id]);

  const handleCopyLink = (examId: string) => {
    const fullUrl = `${window.location.origin}/?exam=${examId}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(examId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleShowQR = async (exam: PublishedExamItem) => {
    setQrModalExam(exam);
    const fullUrl = `${window.location.origin}/?exam=${exam.id}`;
    try {
      const url = await QRCode.toDataURL(fullUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#1e1b4b', light: '#ffffff' }
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (exam: PublishedExamItem) => {
    try {
      const res = await apiService.toggleExamStatus(exam.id);
      if (res.success) {
        setExams((prev) =>
          prev.map((e) => (e.id === exam.id ? { ...e, isOpen: !e.isOpen } : e))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (exam: PublishedExamItem) => {
    if (!window.confirm(`Hapus publikasi ujian "${exam.title}"? Siswa tidak akan dapat mengakses tautan ini lagi.`)) {
      return;
    }
    try {
      const res = await apiService.deleteExam(exam.id);
      if (res.success) {
        setExams((prev) => prev.filter((e) => e.id !== exam.id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadHtml = (exam: PublishedExamItem) => {
    if (!exam.examData) {
      alert('Data paket ujian tidak tersedia untuk diunduh mandiri.');
      return;
    }
    const html = buildCBTHTML(exam.examData);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exam.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${exam.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-xs uppercase tracking-wider">
            Portal Publikasi CBT Online
          </span>
          <h2 className="text-2xl sm:text-3xl font-black mt-2">
            Katalog Ujian Terbit Sekolah
          </h2>
          <p className="text-sm text-indigo-100 mt-1 max-w-xl">
            Semua ujian CBT yang Anda publikasikan dapat langsung diakses siswa melalui tautan online, QR Code, atau diunduh sebagai file HTML mandiri.
          </p>
        </div>

        <button
          onClick={onOpenCreateExam}
          className="px-5 py-3 bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <span>Buat Ujian CBT Baru</span>
        </button>
      </div>

      {/* List of Published Exams */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Memuat katalog ujian terbit...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Belum Ada Ujian yang Dipublikasikan</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Mulai susun bank soal dan konfigurasi ujian Anda di menu <b>Generator CBT</b>, lalu klik tombol <b>Terbitkan Ujian Sekarang (Publish Online)</b>.
          </p>
          <button
            onClick={onOpenCreateExam}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Mulai Buat Ujian Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => {
            const fullUrl = `${window.location.origin}/?exam=${exam.id}`;
            const waShareText = `Halo siswa/siswi, berikut adalah tautan pengerjaan Ujian CBT: "${exam.title}" (${exam.subject}).\n\nSilakan klik tautan berikut untuk memulai:\n${fullUrl}\n\nSelamat mengerjakan & semoga sukses!`;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-mono tracking-wider">
                        {exam.id}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-base mt-2 line-clamp-1">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-500">{exam.subject} • KKM: {exam.kkm}</p>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(exam)}
                      className="shrink-0 p-1 rounded-lg hover:bg-slate-100 transition"
                      title={exam.isOpen ? 'Klik untuk menutup ujian sementara' : 'Klik untuk membuka ujian'}
                    >
                      {exam.isOpen ? (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                          <span>Dibuka</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                          <span>Ditutup</span>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* Metadata Grid */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">SOAL</span>
                      <b className="text-slate-800 font-bold">{exam.questionCount} Butir</b>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">DURASI</span>
                      <b className="text-slate-800 font-bold">{exam.duration} Menit</b>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">PESERTA</span>
                      <b className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{exam.submissionCount || 0}</span>
                      </b>
                    </div>
                  </div>

                  {exam.token && (
                    <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-2">
                      <span>Token Akses Ruang:</span>
                      <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                        {exam.token}
                      </span>
                    </div>
                  )}
                </div>

                {/* Quick Share Link Box */}
                <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-indigo-900 font-semibold">
                    <span>Tautan Pengerjaan Siswa:</span>
                    <button
                      onClick={() => handleCopyLink(exam.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 text-[11px]"
                    >
                      {copiedId === exam.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Link</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={fullUrl}
                    className="w-full px-2.5 py-1.5 text-[11px] bg-white border border-indigo-200 rounded-lg text-slate-700 font-mono select-all focus:outline-none"
                  />
                </div>

                {/* Action Buttons Row */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  {/* Primary: Monitoring & Analisis */}
                  <button
                    onClick={() => setMonitoringExam(exam)}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2"
                    title="Buka panel monitoring dan analisis psikometrik hasil ujian"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-200" />
                    <span>📊 Monitoring & Analisis Ujian</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenExamPlayer(exam.id)}
                      className="flex-1 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                      title="Buka ujian siswa langsung di browser"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka Ujian Siswa</span>
                    </button>

                    <button
                      onClick={() => handleShowQR(exam)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                      title="Lihat & Unduh QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(waShareText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl transition"
                      title="Bagikan ke WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      onClick={() => handleDownloadHtml(exam)}
                      className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 text-[11px]"
                      title="Simpan sebagai file HTML mandiri"
                    >
                      <Download className="w-3 h-3" />
                      <span>Unduh File .HTML</span>
                    </button>

                    <button
                      onClick={() => handleDelete(exam)}
                      className="text-slate-400 hover:text-rose-600 transition p-1"
                      title="Hapus publikasi ujian"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalExam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-scale-up">
            <h3 className="font-extrabold text-slate-900 text-base">{qrModalExam.title}</h3>
            <p className="text-xs text-slate-500">
              Pindai QR Code ini menggunakan kamera HP untuk langsung masuk ke ruang ujian CBT.
            </p>

            <div className="p-4 bg-white rounded-2xl border-2 border-indigo-100 inline-block shadow-inner">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${qrModalExam.title}`}
                  className="w-56 h-56 mx-auto object-contain"
                />
              )}
            </div>

            <div className="text-[11px] font-mono text-indigo-700 bg-indigo-50 p-2 rounded-xl border border-indigo-100">
              Kode Ujian: <b>{qrModalExam.id}</b>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <a
                href={qrDataUrl}
                download={`QR_CBT_${qrModalExam.id}.png`}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar QR</span>
              </a>
              <button
                type="button"
                onClick={() => setQrModalExam(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Proctor Monitoring & Psychometric Analysis Modal */}
      <ExamMonitoringModal
        isOpen={!!monitoringExam}
        onClose={() => setMonitoringExam(null)}
        exam={monitoringExam}
      />
    </div>
  );
};
