import { NextResponse } from 'next/server'

export async function GET() {
  // 直接从在线API获取数据，不再读取本地文件
  // 重定向到 jianshu-articles API
  try {
    const userId = '763ffbb1b873'
    const userUrl = `https://www.jianshu.com/u/${userId}`
    
    const response = await fetch(userUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.jianshu.com/',
        'Cache-Control': 'no-cache'
      },
      next: { revalidate: 1800 } // 缓存30分钟
    })

    if (response.ok) {
      const html = await response.text()
      
      // 简单的HTML解析提取文章
      const articles: any[] = []
      const titleLinkRegex = /<a[^>]*class="title"[^>]*href="\/p\/([^"]+)"[^>]*>([^<]+)<\/a>/g
      let match
      const seenSlugs = new Set<string>()
      
      while ((match = titleLinkRegex.exec(html)) !== null) {
        const slug = match[1]
        const title = match[2].trim()
        
        if (seenSlugs.has(slug)) continue
        seenSlugs.add(slug)
        
        articles.push({
          title,
          link: `https://www.jianshu.com/p/${slug}`,
          slug,
          published_at: new Date().toISOString(),
          fetched_at: new Date().toISOString(),
          user_id: userId
        })
      }
      
      if (articles.length > 0) {
        return NextResponse.json({
          success: true,
          data: {
            user_id: userId,
            total_articles: articles.length,
            fetched_at: new Date().toISOString(),
            articles: articles
          }
        })
      }
    }
    
    return NextResponse.json({
      success: false,
      error: '简书数据获取失败'
    })
  } catch (error) {
    console.error('获取简书数据失败:', error)
    return NextResponse.json({
      success: false,
      error: '获取简书数据失败'
    })
  }
} 