'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThumbnailImage from '@/components/ThumbnailImage'
import { transformBilibili, transformJianshu, transformYouTube } from '../timeline/transformers'
import { TimelineItem } from '../timeline/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

// 平台配置
const platforms = [
  {
    name: 'YouTube',
    icon: '📺',
    color: 'bg-red-50 text-red-700 hover:bg-red-100',
    url: 'https://www.youtube.com/@saai-saai',
    description: '视频创作平台'
  },
  {
    name: '哔哩哔哩',
    icon: '📱',
    color: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
    url: 'https://space.bilibili.com/472773672',
    description: '弹幕视频网站'
  },
  {
    name: '简书',
    icon: '📝',
    color: 'bg-green-50 text-green-700 hover:bg-green-100',
    url: 'https://www.jianshu.com/u/763ffbb1b873',
    description: '写作分享平台'
  },
  {
    name: 'GitHub',
    icon: '💻',
    color: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
    url: 'https://github.com/saai',
    description: '代码托管平台'
  },
  {
    name: '豆瓣',
    icon: '📚',
    color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    url: 'https://www.douban.com/people/284853052',
    description: '书影音分享平台'
  },
  {
    name: 'Instagram',
    icon: '📷',
    color: 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100',
    url: 'https://www.instagram.com/shayansaai/',
    description: '图片社交平台'
  }
]

