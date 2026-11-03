export type QuestionType = 'pg' | 'pgk' | 'bs' | 'jd' | 'isi' | 'ur';

export interface BSStatement {
  s: string;
  a: boolean;
}

export interface JDPair {
  l: string;
  r: string;
}

export interface Question {
  id?: string;
  t: QuestionType;
  q: string;
  img?: string;
  // For PG & PGK
  o?: string[];
  a?: any; // number for PG, number[] for PGK, string for ISI
  // For Benar/Salah
  st?: BSStatement[];
  // For Menjodohkan
  pairs?: JDPair[];
  // Scoring
  s?: 'partial' | 'all';
  w?: number; // bobot
}

export interface Student {
  u: string; // username
  p: string; // password
  n: string; // name
  k: string; // kelas
}

export interface ExamConfig {
  title: string;
  school: string;
  subject: string;
  duration: number; // minutes, 0 = unlimited
  kkm: number;
  token: string;
  maxSw: number; // max tab switches / exit fullscreen
  instr: string;
  shuffleQ: boolean;
  shuffleO: boolean;
  show: boolean; // show score to student at end
  noCopy: boolean;
  camera: boolean;
  authMode: 'free' | 'list';
  syncEnabled: boolean;
  sheetUrl: string;
  syncToken: string;
  ministry: string;
  logo: string;
  icon: string;
  themePrimary: string;
  themeBackground: string;
  adminUser: string;
  adminPass: string;
  scheduleMode: 'full' | 'scheduled';
  scheduleDate: string;
  scheduleStartTime: string;
  scheduleEndTime: string;
  editorType: string;
}

export interface AppState {
  cfg: ExamConfig;
  students: Student[];
  qs: Question[];
}

export interface VideoChapter {
  id: string;
  number: string;
  title: string;
  duration: number; // in seconds
  description: string;
  targetTab: string;
  narration: string;
  keyPoints: string[];
  screenType: 'overview' | 'config' | 'students' | 'questions' | 'sheets' | 'generate' | 'studentExam' | 'proctor';
  highlights: string[];
}

export interface SchoolAccount {
  id: string;
  name: string;
  npsn: string;
  level: string;
  adminName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin';
}

export type AuthUser =
  | (SuperAdminUser & { role: 'superadmin' })
  | (SchoolAccount & { role: 'school' });

export interface PublishedExamItem {
  id: string;
  schoolId: string;
  schoolName: string;
  title: string;
  subject: string;
  duration: number;
  kkm: number;
  token?: string;
  questionCount: number;
  studentAuthMode: string;
  isPublished: boolean;
  isOpen: boolean;
  createdAt: string;
  updatedAt?: string;
  submissionCount?: number;
  examData?: AppState;
}

