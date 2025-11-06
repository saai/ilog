'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BlogList from '@/components/BlogList'

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">所有内容</h1>
              <p className="text-xl text-gray-600">来自各大平台的最新优质内容</p>
            </div>
          </div>
        </div>
        <BlogList />
      </main>
      <Footer />
    </div>
  )
} 