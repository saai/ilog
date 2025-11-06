import Header from '@/components/Header'
import Footer from '@/components/Footer'
import BilibiliContent from '@/components/BilibiliContent'

export default function BilibiliPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">哔哩哔哩内容聚合</h1>
              <p className="text-xl text-gray-600">实时获取UP主最新视频内容</p>
            </div>
          </div>
        </div>
        <BilibiliContent />
      </main>
      <Footer />
    </div>
  )
} 