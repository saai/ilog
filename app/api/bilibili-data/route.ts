import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // 读取B站爬虫生成的JSON文件
    const jsonPath = path.join(process.cwd(), 'bilibili-spider', 'bilibili_videos.json')
    
    if (!fs.existsSync(jsonPath)) {
      return NextResponse.json({
        success: false,
        error: 'B站数据文件不存在，请先运行爬虫'
      })
    }

    const jsonData = fs.readFileSync(jsonPath, 'utf-8')
    const data = JSON.parse(jsonData)

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('读取B站数据失败:', error)
    return NextResponse.json({
      success: false,
      error: '读取B站数据失败'
    })
  }
} 