# Vercel Cron Jobs 故障排除指南

## 🔍 为什么看不到 Cron Jobs？

如果在 Vercel Dashboard 的 Settings > Cron Jobs 中看不到任何任务，请按以下步骤排查：

### 1. 确认 vercel.json 已正确配置

检查项目根目录的 `vercel.json` 文件是否包含 `crons` 配置：

```json
{
  "crons": [
    {
      "path": "/api/cron/bilibili",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/jianshu",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/douban",
      "schedule": "* * * * *"
    },
    {
      "path": "/api/cron/youtube",
      "schedule": "* * * * *"
    }
  ]
}
```

### 2. 确认代码已部署

**重要**：Vercel 只在部署时读取 `vercel.json` 配置。如果刚刚添加了 cron 配置，需要：

1. **确认代码已推送到 GitHub**
   ```bash
   git status
   git log --oneline -5
   ```

2. **触发新的部署**
   - 如果使用 GitHub 集成，推送代码会自动触发部署
   - 或者手动在 Vercel Dashboard 中点击 "Redeploy"

3. **等待部署完成**
   - 在 Vercel Dashboard 的 Deployments 页面查看部署状态
   - 确保最新部署包含 `vercel.json` 的更改

### 3. 验证部署是否包含 vercel.json

在 Vercel Dashboard 中：

1. 进入 **Deployments** 页面
2. 点击最新的部署
3. 查看部署详情，确认 `vercel.json` 文件被包含在部署中

### 4. 检查 Vercel 计划限制

- **免费计划**：支持 Cron Jobs，但可能有频率限制
- **Pro 计划**：无限制

即使有频率限制，Cron Jobs 仍然应该显示在 Dashboard 中。

### 5. 使用 Vercel CLI 验证配置

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 验证配置（不部署）
vercel inspect

# 或者直接部署以触发配置读取
vercel --prod
```

### 6. 手动触发部署

如果自动部署没有触发，可以：

1. **在 Vercel Dashboard 中手动触发**
   - 进入项目页面
   - 点击 **Deployments** 标签
   - 找到包含最新 `vercel.json` 的提交
   - 点击 "..." 菜单 → "Redeploy"

2. **使用 Vercel CLI**
   ```bash
   vercel --prod
   ```

### 7. 检查 API 路由是否存在

确保以下 API 路由文件存在：

- `app/api/cron/bilibili/route.ts`
- `app/api/cron/jianshu/route.ts`
- `app/api/cron/douban/route.ts`
- `app/api/cron/youtube/route.ts`

### 8. 验证 Cron Jobs 是否实际运行

即使 Dashboard 中看不到，Cron Jobs 可能仍在运行。可以通过以下方式验证：

1. **查看 Functions 日志**
   - 进入 **Deployments** → 最新部署 → **Functions**
   - 查找 `/api/cron/*` 函数的调用记录
   - 如果看到定期调用，说明 Cron Jobs 正在运行

2. **查看数据库数据**
   - 如果数据库中有新数据，说明 Cron Jobs 正在工作

3. **手动测试 API**
   ```bash
   curl https://your-domain.vercel.app/api/cron/douban
   ```

## 🛠️ 解决方案

### 方案 1：重新部署（推荐）

1. 确保 `vercel.json` 已提交到 Git
2. 推送到 GitHub：
   ```bash
   git push origin main
   ```
3. 等待自动部署完成
4. 或者手动在 Vercel Dashboard 中触发重新部署

### 方案 2：使用 Vercel CLI 部署

```bash
# 确保在项目根目录
cd /Users/yansha/Documents/ilog

# 部署到生产环境
vercel --prod

# 部署完成后，检查 Cron Jobs
vercel inspect
```

### 方案 3：检查部署日志

在 Vercel Dashboard 中：

1. 进入 **Deployments** 页面
2. 点击最新的部署
3. 查看 **Build Logs**
4. 确认没有关于 `vercel.json` 或 Cron Jobs 的错误

### 方案 4：联系 Vercel 支持

如果以上方法都不行：

1. 在 Vercel Dashboard 中提交支持请求
2. 提供以下信息：
   - 项目名称
   - 部署 URL
   - `vercel.json` 内容
   - 截图说明问题

## 📝 验证清单

- [ ] `vercel.json` 文件存在于项目根目录
- [ ] `vercel.json` 包含 `crons` 配置
- [ ] Cron 路径指向存在的 API 路由
- [ ] 代码已推送到 GitHub
- [ ] 最新部署已完成
- [ ] 在 Vercel Dashboard 中检查了 Settings > Cron Jobs
- [ ] 在 Deployments > Functions 中检查了 API 调用记录

## 🔗 相关资源

- [Vercel Cron Jobs 官方文档](https://vercel.com/docs/cron-jobs)
- [Vercel Cron Jobs 使用和定价](https://vercel.com/docs/cron-jobs#usage-and-pricing)
- [Vercel CLI 文档](https://vercel.com/docs/cli)

