'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  
  // 获取当前语言
  const currentLang = pathname.startsWith('/en') ? 'en' : 'zh'
  
  // 根据语言获取文本
  const footerText = {
    zh: {
      brandName: 'Saai\'s iLog',
      description: '欢迎来到我的数字世界，这里是我在各个平台的创作集合。希望通过分享连接世界，记录成长轨迹。',
      quickLinks: '快速链接',
      home: '首页',
      timeline: '时间流',
      about: '关于',
      contact: '联系',
      categories: '分类',
      tech: '技术',
      life: '生活',
      thoughts: '思考',
      copyright: '© 2024 Saai\'s iLog. 保留所有权利.'
    },
    en: {
      brandName: 'Saai\'s iLog',
      description: 'Welcome to my digital world, where I collect content from various platforms. Hope to connect the world through sharing and record growth trajectory.',
      quickLinks: 'Quick Links',
      home: 'Home',
      timeline: 'Timeline',
      about: 'About',
      contact: 'Contact',
      categories: 'Categories',
      tech: 'Tech',
      life: 'Life',
      thoughts: 'Thoughts',
      copyright: '© 2024 Saai\'s iLog. All rights reserved.'
    }
  }

  return (
    <footer className="artistic-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-display font-bold bg-artistic-gradient bg-clip-text text-transparent mb-4">
              {footerText[currentLang].brandName}
            </h3>
            <p className="text-neutral-300 mb-4 leading-relaxed">
              {footerText[currentLang].description}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-all duration-300 p-2 rounded-xl hover:bg-white/10">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                </svg>
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-400 transition-all duration-300 p-2 rounded-xl hover:bg-white/10">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-white">{footerText[currentLang].quickLinks}</h4>
            <ul className="space-y-2">
              <li>
                <Link href={currentLang === 'en' ? '/en' : '/'} className="text-neutral-300 hover:text-primary-400 transition-all duration-300 hover:translate-x-1 block">
                  {footerText[currentLang].home}
                </Link>
              </li>
              <li>
                <Link href="/timeline" className="text-neutral-300 hover:text-primary-400 transition-all duration-300 hover:translate-x-1 block">
                  {footerText[currentLang].timeline}
                </Link>
              </li>
              <li>
                <Link href={currentLang === 'en' ? '/en/about' : '/about'} className="text-neutral-300 hover:text-primary-400 transition-all duration-300 hover:translate-x-1 block">
                  {footerText[currentLang].about}
                </Link>
              </li>
              <li>
                <Link href={currentLang === 'en' ? '/en/contact' : '/contact'} className="text-neutral-300 hover:text-primary-400 transition-all duration-300 hover:translate-x-1 block">
                  {footerText[currentLang].contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-display font-semibold mb-4 text-white">{footerText[currentLang].categories}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/category/tech" className="text-neutral-300 hover:text-primary-400 transition-all duration-300 hover:translate-x-1 block">
                  {footerText[currentLang].tech}
                </Link>
              </li>
              <li>
                <Link href="/category/life" className="text-neutral-300 hover:text-primary-400 transition-all duration-300 hover:translate-x-1 block">
                  {footerText[currentLang].life}
                </Link>
              </li>
              <li>
                <Link href="/category/thoughts" className="text-neutral-300 hover:text-primary-400 transition-all duration-300 hover:translate-x-1 block">
                  {footerText[currentLang].thoughts}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-8 pt-8 text-center">
          <p className="text-neutral-400">{footerText[currentLang].copyright}</p>
        </div>
      </div>
    </footer>
  )
} 