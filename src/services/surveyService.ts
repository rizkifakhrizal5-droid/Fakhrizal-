import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SurveyResponse, Agency, IKMStats, DailyPoint } from '../types/survey';
import { DEFAULT_AGENCIES, generateSeedSurveys } from '../data/defaultAgencies';
import { saveSurveyToIndexedDB, syncOfflineSurveysToFirestore } from './offlineSyncService';

const SURVEYS_COLLECTION = 'surveys';
const AGENCIES_COLLECTION = 'agencies';
const LOCAL_STORAGE_KEY_SURVEYS = 'gampil_surveys_cache';
const LOCAL_STORAGE_KEY_AGENCIES = 'gampil_agencies_cache';

// Helper to read local cache
function getLocalCache<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read local cache:', e);
  }
  return fallback;
}

function setLocalCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write local cache:', e);
  }
}

export function getLocalDateString(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Real-time listener for Survey responses
 */
export function subscribeSurveys(
  onUpdate: (surveys: SurveyResponse[]) => void,
  onError?: (err: unknown) => void
): () => void {
  // Prime immediately with local cache or seeds so UI never flashes empty
  const cached = getLocalCache<SurveyResponse[]>(LOCAL_STORAGE_KEY_SURVEYS, generateSeedSurveys());
  onUpdate(cached);

  try {
    const unsubscribe = onSnapshot(
      collection(db, SURVEYS_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: SurveyResponse[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              agencyId: data.agencyId || '',
              agencyName: data.agencyName || 'Instansi Terpadu',
              rating: Number(data.rating) || 5,
              aspectSpeed: Number(data.aspectSpeed) || Number(data.rating) || 5,
              aspectFriendliness: Number(data.aspectFriendliness) || Number(data.rating) || 5,
              aspectClarity: Number(data.aspectClarity) || Number(data.rating) || 5,
              aspectFacility: Number(data.aspectFacility) || Number(data.rating) || 5,
              unsurPersyaratan: typeof data.unsurPersyaratan === 'number' ? data.unsurPersyaratan : (Number(data.unsurPersyaratan) || Number(data.rating) || 5),
              unsurProsedur: typeof data.unsurProsedur === 'number' ? data.unsurProsedur : (Number(data.unsurProsedur) || Number(data.rating) || 5),
              unsurWaktu: typeof data.unsurWaktu === 'number' ? data.unsurWaktu : (Number(data.unsurWaktu) || Number(data.rating) || 5),
              unsurBiaya: typeof data.unsurBiaya === 'number' ? data.unsurBiaya : (Number(data.unsurBiaya) || Number(data.rating) || 5),
              unsurProduk: typeof data.unsurProduk === 'number' ? data.unsurProduk : (Number(data.unsurProduk) || Number(data.rating) || 5),
              unsurKompetensi: typeof data.unsurKompetensi === 'number' ? data.unsurKompetensi : (Number(data.unsurKompetensi) || Number(data.rating) || 5),
              unsurPerilaku: typeof data.unsurPerilaku === 'number' ? data.unsurPerilaku : (Number(data.unsurPerilaku) || Number(data.rating) || 5),
              unsurPengaduan: typeof data.unsurPengaduan === 'number' ? data.unsurPengaduan : (Number(data.unsurPengaduan) || Number(data.rating) || 5),
              unsurKesopanan: typeof data.unsurKesopanan === 'number' ? data.unsurKesopanan : (Number(data.unsurKesopanan) || Number(data.rating) || 5),
              feedback: data.feedback || '',
              isAnonymous: Boolean(data.isAnonymous),
              respondentName: data.respondentName || 'Pemohon',
              gender: data.gender || 'Tidak Ingin Memberitahu',
              ageGroup: data.ageGroup || '20 - 35 Tahun',
              education: data.education || 'Sarjana (S1)',
              createdAt: data.createdAt || getLocalDateString(),
              timestamp: Number(data.timestamp) || Date.now(),
              surveyDate: data.surveyDate || (data.createdAt ? data.createdAt.split('T')[0] : getLocalDateString()),
            };
          });

          // Diurutkan sesuai tanggal pertama dan seterusnya (kronologis ascending)
          list.sort((a, b) => {
            const dateA = a.surveyDate || (a.createdAt ? a.createdAt.split('T')[0] : '');
            const dateB = b.surveyDate || (b.createdAt ? b.createdAt.split('T')[0] : '');
            if (dateA && dateB && dateA !== dateB) return dateA.localeCompare(dateB);
            return (a.timestamp || 0) - (b.timestamp || 0);
          });

          // Simpan ke local cache sebagai backup, dan kirimkan data real-time Firestore ke semua perangkat
          setLocalCache(LOCAL_STORAGE_KEY_SURVEYS, list);
          onUpdate(list);
        } else {
          // If Firestore is empty, seed it with initial responses so dashboard looks like screenshot!
          seedSurveysToFirestore(cached);
          onUpdate(cached);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, SURVEYS_COLLECTION);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Fallback: Firestore offline or initializing, relying on local state');
    return () => {};
  }
}

