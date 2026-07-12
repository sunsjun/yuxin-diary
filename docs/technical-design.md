# 语心日记 —— 技术设计文档

> TRAE AI 创造力大赛 · 生活娱乐赛道 · 初赛 Demo
> 创建日期：2026-07-03

---

## 1. 产品概述

**语心日记**是一款 AI 语音心情记录器。用户通过语音输入记录心情，AI 自动识别情绪、生成情绪日历，帮助用户轻松建立情绪观察习惯。

**核心理念：** 对它说话，它替你读懂自己。

**Slogan：** 30秒记录，AI读懂你的每一天。

---

## 2. 技术选型

| 维度 | 初赛 Demo 方案 | 后续迭代方向 |
|------|----------------|-------------|
| 开发工具 | TRAE Work 原型 + TRAE IDE 完善 | 持续迭代 |
| 前端框架 | React 18 + TypeScript | 可选小程序化 |
| 构建工具 | Vite 5 | - |
| UI 组件 | 手写 CSS + CSS Modules（治愈系风格） | 可选 Ant Design Mobile |
| 语音转文字 | Web Speech API (SpeechRecognition) | Whisper API / 豆包语音 API |
| 情绪识别 | 关键词库 + 规则引擎 | 大模型 API 情感分析 |
| 数据存储 | localStorage | IndexedDB / SQLite / 云端 |
| 路由 | React Router v6 | - |
| 状态管理 | React Context + useReducer | Zustand / Redux |
| 图表 | CSS 自绘（情绪日历色块） | ECharts / Recharts |

---

## 3. 页面结构

```
App
├── /           首页（录音入口 + 今日情绪概览）
├── /calendar   日历页（月度情绪日历）
├── /history    历史页（全部记录列表）
├── /record/:id 详情页（单条记录查看）
└── /settings   设置页（数据管理、关于）
```

### 3.1 首页
- 顶部：日期 + 天气图标（可选）
- 中部：录音按钮（大圆形，按住录音，松开结束）
- 录音后：显示转写文字 + 识别的情绪标签
- 底部：今日情绪卡片 + 最近3条记录预览

### 3.2 日历页
- 月度日历视图，每个日期格子显示情绪颜色
- 颜色映射：绿色=积极，橙色=中性，红色=消极，灰色=无记录
- 点击某天可查看当天所有记录

### 3.3 历史页
- 按日期倒序排列的所有记录
- 每条显示：时间、文字摘要、情绪标签
- 支持左滑删除

### 3.4 详情页
- 完整显示：日期、时间、语音播放、转写文字、情绪分析结果

### 3.5 设置页
- 清除全部数据
- 数据导出（JSON）
- 关于语心日记

---

## 4. 核心数据模型

```typescript
interface MoodRecord {
  id: string;            // crypto.randomUUID()
  date: string;          // "2026-07-03" (YYYY-MM-DD)
  time: string;          // "14:30" (HH:mm)
  audioBlob?: Blob;      // 录音 Blob（可选，localStorage 存不下大文件时不存）
  text: string;           // 语音转写文字
  emotion: EmotionType;   // "positive" | "negative" | "neutral"
  emotionLabel: string;   // 细分情绪标签："开心" | "焦虑" | "平静" | "低落" 等
  keywords: string[];     // 识别到的情绪关键词
  createdAt: number;      // Date.now() 时间戳
}

type EmotionType = "positive" | "negative" | "neutral";
```

---

## 5. 情绪识别引擎设计

### 5.1 关键词库结构

```typescript
const emotionKeywords: Record<EmotionType, {
  labels: Record<string, string[]>;  // 细分标签 → 关键词列表
}> = {
  positive: {
    labels: {
      "开心": ["开心", "高兴", "快乐", "棒", "好", "赞", "兴奋", "期待", "满意", "幸福", "哈哈", "笑", "幸运", "感恩", "充实", "舒服"],
      "满足": ["满足", "不错", "还行", "可以", "挺好的", "不错", "舒服"],
    }
  },
  negative: {
    labels: {
      "焦虑": ["焦虑", "紧张", "担心", "烦", "烦躁", "不安", "压力", "累", "疲惫", "崩溃", "崩溃了"],
      "低落": ["低落", "难过", "伤心", "失落", "沮丧", "失望", "emo", "孤独", "寂寞", "无奈", "委屈", "心酸", "想哭"],
      "愤怒": ["生气", "愤怒", "火大", "气死", "无语", "受不了", "过分", "忍不了", "恶心", "讨厌"],
    }
  },
  neutral: {
    labels: {
      "平静": ["平静", "一般", "还好", "正常", "普通", "随便", "无所谓", "没什么"],
    }
  }
};
```

### 5.2 识别算法

1. 遍历转写文本，匹配关键词库
2. 统计各情绪类型命中次数
3. 取命中次数最多的情绪类型
4. 取该类型下命中次数最多的细分标签
5. 若无任何命中，默认为 neutral / 平静

### 5.3 特殊规则
- 否定词处理："不开心" → negative（简单实现：检测否定词前缀）
- 程度词加权："非常开心" → positive 权重 +1

