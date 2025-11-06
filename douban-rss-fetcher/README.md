# 豆瓣RSS数据抓取器

Python程序，用于抓取豆瓣用户的兴趣RSS数据并保存为本地JSON文件。

## 功能特性

- 🔄 自动抓取豆瓣RSS数据
- 📁 保存为本地JSON文件
- 📅 智能日期格式化（今天、昨天、X天前、X周前等）
- 🛡️ 错误处理和模拟数据回退机制
- ⚡ 快速响应
- 🌐 支持自定义User-Agent和请求头

## 项目结构

```
douban-rss-fetcher/
├── fetch_douban_rss.py  # 主程序文件
├── requirements.txt     # Python依赖
├── run.sh              # 运行脚本
├── README.md           # 说明文档
└── douban_rss_data.json # 生成的输出文件
```

## 安装依赖

```bash
pip3 install -r requirements.txt
```

## 使用方法

### 手动运行

```bash
python3 fetch_douban_rss.py
```

### 使用运行脚本

```bash
chmod +x run.sh
./run.sh
```

## 配置说明

在 `fetch_douban_rss.py` 的 `DoubanRSSFetcher` 类中修改以下配置：

```python
def __init__(self):
    self.user_id = '284853052'  # 修改为你的豆瓣用户ID
    self.rss_url = f'https://www.douban.com/feed/people/{self.user_id}/interests'
    self.output_file = 'douban_rss_data.json'  # 输出文件名
```

**配置项说明：**
- `user_id`: 豆瓣用户ID（在你的豆瓣个人主页URL中可以找到）
- `rss_url`: RSS地址（程序会自动根据user_id生成）
- `output_file`: 输出JSON文件名（默认为 `douban_rss_data.json`）

## 输出格式

生成的JSON文件格式：

```json
{
  "collections": [
    {
      "title": "最近在读禅与摩托车维修艺术",
      "url": "https://book.douban.com/subject/30208077/",
      "type": "interest",
      "rating": "",
      "author": "",
      "published": "Fri, 04 Jul 2025 16:44:07 GMT",
      "formattedDate": "1周前",
      "description": "..."
    }
  ],
  "total": 10,
  "user": {
    "id": "284853052",
    "nickname": "Saai"
  },
  "fetched_at": "2025-07-11T10:30:00.000000"
}
```

## 故障排除

### 常见问题

1. **网络请求失败**
   - 检查网络连接是否正常
   - 确认豆瓣RSS地址是否可访问
   - 如果失败，程序会自动使用模拟数据

2. **依赖安装失败**
   - 确保使用Python 3.6或更高版本：`python3 --version`
   - 尝试使用 `pip` 代替 `pip3`
   - 如果权限问题，使用 `pip3 install --user -r requirements.txt`

3. **OpenSSL警告**
   - 这是一个警告信息，不影响程序运行
   - 如需解决，可以升级系统的OpenSSL版本

4. **找不到用户RSS数据**
   - 确认用户ID是否正确
   - 检查该用户是否开启了RSS订阅功能
   - 访问 `https://www.douban.com/feed/people/{user_id}/interests` 验证RSS是否可用

## 集成到Next.js项目

### 步骤

1. **复制JSON文件**
   ```bash
   cp douban_rss_data.json /path/to/your/nextjs-project/
   ```

2. **创建API路由**（示例：`pages/api/douban.js` 或 `app/api/douban/route.js`）
   ```javascript
   import fs from 'fs';
   import path from 'path';

   export default function handler(req, res) {
     const filePath = path.join(process.cwd(), 'douban_rss_data.json');
     const fileContents = fs.readFileSync(filePath, 'utf8');
     const data = JSON.parse(fileContents);
     res.status(200).json(data);
   }
   ```

3. **在页面中展示数据**
   ```javascript
   useEffect(() => {
     fetch('/api/douban')
       .then(res => res.json())
       .then(data => setCollections(data.collections));
   }, []);
   ```

## 定时更新

### 使用Crontab

添加到crontab实现每日自动更新（每天凌晨2点执行）：

```bash
# 编辑crontab
crontab -e

# 添加以下行（请替换为实际路径）
0 2 * * * cd /Users/yansha/Documents/iLog/douban-rss-fetcher && /usr/bin/python3 fetch_douban_rss.py >> /tmp/douban_rss.log 2>&1
```

### 验证定时任务

```bash
# 查看当前用户的crontab任务
crontab -l

# 查看执行日志
tail -f /tmp/douban_rss.log
```

## 许可证

本项目仅供学习和个人使用。 