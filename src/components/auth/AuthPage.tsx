import React, { useState } from 'react';
import {
  Shield,
  School,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Building
} from 'lucide-react';
import { apiService } from '../../utils/apiService';
import { AuthUser, SchoolAccount } from '../../types/cbt';

interface AuthPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginRole, setLoginRole] = useState<'school' | 'superadmin'>('school');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Status message if pending / rejected
  const [pendingAccount, setPendingAccount] = useState<any | null>(null);
  const [rejectedAccount, setRejectedAccount] = useState<{ school: any; reason: string } | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regNpsn, setRegNpsn] = useState('');
  const [regLevel, setRegLevel] = useState('SD');
  const [regAdminName, setRegAdminName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState<SchoolAccount | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setPendingAccount(null);
    setRejectedAccount(null);
    setLoginLoading(true);

    try {
      const res = await apiService.login(loginIdentifier, loginPassword, loginRole);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else if (res.status === 'pending') {
        setPendingAccount({ email: loginIdentifier });
      } else if (res.status === 'rejected') {
        setRejectedAccount({ school: { email: loginIdentifier }, reason: res.rejectionReason || 'Data pendaftaran belum memenuhi syarat verifikasi.' });
      } else {
        setLoginError(res.message || 'Login gagal.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);

    try {
      const res = await apiService.registerSchool({
        name: regName,
        npsn: regNpsn,
        level: regLevel,
        adminName: regAdminName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        city: regCity,
        address: regAddress
      });

      if (res.success && res.school) {
        setRegSuccess(res.school);
      } else {
        setRegError(res.message || 'Gagal mendaftarkan sekolah.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setRegLoading(false);
    }
  };

  // Quick Demo Logins
  const handleDemoLogin = async (type: 'superadmin' | 'school-approved' | 'school-pending') => {
    setLoginError(null);
    setPendingAccount(null);
    setRejectedAccount(null);

    if (type === 'superadmin') {
      setLoginRole('superadmin');
      setLoginIdentifier('superadmin@cbt.id');
      setLoginPassword('SuperAdmin2026!');
      const res = await apiService.login('superadmin@cbt.id', 'SuperAdmin2026!', 'superadmin');
      if (res.success && res.user) onLoginSuccess(res.user);
    } else if (type === 'school-approved') {
      setLoginRole('school');
      setLoginIdentifier('sdn01merdeka@sekolah.id');
      setLoginPassword('Sekolah123!');
      const res = await apiService.login('sdn01merdeka@sekolah.id', 'Sekolah123!', 'school');
      if (res.success && res.user) onLoginSuccess(res.user);
    } else if (type === 'school-pending') {
      setLoginRole('school');
      setLoginIdentifier('smpn5harapan@sekolah.id');
      setLoginPassword('Sekolah123!');
      const res = await apiService.login('smpn5harapan@sekolah.id', 'Sekolah123!', 'school');
      if (res.status === 'pending') {
        setPendingAccount({ email: 'smpn5harapan@sekolah.id' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/25 mb-4">
          <School className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Portal CBT & Manajemen Sekolah
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sistem Ujian CBT Berbasis Komputer & Verifikasi Resmi Sekolah
        </p>

        {/* Quick Demo Access Bar */}
        <div className="mt-5 p-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 text-xs">
          <p className="font-semibold text-slate-300 mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Akses Cepat Pengujian (1-Klik):</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => handleDemoLogin('superadmin')}
              className="px-2.5 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 rounded-lg font-bold text-white transition flex items-center gap-1"
            >
              <Shield className="w-3 h-3 text-amber-300" />
              <span>👑 Super Admin</span>
            </button>
            <button
              onClick={() => handleDemoLogin('school-approved')}
              className="px-2.5 py-1.5 bg-emerald-600/80 hover:bg-emerald-600 rounded-lg font-bold text-white transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-200" />
              <span>🏫 Sekolah Disetujui</span>
            </button>
            <button
              onClick={() => handleDemoLogin('school-pending')}
              className="px-2.5 py-1.5 bg-amber-600/80 hover:bg-amber-600 rounded-lg font-bold text-white transition flex items-center gap-1"
            >
              <Clock className="w-3 h-3 text-amber-200" />
              <span>⏳ Sekolah Pending</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Tabs Switcher: Login vs Registrasi */}
          <div className="flex rounded-xl bg-slate-800/80 p-1 mb-6 border border-slate-700/50">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setRegSuccess(null);
                setPendingAccount(null);
                setRejectedAccount(null);
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setPendingAccount(null);
                setRejectedAccount(null);
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Daftar Akun Sekolah</span>
            </button>
          </div>

          {/* ========================================= */}
          {/* TAB 1: LOGIN */}
          {/* ========================================= */}
          {activeTab === 'login' && (
            <div>
              {/* Status Pending Notice */}
              {pendingAccount && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Akun Menunggu Persetujuan</h4>
                      <p className="text-xs text-amber-200/90 mt-1">
                        Pendaftaran sekolah dengan email <span className="font-mono font-bold text-white">{pendingAccount.email}</span> telah tercatat dan saat ini sedang dalam antrean verifikasi oleh <b>Super Admin</b>.
                      </p>
                      <p className="text-xs text-amber-300 mt-2">
                        💡 Tips: Anda dapat masuk sebagai <b>Super Admin</b> menggunakan tombol di atas untuk langsung menyetujui akun ini.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Rejected Notice */}
              {rejectedAccount && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-white">Pendaftaran Sekolah Ditolak</h4>
                      <p className="text-xs text-rose-200/90 mt-1">
                        Catatan dari Super Admin:
                      </p>
                      <div className="mt-1.5 p-2 rounded bg-black/30 text-xs font-mono text-rose-100 border border-rose-500/20">
                        {rejectedAccount.reason}
                      </div>
                      <p className="text-xs text-slate-300 mt-2">
                        Silakan daftarkan kembali sekolah Anda dengan data yang valid di tab <b>Daftar Akun Sekolah</b>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Role Toggle for Login */}
              <div className="mb-5 flex items-center justify-between p-1 bg-slate-800 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLoginRole('school')}
                  className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1.5 ${
                    loginRole === 'school' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Admin Sekolah</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('superadmin')}
                  className={`flex-1 py-1.5 rounded-md transition flex items-center justify-center gap-1.5 ${
                    loginRole === 'superadmin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Super Admin</span>
                </button>
              </div>

              {loginError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {loginRole === 'school' ? 'Email Sekolah atau NPSN *' : 'Email Super Admin *'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={loginRole === 'school' ? 'contoh: sdn01merdeka@sekolah.id atau 20104567' : 'superadmin@cbt.id'}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kata Sandi *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                  >
                    <span>{loginLoading ? 'Memverifikasi...' : 'Masuk ke Sistem CBT'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
                Belum memiliki akun sekolah?{' '}
                <button
                  onClick={() => setActiveTab('register')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline"
                >
                  Daftarkan Sekolah Anda Sekarang
                </button>
              </div>
            </div>
          )}

          {/* ========================================= */}
          {/* TAB 2: REGISTER SEKOLAH */}
          {/* ========================================= */}
          {activeTab === 'register' && (
            <div>
              {regSuccess ? (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Registrasi Berhasil Diajukan!</h3>
                  <p className="text-xs text-emerald-200 mt-2 max-w-sm mx-auto">
                    Data sekolah <b>{regSuccess.name}</b> (NPSN: {regSuccess.npsn}) telah tersimpan dan saat ini menunggu persetujuan dari <b>Super Admin</b>.
                  </p>
                  <div className="mt-4 p-3 rounded-lg bg-black/40 text-xs text-slate-300 text-left border border-white/5 space-y-1">
                    <p><b>Email:</b> {regSuccess.email}</p>
                    <p><b>Status:</b> <span className="text-amber-400 font-bold uppercase">Menunggu Persetujuan (Pending)</span></p>
                    <p><b>Langkah berikutnya:</b> Super Admin akan meninjau data Anda. Begitu disetujui, Anda dapat langsung login dan menerbitkan CBT.</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('login');
                      setLoginIdentifier(regSuccess.email);
                      setRegSuccess(null);
                    }}
                    className="mt-5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
                  >
                    Buka Halaman Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
                    <HelpCircle className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
                    <span>
                      Akun sekolah yang baru didaftarkan akan berstatus <b>Pending</b> sampai diverifikasi dan disetujui oleh <b>Super Admin</b>.
                    </span>
                  </div>

                  {regError && (
                    <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-200">
                      {regError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nama Resmi Sekolah *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: SDN 01 Percontohan Merdeka"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        NPSN (8 Digit) *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={8}
                        value={regNpsn}
                        onChange={(e) => setRegNpsn(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 20104567"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Jenjang Sekolah *
                      </label>
                      <select
                        value={regLevel}
                        onChange={(e) => setRegLevel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      >
                        <option value="SD">SD / MI</option>
                        <option value="SMP">SMP / MTs</option>
                        <option value="SMA">SMA / MA</option>
                        <option value="SMK">SMK</option>
                        <option value="PKBM">PKBM / Lembaga Kursus</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Nama Admin / Kepala Sekolah *
                      </label>
                      <input
                        type="text"
                        required
                        value={regAdminName}
                        onChange={(e) => setRegAdminName(e.target.value)}
                        placeholder="Nama penanggung jawab"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        No. HP / WhatsApp Aktif *
                      </label>
                      <input
                        type="tel"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="081234567890"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Email Resmi Sekolah *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="admin@sekolah.sch.id"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kata Sandi Akun *
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Kabupaten / Kota *
                      </label>
                      <input
                        type="text"
                        required
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        placeholder="Contoh: Jakarta Pusat"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Alamat Lengkap Sekolah
                      </label>
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Jalan, No, Kelurahan, Kecamatan"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      <span>{regLoading ? 'Mendaftarkan Sekolah...' : 'Kirim Pendaftaran ke Super Admin'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
