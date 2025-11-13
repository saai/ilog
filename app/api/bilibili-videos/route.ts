import { NextResponse } from 'next/server'
import { getBilibiliVideosFromDB, saveBilibiliVideosToDB } from '@/lib/db-operations'
import { initTables } from '@/lib/init-tables'

// 强制动态生成
export const dynamic = 'force-dynamic'

export async function GET() {
  const userId = '472773672' // 您的B站用户ID
  
  try {
    // 确保表已初始化
    await initTables()
    
    // 从数据库读取数据
    const videos = await getBilibiliVideosFromDB(30)
    
    if (videos.length > 0) {
      // 格式化日期
      const formattedVideos = videos.map(video => ({
        ...video,
        formattedDate: formatDate(video.published_at || video.published || new Date().toISOString())
      }))
      
      return NextResponse.json({
        success: true,
        data: {
          videos: formattedVideos,
          total: formattedVideos.length,
          user: {
            id: userId,
            nickname: formattedVideos[0]?.author || '未知用户'
          }
        }
      })
    }
    
    // 如果数据库中没有数据，尝试从在线API获取（作为后备方案）
    console.log('[B站API] 数据库中无数据，尝试从在线API获取...')
  } catch (error: any) {
    console.error('[B站API] 从数据库读取失败:', error)
    // 继续尝试从在线API获取
  }
  
  // 从在线API获取数据（作为后备方案）
  try {
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
      
      console.log('B站API响应:', { code: data.code, hasVlist: !!data.data?.list?.vlist, vlistLength: data.data?.list?.vlist?.length || 0 })
      
      if (data.code === 0 && data.data?.list?.vlist && data.data.list.vlist.length > 0) {
        const videos = data.data.list.vlist
          .map((video: any) => {
            const publishedAt = new Date(video.created * 1000).toISOString()
            return {
              title: video.title,
              url: `https://www.bilibili.com/video/${video.bvid}`,
              publish_time: new Date(video.created * 1000).toLocaleString('zh-CN'),
              published_at: publishedAt, // 必须字段，用于转换函数
              play_count: String(video.play || 0),
              cover_url: video.pic || '',
              published: publishedAt, // 向后兼容
              formattedDate: formatDate(publishedAt),
              fetched_at: new Date().toISOString() // 添加获取时间
            }
          })
          // 按发布时间倒序排序（最新的在前）
          .sort((a: any, b: any) => {
            const dateA = new Date(a.published_at || a.published).getTime()
            const dateB = new Date(b.published_at || b.published).getTime()
            return dateB - dateA
          })

        // 保存到数据库
        try {
          await saveBilibiliVideosToDB(videos)
          console.log('[B站API] 数据已保存到数据库')
        } catch (dbError: any) {
          console.error('[B站API] 保存到数据库失败:', dbError)
          // 继续返回数据，即使保存失败
        }

        return NextResponse.json({
          success: true,
          data: {
            videos,
            total: videos.length,
            user: {
              id: userId,
              nickname: data.data.list.vlist[0]?.author || '未知用户'
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('[B站API] 在线API请求失败:', error)
  }

  // 如果所有方法都失败，返回模拟数据
  console.log('所有API端点都失败，返回备用数据')
  // 使用一个过去的日期作为发布时间（而不是当前时间）
  const fallbackPublishedAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7天前
  return NextResponse.json({
    success: true,
    data: {
      videos: [
        {
          title: '丰田塞纳露营改装',
          url: 'https://www.bilibili.com/video/BV14n7czzEwJ',
          publish_time: '7天前',
          play_count: '1.2万',
          cover_url: '',
          published_at: fallbackPublishedAt, // 必须字段 - 使用发布时间
          published: fallbackPublishedAt, // 向后兼容
          formattedDate: formatDate(fallbackPublishedAt), // 基于发布时间格式化
          fetched_at: new Date().toISOString() // 获取时间（用于追踪）
        }
      ],
      total: 1,
      user: {
        id: userId,
        nickname: 'Saai'
      }
    }
  })
}

// 格式化日期
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return '今天'
    } else if (diffInDays === 1) {
      return '昨天'
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7)
      return `${weeks}周前`
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30)
      return `${months}个月前`
    } else {
      const years = Math.floor(diffInDays / 365)
      return `${years}年前`
    }
  } catch {
    return '未知时间'
  }
} 