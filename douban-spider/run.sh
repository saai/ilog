#!/bin/bash

echo "🚀 开始运行豆瓣收藏数据爬虫..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装Python3"
    exit 1
fi

# 安装依赖
echo "📦 安装Python依赖..."
pip3 install -r requirements.txt

# 运行爬虫
echo "🕷️ 开始爬取豆瓣收藏数据..."
python3 fetch_douban.py

echo "✅ 豆瓣爬虫运行完成！" 