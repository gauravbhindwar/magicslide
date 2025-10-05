'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Clock, Trash2, Plus } from 'lucide-react';

export default function ChatHistorySidebar({ messages, onSelectChat, onNewChat, onDeleteChat }) {
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);

  // Mock data for now - will be replaced with Redis data
  useEffect(() => {
    // Load chat sessions from storage
    const loadChatSessions = () => {
      // For now, create a session from current messages if they exist
      if (messages.length > 0) {
        const currentSession = {
          id: 'current',
          title: messages.find(m => m.slideData)?.slideData?.title || 'Current Chat',
          lastModified: Date.now(),
          messageCount: messages.length,
          preview: messages[messages.length - 1]?.content?.substring(0, 50) + '...'
        };
        setChatSessions([currentSession]);
        setSelectedChatId('current');
      }
    };

    loadChatSessions();
  }, [messages]);

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Chat History</h2>
          <button
            onClick={onNewChat}
            className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {chatSessions.length} conversation{chatSessions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Chat Sessions */}
      <div className="flex-1 overflow-y-auto">
        {chatSessions.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mb-4">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">No chat history</h3>
            <p className="text-xs text-gray-500">
              Start creating presentations to see your chat history here
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {chatSessions.map((session) => (
              <div
                key={session.id}
                className={`p-3 rounded-xl cursor-pointer transition-all group ${
                  selectedChatId === session.id
                    ? 'bg-purple-50 border border-purple-200'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
                onClick={() => {
                  setSelectedChatId(session.id);
                  onSelectChat?.(session);
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {session.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {session.preview || `${session.messageCount} messages`}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatTime(session.lastModified)}</span>
                      <span className="mx-2">•</span>
                      <span>{session.messageCount} msg</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat?.(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center">
          💾 Chat history is stored securely
        </div>
      </div>
    </div>
  );
}