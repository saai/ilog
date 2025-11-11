#!/usr/bin/env python3
"""
B站视频数据爬虫
使用Selenium获取指定用户的最新视频信息
"""

import json
import time
import os
import re
import requests
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BilibiliSpider:
    def __init__(self, user_id="472773672", use_dynamic=False, use_space=False):
        self.user_id = user_id
        # 支持从用户空间主页、动态页面或上传页面抓取
        if use_space:
            self.base_url = f"https://space.bilibili.com/{user_id}"
        elif use_dynamic:
            self.base_url = f"https://space.bilibili.com/{user_id}/dynamic"
        else:
            self.base_url = f"https://space.bilibili.com/{user_id}/upload/video"
        self.use_dynamic = use_dynamic
        self.use_space = use_space
        self.output_file = "bilibili_videos.json"
        self.driver = None
        
    def setup_driver(self):
        """设置Chrome驱动"""
        try:
            # 尝试使用webdriver-manager自动下载
            service = Service(ChromeDriverManager().install())
            options = Options()
            options.add_argument('--headless')  # 无头模式
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            
            self.driver = webdriver.Chrome(service=service, options=options)
            logger.info("Chrome驱动设置成功")
            return True
        except Exception as e:
            logger.warning(f"自动下载Chrome驱动失败: {e}")
            
            # 尝试使用系统ChromeDriver
            try:
                options = Options()
                options.add_argument('--headless')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-dev-shm-usage')
                options.add_argument('--disable-gpu')
                options.add_argument('--window-size=1920,1080')
                options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
                
                self.driver = webdriver.Chrome(options=options)
                logger.info("使用系统ChromeDriver成功")
                return True
            except Exception as e2:
                logger.error(f"系统ChromeDriver也失败: {e2}")
                return False
    
    def parse_publish_time(self, time_str):
        """解析B站相对时间为datetime对象"""
        if not time_str:
            return None
        
        now = datetime.now()
        time_str = time_str.strip()
        
        try:
            if "今天" in time_str or "刚刚" in time_str:
                return now
            elif "昨天" in time_str:
                return now - timedelta(days=1)
            elif "天前" in time_str:
                days = int(time_str.replace("天前", ""))
                return now - timedelta(days=days)
            elif "周前" in time_str or "周前" in time_str:
                weeks = int(time_str.replace("周前", "").replace("周前", ""))
                return now - timedelta(weeks=weeks)
            elif "月前" in time_str:
                months = int(time_str.replace("个月前", ""))
                return now - timedelta(days=months * 30)
            elif "年前" in time_str:
                years = int(time_str.replace("年前", ""))
                return now - timedelta(days=years * 365)
            else:
                # 尝试解析标准日期格式
                for fmt in ['%Y-%m-%d', '%Y/%m/%d', '%m-%d', '%m/%d']:
                    try:
                        date = datetime.strptime(time_str, fmt)
                        if date.year == 1900:  # 如果没有年份，使用当前年份
                            date = date.replace(year=now.year)
                        return date
                    except:
                        continue
        except:
            pass
        
        return None
    
    def extract_bvid(self, url):
        """从URL中提取BV号"""
        if not url:
            return None
        match = re.search(r'BV[a-zA-Z0-9]+', url)
        return match.group() if match else None
    
    def get_video_publish_time_from_api(self, bvid):
        """通过B站API获取视频发布时间"""
        if not bvid:
            return None
        
        try:
            # 使用B站API获取视频信息
            api_url = f"https://api.bilibili.com/x/web-interface/view?bvid={bvid}"
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.bilibili.com/'
            }
            
            response = requests.get(api_url, headers=headers, timeout=5)
            if response.status_code == 200:
                data = response.json()
                if data.get('code') == 0 and data.get('data'):
                    # 获取发布时间（Unix时间戳）
                    pubdate = data['data'].get('pubdate')
                    if pubdate:
                        # 转换为datetime对象
                        publish_time = datetime.fromtimestamp(pubdate)
                        logger.info(f"从API获取到视频 {bvid} 的发布时间: {publish_time.isoformat()}")
                        return publish_time
        except Exception as e:
            logger.warning(f"从API获取视频 {bvid} 发布时间失败: {e}")
        
        return None
    
    def get_video_publish_time_from_page(self, video_url):
        """从视频详情页获取发布时间"""
        if not video_url or not self.driver:
            return None
        
        try:
            logger.info(f"访问视频详情页获取发布时间: {video_url}")
            self.driver.get(video_url)
            time.sleep(2)  # 等待页面加载
            
            # 尝试多个选择器获取发布时间
            time_selectors = [
                ".video-info-pubdate",
                ".pubdate",
                "[class*='pubdate']",
                "[class*='publish-time']",
                ".video-data-info .pubdate-text",
                "span[title*='发布']",
                ".video-info-detail .pubdate"
            ]
            
            for selector in time_selectors:
                try:
                    element = self.driver.find_element(By.CSS_SELECTOR, selector)
                    time_text = element.text or element.get_attribute("title") or element.get_attribute("textContent")
                    if time_text:
                        # 尝试解析时间文本
                        published_at = self.parse_publish_time(time_text)
                        if published_at:
                            logger.info(f"从页面获取到发布时间: {time_text} -> {published_at.isoformat()}")
                            return published_at
                except:
                    continue
            
            # 尝试从页面源码中查找时间戳
            try:
                page_source = self.driver.page_source
                # 查找 pubdate 或 publishTime
                pubdate_match = re.search(r'"pubdate":\s*(\d+)', page_source)
                if pubdate_match:
                    timestamp = int(pubdate_match.group(1))
                    publish_time = datetime.fromtimestamp(timestamp)
                    logger.info(f"从页面源码获取到发布时间: {publish_time.isoformat()}")
                    return publish_time
            except:
                pass
                
        except Exception as e:
            logger.warning(f"从视频详情页获取发布时间失败: {e}")
        
        return None
    
    def get_video_publish_time(self, video_url):
        """获取视频发布时间（优先使用API，失败则使用页面）"""
        bvid = self.extract_bvid(video_url)
        if not bvid:
            return None
        
        # 首先尝试使用API
        publish_time = self.get_video_publish_time_from_api(bvid)
        if publish_time:
            return publish_time
        
        # API失败则尝试从页面获取
        publish_time = self.get_video_publish_time_from_page(video_url)
        if publish_time:
            return publish_time
        
        return None
    
    def fetch_videos(self):
        """获取B站视频数据"""
        if not self.setup_driver():
            logger.error("无法设置Chrome驱动，返回模拟数据")
            return self.get_mock_data()
        
        try:
            logger.info(f"开始访问B站用户页面: {self.base_url}")
            self.driver.get(self.base_url)
            
            # 等待页面加载
            wait = WebDriverWait(self.driver, 10)
            
            # 等待页面加载完成
            time.sleep(3)  # 给页面一些时间加载
            
            # 等待视频列表加载，尝试多个选择器
            video_elements = []
            if self.use_space:
                # 用户空间主页的选择器
                selectors = [
                    ".space-video-item",
                    ".video-item",
                    "[class*='space-video']",
                    "[class*='video-card']",
                    ".bili-video-card",
                    ".video-card",
                    "[class*='video-item']",
                    ".video-list-item",
                    "li[class*='video']",
                    ".item[class*='video']",
                    "[data-aid]",  # B站视频的data-aid属性
                    "[data-bvid]"  # B站视频的data-bvid属性
                ]
            elif self.use_dynamic:
                # 动态页面的选择器
                selectors = [
                    ".bili-dyn-item[data-type='8']",  # 视频动态类型
                    ".bili-dyn-item-video",
                    ".dyn-item[data-type='8']",
                    "[class*='dyn-item'][data-type='8']",
                    ".bili-dyn-card-video",
                    ".dyn-card-video",
                    "[class*='video-card']",
                    "[class*='dyn-video']"
                ]
            else:
                # 上传页面的选择器
                selectors = [
                    ".bili-video-card",
                    ".video-card",
                    ".upload-video-item",
                    "[class*='video-card']",
                    "[class*='video-item']",
                    ".video-list-item",
                    "li[class*='video']",
                    ".item[class*='video']"
                ]
            
            for selector in selectors:
                try:
                    video_elements = wait.until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, selector))
                    )
                    if video_elements:
                        logger.info(f"使用选择器 '{selector}' 找到 {len(video_elements)} 个视频元素")
                        break
                except:
                    continue
            
            # 如果还是没找到，尝试直接查找
            if not video_elements:
                logger.warning("使用标准选择器未找到视频，尝试通用查找")
                for selector in selectors:
                    video_elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    if video_elements:
                        logger.info(f"使用通用查找找到 {len(video_elements)} 个视频元素")
                        break
            
            videos = []
            seen_urls = set()  # 用于去重
            
            for i, element in enumerate(video_elements[:30]):  # 获取前30个视频（去重后可能更少）
                try:
                    # 获取视频标题 - 尝试多个选择器
                    title = ""
                    if self.use_space:
                        # 用户空间主页的标题选择器
                        title_selectors = [
                            ".title",
                            ".video-title",
                            "a[title]",
                            "[class*='title']",
                            ".bili-video-card__info--tit",
                            "h3",
                            "h4",
                            ".name",
                            "[class*='name']"
                        ]
                    elif self.use_dynamic:
                        # 动态页面的标题选择器
                        title_selectors = [
                            ".bili-dyn-content__text",
                            ".dyn-content__text",
                            ".bili-dyn-title",
                            ".dyn-title",
                            ".bili-video-card__info--tit",
                            ".video-title",
                            ".title",
                            "a[title]",
                            "[class*='title']",
                            "h3",
                            "h4"
                        ]
                    else:
                        # 上传页面的标题选择器
                        title_selectors = [
                            ".bili-video-card__info--tit",
                            ".video-title",
                            ".title",
                            "a[title]",
                            "[class*='title']",
                            "h3",
                            "h4"
                        ]
                    for selector in title_selectors:
                        try:
                            title_element = element.find_element(By.CSS_SELECTOR, selector)
                            title = title_element.get_attribute("title") or title_element.text or title_element.get_attribute("textContent")
                            if title and title.strip():
                                break
                        except:
                            continue
                    
                    if not title:
                        title = element.text[:50] if element.text else "无标题"
                    
                    # 获取视频链接 - 尝试多个选择器
                    video_url = ""
                    if self.use_space:
                        # 用户空间主页的链接选择器
                        link_selectors = [
                            "a[href*='video']",
                            "a[href*='BV']",
                            "a[href*='/video/']",
                            "[data-bvid]",
                            "[data-aid]",
                            "a"
                        ]
                        # 如果找到data-bvid或data-aid，构建链接
                        if not video_url:
                            try:
                                bvid = element.get_attribute("data-bvid")
                                if bvid:
                                    video_url = f"https://www.bilibili.com/video/{bvid}"
                            except:
                                pass
                    elif self.use_dynamic:
                        # 动态页面的链接选择器
                        link_selectors = [
                            "a[href*='video']",
                            "a[href*='BV']",
                            ".bili-dyn-card-video a",
                            ".dyn-card-video a",
                            "a[href*='/video/']",
                            "a"
                        ]
                    else:
                        # 上传页面的链接选择器
                        link_selectors = ["a", "a[href*='video']", "a[href*='BV']"]
                    for selector in link_selectors:
                        try:
                            link_element = element.find_element(By.CSS_SELECTOR, selector)
                            video_url = link_element.get_attribute("href")
                            if video_url and ("video" in video_url or "BV" in video_url):
                                break
                        except:
                            continue
                    
                    if not video_url:
                        # 尝试从元素本身获取链接
                        try:
                            video_url = element.get_attribute("href")
                        except:
                            video_url = ""
                    
                    # 如果没有找到链接，尝试构建
                    if not video_url:
                        # 尝试从文本中提取BV号
                        bv_match = re.search(r'BV[a-zA-Z0-9]+', element.text or "")
                        if bv_match:
                            video_url = f"https://www.bilibili.com/video/{bv_match.group()}"
                    
                    # 获取发布时间 - 尝试多个选择器
                    publish_time = ""
                    if self.use_space:
                        # 用户空间主页的时间选择器
                        time_selectors = [
                            ".time",
                            ".publish-time",
                            "[class*='time']",
                            "[class*='date']",
                            ".bili-video-card__info--date",
                            ".pubdate",
                            "[class*='pubdate']"
                        ]
                    elif self.use_dynamic:
                        # 动态页面的时间选择器
                        time_selectors = [
                            ".bili-dyn-pub__text",
                            ".dyn-pub__text",
                            ".bili-dyn-time",
                            ".dyn-time",
                            ".bili-video-card__info--date",
                            ".publish-time",
                            ".time",
                            "[class*='time']",
                            "[class*='date']"
                        ]
                    else:
                        # 上传页面的时间选择器
                        time_selectors = [
                            ".bili-video-card__info--date",
                            ".publish-time",
                            ".time",
                            "[class*='time']",
                            "[class*='date']"
                        ]
                    for selector in time_selectors:
                        try:
                            time_element = element.find_element(By.CSS_SELECTOR, selector)
                            publish_time = time_element.text
                            if publish_time:
                                break
                        except:
                            continue
                    
                    # 解析发布时间为ISO格式
                    published_at = self.parse_publish_time(publish_time) if publish_time else None
                    
                    # 如果从列表页没有获取到发布时间，尝试从视频详情页或API获取
                    if not published_at and video_url:
                        logger.info(f"尝试获取视频 {i+1} 的真实发布时间...")
                        published_at = self.get_video_publish_time(video_url)
                        if published_at:
                            # 更新 publish_time 文本
                            publish_time = published_at.strftime('%Y-%m-%d %H:%M:%S')
                    
                    # 获取播放量 - 尝试多个选择器
                    play_count = "0"
                    if self.use_space:
                        # 用户空间主页的播放量选择器
                        play_selectors = [
                            ".play",
                            ".play-count",
                            "[class*='play']",
                            "[class*='view']",
                            "[class*='stats']",
                            ".bili-video-card__stats--item"
                        ]
                    elif self.use_dynamic:
                        # 动态页面的播放量选择器
                        play_selectors = [
                            ".bili-dyn-card-video__stats",
                            ".dyn-card-video__stats",
                            ".bili-video-card__stats--item",
                            ".play-count",
                            "[class*='play']",
                            "[class*='view']",
                            "[class*='stats']"
                        ]
                    else:
                        # 上传页面的播放量选择器
                        play_selectors = [
                            ".bili-video-card__stats--item",
                            ".play-count",
                            "[class*='play']",
                            "[class*='view']"
                        ]
                    for selector in play_selectors:
                        try:
                            play_element = element.find_element(By.CSS_SELECTOR, selector)
                            play_text = play_element.text
                            if play_text and ("播放" in play_text or "万" in play_text or play_text.isdigit()):
                                play_count = play_text
                                break
                        except:
                            continue
                    
                    # 获取视频封面 - 尝试多个选择器
                    cover_url = ""
                    if self.use_space:
                        # 用户空间主页的封面选择器
                        cover_selectors = [
                            "img[src]",
                            "[class*='cover'] img",
                            "[class*='thumbnail'] img",
                            "[class*='pic'] img",
                            ".pic img",
                            "img"
                        ]
                    elif self.use_dynamic:
                        # 动态页面的封面选择器
                        cover_selectors = [
                            ".bili-dyn-card-video__cover img",
                            ".dyn-card-video__cover img",
                            ".bili-dyn-card-video img",
                            ".dyn-card-video img",
                            "img[src]",
                            "[class*='cover'] img",
                            "[class*='thumbnail'] img",
                            "img"
                        ]
                    else:
                        # 上传页面的封面选择器
                        cover_selectors = ["img", "img[src]", "[class*='cover'] img", "[class*='thumbnail'] img"]
                    for selector in cover_selectors:
                        try:
                            cover_element = element.find_element(By.CSS_SELECTOR, selector)
                            cover_url = cover_element.get_attribute("src") or cover_element.get_attribute("data-src")
                            if cover_url:
                                break
                        except:
                            continue
                    
                    # 去重：如果URL已存在，跳过
                    if video_url and video_url in seen_urls:
                        logger.info(f"跳过重复视频: {title[:30]}...")
                        continue
                    
                    if video_url:
                        seen_urls.add(video_url)
                    
                    video_data = {
                        "title": title.strip(),
                        "url": video_url,
                        "publish_time": publish_time,
                        "published_at": published_at.isoformat() if published_at else None,
                        "play_count": play_count,
                        "cover_url": cover_url,
                        "fetched_at": datetime.now().isoformat()
                    }
                    
                    videos.append(video_data)
                    logger.info(f"获取视频 {len(videos)}: {title[:30]}...")
                    
                except Exception as e:
                    logger.warning(f"解析视频 {i+1} 失败: {e}")
                    continue
            
            if not videos:
                logger.warning("未获取到任何视频数据，返回模拟数据")
                return self.get_mock_data()
            
            return {
                "user_id": self.user_id,
                "total_videos": len(videos),
                "fetched_at": datetime.now().isoformat(),
                "videos": videos
            }
            
        except Exception as e:
            logger.error(f"获取B站视频数据失败: {e}")
            return self.get_mock_data()
        finally:
            if self.driver:
                self.driver.quit()
    
    def get_mock_data(self):
        """返回模拟数据"""
        return {
            "user_id": self.user_id,
            "total_videos": 1,
            "fetched_at": datetime.now().isoformat(),
            "videos": [
                {
                    "title": "丰田塞纳露营改装",
                    "url": "https://www.bilibili.com/video/BV14n7czzEwJ",
                    "publish_time": "今天",
                    "published_at": datetime.now().isoformat(),
                    "play_count": "1.2万",
                    "cover_url": "",
                    "fetched_at": datetime.now().isoformat()
                }
            ]
        }
    
    def save_data(self, data):
        """保存数据到JSON文件"""
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"数据已保存到 {self.output_file}")
            return True
        except Exception as e:
            logger.error(f"保存数据失败: {e}")
            return False
    
    def run(self):
        """运行爬虫"""
        logger.info("开始B站视频数据爬取...")
        data = self.fetch_videos()
        success = self.save_data(data)
        
        if success:
            logger.info(f"成功获取 {data['total_videos']} 个视频")
        else:
            logger.error("数据保存失败")
        
        return success

def main():
    """主函数"""
    import sys
    
    # 检查使用哪个页面
    use_space = '--space' in sys.argv or '-s' in sys.argv
    use_dynamic = '--dynamic' in sys.argv or '-d' in sys.argv
    
    spider = BilibiliSpider(use_dynamic=use_dynamic, use_space=use_space)
    success = spider.run()
    
    if success:
        if use_space:
            source = "用户空间主页"
        elif use_dynamic:
            source = "动态页面"
        else:
            source = "上传页面"
        print(f"✅ B站视频数据爬取成功（来源：{source}）")
    else:
        print("❌ B站视频数据爬取失败")

if __name__ == "__main__":
    main() 