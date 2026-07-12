import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useMood } from '../../store/MoodContext';
import { WEEKDAYS, getDaysInMonth, getFirstDayOfMonth } from '../../utils/date';
import './CalendarPage.css';

export default function CalendarPage() {
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { getRecordsByDate, getEmotionMap } = useMood();

  const todayStr = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const emotionMap = useMemo(
    () => getEmotionMap(currentYear, currentMonth),
    [currentYear, currentMonth, getEmotionMap]
  );

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const selectedRecords = useMemo(() => {
    if (!selectedDate) return [];
    return getRecordsByDate(selectedDate);
  }, [selectedDate, getRecordsByDate]);

  // 切换月份
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  // 生成日历格子
  const calendarCells = useMemo(() => {
    const cells: { day: number; empty: boolean; dateStr: string }[] = [];
    // 填充前面的空格
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: 0, empty: true, dateStr: '' });
    }
    // 日期
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({ day: d, empty: false, dateStr });
    }
    return cells;
  }, [daysInMonth, firstDay, currentYear, currentMonth]);

  const formatSelectedDateDisplay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${y}年${parseInt(m)}月${parseInt(d)}日`;
  };

  return (
    <div className="calendarPage">
      {/* 月份切换 */}
      <div className="monthNav">
        <button className="monthBtn" onClick={handlePrevMonth}>
          {'<'}
        </button>
        <span className="monthLabel">
          {currentYear}年{currentMonth + 1}月
        </span>
        <button className="monthBtn" onClick={handleNextMonth}>
          {'>'}
        </button>
      </div>

      {/* 日历网格 */}
      <div className="calendarGrid">
        <div className="weekdayHeader">
          {WEEKDAYS.map((day) => (
            <div key={day} className="weekdayCell">
              {day}
            </div>
          ))}
        </div>
        <div className="daysGrid">
          {calendarCells.map((cell, idx) => (
            <div
              key={idx}
              className={`dayCell${cell.empty ? ' empty' : ''}${
                !cell.empty && cell.dateStr === todayStr ? ' today' : ''
              }${
                !cell.empty && cell.dateStr === selectedDate
                  ? ' selected'
                  : ''
              }`}
              onClick={() => {
                if (!cell.empty) {
                  setSelectedDate(
                    cell.dateStr === selectedDate ? null : cell.dateStr
                  );
                }
              }}
            >
              <span className="dayNumber">{cell.day}</span>
              {!cell.empty && (
                <div
                  className={`emotionDot ${
                    emotionMap[cell.day] || 'empty'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* 图例 */}
        <div className="legend">
          <div className="legendItem">
            <div className="legendDot positive" />
            <span>积极</span>
          </div>
          <div className="legendItem">
            <div className="legendDot negative" />
            <span>消极</span>
          </div>
          <div className="legendItem">
            <div className="legendDot neutral" />
            <span>平静</span>
          </div>
        </div>
      </div>

      {/* 当天记录列表 */}
      {selectedDate && (
        <div className="dayRecords">
          <h3 className="dayRecordsTitle">
            {formatSelectedDateDisplay(selectedDate)}的记录
          </h3>
          {selectedRecords.length > 0 ? (
            selectedRecords.map((record) => (
              <Link
                key={record.id}
                to={`/record/${record.id}`}
                className="dayRecordCard"
              >
                <div className={`dayRecordDot ${record.emotion}`} />
                <div className="dayRecordInfo">
                  <p className="dayRecordTime">{record.time}</p>
                  <p className="dayRecordText">
                    {record.text.length > 50
                      ? record.text.slice(0, 50) + '...'
                      : record.text}
                  </p>
                  <span className={`dayRecordTag ${record.emotion}`}>
                    {record.emotionLabel}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="noRecords">这一天还没有记录</div>
          )}
        </div>
      )}
    </div>
  );
}
