'use client';

import { User, Bot, FileText } from 'lucide-react';

export default function ChatMessage({ message, isBot = false, slideData = null }) {
  return (
    <div className="group relative">
      <div className="flex items-start gap-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isBot ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-700'} text-white shadow-sm flex-shrink-0`}>
          {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <span className="text-sm font-medium text-gray-900">
              {isBot ? 'MagicSlide AI' : 'You'}
            </span>
          </div>
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-line">
              {message}
            </div>
          </div>
          {slideData && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-gray-900">Generated Presentation: {slideData.title}</span>
              </div>
              <div className="text-sm text-gray-600">
                {slideData.slides.length} slides created • Ready to download
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}