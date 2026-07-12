import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMood } from '../../store/MoodContext';
import { MoodRecord } from '../../types';
import './HistoryPage.css';

export default function HistoryPage() {
  const { state, deleteRecord } = useMood();
  const [deleteTarget, setDeleteTarget] = useState<MoodRecord | null>(null);

  // 按日期分组，倒序
  const groupedRecords = useMemo(() => {
    const groups: Record<string, MoodRecord[]> = {};
    const sorted = [...state.records].sort(
      (a, b) => b.createdAt - a.createdAt
    );
    sorted.forEach((record) => {
      if (!groups[record.date]) {
        groups[record.date] = [];
      }
      groups[record.date].push(record);
    });
    // 按日期倒序排列分组
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      records: groups[date],
    }));
  }, [state.records]);

  // 长按处理
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTouchStart = useCallback(
    (record: MoodRecord) => {
      longPressTimerRef.current = setTimeout(() => {
        setDeleteTarget(record);
      }, 600);
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (deleteTarget) {
      deleteRecord(deleteTarget.id);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteRecord]);

  const formatDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${parseInt(m)}月${parseInt(d)}日 星期${weekdays[date.getDay()]}`;
  };

  return (
    <div className="historyPage">
      <h1 className="pageTitle">历史记录</h1>

      {groupedRecords.length > 0 ? (
        <>
          {groupedRecords.map(({ date, records }) => (
            <div key={date} className="dateGroup">
              <h3 className="dateGroupHeader">{formatDateDisplay(date)}</h3>
              {records.map((record) => (
                <div
                  key={record.id}
                  className="recordCard"
                  onTouchStart={() => handleTouchStart(record)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setDeleteTarget(record);
                  }}
                >
                  <Link
                    to={`/record/${record.id}`}
                    className="recordCardInner"
                  >
                    <div className={`recordEmotionBar ${record.emotion}`} />
                    <div className="recordContent">
                      <div className="recordMeta">
                        <span className="recordTime">{record.time}</span>
                        <span
                          className={`recordEmotionTag ${record.emotion}`}
                        >
                          {record.emotionLabel}
                        </span>
                      </div>
                      <p className="recordText">
                        {record.text.length > 50
                          ? record.text.slice(0, 50) + '...'
                          : record.text}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ))}
          <p className="swipeHint">长按记录可删除</p>
        </>
      ) : (
        <div className="emptyState">
          <div className="emptyIcon">{'\u{1F4D6}'}</div>
          <p className="emptyText">还没有记录，去首页开始记录吧~</p>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {deleteTarget && (
        <div
          className="deleteModal"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="deleteModalContent"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="deleteModalTitle">删除记录</p>
            <p className="deleteModalText">
              确定要删除这条记录吗？删除后无法恢复。
            </p>
            <div className="deleteModalActions">
              <button
                className="deleteModalBtn cancelBtn"
                onClick={() => setDeleteTarget(null)}
              >
                取消
              </button>
              <button
                className="deleteModalBtn confirmDeleteBtn"
                onClick={handleDelete}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
