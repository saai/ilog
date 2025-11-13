import { NextResponse } from 'next/server'
import { saveJianshuArticlesToDB } from '@/lib/db-operations'
import { initTables } from '@/lib/init-tables'

// 强制动态生成
export const dynamic = 'force-dynamic'

/**
 * 简书数据抓取 API - 定时任务版本
 * 抓取数据并保存到数据库
 * 可以通过 Vercel Cron Jobs 定期运行
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  // 支持 CRON_SECRET 或 INIT_SECRET
  const cronSecret = process.env.CRON_SECRET || process.env.INIT_SECRET
  
  // 验证请求（如果设置了密钥）
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = '763ffbb1b873' // 简书用户ID
  
  try {
    // 确保表已初始化
    await initTables()
    
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
            const formattedArticles = articles
              .map((article: any) => {
                const publishedAt = article.published_at || article.created_at || new Date().toISOString()
                return {
                  title: article.title || '无标题',
                  slug: article.slug || '',
                  link: `https://www.jianshu.com/p/${article.slug}`,
                  published_at: publishedAt,
                  content: article.content || '',
                  author: article.user?.nickname || '未知作者',
                  views: article.views_count || 0,
                  likes: article.likes_count || 0,
                  comments: article.comments_count || 0,
                  user_id: userId,
                  fetched_at: new Date().toISOString()
                }
              })
              .sort((a: any, b: any) => {
                const dateA = new Date(a.published_at).getTime()
                const dateB = new Date(b.published_at).getTime()
                return dateB - dateA
              })

            // 保存到数据库
            try {
              await saveJianshuArticlesToDB(formattedArticles)
              console.log('[Cron 简书] 数据已保存到数据库，共', formattedArticles.length, '条')
            } catch (dbError: any) {
              console.error('[Cron 简书] 保存到数据库失败:', dbError)
              return NextResponse.json({ 
                success: false, 
                error: '保存到数据库失败',
                details: dbError.message 
              }, { status: 500 })
            }

            return NextResponse.json({
              success: true,
              message: `成功抓取并保存 ${formattedArticles.length} 条简书文章数据`,
              data: {
                articles: formattedArticles.length,
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
        console.error(`[Cron 简书] API端点失败 ${apiUrl}:`, error)
        continue
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch 简书 data' 
    }, { status: 500 })
  } catch (error: any) {
    console.error('[Cron 简书] 数据抓取失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

