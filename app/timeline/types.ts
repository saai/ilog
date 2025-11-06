/**
 * 统一的时间流条目数据格式
 * 所有平台的数据都会转换为这个格式
 */
export interface TimelineItem {
  // 唯一标识
  id: string
  
  // 平台信息
  platform: 'douban-rss' | 'douban' | 'jianshu' | 'bilibili' | 'youtube'
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

/**
 * 平台配置
 */
export const PLATFORM_CONFIG = {
  'douban-rss': {
    name: '豆瓣',
    icon: '📚',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  },
  'douban': {
    name: '豆瓣',
    icon: '🎬',
    color: 'bg-orange-100 text-orange-700 border-orange-200'
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
  },
  'youtube': {
    name: 'YouTube',
    icon: '📺',
    color: 'bg-red-100 text-red-700 border-red-200'
  }
} as const

