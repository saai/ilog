import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThumbnailImage from '@/components/ThumbnailImage'
import { transformBilibili, transformJianshu, transformYouTube } from './timeline/transformers'
import { TimelineItem } from './timeline/types'

// 强制动态生成，避免构建时调用API
export const dynamic = 'force-dynamic'

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

// 获取B站最新视频数据
async function getBilibiliVideos() {
  try {
    // 构建API URL：优先使用环境变量，否则在本地开发时使用localhost
    // 在构建时，如果没有可用的URL，直接返回null（避免连接错误）
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      // 在 Vercel 构建时，VERCEL_URL 可能不可用，检查 VERCEL 环境变量
      if (process.env.VERCEL && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:3000'
      } else {
        // 构建时且没有可用的URL，返回null（避免连接错误）
        console.warn('构建时无法获取B站数据：缺少BASE_URL配置，跳过API调用')
        return null
      }
    }
    const apiUrl = `${baseUrl}/api/bilibili-videos`
    
    const response = await fetch(apiUrl, {
      cache: 'no-store', // 不缓存，始终获取最新数据
      // 添加超时和错误处理
      signal: AbortSignal.timeout(10000) // 10秒超时
    })
    
    if (!response.ok) {
      console.error(`[首页] B站API请求失败: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    
    // 检查API返回的数据是否成功
    if (!data || !data.success || !data.data || !data.data.videos || data.data.videos.length === 0) {
      console.error('[首页] B站数据获取失败: API返回的数据为空或无效', {
        hasData: !!data,
        success: data?.success,
        hasVideos: !!data?.data?.videos,
        videoCount: data?.data?.videos?.length || 0
      })
      return null
    }
    
    return data
  } catch (error: any) {
    // 记录错误日志，但不抛出异常，返回null让其他平台继续
    if (error.name === 'AbortError') {
      console.error('[首页] 获取B站数据超时 (10秒)')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[首页] 无法连接到B站API服务器，跳过B站数据', { code: error.code })
    } else {
      console.error('[首页] 获取B站视频数据失败:', error.message || error, { error: error })
    }
    return null
  }
}

// 获取简书最新文章数据
async function getJianshuArticles() {
  try {
    // 构建API URL：优先使用环境变量，否则在本地开发时使用localhost
    // 在构建时，如果没有可用的URL，直接返回null（避免连接错误）
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      // 在 Vercel 构建时，VERCEL_URL 可能不可用，检查 VERCEL 环境变量
      if (process.env.VERCEL && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:3000'
      } else {
        // 构建时且没有可用的URL，返回null（避免连接错误）
        console.warn('构建时无法获取简书数据：缺少BASE_URL配置，跳过API调用')
        return null
      }
    }
    const apiUrl = `${baseUrl}/api/jianshu-articles`
    
    const response = await fetch(apiUrl, {
      cache: 'no-store', // 不缓存，始终获取最新数据
      // 添加超时和错误处理
      signal: AbortSignal.timeout(10000) // 10秒超时
    })
    
    if (!response.ok) {
      console.error(`[首页] 简书API请求失败: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    
    // 检查API返回的数据是否成功
    if (!data || !data.success || !data.data || !data.data.articles || data.data.articles.length === 0) {
      console.error('[首页] 简书数据获取失败: API返回的数据为空或无效', {
        hasData: !!data,
        success: data?.success,
        hasArticles: !!data?.data?.articles,
        articleCount: data?.data?.articles?.length || 0
      })
      return null
    }
    
    return data
  } catch (error: any) {
    // 记录错误日志，但不抛出异常，返回null让其他平台继续
    if (error.name === 'AbortError') {
      console.error('[首页] 获取简书数据超时 (10秒)')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[首页] 无法连接到简书API服务器，跳过简书数据', { code: error.code })
    } else {
      console.error('[首页] 获取简书文章数据失败:', error.message || error, { error: error })
    }
    return null
  }
}

// 获取YouTube最新视频数据
async function getYouTubeVideos() {
  try {
    // 构建API URL：优先使用环境变量，否则在本地开发时使用localhost
    // 在构建时，如果没有可用的URL，直接返回null（避免连接错误）
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      // 在 Vercel 构建时，VERCEL_URL 可能不可用，检查 VERCEL 环境变量
      if (process.env.VERCEL && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`
      } else if (process.env.NODE_ENV === 'development') {
        baseUrl = 'http://localhost:3000'
      } else {
        // 构建时且没有可用的URL，返回null（避免连接错误）
        console.warn('构建时无法获取YouTube数据：缺少BASE_URL配置，跳过API调用')
        return null
      }
    }
    const apiUrl = `${baseUrl}/api/youtube-videos`
    
    const response = await fetch(apiUrl, {
      cache: 'no-store', // 不缓存，始终获取最新数据
      // 添加超时和错误处理
      signal: AbortSignal.timeout(10000) // 10秒超时
    })
    
    if (!response.ok) {
      console.error(`[首页] YouTube API请求失败: ${response.status} ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    
    // 检查API返回的数据是否成功
    if (!data || !data.success || !data.data || !data.data.videos || data.data.videos.length === 0) {
      console.error('[首页] YouTube数据获取失败: API返回的数据为空或无效', {
        hasData: !!data,
        success: data?.success,
        hasVideos: !!data?.data?.videos,
        videoCount: data?.data?.videos?.length || 0
      })
      return null
    }
    
    return data
  } catch (error: any) {
    // 记录错误日志，但不抛出异常，返回null让其他平台继续
    if (error.name === 'AbortError') {
      console.error('[首页] 获取YouTube数据超时 (10秒)')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('[首页] 无法连接到YouTube API服务器，跳过YouTube数据', { code: error.code })
    } else {
      console.error('[首页] 获取YouTube视频数据失败:', error.message || error, { error: error })
    }
    return null
  }
}

export default async function HomePage() {
  // 获取所有平台数据（使用 allSettled 确保即使某个平台失败，其他平台也能继续）
  const results = await Promise.allSettled([
    getBilibiliVideos(),
    getJianshuArticles(),
    getYouTubeVideos()
  ])
  
  // 提取成功的结果
  const bilibiliData = results[0].status === 'fulfilled' ? results[0].value : null
  const jianshuData = results[1].status === 'fulfilled' ? results[1].value : null
  const youtubeData = results[2].status === 'fulfilled' ? results[2].value : null
  
  // 记录失败的情况（但不阻止其他数据显示）
  if (results[0].status === 'rejected') {
    console.error('[首页] Promise rejected - 获取B站数据失败:', results[0].reason)
  } else if (!bilibiliData || !bilibiliData.success) {
    console.error('[首页] B站数据未成功加载', { 
      hasData: !!bilibiliData, 
      success: bilibiliData?.success,
      error: bilibiliData?.error 
    })
  }
  
  if (results[1].status === 'rejected') {
    console.error('[首页] Promise rejected - 获取简书数据失败:', results[1].reason)
  } else if (!jianshuData || !jianshuData.success) {
    console.error('[首页] 简书数据未成功加载', { 
      hasData: !!jianshuData, 
      success: jianshuData?.success,
      error: jianshuData?.error 
    })
  }
  
  if (results[2].status === 'rejected') {
    console.error('[首页] Promise rejected - 获取YouTube数据失败:', results[2].reason)
  } else if (!youtubeData || !youtubeData.success) {
    console.error('[首页] YouTube数据未成功加载', { 
      hasData: !!youtubeData, 
      success: youtubeData?.success,
      error: youtubeData?.error 
    })
  }

  // 获取每个平台的最新一条数据（不合并排序）
  const latestItems: TimelineItem[] = []

  // 获取B站最新一条视频（只返回有url的视频）
  if (!bilibiliData || !bilibiliData.success || !bilibiliData.data?.videos || bilibiliData.data.videos.length === 0) {
    console.error('[首页] B站数据不可用，跳过B站最新视频显示')
  } else if (bilibiliData?.success && bilibiliData.data?.videos && bilibiliData.data.videos.length > 0) {
    // 过滤出有 url 的视频
    const videosWithUrl = bilibiliData.data.videos.filter((video: any) => 
      video.url && video.url.trim() !== ''
    )
    
    if (videosWithUrl.length > 0) {
      const latestVideo = videosWithUrl[0] // 第一条就是最新的（API已排序）
      // 确保 published_at 存在，如果不存在则使用 published
      const publishedAt = latestVideo.published_at || latestVideo.published || null
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
        if (transformed) latestItems.push(transformed)
      }
    }
  }

  // 获取简书最新一篇文章
  if (!jianshuData || !jianshuData.success || !jianshuData.data?.articles || jianshuData.data.articles.length === 0) {
    console.error('[首页] 简书数据不可用，跳过简书最新文章显示')
  } else if (jianshuData?.success && jianshuData.data?.articles && jianshuData.data.articles.length > 0) {
    const latestArticle = jianshuData.data.articles[0] // 第一条就是最新的（API已排序）
    // 确保 published_at 存在，如果不存在则使用 published
    const publishedAt = latestArticle.published_at || latestArticle.published || null
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
      if (transformed) latestItems.push(transformed)
    }
  }

  // 获取YouTube最新一条视频
  if (!youtubeData || !youtubeData.success || !youtubeData.data?.videos || youtubeData.data.videos.length === 0) {
    console.error('[首页] YouTube数据不可用，跳过YouTube最新视频显示')
  } else if (youtubeData?.success && youtubeData.data?.videos && youtubeData.data.videos.length > 0) {
    const latestYouTubeVideo = youtubeData.data.videos[0] // 第一条就是最新的（API已排序）
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
    if (transformed) latestItems.push(transformed)
  }

  // 记录数据加载总结
  const loadedPlatforms = []
  const failedPlatforms = []
  if (bilibiliData?.success && bilibiliData.data?.videos?.length > 0) loadedPlatforms.push('B站')
  else failedPlatforms.push('B站')
  if (jianshuData?.success && jianshuData.data?.articles?.length > 0) loadedPlatforms.push('简书')
  else failedPlatforms.push('简书')
  if (youtubeData?.success && youtubeData.data?.videos?.length > 0) loadedPlatforms.push('YouTube')
  else failedPlatforms.push('YouTube')
  
  if (failedPlatforms.length > 0) {
    console.error(`[首页] 数据加载总结: 成功加载 ${loadedPlatforms.length} 个平台 (${loadedPlatforms.join(', ')})，失败 ${failedPlatforms.length} 个平台 (${failedPlatforms.join(', ')})`)
  } else {
    console.log(`[首页] 数据加载总结: 所有平台数据加载成功 (${loadedPlatforms.join(', ')})`)
  }

  // 按平台顺序排序：YouTube, Bilibili, 简书（确保显示顺序一致）
  const platformOrder = ['youtube', 'bilibili', 'jianshu']
  latestItems.sort((a, b) => {
    const indexA = platformOrder.indexOf(a.platform)
    const indexB = platformOrder.indexOf(b.platform)
    // 如果平台不在列表中，排在最后
    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  // 为了向后兼容，保留原有的变量
  const latestVideo = bilibiliData?.success && bilibiliData.data?.videos?.length > 0 
    ? bilibiliData.data.videos[0] 
    : null
  const latestArticle = jianshuData?.success && jianshuData.data?.articles?.length > 0 
    ? jianshuData.data.articles[0] 
    : null
  const latestYouTubeVideo = youtubeData?.success && youtubeData.data?.videos?.length > 0 
    ? youtubeData.data.videos[0] 
    : null
  
  const errorMessage = bilibiliData?.message || null
  const jianshuErrorMessage = jianshuData?.error || null
  const youtubeErrorMessage = youtubeData?.error || null

  return (
    <div className="min-h-screen bg-artistic-gradient-light">
      {/* 装饰元素 */}
      <div className="artistic-decoration top-20 left-10"></div>
      <div className="artistic-decoration bottom-20 right-10"></div>
      
      <Header />
      
      <main>
        {/* Latest Updates Hero Section */}
        <section className="artistic-gradient text-white py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Latest Updates Grid - 显示每个平台的最新一条内容（YouTube、Bilibili、简书） */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestItems.length > 0 ? (
                latestItems.map((item, index) => {
                  // 根据平台类型确定链接文本和图标颜色
                  const linkText = item.platform === 'jianshu' ? '阅读文章 →' : 
                                   item.platform === 'bilibili' || item.platform === 'youtube' ? '观看视频 →' : 
                                   '查看详情 →'
                  
                  const iconBgColor = item.platform === 'youtube' ? 'bg-red-100/20' :
                                     item.platform === 'bilibili' ? 'bg-pink-100/20' :
                                     item.platform === 'jianshu' ? 'bg-green-100/20' :
                                     'bg-yellow-100/20'
                  
                  return (
                    <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 ${iconBgColor} rounded-xl flex items-center justify-center text-2xl mr-4`}>
                          {item.platformIcon}
                        </div>
                        <div>
                          <h3 className="font-display font-semibold text-white text-lg">{item.platformName}</h3>
                          <p className="text-sm text-white/80">最新内容</p>
                        </div>
                      </div>
                      
                      {/* 缩略图 */}
                      <ThumbnailImage 
                        src={item.thumbnail || ''} 
                        alt={item.title}
                      />
                      
                      <p className="text-white/90 mb-4 leading-relaxed line-clamp-2">
                        {item.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-sm">{item.formattedDate}</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                        >
                          {linkText}
                        </a>
                      </div>
                    </div>
                  )
                })
              ) : (
                // 如果没有数据，显示占位符
                <>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-white/90 mb-4 leading-relaxed">暂无数据</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-white/90 mb-4 leading-relaxed">暂无数据</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-white/90 mb-4 leading-relaxed">暂无数据</p>
                  </div>
                </>
              )}
            </div>

            {/* View All Updates Button */}
            <div className="text-center mt-12">
              <a
                href="/timeline"
                className="inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-full font-medium hover:bg-white/30 transition-all duration-300"
              >
                查看时间流
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Platform Navigation */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold text-neutral-800 mb-4">
                我的平台主页
              </h2>
              <p className="text-lg text-neutral-600">
                点击下方图标直接跳转到我在各平台的个人主页
              </p>
            </div>

            {/* Platform Grid - 3 columns layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {platforms.map((platform, index) => (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="artistic-card p-8 text-center hover:scale-105 transition-all duration-300 h-full">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl text-3xl mb-6 ${platform.color} transition-all duration-300 group-hover:scale-110`}>
                      {platform.icon}
                    </div>
                    <h3 className="text-xl font-display font-semibold text-neutral-800 mb-3 group-hover:text-primary-500 transition-colors">
                      {platform.name}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-4">
                      {platform.description}
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="text-primary-500 text-sm font-medium">
                        点击访问 →
                      </span>
                    </div>
                  </div>
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