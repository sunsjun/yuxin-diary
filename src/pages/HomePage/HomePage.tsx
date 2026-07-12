import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useMood } from '../../store/MoodContext';
import { useVoiceRecord } from '../../hooks/useVoiceRecord';
import { analyzeEmotion } from '../../engine/emotionEngine';
import { formatDate, formatTime, generateId } from '../../utils/date';
import { MoodRecord } from '../../types';
import './HomePage.css';

export default function HomePage() {
  const { state, addRecord, getRecordsByDate } = useMood();
  const {
    isRecording,
    isSupported,
    interimText,
    startRecording,
    stopRecording,
    finalText,
    setFinalText,
    error,
  } = useVoiceRecord();

  const [lastResult, setLastResult] = useState<{
    text: string;
    emotion: MoodRecord['emotion'];
    emotionLabel: string;
  } | null>(null);
  const [manualText, setManualText] = useState('');

  const today = formatDate(new Date());
  const todayRecords = getRecordsByDate(today);

  // 情绪统计
  const emotionCounts = useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    todayRecords.forEach((r) => {
      counts[r.emotion]++;
    });
    return counts;
  }, [todayRecords]);

  // 最近3条
  const recentRecords = useMemo(() => {
    return state.records.slice(0, 3);
  }, [state.records]);

  // 录音完成后的处理
  const handleRecordingComplete = useCallback(() => {
    if (finalText.trim()) {
      const result = analyzeEmotion(finalText.trim());
      const record: MoodRecord = {
        id: generateId(),
        date: today,
        time: formatTime(new Date()),
        text: finalText.trim(),
        emotion: result.emotion,
        emotionLabel: result.emotionLabel,
        keywords: result.keywords,
        createdAt: Date.now(),
      };
      addRecord(record);
      setLastResult({
        text: finalText.trim(),
        emotion: result.emotion,
        emotionLabel: result.emotionLabel,
      });
      setFinalText('');
      // 3秒后清除结果展示
      setTimeout(() => setLastResult(null), 8000);
    }
  }, [finalText, today, addRecord, setFinalText]);

  // 按下录音
  const handlePointerDown = useCallback(() => {
    setLastResult(null);
    startRecording();
  }, [startRecording]);

  // 松开停止录音
  const handlePointerUp = useCallback(() => {
    stopRecording();
    // 延迟处理，等待 finalText 更新
    setTimeout(() => {
      // 使用 ref 或者重新检查 finalText
    }, 300);
  }, [stopRecording]);

  // 监听录音结束
  React.useEffect(() => {
    if (!isRecording && finalText.trim() && !error) {
      handleRecordingComplete();
    }
  }, [isRecording, finalText, error, handleRecordingComplete]);

  // 手动发送
  const handleManualSend = useCallback(() => {
    if (!manualText.trim()) return;
    const result = analyzeEmotion(manualText.trim());
    const record: MoodRecord = {
      id: generateId(),
      date: today,
      time: formatTime(new Date()),
      text: manualText.trim(),
      emotion: result.emotion,
      emotionLabel: result.emotionLabel,
      keywords: result.keywords,
      createdAt: Date.now(),
    };
    addRecord(record);
    setLastResult({
      text: manualText.trim(),
      emotion: result.emotion,
      emotionLabel: result.emotionLabel,
    });
    setManualText('');
    setTimeout(() => setLastResult(null), 8000);
  }, [manualText, today, addRecord]);

  const handleManualKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleManualSend();
      }
    },
    [handleManualSend]
  );

  // 格式化今天日期显示
  const todayDisplay = useMemo(() => {
    const d = new Date();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${weekdays[d.getDay()]}`;
  }, []);

  const emotionIconMap: Record<string, string> = {
    positive: '\u{1F60A}',
    negative: '\u{1F61F}',
    neutral: '\u{1F610}',
  };

  return (
    <div className="homePage">
      {/* 顶部标题 */}
      <header className="header">
        <h1 className="title">语心日记</h1>
        <p className="todayDate">{todayDisplay}</p>
      </header>

      {/* 录音区域 */}
      <section className="recordSection">
        {isSupported ? (
          <>
            <button
              className={`recordBtn${isRecording ? ' recording' : ''}`}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => {
                if (isRecording) {
                  stopRecording();
                }
              }}
              aria-label={isRecording ? '停止录音' : '开始录音'}
            >
              {isRecording ? '\u{23F9}\u{FE0F}' : '\u{1F3A4}'}
            </button>
            {isRecording && (
              <>
                <p className="recordHint recording">正在录音，松开结束...</p>
                <div className="waveform">
                  <div className="waveformBar" />
                  <div className="waveformBar" />
                  <div className="waveformBar" />
                  <div className="waveformBar" />
                  <div className="waveformBar" />
                </div>
              </>
            )}
            {!isRecording && !lastResult && (
              <p className="recordHint">按住麦克风，说出今天的心情</p>
            )}
            {interimText && (
              <p className="interimText">{interimText}</p>
            )}
          </>
        ) : null}
        {error && <p className="errorMessage">{error}</p>}
      </section>

      {/* 录音结果展示 */}
      {lastResult && (
        <div className="resultCard">
          <p className="resultText">"{lastResult.text}"</p>
          <span className={`emotionTag ${lastResult.emotion}`}>
            {emotionIconMap[lastResult.emotion]} {lastResult.emotionLabel}
          </span>
        </div>
      )}

      {/* 手动输入 fallback */}
      <div className="manualInput">
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          onKeyDown={handleManualKeyDown}
          placeholder="也可以手动输入今天的心情..."
          maxLength={500}
        />
        <button
          className="sendBtn"
          onClick={handleManualSend}
          disabled={!manualText.trim()}
        >
          发送
        </button>
      </div>

      {/* 今日情绪概览 */}
      <section className="todayOverview">
        <h2 className="sectionTitle">今日情绪概览</h2>
        {todayRecords.length > 0 ? (
          <div className="emotionSummary">
            <div className="summaryItem">
              <div className="summaryDot positive" />
              <span className="summaryCount">{emotionCounts.positive}</span>
              <span className="summaryLabel">积极</span>
            </div>
            <div className="summaryItem">
              <div className="summaryDot negative" />
              <span className="summaryCount">{emotionCounts.negative}</span>
              <span className="summaryLabel">消极</span>
            </div>
            <div className="summaryItem">
              <div className="summaryDot neutral" />
              <span className="summaryCount">{emotionCounts.neutral}</span>
              <span className="summaryLabel">平静</span>
            </div>
          </div>
        ) : (
          <div className="emptyOverview">今天还没有记录，说点什么吧~</div>
        )}
      </section>

      {/* 最近记录 */}
      <section className="recentRecords">
        <h2 className="sectionTitle">最近记录</h2>
        {recentRecords.length > 0 ? (
          recentRecords.map((record) => (
            <Link
              key={record.id}
              to={`/record/${record.id}`}
              className="recordCard"
            >
              <div className={`recordEmotionDot ${record.emotion}`} />
              <div className="recordInfo">
                <p className="recordTime">
                  {record.date} {record.time}
                </p>
                <p className="recordText">
                  {record.text.length > 50
                    ? record.text.slice(0, 50) + '...'
                    : record.text}
                </p>
                <span className={`recordTagSmall ${record.emotion}`}>
                  {record.emotionLabel}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="emptyRecords">还没有记录，开始记录你的心情吧~</div>
        )}
      </section>
    </div>
  );
}
