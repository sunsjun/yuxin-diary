import { useState, useRef, useCallback } from 'react';

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
  // 用 ref 跟踪当前文本，解决 onend 闭包问题
  const finalTextRef = useRef('');
  const interimTextRef = useRef('');

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
    finalTextRef.current = '';
    interimTextRef.current = '';

    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        // Web Speech API 中 transcript 在 result[0].transcript
        const transcript = result[0]?.transcript || '';
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) {
        interimTextRef.current = interim;
        setInterimText(interim);
      }
      if (final) {
        finalTextRef.current = final;
        setFinalText(final);
        setInterimText('');
        interimTextRef.current = '';
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setError('没有检测到语音，请再试一次');
      } else if (event.error === 'not-allowed') {
        setError('请允许麦克风权限后重试');
      } else if (event.error === 'aborted') {
        // 用户主动停止，不是错误，忽略
      } else {
        setError(`语音识别出错：${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      // 如果没有 final 结果但有 interim 结果，用 interim 兜底
      if (!finalTextRef.current && interimTextRef.current) {
        finalTextRef.current = interimTextRef.current;
        setFinalText(interimTextRef.current);
        setInterimText('');
        interimTextRef.current = '';
      }
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
