# Cloudflare Pages 部署指南

## 方式一：通过 GitHub 连接部署（推荐）

### 第1步：确保代码已推送到 GitHub
```bash
git add -A
git commit -m "修复语音识别undefined问题"
git push
```

### 第2步：在 Cloudflare 创建项目
1. 打开 https://dash.cloudflare.com/ ，注册/登录（可用 GitHub 账号）
2. 左侧菜单选择 **Workers & Pages**
3. 点击 **Create application** → **Pages** → **Connect to Git**
4. 授权并选择 `sunsjun/yuxin-diary` 仓库
5. 构建设置：
   - Framework preset: **None**
   - Build command: `npm run build`
   - Build output directory: `dist`
6. 点击 **Save and Deploy**
7. 等待约1-2分钟，获得地址：`https://yuxin-diary.pages.dev`

## 方式二：通过 Wrangler CLI 部署

### 安装 Wrangler
```bash
npm i -g wrangler
```

### 登录
```bash
wrangler login
```

### 部署
在项目目录下：
```bash
npm run build
wrangler pages deploy dist --project-name=yuxin-diary
```

首次会询问是否创建新项目，选择 Yes。

---

## Cloudflare Pages vs Vercel

| 对比项 | Cloudflare Pages | Vercel |
|--------|-----------------|--------|
| 大陆访问 | 稳定可达 | DNS 污染，多数不可达 |
| 免费额度 | 无限请求 | 100次/天（Hobby计划） |
| HTTPS | 自动 | 自动 |
| 自定义域名 | 支持 | 支持 |
| 构建速度 | 1-2分钟 | 约1分钟 |

---

## 更新部署

推送到 GitHub 后，Cloudflare Pages 会自动重新部署：
```bash
git add -A
git commit -m "更新说明"
git push
```

## 注意事项
- Cloudflare Pages 的 `_redirects` 文件已放在 `public/` 目录，构建时会自动复制到 `dist/`
- 该文件确保 SPA 路由在刷新时不会 404
