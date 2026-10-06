export interface SurveyResponse {
  id: string;
  agencyId: string;
  agencyName: string;
  rating: number; // 1 - 5
  aspectSpeed: number; // 1 - 5 (Kecepatan Pelayanan)
  aspectFriendliness: number; // 1 - 5 (Keramahan Petugas)
  aspectClarity: number; // 1 - 5 (Kejelasan Prosedur & Biaya)
  aspectFacility: number; // 1 - 5 (Kenyamanan Fasilitas)
  // 9 Unsur Pelayanan Publik (UU No. 25 Tahun 2009)
  unsurPersyaratan?: number;
  unsurProsedur?: number;
  unsurWaktu?: number;
  unsurBiaya?: number;
  unsurProduk?: number;
  unsurKompetensi?: number;
  unsurPerilaku?: number;
  unsurPengaduan?: number;
  unsurKesopanan?: number;
  feedback: string;
  isAnonymous: boolean;
  respondentName: string;
  gender: 'Laki-laki' | 'Perempuan' | 'Tidak Ingin Memberitahu';
  ageGroup: '< 20 Tahun' | '20 - 35 Tahun' | '36 - 45 Tahun' | '46 - 60 Tahun' | '> 60 Tahun' | 'Tidak Ingin Memberitahu';
  education: 'SD Sederajat' | 'SMP Sederajat' | 'SMA/SMK Sederajat' | 'Diploma (D1-D4)' | 'Sarjana (S1)' | 'Pascasarjana (S2/S3)' | 'Tidak Ingin Memberitahu';
  createdAt: string; // ISO string
  timestamp: number;
  surveyDate?: string; // Format YYYY-MM-DD (Fitur Penanggalan Survei)
  isOfflineQueued?: boolean; // Disimpan di IndexedDB saat offline
}

export interface Agency {
  id: string;
  name: string;
  category: string;
  active: boolean;
  order: number;
}

export interface FilterState {
  startDay: number;
  endDay: number;
  month: number; // 0 - 11
  year: number;
  agencyName: string;
}

export interface AspectRatings {
  speed: number;
  friendliness: number;
  clarity: number;
  facility: number;
}

export interface UnsurAverages {
  persyaratan: number;
  prosedur: number;
  waktu: number;
  biaya: number;
  produk: number;
  kompetensi: number;
  perilaku: number;
  pengaduan: number;
  kesopanan: number;
}

export interface DailyPoint {
  day: number;
  dateStr: string;
  ikmScore: number;
  averageRating: number;
  totalVotes: number;
  mutu: string;
}

export interface IKMStats {
  ikmScore: number; // 25 - 100
  mutu: 'A (Sangat Baik)' | 'B (Baik)' | 'C (Kurang Baik)' | 'D (Tidak Baik)';
  averageRating: number; // 1 - 5
  totalRespondents: number;
  satisfiedPercentage: number; // % rating 4 and 5
  ratingCounts: { [rating: number]: number };
  aspectAverages: AspectRatings;
  unsurAverages?: UnsurAverages;
  dailyTrends: DailyPoint[];
}