---

## 6. 语音录制组件设计

### 6.1 Web Speech API 流程

```
用户按住录音按钮
  → 创建 SpeechRecognition 实例
  → 设置 lang = "zh-CN", continuous = false, interimResults = true
  → 开始识别（实时显示中间结果）
  → 用户松开 → recognition.stop()
  → onresult 事件获取最终转写文本
  → 调用情绪识别引擎分析文本
  → 保存记录到 localStorage
  → 显示识别结果
```

### 6.2 兼容性处理
- 检测浏览器是否支持 `webkitSpeechRecognition` 或 `SpeechRecognition`
- 不支持时：显示提示，提供手动文字输入的 fallback
- 移动端 Chrome 支持较好，Safari 支持有限

### 6.3 录音 UI 交互
- 默认状态：大圆形按钮，显示麦克风图标
- 按住中：按钮变为脉冲动画，显示波形效果，实时显示识别中的文字
- 松开后：显示转写结果 + 情绪标签，自动保存

---

## 7. 项目目录结构

```
yuxin-diary/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/           # 通用组件
│   │   ├── Layout/          # 底部导航栏布局
│   │   ├── VoiceButton/     # 录音按钮组件
│   │   ├── MoodTag/         # 情绪标签组件
│   │   ├── RecordCard/      # 记录卡片组件
│   │   └── Calendar/         # 情绪日历组件
│   ├── pages/               # 页面组件
│   │   ├── HomePage/
│   │   ├── CalendarPage/
│   │   ├── HistoryPage/
│   │   ├── RecordDetailPage/
│   │   └── SettingsPage/
│   ├── engine/              # 核心引擎
│   │   ├── emotionEngine.ts  # 情绪识别引擎
│   │   ├── keywords.ts       # 关键词库
│   │   └── speechApi.ts      # 语音识别封装
│   ├── store/               # 状态管理
│   │   ├── MoodContext.tsx    # 全局状态 Context
│   │   └── moodReducer.ts    # 状态 Reducer
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useVoiceRecord.ts
│   │   ├── useMoodRecords.ts
│   │   └── useEmotion.ts
│   ├── utils/               # 工具函数
│   │   ├── storage.ts        # localStorage 封装
│   │   └── date.ts           # 日期工具
│   ├── styles/              # 全局样式
│   │   ├── global.css
│   │   └── variables.css     # CSS 变量（颜色、间距）
│   ├── types/               # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 8. UI 设计规范

### 8.1 色彩系统

| 用途 | 色值 | 说明 |
|------|------|------|
| 主色 | #7EC8A0 | 温暖的薄荷绿，传达治愈与平静 |
| 积极情绪 | #7EC8A0 | 绿色系 |
| 中性情绪 | #F5C542 | 暖黄色系 |
| 消极情绪 | #E88B8B | 柔和红色系 |
| 无记录 | #E8ECF1 | 浅灰色 |
| 背景色 | #FAFBFE | 近白色 |
| 文字主色 | #2D3436 | 深灰色 |
| 文字次色 | #888E94 | 中灰色 |

### 8.2 字体
- 中文：PingFang SC / Microsoft YaHei
- 数字/英文：SF Pro / Helvetica Neue

### 8.3 圆角与间距
- 按钮：24px 圆角（胶囊形）
- 卡片：16px 圆角
- 页面内边距：20px
- 元素间距：16px / 12px / 8px

---

## 9. 开发计划（9天）

| 阶段 | 天数 | 任务 | 产出 |
|------|------|------|------|
| 设计文档 | Day 0（今天） | 技术设计 + 项目初始化 | 本文档 + 项目脚手架 |
| 核心功能 | Day 1 | 语音录制 + Web Speech API 封装 | 可录音并转文字 |
| 核心功能 | Day 2 | 情绪识别引擎 + localStorage 存储 | 可识别情绪并保存 |
| 页面开发 | Day 3 | 首页 + 录音交互完整流程 | 核心闭环可运行 |
| 页面开发 | Day 4 | 日历页 + 历史页 | 数据可视化完成 |
| 页面开发 | Day 5 | 详情页 + 设置页 | 全部页面完成 |
| 联调打磨 | Day 6 | 移动端适配 + UI 细节打磨 | 视觉达标 |
| 测试提交 | Day 7 | 端到端测试 + Bug 修复 + 录屏 | 可提交的 Demo |
| 提交材料 | Day 8 | 提交到 TRAE 社区初赛专区 | 完成 |

---

## 10. 风险与应对

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| Web Speech API 在部分浏览器不支持 | 核心功能不可用 | 提供"手动输入文字"的 fallback |
| 移动端浏览器录音权限被拒 | 无法录音 | 提前引导用户授权，提供权限说明 |
| localStorage 存储空间有限（5-10MB） | 长期使用数据丢失 | Demo 阶段不存音频 Blob，只存文字 |
| 关键词库覆盖不全 | 情绪识别不准 | 预置 100+ 关键词，Demo 阶段够用 |
