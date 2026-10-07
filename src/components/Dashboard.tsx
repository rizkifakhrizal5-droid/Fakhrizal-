import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Users,
  Award,
  TrendingUp,
  Search,
  Filter,
  Building2,
  Calendar,
  MessageSquare,
  Radio,
  FileSpreadsheet,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Star,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  Network,
  Settings,
  Check,
  X,
  KeyRound,
  UserCheck,
  CheckCircle,
  Clock,
  Plus,
  LogOut,
  Printer
} from 'lucide-react';
import { SurveyResponse, Agency, FilterState } from '../types/survey';
import { calculateIKMStats } from '../services/surveyService';

interface DashboardProps {
  surveys: SurveyResponse[];
  agencies: Agency[];
  onOpenPrintModal?: (currentFilters?: FilterState) => void;
  onOpenManageAgencies: () => void;
  onDeleteSurvey: (id: string) => Promise<void>;
  onDeleteAgency?: (id: string) => Promise<void>;
  onResetData: () => Promise<void>;
  onAddTestSurvey: () => void;
  isLive: boolean;
  operatorName?: string;
  onLogout?: () => void;
  onBackToSurvey?: () => void;
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const Dashboard: React.FC<DashboardProps> = ({
  surveys,
  agencies,
  onOpenPrintModal,
  onOpenManageAgencies,
  onDeleteSurvey,
  onDeleteAgency,
  onResetData,
  onAddTestSurvey,
  isLive,
  operatorName = 'Administrator SKM',
  onLogout,
  onBackToSurvey,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'grafik' | 'pemohon' | 'saran' | 'instansi'
  >('grafik');

  // Fitur Edit Username dan Password Admin
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState(() => {
    try {
      const saved = localStorage.getItem('gampil_admin_credentials');
      if (saved) return JSON.parse(saved).username || 'admin';
    } catch (e) {
      console.warn('Creds parse error:', e);
    }
    return 'admin';
  });
  const [newUsernameInput, setNewUsernameInput] = useState(adminUsername);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [credsError, setCredsError] = useState<string | null>(null);
  const [credsSuccess, setCredsSuccess] = useState(false);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError(null);
    if (!newUsernameInput.trim()) {
      setCredsError('Username tidak boleh kosong.');
      return;
    }
    if (!newPasswordInput) {
      setCredsError('Password baru tidak boleh kosong.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setCredsError('Konfirmasi password tidak cocok.');
      return;
    }

    try {
      const newCreds = {
        username: newUsernameInput.trim(),
        password: newPasswordInput,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('gampil_admin_credentials', JSON.stringify(newCreds));
      setAdminUsername(newUsernameInput.trim());
      setCredsSuccess(true);
      setTimeout(() => {
        setCredsSuccess(false);
        setIsCredsModalOpen(false);
        setNewPasswordInput('');
        setConfirmPasswordInput('');
      }, 900);
    } catch (err) {
      console.warn('Save creds error:', err);
      setCredsError('Gagal menyimpan ke penyimpanan lokal browser.');
    }
  };

  // Fitur Khusus Pengaturan IP Jaringan (Otomatis vs Manual)
  const [ipConfig, setIpConfig] = useState<{
    mode: 'auto' | 'manual';
    autoIp: string;
    manualIp: string;
    subnet: string;
    gateway: string;
    dns: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('gampil_ip_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('IP config parse error:', e);
    }
    return {
      mode: 'auto',
      autoIp: '192.168.12.146',
      manualIp: '192.168.1.100',
      subnet: '255.255.255.0',
      gateway: '192.168.1.1',
      dns: '8.8.8.8',
    };
  });
  const [isIpModalOpen, setIsIpModalOpen] = useState(false);
  const [tempIpConfig, setTempIpConfig] = useState(ipConfig);
  const [ipSaveSuccess, setIpSaveSuccess] = useState(false);

  const handleSaveIp = () => {
    setIpConfig(tempIpConfig);
    try {
      localStorage.setItem('gampil_ip_config', JSON.stringify(tempIpConfig));
    } catch (e) {
      console.warn('IP config save error:', e);
    }
    setIpSaveSuccess(true);
    setTimeout(() => {
      setIpSaveSuccess(false);
      setIsIpModalOpen(false);
    }, 700);
  };

  // Filters State - Default to Oktober 2026
  const [filters, setFilters] = useState<FilterState>({
    startDay: 1,
    endDay: 31,
    month: 9, // Oktober
    year: 2026, // 2026
    agencyName: 'Semua Instansi (32)',
  });

  // Table search & Pagination 5 tiap halaman
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Data Pemohon (5 per page)
  const [saranPage, setSaranPage] = useState(1); // Saran Dan Masukan (5 per page)
  const [grafikPage, setGrafikPage] = useState(1); // Data Grafik Visual 3D Rangkuman Harian (5 per page)
  const [agencyPage, setAgencyPage] = useState(1); // Kelola Instansi (5 per page)
  const itemsPerPage = 5;

  // Selected day for interactive line chart tooltip (3D node)
  const [selectedDay, setSelectedDay] = useState<number>(2);

  // Filtered surveys list
  const filteredSurveys = useMemo(() => {
    return surveys.filter((s) => {
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
      const matchesYear = filters.year === -1 || yearVal === filters.year;
      const matchesMonth = filters.month === -1 || monthVal === filters.month;
      const matchesDay =
        filters.month === -1
          ? true
          : dayVal >= Math.min(filters.startDay, filters.endDay) && dayVal <= Math.max(filters.startDay, filters.endDay);
      const matchesAgency =
        filters.agencyName === 'Semua Instansi (32)' || s.agencyName === filters.agencyName;

      const matchesSearch =
        !searchTerm ||
        s.respondentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.agencyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.feedback.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesYear && matchesMonth && matchesDay && matchesAgency && matchesSearch;
    });
  }, [surveys, filters, searchTerm]);

  // Calculate IKM Analytics
  const stats = useMemo(() => {
    return calculateIKMStats(
      surveys,
      filters.year,
      filters.month,
      filters.startDay,
      filters.endDay,
      filters.agencyName
    );
  }, [surveys, filters]);

  // Data Pemohon Pagination (5 per page)
  const totalPemohonPages = Math.ceil(filteredSurveys.length / itemsPerPage) || 1;
  const paginatedSurveys = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSurveys.slice(start, start + itemsPerPage);
  }, [filteredSurveys, currentPage]);

  // Saran Dan Masukan Pagination (5 per page)
  const totalSaranPages = Math.ceil(filteredSurveys.length / itemsPerPage) || 1;
  const paginatedSaran = useMemo(() => {
    const start = (saranPage - 1) * itemsPerPage;
    return filteredSurveys.slice(start, start + itemsPerPage);
  }, [filteredSurveys, saranPage]);

  // Data Grafik Visual 3D Rangkuman Harian Pagination (5 per page)
  const activeDays = useMemo(() => {
    return stats.dailyTrends.filter((d) => d.totalVotes > 0);
  }, [stats.dailyTrends]);
  const totalGrafikPages = Math.ceil(activeDays.length / itemsPerPage) || 1;
  const paginatedDailySummary = useMemo(() => {
    const start = (grafikPage - 1) * itemsPerPage;
    return activeDays.slice(start, start + itemsPerPage);
  }, [activeDays, grafikPage]);

