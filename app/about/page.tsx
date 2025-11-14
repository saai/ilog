import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-background to-accent-50/50">
      {/* 装饰元素 */}
      <div className="artistic-decoration top-20 left-10"></div>
      <div className="artistic-decoration bottom-20 right-10"></div>
      
      <Header />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              关于我
            </h1>
          </div>
          
          <Card className="shadow-lg border-2 border-primary/10 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className="text-3xl font-display font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                你好，我是 Saai
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-foreground">
              <p className="text-lg leading-relaxed text-muted-foreground">
                欢迎查看我的数字名片！
              </p>

              <p className="text-base leading-relaxed">
                这里汇集了我在各大平台的创作与思考，你可以从这里跳转到不同平台，关注我的最新动态与探索。
              </p>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-xl font-display font-semibold mb-4 text-foreground">我的经历</h3>
                <ul className="list-disc list-inside space-y-3 text-muted-foreground">
                  <li className="leading-relaxed">小镇做题家，工科女生；</li>
                  <li className="leading-relaxed">做过几年程序员，熟悉数据挖掘，AI，Vibe Coding等相关技术；</li>
                  <li className="leading-relaxed">Gap Year 中，现在依然在探索平衡自洽的生活方式。</li>
                </ul>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-xl font-display font-semibold mb-4 text-foreground">我的感受</h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  旅行、读书，会把见闻感受放在首页的那些平台里，作为人生记录。我相信科学技术可以创造更美好的生活，艺术可以温暖人心。
                </p>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-xl font-display font-semibold mb-4 text-foreground">联系我</h3>
                <p className="text-base leading-relaxed text-muted-foreground">
                  如果你对我的内容有任何想法或建议，欢迎通过邮件或社交媒体与我联系。我很乐意与你交流！
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 