# 爬虫 API 路由说明

## 📋 概述

所有 Python 爬虫脚本的功能已转换为 Node.js API 路由，可以直接在 Vercel 上运行。

## 🚀 API 路由列表

### 1. B站视频数据抓取
- **路径**: `/api/cron/bilibili`
- **方法**: `GET`
- **功能**: 从 B站 API 获取用户最新视频
- **数据源**: B站官方 API

### 2. 简书文章数据抓取
- **路径**: `/api/cron/jianshu`
- **方法**: `GET`
- **功能**: 从简书 API 获取用户最新文章
- **数据源**: 简书官方 API

### 3. 豆瓣 RSS 数据抓取
- **路径**: `/api/cron/douban`
- **方法**: `GET`
- **功能**: 从豆瓣 RSS Feed 获取用户收藏
- **数据源**: 豆瓣 RSS Feed

### 4. YouTube 视频数据抓取
- **路径**: `/api/cron/youtube`
- **方法**: `GET`
- **功能**: 从 YouTube RSS Feed 获取频道最新视频
- **数据源**: YouTube RSS Feed

## 🔐 安全认证

所有 Cron API 路由支持可选的认证：

- 如果设置了 `CRON_SECRET` 环境变量，需要在请求头中包含：
  ```
  Authorization: Bearer <CRON_SECRET>
  ```
- 如果不设置 `CRON_SECRET`，API 可以直接访问（不推荐生产环境）

## 🚀 初始化爬虫（项目启动时运行一次）

项目已配置为在部署后手动运行一次爬虫，而不是定时任务。

### 使用初始化 API

部署后，调用 `/api/init` 来运行所有爬虫：

```bash
# 运行所有爬虫（一次性）
curl https://your-domain.vercel.app/api/init
```

### 带认证的调用

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/init
```

初始化 API 会依次运行所有爬虫：
- B站视频数据抓取
- 简书文章数据抓取
- 豆瓣 RSS 数据抓取
- YouTube 视频数据抓取

返回结果示例：
```json
{
  "success": true,
  "message": "完成 4/4 个爬虫",
  "results": [
    { "name": "bilibili", "success": true, "status": 200, "message": "成功" },
    { "name": "jianshu", "success": true, "status": 200, "message": "成功" },
    { "name": "douban", "success": true, "status": 200, "message": "成功" },
    { "name": "youtube", "success": true, "status": 200, "message": "成功" }
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📝 使用示例

### 方法 1：使用初始化 API（推荐）

部署后运行一次所有爬虫：

```bash
# 运行所有爬虫
curl https://your-domain.vercel.app/api/init

# 带认证
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/init
```

### 方法 2：单独调用各个爬虫 API

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

### 带认证的调用

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/bilibili
```

## 🔄 与现有 API 的集成

现有的 API 路由（如 `/api/bilibili-videos`、`/api/jianshu-articles` 等）会：

1. 首先尝试读取本地 JSON 文件（如果存在）
2. 如果文件不存在，直接调用在线 API 获取数据
3. 如果 API 调用失败，返回备用数据

这样确保了：
- 本地开发时可以读取 Python 脚本生成的数据
- 生产环境（Vercel）可以直接从 API 获取最新数据

## 🆚 与 Python 爬虫的对比

| 特性 | Python 爬虫 | Node.js API |
|------|------------|-------------|
| 运行环境 | 需要 Python + Selenium | 仅需 Node.js |
| Vercel 支持 | ❌ 不支持 | ✅ 完全支持 |
| 部署复杂度 | 高（需要外部服务） | 低（直接部署） |
| 维护成本 | 高 | 低 |
| 数据更新 | 需要手动或外部调度 | 自动定时任务 |

## 📊 数据格式

所有 API 返回统一的数据格式：

```json
{
  "success": true,
  "data": {
    "videos/articles/interests": [...],
    "total": 10,
    "user/channel": {...},
    "fetched_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🔧 故障排除

### API 返回 401 错误

- 检查是否设置了 `CRON_SECRET` 环境变量
- 确保请求头中包含正确的认证信息

### API 返回 500 错误

- 检查目标网站是否可访问
- 查看 Vercel 函数日志获取详细错误信息
- 某些 API 可能有访问频率限制

### 数据不更新

- 检查 Vercel Cron Jobs 是否正常运行
- 查看 Vercel Dashboard 中的 Cron Jobs 执行日志
- 可以手动调用 API 测试

## 📝 注意事项

1. **API 限制**: 某些平台（如 B站、简书）可能有 API 访问频率限制
2. **数据缓存**: 现有 API 路由使用 Next.js 缓存机制（30分钟）
3. **错误处理**: 所有 API 都有完善的错误处理和备用数据
4. **安全性**: 生产环境建议设置 `CRON_SECRET` 保护 API

## 🎯 后续优化

- [ ] 添加数据持久化（如使用 Vercel KV 或数据库）
- [ ] 实现增量更新（只获取新数据）
- [ ] 添加数据验证和清洗
- [ ] 实现更智能的错误重试机制

