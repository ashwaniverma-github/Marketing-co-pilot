'use client'
import { useEffect } from "react"
import { useState } from "react";

export default function FeatureSection(){
    const [activeFeature, setActiveFeature] = useState(0);
    const [progress, setProgress] = useState(0);

    // Typing effect for feature descriptions
    const featureDescriptions = [
        "Chat with our AI to get ideas for your next post or feature request for your app. Tweet mode to write precise and focused tweets for your app.",
        "Create new post or access your posts saved in draft, published and manage them with one click.",
        "Edit your posts with one click with AI powered editor. You can also apply custom edits to your posts.",
        "Get rewarded for your progress with our gamified progress tracker. Track your Post habits, build streaks and earn rewards.",
        "Edit or add new information to your knowledge base to help AI understand your app and grow."
    ];

    const videoUrls = [
        'https://player.mux.com/V674GRrZGdZ4prda59b2kTEryiCS5GMcPa7I18Lpm02E?autoplay=1&muted=1',
        'https://player.mux.com/lZf3016qjDr6KyXF6us818F41C7yoONQ02LdVYu8tQ8t00?autoplay=1&muted=1',
        'https://player.mux.com/lW01ZLiPdXPsFDc1QZhc6DsVq6keEUNdHrkdKpourK5Y?autoplay=1&muted=1',
        'https://player.mux.com/hERfetNtq8e8tnQtbSrPG02UQtPMcRQn00DeLthzJFFlY?autoplay=1&muted=1',
        'https://player.mux.com/Qz01hd02anGtuwj6Reprx59t00IEQMmoBU68rar1W96bw8?autoplay=1&muted=1'
    ];

    const renderFeatureButton = (index: number, title: string) => {
        const isActive = activeFeature === index;
        
        return (
          <button
            onClick={() => handleFeatureClick(index)}
            className={`text-left w-full transition-all p-2 rounded-lg group ${
              isActive ? '' : 'hover:bg-muted/50'
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className={`font-serif transition-all duration-500 ease-in-out ${
              isActive 
                ? ' typing-effect  visible opacity-100 max-h-20' 
                : 'invisible opacity-0 max-h-0 overflow-hidden'
            }`}>
              {featureDescriptions[index]}
            </p>
            <div className="w-full h-1 mt-4 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-900 transition-all duration-100 ease-linear"
                style={{ width: isActive ? `${progress}%` : '0%' }}
              ></div>
            </div>
          </button>
        );
    };

    // Auto-advance feature every 30 seconds with progress animation
    useEffect(() => {
        setProgress(0);
        
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) return 100;
            return prev + (100 / 300); // 300 steps over 30 seconds (100ms intervals)
          });
        }, 100);

        const featureTimer = setTimeout(() => {
          setActiveFeature(prev => (prev + 1) % 5);
        }, 30000);

        return () => {
          clearInterval(progressInterval);
          clearTimeout(featureTimer);
        };
    }, [activeFeature]);

    const handleFeatureClick = (index: number) => {
        setActiveFeature(index);
        setProgress(0);
    };

    return (
        <section id="features" className="px-4 py-20 ">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-sans text-4xl sm:text-4xl font-semibold text-foreground mb-6">
              Supercharge your content creation in 5 easy steps
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Create value content faster and smarter with our AI-powered tools
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 min-h-[600px] items-center">
            {/* Left Column - Features */}
            <div className="md:col-span-4 space-y-4">
              {renderFeatureButton(0, "Chat")}
              {renderFeatureButton(1, "Content management")}
              {renderFeatureButton(2, "AI powered post editor")}
              {renderFeatureButton(3, "Gamified Progress")}
              {renderFeatureButton(4, "Knowledge base")}
            </div>

            {/* Right Column - Video Only */}
            <div className="md:col-span-8 flex items-center justify-center self-center">
              <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-xl">
                <iframe
                  key={activeFeature}
                  src={videoUrls[activeFeature]}
                  style={{width: '100%', border: 'none', aspectRatio: '16/9'}}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  allowFullScreen
                  className="rounded-2xl overflow-hidden shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    )
}