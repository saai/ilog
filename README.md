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
│   │   └── jianshu-articles/    # 简书文章API
│   ├── page.tsx           # 首页
│   └── timeline/          # 时间流页面
├── components/             # React 组件
├── jianshu-spider/        # 简书爬虫项目
├── bilibili-spider/       # B站爬虫项目
├── douban-rss-fetcher/    # 豆瓣RSS抓取器
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

## 🛠️ 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **数据获取**: 实时API调用，直接从各平台获取最新数据
- **爬虫**: Python 3.9+, Selenium, ChromeDriver（可选，用于本地备份）
- **部署**: Vercel (推荐)

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