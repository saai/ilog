import { NextResponse } from 'next/server'
import { getYouTubeVideosFromDB } from '@/lib/db-operations'
import { initTables } from '@/lib/init-tables'

// 强制动态生成
export const dynamic = 'force-dynamic'

/**
 * YouTube 视频数据 API - 仅从数据库读取，用于前端展示
 */
export async function GET(request: Request) {
  // 添加调试日志
  console.log('[Data API] YouTube 请求:', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  })
  
  try {
    // 确保表已初始化
    await initTables()
    
    // 从数据库读取数据
    const videos = await getYouTubeVideosFromDB(30)
    
    if (videos.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          videos: [],
          total: 0,
          channel: {
            handle: '@saai-saai',
            name: '@saai-saai'
          }
        },
        message: '数据库中暂无数据'
      })
    }
    
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
        channel: {
          handle: '@saai-saai',
          name: formattedVideos[0]?.channel_name || '@saai-saai'
        }
      }
    })
  } catch (error: any) {
    console.error('[Data API] 从数据库读取YouTube数据失败:', error)
    return NextResponse.json({
      success: false,
      error: '从数据库读取YouTube数据失败',
      details: error.message
    }, { status: 500 })
  }
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

