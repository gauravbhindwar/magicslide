'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Zap, Play, Download, Eye } from 'lucide-react';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import { HybridStorage } from '@/lib/hybridStorage';
import { initializeRedis } from '@/lib/redis';

// Prebuilt presentation templates
const PREBUILT_TEMPLATES = [
  {
    id: 'business-pitch',
    title: 'Business Pitch Deck',
    description: 'Professional investor-ready pitch presentation',
    category: 'Business',
    icon: '🚀',
    slides: 12,
    color: 'from-blue-500 to-blue-600',
    features: ['Market Analysis', 'Financial Projections', 'Business Model', 'Team Introduction'],
    prompt: 'Create a comprehensive business pitch deck with 12 slides including executive summary, problem statement, solution, market analysis, business model, competitive analysis, marketing strategy, financial projections, funding requirements, team introduction, milestones, and contact information. Use professional blue color scheme and include placeholder images for charts and team photos.'
  },
  {
    id: 'marketing-campaign',
    title: 'Marketing Campaign',
    description: 'Eye-catching marketing presentation template',
    category: 'Marketing',
    icon: '📈',
    slides: 10,
    color: 'from-purple-500 to-pink-500',
    features: ['Campaign Strategy', 'Target Audience', 'Budget Breakdown', 'ROI Analysis'],
    prompt: 'Create a vibrant marketing campaign presentation with 10 slides including campaign overview, market research, target audience analysis, campaign objectives, creative strategy, marketing channels, budget allocation, timeline, success metrics, and ROI projections. Use modern purple-to-pink gradient color scheme with dynamic layouts.'
  },
  {
    id: 'quarterly-report',
    title: 'Quarterly Business Report',
    description: 'Data-driven quarterly performance report',
    category: 'Reports',
    icon: '📊',
    slides: 8,
    color: 'from-green-500 to-emerald-600',
    features: ['Performance Metrics', 'Financial Data', 'Growth Charts', 'Key Insights'],
    prompt: 'Create a comprehensive quarterly business report with 8 slides including executive summary, key performance indicators, revenue analysis, market performance, operational highlights, challenges and solutions, future outlook, and action items. Use professional green color scheme with data visualization elements.'
  },
  {
    id: 'product-launch',
    title: 'Product Launch',
    description: 'Exciting product launch presentation',
    category: 'Product',
    icon: '🎯',
    slides: 15,
    color: 'from-orange-500 to-red-500',
    features: ['Product Features', 'Market Positioning', 'Launch Strategy', 'Success Metrics'],
    prompt: 'Create an engaging product launch presentation with 15 slides including product introduction, market opportunity, key features, competitive advantages, target customers, pricing strategy, marketing plan, launch timeline, distribution channels, success metrics, risk mitigation, team roles, budget overview, next steps, and celebration. Use vibrant orange-to-red gradient colors.'
  },
  {
    id: 'educational-course',
    title: 'Educational Course',
    description: 'Structured learning presentation template',
    category: 'Education',
    icon: '📚',
    slides: 20,
    color: 'from-cyan-500 to-blue-500',
    features: ['Learning Objectives', 'Module Structure', 'Interactive Elements', 'Assessment'],
    prompt: 'Create a comprehensive educational course presentation with 20 slides including course introduction, learning objectives, module overview, key concepts, practical examples, interactive exercises, case studies, best practices, common challenges, solutions, progress tracking, assessment criteria, resources, next steps, Q&A section, summary, certification info, feedback form, contact information, and thank you slide. Use professional cyan-to-blue color scheme suitable for learning environments.'
  },
  {
    id: 'company-overview',
    title: 'Company Overview',
    description: 'Professional company introduction',
    category: 'Corporate',
    icon: '🏢',
    slides: 11,
    color: 'from-gray-600 to-gray-800',
    features: ['Company History', 'Mission & Vision', 'Team Profiles', 'Achievements'],
    prompt: 'Create a professional company overview presentation with 11 slides including company introduction, mission and vision, company history, core values, services overview, team introduction, achievements and awards, client testimonials, market presence, future goals, and contact information. Use elegant gray color scheme with professional layouts.'
  },
  {
    id: 'project-proposal',
    title: 'Project Proposal',
    description: 'Detailed project proposal template',
    category: 'Projects',
    icon: '📋',
    slides: 13,
    color: 'from-indigo-500 to-purple-600',
    features: ['Project Scope', 'Timeline', 'Resource Planning', 'Risk Assessment'],
    prompt: 'Create a detailed project proposal presentation with 13 slides including project overview, problem statement, proposed solution, project scope, methodology, timeline and milestones, resource requirements, budget breakdown, risk assessment, team structure, success criteria, deliverables, and approval process. Use professional indigo-to-purple gradient colors.'
  },
  {
    id: 'training-workshop',
    title: 'Training Workshop',
    description: 'Interactive training session template',
    category: 'Training',
    icon: '🎓',
    slides: 16,
    color: 'from-teal-500 to-green-500',
    features: ['Workshop Agenda', 'Skill Development', 'Practical Exercises', 'Certification'],
    prompt: 'Create an interactive training workshop presentation with 16 slides including workshop introduction, learning objectives, agenda overview, skill assessment, core concepts, hands-on exercises, group activities, best practices, common mistakes, practical tips, progress evaluation, additional resources, certification process, feedback collection, next steps, and conclusion. Use engaging teal-to-green colors for training environments.'
  }
];

