import Header from '@/components/Header'
import Footer from '@/components/Footer'

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
    name: '小红书',
    icon: '📖',
    color: 'bg-red-50 text-red-700 hover:bg-red-100',
    url: 'https://www.xiaohongshu.com/user/profile/495845372',
    description: '生活方式分享平台'
  }
]

// 获取B站最新视频数据
async function getBilibiliVideos() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bilibili-videos`, {
      next: { revalidate: 1800 } // 缓存30分钟
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
      next: { revalidate: 1800 } // 缓存30分钟
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
      next: { revalidate: 1800 } // 缓存30分钟
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
  // 获取B站最新视频数据
  const bilibiliData = await getBilibiliVideos()
  const latestVideo = bilibiliData?.success && bilibiliData.data?.videos?.length > 0 
    ? bilibiliData.data.videos[0] 
    : null
  
  // 获取错误信息
  const errorMessage = bilibiliData?.message || null

  // 获取简书最新文章数据
  const jianshuData = await getJianshuArticles()
  const latestArticle = jianshuData?.success && jianshuData.data?.articles?.length > 0 
    ? jianshuData.data.articles[0] 
    : null
  
  // 获取简书错误信息
  const jianshuErrorMessage = jianshuData?.error || null

  // 获取YouTube最新视频数据
  const youtubeData = await getYouTubeVideos()
  const latestYouTubeVideo = youtubeData?.success && youtubeData.data?.videos?.length > 0 
    ? youtubeData.data.videos[0] 
    : null
  
  // 获取YouTube错误信息
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
            {/* Latest Updates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* YouTube Update - 动态数据 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100/20 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📺
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg">YouTube</h3>
                    <p className="text-sm text-white/80">最新视频发布</p>
                  </div>
                </div>
                {latestYouTubeVideo ? (
                  <>
                    <p className="text-white/90 mb-4 leading-relaxed line-clamp-2">
                      {latestYouTubeVideo.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{latestYouTubeVideo.formattedDate}</span>
                      <a
                        href={latestYouTubeVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                      >
                        观看视频 →
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-white/90 mb-4 leading-relaxed">
                      {youtubeErrorMessage || '暂无YouTube视频数据'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">--</span>
                      <a
                        href="https://www.youtube.com/@saai-saai"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                      >
                        访问主页 →
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* Bilibili Update - 动态数据 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pink-100/20 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📱
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg">哔哩哔哩</h3>
                    <p className="text-sm text-white/80">最新视频更新</p>
                  </div>
                </div>
                {latestVideo ? (
                  <>
                    <p className="text-white/90 mb-4 leading-relaxed line-clamp-2">
                      {latestVideo.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{latestVideo.formattedDate}</span>
                      <a
                        href={latestVideo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                      >
                        观看视频 →
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-white/90 mb-4 leading-relaxed">
                      {errorMessage || '暂无B站视频数据'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">--</span>
                      <a
                        href="https://space.bilibili.com/472773672"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                      >
                        访问主页 →
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* Jianshu Update - 动态数据 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100/20 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📝
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg">简书</h3>
                    <p className="text-sm text-white/80">最新文章分享</p>
                  </div>
                </div>
                {latestArticle ? (
                  <>
                    <p className="text-white/90 mb-4 leading-relaxed line-clamp-2">
                      {latestArticle.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{latestArticle.formattedDate}</span>
                      <a
                        href={latestArticle.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                      >
                        阅读文章 →
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-white/90 mb-4 leading-relaxed">
                      {jianshuErrorMessage || '暂无简书文章数据'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">--</span>
                      <a
                        href="https://www.jianshu.com/u/763ffbb1b873"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                      >
                        访问主页 →
                      </a>
                    </div>
                  </>
                )}
              </div>
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