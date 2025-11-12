# Saai's iLog - 个人数字世界

一个基于 Next.js 的个人博客和内容聚合平台，展示来自多个平台的最新创作内容。

## 🌟 功能特性

- **多平台内容聚合**: 自动获取并展示来自 YouTube、B站、简书、豆瓣等平台的最新内容
- **实时数据获取**: 所有数据直接从在线API实时获取，无需本地文件缓存
- **响应式设计**: 现代化的艺术风格界面，支持各种设备
- **动态内容更新**: 首页和时间流页面实时展示最新的创作内容

## 📁 项目结构

```
iLog/
├── app/                    # Next.js 应用
│   ├── api/               # API 路由
│   │   ├── bilibili-videos/     # B站视频API
│   │   ├── douban-rss/          # 豆瓣收藏API
│   │   ├── jianshu-articles/    # 简书文章API
│   │   └── youtube-videos/      # YouTube视频API
│   ├── page.tsx           # 首页
│   └── timeline/          # 时间流页面
├── components/             # React 组件
├── jianshu-spider/        # 简书爬虫项目
├── bilibili-spider/       # B站爬虫项目
├── douban-rss-fetcher/    # 豆瓣RSS抓取器
├── youtube-spider/        # YouTube爬虫项目（可选）
└── update_data.sh         # 数据更新脚本
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🕷️ 爬虫项目

项目包含独立的 Python 爬虫项目，可用于本地数据备份（可选）：

### 简书爬虫 (jianshu-spider)

获取简书用户的最新文章（可选，用于本地备份）。

```bash
cd jianshu-spider
chmod +x run.sh
./run.sh
```

### B站爬虫 (bilibili-spider)

获取B站用户的最新视频（可选，用于本地备份）。

```bash
cd bilibili-spider
chmod +x run.sh
./run.sh
```

### 豆瓣RSS抓取器 (douban-rss-fetcher)

通过豆瓣RSS获取用户的最新收藏（书籍、电影等）。

### YouTube爬虫 (youtube-spider)

获取YouTube频道的最新视频（可选，用于本地备份）。

```bash
cd youtube-spider
chmod +x run.sh
./run.sh
```

**注意**: 所有数据现在直接从在线API实时获取，爬虫项目仅用于本地数据备份（可选）。

## 🔧 配置说明

### 用户ID配置

在API路由中配置用户ID（主要配置）：

- **简书**: `app/api/jianshu-articles/route.ts` 中的 `userId` (默认: `763ffbb1b873`)
- **B站**: `app/api/bilibili-videos/route.ts` 中的 `userId` (默认: `472773672`)
- **豆瓣**: `app/api/douban-rss/route.ts` 中的 `userId` (默认: `284853052`)
- **YouTube**: `app/api/youtube-videos/route.ts` 中的 `channelId` (默认: `UCvvqt72J5jXW3TVoCJmVTlA`)

**注意**: 爬虫项目中的用户ID配置仅用于本地备份（可选），实际数据获取使用API路由中的配置。

### API路由配置

所有API路由直接从在线API实时获取数据，不再读取本地JSON文件：

- `/api/jianshu-articles` - 从简书用户页面实时抓取文章数据
- `/api/bilibili-videos` - 从B站API实时获取视频数据
- `/api/douban-rss` - 从豆瓣RSS feed实时获取收藏数据
- `/api/youtube-videos` - 从YouTube RSS feed实时获取视频数据
  - 使用YouTube官方RSS feed: `https://www.youtube.com/feeds/videos.xml?channel_id={channelId}`
  - 支持通过 `channel_id` 或 `channel_handle` 获取数据
  - 自动解析视频ID、标题、发布时间等信息
  - 生成视频缩略图URL

## 🛠️ 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **数据获取**: 实时API调用，直接从各平台获取最新数据
- **爬虫**: Python 3.9+, Selenium, ChromeDriver（可选，用于本地备份）
- **部署**: Vercel (推荐)

## 🚀 Vercel 部署指南

### 方式一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择 GitHub 仓库 `saai/ilog`
   - 如果项目已存在，进入项目设置

3. **配置部署**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（自动检测）
   - **Output Directory**: `.next`（自动检测）
   - **Install Command**: `npm install`（自动检测）

4. **选择分支**
   - 在项目设置中，确保 Production Branch 设置为 `main`
   - 每次推送到 `main` 分支时，Vercel 会自动部署

5. **手动触发部署**
   - 进入项目 Dashboard
   - 点击 "Deployments" 标签
   - 点击 "Redeploy" 按钮
   - 选择 `main` 分支
   - 点击 "Redeploy" 确认

### 方式二：使用 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署到生产环境**
   ```bash
   # 确保在 main 分支
   git checkout main
   
   # 部署到生产环境
   vercel --prod
   ```

4. **查看部署状态**
   ```bash
   vercel ls
   ```

### 自动部署

项目已配置为自动部署：
- ✅ 每次推送到 `main` 分支时，Vercel 会自动触发部署
- ✅ 部署状态会显示在 GitHub 的 Pull Request 中
- ✅ 部署完成后会生成预览 URL

### 环境变量配置

#### 本地开发环境

在项目根目录创建 `.env.local` 文件（已包含在 `.gitignore` 中，不会被提交）：

```bash
# .env.local
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**注意**：如果不设置 `NEXT_PUBLIC_BASE_URL`，代码会自动检测开发环境并使用 `http://localhost:3000`，所以这个环境变量在本地开发时是可选的。

#### Vercel 部署环境

在 Vercel Dashboard 中配置环境变量的详细步骤：

##### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel Dashboard**
   - 访问 [https://vercel.com/dashboard](https://vercel.com/dashboard)
   - 使用 GitHub 账号登录

2. **选择项目**
   - 在 Dashboard 中找到并点击你的项目（例如：`ilog`）

3. **进入设置页面**
   - 点击项目页面顶部的 **Settings** 标签
   - 在左侧菜单中找到并点击 **Environment Variables**

4. **添加环境变量**
   - 点击 **Add New** 按钮
   - 填写以下信息：
     - **Key（变量名）**: `NEXT_PUBLIC_BASE_URL`
     - **Value（变量值）**: 你的 Vercel 部署 URL
       - 生产环境：`https://your-project.vercel.app`（替换为你的实际域名）
       - 或者使用 Vercel 自动生成的 URL
     - **Environment（环境）**: 勾选需要应用的环境
       - ✅ **Production** - 生产环境（必须）
       - ✅ **Preview** - 预览环境（推荐）
       - ✅ **Development** - 开发环境（可选）

5. **保存设置**
   - 点击 **Save** 按钮
   - 环境变量会立即生效，但需要重新部署才能应用

6. **重新部署（应用环境变量）**
   - 方法一：在 **Deployments** 页面，找到最新的部署，点击右侧的 **...** 菜单，选择 **Redeploy**
   - 方法二：推送新的代码到 GitHub，Vercel 会自动触发部署

##### 方法二：通过 Vercel CLI

如果你安装了 Vercel CLI，也可以通过命令行设置：

```bash
# 安装 Vercel CLI（如果还没有安装）
npm i -g vercel

# 登录 Vercel
vercel login

# 设置环境变量
vercel env add NEXT_PUBLIC_BASE_URL production
# 然后输入变量值，例如：https://your-project.vercel.app

# 也可以为其他环境设置
vercel env add NEXT_PUBLIC_BASE_URL preview
vercel env add NEXT_PUBLIC_BASE_URL development
```

##### 重要提示

1. **环境变量命名规则**
   - 客户端可访问的变量必须以 `NEXT_PUBLIC_` 开头
   - 服务器端变量不需要前缀

2. **环境变量作用域**
   - **Production**: 仅在生产环境（主分支）生效
   - **Preview**: 在所有预览部署（Pull Request、分支部署）生效
   - **Development**: 仅在本地开发时使用 `vercel dev` 命令时生效

3. **自动环境变量**
   - Vercel 自动提供 `VERCEL_URL` 环境变量
   - 代码已配置为自动使用 `VERCEL_URL`，所以 `NEXT_PUBLIC_BASE_URL` 通常是**可选的**
   - 只有在需要自定义基础 URL 时才需要设置

4. **查看环境变量**
   - 在 **Settings** → **Environment Variables** 页面可以查看所有已设置的环境变量
   - 可以随时编辑或删除环境变量

5. **环境变量生效时间**
   - 添加或修改环境变量后，需要重新部署才能生效
   - 环境变量不会自动应用到已存在的部署

### 部署检查清单

部署前确保：
- ✅ 代码已推送到 GitHub 的 `main` 分支
- ✅ `package.json` 中的构建脚本正确
- ✅ 所有 API 路由使用 `export const dynamic = 'force-dynamic'`（已配置）
- ✅ 没有硬编码的本地文件路径
- ✅ 所有依赖项都在 `package.json` 中声明

### 查看部署日志

如果部署失败：
1. 在 Vercel Dashboard 中查看部署日志
2. 检查构建错误信息
3. 确保所有 API 路由正确配置
4. 检查网络请求是否正常（API 调用）

### 回滚部署

如果需要回滚到之前的版本：
1. 在 Vercel Dashboard 的 Deployments 页面
2. 找到之前的成功部署
3. 点击 "..." 菜单
4. 选择 "Promote to Production"

## 📊 数据流程

1. **API调用**: Next.js API路由直接从各平台在线API获取数据
2. **实时获取**: 
   - B站：通过官方API获取视频列表
   - 简书：从用户页面HTML解析文章信息
   - 豆瓣：从RSS feed获取收藏数据
   - YouTube：从RSS feed获取视频数据
3. **数据转换**: 将各平台数据转换为统一的TimelineItem格式
4. **页面展示**: 首页和时间流页面实时展示最新内容

**注意**: 不再依赖本地JSON文件，所有数据实时获取，确保内容始终是最新的。

## 🔍 故障排除

### 爬虫问题

1. **ChromeDriver错误**: 确保系统已安装Chrome浏览器
2. **网络超时**: 检查网络连接，爬虫会自动重试
3. **数据为空**: 检查用户ID是否正确，爬虫会返回模拟数据

### API问题

1. **数据获取失败**: 检查网络连接，API会自动重试或返回备用数据
2. **页面显示旧数据**: 清除浏览器缓存，数据是实时获取的
3. **API限流**: 如果遇到频率限制，API会使用缓存机制（30分钟缓存）

## 📝 开发说明

### 添加新平台

1. 创建对应的API路由（`app/api/{platform-name}/route.ts`）
2. 实现从在线API获取数据的逻辑
3. 在 `app/timeline/transformers.ts` 中添加数据转换函数
4. 更新前端页面（`app/page.tsx` 和 `app/timeline/page.tsx`）展示新平台内容

**注意**: 现在不再需要创建本地爬虫项目，所有数据直接从在线API获取。

### 自定义样式

项目使用 Tailwind CSS，可以在 `app/globals.css` 中自定义样式。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**注意**: 请遵守各平台的使用条款，合理使用爬虫功能。 