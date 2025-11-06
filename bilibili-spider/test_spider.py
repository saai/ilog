#!/usr/bin/env python3
"""
B站爬虫测试脚本
"""

import json
import os
from fetch_bilibili import BilibiliSpider

def test_spider():
    """测试爬虫功能"""
    print("🧪 开始测试B站爬虫...")
    
    spider = BilibiliSpider()
    success = spider.run()
    
    if success:
        # 检查生成的JSON文件
        if os.path.exists("bilibili_videos.json"):
            with open("bilibili_videos.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"✅ 测试成功！")
            print(f"📊 获取到 {data['total_videos']} 个视频")
            print(f"🕐 数据获取时间: {data['fetched_at']}")
            
            if data['videos']:
                print("\n📺 最新视频:")
                for i, video in enumerate(data['videos'][:3]):
                    print(f"  {i+1}. {video['title']}")
                    print(f"     链接: {video['url']}")
                    print(f"     发布时间: {video['publish_time']}")
                    print(f"     播放量: {video['play_count']}")
                    print()
        else:
            print("❌ JSON文件未生成")
    else:
        print("❌ 爬虫运行失败")

if __name__ == "__main__":
    test_spider() 