export default function HomePage() {
  const [latestItems, setLatestItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // 使用相对路径，在浏览器中调用 API
        const [bilibiliRes, jianshuRes, youtubeRes] = await Promise.allSettled([
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

        const items: TimelineItem[] = []

        // 处理 B站数据
        if (bilibiliRes.status === 'fulfilled' && bilibiliRes.value.ok) {
          try {
            const bilibiliData = await bilibiliRes.value.json()
            console.log('[首页] B站数据响应:', { success: bilibiliData?.success, videos_count: bilibiliData?.data?.videos?.length })
            if (bilibiliData?.success && bilibiliData.data?.videos?.length > 0) {
              const videosWithUrl = bilibiliData.data.videos.filter((video: any) => 
                video.url && video.url.trim() !== ''
              )
              console.log('[首页] B站有效视频数:', videosWithUrl.length)
              if (videosWithUrl.length > 0) {
                const latestVideo = videosWithUrl[0]
                const publishedAt = latestVideo.published_at || latestVideo.published || null
                console.log('[首页] B站最新视频:', { title: latestVideo.title, published_at: publishedAt })
                if (publishedAt) {
                  const transformed = transformBilibili({
                    title: latestVideo.title,
                    url: latestVideo.url,
                    publish_time: latestVideo.publish_time || '',
                    published_at: publishedAt,
                    play_count: latestVideo.play_count || '0',
                    cover_url: latestVideo.cover_url || '',
                    formattedDate: latestVideo.formattedDate,
                    fetched_at: latestVideo.fetched_at || new Date().toISOString()
                  }, 0)
                  console.log('[首页] B站转换结果:', transformed ? '成功' : '失败')
                  if (transformed) items.push(transformed)
                } else {
                  console.warn('[首页] B站视频缺少发布时间:', latestVideo)
                }
              } else {
                console.warn('[首页] B站没有有效视频')
              }
            } else {
              console.error('[首页] B站数据获取失败:', bilibiliData?.error || '数据为空')
            }
          } catch (err) {
            console.error('[首页] B站数据解析失败:', err)
          }
        } else {
          console.error('[首页] B站API请求失败:', bilibiliRes.status === 'rejected' ? bilibiliRes.reason : '请求失败')
        }

        // 处理简书数据
        if (jianshuRes.status === 'fulfilled' && jianshuRes.value.ok) {
          try {
            const jianshuData = await jianshuRes.value.json()
            console.log('[首页] 简书数据响应:', { success: jianshuData?.success, articles_count: jianshuData?.data?.articles?.length })
            if (jianshuData?.success && jianshuData.data?.articles?.length > 0) {
              // 过滤掉无效文章（标题为"0"或链接包含"#comments"）
              const validArticles = jianshuData.data.articles.filter((article: any) => 
                article.title && 
                article.title !== "0" && 
                article.link && 
                !article.link.includes("#comments") &&
                (article.published_at || article.published)
              )
              console.log('[首页] 简书有效文章数:', validArticles.length)
              
              if (validArticles.length > 0) {
                const latestArticle = validArticles[0]
                const publishedAt = latestArticle.published_at || latestArticle.published || null
                console.log('[首页] 简书最新文章:', { title: latestArticle.title, published_at: publishedAt })
                if (publishedAt) {
                  const transformed = transformJianshu({
                    title: latestArticle.title,
                    link: latestArticle.link,
                    slug: latestArticle.slug || '',
                    published_at: publishedAt,
                    fetched_at: latestArticle.fetched_at || new Date().toISOString(),
                    formattedDate: latestArticle.formattedDate,
                    user_id: latestArticle.user_id || ''
                  }, 0)
                  console.log('[首页] 简书转换结果:', transformed ? '成功' : '失败')
                  if (transformed) items.push(transformed)
                } else {
                  console.warn('[首页] 简书文章缺少发布时间:', latestArticle)
                }
              } else {
                console.warn('[首页] 简书没有有效文章')
              }
            } else {
              console.error('[首页] 简书数据获取失败:', jianshuData?.error || '数据为空')
            }
          } catch (err) {
            console.error('[首页] 简书数据解析失败:', err)
          }
        } else {
          console.error('[首页] 简书API请求失败:', jianshuRes.status === 'rejected' ? jianshuRes.reason : '请求失败')
        }

        // 处理 YouTube 数据
        if (youtubeRes.status === 'fulfilled' && youtubeRes.value.ok) {
          try {
            const youtubeData = await youtubeRes.value.json()
            console.log('[首页] YouTube数据响应:', { success: youtubeData?.success, videos_count: youtubeData?.data?.videos?.length })
            if (youtubeData?.success && youtubeData.data?.videos?.length > 0) {
              const latestYouTubeVideo = youtubeData.data.videos[0]
              console.log('[首页] YouTube最新视频:', { title: latestYouTubeVideo.title, published_at: latestYouTubeVideo.published_at })
              if (latestYouTubeVideo.published_at) {
                const transformed = transformYouTube({
                  video_id: latestYouTubeVideo.video_id || '',
                  title: latestYouTubeVideo.title,
                  url: latestYouTubeVideo.url,
                  published_at: latestYouTubeVideo.published_at || '',
                  description: latestYouTubeVideo.description,
                  thumbnail_url: latestYouTubeVideo.thumbnail_url,
                  channel_name: latestYouTubeVideo.channel_name,
                  formattedDate: latestYouTubeVideo.formattedDate,
                  fetched_at: latestYouTubeVideo.fetched_at || new Date().toISOString()
                }, 0)
                console.log('[首页] YouTube转换结果:', transformed ? '成功' : '失败')
                if (transformed) items.push(transformed)
              } else {
                console.warn('[首页] YouTube视频缺少发布时间:', latestYouTubeVideo)
              }
            } else {
              console.error('[首页] YouTube数据获取失败:', youtubeData?.error || '数据为空')
            }
          } catch (err) {
            console.error('[首页] YouTube数据解析失败:', err)
          }
        } else {
          console.error('[首页] YouTube API请求失败:', youtubeRes.status === 'rejected' ? youtubeRes.reason : '请求失败')
        }

        // 按平台顺序排序：YouTube, Bilibili, 简书
        const platformOrder = ['youtube', 'bilibili', 'jianshu']
        items.sort((a, b) => {
          const indexA = platformOrder.indexOf(a.platform)
          const indexB = platformOrder.indexOf(b.platform)
          if (indexA === -1 && indexB === -1) return 0
          if (indexA === -1) return 1
          if (indexB === -1) return -1
          return indexA - indexB
        })

        console.log('[首页] 最终数据项数:', items.length, '项:', items.map(i => i.platform))
        setLatestItems(items)
      } catch (err: any) {
        console.error('[首页] 数据获取失败:', err)
        setError(err.message || '数据加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-background to-accent-50/50">
      {/* Decorative elements */}
      <div className="artistic-decoration top-20 left-10"></div>
      <div className="artistic-decoration bottom-20 right-10"></div>
      
      <Header />
      
      <main>
        {/* Latest Updates Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 text-white py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Latest Updates</h1>
              <p className="text-white/90 text-lg">Stay updated with my latest content</p>
            </div>
            
            {/* Latest Updates Grid - Display the latest content from each platform (YouTube, Bilibili, Jianshu) */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                // Loading state
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                      <CardContent className="p-6">
                        <p className="text-white/90 mb-4 leading-relaxed">Loading...</p>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : error ? (
                // Error state
                <Card className="col-span-3 bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <p className="text-white/90 mb-4 leading-relaxed">Failed to load: {error}</p>
                  </CardContent>
                </Card>
              ) : latestItems.length > 0 ? (
                latestItems.map((item) => {
                  // Determine link text and icon color based on platform type
                  const linkText = item.platform === 'jianshu' ? 'Read Article' : 
                                   item.platform === 'bilibili' || item.platform === 'youtube' ? 'Watch Video' : 
                                   'View Details'
                  
                  const badgeVariant = item.platform === 'youtube' ? 'destructive' :
                                     item.platform === 'bilibili' ? 'secondary' :
                                     'default'
                  
                  return (
                    <Card key={item.id} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl mr-4">
                            {item.platformIcon}
                          </div>
                          <div>
                            <Badge variant={badgeVariant} className="mb-1">{item.platformName}</Badge>
                            <p className="text-xs text-white/80">Latest Content</p>
                          </div>
                        </div>
                        
                        {/* Thumbnail */}
                        <ThumbnailImage 
                          src={item.thumbnail || ''} 
                          alt={item.title}
                        />
                        
                        <p className="text-white/90 mb-4 leading-relaxed line-clamp-2 min-h-[3rem]">
                          {item.title}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-xs">{item.formattedDate}</span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            {linkText}
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                // If no data, show placeholder
                <>
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
                      <CardContent className="p-6">
                        <p className="text-white/90 mb-4 leading-relaxed">No Data</p>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>

            {/* View All Updates Button */}
            <div className="text-center mt-12">
              <Button asChild size="lg" variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <a href="/en/timeline" className="flex items-center gap-2">
                  View Timeline
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Platform Navigation */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-4xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                My Platform Pages
              </h2>
              <p className="text-lg text-muted-foreground">
                Click the icons below to visit my personal pages on various platforms
              </p>
            </div>

            {/* Platform Grid - 3 columns layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platforms.map((platform, index) => (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-primary/50">
                    <CardContent className="p-8 text-center">
                      <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-3xl mb-6 ${platform.color} transition-all duration-300 group-hover:scale-110`}>
                        {platform.icon}
                      </div>
                      <h3 className="text-xl font-display font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {platform.description}
                      </p>
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="text-primary text-sm font-medium flex items-center justify-center gap-1">
                          Visit
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
