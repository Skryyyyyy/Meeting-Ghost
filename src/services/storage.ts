import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MeetingData } from '../types/meeting';
import { encryptData, decryptData } from './crypto';

interface StoredMeetingRecord {
  id: string;
  createdAt: number;
  encryptedPayload: string; // Encrypted JSON string of MeetingData
}

interface MeetingDB extends DBSchema {
  meetings: {
    key: string;
    value: StoredMeetingRecord;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'meeting-ghost-db';
const DB_VERSION = 2; // Incremented for encryption support

let dbPromise: Promise<IDBPDatabase<MeetingDB>> | null = null;
let currentVaultPassphrase: string = typeof sessionStorage !== 'undefined' 
  ? (sessionStorage.getItem('ghost_vault_key') || 'GhostDefaultVaultKey2026!')
  : 'GhostDefaultVaultKey2026!';

export function setVaultPassphrase(pass: string): void {
  currentVaultPassphrase = pass;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('ghost_vault_key', pass);
  }
}

export function getVaultPassphrase(): string {
  return currentVaultPassphrase;
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
  const db = await getDB();
  const serialized = JSON.stringify(meeting);
  const encryptedPayload = await encryptData(serialized, currentVaultPassphrase);

  const record: StoredMeetingRecord = {
    id: meeting.id,
    createdAt: meeting.createdAt,
    encryptedPayload,
  };

  await db.put('meetings', record);
}

export async function getMeetings(): Promise<MeetingData[]> {
  const db = await getDB();
  const allRecords = await db.getAllFromIndex('meetings', 'by-date');
  
  const decryptedMeetings: MeetingData[] = [];
  for (const record of allRecords) {
    try {
      const decryptedJson = await decryptData(record.encryptedPayload, currentVaultPassphrase);
      const meeting: MeetingData = JSON.parse(decryptedJson);
      decryptedMeetings.push(meeting);
    } catch (err) {
      console.warn(`Could not decrypt meeting ${record.id}:`, err);
    }
  }

  return decryptedMeetings.reverse(); // Return newest first
}

export async function getMeetingById(id: string): Promise<MeetingData | undefined> {
  const db = await getDB();
  const record = await db.get('meetings', id);
  if (!record) return undefined;

  try {
    const decryptedJson = await decryptData(record.encryptedPayload, currentVaultPassphrase);
    return JSON.parse(decryptedJson) as MeetingData;
  } catch (err) {
    console.error(`Decryption failed for meeting ${id}:`, err);
    return undefined;
  }
}

export async function deleteMeeting(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('meetings', id);
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