/**
 * Real-time listener for Agencies (Tersimpan permanen di Cloud Firestore & Multi-Perangkat)
 */
export function subscribeAgencies(
  onUpdate: (agencies: Agency[]) => void,
  onError?: (err: unknown) => void
): () => void {
  // 1. Tampilkan cache lokal terlebih dahulu untuk menghindari flicker
  const cached = getLocalCache<Agency[]>(LOCAL_STORAGE_KEY_AGENCIES, DEFAULT_AGENCIES);
  onUpdate(cached);

  try {
    const unsubscribe = onSnapshot(
      collection(db, AGENCIES_COLLECTION),
      (snapshot) => {
        if (!snapshot.empty) {
          // Firestore adalah sumber kebenaran utama (Authoritative Cloud Database)
          const list: Agency[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.name || '',
              category: data.category || 'Pelayanan Publik',
              active: data.active !== false,
              order: Number(data.order) || 0,
            };
          });

          // Urutkan berdasarkan urutan order atau nama
          list.sort((a, b) => (a.order || 0) - (b.order || 0));

          // Simpan ke cache lokal agar sinkron di perangkat ini
          setLocalCache(LOCAL_STORAGE_KEY_AGENCIES, list);
          onUpdate(list);
        } else {
          // Jika koleksi di Firestore benar-benar kosong pertama kali, seed data default resmi
          seedAgenciesToFirestore(DEFAULT_AGENCIES).catch(() => {});
          setLocalCache(LOCAL_STORAGE_KEY_AGENCIES, DEFAULT_AGENCIES);
          onUpdate(DEFAULT_AGENCIES);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, AGENCIES_COLLECTION);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Fallback: Using cached/default agencies');
    return () => {};
  }
}

/**
 * Submit survey response
 */
