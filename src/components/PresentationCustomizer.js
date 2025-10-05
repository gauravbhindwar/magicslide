'use client';

import { useState } from 'react';
import { Palette, Image, FileText, Zap, ChevronDown, ChevronUp } from 'lucide-react';

const COLOR_SCHEMES = [
  { name: 'Professional Blue', primary: '#2563eb', secondary: '#3b82f6', accent: '#1d4ed8', bg: '#f8fafc' },
  { name: 'Modern Purple', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#6d28d9', bg: '#faf5ff' },
  { name: 'Creative Orange', primary: '#ea580c', secondary: '#fb923c', accent: '#c2410c', bg: '#fff7ed' },
  { name: 'Nature Green', primary: '#059669', secondary: '#10b981', accent: '#047857', bg: '#f0fdf4' },
  { name: 'Elegant Gray', primary: '#374151', secondary: '#6b7280', accent: '#1f2937', bg: '#f9fafb' },
  { name: 'Vibrant Pink', primary: '#db2777', secondary: '#ec4899', accent: '#be185d', bg: '#fdf2f8' },
  { name: 'Tech Cyan', primary: '#0891b2', secondary: '#06b6d4', accent: '#0e7490', bg: '#f0f9ff' },
  { name: 'Warm Red', primary: '#dc2626', secondary: '#ef4444', accent: '#b91c1c', bg: '#fef2f2' }
];

const PRESENTATION_TYPES = [
  { id: 'business', name: 'Business Presentation', icon: '💼', description: 'Professional layouts for business meetings' },
  { id: 'educational', name: 'Educational Content', icon: '📚', description: 'Perfect for lectures and training materials' },
  { id: 'creative', name: 'Creative Showcase', icon: '🎨', description: 'Artistic layouts for portfolios and creative work' },
  { id: 'pitch', name: 'Startup Pitch', icon: '🚀', description: 'Investor-ready pitch deck templates' },
  { id: 'marketing', name: 'Marketing Campaign', icon: '📈', description: 'Eye-catching designs for marketing presentations' },
  { id: 'report', name: 'Report & Analytics', icon: '📊', description: 'Data-focused layouts with charts and graphs' }
];

const SLIDE_ELEMENTS = [
  { id: 'title', name: 'Title Slide', icon: '📝', description: 'Opening slide with title and subtitle' },
  { id: 'agenda', name: 'Agenda/Outline', icon: '📋', description: 'Table of contents for your presentation' },
  { id: 'content', name: 'Content Slides', icon: '📄', description: 'Main content with bullet points' },
  { id: 'image', name: 'Image Slides', icon: '🖼️', description: 'Slides with prominent images' },
  { id: 'quote', name: 'Quote Slides', icon: '💬', description: 'Inspirational or testimonial quotes' },
  { id: 'stats', name: 'Statistics', icon: '📊', description: 'Data visualization and numbers' },
  { id: 'timeline', name: 'Timeline', icon: '⏰', description: 'Chronological progression of events' },
  { id: 'team', name: 'Team Introduction', icon: '👥', description: 'Team member profiles and bios' },
  { id: 'contact', name: 'Contact Info', icon: '📞', description: 'Contact details and social media' },
  { id: 'thankyou', name: 'Thank You', icon: '🙏', description: 'Closing slide with gratitude' }
];

export default function PresentationCustomizer({ onCreatePresentation, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [customization, setCustomization] = useState({
    topic: '',
    slideCount: 8,
    colorScheme: COLOR_SCHEMES[0],
    presentationType: PRESENTATION_TYPES[0],
    selectedElements: ['title', 'agenda', 'content', 'thankyou'],
    includeImages: true,
    tone: 'professional',
    targetAudience: 'general'
  });

  const handleElementToggle = (elementId) => {
    setCustomization(prev => ({
      ...prev,
      selectedElements: prev.selectedElements.includes(elementId)
        ? prev.selectedElements.filter(id => id !== elementId)
        : [...prev.selectedElements, elementId]
    }));
  };

  const handleCreatePresentation = () => {
    if (!customization.topic.trim()) {
      alert('Please enter a presentation topic');
      return;
    }

    const prompt = generatePrompt(customization);
    onCreatePresentation(prompt, customization);
  };

  const generatePrompt = (config) => {
    return `Create a ${config.presentationType.name.toLowerCase()} about "${config.topic}" with exactly ${config.slideCount} slides.

Style Requirements:
- Color scheme: ${config.colorScheme.name}
- Tone: ${config.tone}
- Target audience: ${config.targetAudience}
- ${config.includeImages ? 'Include image placeholders and descriptions' : 'Text-based slides only'}

Required slide elements: ${config.selectedElements.map(id => 
  SLIDE_ELEMENTS.find(el => el.id === id)?.name
).join(', ')}

Please create engaging, ${config.tone} content that flows logically and includes the requested elements. Make sure each slide has a clear purpose and contributes to the overall narrative.`;
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Create Custom Presentation</h3>
              <p className="text-sm text-gray-600">Customize your presentation style, colors, and content</p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 border-t space-y-6">
          {/* Topic Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presentation Topic *
            </label>
            <input
              type="text"
              value={customization.topic}
              onChange={(e) => setCustomization(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="Enter your presentation topic (e.g., Digital Marketing Strategy, Climate Change Solutions)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Slide Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Slides: {customization.slideCount}
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={customization.slideCount}
              onChange={(e) => setCustomization(prev => ({ ...prev, slideCount: parseInt(e.target.value) }))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 slides</span>
              <span>20 slides</span>
            </div>
          </div>

          {/* Presentation Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Presentation Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESENTATION_TYPES.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setCustomization(prev => ({ ...prev, presentationType: type }))}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    customization.presentationType.id === type.id
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{type.name}</div>
                  <div className="text-xs text-gray-600">{type.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color Scheme
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {COLOR_SCHEMES.map((scheme) => (
                <div
                  key={scheme.name}
                  onClick={() => setCustomization(prev => ({ ...prev, colorScheme: scheme }))}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    customization.colorScheme.name === scheme.name
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex space-x-1 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.primary }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.secondary }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: scheme.accent }}></div>
                  </div>
                  <div className="text-xs font-medium text-gray-900">{scheme.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Elements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Include Slide Elements
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {SLIDE_ELEMENTS.map((element) => (
                <div
                  key={element.id}
                  onClick={() => handleElementToggle(element.id)}
                  className={`p-2 border rounded-lg cursor-pointer text-center transition-all ${
                    customization.selectedElements.includes(element.id)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{element.icon}</div>
                  <div className="text-xs font-medium">{element.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
              <select
                value={customization.tone}
                onChange={(e) => setCustomization(prev => ({ ...prev, tone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="creative">Creative</option>
                <option value="academic">Academic</option>
                <option value="enthusiastic">Enthusiastic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Audience</label>
              <select
                value={customization.targetAudience}
                onChange={(e) => setCustomization(prev => ({ ...prev, targetAudience: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">General Audience</option>
                <option value="executives">Executives</option>
                <option value="students">Students</option>
                <option value="technical">Technical Team</option>
                <option value="investors">Investors</option>
                <option value="customers">Customers</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={customization.includeImages}
                  onChange={(e) => setCustomization(prev => ({ ...prev, includeImages: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include image placeholders</span>
              </label>
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-4 border-t">
            <button
              onClick={handleCreatePresentation}
              disabled={isLoading || !customization.topic.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? 'Creating Your Presentation...' : `Create ${customization.slideCount}-Slide Presentation`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}