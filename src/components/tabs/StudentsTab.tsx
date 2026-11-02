import React, { useState, useRef } from 'react';
import { 
  Users, UserPlus, Upload, Printer, Trash2, Search, 
  FileSpreadsheet, Check, Download, AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { AppState, Student } from '../../types/cbt';
import { printLoginCards } from '../../utils/printUtils';

interface StudentsTabProps {
  state: AppState;
  onUpdateStudents: (students: Student[]) => void;
  onUpdateAuthMode: (mode: 'free' | 'list') => void;
}

export const StudentsTab: React.FC<StudentsTabProps> = ({
  state,
  onUpdateStudents,
  onUpdateAuthMode
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualImportBox, setShowManualImportBox] = useState(false);
  const [manualText, setManualText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const students = state.students;
  const isAccountMode = state.cfg.authMode === 'list';

  const filteredStudents = students.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return s.u.toLowerCase().includes(q) || s.n.toLowerCase().includes(q) || s.k.toLowerCase().includes(q);
  });

  const handleAddStudent = () => {
    const nextNum = students.length + 1;
    const newStudent: Student = {
      u: `siswa${String(nextNum).padStart(2, '0')}`,
      p: '12345',
      n: `Siswa Baru ${nextNum}`,
      k: 'VI-A'
    };
    onUpdateStudents([...students, newStudent]);
  };

  const handleUpdateStudent = (idx: number, field: keyof Student, val: string) => {
    const next = [...students];
    next[idx] = { ...next[idx], [field]: val };
    onUpdateStudents(next);
  };

  const handleDeleteStudent = (idx: number) => {
    onUpdateStudents(students.filter((_, i) => i !== idx));
  };

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh akun peserta?')) {
      onUpdateStudents([]);
    }
  };

  // Excel / CSV file parser using xlsx
  const handleExcelUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rows.length) {
          alert('File Excel kosong!');
          return;
        }

        // Determine if first row is header
        let startRow = 0;
        const firstCell = String(rows[0][0] || '').toLowerCase();
        if (firstCell.includes('user') || firstCell.includes('nis') || firstCell.includes('nama')) {
          startRow = 1;
        }

        const newStudents: Student[] = [];
        for (let i = startRow; i < rows.length; i++) {
          const r = rows[i];
          const u = String(r[0] || '').trim();
          const p = String(r[1] || '').trim();
          const n = String(r[2] || '').trim() || u;
          const k = String(r[3] || '').trim() || '-';

          if (u && p) {
            newStudents.push({ u, p, n, k });
          }
        }

        if (newStudents.length > 0) {
          onUpdateStudents([...students, ...newStudents]);
          alert(`Berhasil menambahkan ${newStudents.length} akun peserta dari file Excel!`);
        } else {
          alert('Tidak ada baris siswa valid (username dan password wajib diisi).');
        }
      } catch (err: any) {
        alert('Gagal membaca file Excel/CSV: ' + (err.message || String(err)));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessManualText = () => {
    if (!manualText.trim()) return;
    const lines = manualText.split(/\r?\n/);
    const added: Student[] = [];

    lines.forEach(ln => {
      const parts = ln.split(/,|\t|;/);
      if (parts.length >= 2) {
        const u = parts[0].trim();
        const p = parts[1].trim();
        const n = parts[2] ? parts[2].trim() : u;
        const k = parts[3] ? parts[3].trim() : '-';
        if (u && p) {
          added.push({ u, p, n, k });
        }
      }
    });

    if (added.length) {
      onUpdateStudents([...students, ...added]);
      setManualText('');
      setShowManualImportBox(false);
      alert(`Berhasil menambahkan ${added.length} peserta.`);
    }
  };

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      ['username', 'password', 'nama', 'kelas'],
      ['siswa01', '12345', 'Ahmad Fauzi', 'VI-A'],
      ['siswa02', '12345', 'Siti Nurhaliza', 'VI-A'],
      ['siswa03', '12345', 'Budi Santoso', 'VI-B'],
      ['siswa04', '12345', 'Dewi Lestari', 'VI-C']
    ]);
    ws['!cols'] = [{ wch: 16 }, { wch: 16 }, { wch: 28 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Peserta');
    XLSX.writeFile(wb, 'Template_Roster_Siswa_CBT.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* 1. Auth Mode Selector */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Metode Autentikasi Masuk Siswa</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Tentukan bagaimana siswa mengidentifikasi dirinya saat memulai ujian
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label 
            onClick={() => onUpdateAuthMode('free')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
              !isAccountMode
                ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="authMode"
              checked={!isAccountMode}
              onChange={() => onUpdateAuthMode('free')}
              className="mt-1"
            />
            <div>
              <span className="block text-sm font-bold text-slate-900">1. Mode Bebas (Ketik Mandiri)</span>
              <span className="text-xs text-slate-500 mt-0.5 block leading-relaxed">
                Siswa cukup mengetikkan Nama Lengkap, Kelas, dan Asal Sekolah tanpa perlu akun dan password khusus.
              </span>
            </div>
          </label>

          <label 
            onClick={() => onUpdateAuthMode('list')}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${
              isAccountMode
                ? 'border-indigo-600 bg-indigo-50/60 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="authMode"
              checked={isAccountMode}
              onChange={() => onUpdateAuthMode('list')}
              className="mt-1"
            />
            <div>
              <span className="block text-sm font-bold text-slate-900">2. Mode Login Akun (Direkomendasikan)</span>
              <span className="text-xs text-slate-500 mt-0.5 block leading-relaxed">
                Siswa wajib memasukkan Username & Password terdaftar yang dicetak pada kartu akses ujian resmi.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Roster Management Area */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Daftar Akun Peserta Ujian</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total <b>{students.length}</b> peserta terdaftar
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => printLoginCards(state)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu Login A4</span>
            </button>

            <button
              onClick={handleAddStudent}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Manual</span>
            </button>

            <button
              onClick={() => setShowManualImportBox(!showManualImportBox)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Impor Excel / Teks</span>
            </button>

            {students.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition"
              >
                Kosongkan
              </button>
            )}
          </div>
        </div>

        {/* Excel & Manual Drag and Drop Zone */}
        {showManualImportBox && (
          <div className="p-5 bg-slate-50 border border-slate-300 rounded-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Impor Roster Peserta dari File Excel atau Teks</span>
              <button
                onClick={handleDownloadTemplate}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template Excel (.xlsx)</span>
              </button>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files?.[0]) {
                  handleExcelUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition ${
                isDragging
                  ? 'border-indigo-600 bg-indigo-50/80'
                  : 'border-emerald-400/80 bg-white hover:bg-emerald-50/40'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                onChange={(e) => e.target.files?.[0] && handleExcelUpload(e.target.files[0])}
                className="hidden"
              />
              <span className="text-3xl">📊</span>
              <p className="text-xs font-bold text-emerald-800 mt-2">
                Klik atau Tarik File Excel (.xlsx / .xls / .csv) ke sini
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Format kolom: username, password, nama, kelas
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600">
                Atau Tempel Baris Teks Manual (Pemisah Koma atau Tab):
              </label>
              <textarea
                rows={3}
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="siswa01, 12345, Ahmad Rizky, VI-A&#10;siswa02, 12345, Siti Aminah, VI-A"
                className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-xl bg-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowManualImportBox(false)}
                  className="px-3 py-1.5 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={handleProcessManualText}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                >
                  Proses Teks
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari username, nama, atau kelas..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>

        {/* Student Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3 w-40">Username</th>
                  <th className="p-3 w-32">Password</th>
                  <th className="p-3">Nama Lengkap Siswa</th>
                  <th className="p-3 w-36">Kelas / Ruang</th>
                  <th className="p-3 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                      Tidak ada data siswa yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s, idx) => {
                    const realIdx = students.indexOf(s);
                    return (
                      <tr key={realIdx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-center text-slate-400 font-mono">{realIdx + 1}</td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={s.u}
                            onChange={(e) => handleUpdateStudent(realIdx, 'u', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-xs font-semibold text-indigo-700 bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={s.p}
                            onChange={(e) => handleUpdateStudent(realIdx, 'p', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg font-mono text-xs text-slate-700 bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={s.n}
                            onChange={(e) => handleUpdateStudent(realIdx, 'n', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={s.k}
                            onChange={(e) => handleUpdateStudent(realIdx, 'k', e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteStudent(realIdx)}
                            className="w-7 h-7 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 inline-flex items-center justify-center transition"
                            title="Hapus baris siswa ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
