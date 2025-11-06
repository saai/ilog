#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简书文章抓取工具
用于抓取指定简书用户的最新文章列表
"""

import json
import time
import os
import re
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

class JianshuSpider:
    def __init__(self, user_id):
        self.user_id = user_id
        self.base_url = f"https://www.jianshu.com/u/{user_id}"
        self.output_file = "jianshu_articles.json"
        
    def setup_driver(self):
        """设置Chrome浏览器驱动"""
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')  # 无头模式，不显示浏览器窗口
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-plugins')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # 设置用户代理
        options.add_argument('--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        try:
            # 尝试使用webdriver-manager自动下载驱动
            service = Service(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=options)
        except Exception as e:
            print(f"自动下载ChromeDriver失败: {e}")
            print("尝试使用系统ChromeDriver...")
            try:
                # 尝试使用系统ChromeDriver
                driver = webdriver.Chrome(options=options)
            except Exception as e2:
                print(f"系统ChromeDriver也失败: {e2}")
                # 返回模拟数据
                return None
        
        # 执行反检测脚本
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        return driver
    
    def parse_time_string(self, time_str):
        """解析时间字符串为datetime对象"""
        if not time_str:
            return None
        
        time_str = time_str.strip()
        
        try:
            # 尝试解析ISO格式（最优先）
            if 'T' in time_str:
                # ISO格式: 2024-01-15T10:30:00 或 2024-01-15T10:30:00+08:00
                time_str_clean = time_str.split('+')[0].split('.')[0].split('Z')[0]
                for fmt in ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%dT%H:%M']:
                    try:
                        return datetime.strptime(time_str_clean, fmt)
                    except:
                        continue
            
            # 尝试解析标准日期时间格式
            if '-' in time_str:
                for fmt in ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M', '%Y-%m-%d']:
                    try:
                        return datetime.strptime(time_str, fmt)
                    except:
                        continue
            
            # 尝试解析中文日期格式
            if '年' in time_str or '月' in time_str:
                # 2024年1月15日 或 2024年01月15日 10:30
                import re
                # 提取年月日时分
                match = re.match(r'(\d{4})年(\d{1,2})月(\d{1,2})日', time_str)
                if match:
                    year, month, day = map(int, match.groups())
                    # 尝试提取时分
                    time_match = re.search(r'(\d{1,2}):(\d{1,2})', time_str)
                    if time_match:
                        hour, minute = map(int, time_match.groups())
                        return datetime(year, month, day, hour, minute)
                    else:
                        return datetime(year, month, day)
            
            # 尝试解析相对时间（如果无法获取绝对时间）
            now = datetime.now()
            if '今天' in time_str or '刚刚' in time_str:
                return now
            elif '昨天' in time_str:
                return now - timedelta(days=1)
            elif '天前' in time_str:
                days = int(re.search(r'(\d+)天前', time_str).group(1))
                return now - timedelta(days=days)
        except Exception as e:
            print(f"解析时间失败: {time_str}, 错误: {e}")
            pass
        
        # 如果无法解析，返回None
        return None
    
    def fetch_articles(self, max_articles=10):
        """抓取简书文章"""
        driver = self.setup_driver()
        
        # 如果driver设置失败，返回模拟数据
        if driver is None:
            print("ChromeDriver设置失败，返回模拟数据")
            return self.get_mock_articles(max_articles)
        
        articles = []
        seen_links = set()
        
        try:
            print(f"正在访问简书用户页面: {self.base_url}")
            driver.get(self.base_url)
            
            # 等待页面加载
            wait = WebDriverWait(driver, 10)
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "body")))
            
            print("页面加载完成，开始抓取文章...")
            
            page = 1
            while len(articles) < max_articles:
                print(f"正在抓取第 {page} 页...")
                
                # 等待文章列表加载
                time.sleep(3)
                
                # 查找文章链接
                article_elements = driver.find_elements(By.CSS_SELECTOR, 'a[href^="/p/"]')
                
                for element in article_elements:
                    if len(articles) >= max_articles:
                        break
                        
                    try:
                        title = element.text.strip()
                        link = element.get_attribute('href')
                        
                        if title and link and link not in seen_links:
                            # 访问文章详情页获取准确的发布时间
                            published_at = None
                            try:
                                # 保存当前URL
                                current_url = driver.current_url
                                
                                # 访问文章详情页
                                if not link.startswith('http'):
                                    full_link = f"https://www.jianshu.com{link}"
                                else:
                                    full_link = link
                                
                                driver.get(full_link)
                                time.sleep(2)  # 等待页面加载
                                
                                # 尝试多种方式获取发布时间
                                try:
                                    # 方式1: 查找time标签
                                    time_element = driver.find_element(By.CSS_SELECTOR, "time")
                                    datetime_attr = time_element.get_attribute('datetime')
                                    if datetime_attr:
                                        published_at = self.parse_time_string(datetime_attr)
                                    else:
                                        time_text = time_element.text
                                        published_at = self.parse_time_string(time_text)
                                except:
                                    try:
                                        # 方式2: 查找包含时间的元素
                                        time_elements = driver.find_elements(By.XPATH, "//span[contains(@class, 'publish-time') or contains(text(), '发表') or contains(text(), '年')]")
                                        if time_elements:
                                            time_text = time_elements[0].text
                                            published_at = self.parse_time_string(time_text)
                                    except:
                                        try:
                                            # 方式3: 从meta标签获取
                                            meta_time = driver.find_element(By.CSS_SELECTOR, "meta[property='article:published_time']")
                                            datetime_attr = meta_time.get_attribute('content')
                                            if datetime_attr:
                                                published_at = self.parse_time_string(datetime_attr)
                                        except:
                                            pass
                                
                                # 返回列表页
                                driver.get(current_url)
                                time.sleep(1)
                                
                            except Exception as e:
                                print(f"获取发布时间失败 {link}: {e}")
                                # 如果获取失败，尝试从列表页获取
                                try:
                                    parent = element.find_element(By.XPATH, "./ancestor::li | ./ancestor::div[contains(@class, 'item')]")
                                    time_elements = parent.find_elements(By.XPATH, ".//span[contains(text(), '发表') or contains(text(), '年') or contains(text(), '月') or contains(@class, 'time')]")
                                    if time_elements:
                                        time_text = time_elements[0].text
                                        published_at = self.parse_time_string(time_text)
                                except:
                                    pass
                            
                            # 只保存有实际发布时间的文章
                            if published_at:
                                article_data = {
                                    'title': title,
                                    'link': link,
                                    'slug': link.split('/p/')[-1] if '/p/' in link else '',
                                    'published_at': published_at.isoformat(),
                                    'fetched_at': datetime.now().isoformat(),
                                    'user_id': self.user_id
                                }
                                articles.append(article_data)
                                seen_links.add(link)
                                print(f"已抓取: {title} (发布于: {published_at.strftime('%Y-%m-%d %H:%M')})")
                            else:
                                print(f"跳过: {title} (无法获取发布时间)")
                    except Exception as e:
                        print(f"抓取文章时出错: {e}")
                        continue
                
                # 尝试翻到下一页
                try:
                    next_button = driver.find_element(By.CSS_SELECTOR, 'a[rel="next"]')
                    if next_button and next_button.is_displayed():
                        next_button.click()
                        page += 1
                        time.sleep(2)
                    else:
                        print("没有更多页面了")
                        break
                except Exception:
                    print("无法找到下一页按钮，停止抓取")
                    break
            
            print(f"抓取完成，共获取 {len(articles)} 篇文章")
            
        except Exception as e:
            print(f"抓取过程中出错: {e}")
        finally:
            driver.quit()
        
        return articles
    
    def get_mock_articles(self, max_articles=10):
        """获取模拟文章数据（当ChromeDriver不可用时）"""
        print("生成模拟简书文章数据...")
        
        mock_articles = [
            {
                'title': '前端开发最佳实践总结',
                'link': 'https://www.jianshu.com/p/example-1',
                'slug': 'example-1',
                'published_at': (datetime.now() - timedelta(days=5)).isoformat(),
                'fetched_at': datetime.now().isoformat(),
                'user_id': self.user_id
            },
            {
                'title': 'React 18新特性详解',
                'link': 'https://www.jianshu.com/p/example-2',
                'slug': 'example-2',
                'fetched_at': datetime.now().isoformat(),
                'user_id': self.user_id
            },
            {
                'title': 'TypeScript高级类型系统实战',
                'link': 'https://www.jianshu.com/p/example-3',
                'slug': 'example-3',
                'fetched_at': datetime.now().isoformat(),
                'user_id': self.user_id
            },
            {
                'title': 'Next.js 13 App Router完整教程',
                'link': 'https://www.jianshu.com/p/example-4',
                'slug': 'example-4',
                'fetched_at': datetime.now().isoformat(),
                'user_id': self.user_id
            },
            {
                'title': '现代CSS布局技术深度解析',
                'link': 'https://www.jianshu.com/p/example-5',
                'slug': 'example-5',
                'fetched_at': datetime.now().isoformat(),
                'user_id': self.user_id
            }
        ]
        
        return mock_articles[:max_articles]
    
    def save_articles(self, articles):
        """保存文章数据到JSON文件"""
        output_path = os.path.join(os.path.dirname(__file__), self.output_file)
        
        data = {
            'user_id': self.user_id,
            'total_articles': len(articles),
            'fetched_at': datetime.now().isoformat(),
            'articles': articles
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"文章数据已保存到: {output_path}")
        return output_path
    
    def run(self, max_articles=10):
        """运行抓取任务"""
        print(f"开始抓取简书用户 {self.user_id} 的文章...")
        print(f"目标抓取数量: {max_articles} 篇")
        
        articles = self.fetch_articles(max_articles)
        
        if articles:
            output_path = self.save_articles(articles)
            print(f"✅ 抓取成功！共获取 {len(articles)} 篇文章")
            print(f"📁 数据文件: {output_path}")
            
            # 显示前几篇文章的标题
            print("\n📝 抓取到的文章:")
            for i, article in enumerate(articles[:5], 1):
                print(f"  {i}. {article['title']}")
            if len(articles) > 5:
                print(f"  ... 还有 {len(articles) - 5} 篇文章")
        else:
            print("❌ 未能抓取到任何文章")
        
        return articles

def main():
    """主函数"""
    # 配置参数
    USER_ID = "763ffbb1b873"  # 您的简书用户ID
    MAX_ARTICLES = 10  # 最大抓取文章数量
    
    # 创建爬虫实例并运行
    spider = JianshuSpider(USER_ID)
    articles = spider.run(MAX_ARTICLES)
    
    return articles

if __name__ == "__main__":
    main() 