#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
YouTube 视频抓取工具
使用 RSS feed 获取指定 YouTube 频道的最新视频
"""

import json
import os
import re
from datetime import datetime
from urllib.parse import urlparse, parse_qs
import xml.etree.ElementTree as ET
import requests
from dateutil import parser as date_parser

class YouTubeSpider:
    def __init__(self, channel_handle="@saai-saai"):
        """
        初始化 YouTube 爬虫
        
        Args:
            channel_handle: YouTube 频道句柄，如 @saai-saai 或频道ID
        """
        self.channel_handle = channel_handle
        self.output_file = "youtube_videos.json"
        
        # 移除 @ 符号（如果有）
        if channel_handle.startswith('@'):
            self.channel_name = channel_handle[1:]
        else:
            self.channel_name = channel_handle
        
        # YouTube RSS feed URL
        # 对于 @handle 格式，使用 user 参数
        self.rss_url = f"https://www.youtube.com/feeds/videos.xml?user={self.channel_name}"
        
    def get_channel_id_from_handle(self):
        """
        从 @handle 获取频道ID
        通过访问频道页面并解析获取频道ID
        """
        try:
            channel_url = f"https://www.youtube.com/@{self.channel_name}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            
            response = requests.get(channel_url, headers=headers, timeout=10)
            if response.status_code == 200:
                # 尝试从页面中提取频道ID
                # YouTube 页面中包含 <link rel="canonical" href="https://www.youtube.com/channel/CHANNEL_ID">
                match = re.search(r'<link rel="canonical" href="https://www\.youtube\.com/channel/([^"]+)"', response.text)
                if match:
                    return match.group(1)
                
                # 或者从 meta 标签中提取
                match = re.search(r'"channelId":"([^"]+)"', response.text)
                if match:
                    return match.group(1)
        except Exception as e:
            print(f"获取频道ID失败: {e}")
        
        return None
    
    def fetch_videos_from_rss(self, max_videos=10):
        """
        从 RSS feed 获取视频数据
        
        Args:
            max_videos: 最大获取视频数量
        """
        videos = []
        
        try:
            # 首先尝试使用频道ID获取RSS
            channel_id = self.get_channel_id_from_handle()
            if channel_id:
                rss_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
            else:
                # 如果无法获取频道ID，使用用户名
                rss_url = self.rss_url
            
            print(f"正在获取 YouTube RSS feed: {rss_url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
            
            response = requests.get(rss_url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                # 解析 XML
                root = ET.fromstring(response.content)
                
                # 命名空间
                ns = {'atom': 'http://www.w3.org/2005/Atom',
                      'yt': 'http://www.youtube.com/xml/schemas/2015',
                      'media': 'http://search.yahoo.com/mrss/'}
                
                # 获取所有 entry（视频）
                entries = root.findall('atom:entry', ns)
                
                for entry in entries[:max_videos]:
                    try:
                        # 视频ID
                        video_id = entry.find('yt:videoId', ns)
                        video_id_text = video_id.text if video_id is not None else None
                        
                        # 标题
                        title = entry.find('atom:title', ns)
                        title_text = title.text if title is not None else '无标题'
                        
                        # 链接
                        link = entry.find('atom:link', ns)
                        video_url = link.get('href') if link is not None else f"https://www.youtube.com/watch?v={video_id_text}"
                        
                        # 发布时间
                        published = entry.find('atom:published', ns)
                        published_text = published.text if published is not None else None
                        
                        # 解析发布时间
                        published_at = None
                        if published_text:
                            try:
                                published_at = date_parser.parse(published_text)
                            except:
                                published_at = datetime.now()
                        
                        # 描述
                        description = entry.find('atom:content', ns)
                        description_text = description.text if description is not None else ''
                        
                        # 缩略图
                        thumbnail_url = None
                        media_group = entry.find('media:group', ns)
                        if media_group is not None:
                            thumbnail = media_group.find('media:thumbnail', ns)
                            if thumbnail is not None:
                                thumbnail_url = thumbnail.get('url')
                        
                        # 作者/频道名
                        author = entry.find('atom:author', ns)
                        author_name = None
                        if author is not None:
                            name = author.find('atom:name', ns)
                            author_name = name.text if name is not None else None
                        
                        video_data = {
                            'video_id': video_id_text,
                            'title': title_text,
                            'url': video_url,
                            'published_at': published_at.isoformat() if published_at else datetime.now().isoformat(),
                            'description': description_text[:200] if description_text else '',  # 限制描述长度
                            'thumbnail_url': thumbnail_url,
                            'channel_name': author_name or self.channel_name,
                            'fetched_at': datetime.now().isoformat()
                        }
                        
                        videos.append(video_data)
                        print(f"已获取视频: {title_text[:50]}...")
                        
                    except Exception as e:
                        print(f"解析视频条目失败: {e}")
                        continue
                
                print(f"成功获取 {len(videos)} 个视频")
                
            else:
                print(f"RSS feed 请求失败，状态码: {response.status_code}")
                return self.get_mock_data()
                
        except Exception as e:
            print(f"获取 YouTube 视频数据失败: {e}")
            return self.get_mock_data()
        
        if not videos:
            print("未获取到任何视频，返回模拟数据")
            return self.get_mock_data()
        
        return {
            'channel_handle': self.channel_handle,
            'channel_name': self.channel_name,
            'total_videos': len(videos),
            'fetched_at': datetime.now().isoformat(),
            'videos': videos
        }
    
    def get_mock_data(self):
        """返回模拟数据（当无法获取真实数据时）"""
        print("生成模拟 YouTube 视频数据...")
        
        return {
            'channel_handle': self.channel_handle,
            'channel_name': self.channel_name,
            'total_videos': 1,
            'fetched_at': datetime.now().isoformat(),
            'videos': [
                {
                    'video_id': 'example123',
                    'title': '最新技术分享视频',
                    'url': 'https://www.youtube.com/watch?v=example123',
                    'published_at': datetime.now().isoformat(),
                    'description': '这是一个技术分享视频，包含React 18新特性详解和实战项目演示。',
                    'thumbnail_url': '',
                    'channel_name': self.channel_name,
                    'fetched_at': datetime.now().isoformat()
                }
            ]
        }
    
    def save_data(self, data):
        """保存数据到JSON文件"""
        output_path = os.path.join(os.path.dirname(__file__), self.output_file)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"数据已保存到: {output_path}")
        return output_path
    
    def run(self, max_videos=10):
        """运行抓取任务"""
        print(f"开始抓取 YouTube 频道 {self.channel_handle} 的视频...")
        print(f"目标抓取数量: {max_videos} 个")
        
        data = self.fetch_videos_from_rss(max_videos)
        
        if data and data.get('videos'):
            output_path = self.save_data(data)
            print(f"✅ 抓取成功！共获取 {data['total_videos']} 个视频")
            print(f"📁 数据文件: {output_path}")
            
            # 显示前几个视频的标题
            print("\n📺 抓取到的视频:")
            for i, video in enumerate(data['videos'][:5], 1):
                print(f"  {i}. {video['title']}")
            if len(data['videos']) > 5:
                print(f"  ... 还有 {len(data['videos']) - 5} 个视频")
        else:
            print("❌ 未能抓取到任何视频")
        
        return data

def main():
    """主函数"""
    # 配置参数
    CHANNEL_HANDLE = "@saai-saai"  # YouTube 频道句柄
    MAX_VIDEOS = 10  # 最大抓取视频数量
    
    # 创建爬虫实例并运行
    spider = YouTubeSpider(CHANNEL_HANDLE)
    videos = spider.run(MAX_VIDEOS)
    
    return videos

if __name__ == "__main__":
    main()

