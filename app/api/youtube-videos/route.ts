import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  const channelHandle = '@saai-saai' // YouTube 频道句柄
  
  // 首先尝试读取本地Python脚本生成的JSON文件
  try {
    const jsonPath = path.join(process.cwd(), 'youtube-spider', 'youtube_videos.json')
    const fileContent = await fs.readFile(jsonPath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    console.log('成功读取本地YouTube视频数据')
    
    // 转换数据格式以匹配现有接口
    const videos = data.videos
      .map((video: any) => ({
        title: video.title,
        url: video.url,
        video_id: video.video_id,
        published_at: video.published_at,
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        channel_name: video.channel_name,
        published: video.published_at,
        formattedDate: formatDate(video.published_at)
      }))
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
        channel: {
          handle: channelHandle,
          name: data.channel_name || 'Saai'
        }
      }
    })
  } catch (error) {
    console.log('本地JSON文件不存在或读取失败:', error)
  }
  
  // 如果本地文件不存在，尝试使用 YouTube RSS feed 作为备用方案
  try {
    // 尝试通过 RSS feed 获取数据
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?user=${channelHandle.replace('@', '')}`
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 1800 } // 缓存30分钟
    })

    if (response.ok) {
      const xmlText = await response.text()
      // 简单的 XML 解析（实际项目中可以使用 xml2js）
      const videoIds = xmlText.match(/<yt:videoId>([^<]+)<\/yt:videoId>/g) || []
      const titles = xmlText.match(/<title>([^<]+)<\/title>/g) || []
      const publishedDates = xmlText.match(/<published>([^<]+)<\/published>/g) || []
      
      if (videoIds.length > 0) {
        const videos = videoIds
          .slice(0, 10)
          .map((_, index) => {
            const videoId = videoIds[index]?.replace(/<\/?yt:videoId>/g, '') || ''
            const title = titles[index + 1]?.replace(/<\/?title>/g, '') || '无标题' // +1 因为第一个title是频道名
            const published = publishedDates[index]?.replace(/<\/?published>/g, '') || new Date().toISOString()
            
            return {
              title,
              url: `https://www.youtube.com/watch?v=${videoId}`,
              video_id: videoId,
              published_at: published,
              description: '',
              thumbnail_url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
              channel_name: channelHandle,
              published,
              formattedDate: formatDate(published)
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
            channel: {
              handle: channelHandle,
              name: channelHandle
            }
          }
        })
      }
    }
  } catch (error) {
    console.error('YouTube RSS feed 请求失败:', error)
  }

  // 如果所有方法都失败，返回模拟数据
  console.log('所有API端点都失败，返回备用数据')
  return NextResponse.json({
    success: true,
    data: {
      videos: [
        {
          title: '最新技术分享视频',
          url: 'https://www.youtube.com/@saai-saai',
          video_id: 'example123',
          published_at: new Date().toISOString(),
          description: '这是一个技术分享视频，包含React 18新特性详解和实战项目演示。',
          thumbnail_url: '',
          channel_name: channelHandle,
          published: new Date().toISOString(),
          formattedDate: '今天'
        }
      ],
      total: 1,
      channel: {
        handle: channelHandle,
        name: 'Saai'
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

