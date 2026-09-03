import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MeetingData } from '../types/meeting';

interface MeetingDB extends DBSchema {
  meetings: {
    key: string;
    value: MeetingData;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'meeting-ghost-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MeetingDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MeetingDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('meetings')) {
          const store = db.createObjectStore('meetings', { keyPath: 'id' });
          store.createIndex('by-date', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveMeeting(meeting: MeetingData): Promise<void> {
  const db = await getDB();
  await db.put('meetings', meeting);
}

export async function getMeetings(): Promise<MeetingData[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('meetings', 'by-date');
  return all.reverse(); // Return newest first
}

export async function getMeetingById(id: string): Promise<MeetingData | undefined> {
  const db = await getDB();
  return db.get('meetings', id);
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
  const db = await getDB();
  const meeting = await db.get('meetings', meetingId);
  if (!meeting) return;
  
  meeting.actionItems = meeting.actionItems.map(item =>
    item.id === actionId ? { ...item, completed } : item
  );
  await db.put('meetings', meeting);
}

export async function updateMeeting(meeting: MeetingData): Promise<void> {
  const db = await getDB();
  await db.put('meetings', meeting);
}
