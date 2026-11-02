import React, { useState } from 'react';
import { 
  HelpCircle, Plus, Printer, Trash2, ArrowUp, ArrowDown, 
  Copy, Eye, Sparkles, Check
} from 'lucide-react';
import { AppState, Question, QuestionType } from '../../types/cbt';
import { printQuestionsPaper } from '../../utils/printUtils';
import { MathFormulaModal } from '../MathFormulaModal';
import { RichTextEditor } from '../RichTextEditor';

interface QuestionsTabProps {
  state: AppState;
  onUpdateQuestions: (qs: Question[]) => void;
  onPreviewQuestion: (idx: number) => void;
}

const TYPE_NAMES: Record<QuestionType, string> = {
  pg: 'Pilihan Ganda',
  pgk: 'PG Kompleks (Multi-Pilihan)',
  bs: 'Benar / Salah',
  jd: 'Menjodohkan',
  isi: 'Isian Singkat',
  ur: 'Uraian / Essay'
};

export const QuestionsTab: React.FC<QuestionsTabProps> = ({
  state,
  onUpdateQuestions,
  onPreviewQuestion
}) => {
  const [newQType, setNewQType] = useState<QuestionType>('pg');
  const [activeMathTarget, setActiveMathTarget] = useState<{ qIdx: number; field: 'q' | 'opt'; optIdx?: number } | null>(null);
  const questions = state.qs;

  const handleAddQuestion = (type = newQType) => {
    let newQ: Question;
    if (type === 'pg') {
      newQ = { t: 'pg', q: '', o: ['', '', '', ''], a: 0, w: 1 };
    } else if (type === 'pgk') {
      newQ = { t: 'pgk', q: '', o: ['', '', '', ''], a: [], s: 'partial', w: 1 };
    } else if (type === 'bs') {
      newQ = { t: 'bs', q: '', st: [{ s: '', a: true }, { s: '', a: false }], s: 'partial', w: 1 };
    } else if (type === 'jd') {
      newQ = { t: 'jd', q: '', pairs: [{ l: '', r: '' }, { l: '', r: '' }], s: 'partial', w: 1 };
    } else if (type === 'isi') {
      newQ = { t: 'isi', q: '', a: '', w: 1 };
    } else {
      newQ = { t: 'ur', q: '', w: 2 };
    }

    onUpdateQuestions([newQ, ...questions]);
  };

  const handleUpdateQ = (idx: number, patch: Partial<Question>) => {
    const next = [...questions];
    next[idx] = { ...next[idx], ...patch };
    onUpdateQuestions(next);
  };

  const handleDeleteQ = (idx: number) => {
    if (window.confirm('Hapus butir soal ini?')) {
      onUpdateQuestions(questions.filter((_, i) => i !== idx));
    }
  };

  const handleDuplicateQ = (idx: number) => {
    const clone = JSON.parse(JSON.stringify(questions[idx]));
    const next = [...questions];
    next.splice(idx + 1, 0, clone);
    onUpdateQuestions(next);
  };

  const handleMoveQ = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    const temp = next[idx];
    next[idx] = next[target];
    next[target] = temp;
    onUpdateQuestions(next);
  };

  const handleInsertMath = (formula: string) => {
    if (!activeMathTarget) return;
    const { qIdx, field, optIdx } = activeMathTarget;
    const q = questions[qIdx];
    if (!q) return;

    if (field === 'q') {
      handleUpdateQ(qIdx, { q: (q.q || '') + ' ' + formula });
    } else if (field === 'opt' && optIdx !== undefined && q.o) {
      const nextOptions = [...q.o];
      nextOptions[optIdx] = (nextOptions[optIdx] || '') + ' ' + formula;
      handleUpdateQ(qIdx, { o: nextOptions });
    }
    setActiveMathTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-600" />
              <span>Kelola Bank Soal & Media</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tersedia <b>{questions.length}</b> butir soal &bull; Editor mendukung <b>copas gambar langsung (Ctrl+V)</b> dan rumus LaTeX
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => printQuestionsPaper(state)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              title="Cetak lembar naskah soal tanpa kunci jawaban untuk cadangan tes kertas"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Soal Kertas</span>
            </button>

            <select
              value={newQType}
              onChange={(e) => setNewQType(e.target.value as QuestionType)}
              className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
            >
              <option value="pg">Pilihan Ganda (PG)</option>
              <option value="pgk">PG Kompleks (Multi)</option>
              <option value="bs">Benar / Salah (B/S)</option>
              <option value="jd">Menjodohkan</option>
              <option value="isi">Isian Singkat</option>
              <option value="ur">Uraian / Essay</option>
            </select>

            <button
              onClick={() => handleAddQuestion(newQType)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Soal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center space-y-3">
          <span className="text-4xl">📝</span>
          <h4 className="text-base font-bold text-slate-800">Bank Soal Masih Kosong</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Klik tombol "Tambah Soal" di atas, gunakan menu "Impor Teks Cepat", atau klik "Contoh TKA SD" untuk memuat soal siap pakai.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((q, qIdx) => (
            <div 
              key={qIdx}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5 transition hover:border-slate-300"
            >
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center font-mono">
                    #{qIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
                    {TYPE_NAMES[q.t] || q.t}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onPreviewQuestion(qIdx)}
                    className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                    title="Lihat simulasi soal ini seperti di layar siswa"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau</span>
                  </button>

                  <div className="flex items-center gap-1 text-xs text-slate-500 font-semibold bg-slate-50 px-2 py-1 rounded-lg border">
                    <span>Bobot:</span>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={q.w || 1}
                      onChange={(e) => handleUpdateQ(qIdx, { w: parseFloat(e.target.value) || 1 })}
                      className="w-12 text-center p-0.5 border rounded font-bold text-slate-800 bg-white"
                    />
                  </div>

                  <button
                    onClick={() => handleDuplicateQ(qIdx)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Duplikat Soal"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveQ(qIdx, -1)}
                    disabled={qIdx === 0}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 hover:bg-slate-100 rounded-lg transition"
                    title="Pindahkan ke Atas"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleMoveQ(qIdx, 1)}
                    disabled={qIdx === questions.length - 1}
                    className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 hover:bg-slate-100 rounded-lg transition"
                    title="Pindahkan ke Bawah"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteQ(qIdx)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Hapus Soal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Rich Text Editor for Question Stem */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Teks Pertanyaan / Stimulus (Mendukung Copas Gambar Ctrl+V):
                  </label>
                  <span className="text-[11px] text-indigo-600 font-medium">
                    💡 Tips: Tangkap layar dengan Snipping Tool lalu tekan Ctrl+V langsung di dalam kotak
                  </span>
                </div>

                <RichTextEditor
                  value={q.q || ''}
                  onChange={(val) => handleUpdateQ(qIdx, { q: val })}
                  placeholder="Tuliskan soal di sini... bisa langsung copas gambar (Ctrl+V), drag-drop foto, atau sisipkan LaTeX"
                  minHeight="120px"
                  onOpenLatex={() => setActiveMathTarget({ qIdx, field: 'q' })}
                />
              </div>

              {/* Options & Keys Area based on Question Type */}
              <div className="pt-2">
                {/* 1. Pilihan Ganda (PG) */}
                {q.t === 'pg' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Opsi Pilihan Jawaban (Pilih 1 Tombol Radio sebagai Kunci, Mendukung Teks/Gambar):
                    </label>
                    <div className="space-y-3">
                      {q.o?.map((opt, oIdx) => {
                        const isKey = q.a === oIdx;
                        return (
                          <div key={oIdx} className="flex items-start gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
                            <input
                              type="radio"
                              name={`key_pg_${qIdx}`}
                              checked={isKey}
                              onChange={() => handleUpdateQ(qIdx, { a: oIdx })}
                              className="w-4 h-4 text-indigo-600 cursor-pointer mt-3"
                              title="Tandai sebagai kunci jawaban"
                            />
                            <span className="font-bold text-xs text-indigo-600 w-5 pt-2.5">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <RichTextEditor
                                value={opt || ''}
                                onChange={(val) => {
                                  const nextO = [...(q.o || [])];
                                  nextO[oIdx] = val;
                                  handleUpdateQ(qIdx, { o: nextO });
                                }}
                                placeholder={`Teks / gambar pilihan ${String.fromCharCode(65 + oIdx)}... (Bisa copas gambar Ctrl+V)`}
                                minHeight="42px"
                                compact={true}
                                onOpenLatex={() => setActiveMathTarget({ qIdx, field: 'opt', optIdx: oIdx })}
                              />
                            </div>
                            <button
                              onClick={() => {
                                if ((q.o?.length || 0) <= 2) return alert('Minimal 2 pilihan!');
                                const nextO = q.o?.filter((_, i) => i !== oIdx);
                                handleUpdateQ(qIdx, { o: nextO, a: 0 });
                              }}
                              className="text-slate-400 hover:text-rose-500 font-bold px-1.5 pt-2.5"
                              title="Hapus pilihan"
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handleUpdateQ(qIdx, { o: [...(q.o || []), ''] })}
                      className="text-xs text-indigo-600 font-bold hover:underline pt-1 block"
                    >
                      + Tambah Opsi Pilihan
                    </button>
                  </div>
                )}

                {/* 2. PG Kompleks (PGK) */}
                {q.t === 'pgk' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Opsi Pilihan (Centang Semua Pilihan yang Benar, Mendukung Copas Gambar):
                    </label>
                    <div className="space-y-3">
                      {q.o?.map((opt, oIdx) => {
                        const correctKeys = (q.a || []) as number[];
                        const isKey = correctKeys.includes(oIdx);
                        return (
                          <div key={oIdx} className="flex items-start gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200">
                            <input
                              type="checkbox"
                              checked={isKey}
                              onChange={() => {
                                const nextKeys = isKey ? correctKeys.filter(k => k !== oIdx) : [...correctKeys, oIdx];
                                handleUpdateQ(qIdx, { a: nextKeys });
                              }}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer mt-3"
                              title="Tandai sebagai kunci benar"
                            />
                            <span className="font-bold text-xs text-indigo-600 w-5 pt-2.5">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <RichTextEditor
                                value={opt || ''}
                                onChange={(val) => {
                                  const nextO = [...(q.o || [])];
                                  nextO[oIdx] = val;
                                  handleUpdateQ(qIdx, { o: nextO });
                                }}
                                placeholder={`Teks / gambar pilihan ${String.fromCharCode(65 + oIdx)}... (Bisa copas gambar Ctrl+V)`}
                                minHeight="42px"
                                compact={true}
                                onOpenLatex={() => setActiveMathTarget({ qIdx, field: 'opt', optIdx: oIdx })}
                              />
                            </div>
                            <button
                              onClick={() => {
                                if ((q.o?.length || 0) <= 2) return alert('Minimal 2 pilihan!');
                                const nextO = q.o?.filter((_, i) => i !== oIdx);
                                handleUpdateQ(qIdx, { o: nextO });
                              }}
                              className="text-slate-400 hover:text-rose-500 font-bold px-1.5 pt-2.5"
                              title="Hapus pilihan"
                            >
                              &times;
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handleUpdateQ(qIdx, { o: [...(q.o || []), ''] })}
                      className="text-xs text-indigo-600 font-bold hover:underline pt-1 block"
                    >
                      + Tambah Opsi Pilihan
                    </button>
                  </div>
                )}

                {/* 3. Benar / Salah (BS) */}
                {q.t === 'bs' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Daftar Pernyataan & Kunci:</label>
                    <div className="space-y-2">
                      {q.st?.map((st, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border">
                          <input
                            type="text"
                            value={st.s}
                            onChange={(e) => {
                              const nextSt = [...(q.st || [])];
                              nextSt[sIdx] = { ...nextSt[sIdx], s: e.target.value };
                              handleUpdateQ(qIdx, { st: nextSt });
                            }}
                            placeholder={`Pernyataan ${sIdx + 1}...`}
                            className="flex-1 p-2 text-xs border rounded-lg bg-white"
                          />
                          <select
                            value={st.a ? 'true' : 'false'}
                            onChange={(e) => {
                              const nextSt = [...(q.st || [])];
                              nextSt[sIdx] = { ...nextSt[sIdx], a: e.target.value === 'true' };
                              handleUpdateQ(qIdx, { st: nextSt });
                            }}
                            className="p-2 border rounded-lg text-xs font-bold bg-white"
                          >
                            <option value="true">Benar (B)</option>
                            <option value="false">Salah (S)</option>
                          </select>
                          <button
                            onClick={() => {
                              if ((q.st?.length || 0) <= 1) return alert('Minimal 1 pernyataan!');
                              const nextSt = q.st?.filter((_, i) => i !== sIdx);
                              handleUpdateQ(qIdx, { st: nextSt });
                            }}
                            className="text-slate-400 hover:text-rose-500 font-bold px-1"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleUpdateQ(qIdx, { st: [...(q.st || []), { s: '', a: true }] })}
                      className="text-xs text-indigo-600 font-bold hover:underline pt-1 block"
                    >
                      + Tambah Pernyataan
                    </button>
                  </div>
                )}

                {/* 4. Menjodohkan (JD) */}
                {q.t === 'jd' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">Pasangan Kiri & Kanan:</label>
                    <div className="space-y-2">
                      {q.pairs?.map((pair, pIdx) => (
                        <div key={pIdx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border">
                          <input
                            type="text"
                            value={pair.l}
                            onChange={(e) => {
                              const nextPairs = [...(q.pairs || [])];
                              nextPairs[pIdx] = { ...nextPairs[pIdx], l: e.target.value };
                              handleUpdateQ(qIdx, { pairs: nextPairs });
                            }}
                            placeholder={`Pernyataan Kiri ${pIdx + 1}...`}
                            className="flex-1 p-2 text-xs border rounded-lg bg-white"
                          />
                          <span className="text-slate-400 font-bold">&rarr;</span>
                          <input
                            type="text"
                            value={pair.r}
                            onChange={(e) => {
                              const nextPairs = [...(q.pairs || [])];
                              nextPairs[pIdx] = { ...nextPairs[pIdx], r: e.target.value };
                              handleUpdateQ(qIdx, { pairs: nextPairs });
                            }}
                            placeholder={`Padanan Kanan ${pIdx + 1}...`}
                            className="flex-1 p-2 text-xs border rounded-lg bg-white"
                          />
                          <button
                            onClick={() => {
                              if ((q.pairs?.length || 0) <= 2) return alert('Minimal 2 pasang!');
                              const nextPairs = q.pairs?.filter((_, i) => i !== pIdx);
                              handleUpdateQ(qIdx, { pairs: nextPairs });
                            }}
                            className="text-slate-400 hover:text-rose-500 font-bold px-1"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleUpdateQ(qIdx, { pairs: [...(q.pairs || []), { l: '', r: '' }] })}
                      className="text-xs text-indigo-600 font-bold hover:underline pt-1 block"
                    >
                      + Tambah Pasangan
                    </button>
                  </div>
                )}

                {/* 5. Isian Singkat */}
                {q.t === 'isi' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Kata Kunci Jawaban Benar (Pisahkan kata kunci alternatif dengan tanda |):
                    </label>
                    <input
                      type="text"
                      value={q.a || ''}
                      onChange={(e) => handleUpdateQ(qIdx, { a: e.target.value })}
                      placeholder="Contoh: Jakarta|DKI Jakarta|ibu kota nusantara"
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl bg-white font-mono"
                    />
                  </div>
                )}

                {/* 6. Uraian */}
                {q.t === 'ur' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    ℹ️ Soal Uraian dinilai manual oleh Bapak/Ibu Guru melalui panel rekap spreadsheet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LaTeX Math Formula Assistant Modal */}
      <MathFormulaModal
        isOpen={activeMathTarget !== null}
        onClose={() => setActiveMathTarget(null)}
        onInsert={handleInsertMath}
      />
    </div>
  );
};
