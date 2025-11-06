import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET() {
  const userId = '472773672' // 您的B站用户ID
  
  // 首先尝试读取本地Python脚本生成的JSON文件
  try {
    const jsonPath = path.join(process.cwd(), 'bilibili-spider', 'bilibili_videos.json')
    const fileContent = await fs.readFile(jsonPath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    console.log('成功读取本地B站视频数据')
    
    // 转换数据格式以匹配现有接口
    const videos = data.videos.map((video: any) => ({
      title: video.title,
      url: video.url,
      publish_time: video.publish_time,
      play_count: video.play_count,
      cover_url: video.cover_url,
      published: video.fetched_at,
      formattedDate: formatDate(video.fetched_at)
    }))
    
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
  } catch (error) {
    console.log('本地JSON文件不存在或读取失败，尝试在线API')
  }
  
  // 如果本地文件不存在，尝试在线API作为备用方案
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
      
      if (data.code === 0 && data.data?.list?.vlist) {
        const videos = data.data.list.vlist.map((video: any) => ({
          title: video.title,
          url: `https://www.bilibili.com/video/${video.bvid}`,
          publish_time: video.created,
          play_count: video.play,
          cover_url: video.pic,
          published: new Date(video.created * 1000).toISOString(),
          formattedDate: formatDate(new Date(video.created * 1000).toISOString())
        }))

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
  return NextResponse.json({
    success: true,
    data: {
      videos: [
        {
          title: '丰田塞纳露营改装',
          url: 'https://www.bilibili.com/video/BV14n7czzEwJ',
          publish_time: '今天',
          play_count: '1.2万',
          cover_url: '',
          published: new Date().toISOString(),
          formattedDate: '今天'
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