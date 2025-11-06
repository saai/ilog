#!/usr/bin/env python3
"""
豆瓣爬虫测试脚本
"""

import json
import os
from fetch_douban import DoubanSpider

def test_spider():
    """测试爬虫功能"""
    print("🧪 开始测试豆瓣爬虫...")
    
    spider = DoubanSpider()
    success = spider.run()
    
    if success:
        # 检查生成的JSON文件
        if os.path.exists("douban_collections.json"):
            with open("douban_collections.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print(f"✅ 测试成功！")
            print(f"📊 获取到 {data['total_collections']} 个收藏")
            print(f"🕐 数据获取时间: {data['fetched_at']}")
            
            if data['collections']:
                print("\n📚 最新收藏:")
                for i, collection in enumerate(data['collections'][:3]):
                    print(f"  {i+1}. {collection['title']}")
                    print(f"     类型: {collection['type']}")
                    print(f"     链接: {collection['url']}")
                    if collection['type'] == 'book':
                        print(f"     作者: {collection['author']}")
                        print(f"     评分: {collection['rating']}")
                    elif collection['type'] == 'movie':
                        print(f"     导演: {collection['director']}")
                        print(f"     评分: {collection['rating']}")
                    print()
        else:
            print("❌ JSON文件未生成")
    else:
        print("❌ 爬虫运行失败")

if __name__ == "__main__":
    test_spider() 