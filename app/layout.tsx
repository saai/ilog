import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Saai 的日志甲板',
  description: 'Saai 的个人数字世界，汇聚各平台创作内容的日志甲板',
  authors: [{ name: 'Saai' }],
  keywords: 'Saai, 日志甲板, 个人主页, 技术博客, 内容聚合, YouTube, 哔哩哔哩, 简书',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 