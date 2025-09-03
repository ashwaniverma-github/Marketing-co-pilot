import { ThemeToggle } from '@/components/theme-toggle';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-6 py-4 bg-background/80 backdrop-blur-md z-50  border-border">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-orange-500 text-2xl">🔥</span>
            </div>
            <span className="font-bold text-foreground text-xl">LaunchStudio</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground">Features</a>
            <a href="#pricing" className="text-muted-foreground font-semibold hover:text-foreground">Pricing</a>
            
            <div className="ml-4">
              <ThemeToggle />
            </div>
            <a href="/dashboard" className="inline-block bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 font-semibold">
              Get Started for Free
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen px-6 flex items-center justify-center relative overflow-hidden pt-24">
        <div className="max-w-4xl mx-auto text-center ">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6 max-w-3xl mx-auto">
            Built for indie hackers to grow their app <br />
            <span className="text-orange-500">On X</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Our AI understands your app and your audience, and generates fresh content for you to post on X.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="bg-cyan-900 text-white px-8 py-4 rounded-full  font-semibold text-lg flex items-center">
              Get Started for Free
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Inspiration for your X content
            </h2>
            <p className="text-xl text-muted-foreground">
              Get AI-powered content suggestions tailored to your audience and brand.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background border border-border rounded-lg p-6 hover:border-foreground/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">My Post Queue</h3>
              <p className="text-muted-foreground">
                Organize and schedule your content in advance with our intuitive post queue system.
              </p>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-6 hover:border-foreground/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Inspiration</h3>
              <p className="text-muted-foreground">
                Get AI-generated tweet suggestions tailored to your profile and audience preferences.
              </p>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-6 hover:border-foreground/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Library</h3>
              <p className="text-muted-foreground">
                Access a comprehensive library of content templates and ideas to boost your social presence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Today's Tweet Suggestions */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Today's tweet suggestions
            </h2>
            <p className="text-xl text-muted-foreground">
              Custom-generated tweets tailored to your profile that you can use an inspiration or post directly
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-background border border-border rounded-lg p-6 hover:border-foreground/30 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
            <div>
                  <p className="font-semibold text-foreground">User Name</p>
                  <p className="text-sm text-muted-foreground">@username · 3m ago</p>
                </div>
              </div>
              <p className="text-foreground mb-4">
                LaunchStudio builds a ready-to-publish wall of content for you, every single day
              </p>
              <p className="text-foreground">Try it to see how great your content will be.</p>
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90">
                  Use Tweet
                </button>
              </div>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-6 hover:border-foreground/30 transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                <div>
                  <p className="font-semibold text-foreground">User Name</p>
                  <p className="text-sm text-muted-foreground">@username · 3m ago</p>
                </div>
              </div>
              <p className="text-foreground mb-4">
                LaunchStudio finds and generates relevant memes based on what you usually talk about.
              </p>
              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-foreground text-background rounded-md hover:bg-foreground/90">
                  Use Tweet
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <button className="px-6 py-3 border border-border text-foreground rounded-md hover:bg-muted/50 font-medium">
              View More Suggestions
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                All the tools you need
            </h2>
              <p className="text-xl text-muted-foreground">
                Grow your audience with these powerful features
              </p>
            </div>
            <div>
              <button className="px-6 py-3 border border-border text-foreground rounded-md hover:bg-muted/50 font-medium">
                View All Features
              </button>
            </div>
            </div>
            
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background border border-border rounded-lg p-6 hover:border-foreground/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Analytics</h3>
              <p className="text-muted-foreground text-sm">
                Track your growth and understand what content performs best with your audience.
              </p>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-6 hover:border-foreground/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Content Studio</h3>
              <p className="text-muted-foreground text-sm">
                Create, schedule, and publish content directly from our unified dashboard.
              </p>
            </div>
            
            <div className="bg-background border border-border rounded-lg p-6 hover:border-foreground/30 transition-all">
              <div className="w-12 h-12 flex items-center justify-center mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Social Hub</h3>
              <p className="text-muted-foreground text-sm">
                Connect all your social accounts in one place for seamless management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Ready to grow your X presence?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of creators who are growing consistently with actionable data and AI-powered content.
          </p>
          <a href="/dashboard" className="inline-block bg-foreground text-background px-8 py-4 rounded-lg hover:bg-foreground/90 font-semibold text-lg">
            Get Started For Free <span className="ml-1">→</span>
          </a>
          <p className="text-muted-foreground mt-4">
            No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 flex items-center justify-center">
                <span className="text-orange-500 text-2xl">🔥</span>
              </div>
              <span className="font-bold text-foreground">LaunchStudio</span>
            </div>
            <div className="text-muted-foreground text-sm">
              © 2024 LaunchStudio. Built for creators and makers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
