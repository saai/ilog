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

  // 使用数据 API 而不是 cron API，这样不需要认证，且会自动从数据库读取或获取数据
  const dataApis = [
    { name: 'bilibili', path: '/api/bilibili-videos' },
    { name: 'jianshu', path: '/api/jianshu-articles' },
    { name: 'douban', path: '/api/douban-rss' },
    { name: 'youtube', path: '/api/youtube-videos' }
  ]

  const results: any[] = []

  // 依次调用所有数据 API
  for (const api of dataApis) {
    try {
      const url = `${baseUrl}${api.path}`
      console.log(`[初始化] 正在获取 ${api.name} 数据: ${url}`)
      
      // 数据 API 不需要认证，直接调用
      const response = await fetch(url, {
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
        console.error(`[初始化] ${api.name} 返回了非 JSON 响应:`, text.substring(0, 200))
        
        // 尝试解析为 JSON（可能包含错误信息）
        try {
          data = JSON.parse(text)
        } catch {
          // 如果无法解析，返回错误信息
          results.push({
            name: api.name,
            success: false,
            status: response.status,
            message: `返回了非 JSON 响应 (${response.status}): ${text.substring(0, 100)}`
          })
          continue
        }
      }
      
      // 检查数据是否成功获取
      const hasData = data?.success && data?.data && (
        (api.name === 'bilibili' && data.data.videos?.length > 0) ||
        (api.name === 'jianshu' && data.data.articles?.length > 0) ||
        (api.name === 'douban' && (data.data.collections?.length > 0 || data.data.interests?.length > 0)) ||
        (api.name === 'youtube' && data.data.videos?.length > 0)
      )
      
      results.push({
        name: api.name,
        success: response.ok && data?.success && hasData,
        status: response.status,
        message: hasData 
          ? `成功获取 ${api.name === 'bilibili' ? data.data.videos?.length : 
                           api.name === 'jianshu' ? data.data.articles?.length :
                           api.name === 'douban' ? (data.data.collections?.length || data.data.interests?.length) :
                           data.data.videos?.length} 条数据` 
          : (data?.error || data?.message || '未获取到数据')
      })
    } catch (error: any) {
      console.error(`[初始化] ${api.name} 数据获取失败:`, error)
      results.push({
        name: api.name,
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
    message: `完成 ${successCount}/${totalCount} 个数据源`,
    results,
    timestamp: new Date().toISOString()
  })
}

