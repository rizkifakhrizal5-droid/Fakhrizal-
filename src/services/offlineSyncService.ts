/**
 * Layanan Penyimpanan Offline IndexedDB & Sinkronisasi Otomatis ke Firestore
 * Memungkinkan pengisian survei tanpa internet (tersimpan lokal) dan sinkronisasi otomatis saat online kembali.
 */

import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { SurveyResponse } from '../types/survey';

const DB_NAME = 'mpp_survey_offline_store';
const DB_VERSION = 1;
const STORE_NAME = 'pending_surveys';

/**
 * Membuka koneksi ke IndexedDB browser
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada browser ini'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Gagal membuka IndexedDB'));
    };
  });
}

/**
 * Simpan data survei ke IndexedDB saat internet terputus / offline
 */
export async function saveSurveyToIndexedDB(survey: SurveyResponse): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const itemToSave = {
        ...survey,
        isOfflineQueued: true,
        queuedAt: Date.now()
      };
      const req = store.put(itemToSave);

      req.onsuccess = () => {
        // Beritahu window ada survei tersimpan offline
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gampil_offline_survey_saved', { detail: itemToSave }));
        }
        resolve();
      };

      req.onerror = () => {
        reject(req.error || new Error('Gagal menyimpan ke IndexedDB'));
      };
    });
  } catch (err) {
    console.error('Error saat menyimpan ke IndexedDB:', err);
    throw err;
  }
}

/**
 * Ambil semua antrean data survei yang belum terkirim dari IndexedDB
 */
export async function getPendingOfflineSurveys(): Promise<SurveyResponse[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve((req.result as SurveyResponse[]) || []);
      };

      req.onerror = () => {
        reject(req.error || new Error('Gagal mengambil data dari IndexedDB'));
      };
    });
  } catch (err) {
    console.warn('Gagal membaca IndexedDB offline store:', err);
    return [];
  }
}

/**
 * Hapus data survei dari IndexedDB setelah sukses terkirim ke Firestore
 */
export async function removeOfflineSurvey(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal menghapus item dari IndexedDB:', err);
  }
}

/**
 * Hitung jumlah antrean survei offline yang menunggu sync
 */
export async function getPendingOfflineCount(): Promise<number> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const req = store.count();

      req.onsuccess = () => resolve(req.result || 0);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return 0;
  }
}

/**
 * Kirim otomatis (sync) semua survei dari IndexedDB ke Firestore
 */
let isSyncing = false;
let syncStartedAt = 0;

