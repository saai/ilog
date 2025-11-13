import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThumbnailImage from '@/components/ThumbnailImage'
import { TimelineItem } from './types'
import {
  transformDoubanRSS,
  transformJianshu,
  transformBilibili,
  transformYouTube,
  mergeAndSortTimelineItems
} from './transformers'

// 强制动态生成，避免构建时调用API
export const dynamic = 'force-dynamic'

// 豆瓣RSS收藏项的类型定义
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

interface DoubanRSSData {
  collections: DoubanRSSItem[]
  total: number
  user: {
    id: string
    nickname: string
  }
  fetched_at: string
}

// 豆瓣收藏项的类型定义
interface DoubanItem {
  title: string
  url: string
  type: string
  rating: string
  author: string
  fetched_at: string
}

// B站视频项的类型定义
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

interface BilibiliData {
  user_id: string
  total_videos: number
  fetched_at: string
  videos: BilibiliVideo[]
}

// 简书文章项的类型定义
interface JianshuArticle {
  title: string
  link: string
  slug: string
  published_at?: string | null
  fetched_at: string
  formattedDate?: string
  user_id: string
}

interface JianshuData {
  user_id: string
  total_articles: number
  fetched_at: string
  articles: JianshuArticle[]
}

// YouTube视频项的类型定义
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

interface YouTubeData {
  channel_handle: string
  channel_name: string
  total_videos: number
  fetched_at: string
  videos: YouTubeVideo[]
}

// 服务器端数据获取函数 - 通过 API 路由获取数据
async function getDoubanRSSData() {
  try {
    // 构建API URL：优先使用环境变量，否则在本地开发时使用localhost
    // 在构建时，如果没有可用的URL，直接返回错误（避免连接错误）
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      // 在 Vercel 构建时，VERCEL_URL 可能不可用，检查 VERCEL 环境变量
      if (process.env.VERCEL && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:3000'
      } else {
        // 构建时且没有可用的URL，返回错误（避免连接错误）
        console.warn('构建时无法获取豆瓣RSS数据：缺少BASE_URL配置，跳过API调用')
        return { success: false, error: '构建时无法获取数据' }
      }
    }
    const apiUrl = `${baseUrl}/api/data/douban`
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      // 添加超时和错误处理
      signal: AbortSignal.timeout(10000) // 10秒超时
    })

    if (!response.ok) {
      console.error(`[时间流] 豆瓣RSS API请求失败: ${response.status} ${response.statusText}`)
      return { success: false, error: `豆瓣RSS API请求失败: ${response.status}` }
    }

    const result = await response.json()
    if (result.success && result.data) {
      const data: DoubanRSSData = {
        collections: result.data.collections || result.data.interests || [],
        total: result.data.total || 0,
        user: result.data.user || { id: '', nickname: '' },
        fetched_at: result.data.fetched_at || new Date().toISOString()
      }
      return { success: true, data }
    }
    console.error('[时间流] 豆瓣RSS数据获取失败: API返回的数据为空或无效', {
      hasResult: !!result,
      success: result?.success,
      hasData: !!result?.data,
      error: result?.error
    })
    return { success: false, error: result.error || '豆瓣RSS数据获取失败' }
  } catch (error: any) {
    // 记录错误日志，返回错误对象而不是抛出异常
    if (error.name === 'AbortError') {
      console.error('[时间流] 获取豆瓣RSS数据超时 (10秒)')
      return { success: false, error: '获取豆瓣RSS数据超时' }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[时间流] 无法连接到豆瓣RSS API服务器，跳过豆瓣数据', { code: error.code })
      return { success: false, error: '无法连接到豆瓣RSS API服务器' }
    } else {
      console.error('[时间流] 获取豆瓣RSS数据失败:', error.message || error, { error: error })
      return { success: false, error: error.message || '获取豆瓣RSS数据失败' }
    }
  }
}

async function getDoubanData(): Promise<{ success: false; error: string }> {
  return { success: false, error: '豆瓣收藏数据已不再通过Spider抓取，请使用RSS数据' }
}

