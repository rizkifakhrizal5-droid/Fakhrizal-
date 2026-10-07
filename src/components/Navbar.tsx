import React, { useState, useEffect } from 'react';
import {
  Maximize,
  Minimize,
  Sparkles,
  WifiOff,
  RotateCcw
} from 'lucide-react';

interface NavbarProps {
  currentView: 'survey' | 'dashboard';
  onViewChange: (view: 'survey' | 'dashboard') => void;
  surveyCount: number;
  isLive: boolean;
  loggedInOperator: string | null;
  onLogout: () => void;
  isOnline?: boolean;
  pendingOfflineCount?: number;
  isSyncingOffline?: boolean;
  onManualSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  surveyCount,
  isLive,
  loggedInOperator,
  onLogout,
  isOnline = true,
  pendingOfflineCount = 0,
  isSyncingOffline = false,
  onManualSync,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  const tickerMessage =
    "Selamat Datang Di Mal Pelayanan Publik Kabupaten Bojonegoro • Jam Pelayanan: Senin - Kamis 08.00 - 16.00 WIB | Jum’at 08.00 - 15.30 WIB | Sabtu, Minggu & Hari Libur Nasional: Tutup • Seluruh Pengurusan Perizinan & Dokumen Bebas Pungutan Liar (Pungli) & Bebas Calo • Layanan Terpadu Satu Pintu • Bojonegoro Bahagia Makmur Membanggakan • ";

  return (
    <header className="w-full bg-white border-b-2 border-slate-200/90 sticky top-0 z-50 shadow-md print:hidden">
      {/* 1. Official Running Text (Teks Keterangan Resmi Berjalan / Marquee dengan Titik Kedip-Kedip Live Real-Time) */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white text-xs py-2 px-3 overflow-hidden relative border-b border-blue-800/80 shadow-inner flex items-center">
        {/* Fixed Official Tag on the Left with Blinking Live Real-Time Dot (Tanpa Icon Gedung) */}
        <div className="flex items-center gap-2 shrink-0 z-10 bg-blue-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-blue-400/30 mr-3 shadow-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          </span>
          <span className="font-extrabold text-[11px] text-amber-300 uppercase tracking-wider">
            Keterangan Resmi
          </span>
        </div>

        {/* The Running Text Track (Icon disamping teks Selamat yang berjalan) */}
        <div className="relative flex-1 overflow-hidden h-5 flex items-center">
          <div className="animate-marquee font-medium text-[11.5px] text-blue-100/90 tracking-wide select-none flex items-center gap-8">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse drop-shadow-xs" />
              <span>{tickerMessage}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse drop-shadow-xs" />
              <span>{tickerMessage}</span>
            </span>
          </div>
        </div>

        {/* Offline & Sync Status Badges */}
        {!isOnline && (
          <div className="flex items-center gap-1.5 shrink-0 z-10 bg-rose-900/90 text-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-500/40 ml-2">
            <WifiOff className="w-3 h-3 text-rose-400" />
            <span className="hidden sm:inline">Offline (Disimpan di IndexedDB)</span>
            <span className="sm:hidden">Offline</span>
          </div>
        )}

        {pendingOfflineCount > 0 && (
          <button
            type="button"
            onClick={onManualSync}
            disabled={isSyncingOffline}
            className="flex items-center gap-1.5 shrink-0 z-10 bg-amber-400 hover:bg-amber-300 active:scale-95 text-amber-950 font-black text-[11px] px-3 py-0.5 rounded-full border border-amber-200 shadow-sm cursor-pointer ml-2 transition-all disabled:opacity-80"
            title="Klik untuk menyinkronkan data survei offline ke database Firestore sekarang"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-amber-950 ${isSyncingOffline ? 'animate-spin' : ''}`} />
            <span>{isSyncingOffline ? 'Menyinkronkan...' : `${pendingOfflineCount} Offline (Sync)`}</span>
          </button>
        )}
      </div>

      {/* 2. Main Navigation Bar with Official GAMPIL Logo */}
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2" style={{ maxWidth: '1600px', width: '100%' }}>
        {/* Logo MPP Baru 3 Dimensi Bojonegoro dengan Teks MPP - Gampil & Garis Lurus (Logo menu beranda tidak bisa diklik lagi) */}
        <div
          className="flex items-center gap-2 sm:gap-3.5 cursor-default select-none group min-w-0"
          title="Mal Pelayanan Publik Kabupaten Bojonegoro"
        >
          <div className="h-11 w-11 sm:h-14 sm:w-14 flex items-center justify-center p-0.5 shrink-0 bg-transparent">
            <img
              src="/logo-mpp-transparent.svg"
              alt="Logo MPP - Gampil Bojonegoro"
              className="h-full w-full object-contain filter drop-shadow-md bg-transparent"
            />
          </div>

          <div className="flex flex-col justify-center min-w-0">
            <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-none">
              MPP - Gampil
            </span>
            {/* Garis lurus di bawah teks MPP - Gampil */}
            <div className="w-full h-[2px] bg-slate-300 my-0.5 sm:my-1" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5 text-[9px] sm:text-[11px] font-bold text-slate-500 leading-tight">
              <span className="truncate hidden xs:inline">Gampang Memproses Perizinan</span>
              <span className="text-[9px] sm:text-[11px] text-slate-700 sm:text-slate-500 font-extrabold sm:font-bold leading-tight break-words">
                Mal Pelayanan Publik Kabupaten Bojonegoro
              </span>
            </div>
          </div>
        </div>

        {/* 3. Aksi Kanan Atas: Fullscreen Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Fullscreen Toggle: Logo Saja */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="btn-3d-slate w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh (Kiosk)'}
            aria-label="Mode Layar Penuh"
          >
            {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
