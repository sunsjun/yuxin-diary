import { MoodRecord } from '../types';

const STORAGE_KEY = 'yuxin-diary-records';

export function getRecords(): MoodRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: MoodRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(record: MoodRecord): void {
  const records = getRecords();
  records.unshift(record);
  saveRecords(records);
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter(r => r.id !== id);
  saveRecords(records);
}

export function getRecordsByDate(date: string): MoodRecord[] {
  return getRecords().filter(r => r.date === date);
}

export function clearAllRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportRecords(): string {
  return JSON.stringify(getRecords(), null, 2);
}
