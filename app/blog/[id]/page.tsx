'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import Link from 'next/link'

// 静态博客数据
const blogPosts = [
  {
    id: 1,
    title: '开始我的博客之旅',
    content: `# 开始我的博客之旅

这是我的第一篇博客文章，记录了我开始写博客的初衷和期望。

## 为什么开始写博客？

写博客对我来说有几个重要的意义：

1. **记录成长** - 通过文字记录自己的学习和思考过程
2. **分享知识** - 将学到的知识分享给更多的人
3. **提升表达** - 锻炼自己的写作和表达能力
4. **建立连接** - 与志同道合的朋友建立联系

## 我的期望

希望通过这个博客平台：

- 分享技术心得和经验
- 记录生活中的感悟
- 与读者进行有意义的交流
- 持续学习和成长

让我们一起开始这段美好的旅程吧！`,
    excerpt: '这是我的第一篇博客文章，记录了我开始写博客的初衷和期望。希望通过这个平台分享我的想法和经验。',
    category: '生活',
    imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
    date: '2024-01-15',
    readTime: '3 分钟',
    tags: ['博客', '生活']
  },
  {
    id: 2,
    title: 'React 开发最佳实践',
    content: `# React 开发最佳实践

分享一些在 React 开发中积累的经验和最佳实践。

## 组件设计原则

### 1. 单一职责原则
每个组件应该只负责一个功能，保持组件的简洁性。

### 2. 可复用性
设计组件时要考虑可复用性，避免过度耦合。

### 3. 性能优化
- 使用 React.memo 优化渲染
- 合理使用 useMemo 和 useCallback
- 避免不必要的重渲染

## 状态管理

### 使用 Context API
对于简单的状态管理，Context API 是一个不错的选择。

### 使用 Redux
对于复杂的状态管理，Redux 提供了强大的解决方案。

## 代码示例

\`\`\`jsx
import React, { useState, useCallback } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  
  const addTodo = useCallback((text) => {
    setTodos(prev => [...prev, { id: Date.now(), text }]);
  }, []);
  
  return (
    <div>
      {/* 组件内容 */}
    </div>
  );
};
\`\`\`

这些实践可以帮助我们写出更好的 React 代码。`,
    excerpt: '分享一些在 React 开发中积累的经验和最佳实践，包括组件设计、状态管理和性能优化等方面。',
    category: '技术',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    date: '2024-01-10',
    readTime: '8 分钟',
    tags: ['React', '前端', '最佳实践']
  },
  {
    id: 3,
    title: '我的学习方法和心得',
    content: `# 我的学习方法和心得

作为一个终身学习者，我想分享一些对我有帮助的学习方法和心得。

## 学习方法

### 1. 主动学习
不要被动地接受知识，要主动思考和提问。

### 2. 实践导向
理论结合实践，通过动手来加深理解。

### 3. 知识整理
定期整理和复习学到的知识，形成知识体系。

## 学习心得

> 学习是一个持续的过程，不要急于求成，要享受学习的过程。

### 时间管理
- 制定合理的学习计划
- 利用碎片时间学习
- 保持学习的连续性

### 心态调整
- 保持好奇心
- 接受失败和挫折
- 持续改进

希望这些方法能对大家有所启发！`,
    excerpt: '作为一个终身学习者，我想分享一些对我有帮助的学习方法和心得，希望能对大家有所启发。',
    category: '思考',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
    date: '2024-01-05',
    readTime: '5 分钟',
    tags: ['学习', '方法', '心得']
  }
]

// 渲染 Markdown 内容
const renderMarkdown = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary-600 hover:underline">$1</a>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded my-2" />')
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary-500 pl-4 my-2 italic text-gray-600">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold my-6">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold my-4">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold my-3">$1</h3>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4"><code>$2</code></pre>')
    .replace(/\n/g, '<br>')
}

export default function BlogPostPage() {
  const params = useParams()
  const postId = parseInt(params.id as string)
  const post = blogPosts.find(p => p.id === postId)

  if (!post) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">文章未找到</h1>
            <p className="text-xl text-gray-600 mb-8">
              抱歉，您访问的文章不存在。
            </p>
            <Link href="/blog" className="btn-primary">
              返回博客列表
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 文章头部 */}
          <header className="mb-8">
            <div className="mb-4">
              <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            <div className="flex items-center text-gray-600 mb-6">
              <time dateTime={post.date}>
                {format(new Date(post.date), 'yyyy年MM月dd日', { locale: zhCN })}
              </time>
              <span className="mx-2">•</span>
              <span>{post.readTime}</span>
            </div>
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
              />
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 文章内容 */}
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
          </div>

          {/* 文章底部 */}
          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                分类：<span className="text-primary-600">{post.category}</span>
              </div>
              <Link href="/blog" className="text-primary-600 hover:text-primary-700 transition-colors">
                ← 返回博客列表
              </Link>
            </div>
          </footer>
        </article>
      </main>
      <Footer />
    </div>
  )
} 