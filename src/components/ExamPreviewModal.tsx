import React, { useState, useEffect } from 'react';
import { AppState, Question } from '../types/cbt';
import { 
  X, Clock, AlertTriangle, CheckCircle, Flag, ChevronLeft, ChevronRight, 
  Send, Sparkles, RefreshCw, Smartphone, Monitor
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExamPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const ExamPreviewModal: React.FC<ExamPreviewModalProps> = ({
  isOpen,
  onClose,
  state
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(state.cfg.duration ? state.cfg.duration * 60 : 3600);
  const [isFinished, setIsFinished] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  const questions = state.qs;
  const currentQ: Question | undefined = questions[currentIdx];

  useEffect(() => {
    if (!isOpen) {
      setCurrentIdx(0);
      setAnswers({});
      setFlags({});
      setIsFinished(false);
      setTimeLeft(state.cfg.duration ? state.cfg.duration * 60 : 3600);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, state.cfg.duration]);

  // Render KaTeX after question changes
  useEffect(() => {
    if (isOpen && (window as any).renderMathInElement) {
      setTimeout(() => {
        (window as any).renderMathInElement(document.body, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }, 50);
    }
  }, [currentIdx, isOpen, isFinished]);

  if (!isOpen) return null;

  const handleSelectOption = (qIdx: number, optIdx: number, isMulti = false) => {
    if (isMulti) {
      const cur = (answers[qIdx] || []) as number[];
      const next = cur.includes(optIdx) ? cur.filter(x => x !== optIdx) : [...cur, optIdx];
      setAnswers({ ...answers, [qIdx]: next });
    } else {
      setAnswers({ ...answers, [qIdx]: optIdx });
    }
  };

  const handleSetBS = (qIdx: number, statementIdx: number, value: boolean) => {
    const cur = answers[qIdx] || {};
    setAnswers({
      ...answers,
      [qIdx]: { ...cur, [statementIdx]: value }
    });
  };

  const handleSetJD = (qIdx: number, leftIdx: number, rightVal: string) => {
    const cur = answers[qIdx] || {};
    setAnswers({
      ...answers,
      [qIdx]: { ...cur, [leftIdx]: rightVal }
    });
  };

  const handleToggleFlag = (qIdx: number) => {
    setFlags({ ...flags, [qIdx]: !flags[qIdx] });
  };

  const calculateScore = () => {
    let totalScore = 0;
    let totalWeight = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let emptyCount = 0;

    questions.forEach((q, idx) => {
      const w = q.w || 1;
      totalWeight += w;
      const ans = answers[idx];

      if (ans === undefined || ans === '' || (Array.isArray(ans) && ans.length === 0)) {
        emptyCount++;
        return;
      }

      if (q.t === 'pg') {
        if (ans === q.a) {
          totalScore += w;
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (q.t === 'pgk') {
        const correctKeys = (q.a || []) as number[];
        const userKeys = (ans || []) as number[];
        const isMatch = correctKeys.length === userKeys.length && correctKeys.every(k => userKeys.includes(k));
        if (isMatch) {
          totalScore += w;
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (q.t === 'bs') {
        const statements = q.st || [];
        const isAllCorrect = statements.every((s, i) => ans[i] === s.a);
        if (isAllCorrect) {
          totalScore += w;
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (q.t === 'jd') {
        const pairs = q.pairs || [];
        const isAllMatch = pairs.every((p, i) => ans[i] === p.r);
        if (isAllMatch) {
          totalScore += w;
          correctCount++;
        } else {
          wrongCount++;
        }
      } else if (q.t === 'isi') {
        const accepted = String(q.a || '').split('|').map(s => s.trim().toLowerCase());
        if (accepted.includes(String(ans).trim().toLowerCase())) {
          totalScore += w;
          correctCount++;
        } else {
          wrongCount++;
        }
      } else {
        // Uraian
        correctCount++;
        totalScore += w;
      }
    });

    const finalPercent = totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0;
    return { finalPercent, correctCount, wrongCount, emptyCount };
  };

  const handleFinish = () => {
    setIsFinished(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const formatTimer = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h > 0 ? `${h}:` : ''}${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-5 bg-slate-950/85 backdrop-blur-md">
      <div className={`w-full bg-slate-50 border border-slate-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
        deviceMode === 'mobile' ? 'max-w-md h-[92vh]' : 'max-w-6xl h-[92vh]'
      }`}>
        {/* Simulator Control Bar */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold text-white">Simulasi Ujian CBT Interaktif (Tampilan Siswa)</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition ${
                  deviceMode === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Layar Komputer/Laptop"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition ${
                  deviceMode === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Tampilan Smartphone"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isFinished ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Student Exam Header */}
            <div 
              style={{ backgroundColor: state.cfg.themePrimary || '#4f46e5' }}
              className="text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0"
            >
              <div className="flex items-center gap-3 truncate">
                {state.cfg.logo && (
                  <img src={state.cfg.logo} alt="Logo" className="h-7 w-auto object-contain bg-white/90 p-0.5 rounded" />
                )}
                <div>
                  <h1 className="text-sm font-bold truncate">{state.cfg.title}</h1>
                  <p className="text-[11px] text-white/80">{state.cfg.subject} &bull; Ahmad Rizky (Siswa)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl font-mono text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTimer(timeLeft)}</span>
                </div>
                <button
                  onClick={handleFinish}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition"
                >
                  Selesai
                </button>
              </div>
            </div>

            {/* Exam Main Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden p-4 gap-4">
              {/* Question & Options Column */}
              <div className={`${deviceMode === 'mobile' ? 'col-span-1' : 'lg:col-span-9'} flex flex-col overflow-y-auto space-y-4`}>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5">
                  {/* Question Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Soal Nomor {currentIdx + 1} dari {questions.length}
                    </span>
                    {flags[currentIdx] && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                        Ragu-ragu
                      </span>
                    )}
                  </div>

                  {/* Question Stem */}
                  {currentQ && (
                    <div 
                      className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed q-content"
                      dangerouslySetInnerHTML={{ __html: currentQ.q }}
                    />
                  )}

                  {/* Image Stimulus */}
                  {currentQ?.img && (
                    <div className="pt-2">
                      <img 
                        src={currentQ.img} 
                        alt="Stimulus Soal" 
                        className="max-h-64 rounded-xl border border-slate-200 object-contain"
                      />
                    </div>
                  )}

                  {/* Options by Question Type */}
                  <div className="pt-3 space-y-3">
                    {currentQ?.t === 'pg' && (
                      <div className="space-y-2.5">
                        {currentQ.o?.map((opt, oIdx) => {
                          const isSelected = answers[currentIdx] === oIdx;
                          return (
                            <div
                              key={oIdx}
                              onClick={() => handleSelectOption(currentIdx, oIdx, false)}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                                  : 'border-slate-200 hover:border-indigo-200 bg-white'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <div 
                                className="text-sm text-slate-800 q-content flex-1 pt-0.5"
                                dangerouslySetInnerHTML={{ __html: opt }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {currentQ?.t === 'pgk' && (
                      <div className="space-y-2.5">
                        <p className="text-xs text-slate-500 italic mb-2">Pilih satu atau beberapa jawaban yang benar:</p>
                        {currentQ.o?.map((opt, oIdx) => {
                          const isSelected = ((answers[currentIdx] || []) as number[]).includes(oIdx);
                          return (
                            <div
                              key={oIdx}
                              onClick={() => handleSelectOption(currentIdx, oIdx, true)}
                              className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                                  : 'border-slate-200 hover:border-indigo-200 bg-white'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <div 
                                className="text-sm text-slate-800 q-content flex-1 pt-0.5"
                                dangerouslySetInnerHTML={{ __html: opt }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {currentQ?.t === 'bs' && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-100 border-b">
                              <th className="p-3 text-left font-bold text-slate-700">Pernyataan</th>
                              <th className="p-3 w-16 text-center font-bold text-slate-700">Benar</th>
                              <th className="p-3 w-16 text-center font-bold text-slate-700">Salah</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentQ.st?.map((stmt, sIdx) => {
                              const val = answers[currentIdx]?.[sIdx];
                              return (
                                <tr key={sIdx} className="border-b last:border-b-0 hover:bg-slate-50">
                                  <td className="p-3 text-slate-800">{stmt.s}</td>
                                  <td className="p-2 text-center">
                                    <button
                                      onClick={() => handleSetBS(currentIdx, sIdx, true)}
                                      className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                                        val === true ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-100'
                                      }`}
                                    >
                                      B
                                    </button>
                                  </td>
                                  <td className="p-2 text-center">
                                    <button
                                      onClick={() => handleSetBS(currentIdx, sIdx, false)}
                                      className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                                        val === false ? 'bg-rose-600 text-white border-rose-600' : 'bg-white hover:bg-slate-100'
                                      }`}
                                    >
                                      S
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {currentQ?.t === 'jd' && (
                      <div className="space-y-2.5">
                        {currentQ.pairs?.map((pair, pIdx) => {
                          const val = answers[currentIdx]?.[pIdx] || '';
                          return (
                            <div key={pIdx} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 border rounded-xl bg-slate-50/50">
                              <div className="flex-1 text-sm font-semibold text-slate-800">{pair.l}</div>
                              <span className="text-slate-400 font-bold hidden sm:inline">&rarr;</span>
                              <select
                                value={val}
                                onChange={(e) => handleSetJD(currentIdx, pIdx, e.target.value)}
                                className="flex-1 text-xs border rounded-lg p-2.5 bg-white font-medium outline-none"
                              >
                                <option value="">-- Pilih Jawaban --</option>
                                {currentQ?.pairs?.map((optPair, oIdx) => (
                                  <option key={oIdx} value={optPair.r}>{optPair.r}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {currentQ?.t === 'isi' && (
                      <input
                        type="text"
                        value={answers[currentIdx] || ''}
                        onChange={(e) => setAnswers({ ...answers, [currentIdx]: e.target.value })}
                        placeholder="Ketikkan jawaban singkat..."
                        className="w-full p-3.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    )}

                    {currentQ?.t === 'ur' && (
                      <textarea
                        rows={4}
                        value={answers[currentIdx] || ''}
                        onChange={(e) => setAnswers({ ...answers, [currentIdx]: e.target.value })}
                        placeholder="Tuliskan uraian jawaban..."
                        className="w-full p-3.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      />
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                      disabled={currentIdx === 0}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs disabled:opacity-40 transition"
                    >
                      &larr; Sebelumnya
                    </button>

                    <button
                      onClick={() => handleToggleFlag(currentIdx)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                        flags[currentIdx] ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Tandai Ragu
                    </button>

                    {currentIdx < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentIdx(currentIdx + 1)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition"
                      >
                        Berikutnya &rarr;
                      </button>
                    ) : (
                      <button
                        onClick={handleFinish}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition"
                      >
                        Kumpulkan Jawaban
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Number Grid Sidebar (3 Cols in Desktop) */}
              {deviceMode === 'desktop' && (
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-sm">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Navigasi Nomor Soal
                    </h3>
                    <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto p-1">
                      {questions.map((_, idx) => {
                        const isAnswered = answers[idx] !== undefined && answers[idx] !== '';
                        const isFlagged = flags[idx];
                        const isActive = idx === currentIdx;

                        let bg = 'bg-slate-100 text-slate-700';
                        if (isFlagged) bg = 'bg-amber-400 text-white';
                        else if (isAnswered) bg = 'bg-emerald-500 text-white';

                        return (
                          <button
                            key={idx}
                            onClick={() => setCurrentIdx(idx)}
                            className={`h-9 rounded-lg text-xs font-bold transition ${bg} ${
                              isActive ? 'ring-2 ring-offset-2 ring-indigo-600 font-black' : ''
                            }`}
                          >
                            {idx + 1}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t text-xs text-slate-500 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-emerald-500 rounded"></span> Terjawab ({Object.keys(answers).length})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-amber-400 rounded"></span> Ragu-ragu ({Object.values(flags).filter(Boolean).length})
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-slate-200 rounded"></span> Belum ({questions.length - Object.keys(answers).length})
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Finished Score Report Screen */
          <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
            <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                🎓
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Ujian Telah Selesai!</h2>
                <p className="text-xs text-slate-500 mt-1">Hasil simulasi pengerjaan Anda berhasil dinilai secara otomatis.</p>
              </div>

              {(() => {
                const res = calculateScore();
                const isPassed = res.finalPercent >= state.cfg.kkm;
                return (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="text-5xl font-black text-indigo-600 font-mono">
                      {res.finalPercent}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Nilai Akhir Ujian ({isPassed ? 'LULUS KKM' : 'DI BAWAH KKM'})
                    </div>
                    <div className="pt-3 border-t grid grid-cols-3 gap-2 text-xs">
                      <div><b>{res.correctCount}</b> Benar</div>
                      <div><b>{res.wrongCount}</b> Salah</div>
                      <div><b>{res.emptyCount}</b> Kosong</div>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsFinished(false);
                    setCurrentIdx(0);
                    setAnswers({});
                    setFlags({});
                  }}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Ulangi Simulasi Ujian</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Tutup Simulator
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
