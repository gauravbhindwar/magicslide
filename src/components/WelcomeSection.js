'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Zap, Palette, Image, BarChart3, Users, Clock, Download } from 'lucide-react';

const QUICK_TEMPLATES = [
  {
    id: 'business-pitch',
    title: 'Business Pitch',
    description: 'Professional 10-slide pitch deck',
    icon: '💼',
    color: 'from-blue-500 to-indigo-600',
    prompt: 'Create a professional business pitch presentation with 10 slides including problem statement, solution, market analysis, business model, competition, marketing strategy, financial projections, team, funding requirements, and next steps.'
  },
  {
    id: 'product-launch',
    title: 'Product Launch',
    description: 'Exciting product reveal presentation',
    icon: '🚀',
    color: 'from-purple-500 to-pink-600',
    prompt: 'Create an exciting product launch presentation with 8 slides including product introduction, key features, target market, competitive advantages, pricing strategy, marketing plan, timeline, and call to action.'
  },
  {
    id: 'educational',
    title: 'Educational Topic',
    description: 'Learning-focused content',
    icon: '📚',
    color: 'from-green-500 to-teal-600',
    prompt: 'Create an educational presentation with 12 slides including introduction, learning objectives, main content divided into clear sections, examples, interactive elements, summary, and assessment questions.'
  },
  {
    id: 'marketing',
    title: 'Marketing Campaign',
    description: 'Campaign strategy and results',
    icon: '📈',
    color: 'from-orange-500 to-red-600',
    prompt: 'Create a marketing campaign presentation with 9 slides including campaign overview, target audience analysis, strategy, creative concepts, implementation timeline, budget allocation, expected results, and success metrics.'
  }
];

const FEATURES = [
  { icon: Sparkles, title: 'AI-Powered', description: 'Smart content generation with Gemini AI' },
  { icon: Palette, title: 'Custom Themes', description: 'Beautiful color schemes and layouts' },
  { icon: Image, title: 'Visual Elements', description: 'Images, charts, and interactive content' },
  { icon: Clock, title: 'Quick Creation', description: 'Generate presentations in minutes' },
  { icon: Download, title: 'Multiple Formats', description: 'Download as HTML, PDF, or PPTX' },
  { icon: Users, title: 'Any Audience', description: 'Tailored for different target groups' }
];

export default function WelcomeSection({ onQuickStart, onCustomCreate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const router = useRouter();

  const handleQuickTemplate = (template) => {
    onQuickStart(template.prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              MagicSlide AI
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Create stunning presentations in minutes with AI-powered content generation, 
              custom themes, and intelligent design suggestions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={onCustomCreate}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Create Custom Presentation
              </button>
              <button
                onClick={() => router.push('/chat')}
                className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-200"
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose MagicSlide AI?</h2>
            <p className="text-lg text-gray-600">Powerful features to create professional presentations effortlessly</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-200">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Templates Section */}
      <div id="quick-templates" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start Templates</h2>
            <p className="text-lg text-gray-600">Get started instantly with pre-designed presentation templates</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {QUICK_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105"
                onClick={() => handleQuickTemplate(template)}
              >
                <div className={`h-32 bg-gradient-to-br ${template.color} rounded-t-xl flex items-center justify-center`}>
                  <div className="text-4xl">{template.icon}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Create Amazing Presentations?</h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of users who create professional presentations with MagicSlide AI
          </p>
          <button
            onClick={onCustomCreate}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Creating Now
          </button>
        </div>
      </div>
    </div>
  );
}