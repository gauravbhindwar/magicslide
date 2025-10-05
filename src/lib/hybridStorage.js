'use client';

import { saveToRedis, getFromRedis, deleteFromRedis, isRedisReady } from './redis';
import { secureStorage } from './secureStorage';

export class HybridStorage {
  static async saveMessages(messages, sessionId = 'default') {
    const data = {
      messages,
      lastModified: Date.now(),
      title: this.generateSessionTitle(messages),
      sessionId
    };

    if (isRedisReady()) {
      try {
        await saveToRedis(`chat:${sessionId}`, data);
        return true;
      } catch (error) {
        console.error('Redis save failed, falling back to localStorage:', error);
      }
    }

    try {
      secureStorage.saveMessages(messages);
      return true;
    } catch (error) {
      console.error('localStorage save failed:', error);
      return false;
    }
  }

  static async loadMessages(sessionId = 'default') {
    if (isRedisReady()) {
      try {
        const data = await getFromRedis(`chat:${sessionId}`);
        return data?.messages || [];
      } catch (error) {
        console.error('Redis load failed, falling back to localStorage:', error);
      }
    }

    try {
      return secureStorage.loadMessages();
    } catch (error) {
      console.error('localStorage load failed:', error);
      return [];
    }
  }

  static async savePresentation(presentationData, sessionId = 'default') {
    const data = {
      ...presentationData,
      lastModified: Date.now(),
      sessionId
    };

    if (isRedisReady()) {
      try {
        await saveToRedis(`presentation:${sessionId}`, data);
        return true;
      } catch (error) {
        console.error('Redis save presentation failed:', error);
      }
    }

    return false;
  }

  static async deleteSession(sessionId) {
    if (isRedisReady()) {
      try {
        await deleteFromRedis(`chat:${sessionId}`);
        await deleteFromRedis(`presentation:${sessionId}`);
        return true;
      } catch (error) {
        console.error('Redis delete failed:', error);
      }
    }

    if (sessionId === 'default') {
      try {
        secureStorage.clearHistory();
        return true;
      } catch (error) {
        console.error('localStorage delete failed:', error);
      }
    }

    return false;
  }

  static generateSessionTitle(messages) {
    if (!messages || messages.length === 0) {
      return 'New Chat';
    }

    const firstUserMessage = messages.find(m => !m.isBot);
    const firstSlideData = messages.find(m => m.slideData);

    if (firstSlideData?.slideData?.title) {
      return firstSlideData.slideData.title;
    }

    if (firstUserMessage?.content) {
      return firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
    }

    return 'Untitled Chat';
  }

  static getStorageStatus() {
    return {
      redis: isRedisReady(),
      localStorage: secureStorage.isStorageAvailable()
    };
  }
}

export default HybridStorage;