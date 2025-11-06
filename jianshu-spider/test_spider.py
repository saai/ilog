#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简书爬虫测试脚本
用于测试爬虫功能是否正常工作
"""

import json
import os
from fetch_jianshu import JianshuSpider

def test_spider():
    """测试爬虫功能"""
    print("🧪 开始测试简书爬虫...")
    
    # 创建测试用的用户ID（可以替换为您的真实ID）
    test_user_id = "763ffbb1b873"
    
    try:
        # 创建爬虫实例
        spider = JianshuSpider(test_user_id)
        
        # 测试抓取少量文章
        articles = spider.run(max_articles=3)
        
        if articles:
            print("✅ 测试成功！")
            print(f"📊 抓取到 {len(articles)} 篇文章")
            
            # 显示抓取到的文章
            for i, article in enumerate(articles, 1):
                print(f"  {i}. {article['title']}")
                print(f"     链接: {article['link']}")
            
            # 检查JSON文件是否生成
            json_file = "jianshu_articles.json"
            if os.path.exists(json_file):
                print(f"📁 JSON文件已生成: {json_file}")
                
                # 读取并验证JSON文件
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print(f"📋 JSON文件包含 {data.get('total_articles', 0)} 篇文章")
            else:
                print("❌ JSON文件未生成")
                
        else:
            print("❌ 测试失败：未能抓取到任何文章")
            
    except Exception as e:
        print(f"❌ 测试过程中出错: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_spider()
    if success:
        print("\n🎉 所有测试通过！爬虫可以正常使用。")
    else:
        print("\n�� 测试失败，请检查配置和环境。") 