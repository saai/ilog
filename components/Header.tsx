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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link 
              href={currentLang === 'en' ? '/en' : '/'} 
              className="group flex items-center space-x-2"
            >
              <div className="relative">
                <div className="text-3xl font-display font-black bg-gradient-to-r from-primary-600 via-accent-500 to-primary-400 bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300">
                  Saai's ilog
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link 
              href={currentLang === 'en' ? '/en' : '/'} 
              className="text-foreground/70 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
            >
              {navText[currentLang].home}
            </Link>
            <Link 
              href={currentLang === 'en' ? '/en/timeline' : '/timeline'} 
              className="text-foreground/70 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
            >
              {navText[currentLang].timeline}
            </Link>
            <Link 
              href={currentLang === 'en' ? '/en/about' : '/about'} 
              className="text-foreground/70 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
            >
              {navText[currentLang].about}
            </Link>
            <Link 
              href={currentLang === 'en' ? '/en/contact' : '/contact'} 
              className="text-foreground/70 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
            >
              {navText[currentLang].contact}
            </Link>
            <LanguageSwitcher />
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground hover:text-primary p-2 rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle menu"
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
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background">
              <Link 
                href={currentLang === 'en' ? '/en' : '/'} 
                className="text-foreground/70 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent"
              >
                {navText[currentLang].home}
              </Link>
              <Link 
                href={currentLang === 'en' ? '/en/timeline' : '/timeline'} 
                className="text-foreground/70 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent"
              >
                {navText[currentLang].timeline}
              </Link>
              <Link 
                href={currentLang === 'en' ? '/en/about' : '/about'} 
                className="text-foreground/70 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent"
              >
                {navText[currentLang].about}
              </Link>
              <Link 
                href={currentLang === 'en' ? '/en/contact' : '/contact'} 
                className="text-foreground/70 hover:text-foreground block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-accent"
              >
                {navText[currentLang].contact}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 