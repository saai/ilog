import { NextResponse } from 'next/server'
import { saveBilibiliVideosToDB } from '@/lib/db-operations'
import { initTables } from '@/lib/init-tables'

// 强制动态生成
export const dynamic = 'force-dynamic'

/**
 * B站数据抓取 API - 定时任务版本
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

  const userId = '472773672' // B站用户ID
  
  try {
    // 确保表已初始化
    await initTables()
    
    // 使用 B站 API 获取视频数据
    const apiUrl = `https://api.bilibili.com/x/space/arc/search?mid=${userId}&pn=1&ps=30&order=pubdate`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://space.bilibili.com/',
        'Accept': 'application/json, text/plain, */*'
      },
      next: { revalidate: 0 } // 不缓存
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

        // 保存到数据库
        try {
          await saveBilibiliVideosToDB(videos)
          console.log('[Cron B站] 数据已保存到数据库，共', videos.length, '条')
        } catch (dbError: any) {
          console.error('[Cron B站] 保存到数据库失败:', dbError)
          return NextResponse.json({ 
            success: false, 
            error: '保存到数据库失败',
            details: dbError.message 
          }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          message: `成功抓取并保存 ${videos.length} 条B站视频数据`,
          data: {
            videos: videos.length,
            total: videos.length,
            user: {
              id: userId,
              nickname: data.data.list.vlist[0]?.author || 'Saai'
            },
            fetched_at: new Date().toISOString()
          }
        })
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch B站 data' 
    }, { status: 500 })
  } catch (error: any) {
    console.error('[Cron B站] 数据抓取失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

