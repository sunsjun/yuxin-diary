export type EmotionType = 'positive' | 'negative' | 'neutral';

export interface MoodRecord {
  id: string;
  date: string;          // "2026-07-03"
  time: string;          // "14:30"
  text: string;          // 语音转写文字
  emotion: EmotionType;
  emotionLabel: string;  // "开心" | "焦虑" | "平静" 等
  keywords: string[];     // 识别到的关键词
  createdAt: number;      // timestamp
}
