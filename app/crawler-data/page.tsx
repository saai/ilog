import Header from '@/components/Header'
import Footer from '@/components/Footer'
import fs from 'fs'
import path from 'path'

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

interface DoubanData {
  collections: DoubanItem[]
  total: number
  user: {
    id: string
    nickname: string
  }
  fetched_at: string
}

// 数据获取结果的类型定义
type DataResult<T> = 
  | { success: true; data: T }
  | { success: false; error: string }

// B站视频项的类型定义
interface BilibiliVideo {
  title: string
  url: string
  publish_time: string
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

// 服务器端数据获取函数
async function getDoubanRSSData(): Promise<DataResult<DoubanRSSData>> {
  try {
    const possiblePaths = [
      path.join(process.cwd(), 'douban_rss_data.json'),
      path.join(process.cwd(), 'douban-rss-fetcher', 'douban_rss_data.json'),
      path.join(process.cwd(), 'douban-rss.json')
    ]
    
    for (const jsonPath of possiblePaths) {
      if (fs.existsSync(jsonPath)) {
        const jsonData = fs.readFileSync(jsonPath, 'utf-8')
        const data = JSON.parse(jsonData)
        return { success: true, data: data as DoubanRSSData }
      }
    }
    return { success: false, error: '豆瓣RSS数据文件不存在' }
  } catch (error) {
    return { success: false, error: '读取豆瓣RSS数据失败' }
  }
}

async function getDoubanData(): Promise<DataResult<DoubanData>> {
  // 豆瓣Spider已改为Subject详细信息获取工具，不再用于自动抓取收藏数据
  // 收藏数据现在通过豆瓣RSS获取（见 getDoubanRSSData）
  return { success: false, error: '豆瓣收藏数据已不再通过Spider抓取，请使用RSS数据' }
}

async function getBilibiliData(): Promise<DataResult<BilibiliData>> {
  try {
    const jsonPath = path.join(process.cwd(), 'bilibili-spider', 'bilibili_videos.json')
    if (!fs.existsSync(jsonPath)) {
      return { success: false, error: 'B站数据文件不存在' }
    }
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(jsonData)
    return { success: true, data: data as BilibiliData }
  } catch (error) {
    return { success: false, error: '读取B站数据失败' }
  }
}

async function getJianshuData(): Promise<DataResult<JianshuData>> {
  try {
    const jsonPath = path.join(process.cwd(), 'jianshu-spider', 'jianshu_articles.json')
    if (!fs.existsSync(jsonPath)) {
      return { success: false, error: '简书数据文件不存在' }
    }
    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(jsonData)
    return { success: true, data: data as JianshuData }
  } catch (error) {
    return { success: false, error: '读取简书数据失败' }
  }
}

export default async function CrawlerDataPage() {
  // 服务器端获取所有数据
  const [doubanRSSResult, doubanResult, bilibiliResult, jianshuResult] = await Promise.all([
    getDoubanRSSData(),
    getDoubanData(),
    getBilibiliData(),
    getJianshuData()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              🕷️ 爬虫数据展示
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              来自多个平台的最新内容聚合，实时更新
            </p>
            <div className="flex justify-center space-x-4 flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                <span className="text-sm">📚 豆瓣收藏</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                <span className="text-sm">📝 简书文章</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
                <span className="text-sm">📱 B站视频</span>
              </div>
            </div>
          </div>
        </section>

        {/* 豆瓣RSS收藏 Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center text-3xl mr-4">
                  📚
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">豆瓣RSS收藏</h2>
                  <p className="text-gray-600">通过RSS订阅获取的最新收藏</p>
                </div>
              </div>
              {doubanRSSResult.success && doubanRSSResult.data && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">共 {doubanRSSResult.data.total} 条</div>
                  <div className="text-xs text-gray-400">
                    {new Date(doubanRSSResult.data.fetched_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              )}
            </div>

            {!doubanRSSResult.success ? (
              <div className="text-center py-12">
                <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">豆瓣RSS数据获取失败</h3>
                <p className="text-gray-600">{doubanRSSResult.error}</p>
              </div>
            ) : doubanRSSResult.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doubanRSSResult.data.collections.slice(0, 9).map((item: DoubanRSSItem, index: number) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-primary-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                          {item.type === 'interest' ? '收藏' : item.type}
                        </span>
                        <span className="text-xs text-gray-500">{item.formattedDate}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {item.title}
                      </h4>
                      {item.author && (
                        <p className="text-sm text-gray-600 mb-3">作者: {item.author}</p>
                      )}
                      <div className="flex items-center text-xs text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        查看详情 →
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}

            {doubanRSSResult.success && doubanRSSResult.data && doubanRSSResult.data.collections.length > 9 && (
              <div className="mt-6 text-center">
                <button className="text-primary-600 hover:text-primary-700 font-medium">
                  查看更多 ({doubanRSSResult.data.collections.length - 9} 条)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 简书文章 Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-3xl mr-4">
                  📝
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">简书文章</h2>
                  <p className="text-gray-600">最新发布的文章内容</p>
                </div>
              </div>
              {jianshuResult.success && jianshuResult.data && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">共 {jianshuResult.data.total_articles} 篇</div>
                  <div className="text-xs text-gray-400">
                    {new Date(jianshuResult.data.fetched_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              )}
            </div>

            {!jianshuResult.success ? (
              <div className="text-center py-12">
                <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">简书数据获取失败</h3>
                <p className="text-gray-600">{jianshuResult.error}</p>
              </div>
            ) : jianshuResult.data ? (
              <div className="space-y-4">
                {jianshuResult.data.articles
                  .filter((article: JianshuArticle) => article.title !== "0" && !article.link.includes("#comments"))
                  .slice(0, 10)
                  .map((article: JianshuArticle, idx: number) => (
                  <a
                    key={idx}
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>{new Date(article.fetched_at).toLocaleDateString('zh-CN')}</span>
                            <span className="mx-2">•</span>
                            <span>Saai</span>
                          </div>
                        </div>
                        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* B站视频 Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center text-3xl mr-4">
                  📱
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">B站视频</h2>
                  <p className="text-gray-600">最新发布的视频内容</p>
                </div>
              </div>
              {bilibiliResult.success && bilibiliResult.data && (
                <div className="text-right">
                  <div className="text-sm text-gray-500">共 {bilibiliResult.data.total_videos} 个</div>
                  <div className="text-xs text-gray-400">
                    {new Date(bilibiliResult.data.fetched_at).toLocaleString('zh-CN')}
                  </div>
                </div>
              )}
            </div>

            {!bilibiliResult.success ? (
              <div className="text-center py-12">
                <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">B站数据获取失败</h3>
                <p className="text-gray-600">{bilibiliResult.error}</p>
              </div>
            ) : bilibiliResult.data && bilibiliResult.data.videos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">暂无B站视频</h3>
                <p className="text-gray-600">暂时没有找到最新的视频内容</p>
              </div>
            ) : bilibiliResult.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bilibiliResult.data.videos.map((video: BilibiliVideo, index: number) => (
                  <a
                    key={index}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-pink-300">
                      {video.cover_url && (
                        <div className="aspect-video bg-gray-200 overflow-hidden">
                          <img 
                            src={video.cover_url} 
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <h4 className="font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span className="flex items-center">
                            <span className="mr-1">👁️</span>
                            {video.play_count}
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">📅</span>
                            {video.publish_time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {new Date(video.fetched_at).toLocaleDateString('zh-CN')}
                          </span>
                          <span className="text-xs text-pink-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            观看视频 →
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* 豆瓣收藏 Section (Selenium爬虫) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-3xl mr-4">
                  🎬
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">豆瓣收藏 (Selenium)</h2>
                  <p className="text-gray-600">通过Selenium爬虫获取的收藏数据</p>
                </div>
              </div>
            </div>

            {!doubanResult.success ? (
              <div className="text-center py-12">
                <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">豆瓣数据获取失败</h3>
                <p className="text-gray-600">{doubanResult.error}</p>
              </div>
            ) : doubanResult.success && doubanResult.data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doubanResult.data.collections?.map((item: DoubanItem, index: number) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <div className="border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-orange-300 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                          {item.type}
                        </span>
                        {item.rating && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            ⭐ {item.rating}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {item.title}
                      </h4>
                      {item.author && (
                        <p className="text-sm text-gray-600 mb-3">作者: {item.author}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(item.fetched_at).toLocaleDateString('zh-CN')}
                        </span>
                        <span className="text-xs text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          查看详情 →
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* 数据统计 Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">数据统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {doubanRSSResult.success && doubanRSSResult.data ? doubanRSSResult.data.total : 0}
                </div>
                <div className="text-sm opacity-90">豆瓣RSS收藏</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {jianshuResult.success && jianshuResult.data ? jianshuResult.data.total_articles : 0}
                </div>
                <div className="text-sm opacity-90">简书文章</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {bilibiliResult.success && bilibiliResult.data ? bilibiliResult.data.total_videos : 0}
                </div>
                <div className="text-sm opacity-90">B站视频</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {doubanResult.success && doubanResult.data ? (doubanResult.data.collections?.length || 0) : 0}
                </div>
                <div className="text-sm opacity-90">豆瓣收藏</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

