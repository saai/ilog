import { NextResponse } from 'next/server'

export async function GET() {
  // 直接从在线API获取数据，不再读取本地文件
  try {
    const userId = '472773672'
    const apiUrl = `https://api.bilibili.com/x/space/arc/search?mid=${userId}&pn=1&ps=30&order=pubdate`
    
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://space.bilibili.com/',
        'Accept': 'application/json, text/plain, */*'
      },
      next: { revalidate: 1800 } // 缓存30分钟
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.code === 0 && data.data?.list?.vlist) {
        const videos = data.data.list.vlist.map((video: any) => ({
          title: video.title,
          url: `https://www.bilibili.com/video/${video.bvid}`,
          publish_time: new Date(video.created * 1000).toLocaleString('zh-CN'),
          published_at: new Date(video.created * 1000).toISOString(),
          play_count: String(video.play || 0),
          cover_url: video.pic || '',
          fetched_at: new Date().toISOString()
        }))

        return NextResponse.json({
          success: true,
          data: {
            user_id: userId,
            total_videos: videos.length,
            fetched_at: new Date().toISOString(),
            videos: videos
          }
        })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'B站API请求失败'
    })
  } catch (error) {
    console.error('获取B站数据失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取B站数据失败'
    })
  }
} 