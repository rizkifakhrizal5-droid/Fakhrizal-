import React, { useState } from 'react';
import {
  Star,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  UserCheck,
  Building2,
  MessageSquareHeart,
  RotateCcw,
  Clock,
  Layers,
  HeartHandshake,
  FileText,
  Info,
  ShieldCheck,
  Check,
  PartyPopper,
  Trophy,
  Calendar,
  WifiOff
} from 'lucide-react';
import { Agency, SurveyResponse } from '../types/survey';
import { QUICK_SUGGESTIONS, SAMPLE_NAMES } from '../data/defaultAgencies';
import { CelebrationEffect } from './CelebrationEffect';

// 9 Unsur Pelayanan Publik Contextual 5-Level Scale Configurations (UU No. 25/2009 & PermenPAN-RB No. 14/2017)
export interface UnsurScaleMeta {
  id: 'persyaratan' | 'prosedur' | 'waktu' | 'biaya' | 'produk' | 'kompetensi' | 'perilaku' | 'pengaduan' | 'kesopanan';
  title: string;
  low: string;
  high: string;
  descriptions: Record<number, string>;
}

export const UNSUR_SCALE_CONFIGS: UnsurScaleMeta[] = [
  {
    id: 'persyaratan',
    title: '1. Persyaratan Pelayanan',
    low: 'Sulit / Rumit',
    high: 'Sangat Mudah & Jelas',
    descriptions: {
      1: 'Sulit / Rumit',
      2: 'Kurang Jelas / Agak Rumit',
      3: 'Cukup Mudah',
      4: 'Mudah & Jelas',
      5: 'Sangat Mudah & Jelas',
    },
  },
  {
    id: 'prosedur',
    title: '2. Prosedur Layanan',
    low: 'Berbelit-belit',
    high: 'Sederhana & Jelas',
    descriptions: {
      1: 'Berbelit-belit',
      2: 'Kurang Jelas / Panjang',
      3: 'Cukup Sederhana',
      4: 'Sederhana & Terarah',
      5: 'Sederhana & Jelas',
    },
  },
  {
    id: 'waktu',
    title: '3. Waktu Penyelesaian',
    low: 'Lambat / Molor',
    high: 'Cepat & Tepat Waktu',
    descriptions: {
      1: 'Lambat / Molor',
      2: 'Kurang Cepat',
      3: 'Cukup Cepat',
      4: 'Cepat & Tepat',
      5: 'Cepat & Tepat Waktu',
    },
  },
  {
    id: 'biaya',
    title: '4. Biaya / Tarif',
    low: 'Mahal / Pungli',
    high: 'Gratis / Sesuai Tarif',
    descriptions: {
      1: 'Mahal / Pungli',
      2: 'Kurang Terjangkau',
      3: 'Cukup Sesuai',
      4: 'Sesuai Tarif',
      5: 'Gratis / Sesuai Tarif',
    },
  },
  {
    id: 'produk',
    title: '5. Produk Spesifikasi Layanan',
    low: 'Tidak Sesuai',
    high: 'Sangat Sesuai Standar',
    descriptions: {
      1: 'Tidak Sesuai',
      2: 'Kurang Sesuai',
      3: 'Cukup Sesuai',
      4: 'Sesuai Standar',
      5: 'Sangat Sesuai Standar',
    },
  },
  {
    id: 'kompetensi',
    title: '6. Kompetensi Petugas',
    low: 'Kurang Mampu',
    high: 'Sangat Terampil & Cakap',
    descriptions: {
      1: 'Kurang Mampu',
      2: 'Cukup Mampu',
      3: 'Terampil',
      4: 'Cekatan & Cakap',
      5: 'Sangat Terampil & Cakap',
    },
  },
  {
    id: 'perilaku',
    title: '7. Perilaku Petugas',
    low: 'Kurang Responsif',
    high: 'Sangat Disiplin & Ramah',
    descriptions: {
      1: 'Kurang Responsif',
      2: 'Cukup Responsif',
      3: 'Ramah & Membantu',
      4: 'Disiplin & Ramah',
      5: 'Sangat Disiplin & Ramah',
    },
  },
  {
    id: 'pengaduan',
    title: '8. Penanganan Pengaduan',
    low: 'Diabaikan',
    high: 'Cepat & Tuntas',
    descriptions: {
      1: 'Diabaikan / Lambat',
      2: 'Kurang Tanggap',
      3: 'Cukup Ditangani',
      4: 'Cepat Ditindaklanjuti',
      5: 'Cepat & Tuntas',
    },
  },
  {
    id: 'kesopanan',
    title: '9. Kesopanan Petugas',
    low: 'Kurang Sopan',
    high: 'Sangat Sopan & Santun',
    descriptions: {
      1: 'Kurang Sopan',
      2: 'Cukup Sopan',
      3: 'Sopan & Baik',
      4: 'Ramah & Santun',
      5: 'Sangat Sopan & Santun',
    },
  },
];

