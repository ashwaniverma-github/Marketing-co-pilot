import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b bg-card">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-sm">MC</span>
            </div>
            <span className="font-semibold text-foreground">Marketing Co-Pilot</span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button className="text-muted-foreground hover:text-foreground font-medium">Sign In</button>
            <a href="/dashboard" className="inline-block bg-foreground text-background px-4 py-2 rounded-lg hover:bg-foreground/90 font-medium">
              Start Free Trial
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground leading-tight mb-6">
            Your AI Marketing Teammate<br />
            <span className="text-foreground">That Never Sleeps</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Stop struggling with marketing your indie product. Get fresh, ready-to-use content 
            generated weekly: tweets, memes, emails, and growth tactics. All tailored to your product.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/dashboard" className="inline-block bg-foreground text-background px-8 py-4 rounded-lg hover:bg-foreground/90 font-semibold text-lg">
              Get Started Free
            </a>
            <button className="border border-border text-foreground px-8 py-4 rounded-lg hover:bg-muted font-semibold text-lg">
              See Example Kit
            </button>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 py-16 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stop Being Your Own Worst Marketing Enemy
            </h2>
            <p className="text-xl text-muted-foreground">
              You can build products. But marketing? That's where indie hackers struggle.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Time</h3>
              <p className="text-gray-600">
                You're already building features, fixing bugs, and talking to users. 
                When do you have time to create marketing content?
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Skills</h3>
              <p className="text-gray-600">
                Copywriting, meme creation, growth hacking... these aren't your strengths. 
                You're a builder, not a marketer.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Budget</h3>
              <p className="text-gray-600">
                Marketing agencies cost $5K+ per month. Freelancers are hit-or-miss. 
                You need something that actually works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Meet Your New Marketing Co-Pilot
            </h2>
            <p className="text-xl text-gray-600">
              Every week, get a complete marketing package delivered to your dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What You Get Every Week:</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">3-5 Social Posts</h4>
                    <p className="text-gray-600">Optimized for Twitter, LinkedIn, and Reddit</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">1-2 Viral Memes</h4>
                    <p className="text-gray-600">Auto-rendered with your product's branding</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">2-3 Email Snippets</h4>
                    <p className="text-gray-600">Newsletter-ready content for your audience</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
    <div>
                    <h4 className="font-semibold text-gray-900">Growth Tactics</h4>
                    <p className="text-gray-600">Actionable strategies you can try this week</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-xl p-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">📦 Your Weekly Kit</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Twitter Posts</span>
                    <span className="text-green-600">5 ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LinkedIn Content</span>
                    <span className="text-green-600">3 ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Memes Generated</span>
                    <span className="text-green-600">2 ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email Snippets</span>
                    <span className="text-green-600">3 ready</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Growth Ideas</span>
                    <span className="text-green-600">2 ready</span>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg mt-4 hover:bg-blue-700">
                  Approve & Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Set it up once, get content forever.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Add Your Product</h3>
              <p className="text-gray-600 text-sm">
                Just paste your product URL. We'll analyze everything automatically.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Generates Kit</h3>
              <p className="text-gray-600 text-sm">
                Our AI creates a complete weekly marketing package for your product.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Review & Approve</h3>
              <p className="text-gray-600 text-sm">
                Tweak anything you want, then approve with one click.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Auto-Schedule</h3>
              <p className="text-gray-600 text-sm">
                Content goes live automatically, or export to use anywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Stop Struggling. Start Growing.
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join indie hackers who are growing consistently without the marketing headache.
          </p>
          <a href="/dashboard" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg">
            Get Started Free
          </a>
          <p className="text-gray-500 mt-4">
            Free 7-day trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MC</span>
              </div>
              <span className="font-semibold text-gray-900">Marketing Co-Pilot</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2024 Marketing Co-Pilot. Built for indie hackers.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
