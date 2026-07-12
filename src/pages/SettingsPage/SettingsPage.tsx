import React, { useState, useMemo, useCallback } from 'react';
import { useMood } from '../../store/MoodContext';
import { clearAllRecords, exportRecords } from '../../utils/storage';
import './SettingsPage.css';

export default function SettingsPage() {
  const { state } = useMood();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const totalRecords = state.records.length;

  // 本周记录数
  const weekRecords = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // 周日=7
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
    startOfWeek.setHours(0, 0, 0, 0);

    const startTs = startOfWeek.getTime();
    return state.records.filter((r) => r.createdAt >= startTs).length;
  }, [state.records]);

  // 清除全部数据
  const handleClearAll = useCallback(() => {
    clearAllRecords();
    setShowClearConfirm(false);
    setToast({ message: '所有数据已清除', type: 'success' });
    // 刷新页面以重置状态
    setTimeout(() => window.location.reload(), 1000);
  }, []);

  // 导出数据
  const handleExport = useCallback(() => {
    try {
      const data = exportRecords();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `语心日记_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ message: '导出成功', type: 'success' });
    } catch {
      setToast({ message: '导出失败', type: 'error' });
    }
  }, []);

  // 自动关闭 toast
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="settingsPage">
      <h1 className="pageTitle">设置</h1>

      {/* 统计信息 */}
      <div className="statsCard">
        <p className="statsTitle">统计信息</p>
        <div className="statsGrid">
          <div className="statItem">
            <span className="statNumber">{totalRecords}</span>
            <span className="statLabel">总记录数</span>
          </div>
          <div className="statItem">
            <span className="statNumber">{weekRecords}</span>
            <span className="statLabel">本周记录</span>
          </div>
        </div>
      </div>

      {/* 操作列表 */}
      <div className="actionList">
        <button className="actionItem" onClick={handleExport}>
          <span className="actionIcon">{'\u{1F4E5}'}</span>
          <span className="actionLabel">导出数据</span>
          <span className="actionArrow">{'>'}</span>
        </button>
        <button
          className="actionItem danger"
          onClick={() => setShowClearConfirm(true)}
        >
          <span className="actionIcon">{'\u{1F5D1}\u{FE0F}'}</span>
          <span className="actionLabel">清除全部数据</span>
          <span className="actionArrow">{'>'}</span>
        </button>
      </div>

      {/* 关于信息 */}
      <div className="aboutCard">
        <p className="aboutAppName">语心日记</p>
        <p className="aboutVersion">v1.0.0</p>
        <p className="aboutDesc">
          用语音记录你的每一天心情，AI智能识别你的情绪变化。
          <br />
          温暖陪伴，倾听你的心声。
        </p>
      </div>

      {/* 清除确认弹窗 */}
      {showClearConfirm && (
        <div
          className="confirmModal"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="confirmContent"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="confirmTitle">清除全部数据</p>
            <p className="confirmText">
              确定要清除所有日记记录吗？此操作无法撤销。
            </p>
            <div className="confirmActions">
              <button
                className="confirmBtn cancelBtn"
                onClick={() => setShowClearConfirm(false)}
              >
                取消
              </button>
              <button
                className="confirmBtn dangerBtn"
                onClick={handleClearAll}
              >
                确定清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示 */}
      {toast && (
        <div className={`toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
