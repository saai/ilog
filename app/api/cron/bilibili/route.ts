import { NextResponse } from 'next/server'

/**
 * B站数据抓取 API
 * 可以直接调用或通过 Vercel Cron Jobs 定期运行
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  // 验证请求（如果是通过 Cron Jobs 调用）
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = '472773672' // B站用户ID
  
  try {
    // 使用 B站 API 获取视频数据
    const apiUrl = `https://api.bilibili.com/x/space/arc/search?mid=${userId}&pn=1&ps=20&order=pubdate`
    
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
        const videos = data.data.list.vlist.map((video: any) => ({
          title: video.title,
          url: `https://www.bilibili.com/video/${video.bvid}`,
          bvid: video.bvid,
          publish_time: new Date(video.created * 1000).toISOString(),
          play_count: video.play,
          cover_url: video.pic,
          description: video.description,
          duration: video.length,
          author: video.author,
          created: video.created
        }))

        return NextResponse.json({
          success: true,
          data: {
            videos,
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
    console.error('B站数据抓取失败:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