  // Kelola Instansi Pagination (5 per page)
  const [agencySearch, setAgencySearch] = useState('');
  const filteredAgenciesList = useMemo(() => {
    return agencies.filter((a) =>
      a.name.toLowerCase().includes(agencySearch.toLowerCase()) ||
      (a.category && a.category.toLowerCase().includes(agencySearch.toLowerCase()))
    );
  }, [agencies, agencySearch]);
  const totalAgencyPages = Math.ceil(filteredAgenciesList.length / itemsPerPage) || 1;
  const paginatedAgencies = useMemo(() => {
    const start = (agencyPage - 1) * itemsPerPage;
    return filteredAgenciesList.slice(start, start + itemsPerPage);
  }, [filteredAgenciesList, agencyPage]);

  // Penilaian & Capaian Kinerja Instansi Pelayanan Publik (32 Instansi)
  const agencyEvaluations = useMemo(() => {
    const surveysInPeriod = surveys.filter((s) => {
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
      const matchesYear = filters.year === -1 || yearVal === filters.year;
      const matchesMonth = filters.month === -1 || monthVal === filters.month;
      const matchesDay =
        filters.month === -1
          ? true
          : dayVal >= Math.min(filters.startDay, filters.endDay) && dayVal <= Math.max(filters.startDay, filters.endDay);
      return matchesYear && matchesMonth && matchesDay;
    });

    const map = new Map<
      string,
      { count: number; sumRating: number; satisfied: number }
    >();

    surveysInPeriod.forEach((s) => {
      const existing = map.get(s.agencyName) || { count: 0, sumRating: 0, satisfied: 0 };
      existing.count += 1;
      existing.sumRating += s.rating;
      if (s.rating >= 4) {
        existing.satisfied += 1;
      }
      map.set(s.agencyName, existing);
    });

    return agencies.map((agency, index) => {
      const data = map.get(agency.name) || { count: 0, sumRating: 0, satisfied: 0 };
      const avg = data.count > 0 ? Math.round((data.sumRating / data.count) * 100) / 100 : 0;
      const ikm = data.count > 0 ? Math.round((avg / 5) * 100 * 10) / 10 : 0;
      const satisfiedPct = data.count > 0 ? Math.round((data.satisfied / data.count) * 100) : 0;
      let mutu = 'Belum Ada Survei';
      if (data.count > 0) {
        if (ikm >= 88.31) mutu = 'A (Sangat Baik)';
        else if (ikm >= 76.61) mutu = 'B (Baik)';
        else if (ikm >= 65) mutu = 'C (Kurang Baik)';
        else mutu = 'D (Tidak Baik)';
      }
      return {
        id: agency.id,
        order: agency.order || index + 1,
        name: agency.name,
        category: agency.category || 'Pelayanan Publik',
        active: agency.active,
        totalRespondents: data.count,
        averageRating: avg,
        ikmScore: ikm,
        mutu,
        satisfiedPercentage: satisfiedPct,
      };
    });
  }, [agencies, surveys, filters.year, filters.month, filters.startDay, filters.endDay]);

  // State khusus tabel Penilaian & Capaian Kinerja Instansi di tab Data Grafik
  const [kinerjaSearch, setKinerjaSearch] = useState('');
  const [kinerjaPage, setKinerjaPage] = useState(1);
  const [showAllKinerja, setShowAllKinerja] = useState(false);
  const kinerjaItemsPerPage = 8;

  const filteredKinerjaAgencies = useMemo(() => {
    return agencyEvaluations.filter((a) =>
      a.name.toLowerCase().includes(kinerjaSearch.toLowerCase())
    );
  }, [agencyEvaluations, kinerjaSearch]);

  const totalKinerjaPages = Math.ceil(filteredKinerjaAgencies.length / kinerjaItemsPerPage) || 1;
  const paginatedKinerjaAgencies = useMemo(() => {
    if (showAllKinerja) return filteredKinerjaAgencies;
    const start = (kinerjaPage - 1) * kinerjaItemsPerPage;
    return filteredKinerjaAgencies.slice(start, start + kinerjaItemsPerPage);
  }, [filteredKinerjaAgencies, kinerjaPage, showAllKinerja]);

  const handleSelectAgencyFromKinerja = (agencyName: string) => {
    setFilters((prev) => ({ ...prev, agencyName }));
    setActiveTab('pemohon');
    setCurrentPage(1);
  };

  // Selected Day Details for line chart callout
  const activeDayPoint = stats.dailyTrends.find((t) => t.day === selectedDay) || {
    day: selectedDay,
    dateStr: `Tgl ${selectedDay}`,
    ikmScore: 90.0,
    averageRating: 4.5,
    totalVotes: 14,
    mutu: 'Mutu A (Sangat Baik)',
  };

  const formatDateTime = (input: string | SurveyResponse) => {
    if (typeof input === 'string') {
      const d = new Date(input);
      const day = String(d.getDate()).padStart(2, '0');
      const month = MONTH_NAMES[d.getMonth()]?.slice(0, 3) || 'Okt';
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}.${mins}`;
    }

    if (input.surveyDate && input.surveyDate.includes('-')) {
      const parts = input.surveyDate.split('-').map(Number);
      const day = String(parts[2]).padStart(2, '0');
      const month = MONTH_NAMES[parts[1] - 1]?.slice(0, 3) || 'Okt';
      const year = parts[0];

      let explicitHours = '10';
      let explicitMins = '00';
      if (input.createdAt && input.createdAt.includes('T')) {
        const timePart = input.createdAt.split('T')[1]?.split('.')[0] || '';
        const timeParts = timePart.split(':');
        if (timeParts.length >= 2) {
          explicitHours = timeParts[0];
          explicitMins = timeParts[1];
        }
      } else if (input.timestamp) {
        const td = new Date(input.timestamp);
        explicitHours = String(td.getHours()).padStart(2, '0');
        explicitMins = String(td.getMinutes()).padStart(2, '0');
      }

      return `${day} ${month} ${year}, ${explicitHours}.${explicitMins}`;
    }

    const d = new Date(input.timestamp || input.createdAt);
    const day = String(d.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()]?.slice(0, 3) || 'Okt';
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}.${mins}`;
  };



  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 pb-20">


