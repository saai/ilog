'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

// 内容聚合数据
const contentItems = [
  {
    id: 1,
    title: 'React 18 新特性深度解析',
    excerpt: '详细介绍了 React 18 中的并发特性、自动批处理、Suspense 等新功能，以及如何在实际项目中应用这些特性。',
    platform: 'YouTube',
    platformIcon: '🎥',
    category: '技术',
    date: '2024-01-15',
    readTime: '15 分钟',
    tags: ['React', '前端', 'JavaScript'],
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    externalUrl: 'https://www.youtube.com/watch?v=example1'
  },
  {
    id: 2,
    title: 'TypeScript 高级类型技巧',
    excerpt: '分享一些 TypeScript 高级类型的使用技巧，包括条件类型、映射类型、模板字面量类型等，提升代码的类型安全性。',
    platform: '哔哩哔哩',
    platformIcon: '📺',
    category: '技术',
    date: '2024-01-12',
    readTime: '12 分钟',
    tags: ['TypeScript', '前端', '类型系统'],
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=250&fit=crop',
    externalUrl: 'https://www.bilibili.com/video/example2'
  },
  {
    id: 3,
    title: '产品经理的思维模式',
    excerpt: '探讨优秀产品经理应该具备的思维模式，包括用户思维、数据思维、商业思维等，帮助产品经理更好地开展工作。',
    platform: '微信公众号',
    platformIcon: '📱',
    category: '产品',
    date: '2024-01-10',
    readTime: '8 分钟',
    tags: ['产品', '思维', '管理'],
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    externalUrl: 'https://mp.weixin.qq.com/s/example3'
  },
  {
    id: 4,
    title: 'Node.js 性能优化实战',
    excerpt: '通过实际案例介绍 Node.js 应用的性能优化技巧，包括内存管理、异步处理、缓存策略等方面的最佳实践。',
    platform: 'YouTube',
    platformIcon: '🎥',
    category: '技术',
    date: '2024-01-08',
    readTime: '20 分钟',
    tags: ['Node.js', '性能优化', '后端'],
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
    externalUrl: 'https://www.youtube.com/watch?v=example4'
  },
  {
    id: 5,
    title: '设计系统的构建与实践',
    excerpt: '分享如何从零开始构建一个完整的设计系统，包括设计原则、组件库、文档体系等，提升团队的设计效率。',
    platform: '哔哩哔哩',
    platformIcon: '📺',
    category: '设计',
    date: '2024-01-05',
    readTime: '18 分钟',
    tags: ['设计系统', 'UI/UX', '组件库'],
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    externalUrl: 'https://www.bilibili.com/video/example5'
  },
  {
    id: 6,
    title: '创业公司的技术选型策略',
    excerpt: '从创业公司的角度分析技术选型的考虑因素，包括技术成熟度、团队能力、成本控制等，帮助创业者做出明智的技术决策。',
    platform: '微信公众号',
    platformIcon: '📱',
    category: '创业',
    date: '2024-01-03',
    readTime: '10 分钟',
    tags: ['创业', '技术选型', '策略'],
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop',
    externalUrl: 'https://mp.weixin.qq.com/s/example6'
  },
  {
    id: 7,
    title: '写作技巧：如何写出吸引人的技术文章',
    excerpt: '分享多年写作经验，从选题、结构、语言表达等方面详细介绍如何写出高质量的技术文章，提升写作能力。',
    platform: '简书',
    platformIcon: '📝',
    category: '写作',
    date: '2024-01-14',
    readTime: '12 分钟',
    tags: ['写作', '技巧', '技术文章'],
    thumbnail: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop',
    externalUrl: 'https://www.jianshu.com/p/example7'
  },
  {
    id: 8,
    title: '程序员的时间管理之道',
    excerpt: '探讨程序员如何更好地管理时间，包括任务优先级、专注工作、休息调整等，提高工作效率和生活质量。',
    platform: '简书',
    platformIcon: '📝',
    category: '效率',
    date: '2024-01-11',
    readTime: '10 分钟',
    tags: ['时间管理', '效率', '程序员'],
    thumbnail: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=400&h=250&fit=crop',
    externalUrl: 'https://www.jianshu.com/p/example8'
  },
  {
    id: 9,
    title: '前端工程化的最佳实践',
    excerpt: '详细介绍前端工程化的各个方面，包括构建工具、代码规范、自动化测试、部署流程等，提升开发效率。',
    platform: '简书',
    platformIcon: '📝',
    category: '技术',
    date: '2024-01-09',
    readTime: '15 分钟',
    tags: ['前端', '工程化', '最佳实践'],
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
    externalUrl: 'https://www.jianshu.com/p/example9'
  }
]

// 平台颜色映射
const platformColors = {
  'YouTube': 'bg-red-100 text-red-800',
  '哔哩哔哩': 'bg-pink-100 text-pink-800',
  '微信公众号': 'bg-green-100 text-green-800',
  '简书': 'bg-orange-100 text-orange-800'
}

export default function BlogList() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">精选内容</h2>
          <p className="text-lg text-gray-600">来自各大平台的最新优质内容</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contentItems.map((item) => (
            <article key={item.id} className="card group">
              {/* 缩略图 */}
              <div className="mb-4 relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${platformColors[item.platform as keyof typeof platformColors]}`}>
                    {item.platformIcon} {item.platform}
                  </span>
                </div>
              </div>
              
              {/* 分类标签 */}
              <div className="mb-4">
                <span className="inline-block bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {item.category}
                </span>
              </div>
              
              {/* 标题 */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {item.title}
                </a>
              </h3>
              
              {/* 摘要 */}
              <p className="text-gray-600 mb-4 line-clamp-3">
                {item.excerpt}
              </p>
              
              {/* 标签 */}
              {item.tags && item.tags.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* 底部信息 */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <time dateTime={item.date}>
                  {format(new Date(item.date), 'yyyy年MM月dd日', { locale: zhCN })}
                </time>
                <span>{item.readTime}</span>
              </div>
              
              {/* 外部链接按钮 */}
              <div className="mt-4">
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                >
                  查看原文
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </article>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link href="/blog" className="btn-primary">
            查看所有内容
          </Link>
        </div>
      </div>
    </section>
  )
} 