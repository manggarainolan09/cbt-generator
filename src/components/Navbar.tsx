import React from 'react';
import {
  Play,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  School,
  Shield,
  LogOut,
  FolderKanban,
  FileCode
} from 'lucide-react';
import { AppState, AuthUser } from '../types/cbt';

interface NavbarProps {
  state: AppState;
  activeTab: string;
  currentUser?: AuthUser | null;
  onSelectTab: (tab: string) => void;
  onOpenVideoTutorial: () => void;
  onLoadSample: () => void;
  onReset: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onLogout?: () => void;
  onOpenAdminDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  activeTab,
  currentUser,
  onSelectTab,
  onOpenVideoTutorial,
  onLoadSample,
  onReset,
  onExportJSON,
  onImportJSON,
  onLogout,
  onOpenAdminDashboard
}) => {
  const handleDownloadStandaloneGenerator = async () => {
    try {
      const res = await fetch('/generator-cbt.html');
      if (res.ok) {
        const text = await res.text();
        const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Generator-CBT-Pro-Offline.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    const blob = new Blob(['<!DOCTYPE html>\n' + document.documentElement.outerHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Generator-CBT-Pro-Offline.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Bar Contract (1 Row, 3 Zones separated by gap-8) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black shadow-sm">
            CBT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap">
                Generator CBT Pro
              </span>
              {currentUser?.role === 'school' && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <School className="w-3 h-3 text-emerald-600" />
                  <span>Terverifikasi</span>
                </span>
              )}
              {currentUser?.role === 'superadmin' && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  <Shield className="w-3 h-3 text-amber-600" />
                  <span>Super Admin</span>
                </span>
              )}
            </div>
            {currentUser?.role === 'school' && (
              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[220px] sm:max-w-xs">
                {currentUser.name} (NPSN: {currentUser.npsn})
              </p>
            )}
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {currentUser?.role === 'school' && (
            <button
              onClick={() => onSelectTab('published')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'published' ? 'text-indigo-600 font-bold' : 'hover:text-slate-900 font-semibold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-200'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-indigo-600" />
              <span>📊 Monitoring & Ujian Terbit</span>
            </button>
          )}

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
            className={`whitespace-nowrap transition-colors font-bold ${
              activeTab === 'generate' ? 'text-indigo-600' : 'text-emerald-700 hover:text-emerald-800'
            }`}
          >
            🚀 Publish & HTML
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser?.role === 'superadmin' && onOpenAdminDashboard && (
            <button
              onClick={onOpenAdminDashboard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition shrink-0"
              title="Buka panel kendali Super Admin"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </button>
          )}

          <button
            onClick={handleDownloadStandaloneGenerator}
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition whitespace-nowrap shrink-0"
            title="Unduh seluruh aplikasi Generator CBT ini dalam 1 file HTML mandiri untuk pemakaian offline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh 1-File HTML</span>
          </button>

          <button
            onClick={onLoadSample}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition whitespace-nowrap shrink-0"
            title="Muat 21 soal Asesmen SD lengkap dengan ilustrasi dan 30 akun siswa"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Contoh TKA</span>
          </button>

          <button
            onClick={onOpenVideoTutorial}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Video Panduan</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
              title="Keluar (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar for mobile navigation & draft utilities */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2 overflow-x-auto flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          {[
            ...(currentUser?.role === 'school' ? [{ id: 'published', label: '📊 Monitoring & Ujian' }] : []),
            { id: 'guide', label: 'Panduan' },
            { id: 'config', label: '1. Pengaturan' },
            { id: 'students', label: `2. Peserta (${state.students.length})` },
            { id: 'questions', label: `3. Bank Soal (${state.qs.length})` },
            { id: 'import', label: 'Impor Teks' },
            { id: 'sheets', label: '4. Spreadsheet' },
            { id: 'generate', label: '5. Publish & CBT' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
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
