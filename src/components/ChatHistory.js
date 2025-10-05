'use client';

import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { FileText } from 'lucide-react';

export default function ChatHistory({ messages }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              MagicSlide AI
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Create stunning presentations with AI. Just describe what you want, and I'll generate professional slides instantly.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-2xl mb-2">🚀</div>
              <div className="font-medium text-gray-900 mb-1">Quick Start</div>
              <div className="text-sm text-gray-600">"Create a business pitch for my startup"</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900 mb-1">Professional</div>
              <div className="text-sm text-gray-600">"Make a quarterly report presentation"</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {messages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg.content}
            isBot={msg.isBot}
            slideData={msg.slideData}
          />
        ))}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}