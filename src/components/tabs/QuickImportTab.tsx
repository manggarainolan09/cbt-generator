import React, { useState } from 'react';
import { FileText, Sparkles, Check, HelpCircle } from 'lucide-react';
import { Question } from '../../types/cbt';

interface QuickImportTabProps {
  onAppendQuestions: (qs: Question[]) => void;
  onNavigateToQuestions: () => void;
}

export const QuickImportTab: React.FC<QuickImportTabProps> = ({
  onAppendQuestions,
  onNavigateToQuestions
}) => {
  const [rawText, setRawText] = useState('');

  const parseTextToQuestions = (txt: string): Question[] => {
    const lines = txt.split(/\r?\n/);
    const out: Question[] = [];
    let cur: any = null;

    const reQ = /^\s*(\d+)\s*[.)]\s+(.*)$/;
    const reO = /^\s*([A-Fa-f])\s*[.)]\s+(.*)$/;
    const reA = /^\s*(jawaban|kunci)\s*[:=]\s*(.+)$/i;
    const reBS = /^\s*[\(\[]\s*([BbSs])\s*[\)\]]\s*(.+)$/;
    const reJD = /^\s*(.+?)\s*=>\s*(.+)$/;
    const reT = /^\s*tipe\s*[:=]\s*(.+)$/i;

    function pushCur() {
      if (!cur) return;
      const q = cur.q.trim();
      if (cur.bs && cur.bs.length) {
        out.push({ t: 'bs', q, st: cur.bs, s: 'partial', w: 1 });
      } else if (cur.jd && cur.jd.length) {
        out.push({ t: 'jd', q, pairs: cur.jd, s: 'partial', w: 1 });
      } else if (cur.o && cur.o.length >= 2 && cur.type !== 'ur' && cur.type !== 'isi') {
        const keys = String(cur.key || '').toUpperCase().split(/[,|;\s]+/).filter(Boolean);
        const idxs = keys.map((k: string) => k.charCodeAt(0) - 65).filter((n: number) => n >= 0 && n < cur.o.length);
        if (idxs.length > 1 || cur.type === 'pgk') {
          out.push({ t: 'pgk', q, o: cur.o, a: idxs, s: 'partial', w: 1 });
        } else {
          out.push({ t: 'pg', q, o: cur.o, a: idxs.length ? idxs[0] : 0, w: 1 });
        }
      } else if (cur.type === 'ur' || /^(uraian|essay)$/i.test(cur.key)) {
        out.push({ t: 'ur', q, w: 2 });
      } else {
        out.push({ t: 'isi', q, a: cur.key, w: 1 });
      }
    }

    lines.forEach((ln) => {
      if (!ln.trim()) return;
      let m;
      if ((m = reQ.exec(ln))) {
        if (cur) pushCur();
        cur = { q: m[2].trim(), o: [], bs: [], jd: [], key: '', type: '', w: 1 };
        return;
      }
      if (!cur) return;
      if ((m = reT.exec(ln))) {
        cur.type = m[1].trim().toLowerCase();
        return;
      }
      if ((m = reA.exec(ln))) {
        cur.key = m[2].trim();
        return;
      }
      if ((m = reBS.exec(ln))) {
        cur.bs.push({ s: m[2].trim(), a: /b/i.test(m[1]) });
        return;
      }
      if ((m = reO.exec(ln))) {
        cur.o.push(m[2].trim());
        return;
      }
      if (!cur.o.length && (m = reJD.exec(ln))) {
        cur.jd.push({ l: m[1].trim(), r: m[2].trim() });
        return;
      }
      cur.q += (cur.q ? '\n' : '') + ln.trim();
    });

    if (cur) pushCur();
    return out;
  };

  const handleProcessImport = () => {
    if (!rawText.trim()) {
      alert('Teks soal masih kosong!');
      return;
    }

    const parsed = parseTextToQuestions(rawText);
    if (!parsed.length) {
      alert('Format teks tidak dikenali. Silakan periksa contoh format di bawah.');
      return;
    }

    onAppendQuestions(parsed);
    setRawText('');
    alert(`Berhasil menambahkan ${parsed.length} soal ke Bank Soal!`);
    onNavigateToQuestions();
  };

  const handleLoadSample = () => {
    setRawText(`1. Pilihan Ganda
Ibu kota negara Indonesia adalah ...
A. Bandung
B. Jakarta
C. Surabaya
D. Medan
Jawaban: B

2. PG Kompleks
Manakah yang merupakan bilangan prima? (petunjuk: $x > 1$)
A. 2
B. 3
C. 4
D. 5
Jawaban: A,B,D

3. Benar/Salah
Tentukan kebenaran pernyataan berikut:
(B) Bumi mengelilingi Matahari dalam waktu 1 tahun
(S) Air membeku pada suhu 100 derajat Celcius

4. Menjodohkan
Pasangkan negara berikut dengan ibu kotanya:
Jepang => Tokyo
Mesir => Kairo
Prancis => Paris

5. Isian Singkat
Simbol unsur kimia untuk emas adalah ...
Jawaban: Au|emas|gold

6. Uraian
Jelaskan proses daur air (siklus hidrologi) secara singkat!
Tipe: uraian`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>Impor Soal Cepat dari Teks / Word</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tempel teks naskah ujian dan biarkan sistem mengubahnya menjadi soal terstruktur otomatis
            </p>
          </div>

          <button
            onClick={handleLoadSample}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            Muat Contoh Teks Format
          </button>
        </div>

        {/* Textarea */}
        <textarea
          rows={12}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Tempelkan soal berformat teks di sini..."
          className="w-full p-4 font-mono text-xs border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Mendukung format nomor 1., A., B., Kunci: A, (B)/(S), dan Menjodohkan {'=>'}
          </span>
          <button
            onClick={handleProcessImport}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Konversi & Tambahkan ke Bank Soal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
