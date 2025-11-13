# Vercel Cron Jobs 配置指南

## 📋 概述

项目已配置 Vercel Cron Jobs 来定时更新数据库。所有爬虫 API 会自动抓取数据并保存到 TiDB 数据库。

## ⏰ 定时任务配置

**重要**：根据 [Vercel 文档](https://vercel.com/docs/cron-jobs)，免费计划（Hobby）有以下限制：
- 最多 **2 个** Cron Jobs
- 每个任务**每天最多触发一次**

为了符合免费计划限制，项目使用**统一的爬虫 API**：

- **统一爬虫**: `/api/cron/all` - 每天 UTC 时间 00:00 执行一次
  - 在一个 API 中执行所有平台的爬虫任务：
    - B站视频
    - 简书文章
    - 豆瓣RSS
    - YouTube视频

### Cron 表达式说明

当前使用的表达式：`0 0 * * *`

- `0` - 分钟（0分）
- `0` - 小时（0点，即午夜）
- `*` - 日期（每天）
- `*` - 月份（每月）
- `*` - 星期（每周）

这意味着任务会在**每天 UTC 时间 00:00**（北京时间 08:00）运行一次。

### 修改定时频率

如果需要修改定时频率，编辑 `vercel.json` 文件中的 `crons` 配置：

```json
{
  "crons": [
    {
      "path": "/api/cron/all",
      "schedule": "0 0 * * *"  // 修改这里
    }
  ]
}
```

**注意**：免费计划限制每个任务每天最多触发一次，所以不能使用更频繁的 schedule（如每小时）。

#### 常用 Cron 表达式示例（免费计划限制：每天最多一次）

- `0 0 * * *` - 每天 UTC 00:00 运行一次（当前配置）
- `0 12 * * *` - 每天 UTC 12:00 运行一次
- `0 0 * * 0` - 每周日 UTC 00:00 运行一次
- `0 0 1 * *` - 每月 1 号 UTC 00:00 运行一次

**如果需要更频繁的执行**，需要升级到 Vercel Pro 计划。

## 🔐 安全认证

所有 Cron API 支持可选的认证：

1. **设置环境变量**：在 Vercel Dashboard 中设置 `CRON_SECRET` 环境变量
2. **Vercel 自动认证**：Vercel Cron Jobs 会自动在请求头中添加认证信息

### 手动调用（用于测试）

如果需要手动调用 Cron API 进行测试：

```bash
# 设置 CRON_SECRET 环境变量
export CRON_SECRET="your-secret-key"

# 调用统一爬虫（执行所有平台）
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/all

# 或者单独调用各个平台的爬虫（如果需要在特定时间单独执行）
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/bilibili

curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/jianshu

curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/douban

curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.vercel.app/api/cron/youtube
```

## 📊 数据流程

1. **Vercel Cron Jobs 触发** - 每天 UTC 00:00 自动触发 `/api/cron/all`
2. **执行统一爬虫** - `/api/cron/all` 依次执行所有平台的爬虫：
   - B站视频爬虫
   - 简书文章爬虫
   - 豆瓣RSS爬虫
   - YouTube视频爬虫
3. **抓取数据** - 从各平台 API/RSS 获取最新数据
4. **保存到数据库** - 自动保存到 TiDB 数据库
5. **返回结果** - 返回所有平台的执行结果和抓取的数据条数

## 🔍 查看执行日志

### 方法 1：在 Vercel Dashboard 中查看 Cron Jobs（推荐）

1. **登录 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 登录你的账户

2. **选择项目**
   - 在项目列表中找到你的项目（ilog）
   - 点击进入项目详情页

3. **查看 Cron Jobs**
   - 点击左侧菜单的 **Settings**（设置）
   - 在设置页面中找到 **Cron Jobs** 选项
   - 点击进入 Cron Jobs 页面

4. **查看执行历史**
   - 在 Cron Jobs 页面，你会看到配置的定时任务：
     - `/api/cron/all` - 统一爬虫任务
   - 任务会显示：
     - **Schedule**（执行频率）：`0 0 * * *`（每天 UTC 00:00）
     - **Last Run**（最后执行时间）
     - **Next Run**（下次执行时间）
     - **Status**（状态）：成功/失败

5. **查看详细日志**
   - 点击某个 Cron Job 名称
   - 查看执行历史列表
   - 点击某次执行记录，查看详细的执行日志和响应

### 方法 2：在 Deployments 中查看 Functions 日志

1. **进入 Deployments 页面**
   - 在项目页面，点击顶部的 **Deployments** 标签

2. **选择部署**
   - 找到最新的部署（通常是最上面的）
   - 点击部署卡片进入详情

3. **查看 Functions**
   - 在部署详情页面，点击 **Functions** 标签
   - 找到 `/api/cron/*` 相关的函数

4. **查看执行日志**
   - 点击函数名称
   - 查看该函数的调用历史
   - 点击某次调用，查看详细的请求/响应日志

### 方法 3：使用 Vercel CLI 查看日志

```bash
# 安装 Vercel CLI（如果还没有）
npm i -g vercel

# 登录 Vercel
vercel login

# 查看项目日志
vercel logs

# 实时查看日志（类似 tail -f）
vercel logs --follow

# 查看特定函数的日志
vercel logs --function /api/cron/douban
```

### 方法 4：在代码中查看日志

所有 Cron API 都会输出详细的日志，包括：

- `[统一爬虫] 开始执行所有爬虫任务...`
- `[统一爬虫] 开始抓取 B站数据...`
- `[统一爬虫] B站数据已保存，共 X 条`
- `[统一爬虫] 开始抓取简书数据...`
- `[统一爬虫] 简书数据已保存，共 X 条`
- `[统一爬虫] 开始抓取豆瓣数据...`
- `[统一爬虫] 豆瓣数据已保存，共 X 条`
- `[统一爬虫] 开始抓取 YouTube 数据...`
- `[统一爬虫] YouTube 数据已保存，共 X 条`

这些日志会出现在：
- Vercel Dashboard 的 Functions 日志中
- Vercel CLI 的日志输出中

### 日志格式

每个 Cron API 会输出以下日志：

- `[Cron B站] 数据已保存到数据库，共 X 条`
- `[Cron 简书] 数据已保存到数据库，共 X 条`
- `[Cron 豆瓣] 数据已保存到数据库，共 X 条`
- `[Cron YouTube] 数据已保存到数据库，共 X 条`

## ⚙️ 配置步骤

### 1. 确保环境变量已设置

在 Vercel Dashboard 中设置以下环境变量：

- `TIDB_HOST` - TiDB 数据库主机
- `TIDB_PORT` - TiDB 数据库端口
- `TIDB_USER` - TiDB 数据库用户名
- `TIDB_PASSWORD` - TiDB 数据库密码
- `TIDB_DATABASE` - TiDB 数据库名称
- `CRON_SECRET` - Cron API 认证密钥（可选，但推荐）

### 2. 部署代码

代码已包含 Cron Jobs 配置，直接部署即可：

```bash
git push origin main
```

Vercel 会自动检测 `vercel.json` 中的 `crons` 配置并创建定时任务。

### 3. 验证 Cron Jobs

部署后，在 Vercel Dashboard 的 **Settings** > **Cron Jobs** 中应该能看到 4 个定时任务。

## 🐛 故障排除

### Cron Jobs 没有运行

1. **检查配置**：确认 `vercel.json` 中的 `crons` 配置正确
2. **检查部署**：确保最新代码已部署到 Vercel
3. **检查日志**：查看 Vercel Dashboard 中的 Cron Jobs 执行日志

### 数据没有保存到数据库

1. **检查数据库连接**：确认 TiDB 环境变量设置正确
2. **查看函数日志**：检查 Cron API 的执行日志，查看是否有错误
3. **手动测试**：手动调用 Cron API 测试数据保存功能

### 401 Unauthorized 错误

1. **检查 CRON_SECRET**：确认环境变量已设置
2. **检查请求头**：Vercel Cron Jobs 会自动添加认证，手动调用时需要手动添加

## 📝 注意事项

1. **免费计划限制**：
   - 最多 **2 个** Cron Jobs
   - 每个任务**每天最多触发一次**
   - 因此使用统一的 `/api/cron/all` API，将所有爬虫合并到一个任务中

2. **函数超时**：统一爬虫 API 的最大执行时间为 30 秒（如果超时，可以增加到 60 秒）

3. **数据去重**：数据库操作会自动去重（基于 URL 或其他唯一标识）

4. **错误处理**：如果某个平台的数据抓取失败，不会影响其他平台，所有结果都会在响应中返回

5. **执行时间**：由于免费计划限制每天只能执行一次，建议在 UTC 00:00（北京时间 08:00）执行，确保每天都有数据更新

6. **升级计划**：如果需要更频繁的执行（如每小时或每分钟），需要升级到 Vercel Pro 计划

## 🎯 最佳实践

1. **设置合理的频率**：根据数据更新频率设置 Cron 执行频率
2. **监控执行日志**：定期检查 Cron Jobs 的执行日志，确保正常运行
3. **设置告警**：如果可能，设置错误告警（需要 Pro 计划）
4. **测试环境**：在测试环境中先验证 Cron Jobs 配置

## 📚 相关文档

- [Vercel Cron Jobs 官方文档](https://vercel.com/docs/cron-jobs)
- [Cron 表达式语法](https://crontab.guru/)
- [TiDB 数据库配置](./TIDB_SETUP.md)

