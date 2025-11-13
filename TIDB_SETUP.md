# TiDB 数据库集成设置指南

## 概述

本项目已集成 TiDB 数据库支持，所有爬取的数据现在会存储在 TiDB 数据库中，而不是直接从外部 API 获取。

## 环境变量配置

在 Vercel 中配置以下环境变量（通过 TiDB Integration 自动设置）：

- `TIDB_HOST` - TiDB 主机地址
- `TIDB_PORT` - TiDB 端口（默认 4000）
- `TIDB_USER` - TiDB 用户名
- `TIDB_PASSWORD` - TiDB 密码
- `TIDB_DATABASE` - 数据库名称

## 数据库表结构

系统会自动创建以下表（如果不存在）：

1. **bilibili_videos** - B站视频数据表
2. **jianshu_articles** - 简书文章数据表
3. **youtube_videos** - YouTube 视频数据表
4. **douban_interests** - 豆瓣兴趣数据表

每个表的结构：
- `id` (BIGINT UNSIGNED) - 主键，自增
- `data` (JSON) - 数据 JSON blob
- `published_at` (DATETIME) - 发布时间
- `created_at` (DATETIME) - 创建时间
- `updated_at` (DATETIME) - 更新时间
- 索引：`idx_published_at`, `idx_created_at`, `idx_updated_at`

## 初始化数据库表

### 方法 1：通过初始化 API（推荐）

部署后，访问 `/api/init` 端点（需要设置 `INIT_SECRET` 或 `CRON_SECRET` 环境变量）：

```bash
curl -X GET "https://your-domain.vercel.app/api/init" \
  -H "Authorization: Bearer YOUR_SECRET"
```

这会：
1. 初始化所有数据库表
2. 运行所有爬虫获取数据并保存到数据库

### 方法 2：自动初始化

当 API 路由首次被调用时，会自动初始化表（如果不存在）。

## 数据流程

### 读取数据

1. API 路由首先尝试从数据库读取数据
2. 如果数据库中有数据，直接返回
3. 如果数据库为空，则从在线 API 获取数据（作为后备方案）

### 保存数据

1. 当从在线 API 获取到新数据时，会自动保存到数据库
2. 使用 URL 或其他唯一标识符进行去重
3. 如果记录已存在，则更新；否则插入新记录

## API 路由修改

以下 API 路由已修改为从数据库读取：

- `/api/bilibili-videos` - B站视频数据
- `/api/jianshu-articles` - 简书文章数据
- `/api/youtube-videos` - YouTube 视频数据
- `/api/douban-rss` - 豆瓣 RSS 数据

## 数据更新

数据会在以下情况更新：

1. **首次访问** - 当数据库为空时，从在线 API 获取并保存
2. **定期更新** - 通过 cron job 定期更新数据（如果配置了）
3. **手动触发** - 调用 `/api/init` 端点

## 故障排除

### 数据库连接失败

如果看到数据库连接错误：

1. 检查环境变量是否正确设置
2. 确认 TiDB Integration 已正确配置
3. 检查网络连接和防火墙设置

### 表初始化失败

如果表初始化失败：

1. 检查数据库用户权限（需要 CREATE TABLE 权限）
2. 查看 Vercel 日志中的详细错误信息
3. 手动调用 `/api/init` 端点查看错误详情

### 数据未更新

如果数据没有更新：

1. 检查数据库连接是否正常
2. 查看 API 日志确认数据是否成功保存
3. 确认去重逻辑是否正确（可能因为 URL 相同而跳过更新）

## 本地开发

在本地开发时，需要在 `.env.local` 文件中设置 TiDB 连接信息：

```env
TIDB_HOST=your-tidb-host
TIDB_PORT=4000
TIDB_USER=your-username
TIDB_PASSWORD=your-password
TIDB_DATABASE=ilog
```

## 注意事项

1. **数据去重**：系统使用 URL 或其他唯一标识符进行去重，避免重复数据
2. **性能优化**：数据库查询使用索引优化，按 `published_at` 倒序排序
3. **错误处理**：如果数据库操作失败，系统会回退到在线 API 获取数据
4. **数据格式**：所有数据以 JSON 格式存储在 `data` 字段中，保持灵活性

## 相关文件

- `lib/db.ts` - 数据库连接工具
- `lib/init-tables.ts` - 表初始化脚本
- `lib/db-operations.ts` - 数据库操作函数
- `app/api/init/route.ts` - 初始化 API 端点

