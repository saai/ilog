#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import xml.etree.ElementTree as ET
from datetime import datetime
import os
import sys

class DoubanRSSFetcher:
    def __init__(self):
        self.user_id = '284853052'
        self.rss_url = f'https://www.douban.com/feed/people/{self.user_id}/interests'
        self.output_file = 'douban_rss_data.json'
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Cache-Control': 'no-cache'
        }

    def fetch_rss(self):
        """获取豆瓣RSS数据"""
        try:
            print(f"正在获取豆瓣RSS数据: {self.rss_url}")
            response = requests.get(self.rss_url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            # 解析XML
            root = ET.fromstring(response.content)
            
            # 获取频道信息
            channel = root.find('channel')
            if channel is None:
                raise Exception("无法找到RSS频道信息")
            
            # 解析items
            items = []
            for item in channel.findall('item'):
                title = item.find('title')
                link = item.find('link')
                pub_date = item.find('pubDate')
                description = item.find('description')
                
                item_data = {
                    'title': title.text if title is not None else '',
                    'url': link.text if link is not None else '',
                    'type': 'interest',
                    'rating': '',
                    'author': '',
                    'published': pub_date.text if pub_date is not None else '',
                    'formattedDate': self.format_date(pub_date.text) if pub_date is not None else '',
                    'description': description.text if description is not None else ''
                }
                items.append(item_data)
            
            return items
            
        except requests.RequestException as e:
            print(f"网络请求失败: {e}")
            return []
        except ET.ParseError as e:
            print(f"XML解析失败: {e}")
            return []
        except Exception as e:
            print(f"获取RSS数据失败: {e}")
            return []

    def format_date(self, date_string):
        """格式化日期"""
        try:
            if not date_string:
                return '未知时间'
            
            # 解析RSS日期格式 (RFC 822)
            date_obj = datetime.strptime(date_string, '%a, %d %b %Y %H:%M:%S %Z')
            now = datetime.now()
            diff = now - date_obj
            
            days = diff.days
            if days == 0:
                return '今天'
            elif days == 1:
                return '昨天'
            elif days < 7:
                return f'{days}天前'
            elif days < 30:
                weeks = days // 7
                return f'{weeks}周前'
            elif days < 365:
                months = days // 30
                return f'{months}个月前'
            else:
                years = days // 365
                return f'{years}年前'
                
        except Exception as e:
            print(f"日期格式化失败: {e}")
            return '未知时间'

    def save_data(self, collections):
        """保存数据到JSON文件"""
        data = {
            'collections': collections,
            'total': len(collections),
            'user': {
                'id': self.user_id,
                'nickname': 'Saai'
            },
            'fetched_at': datetime.now().isoformat()
        }
        
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"数据已保存到: {self.output_file}")
            print(f"共获取 {len(collections)} 条收藏数据")
            return True
        except Exception as e:
            print(f"保存数据失败: {e}")
            return False

    def get_mock_data(self):
        """返回模拟数据"""
        return [
            {
                'title': '最近在读禅与摩托车维修艺术',
                'url': 'https://book.douban.com/subject/30208077/',
                'type': 'interest',
                'rating': '',
                'author': '',
                'published': datetime.now().isoformat(),
                'formattedDate': '今天',
                'description': '正在阅读的书籍'
            },
            {
                'title': '想看布达拉宫',
                'url': 'https://movie.douban.com/subject/35561839/',
                'type': 'interest',
                'rating': '',
                'author': '',
                'published': datetime.now().isoformat(),
                'formattedDate': '今天',
                'description': '想看的电影'
            }
        ]

    def run(self):
        """运行抓取程序"""
        print("开始抓取豆瓣RSS数据...")
        
        # 获取RSS数据
        collections = self.fetch_rss()
        
        # 如果获取失败，使用模拟数据
        if not collections:
            print("RSS获取失败，使用模拟数据")
            collections = self.get_mock_data()
        
        # 保存数据
        success = self.save_data(collections)
        
        if success:
            print("✅ 豆瓣RSS数据抓取完成！")
        else:
            print("❌ 数据保存失败")
        
        return success

def main():
    fetcher = DoubanRSSFetcher()
    fetcher.run()

if __name__ == "__main__":
    main() 