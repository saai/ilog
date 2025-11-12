import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// 解析 publish_time 字符串为 ISO 格式的 published_at
function parsePublishTime(publishTime: string): string | null {
  if (!publishTime || publishTime.trim() === '') {
    return null
  }
  
  try {
    // 格式: "2025-11-10 11:24:53" 或 "2025-11-10T11:24:53"
    const timeStr = publishTime.trim()
    
    // 尝试解析 "YYYY-MM-DD HH:mm:ss" 格式
    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
      const date = new Date(timeStr.replace(' ', 'T'))
      if (!isNaN(date.getTime())) {
        return date.toISOString()
      }
    }
    
    // 尝试解析 ISO 格式
    const date = new Date(timeStr)
    if (!isNaN(date.getTime())) {
      return date.toISOString()
    }
  } catch (error) {
    console.warn('解析 publish_time 失败:', publishTime, error)
  }
  
  return null
}

export async function GET() {
  const userId = '472773672' // 您的B站用户ID
  
  // 首先尝试读取本地JSON文件（如果存在）
  try {
    const jsonPath = path.join(process.cwd(), 'bilibili-spider', 'bilibili_videos.json')
    const fileContent = await fs.readFile(jsonPath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    console.log('成功读取本地B站视频数据')
    console.log(`数据获取时间: ${data.fetched_at}`)
    console.log(`视频数量: ${data.videos?.length || 0}`)
    
    // 转换数据格式，从 publish_time 解析 published_at
    const videos = (data.videos || [])
      .map((video: any) => {
        // 从 publish_time 解析 published_at
        const publishedAt = video.published_at || parsePublishTime(video.publish_time) || null
        
        return {
          title: video.title,
          url: video.url,
          publish_time: video.publish_time || '',
          published_at: publishedAt, // 从 publish_time 解析
          play_count: video.play_count || '0',
          cover_url: video.cover_url || '',
          published: publishedAt, // 向后兼容
          formattedDate: publishedAt ? formatDate(publishedAt) : '未知时间',
          fetched_at: video.fetched_at || new Date().toISOString()
        }
      })
      .filter((video: any) => video.published_at !== null) // 只保留有发布时间的视频
      // 按发布时间倒序排序（最新的在前）
      .sort((a: any, b: any) => {
        const dateA = new Date(a.published_at || a.published).getTime()
        const dateB = new Date(b.published_at || b.published).getTime()
        return dateB - dateA
      })
    
    if (videos.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          videos,
          total: videos.length,
          user: {
            id: userId,
            nickname: 'Saai'
          }
        }
      })
    }
  } catch (error) {
    console.log('本地JSON文件不存在或读取失败，尝试在线API:', error)
  }
  
  // 如果本地文件不存在，尝试在线API
  try {
    const apiUrl = `https://api.bilibili.com/x/space/arc/search?mid=${userId}&pn=1&ps=10&order=pubdate`
    
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
    console.error('B站API请求失败:', error)
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