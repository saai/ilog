import { NextRequest, NextResponse } from 'next/server'

// 强制动态生成
export const dynamic = 'force-dynamic'

// 哔哩哔哩API接口
const BILIBILI_API_BASE = 'https://api.bilibili.com'

// 获取用户信息的接口
async function getUserInfo(uid: string) {
  try {
    const response = await fetch(`${BILIBILI_API_BASE}/x/space/acc/info?mid=${uid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://space.bilibili.com/',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 获取用户最新视频的接口
async function getUserVideos(uid: string, page = 1, pageSize = 10) {
  try {
    const response = await fetch(
      `${BILIBILI_API_BASE}/x/space/arc/search?mid=${uid}&pn=${page}&ps=${pageSize}&jsonp=jsonp`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://space.bilibili.com/',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取用户视频失败:', error)
    return null
  }
}

// 获取视频详细信息的接口
async function getVideoInfo(bvid: string) {
  try {
    const response = await fetch(`${BILIBILI_API_BASE}/x/web-interface/view?bvid=${bvid}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.bilibili.com/',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取视频信息失败:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const uid = searchParams.get('uid') || '472773672' // 默认使用一个知名UP主的UID - 您可以在这里修改默认UID
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '6')

    // 获取用户信息
    const userInfo = await getUserInfo(uid)
    if (!userInfo || userInfo.code !== 0) {
      console.error('用户信息获取失败:', userInfo)
      // 如果获取用户信息失败，返回模拟数据用于演示
      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: parseInt(uid),
            name: `UP主${uid}`,
            face: 'https://i1.hdslb.com/bfs/face/member/noface.jpg',
            level: 1,
            sign: '这是一个演示账号'
          },
          videos: [
            {
              id: 1,
              bvid: 'BV1xx411c7mu',
              title: '示例视频：React 18 新特性深度解析',
              description: '详细介绍了 React 18 中的并发特性、自动批处理、Suspense 等新功能，以及如何在实际项目中应用这些特性。',
              duration: 900,
              play: 15000,
              created: Date.now() / 1000 - 86400,
              pic: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
              author: `UP主${uid}`,
              externalUrl: `https://www.bilibili.com/video/BV1xx411c7mu`,
              platform: '哔哩哔哩',
              platformIcon: '📺',
              category: '技术',
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
              readTime: '15:00',
              tags: [`UP主${uid}`, '技术'],
              thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
              excerpt: '详细介绍了 React 18 中的并发特性、自动批处理、Suspense 等新功能，以及如何在实际项目中应用这些特性。',
              stats: {
                play: 15000,
                danmaku: 500,
                reply: 200,
                favorite: 800,
                coin: 300,
                share: 100,
                like: 1200
              }
            },
            {
              id: 2,
              bvid: 'BV1xx411c7mv',
              title: '示例视频：TypeScript 高级类型技巧',
              description: '分享一些 TypeScript 高级类型的使用技巧，包括条件类型、映射类型、模板字面量类型等，提升代码的类型安全性。',
              duration: 720,
              play: 12000,
              created: Date.now() / 1000 - 172800,
              pic: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
              author: `UP主${uid}`,
              externalUrl: `https://www.bilibili.com/video/BV1xx411c7mv`,
              platform: '哔哩哔哩',
              platformIcon: '📺',
              category: '技术',
              date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
              readTime: '12:00',
              tags: [`UP主${uid}`, '技术'],
              thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
              excerpt: '分享一些 TypeScript 高级类型的使用技巧，包括条件类型、映射类型、模板字面量类型等，提升代码的类型安全性。',
              stats: {
                play: 12000,
                danmaku: 400,
                reply: 150,
                favorite: 600,
                coin: 250,
                share: 80,
                like: 900
              }
            }
          ],
          total: 2,
          page: page,
          pageSize: pageSize
        }
      })
    }

    // 获取用户最新视频
    const videosData = await getUserVideos(uid, page, pageSize)
    if (!videosData || videosData.code !== 0) {
      console.error('视频列表获取失败:', videosData)
      // 如果获取视频失败，返回模拟数据
      return NextResponse.json({
        success: true,
        data: {
          user: {
            uid: userInfo.data.mid,
            name: userInfo.data.name,
            face: userInfo.data.face,
            level: userInfo.data.level,
            sign: userInfo.data.sign
          },
          videos: [
            {
              id: 1,
              bvid: 'BV1xx411c7mu',
              title: '示例视频：React 18 新特性深度解析',
              description: '详细介绍了 React 18 中的并发特性、自动批处理、Suspense 等新功能，以及如何在实际项目中应用这些特性。',
              duration: 900,
              play: 15000,
              created: Date.now() / 1000 - 86400,
              pic: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
              author: userInfo.data.name,
              externalUrl: `https://www.bilibili.com/video/BV1xx411c7mu`,
              platform: '哔哩哔哩',
              platformIcon: '📺',
              category: '技术',
              date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
              readTime: '15:00',
              tags: [userInfo.data.name, '技术'],
              thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
              excerpt: '详细介绍了 React 18 中的并发特性、自动批处理、Suspense 等新功能，以及如何在实际项目中应用这些特性。',
              stats: {
                play: 15000,
                danmaku: 500,
                reply: 200,
                favorite: 800,
                coin: 300,
                share: 100,
                like: 1200
              }
            }
          ],
          total: 1,
          page: page,
          pageSize: pageSize
        }
      })
    }

    // 处理视频数据
    const videos = videosData.data.list.vlist || []
    const processedVideos = await Promise.all(
      videos.map(async (video: any) => {
        // 获取视频详细信息
        const videoInfo = await getVideoInfo(video.bvid)
        
        return {
          id: video.aid,
          bvid: video.bvid,
          title: video.title,
          description: video.description,
          duration: video.duration,
          play: video.play,
          video_review: video.video_review,
          favorites: video.favorites,
          coin: video.coin,
          share: video.share,
          like: video.like,
          created: video.created,
          pic: video.pic,
          author: video.author,
          mid: video.mid,
          // 从详细信息中获取更多数据
          view: videoInfo?.data?.stat?.view || video.play,
          danmaku: videoInfo?.data?.stat?.danmaku || 0,
          reply: videoInfo?.data?.stat?.reply || 0,
          favorite: videoInfo?.data?.stat?.favorite || video.favorites,
          coin_count: videoInfo?.data?.stat?.coin || video.coin,
          share_count: videoInfo?.data?.stat?.share || video.share,
          like_count: videoInfo?.data?.stat?.like || video.like,
          // 格式化数据
          externalUrl: `https://www.bilibili.com/video/${video.bvid}`,
          platform: '哔哩哔哩',
          platformIcon: '📺',
          category: '视频',
          date: new Date(video.created * 1000).toISOString().split('T')[0],
          readTime: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
          tags: [video.author, '视频'],
          thumbnail: video.pic,
          excerpt: video.description || video.title,
          stats: {
            play: video.play,
            danmaku: videoInfo?.data?.stat?.danmaku || 0,
            reply: videoInfo?.data?.stat?.reply || 0,
            favorite: videoInfo?.data?.stat?.favorite || video.favorites,
            coin: videoInfo?.data?.stat?.coin || video.coin,
            share: videoInfo?.data?.stat?.share || video.share,
            like: videoInfo?.data?.stat?.like || video.like
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        user: {
          uid: userInfo.data.mid,
          name: userInfo.data.name,
          face: userInfo.data.face,
          level: userInfo.data.level,
          sign: userInfo.data.sign
        },
        videos: processedVideos,
        total: videosData.data.page.count,
        page: page,
        pageSize: pageSize
      }
    })

  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
} 