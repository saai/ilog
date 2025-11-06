#!/usr/bin/env python3
"""
豆瓣数据爬虫
使用Selenium获取指定用户的最新收藏和动态信息
"""

import json
import time
import os
from datetime import datetime
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

class DoubanSpider:
    def __init__(self, user_id="284853052"):
        self.user_id = user_id
        self.base_url = f"https://www.douban.com/people/{user_id}/"
        self.output_file = "douban_collections.json"
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
    
    def fetch_collections(self):
        """获取豆瓣收藏数据"""
        if not self.setup_driver():
            logger.error("无法设置Chrome驱动，返回模拟数据")
            return self.get_mock_data()
        
        try:
            logger.info(f"开始访问豆瓣用户页面: {self.base_url}")
            self.driver.get(self.base_url)
            
            # 等待页面加载
            wait = WebDriverWait(self.driver, 10)
            
            collections = []
            
            # 尝试获取书籍收藏
            try:
                books_url = f"{self.base_url}collect"
                logger.info(f"访问书籍收藏页面: {books_url}")
                self.driver.get(books_url)
                time.sleep(3)
                
                book_elements = self.driver.find_elements(By.CSS_SELECTOR, ".item")
                logger.info(f"找到 {len(book_elements)} 本书籍")
                
                for i, element in enumerate(book_elements[:5]):  # 只获取前5本书
                    try:
                        # 获取书籍标题
                        title_element = element.find_element(By.CSS_SELECTOR, "a")
                        title = title_element.get_attribute("title") or title_element.text
                        
                        # 获取书籍链接
                        book_url = title_element.get_attribute("href")
                        
                        # 获取评分
                        try:
                            rating_element = element.find_element(By.CSS_SELECTOR, ".rating_nums")
                            rating = rating_element.text
                        except:
                            rating = "暂无评分"
                        
                        # 获取作者
                        try:
                            author_element = element.find_element(By.CSS_SELECTOR, ".pub")
                            author = author_element.text
                        except:
                            author = "未知作者"
                        
                        collection_data = {
                            "title": title.strip(),
                            "url": book_url,
                            "type": "book",
                            "rating": rating,
                            "author": author,
                            "fetched_at": datetime.now().isoformat()
                        }
                        
                        collections.append(collection_data)
                        logger.info(f"获取书籍 {i+1}: {title[:30]}...")
                        
                    except Exception as e:
                        logger.warning(f"解析书籍 {i+1} 失败: {e}")
                        continue
                        
            except Exception as e:
                logger.warning(f"获取书籍收藏失败: {e}")
            
            # 尝试获取电影收藏
            try:
                movies_url = f"{self.base_url}movie"
                logger.info(f"访问电影收藏页面: {movies_url}")
                self.driver.get(movies_url)
                time.sleep(3)
                
                movie_elements = self.driver.find_elements(By.CSS_SELECTOR, ".item")
                logger.info(f"找到 {len(movie_elements)} 部电影")
                
                for i, element in enumerate(movie_elements[:5]):  # 只获取前5部电影
                    try:
                        # 获取电影标题
                        title_element = element.find_element(By.CSS_SELECTOR, "a")
                        title = title_element.get_attribute("title") or title_element.text
                        
                        # 获取电影链接
                        movie_url = title_element.get_attribute("href")
                        
                        # 获取评分
                        try:
                            rating_element = element.find_element(By.CSS_SELECTOR, ".rating_nums")
                            rating = rating_element.text
                        except:
                            rating = "暂无评分"
                        
                        # 获取导演
                        try:
                            director_element = element.find_element(By.CSS_SELECTOR, ".pub")
                            director = director_element.text
                        except:
                            director = "未知导演"
                        
                        collection_data = {
                            "title": title.strip(),
                            "url": movie_url,
                            "type": "movie",
                            "rating": rating,
                            "director": director,
                            "fetched_at": datetime.now().isoformat()
                        }
                        
                        collections.append(collection_data)
                        logger.info(f"获取电影 {i+1}: {title[:30]}...")
                        
                    except Exception as e:
                        logger.warning(f"解析电影 {i+1} 失败: {e}")
                        continue
                        
            except Exception as e:
                logger.warning(f"获取电影收藏失败: {e}")
            
            if not collections:
                logger.warning("未获取到任何收藏数据，返回空数据")
                return {
                    "user_id": self.user_id,
                    "total_collections": 0,
                    "fetched_at": datetime.now().isoformat(),
                    "collections": []
                }
            
            return {
                "user_id": self.user_id,
                "total_collections": len(collections),
                "fetched_at": datetime.now().isoformat(),
                "collections": collections
            }
            
        except Exception as e:
            logger.error(f"获取豆瓣收藏数据失败: {e}")
            return {
                "user_id": self.user_id,
                "total_collections": 0,
                "fetched_at": datetime.now().isoformat(),
                "collections": []
            }
        finally:
            if self.driver:
                self.driver.quit()
    
    # 注意：已移除模拟数据功能，没有真实数据时返回空数组
    
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
        logger.info("开始豆瓣收藏数据爬取...")
        data = self.fetch_collections()
        success = self.save_data(data)
        
        if success:
            logger.info(f"成功获取 {data['total_collections']} 个收藏")
        else:
            logger.error("数据保存失败")
        
        return success

def main():
    """主函数"""
    spider = DoubanSpider()
    success = spider.run()
    
    if success:
        print("✅ 豆瓣收藏数据爬取成功")
    else:
        print("❌ 豆瓣收藏数据爬取失败")

if __name__ == "__main__":
    main() 