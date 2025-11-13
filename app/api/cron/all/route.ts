import { NextResponse } from 'next/server'
import { initTables } from '@/lib/init-tables'
import { saveBilibiliVideosToDB } from '@/lib/db-operations'
import { saveJianshuArticlesToDB } from '@/lib/db-operations'
import { saveDoubanInterestsToDB } from '@/lib/db-operations'
import { saveYouTubeVideosToDB } from '@/lib/db-operations'
import { parseStringPromise } from 'xml2js'

// 强制动态生成
export const dynamic = 'force-dynamic'

/**
 * 统一爬虫 API - 定时任务版本
 * 在一个 API 中执行所有平台的爬虫任务
 * 适用于 Vercel 免费计划（最多 2 个 Cron Jobs，每天最多触发一次）
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.INIT_SECRET
  
  // 验证请求（如果设置了密钥）
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: any[] = []
  
  try {
    // 确保表已初始化
    await initTables()
    console.log('[统一爬虫] 开始执行所有爬虫任务...')
    
    // 1. B站爬虫
    try {
      console.log('[统一爬虫] 开始抓取 B站数据...')
      const userId = '472773672'
      const apiUrl = `https://api.bilibili.com/x/space/arc/search?mid=${userId}&pn=1&ps=30&order=pubdate`
      
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://space.bilibili.com/',
          'Accept': 'application/json, text/plain, */*'
        },
        next: { revalidate: 0 }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.code === 0 && data.data?.list?.vlist) {
          const videos = data.data.list.vlist
            .map((video: any) => {
              const publishedAt = new Date(video.created * 1000).toISOString()
              return {
                title: video.title,
                url: `https://www.bilibili.com/video/${video.bvid}`,
                publish_time: new Date(video.created * 1000).toLocaleString('zh-CN'),
                published_at: publishedAt,
                play_count: String(video.play || 0),
                cover_url: video.pic || '',
                description: video.description || '',
                fetched_at: new Date().toISOString()
              }
            })
            .sort((a: any, b: any) => {
              const dateA = new Date(a.published_at).getTime()
              const dateB = new Date(b.published_at).getTime()
              return dateB - dateA
            })

          await saveBilibiliVideosToDB(videos)
          results.push({ platform: 'bilibili', success: true, count: videos.length })
          console.log('[统一爬虫] B站数据已保存，共', videos.length, '条')
        } else {
          results.push({ platform: 'bilibili', success: false, error: 'API 返回数据格式错误' })
        }
      } else {
        results.push({ platform: 'bilibili', success: false, error: `HTTP ${response.status}` })
      }
    } catch (error: any) {
      console.error('[统一爬虫] B站爬虫失败:', error)
      results.push({ platform: 'bilibili', success: false, error: error.message })
    }

    // 2. 简书爬虫
    try {
      console.log('[统一爬虫] 开始抓取简书数据...')
      const userId = '763ffbb1b873'
      const apiUrls = [
        `https://www.jianshu.com/asimov/users/${userId}/public_notes?page=1&count=20`,
        `https://www.jianshu.com/api/users/${userId}/public_notes?page=1&count=20`
      ]
      
      let articles: any[] = []
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
            next: { revalidate: 0 }
          })

          if (response.ok) {
            const data = await response.json()
            if (data.entries && Array.isArray(data.entries)) {
              articles = data.entries
            } else if (data.notes && Array.isArray(data.notes)) {
              articles = data.notes
            } else if (data.articles && Array.isArray(data.articles)) {
              articles = data.articles
            }

            if (articles.length > 0) break
          }
        } catch (error) {
          continue
        }
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

        await saveJianshuArticlesToDB(formattedArticles)
        results.push({ platform: 'jianshu', success: true, count: formattedArticles.length })
        console.log('[统一爬虫] 简书数据已保存，共', formattedArticles.length, '条')
      } else {
        results.push({ platform: 'jianshu', success: false, error: '未获取到数据' })
      }
    } catch (error: any) {
      console.error('[统一爬虫] 简书爬虫失败:', error)
      results.push({ platform: 'jianshu', success: false, error: error.message })
    }

    // 3. 豆瓣爬虫
    try {
      console.log('[统一爬虫] 开始抓取豆瓣数据...')
      const userId = '284853052'
      const rssUrl = `https://www.douban.com/feed/people/${userId}/interests`
      
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        next: { revalidate: 0 }
      })

      if (response.ok) {
        const xmlText = await response.text()
        
        if (xmlText.trim().toLowerCase().startsWith('<!doctype') || xmlText.trim().toLowerCase().startsWith('<html')) {
          throw new Error('RSS feed 返回了 HTML 页面而不是 XML')
        }
        
        const parsed = await parseStringPromise(xmlText)
        const channel = parsed.rss?.channel?.[0]
        
        if (channel) {
          const items = channel.item || []
          const interests = items
            .map((item: any) => {
              const title = item.title?.[0] || ''
              const link = item.link?.[0] || ''
              const pubDate = item.pubDate?.[0] || new Date().toISOString()
              const description = item.description?.[0] || ''
              
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

          await saveDoubanInterestsToDB(interests)
          results.push({ platform: 'douban', success: true, count: interests.length })
          console.log('[统一爬虫] 豆瓣数据已保存，共', interests.length, '条')
        } else {
          results.push({ platform: 'douban', success: false, error: 'Invalid RSS format' })
        }
      } else {
        results.push({ platform: 'douban', success: false, error: `HTTP ${response.status}` })
      }
    } catch (error: any) {
      console.error('[统一爬虫] 豆瓣爬虫失败:', error)
      results.push({ platform: 'douban', success: false, error: error.message })
    }

    // 4. YouTube 爬虫
    try {
      console.log('[统一爬虫] 开始抓取 YouTube 数据...')
      const channelHandle = '@saai-saai'
      const channelName = channelHandle.replace('@', '')
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?user=${channelName}`
      
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        next: { revalidate: 0 }
      })

      if (response.ok) {
        const xmlText = await response.text()
        
        if (xmlText.trim().toLowerCase().startsWith('<!doctype') || xmlText.trim().toLowerCase().startsWith('<html')) {
          throw new Error('YouTube RSS feed 返回了 HTML 页面而不是 XML')
        }
        
        const parsed = await parseStringPromise(xmlText)
        const feed = parsed.feed
        
        if (feed) {
          const entries = feed.entry || []
          const videos = entries
            .map((entry: any) => {
              const videoId = entry['yt:videoId']?.[0] || ''
              const title = entry.title?.[0] || ''
              const link = entry.link?.[0]?.$.href || `https://www.youtube.com/watch?v=${videoId}`
              const published = entry.published?.[0] || new Date().toISOString()
              const description = entry['media:group']?.[0]?.['media:description']?.[0] || ''
              const thumbnail = entry['media:group']?.[0]?.['media:thumbnail']?.[0]?.$.url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`

              return {
                title,
                url: link,
                video_id: videoId,
                published_at: published,
                description,
                thumbnail_url: thumbnail,
                channel_name: channelHandle
              }
            })
            .sort((a: any, b: any) => {
              const dateA = new Date(a.published_at).getTime()
              const dateB = new Date(b.published_at).getTime()
              return dateB - dateA
            })

          await saveYouTubeVideosToDB(videos)
          results.push({ platform: 'youtube', success: true, count: videos.length })
          console.log('[统一爬虫] YouTube 数据已保存，共', videos.length, '条')
        } else {
          results.push({ platform: 'youtube', success: false, error: 'Invalid RSS format' })
        }
      } else {
        results.push({ platform: 'youtube', success: false, error: `HTTP ${response.status}` })
      }
    } catch (error: any) {
      console.error('[统一爬虫] YouTube 爬虫失败:', error)
      results.push({ platform: 'youtube', success: false, error: error.message })
    }

    const successCount = results.filter(r => r.success).length
    const totalCount = results.length

    return NextResponse.json({
      success: successCount === totalCount,
      message: `完成 ${successCount}/${totalCount} 个平台的数据抓取`,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('[统一爬虫] 执行失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '未知错误',
      results,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

