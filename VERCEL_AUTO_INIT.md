# Vercel 自动初始化爬虫配置

本指南说明如何配置 Vercel 在部署成功后自动运行初始化爬虫。

## 🎯 方法一：使用 Vercel Deployment Hooks（推荐）

### 步骤 1: 在 Vercel Dashboard 配置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 进入你的项目 `ilog`
3. 点击 **Settings** → **Git**
4. 滚动到 **Deployment Hooks** 部分
5. 点击 **Create Hook**
6. 配置如下：
   - **Name**: `Initialize Crawlers`
   - **Hook URL**: `https://your-domain.vercel.app/api/init`
   - **Events**: 选择 `Production Deployment` 和 `Preview Deployment`（可选）
   - **Secret**: 设置 `CRON_SECRET` 环境变量，然后在 Header 中添加：
     ```
     Authorization: Bearer ${CRON_SECRET}
     ```

### 步骤 2: 测试

部署项目后，Vercel 会自动调用 `/api/init` 来初始化所有爬虫。

## 🎯 方法二：使用 GitHub Actions

### 步骤 1: 配置 GitHub Secrets

1. 进入 GitHub 仓库 `saai/ilog`
2. 点击 **Settings** → **Secrets and variables** → **Actions**
3. 添加 Secret：
   - **Name**: `CRON_SECRET`
   - **Value**: 你的 CRON_SECRET 值

### 步骤 2: 配置 Vercel Webhook

1. 在 Vercel Dashboard 中，进入项目设置
2. 点击 **Settings** → **Git**
3. 滚动到 **Deployment Notifications**
4. 添加 Webhook：
   - **URL**: `https://api.github.com/repos/saai/ilog/dispatches`
   - **Events**: 选择 `Production Deployment`
   - **Secret**: 使用 GitHub Personal Access Token

### 步骤 3: 手动触发（临时方案）

如果自动触发不工作，可以手动触发：

```bash
# 在 GitHub Actions 中手动运行 workflow
# 或者直接调用 API
curl https://your-domain.vercel.app/api/init
```

## 🎯 方法三：使用 Vercel CLI（本地部署）

如果你使用 Vercel CLI 部署，可以在部署后自动运行：

```bash
# 部署
vercel --prod

# 自动初始化
curl https://your-domain.vercel.app/api/init
```

或者创建一个脚本：

```bash
#!/bin/bash
vercel --prod
sleep 10  # 等待部署完成
curl https://your-domain.vercel.app/api/init
```

## 🔧 验证配置

部署后，检查以下内容：

1. **查看 Vercel 函数日志**：
   - 在 Vercel Dashboard 中查看 Functions 日志
   - 应该能看到 `/api/init` 的调用记录

2. **检查爬虫结果**：
   ```bash
   curl https://your-domain.vercel.app/api/bilibili-videos
   curl https://your-domain.vercel.app/api/jianshu-articles
   ```

3. **查看初始化结果**：
   ```bash
   curl https://your-domain.vercel.app/api/init
   ```

## 📝 注意事项

1. **首次部署**：首次部署时，可能需要手动调用一次 `/api/init`
2. **环境变量**：确保 `CRON_SECRET` 已正确设置（如果使用认证）
3. **超时设置**：初始化 API 的最大执行时间为 60 秒
4. **错误处理**：如果初始化失败，可以随时手动调用 API

## 🚀 快速开始

最简单的方式：

1. 部署项目到 Vercel
2. 手动调用一次：
   ```bash
   curl https://your-domain.vercel.app/api/init
   ```
3. 后续如果需要更新数据，再次调用即可

## 🔗 相关文档

- [Vercel Deployment Hooks](https://vercel.com/docs/concepts/git/deploy-hooks)
- [GitHub Actions](https://docs.github.com/en/actions)
- [CRON_API_README.md](./CRON_API_README.md) - 爬虫 API 详细说明