const CATEGORIES = ['All', 'Business', 'Marketing', 'Reports', 'Product', 'Education', 'Corporate', 'Projects', 'Training'];

export default function PrebuiltPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [messages, setMessages] = useState([]);
  const [isRedisInitialized, setIsRedisInitialized] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Initialize Redis on component mount
  useEffect(() => {
    const redisUrl = process.env.NEXT_PUBLIC_REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.NEXT_PUBLIC_REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
    
    if (redisUrl && redisToken) {
      const initialized = initializeRedis(redisUrl, redisToken);
      setIsRedisInitialized(initialized);
      if (initialized) {
        console.log('Redis initialized successfully');
      }
    } else {
      console.log('Redis credentials not found, using localStorage fallback');
    }
  }, []);

  // Load chat history from hybrid storage
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const savedMessages = await HybridStorage.loadMessages();
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    loadMessages();
  }, []);

  const filteredTemplates = selectedCategory === 'All' 
    ? PREBUILT_TEMPLATES 
    : PREBUILT_TEMPLATES.filter(template => template.category === selectedCategory);

  const handleUseTemplate = (template) => {
    // Store the template prompt and navigate to chat
    sessionStorage.setItem('templatePrompt', template.prompt);
    sessionStorage.setItem('templateTitle', template.title);
    router.push('/chat');
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const goToWelcome = () => {
    router.push('/');
  };

  const goToChat = () => {
    router.push('/chat');
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Chat History Sidebar - Fixed scrolling */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col max-h-screen">
        <ChatHistorySidebar 
          messages={messages}
          onSelectChat={(session) => {
            console.log('Selected chat:', session);
          }}
          onNewChat={() => {
            setMessages([]);
          }}
          onDeleteChat={(sessionId) => {
            console.log('Delete chat:', sessionId);
          }}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col max-h-screen">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={goToWelcome}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Home</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Prebuilt Templates</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border">
                <div className={`w-2 h-2 rounded-full ${isRedisInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span className="text-gray-600">
                  {isRedisInitialized ? 'Redis Connected' : 'Local Storage'}
                </span>
              </div>
              <button
                onClick={goToChat}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose a Presentation Template</h2>
              <p className="text-lg text-gray-600">Start with a professionally designed template and customize it to your needs</p>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-purple-100 text-purple-800 border-2 border-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 group">
                  {/* Template Header */}
                  <div className={`h-32 bg-gradient-to-br ${template.color} p-4 flex items-center justify-center relative`}>
                    <div className="text-4xl">{template.icon}</div>
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white font-medium">
                      {template.slides} slides
                    </div>
                  </div>

                  {/* Template Content */}
                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-2">
                        {template.category}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-900">{template.title}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-2">Key Features:</h4>
                      <div className="space-y-1">
                        {template.features.slice(0, 2).map((feature, index) => (
                          <div key={index} className="text-xs text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            {feature}
                          </div>
                        ))}
                        {template.features.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{template.features.length - 2} more features
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreviewTemplate(template)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-white rounded-lg transition-colors bg-gradient-to-r ${template.color} hover:opacity-90`}
                      >
                        <Play className="h-4 w-4" />
                        <span>Use</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                <p className="text-gray-600">Try selecting a different category or check back later for new templates.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedTemplate.title}</h3>
                  <p className="text-gray-600">{selectedTemplate.description}</p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Template Preview */}
              <div className={`h-40 bg-gradient-to-br ${selectedTemplate.color} rounded-lg mb-6 flex items-center justify-center`}>
                <div className="text-6xl">{selectedTemplate.icon}</div>
              </div>

              {/* Template Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Template Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-medium">{selectedTemplate.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Slides:</span>
                      <span className="ml-2 font-medium">{selectedTemplate.slides}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Included Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedTemplate.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors bg-gradient-to-r ${selectedTemplate.color} hover:opacity-90`}
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}