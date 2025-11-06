'use client'

import { useState, useEffect } from 'react'

export default function TestDataPage() {
  const [doubanData, setDoubanData] = useState<any>(null)
  const [bilibiliData, setBilibiliData] = useState<any>(null)
  const [jianshuData, setJianshuData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 获取豆瓣数据
        const doubanRes = await fetch('/api/douban-data')
        const doubanResult = await doubanRes.json()
        setDoubanData(doubanResult)
        
        // 获取B站数据
        const bilibiliRes = await fetch('/api/bilibili-data')
        const bilibiliResult = await bilibiliRes.json()
        setBilibiliData(bilibiliResult)
        
        // 获取简书数据
        const jianshuRes = await fetch('/api/jianshu-data')
        const jianshuResult = await jianshuRes.json()
        setJianshuData(jianshuResult)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误')
        console.error('数据获取错误:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8">正在加载数据...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">错误: {error}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">数据测试页面</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">豆瓣数据</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(doubanData, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">B站数据</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(bilibiliData, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">简书数据</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(jianshuData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 