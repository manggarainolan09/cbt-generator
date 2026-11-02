import React from 'react';
import { Play, Sparkles, FileText, Download, Upload, RotateCcw, Shield } from 'lucide-react';
import { AppState } from '../types/cbt';

interface NavbarProps {
  state: AppState;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenVideoTutorial: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  activeTab,
  onSelectTab,
  onOpenVideoTutorial,
  onLoadSample,
  onReset,
  onExportJSON,
  onImportJSON
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Bar Contract (1 Row, 3 Zones separated by gap-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark in display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-sm">
            CBT
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            Generator CBT Pro
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single-line text links) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('guide')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'guide' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Alur & Panduan
          </button>
          <button
            onClick={() => onSelectTab('config')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'config' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Pengaturan Ujian
          </button>
          <button
            onClick={() => onSelectTab('students')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'students' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Peserta ({state.students.length})
          </button>
          <button
            onClick={() => onSelectTab('questions')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'questions' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Bank Soal ({state.qs.length})
          </button>
          <button
            onClick={() => onSelectTab('sheets')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'sheets' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Spreadsheet
          </button>
          <button
            onClick={() => onSelectTab('generate')}
            className={`whitespace-nowrap transition-colors ${
              activeTab === 'generate' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Generate .HTML
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onLoadSample}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition whitespace-nowrap shrink-0"
            title="Muat 21 soal Asesmen SD lengkap dengan ilustrasi dan 30 akun siswa"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contoh TKA SD</span>
          </button>

          <button
            onClick={onOpenVideoTutorial}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Video Panduan</span>
          </button>
        </div>
      </div>

      {/* Sub-bar for mobile navigation & draft utilities */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2 overflow-x-auto flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            { id: 'guide', label: 'Panduan' },
            { id: 'config', label: '1. Pengaturan' },
            { id: 'students', label: `2. Peserta (${state.students.length})` },
            { id: 'questions', label: `3. Bank Soal (${state.qs.length})` },
            { id: 'import', label: 'Impor Teks' },
            { id: 'sheets', label: '4. Spreadsheet' },
            { id: 'generate', label: '5. Generate CBT' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onExportJSON}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md font-medium flex items-center gap-1"
            title="Simpan backup formulir ke file JSON"
          >
            <Download className="w-3 h-3" />
            <span>Simpan JSON</span>
          </button>
          <button
            onClick={onImportJSON}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md font-medium flex items-center gap-1"
            title="Buka draft dari file JSON"
          >
            <Upload className="w-3 h-3" />
            <span>Buka JSON</span>
          </button>
          <button
            onClick={onReset}
            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-md font-medium flex items-center gap-1"
            title="Kosongkan formulir"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
