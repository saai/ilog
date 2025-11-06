'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  // 获取当前语言
  const currentLang = pathname.startsWith('/en') ? 'en' : 'zh'
  
  // 生成对应语言的路径
  const getLanguagePath = (lang: string) => {
    if (lang === 'en') {
      // 英文路径
      if (pathname === '/') return '/en'
      if (pathname === '/timeline') return '/timeline'
      if (pathname === '/about') return '/en/about'
      if (pathname === '/contact') return '/en/contact'
      return '/en'
    } else {
      // 中文路径
      if (pathname === '/en') return '/'
      if (pathname === '/timeline') return '/timeline'
      if (pathname === '/en/about') return '/about'
      if (pathname === '/en/contact') return '/contact'
      return '/'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-neutral-700 hover:text-primary-500 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-primary-50"
      >
        <span>{currentLang === 'zh' ? '🇨🇳 中文' : '🇺🇸 English'}</span>
        <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white/90 backdrop-blur-md rounded-2xl shadow-artistic py-1 z-50 border border-primary-100">
          <Link
            href={getLanguagePath('zh')}
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-500 transition-all duration-300 rounded-lg mx-1"
            onClick={() => setIsOpen(false)}
          >
            🇨🇳 中文
          </Link>
          <Link
            href={getLanguagePath('en')}
            className="block px-4 py-2 text-sm text-neutral-700 hover:bg-primary-50 hover:text-primary-500 transition-all duration-300 rounded-lg mx-1"
            onClick={() => setIsOpen(false)}
          >
            🇺🇸 English
          </Link>
        </div>
      )}
    </div>
  )
} 