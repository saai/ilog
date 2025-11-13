import { NextResponse } from 'next/server'
import { initTables } from '@/lib/init-tables'

/**
 * 初始化 API - 在项目部署后运行一次所有爬虫
 * 可以手动调用或通过 Vercel Deployment Hook 自动触发
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const initSecret = process.env.INIT_SECRET || process.env.CRON_SECRET
  
  // 验证请求（如果设置了密钥）
  if (initSecret && authHeader !== `Bearer ${initSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 初始化数据库表
  try {
    console.log('[初始化] 开始初始化数据库表...')
    await initTables()
    console.log('[初始化] 数据库表初始化完成')
  } catch (error: any) {
    console.error('[初始化] 数据库表初始化失败:', error)
    return NextResponse.json({
      success: false,
      error: '数据库表初始化失败',
      details: error.message
    }, { status: 500 })
  }

  // 获取基础 URL
  let baseUrl = 'http://localhost:3000'
  
  if (process.env.VERCEL_URL) {
    baseUrl = `https://${process.env.VERCEL_URL}`
  } else if (process.env.NEXT_PUBLIC_BASE_URL) {
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  } else if (request.headers.get('host')) {
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    baseUrl = `${protocol}://${request.headers.get('host')}`
  }

  const crawlers = [
    { name: 'bilibili', path: '/api/cron/bilibili' },
    { name: 'jianshu', path: '/api/cron/jianshu' },
    { name: 'douban', path: '/api/cron/douban' },
    { name: 'youtube', path: '/api/cron/youtube' }
  ]

  const results: any[] = []

  // 依次运行所有爬虫
  for (const crawler of crawlers) {
    try {
      const url = `${baseUrl}${crawler.path}`
      console.log(`正在运行 ${crawler.name} 爬虫: ${url}`)
      
      // 获取 cron secret（优先使用 CRON_SECRET，如果没有则使用 INIT_SECRET）
      const cronSecret = process.env.CRON_SECRET || process.env.INIT_SECRET
      
      const response = await fetch(url, {
        headers: cronSecret ? {
          'Authorization': `Bearer ${cronSecret}`
        } : {},
        signal: AbortSignal.timeout(30000) // 30秒超时
      })

      // 检查响应内容类型
      const contentType = response.headers.get('content-type') || ''
      let data: any = null

      if (contentType.includes('application/json')) {
        // 如果是 JSON，直接解析
        data = await response.json()
      } else {
        // 如果不是 JSON，先读取文本内容
        const text = await response.text()
        console.error(`[初始化] ${crawler.name} 返回了非 JSON 响应:`, text.substring(0, 200))
        
        // 尝试解析为 JSON（可能包含错误信息）
        try {
          data = JSON.parse(text)
        } catch {
          // 如果无法解析，返回错误信息
          results.push({
            name: crawler.name,
            success: false,
            status: response.status,
            message: `返回了非 JSON 响应 (${response.status}): ${text.substring(0, 100)}`
          })
          continue
        }
      }
      
      results.push({
        name: crawler.name,
        success: response.ok && data?.success,
        status: response.status,
        message: data?.success ? '成功' : (data?.error || data?.message || '失败')
      })
    } catch (error: any) {
      console.error(`[初始化] ${crawler.name} 爬虫失败:`, error)
      results.push({
        name: crawler.name,
        success: false,
        status: 500,
        message: error.name === 'AbortError' ? '请求超时' : (error.message || '请求失败')
      })
    }
  }

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  return NextResponse.json({
    success: successCount === totalCount,
    message: `完成 ${successCount}/${totalCount} 个爬虫`,
    results,
    timestamp: new Date().toISOString()
  })
}

