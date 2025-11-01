'use client'
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "What is Indiegrowth?",
      answer: "Indiegrowth is not just an AI tweet writer , it helps you write tweets on your own then customize it the way people love it , Also helps you build habits for daily writing and track your progress."
    },
    {
      question: "How does the AI tweet writer helps you grow your app?",
      answer: "You enter your app name and url and the AI will generate tweets about your app and you can customize it the way you want."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a free tier that allows you to experience the core features of our platform. No credit card is required to get started."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely. You can cancel your subscription at any time with no hidden fees or long-term commitments."
    },
    {
      question: "How secure is my data?",
      answer: "We take data security seriously. All your information is encrypted, and we follow strict data protection guidelines to ensure your privacy."
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="px-4 py-20 bg-muted/20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-4xl font-semibold text-foreground mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Got questions? We've got answers. Here are some common queries about Indiegrowth.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-border/50 rounded-lg overflow-hidden"
            >
              <button 
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4 text-left 
                  hover:bg-muted/30 transition-colors duration-200 
                  focus:outline-none focus:ring-2 focus:ring-cyan-900/50"
              >
                <span className="text-lg font-medium text-foreground">
                  {faq.question}
                </span>
                {activeIndex === index ? (
                  <ChevronUp className="text-muted-foreground" />
                ) : (
                  <ChevronDown className="text-muted-foreground" />
                )}
              </button>
              
              {activeIndex === index && (
                <div 
                  className="p-4 pt-0 text-muted-foreground animate-fade-in"
                >
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
