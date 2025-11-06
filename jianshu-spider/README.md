# 简书文章抓取工具

这是一个用于抓取简书用户最新文章的Python工具，可以自动获取指定用户的最新文章列表并保存为JSON格式。

## 功能特点

- 🚀 自动抓取简书用户的最新文章
- 📝 支持多页抓取，获取更多文章
- 💾 自动保存为JSON格式，便于其他项目使用
- 🛡️ 内置反检测机制，提高抓取成功率
- 📊 详细的抓取日志和进度显示

## 环境要求

- Python 3.7+
- Chrome 浏览器
- 网络连接

## 安装依赖

```bash
cd jianshu-spider
pip install -r requirements.txt
```

## 使用方法

### 1. 配置用户ID

编辑 `fetch_jianshu.py` 文件，修改以下参数：

```python
USER_ID = "763ffbb1b873"  # 替换为您的简书用户ID
MAX_ARTICLES = 10  # 最大抓取文章数量
```

### 2. 运行抓取脚本

```bash
python fetch_jianshu.py
```

### 3. 查看结果

运行完成后，会在当前目录生成 `jianshu_articles.json` 文件，包含抓取到的文章数据。

## 输出格式

生成的JSON文件格式如下：

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

1. 运行Python脚本生成JSON文件
2. 在Next.js项目中读取JSON文件：

```typescript
// app/api/jianshu-articles/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'jianshu-spider/jianshu_articles.json')
    const file = await fs.readFile(filePath, 'utf-8')
    const data = JSON.parse(file)
    return NextResponse.json({ success: true, data })
  } catch (e) {
    return NextResponse.json({ success: false, error: '无法读取简书文章数据' })
  }
}
```

## 注意事项

- 请遵守简书的使用条款和robots.txt
- 建议设置合理的抓取间隔，避免对服务器造成压力
- 如遇到反爬虫限制，可以适当增加等待时间
- 抓取的数据仅供个人使用，请勿用于商业用途

## 故障排除

### 常见问题

1. **Chrome驱动问题**
   - 确保已安装Chrome浏览器
   - 脚本会自动下载ChromeDriver

2. **抓取失败**
   - 检查网络连接
   - 确认用户ID正确
   - 尝试增加等待时间

3. **权限问题**
   - 确保有写入文件的权限
   - 检查目录权限

## 更新日志

- v1.0.0: 初始版本，支持基本的文章抓取功能

## 许可证

MIT License 