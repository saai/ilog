'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

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

interface JianshuUser {
  uid: string
  name: string
  avatar: string
  description: string
  followers: number
  following: number
  articles: number
  words: number
}

interface JianshuData {
  user: JianshuUser
  articles: JianshuArticle[]
  total: number
  page: number
  pageSize: number
}

// 平台颜色映射
const platformColors = {
  '简书': 'bg-green-100 text-green-800'
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}

export default function JianshuScraperContent() {
  const [data, setData] = useState<JianshuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uid, setUid] = useState('763ffbb1b873') // 默认简书用户ID

  const fetchJianshuData = async (userUid: string) => {
    try {
      setLoading(true)
      setError('')
      
      console.log(`开始获取简书UID: ${userUid} 的数据`)
      const response = await fetch(`/api/jianshu-scraper?uid=${userUid}&maxArticles=6`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || '获取简书数据失败')
      }

      setData(result.data)
      console.log(`成功获取到 ${result.data.articles.length} 篇文章`)
    } catch (error) {
      console.error('获取简书数据失败:', error)
      setError(error instanceof Error ? error.message : '获取简书数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJianshuData(uid)
  }, [uid])

  const handleUidChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newUid = formData.get('uid') as string
    if (newUid.trim()) {
      setUid(newUid.trim())
    }
  }

  if (loading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">简书内容（爬虫版）</h2>
            <p className="text-lg text-gray-600">正在爬取作者最新文章，请稍候...</p>
          </div>
          
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500">爬虫需要一些时间来加载页面和提取数据</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchJianshuData(uid)}
              className="btn-primary"
            >
              重试
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (!data) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600">暂无数据</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">简书内容（爬虫版）</h2>
          <p className="text-lg text-gray-600">实时爬取作者最新文章</p>
        </div>

        {/* 作者信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <img
              src={data.user.avatar}
              alt={data.user.name}
              className="w-16 h-16 rounded-full"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{data.user.name}</h3>
              <p className="text-gray-600 text-sm">UID: {data.user.uid}</p>
              {data.user.description && (
                <p className="text-gray-500 text-sm mt-1">{data.user.description}</p>
              )}
              <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                <span>关注者: {formatNumber(data.user.followers)}</span>
                <span>关注: {formatNumber(data.user.following)}</span>
                <span>文章: {formatNumber(data.user.articles)}</span>
                <span>字数: {formatNumber(data.user.words)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* UID输入表单 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">切换作者</h3>
          <form onSubmit={handleUidChange} className="flex gap-4">
            <input
              type="text"
              name="uid"
              placeholder="输入简书作者的UID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              defaultValue={uid}
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              爬取数据
            </button>
          </form>
          <p className="text-sm text-gray-500 mt-2">
            提示：可以在简书用户主页的URL中找到UID，例如 https://www.jianshu.com/u/1b4c832f2a7d 中的 1b4c832f2a7d
          </p>
          <p className="text-sm text-orange-600 mt-1">
            注意：爬虫需要一些时间来加载页面，请耐心等待
          </p>
        </div>

        {/* 文章列表 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.articles.map((article) => (
            <article key={article.id} className="card group">
              {/* 缩略图 */}
              <div className="mb-4 relative">
                <img
                  src={article.thumbnail}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${platformColors[article.platform as keyof typeof platformColors]}`}>
                    {article.platformIcon} {article.platform}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {article.readTime}
                </div>
              </div>
              
              {/* 分类标签 */}
              <div className="mb-4">
                <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {article.category}
                </span>
              </div>
              
              {/* 标题 */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                <a href={article.externalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {article.title}
                </a>
              </h3>
              
              {/* 摘要 */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.excerpt}
              </p>
              
              {/* 统计数据 */}
              <div className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500">
                <span>❤️ {formatNumber(article.stats.likes)}</span>
                <span>💬 {formatNumber(article.stats.comments)}</span>
                <span>👁️ {formatNumber(article.stats.views)}</span>
                <span>💰 {formatNumber(article.stats.rewards)}</span>
                <span>⏱️ {article.readTime}</span>
                <span>📅 {article.publishTime}</span>
              </div>
              
              {/* 标签 */}
              {article.tags && article.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 底部信息 */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <time dateTime={article.date}>
                  {format(new Date(article.date), 'yyyy年MM月dd日', { locale: zhCN })}
                </time>
                <span>作者: {data.user.name}</span>
              </div>
              
              {/* 外部链接按钮 */}
              <div className="mt-4">
                <a
                  href={article.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                >
                  阅读文章
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600">
            共爬取到 {data.total} 篇文章，当前显示第 {data.page} 页，每页 {data.pageSize} 篇
          </p>
          <p className="text-sm text-orange-600 mt-2">
            数据通过网页爬虫实时获取，可能需要几秒钟加载时间
          </p>
        </div>
      </div>
    </section>
  )
} 