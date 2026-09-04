import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MeetingData } from '../types/meeting';
import { encryptData, decryptData, setActiveCryptoKey, clearActiveCryptoKey, deriveKeyFromPassphrase } from './crypto';
import { db, auth, doc, setDoc, getDocs, deleteDoc, collection } from './firebase';

interface StoredMeetingRecord {
  id: string;
  createdAt: number;
  encryptedPayload: string; // AES-GCM Encrypted JSON string of MeetingData
}

interface MeetingDB extends DBSchema {
  meetings: {
    key: string;
    value: StoredMeetingRecord;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'meeting-ghost-db';
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<MeetingDB>> | null = null;

export async function setVaultPassphrase(pass: string): Promise<void> {
  const salt = new Uint8Array(16); // Standard derivation salt
  const key = await deriveKeyFromPassphrase(pass, salt);
  setActiveCryptoKey(key);
}

export function clearVaultSession(): void {
  clearActiveCryptoKey();
}

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MeetingDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (db.objectStoreNames.contains('meetings')) {
          db.deleteObjectStore('meetings');
        }
        const store = db.createObjectStore('meetings', { keyPath: 'id' });
        store.createIndex('by-date', 'createdAt');
      },
    });
  }
  return dbPromise;
}

export async function saveMeeting(meeting: MeetingData): Promise<void> {
  const localDb = await getDB();
  const serialized = JSON.stringify(meeting);
  const encryptedPayload = await encryptData(serialized);

  const record: StoredMeetingRecord = {
    id: meeting.id,
    createdAt: meeting.createdAt,
    encryptedPayload,
  };

  // 1. Save to local encrypted IndexedDB
  await localDb.put('meetings', record);

  // 2. Synchronize to Firestore Backend Vault (Zero-Knowledge: ciphertext only)
  try {
    const currentUser = auth?.currentUser;
    if (currentUser && db) {
      const userMeetingRef = doc(db, 'users', currentUser.uid, 'meetings', meeting.id);
      await setDoc(userMeetingRef, {
        id: meeting.id,
        createdAt: meeting.createdAt,
        encryptedPayload,
        updatedAt: Date.now(),
      });
    }
  } catch (err) {
    console.warn('Backend sync deferred (offline or permission required):', err);
  }
}

export async function getMeetings(): Promise<MeetingData[]> {
  const localDb = await getDB();
  const allRecords = await localDb.getAllFromIndex('meetings', 'by-date');
  
  const decryptedMeetings: MeetingData[] = [];
  for (const record of allRecords) {
    try {
      const decryptedJson = await decryptData(record.encryptedPayload);
      const meeting: MeetingData = JSON.parse(decryptedJson);
      decryptedMeetings.push(meeting);
    } catch (err) {
      console.warn(`Could not decrypt meeting ${record.id}:`, err);
    }
  }

  return decryptedMeetings.reverse(); // Return newest first
}

export async function getMeetingById(id: string): Promise<MeetingData | undefined> {
  const localDb = await getDB();
  const record = await localDb.get('meetings', id);
  if (!record) return undefined;

  try {
    const decryptedJson = await decryptData(record.encryptedPayload);
    return JSON.parse(decryptedJson) as MeetingData;
  } catch (err) {
    console.error(`Decryption failed for meeting ${id}:`, err);
    return undefined;
  }
}

export async function deleteMeeting(id: string): Promise<void> {
  const localDb = await getDB();
  await localDb.delete('meetings', id);

  // Synchronize deletion to Firestore
  try {
    const currentUser = auth?.currentUser;
    if (currentUser && db) {
      const userMeetingRef = doc(db, 'users', currentUser.uid, 'meetings', id);
      await deleteDoc(userMeetingRef);
    }
  } catch (err) {
    console.warn('Backend deletion deferred:', err);
  }
}

export async function updateActionItemStatus(
  meetingId: string,
  actionId: string,
  completed: boolean
): Promise<void> {
  const meeting = await getMeetingById(meetingId);
  if (!meeting) return;

  meeting.actionItems = meeting.actionItems.map(item =>
    item.id === actionId ? { ...item, completed } : item
  );

  await saveMeeting(meeting);
}

export async function updateMeeting(meeting: MeetingData): Promise<void> {
  await saveMeeting(meeting);
}

/**
 * Cloud Sync: Pull remote encrypted backups from Firestore into local vault
 */
export async function syncFromBackendCloud(): Promise<number> {
  const currentUser = auth?.currentUser;
  if (!currentUser || !db) return 0;

  try {
    const meetingsCol = collection(db, 'users', currentUser.uid, 'meetings');
    const snapshot = await getDocs(meetingsCol);
    const localDb = await getDB();
    let imported = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as StoredMeetingRecord;
      if (data && data.encryptedPayload) {
        await localDb.put('meetings', data);
        imported++;
      }
    }
    return imported;
  } catch (err) {
    console.warn('Backend sync from cloud error:', err);
    return 0;
  }
}

export async function clearAllMeetings(): Promise<void> {
  const localDb = await getDB();
  await localDb.clear('meetings');
}

export const getAllMeetings = getMeetings;

export async function getStorageQuotaInfo(): Promise<{ usageMB: number; quotaMB: number; percent: number }> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usageMB = Math.round((estimate.usage || 0) / (1024 * 1024));
      const quotaMB = Math.round((estimate.quota || 0) / (1024 * 1024));
      const percent = quotaMB > 0 ? Math.min(100, Math.round((usageMB / quotaMB) * 100)) : 0;
      return { usageMB, quotaMB, percent };
    } catch {
      return { usageMB: 0, quotaMB: 0, percent: 0 };
    }
  }
  return { usageMB: 0, quotaMB: 0, percent: 0 };
}
