import { NextResponse } from 'next/server'
import { parseStringPromise } from 'xml2js'
import { getDoubanInterestsFromDB, saveDoubanInterestsToDB } from '@/lib/db-operations'
import { initTables } from '@/lib/init-tables'

// 强制动态生成
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 确保表已初始化
    await initTables()
    
    // 从数据库读取数据
    const interests = await getDoubanInterestsFromDB(30)
    
    if (interests.length > 0) {
      // 转换为 timeline 期望的格式
      const collections = interests.map((item: any) => ({
        title: item.title,
        url: item.url,
        type: item.type,
        rating: item.rating,
        author: '', // RSS 中没有作者信息
        published: item.published || item.published_at || item.created_at,
        formattedDate: '', // 将在 timeline 中格式化
        description: item.description
      }))
      
      return NextResponse.json({
        success: true,
        data: {
          collections,
          interests, // 保持向后兼容
          total: collections.length,
          user: {
            id: '284853052',
            nickname: 'Saai',
            name: 'Saai' // 保持向后兼容
          },
          fetched_at: new Date().toISOString()
        }
      })
    }
    
    // 如果数据库中没有数据，尝试从在线API获取（作为后备方案）
    console.log('[豆瓣RSS] 数据库中无数据，尝试从在线API获取...')
  } catch (error: any) {
    console.error('[豆瓣RSS] 从数据库读取失败:', error)
    // 继续尝试从在线API获取
  }
  
  // 从在线API获取数据（作为后备方案）
  try {
    const userId = '284853052'
    const rssUrl = `https://www.douban.com/feed/people/${userId}/interests`
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      next: { revalidate: 1800 } // 缓存30分钟
    })

    if (response.ok) {
      const xmlText = await response.text()
      const parsed = await parseStringPromise(xmlText)
      
      const channel = parsed.rss?.channel?.[0]
      if (channel) {
        const items = channel.item || []
        const interests = items
          .map((item: any) => {
            const title = item.title?.[0] || ''
            const link = item.link?.[0] || ''
            const pubDate = item.pubDate?.[0] || new Date().toISOString()
            const description = item.description?.[0] || ''
            
            let type = 'interest'
            let rating = ''
            const typeMatch = description.match(/类型[：:]\s*([^<]+)/)
            const ratingMatch = description.match(/评分[：:]\s*([^<]+)/)
            
            if (typeMatch) {
              type = typeMatch[1].trim()
            }
            if (ratingMatch) {
              rating = ratingMatch[1].trim()
            }

            return {
              title,
              url: link,
              type,
              rating,
              description,
              published_at: pubDate,
              published: pubDate,
              created_at: pubDate
            }
          })
          // 按发布时间倒序排序（最新的在前）
          .sort((a: any, b: any) => {
            const dateA = new Date(a.published_at || a.published || a.created_at).getTime()
            const dateB = new Date(b.published_at || b.published || b.created_at).getTime()
            return dateB - dateA
          })

        // 保存到数据库
        try {
          await saveDoubanInterestsToDB(interests)
          console.log('[豆瓣RSS] 数据已保存到数据库')
        } catch (dbError: any) {
          console.error('[豆瓣RSS] 保存到数据库失败:', dbError)
          // 继续返回数据，即使保存失败
        }

        // 转换为 timeline 期望的格式
        const collections = interests.map((item: any) => ({
          title: item.title,
          url: item.url,
          type: item.type,
          rating: item.rating,
          author: '', // RSS 中没有作者信息
          published: item.published || item.published_at || item.created_at,
          formattedDate: '', // 将在 timeline 中格式化
          description: item.description
        }))

        return NextResponse.json({
          success: true,
          data: {
            collections,
            interests, // 保持向后兼容
            total: collections.length,
            user: {
              id: userId,
              nickname: channel.title?.[0] || 'Saai',
              name: channel.title?.[0] || 'Saai' // 保持向后兼容
            },
            fetched_at: new Date().toISOString()
          }
        })
      }
    }
  } catch (error) {
    console.error('[豆瓣RSS] RSS获取失败:', error)
  }
  
  // 如果所有方法都失败，返回错误
  return NextResponse.json({ 
    success: false, 
    error: '豆瓣RSS数据获取失败',
    details: '请检查网络连接或稍后重试'
  }, { status: 500 })
} 