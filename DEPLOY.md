# 语心日记 - Vercel 部署指南

## 前置条件

- 一个 GitHub 账号（https://github.com）
- 一个 Vercel 账号（https://vercel.com，可用 GitHub 账号直接登录）

---

## 方式一：通过 GitHub 部署（推荐）

### 第1步：创建 GitHub 仓库

1. 打开 https://github.com/new
2. Repository name 填写：`yuxin-diary`
3. 选择 **Public**（公开）
4. 不要勾选 "Add a README file"（已有）
5. 点击 **Create repository**

### 第2步：推送代码到 GitHub

在项目目录 `yuxin-diary` 下打开终端，执行：

```bash
git remote add origin https://github.com/你的用户名/yuxin-diary.git
git branch -M main
git push -u origin main
```

### 第3步：在 Vercel 导入项目

1. 打开 https://vercel.com/new
2. 选择 **Import Git Repository**
3. 找到 `yuxin-diary` 仓库，点击 **Import**
4. Framework Preset 会自动识别为 **Vite**
5. 其他设置保持默认，点击 **Deploy**
6. 等待约1分钟，部署完成后会获得一个线上地址：
   `https://yuxin-diary-xxx.vercel.app`

---

## 方式二：通过 Vercel CLI 部署

### 安装 Vercel CLI

```bash
npm i -g vercel
```

### 登录 Vercel

```bash
vercel login
```

### 部署

在项目目录下执行：

```bash
# 预览部署
vercel

# 正式部署（生产环境）
vercel --prod
```

首次部署会询问几个问题，按以下选择：
- Set up and deploy? → **Y**
- Which scope? → 选择你的账号
- Link to existing project? → **N**
- What's your project's name? → `yuxin-diary`
- In which directory is your code located? → `./`
- Want to modify these settings? → **N**

部署完成后会输出线上地址。

---

## 部署后验证

1. 打开 Vercel 分配的 URL
2. 确认首页正常加载（显示录音按钮和导航栏）
3. 测试手动输入文字 + 情绪识别功能
4. 注意：语音识别功能需要 HTTPS 环境（Vercel 默认提供 HTTPS），且推荐 Chrome 浏览器

## 更新部署

代码更新后，重新推送到 GitHub 即可自动触发 Vercel 重新部署：

```bash
git add -A
git commit -m "更新说明"
git push
```

---

## 常见问题

**Q: 部署后页面空白？**
A: 检查 Vercel 的 Build & Output Settings，确保 Output Directory 设置为 `dist`。

**Q: 路由刷新后 404？**
A: 项目已配置 `vercel.json` 中的 rewrites 规则，所有路由会 fallback 到 index.html。如果仍有问题，确认 vercel.json 已推送到仓库。

**Q: 语音功能不工作？**
A: Web Speech API 需要 HTTPS 环境。Vercel 默认提供 HTTPS，确保使用 `https://` 开头的地址访问。同时需要 Chrome 浏览器和麦克风权限。
