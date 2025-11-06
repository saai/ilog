#!/bin/bash

echo "🔄 开始每日数据更新任务..."
echo "📅 更新时间: $(date)"

# 设置工作目录
cd "$(dirname "$0")"

# 更新豆瓣RSS数据 (Python版本)
echo "🌱 更新豆瓣RSS数据 (Python)..."
cd douban-rss-fetcher
if [ -f "run.sh" ]; then
    chmod +x run.sh
    ./run.sh
    # 复制生成的JSON文件到项目根目录
    if [ -f "douban_rss_data.json" ]; then
        cp douban_rss_data.json ../
        echo "✅ 豆瓣RSS数据已复制到项目根目录"
    fi
else
    echo "❌ 豆瓣RSS抓取脚本不存在"
fi
cd ..

# 更新豆瓣RSS数据 (Node.js版本，备用)
echo "🌱 更新豆瓣RSS数据 (Node.js，备用)..."
if [ -f "fetch_douban_rss.js" ]; then
    node fetch_douban_rss.js
else
    echo "❌ Node.js豆瓣RSS抓取脚本不存在"
fi

# 更新简书数据
echo "📝 更新简书文章数据..."
cd jianshu-spider
if [ -f "run.sh" ]; then
    chmod +x run.sh
    ./run.sh
else
    echo "❌ 简书爬虫脚本不存在"
fi
cd ..

# 更新B站数据
echo "📱 更新B站视频数据..."
cd bilibili-spider
if [ -f "run.sh" ]; then
    chmod +x run.sh
    ./run.sh
else
    echo "❌ B站爬虫脚本不存在"
fi
cd ..

# 更新豆瓣数据
echo "📚 更新豆瓣收藏数据..."
cd douban-spider
if [ -f "run.sh" ]; then
    chmod +x run.sh
    ./run.sh
else
    echo "❌ 豆瓣爬虫脚本不存在"
fi
cd ..

# 更新YouTube数据
echo "📺 更新YouTube视频数据..."
cd youtube-spider
if [ -f "run.sh" ]; then
    chmod +x run.sh
    ./run.sh
else
    echo "❌ YouTube爬虫脚本不存在"
fi
cd ..

echo "✅ 每日数据更新任务完成！"
echo "�� 数据更新时间: $(date)" 