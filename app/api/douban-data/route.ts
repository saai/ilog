import { NextResponse } from 'next/server'

export async function GET() {
  // 豆瓣Spider已删除，所有数据现在通过豆瓣RSS获取（见 /api/douban-rss）
  return NextResponse.json({
    success: false,
    error: '豆瓣Spider已删除，请使用 /api/douban-rss 获取RSS数据'
  })
} 