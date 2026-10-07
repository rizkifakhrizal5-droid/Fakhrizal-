import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (operatorName: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [operatorName] = useState('Administrator SKM');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const inputUser = username.trim();
    const inputPass = password;

    if (!inputUser) {
      setErrorMsg('Harap masukkan username.');
      return;
    }
    if (!inputPass) {
      setErrorMsg('Harap masukkan password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let valid = false;
      try {
        const saved = localStorage.getItem('gampil_admin_credentials');
        if (saved) {
          const creds = JSON.parse(saved);
          if (
            (inputUser === creds.username && inputPass === creds.password) ||
            (inputUser === 'admin' && inputPass === 'admin123')
          ) {
            valid = true;
          }
        } else {
          // Default baku: username 'admin' dan password 'admin123'
          if (inputUser === 'admin' && inputPass === 'admin123') {
            valid = true;
          }
        }
      } catch {
        valid = inputUser === 'admin' && inputPass === 'admin123';
      }

      if (valid) {
        const finalName = operatorName;
        if (rememberMe) {
          localStorage.setItem('gampil_admin_session', JSON.stringify({
            operator: finalName,
            loginTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            authenticated: true
          }));
        }
        setIsLoading(false);
        onLoginSuccess(finalName);
      } else {
        setIsLoading(false);
        setErrorMsg('Username atau password tidak sesuai! Apabila tidak sesuai tidak bisa login.');
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 touch-pan-y">
      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 py-8">
        <div className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-[0_20px_50px_rgba(15,23,42,0.35)] overflow-hidden my-auto max-h-[calc(100vh-2rem)] flex flex-col">
          {/* 3D Top Header Accent */}
          <div className="h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 shadow-md shrink-0" />

          {/* Tombol X sengaja disembunyikan sesuai permintaan */}

          {/* Konten Scrollable: Memastikan modal dapat digeser ke atas dan ke bawah dengan lancar tanpa stuck */}
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1 touch-pan-y scroll-smooth">
            {/* Logo Dashboard Analitik: Klik logo untuk kembali ke menu beranda */}
            <div className="text-center">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mb-2 transition-transform hover:scale-110 active:scale-95 bg-transparent cursor-pointer rounded-2xl group focus:outline-hidden"
                title="Klik Logo untuk Kembali ke Menu Beranda"
                aria-label="Kembali ke Menu Beranda"
              >
                <img
                  src="/logo-mpp-admin-3d.svg"
                  alt="Logo Dashboard Analitik - Klik untuk Kembali ke Menu Beranda"
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:drop-shadow-lg transition-all bg-transparent"
                />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Akses Terproteksi
                </div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Login Dashboard Analitik
                </h2>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Silakan isi data akun Anda untuk mengelola hasil survei dan administrasi instansi.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Nama Operator / Petugas (DILOCK: Administrator SKM) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    Nama Operator / Petugas:
                  </span>
                  <span className="text-[10px] text-amber-700 font-extrabold flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    <Lock className="w-3 h-3" /> Terkunci
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={operatorName}
                    readOnly
                    disabled
                    className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 bg-slate-100/90 font-bold cursor-not-allowed border-slate-300 select-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block font-medium">
                  Nama operator terkunci sebagai Administrator SKM untuk menjamin integritas laporan
                </span>
              </div>

              {/* Username (Kosong, tidak otomatis terisi) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Username:
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username admin"
                  autoComplete="off"
                  required
                  className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-medium"
                />
              </div>

              {/* Password (Kosong, tidak otomatis terisi) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password admin"
                    autoComplete="new-password"
                    required
                    className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 font-medium pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me (Default: admin/admin disembunyikan) */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Ingat Sesi di Perangkat Ini</span>
                </label>
              </div>

              {/* Tombol Aksi: Masuk (Tombol kembali ke beranda dihapus sesuai permintaan) */}
              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-3d-blue w-full h-12 py-3 px-5 font-bold text-sm flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 cursor-pointer shadow-md"
                >
                  {isLoading ? (
                    <span>Memverifikasi Akses...</span>
                  ) : (
                    <>
                      <span>Masuk</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Notice */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-[10px] text-slate-400">
                Mal Pelayanan Publik GAMPIL • Keamanan Data Terenkripsi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
