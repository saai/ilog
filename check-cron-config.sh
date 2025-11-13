#!/bin/bash

echo "🔍 检查 Vercel Cron Jobs 配置..."
echo ""

# 检查 vercel.json 是否存在
if [ ! -f "vercel.json" ]; then
  echo "❌ vercel.json 文件不存在！"
  exit 1
fi

echo "✅ vercel.json 文件存在"

# 检查是否包含 crons 配置
if grep -q '"crons"' vercel.json; then
  echo "✅ vercel.json 包含 crons 配置"
else
  echo "❌ vercel.json 不包含 crons 配置"
  exit 1
fi

# 检查 API 路由是否存在
echo ""
echo "📁 检查 API 路由文件..."

routes=(
  "app/api/cron/bilibili/route.ts"
  "app/api/cron/jianshu/route.ts"
  "app/api/cron/douban/route.ts"
  "app/api/cron/youtube/route.ts"
)

all_exist=true
for route in "${routes[@]}"; do
  if [ -f "$route" ]; then
    echo "✅ $route 存在"
  else
    echo "❌ $route 不存在"
    all_exist=false
  fi
done

echo ""
if [ "$all_exist" = true ]; then
  echo "✅ 所有配置检查通过！"
  echo ""
  echo "📋 下一步："
  echo "1. 确保代码已推送到 GitHub: git push origin main"
  echo "2. 在 Vercel Dashboard 中触发重新部署"
  echo "3. 等待部署完成后，在 Settings > Cron Jobs 中查看"
else
  echo "❌ 部分文件缺失，请检查配置"
  exit 1
fi