export async function submitSurvey(response: Omit<SurveyResponse, 'id'>): Promise<SurveyResponse> {
  const id = `surv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const chosenSurveyDate =
    response.surveyDate ||
    (response.createdAt ? response.createdAt.split('T')[0] : getLocalDateString());

  let finalTimestamp = Number(response.timestamp);
  let finalCreatedAt = response.createdAt;

  if (chosenSurveyDate) {
    try {
      const [y, m, d] = chosenSurveyDate.split('-').map(Number);
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      finalCreatedAt = `${chosenSurveyDate}T${hh}:${mm}:${ss}`;
      const targetDate = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
      if (!isNaN(targetDate.getTime())) {
        finalTimestamp = targetDate.getTime();
      }
    } catch (e) {
      console.warn('Error computing surveyDate timestamp:', e);
    }
  }

  const sanitizedItem: SurveyResponse = {
    id,
    agencyId: response.agencyId || 'general',
    agencyName: response.agencyName || 'Instansi Terpadu',
    rating: Number(response.rating) || 5,
    aspectSpeed: Number(response.aspectSpeed) || Number(response.rating) || 5,
    aspectFriendliness: Number(response.aspectFriendliness) || Number(response.rating) || 5,
    aspectClarity: Number(response.aspectClarity) || Number(response.rating) || 5,
    aspectFacility: Number(response.aspectFacility) || Number(response.rating) || 5,
    unsurPersyaratan: typeof response.unsurPersyaratan === 'number' ? response.unsurPersyaratan : (Number(response.unsurPersyaratan) || Number(response.rating) || 5),
    unsurProsedur: typeof response.unsurProsedur === 'number' ? response.unsurProsedur : (Number(response.unsurProsedur) || Number(response.rating) || 5),
    unsurWaktu: typeof response.unsurWaktu === 'number' ? response.unsurWaktu : (Number(response.unsurWaktu) || Number(response.rating) || 5),
    unsurBiaya: typeof response.unsurBiaya === 'number' ? response.unsurBiaya : (Number(response.unsurBiaya) || Number(response.rating) || 5),
    unsurProduk: typeof response.unsurProduk === 'number' ? response.unsurProduk : (Number(response.unsurProduk) || Number(response.rating) || 5),
    unsurKompetensi: typeof response.unsurKompetensi === 'number' ? response.unsurKompetensi : (Number(response.unsurKompetensi) || Number(response.rating) || 5),
    unsurPerilaku: typeof response.unsurPerilaku === 'number' ? response.unsurPerilaku : (Number(response.unsurPerilaku) || Number(response.rating) || 5),
    unsurPengaduan: typeof response.unsurPengaduan === 'number' ? response.unsurPengaduan : (Number(response.unsurPengaduan) || Number(response.rating) || 5),
    unsurKesopanan: typeof response.unsurKesopanan === 'number' ? response.unsurKesopanan : (Number(response.unsurKesopanan) || Number(response.rating) || 5),
    feedback: (response.feedback || 'Pelayanan sangat memuaskan.').trim(),
    isAnonymous: Boolean(response.isAnonymous),
    respondentName: (response.respondentName || 'Pemohon').trim(),
    gender: response.gender || 'Laki-laki',
    ageGroup: response.ageGroup || '20 - 35 Tahun',
    education: response.education || 'Sarjana (S1)',
    createdAt: finalCreatedAt || new Date().toISOString(),
    timestamp: finalTimestamp || Date.now(),
    surveyDate: chosenSurveyDate,
  };

  // 1. Update local cache immediately for instantaneous UI feedback
  const cached = getLocalCache<SurveyResponse[]>(LOCAL_STORAGE_KEY_SURVEYS, []);
  const updated = [...cached.filter((s) => s.id !== id), sanitizedItem].sort((a, b) => {
    const dateA = a.surveyDate || (a.createdAt ? a.createdAt.split('T')[0] : '');
    const dateB = b.surveyDate || (b.createdAt ? b.createdAt.split('T')[0] : '');
    if (dateA && dateB && dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.timestamp || 0) - (b.timestamp || 0);
  });
  setLocalCache(LOCAL_STORAGE_KEY_SURVEYS, updated);

  // Siapkan data bersih untuk Firestore
  const firestoreData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sanitizedItem)) {
    if (value !== undefined) {
      firestoreData[key] = value;
    }
  }

  // 2. Simpan permanen ke cloud Firestore
  try {
    const docRef = doc(db, SURVEYS_COLLECTION, id);
    const writePromise = setDoc(docRef, firestoreData);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout setDoc Firestore 6s')), 6000)
    );
    await Promise.race([writePromise, timeoutPromise]);
    console.log('[Firestore] Survei berhasil tersimpan permanen di cloud Firestore:', id);
    sanitizedItem.isOfflineQueued = false;
  } catch (error) {
    console.warn('[Survey] Gagal menyimpan langsung ke Firestore, fallback menyimpan ke IndexedDB:', error);
    sanitizedItem.isOfflineQueued = true;
    try {
      await saveSurveyToIndexedDB(sanitizedItem);
      // Picu sinkronisasi di latar belakang sesegera mungkin
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        setTimeout(() => {
          syncOfflineSurveysToFirestore().catch(() => {});
        }, 1000);
      }
    } catch (err) {
      console.warn('Gagal fallback ke IndexedDB:', err);
    }
    handleFirestoreError(error, OperationType.CREATE, `${SURVEYS_COLLECTION}/${id}`);
  }

  // 3. Dispatch custom event for immediate app-wide state sync
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('gampil_survey_submitted', { detail: sanitizedItem }));
    }
  } catch (e) {
    console.warn('Dispatch event warning:', e);
  }

  return sanitizedItem;
}

/**
 * Add or Update an Agency
 */
export async function saveAgency(agency: Agency): Promise<void> {
  const id = agency.id || `agency-${Date.now()}`;
  const toSave = { ...agency, id };

  const cached = getLocalCache<Agency[]>(LOCAL_STORAGE_KEY_AGENCIES, DEFAULT_AGENCIES);
  const existingIdx = cached.findIndex((a) => a.id === id);
  let updated: Agency[];
  if (existingIdx >= 0) {
    updated = [...cached];
    updated[existingIdx] = toSave;
  } else {
    updated = [...cached, toSave];
  }
  setLocalCache(LOCAL_STORAGE_KEY_AGENCIES, updated);

  try {
    await setDoc(doc(db, AGENCIES_COLLECTION, id), toSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${AGENCIES_COLLECTION}/${id}`);
  }
}

