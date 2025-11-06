# Vercel 部署指南

本指南将帮助你将 iLog 项目部署到 Vercel 平台。

## 📋 前置要求

1. GitHub 账户（项目已推送到 GitHub）
2. Vercel 账户（可在 [vercel.com](https://vercel.com) 免费注册）

## 🚀 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账户登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 GitHub 仓库 `saai/ilog`
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）
   - **Install Command**: `npm install`（默认）

4. **环境变量**（可选但推荐）
   - 在 "Environment Variables" 中添加：
     - `CRON_SECRET`: 用于保护 Cron Jobs 的密钥（随机生成一个长字符串）
   - 如果不设置 `CRON_SECRET`，Cron Jobs 仍然可以工作，但建议设置以提高安全性

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 2-5 分钟）

### 方法二：使用 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   cd /Users/yansha/Documents/ilog
   vercel
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 🕷️ 爬虫功能说明

### 已集成的爬虫 API

项目现在包含以下爬虫 API 路由，可以直接在 Vercel 上运行：

1. **`/api/cron/bilibili`** - B站视频数据抓取
2. **`/api/cron/jianshu`** - 简书文章数据抓取
3. **`/api/cron/douban`** - 豆瓣 RSS 数据抓取
4. **`/api/cron/youtube`** - YouTube 视频数据抓取

这些 API 路由：
- ✅ 不依赖 Python 或 Selenium
- ✅ 使用纯 Node.js 和 HTTP 请求
- ✅ 完全兼容 Vercel Serverless Functions
- ✅ 支持自动定时运行（通过 Vercel Cron Jobs）

### 初始化爬虫（部署后运行一次）

项目已配置为在部署后手动运行一次爬虫，而不是定时任务。

部署完成后，调用 `/api/init` API 来运行所有爬虫：

```bash
curl https://your-domain.vercel.app/api/init
```

这会依次运行所有爬虫并返回结果。如果需要更新数据，可以随时手动调用这个 API。

### 初始化爬虫（推荐）

部署后运行一次所有爬虫：

```bash
# 运行所有爬虫
curl https://your-domain.vercel.app/api/init
```

### 单独运行某个爬虫

如果需要单独运行某个爬虫：

```bash
# B站
curl https://your-domain.vercel.app/api/cron/bilibili

# 简书
curl https://your-domain.vercel.app/api/cron/jianshu

# 豆瓣
curl https://your-domain.vercel.app/api/cron/douban

# YouTube
curl https://your-domain.vercel.app/api/cron/youtube
```

### Puppeteer 路由说明

项目中的 `/api/bilibili-scraper` 和 `/api/jianshu-scraper` 路由使用了 Puppeteer，在 Vercel 上可能无法正常工作。这些路由主要用于开发测试，生产环境建议使用新的 `/api/cron/*` 路由。

## 📁 项目文件说明

- `vercel.json`: Vercel 配置文件
  - 设置 API 路由最大执行时间
  - 配置构建和安装命令
  - 已移除定时任务，改为手动触发
  
- `.vercelignore`: 忽略不需要部署的文件
  - 排除 Python 爬虫脚本、本地数据文件等
  - Node.js API 路由已替代 Python 脚本功能

- `app/api/cron/`: 爬虫 API 路由
  - 所有爬虫功能已转换为 Node.js API 路由
  - 可以直接在 Vercel 上运行，无需 Python 环境

## 🔄 持续部署

一旦连接到 GitHub，Vercel 会自动：
- 监听 `main` 分支的推送
- 自动触发新的部署
- 为每个 Pull Request 创建预览部署

### 配置分支部署

1. 进入项目设置
2. 在 "Git" 部分配置：
   - **Production Branch**: `main`
   - **Preview Branches**: `dev` 或其他分支

## 🌐 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 📊 监控和日志

- **部署日志**: 在 Vercel Dashboard 中查看每次部署的构建日志
- **函数日志**: 查看 API 路由的执行日志
- **Analytics**: 在项目设置中启用 Vercel Analytics

## 🔧 故障排除

### 构建失败

1. **检查构建日志**: 查看详细的错误信息
2. **本地测试**: 运行 `npm run build` 确保本地可以构建
3. **依赖问题**: 确保所有依赖都在 `package.json` 中

### API 路由超时

- 增加 `vercel.json` 中的 `maxDuration`
- 优化代码减少执行时间
- 考虑使用缓存机制

### 环境变量问题

- 确保在 Vercel Dashboard 中正确配置环境变量
- 区分开发、预览和生产环境

## 📝 后续优化建议

1. **数据更新策略** ✅ 已实现
   - ✅ 部署后手动调用 `/api/init` 运行一次爬虫
   - ✅ 需要更新数据时，可以随时手动调用初始化 API

2. **性能优化**
   - 启用 Vercel Edge Functions（如果适用）
   - 使用 ISR (Incremental Static Regeneration)
   - 优化图片和静态资源

3. **监控**
   - 启用 Vercel Analytics
   - 设置错误监控（如 Sentry）

## 🎉 部署完成

部署成功后，你会获得一个类似 `ilog.vercel.app` 的 URL。

访问你的网站，享受 Vercel 提供的：
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 零配置部署
- ✅ 无限带宽

---

**需要帮助？** 查看 [Vercel 文档](https://vercel.com/docs) 或提交 Issue。

