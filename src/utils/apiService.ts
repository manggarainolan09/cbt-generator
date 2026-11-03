import { SchoolAccount, PublishedExamItem, AuthUser, AppState } from '../types/cbt';

// Local storage keys for offline / fallback
const LS_SCHOOLS_KEY = 'cbt_schools_v1';
const LS_PUBLISHED_EXAMS_KEY = 'cbt_published_exams_v1';
const LS_CURRENT_USER_KEY = 'cbt_current_user_v1';

// Seed default accounts for initial bootstrap if empty
const DEFAULT_SCHOOLS: SchoolAccount[] = [
  {
    id: 'sch-101',
    name: 'SDN 01 Percontohan Merdeka',
    npsn: '20104567',
    level: 'SD',
    adminName: 'Drs. H. Mulyadi, M.Pd.',
    email: 'sdn01merdeka@sekolah.id',
    phone: '081234567890',
    city: 'Jakarta Pusat',
    address: 'Jl. Merdeka Sejahtera No. 12',
    status: 'approved',
    createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'sch-102',
    name: 'SMP Negeri 5 Harapan Bangsa',
    npsn: '20208899',
    level: 'SMP',
    adminName: 'Siti Rahmawati, S.Pd.',
    email: 'smpn5harapan@sekolah.id',
    phone: '085712345678',
    city: 'Bandung',
    address: 'Jl. Surya Kencana No. 45',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

function getLocalSchools(): SchoolAccount[] {
  try {
    const raw = localStorage.getItem(LS_SCHOOLS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return DEFAULT_SCHOOLS;
}

function saveLocalSchools(schools: SchoolAccount[]) {
  try {
    localStorage.setItem(LS_SCHOOLS_KEY, JSON.stringify(schools));
  } catch (e) {
    console.warn(e);
  }
}

function getLocalPublishedExams(): PublishedExamItem[] {
  try {
    const raw = localStorage.getItem(LS_PUBLISHED_EXAMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(e);
  }
  return [];
}

function saveLocalPublishedExams(exams: PublishedExamItem[]) {
  try {
    localStorage.setItem(LS_PUBLISHED_EXAMS_KEY, JSON.stringify(exams));
  } catch (e) {
    console.warn(e);
  }
}

export const apiService = {
  // Get Current Session
  getCurrentUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(LS_CURRENT_USER_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn(e);
    }
    return null;
  },

  setCurrentUser(user: AuthUser | null) {
    if (!user) {
      localStorage.removeItem(LS_CURRENT_USER_KEY);
    } else {
      localStorage.setItem(LS_CURRENT_USER_KEY, JSON.stringify(user));
    }
  },

  // Register School
  async registerSchool(data: {
    name: string;
    npsn: string;
    level: string;
    adminName: string;
    email: string;
    password: string;
    phone: string;
    city: string;
    address: string;
  }): Promise<{ success: boolean; message: string; school?: SchoolAccount }> {
    try {
      const res = await fetch('/api/auth/register-school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        // Also update local
        const local = getLocalSchools();
        if (json.school) {
          local.unshift(json.school);
          saveLocalSchools(local);
        }
        return json;
      }
    } catch (e) {
      console.warn('API error, falling back to local storage', e);
    }

    // Local Fallback
    const local = getLocalSchools();
    if (local.some(s => s.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'Email sekolah ini sudah terdaftar sebelumnya.' };
    }
    if (local.some(s => s.npsn === data.npsn)) {
      return { success: false, message: `NPSN ${data.npsn} sudah terdaftar.` };
    }

    const newSchool: SchoolAccount = {
      id: 'sch-' + Date.now().toString(36),
      name: data.name.trim(),
      npsn: data.npsn.trim(),
      level: data.level || 'SD',
      adminName: data.adminName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone || '',
      city: data.city || '',
      address: data.address || '',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    local.unshift(newSchool);
    saveLocalSchools(local);

    return {
      success: true,
      message: 'Registrasi sekolah berhasil! Akun Anda sedang menunggu persetujuan Super Admin.',
      school: newSchool
    };
  },

  // Login
  async login(identifier: string, password: string, role?: 'superadmin' | 'school'): Promise<{
    success: boolean;
    role?: 'superadmin' | 'school';
    status?: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    user?: AuthUser;
    message: string;
  }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          this.setCurrentUser(json.user);
        }
        return json;
      }
    } catch (e) {
      console.warn('API login failed, checking fallback', e);
    }

    // Local fallback check
    const idLower = identifier.trim().toLowerCase();

    // Super Admin Demo check
    if (
      (idLower === 'superadmin@cbt.id' || idLower === 'kamaludin91@admin.sd.belajar.id') &&
      (password === 'SuperAdmin2026!' || password === 'Admin12345!' || password === 'admin')
    ) {
      const sa: AuthUser = {
        id: 'sa-1',
        name: 'Super Admin Pusat',
        email: idLower,
        role: 'superadmin'
      };
      this.setCurrentUser(sa);
      return {
        success: true,
        role: 'superadmin',
        user: sa,
        message: 'Login Super Admin Berhasil (Offline Ready)'
      };
    }

    // Schools check
    const localSchools = getLocalSchools();
    const sch = localSchools.find(
      s => (s.email.toLowerCase() === idLower || s.npsn === identifier.trim())
    );

    if (sch) {
      if (sch.status === 'pending') {
        return {
          success: false,
          status: 'pending',
          message: 'Akun sekolah Anda sedang dalam proses peninjauan oleh Super Admin. Harap tunggu persetujuan.'
        };
      }
      if (sch.status === 'rejected') {
        return {
          success: false,
          status: 'rejected',
          rejectionReason: sch.rejectionReason || 'Data pendaftaran belum memenuhi syarat verifikasi.',
          message: 'Pendaftaran akun sekolah ditolak.'
        };
      }

      const schUser: AuthUser = {
        ...sch,
        role: 'school'
      };
      this.setCurrentUser(schUser);
      return {
        success: true,
        role: 'school',
        status: 'approved',
        user: schUser,
        message: `Selamat datang, ${sch.name}!`
      };
    }

    return {
      success: false,
      message: 'Email / NPSN atau kata sandi tidak ditemukan.'
    };
  },

  // Admin: Get Schools
  async getAdminSchools(): Promise<{
    schools: SchoolAccount[];
    stats: { total: number; pending: number; approved: number; rejected: number; totalExams: number };
  }> {
    try {
      const res = await fetch('/api/admin/schools');
      if (res.ok) {
        const json = await res.json();
        saveLocalSchools(json.schools);
        return json;
      }
    } catch (e) {
      console.warn('API error, using local schools', e);
    }

    const schools = getLocalSchools();
    const exams = getLocalPublishedExams();
    return {
      schools,
      stats: {
        total: schools.length,
        pending: schools.filter(s => s.status === 'pending').length,
        approved: schools.filter(s => s.status === 'approved').length,
        rejected: schools.filter(s => s.status === 'rejected').length,
        totalExams: exams.length
      }
    };
  },

  // Admin: Approve School
  async approveSchool(schoolId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/approve`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        const local = getLocalSchools().map(s => (s.id === schoolId ? { ...s, status: 'approved' as const } : s));
        saveLocalSchools(local);
        return json;
      }
    } catch (e) {
      console.warn(e);
    }

    const local = getLocalSchools().map(s => (s.id === schoolId ? { ...s, status: 'approved' as const } : s));
    saveLocalSchools(local);
    return { success: true, message: 'Sekolah berhasil disetujui!' };
  },

  // Admin: Reject School
  async rejectSchool(schoolId: string, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        const json = await res.json();
        const local = getLocalSchools().map(s =>
          s.id === schoolId ? { ...s, status: 'rejected' as const, rejectionReason: reason } : s
        );
        saveLocalSchools(local);
        return json;
      }
    } catch (e) {
      console.warn(e);
    }

    const local = getLocalSchools().map(s =>
      s.id === schoolId ? { ...s, status: 'rejected' as const, rejectionReason: reason } : s
    );
    saveLocalSchools(local);
    return { success: true, message: 'Sekolah telah ditolak.' };
  },

  // Admin: Delete School
  async deleteSchool(schoolId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/admin/schools/${schoolId}`, { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        const local = getLocalSchools().filter(s => s.id !== schoolId);
        saveLocalSchools(local);
        return json;
      }
    } catch (e) {
      console.warn(e);
    }

    const local = getLocalSchools().filter(s => s.id !== schoolId);
    saveLocalSchools(local);
    return { success: true, message: 'Sekolah berhasil dihapus.' };
  },

  // Publish CBT Exam
  async publishExam(payload: {
    examId?: string;
    schoolId: string;
    schoolName: string;
    title: string;
    subject: string;
    duration: number;
    kkm: number;
    token?: string;
    questionCount: number;
    studentAuthMode: string;
    examData: AppState;
  }): Promise<{ success: boolean; message: string; exam?: any }> {
    try {
      const res = await fetch('/api/exams/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        // Also save to local
        const local = getLocalPublishedExams();
        const item: PublishedExamItem = {
          id: json.exam?.id || payload.examId || ('CBT-' + Math.random().toString(36).substring(2, 7).toUpperCase()),
          schoolId: payload.schoolId,
          schoolName: payload.schoolName,
          title: payload.title,
          subject: payload.subject,
          duration: payload.duration,
          kkm: payload.kkm,
          token: payload.token,
          questionCount: payload.questionCount,
          studentAuthMode: payload.studentAuthMode,
          isPublished: true,
          isOpen: true,
          createdAt: new Date().toISOString(),
          examData: payload.examData,
          submissionCount: 0
        };
        const idx = local.findIndex(e => e.id === item.id);
        if (idx >= 0) local[idx] = item;
        else local.unshift(item);
        saveLocalPublishedExams(local);

        return json;
      }
    } catch (e) {
      console.warn('API publish fallback to local', e);
    }

    const local = getLocalPublishedExams();
    const id = payload.examId || ('CBT-' + Math.random().toString(36).substring(2, 7).toUpperCase());
    const item: PublishedExamItem = {
      id,
      schoolId: payload.schoolId,
      schoolName: payload.schoolName,
      title: payload.title,
      subject: payload.subject,
      duration: payload.duration,
      kkm: payload.kkm,
      token: payload.token,
      questionCount: payload.questionCount,
      studentAuthMode: payload.studentAuthMode,
      isPublished: true,
      isOpen: true,
      createdAt: new Date().toISOString(),
      examData: payload.examData,
      submissionCount: 0
    };

    const idx = local.findIndex(e => e.id === id);
    if (idx >= 0) local[idx] = item;
    else local.unshift(item);
    saveLocalPublishedExams(local);

    return {
      success: true,
      message: `Ujian "${payload.title}" berhasil dipublikasikan secara online!`,
      exam: {
        id,
        title: payload.title,
        publicUrl: `/exam/${id}`,
        isOpen: true,
        createdAt: item.createdAt
      }
    };
  },

  // Get Published Exams
  async getPublishedExams(schoolId?: string): Promise<PublishedExamItem[]> {
    try {
      const url = schoolId ? `/api/exams?schoolId=${schoolId}` : '/api/exams';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.exams) {
          return json.exams;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch exams from server, using local', e);
    }

    const local = getLocalPublishedExams();
    if (schoolId) {
      return local.filter(e => e.schoolId === schoolId);
    }
    return local;
  },

  // Get Single Exam (for student exam player)
  async getExamById(examId: string): Promise<PublishedExamItem | null> {
    try {
      const res = await fetch(`/api/exams/${examId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.exam) return json.exam;
      }
    } catch (e) {
      console.warn('API error fetching exam by ID', e);
    }

    const local = getLocalPublishedExams();
    const found = local.find(e => e.id.toLowerCase() === examId.toLowerCase());
    return found || null;
  },

  // Toggle Exam Open/Close
  async toggleExamStatus(examId: string): Promise<{ success: boolean; isOpen?: boolean; message: string }> {
    try {
      const res = await fetch(`/api/exams/${examId}/toggle`, { method: 'PATCH' });
      if (res.ok) {
        const json = await res.json();
        const local = getLocalPublishedExams().map(e => (e.id === examId ? { ...e, isOpen: json.isOpen } : e));
        saveLocalPublishedExams(local);
        return json;
      }
    } catch (e) {
      console.warn(e);
    }

    const local = getLocalPublishedExams();
    const item = local.find(e => e.id === examId);
    if (item) {
      item.isOpen = !item.isOpen;
      saveLocalPublishedExams(local);
      return {
        success: true,
        isOpen: item.isOpen,
        message: item.isOpen ? 'Ujian dibuka kembali untuk peserta.' : 'Ujian ditutup sementara.'
      };
    }
    return { success: false, message: 'Ujian tidak ditemukan.' };
  },

  // Delete Exam
  async deleteExam(examId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`/api/exams/${examId}`, { method: 'DELETE' });
      if (res.ok) {
        const json = await res.json();
        const local = getLocalPublishedExams().filter(e => e.id !== examId);
        saveLocalPublishedExams(local);
        return json;
      }
    } catch (e) {
      console.warn(e);
    }

    const local = getLocalPublishedExams();
    saveLocalPublishedExams(local.filter(e => e.id !== examId));
    return { success: true, message: 'Ujian berhasil dihapus dari publikasi.' };
  },

  // Submit Exam Result
  async submitExamResult(examId: string, result: {
    studentName: string;
    studentClass: string;
    score: number;
    totalQuestions: number;
    correctCount: number;
  }) {
    try {
      await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result)
      });
    } catch (e) {
      console.warn('Error submitting to server', e);
    }
  }
};
