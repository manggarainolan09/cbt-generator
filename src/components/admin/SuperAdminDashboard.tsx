import React, { useState, useEffect } from 'react';
import {
  Shield,
  School,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ExternalLink,
  Trash2,
  LogOut,
  RefreshCw,
  FileText,
  AlertTriangle,
  MessageCircle,
  Sliders,
  Eye
} from 'lucide-react';
import { apiService } from '../../utils/apiService';
import { SchoolAccount, PublishedExamItem, SuperAdminUser } from '../../types/cbt';

interface SuperAdminDashboardProps {
  user: SuperAdminUser;
  onLogout: () => void;
  onOpenGenerator: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  user,
  onLogout,
  onOpenGenerator
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'approved' | 'rejected' | 'exams'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [schools, setSchools] = useState<SchoolAccount[]>([]);
  const [publishedExams, setPublishedExams] = useState<PublishedExamItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalExams: 0
  });
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectingSchool, setRejectingSchool] = useState<SchoolAccount | null>(null);
  const [rejectReason, setRejectReason] = useState('Data pendaftaran dan NPSN belum memenuhi ketentuan verifikasi resmi.');
  const [actionLoading, setActionLoading] = useState(false);

  // Success alert
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getAdminSchools();
      setSchools(data.schools || []);
      setStats(data.stats);

      const exams = await apiService.getPublishedExams();
      setPublishedExams(exams || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleApprove = async (school: SchoolAccount) => {
    setActionLoading(true);
    try {
      const res = await apiService.approveSchool(school.id);
      if (res.success) {
        showNotification(`✅ Akun "${school.name}" telah disetujui! Sekolah kini dapat login.`);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingSchool) return;
    setActionLoading(true);
    try {
      const res = await apiService.rejectSchool(rejectingSchool.id, rejectReason);
      if (res.success) {
        showNotification(`❌ Akun "${rejectingSchool.name}" telah ditolak dengan catatan.`);
        setRejectingSchool(null);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSchool = async (school: SchoolAccount) => {
    if (!window.confirm(`Yakin ingin menghapus data sekolah "${school.name}"? Semua ujian terkait juga akan terhapus.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiService.deleteSchool(school.id);
      if (res.success) {
        showNotification(`🗑 Sekolah "${school.name}" berhasil dihapus.`);
        loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredSchools = schools.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.npsn.includes(searchQuery) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return s.status === 'pending';
    if (activeTab === 'approved') return s.status === 'approved';
    if (activeTab === 'rejected') return s.status === 'rejected';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Top Navbar Super Admin */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-900 flex items-center justify-center font-black shadow-sm">
              <Shield className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-white">
                  Super Admin CBT
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                  Pusat Kendali
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Verifikasi Sekolah & Monitoring Ujian Nasional</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenGenerator}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow transition"
              title="Buka CBT Generator Langsung"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Studio Generator</span>
            </button>

            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-white">{user.name}</p>
              <p className="text-[11px] text-slate-400">{user.email}</p>
            </div>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition"
              title="Keluar dari akun Super Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Notification Toast */}
        {notification && (
          <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-700 shadow-xl flex items-center justify-between animate-fade-in">
            <span className="text-sm font-semibold">{notification}</span>
            <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white text-xs">
              Tutup
            </button>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sekolah</span>
              <School className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{stats.total}</div>
            <p className="text-[11px] text-slate-400 mt-1">Lembaga terdaftar</p>
          </div>

          <div
            onClick={() => setActiveTab('pending')}
            className={`p-5 rounded-2xl border shadow-xs cursor-pointer transition ${
              activeTab === 'pending'
                ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
                : 'bg-white border-slate-200 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Menunggu ACC</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-600">{stats.pending}</div>
            <p className="text-[11px] text-amber-600 mt-1">Butuh verifikasi segera</p>
          </div>

          <div
            onClick={() => setActiveTab('approved')}
            className={`p-5 rounded-2xl border shadow-xs cursor-pointer transition ${
              activeTab === 'approved'
                ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Disetujui</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-600">{stats.approved}</div>
            <p className="text-[11px] text-emerald-600 mt-1">Akun aktif & verified</p>
          </div>

          <div
            onClick={() => setActiveTab('rejected')}
            className={`p-5 rounded-2xl border shadow-xs cursor-pointer transition ${
              activeTab === 'rejected'
                ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-400'
                : 'bg-white border-slate-200 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Ditolak</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-rose-600">{stats.rejected}</div>
            <p className="text-[11px] text-rose-600 mt-1">Perlu revisi data</p>
          </div>

          <div
            onClick={() => setActiveTab('exams')}
            className={`p-5 rounded-2xl border shadow-xs cursor-pointer transition col-span-2 lg:col-span-1 ${
              activeTab === 'exams'
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400'
                : 'bg-white border-slate-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Ujian Terbit</span>
              <FileText className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-indigo-600">{stats.totalExams}</div>
            <p className="text-[11px] text-indigo-600 mt-1">CBT live online</p>
          </div>
        </div>

        {/* Tabs & Search Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu Verifikasi ({stats.pending})</span>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Sekolah Disetujui ({stats.approved})</span>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Ditolak ({stats.rejected})</span>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Sekolah ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('exams')}
              className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeTab === 'exams'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Daftar Ujian Terbit ({stats.totalExams})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari sekolah, NPSN, kota..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={loadData}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
              title="Muat ulang data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* ========================================= */}
        {/* LIST SEKOLAH */}
        {/* ========================================= */}
        {activeTab !== 'exams' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredSchools.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <School className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="font-semibold text-sm">Tidak ada sekolah pada kategori ini</p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? 'Coba kata kunci pencarian yang lain.' : 'Belum ada data pendaftaran.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Sekolah & NPSN</th>
                      <th className="p-4">Jenjang & Kota</th>
                      <th className="p-4">Penanggung Jawab</th>
                      <th className="p-4">Kontak / Email</th>
                      <th className="p-4">Status Akun</th>
                      <th className="p-4 text-right">Aksi Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchools.map((sch) => (
                      <tr key={sch.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4">
                          <div className="font-bold text-slate-900 text-sm">{sch.name}</div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            NPSN: <span className="font-semibold text-indigo-600">{sch.npsn}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 font-bold rounded bg-slate-100 text-slate-700 text-[10px]">
                            {sch.level}
                          </span>
                          <div className="text-slate-500 mt-1">{sch.city || '-'}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{sch.adminName}</div>
                          <div className="text-[11px] text-slate-400">
                            Daftar: {new Date(sch.createdAt).toLocaleDateString('id-ID')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-slate-700 font-medium">{sch.email}</div>
                          <div className="text-slate-500 mt-0.5 flex items-center gap-1">
                            <span>{sch.phone || '-'}</span>
                            {sch.phone && (
                              <a
                                href={`https://wa.me/${sch.phone.replace(/\D/g, '')}?text=Halo%20Admin%20${encodeURIComponent(sch.name)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Kirim Pesan WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          {sch.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Menunggu Verifikasi</span>
                            </span>
                          )}
                          {sch.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Disetujui (Aktif)</span>
                            </span>
                          )}
                          {sch.status === 'rejected' && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>Ditolak</span>
                              </span>
                              {sch.rejectionReason && (
                                <p className="text-[10px] text-rose-600 mt-1 max-w-xs italic">
                                  Alasan: {sch.rejectionReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {sch.status !== 'approved' && (
                              <button
                                onClick={() => handleApprove(sch)}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1"
                                title="Setujui akun sekolah ini agar dapat login"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                            )}

                            {sch.status !== 'rejected' && (
                              <button
                                onClick={() => {
                                  setRejectingSchool(sch);
                                  setRejectReason('Data sekolah atau NPSN belum memenuhi kelayakan verifikasi.');
                                }}
                                disabled={actionLoading}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition flex items-center gap-1"
                                title="Tolak pendaftaran ini"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteSchool(sch)}
                              disabled={actionLoading}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Hapus permanen"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* ========================================= */
          /* DAFTAR UJIAN TERBIT NASIONAL */
          /* ========================================= */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ujian CBT yang Diterbitkan Sekolah</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Seluruh paket ujian yang sedang live atau dibuka secara publik oleh sekolah
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
                Total {publishedExams.length} Ujian Terbit
              </span>
            </div>

            {publishedExams.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Belum ada ujian yang diterbitkan oleh sekolah.</p>
                <p className="text-xs mt-1">Sekolah yang disetujui dapat menerbitkan ujian langsung dari generator.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 font-mono">
                          {exam.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{exam.title}</h4>
                        <p className="text-xs text-slate-500">{exam.schoolName} • {exam.subject}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exam.isOpen
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {exam.isOpen ? 'Dibuka' : 'Ditutup'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] bg-white p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Soal</span>
                        <b className="text-slate-800">{exam.questionCount} Butir</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Durasi</span>
                        <b className="text-slate-800">{exam.duration} mnt</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Peserta</span>
                        <b className="text-emerald-700">{exam.submissionCount || 0} Siswa</b>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                      <span className="text-slate-400 text-[10px]">
                        {new Date(exam.createdAt).toLocaleDateString('id-ID')}
                      </span>
                      <a
                        href={`/?exam=${exam.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Ujian Siswa</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectingSchool && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tolak Pendaftaran Sekolah</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Berikan alasan penolakan untuk <b>{rejectingSchool.name}</b> (NPSN: {rejectingSchool.npsn}).
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alasan / Catatan Perbaikan untuk Sekolah:
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                placeholder="Misal: NPSN tidak cocok dengan data resmi, mohon periksa kembali..."
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingSchool(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={actionLoading}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition disabled:opacity-50"
              >
                {actionLoading ? 'Memproses...' : 'Konfirmasi Penolakan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
