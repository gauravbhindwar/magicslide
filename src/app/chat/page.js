'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, ArrowLeft, Download, Trash2, Sparkles } from 'lucide-react';
import ChatHistory from '@/components/ChatHistory';
import ChatInput from '@/components/ChatInput';
import ChatHistorySidebar from '@/components/ChatHistorySidebar';
import PresentationPreview from '@/components/PresentationPreview';
import SlidePreviewModal from '@/components/SlidePreviewModal';
import { HybridStorage } from '@/lib/hybridStorage';
import { initializeRedis } from '@/lib/redis';
import { downloadPowerPoint } from '../../lib/pptxGeneratorBrowser';
import { storageUtils } from '@/lib/secureStorage';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSlideData, setCurrentSlideData] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentCustomization, setCurrentCustomization] = useState(null);
  const [isRedisInitialized, setIsRedisInitialized] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Load chat history from hybrid storage on component mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        // Load chat messages
        const savedMessages = await HybridStorage.loadMessages();
        if (savedMessages && savedMessages.length > 0) {
          const messagesWithTimestamp = savedMessages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp || Date.now()
          }));
          setMessages(messagesWithTimestamp);
        }
        
        // Load user context from localStorage
        const savedContext = localStorage.getItem('magicSlideUserContext');
        if (savedContext) {
          try {
            const userContext = JSON.parse(savedContext);
            console.log('Loaded user context:', userContext);
            
            // Restore user preferences if available
            if (userContext.userPreferences) {
              setCurrentCustomization(prev => ({
                ...prev,
                ...userContext.userPreferences
              }));
            }
          } catch (parseError) {
            console.error('Error parsing user context:', parseError);
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    loadMessages();
  }, []);

  // Check for quick start prompt from welcome page or template prompt from prebuilt page
  useEffect(() => {
    const quickStartPrompt = sessionStorage.getItem('quickStartPrompt');
    const templatePrompt = sessionStorage.getItem('templatePrompt');
    const templateTitle = sessionStorage.getItem('templateTitle');
    
    if (quickStartPrompt) {
      sessionStorage.removeItem('quickStartPrompt');
      handleSendMessage(quickStartPrompt);
    } else if (templatePrompt) {
      sessionStorage.removeItem('templatePrompt');
      sessionStorage.removeItem('templateTitle');
      handleSendMessage(templatePrompt);
    }
  }, [handleSendMessage]);

  // Save chat history to hybrid storage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        HybridStorage.saveMessages(messages);
        
        // Also save user context to localStorage
        const userContext = {
          lastUpdate: Date.now(),
          totalMessages: messages.length,
          lastCustomization: currentCustomization,
          currentPresentationTitle: currentSlideData?.title,
          slideCount: currentSlideData?.slides?.length,
          userPreferences: {
            preferredColorScheme: currentCustomization?.colorScheme,
            preferredTone: currentCustomization?.tone,
            preferredAudience: currentCustomization?.targetAudience,
            includeImages: currentCustomization?.includeImages
          }
        };
        localStorage.setItem('magicSlideUserContext', JSON.stringify(userContext));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, currentCustomization, currentSlideData]);

  const handleSendMessage = React.useCallback(async (message, customization = null) => {
    // Store customization for context
    if (customization) {
      setCurrentCustomization(customization);
    }

    // Extract slide count from message if specified
    const slideCountMatch = message.match(/(\d+)\s*(?:slides?|pages?)/i);
    const requestedSlideCount = slideCountMatch ? parseInt(slideCountMatch[1]) : null;
    
    // Load user context for better personalization
    const savedContext = localStorage.getItem('magicSlideUserContext');
    let userPreferences = {};
    if (savedContext) {
      try {
        const context = JSON.parse(savedContext);
        userPreferences = context.userPreferences || {};
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    }

    // Merge customization with user preferences and slide count
    const enhancedCustomization = {
      ...userPreferences,
      ...customization,
      slideCount: requestedSlideCount,
      userMessage: message // Pass the original message for context
    };

    // Add user message with timestamp
    const userMessage = { 
      content: message, 
      isBot: false, 
      timestamp: Date.now(),
      customization: enhancedCustomization 
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Determine if this is an edit request
      const isEdit = currentSlideData && (
        message.toLowerCase().includes('edit') ||
        message.toLowerCase().includes('update') ||
        message.toLowerCase().includes('change') ||
        message.toLowerCase().includes('modify')
      );

      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          action: isEdit ? 'edit' : 'generate',
          existingSlides: isEdit ? currentSlideData : null,
          customization: enhancedCustomization
        }),
      });

      const result = await response.json();

      if (result.success && (result.data || result.slides)) {
        // Handle both old and new response formats
        let slideData = result.data || { title: result.title, slides: result.slides };
        
        // Always include images for better presentation quality like Gamma AI
        console.log('📸 Generated slides with image descriptions:', slideData.slides?.length || 0);

        const actualSlideCount = slideData.slides.length;
        const requestedCount = requestedSlideCount ? ` (${requestedSlideCount} slides as requested)` : '';
        const imageCount = slideData.slides.filter(s => s.imageUrl).length;
        
        const botMessage = {
          content: isEdit
            ? `I've updated your presentation based on your feedback. The changes have been applied to your ${actualSlideCount} slides.`
            : enhancedCustomization.presentationType
              ? `Perfect! I've created your ${enhancedCustomization.presentationType.name?.toLowerCase() || 'presentation'} with ${actualSlideCount} slides${requestedCount}${enhancedCustomization.includeImages && imageCount > 0 ? ` and ${imageCount} beautiful images` : ''}. Here's your presentation:`
              : `I've created your presentation with ${actualSlideCount} slides${requestedCount}${imageCount > 0 ? ` and ${imageCount} images` : ''}! Here's what I generated for you:`,
          isBot: true,
          slideData: slideData,
          timestamp: Date.now()
        };

        setMessages(prev => [...prev, botMessage]);
        setCurrentSlideData(slideData);
      } else {
        throw new Error(result.error || 'Failed to generate slides');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        isBot: true,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentSlideData, setCurrentCustomization, setMessages, setIsLoading, setCurrentSlideData]);

  const handleDownload = async () => {
    if (!currentSlideData || !currentSlideData.slides || currentSlideData.slides.length === 0) {
      alert('No presentation data to download. Please generate slides first.');
      return;
    }

    try {
      setIsDownloading(true);
      console.log('📥 Starting PowerPoint download...');
      
      // Use browser-compatible generator
      await downloadPowerPoint(currentSlideData, `${currentSlideData.title || 'presentation'}.pptx`);
      
      console.log('✅ PowerPoint download completed');
    } catch (error) {
      console.error('❌ Error downloading PowerPoint:', error);
      alert('Error downloading presentation. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = (slideIndex = 0) => {
    setCurrentSlideIndex(slideIndex);
    setIsPreviewOpen(true);
  };

  const handleSlideChange = (newSlideIndex) => {
    setCurrentSlideIndex(newSlideIndex);
  };

  const clearHistory = async () => {
    setMessages([]);
    setCurrentSlideData(null);
    setCurrentCustomization(null);
    try {
      await HybridStorage.deleteSession('default');
      // Also clear user context from localStorage
      localStorage.removeItem('magicSlideUserContext');
      console.log('Cleared chat history and user context');
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const exportHistory = () => {
    storageUtils.exportChatHistory();
  };

  const goToWelcome = () => {
    router.push('/');
  };

  const goToPrebuilt = () => {
    router.push('/pre');
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
            setCurrentSlideData(null);
          }}
          onDeleteChat={(sessionId) => {
            console.log('Delete chat:', sessionId);
          }}
        />
      </div>
      
      {/* Main Chat Area */}
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
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
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
                onClick={goToPrebuilt}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>Prebuilt</span>
              </button>
              {messages.length > 0 && (
                <>
                  <button
                    onClick={exportHistory}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={clearHistory}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
              <ChatHistory messages={messages} />
            </div>
            <div className="border-t border-gray-200 bg-white">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                disabled={false}
              />
            </div>
          </div>

          {/* Presentation Preview Sidebar */}
          {currentSlideData && (
            <div className="w-96 border-l border-gray-200 bg-gray-50 flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-white">
                <h2 className="text-lg font-semibold text-gray-900">Current Presentation</h2>
                <p className="text-sm text-gray-600 mt-1">Preview and download your slides</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <PresentationPreview
                  slideData={currentSlideData}
                  onDownload={handleDownload}
                  onPreview={handlePreview}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Preview Modal */}
      <SlidePreviewModal
        slideData={currentSlideData}
        currentSlide={currentSlideIndex}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onDownload={handleDownload}
        onSlideChange={handleSlideChange}
      />
    </div>
  );
}