export async function syncOfflineSurveysToFirestore(): Promise<{ syncedCount: number; errors: number }> {
  // Cegah double run, tetapi reset jika proses sebelumnya macet lebih dari 12 detik
  if (isSyncing && Date.now() - syncStartedAt < 12000) {
    return { syncedCount: 0, errors: 0 };
  }

  isSyncing = true;
  syncStartedAt = Date.now();
  let syncedCount = 0;
  let errors = 0;

  try {
    const pendingList = await getPendingOfflineSurveys();
    if (pendingList.length === 0) {
      isSyncing = false;
      return { syncedCount: 0, errors: 0 };
    }

    console.log(`[OfflineSync] Mengirim ${pendingList.length} survei tersimpan offline ke Firestore...`);

    for (const item of pendingList) {
      try {
        const targetId = item.id || `surv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Bersihkan objek dari undefined dan properti internal offline queue
        const cleanPayload: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(item)) {
          if (value !== undefined && key !== 'isOfflineQueued' && key !== 'queuedAt') {
            cleanPayload[key] = value;
          }
        }
        cleanPayload.id = targetId;
        cleanPayload.syncedAt = new Date().toISOString();

        const docRef = doc(db, 'surveys', targetId);

        // Batasi waktu penulisan maksimal 8 detik per dokumen agar tidak menggantung jika koneksi tidak stabil
        const writePromise = setDoc(docRef, cleanPayload, { merge: true });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout koneksi Firestore (8s)')), 8000)
        );

        await Promise.race([writePromise, timeoutPromise]);

        // Sukses: hapus dari antrean IndexedDB
        if (item.id) {
          await removeOfflineSurvey(item.id);
        }
        syncedCount++;

        // Update local cache agar segera muncul di UI
        try {
          const raw = localStorage.getItem('gampil_surveys_cache');
          const cacheList: SurveyResponse[] = raw ? JSON.parse(raw) : [];
          const exists = cacheList.some((s) => s.id === targetId);
          if (!exists) {
            localStorage.setItem(
              'gampil_surveys_cache',
              JSON.stringify([{ ...item, id: targetId, isOfflineQueued: false }, ...cacheList])
            );
          }
        } catch (cacheErr) {
          console.warn('Cache update warning:', cacheErr);
        }

        // Beritahu window
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('gampil_survey_synced', { detail: { ...item, id: targetId } }));
        }
      } catch (err) {
        console.error(`[OfflineSync] Gagal mengirim survei ID ${item.id} ke Firestore:`, err);
        errors++;
      }
    }

    if (syncedCount > 0 && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('gampil_offline_sync_completed', {
          detail: { count: syncedCount, remaining: errors },
        })
      );
    }
  } catch (err) {
    console.error('[OfflineSync] Error saat proses sinkronisasi:', err);
  } finally {
    isSyncing = false;
  }

  return { syncedCount, errors };
}

/**
 * Daftarkan Service Worker sederhana untuk PWA dan Caching
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Service Worker terdaftar dengan scope:', registration.scope);

        // Minta Background Sync jika didukung browser
        if ('sync' in registration) {
          try {
            // @ts-expect-error SyncManager standard API
            registration.sync.register('sync-surveys').catch(() => {});
          } catch {
            // Ignore if background sync not permitted
          }
        }
      })
      .catch((error) => {
        console.warn('[SW] Pendaftaran Service Worker gagal (abaikan jika di lingkungan preview):', error);
      });

    // Dengarkan pesan dari service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'TRIGGER_OFFLINE_SYNC') {
        syncOfflineSurveysToFirestore();
      }
    });
  });
}

/**
 * Pasang listener otomatis ketika koneksi kembali online serta interval berkala
 */
export function setupAutoSyncListener(
  onSyncComplete?: (count: number) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = async () => {
    console.log('[Network] Koneksi internet terdeteksi. Menjalankan auto-sync ke Firestore...');
    const result = await syncOfflineSurveysToFirestore();
    if (result.syncedCount > 0 && onSyncComplete) {
      onSyncComplete(result.syncedCount);
    }
  };

  const handleCustomSyncEvent = (e: Event) => {
    const detail = (e as CustomEvent).detail;
    if (detail && detail.count > 0 && onSyncComplete) {
      onSyncComplete(detail.count);
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('gampil_offline_sync_completed', handleCustomSyncEvent);

  // Jalankan cek sinkronisasi awal setelah aplikasi dimuat jika online
  if (navigator.onLine) {
    setTimeout(() => {
      syncOfflineSurveysToFirestore().then((res) => {
        if (res.syncedCount > 0 && onSyncComplete) {
          onSyncComplete(res.syncedCount);
        }
      });
    }, 1500);
  }

  // Sinkronisasi berkala setiap 10 detik saat online jika terdapat data pending di IndexedDB
  const periodicSyncInterval = setInterval(async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      const pendingCount = await getPendingOfflineCount();
      if (pendingCount > 0) {
        const res = await syncOfflineSurveysToFirestore();
        if (res.syncedCount > 0 && onSyncComplete) {
          onSyncComplete(res.syncedCount);
        }
      }
    }
  }, 10000);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('gampil_offline_sync_completed', handleCustomSyncEvent);
    clearInterval(periodicSyncInterval);
  };
}
