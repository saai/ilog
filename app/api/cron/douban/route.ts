import { NextResponse } from 'next/server'
import { parseStringPromise } from 'xml2js'
import { saveDoubanInterestsToDB } from '@/lib/db-operations'
import { initTables } from '@/lib/init-tables'

// 强制动态生成
export const dynamic = 'force-dynamic'

/**
 * 豆瓣 RSS 数据抓取 API - 定时任务版本
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

  const userId = '284853052' // 豆瓣用户ID
  const rssUrl = `https://www.douban.com/feed/people/${userId}/interests`
  
  try {
    // 确保表已初始化
    await initTables()
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      next: { revalidate: 0 } // 不缓存
    })

    if (response.ok) {
      const xmlText = await response.text()
      
      // 检查返回的是否是 HTML（错误页面）
      if (xmlText.trim().toLowerCase().startsWith('<!doctype') || xmlText.trim().toLowerCase().startsWith('<html')) {
        throw new Error('RSS feed 返回了 HTML 页面而不是 XML')
      }
      
      let parsed
      try {
        parsed = await parseStringPromise(xmlText)
      } catch (parseError: any) {
        throw new Error(`XML 解析失败: ${parseError.message}`)
      }
      
      const channel = parsed.rss?.channel?.[0]
      if (!channel) {
        throw new Error('Invalid RSS format: 缺少 channel 元素')
      }

      const items = channel.item || []
      const interests = items
        .map((item: any) => {
          const title = item.title?.[0] || ''
          const link = item.link?.[0] || ''
          const pubDate = item.pubDate?.[0] || new Date().toISOString()
          const description = item.description?.[0] || ''
          
          // 解析类型和评分
          let type = 'interest'
          let rating = ''
          const typeMatch = description.match(/类型[：:]\s*([^<]+)/)
          const ratingMatch = description.match(/评分[：:]\s*([^<]+)/)
          
          if (typeMatch) {
            type = typeMatch[1].trim()
          }
          if (ratingMatch) {
            rating = ratingMatch[1].trim()
          }

          return {
            title,
            url: link,
            type,
            rating,
            description,
            published_at: pubDate,
            published: pubDate,
            created_at: pubDate
          }
        })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.published_at || a.published || a.created_at).getTime()
          const dateB = new Date(b.published_at || b.published || b.created_at).getTime()
          return dateB - dateA
        })

      // 保存到数据库
      try {
        await saveDoubanInterestsToDB(interests)
        console.log('[Cron 豆瓣] 数据已保存到数据库，共', interests.length, '条')
      } catch (dbError: any) {
        console.error('[Cron 豆瓣] 保存到数据库失败:', dbError)
        return NextResponse.json({ 
          success: false, 
          error: '保存到数据库失败',
          details: dbError.message 
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `成功抓取并保存 ${interests.length} 条豆瓣兴趣数据`,
        data: {
          interests: interests.length,
          total: interests.length,
          user: {
            id: userId,
            name: channel.title?.[0] || 'Saai'
          },
          fetched_at: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch 豆瓣 RSS data' 
    }, { status: 500 })
  } catch (error: any) {
    console.error('[Cron 豆瓣] 数据抓取失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

