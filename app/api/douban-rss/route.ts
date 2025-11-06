import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  // 尝试多个可能的JSON文件路径
  const possiblePaths = [
    path.join(process.cwd(), 'douban_rss_data.json'),
    path.join(process.cwd(), 'douban-rss-fetcher', 'douban_rss_data.json'),
    path.join(process.cwd(), 'douban-rss.json')
  ]
  
  for (const jsonPath of possiblePaths) {
    try {
      if (fs.existsSync(jsonPath)) {
        const jsonData = fs.readFileSync(jsonPath, 'utf-8')
        const data = JSON.parse(jsonData)
        return NextResponse.json({ success: true, data })
      }
    } catch (error) {
      console.error(`读取文件失败 ${jsonPath}:`, error)
    }
  }
  
  // 如果所有文件都不存在，返回错误
  return NextResponse.json({ 
    success: false, 
    error: '豆瓣RSS数据文件不存在，请先运行Python抓取脚本',
    details: '请运行: cd douban-rss-fetcher && python3 fetch_douban_rss.py'
  })
} 