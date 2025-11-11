# iLog 项目结构

## 📁 目录结构

```
iLog/
├── app/                          # Next.js 应用
│   ├── api/                      # API 路由
│   │   ├── bilibili-videos/      # B站视频API
│   │   ├── douban-rss/           # 豆瓣RSS API
│   │   └── jianshu-articles/     # 简书文章API
│   ├── timeline/                 # 时间流页面
│   │   ├── page.tsx             # 时间流主页面
│   │   ├── types.ts             # 数据格式定义
│   │   ├── transformers.ts      # 数据转换器
│   │   └── README.md            # 时间流文档
│   ├── crawler-data/            # 爬虫数据展示页面
│   └── page.tsx                 # 首页
├── components/                   # React 组件
├── jianshu-spider/              # 简书爬虫
├── bilibili-spider/             # B站爬虫
├── douban-rss-fetcher/          # 豆瓣RSS抓取器
├── update_data.sh               # 数据更新脚本
├── crontab_example.txt          # 定时任务示例
└── README.md                    # 项目说明
```

## 📍 项目位置

项目现在位于：`/Users/yansha/Documents/iLog`

## 🚀 快速开始

```bash
cd /Users/yansha/Documents/iLog
npm install
npm run dev
```

访问 http://localhost:3000 查看应用。
