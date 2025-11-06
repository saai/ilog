'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // 获取当前语言
  const currentLang = pathname.startsWith('/en') ? 'en' : 'zh'
  
  // 根据语言获取导航文本
  const navText = {
    zh: {
      home: '首页',
      timeline: '时间流',
      about: '关于',
      contact: '联系'
    },
    en: {
      home: 'Home',
      timeline: 'Timeline',
      about: 'About',
      contact: 'Contact'
    }
  }

  return (
    <header className="artistic-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href={currentLang === 'en' ? '/en' : '/'} 
              className="group flex items-center space-x-2"
            >
              <div className="relative">
                <div className="text-4xl font-display font-black bg-gradient-to-r from-primary-600 via-accent-500 to-primary-400 bg-clip-text text-transparent group-hover:scale-110 transition-all duration-500 group-hover:drop-shadow-lg">
                  Saai's ilog
                </div>
                <div className="absolute -inset-2 bg-gradient-to-r from-primary-500/30 via-accent-400/30 to-primary-300/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-400/20 to-accent-300/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href={currentLang === 'en' ? '/en' : '/'} className="text-neutral-700 hover:text-primary-500 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-primary-50">
              {navText[currentLang].home}
            </Link>
            <Link href="/timeline" className="text-neutral-700 hover:text-primary-500 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-primary-50">
              {navText[currentLang].timeline}
            </Link>
            <Link href={currentLang === 'en' ? '/en/about' : '/about'} className="text-neutral-700 hover:text-primary-500 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-primary-50">
              {navText[currentLang].about}
            </Link>
            <Link href={currentLang === 'en' ? '/en/contact' : '/contact'} className="text-neutral-700 hover:text-primary-500 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-primary-50">
              {navText[currentLang].contact}
            </Link>
            <LanguageSwitcher />
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-700 hover:text-primary-500 focus:outline-none focus:text-primary-500 p-2 rounded-xl hover:bg-primary-50 transition-all duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/80 backdrop-blur-md border-t border-primary-100 rounded-b-2xl">
              <Link href={currentLang === 'en' ? '/en' : '/'} className="text-neutral-700 hover:text-primary-500 block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 hover:bg-primary-50">
                {navText[currentLang].home}
              </Link>
              <Link href="/timeline" className="text-neutral-700 hover:text-primary-500 block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 hover:bg-primary-50">
                {navText[currentLang].timeline}
              </Link>
              <Link href={currentLang === 'en' ? '/en/about' : '/about'} className="text-neutral-700 hover:text-primary-500 block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 hover:bg-primary-50">
                {navText[currentLang].about}
              </Link>
              <Link href={currentLang === 'en' ? '/en/contact' : '/contact'} className="text-neutral-700 hover:text-primary-500 block px-3 py-2 rounded-xl text-base font-medium transition-all duration-300 hover:bg-primary-50">
                {navText[currentLang].contact}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 