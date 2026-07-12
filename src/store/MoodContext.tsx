import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { MoodRecord, EmotionType } from '../types';
import { getRecords, saveRecords, addRecord as storageAddRecord, deleteRecord as storageDeleteRecord } from '../utils/storage';

interface MoodState {
  records: MoodRecord[];
  loading: boolean;
}

type MoodAction =
  | { type: 'SET_RECORDS'; payload: MoodRecord[] }
  | { type: 'ADD_RECORD'; payload: MoodRecord }
  | { type: 'DELETE_RECORD'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean };

function moodReducer(state: MoodState, action: MoodAction): MoodState {
  switch (action.type) {
    case 'SET_RECORDS':
      return { ...state, records: action.payload, loading: false };
    case 'ADD_RECORD':
      return { ...state, records: [action.payload, ...state.records] };
    case 'DELETE_RECORD':
      return { ...state, records: state.records.filter(r => r.id !== action.payload) };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

interface MoodContextType {
  state: MoodState;
  addRecord: (record: MoodRecord) => void;
  deleteRecord: (id: string) => void;
  getRecordsByDate: (date: string) => MoodRecord[];
  getEmotionMap: (year: number, month: number) => Record<number, EmotionType>;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(moodReducer, {
    records: [],
    loading: true,
  });

  useEffect(() => {
    const records = getRecords();
    dispatch({ type: 'SET_RECORDS', payload: records });
  }, []);

  const addRecord = (record: MoodRecord) => {
    storageAddRecord(record);
    dispatch({ type: 'ADD_RECORD', payload: record });
  };

  const deleteRecord = (id: string) => {
    storageDeleteRecord(id);
    dispatch({ type: 'DELETE_RECORD', payload: id });
  };

  const getRecordsByDate = (date: string) => {
    return state.records.filter(r => r.date === date);
  };

  const getEmotionMap = (year: number, month: number) => {
    const map: Record<number, EmotionType> = {};
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    state.records.forEach(r => {
      if (r.date.startsWith(prefix)) {
        const day = parseInt(r.date.split('-')[2]);
        map[day] = r.emotion;
      }
    });
    return map;
  };

  return (
    <MoodContext.Provider value={{ state, addRecord, deleteRecord, getRecordsByDate, getEmotionMap }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
}
