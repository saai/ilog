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
            <p className="text-xl text-neutral-600">了解我的故事和想法</p>
          </div>
          
          <div className="artistic-card p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-6">你好，我是Saai</h2>
              
              <p className="text-neutral-700 mb-6">
                欢迎来到我的数字世界！我是一名热爱技术和写作的开发者，喜欢分享我的学习心得、技术经验和生活感悟。
              </p>
              
              <p className="text-neutral-700 mb-6">
                这个日志甲板是我记录成长、分享知识的地方。我相信通过写作可以更好地整理思路，通过分享可以连接更多志同道合的朋友。
              </p>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">我的技能</h3>
              <ul className="list-disc list-inside text-neutral-700 mb-6 space-y-2">
                <li>前端开发：React, Vue, TypeScript</li>
                <li>后端开发：Node.js, Python, Java</li>
                <li>数据库：MySQL, MongoDB, Redis</li>
                <li>其他：Docker, Git, Linux</li>
              </ul>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">我的兴趣</h3>
              <p className="text-neutral-700 mb-6">
                除了编程，我还喜欢阅读、旅行和摄影。我相信技术可以让生活更美好，而艺术可以让技术更有温度。
              </p>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">联系我</h3>
              <p className="text-neutral-700">
                如果你对我的文章有任何想法或建议，欢迎通过邮件或社交媒体与我联系。我很乐意与你交流！
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 