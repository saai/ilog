import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

interface BilibiliVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  playCount: string
  publishTime: string
  bvid: string
  externalUrl: string
  platform: string
  platformIcon: string
  category: string
  date: string
  readTime: string
  tags: string[]
  excerpt: string
  stats: {
    play: number
    danmaku: number
    reply: number
    favorite: number
    coin: number
    share: number
    like: number
  }
}

interface BilibiliUser {
  uid: string
  name: string
  face: string
  level: number
  sign: string
}

// 爬取哔哩哔哩用户信息
async function scrapeUserInfo(uid: string): Promise<BilibiliUser | null> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // 访问用户主页
    const userUrl = `https://space.bilibili.com/${uid}`
    await page.goto(userUrl, { waitUntil: 'networkidle2', timeout: 30000 })

    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 提取用户信息 - 使用更通用的选择器
    const userInfo = await page.evaluate(() => {
      // 尝试多种可能的选择器
      const nameSelectors = [
        '.h-basic .name',
        '.user-name',
        '.name',
        'h1',
        '.profile-name'
      ]
      
      const faceSelectors = [
        '.h-basic .face img',
        '.avatar img',
        '.user-avatar img',
        'img[src*="hdslb.com"]'
      ]
      
      const levelSelectors = [
        '.h-basic .level',
        '.user-level',
        '.level'
      ]
      
      const signSelectors = [
        '.h-basic .sign',
        '.user-sign',
        '.signature',
        '.description'
      ]

      let name = '未知用户'
      let face = 'https://i1.hdslb.com/bfs/face/member/noface.jpg'
      let level = 1
      let sign = ''

      // 查找用户名
      for (const selector of nameSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent?.trim()) {
          name = element.textContent.trim()
          break
        }
      }

      // 查找头像
      for (const selector of faceSelectors) {
        const element = document.querySelector(selector) as HTMLImageElement
        if (element && element.src) {
          face = element.src
          break
        }
      }

      // 查找等级
      for (const selector of levelSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent) {
          const levelMatch = element.textContent.match(/\d+/)
          if (levelMatch) {
            level = parseInt(levelMatch[0])
            break
          }
        }
      }

      // 查找签名
      for (const selector of signSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent?.trim()) {
          sign = element.textContent.trim()
          break
        }
      }

      return { name, face, level, sign }
    })

    return {
      uid,
      ...userInfo
    }

  } catch (error) {
    console.error('爬取用户信息失败:', error)
    return null
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// 爬取哔哩哔哩用户视频列表
async function scrapeUserVideos(uid: string, maxVideos: number = 6): Promise<BilibiliVideo[]> {
  let browser
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })

    const page = await browser.newPage()
    
    // 设置用户代理
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    // 访问用户视频页面
    const videosUrl = `https://space.bilibili.com/${uid}/video`
    await page.goto(videosUrl, { waitUntil: 'networkidle2', timeout: 30000 })

    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 滚动页面以加载更多视频
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2)
    })
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 提取视频信息 - 使用更通用的选择器
    const videos = await page.evaluate((maxVideos) => {
      // 尝试多种可能的视频容器选择器
      const containerSelectors = [
        '.small-item',
        '.video-item',
        '.bili-video-card',
        '.video-card',
        '[data-aid]',
        '.list-item'
      ]
      
      let videoElements: NodeListOf<Element> | null = null
      
      for (const selector of containerSelectors) {
        videoElements = document.querySelectorAll(selector)
        if (videoElements.length > 0) {
          console.log(`找到视频元素，使用选择器: ${selector}`)
          break
        }
      }

      if (!videoElements || videoElements.length === 0) {
        console.log('未找到视频元素，尝试查找所有链接')
        // 如果找不到视频容器，尝试查找所有包含BV号的链接
        const allLinks = document.querySelectorAll('a[href*="/video/"]')
        const videoList: any[] = []
        
        for (let i = 0; i < Math.min(allLinks.length, maxVideos); i++) {
          const link = allLinks[i] as HTMLAnchorElement
          const href = link.href
          const bvid = href.match(/BV\w+/)?.[0] || ''
          
          if (bvid) {
            const titleElement = link.querySelector('img')?.alt || link.textContent?.trim()
            
            videoList.push({
              id: i + 1,
              title: titleElement || '未知标题',
              description: titleElement || '暂无描述',
              thumbnail: link.querySelector('img')?.src || 'https://via.placeholder.com/300x200',
              duration: '00:00',
              playCount: '0',
              publishTime: '',
              bvid,
              externalUrl: href,
              platform: '哔哩哔哩',
              platformIcon: '📺',
              category: '视频',
              date: new Date().toISOString().split('T')[0],
              readTime: '00:00',
              tags: ['视频'],
              excerpt: titleElement || '暂无描述',
              stats: {
                play: 0,
                danmaku: 0,
                reply: 0,
                favorite: 0,
                coin: 0,
                share: 0,
                like: 0
              }
            })
          }
        }
        
        return videoList
      }

      const videoList: any[] = []

      for (let i = 0; i < Math.min(videoElements.length, maxVideos); i++) {
        const element = videoElements[i]
        
        // 尝试多种可能的选择器
        const titleSelectors = ['.title', '.video-title', 'h3', 'h4', '.name']
        const thumbnailSelectors = ['.cover img', '.pic img', 'img', '.thumbnail img']
        const durationSelectors = ['.duration', '.time', '.length']
        const playCountSelectors = ['.play', '.view', '.count']
        const publishTimeSelectors = ['.time', '.date', '.publish-time']
        const linkSelectors = ['a', '.link']

        let title = '未知标题'
        let thumbnail = 'https://via.placeholder.com/300x200'
        let duration = '00:00'
        let playCount = '0'
        let publishTime = ''
        let href = ''

        // 查找标题
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector)
          if (element && element.textContent?.trim()) {
            title = element.textContent.trim()
            break
          }
        }

        // 查找缩略图
        for (const selector of thumbnailSelectors) {
          const element = document.querySelector(selector) as HTMLImageElement
          if (element && element.src) {
            thumbnail = element.src
            break
          }
        }

        // 查找时长
        for (const selector of durationSelectors) {
          const element = document.querySelector(selector)
          if (element && element.textContent?.trim()) {
            duration = element.textContent.trim()
            break
          }
        }

        // 查找播放量
        for (const selector of playCountSelectors) {
          const element = document.querySelector(selector)
          if (element && element.textContent?.trim()) {
            playCount = element.textContent.trim()
            break
          }
        }

        // 查找发布时间
        for (const selector of publishTimeSelectors) {
          const element = document.querySelector(selector)
          if (element && element.textContent?.trim()) {
            publishTime = element.textContent.trim()
            break
          }
        }

        // 查找链接
        for (const selector of linkSelectors) {
          const element = document.querySelector(selector) as HTMLAnchorElement
          if (element && element.href && element.href.includes('/video/')) {
            href = element.href
            break
          }
        }

        if (href) {
          const bvid = href.match(/BV\w+/)?.[0] || ''

          videoList.push({
            id: i + 1,
            title,
            description: title,
            thumbnail,
            duration,
            playCount,
            publishTime,
            bvid,
            externalUrl: href,
            platform: '哔哩哔哩',
            platformIcon: '📺',
            category: '视频',
            date: new Date().toISOString().split('T')[0],
            readTime: duration,
            tags: ['视频'],
            excerpt: title,
            stats: {
              play: parseInt(playCount.replace(/[^\d]/g, '') || '0'),
              danmaku: 0,
              reply: 0,
              favorite: 0,
              coin: 0,
              share: 0,
              like: 0
            }
          })
        }
      }

      return videoList
    }, maxVideos)

    return videos

  } catch (error) {
    console.error('爬取视频列表失败:', error)
    return []
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get('uid') || '472773672'
    const maxVideos = parseInt(searchParams.get('maxVideos') || '6')

    console.log(`开始爬取UID: ${uid} 的数据`)

    // 爬取用户信息
    const userInfo = await scrapeUserInfo(uid)
    if (!userInfo) {
      return NextResponse.json(
        { error: '无法获取用户信息，请检查UID是否正确' },
        { status: 500 }
      )
    }

    // 爬取视频列表
    const videos = await scrapeUserVideos(uid, maxVideos)
    
    console.log(`成功爬取到 ${videos.length} 个视频`)

    return NextResponse.json({
      success: true,
      data: {
        user: userInfo,
        videos: videos,
        total: videos.length,
        page: 1,
        pageSize: maxVideos
      }
    })

  } catch (error) {
    console.error('爬虫API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
} 