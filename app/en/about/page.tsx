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
          </div>
          
          <div className="artistic-card p-8">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-display font-semibold text-neutral-800 mb-6">Hello, I'm Saai</h2>
              
              <p className="text-neutral-700 mb-6">
                Welcome to my digital profile! 
              </p>

              <p className="text-neutral-700 mb-6">
                Here you’ll find a collection of my work and thoughts across different platforms. Feel free to explore and follow my latest updates and journeys.
              </p>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">My Background</h3>
              <ul className="list-disc list-inside text-neutral-700 mb-6 space-y-2">
                <li>A “small-town exam kid” who grew up loving learning, and a woman with an engineering background;</li>
                <li>Worked as a programmer for several years, familiar with data mining, AI, Vibe Coding, and related technologies;</li>
                <li>Constantly in Gap Year, still exploring a balanced and self-aligned way of living.</li>
              </ul>
              
              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">My Thoughts</h3>
              <p className="text-neutral-700">
                I travel a lot, also do some reading, and I record my experiences and reflections on the platforms listed on my homepage. 
              </p>
              <p className="text-neutral-700"> 
                I believe technology can create a better life, and art can warm the heart. 
              </p>

              <h3 className="text-xl font-display font-semibold text-neutral-800 mb-4">Contact Me</h3>
              <p className="text-neutral-700">
                If you have any thoughts or suggestions about my content, feel free to reach out via email or social media. I’d be happy to connect with you!
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 