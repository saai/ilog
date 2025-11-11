import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  const userId = '763ffbb1b873' // 您的简书用户ID
  
  // 首先尝试读取本地Python脚本生成的JSON文件
  try {
    const jsonPath = path.join(process.cwd(), 'jianshu-spider', 'jianshu_articles.json')
    const fileContent = await fs.readFile(jsonPath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    console.log('成功读取本地简书文章数据')
    
    // 转换数据格式以匹配现有接口
    const articles = data.articles
      .map((article: any) => ({
        title: article.title,
        link: article.link,
        slug: article.slug,
        published_at: article.published_at || article.fetched_at,
        content: '',
        contentSnippet: '',
        published: article.published_at || article.fetched_at,
        formattedDate: formatDate(article.published_at || article.fetched_at),
        author: 'Saai',
        views: 0,
        likes: 0,
        comments: 0
      }))
      // 按发布时间倒序排序（最新的在前）
      .sort((a: any, b: any) => {
        const dateA = new Date(a.published_at || a.published).getTime()
        const dateB = new Date(b.published_at || b.published).getTime()
        return dateB - dateA
      })
    
    return NextResponse.json({
      success: true,
      data: {
        articles,
        total: articles.length,
        user: {
          id: userId,
          nickname: 'Saai'
        }
      }
    })
  } catch (error) {
    console.log('本地JSON文件不存在或读取失败，尝试在线API')
  }
  
  // 如果本地文件不存在，尝试在线API作为备用方案
  const apiUrls = [
    `https://www.jianshu.com/asimov/users/${userId}/public_notes?page=1`,
    `https://www.jianshu.com/api/users/${userId}/public_notes?page=1`,
    `https://www.jianshu.com/api/users/${userId}/notes?page=1`,
    `https://www.jianshu.com/api/users/${userId}/articles?page=1`
  ]
  
  for (let i = 0; i < apiUrls.length; i++) {
    const apiUrl = apiUrls[i]
    console.log(`尝试简书API端点 ${i + 1}:`, apiUrl)
    
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'https://www.jianshu.com/',
          'Origin': 'https://www.jianshu.com',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        next: { revalidate: 1800 } // 缓存30分钟
      })

      console.log(`API端点 ${i + 1} 响应状态:`, response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('简书API响应:', data)

        if (data.entries && Array.isArray(data.entries)) {
          // 处理文章数据
          const articles = data.entries
            .map((article: any) => {
              const publishedAt = article.published_at || article.created_at || new Date().toISOString()
              return {
                title: article.title || '无标题',
                slug: article.slug || '',
                link: `https://www.jianshu.com/p/${article.slug}`,
                published_at: publishedAt,
                content: article.content || '',
                contentSnippet: article.content ? article.content.substring(0, 200) + '...' : '',
                published: publishedAt,
                formattedDate: formatDate(publishedAt),
                author: article.user?.nickname || '未知作者',
                views: article.views_count || 0,
                likes: article.likes_count || 0,
                comments: article.comments_count || 0
              }
            })
            // 按发布时间倒序排序（最新的在前）
            .sort((a: any, b: any) => {
              const dateA = new Date(a.published_at || a.published).getTime()
              const dateB = new Date(b.published_at || b.published).getTime()
              return dateB - dateA
            })

          return NextResponse.json({
            success: true,
            data: {
              articles,
              total: articles.length,
              user: {
                id: userId,
                nickname: data.entries[0]?.user?.nickname || '未知用户'
              }
            }
          })
        } else if (data.notes && Array.isArray(data.notes)) {
          // 处理不同的数据格式
          const articles = data.notes
            .map((article: any) => {
              const publishedAt = article.published_at || article.created_at || new Date().toISOString()
              return {
                title: article.title || '无标题',
                slug: article.slug || '',
                link: `https://www.jianshu.com/p/${article.slug}`,
                published_at: publishedAt,
                content: article.content || '',
                contentSnippet: article.content ? article.content.substring(0, 200) + '...' : '',
                published: publishedAt,
                formattedDate: formatDate(publishedAt),
                author: article.user?.nickname || '未知作者',
                views: article.views_count || 0,
                likes: article.likes_count || 0,
                comments: article.comments_count || 0
              }
            })
            // 按发布时间倒序排序（最新的在前）
            .sort((a: any, b: any) => {
              const dateA = new Date(a.published_at || a.published).getTime()
              const dateB = new Date(b.published_at || b.published).getTime()
              return dateB - dateA
            })

          return NextResponse.json({
            success: true,
            data: {
              articles,
              total: articles.length,
              user: {
                id: userId,
                nickname: data.notes[0]?.user?.nickname || '未知用户'
              }
            }
          })
        } else if (data.articles && Array.isArray(data.articles)) {
          // 处理articles格式
          const articles = data.articles
            .map((article: any) => {
              const publishedAt = article.published_at || article.created_at || new Date().toISOString()
              return {
                title: article.title || '无标题',
                slug: article.slug || '',
                link: `https://www.jianshu.com/p/${article.slug}`,
                published_at: publishedAt,
                content: article.content || '',
                contentSnippet: article.content ? article.content.substring(0, 200) + '...' : '',
                published: publishedAt,
                formattedDate: formatDate(publishedAt),
                author: article.user?.nickname || '未知作者',
                views: article.views_count || 0,
                likes: article.likes_count || 0,
                comments: article.comments_count || 0
              }
            })
            // 按发布时间倒序排序（最新的在前）
            .sort((a: any, b: any) => {
              const dateA = new Date(a.published_at || a.published).getTime()
              const dateB = new Date(b.published_at || b.published).getTime()
              return dateB - dateA
            })

          return NextResponse.json({
            success: true,
            data: {
              articles,
              total: articles.length,
              user: {
                id: userId,
                nickname: data.articles[0]?.user?.nickname || '未知用户'
              }
            }
          })
        }
      }
    } catch (error) {
      console.error(`API端点 ${i + 1} 请求失败:`, error)
    }
  }

  // 如果所有API端点都失败，返回模拟数据作为备用方案
  console.log('所有API端点都失败，返回备用数据')
  return NextResponse.json({
    success: true,
    data: {
      articles: [
        {
          title: '前端开发最佳实践总结',
          slug: 'example-article',
          link: 'https://www.jianshu.com/p/example-article',
          content: '这是一篇关于前端开发最佳实践的文章，包含了React、Vue、TypeScript等技术的使用技巧和注意事项。',
          contentSnippet: '这是一篇关于前端开发最佳实践的文章，包含了React、Vue、TypeScript等技术的使用技巧和注意事项...',
          published: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3天前
          formattedDate: '3天前',
          author: 'Saai',
          views: 1200,
          likes: 45,
          comments: 12
        }
      ],
      total: 1,
      user: {
        id: userId,
        nickname: 'Saai'
      }
    }
  })
}

// 格式化日期
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return '今天'
    } else if (diffInDays === 1) {
      return '昨天'
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks}周前`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months}个月前`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `${years}年前`
    }
  } catch {
    return '未知时间'
  }
} 