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
    console.log('[Cron 豆瓣] 开始抓取数据，URL:', rssUrl)
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      next: { revalidate: 0 } // 不缓存
    })

    console.log('[Cron 豆瓣] HTTP 响应状态:', response.status, response.statusText)
    console.log('[Cron 豆瓣] Content-Type:', response.headers.get('content-type'))

    if (response.ok) {
      const xmlText = await response.text()
      console.log('[Cron 豆瓣] RSS 内容长度:', xmlText.length)
      console.log('[Cron 豆瓣] RSS 内容前200字符:', xmlText.substring(0, 200))
      
      // 检查返回的是否是 HTML（错误页面）
      if (xmlText.trim().toLowerCase().startsWith('<!doctype') || xmlText.trim().toLowerCase().startsWith('<html')) {
        console.error('[Cron 豆瓣] 返回了 HTML 页面，内容:', xmlText.substring(0, 500))
        throw new Error('RSS feed 返回了 HTML 页面而不是 XML')
      }
      
      let parsed
      try {
        parsed = await parseStringPromise(xmlText)
        console.log('[Cron 豆瓣] XML 解析成功')
      } catch (parseError: any) {
        console.error('[Cron 豆瓣] XML 解析失败:', parseError.message)
        console.error('[Cron 豆瓣] XML 内容片段:', xmlText.substring(0, 1000))
        throw new Error(`XML 解析失败: ${parseError.message}`)
      }
      
      const channel = parsed.rss?.channel?.[0]
      if (!channel) {
        console.error('[Cron 豆瓣] 解析后的数据结构:', JSON.stringify(parsed, null, 2).substring(0, 500))
        throw new Error('Invalid RSS format: 缺少 channel 元素')
      }

      const items = channel.item || []
      console.log('[Cron 豆瓣] 找到', items.length, '个条目')
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
        console.log('[Cron 豆瓣] 准备保存', interests.length, '条数据到数据库')
        console.log('[Cron 豆瓣] 示例数据:', JSON.stringify(interests[0] || {}, null, 2))
        await saveDoubanInterestsToDB(interests)
        console.log('[Cron 豆瓣] 数据已保存到数据库，共', interests.length, '条')
      } catch (dbError: any) {
        console.error('[Cron 豆瓣] 保存到数据库失败:', dbError)
        console.error('[Cron 豆瓣] 错误堆栈:', dbError.stack)
        return NextResponse.json({ 
          success: false, 
          error: '保存到数据库失败',
          details: dbError.message,
          stack: process.env.NODE_ENV === 'development' ? dbError.stack : undefined
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

    console.error('[Cron 豆瓣] HTTP 请求失败，状态码:', response.status)
    const errorText = await response.text().catch(() => '无法读取错误内容')
    console.error('[Cron 豆瓣] 错误响应内容:', errorText.substring(0, 500))
    return NextResponse.json({ 
      success: false, 
      error: `Failed to fetch 豆瓣 RSS data: HTTP ${response.status}`,
      details: errorText.substring(0, 200)
    }, { status: response.status })
  } catch (error: any) {
    console.error('[Cron 豆瓣] 数据抓取失败:', error)
    console.error('[Cron 豆瓣] 错误堆栈:', error.stack)
    return NextResponse.json({ 
      success: false, 
      error: error.message || '未知错误',
      details: error.stack || error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

