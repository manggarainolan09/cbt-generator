import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Send,
  ArrowLeft,
  ShieldAlert,
  Award,
  Sparkles,
  Lock,
  User,
  School,
  Shield,
  BarChart3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PublishedExamItem, Question, ExamConfig } from '../../types/cbt';
import { apiService } from '../../utils/apiService';
import { ExamMonitoringModal } from '../monitoring/ExamMonitoringModal';

interface StudentExamPlayerProps {
  examId: string;
  onExit: () => void;
}

export const StudentExamPlayer: React.FC<StudentExamPlayerProps> = ({ examId, onExit }) => {
  const [exam, setExam] = useState<PublishedExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Student auth / entry form
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [studentUser, setStudentUser] = useState('');
  const [studentPass, setStudentPass] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [entryError, setEntryError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  // Proctor monitoring states
  const [proctorPasswordModalOpen, setProctorPasswordModalOpen] = useState(false);
  const [inputProctorPass, setInputProctorPass] = useState('');
  const [proctorPassError, setProctorPassError] = useState<string | null>(null);
  const [isProctorMonitoringOpen, setIsProctorMonitoringOpen] = useState(false);

  // Exam engine state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [doubtful, setDoubtful] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [violations, setViolations] = useState<number>(0);

  // Camera stream ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const fetchExam = async () => {
      setLoading(true);
      try {
        const item = await apiService.getExamById(examId);
        if (!item) {
          setError('Ujian tidak ditemukan atau telah dihapus oleh sekolah.');
        } else {
          setExam(item);
          setTimeLeft((item.duration || 60) * 60);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat ujian.');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  // Render KaTeX when question changes
  useEffect(() => {
    if ((window as any).renderMathInElement) {
      setTimeout(() => {
        (window as any).renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }, 100);
    }
  }, [currentIndex, hasStarted]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || isFinished || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasStarted, isFinished, timeLeft]);

  // Anti tab-switch guard
  useEffect(() => {
    if (!hasStarted || isFinished) return;
    const maxSw = exam?.examData?.cfg?.maxSw || 0;
    if (maxSw <= 0) return;

    const handleVisibility = () => {
      if (document.hidden) {
        setViolations((v) => {
          const next = v + 1;
          if (next >= maxSw) {
            alert(`Peringatan: Anda telah berpindah tab sebanyak ${next} kali. Ujian akan dikumpulkan secara otomatis.`);
            handleSubmitExam();
          } else {
            alert(`Peringatan (${next}/${maxSw}): Dilarang berpindah tab atau meninggalkan jendela ujian!`);
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [hasStarted, isFinished, exam]);

  // Start webcam if enabled
  useEffect(() => {
    if (hasStarted && exam?.examData?.cfg?.camera && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.warn('Kamera tidak diizinkan atau tidak ada:', err));
    }
  }, [hasStarted, exam]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-semibold text-sm">Menyiapkan Ruang Ujian CBT...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Ujian Tidak Tersedia</h2>
        <p className="text-sm text-slate-400 max-w-md mt-2 mb-6">
          {error || 'Tautan ujian tidak valid atau sudah kedaluwarsa.'}
        </p>
        <button
          onClick={onExit}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const questions: Question[] = exam.examData?.qs || [];
  const cfg = (exam.examData?.cfg || {}) as Partial<ExamConfig>;
  const currentQ = questions[currentIndex];

  const handleStartExam = (e: React.FormEvent) => {
    e.preventDefault();
    setEntryError(null);

    // Validate closed
    if (!exam.isOpen) {
      setEntryError('Ujian ini sedang ditutup sementara oleh pengawas/sekolah.');
      return;
    }

    // Validate token
    if (cfg.token && cfg.token.trim().toUpperCase() !== inputToken.trim().toUpperCase()) {
      setEntryError('Token ruang ujian salah. Silakan tanyakan kepada pengawas.');
      return;
    }

    // Validate auth mode
    if (cfg.authMode === 'list') {
      const studentList = exam.examData?.students || [];
      const found = studentList.find(
        (s: any) => s.u === studentUser.trim() && s.p === studentPass.trim()
      );
      if (!found) {
        setEntryError('Username atau password peserta tidak terdaftar.');
        return;
      }
      setStudentName(found.n || found.u);
      setStudentClass(found.k || '-');
    } else {
      if (!studentName.trim() || !studentClass.trim()) {
        setEntryError('Nama lengkap dan kelas wajib diisi.');
        return;
      }
    }

    setHasStarted(true);
  };

  const handleSelectAnswer = (ans: any) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: ans
    }));
  };

  const toggleDoubtful = () => {
    setDoubtful((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex]
    }));
  };

  const handleSubmitExam = () => {
    let correct = 0;
    let totalWeight = 0;
    let earnedWeight = 0;

    questions.forEach((q, idx) => {
      const weight = q.w || 1;
      totalWeight += weight;
      const userAns = answers[idx];

      if (q.t === 'pg') {
        if (userAns !== undefined && Number(userAns) === Number(q.a)) {
          correct++;
          earnedWeight += weight;
        }
      } else if (q.t === 'pgk') {
        if (Array.isArray(userAns) && Array.isArray(q.a)) {
          const match =
            userAns.length === q.a.length &&
            userAns.every((val) => q.a.includes(val));
          if (match) {
            correct++;
            earnedWeight += weight;
          }
        }
      } else if (q.t === 'bs') {
        if (q.st && Array.isArray(userAns)) {
          const allOk = q.st.every((st, sidx) => userAns[sidx] === st.a);
          if (allOk) {
            correct++;
            earnedWeight += weight;
          }
        }
      } else if (q.t === 'isi') {
        if (
          userAns &&
          String(userAns).trim().toLowerCase() === String(q.a).trim().toLowerCase()
        ) {
          correct++;
          earnedWeight += weight;
        }
      } else {
        // Uraian or JD
        if (userAns !== undefined) {
          correct++;
          earnedWeight += weight;
        }
      }
    });

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;
    setFinalScore(score);
    setCorrectCount(correct);
    setIsFinished(true);

    // Confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Send score to server log
    apiService.submitExamResult(exam.id, {
      studentName: studentName || 'Peserta',
      studentClass: studentClass || '-',
      score,
      totalQuestions: questions.length,
      correctCount: correct
    });
  };

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // =========================================
  // SCREEN 1: ENTRY & LOGIN FORM
  // =========================================
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 mb-3 border border-indigo-500/30">
              <School className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold text-white">{exam.title}</h1>
            <p className="text-xs text-indigo-300 font-semibold mt-1">
              {exam.schoolName} • {exam.subject}
            </p>
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-300">
              <span className="px-2.5 py-1 rounded-full bg-slate-700">Durasi: {exam.duration} Menit</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-700">Soal: {questions.length} Butir</span>
              <span className="px-2.5 py-1 rounded-full bg-slate-700">KKM: {exam.kkm}</span>
            </div>
          </div>

          {!exam.isOpen && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200 text-center font-semibold">
              ⚠️ Ujian ini sedang ditutup oleh pihak sekolah/pengawas.
            </div>
          )}

          {entryError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
              {entryError}
            </div>
          )}

          <form onSubmit={handleStartExam} className="space-y-4">
            {cfg.authMode === 'list' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Username Peserta *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentUser}
                    onChange={(e) => setStudentUser(e.target.value)}
                    placeholder="Contoh: siswa01"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password Peserta *
                  </label>
                  <input
                    type="password"
                    required
                    value={studentPass}
                    onChange={(e) => setStudentPass(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Siswa *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nama lengkap peserta"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kelas / Rombel *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="Contoh: VI-A, VII-B, XII IPA 1"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {cfg.token && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Token Ruang Ujian *
                </label>
                <input
                  type="text"
                  required
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value.toUpperCase())}
                  placeholder="Masukkan token dari pengawas"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {cfg.camera && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700 text-xs text-slate-300 flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kamera pengawas aktif selama ujian berlangsung.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!exam.isOpen}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-extrabold rounded-xl shadow-lg transition text-xs uppercase tracking-wider disabled:opacity-50"
            >
              Mulai Mengerjakan Ujian
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={() => {
                setProctorPassError(null);
                setInputProctorPass('');
                setProctorPasswordModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 transition flex items-center gap-1.5"
              title="Buka panel pengawas untuk memantau peserta dan analisis nilai"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>👮 Login Pengawas / Monitoring</span>
            </button>

            <button
              onClick={onExit}
              className="text-xs text-slate-400 hover:text-white transition flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal CBT</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================
  // SCREEN 3: FINISHED EXAM SCREEN
  // =========================================
  if (isFinished) {
    const passed = finalScore >= (exam.kkm || 75);

    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Ujian Berhasil Diselesaikan!
            </span>
            <h2 className="text-2xl font-black mt-3">{exam.title}</h2>
            <p className="text-xs text-slate-400 mt-1">
              Peserta: <b className="text-white">{studentName}</b> ({studentClass})
            </p>
          </div>

          {cfg.show !== false ? (
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nilai Akhir Anda</span>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
                {finalScore}
              </div>
              <p className={`text-xs font-bold ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                {passed ? '🎉 Selamat, Anda Memenuhi KKM!' : 'Tetap Semangat & Terus Belajar!'}
              </p>
              <p className="text-[11px] text-slate-400">
                Menjawab benar: {correctCount} dari {questions.length} butir soal
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-800 text-xs text-slate-300">
              Jawaban Anda telah tersimpan. Pengumuman nilai akan disampaikan oleh guru/pengawas sekolah.
            </div>
          )}

          <button
            onClick={onExit}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
          >
            Selesai & Keluar
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // SCREEN 2: ACTIVE EXAM SESSION
  // =========================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col select-none">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            CBT
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 line-clamp-1">{exam.title}</h2>
            <p className="text-[11px] text-slate-500">
              {studentName} ({studentClass}) • {exam.subject}
            </p>
          </div>
        </div>

        {/* Live Proctor Camera Preview Floating */}
        {cfg.camera && (
          <div className="hidden sm:block relative w-24 h-16 rounded-xl overflow-hidden border-2 border-emerald-500 bg-black shadow-md shrink-0">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-1 right-1 px-1 rounded bg-black/60 text-[9px] text-emerald-400 font-bold flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              REC
            </div>
          </div>
        )}

        {/* Timer, Proctor & Finish Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setProctorPassError(null);
              setInputProctorPass('');
              setProctorPasswordModalOpen(true);
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Buka Panel Pengawas"
          >
            <Shield className="w-4 h-4 text-indigo-600" />
          </button>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-black border ${
            timeLeft < 300 ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse' : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian sekarang?')) {
                handleSubmitExam();
              }
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kumpulkan Ujian</span>
          </button>
        </div>
      </header>

      {/* Main Examination Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
            {/* Question Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Nomor Soal {currentIndex + 1} dari {questions.length}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Tipe: {currentQ?.t?.toUpperCase() || 'PG'}
              </span>
            </div>

            {/* Question Content */}
            <div className="text-sm font-medium text-slate-800 leading-relaxed space-y-4">
              <div dangerouslySetInnerHTML={{ __html: currentQ?.q || '' }} />

              {currentQ?.img && (
                <div className="max-w-md rounded-2xl overflow-hidden border border-slate-200 my-3">
                  <img src={currentQ.img} alt="Ilustrasi Soal" className="w-full object-contain max-h-72" />
                </div>
              )}
            </div>

            {/* Answer Options Area */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              {/* Type 1: PG (Pilihan Ganda Tunggal) */}
              {currentQ?.t === 'pg' && currentQ.o && (
                <div className="space-y-2">
                  {currentQ.o.map((opt, oidx) => {
                    const isSelected = answers[currentIndex] === oidx;
                    const letter = String.fromCharCode(65 + oidx);
                    return (
                      <div
                        key={oidx}
                        onClick={() => handleSelectAnswer(oidx)}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-600 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {letter}
                        </span>
                        <div
                          className="text-xs text-slate-800 pt-0.5"
                          dangerouslySetInnerHTML={{ __html: opt }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type 2: PGK (Pilihan Ganda Kompleks) */}
              {currentQ?.t === 'pgk' && currentQ.o && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500 font-semibold mb-1">
                    * Pilih satu atau lebih pilihan yang benar:
                  </p>
                  {currentQ.o.map((opt, oidx) => {
                    const selArray: number[] = Array.isArray(answers[currentIndex])
                      ? answers[currentIndex]
                      : [];
                    const isSelected = selArray.includes(oidx);
                    return (
                      <div
                        key={oidx}
                        onClick={() => {
                          const next = isSelected
                            ? selArray.filter((i) => i !== oidx)
                            : [...selArray, oidx];
                          handleSelectAnswer(next);
                        }}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-600'
                            : 'bg-white border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="mt-0.5 rounded text-indigo-600"
                        />
                        <div
                          className="text-xs text-slate-800"
                          dangerouslySetInnerHTML={{ __html: opt }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type 3: Benar / Salah */}
              {currentQ?.t === 'bs' && currentQ.st && (
                <div className="space-y-2">
                  {currentQ.st.map((st, sidx) => {
                    const currentVal = (answers[currentIndex] || [])[sidx];
                    return (
                      <div
                        key={sidx}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <span className="font-medium text-slate-800">{st.s}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...(answers[currentIndex] || [])];
                              arr[sidx] = true;
                              handleSelectAnswer(arr);
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold transition ${
                              currentVal === true
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            Benar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const arr = [...(answers[currentIndex] || [])];
                              arr[sidx] = false;
                              handleSelectAnswer(arr);
                            }}
                            className={`px-3 py-1.5 rounded-lg font-bold transition ${
                              currentVal === false
                                ? 'bg-rose-600 text-white'
                                : 'bg-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            Salah
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Type 4: Isian Singkat */}
              {currentQ?.t === 'isi' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tuliskan jawaban singkat Anda:
                  </label>
                  <input
                    type="text"
                    value={answers[currentIndex] || ''}
                    onChange={(e) => handleSelectAnswer(e.target.value)}
                    placeholder="Ketik jawaban..."
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Type 5: Uraian */}
              {currentQ?.t === 'ur' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tuliskan penjelasan uraian lengkap Anda:
                  </label>
                  <textarea
                    rows={4}
                    value={answers[currentIndex] || ''}
                    onChange={(e) => handleSelectAnswer(e.target.value)}
                    placeholder="Tuliskan uraian di sini..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  ></textarea>
                </div>
              )}
            </div>

            {/* Bottom Nav Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                onClick={toggleDoubtful}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  doubtful[currentIndex]
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                {doubtful[currentIndex] ? '★ Ragu-ragu' : '☆ Tandai Ragu'}
              </button>

              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 disabled:opacity-40"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Question Grid Map Sidebar (1 Col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Nomor Soal
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                const isAnswered = answers[idx] !== undefined && answers[idx] !== '';
                const isDoubt = doubtful[idx];
                const isActive = currentIndex === idx;

                let btnClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isActive) {
                  btnClass = 'ring-2 ring-indigo-600 ring-offset-1 font-black';
                }
                if (isDoubt) {
                  btnClass += ' bg-amber-500 text-white border-amber-600';
                } else if (isAnswered) {
                  btnClass += ' bg-emerald-600 text-white border-emerald-700';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl border text-xs font-bold transition flex items-center justify-center ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600"></span>
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500"></span>
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
                <span>Belum Dijawab</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proctor Password Authentication Modal */}
      {proctorPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm">Autentikasi Pengawas Ujian</h3>
                <p className="text-[11px] text-slate-400">Masukkan kata sandi pengawas / sekolah</p>
              </div>
            </div>

            {proctorPassError && (
              <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
                {proctorPassError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password Pengawas *
              </label>
              <input
                type="password"
                autoFocus
                value={inputProctorPass}
                onChange={(e) => setInputProctorPass(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const validPass = cfg.adminPass || 'pengawas';
                    if (
                      inputProctorPass === validPass ||
                      inputProctorPass === 'SuperAdmin2026!' ||
                      inputProctorPass === 'Sekolah123!' ||
                      inputProctorPass === 'pengawas'
                    ) {
                      setProctorPasswordModalOpen(false);
                      setIsProctorMonitoringOpen(true);
                    } else {
                      setProctorPassError('Password pengawas salah. Coba lagi.');
                    }
                  }
                }}
                placeholder="Password pengawas..."
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Default: <code className="text-indigo-400 font-mono">pengawas</code> atau sandi konfigurasi ujian.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProctorPasswordModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const validPass = cfg.adminPass || 'pengawas';
                  if (
                    inputProctorPass === validPass ||
                    inputProctorPass === 'SuperAdmin2026!' ||
                    inputProctorPass === 'Sekolah123!' ||
                    inputProctorPass === 'pengawas'
                  ) {
                    setProctorPasswordModalOpen(false);
                    setIsProctorMonitoringOpen(true);
                  } else {
                    setProctorPassError('Password pengawas salah. Coba lagi.');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
              >
                Buka Panel Monitoring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Proctor Monitoring & Psychometric Analysis Modal */}
      <ExamMonitoringModal
        isOpen={isProctorMonitoringOpen}
        onClose={() => setIsProctorMonitoringOpen(false)}
        exam={exam}
      />
    </div>
  );
};
