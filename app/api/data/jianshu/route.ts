import { NextResponse } from 'next/server'
import { getJianshuArticlesFromDB } from '@/lib/db-operations'
import { initTables } from '@/lib/init-tables'

// 强制动态生成
export const dynamic = 'force-dynamic'

/**
 * 简书文章数据 API - 仅从数据库读取，用于前端展示
 */
export async function GET() {
  try {
    // 确保表已初始化
    await initTables()
    
    // 从数据库读取数据
    const articles = await getJianshuArticlesFromDB(30)
    
    if (articles.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          articles: [],
          total: 0,
          user: {
            id: '763ffbb1b873',
            nickname: 'Saai'
          }
        },
        message: '数据库中暂无数据'
      })
    }
    
    // 格式化日期
    const formattedArticles = articles.map(article => ({
      ...article,
      formattedDate: formatDate(article.published_at || article.published || new Date().toISOString())
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        articles: formattedArticles,
        total: formattedArticles.length,
        user: {
          id: '763ffbb1b873',
          nickname: formattedArticles[0]?.author || 'Saai'
        }
      }
    })
  } catch (error: any) {
    console.error('[Data API] 从数据库读取简书数据失败:', error)
    return NextResponse.json({
      success: false,
      error: '从数据库读取简书数据失败',
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

