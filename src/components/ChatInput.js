'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading, disabled }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

return (
  <div className="border-t border-gray-200 bg-white">
    <div className="max-w-4xl mx-auto px-4 py-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? "Creating your presentation..." : "Describe your presentation or ask to edit existing slides..."}
              rows={1}
              disabled={disabled || isLoading}
              className={`w-full resize-none rounded-2xl border bg-white px-4 py-3 pr-12 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 text-base min-h-[48px] max-h-32 transition-all ${
                isLoading || disabled 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed placeholder:text-gray-400' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              style={{ lineHeight: '24px' }}
            />
            <button
              type="submit"
              disabled={!message.trim() || isLoading || disabled}
              className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-sm"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </form>
      {isLoading ? (
        <div className="mt-2 text-xs text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="font-medium">AI is generating your slides...</span>
          </div>
        </div>
      ) : (
        <div className="mt-2 text-xs text-gray-500 text-center">
          <span className="font-medium">Enter</span> to send • <span className="font-medium">Shift + Enter</span> for new line
        </div>
      )}
    </div>
  </div>
);
}