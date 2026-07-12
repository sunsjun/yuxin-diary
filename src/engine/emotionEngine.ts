import { EmotionType } from '../types';

interface EmotionKeywords {
  labels: Record<string, string[]>;
}

const emotionKeywords: Record<EmotionType, EmotionKeywords> = {
  positive: {
    labels: {
      '开心': ['开心', '高兴', '快乐', '棒', '太好了', '赞', '兴奋', '期待', '满意', '幸福', '哈哈', '笑', '幸运', '感恩', '充实', '舒服', '美好', '惊喜', '收获', '成功', '毕业', '通过', '上岸', '达成'],
      '满足': ['满足', '不错', '还好', '可以', '挺好的', '安心', '放松', '自在', '惬意'],
      '感动': ['感动', '温暖', '暖心', '谢谢', '感谢', '被爱', '幸福'],
    }
  },
  negative: {
    labels: {
      '焦虑': ['焦虑', '紧张', '担心', '烦', '烦躁', '不安', '压力', '崩溃', '崩溃了', '卷', '卷不动', '内卷', '加班', '加班了', '赶不上', '来不及', 'deadline', '截止'],
      '低落': ['低落', '难过', '伤心', '失落', '沮丧', '失望', 'emo', '孤独', '寂寞', '无奈', '委屈', '心酸', '想哭', '无聊', '空虚', '迷茫', '没意思', '无所谓了'],
      '愤怒': ['生气', '愤怒', '火大', '气死', '无语', '受不了', '过分', '忍不了', '恶心', '讨厌', '离谱', '坑', '被坑', 'PUA', '甩锅', '背锅', '不公平', '凭什么'],
      '疲惫': ['累', '疲惫', '好累', '困', '没精神', '扛不住', '吃不消', '身心俱疲', '心力交瘁'],
    }
  },
  neutral: {
    labels: {
      '平静': ['平静', '一般', '还好', '正常', '普通', '随便', '没什么', '今天', '就是', '这样'],
    }
  }
};

// 否定词列表
const negationWords = ['不', '没', '没有', '别', '未', '非', '无'];

// 程度词
const intensifierWords = ['非常', '特别', '极其', '超', '太', '真', '好', '很', '格外', '十分'];

export function analyzeEmotion(text: string): {
  emotion: EmotionType;
  emotionLabel: string;
  keywords: string[];
} {
  const scores: Record<EmotionType, number> = { positive: 0, negative: 0, neutral: 0 };
  const labelScores: Record<string, number> = {};
  const matchedKeywords: string[] = [];

  for (const [emotionType, config] of Object.entries(emotionKeywords) as [EmotionType, EmotionKeywords][]) {
    for (const [label, keywords] of Object.entries(config.labels)) {
      for (const keyword of keywords) {
        // 检查文本中是否包含该关键词
        const index = text.indexOf(keyword);
        if (index !== -1) {
          // 检查是否被否定词修饰
          const prefix = text.substring(Math.max(0, index - 3), index);
          const isNegated = negationWords.some(nw => prefix.includes(nw));

          // 检查是否有程度词
          const prePrefix = text.substring(Math.max(0, index - 5), index);
          const hasIntensifier = intensifierWords.some(iw => prePrefix.includes(iw));

          let score = 1;
          if (hasIntensifier) score = 2;

          if (isNegated) {
            // 否定词翻转情绪（简化处理）
            if (emotionType === 'positive') {
              scores.negative += score;
              labelScores[`否定-${label}`] = (labelScores[`否定-${label}`] || 0) + score;
            } else if (emotionType === 'negative') {
              scores.positive += score;
              labelScores['释然'] = (labelScores['释然'] || 0) + score;
            }
          } else {
            scores[emotionType] += score;
            labelScores[label] = (labelScores[label] || 0) + score;
          }

          matchedKeywords.push(keyword);
        }
      }
    }
  }

  // 如果没有任何关键词匹配，默认为 neutral
  if (matchedKeywords.length === 0) {
    return {
      emotion: 'neutral',
      emotionLabel: '平静',
      keywords: [],
    };
  }

  // 确定主要情绪类型
  let maxScore = 0;
  let mainEmotion: EmotionType = 'neutral';
  for (const [type, score] of Object.entries(scores) as [EmotionType, number][]) {
    if (score > maxScore) {
      maxScore = score;
      mainEmotion = type;
    }
  }

  // 确定细分标签
  let maxLabelScore = 0;
  let mainLabel = '平静';
  for (const [label, score] of Object.entries(labelScores)) {
    if (score > maxLabelScore) {
      maxLabelScore = score;
      mainLabel = label.startsWith('否定-') ? label.slice(3) : label;
      if (label === '释然') mainLabel = '释然';
    }
  }

  return {
    emotion: mainEmotion,
    emotionLabel: mainLabel,
    keywords: [...new Set(matchedKeywords)],
  };
}
