import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Question } from '../types/cbt';

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentIndex: number;
  onNavigate: (idx: number) => void;
  themeColor?: string;
}

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({
  isOpen,
  onClose,
  questions,
  currentIndex,
  onNavigate,
  themeColor = '#4f46e5'
}) => {
  const q: Question | undefined = questions[currentIndex];

  useEffect(() => {
    if (isOpen && (window as any).renderMathInElement) {
      setTimeout(() => {
        const modalEl = document.getElementById('questionPreviewModalContent');
        if (modalEl) {
          (window as any).renderMathInElement(modalEl, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        }
      }, 50);
    }
  }, [currentIndex, isOpen]);

  if (!isOpen || !q) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div 
          style={{ backgroundColor: themeColor }}
          className="text-white px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-white/80" />
            <h3 className="text-sm font-bold">
              Pratinjau Tampilan Soal di Layar Siswa (Nomor {currentIndex + 1} dari {questions.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div id="questionPreviewModalContent" className="p-6 sm:p-8 overflow-y-auto space-y-5 flex-1">
          <div 
            className="text-base text-slate-800 font-medium leading-relaxed q-content"
            dangerouslySetInnerHTML={{ __html: q.q }}
          />

          {q.img && (
            <div className="pt-2">
              <img src={q.img} alt="Stimulus" className="max-h-64 rounded-xl border border-slate-200 object-contain" />
            </div>
          )}

          {/* Render Options */}
          <div className="pt-3 space-y-2.5">
            {q.t === 'pg' && (
              <div className="space-y-2">
                {q.o?.map((opt, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="w-6 h-6 rounded-lg bg-slate-200 font-bold text-xs flex items-center justify-center text-slate-700 shrink-0">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <div className="text-sm text-slate-800 q-content pt-0.5" dangerouslySetInnerHTML={{ __html: opt }} />
                  </div>
                ))}
              </div>
            )}

            {q.t === 'pgk' && (
              <div className="space-y-2">
                <span className="text-xs text-slate-400 italic">Pilihan multi-jawaban:</span>
                {q.o?.map((opt, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="w-5 h-5 rounded border-2 border-slate-300 shrink-0 mt-0.5"></span>
                    <div className="text-sm text-slate-800 q-content" dangerouslySetInnerHTML={{ __html: opt }} />
                  </div>
                ))}
              </div>
            )}

            {q.t === 'bs' && (
              <table className="w-full text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 border-b">
                    <th className="p-3 text-left">Pernyataan</th>
                    <th className="p-3 w-16 text-center">Benar</th>
                    <th className="p-3 w-16 text-center">Salah</th>
                  </tr>
                </thead>
                <tbody>
                  {q.st?.map((s, i) => (
                    <tr key={i} className="border-b last:border-b-0">
                      <td className="p-3">{s.s}</td>
                      <td className="p-2 text-center"><span className="px-2.5 py-1 border rounded font-bold">B</span></td>
                      <td className="p-2 text-center"><span className="px-2.5 py-1 border rounded font-bold">S</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {q.t === 'jd' && (
              <div className="space-y-2">
                {q.pairs?.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-xl bg-slate-50/50">
                    <div className="flex-1 text-sm font-semibold text-slate-800">{p.l}</div>
                    <span className="text-slate-400 font-bold">&rarr;</span>
                    <div className="flex-1 text-xs border rounded-lg p-2.5 bg-white text-slate-500 font-medium">
                      {p.r}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {q.t === 'isi' && (
              <input 
                type="text" 
                disabled 
                placeholder="Kotak isian singkat siswa..." 
                className="w-full p-3.5 border rounded-xl text-sm bg-slate-50"
              />
            )}

            {q.t === 'ur' && (
              <textarea 
                disabled 
                rows={4} 
                placeholder="Kotak uraian jawaban siswa..." 
                className="w-full p-3.5 border rounded-xl text-sm bg-slate-50"
              />
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t flex items-center justify-between">
          <button
            onClick={() => onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="px-4 py-2 bg-white hover:bg-slate-100 border text-slate-700 font-semibold rounded-xl text-xs disabled:opacity-40 transition flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {currentIndex + 1} / {questions.length}
          </span>

          <button
            onClick={() => onNavigate(currentIndex + 1)}
            disabled={currentIndex === questions.length - 1}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs disabled:opacity-40 transition flex items-center gap-1"
          >
            <span>Selanjutnya</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