      {/* 3D Top Header Bar */}
      <div className="bg-white border-b-2 border-slate-200/90 shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5" style={{ maxWidth: '1600px', width: '100%' }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col justify-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight drop-shadow-xs">
                Dashboard Administrator
              </h1>

              <div className="flex items-center gap-2 text-xs text-slate-600 mt-2 font-mono flex-wrap">
                  {/* Fitur Khusus Pengaturan IP Otomatis & Manual */}
                  <button
                    type="button"
                    onClick={() => {
                      setTempIpConfig(ipConfig);
                      setIsIpModalOpen(true);
                    }}
                    className="btn-3d-slate px-3 py-1.5 text-xs font-bold text-slate-800 flex items-center gap-2 hover:text-blue-600 cursor-pointer shadow-xs"
                    title="Klik untuk mengatur IP Otomatis (DHCP) atau IP Manual (Static)"
                  >
                    <Network className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      IP: <strong>{ipConfig.mode === 'auto' ? ipConfig.autoIp : ipConfig.manualIp}</strong> ({ipConfig.mode === 'auto' ? 'Otomatis' : 'Manual'})
                    </span>
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <span className="text-slate-400 hidden sm:inline">•</span>

                  {/* Tombol Edit Username dan Password Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      setNewUsernameInput(adminUsername);
                      setNewPasswordInput('');
                      setConfirmPasswordInput('');
                      setCredsError(null);
                      setIsCredsModalOpen(true);
                    }}
                    className="btn-3d-slate px-3 py-1.5 text-xs font-bold text-slate-800 flex items-center gap-1.5 hover:text-blue-600 cursor-pointer shadow-xs"
                    title="Ubah Username dan Password Admin"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit Akun Admin ({adminUsername})</span>
                  </button>

                  {/* Tombol Logout Samping Kanan Edit Akun Admin */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onLogout) {
                        onLogout();
                      } else {
                        localStorage.removeItem('gampil_admin_session');
                        window.location.reload();
                      }
                    }}
                    className="btn-3d-slate px-3.5 py-1.5 text-xs font-black text-rose-700 hover:text-white hover:bg-rose-600 flex items-center gap-1.5 cursor-pointer shadow-xs border border-rose-300 transition-all active:scale-95 bg-rose-50/70"
                    title="Keluar dari sesi Administrator SKM"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

            {/* Top right space */}
            <div className="flex items-center gap-2 sm:gap-3">
              {onOpenPrintModal && (
                <button
                  type="button"
                  onClick={() => onOpenPrintModal && onOpenPrintModal(filters)}
                  className="btn-3d-slate px-3.5 py-2.5 text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer shadow-xs text-slate-800 hover:text-blue-700 active:scale-95"
                  title="Buka Pratinjau & Cetak Laporan Fisik Resmi"
                >
                  <Printer className="w-4 h-4 text-blue-600" />
                  <span>Preview &amp; Cetak Laporan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6" style={{ maxWidth: '1600px', width: '100%' }}>
        {/* 1. SEPARATED FILTERS: Penanggalan Rekapitulasi Pelayanan & Pilih Instansi Publik */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Card 1: Penanggalan Rekapitulasi Pelayanan */}
          <div className="lg:col-span-8 card-3d p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 w-full">
              <span className="font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide shrink-0">
                <Calendar className="w-4 h-4 text-blue-600" />
                Penanggalan Layanan:
              </span>

              {/* Mulai Tanggal */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold whitespace-nowrap">Mulai:</span>
                <select
                  value={filters.startDay}
                  onChange={(e) => setFilters({ ...filters, startDay: Number(e.target.value) })}
                  className="input-3d px-2.5 py-1.5 text-slate-900 font-bold"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Tgl {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* s/d Tanggal */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold whitespace-nowrap">s/d:</span>
                <select
                  value={filters.endDay}
                  onChange={(e) => setFilters({ ...filters, endDay: Number(e.target.value) })}
                  className="input-3d px-2.5 py-1.5 text-slate-900 font-bold"
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      Tgl {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bulan & Tahun Bersebelahan (Tahun berada tepat di samping kanan Bulan) */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-bold">Bulan:</span>
                  <select
                    value={filters.month}
                    onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
                    className="input-3d px-2.5 py-1.5 text-slate-900 font-bold"
                  >
                    <option value={-1}>Semua Bulan</option>
                    {MONTH_NAMES.map((name, idx) => (
                      <option key={name} value={idx}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-bold">Tahun:</span>
                  <select
                    value={filters.year}
                    onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
                    className="input-3d px-2.5 py-1.5 text-slate-900 font-bold"
                  >
                    <option value={-1}>Semua Tahun</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pilih Instansi Publik (Terpisah dari Penanggalan) */}
          <div className="lg:col-span-4 card-3d p-4 sm:p-5 flex items-center justify-between gap-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2.5 w-full">
              <span className="font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide shrink-0 text-[11px] sm:text-xs">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                Pilih Instansi:
              </span>
              <select
                value={filters.agencyName}
                onChange={(e) => setFilters({ ...filters, agencyName: e.target.value })}
                className="input-3d px-3 py-2 sm:py-1.5 text-slate-900 font-bold w-full sm:flex-1 truncate text-xs"
              >
                <option value="Semua Instansi (32)">Semua Instansi (32)</option>
                {agencies.map((agency, idx) => (
                  <option key={agency.id} value={agency.name}>
                    {idx + 1}. {agency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. TOMBOL TAB NAVIGASI: Rata tengah kanan-kiri tampilan desktop dan seluler */}
        <div className="w-full flex justify-center pb-3 sm:pb-4 mb-8 sm:mb-10 border-b-2 border-slate-200/80">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 w-full sm:w-auto max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('grafik')}
              className={`px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
                activeTab === 'grafik' ? 'btn-3d-blue' : 'btn-3d-slate'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span className="truncate">Data Grafik</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pemohon')}
              className={`px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
                activeTab === 'pemohon' ? 'btn-3d-blue' : 'btn-3d-slate'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Data Pemohon</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('saran')}
              className={`px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
                activeTab === 'saran' ? 'btn-3d-blue' : 'btn-3d-slate'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">Saran Dan Masukan</span>
            </button>

            {/* Tombol khusus teks Instansi Publik */}
            <button
              type="button"
              onClick={() => setActiveTab('instansi')}
              className={`px-3.5 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 text-center shadow-xs ${
                activeTab === 'instansi' ? 'btn-3d-blue' : 'btn-3d-slate text-slate-700'
              }`}
            >
              <Building2 className="w-4 h-4 shrink-0 text-blue-600" />
              <span className="truncate">Instansi Publik</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DATA GRAFIK VISUAL 3D */}
        {activeTab === 'grafik' && (
          <div className="space-y-6">
            {/* 3D Elevated Banner - Teks Diperpanjang & Card Skor IKM / Mutu / Total Suara Disembunyikan */}
            <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-950 text-white shadow-[0_12px_24px_rgba(30,58,138,0.35)] border-t border-white/30 flex flex-col justify-between gap-4 relative overflow-hidden">
              <div className="space-y-2 relative z-10 max-w-4xl">
                <span className="inline-block text-[11px] uppercase font-black tracking-widest bg-white/20 px-3 py-0.5 rounded-full text-blue-100 border border-white/20">
                  HALAMAN GRAFIK
                </span>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight drop-shadow-sm leading-snug">
                  Analitik Tren Kepuasan &amp; Diagram Garis Nilai Indeks Kepuasan Masyarakat Terpadu
                </h2>
                <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed">
                  Visualisasi perkembangan skor IKM dan rating layanan per waktu dengan nilai tertera jelas pada tiap titik kalender pelayanan secara transparan, akurat di Mal Pelayanan Publik Kabupaten Bojonegoro.
                </p>
              </div>
            </div>

            {/* 4 Key 3D Metric Slabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Metric 1: IKM */}
              <div className="card-3d p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      Indeks Kepuasan (IKM)
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        {stats.ikmScore}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">/ 100</span>
                    </div>
                  </div>
                  <div className="coin-3d w-12 h-12 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-amber-300 drop-shadow-md" />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-black text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs">
                    {stats.mutu}
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">Skala 25 - 100</span>
                </div>
              </div>

              {/* Metric 2: Rating */}
              <div className="card-3d p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      Rata-Rata Rating
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        {stats.averageRating}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">/ 5.00</span>
                    </div>
                  </div>
                  <div className="coin-3d-gold w-12 h-12 flex items-center justify-center shrink-0">
                    <Star className="w-6 h-6 fill-amber-900 text-amber-900 drop-shadow-xs" />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-bold">
                    Skor {stats.averageRating} Skala kepuasan
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">Bulan ini</span>
                </div>
              </div>

              {/* Metric 3: Total Responden */}
              <div className="card-3d p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      Total Responden
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                        {stats.totalRespondents}
                      </span>
                      <span className="text-xs text-slate-500 font-bold ml-1">Pemohon</span>
                    </div>
                  </div>
                  <div className="coin-3d w-12 h-12 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-bold">Data Terverifikasi</span>
                  <span className="text-[11px] text-slate-400 font-semibold">Responden Terdata</span>
                </div>
              </div>

              {/* Metric 4: Sentimen Puas */}
              <div className="card-3d p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      Indeks Sentimen Puas
                    </span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                        {stats.satisfiedPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-[0_4px_0_0_#047857,0_6px_10px_rgba(4,120,87,0.3)] border-t border-white/50 shrink-0">
                    <TrendingUp className="w-6 h-6 drop-shadow-sm" />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-bold">Rating 4 dan 5 (Puas)</span>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {stats.ratingCounts[5] + stats.ratingCounts[4]} dari {stats.totalRespondents}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Row: 3D Line Chart + Rating Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: 3D Interactive Line Chart (8 Cols) */}
              <div className="lg:col-span-8 card-3d p-5 sm:p-7 flex flex-col justify-between space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between flex-wrap gap-2 text-center sm:text-left w-full">
                  <div className="w-full sm:w-auto mx-auto sm:mx-0 flex flex-col items-center sm:items-start text-center sm:text-left">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight text-center sm:text-left w-full">
                      Grafik Kepuasan Masyarakat (Bulan Ini)
                    </h3>
                    <p className="text-xs text-slate-500 font-medium text-center sm:text-left w-full mt-0.5">
                      Perkembangan Nilai IKM harian selama bulan berjalan
                    </p>
                  </div>
                </div>

                {/* 3D Active Day Callout Plaque - Rata tengah kanan-kiri khusus tampilan seluler (mobile) */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/70 p-4 rounded-2xl border border-blue-200 shadow-sm flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-xs text-center sm:text-left w-full">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 w-full sm:w-auto text-center sm:text-left">
                    <span className="btn-3d-blue px-3 py-1 text-xs font-black mx-auto sm:mx-0">
                      Tgl {activeDayPoint.day}
                    </span>
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-xl font-extrabold text-xs border border-emerald-300">
                      {activeDayPoint.mutu}
                    </span>
                    <span className="text-slate-600 font-medium text-xs w-full sm:w-auto text-center sm:text-left">
                      {activeDayPoint.totalVotes} responden tercatat pada tanggal ini
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4 text-xs font-mono w-full sm:w-auto">
                    <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs text-center">
                      <span className="text-slate-400 text-[10px] uppercase block font-bold">Skor IKM</span>
                      <strong className="text-blue-900 text-sm font-black">{activeDayPoint.ikmScore}</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs text-center">
                      <span className="text-slate-400 text-[10px] uppercase block font-bold">Rata-Rata</span>
                      <strong className="text-slate-800 text-sm font-black">{activeDayPoint.averageRating}</strong>
                    </div>
                    <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs text-center">
                      <span className="text-slate-400 text-[10px] uppercase block font-bold">Total Suara</span>
                      <strong className="text-slate-800 text-sm font-black">{activeDayPoint.totalVotes}</strong>
                    </div>
                  </div>
                </div>

                {/* SVG Visual Stage with Horizontal Scroll Container for Mobile */}
                <div className="w-full overflow-x-auto pt-2">
                  <div className="min-w-[580px]">
                    <div className="text-[11px] text-slate-400 mb-1 flex justify-between font-medium">
                      <span>Skala Kalender: Rekapitulasi Tanggal 1 s/d 31</span>
                      <span>Sentuh atau klik batang tanggal untuk melihat data</span>
                    </div>

                    <svg className="w-full h-52 overflow-visible" viewBox="0 0 620 190">
                      <defs>
                        <filter id="shadow3d" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#1e3a8a" floodOpacity="0.3" />
                        </filter>
                      </defs>

                      {/* Y-axis gridlines */}
                      {[100, 80, 60, 40, 20].map((val) => {
                        const y = 170 - (val / 100) * 150;
                        return (
                          <g key={val}>
                            <line x1="25" y1={y} x2="615" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                            <text x="5" y={y + 3} fill="#94a3b8" fontSize="9" fontWeight="bold" textAnchor="start">
                              {val}
                            </text>
                          </g>
                        );
                      })}

                      {/* Day columns */}
                      {stats.dailyTrends.map((point) => {
                        const x = 35 + (point.day - 1) * 18.5;
                        const hasData = point.totalVotes > 0;
                        const y = hasData ? 170 - (point.ikmScore / 100) * 150 : 170;
                        const isSelected = selectedDay === point.day;

                        return (
                          <g
                            key={point.day}
                            className="cursor-pointer group"
                            onClick={() => setSelectedDay(point.day)}
                          >
                            <rect
                              x={x - 8}
                              y="15"
                              width="16"
                              height="160"
                              rx="4"
                              fill={isSelected ? '#93c5fd' : 'transparent'}
                              opacity={isSelected ? '0.45' : '0'}
                              className="group-hover:opacity-25 group-hover:fill-blue-300 transition-opacity"
                            />

                            <text
                              x={x}
                              y="185"
                              fontSize="8.5"
                              textAnchor="middle"
                              fill={isSelected ? '#1e3a8a' : '#64748b'}
                              fontWeight={isSelected ? '900' : '600'}
                            >
                              {point.day}
                            </text>

                            {hasData && (
                              <g filter="url(#shadow3d)">
                                <circle
                                  cx={x}
                                  cy={y}
                                  r={isSelected ? '7' : '5'}
                                  fill="#2563eb"
                                  stroke="#ffffff"
                                  strokeWidth="2.5"
                                  className="transition-all"
                                />
                                <text
                                  x={x}
                                  y={y - 9}
                                  fontSize="9.5"
                                  fontWeight="900"
                                  textAnchor="middle"
                                  fill="#1e3a8a"
                                >
                                  {point.ikmScore}
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}

                      {/* Connecting line */}
                      {(() => {
                        const dataPoints = stats.dailyTrends
                          .filter((p) => p.totalVotes > 0)
                          .map((p) => {
                            const x = 35 + (p.day - 1) * 18.5;
                            const y = 170 - (p.ikmScore / 100) * 150;
                            return `${x},${y}`;
                          });

                        if (dataPoints.length > 1) {
                          return (
                            <polyline
                              fill="none"
                              stroke="#2563eb"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={dataPoints.join(' ')}
                            />
                          );
                        }
                        return null;
                      })()}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Right: Rating Distribution (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="card-3d p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Distribusi Nilai Rating
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Komposisi nilai kepuasan (Bulan Ini)
                    </p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {[5, 4, 3, 2, 1].map((r) => {
                      const count = stats.ratingCounts[r] || 0;
                      const pct = stats.totalRespondents > 0
                        ? Math.round((count / stats.totalRespondents) * 100)
                        : 0;
                      const label =
                        r === 5 ? 'Rating 5 (Sangat Puas)' :
                        r === 4 ? 'Rating 4 (Puas)' :
                        r === 3 ? 'Rating 3 (Cukup)' :
                        r === 2 ? 'Rating 2 (Tidak Puas)' : 'Rating 1 (Sangat Tidak Puas)';

                      const barClass =
                        r === 5 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_2px_0_0_#047857]' :
                        r === 4 ? 'bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_2px_0_0_#1e3a8a]' :
                        r === 3 ? 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-[0_2px_0_0_#b45309]' :
                        r === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 shadow-[0_2px_0_0_#c2410c]' :
                        'bg-gradient-to-r from-rose-400 to-rose-600 shadow-[0_2px_0_0_#be123c]';

                      return (
                        <div key={r} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700">{label}</span>
                            <span className="text-slate-600 font-mono">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${barClass}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Rangkuman 9 Unsur Pelayanan Publik (UU No. 25 Tahun 2009) */}
            <div className="card-3d p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    Rata-Rata 9 Unsur Pelayanan Publik
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Skor rata-rata per unsur pelayanan publik pada loket MPP Bojonegoro (Skala 1 - 5)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 pt-1">
                {[
                  { title: '1. Persyaratan', score: stats.unsurAverages?.persyaratan || stats.averageRating },
                  { title: '2. Sistem, Mekanisme, Prosedur', score: stats.unsurAverages?.prosedur || stats.averageRating },
                  { title: '3. Waktu Penyelesaian', score: stats.unsurAverages?.waktu || stats.averageRating },
                  { title: '4. Biaya / Tarif', score: stats.unsurAverages?.biaya || stats.averageRating },
                  { title: '5. Produk Spesifikasi Jenis Pelayanan', score: stats.unsurAverages?.produk || stats.averageRating },
                  { title: '6. Kompetensi Pelaksana', score: stats.unsurAverages?.kompetensi || stats.averageRating },
                  { title: '7. Perilaku Pelaksana', score: stats.unsurAverages?.perilaku || stats.averageRating },
                  { title: '8. Penanganan Pengaduan, Saran Dan Masukan', score: stats.unsurAverages?.pengaduan || stats.averageRating },
                  { title: '9. Kesopanan Petugas Pelayanan', score: stats.unsurAverages?.kesopanan || stats.averageRating },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-slate-700 leading-snug">{item.title}</span>
                    <span className="text-xs font-black text-blue-800 bg-blue-100/80 px-2.5 py-1 rounded-xl shrink-0 border border-blue-200">
                      {item.score} / 5
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PENILAIAN & CAPAIAN KINERJA INSTANSI PELAYANAN PUBLIK (32 INSTANSI) */}
            <div className="card-3d overflow-hidden space-y-0">
              <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="coin-3d w-7 h-7 flex items-center justify-center shrink-0">
                      <Award className="w-4 h-4 text-amber-300 drop-shadow-xs" />
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Penilaian &amp; Capaian Kinerja Instansi Pelayanan Publik
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Rekapitulasi capaian IKM, rata-rata rating, mutu layanan, dan persentase kepuasan pemohon 32 instansi pelayanan publik Mal Pelayanan Publik Bojonegoro
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  {/* Search Instansi */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={kinerjaSearch}
                      onChange={(e) => {
                        setKinerjaSearch(e.target.value);
                        setKinerjaPage(1);
                      }}
                      placeholder="Cari instansi..."
                      className="input-3d pl-9 pr-3 py-1.5 text-xs w-full sm:w-52 font-semibold"
                    />
                  </div>

                  {/* Toggle Tampilkan Semua / Pagination */}
                  <button
                    type="button"
                    onClick={() => setShowAllKinerja(!showAllKinerja)}
                    className="btn-3d-slate px-3 py-1.5 text-xs font-bold text-slate-700 whitespace-nowrap cursor-pointer shadow-xs"
                    title="Beralih antara mode pagination dan tampilkan semua 32 instansi"
                  >
                    {showAllKinerja ? 'Mode 8 per Halaman' : 'Tampilkan Semua (32)'}
                  </button>

                  {/* Pagination Controls */}
                  {!showAllKinerja && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setKinerjaPage((p) => Math.max(p - 1, 1))}
                        disabled={kinerjaPage === 1}
                        className="btn-3d-slate px-2.5 py-1.5 text-xs font-bold disabled:opacity-40"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs font-mono font-bold text-slate-600 px-1">
                        {kinerjaPage} / {totalKinerjaPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setKinerjaPage((p) => Math.min(p + 1, totalKinerjaPages))}
                        disabled={kinerjaPage === totalKinerjaPages}
                        className="btn-3d-slate px-2.5 py-1.5 text-xs font-bold disabled:opacity-40"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Table Penilaian & Capaian Kinerja Instansi Pelayanan Publik */}
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                      <th className="p-3 w-10 text-center">NO</th>
                      <th className="p-3 min-w-[220px]">NAMA INSTANSI PELAYANAN PUBLIK</th>
                      <th className="p-3 w-24 text-center">RESPONDEN</th>
                      <th className="p-3 w-28 text-center">RATA-RATA RATING</th>
                      <th className="p-3 w-28 text-center">SKOR IKM (100)</th>
                      <th className="p-3 w-28 text-center">MUTU LAYANAN</th>
                      <th className="p-3 min-w-[160px] text-center">% KEPUASAN &amp; CAPAIAN</th>
                      <th className="p-3 w-28 text-center">AKSI CEPAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paginatedKinerjaAgencies.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                          Tidak ditemukan nama instansi yang sesuai dengan kata kunci "{kinerjaSearch}".
                        </td>
                      </tr>
                    ) : (
                      paginatedKinerjaAgencies.map((agencyItem) => {
                        return (
                          <tr key={agencyItem.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className="p-3 text-center font-mono font-bold text-slate-400">
                              {agencyItem.order}
                            </td>
                            <td className="p-3 font-extrabold text-slate-900 break-words leading-snug">
                              <div className="flex items-center gap-2">
                                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span>{agencyItem.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-center font-bold">
                              {agencyItem.totalRespondents > 0 ? (
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-black text-[11px]">
                                  {agencyItem.totalRespondents} Pemohon
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">0 Pemohon</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {agencyItem.totalRespondents > 0 ? (
                                <div className="flex items-center justify-center gap-1 font-black text-slate-900">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                  <span>{agencyItem.averageRating}</span>
                                  <span className="text-[10px] text-slate-400 font-normal">/ 5.0</span>
                                </div>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center font-black">
                              {agencyItem.totalRespondents > 0 ? (
                                <span className="text-blue-700 text-sm">
                                  {agencyItem.ikmScore}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              {agencyItem.totalRespondents > 0 ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-lg text-[11px] font-black ${
                                    agencyItem.ikmScore >= 88.31
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : agencyItem.ikmScore >= 76.61
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}
                                >
                                  {agencyItem.mutu}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Belum Ada</span>
                              )}
                            </td>
                            <td className="p-3">
                              {agencyItem.totalRespondents > 0 ? (
                                <div className="space-y-1">
                                  <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-emerald-700 font-mono">{agencyItem.satisfiedPercentage}% Puas</span>
                                    <span className="text-slate-400 text-[10px]">Target 85%</span>
                                  </div>
                                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        agencyItem.satisfiedPercentage >= 88
                                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                          : agencyItem.satisfiedPercentage >= 75
                                          ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                          : 'bg-gradient-to-r from-amber-400 to-amber-600'
                                      }`}
                                      style={{ width: `${Math.min(100, agencyItem.satisfiedPercentage)}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center text-slate-400 text-[11px]">-</div>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleSelectAgencyFromKinerja(agencyItem.name)}
                                className="btn-3d-slate px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                                title={`Lihat data pemohon untuk ${agencyItem.name}`}
                              >
                                <span>Lihat Pemohon</span>
                                <ArrowUpRight className="w-3 h-3 text-blue-600" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sub-footer summary bar */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-2 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>
                    Seluruh <strong>32 instansi</strong> tersinkronisasi otomatis dengan database Firestore real-time.
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Klik tombol <strong>"Lihat Pemohon"</strong> pada instansi untuk memeriksa rincian suara dan saran pemohon.
                </div>
              </div>
            </div>

            {/* Rangkuman Data Grafik Visual 3D per Halaman (5 Data per Halaman dengan Tombol Sebelum & Selanjutnya) */}
            <div className="card-3d overflow-hidden space-y-0">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
                    Rangkuman Data Kalender Pelayanan Harian
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Menampilkan 5 titik tanggal pelayanan per halaman
                  </p>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGrafikPage((p) => Math.max(p - 1, 1))}
                    disabled={grafikPage === 1}
                    className="btn-3d-slate px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs font-mono font-bold text-slate-600 px-2">
                    {grafikPage} / {totalGrafikPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setGrafikPage((p) => Math.min(p + 1, totalGrafikPages))}
                    disabled={grafikPage === totalGrafikPages}
                    className="btn-3d-slate px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto bg-white">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                      <th className="p-3.5">TANGGAL</th>
                      <th className="p-3.5 text-center">SKOR IKM</th>
                      <th className="p-3.5 text-center">RATA-RATA RATING</th>
                      <th className="p-3.5 text-center">MUTU</th>
                      <th className="p-3.5 text-center">TOTAL SUARA</th>
                      <th className="p-3.5 text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paginatedDailySummary.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Belum ada rekapitulasi data pada tanggal ini.
                        </td>
                      </tr>
                    ) : (
                      paginatedDailySummary.map((item) => (
                        <tr key={item.day} className="hover:bg-blue-50/40">
                          <td className="p-3.5 font-bold text-slate-900">
                            Tanggal {item.day} {filters.month >= 0 && filters.month < 12 ? MONTH_NAMES[filters.month] : MONTH_NAMES[new Date().getMonth()]} {filters.year > 0 ? filters.year : new Date().getFullYear()}
                          </td>
                          <td className="p-3.5 text-center font-black text-blue-700">
                            {item.ikmScore}
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-800">
                            {item.averageRating} / 5.0
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              {item.mutu}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-slate-700">
                            {item.totalVotes} Pemohon
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="text-emerald-700 font-bold flex items-center justify-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Terverifikasi
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA PEMOHON (5 Data per Halaman) */}
        {activeTab === 'pemohon' && (
          <div className="card-3d overflow-hidden space-y-0">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Data Pemohon ({filters.month >= 0 && filters.month < 12 ? (filters.startDay === filters.endDay ? `Rekapitulasi Tanggal ${filters.startDay} ${MONTH_NAMES[filters.month]} ${filters.year > 0 ? filters.year : ''}` : `Rekapitulasi Tanggal ${filters.startDay} s/d ${filters.endDay} ${MONTH_NAMES[filters.month]} ${filters.year > 0 ? filters.year : ''}`) : 'Semua Periode Data Pemohon'})
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Menampilkan {filteredSurveys.length} penilaian pemohon tercatat di database Cloud (5 per halaman)
                </p>
              </div>

              {/* Search */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Cari nama pemohon atau layanan..."
                    className="input-3d pl-10 pr-4 py-2 text-xs w-56 sm:w-64 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Active agency filter indicator */}
            {filters.agencyName !== 'Semua Instansi (32)' && (
              <div className="px-5 sm:px-6 py-2.5 bg-blue-50/90 border-b border-blue-200 flex items-center justify-between text-xs text-blue-900 font-semibold flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Menampilkan data pemohon khusus: <strong>{filters.agencyName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, agencyName: 'Semua Instansi (32)' })}
                  className="px-2.5 py-1 rounded-lg bg-blue-200/80 hover:bg-blue-300 text-blue-950 text-[11px] font-bold cursor-pointer transition-all active:scale-95"
                >
                  Tampilkan Semua 32 Instansi
                </button>
              </div>
            )}

            {/* Sub-info banner */}
            <div className="px-5 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>
                Menampilkan {paginatedSurveys.length} dari {filteredSurveys.length} data pemohon (Halaman {currentPage} dari {totalPemohonPages})
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-3d-slate px-3 py-1 text-[11px] font-bold disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <span className="font-mono font-bold text-[11px] px-2">{currentPage}/{totalPemohonPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPemohonPages))}
                  disabled={currentPage === totalPemohonPages}
                  className="btn-3d-slate px-3 py-1 text-[11px] font-bold disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            </div>

            {/* The Table */}
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3 w-10 text-center">NO</th>
                    <th className="p-3 w-28 text-center">TANGGAL</th>
                    <th className="p-3 sm:p-4 min-w-[140px] sm:min-w-[180px] max-w-[210px] sm:max-w-none text-left">INSTANSI PUBLIK</th>
                    <th className="p-3 sm:p-4 w-24 text-center">RATING</th>
                    <th className="p-3 sm:p-4 min-w-[140px] sm:w-56">DATA PEMOHON</th>
                    <th className="p-3 sm:p-4 min-w-[180px]">SARAN DAN MASUKAN</th>
                    {/* Tombol X / Aksi disembunyikan di semua data sesuai permintaan */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedSurveys.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                        Tidak ada data survei pemohon yang cocok dengan filter saat ini.
                      </td>
                    </tr>
                  ) : (
                    paginatedSurveys.map((item, index) => {
                      const absoluteIndex = (currentPage - 1) * itemsPerPage + index + 1;
                      return (
                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="p-3 text-center font-mono font-bold text-slate-400">
                            {absoluteIndex}
                          </td>
                          <td className="p-3 text-center text-slate-600 whitespace-nowrap font-medium font-mono text-[11.5px]">
                            {formatDateTime(item)}
                          </td>
                          <td className="p-3 sm:p-4 font-bold text-slate-900 break-words">
                            {item.agencyName}
                          </td>
                          <td className="p-3 sm:p-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-xl font-black text-xs ${
                                item.rating >= 4
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-[0_2px_0_0_#93c5fd]'
                                  : item.rating === 3
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-[0_2px_0_0_#fcd34d]'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200 shadow-[0_2px_0_0_#fca5a5]'
                              }`}
                            >
                              {item.rating} / 5
                            </span>
                            {/* Rincian 9 Unsur Pelayanan Publik */}
                            <div className="mt-1.5 flex flex-wrap gap-1 justify-center max-w-[150px] mx-auto text-[9px] font-mono font-bold text-slate-600">
                              <span title="1. Persyaratan" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U1:{item.unsurPersyaratan ?? item.rating}</span>
                              <span title="2. Sistem, Mekanisme, Prosedur" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U2:{item.unsurProsedur ?? item.rating}</span>
                              <span title="3. Waktu Penyelesaian" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U3:{item.unsurWaktu ?? item.rating}</span>
                              <span title="4. Biaya / Tarif" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U4:{item.unsurBiaya ?? item.rating}</span>
                              <span title="5. Produk Spesifikasi" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U5:{item.unsurProduk ?? item.rating}</span>
                              <span title="6. Kompetensi Pelaksana" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U6:{item.unsurKompetensi ?? item.rating}</span>
                              <span title="7. Perilaku Pelaksana" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U7:{item.unsurPerilaku ?? item.rating}</span>
                              <span title="8. Penanganan Pengaduan" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U8:{item.unsurPengaduan ?? item.rating}</span>
                              <span title="9. Kesopanan Petugas" className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">U9:{item.unsurKesopanan ?? item.rating}</span>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4">
                            <p className="font-extrabold text-slate-900">
                              {item.isAnonymous ? 'Tidak Ingin Memberitahu' : item.respondentName}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-slate-500 font-medium">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {item.gender}
                              </span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {item.ageGroup}
                              </span>
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {item.education}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 sm:p-4 text-slate-700 max-w-xs">
                            <p className="line-clamp-2 leading-relaxed italic font-medium">
                              "{item.feedback}"
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SARAN DAN MASUKAN (5 Data per Halaman) */}
        {activeTab === 'saran' && (
          <div className="space-y-5">
            {/* Active agency filter indicator */}
            {filters.agencyName !== 'Semua Instansi (32)' && (
              <div className="card-3d p-3.5 px-4 bg-blue-50/90 border-blue-200 flex items-center justify-between text-xs text-blue-900 font-semibold flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Menampilkan saran &amp; masukan khusus: <strong>{filters.agencyName}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, agencyName: 'Semua Instansi (32)' })}
                  className="px-2.5 py-1 rounded-lg bg-blue-200/80 hover:bg-blue-300 text-blue-950 text-[11px] font-bold cursor-pointer transition-all active:scale-95"
                >
                  Tampilkan Semua 32 Instansi
                </button>
              </div>
            )}

            <div className="card-3d p-5 sm:p-6 flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Dinding Aspirasi &amp; Umpan Balik Pemohon
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Saran langsung dari masyarakat untuk inovasi pelayanan publik MPP Bojonegoro (5 ulasan per halaman)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSaranPage((p) => Math.max(p - 1, 1))}
                  disabled={saranPage === 1}
                  className="btn-3d-slate px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <span className="text-xs font-mono font-bold text-slate-600 px-2">
                  {saranPage} / {totalSaranPages}
                </span>
                <button
                  type="button"
                  onClick={() => setSaranPage((p) => Math.min(p + 1, totalSaranPages))}
                  disabled={saranPage === totalSaranPages}
                  className="btn-3d-slate px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                >
                  Selanjutnya
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedSaran.map((item) => (
                <div
                  key={item.id}
                  className="card-3d p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shadow-xs truncate max-w-[190px]">
                        {item.agencyName}
                      </span>
                      <span className="text-amber-700 font-black text-xs flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        {item.rating}/5
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed pt-1 font-medium">
                      "{item.feedback}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="font-extrabold text-slate-900">
                      {item.isAnonymous ? 'Anonim (Pemohon)' : item.respondentName}
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {formatDateTime(item)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BUKA MENU KELOLA (5 Instansi per Halaman) */}
        {activeTab === 'instansi' && (
          <div className="card-3d overflow-hidden space-y-0">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Penilaian &amp; Capaian Kinerja Instansi Pelayanan Publik
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Daftar 32 Instansi Publik Mal Pelayanan Publik Bojonegoro beserta rekapitulasi penilaian kinerja, kepuasan, dan manajemen loket
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={agencySearch}
                    onChange={(e) => {
                      setAgencySearch(e.target.value);
                      setAgencyPage(1);
                    }}
                    placeholder="Cari nama instansi..."
                    className="input-3d pl-10 pr-4 py-2 text-xs w-full sm:w-64 font-semibold"
                  />
                </div>

                {/* Tombol Buka Kelola Instansi Publik */}
                <button
                  type="button"
                  onClick={onOpenManageAgencies}
                  className="btn-3d-blue px-3.5 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-black text-center leading-tight flex items-center justify-center gap-1.5 shadow-sm active:scale-95 whitespace-normal break-words cursor-pointer"
                  title="Buka Kelola Instansi Publik"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0 hidden xs:inline" />
                  <span className="text-center">Buka Kelola Instansi Publik</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto bg-white">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                    <th className="p-3 sm:p-4 w-10 sm:w-12 text-center">NO</th>
                    <th className="p-3 sm:p-4 min-w-[200px]">NAMA INSTANSI</th>
                    <th className="p-3 sm:p-4 w-24 text-center">STATUS</th>
                    <th className="p-3 sm:p-4 w-24 text-center">RESPONDEN</th>
                    <th className="p-3 sm:p-4 w-28 text-center">RATA-RATA RATING</th>
                    <th className="p-3 sm:p-4 w-24 text-center">SKOR IKM</th>
                    <th className="p-3 sm:p-4 w-28 text-center">MUTU</th>
                    <th className="p-3 sm:p-4 w-28 text-center">% PUAS</th>
                    <th className="p-3 sm:p-4 w-28 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedAgencies.map((agency, idx) => {
                    const absIdx = (agencyPage - 1) * itemsPerPage + idx + 1;
                    const evalData = agencyEvaluations.find((ae) => ae.id === agency.id || ae.name === agency.name);
                    return (
                      <tr key={agency.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="p-3 sm:p-4 text-center font-mono font-bold text-slate-400">{absIdx}</td>
                        <td className="p-3 sm:p-4 font-extrabold text-slate-900 break-words leading-snug">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>{agency.name}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${
                            agency.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {agency.active ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-center font-bold">
                          {evalData && evalData.totalRespondents > 0 ? (
                            <span className="text-blue-900 font-bold font-mono">
                              {evalData.totalRespondents}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          {evalData && evalData.totalRespondents > 0 ? (
                            <span className="font-black text-slate-900 flex items-center justify-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                              {evalData.averageRating}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-center font-black">
                          {evalData && evalData.totalRespondents > 0 ? (
                            <span className="text-blue-700 font-mono font-bold">
                              {evalData.ikmScore}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          {evalData && evalData.totalRespondents > 0 ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-black ${
                                evalData.ikmScore >= 88.31
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : evalData.ikmScore >= 76.61
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {evalData.mutu}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Belum Ada</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-center font-bold font-mono">
                          {evalData && evalData.totalRespondents > 0 ? (
                            <span className="text-emerald-700">
                              {evalData.satisfiedPercentage}%
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectAgencyFromKinerja(agency.name)}
                              className="btn-3d-slate px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                              title={`Lihat data pemohon untuk ${agency.name}`}
                            >
                              <span>Lihat</span>
                              <ArrowUpRight className="w-3 h-3 text-blue-600" />
                            </button>
                            {/* Tombol hapus di tabel Penilaian & Capaian Kinerja Instansi Pelayanan Publik disembunyikan sesuai permintaan */}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer for Tab 4 */}
            <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">
                Menampilkan halaman {agencyPage} dari {totalAgencyPages} ({filteredAgenciesList.length} instansi terdata)
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setAgencyPage((p) => Math.max(p - 1, 1))}
                  disabled={agencyPage === 1}
                  className="btn-3d-slate px-3 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Sebelumnya
                </button>
                <span className="font-mono font-bold px-2">{agencyPage} / {totalAgencyPages}</span>
                <button
                  type="button"
                  onClick={() => setAgencyPage((p) => Math.min(p + 1, totalAgencyPages))}
                  disabled={agencyPage === totalAgencyPages}
                  className="btn-3d-slate px-3 py-1 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Edit Username dan Password Admin */}
      {isCredsModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 touch-pan-y">
          <div className="min-h-full flex items-center justify-center py-6 sm:py-8">
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[calc(100vh-2rem)] flex flex-col">
              <div className="h-3 bg-gradient-to-r from-amber-500 to-indigo-600 shadow-md shrink-0" />

              {/* Tombol X disembunyikan sesuai permintaan */}

              <form onSubmit={handleSaveCredentials} className="p-6 sm:p-7 space-y-4 overflow-y-auto overscroll-contain flex-1 touch-pan-y scroll-smooth">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 shadow-xs">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Ubah Akun &amp; Password Admin
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atur username dan kata sandi baru untuk login dashboard
                  </p>
                </div>
              </div>

              {credsError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
                  {credsError}
                </div>
              )}

              {credsSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Username dan password berhasil disimpan!</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Username Admin Baru:</label>
                  <input
                    type="text"
                    value={newUsernameInput}
                    onChange={(e) => setNewUsernameInput(e.target.value)}
                    required
                    placeholder="Contoh: admin atau operator_mpp"
                    className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password Baru:</label>
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    required
                    placeholder="Masukkan password baru"
                    className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Konfirmasi Password Baru:</label>
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    required
                    placeholder="Ulangi password baru"
                    className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  onClick={() => {
                    setIsCredsModalOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="btn-3d-slate py-2.5 px-3.5 text-xs font-bold text-rose-700 hover:text-white hover:bg-rose-600 flex items-center justify-center gap-1.5 cursor-pointer border border-rose-300 bg-rose-50/70"
                  title="Logout langsung dari akun administrator ini"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Logout</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsCredsModalOpen(false)}
                  className="btn-3d-slate flex-1 py-2.5 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-3d-blue flex-1 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      )}

      {/* Modal Pengaturan IP Jaringan (Otomatis vs Manual) */}
      {isIpModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200 touch-pan-y">
          <div className="min-h-full flex items-center justify-center py-6 sm:py-8">
            <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[calc(100vh-2rem)] flex flex-col">
              <div className="h-3 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md shrink-0" />

              {/* Tombol X disembunyikan sesuai permintaan */}

              <div className="p-6 sm:p-7 space-y-5 overflow-y-auto overscroll-contain flex-1 touch-pan-y scroll-smooth">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-xs">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Pengaturan IP Jaringan
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Atur koneksi IP Otomatis (DHCP) atau IP Manual (Static)
                  </p>
                </div>
              </div>

              {/* Mode Toggle: Otomatis vs Manual */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTempIpConfig({ ...tempIpConfig, mode: 'auto' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tempIpConfig.mode === 'auto'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  IP Otomatis (DHCP)
                </button>
                <button
                  type="button"
                  onClick={() => setTempIpConfig({ ...tempIpConfig, mode: 'manual' })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    tempIpConfig.mode === 'manual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  IP Manual (Static)
                </button>
              </div>

              {/* Form Input Mode */}
              {tempIpConfig.mode === 'auto' ? (
                <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-blue-900">
                    <span>IP Terdeteksi Otomatis:</span>
                    <span className="font-mono text-sm bg-white px-2.5 py-1 rounded-lg border border-blue-200 font-black">
                      {tempIpConfig.autoIp}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                    Alamat IP jaringan dialokasikan secara dinamis oleh server DHCP lokal Mal Pelayanan Publik Bojonegoro.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Alamat IP Manual (IPv4):
                    </label>
                    <input
                      type="text"
                      value={tempIpConfig.manualIp}
                      onChange={(e) => setTempIpConfig({ ...tempIpConfig, manualIp: e.target.value })}
                      placeholder="Contoh: 192.168.1.100"
                      className="input-3d w-full px-3 py-2 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Subnet Mask:</label>
                      <input
                        type="text"
                        value={tempIpConfig.subnet}
                        onChange={(e) => setTempIpConfig({ ...tempIpConfig, subnet: e.target.value })}
                        placeholder="255.255.255.0"
                        className="input-3d w-full px-3 py-2 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Default Gateway:</label>
                      <input
                        type="text"
                        value={tempIpConfig.gateway}
                        onChange={(e) => setTempIpConfig({ ...tempIpConfig, gateway: e.target.value })}
                        placeholder="192.168.1.1"
                        className="input-3d w-full px-3 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">DNS Server:</label>
                    <input
                      type="text"
                      value={tempIpConfig.dns}
                      onChange={(e) => setTempIpConfig({ ...tempIpConfig, dns: e.target.value })}
                      placeholder="8.8.8.8"
                      className="input-3d w-full px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIpModalOpen(false)}
                  className="btn-3d-slate flex-1 py-2.5 text-xs font-bold text-slate-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveIp}
                  className="btn-3d-blue flex-1 py-2.5 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {ipSaveSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Tersimpan!</span>
                    </>
                  ) : (
                    <span>Simpan Pengaturan IP</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

    </div>
  );
};
