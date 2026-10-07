/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, CheckCircle2 } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { SurveyForm } from './components/SurveyForm';
import { Dashboard } from './components/Dashboard';
import { ManageAgenciesModal } from './components/ManageAgenciesModal';
import { PrintReportModal } from './components/PrintReportModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { SurveyResponse, Agency, FilterState } from './types/survey';
import {
  subscribeSurveys,
  subscribeAgencies,
  submitSurvey,
  saveAgency,
  deleteAgency,
  deleteSurvey,
  resetAllSurveys,
  calculateIKMStats,
  syncOfflineSurveysToFirestore,
  getPendingOfflineCount,
  setupAutoSyncListener
} from './services/surveyService';
import { testConnection } from './firebase';
import { DEFAULT_AGENCIES } from './data/defaultAgencies';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function App() {
  const [currentView, setCurrentView] = useState<'survey' | 'dashboard'>('survey');
  const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>(DEFAULT_AGENCIES);
  const [isLive, setIsLive] = useState<boolean>(true);

  // Status Koneksi & Offline IndexedDB Sync
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingOfflineCount, setPendingOfflineCount] = useState<number>(0);
  const [isSyncingOffline, setIsSyncingOffline] = useState<boolean>(false);
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Auth / Login state for Dashboard Analitik (Default: null, logout otomatis saat di luar dashboard)
  const [loggedInOperator, setLoggedInOperator] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [isManageAgenciesOpen, setIsManageAgenciesOpen] = useState<boolean>(false);

  // Active filters for print preview
  const [activePrintFilters, setActivePrintFilters] = useState<FilterState>({
    startDay: 1,
    endDay: 31,
    month: 9, // October
    year: 2026,
    agencyName: 'Semua Instansi (32)',
  });

  useEffect(() => {
    // 1. Test connection to Firestore
    testConnection().then((connected) => {
      setIsLive(connected);
    });

    // 2. Real-time subscription to surveys
    const unsubSurveys = subscribeSurveys((updatedSurveys) => {
      setSurveys(updatedSurveys);
      setIsLive(true);
    });

    // 3. Real-time subscription to agencies
    const unsubAgencies = subscribeAgencies((updatedAgencies) => {
      setAgencies(updatedAgencies);
      setIsLive(true);
    });

    const handleSurveyAdded = (e: Event) => {
      const customEvent = e as CustomEvent<SurveyResponse>;
      if (customEvent.detail) {
        setSurveys((prev) => {
          const exists = prev.some((s) => s.id === customEvent.detail.id);
          if (exists) return prev;
          return [...prev, customEvent.detail].sort((a, b) => {
            const dateA = a.surveyDate || (a.createdAt ? a.createdAt.split('T')[0] : '');
            const dateB = b.surveyDate || (b.createdAt ? b.createdAt.split('T')[0] : '');
            if (dateA && dateB && dateA !== dateB) return dateA.localeCompare(dateB);
            return (a.timestamp || 0) - (b.timestamp || 0);
          });
        });
      }
    };

    const handleSurveySynced = (e: Event) => {
      const customEvent = e as CustomEvent<SurveyResponse>;
      if (customEvent.detail) {
        setSurveys((prev) => {
          const filtered = prev.filter((s) => s.id !== customEvent.detail.id);
          return [{ ...customEvent.detail, isOfflineQueued: false }, ...filtered];
        });
      }
      getPendingOfflineCount().then((cnt) => setPendingOfflineCount(cnt));
    };

    const handleOfflineSyncCompleted = () => {
      getPendingOfflineCount().then((cnt) => setPendingOfflineCount(cnt));
    };

    window.addEventListener('gampil_survey_submitted', handleSurveyAdded);
    window.addEventListener('gampil_survey_synced', handleSurveySynced);
    window.addEventListener('gampil_offline_sync_completed', handleOfflineSyncCompleted);

    return () => {
      unsubSurveys();
      unsubAgencies();
      window.removeEventListener('gampil_survey_submitted', handleSurveyAdded);
      window.removeEventListener('gampil_survey_synced', handleSurveySynced);
      window.removeEventListener('gampil_offline_sync_completed', handleOfflineSyncCompleted);
    };
  }, []);

  // 4. Inisialisasi dan pantau koneksi internet serta antrean data offline di IndexedDB
  useEffect(() => {
    // Cek antrean awal di IndexedDB
    getPendingOfflineCount().then((count) => setPendingOfflineCount(count));

    const handleOnlineStatus = () => {
      setIsOnline(true);
      getPendingOfflineCount().then((count) => setPendingOfflineCount(count));
    };

    const handleOfflineStatus = () => {
      setIsOnline(false);
    };

    const handleOfflineSaved = () => {
      getPendingOfflineCount().then((count) => setPendingOfflineCount(count));
    };

    // Auto-sync listener saat koneksi kembali stabil
    const unsubAutoSync = setupAutoSyncListener((syncedCount) => {
      getPendingOfflineCount().then((count) => setPendingOfflineCount(count));
      setSyncToastMessage(`Koneksi internet stabil! ${syncedCount} data survei offline berhasil disinkronkan ke Firestore.`);
      setTimeout(() => setSyncToastMessage(null), 4500);
    });

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
    window.addEventListener('gampil_offline_survey_saved', handleOfflineSaved);

    return () => {
      unsubAutoSync();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
      window.removeEventListener('gampil_offline_survey_saved', handleOfflineSaved);
    };
  }, []);

  const handleManualSync = async () => {
    if (isSyncingOffline) return;
    setIsSyncingOffline(true);
    try {
      const result = await syncOfflineSurveysToFirestore();
      const count = await getPendingOfflineCount();
      setPendingOfflineCount(count);
      if (result.syncedCount > 0) {
        setSyncToastMessage(`Berhasil menyinkronkan ${result.syncedCount} data survei offline ke database Firestore secara permanen!`);
        setTimeout(() => setSyncToastMessage(null), 4500);
      } else if (result.errors > 0) {
        setSyncToastMessage(`Gagal menyinkronkan ${result.errors} survei. Pastikan koneksi stabil.`);
        setTimeout(() => setSyncToastMessage(null), 4500);
      } else if (count === 0) {
        setSyncToastMessage('Semua data survei sudah sinkron dan tersimpan permanen di database.');
        setTimeout(() => setSyncToastMessage(null), 3000);
      } else if (!navigator.onLine) {
        alert('Perangkat masih dalam keadaan offline. Data tetap aman tersimpan di IndexedDB.');
      }
    } catch (err) {
      console.error('Error saat manual sync:', err);
    } finally {
      setIsSyncingOffline(false);
      getPendingOfflineCount().then((cnt) => setPendingOfflineCount(cnt));
    }
  };

  // Disaat tidak masuk menu dashboard admin kelogout otomatis
  useEffect(() => {
    if (currentView !== 'dashboard') {
      localStorage.removeItem('gampil_admin_session');
      if (loggedInOperator) {
        setLoggedInOperator(null);
      }
    }
  }, [currentView, loggedInOperator]);

  // Handle View Change with Login Gate for Dashboard & Auto-Logout when leaving
  const handleViewChange = (targetView: 'survey' | 'dashboard') => {
    if (targetView === 'dashboard') {
      if (!loggedInOperator) {
        // Open login modal so the admin fills in their credentials
        setIsLoginModalOpen(true);
        return;
      }
      setCurrentView('dashboard');
    } else {
      // Disaat tidak masuk menu dashboard admin kelogout otomatis
      handleLogout();
    }
  };

  // Handle successful login
  const handleLoginSuccess = (operatorName: string) => {
    setLoggedInOperator(operatorName);
    setIsLoginModalOpen(false);
    setCurrentView('dashboard');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('gampil_admin_session');
    setLoggedInOperator(null);
    setCurrentView('survey');
  };

  // Handle citizen submission - immediately update state so it appears in Dashboard Admin permanently
  const handleSubmitSurvey = async (newResponse: Omit<SurveyResponse, 'id'>) => {
    const saved = await submitSurvey(newResponse);
    setSurveys((prev) => {
      const exists = prev.some((s) => s.id === saved.id);
      if (exists) return prev;
      return [...prev, saved].sort((a, b) => {
        const dateA = a.surveyDate || (a.createdAt ? a.createdAt.split('T')[0] : '');
        const dateB = b.surveyDate || (b.createdAt ? b.createdAt.split('T')[0] : '');
        if (dateA && dateB && dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.timestamp || 0) - (b.timestamp || 0);
      });
    });
  };

  // Handle Agency CRUD
  const handleSaveAgency = async (agency: Agency) => {
    await saveAgency(agency);
  };

  const handleDeleteAgency = async (id: string) => {
    await deleteAgency(id);
  };

  const handleImportAgencies = async (importedList: Agency[], replace: boolean) => {
    if (replace) {
      for (const a of agencies) {
        await deleteAgency(a.id);
      }
    }
    for (const a of importedList) {
      await saveAgency(a);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    await deleteSurvey(id);
  };

  const handleResetData = async () => {
    if (window.confirm('Muat ulang 36 sampel survei resmi bulan Oktober 2026?')) {
      await resetAllSurveys();
    }
  };

  const handleAddTestSurvey = () => {
    setCurrentView('survey');
  };

  // Printable surveys sorted chronologically (sesuai tanggal pertama dan seterusnya)
  const printableSurveys = useMemo(() => {
    return surveys
      .filter((s) => {
        let dayVal: number;
        let monthVal: number;
        let yearVal: number;
        if (s.surveyDate && s.surveyDate.includes('-')) {
          const parts = s.surveyDate.split('-').map(Number);
          yearVal = parts[0];
          monthVal = parts[1] - 1;
          dayVal = parts[2];
        } else {
          const d = new Date(s.timestamp || s.createdAt);
          yearVal = d.getFullYear();
          monthVal = d.getMonth();
          dayVal = d.getDate();
        }
        const matchesYear = activePrintFilters.year === -1 || yearVal === activePrintFilters.year;
        const matchesMonth = activePrintFilters.month === -1 || monthVal === activePrintFilters.month;
        const matchesDay =
          activePrintFilters.month === -1
            ? true
            : dayVal >= Math.min(activePrintFilters.startDay, activePrintFilters.endDay) &&
              dayVal <= Math.max(activePrintFilters.startDay, activePrintFilters.endDay);
        const matchesAgency =
          activePrintFilters.agencyName === 'Semua Instansi (32)' || s.agencyName === activePrintFilters.agencyName;

        return matchesYear && matchesMonth && matchesDay && matchesAgency;
      })
      .sort((a, b) => {
        const dateA = a.surveyDate || (a.createdAt ? a.createdAt.split('T')[0] : '');
        const dateB = b.surveyDate || (b.createdAt ? b.createdAt.split('T')[0] : '');
        if (dateA && dateB && dateA !== dateB) return dateA.localeCompare(dateB);
        return (a.timestamp || 0) - (b.timestamp || 0);
      });
  }, [surveys, activePrintFilters]);

  // Calculate current IKM stats for printable report
  const currentStats = useMemo(() => {
    return calculateIKMStats(
      surveys,
      activePrintFilters.year,
      activePrintFilters.month,
      activePrintFilters.startDay,
      activePrintFilters.endDay,
      activePrintFilters.agencyName
    );
  }, [surveys, activePrintFilters]);

  const [showCacheToast, setShowCacheToast] = useState<boolean>(false);

  const handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      setShowCacheToast(true);
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      console.warn('Clear cache error:', err);
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* 3D Navbar with Continuous Running Text Marquee */}
      <Navbar
        currentView={currentView}
        onViewChange={handleViewChange}
        surveyCount={surveys.length}
        isLive={isLive}
        loggedInOperator={loggedInOperator}
        onLogout={handleLogout}
        isOnline={isOnline}
        pendingOfflineCount={pendingOfflineCount}
        isSyncingOffline={isSyncingOffline}
        onManualSync={handleManualSync}
      />

      {/* Auto-Sync Offline Notification Toast */}
      {syncToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-blue-500/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-xs sm:text-sm font-bold">
            {syncToastMessage}
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'survey' ? (
          <SurveyForm
            agencies={agencies}
            onSubmit={handleSubmitSurvey}
            onNavigateToDashboard={() => handleViewChange('dashboard')}
          />
        ) : (
          <Dashboard
            surveys={surveys}
            agencies={agencies}
            onOpenPrintModal={(appliedFilters) => {
              if (appliedFilters) {
                setActivePrintFilters(appliedFilters);
              }
              setIsPrintModalOpen(true);
            }}
            onOpenManageAgencies={() => setIsManageAgenciesOpen(true)}
            onDeleteSurvey={handleDeleteSurvey}
            onDeleteAgency={handleDeleteAgency}
            onResetData={handleResetData}
            onAddTestSurvey={handleAddTestSurvey}
            isLive={isLive}
            operatorName={loggedInOperator || 'admin'}
            onLogout={handleLogout}
            onBackToSurvey={handleLogout}
          />
        )}
      </main>

      {/* Footer Resmi @ Copyright Mal Pelayanan Publik Kabupaten Bojonegoro - 2026 */}
      <footer className="w-full bg-white border-t border-slate-200 py-4 px-4 sm:px-6 lg:px-8 print:hidden shadow-xs">
        <div className="w-full max-w-[1600px] mx-auto relative flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-600 font-semibold" style={{ maxWidth: '1600px', width: '100%' }}>
          <p className="tracking-wide text-center font-medium w-full sm:w-auto">
            @ Copyright Mal Pelayanan Publik Kabupaten Bojonegoro - 2026
          </p>

          {/* Khusus Tampilan Beranda: Tombol Clear Cache dan di Samping Kanannya Logo Dashboard Admin */}
          {currentView === 'survey' && (
            <div className="sm:absolute sm:right-0 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleClearCache}
                className="btn-3d-slate px-3.5 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-rose-600 cursor-pointer shadow-xs"
                title="Bersihkan seluruh cache aplikasi dan segarkan"
              >
                <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                <span>Clear Cache</span>
              </button>

              {/* Logo Dashboard Admin di Samping Kanan Tombol Clear Cache */}
              <button
                type="button"
                onClick={() => handleViewChange('dashboard')}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center p-0.5 bg-transparent hover:bg-slate-100 hover:scale-110 active:scale-95 transition-all cursor-pointer group focus:outline-hidden"
                title={
                  loggedInOperator
                    ? `Dashboard Analitik (${loggedInOperator})`
                    : 'Dashboard Analitik Administrator'
                }
                aria-label="Dashboard Administrator"
              >
                <img
                  src="/logo-mpp-admin-3d.svg"
                  alt="Logo Dashboard Administrator"
                  className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform bg-transparent"
                />
              </button>
            </div>
          )}
        </div>
      </footer>

      {/* Clear Cache Toast Notification */}
      {showCacheToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">Cache berhasil dibersihkan! Memuat ulang...</span>
        </div>
      )}

      {/* Form Login Modal for Dashboard Analitik */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal: Kelola 32 Instansi Publik MPP */}
      <ManageAgenciesModal
        agencies={agencies}
        isOpen={isManageAgenciesOpen}
        onClose={() => setIsManageAgenciesOpen(false)}
        onSaveAgency={handleSaveAgency}
        onDeleteAgency={handleDeleteAgency}
        onImportAgencies={handleImportAgencies}
      />

      {/* Modal: Cetak Laporan Fisik Baku PermenPAN-RB RI */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        surveys={printableSurveys}
        agencies={agencies}
        stats={currentStats}
        filters={activePrintFilters}
        monthsList={MONTH_NAMES}
      />
    </div>
  );
}
