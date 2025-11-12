import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

// 强制动态生成
export const dynamic = 'force-dynamic'

interface JianshuArticle {
  id: string
  title: string
  description: string
  thumbnail: string
  readTime: string
  publishTime: string
  externalUrl: string
  platform: string
  platformIcon: string
  category: string
  date: string
  tags: string[]
  excerpt: string
  stats: {
    likes: number
    comments: number
    views: number
    rewards: number
  }
}

interface JianshuUser {
  uid: string
  name: string
  avatar: string
  description: string
  followers: number
  following: number
  articles: number
  words: number
}

// 爬取简书用户信息
async function scrapeUserInfo(uid: string): Promise<JianshuUser | null> {
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
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080'
      ]
    })

    const page = await browser.newPage()
    
    // 设置更真实的用户代理
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 })
    
    // 设置额外的请求头
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    })
    
    // 访问用户主页
    const userUrl = `https://www.jianshu.com/u/${uid}`
    console.log(`访问简书用户页面: ${userUrl}`)
    await page.goto(userUrl, { waitUntil: 'networkidle2', timeout: 30000 })

    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 8000))

    // 检查是否被重定向到登录页
    const currentUrl = page.url()
    console.log(`当前页面URL: ${currentUrl}`)
    
    if (currentUrl.includes('login') || currentUrl.includes('sign_in')) {
      console.log('被重定向到登录页面')
      return null
    }

    // 提取用户信息
    const userInfo = await page.evaluate(() => {
      console.log('开始提取用户信息...')
      
      // 尝试多种可能的选择器
      const nameSelectors = [
        '.name',
        '.author-name',
        'h1',
        '.profile-name',
        '.user-name',
        '.author h1',
        '.profile h1'
      ]
      
      const avatarSelectors = [
        '.avatar img',
        '.author-avatar img',
        '.profile-avatar img',
        'img[src*="jianshu.com"]',
        '.author img',
        '.profile img'
      ]
      
      const descriptionSelectors = [
        '.description',
        '.bio',
        '.signature',
        '.profile-description',
        '.author-description'
      ]
      
      const statsSelectors = [
        '.meta-block',
        '.stats',
        '.user-stats',
        '.profile-stats',
        '.author-stats'
      ]

      let name = '未知用户'
      let avatar = 'https://cdn2.jianshu.io/assets/default_avatar/13-394c31a9cb492fcb39c27422ca7d2815.jpg'
      let description = ''
      let followers = 0
      let following = 0
      let articles = 0
      let words = 0

      // 查找用户名
      for (const selector of nameSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent?.trim()) {
          name = element.textContent.trim()
          console.log(`找到用户名: ${name}`)
          break
        }
      }

      // 查找头像
      for (const selector of avatarSelectors) {
        const element = document.querySelector(selector) as HTMLImageElement
        if (element && element.src) {
          avatar = element.src
          console.log(`找到头像: ${avatar}`)
          break
        }
      }

      // 查找描述
      for (const selector of descriptionSelectors) {
        const element = document.querySelector(selector)
        if (element && element.textContent?.trim()) {
          description = element.textContent.trim()
          console.log(`找到描述: ${description}`)
          break
        }
      }

      // 查找统计数据
      for (const selector of statsSelectors) {
        const element = document.querySelector(selector)
        if (element) {
          const text = element.textContent || ''
          console.log(`统计信息文本: ${text}`)
          
          const followerMatch = text.match(/关注者\s*(\d+)/)
          const followingMatch = text.match(/关注\s*(\d+)/)
          const articleMatch = text.match(/文章\s*(\d+)/)
          const wordMatch = text.match(/字数\s*(\d+)/)
          
          if (followerMatch) followers = parseInt(followerMatch[1])
          if (followingMatch) following = parseInt(followingMatch[1])
          if (articleMatch) articles = parseInt(articleMatch[1])
          if (wordMatch) words = parseInt(wordMatch[1])
          
          console.log(`统计数据: 关注者=${followers}, 关注=${following}, 文章=${articles}, 字数=${words}`)
          break
        }
      }

      return { name, avatar, description, followers, following, articles, words }
    })

    console.log('用户信息提取完成:', userInfo)

    return {
      uid,
      ...userInfo
    }

  } catch (error) {
    console.error('爬取简书用户信息失败:', error)
    return null
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

// 爬取简书用户文章列表
async function scrapeUserArticles(uid: string, maxArticles: number = 6): Promise<JianshuArticle[]> {
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
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080'
      ]
    })

    const page = await browser.newPage()
    
    // 设置更真实的用户代理
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    // 设置视口
    await page.setViewport({ width: 1920, height: 1080 })
    
    // 设置额外的请求头
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    })
    
    // 访问用户文章页面
    const articlesUrl = `https://www.jianshu.com/u/${uid}`
    console.log(`访问简书文章页面: ${articlesUrl}`)
    await page.goto(articlesUrl, { waitUntil: 'networkidle2', timeout: 30000 })

    // 等待页面加载
    await new Promise(resolve => setTimeout(resolve, 8000))

    // 滚动页面以加载更多文章
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2)
    })
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 提取文章信息
    const articles = await page.evaluate((maxArticles) => {
      console.log('开始提取文章信息...')
      
      // 尝试多种可能的文章容器选择器
      const containerSelectors = [
        '.note-item',
        '.article-item',
        '.content-list .note-item',
        '.note-list .note-item',
        '[data-note-id]',
        '.list-item',
        '.note',
        '.article'
      ]
      
      let articleElements: NodeListOf<Element> | null = null
      
      for (const selector of containerSelectors) {
        articleElements = document.querySelectorAll(selector)
        if (articleElements.length > 0) {
          console.log(`找到文章元素，使用选择器: ${selector}, 数量: ${articleElements.length}`)
          break
        }
      }

      if (!articleElements || articleElements.length === 0) {
        console.log('未找到文章元素，尝试查找所有链接')
        // 如果找不到文章容器，尝试查找所有文章链接
        const allLinks = document.querySelectorAll('a[href*="/p/"]')
        console.log(`找到 ${allLinks.length} 个文章链接`)
        
        const articleList: any[] = []
        
        for (let i = 0; i < Math.min(allLinks.length, maxArticles); i++) {
          const link = allLinks[i] as HTMLAnchorElement
          const href = link.href
          const articleId = href.match(/\/p\/(\w+)/)?.[1] || ''
          
          if (articleId) {
            const titleElement = link.querySelector('img')?.alt || link.textContent?.trim()
            
            articleList.push({
              id: i + 1,
              title: titleElement || '未知标题',
              description: titleElement || '暂无描述',
              thumbnail: link.querySelector('img')?.src || 'https://via.placeholder.com/300x200',
              readTime: '5分钟',
              publishTime: '',
              externalUrl: href,
              platform: '简书',
              platformIcon: '📝',
              category: '文章',
              date: new Date().toISOString().split('T')[0],
              tags: ['文章'],
              excerpt: titleElement || '暂无描述',
              stats: {
                likes: 0,
                comments: 0,
                views: 0,
                rewards: 0
              }
            })
          }
        }
        
        console.log(`从链接中提取到 ${articleList.length} 篇文章`)
        return articleList
      }

      const articleList: any[] = []

      for (let i = 0; i < Math.min(articleElements.length, maxArticles); i++) {
        const element = articleElements[i]
        
        // 尝试多种可能的选择器
        const titleSelectors = ['.title', '.note-title', 'h3', 'h4', '.name', 'a']
        const thumbnailSelectors = ['.cover img', '.pic img', 'img', '.thumbnail img']
        const readTimeSelectors = ['.read-time', '.time', '.duration']
        const publishTimeSelectors = ['.time', '.date', '.publish-time']
        const linkSelectors = ['a', '.link']
        const statsSelectors = ['.meta', '.stats', '.article-stats']

        let title = '未知标题'
        let thumbnail = 'https://via.placeholder.com/300x200'
        let readTime = '5分钟'
        let publishTime = ''
        let href = ''
        let likes = 0
        let comments = 0
        let views = 0
        let rewards = 0

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

        // 查找阅读时间
        for (const selector of readTimeSelectors) {
          const element = document.querySelector(selector)
          if (element && element.textContent?.trim()) {
            readTime = element.textContent.trim()
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
          if (element && element.href && element.href.includes('/p/')) {
            href = element.href
            break
          }
        }

        // 查找统计数据
        for (const selector of statsSelectors) {
          const element = document.querySelector(selector)
          if (element) {
            const text = element.textContent || ''
            const likeMatch = text.match(/(\d+)\s*喜欢/)
            const commentMatch = text.match(/(\d+)\s*评论/)
            const viewMatch = text.match(/(\d+)\s*阅读/)
            const rewardMatch = text.match(/(\d+)\s*赞赏/)
            
            if (likeMatch) likes = parseInt(likeMatch[1])
            if (commentMatch) comments = parseInt(commentMatch[1])
            if (viewMatch) views = parseInt(viewMatch[1])
            if (rewardMatch) rewards = parseInt(rewardMatch[1])
            
            break
          }
        }

        if (href) {
          const articleId = href.match(/\/p\/(\w+)/)?.[1] || ''

          articleList.push({
            id: i + 1,
            title,
            description: title,
            thumbnail,
            readTime,
            publishTime,
            externalUrl: href,
            platform: '简书',
            platformIcon: '📝',
            category: '文章',
            date: new Date().toISOString().split('T')[0],
            tags: ['文章'],
            excerpt: title,
            stats: {
              likes,
              comments,
              views,
              rewards
            }
          })
        }
      }

      console.log(`从容器中提取到 ${articleList.length} 篇文章`)
      return articleList
    }, maxArticles)

    console.log(`总共提取到 ${articles.length} 篇文章`)
    return articles

  } catch (error) {
    console.error('爬取简书文章列表失败:', error)
    return []
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const uid = searchParams.get('uid') || '763ffbb1b873' // 默认简书用户ID
    const maxArticles = parseInt(searchParams.get('maxArticles') || '6')

    console.log(`开始爬取简书UID: ${uid} 的数据`)

    // 爬取用户信息
    const userInfo = await scrapeUserInfo(uid)
    if (!userInfo) {
      return NextResponse.json(
        { error: '无法获取用户信息，请检查UID是否正确' },
        { status: 500 }
      )
    }

    // 爬取文章列表
    const articles = await scrapeUserArticles(uid, maxArticles)
    
    console.log(`成功爬取到 ${articles.length} 篇文章`)

    return NextResponse.json({
      success: true,
      data: {
        user: userInfo,
        articles: articles,
        total: articles.length,
        page: 1,
        pageSize: maxArticles
      }
    })

  } catch (error) {
    console.error('简书爬虫API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
} 