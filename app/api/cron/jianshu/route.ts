import { NextResponse } from 'next/server'

// 强制动态生成
export const dynamic = 'force-dynamic'

/**
 * 简书数据抓取 API
 * 可以直接调用或通过 Vercel Cron Jobs 定期运行
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // 验证请求（如果是通过 Cron Jobs 调用）
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = '763ffbb1b873' // 简书用户ID
  
  try {
    // 尝试多个简书 API 端点
    const apiUrls = [
      `https://www.jianshu.com/asimov/users/${userId}/public_notes?page=1&count=20`,
      `https://www.jianshu.com/api/users/${userId}/public_notes?page=1&count=20`
    ]
    
    for (const apiUrl of apiUrls) {
      try {
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.jianshu.com/',
            'Origin': 'https://www.jianshu.com'
          },
          next: { revalidate: 0 } // 不缓存
        })

        if (response.ok) {
          const data = await response.json()
          
          let articles: any[] = []
          
          if (data.entries && Array.isArray(data.entries)) {
            articles = data.entries
          } else if (data.notes && Array.isArray(data.notes)) {
            articles = data.notes
          } else if (data.articles && Array.isArray(data.articles)) {
            articles = data.articles
          }

          if (articles.length > 0) {
            const formattedArticles = articles.map((article: any) => ({
              title: article.title || '无标题',
              slug: article.slug || '',
              link: `https://www.jianshu.com/p/${article.slug}`,
              content: article.content || '',
              contentSnippet: article.content ? article.content.substring(0, 200) + '...' : '',
              published_at: article.published_at || article.created_at || new Date().toISOString(),
              author: article.user?.nickname || '未知作者',
              views_count: article.views_count || 0,
              likes_count: article.likes_count || 0,
              comments_count: article.comments_count || 0
            }))

            return NextResponse.json({
              success: true,
              data: {
                articles: formattedArticles,
                total: formattedArticles.length,
                user: {
                  id: userId,
                  nickname: articles[0]?.user?.nickname || 'Saai'
                },
                fetched_at: new Date().toISOString()
              }
            })
          }
        }
      } catch (error) {
        console.error(`简书API端点失败 ${apiUrl}:`, error)
        continue
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch 简书 data' 
    }, { status: 500 })
  } catch (error: any) {
    console.error('简书数据抓取失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

