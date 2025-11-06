#!/bin/bash

# YouTube 视频数据爬虫运行脚本

echo "开始运行 YouTube 视频数据爬虫..."

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 python3，请先安装 Python 3"
    exit 1
fi

# 进入脚本目录
cd "$(dirname "$0")"

# 检查并安装依赖
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

echo "激活虚拟环境并安装依赖..."
source venv/bin/activate
pip install -q -r requirements.txt

# 运行爬虫
echo "运行 YouTube 爬虫..."
python3 fetch_youtube.py

# 检查结果
if [ $? -eq 0 ]; then
    echo "✅ YouTube 视频数据爬取完成"
else
    echo "❌ YouTube 视频数据爬取失败"
    exit 1
fi

