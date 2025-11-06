#!/bin/bash

# 简书爬虫快速启动脚本

echo "🚀 简书文章抓取工具"
echo "=================="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3，请先安装Python"
    exit 1
fi

# 检查是否在正确的目录
if [ ! -f "fetch_jianshu.py" ]; then
    echo "❌ 错误: 请在jianshu-spider目录下运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装Python依赖..."
pip3 install -r requirements.txt

# 运行爬虫
echo "🕷️ 开始抓取简书文章..."
python3 fetch_jianshu.py

# 检查结果
if [ -f "jianshu_articles.json" ]; then
    echo "✅ 抓取完成！"
    echo "📁 数据文件: jianshu_articles.json"
    echo ""
    echo "📝 抓取到的文章预览:"
    python3 -c "
import json
try:
    with open('jianshu_articles.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        articles = data.get('articles', [])
        for i, article in enumerate(articles[:5], 1):
            print(f'  {i}. {article[\"title\"]}')
        if len(articles) > 5:
            print(f'  ... 还有 {len(articles) - 5} 篇文章')
except Exception as e:
    print(f'读取文件时出错: {e}')
"
else
    echo "❌ 抓取失败，请检查网络连接和用户ID"
fi 