async function getBilibiliData() {
  try {
    // 构建API URL：优先使用环境变量，否则在本地开发时使用localhost
    // 在构建时，如果没有可用的URL，直接返回错误（避免连接错误）
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      // 在 Vercel 构建时，VERCEL_URL 可能不可用，检查 VERCEL 环境变量
      if (process.env.VERCEL && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:3000'
      } else {
        // 构建时且没有可用的URL，返回错误（避免连接错误）
        console.warn('构建时无法获取B站数据：缺少BASE_URL配置，跳过API调用')
        return { success: false, error: '构建时无法获取数据' }
      }
    }
    const apiUrl = `${baseUrl}/api/data/bilibili`
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      // 添加超时和错误处理
      signal: AbortSignal.timeout(10000) // 10秒超时
    })

    if (!response.ok) {
      console.error(`[时间流] B站API请求失败: ${response.status} ${response.statusText}`)
      return { success: false, error: `B站API请求失败: ${response.status}` }
    }

    const result = await response.json()
    if (result.success && result.data) {
      // 确保每个视频都有 published_at 字段
      const videos = (result.data.videos || []).map((video: any) => ({
        ...video,
        published_at: video.published_at || video.published || null,
        fetched_at: video.fetched_at || new Date().toISOString()
      }))
      
      const data: BilibiliData = {
        user_id: result.data.user?.id || '',
        total_videos: videos.length,
        fetched_at: new Date().toISOString(),
        videos: videos
      }
      return { success: true, data }
    }
    console.error('[时间流] B站数据获取失败: API返回的数据为空或无效', {
      hasResult: !!result,
      success: result?.success,
      hasData: !!result?.data,
      hasVideos: !!result?.data?.videos,
      videoCount: result?.data?.videos?.length || 0,
      error: result?.error
    })
    return { success: false, error: result.error || 'B站数据获取失败' }
  } catch (error: any) {
    // 记录错误日志，返回错误对象而不是抛出异常
    if (error.name === 'AbortError') {
      console.error('[时间流] 获取B站数据超时 (10秒)')
      return { success: false, error: '获取B站数据超时' }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[时间流] 无法连接到B站API服务器，跳过B站数据', { code: error.code })
      return { success: false, error: '无法连接到B站API服务器' }
    } else {
      console.error('[时间流] 获取B站数据失败:', error.message || error, { error: error })
      return { success: false, error: error.message || '获取B站数据失败' }
    }
  }
}

async function getJianshuData() {
  try {
    // 构建API URL：优先使用环境变量，否则在本地开发时使用localhost
    // 在构建时，如果没有可用的URL，直接返回错误（避免连接错误）
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      // 在 Vercel 构建时，VERCEL_URL 可能不可用，检查 VERCEL 环境变量
      if (process.env.VERCEL && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:3000'
      } else {
        // 构建时且没有可用的URL，返回错误（避免连接错误）
        console.warn('构建时无法获取简书数据：缺少BASE_URL配置，跳过API调用')
        return { success: false, error: '构建时无法获取数据' }
      }
    }
    const apiUrl = `${baseUrl}/api/data/jianshu`
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      // 添加超时和错误处理
      signal: AbortSignal.timeout(10000) // 10秒超时
    })

    if (!response.ok) {
      console.error(`[时间流] 简书API请求失败: ${response.status} ${response.statusText}`)
      return { success: false, error: `简书API请求失败: ${response.status}` }
    }

    const result = await response.json()
    if (result.success && result.data) {
      // 确保每个文章都有 published_at 字段
      const articles = (result.data.articles || []).map((article: any) => ({
        ...article,
        published_at: article.published_at || article.published || null,
        fetched_at: article.fetched_at || new Date().toISOString()
      }))
      
      const data: JianshuData = {
        user_id: result.data.user?.id || '',
        total_articles: articles.length,
        fetched_at: new Date().toISOString(),
        articles: articles
      }
      return { success: true, data }
    }
    console.error('[时间流] 简书数据获取失败: API返回的数据为空或无效', {
      hasResult: !!result,
      success: result?.success,
      hasData: !!result?.data,
      hasArticles: !!result?.data?.articles,
      articleCount: result?.data?.articles?.length || 0,
      error: result?.error
    })
    return { success: false, error: result.error || '简书数据获取失败' }
  } catch (error: any) {
    // 记录错误日志，返回错误对象而不是抛出异常
    if (error.name === 'AbortError') {
      console.error('[时间流] 获取简书数据超时 (10秒)')
      return { success: false, error: '获取简书数据超时' }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[时间流] 无法连接到简书API服务器，跳过简书数据', { code: error.code })
      return { success: false, error: '无法连接到简书API服务器' }
    } else {
      console.error('[时间流] 获取简书数据失败:', error.message || error, { error: error })
      return { success: false, error: error.message || '获取简书数据失败' }
    }
  }
}

