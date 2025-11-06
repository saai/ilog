import { NextResponse } from 'next/server'
import { parseStringPromise } from 'xml2js'

/**
 * YouTube 数据抓取 API
 * 可以直接调用或通过 Vercel Cron Jobs 定期运行
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // 验证请求（如果是通过 Cron Jobs 调用）
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const channelHandle = '@saai-saai' // YouTube 频道句柄
  const channelName = channelHandle.replace('@', '')
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?user=${channelName}`
  
  try {
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 0 } // 不缓存
    })

    if (response.ok) {
      const xmlText = await response.text()
      const parsed = await parseStringPromise(xmlText)
      
      const feed = parsed.feed
      if (!feed) {
        throw new Error('Invalid RSS format')
      }

      const entries = feed.entry || []
      const videos = entries.map((entry: any) => {
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

      return NextResponse.json({
        success: true,
        data: {
          videos,
          total: videos.length,
          channel: {
            handle: channelHandle,
            name: feed.title?.[0] || channelHandle
          },
          fetched_at: new Date().toISOString()
        }
      })
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch YouTube data' 
    }, { status: 500 })
  } catch (error: any) {
    console.error('YouTube数据抓取失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

