import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cbt_database.json');

// Interface types
export interface SchoolAccount {
  id: string;
  name: string;
  npsn: string;
  level: string; // SD, SMP, SMA, SMK, etc.
  adminName: string;
  email: string;
  password: string; // Stored password (hash or text for demo)
  phone: string;
  city: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedExam {
  id: string; // e.g. CBT-TKA-SD2026
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
  isOpen: boolean; // whether students can take it right now
  createdAt: string;
  updatedAt: string;
  examData: any; // Full CBT payload (state, questions, students, configs)
  submissionCount?: number;
}

export interface AppDatabase {
  superAdmins: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'superadmin';
  }[];
  schools: SchoolAccount[];
  publishedExams: PublishedExam[];
  submissions: any[];
}

// Ensure data folder and DB exist
function initDatabase(): AppDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        superAdmins: parsed.superAdmins || [],
        schools: parsed.schools || [],
        publishedExams: parsed.publishedExams || [],
        submissions: parsed.submissions || []
      };
    } catch (e) {
      console.error('Error reading db file, re-initializing...', e);
    }
  }

  const defaultDb: AppDatabase = {
    superAdmins: [
      {
        id: 'sa-1',
        name: 'Super Admin Pusat',
        email: 'superadmin@cbt.id',
        password: 'SuperAdmin2026!',
        role: 'superadmin'
      },
      {
        id: 'sa-2',
        name: 'Admin Belajar',
        email: 'kamaludin91@admin.sd.belajar.id',
        password: 'Admin12345!',
        role: 'superadmin'
      }
    ],
    schools: [
      {
        id: 'sch-101',
        name: 'SDN 01 Percontohan Merdeka',
        npsn: '20104567',
        level: 'SD',
        adminName: 'Drs. H. Mulyadi, M.Pd.',
        email: 'sdn01merdeka@sekolah.id',
        password: 'Sekolah123!',
        phone: '081234567890',
        city: 'Jakarta Pusat',
        address: 'Jl. Merdeka Sejahtera No. 12',
        status: 'approved',
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'sch-102',
        name: 'SMP Negeri 5 Harapan Bangsa',
        npsn: '20208899',
        level: 'SMP',
        adminName: 'Siti Rahmawati, S.Pd.',
        email: 'smpn5harapan@sekolah.id',
        password: 'Sekolah123!',
        phone: '085712345678',
        city: 'Bandung',
        address: 'Jl. Surya Kencana No. 45',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    publishedExams: [],
    submissions: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2), 'utf-8');
  return defaultDb;
}

