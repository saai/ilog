import Header from '@/components/Header'
import Footer from '@/components/Footer'
import JianshuScraperContent from '@/components/JianshuScraperContent'

export default function JianshuScraperPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">简书爬虫聚合</h1>
              <p className="text-xl text-gray-600">使用网页爬虫技术实时获取作者最新文章内容</p>
            </div>
          </div>
        </div>
        <JianshuScraperContent />
      </main>
      <Footer />
    </div>
  )
} 