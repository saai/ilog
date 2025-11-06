import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-artistic-gradient-light">
      {/* Decorative elements */}
      <div className="artistic-decoration top-20 left-10"></div>
      <div className="artistic-decoration bottom-20 right-10"></div>
      
      <Header />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-display font-bold text-neutral-800 mb-4">About Me</h1>
            <p className="text-xl text-neutral-600">Learn about my story and thoughts</p>
          </div>
          
          <div className="artistic-card p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-6">Hello, I'm Saai</h2>
              
              <p className="text-neutral-700 mb-6">
                Welcome to my digital world! I'm a developer who loves technology and writing, and I enjoy sharing my learning experiences, technical insights, and life reflections.
              </p>
              
              <p className="text-neutral-700 mb-6">
                This log deck is where I record my growth and share knowledge. I believe that writing helps organize thoughts better, and sharing connects me with like-minded friends.
              </p>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">My Skills</h3>
              <ul className="list-disc list-inside text-neutral-700 mb-6 space-y-2">
                <li>Frontend Development: React, Vue, TypeScript</li>
                <li>Backend Development: Node.js, Python, Java</li>
                <li>Databases: MySQL, MongoDB, Redis</li>
                <li>Others: Docker, Git, Linux</li>
              </ul>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">My Interests</h3>
              <p className="text-neutral-700 mb-6">
                Besides programming, I also enjoy reading, traveling, and photography. I believe technology can make life better, and art can make technology more warm.
              </p>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">Contact Me</h3>
              <p className="text-neutral-700">
                If you have any thoughts or suggestions about my articles, feel free to contact me via email or social media. I'd love to chat with you!
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 