import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThumbnailImage from '@/components/ThumbnailImage'
import { transformBilibili, transformJianshu, transformYouTube, mergeAndSortTimelineItems } from './timeline/transformers'
import { TimelineItem } from './timeline/types'

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
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bilibili-videos`, {
      cache: 'no-store' // 不缓存，始终获取最新数据
    })
    
    if (!response.ok) {
      console.error('B站API请求失败:', response.status)
      return null
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取B站视频数据失败:', error)
    return null
  }
}

// 获取简书最新文章数据
async function getJianshuArticles() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/jianshu-articles`, {
      cache: 'no-store' // 不缓存，始终获取最新数据
    })
    
    if (!response.ok) {
      console.error('简书API请求失败:', response.status)
      return null
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取简书文章数据失败:', error)
    return null
  }
}

// 获取YouTube最新视频数据
async function getYouTubeVideos() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/youtube-videos`, {
      cache: 'no-store' // 不缓存，始终获取最新数据
    })
    
    if (!response.ok) {
      console.error('YouTube API请求失败:', response.status)
      return null
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取YouTube视频数据失败:', error)
    return null
  }
}

export default async function HomePage() {
  // 获取所有平台数据
  const [bilibiliData, jianshuData, youtubeData] = await Promise.all([
    getBilibiliVideos(),
    getJianshuArticles(),
    getYouTubeVideos()
  ])

  // 转换为统一的时间流格式并合并排序
  const timelineItems: TimelineItem[] = []

  // 转换B站视频数据
  if (bilibiliData?.success && bilibiliData.data?.videos) {
    bilibiliData.data.videos.forEach((video: any, index: number) => {
      const transformed = transformBilibili({
        title: video.title,
        url: video.url,
        publish_time: video.publish_time || '',
        published_at: video.published_at || null,
        play_count: video.play_count || '0',
        cover_url: video.cover_url || '',
        formattedDate: video.formattedDate,
        fetched_at: video.fetched_at || new Date().toISOString()
      }, index)
      if (transformed) timelineItems.push(transformed)
    })
  }

  // 转换简书文章数据
  if (jianshuData?.success && jianshuData.data?.articles) {
    jianshuData.data.articles.forEach((article: any, index: number) => {
      const transformed = transformJianshu({
        title: article.title,
        link: article.link,
        slug: article.slug || '',
        published_at: article.published_at || null,
        fetched_at: article.fetched_at || new Date().toISOString(),
        formattedDate: article.formattedDate,
        user_id: article.user_id || ''
      }, index)
      if (transformed) timelineItems.push(transformed)
    })
  }

  // 转换YouTube视频数据
  if (youtubeData?.success && youtubeData.data?.videos) {
    youtubeData.data.videos.forEach((video: any, index: number) => {
      const transformed = transformYouTube({
        video_id: video.video_id || '',
        title: video.title,
        url: video.url,
        published_at: video.published_at || '',
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        channel_name: video.channel_name,
        formattedDate: video.formattedDate,
        fetched_at: video.fetched_at || new Date().toISOString()
      }, index)
      if (transformed) timelineItems.push(transformed)
    })
  }

  // 按发布时间排序（最新的在前）
  const sortedItems = mergeAndSortTimelineItems(timelineItems)
  
  // 获取最新的三个（按时间顺序）
  const latestItems = sortedItems.slice(0, 3)

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
            {/* Latest Updates Grid - 按时间顺序显示最新内容 */}
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