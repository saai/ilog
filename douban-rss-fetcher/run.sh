#!/bin/bash

echo "🌱 开始抓取豆瓣RSS数据..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装"
    exit 1
fi

# 安装依赖
echo "📦 安装Python依赖..."
pip3 install -r requirements.txt

# 运行抓取脚本
echo "🚀 运行豆瓣RSS抓取脚本..."
python3 fetch_douban_rss.py

echo "✅ 豆瓣RSS数据抓取完成！" 