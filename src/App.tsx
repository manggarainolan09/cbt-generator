import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { GuideTab } from './components/tabs/GuideTab';
import { ConfigTab } from './components/tabs/ConfigTab';
import { StudentsTab } from './components/tabs/StudentsTab';
import { QuestionsTab } from './components/tabs/QuestionsTab';
import { QuickImportTab } from './components/tabs/QuickImportTab';
import { SheetsTab } from './components/tabs/SheetsTab';
import { GenerateTab } from './components/tabs/GenerateTab';
import { VideoTutorialModal } from './components/VideoTutorialModal';
import { ExamPreviewModal } from './components/ExamPreviewModal';
import { QuestionPreviewModal } from './components/QuestionPreviewModal';
import { AppState, ExamConfig, Question, Student } from './types/cbt';
import { getSampleSDData } from './data/sampleExam';

const STORAGE_KEY = 'cbt_generator_pro_state_v1';

export default function App() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return getSampleSDData();
  });

  const [activeTab, setActiveTab] = useState<string>('guide');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isExamPreviewOpen, setIsExamPreviewOpen] = useState(false);
  const [previewQIndex, setPreviewQIndex] = useState<number | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error(e);
    }
  }, [state]);

  // Initial KaTeX render check
  useEffect(() => {
    if ((window as any).renderMathInElement) {
      (window as any).renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }, [activeTab]);

  const handleUpdateConfig = (patch: Partial<ExamConfig>) => {
    setState(prev => ({
      ...prev,
      cfg: { ...prev.cfg, ...patch }
    }));
  };

  const handleUpdateStudents = (students: Student[]) => {
    setState(prev => ({
      ...prev,
      students
    }));
  };

  const handleUpdateQuestions = (qs: Question[]) => {
    setState(prev => ({
      ...prev,
      qs
    }));
  };

  const handleAppendQuestions = (newQs: Question[]) => {
    setState(prev => ({
      ...prev,
      qs: [...newQs, ...prev.qs]
    }));
  };

  const handleLoadSample = () => {
    if (window.confirm('Muat contoh lengkap Asesmen TKA SD? Data saat ini akan diganti dengan 21 butir soal berilustrasi dan 30 akun siswa.')) {
      const sample = getSampleSDData();
      setState(sample);
      alert('Contoh TKA SD berhasil dimuat!');
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh formulir ujian ke awal?')) {
      const emptyState: AppState = {
        cfg: {
          title: 'Asesmen Ujian Baru',
          school: 'Nama Sekolah',
          subject: 'Mata Pelajaran',
          duration: 60,
          kkm: 70,
          token: 'PAS2026',
          maxSw: 3,
          instr: 'Kerjakan soal dengan teliti dan jujur.',
          shuffleQ: true,
          shuffleO: true,
          show: true,
          noCopy: true,
          camera: false,
          authMode: 'list',
          syncEnabled: false,
          sheetUrl: '',
          syncToken: '',
          ministry: 'Kementerian Pendidikan Dasar dan Menengah',
          logo: '',
          icon: '',
          themePrimary: '#4f46e5',
          themeBackground: '#f8fafc',
          adminUser: 'pengawas',
          adminPass: 'pengawas2026',
          scheduleMode: 'full',
          scheduleDate: '',
          scheduleStartTime: '',
          scheduleEndTime: '',
          editorType: 'builtin'
        },
        students: [
          { u: 'siswa01', p: '12345', n: 'Ahmad Rizky', k: 'VI-A' },
          { u: 'siswa02', p: '12345', n: 'Siti Aminah', k: 'VI-A' }
        ],
        qs: []
      };
      setState(emptyState);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `draft-cbt-${(state.cfg.title || 'ujian').replace(/[^a-z0-9]/gi, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const loaded = JSON.parse(event.target?.result as string);
          if (loaded && loaded.cfg && Array.isArray(loaded.qs)) {
            setState(loaded);
            alert('Draft CBT berhasil dimuat!');
          } else {
            alert('File JSON tidak valid untuk format Generator CBT.');
          }
        } catch (err) {
          alert('Gagal membaca file JSON.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        state={state}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenVideoTutorial={() => setIsVideoModalOpen(true)}
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'guide' && (
          <GuideTab
            state={state}
            onOpenVideoTutorial={() => setIsVideoModalOpen(true)}
            onSelectTab={setActiveTab}
            onLoadSample={handleLoadSample}
          />
        )}

        {activeTab === 'config' && (
          <ConfigTab
            state={state}
            onChangeConfig={handleUpdateConfig}
          />
        )}

        {activeTab === 'students' && (
          <StudentsTab
            state={state}
            onUpdateStudents={handleUpdateStudents}
            onUpdateAuthMode={(mode) => handleUpdateConfig({ authMode: mode })}
          />
        )}

        {activeTab === 'questions' && (
          <QuestionsTab
            state={state}
            onUpdateQuestions={handleUpdateQuestions}
            onPreviewQuestion={(idx) => setPreviewQIndex(idx)}
          />
        )}

        {activeTab === 'import' && (
          <QuickImportTab
            onAppendQuestions={handleAppendQuestions}
            onNavigateToQuestions={() => setActiveTab('questions')}
          />
        )}

        {activeTab === 'sheets' && (
          <SheetsTab
            state={state}
            onChangeConfig={handleUpdateConfig}
          />
        )}

        {activeTab === 'generate' && (
          <GenerateTab
            state={state}
            onOpenExamPreview={() => setIsExamPreviewOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} Generator CBT Pro &bull; Aplikasi Asesmen Mandiri Sekolah</span>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <button onClick={() => setIsVideoModalOpen(true)} className="hover:text-indigo-600 transition">
              Video Panduan
            </button>
            <button onClick={() => setActiveTab('guide')} className="hover:text-indigo-600 transition">
              Petunjuk Penggunaan
            </button>
            <button onClick={() => setActiveTab('generate')} className="hover:text-indigo-600 transition">
              Publikasi Google Sites
            </button>
          </div>
        </div>
      </footer>

      {/* Video Tutorial Studio Modal */}
      <VideoTutorialModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          setIsVideoModalOpen(false);
        }}
      />

      {/* Live In-App Exam Simulator Modal */}
      <ExamPreviewModal
        isOpen={isExamPreviewOpen}
        onClose={() => setIsExamPreviewOpen(false)}
        state={state}
      />

      {/* Single Question Preview Modal */}
      <QuestionPreviewModal
        isOpen={previewQIndex !== null}
        onClose={() => setPreviewQIndex(null)}
        questions={state.qs}
        currentIndex={previewQIndex ?? 0}
        onNavigate={(idx) => setPreviewQIndex(idx)}
        themeColor={state.cfg.themePrimary}
      />
    </div>
  );
}
