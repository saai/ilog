import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-artistic-gradient-light">
      {/* 装饰元素 */}
      <div className="artistic-decoration top-20 left-10"></div>
      <div className="artistic-decoration bottom-20 right-10"></div>
      
      <Header />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-neutral-800 mb-4">关于我</h1>
            
          </div>
          
          <div className="artistic-card p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-6">你好，我是Saai</h2>
              
              <p className="text-neutral-700 mb-6">
                欢迎查看我的数字名片！
              </p>

              <p className="text-neutral-700 mb-6">
                这里汇集了我在各大平台的创作与思考，你可以从这里跳转到不同平台，关注我的最新动态与探索。
              </p>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">我的经历</h3>
              <ul className="list-disc list-inside text-neutral-700 mb-6 space-y-2">
                <li>小镇做题家，工科女生；</li>
                <li>做过几年程序员，熟悉数据挖掘，AI，Vibe Coding等相关技术；</li>
                <li>Gap Year 中，现在依然在探索平衡自洽的生活方式。</li>
              </ul>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">我的感受</h3>
              <p className="text-neutral-700 mb-6">
                旅行、读书，会把见闻感受放在首页的那些平台里，作为人生记录。我相信科学技术可以创造更美好的生活，艺术可以温暖人心。
              </p>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">联系我</h3>
              <p className="text-neutral-700">
                如果你对我的内容有任何想法或建议，欢迎通过邮件或社交媒体与我联系。我很乐意与你交流！
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 