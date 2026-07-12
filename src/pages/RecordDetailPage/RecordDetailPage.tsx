import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMood } from '../../store/MoodContext';
import './RecordDetailPage.css';

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useMood();

  const record = useMemo(() => {
    return state.records.find((r) => r.id === id);
  }, [state.records, id]);

  const emotionIconMap: Record<string, string> = {
    positive: '\u{1F60A}',
    negative: '\u{1F61F}',
    neutral: '\u{1F610}',
  };

  const formatDetailDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    return `${parseInt(y)}年${parseInt(m)}月${parseInt(d)}日 星期${weekdays[date.getDay()]}`;
  };

  if (!record) {
    return (
      <div className="detailPage">
        <div className="notFound">
          <div className="notFoundIcon">{'\u{1F50D}'}</div>
          <p className="notFoundText">找不到这条记录</p>
          <Link to="/" className="notFoundBtn">
            {'<'} 返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detailPage">
      <button className="backBtn" onClick={() => navigate(-1)}>
        <span className="backArrow">{'<'}</span>
        <span>返回</span>
      </button>

      {/* 日期时间 */}
      <div className="detailDateTime">
        <p className="detailDate">{formatDetailDate(record.date)}</p>
        <p className="detailTimeText">{record.time}</p>
      </div>

      {/* 情绪标签 */}
      <div className="detailEmotion">
        <span className={`detailEmotionTag ${record.emotion}`}>
          <span className="detailEmotionIcon">
            {emotionIconMap[record.emotion]}
          </span>
          {record.emotionLabel}
        </span>
      </div>

      {/* 转写文字 */}
      <div className="detailTextCard">
        <p className="detailTextTitle">日记内容</p>
        <p className="detailTextContent">{record.text}</p>
      </div>

      {/* 关键词 */}
      <div className="detailKeywordsCard">
        <p className="detailKeywordsTitle">识别到的关键词</p>
        {record.keywords.length > 0 ? (
          <div className="keywordList">
            {record.keywords.map((keyword, idx) => (
              <span key={idx} className="keywordItem">
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <p className="emptyKeywords">未识别到关键词</p>
        )}
      </div>
    </div>
  );
}
