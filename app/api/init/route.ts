import { NextResponse } from 'next/server'

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
      console.log(`正在运行 ${crawler.name} 爬虫...`)
      
      const response = await fetch(url, {
        headers: initSecret ? {
          'Authorization': `Bearer ${initSecret}`
        } : {}
      })

      const data = await response.json()
      
      results.push({
        name: crawler.name,
        success: response.ok && data.success,
        status: response.status,
        message: data.success ? '成功' : data.error || '失败'
      })
    } catch (error: any) {
      results.push({
        name: crawler.name,
        success: false,
        status: 500,
        message: error.message || '请求失败'
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

