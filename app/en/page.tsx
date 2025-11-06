import Header from '@/components/Header'
import Footer from '@/components/Footer'

// B站视频数据类型
interface BilibiliVideo {
  bvid: string
  title: string
  description: string
  pic: string
  duration: string
  view: number
  like: number
  formattedDate: string
  url: string
}

interface BilibiliData {
  userInfo: {
    name: string
    uid: string
  }
  videos: BilibiliVideo[]
}

// 豆瓣RSS数据类型
interface DoubanItem {
  title: string
  link: string
  pubDate: string
  content: string
  contentSnippet: string
  rating: string | null
  recommendation: string | null
  type: string
  formattedDate: string
}

interface DoubanData {
  title: string
  description: string
  items: DoubanItem[]
}

// 简书文章数据类型
interface JianshuArticle {
  id: string
  title: string
  description: string
  thumbnail: string
  readTime: string
  publishTime: string
  externalUrl: string
  platform: string
  platformIcon: string
  category: string
  date: string
  tags: string[]
  excerpt: string
  stats: {
    likes: number
    comments: number
    views: number
    rewards: number
  }
}

interface JianshuData {
  userInfo: {
    uid: string
    name: string
    avatar: string
    description: string
    followers: number
    following: number
    articles: number
    words: number
  }
  articles: JianshuArticle[]
}

// Platform configuration
const platforms = [
  {
    name: 'YouTube',
    icon: '📺',
    color: 'bg-red-50 text-red-700 hover:bg-red-100',
    url: 'https://www.youtube.com/@saai-saai',
    description: 'Video Creation Platform'
  },
  {
    name: 'Bilibili',
    icon: '📱',
    color: 'bg-pink-50 text-pink-700 hover:bg-pink-100',
    url: 'https://space.bilibili.com/472773672',
    description: 'Video Sharing Platform'
  },
  {
    name: 'Jianshu',
    icon: '📝',
    color: 'bg-green-50 text-green-700 hover:bg-green-100',
    url: 'https://www.jianshu.com/u/763ffbb1b873',
    description: 'Writing Platform'
  },
  {
    name: 'GitHub',
    icon: '💻',
    color: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
    url: 'https://github.com/saai',
    description: 'Code Repository'
  },
  {
    name: 'Douban',
    icon: '📚',
    color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    url: 'https://www.douban.com/people/284853052',
    description: 'Book & Movie Platform'
  },
  {
    name: 'Xiaohongshu',
    icon: '📖',
    color: 'bg-red-50 text-red-700 hover:bg-red-100',
    url: 'https://www.xiaohongshu.com/user/profile/58ad507c6a6a69601edcc3d0',
    description: 'Lifestyle Platform'
  }
]

export default async function HomePage() {
  // 获取B站最新视频
  let bilibiliData: BilibiliData | null = null
  try {
    const bilibiliRes = await fetch('http://localhost:3000/api/bilibili-videos', { cache: 'no-store' })
    const bilibiliResult = await bilibiliRes.json()
    if (bilibiliResult.success && bilibiliResult.data) {
      bilibiliData = bilibiliResult.data
    }
  } catch (error) {
    console.error('获取B站数据失败:', error)
  }

  return (
    <div className="min-h-screen bg-artistic-gradient-light">
      {/* Decorative elements */}
      <div className="artistic-decoration top-20 left-10"></div>
      <div className="artistic-decoration bottom-20 right-10"></div>
      
      <Header />
      
      <main>
        {/* Latest Updates Hero Section */}
        <section className="artistic-gradient text-white py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Latest Updates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* YouTube Update */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100/20 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📺
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg">YouTube</h3>
                    <p className="text-sm text-white/80">Latest Video Release</p>
                  </div>
                </div>
                <p className="text-white/90 mb-4 leading-relaxed">
                  New tech sharing video is live! Featuring React 18 new features and practical project demos!
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">2 hours ago</span>
                  <a
                    href="https://www.youtube.com/@saai-saai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                  >
                    Watch Video →
                  </a>
                </div>
              </div>

              {/* Bilibili Update - 真实数据 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-pink-100/20 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📱
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg">Bilibili</h3>
                    <p className="text-sm text-white/80">
                      {bilibiliData?.videos?.length ? '最新视频' : '暂无视频'}
                    </p>
                  </div>
                </div>
                {bilibiliData?.videos?.length ? (
                  <>
                    <p className="text-white/90 mb-4 leading-relaxed line-clamp-2">
                      {bilibiliData.videos[0].title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">{bilibiliData.videos[0].formattedDate}</span>
                      <a
                        href={bilibiliData.videos[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                      >
                        Watch Video →
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-white/90 mb-4 leading-relaxed">
                      暂无B站视频数据
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-sm">-</span>
                      <a
                        href="https://space.bilibili.com/472773672"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                      >
                        Visit Channel →
                      </a>
                    </div>
                  </>
                )}
              </div>

              {/* Jianshu Update */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100/20 rounded-xl flex items-center justify-center text-2xl mr-4">
                    📝
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg">Jianshu</h3>
                    <p className="text-sm text-white/80">Tech Article Share</p>
                  </div>
                </div>
                <p className="text-white/90 mb-4 leading-relaxed">
                  Sharing latest tech insights: How to build high-performance frontend application architecture!
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">3 days ago</span>
                  <a
                    href="https://www.jianshu.com/u/763ffbb1b873"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-primary-200 text-sm font-medium transition-colors flex items-center"
                  >
                    Read Article →
                  </a>
                </div>
              </div>
            </div>

            {/* View All Updates Button */}
            <div className="text-center mt-12">
              <a
                href="/timeline"
                className="inline-flex items-center bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-3 rounded-full font-medium hover:bg-white/30 transition-all duration-300"
              >
                View All Updates
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
                My Platform Pages
              </h2>
              <p className="text-lg text-neutral-600">
                Click the icons below to visit my personal pages on various platforms
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
                        Visit →
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