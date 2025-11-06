# Timeline 数据格式规范

## 统一的数据格式

所有平台的数据都会转换为统一的 `TimelineItem` 格式，确保数据一致性和可维护性。

## TimelineItem 接口定义

```typescript
interface TimelineItem {
  // 唯一标识
  id: string
  
  // 平台信息
  platform: 'douban-rss' | 'douban' | 'jianshu' | 'bilibili'
  platformName: string
  platformIcon: string
  platformColor: string
  
  // 内容信息
  title: string
  url: string
  description?: string
  thumbnail?: string // 缩略图URL
  
  // 时间信息（必须使用实际发布时间）
  publishedAt: string // ISO格式的实际发布时间
  formattedDate: string // 格式化的相对时间（如"1个月前"）
  
  // 元数据（根据平台类型不同而不同）
  metadata: {
    // 通用字段
    type?: string // 内容类型：book, movie, article, video等
    
    // 作者/创作者信息
    author?: string
    creator?: string
    director?: string
    
    // 评分/统计信息
    rating?: string
    playCount?: string
    viewCount?: string
    likeCount?: string
    
    // 其他平台特定信息
    publishTime?: string // 原始发布时间文本
    coverUrl?: string // 封面图URL
    slug?: string // 文章slug
    userId?: string // 用户ID
  }
  
  // 数据来源信息（用于调试和追踪）
  source: {
    platform: string
    originalId?: string
    fetchedAt?: string // 数据抓取时间
  }
}
```

## 数据转换规则

### 豆瓣RSS数据转换

**原始数据字段** → **TimelineItem字段**：
- `title` → `title`
- `url` → `url`
- `published` (RFC 822) → `publishedAt` (ISO)
- `formattedDate` → `formattedDate`
- `description` → `description`
- `author` → `metadata.author`
- `rating` → `metadata.rating`
- `type` → `metadata.type`

### 简书文章数据转换

**原始数据字段** → **TimelineItem字段**：
- `title` → `title`
- `link` → `url`
- `published_at` (ISO) → `publishedAt` (ISO)
- `slug` → `metadata.slug`
- `user_id` → `metadata.userId`
- `fetched_at` → `source.fetchedAt`

**注意**：只转换有 `published_at` 的文章（实际发布时间）

### B站视频数据转换

**原始数据字段** → **TimelineItem字段**：
- `title` → `title`
- `url` → `url`
- `published_at` (ISO) → `publishedAt` (ISO)
- `publish_time` → `metadata.publishTime`
- `play_count` → `metadata.playCount`
- `cover_url` → `thumbnail` 和 `metadata.coverUrl`
- `fetched_at` → `source.fetchedAt`

**注意**：只转换有 `published_at` 的视频（实际发布时间）

## 时间处理规则

1. **必须使用实际发布时间**：所有条目必须使用 `publishedAt` 字段，不能使用抓取时间
2. **时间格式**：统一使用 ISO 8601 格式（如 `2025-11-05T19:04:23.322853`）
3. **相对时间**：`formattedDate` 字段显示相对时间（如"1个月前"、"今天"等）
4. **排序规则**：按 `publishedAt` 倒序排序（最新的在前）

## 平台配置

每个平台都有对应的配置信息：

```typescript
const PLATFORM_CONFIG = {
  'douban-rss': {
    name: '豆瓣',
    icon: '📚',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  'jianshu': {
    name: '简书',
    icon: '📝',
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  'bilibili': {
    name: 'B站',
    icon: '📱',
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  }
}
```

## 文件结构

```
app/timeline/
├── types.ts          # TimelineItem 接口定义和平台配置
├── transformers.ts    # 数据转换函数
├── page.tsx          # 时间流页面组件
└── README.md         # 本文档
```

## 使用示例

```typescript
import { transformDoubanRSS, transformJianshu, transformBilibili } from './transformers'

// 转换豆瓣RSS数据
const doubanItem = transformDoubanRSS(doubanRSSItem, 0, fetchedAt)

// 转换简书文章
const jianshuItem = transformJianshu(jianshuArticle, 0)

// 转换B站视频
const bilibiliItem = transformBilibili(bilibiliVideo, 0)

// 合并并排序
const allItems = mergeAndSortTimelineItems([doubanItem, jianshuItem, bilibiliItem])
```

## 注意事项

1. **数据验证**：转换函数会验证数据有效性，无效数据返回 `null`
2. **时间要求**：只有包含实际发布时间的条目才会被转换
3. **数据完整性**：所有字段都是可选的，但核心字段（title, url, publishedAt）必须存在
4. **扩展性**：新增平台时，只需添加对应的转换函数和平台配置

