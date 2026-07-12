# 语心日记 - AI语音心情记录器

> 对它说话，它替你读懂自己。
> TRAE AI 创造力大赛 · 生活娱乐赛道

## 简介

语心日记是一款 AI 语音心情记录器。按住按钮说话，AI 自动将语音转为文字并识别情绪，生成情绪日历。全程 30 秒，无需打字。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

浏览器打开 http://localhost:5173/ 即可体验。推荐使用 Chrome 浏览器。

## 核心功能

- 极速语音记录：按住说话，松开自动转文字 + 情绪识别
- 中文情绪理解：100+ 关键词，覆盖 PUA、emo、破防等互联网语境
- 情绪日历：月度视图，每天显示情绪色彩
- 历史记录：按日期分组，支持删除
- 数据隐私：本地存储，零后端，零社交

## 技术栈

- React 18 + TypeScript
- Vite 5
- React Router v6
- Web Speech API
- localStorage

## 项目结构

```
src/
├── engine/emotionEngine.ts    # 情绪识别引擎
├── hooks/useVoiceRecord.ts     # 语音录制 Hook
├── store/MoodContext.tsx       # 全局状态管理
├── utils/                      # 存储与日期工具
├── components/Layout/          # 底部导航布局
├── pages/                      # 5个页面组件
└── styles/                     # 全局样式
```

## 开发工具

本项目全程借助 TRAE IDE 完成开发。