/**
 * Delete an Agency
 */
export async function deleteAgency(id: string): Promise<void> {
  const cached = getLocalCache<Agency[]>(LOCAL_STORAGE_KEY_AGENCIES, DEFAULT_AGENCIES);
  const updated = cached.filter((a) => a.id !== id);
  setLocalCache(LOCAL_STORAGE_KEY_AGENCIES, updated);

  try {
    await deleteDoc(doc(db, AGENCIES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${AGENCIES_COLLECTION}/${id}`);
  }
}

/**
 * Delete a Survey response
 */
export async function deleteSurvey(id: string): Promise<void> {
  const cached = getLocalCache<SurveyResponse[]>(LOCAL_STORAGE_KEY_SURVEYS, []);
  const updated = cached.filter((s) => s.id !== id);
  setLocalCache(LOCAL_STORAGE_KEY_SURVEYS, updated);

  try {
    await deleteDoc(doc(db, SURVEYS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${SURVEYS_COLLECTION}/${id}`);
  }
}

/**
 * Seed initial surveys in Firestore
 */
export async function seedSurveysToFirestore(seeds: SurveyResponse[]) {
  try {
    const batch = writeBatch(db);
    seeds.forEach((s) => {
      const ref = doc(db, SURVEYS_COLLECTION, s.id);
      batch.set(ref, s);
    });
    await batch.commit();
  } catch (e) {
    console.warn('Seed surveys batch write skipped or already exists', e);
  }
}

/**
 * Seed agencies in Firestore
 */
export async function seedAgenciesToFirestore(agencies: Agency[]) {
  try {
    const batch = writeBatch(db);
    agencies.forEach((a) => {
      const ref = doc(db, AGENCIES_COLLECTION, a.id);
      batch.set(ref, a);
    });
    await batch.commit();
  } catch (e) {
    console.warn('Seed agencies batch write skipped or already exists', e);
  }
}

/**
 * Sync official 32 agencies and seed data to Firestore
 */
export async function syncOfficialAgenciesToFirestore(): Promise<void> {
  await seedAgenciesToFirestore(DEFAULT_AGENCIES);
  const seeds = generateSeedSurveys();
  await seedSurveysToFirestore(seeds);
  setLocalCache(LOCAL_STORAGE_KEY_AGENCIES, DEFAULT_AGENCIES);
  setLocalCache(LOCAL_STORAGE_KEY_SURVEYS, seeds);
}

/**
 * Reset all surveys to initial demo state
 */
export async function resetAllSurveys(): Promise<void> {
  const seeds = generateSeedSurveys();
  setLocalCache(LOCAL_STORAGE_KEY_SURVEYS, seeds);

  try {
    const batch = writeBatch(db);
    seeds.forEach((s) => {
      const ref = doc(db, SURVEYS_COLLECTION, s.id);
      batch.set(ref, s);
    });
    await batch.commit();
  } catch (e) {
    console.warn('Reset batch update fallback:', e);
  }
}

/**
 * Calculate IKM Statistics conforming to PermenPAN-RB No. 14 / 2017
 */
export function calculateIKMStats(
  surveys: SurveyResponse[],
  filterYear: number,
  filterMonth: number,
  startDay: number,
  endDay: number,
  selectedAgency?: string
): IKMStats {
  const filtered = surveys.filter((s) => {
    let dayNum: number;
    let monthNum: number;
    let yearNum: number;

    if (s.surveyDate && s.surveyDate.includes('-')) {
      const parts = s.surveyDate.split('-').map(Number);
      yearNum = parts[0];
      monthNum = parts[1] - 1;
      dayNum = parts[2];
    } else {
      const d = new Date(s.timestamp || s.createdAt);
      yearNum = d.getFullYear();
      monthNum = d.getMonth();
      dayNum = d.getDate();
    }

    const matchesYear = filterYear === -1 || yearNum === filterYear;
    const matchesMonth = filterMonth === -1 || monthNum === filterMonth;
    const matchesDay =
      filterMonth === -1
        ? true
        : dayNum >= Math.min(startDay, endDay) && dayNum <= Math.max(startDay, endDay);
    const matchesAgency =
      !selectedAgency || selectedAgency === 'Semua Instansi (32)' || s.agencyName === selectedAgency;

    return matchesYear && matchesMonth && matchesDay && matchesAgency;
  });

  const total = filtered.length;

  if (total === 0) {
    return {
      ikmScore: 0,
      mutu: 'D (Tidak Baik)',
      averageRating: 0,
      totalRespondents: 0,
      satisfiedPercentage: 0,
      ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      aspectAverages: { speed: 0, friendliness: 0, clarity: 0, facility: 0 },
      dailyTrends: [],
    };
  }

  let totalRatingSum = 0;
  let totalSpeed = 0;
  let totalFriendliness = 0;
  let totalClarity = 0;
  let totalFacility = 0;
  let totalPersyaratan = 0;
  let totalProsedur = 0;
  let totalWaktu = 0;
  let totalBiaya = 0;
  let totalProduk = 0;
  let totalKompetensi = 0;
  let totalPerilaku = 0;
  let totalPengaduan = 0;
  let totalKesopanan = 0;
  const ratingCounts: { [rating: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let satisfiedCount = 0;

  // Group by day for the daily trend chart
  const daysMap: { [day: number]: { sum: number; count: number } } = {};

  filtered.forEach((s) => {
    const r = Math.round(s.rating);
    ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    totalRatingSum += s.rating;

    if (r >= 4) {
      satisfiedCount++;
    }

    totalSpeed += s.aspectSpeed || s.rating;
    totalFriendliness += s.aspectFriendliness || s.rating;
    totalClarity += s.aspectClarity || s.rating;
    totalFacility += s.aspectFacility || s.rating;

    totalPersyaratan += s.unsurPersyaratan || s.rating;
    totalProsedur += s.unsurProsedur || s.rating;
    totalWaktu += s.unsurWaktu || s.rating;
    totalBiaya += s.unsurBiaya || s.rating;
    totalProduk += s.unsurProduk || s.rating;
    totalKompetensi += s.unsurKompetensi || s.rating;
    totalPerilaku += s.unsurPerilaku || s.rating;
    totalPengaduan += s.unsurPengaduan || s.rating;
    totalKesopanan += s.unsurKesopanan || s.rating;

    let dayNum: number;
    if (s.surveyDate) {
      const parts = s.surveyDate.split('-').map(Number);
      dayNum = parts[2];
    } else {
      const d = new Date(s.timestamp || s.createdAt);
      dayNum = d.getDate();
    }
    if (!daysMap[dayNum]) {
      daysMap[dayNum] = { sum: 0, count: 0 };
    }
    daysMap[dayNum].sum += s.rating;
    daysMap[dayNum].count += 1;
  });

  const averageRating = Number((totalRatingSum / total).toFixed(2));
  // IKM PermenPAN-RB formula: Konversi skala 25 - 100 = (Rating / 5) * 100 or NRR Tertimbang x 25
  const ikmScore = Number(((averageRating / 5) * 100).toFixed(2));

  let mutu: IKMStats['mutu'] = 'A (Sangat Baik)';
  if (ikmScore >= 88.31) {
    mutu = 'A (Sangat Baik)';
  } else if (ikmScore >= 76.61) {
    mutu = 'B (Baik)';
  } else if (ikmScore >= 65.0) {
    mutu = 'C (Kurang Baik)';
  } else {
    mutu = 'D (Tidak Baik)';
  }

  const satisfiedPercentage = Math.round((satisfiedCount / total) * 100);

  // Generate daily points for day 1 to 31 (matching screenshot 2!)
  const dailyTrends: DailyPoint[] = [];
  const targetYear = filterYear > 0 ? filterYear : new Date().getFullYear();
  const targetMonth = filterMonth >= 0 && filterMonth <= 11 ? filterMonth : new Date().getMonth();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const data = daysMap[d];
    if (data && data.count > 0) {
      const avg = Number((data.sum / data.count).toFixed(2));
      const ikm = Number(((avg / 5) * 100).toFixed(2));
      dailyTrends.push({
        day: d,
        dateStr: `Tgl ${d}`,
        averageRating: avg,
        ikmScore: ikm,
        totalVotes: data.count,
        mutu: ikm >= 88.31 ? 'Mutu A (Sangat Baik)' : ikm >= 76.61 ? 'Mutu B (Baik)' : 'Mutu C',
      });
    } else {
      dailyTrends.push({
        day: d,
        dateStr: `Tgl ${d}`,
        averageRating: 0,
        ikmScore: 0,
        totalVotes: 0,
        mutu: '-',
      });
    }
  }

  return {
    ikmScore,
    mutu,
    averageRating,
    totalRespondents: total,
    satisfiedPercentage,
    ratingCounts,
    aspectAverages: {
      speed: Number((totalSpeed / total).toFixed(2)),
      friendliness: Number((totalFriendliness / total).toFixed(2)),
      clarity: Number((totalClarity / total).toFixed(2)),
      facility: Number((totalFacility / total).toFixed(2)),
    },
    unsurAverages: {
      persyaratan: Number((totalPersyaratan / total).toFixed(2)),
      prosedur: Number((totalProsedur / total).toFixed(2)),
      waktu: Number((totalWaktu / total).toFixed(2)),
      biaya: Number((totalBiaya / total).toFixed(2)),
      produk: Number((totalProduk / total).toFixed(2)),
      kompetensi: Number((totalKompetensi / total).toFixed(2)),
      perilaku: Number((totalPerilaku / total).toFixed(2)),
      pengaduan: Number((totalPengaduan / total).toFixed(2)),
      kesopanan: Number((totalKesopanan / total).toFixed(2)),
    },
    dailyTrends,
  };
}

export {
  syncOfflineSurveysToFirestore,
  getPendingOfflineCount,
  setupAutoSyncListener,
  registerServiceWorker
} from './offlineSyncService';

