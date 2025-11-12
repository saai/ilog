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
 * 解析 GMT 时间字符串并返回 UTC 时区的 Date 对象
 * 参考 Python 的 gmt_to_iso 函数实现
 * 格式: "Mon, 04 Nov 2024 15:00:00 GMT" 或 "Fri, 19 Sep 2025 22:23:49 GMT"
 * 
 * @param gmtString GMT 格式的时间字符串
 * @returns Date 对象（UTC 时区）或 null
 */
function parseRFC822Date(gmtString: string): Date | null {
  if (!gmtString || typeof gmtString !== 'string') return null
  
  // 优先手动解析 GMT 格式，确保时区正确
  // 格式: "%a, %d %b %Y %H:%M:%S %Z"
  // 例如: "Mon, 04 Nov 2024 15:00:00 GMT"
  try {
    const gmtMatch = gmtString.match(/^(\w+),\s+(\d{1,2})\s+(\w+)\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})\s+(GMT|UTC)$/i)
    if (gmtMatch) {
      const months: Record<string, number> = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      }
      
      const day = parseInt(gmtMatch[2], 10)
      const monthName = gmtMatch[3]
      // 处理月份名称的大小写（如 "Sep", "SEP", "sep"）
      const month = months[monthName] ?? months[monthName.charAt(0).toUpperCase() + monthName.slice(1).toLowerCase()] ?? 0
      const year = parseInt(gmtMatch[4], 10)
      const hour = parseInt(gmtMatch[5], 10)
      const minute = parseInt(gmtMatch[6], 10)
      const second = parseInt(gmtMatch[7], 10)
      
      // 使用 Date.UTC 创建 UTC 时区的日期对象（GMT = UTC）
      // 这确保了时区信息正确，与 Python 的 timezone.utc 行为一致
      const date = new Date(Date.UTC(year, month, day, hour, minute, second))
      
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  } catch (error) {
    console.warn('手动解析 GMT 格式失败:', gmtString, error)
  }
  
  // 如果手动解析失败，尝试使用 Date 构造函数（作为备选方案）
  // JavaScript 的 Date 构造函数通常可以正确解析 RFC 822 格式
  try {
    const date = new Date(gmtString)
    if (!isNaN(date.getTime())) {
      // 验证解析结果是否正确（通过检查 ISO 字符串格式）
      const isoString = date.toISOString()
      // 如果解析成功，返回日期对象
      return date
    }
  } catch (error) {
    console.warn('Date 构造函数解析失败:', gmtString, error)
  }
  
  // 尝试解析 ISO 格式（如 "2025-11-10T17:50:53.987738" 或 "2024-11-04T15:00:00+00:00"）
  try {
    const isoMatch = gmtString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(\.\d+)?(Z|[\+\-]\d{2}:\d{2})?/)
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10)
      const month = parseInt(isoMatch[2], 10) - 1 // 月份从0开始
      const day = parseInt(isoMatch[3], 10)
      const hour = parseInt(isoMatch[4], 10)
      const minute = parseInt(isoMatch[5], 10)
      const second = parseInt(isoMatch[6], 10)
      
      // 如果有时区信息（Z 或 +/-HH:MM），使用 UTC；否则使用本地时间
      if (isoMatch[8]) {
        const date = new Date(Date.UTC(year, month, day, hour, minute, second))
        if (!isNaN(date.getTime())) {
          return date
        }
      } else {
        const date = new Date(year, month, day, hour, minute, second)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    }
  } catch (error) {
    console.warn('解析 ISO 格式失败:', gmtString, error)
  }
  
  console.error('无法解析日期字符串:', gmtString)
  return null
}

/**
 * 转换豆瓣RSS数据为TimelineItem
 */
export async function transformDoubanRSS(
  item: DoubanRSSItem,
  index: number,
  fetchedAt?: string
): Promise<TimelineItem | null> {
  // 解析发布时间
  const date = parseRFC822Date(item.published)
  if (!date) {
    console.error(`无法解析豆瓣RSS日期: ${item.published}`, item)
    return null
  }
  
  const config = PLATFORM_CONFIG['douban-rss']
  
  // 不再获取缩略图，直接使用RSS中的评分
  const rating = item.rating || undefined
  
  // 确保使用正确的发布时间
  const publishedAtISO = date.toISOString()
  
  return {
    id: `douban-rss-${index}`,
    platform: 'douban-rss',
    platformName: config.name,
    platformIcon: config.icon,
    platformColor: config.color,
    title: item.title,
    url: item.url,
    description: item.description,
    thumbnail: undefined, // 不再获取缩略图
    publishedAt: publishedAtISO,
    formattedDate: item.formattedDate || formatRelativeTime(date),
    metadata: {
      type: item.type === 'interest' ? '收藏' : item.type,
      author: item.author || undefined,
      rating: rating
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
  // 支持 published_at 或 published 字段
  const publishedAt = item.published_at || (item as any).published
  if (!publishedAt) {
    console.warn('简书文章缺少发布时间:', item.title, item)
    return null
  }
  
  const date = new Date(publishedAt)
  if (isNaN(date.getTime())) {
    console.warn('简书文章发布时间格式错误:', publishedAt, item.title)
    return null
  }
  
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
  // 支持 published_at 或 published 字段
  const publishedAt = item.published_at || (item as any).published
  if (!publishedAt) {
    console.warn('B站视频缺少发布时间:', item.title, item)
    return null
  }
  
  const date = new Date(publishedAt)
  if (isNaN(date.getTime())) {
    console.warn('B站视频发布时间格式错误:', publishedAt, item.title)
    return null
  }
  
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

