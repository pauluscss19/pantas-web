import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EvaluationResult } from '../types';

interface PantasDB extends DBSchema {
  checkups: {
    key: string;
    value: EvaluationResult;
    indexes: { 'by-date': string; 'by-type': string };
  };
}

const DB_NAME = 'pantas_local_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PantasDB>> | null = null;

function getDb(): Promise<IDBPDatabase<PantasDB>> | null {
  if (typeof window === 'undefined') return null;

  if (!dbPromise) {
    dbPromise = openDB<PantasDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('checkups')) {
          const store = db.createObjectStore('checkups', { keyPath: 'id' });
          store.createIndex('by-date', 'createdAt');
          store.createIndex('by-type', 'checkupType');
        }
      },
    });
  }
  return dbPromise;
}

// LocalStorage fallback for environments without IndexedDB support
const FALLBACK_KEY = 'pantas_local_checkups';

function getFallbackStorage(): EvaluationResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setFallbackStorage(items: EvaluationResult[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(items));
  } catch (e) {}
}

export async function saveLocalCheckup(checkup: EvaluationResult): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      const activeDb = await db;
      await activeDb.put('checkups', checkup);
      return;
    } catch (e) {
      console.warn('IndexedDB write failed, falling back to localStorage:', e);
    }
  }

  const items = getFallbackStorage();
  const existingIdx = items.findIndex((i) => i.id === checkup.id);
  if (existingIdx >= 0) {
    items[existingIdx] = checkup;
  } else {
    items.unshift(checkup);
  }
  setFallbackStorage(items);
}

export async function getLocalCheckups(): Promise<EvaluationResult[]> {
  const db = getDb();
  if (db) {
    try {
      const activeDb = await db;
      const all = await activeDb.getAllFromIndex('checkups', 'by-date');
      return all.reverse(); // Newest first
    } catch (e) {
      console.warn('IndexedDB read failed, falling back to localStorage:', e);
    }
  }

  const items = getFallbackStorage();
  return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getLocalCheckupById(id: string): Promise<EvaluationResult | null> {
  const db = getDb();
  if (db) {
    try {
      const activeDb = await db;
      const item = await activeDb.get('checkups', id);
      return item || null;
    } catch (e) {
      console.warn('IndexedDB get failed:', e);
    }
  }

  const items = getFallbackStorage();
  return items.find((i) => i.id === id) || null;
}

export async function deleteLocalCheckup(id: string): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      const activeDb = await db;
      await activeDb.delete('checkups', id);
      return;
    } catch (e) {
      console.warn('IndexedDB delete failed:', e);
    }
  }

  const items = getFallbackStorage().filter((i) => i.id !== id);
  setFallbackStorage(items);
}

export async function clearAllLocalCheckups(): Promise<void> {
  const db = getDb();
  if (db) {
    try {
      const activeDb = await db;
      await activeDb.clear('checkups');
      return;
    } catch (e) {
      console.warn('IndexedDB clear failed:', e);
    }
  }

  setFallbackStorage([]);
}

