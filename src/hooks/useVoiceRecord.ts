import { useState, useRef, useCallback } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

interface UseVoiceRecordReturn {
  isRecording: boolean;
  isSupported: boolean;
  interimText: string;
  startRecording: () => void;
  stopRecording: () => void;
  finalText: string;
  setFinalText: (text: string) => void;
  error: string | null;
}

export function useVoiceRecord(): UseVoiceRecordReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const isSupported = !!SpeechRecognition;

  const startRecording = useCallback(() => {
    if (!SpeechRecognition) {
      setError('您的浏览器不支持语音识别，请使用 Chrome 浏览器');
      return;
    }

    setError(null);
    setInterimText('');
    setFinalText('');

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result: SpeechRecognitionResult = event.results[i];
        if (result.isFinal) {
          final += result.transcript;
        } else {
          interim += result.transcript;
        }
      }
      setInterimText(interim);
      if (final) {
        setFinalText(final);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setError('没有检测到语音，请再试一次');
      } else if (event.error === 'not-allowed') {
        setError('请允许麦克风权限后重试');
      } else {
        setError(`语音识别出错：${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [SpeechRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, [isRecording]);

  return {
    isRecording,
    isSupported,
    interimText,
    startRecording,
    stopRecording,
    finalText,
    setFinalText,
    error,
  };
}