async function getYouTubeData() {
  try {
    // 构建API URL：优先使用环境变量，否则在本地开发时使用localhost
    // 在构建时，如果没有可用的URL，直接返回错误（避免连接错误）
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      // 在 Vercel 构建时，VERCEL_URL 可能不可用，检查 VERCEL 环境变量
      if (process.env.VERCEL && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:3000'
      } else {
        // 构建时且没有可用的URL，返回错误（避免连接错误）
        console.warn('构建时无法获取YouTube数据：缺少BASE_URL配置，跳过API调用')
        return { success: false, error: '构建时无法获取数据' }
      }
    }
    const apiUrl = `${baseUrl}/api/data/youtube`
    const response = await fetch(apiUrl, {
      cache: 'no-store',
      // 添加超时和错误处理
      signal: AbortSignal.timeout(10000) // 10秒超时
    })

    if (!response.ok) {
      console.error(`[时间流] YouTube API请求失败: ${response.status} ${response.statusText}`)
      return { success: false, error: `YouTube API请求失败: ${response.status}` }
    }

    const result = await response.json()
    if (result.success && result.data) {
      const data: YouTubeData = {
        channel_handle: result.data.channel?.handle || '',
        channel_name: result.data.channel?.name || '',
        total_videos: result.data.total || 0,
        fetched_at: new Date().toISOString(),
        videos: result.data.videos || []
      }
      return { success: true, data }
    }
    console.error('[时间流] YouTube数据获取失败: API返回的数据为空或无效', {
      hasResult: !!result,
      success: result?.success,
      hasData: !!result?.data,
      hasVideos: !!result?.data?.videos,
      videoCount: result?.data?.videos?.length || 0,
      error: result?.error
    })
    return { success: false, error: result.error || 'YouTube数据获取失败' }
  } catch (error: any) {
    // 记录错误日志，返回错误对象而不是抛出异常
    if (error.name === 'AbortError') {
      console.error('[时间流] 获取YouTube数据超时 (10秒)')
      return { success: false, error: '获取YouTube数据超时' }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[时间流] 无法连接到YouTube API服务器，跳过YouTube数据', { code: error.code })
      return { success: false, error: '无法连接到YouTube API服务器' }
    } else {
      console.error('[时间流] 获取YouTube数据失败:', error.message || error, { error: error })
      return { success: false, error: error.message || '获取YouTube数据失败' }
    }
  }
}

// 注意：formatRelativeTime 和 parseRFC822Date 函数已移至 transformers.ts

// 合并所有平台数据并排序（使用统一的转换器）
async function mergeAndSortData(
  doubanRSSData: DoubanRSSData | null,
  doubanData: any,
  bilibiliData: BilibiliData | null,
  jianshuData: JianshuData | null,
  youtubeData: YouTubeData | null
): Promise<TimelineItem[]> {
  const items: TimelineItem[] = []

  // 转换豆瓣RSS数据
  if (doubanRSSData) {
    const transformedItems = await Promise.all(
      doubanRSSData.collections.map((item, index) => 
        transformDoubanRSS(item, index, doubanRSSData.fetched_at)
      )
    )
    transformedItems.forEach(transformed => {
      if (transformed) items.push(transformed)
    })
  }

  // 注意：豆瓣收藏的Selenium爬虫数据已跳过（因为没有实际发布时间）

  // 转换简书文章数据
  if (jianshuData) {
    jianshuData.articles
      .filter((article: JianshuArticle) => 
        article.title !== "0" && 
        !article.link.includes("#comments")
      )
      .map((article: JianshuArticle) => ({
        ...article,
        // 确保 published_at 存在，如果不存在则使用 published
        published_at: article.published_at || (article as any).published || null
      }))
      .filter((article: JianshuArticle) => article.published_at !== null)
      .forEach((article: JianshuArticle, index: number) => {
        const transformed = transformJianshu(article, index)
        if (transformed) items.push(transformed)
      })
  }

  // 转换B站视频数据（只处理有url的视频）
  if (bilibiliData) {
    bilibiliData.videos
      .filter((video: BilibiliVideo) => 
        video.url && video.url.trim() !== ''
      )
      .forEach((video: BilibiliVideo, index: number) => {
        const transformed = transformBilibili(video, index)
        if (transformed) items.push(transformed)
      })
  }

  // 转换YouTube视频数据
  if (youtubeData) {
    youtubeData.videos.forEach((video: YouTubeVideo, index: number) => {
      const transformed = transformYouTube(video, index)
      if (transformed) items.push(transformed)
    })
  }

  // 合并并排序
  return mergeAndSortTimelineItems(items)
}

