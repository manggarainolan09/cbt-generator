import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface MathFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (formula: string) => void;
}

const MATH_SNIPPETS = [
  { label: 'Pecahan', code: '\\frac{a}{b}' },
  { label: 'Pangkat', code: 'x^{2}' },
  { label: 'Akar Kuadrat', code: '\\sqrt{x}' },
  { label: 'Akar Pangkat n', code: '\\sqrt[n]{x}' },
  { label: 'Integral', code: '\\int_{a}^{b} f(x) \\, dx' },
  { label: 'Matriks 2x2', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
  { label: 'Simbol Yunani', code: '\\alpha, \\beta, \\pi, \\theta' },
  { label: 'Jumlah / Sigma', code: '\\sum_{i=1}^{n} x_i' },
  { label: 'Limit', code: '\\lim_{x \\to 0} f(x)' },
  { label: 'Pertidaksamaan', code: 'x \\ge 10 \\quad x \\le 5' },
  { label: 'Persentase', code: '25\\%' },
  { label: 'Derajat Celcius', code: '100^\\circ\\text{C}' }
];

export const MathFormulaModal: React.FC<MathFormulaModalProps> = ({
  isOpen,
  onClose,
  onInsert
}) => {
  const [currentLatex, setCurrentLatex] = useState('\\frac{a}{b}');

  useEffect(() => {
    if (isOpen && (window as any).renderMathInElement) {
      setTimeout(() => {
        const previewEl = document.getElementById('mathPreviewBox');
        if (previewEl) {
          (window as any).renderMathInElement(previewEl, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false }
            ],
            throwOnError: false
          });
        }
      }, 50);
    }
  }, [currentLatex, isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onInsert(`$${currentLatex}$`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold">Asisten Rumus Matematika (KaTeX / LaTeX)</h3>
            <p className="text-[11px] text-slate-400">Pilih template atau ketik formula LaTeX untuk disisipkan ke soal</p>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2">Pilih Contoh Rumus Populer:</label>
            <div className="grid grid-cols-3 gap-2">
              {MATH_SNIPPETS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentLatex(s.code)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                    currentLatex === s.code
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Kode LaTeX:</label>
            <textarea
              rows={2}
              value={currentLatex}
              onChange={(e) => setCurrentLatex(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl font-mono text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ketikkan kode LaTeX..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Pratinjau Hasil Rumus:</label>
            <div
              id="mathPreviewBox"
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl min-h-[70px] flex items-center justify-center text-lg text-slate-900 font-medium"
            >
              $${currentLatex}$$
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
            >
              Batal
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Sisipkan ke Soal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
