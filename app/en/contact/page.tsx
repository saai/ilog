import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Mail, MapPin, Github } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50/50 via-background to-accent-50/50">
      {/* Decorative elements */}
      <div className="artistic-decoration top-20 left-10"></div>
      <div className="artistic-decoration bottom-20 right-10"></div>
      
      <Header />
      
      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl font-display font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Contact Me
            </h1>
            <p className="text-muted-foreground text-lg">Let's exchange ideas together</p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-lg border-2 border-primary/10 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="text-2xl font-display font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <a 
                    href="mailto:saaialive@gmail.com" 
                    className="text-foreground hover:text-primary transition-colors font-medium"
                  >
                    saaialive@gmail.com
                  </a>
                </div>
                
                <Separator />
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 mt-1">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-foreground space-y-2">
                    <div className="font-medium">Beijing, China</div>
                    <div className="text-muted-foreground">Silicon Valley, USA</div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-display font-semibold mb-4 text-foreground">Social Media</h3>
                  <div className="flex space-x-4">
                    <a 
                      href="https://github.com/saai" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors group"
                      aria-label="GitHub"
                    >
                      <Github className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
} 