export default async function TimelinePage() {
  // 服务器端获取所有数据（使用 allSettled 确保即使某个平台失败，其他平台也能继续）
  const results = await Promise.allSettled([
    getDoubanRSSData(),
    getDoubanData(),
    getBilibiliData(),
    getJianshuData(),
    getYouTubeData()
  ])
  
  // 提取成功的结果
  const doubanRSSResult = results[0].status === 'fulfilled' ? results[0].value : { success: false, error: '获取失败' }
  const doubanResult = results[1].status === 'fulfilled' ? results[1].value : { success: false, error: '获取失败' }
  const bilibiliResult = results[2].status === 'fulfilled' ? results[2].value : { success: false, error: '获取失败' }
  const jianshuResult = results[3].status === 'fulfilled' ? results[3].value : { success: false, error: '获取失败' }
  const youtubeResult = results[4].status === 'fulfilled' ? results[4].value : { success: false, error: '获取失败' }
  
  // 记录失败的情况（但不阻止其他数据显示）
  if (results[0].status === 'rejected') {
    console.error('[时间流] Promise rejected - 获取豆瓣RSS数据失败:', results[0].reason)
  } else if (!doubanRSSResult.success) {
    console.error('[时间流] 豆瓣RSS数据未成功加载', { 
      success: doubanRSSResult.success,
      error: doubanRSSResult.error 
    })
  }
  
  if (results[2].status === 'rejected') {
    console.error('[时间流] Promise rejected - 获取B站数据失败:', results[2].reason)
  } else if (!bilibiliResult.success) {
    console.error('[时间流] B站数据未成功加载', { 
      success: bilibiliResult.success,
      error: bilibiliResult.error 
    })
  }
  
  if (results[3].status === 'rejected') {
    console.error('[时间流] Promise rejected - 获取简书数据失败:', results[3].reason)
  } else if (!jianshuResult.success) {
    console.error('[时间流] 简书数据未成功加载', { 
      success: jianshuResult.success,
      error: jianshuResult.error 
    })
  }
  
  if (results[4].status === 'rejected') {
    console.error('[时间流] Promise rejected - 获取YouTube数据失败:', results[4].reason)
  } else if (!youtubeResult.success) {
    console.error('[时间流] YouTube数据未成功加载', { 
      success: youtubeResult.success,
      error: youtubeResult.error 
    })
  }

  // 合并并排序数据
  const doubanRSSData = doubanRSSResult.success && doubanRSSResult.data ? doubanRSSResult.data : null
  const bilibiliData = bilibiliResult.success && bilibiliResult.data ? bilibiliResult.data : null
  const jianshuData = jianshuResult.success && jianshuResult.data ? jianshuResult.data : null
  const youtubeData = youtubeResult.success && youtubeResult.data ? youtubeResult.data : null
  
  // 记录数据加载总结
  const loadedPlatforms = []
  const failedPlatforms = []
  if (doubanRSSData) loadedPlatforms.push('豆瓣RSS')
  else failedPlatforms.push('豆瓣RSS')
  if (bilibiliData) loadedPlatforms.push('B站')
  else failedPlatforms.push('B站')
  if (jianshuData) loadedPlatforms.push('简书')
  else failedPlatforms.push('简书')
  if (youtubeData) loadedPlatforms.push('YouTube')
  else failedPlatforms.push('YouTube')
  
  if (failedPlatforms.length > 0) {
    console.error(`[时间流] 数据加载总结: 成功加载 ${loadedPlatforms.length} 个平台 (${loadedPlatforms.join(', ')})，失败 ${failedPlatforms.length} 个平台 (${failedPlatforms.join(', ')})`)
  } else {
    console.log(`[时间流] 数据加载总结: 所有平台数据加载成功 (${loadedPlatforms.join(', ')})`)
  }
  
  const timelineItems = await mergeAndSortData(
    doubanRSSData,
    null, // doubanResult always returns failure, pass null directly
    bilibiliData,
    jianshuData,
    youtubeData
  )

  // 按日期分组
  const groupedByDate = timelineItems.reduce((acc, item) => {
    const date = new Date(item.publishedAt)
    const dateKey = date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(item)
    return acc
  }, {} as Record<string, TimelineItem[]>)

  // 确保每个日期组内的条目按时间倒序排序（最新的在前）
  Object.keys(groupedByDate).forEach(dateKey => {
    groupedByDate[dateKey].sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  })

  // 按日期排序（最新的日期在前）
  // 使用每个日期组中第一个条目的时间进行排序（因为已经排序，第一个就是最新的）
  const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => {
    const itemsA = groupedByDate[a]
    const itemsB = groupedByDate[b]
    // 取每个日期组中第一个条目的时间（因为已经排序，第一个就是最新的）
    const dateA = itemsA && itemsA.length > 0 ? new Date(itemsA[0].publishedAt).getTime() : 0
    const dateB = itemsB && itemsB.length > 0 ? new Date(itemsB[0].publishedAt).getTime() : 0
    return dateB - dateA
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              📅 时间流
            </h1>
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              所有平台的最新动态，按时间顺序展示
            </p>
            <div className="flex justify-center space-x-4 flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm">共 {timelineItems.length} 条动态</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm">📚 {timelineItems.filter(i => i.platform === 'douban-rss').length} 豆瓣RSS</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm">📝 {timelineItems.filter(i => i.platform === 'jianshu').length} 简书</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm">📱 {timelineItems.filter(i => i.platform === 'bilibili').length} B站</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm">📺 {timelineItems.filter(i => i.platform === 'youtube').length} YouTube</span>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {timelineItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">暂无数据</h3>
              <p className="text-gray-600">请先运行爬虫脚本更新数据</p>
            </div>
          ) : (
            <div className="relative">
              {/* 时间线竖线 */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-200 via-primary-300 to-primary-200 hidden md:block"></div>

              {/* 时间流条目 */}
              <div className="space-y-8">
                {sortedDateKeys.map((dateKey) => {
                  const items = groupedByDate[dateKey]
                  return (
                  <div key={dateKey} className="relative">
                    {/* 日期标题 */}
                    <div className="sticky top-4 z-10 mb-6">
                      <div className="bg-white rounded-xl shadow-md px-6 py-3 inline-block border-l-4 border-primary-500">
                        <h2 className="text-lg font-bold text-gray-800">{dateKey}</h2>
                      </div>
                    </div>

                    {/* 该日期的所有条目 */}
                    <div className="space-y-6 ml-0 md:ml-16">
                      {items.map((item, index) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block"
                        >
                          <div className="relative flex items-start">
                            {/* 时间线节点 */}
                            <div className="absolute -left-8 hidden md:flex items-center justify-center w-8 h-8">
                              <div className={`w-4 h-4 rounded-full ${item.platformColor.split(' ')[0]} border-2 border-white shadow-lg group-hover:scale-125 transition-transform`}></div>
                            </div>

                            {/* 内容卡片 */}
                            <div className="flex-1 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-primary-300 overflow-hidden">
                              <div className="p-5">
                                {/* 平台标识和时间 */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <div className={`${item.platformColor} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}>
                                      <span>{item.platformIcon}</span>
                                      <span>{item.platformName}</span>
                                    </div>
                                    {item.metadata?.type && (
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {item.metadata.type}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">{item.formattedDate}</span>
                                </div>

                                {/* 标题 */}
                                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                                  {item.title}
                                </h3>

                                {/* 缩略图 */}
                                <ThumbnailImage 
                                  src={item.thumbnail || ''} 
                                  alt={item.title}
                                  height="h-40"
                                  containerClassName="bg-gray-50"
                                />

                                {/* 元数据 */}
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                  {item.metadata.author && (
                                    <span className="flex items-center">
                                      <span className="mr-1">👤</span>
                                      {item.metadata.author}
                                    </span>
                                  )}
                                  {item.metadata.rating && (
                                    <span className="flex items-center">
                                      <span className="mr-1">⭐</span>
                                      {item.metadata.rating}
                                    </span>
                                  )}
                                  {item.metadata.playCount && (
                                    <span className="flex items-center">
                                      <span className="mr-1">👁️</span>
                                      {item.metadata.playCount}
                                    </span>
                                  )}
                                  {item.metadata.director && (
                                    <span className="flex items-center">
                                      <span className="mr-1">🎬</span>
                                      {item.metadata.director}
                                    </span>
                                  )}
                                </div>

                                {/* 时间戳信息 */}
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-700">
                                        {new Date(item.publishedAt).toLocaleString('zh-CN', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs text-gray-500">
                                          {item.formattedDate}
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                          发布时间
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-xs text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                      查看详情 →
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

