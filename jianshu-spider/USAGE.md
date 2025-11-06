# 简书爬虫使用说明

## 快速开始

### 1. 环境准备

确保您的系统已安装：
- Python 3.7+
- Chrome 浏览器
- pip（Python包管理器）

### 2. 安装依赖

```bash
cd jianshu-spider
pip install -r requirements.txt
```

### 3. 配置用户ID

编辑 `fetch_jianshu.py` 文件，修改以下参数：

```python
USER_ID = "763ffbb1b873"  # 替换为您的简书用户ID
MAX_ARTICLES = 10  # 最大抓取文章数量
```

### 4. 运行爬虫

```bash
# 方法1：直接运行Python脚本
python fetch_jianshu.py

# 方法2：使用快速启动脚本
./run.sh

# 方法3：运行测试脚本
python test_spider.py
```

## 输出结果

运行成功后，会在当前目录生成 `jianshu_articles.json` 文件，格式如下：

```json
{
  "user_id": "763ffbb1b873",
  "total_articles": 10,
  "fetched_at": "2024-01-15T10:30:00",
  "articles": [
    {
      "title": "文章标题",
      "link": "https://www.jianshu.com/p/xxxxx",
      "slug": "xxxxx",
      "fetched_at": "2024-01-15T10:30:00",
      "user_id": "763ffbb1b873"
    }
  ]
}
```

## 与Next.js项目集成

### 1. 更新API接口

Next.js项目会自动读取 `jianshu-spider/jianshu_articles.json` 文件：

```typescript
// app/api/jianshu-articles/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const jsonPath = path.join(process.cwd(), 'jianshu-spider', 'jianshu_articles.json')
    const fileContent = await fs.readFile(jsonPath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: '无法读取简书文章数据' })
  }
}
```

### 2. 前端展示

首页和动态页会自动展示抓取到的简书文章。

## 自动化部署

### 定时抓取

可以设置定时任务，定期运行爬虫更新数据：

```bash
# 使用crontab设置定时任务（每天凌晨2点运行）
0 2 * * * cd /path/to/your/project/jianshu-spider && python fetch_jianshu.py
```

### GitHub Actions

在 `.github/workflows/update-jianshu.yml` 中配置：

```yaml
name: Update Jianshu Articles

on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨2点
  workflow_dispatch:  # 手动触发

jobs:
  update-articles:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: |
          cd jianshu-spider
          pip install -r requirements.txt
          python fetch_jianshu.py
      - run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add jianshu-spider/jianshu_articles.json
          git commit -m "Update jianshu articles" || exit 0
          git push
```

## 故障排除

### 常见问题

1. **Chrome驱动问题**
   ```
   错误: ChromeDriver not found
   解决: 脚本会自动下载ChromeDriver，确保网络连接正常
   ```

2. **抓取失败**
   ```
   错误: 未能抓取到任何文章
   解决: 
   - 检查用户ID是否正确
   - 确认网络连接正常
   - 尝试增加等待时间
   ```

3. **权限问题**
   ```bash
   # 给脚本添加执行权限
   chmod +x run.sh
   chmod +x test_spider.py
   ```

### 调试模式

启用详细日志输出：

```python
# 在fetch_jianshu.py中添加
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 手动测试

```bash
# 测试网络连接
curl -I https://www.jianshu.com

# 测试Python环境
python -c "import selenium; print('Selenium已安装')"

# 测试Chrome
google-chrome --version
```

## 高级配置

### 自定义抓取参数

```python
# 在fetch_jianshu.py中修改
spider = JianshuSpider(USER_ID)
articles = spider.run(
    max_articles=20,  # 抓取更多文章
    headless=False,   # 显示浏览器窗口
    delay=5          # 增加等待时间
)
```

### 代理设置

```python
# 在setup_driver方法中添加
options.add_argument('--proxy-server=http://your-proxy:port')
```

### 自定义输出格式

```python
# 修改save_articles方法
def save_articles(self, articles):
    # 自定义输出格式
    custom_data = {
        'articles': articles,
        'metadata': {
            'source': 'jianshu',
            'timestamp': datetime.now().isoformat()
        }
    }
    # 保存为自定义格式
```

## 注意事项

- 请遵守简书的使用条款和robots.txt
- 建议设置合理的抓取间隔，避免对服务器造成压力
- 抓取的数据仅供个人使用，请勿用于商业用途
- 定期更新Chrome浏览器和ChromeDriver版本 