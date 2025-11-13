'use client'

import { useState, useEffect } from 'react'
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

// 合并所有平台数据并排序（使用统一的转换器）
async function mergeAndSortData(
  doubanRSSData: DoubanRSSData | null,
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

  // 转换简书文章数据
  if (jianshuData) {
    jianshuData.articles
      .filter((article: JianshuArticle) => 
        article.title !== "0" && 
        !article.link.includes("#comments")
      )
      .map((article: JianshuArticle) => ({
        ...article,
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

export default function TimelinePage() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // 使用相对路径，在浏览器中调用 API
        const [doubanRes, bilibiliRes, jianshuRes, youtubeRes] = await Promise.allSettled([
          fetch('/api/data/douban', {
            cache: 'no-store',
            signal: AbortSignal.timeout(10000)
          }),
          fetch('/api/data/bilibili', {
            cache: 'no-store',
            signal: AbortSignal.timeout(10000)
          }),
          fetch('/api/data/jianshu', {
            cache: 'no-store',
            signal: AbortSignal.timeout(10000)
          }),
          fetch('/api/data/youtube', {
            cache: 'no-store',
            signal: AbortSignal.timeout(10000)
          })
        ])

        let doubanRSSData: DoubanRSSData | null = null
        let bilibiliData: BilibiliData | null = null
        let jianshuData: JianshuData | null = null
        let youtubeData: YouTubeData | null = null

        // 处理豆瓣数据
        if (doubanRes.status === 'fulfilled' && doubanRes.value.ok) {
          try {
            const result = await doubanRes.value.json()
            if (result.success && result.data) {
              doubanRSSData = {
                collections: result.data.collections || result.data.interests || [],
                total: result.data.total || 0,
                user: result.data.user || { id: '', nickname: '' },
                fetched_at: result.data.fetched_at || new Date().toISOString()
              }
            } else {
              console.error('[时间流] 豆瓣RSS数据获取失败:', result?.error)
            }
          } catch (err) {
            console.error('[时间流] 豆瓣RSS数据解析失败:', err)
          }
        } else {
          console.error('[时间流] 豆瓣RSS API请求失败:', doubanRes.status === 'rejected' ? doubanRes.reason : '请求失败')
        }

        // 处理B站数据
        if (bilibiliRes.status === 'fulfilled' && bilibiliRes.value.ok) {
          try {
            const result = await bilibiliRes.value.json()
            console.log('[时间流] B站数据响应:', { success: result?.success, videos_count: result?.data?.videos?.length })
            if (result.success && result.data) {
              const videos = (result.data.videos || [])
                .map((video: any) => ({
                  ...video,
                  published_at: video.published_at || video.published || null,
                  fetched_at: video.fetched_at || new Date().toISOString()
                }))
                .filter((video: any) => video.url && video.url.trim() !== '' && video.published_at !== null)
              
              console.log('[时间流] B站有效视频数:', videos.length)
              
              bilibiliData = {
                user_id: result.data.user?.id || '',
                total_videos: videos.length,
                fetched_at: new Date().toISOString(),
                videos: videos
              }
            } else {
              console.error('[时间流] B站数据获取失败:', result?.error)
            }
          } catch (err) {
            console.error('[时间流] B站数据解析失败:', err)
          }
        } else {
          console.error('[时间流] B站API请求失败:', bilibiliRes.status === 'rejected' ? bilibiliRes.reason : '请求失败')
        }

        // 处理简书数据
        if (jianshuRes.status === 'fulfilled' && jianshuRes.value.ok) {
          try {
            const result = await jianshuRes.value.json()
            console.log('[时间流] 简书数据响应:', { success: result?.success, articles_count: result?.data?.articles?.length })
            if (result.success && result.data) {
              const articles = (result.data.articles || [])
                .map((article: any) => ({
                  ...article,
                  published_at: article.published_at || article.published || null,
                  fetched_at: article.fetched_at || new Date().toISOString()
                }))
                .filter((article: any) => 
                  article.title && 
                  article.title !== "0" && 
                  article.link && 
                  !article.link.includes("#comments") &&
                  article.published_at !== null
                )
              
              console.log('[时间流] 简书有效文章数:', articles.length)
              
              jianshuData = {
                user_id: result.data.user?.id || '',
                total_articles: articles.length,
                fetched_at: new Date().toISOString(),
                articles: articles
              }
            } else {
              console.error('[时间流] 简书数据获取失败:', result?.error)
            }
          } catch (err) {
            console.error('[时间流] 简书数据解析失败:', err)
          }
        } else {
          console.error('[时间流] 简书API请求失败:', jianshuRes.status === 'rejected' ? jianshuRes.reason : '请求失败')
        }

        // 处理YouTube数据
        if (youtubeRes.status === 'fulfilled' && youtubeRes.value.ok) {
          try {
            const result = await youtubeRes.value.json()
            console.log('[时间流] YouTube数据响应:', { success: result?.success, videos_count: result?.data?.videos?.length })
            if (result.success && result.data) {
              const videos = (result.data.videos || []).filter((video: any) => video.published_at)
              console.log('[时间流] YouTube有效视频数:', videos.length)
              
              youtubeData = {
                channel_handle: result.data.channel?.handle || '',
                channel_name: result.data.channel?.name || '',
                total_videos: videos.length,
                fetched_at: new Date().toISOString(),
                videos: videos
              }
            } else {
              console.error('[时间流] YouTube数据获取失败:', result?.error)
            }
          } catch (err) {
            console.error('[时间流] YouTube数据解析失败:', err)
          }
        } else {
          console.error('[时间流] YouTube API请求失败:', youtubeRes.status === 'rejected' ? youtubeRes.reason : '请求失败')
        }

        console.log('[时间流] 准备合并数据:', {
          douban: doubanRSSData?.collections?.length || 0,
          bilibili: bilibiliData?.videos?.length || 0,
          jianshu: jianshuData?.articles?.length || 0,
          youtube: youtubeData?.videos?.length || 0
        })

        // 合并并排序数据
        const items = await mergeAndSortData(
          doubanRSSData,
          bilibiliData,
          jianshuData,
          youtubeData
        )

        console.log('[时间流] 合并后数据项数:', items.length)
        setTimelineItems(items)
      } catch (err: any) {
        console.error('[时间流] 数据获取失败:', err)
        setError(err.message || '数据加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
  const sortedDateKeys = Object.keys(groupedByDate).sort((a, b) => {
    const itemsA = groupedByDate[a]
    const itemsB = groupedByDate[b]
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
            {loading ? (
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm">加载中...</span>
              </div>
            ) : error ? (
              <div className="bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm">加载失败: {error}</span>
              </div>
            ) : (
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
            )}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">⏳</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">加载中...</h3>
              <p className="text-gray-600">正在获取数据</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-red-400 text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">加载失败</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : timelineItems.length === 0 ? (
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
