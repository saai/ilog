import { NextResponse } from 'next/server'
import { getDoubanInterestsFromDB } from '@/lib/db-operations'
import { initTables } from '@/lib/init-tables'

// 强制动态生成
export const dynamic = 'force-dynamic'

/**
 * 豆瓣兴趣数据 API - 仅从数据库读取，用于前端展示
 */
export async function GET() {
  try {
    // 确保表已初始化
    await initTables()
    
    // 从数据库读取数据
    const interests = await getDoubanInterestsFromDB(30)
    
    if (interests.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          collections: [],
          interests: [],
          total: 0,
          user: {
            id: '284853052',
            nickname: 'Saai',
            name: 'Saai'
          }
        },
        message: '数据库中暂无数据'
      })
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
          id: '284853052',
          nickname: 'Saai',
          name: 'Saai' // 保持向后兼容
        },
        fetched_at: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('[Data API] 从数据库读取豆瓣数据失败:', error)
    return NextResponse.json({
      success: false,
      error: '从数据库读取豆瓣数据失败',
      details: error.message
    }, { status: 500 })
  }
}