interface SurveyFormProps {
  agencies: Agency[];
  onSubmit: (response: Omit<SurveyResponse, 'id'>) => Promise<void>;
  onNavigateToDashboard?: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({
  agencies,
  onSubmit,
  onNavigateToDashboard,
}) => {
  const activeAgencies = agencies.filter((a) => a.active);

  // Form State
  const [selectedAgencyName, setSelectedAgencyName] = useState<string>(
    activeAgencies[0]?.name || 'Kejaksaan Negeri'
  );
  const [rating, setRating] = useState<number>(0);
  const [ratingError, setRatingError] = useState<boolean>(false);

  // Fitur Penanggalan Survei (Dipisahkan antara Tanggal, Bulan, dan Tahun)
  const [surveyDay, setSurveyDay] = useState<number>(() => new Date().getDate());
  const [surveyMonth, setSurveyMonth] = useState<number>(() => new Date().getMonth() + 1);
  const [surveyYear, setSurveyYear] = useState<number>(() => new Date().getFullYear());

  const daysInSelectedMonth = new Date(surveyYear, surveyMonth, 0).getDate();
  const safeDay = Math.max(1, Math.min(surveyDay, daysInSelectedMonth));
  const surveyDate = `${surveyYear}-${String(surveyMonth).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;

  const formatIndonesianDate = (dateOrYear: string | number, m?: number, d?: number) => {
    try {
      if (typeof dateOrYear === 'string') {
        const parts = dateOrYear.split('-');
        if (parts.length === 3) {
          const [y, mon, day] = parts.map(Number);
          return new Date(y, mon - 1, day, 12, 0, 0).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
        }
        return dateOrYear;
      }
      const y = dateOrYear;
      const mon = m || 1;
      const day = d || 1;
      const dateObj = new Date(y, mon - 1, day, 12, 0, 0);
      return dateObj.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return typeof dateOrYear === 'string' ? dateOrYear : `${d}/${m}/${dateOrYear}`;
    }
  };

  // 9 Unsur Pelayanan Publik (UU No. 25 Tahun 2009 Tentang Pelayanan Publik)
  // Default false agar tidak selalu muncul/terbuka otomatis, dan 0 (belum memiliki penilaian sebelum bintang dipilih)
  const [showAspects, setShowAspects] = useState<boolean>(false);
  const [unsurPersyaratan, setUnsurPersyaratan] = useState<number>(0);
  const [unsurProsedur, setUnsurProsedur] = useState<number>(0);
  const [unsurWaktu, setUnsurWaktu] = useState<number>(0);
  const [unsurBiaya, setUnsurBiaya] = useState<number>(0);
  const [unsurProduk, setUnsurProduk] = useState<number>(0);
  const [unsurKompetensi, setUnsurKompetensi] = useState<number>(0);
  const [unsurPerilaku, setUnsurPerilaku] = useState<number>(0);
  const [unsurPengaduan, setUnsurPengaduan] = useState<number>(0);
  const [unsurKesopanan, setUnsurKesopanan] = useState<number>(0);

  // Legacy aspects support
  const [aspectSpeed, setAspectSpeed] = useState<number>(0);
  const [aspectFriendliness, setAspectFriendliness] = useState<number>(0);
  const [aspectClarity, setAspectClarity] = useState<number>(0);
  const [aspectFacility, setAspectFacility] = useState<number>(0);

  // Profile pool for auto-filling and cycling Data Pemohon (berubah otomatis setiap reload dan selesai survei)
  const RESPONDENT_PROFILES: Array<{
    name: string;
    gender: SurveyResponse['gender'];
    age: SurveyResponse['ageGroup'];
    edu: SurveyResponse['education'];
  }> = [
    { name: 'Lilik Indrawati', gender: 'Perempuan', age: '36 - 45 Tahun', edu: 'Sarjana (S1)' },
    { name: 'Ika Yuliana', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'SMA/SMK Sederajat' },
    { name: 'Lukman Hakim', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'Sarjana (S1)' },
    { name: 'Yoga Prasetya', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'Diploma (D1-D4)' },
    { name: 'Budi Santoso', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'SMA/SMK Sederajat' },
    { name: 'Siti Rahmawati', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)' },
    { name: 'Ahmad Fauzi', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Sarjana (S1)' },
    { name: 'Dewi Lestari', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Sarjana (S1)' },
    { name: 'Rian Kurniawan', gender: 'Laki-laki', age: '20 - 35 Tahun', edu: 'SMA/SMK Sederajat' },
    { name: 'Tri Wahyuni', gender: 'Perempuan', age: '36 - 45 Tahun', edu: 'SMA/SMK Sederajat' },
    { name: 'Eko Purwanto', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'Sarjana (S1)' },
    { name: 'Rina Marlina', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Diploma (D1-D4)' },
    { name: 'Bambang Susilo', gender: 'Laki-laki', age: '46 - 60 Tahun', edu: 'Sarjana (S1)' },
    { name: 'Nurul Hidayah', gender: 'Perempuan', age: '20 - 35 Tahun', edu: 'Diploma (D1-D4)' },
    { name: 'Agus Setiawan', gender: 'Laki-laki', age: '36 - 45 Tahun', edu: 'Sarjana (S1)' },
    { name: 'Endang Sulastri', gender: 'Perempuan', age: '46 - 60 Tahun', edu: 'SMA/SMK Sederajat' }
  ];

  // Step 3: Feedback (Selalu berubah secara otomatis saat reload / refresh halaman)
  const [suggestionOffset, setSuggestionOffset] = useState<number>(() =>
    Math.floor(Math.random() * QUICK_SUGGESTIONS.length)
  );
  const [feedback, setFeedback] = useState<string>(() => {
    const randomIdx = Math.floor(Math.random() * QUICK_SUGGESTIONS.length);
    return QUICK_SUGGESTIONS[randomIdx]
      ? QUICK_SUGGESTIONS[randomIdx].replace(/^\+\s*/, '')
      : 'Pelayanan loket MPP Bojonegoro sangat cepat, ramah, dan memuaskan.';
  });

  // Step 4: Respondent Data (Selalu berubah secara otomatis saat reload / refresh halaman)
  const [profileIndex, setProfileIndex] = useState<number>(() =>
    Math.floor(Math.random() * 16)
  );
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [respondentName, setRespondentName] = useState<string>(() => {
    const idx = Math.floor(Math.random() * 16);
    return RESPONDENT_PROFILES[idx]?.name || 'Lilik Indrawati';
  });
  const [gender, setGender] = useState<SurveyResponse['gender']>(() => {
    const idx = Math.floor(Math.random() * 16);
    return RESPONDENT_PROFILES[idx]?.gender || 'Perempuan';
  });
  const [ageGroup, setAgeGroup] = useState<SurveyResponse['ageGroup']>(() => {
    const idx = Math.floor(Math.random() * 16);
    return RESPONDENT_PROFILES[idx]?.age || '20 - 35 Tahun';
  });
  const [education, setEducation] = useState<SurveyResponse['education']>(() => {
    const idx = Math.floor(Math.random() * 16);
    return RESPONDENT_PROFILES[idx]?.edu || 'Sarjana (S1)';
  });

  // Submission UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<Omit<SurveyResponse, 'id'> | null>(null);

  // 3D Rating labels, colors & 3D badges
  const ratingLabels: { [key: number]: { text: string; color: string; desc: string; emoji: string } } = {
    0: { text: 'Belum Memilih Bintang', color: 'text-slate-600 bg-slate-100 border-slate-300 shadow-[0_4px_0_0_#cbd5e1]', desc: 'Sentuh atau klik bintang untuk memberikan penilaian (1 - 5)', emoji: '⭐' },
    1: { text: 'Sangat Tidak Puas', color: 'text-rose-700 bg-rose-50 border-rose-300 shadow-[0_4px_0_0_#f43f5e]', desc: 'Pelayanan sangat mengecewakan', emoji: '😞' },
    2: { text: 'Tidak Puas', color: 'text-orange-700 bg-orange-50 border-orange-300 shadow-[0_4px_0_0_#fb923c]', desc: 'Perlu banyak perbaikan mendasar', emoji: '🙁' },
    3: { text: 'Cukup Puas', color: 'text-amber-700 bg-amber-50 border-amber-300 shadow-[0_4px_0_0_#f59e0b]', desc: 'Pelayanan standar, ada ruang perbaikan', emoji: '😐' },
    4: { text: 'Puas', color: 'text-emerald-700 bg-emerald-50 border-emerald-300 shadow-[0_4px_0_0_#10b981]', desc: 'Pelayanan cepat dan memuaskan', emoji: '😊' },
    5: { text: 'Sangat Puas', color: 'text-blue-700 bg-blue-50 border-blue-300 shadow-[0_4px_0_0_#3b82f6]', desc: 'Pelayanan prima, ramah & tanpa hambatan', emoji: '🤩' },
  };

  // Safe rating select - strictly locks the selected star value and syncs with 9 unsur
  const handleRatingSelect = (starValue: number) => {
    if (starValue < 1 || starValue > 5) return;
    setRating(starValue);
    setRatingError(false);
    // Sync 9 Unsur Pelayanan Publik
    setUnsurPersyaratan(starValue);
    setUnsurProsedur(starValue);
    setUnsurWaktu(starValue);
    setUnsurBiaya(starValue);
    setUnsurProduk(starValue);
    setUnsurKompetensi(starValue);
    setUnsurPerilaku(starValue);
    setUnsurPengaduan(starValue);
    setUnsurKesopanan(starValue);
    // Legacy aspects
    setAspectSpeed(starValue);
    setAspectFriendliness(starValue);
    setAspectClarity(starValue);
    setAspectFacility(starValue);
  };

  // Handle direct click on numbers 1 - 5 for 9 Unsur Pelayanan Publik
  const handleUnsurChange = (
    key: 'persyaratan' | 'prosedur' | 'waktu' | 'biaya' | 'produk' | 'kompetensi' | 'perilaku' | 'pengaduan' | 'kesopanan',
    val: number
  ) => {
    if (val < 1 || val > 5) return;

    // Jika seluruh unsur sebelumnya masih 0 (belum dipilih), inisialisasi semua ke nilai terpilih
    const isFirstRating = unsurPersyaratan === 0 && unsurProsedur === 0 && unsurWaktu === 0;

    let p = isFirstRating ? val : (unsurPersyaratan || val);
    let pr = isFirstRating ? val : (unsurProsedur || val);
    let w = isFirstRating ? val : (unsurWaktu || val);
    let b = isFirstRating ? val : (unsurBiaya || val);
    let prod = isFirstRating ? val : (unsurProduk || val);
    let k = isFirstRating ? val : (unsurKompetensi || val);
    let per = isFirstRating ? val : (unsurPerilaku || val);
    let peng = isFirstRating ? val : (unsurPengaduan || val);
    let kes = isFirstRating ? val : (unsurKesopanan || val);

    if (key === 'persyaratan') { p = val; }
    else if (key === 'prosedur') { pr = val; }
    else if (key === 'waktu') { w = val; }
    else if (key === 'biaya') { b = val; }
    else if (key === 'produk') { prod = val; }
    else if (key === 'kompetensi') { k = val; }
    else if (key === 'perilaku') { per = val; }
    else if (key === 'pengaduan') { peng = val; }
    else if (key === 'kesopanan') { kes = val; }

    setUnsurPersyaratan(p);
    setUnsurProsedur(pr);
    setUnsurWaktu(w);
    setUnsurBiaya(b);
    setUnsurProduk(prod);
    setUnsurKompetensi(k);
    setUnsurPerilaku(per);
    setUnsurPengaduan(peng);
    setUnsurKesopanan(kes);

    // Hitung rata-rata nilai 9 unsur dan sinkronkan dengan bintang
    const avg = Math.round((p + pr + w + b + prod + k + per + peng + kes) / 9);
    const newRating = Math.max(1, Math.min(5, avg));
    setRating(newRating);
    setRatingError(false);
    generateAutoSuggestion(newRating, selectedAgencyName);
  };

  // Auto-generate suggestion according to rating and agency
  const generateAutoSuggestion = (currentRating: number = rating, agencyName: string = selectedAgencyName) => {
    const highRatingSuggestions = [
      `Pelayanan loket ${agencyName} di MPP Bojonegoro sangat cepat, ramah, dan profesional.`,
      `Alur perizinan di ${agencyName} sangat transparan, jelas, dan tanpa ada pungutan liar.`,
      `Petugas ${agencyName} melayani dengan sangat santun, ramah, dan solutif.`,
      `Ruang tunggu sangat nyaman dan pelayanan di loket ${agencyName} sangat memuaskan.`,
      `Inovasi pelayanan di MPP Bojonegoro sangat mempermudah urusan perizinan masyarakat.`
    ];
    const medRatingSuggestions = [
      `Pelayanan di ${agencyName} cukup baik dan rapi, mohon pertahankan dan tingkatkan kecepatannya.`,
      `Alur sudah cukup jelas, semoga ke depan nomor antrean loket ${agencyName} bisa lebih cepat lagi.`,
      `Petugas cukup ramah dan informatif, fasilitas ruang tunggu sudah memadai.`
    ];
    const lowRatingSuggestions = [
      `Mohon waktu tunggu pelayanan loket ${agencyName} dapat dipercepat agar masyarakat tidak menunggu lama.`,
      `Mohon kejelasan informasi persyaratan sebelum menuju loket agar proses lebih efisien.`,
      `Perlu penambahan petugas pelayanan pada jam-jam sibuk di loket ${agencyName}.`
    ];

    let pool = highRatingSuggestions;
    if (currentRating >= 4 || currentRating === 0) {
      pool = highRatingSuggestions;
    } else if (currentRating === 3) {
      pool = medRatingSuggestions;
    } else {
      pool = lowRatingSuggestions;
    }

    const randomPick = pool[Math.floor(Math.random() * pool.length)];
    setFeedback(randomPick);
  };

  // Handle Quick suggestions manual selection (tombol ganti)
  const handleCycleQuickSuggestion = () => {
    const nextIdx = (suggestionOffset + 1) % QUICK_SUGGESTIONS.length;
    setSuggestionOffset(nextIdx);
    const clean = QUICK_SUGGESTIONS[nextIdx].replace(/^\+\s*/, '');
    setFeedback(clean);
  };

  // Auto-generate citizen applicant data (tombol otomatis)
  const handleAutoGenerateApplicant = () => {
    setIsAnonymous(false);
    const nextIdx = (profileIndex + 1) % RESPONDENT_PROFILES.length;
    setProfileIndex(nextIdx);
    const prof = RESPONDENT_PROFILES[nextIdx];
    setRespondentName(prof.name);
    setGender(prof.gender);
    setAgeGroup(prof.age);
    setEducation(prof.edu);
  };

  // Handle Respondent profiles manual selection (tombol ganti)
  const handleCycleRespondentProfile = () => {
    handleAutoGenerateApplicant();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgencyName) return;

    if (!rating || rating === 0) {
      setRatingError(true);
      const el = document.getElementById('step-2-rating');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const matchedAgency = agencies.find((a) => a.name === selectedAgencyName);
    const agencyId = matchedAgency ? matchedAgency.id : 'general';

    const payload: Omit<SurveyResponse, 'id'> = {
      agencyId,
      agencyName: selectedAgencyName,
      rating,
      aspectSpeed: aspectSpeed || rating,
      aspectFriendliness: aspectFriendliness || rating,
      aspectClarity: aspectClarity || rating,
      aspectFacility: aspectFacility || rating,
      unsurPersyaratan: Number(unsurPersyaratan || rating),
      unsurProsedur: Number(unsurProsedur || rating),
      unsurWaktu: Number(unsurWaktu || rating),
      unsurBiaya: Number(unsurBiaya || rating),
      unsurProduk: Number(unsurProduk || rating),
      unsurKompetensi: Number(unsurKompetensi || rating),
      unsurPerilaku: Number(unsurPerilaku || rating),
      unsurPengaduan: Number(unsurPengaduan || rating),
      unsurKesopanan: Number(unsurKesopanan || rating),
      feedback: feedback.trim() || 'Pelayanan sangat memuaskan.',
      isAnonymous,
      respondentName: isAnonymous ? 'Anonim (Pemohon)' : respondentName.trim() || 'Pemohon',
      gender: isAnonymous ? 'Tidak Ingin Memberitahu' : gender,
      ageGroup: isAnonymous ? 'Tidak Ingin Memberitahu' : ageGroup,
      education: isAnonymous ? 'Tidak Ingin Memberitahu' : education,
      surveyDate,
      createdAt: (() => {
        try {
          const [yStr, mStr, dStr] = surveyDate.split('-');
          const now = new Date();
          const hh = String(now.getHours()).padStart(2, '0');
          const mm = String(now.getMinutes()).padStart(2, '0');
          const ss = String(now.getSeconds()).padStart(2, '0');
          return `${yStr}-${mStr}-${dStr}T${hh}:${mm}:${ss}`;
        } catch {
          return new Date().toISOString();
        }
      })(),
      timestamp: (() => {
        try {
          const [yStr, mStr, dStr] = surveyDate.split('-');
          const y = parseInt(yStr, 10);
          const m = parseInt(mStr, 10);
          const d = parseInt(dStr, 10);
          const now = new Date();
          const target = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
          return !isNaN(target.getTime()) ? target.getTime() : Date.now();
        } catch {
          return Date.now();
        }
      })(),
    };

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
      setSubmittedData(payload);
      setShowSuccessModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNextCitizen = () => {
    setShowSuccessModal(false);

    // 1. Reset nilai rating bintang & 9 unsur ke 0 (belum memilih penilaian) serta tanggal hari ini
    setRating(0);
    setRatingError(false);
    const today = new Date();
    setSurveyDay(today.getDate());
    setSurveyMonth(today.getMonth() + 1);
    setSurveyYear(today.getFullYear());
    setShowAspects(false);
    setUnsurPersyaratan(0);
    setUnsurProsedur(0);
    setUnsurWaktu(0);
    setUnsurBiaya(0);
    setUnsurProduk(0);
    setUnsurKompetensi(0);
    setUnsurPerilaku(0);
    setUnsurPengaduan(0);
    setUnsurKesopanan(0);
    setAspectSpeed(0);
    setAspectFriendliness(0);
    setAspectClarity(0);
    setAspectFacility(0);

    // 2. Berubah Sendiri: Kolom Saran Singkat beralih otomatis ke saran berikutnya
    setSuggestionOffset((prevOffset: number) => {
      const nextOffset = (prevOffset + 1) % QUICK_SUGGESTIONS.length;
      const clean = QUICK_SUGGESTIONS[nextOffset].replace(/^\+\s*/, '');
      setFeedback(clean);
      return nextOffset;
    });

    // 3. Berubah Sendiri: Data Pemohon beralih otomatis ke profil pemohon berikutnya
    setProfileIndex((prevIndex: number) => {
      const nextIndex = (prevIndex + 1) % RESPONDENT_PROFILES.length;
      const nextProfile = RESPONDENT_PROFILES[nextIndex];
      setRespondentName(nextProfile.name);
      setGender(nextProfile.gender);
      setAgeGroup(nextProfile.age);
      setEducation(nextProfile.edu);
      return nextIndex;
    });
    setIsAnonymous(false);

    // Scroll ke atas dengan mulus untuk kenyamanan pemohon berikutnya
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[1600px] mx-auto space-y-8" style={{ maxWidth: '1600px', width: '100%' }}>
        {/* Header: Walking 3D Mascot / Icon + Big Text Survey Kepuasan Masyarakat */}
        <div className="text-center py-2 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5 max-w-full px-1 text-center">
            {/* Animated Walking 3D Mascot / Icon (Icon Bisa Jalan Disamping Kiri) */}
            <div className="relative inline-flex flex-col items-center justify-center shrink-0">
              <div className="animate-walk-body inline-block">
                <svg
                  className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 drop-shadow-[0_12px_20px_rgba(30,58,138,0.38)]"
                  viewBox="0 0 100 115"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Head / Helmet / Cap 3D Gradient */}
                    <linearGradient id="walkCapGradNew" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="45%" stopColor="#1d4ed8" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>

                    {/* Gold Star & Accent 3D Gradient */}
                    <linearGradient id="walkGoldGradNew" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fef08a" />
                      <stop offset="40%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>

                    {/* 3D Face Shading */}
                    <linearGradient id="walkFaceGradNew" x1="20%" y1="10%" x2="80%" y2="90%">
                      <stop offset="0%" stopColor="#fffbeb" />
                      <stop offset="60%" stopColor="#fef08a" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>

                    {/* 3D Suit / Torso Shading */}
                    <linearGradient id="walkSuitGradNew" x1="10%" y1="0%" x2="90%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="35%" stopColor="#1e40af" />
                      <stop offset="85%" stopColor="#1e3a8a" />
                      <stop offset="100%" stopColor="#090d16" />
                    </linearGradient>

                    {/* Shoe 3D Gradient */}
                    <linearGradient id="walkShoeGradNew" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="70%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#020617" />
                    </linearGradient>

                    {/* Clipboard Rating Sheet */}
                    <linearGradient id="walkBoardGradNew" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>

                  {/* Left Walking Leg (Swinging Leg 1) */}
                  <g className="animate-walk-leg-left" style={{ transformOrigin: '40px 72px' }}>
                    <line x1="40" y1="72" x2="33" y2="95" stroke="#1e3a8a" strokeWidth="6.5" strokeLinecap="round" />
                    <ellipse cx="28" cy="97" rx="9" ry="5" fill="url(#walkShoeGradNew)" />
                    {/* Sole Trim */}
                    <path d="M 20 98 Q 28 101 37 98" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.8" />
                  </g>

                  {/* Right Walking Leg (Swinging Leg 2) */}
                  <g className="animate-walk-leg-right" style={{ transformOrigin: '60px 72px' }}>
                    <line x1="60" y1="72" x2="67" y2="95" stroke="#1d4ed8" strokeWidth="6.5" strokeLinecap="round" />
                    <ellipse cx="72" cy="97" rx="9" ry="5" fill="url(#walkShoeGradNew)" />
                    {/* Sole Trim */}
                    <path d="M 64 98 Q 72 101 81 98" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.8" />
                  </g>

                  {/* 3D Suit Body / Torso */}
                  <path d="M 31 49 L 69 49 L 65 74 L 35 74 Z" fill="url(#walkSuitGradNew)" stroke="#1e3a8a" strokeWidth="1.5" />
                  {/* Suit Collar / Lapels */}
                  <polygon points="35,49 46,63 44,49" fill="#1e40af" />
                  <polygon points="65,49 54,63 56,49" fill="#1e40af" />
                  {/* Golden Tie / ID Lanyard with Emblem */}
                  <polygon points="48,49 52,49 53,62 50,67 47,62" fill="url(#walkGoldGradNew)" stroke="#b45309" strokeWidth="0.5" />
                  <circle cx="50" cy="55" r="1.8" fill="#ffffff" />

                  {/* Left Arm (Swinging with Cheerful Wave) */}
                  <g className="animate-walk-leg-right" style={{ transformOrigin: '32px 51px' }}>
                    <line x1="31" y1="51" x2="20" y2="67" stroke="#1e40af" strokeWidth="5.5" strokeLinecap="round" />
                    <circle cx="19" cy="69" r="4.5" fill="url(#walkFaceGradNew)" stroke="#b45309" strokeWidth="0.8" />
                  </g>

                  {/* Right Arm (Swinging with 3D Survey Clipboard & Stars) */}
                  <g className="animate-walk-leg-left" style={{ transformOrigin: '68px 51px' }}>
                    <line x1="68" y1="51" x2="80" y2="65" stroke="#1e40af" strokeWidth="5.5" strokeLinecap="round" />
                    {/* 3D Clipboard Board */}
                    <rect x="75" y="58" width="14" height="18" rx="2.5" fill="url(#walkBoardGradNew)" stroke="#0284c7" strokeWidth="1.2" />
                    {/* Clip Top */}
                    <rect x="79" y="56" width="6" height="3" rx="1" fill="url(#walkGoldGradNew)" />
                    {/* Glowing Star Icon on Clipboard */}
                    <polygon points="82,63 83.2,66.5 87,66.5 84,68.8 85.2,72.5 82,70.2 78.8,72.5 80,68.8 77,66.5 80.8,66.5" fill="url(#walkGoldGradNew)" />
                    {/* Hand gripping clipboard */}
                    <circle cx="76" cy="68" r="3.5" fill="url(#walkFaceGradNew)" stroke="#b45309" strokeWidth="0.6" />
                  </g>

                  {/* 3D Round Mascot Head with Specular 3D Lighting */}
                  <circle cx="50" cy="31" r="18" fill="url(#walkFaceGradNew)" stroke="#d97706" strokeWidth="1.5" />
                  {/* Glossy Specular Highlight on Forehead */}
                  <ellipse cx="44" cy="23" rx="5" ry="2.5" fill="#ffffff" opacity="0.45" />

                  {/* Cheerful Friendly Eyes */}
                  <ellipse cx="43.5" cy="29.5" rx="2.6" ry="3.2" fill="#0f172a" />
                  <ellipse cx="56.5" cy="29.5" rx="2.6" ry="3.2" fill="#0f172a" />
                  {/* Catchlights in Eyes */}
                  <circle cx="44.5" cy="28.2" r="1" fill="#ffffff" />
                  <circle cx="57.5" cy="28.2" r="1" fill="#ffffff" />

                  {/* Friendly Smile with Dimples */}
                  <path d="M 43 35 Q 50 42 57 35" stroke="#92400e" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                  {/* Rosy Cheeks */}
                  <circle cx="39" cy="34" r="2.5" fill="#f43f5e" opacity="0.55" />
                  <circle cx="61" cy="34" r="2.5" fill="#f43f5e" opacity="0.55" />

                  {/* 3D Service Cap with Gold Band & Star */}
                  <path d="M 29 23 Q 50 11 71 23 L 74 19 Q 50 7 26 19 Z" fill="url(#walkCapGradNew)" stroke="#1e3a8a" strokeWidth="1" />
                  <path d="M 31 22 Q 50 15 69 22" stroke="url(#walkGoldGradNew)" strokeWidth="3" fill="none" />
                  {/* 3D Gold Star Emblem on Cap */}
                  <polygon points="50,13 52,18 57,18 53,21 55,26 50,23 45,26 47,21 43,18 48,18" fill="url(#walkGoldGradNew)" stroke="#b45309" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Dynamic Ground Shadow below walking feet */}
              <div className="w-14 h-2 bg-slate-400/30 rounded-full blur-[2px] -mt-1 animate-pulse" />
            </div>

            {/* Teks Survey Kepuasan Masyarakat: Dibuat Rata Tengah Kanan Kiri */}
            <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] sm:leading-tight bg-gradient-to-r from-blue-900 via-indigo-700 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm select-none break-words text-center">
              Survey Kepuasan Masyarakat
            </h1>
          </div>

          <p className="text-slate-600 max-w-2xl mx-auto text-xs sm:text-sm font-semibold leading-relaxed">
            Suara dan penilaian Anda sangat berharga untuk mengevaluasi serta meningkatkan kualitas pelayanan aparatur yang transparan, cepat, ramah, dan profesional.
          </p>
        </div>

        {/* Teks Regulasi Bagian Atas: Khusus Undang-Undang No. 25 Tahun 2009 Tentang Pelayanan Publik (Rata Tengah Kanan Kiri) */}
        <div className="w-full max-w-[1600px] mx-auto px-2 py-1">
          <div className="flex items-center justify-center gap-2 text-xs sm:text-[13px] font-bold text-slate-700 py-1 text-center mx-auto">
            <FileText className="w-4 h-4 text-blue-700 shrink-0" />
            <span className="text-center">
              Survei Kepuasan Masyarakat ini diatur berdasarkan Undang - Undang No. 25 Tahun 2009 Tentang Pelayanan Publik
            </span>
          </div>
        </div>

        {/* The 3D Form */}
        <form onSubmit={handleSubmit} className="space-y-7 w-full max-w-[1600px] mx-auto" style={{ maxWidth: '1600px', width: '100%' }}>
          {/* STEP 1A: Pilih Instansi Publik (3D Card) - Lebar Maksimal 1600px */}
          <div
            className="card-3d p-4 sm:p-6 md:p-8 space-y-3 sm:space-y-4 w-full max-w-[1600px] mx-auto"
            style={{ maxWidth: '1600px', width: '100%' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5 sm:gap-3.5">
                {/* 3D Step Coin */}
                <div className="coin-3d w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center font-black text-sm sm:text-base shrink-0">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-xl font-extrabold text-slate-900">
                    1. Pemilihan Instansi Pelayanan Publik
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                    Tentukan unit loket pelayanan yang Anda kunjungi hari ini
                  </p>
                </div>
              </div>

              {/* 3D Badge */}
              <span className="text-[11px] sm:text-xs font-black px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-[0_3px_0_0_#93c5fd]">
                {activeAgencies.length} Instansi Terdaftar
              </span>
            </div>

            <div className="space-y-1.5 sm:space-y-2 pt-1 sm:pt-2">
              <label htmlFor="agency-select" className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-blue-600" />
                Pilih Instansi Pelayanan:
              </label>
              <div className="relative">
                <select
                  id="agency-select"
                  value={selectedAgencyName}
                  onChange={(e) => setSelectedAgencyName(e.target.value)}
                  className="input-3d w-full appearance-none py-2.5 sm:py-3 px-3.5 sm:px-4 pr-10 text-slate-900 text-xs sm:text-sm font-bold cursor-pointer rounded-xl truncate shadow-xs leading-normal"
                >
                  {activeAgencies.map((agency, idx) => (
                    <option key={agency.id} value={agency.name}>
                      {idx + 1}. {agency.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Tampilan Konfirmasi Nama Instansi Lengkap Agar Mudah Dibaca di Tampilan Seluler & Desktop */}
              <div className="p-2.5 sm:p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-950 font-bold">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-blue-600 block uppercase tracking-wider font-extrabold">
                    Instansi Terpilih:
                  </span>
                  <p className="text-xs sm:text-sm font-black text-slate-900 break-words leading-snug">
                    {selectedAgencyName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Penanggalan Layanan - Lebar Maksimal 1600px */}
          <div
            className="card-3d p-6 sm:p-7 space-y-4 w-full max-w-[1600px] mx-auto"
            style={{ maxWidth: '1600px', width: '100%' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3.5">
                <div className="coin-3d w-10 h-10 flex items-center justify-center font-black text-base shrink-0">
                  2
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    2. Penanggalan Layanan
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Tentukan tanggal, bulan, dan tahun kunjungan pelayanan yang Anda nilai
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 font-mono shadow-2xs">
                {formatIndonesianDate(surveyYear, surveyMonth, safeDay)}
              </span>
            </div>

            <div className="pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. Tanggal */}
                <div className="space-y-1.5">
                  <label htmlFor="survey-day-select" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tanggal:</span>
                  </label>
                  <div className="relative">
                    <select
                      id="survey-day-select"
                      value={safeDay}
                      onChange={(e) => setSurveyDay(Number(e.target.value))}
                      className="input-3d w-full appearance-none py-2.5 px-3.5 pr-8 text-slate-900 text-xs sm:text-sm font-bold cursor-pointer rounded-xl leading-normal"
                    >
                      {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Tanggal {d}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 2. Bulan */}
                <div className="space-y-1.5">
                  <label htmlFor="survey-month-select" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Bulan:</span>
                  </label>
                  <div className="relative">
                    <select
                      id="survey-month-select"
                      value={surveyMonth}
                      onChange={(e) => {
                        const newMonth = Number(e.target.value);
                        setSurveyMonth(newMonth);
                        const maxDays = new Date(surveyYear, newMonth, 0).getDate();
                        if (surveyDay > maxDays) setSurveyDay(maxDays);
                      }}
                      className="input-3d w-full appearance-none py-2.5 px-3.5 pr-8 text-slate-900 text-xs sm:text-sm font-bold cursor-pointer rounded-xl leading-normal"
                    >
                      {[
                        { val: 1, name: 'Januari' },
                        { val: 2, name: 'Februari' },
                        { val: 3, name: 'Maret' },
                        { val: 4, name: 'April' },
                        { val: 5, name: 'Mei' },
                        { val: 6, name: 'Juni' },
                        { val: 7, name: 'Juli' },
                        { val: 8, name: 'Agustus' },
                        { val: 9, name: 'September' },
                        { val: 10, name: 'Oktober' },
                        { val: 11, name: 'November' },
                        { val: 12, name: 'Desember' }
                      ].map((m) => (
                        <option key={m.val} value={m.val}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 3. Tahun */}
                <div className="space-y-1.5">
                  <label htmlFor="survey-year-select" className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tahun:</span>
                  </label>
                  <div className="relative">
                    <select
                      id="survey-year-select"
                      value={surveyYear}
                      onChange={(e) => {
                        const newYear = Number(e.target.value);
                        setSurveyYear(newYear);
                        const maxDays = new Date(newYear, surveyMonth, 0).getDate();
                        if (surveyDay > maxDays) setSurveyDay(maxDays);
                      }}
                      className="input-3d w-full appearance-none py-2.5 px-3.5 pr-8 text-slate-900 text-xs sm:text-sm font-bold cursor-pointer rounded-xl leading-normal"
                    >
                      {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                        <option key={y} value={y}>
                          Tahun {y}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Tingkat Kepuasan & 3D Interactive Stars - Lebar Maksimal 1600px */}
          <div
            id="step-2-rating"
            className={`card-3d p-6 sm:p-8 space-y-5 transition-all w-full max-w-[1600px] mx-auto ${ratingError ? 'ring-3 ring-rose-500' : ''}`}
            style={{ maxWidth: '1600px', width: '100%' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="coin-3d w-10 h-10 flex items-center justify-center font-black text-base shrink-0">
                  3
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    3. Beri Rating &amp; 9 Unsur Pelayanan Publik
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Sentuh bintang 1 sampai 5 untuk kepuasan umum, serta sesuaikan 9 unsur pelayanan publik
                  </p>
                </div>
              </div>
            </div>

            {/* 3D Elevated Interactive Star Stage */}
            <div
              className={`py-7 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-100 rounded-3xl border-2 shadow-inner flex flex-col items-center justify-center space-y-4 ${ratingError ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200/90'}`}
            >
              {/* Star buttons: Locked & Permanent, cannot accidentally revert */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                {[1, 2, 3, 4, 5].map((starIndex) => {
                  const isFilled = rating > 0 && starIndex <= rating;
                  const isSelected = rating === starIndex;
                  return (
                    <button
                      key={starIndex}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRatingSelect(starIndex);
                      }}
                      className={`p-1.5 sm:p-2.5 rounded-2xl transition-all duration-150 transform hover:scale-115 active:scale-95 focus:outline-hidden cursor-pointer select-none relative group ${
                        isSelected
                          ? 'bg-amber-100/90 ring-3 ring-amber-400 shadow-md scale-105'
                          : 'hover:bg-slate-100'
                      }`}
                      aria-label={`Beri nilai ${starIndex} dari 5 bintang`}
                      title={`${starIndex} Bintang - ${ratingLabels[starIndex]?.text}`}
                    >
                      <Star
                        className={`w-11 h-11 sm:w-16 sm:h-16 transition-colors duration-150 ${
                          isFilled
                            ? 'fill-amber-400 text-amber-500 drop-shadow-[0_8px_14px_rgba(245,158,11,0.6)]'
                            : 'text-slate-300 fill-slate-100 hover:text-amber-300'
                        }`}
                      />
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-md border-2 border-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Subtext instruction */}
              <p className="text-xs text-slate-500 font-semibold">
                {rating > 0 ? `Bintang ${rating} terpilih dan tersimpan permanen. Sentuh bintang lain jika ingin mengubah nilai.` : 'Sentuh bintang di atas untuk memilih (belum ada bintang yang terpilih)'}
              </p>

              {/* Rating validation error hint */}
              {ratingError && (
                <div className="bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs animate-bounce">
                  ⚠️ Silakan sentuh bintang 1 sampai 5 untuk memberikan penilaian
                </div>
              )}

              {/* 3D Rating Label Badge */}
              <div className="text-center space-y-1 pt-1">
                <span
                  className={`inline-flex items-center gap-2 px-5 py-2 text-sm sm:text-base font-black rounded-2xl border-2 ${ratingLabels[rating].color} shadow-md transition-all`}
                >
                  <span className="text-2xl">{ratingLabels[rating].emoji}</span>
                  <span>{ratingLabels[rating].text} {rating > 0 ? `(${rating} / 5 Bintang)` : ''}</span>
                </span>
                <p className="text-xs text-slate-600 font-medium">
                  {ratingLabels[rating].desc}
                </p>
              </div>
            </div>

            {/* Toggle Detailed Aspects Expander: Beri Penilaian Unsur Pelayanan Publik (9 Unsur UU 25/2009) */}
            <div className="pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowAspects(!showAspects)}
                className="btn-3d-slate w-full py-2.5 px-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold text-blue-700"
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Beri Penilaian Unsur Pelayanan Publik</span>
                {showAspects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showAspects && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-5 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 rounded-2xl border border-blue-200 shadow-inner animate-in fade-in duration-200">
                  {UNSUR_SCALE_CONFIGS.map((config) => {
                    const valMap: Record<UnsurScaleMeta['id'], number> = {
                      persyaratan: unsurPersyaratan,
                      prosedur: unsurProsedur,
                      waktu: unsurWaktu,
                      biaya: unsurBiaya,
                      produk: unsurProduk,
                      kompetensi: unsurKompetensi,
                      perilaku: unsurPerilaku,
                      pengaduan: unsurPengaduan,
                      kesopanan: unsurKesopanan,
                    };
                    const itemVal = valMap[config.id] || 0;
                    const isUnrated = itemVal === 0;
                    const currentDesc = !isUnrated ? (config.descriptions[itemVal] || config.descriptions[5]) : 'Belum Memiliki Penilaian';

                    // Calculate percentage along straight line (1=0%, 2=25%, 3=50%, 4=75%, 5=100%, 0=0%)
                    const progressPct = !isUnrated ? ((itemVal - 1) / 4) * 100 : 0;
                    const badgeStyles: Record<number, { bg: string; textCol: string; border: string }> = {
                      1: { bg: 'bg-rose-50', textCol: 'text-rose-700', border: 'border-rose-300' },
                      2: { bg: 'bg-orange-50', textCol: 'text-orange-700', border: 'border-orange-300' },
                      3: { bg: 'bg-amber-50', textCol: 'text-amber-700', border: 'border-amber-300' },
                      4: { bg: 'bg-emerald-50', textCol: 'text-emerald-700', border: 'border-emerald-300' },
                      5: { bg: 'bg-blue-50', textCol: 'text-blue-700', border: 'border-blue-300' },
                    };
                    const currentBadge = isUnrated
                      ? { bg: 'bg-slate-100', textCol: 'text-slate-500', border: 'border-slate-300' }
                      : (badgeStyles[itemVal] || badgeStyles[5]);

                    return (
                      <div
                        key={config.id}
                        className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {/* Item Title & Value Pill */}
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-extrabold text-slate-800 text-xs sm:text-sm leading-snug" title={config.title}>
                            {config.title}
                          </span>
                          <span
                            className={`shrink-0 text-[11px] font-black px-2.5 py-0.5 rounded-lg border ${currentBadge.bg} ${currentBadge.textCol} ${currentBadge.border} shadow-2xs`}
                            title={isUnrated ? 'Belum memilih penilaian' : `Nilai ${itemVal}: ${currentDesc}`}
                          >
                            {isUnrated ? 'Belum Ada Penilaian' : `${itemVal} - ${currentDesc}`}
                          </span>
                        </div>

                        {/* Garis Lurus Digeser (Straight Interactive Range Slider) */}
                        <div className="space-y-1.5 pt-1">
                          <div className="relative flex items-center h-8 px-1">
                            {/* Straight Base Track Line */}
                            <div className="absolute left-1 right-1 h-2.5 rounded-full bg-slate-200 shadow-inner" />

                            {/* Active Filled Gradient Track Line */}
                            <div
                              className="absolute left-1 h-2.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 transition-all duration-150 shadow-xs"
                              style={{ width: isUnrated ? '0%' : `calc(${progressPct}% - 2px)` }}
                            />

                            {/* 5 Step Indicator Tick Dots on the Straight Line */}
                            {[1, 2, 3, 4, 5].map((step) => {
                              const stepPct = ((step - 1) / 4) * 100;
                              const isFilled = !isUnrated && step <= itemVal;
                              return (
                                <div
                                  key={step}
                                  className={`absolute w-3.5 h-3.5 rounded-full border-2 border-white -translate-x-1/2 transition-all duration-150 pointer-events-none shadow-xs z-10 ${
                                    isFilled ? 'bg-blue-600 ring-1 ring-blue-300 scale-110' : 'bg-slate-300'
                                  }`}
                                  style={{ left: `calc(4px + ${stepPct} * (100% - 8px) / 100)` }}
                                />
                              );
                            })}

                            {/* Range Input: Garis Digeser Horizontal */}
                            <input
                              type="range"
                              min={1}
                              max={5}
                              step={1}
                              value={isUnrated ? 3 : itemVal}
                              onChange={(e) => handleUnsurChange(config.id, Number(e.target.value))}
                              className="slider-3d-straight"
                              aria-label={`${config.title} geser nilai dari 1 sampai 5`}
                            />
                          </div>

                          {/* Clickable Step numbers directly beneath the track */}
                          <div className="flex justify-between px-1 text-[11px] font-extrabold text-slate-400 select-none">
                            {[1, 2, 3, 4, 5].map((step) => (
                              <button
                                key={step}
                                type="button"
                                onClick={() => handleUnsurChange(config.id, step)}
                                className={`w-6 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                                  !isUnrated && step === itemVal
                                    ? 'text-blue-700 font-black scale-125'
                                    : 'hover:text-slate-700'
                                }`}
                                title={`Pilih nilai ${step}: ${config.descriptions[step]}`}
                              >
                                {step}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Keterangan Skala Rendah & Tinggi (Sulit / Rumit s/d Sangat Mudah & Jelas) */}
                        <div className="flex justify-between items-center text-[10.5px] font-bold pt-1.5 border-t border-slate-100">
                          <span className={!isUnrated && itemVal <= 2 ? 'text-rose-600 font-extrabold' : 'text-slate-400'}>
                            {config.low}
                          </span>
                          <span className={!isUnrated && itemVal >= 4 ? 'text-blue-700 font-extrabold' : 'text-slate-400'}>
                            {config.high}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* STEP 4: Kolom Saran Singkat untuk Layanan Ini - Lebar Maksimal 1600px */}
          <div
            className="card-3d p-6 sm:p-8 space-y-4 w-full max-w-[1600px] mx-auto"
            style={{ maxWidth: '1600px', width: '100%' }}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3.5">
                  <div className="coin-3d w-10 h-10 flex items-center justify-center font-black text-base shrink-0">
                    4
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    4. Kolom Saran Singkat untuk Layanan Ini
                  </h2>
                </div>

                {/* Tombol Ganti di samping kiri 0/500 karakter */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCycleQuickSuggestion}
                    className="btn-3d-slate px-3 py-1.5 text-xs font-bold text-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs hover:text-blue-900 active:scale-95"
                    title="Ganti saran masukan alternatif"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ganti</span>
                  </button>

                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    {feedback.length}/500 karakter
                  </span>
                </div>
              </div>

              {/* Teks Deskripsi */}
              <div className="pt-1 pl-0 sm:pl-[54px]">
                <p className="text-xs text-slate-600 font-medium">
                  Aspirasi Anda khusus untuk pelayanan <strong className="text-slate-900">{selectedAgencyName}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="Tuliskan pengalaman Anda atau masukan positif untuk kemajuan pelayanan publik..."
                className="input-3d w-full p-4 text-slate-900 text-sm font-medium leading-relaxed"
              />
            </div>
          </div>

          {/* STEP 5: Data Pemohon - Lebar Maksimal 1600px */}
          <div
            className="card-3d p-6 sm:p-8 space-y-4 w-full max-w-[1600px] mx-auto"
            style={{ maxWidth: '1600px', width: '100%' }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3.5">
                <div className="coin-3d w-10 h-10 flex items-center justify-center font-black text-base shrink-0">
                  5
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    5. Data Pemohon
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Identitas responden untuk validitas indeks mutu pelayanan
                  </p>
                </div>
              </div>

              {/* Tombol Ganti di samping kiri Tidak Ingin Memberitahu (Anonim) */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleCycleRespondentProfile}
                  disabled={isAnonymous}
                  className="btn-3d-slate px-3.5 py-2 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-700 cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-xs"
                  title="Ganti data profil pemohon"
                >
                  <RotateCcw className="w-4 h-4 text-blue-600" />
                  <span>Ganti</span>
                </button>

                {/* Anonymous 3D Checkbox */}
                <label className="btn-3d-slate px-4 py-2 flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer shadow-xs">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Tidak Ingin Memberitahu (Anonim)</span>
                </label>
              </div>
            </div>

            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 transition-opacity ${isAnonymous ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {/* Nama Pemohon */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Nama Pemohon *
                </label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Nama Lengkap Pemohon"
                  required={!isAnonymous}
                  disabled={isAnonymous}
                  className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900"
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Jenis Kelamin
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as SurveyResponse['gender'])}
                  disabled={isAnonymous}
                  className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 cursor-pointer"
                >
                  <option value="Perempuan">Perempuan</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Tidak Ingin Memberitahu">Tidak Ingin Memberitahu</option>
                </select>
              </div>

              {/* Kelompok Usia */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Kelompok Usia
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value as SurveyResponse['ageGroup'])}
                  disabled={isAnonymous}
                  className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 cursor-pointer"
                >
                  <option value="< 20 Tahun">&lt; 20 Tahun</option>
                  <option value="20 - 35 Tahun">20 - 35 Tahun</option>
                  <option value="36 - 45 Tahun">36 - 45 Tahun</option>
                  <option value="46 - 60 Tahun">46 - 60 Tahun</option>
                  <option value="> 60 Tahun">&gt; 60 Tahun</option>
                </select>
              </div>

              {/* Pendidikan Terakhir */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Pendidikan Terakhir
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value as SurveyResponse['education'])}
                  disabled={isAnonymous}
                  className="input-3d w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 cursor-pointer"
                >
                  <option value="SD Sederajat">SD Sederajat</option>
                  <option value="SMP Sederajat">SMP Sederajat</option>
                  <option value="SMA/SMK Sederajat">SMA/SMK Sederajat</option>
                  <option value="Diploma (D1-D4)">Diploma (D1-D4)</option>
                  <option value="Sarjana (S1)">Sarjana (S1)</option>
                  <option value="Pascasarjana (S2/S3)">Pascasarjana (S2/S3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3D Big Submit Action Bar - Lebar Maksimal 1600px */}
          <div className="pt-3 w-full max-w-[1600px] mx-auto" style={{ maxWidth: '1600px', width: '100%' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-3d-blue w-full py-4.5 px-8 font-black text-base sm:text-xl flex items-center justify-center gap-3 tracking-wide"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span>Menyimpan ke Cloud Firestore...</span>
                </>
              ) : (
                <>
                  <Send className="w-6 h-6 drop-shadow-md" />
                  <span>Kirim Penilaian Survei Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* 3D Footer Note: Khusus Peraturan Kementrian PAN - RB No. 14 Tahun 2017 (Rata Tengah Kanan Kiri) */}
        <div className="w-full max-w-[1600px] mx-auto px-2 py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold border-t border-slate-200/80 pt-3 text-center mx-auto">
            <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-600 font-bold text-center">
              Peraturan Kementrian PAN - RB No. 14 Tahun 2017
            </span>
          </div>
        </div>
      </div>

      {/* Success Modal Confirmation Dialog with 3D Depth & Celebration Animation */}
      {showSuccessModal && submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          {/* Confetti & Twinkling Sparkles Animation ("buatkan animasi setelah kirim peniaian survey") */}
          <CelebrationEffect />

          <div className="relative z-10 bg-white rounded-3xl max-w-md w-full p-7 sm:p-8 text-center space-y-6 shadow-[0_25px_60px_rgba(15,23,42,0.45)] border border-slate-200 animate-celebration-pop">
            {/* Animated Celebration Icon & Rings */}
            <div className="relative inline-flex items-center justify-center">
              {/* Pulsing Glow Rings */}
              <div className="absolute inset-0 rounded-3xl bg-emerald-400/40 blur-xl animate-celebration-pulse" />

              {/* 3D Checkmark Medallion */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-[0_8px_0_0_#047857,0_16px_28px_rgba(4,120,87,0.4)] border-t border-white/60">
                <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md text-white stroke-[2.5]" />

                {/* Floating Micro Badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 text-xs font-black p-1.5 rounded-full shadow-md border-2 border-white animate-bounce">
                  ✨
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Survei Berhasil Dikirim!</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Terima Kasih Atas Partisipasi Anda!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Penilaian Anda untuk <strong className="text-slate-900">{submittedData.agencyName}</strong> berhasil tersimpan secara real-time.
              </p>
            </div>

            {/* 3D Summary Card */}
            <div className="bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-2xl p-4 border border-slate-200 shadow-inner text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Nilai Kepuasan:</span>
                <span className="font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  {submittedData.rating} dari 5 Bintang
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Nama Pemohon:</span>
                <span className="font-bold text-slate-800">{submittedData.respondentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tanggal Survei:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {formatIndonesianDate(submittedData.surveyDate || surveyDate)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Waktu Pengiriman:</span>
                <span className="font-mono font-bold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>

              {submittedData.isOfflineQueued && (
                <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] font-bold text-amber-900 flex items-start gap-2">
                  <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Tersimpan di IndexedDB (Mode Offline). Data akan disinkronkan otomatis ke Firestore begitu koneksi internet kembali stabil.
                  </span>
                </div>
              )}
            </div>

            {/* Single Prominent "Selesai" Action Button (Tombol Lihat Hasil di Dashboard disembunyikan) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleResetForNextCitizen}
                className="btn-3d-blue w-full py-4 px-6 font-black text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg tracking-wide cursor-pointer"
              >
                <Check className="w-5 h-5 text-white stroke-[3]" />
                <span>Selesai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
