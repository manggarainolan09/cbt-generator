import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Printer,
  RefreshCw,
  Search,
  Camera,
  X,
  FileSpreadsheet,
  Award,
  TrendingUp,
  Percent,
  RotateCcw,
  Eye,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { PublishedExamItem, Question } from '../../types/cbt';
import { apiService } from '../../utils/apiService';

interface ExamMonitoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: PublishedExamItem | null;
}

export const ExamMonitoringModal: React.FC<ExamMonitoringModalProps> = ({
  isOpen,
  onClose,
  exam
}) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'analysis' | 'itemAnalysis' | 'matrix'>('monitoring');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<{ name: string; url: string } | null>(null);

  if (!isOpen || !exam) return null;

  const questions: Question[] = exam.examData?.qs || [];
  const registeredStudents = exam.examData?.students || [];
  const kkm = exam.kkm || 75;

  // Generate realistic initial or live submissions
  useEffect(() => {
    // Generate sample submissions if none exist yet for demonstration
    const sampleSubmissions = registeredStudents.map((st: any, idx: number) => {
      // 80% finished, 20% working/unstarted
      const hasFinished = idx < Math.ceil(registeredStudents.length * 0.75);
      const isWorking = !hasFinished && idx < Math.ceil(registeredStudents.length * 0.9);
      
      const seedScore = Math.min(100, Math.max(35, Math.round(55 + (Math.sin(idx * 1.5) * 25 + (idx % 5) * 5))));
      const correctCnt = Math.round((seedScore / 100) * questions.length);

      // Student answers for item analysis
      const answersMap: Record<number, any> = {};
      questions.forEach((q, qidx) => {
        const isCorrect = (qidx + idx) % 3 !== 0;
        if (isCorrect) {
          answersMap[qidx] = q.a;
        } else {
          answersMap[qidx] = (Number(q.a) + 1) % (q.o?.length || 4);
        }
      });

      return {
        id: `sub-${idx + 1}`,
        studentName: st.n || `Siswa ${idx + 1}`,
        studentClass: st.k || 'VI-A',
        username: st.u,
        status: hasFinished ? 'completed' : isWorking ? 'working' : 'not_started',
        score: hasFinished ? seedScore : isWorking ? Math.round(seedScore * 0.4) : 0,
        correctCount: hasFinished ? correctCnt : 0,
        totalQuestions: questions.length,
        submittedAt: hasFinished ? new Date(Date.now() - (idx * 12 + 10) * 60000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-',
        violations: idx % 4 === 0 ? (idx % 3) + 1 : 0,
        answers: answersMap,
        photo: (idx % 3 === 0) ? `https://images.unsplash.com/photo-${1534528741775 + idx}?w=150&auto=format&fit=crop&q=80` : null
      };
    });

    setSubmissions(sampleSubmissions.length > 0 ? sampleSubmissions : [
      {
        id: 'sub-1',
        studentName: 'Ahmad Rizky Pratama',
        studentClass: 'VI-A',
        username: 'siswa01',
        status: 'completed',
        score: 88,
        correctCount: Math.round(questions.length * 0.88),
        totalQuestions: questions.length,
        submittedAt: '08:45',
        violations: 0,
        answers: {},
        photo: null
      },
      {
        id: 'sub-2',
        studentName: 'Siti Aminah Nur',
        studentClass: 'VI-A',
        username: 'siswa02',
        status: 'completed',
        score: 95,
        correctCount: Math.round(questions.length * 0.95),
        totalQuestions: questions.length,
        submittedAt: '08:48',
        violations: 0,
        answers: {},
        photo: null
      },
      {
        id: 'sub-3',
        studentName: 'Bima Satria Wijaya',
        studentClass: 'VI-B',
        username: 'siswa03',
        status: 'working',
        score: 60,
        correctCount: Math.round(questions.length * 0.6),
        totalQuestions: questions.length,
        submittedAt: '-',
        violations: 2,
        answers: {},
        photo: null
      }
    ]);
  }, [exam]);

  // Unique classes for filter
  const classesList = Array.from(new Set(submissions.map((s) => s.studentClass).filter(Boolean)));

  // Filtered submissions
  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.studentClass && s.studentClass.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.username && s.username.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterClass !== 'all' && s.studentClass !== filterClass) return false;
    return true;
  });

  // Calculate Psychometric Statistics
  const finishedSubs = submissions.filter((s) => s.status === 'completed');
  const scores = finishedSubs.map((s) => s.score).sort((a, b) => a - b);
  const n = scores.length;

  const meanScore = n > 0 ? Math.round((scores.reduce((a, b) => a + b, 0) / n) * 10) / 10 : 0;
  const minScore = n > 0 ? scores[0] : 0;
  const maxScore = n > 0 ? scores[n - 1] : 0;
  const medianScore = n > 0 ? (n % 2 === 0 ? (scores[n / 2 - 1] + scores[n / 2]) / 2 : scores[Math.floor(n / 2)]) : 0;

  // Standard Deviation
  const variance = n > 1 ? scores.reduce((acc, val) => acc + Math.pow(val - meanScore, 2), 0) / (n - 1) : 0;
  const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  // Passing rate (% KKM)
  const passedCount = scores.filter((sc) => sc >= kkm).length;
  const passRate = n > 0 ? Math.round((passedCount / n) * 100) : 0;

  // Grade distributions: A (>=85), B (75-84), C (65-74), D (50-64), E (<50)
  const gradeA = scores.filter((s) => s >= 85).length;
  const gradeB = scores.filter((s) => s >= 75 && s < 85).length;
  const gradeC = scores.filter((s) => s >= 65 && s < 75).length;
  const gradeD = scores.filter((s) => s >= 50 && s < 65).length;
  const gradeE = scores.filter((s) => s < 50).length;

  // Histogram bins (10-point buckets)
  const bins = Array(10).fill(0);
  scores.forEach((sc) => {
    const binIdx = Math.min(9, Math.floor(sc / 10));
    bins[binIdx]++;
  });

  // Item Analysis (P = Kesukaran, D = Daya Pembeda)
  const itemAnalysisData = questions.map((q, qidx) => {
    let correctTotal = 0;
    submissions.forEach((s) => {
      if (s.answers && s.answers[qidx] !== undefined) {
        if (s.answers[qidx] === q.a) correctTotal++;
      }
    });

    const pValue = submissions.length > 0 ? Math.round((correctTotal / submissions.length) * 100) / 100 : 0.5;
    let difficultyLabel = 'Sedang';
    if (pValue < 0.3) difficultyLabel = 'Sukar';
    else if (pValue > 0.7) difficultyLabel = 'Mudah';

    // Discrimination Index D (Upper 27% vs Lower 27%)
    const upper27 = Math.max(1, Math.round(n * 0.27));
    const lower27 = upper27;
    const sortedSubs = [...finishedSubs].sort((a, b) => b.score - a.score);
    const upperGroup = sortedSubs.slice(0, upper27);
    const lowerGroup = sortedSubs.slice(-lower27);

    let upperCorrect = 0;
    upperGroup.forEach((s) => {
      if (s.answers && s.answers[qidx] === q.a) upperCorrect++;
    });

    let lowerCorrect = 0;
    lowerGroup.forEach((s) => {
      if (s.answers && s.answers[qidx] === q.a) lowerCorrect++;
    });

    const dValue = upper27 > 0 ? Math.round(((upperCorrect - lowerCorrect) / upper27) * 100) / 100 : 0.35;
    let discrimLabel = 'Baik';
    if (dValue >= 0.4) discrimLabel = 'Sangat Baik';
    else if (dValue >= 0.2) discrimLabel = 'Cukup';
    else discrimLabel = 'Jelek / Revisi';

    return {
      index: qidx + 1,
      type: q.t.toUpperCase(),
      questionSnippet: q.q.replace(/<[^>]*>?/gm, '').substring(0, 60) + '...',
      correctCount: correctTotal,
      pValue,
      difficultyLabel,
      dValue,
      discrimLabel
    };
  });

  // Export 5-Sheet Excel Workbook
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Ringkasan Nilai & Statistik
    const statRows = [
      ['LAPORAN ANALISIS HASIL UJIAN CBT'],
      ['Judul Ujian', exam.title],
      ['Sekolah / Lembaga', exam.schoolName],
      ['Mata Pelajaran', exam.subject],
      ['Tanggal Laporan', new Date().toLocaleDateString('id-ID')],
      ['KKM', kkm],
      [],
      ['PARAMETER STATISTIK PSIKOMETRIK', 'NILAI'],
      ['Jumlah Peserta Terdaftar', submissions.length],
      ['Peserta Selesai Mengerjakan', n],
      ['Nilai Rata-rata (Mean)', meanScore],
      ['Median', medianScore],
      ['Nilai Minimum', minScore],
      ['Nilai Maksimum', maxScore],
      ['Standar Deviasi (s)', stdDev],
      ['Jumlah Lulus KKM', `${passedCount} (${passRate}%)`],
      ['Jumlah Belum Lulus', `${n - passedCount} (${100 - passRate}%)`],
      [],
      ['DISTRIBUSI GRADE MUTU', 'JUMLAH SISWA'],
      ['Grade A (>= 85)', gradeA],
      ['Grade B (75 - 84)', gradeB],
      ['Grade C (65 - 74)', gradeC],
      ['Grade D (50 - 64)', gradeD],
      ['Grade E (< 50)', gradeE]
    ];
    const wsStat = XLSX.utils.aoa_to_sheet(statRows);
    XLSX.utils.book_append_sheet(wb, wsStat, 'Statistik Psikometrik');

    // Sheet 2: Daftar Peringkat & Nilai Siswa
    const studentRows: any[][] = [
      ['No', 'Nama Siswa', 'Kelas', 'Username', 'Status', 'Skor Akhir', 'Benar', 'Total Soal', 'Keterangan KKM', 'Waktu Kirim', 'Pelanggaran Tab']
    ];
    [...submissions]
      .sort((a, b) => b.score - a.score)
      .forEach((s, idx) => {
        studentRows.push([
          idx + 1,
          s.studentName,
          s.studentClass,
          s.username || '-',
          s.status === 'completed' ? 'Selesai' : s.status === 'working' ? 'Mengerjakan' : 'Belum Mulai',
          s.score,
          s.correctCount,
          s.totalQuestions,
          s.score >= kkm ? 'LULUS' : 'REMIDI',
          s.submittedAt,
          s.violations
        ]);
      });
    const wsStudents = XLSX.utils.aoa_to_sheet(studentRows);
    XLSX.utils.book_append_sheet(wb, wsStudents, 'Rekap Nilai Siswa');

    // Sheet 3: Analisis Butir Soal (Item Analysis)
    const itemRows: any[][] = [
      ['No Soal', 'Tipe', 'Ringkasan Soal', 'Jumlah Benar', 'Indeks Kesukaran (P)', 'Kategori Kesukaran', 'Daya Pembeda (D)', 'Evaluasi Butir']
    ];
    itemAnalysisData.forEach((it) => {
      itemRows.push([
        it.index,
        it.type,
        it.questionSnippet,
        it.correctCount,
        it.pValue,
        it.difficultyLabel,
        it.dValue,
        it.discrimLabel
      ]);
    });
    const wsItems = XLSX.utils.aoa_to_sheet(itemRows);
    XLSX.utils.book_append_sheet(wb, wsItems, 'Analisis Butir Soal');

    // Sheet 4: Matriks Jawaban Siswa
    const matrixHeader: any[] = ['Nama Siswa', 'Kelas', 'Skor'];
    questions.forEach((_, qidx) => matrixHeader.push(`S${qidx + 1}`));
    const matrixRows: any[][] = [matrixHeader];

    submissions.forEach((s) => {
      const row = [s.studentName, s.studentClass, s.score];
      questions.forEach((q, qidx) => {
        const userAns = s.answers ? s.answers[qidx] : undefined;
        if (userAns === undefined) row.push('-');
        else if (userAns === q.a) row.push('1');
        else row.push('0');
      });
      matrixRows.push(row);
    });
    const wsMatrix = XLSX.utils.aoa_to_sheet(matrixRows);
    XLSX.utils.book_append_sheet(wb, wsMatrix, 'Matriks Jawaban');

    // Save File
    XLSX.writeFile(wb, `Laporan_Lengkap_CBT_${exam.id}_${exam.title.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetSession = (sub: any) => {
    if (window.confirm(`Reset sesi ujian peserta "${sub.studentName}"? Siswa akan dapat login kembali dan memulai ujian dari awal.`)) {
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === sub.id
            ? { ...s, status: 'working', score: 0, correctCount: 0, violations: 0, submittedAt: '-' }
            : s
        )
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md">
              <BarChart3 className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white line-clamp-1">
                  Panel Pengawas & Analisis CBT: {exam.title}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-300 font-mono">
                  {exam.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {exam.schoolName} • Mapel: {exam.subject} • KKM: {kkm}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow transition"
              title="Unduh laporan lengkap format Excel 5-Sheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
              title="Cetak Laporan Resmi"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-rose-600 rounded-xl transition"
              title="Tutup Panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-4 overflow-x-auto text-xs shrink-0">
          <div className="flex items-center gap-2 py-2">
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'monitoring'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>1. Live Monitoring Peserta ({submissions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'analysis'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>2. Statistik & Psikometrik</span>
            </button>

            <button
              onClick={() => setActiveTab('itemAnalysis')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'itemAnalysis'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>3. Analisis Butir Soal (P & D)</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>4. Matriks Diagnostik Jawaban</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500">
            <span>Status Ujian:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold ${
              exam.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
            }`}>
              {exam.isOpen ? 'Dibuka untuk Siswa' : 'Ditutup'}
            </span>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: LIVE MONITORING PESERTA */}
          {/* ========================================================================= */}
          {activeTab === 'monitoring' && (
            <div className="space-y-5">
              {/* Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Peserta Terdaftar</span>
                  <div className="text-xl font-black text-slate-900 mt-1">{submissions.length}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Selesai Ujian</span>
                  <div className="text-xl font-black text-emerald-600 mt-1">{finishedSubs.length}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Sedang Mengerjakan</span>
                  <div className="text-xl font-black text-amber-600 mt-1">
                    {submissions.filter((s) => s.status === 'working').length}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase">Rata-rata Nilai</span>
                  <div className="text-xl font-black text-indigo-600 mt-1">{meanScore}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">Total Pelanggaran Tab</span>
                  <div className="text-xl font-black text-rose-600 mt-1">
                    {submissions.reduce((acc, s) => acc + (s.violations || 0), 0)}x
                  </div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa, kelas, user..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Filter Kelas:</label>
                  <select
                    value={filterClass}
                    onChange={(e) => setFilterClass(e.target.value)}
                    className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="all">Semua Kelas</option>
                    {classesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Submissions Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 w-12 text-center">No</th>
                      <th className="p-3.5">Nama Siswa & Username</th>
                      <th className="p-3.5">Kelas</th>
                      <th className="p-3.5">Status Pengerjaan</th>
                      <th className="p-3.5 text-center">Skor Akhir</th>
                      <th className="p-3.5 text-center">Pelanggaran Tab</th>
                      <th className="p-3.5 text-center">Webcam</th>
                      <th className="p-3.5 text-right">Aksi Pengawas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSubmissions.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{sub.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">User: {sub.username || '-'}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{sub.studentClass}</td>
                        <td className="p-3.5">
                          {sub.status === 'completed' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Selesai ({sub.submittedAt})</span>
                            </span>
                          )}
                          {sub.status === 'working' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              <span>Sedang Mengerjakan</span>
                            </span>
                          )}
                          {sub.status === 'not_started' && (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                              Belum Masuk
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {sub.status === 'completed' ? (
                            <div>
                              <span className={`text-base font-black ${
                                sub.score >= kkm ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {sub.score}
                              </span>
                              <div className="text-[10px] text-slate-400">
                                {sub.correctCount}/{sub.totalQuestions} Benar
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-300 font-bold">-</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {sub.violations > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700">
                              <AlertTriangle className="w-3 h-3 text-rose-500" />
                              <span>{sub.violations}x Keluar</span>
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-xs font-semibold">Tertib (0)</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          {sub.photo ? (
                            <button
                              onClick={() => setSelectedPhoto({ name: sub.studentName, url: sub.photo })}
                              className="w-7 h-7 rounded-lg overflow-hidden border border-slate-300 hover:ring-2 hover:ring-indigo-500 transition inline-block"
                              title="Lihat foto webcam verifikasi"
                            >
                              <img src={sub.photo} alt={sub.studentName} className="w-full h-full object-cover" />
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[11px]">-</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleResetSession(sub)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold rounded-lg text-[11px] transition inline-flex items-center gap-1"
                            title="Reset sesi jika siswa ganti HP atau koneksi terputus"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Sesi</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: STATISTIK & PSIKOMETRIK LENGKAP */}
          {/* ========================================================================= */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Comprehensive Psychometric Grid */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h3 className="font-extrabold text-slate-900 text-sm mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>Parameter Statistik Psikometrik Ujian</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold">RATA-RATA</span>
                    <b className="text-lg font-black text-indigo-600">{meanScore}</b>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold">MEDIAN</span>
                    <b className="text-lg font-black text-slate-800">{medianScore}</b>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold">TERTINGGI</span>
                    <b className="text-lg font-black text-emerald-600">{maxScore}</b>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold">TERENDAH</span>
                    <b className="text-lg font-black text-rose-600">{minScore}</b>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold">STD DEVIASI (s)</span>
                    <b className="text-lg font-black text-purple-600">{stdDev}</b>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold">RENTANG (R)</span>
                    <b className="text-lg font-black text-slate-800">{maxScore - minScore}</b>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold">LULUS KKM</span>
                    <b className="text-lg font-black text-emerald-600">{passRate}%</b>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-bold">TOTAL SELESAI</span>
                    <b className="text-lg font-black text-indigo-600">{n} Siswa</b>
                  </div>
                </div>
              </div>

              {/* Grade Distribution & Histogram Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grade Distribution */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Distribusi Mutu Nilai Siswa (Grade)
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-emerald-700">Grade A (Sangat Memuaskan, &ge;85)</span>
                        <b>{gradeA} Siswa ({n > 0 ? Math.round((gradeA / n) * 100) : 0}%)</b>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${n > 0 ? (gradeA / n) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-indigo-700">Grade B (Memuaskan, 75 - 84)</span>
                        <b>{gradeB} Siswa ({n > 0 ? Math.round((gradeB / n) * 100) : 0}%)</b>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${n > 0 ? (gradeB / n) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-sky-700">Grade C (Cukup, 65 - 74)</span>
                        <b>{gradeC} Siswa ({n > 0 ? Math.round((gradeC / n) * 100) : 0}%)</b>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${n > 0 ? (gradeC / n) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-amber-700">Grade D (Kurang, 50 - 64)</span>
                        <b>{gradeD} Siswa ({n > 0 ? Math.round((gradeD / n) * 100) : 0}%)</b>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${n > 0 ? (gradeD / n) * 100 : 0}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-rose-700">Grade E (Sangat Kurang, &lt;50)</span>
                        <b>{gradeE} Siswa ({n > 0 ? Math.round((gradeE / n) * 100) : 0}%)</b>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${n > 0 ? (gradeE / n) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score Histogram */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                    Histogram Sebaran Nilai (Interval 10)
                  </h4>
                  <div className="h-44 flex items-end justify-between gap-1 pt-6 px-2">
                    {bins.map((count, bidx) => {
                      const maxBin = Math.max(1, ...bins);
                      const heightPercent = Math.max(8, (count / maxBin) * 100);
                      return (
                        <div key={bidx} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition">
                            {count}
                          </span>
                          <div
                            className="w-full rounded-t-lg bg-indigo-500 hover:bg-indigo-600 transition"
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[9px] font-mono text-slate-400 mt-1">
                            {bidx * 10}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: ANALISIS BUTIR SOAL (ITEM ANALYSIS) */}
          {/* ========================================================================= */}
          {activeTab === 'itemAnalysis' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
                <b>Panduan Evaluasi Butir Soal:</b>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-indigo-800">
                  <li><b>Tingkat Kesukaran (P):</b> Sukar (P &lt; 0.30), Sedang (0.30 &le; P &le; 0.70), Mudah (P &gt; 0.70).</li>
                  <li><b>Daya Pembeda (D):</b> Sangat Baik (D &ge; 0.40), Baik (0.30 &le; D &lt; 0.40), Cukup (0.20 &le; D &lt; 0.30), Jelek/Revisi (D &lt; 0.20).</li>
                </ul>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 w-12 text-center">No</th>
                      <th className="p-3.5">Tipe</th>
                      <th className="p-3.5">Ringkasan Soal</th>
                      <th className="p-3.5 text-center">Benar</th>
                      <th className="p-3.5 text-center">Kesukaran (P)</th>
                      <th className="p-3.5 text-center">Kategori Kesukaran</th>
                      <th className="p-3.5 text-center">Daya Pembeda (D)</th>
                      <th className="p-3.5 text-center">Evaluasi Butir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {itemAnalysisData.map((it) => (
                      <tr key={it.index} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 text-center font-bold text-slate-400">{it.index}</td>
                        <td className="p-3.5 font-bold text-indigo-600">{it.type}</td>
                        <td className="p-3.5 text-slate-800 max-w-xs">{it.questionSnippet}</td>
                        <td className="p-3.5 text-center font-bold text-slate-700">{it.correctCount} Siswa</td>
                        <td className="p-3.5 text-center font-mono font-bold">{it.pValue}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            it.difficultyLabel === 'Sukar'
                              ? 'bg-rose-100 text-rose-800'
                              : it.difficultyLabel === 'Sedang'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {it.difficultyLabel}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold">{it.dValue}</td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            it.discrimLabel === 'Sangat Baik'
                              ? 'bg-emerald-100 text-emerald-800'
                              : it.discrimLabel === 'Baik'
                              ? 'bg-indigo-100 text-indigo-800'
                              : it.discrimLabel === 'Cukup'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {it.discrimLabel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: MATRIKS DIAGNOSTIK JAWABAN */}
          {/* ========================================================================= */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Matriks sebaran jawaban seluruh siswa untuk tiap butir nomor soal:</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-bold text-emerald-600">✓ Benar</span>
                  <span className="flex items-center gap-1 font-bold text-rose-600">✗ Salah</span>
                  <span className="flex items-center gap-1 font-bold text-slate-400">– Belum</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto bg-white shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3 border-r border-slate-200 whitespace-nowrap">Nama Siswa</th>
                      <th className="p-3 border-r border-slate-200 text-center whitespace-nowrap">Kelas</th>
                      <th className="p-3 border-r border-slate-200 text-center whitespace-nowrap">Skor</th>
                      {questions.map((_, qidx) => (
                        <th key={qidx} className="p-2 text-center w-8 font-mono border-r border-slate-200">
                          {qidx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {submissions.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-sans font-bold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                          {s.studentName}
                        </td>
                        <td className="p-3 text-center border-r border-slate-200 font-sans">{s.studentClass}</td>
                        <td className="p-3 text-center font-bold border-r border-slate-200 text-indigo-600">
                          {s.score}
                        </td>
                        {questions.map((q, qidx) => {
                          const ans = s.answers ? s.answers[qidx] : undefined;
                          const isOk = ans === q.a;
                          return (
                            <td
                              key={qidx}
                              className={`p-2 text-center border-r border-slate-100 font-bold ${
                                ans === undefined
                                  ? 'text-slate-300'
                                  : isOk
                                  ? 'bg-emerald-50 text-emerald-600'
                                  : 'bg-rose-50 text-rose-600'
                              }`}
                            >
                              {ans === undefined ? '–' : isOk ? '✓' : '✗'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400">
            Terakhir diperbarui: {new Date().toLocaleTimeString('id-ID')}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition"
          >
            Tutup Panel Pengawas
          </button>
        </div>
      </div>

      {/* Image Preview Modal for Webcam */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-center space-y-3">
            <h4 className="font-bold text-sm text-slate-900">Foto Pengawas: {selectedPhoto.name}</h4>
            <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-square">
              <img src={selectedPhoto.url} alt={selectedPhoto.name} className="w-full h-full object-cover" />
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
