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
        console.log('[统一爬虫] B站 API 响应:', { 
          code: data.code, 
          hasData: !!data.data, 
          hasList: !!data.data?.list, 
          hasVlist: !!data.data?.list?.vlist,
          vlistLength: data.data?.list?.vlist?.length || 0
        })
        
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
          const errorMsg = data.code !== 0 
            ? `API 返回错误码: ${data.code}, 消息: ${data.message || '未知错误'}`
            : 'API 返回数据格式错误: 缺少 vlist 数据'
          console.error('[统一爬虫] B站数据格式错误:', { code: data.code, message: data.message, data: data.data })
          results.push({ platform: 'bilibili', success: false, error: errorMsg })
        }
      } else {
        const errorText = await response.text().catch(() => '无法读取错误内容')
        console.error('[统一爬虫] B站 HTTP 错误:', response.status, errorText.substring(0, 200))
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
      const userUrl = `https://www.jianshu.com/u/${userId}`
      
      // 首先尝试从 HTML 页面抓取（更可靠）
      try {
        console.log('[统一爬虫] 尝试从简书用户页面抓取文章:', userUrl)
        const response = await fetch(userUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Referer': 'https://www.jianshu.com/',
            'Cache-Control': 'no-cache'
          },
          next: { revalidate: 0 }
        })

        if (response.ok) {
          const html = await response.text()
          console.log('[统一爬虫] 简书页面HTML长度:', html.length)
          
          // 解析 HTML 提取文章信息
          const articles: any[] = []
          const slugRegex = /<a[^>]*href="\/p\/([^"]+)"[^>]*>/g
          const titleRegex = /<a[^>]*href="\/p\/[^"]+"[^>]*>([^<]+)<\/a>/g
          const timeRegex = /<span[^>]*class="time"[^>]*>([^<]+)<\/span>/g
          
          let match
          const slugs: string[] = []
          const titles: string[] = []
          const times: string[] = []
          
          while ((match = slugRegex.exec(html)) !== null) {
            slugs.push(match[1])
          }
          
          while ((match = titleRegex.exec(html)) !== null) {
            titles.push(match[1].trim())
          }
          
          while ((match = timeRegex.exec(html)) !== null) {
            times.push(match[1].trim())
          }
          
          // 匹配文章信息
          for (let i = 0; i < Math.min(slugs.length, titles.length); i++) {
            const slug = slugs[i]
            const title = titles[i] || '无标题'
            const timeStr = times[i] || ''
            
            // 解析时间字符串（如 "2024-01-01" 或 "1天前"）
            let publishedAt = new Date().toISOString()
            if (timeStr) {
              if (timeStr.includes('天前')) {
                const days = parseInt(timeStr.match(/(\d+)天前/)?.[1] || '0')
                publishedAt = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
              } else if (timeStr.includes('小时前')) {
                const hours = parseInt(timeStr.match(/(\d+)小时前/)?.[1] || '0')
                publishedAt = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
              } else if (timeStr.includes('分钟前')) {
                const minutes = parseInt(timeStr.match(/(\d+)分钟前/)?.[1] || '0')
                publishedAt = new Date(Date.now() - minutes * 60 * 1000).toISOString()
              } else {
                // 尝试解析日期格式
                const date = new Date(timeStr)
                if (!isNaN(date.getTime())) {
                  publishedAt = date.toISOString()
                }
              }
            }
            
            articles.push({
              title,
              slug,
              link: `https://www.jianshu.com/p/${slug}`,
              published_at: publishedAt,
              content: '',
              author: 'Saai',
              views: 0,
              likes: 0,
              comments: 0,
              user_id: userId,
              fetched_at: new Date().toISOString()
            })
          }
          
          if (articles.length > 0) {
            console.log('[统一爬虫] 从HTML抓取到', articles.length, '篇文章')
            await saveJianshuArticlesToDB(articles)
            results.push({ platform: 'jianshu', success: true, count: articles.length })
            console.log('[统一爬虫] 简书数据已保存，共', articles.length, '条')
            // 成功，跳过 API 尝试
          } else {
            throw new Error('HTML 中未找到文章')
          }
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } catch (htmlError: any) {
        console.error('[统一爬虫] HTML 抓取失败:', htmlError.message)
        // 继续尝试 API 端点
      }
      
      // 如果 HTML 抓取失败，尝试 API 端点（只有在 HTML 抓取失败时才执行）
      if (!results.find(r => r.platform === 'jianshu' && r.success)) {
        const apiUrls = [
          `https://www.jianshu.com/asimov/users/${userId}/public_notes?page=1&count=20`,
          `https://www.jianshu.com/api/users/${userId}/public_notes?page=1&count=20`,
          `https://www.jianshu.com/api/users/${userId}/notes?page=1`,
          `https://www.jianshu.com/api/users/${userId}/articles?page=1`
        ]
        
        let articles: any[] = []
        let lastError: string = ''
        
        for (const apiUrl of apiUrls) {
          try {
            console.log('[统一爬虫] 尝试简书 API:', apiUrl)
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

            console.log('[统一爬虫] 简书 API 响应状态:', response.status, response.statusText)
            
            if (response.ok) {
              const data = await response.json()
              console.log('[统一爬虫] 简书 API 数据键:', Object.keys(data))
              
              if (data.entries && Array.isArray(data.entries)) {
                articles = data.entries
              } else if (data.notes && Array.isArray(data.notes)) {
                articles = data.notes
              } else if (data.articles && Array.isArray(data.articles)) {
                articles = data.articles
              }

              console.log('[统一爬虫] 简书找到', articles.length, '篇文章')
              if (articles.length > 0) break
            } else {
              lastError = `HTTP ${response.status}`
              console.error('[统一爬虫] 简书 API 失败:', response.status)
            }
          } catch (error: any) {
            lastError = error.message || '请求失败'
            console.error('[统一爬虫] 简书 API 异常:', apiUrl, error.message)
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
          results.push({ platform: 'jianshu', success: false, error: lastError || '未获取到数据，所有方法都失败' })
        }
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
      // 使用 channel_id 而不是 user 参数（更可靠）
      const channelId = 'UCvvqt72J5jXW3TVoCJmVTlA' // @saai-saai 的 channel_id
      const channelHandle = '@saai-saai'
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
      
      console.log('[统一爬虫] YouTube RSS URL:', rssUrl)
      
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        next: { revalidate: 0 }
      })

      console.log('[统一爬虫] YouTube HTTP 响应状态:', response.status, response.statusText)

      if (response.ok) {
        const xmlText = await response.text()
        console.log('[统一爬虫] YouTube RSS 内容长度:', xmlText.length)
        console.log('[统一爬虫] YouTube RSS 内容前200字符:', xmlText.substring(0, 200))
        
        if (xmlText.trim().toLowerCase().startsWith('<!doctype') || xmlText.trim().toLowerCase().startsWith('<html')) {
          console.error('[统一爬虫] YouTube RSS 返回了 HTML 页面')
          throw new Error('YouTube RSS feed 返回了 HTML 页面而不是 XML')
        }
        
        let parsed
        try {
          parsed = await parseStringPromise(xmlText)
          console.log('[统一爬虫] YouTube XML 解析成功')
        } catch (parseError: any) {
          console.error('[统一爬虫] YouTube XML 解析失败:', parseError.message)
          throw new Error(`XML 解析失败: ${parseError.message}`)
        }
        
        const feed = parsed.feed
        
        if (feed) {
          const entries = feed.entry || []
          console.log('[统一爬虫] YouTube 找到', entries.length, '个视频条目')
          
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
          console.error('[统一爬虫] YouTube RSS 格式错误: 缺少 feed 元素')
          results.push({ platform: 'youtube', success: false, error: 'Invalid RSS format: 缺少 feed 元素' })
        }
      } else {
        const errorText = await response.text().catch(() => '无法读取错误内容')
        console.error('[统一爬虫] YouTube HTTP 错误:', response.status, errorText.substring(0, 200))
        results.push({ platform: 'youtube', success: false, error: `HTTP ${response.status}` })
      }
    } catch (error: any) {
      console.error('[统一爬虫] YouTube 爬虫失败:', error)
      console.error('[统一爬虫] YouTube 错误堆栈:', error.stack)
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