let db = initDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save database:', e);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ==========================================
  // AUTH ROUTES
  // ==========================================

  // Register school
  app.post('/api/auth/register-school', (req: Request, res: Response) => {
    try {
      const { name, npsn, level, adminName, email, password, phone, city, address } = req.body;

      if (!name || !npsn || !email || !password || !adminName) {
        return res.status(400).json({ success: false, message: 'Semua kolom wajib harus diisi lengkap.' });
      }

      // Check if email or NPSN already exists
      const existingEmail = db.schools.find(s => s.email.toLowerCase() === email.toLowerCase());
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email sekolah ini sudah terdaftar sebelumnya.' });
      }

      const existingNpsn = db.schools.find(s => s.npsn === npsn);
      if (existingNpsn) {
        return res.status(400).json({ success: false, message: `NPSN ${npsn} sudah terdaftar dalam sistem.` });
      }

      const newSchool: SchoolAccount = {
        id: 'sch-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: name.trim(),
        npsn: npsn.trim(),
        level: level || 'SD',
        adminName: adminName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phone: phone || '',
        city: city || '',
        address: address || '',
        status: 'pending', // Pending approval by Super Admin
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.schools.unshift(newSchool);
      saveDatabase();

      return res.json({
        success: true,
        message: 'Registrasi sekolah berhasil! Akun Anda sedang menunggu persetujuan Super Admin.',
        school: {
          id: newSchool.id,
          name: newSchool.name,
          npsn: newSchool.npsn,
          email: newSchool.email,
          status: newSchool.status
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  });

  // Login (School or Super Admin)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    try {
      const { identifier, password, role } = req.body; // identifier can be email or npsn

      if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Harap isi email/NPSN dan kata sandi.' });
      }

      const idLower = identifier.trim().toLowerCase();

      // Check Super Admin
      if (role === 'superadmin' || !role) {
        const sa = db.superAdmins.find(
          a => (a.email.toLowerCase() === idLower || a.id === identifier) && a.password === password
        );
        if (sa) {
          return res.json({
            success: true,
            role: 'superadmin',
            user: {
              id: sa.id,
              name: sa.name,
              email: sa.email,
              role: 'superadmin'
            },
            message: 'Selamat datang, Super Admin!'
          });
        }
      }

      // Check School
      const school = db.schools.find(
        s => (s.email.toLowerCase() === idLower || s.npsn === identifier.trim()) && s.password === password
      );

      if (school) {
        if (school.status === 'pending') {
          return res.json({
            success: false,
            status: 'pending',
            message: 'Akun sekolah Anda sedang dalam proses peninjauan oleh Super Admin. Harap tunggu persetujuan.',
            school: {
              id: school.id,
              name: school.name,
              npsn: school.npsn,
              email: school.email,
              status: school.status,
              createdAt: school.createdAt
            }
          });
        }

        if (school.status === 'rejected') {
          return res.json({
            success: false,
            status: 'rejected',
            message: 'Pendaftaran akun sekolah ditolak.',
            rejectionReason: school.rejectionReason || 'Data pendaftaran belum memenuhi persyaratan.',
            school: {
              id: school.id,
              name: school.name,
              npsn: school.npsn,
              email: school.email,
              status: school.status
            }
          });
        }

        return res.json({
          success: true,
          role: 'school',
          status: 'approved',
          user: {
            id: school.id,
            name: school.name,
            npsn: school.npsn,
            level: school.level,
            adminName: school.adminName,
            email: school.email,
            phone: school.phone,
            city: school.city,
            role: 'school'
          },
          message: `Selamat datang, ${school.name}!`
        });
      }

      return res.status(401).json({ success: false, message: 'Email / NPSN atau kata sandi tidak cocok.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
  });

  // ==========================================
  // SUPER ADMIN ROUTES
  // ==========================================

  // Get all schools with counts
  app.get('/api/admin/schools', (_req: Request, res: Response) => {
    try {
      const stats = {
        total: db.schools.length,
        pending: db.schools.filter(s => s.status === 'pending').length,
        approved: db.schools.filter(s => s.status === 'approved').length,
        rejected: db.schools.filter(s => s.status === 'rejected').length,
        totalExams: db.publishedExams.length
      };

      return res.json({
        success: true,
        stats,
        schools: db.schools
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Approve school
  app.post('/api/admin/schools/:id/approve', (req: Request, res: Response) => {
    try {
      const school = db.schools.find(s => s.id === req.params.id);
      if (!school) {
        return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan.' });
      }

      school.status = 'approved';
      school.rejectionReason = undefined;
      school.updatedAt = new Date().toISOString();
      saveDatabase();

      return res.json({
        success: true,
        message: `Akun sekolah "${school.name}" berhasil disetujui! Sekolah kini dapat login dan mengakses generator CBT.`,
        school
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Reject school
  app.post('/api/admin/schools/:id/reject', (req: Request, res: Response) => {
    try {
      const { reason } = req.body;
      const school = db.schools.find(s => s.id === req.params.id);
      if (!school) {
        return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan.' });
      }

      school.status = 'rejected';
      school.rejectionReason = reason || 'Data pendaftaran belum memenuhi syarat verifikasi.';
      school.updatedAt = new Date().toISOString();
      saveDatabase();

      return res.json({
        success: true,
        message: `Akun sekolah "${school.name}" telah ditolak.`,
        school
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Delete school
  app.delete('/api/admin/schools/:id', (req: Request, res: Response) => {
    try {
      const idx = db.schools.findIndex(s => s.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Sekolah tidak ditemukan.' });
      }

      const deleted = db.schools.splice(idx, 1)[0];
      // Also delete associated published exams
      db.publishedExams = db.publishedExams.filter(e => e.schoolId !== deleted.id);
      saveDatabase();

      return res.json({
        success: true,
        message: `Sekolah "${deleted.name}" berhasil dihapus.`,
        deletedId: deleted.id
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // EXAM PUBLISHING ROUTES
  // ==========================================

  // Get list of published exams
  app.get('/api/exams', (req: Request, res: Response) => {
    try {
      const schoolId = req.query.schoolId as string;
      let exams = db.publishedExams;

      if (schoolId) {
        exams = exams.filter(e => e.schoolId === schoolId);
      }

      // Return lighter list without huge examData for dashboard
      const summary = exams.map(e => ({
        id: e.id,
        schoolId: e.schoolId,
        schoolName: e.schoolName,
        title: e.title,
        subject: e.subject,
        duration: e.duration,
        kkm: e.kkm,
        token: e.token,
        questionCount: e.questionCount,
        studentAuthMode: e.studentAuthMode,
        isPublished: e.isPublished,
        isOpen: e.isOpen,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        submissionCount: e.submissionCount || 0
      }));

      return res.json({ success: true, exams: summary });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get single exam details (Full payload for student or editor)
  app.get('/api/exams/:id', (req: Request, res: Response) => {
    try {
      const exam = db.publishedExams.find(e => e.id.toLowerCase() === req.params.id.toLowerCase());
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Ujian CBT tidak ditemukan atau telah diarsipkan.' });
      }

      return res.json({
        success: true,
        exam
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Publish or update exam
  app.post('/api/exams/publish', (req: Request, res: Response) => {
    try {
      const {
        examId,
        schoolId,
        schoolName,
        title,
        subject,
        duration,
        kkm,
        token,
        questionCount,
        studentAuthMode,
        examData
      } = req.body;

      if (!title || !examData) {
        return res.status(400).json({ success: false, message: 'Judul dan data ujian wajib disertakan.' });
      }

      const id = examId || ('CBT-' + Math.random().toString(36).substring(2, 7).toUpperCase());
      const existingIdx = db.publishedExams.findIndex(e => e.id.toLowerCase() === id.toLowerCase());

      const payload: PublishedExam = {
        id,
        schoolId: schoolId || 'public',
        schoolName: schoolName || 'Sekolah CBT',
        title: title || 'Ujian CBT',
        subject: subject || 'Umum',
        duration: Number(duration) || 60,
        kkm: Number(kkm) || 75,
        token: token || '',
        questionCount: Number(questionCount) || (examData?.qs?.length || 0),
        studentAuthMode: studentAuthMode || 'free',
        isPublished: true,
        isOpen: true,
        createdAt: existingIdx >= 0 ? db.publishedExams[existingIdx].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        examData,
        submissionCount: existingIdx >= 0 ? (db.publishedExams[existingIdx].submissionCount || 0) : 0
      };

      if (existingIdx >= 0) {
        db.publishedExams[existingIdx] = payload;
      } else {
        db.publishedExams.unshift(payload);
      }

      saveDatabase();

      return res.json({
        success: true,
        message: `Ujian "${title}" berhasil dipublikasikan secara online!`,
        exam: {
          id: payload.id,
          title: payload.title,
          publicUrl: `/exam/${payload.id}`,
          isOpen: payload.isOpen,
          createdAt: payload.createdAt
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Toggle open/close exam
  app.patch('/api/exams/:id/toggle', (req: Request, res: Response) => {
    try {
      const exam = db.publishedExams.find(e => e.id === req.params.id);
      if (!exam) {
        return res.status(404).json({ success: false, message: 'Ujian tidak ditemukan.' });
      }

      exam.isOpen = !exam.isOpen;
      exam.updatedAt = new Date().toISOString();
      saveDatabase();

      return res.json({
        success: true,
        message: exam.isOpen ? 'Ujian dibuka kembali untuk peserta.' : 'Ujian ditutup sementara.',
        isOpen: exam.isOpen
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Delete published exam
  app.delete('/api/exams/:id', (req: Request, res: Response) => {
    try {
      const idx = db.publishedExams.findIndex(e => e.id === req.params.id);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Ujian tidak ditemukan.' });
      }

      const deleted = db.publishedExams.splice(idx, 1)[0];
      saveDatabase();

      return res.json({
        success: true,
        message: `Ujian "${deleted.title}" berhasil dihapus dari publikasi.`,
        deletedId: deleted.id
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Submit score log
  app.post('/api/exams/:id/submit', (req: Request, res: Response) => {
    try {
      const exam = db.publishedExams.find(e => e.id === req.params.id);
      const submission = {
        id: 'sub-' + Date.now().toString(36),
        examId: req.params.id,
        examTitle: exam?.title || 'CBT',
        studentName: req.body.studentName || 'Peserta',
        studentClass: req.body.studentClass || '-',
        score: req.body.score || 0,
        totalQuestions: req.body.totalQuestions || 0,
        correctCount: req.body.correctCount || 0,
        submittedAt: new Date().toISOString()
      };

      db.submissions.unshift(submission);
      if (exam) {
        exam.submissionCount = (exam.submissionCount || 0) + 1;
      }
      saveDatabase();

      return res.json({ success: true, message: 'Nilai ujian berhasil dicatat.', submissionId: submission.id });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // VITE DEV SERVER / PRODUCTION STATIC
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CBT Portal Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
