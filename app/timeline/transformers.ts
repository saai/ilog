/**
 * 数据转换器：将各平台的原始数据转换为统一的TimelineItem格式
 */

import { TimelineItem, PLATFORM_CONFIG } from './types'

// 原始数据接口
interface DoubanRSSItem {
  title: string
  url: string
  type: string
  rating: string
  author: string
  published: string
  formattedDate: string
  description?: string
}

interface JianshuArticle {
  title: string
  link: string
  slug: string
  published_at?: string | null
  fetched_at: string
  formattedDate?: string
  user_id: string
}

interface BilibiliVideo {
  title: string
  url: string
  publish_time: string
  published_at?: string | null
  play_count: string
  cover_url: string
  formattedDate?: string
  fetched_at: string
}

interface YouTubeVideo {
  video_id: string
  title: string
  url: string
  published_at: string
  description?: string
  thumbnail_url?: string
  channel_name?: string
  formattedDate?: string
  fetched_at?: string
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) {
    const weeks = Math.floor(days / 7)
    return `${weeks}周前`
  }
  if (days < 365) {
    const months = Math.floor(days / 30)
    return `${months}个月前`
  }
  const years = Math.floor(days / 365)
  return `${years}年前`
}

/**
 * 解析RFC 822日期格式
 */
function parseRFC822Date(dateString: string): Date | null {
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

/**
 * 转换豆瓣RSS数据为TimelineItem
 */
export function transformDoubanRSS(
  item: DoubanRSSItem,
  index: number,
  fetchedAt?: string
): TimelineItem | null {
  const date = parseRFC822Date(item.published)
  if (!date) return null
  
  const config = PLATFORM_CONFIG['douban-rss']
  
  return {
    id: `douban-rss-${index}`,
    platform: 'douban-rss',
    platformName: config.name,
    platformIcon: config.icon,
    platformColor: config.color,
    title: item.title,
    url: item.url,
    description: item.description,
    publishedAt: date.toISOString(),
    formattedDate: item.formattedDate || formatRelativeTime(date),
    metadata: {
      type: item.type === 'interest' ? '收藏' : item.type,
      author: item.author || undefined,
      rating: item.rating || undefined
    },
    source: {
      platform: 'douban-rss',
      fetchedAt: fetchedAt
    }
  }
}

/**
 * 转换简书文章数据为TimelineItem
 */
export function transformJianshu(
  item: JianshuArticle,
  index: number
): TimelineItem | null {
  // 只处理有实际发布时间的文章
  if (!item.published_at) return null
  
  const date = new Date(item.published_at)
  if (isNaN(date.getTime())) return null
  
  const config = PLATFORM_CONFIG['jianshu']
  
  return {
    id: `jianshu-${index}`,
    platform: 'jianshu',
    platformName: config.name,
    platformIcon: config.icon,
    platformColor: config.color,
    title: item.title,
    url: item.link,
    publishedAt: date.toISOString(),
    formattedDate: item.formattedDate || formatRelativeTime(date),
    metadata: {
      type: 'article',
      slug: item.slug,
      userId: item.user_id
    },
    source: {
      platform: 'jianshu',
      originalId: item.slug,
      fetchedAt: item.fetched_at
    }
  }
}

/**
 * 转换B站视频数据为TimelineItem
 */
export function transformBilibili(
  item: BilibiliVideo,
  index: number
): TimelineItem | null {
  // 只处理有实际发布时间的视频
  if (!item.published_at) return null
  
  const date = new Date(item.published_at)
  if (isNaN(date.getTime())) return null
  
  const config = PLATFORM_CONFIG['bilibili']
  
  return {
    id: `bilibili-${index}`,
    platform: 'bilibili',
    platformName: config.name,
    platformIcon: config.icon,
    platformColor: config.color,
    title: item.title,
    url: item.url,
    thumbnail: item.cover_url || undefined,
    publishedAt: date.toISOString(),
    formattedDate: item.formattedDate || formatRelativeTime(date),
    metadata: {
      type: 'video',
      playCount: item.play_count,
      publishTime: item.publish_time,
      coverUrl: item.cover_url || undefined
    },
    source: {
      platform: 'bilibili',
      fetchedAt: item.fetched_at
    }
  }
}

/**
 * 转换YouTube视频数据为TimelineItem
 */
export function transformYouTube(
  item: YouTubeVideo,
  index: number
): TimelineItem | null {
  // 只处理有实际发布时间的视频
  if (!item.published_at) return null
  
  const date = new Date(item.published_at)
  if (isNaN(date.getTime())) return null
  
  const config = PLATFORM_CONFIG['youtube']
  
  return {
    id: `youtube-${index}`,
    platform: 'youtube',
    platformName: config.name,
    platformIcon: config.icon,
    platformColor: config.color,
    title: item.title,
    url: item.url,
    description: item.description,
    thumbnail: item.thumbnail_url || undefined,
    publishedAt: date.toISOString(),
    formattedDate: item.formattedDate || formatRelativeTime(date),
    metadata: {
      type: 'video',
      videoId: item.video_id,
      channelName: item.channel_name || undefined,
      thumbnailUrl: item.thumbnail_url || undefined
    },
    source: {
      platform: 'youtube',
      originalId: item.video_id,
      fetchedAt: item.fetched_at || new Date().toISOString()
    }
  }
}

/**
 * 合并所有平台数据并排序
 */
export function mergeAndSortTimelineItems(items: TimelineItem[]): TimelineItem[] {
  // 按发布时间倒序排序（最新的在前）
  return items.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

