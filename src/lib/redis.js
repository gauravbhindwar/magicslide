'use client';

import { Redis } from '@upstash/redis';

// Redis configuration
let redis = null;

export function initializeRedis(url, token) {
  if (!url || !token) {
    console.warn('Redis URL or token not provided');
    return false;
  }
  
  try {
    redis = new Redis({
      url: url,
      token: token,
    });
    console.log('Redis initialized with URL:', url.substring(0, 30) + '...');
    return true;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return false;
  }
}

export async function saveToRedis(key, data) {
  if (!redis) {
    console.warn('Redis not initialized, falling back to localStorage');
    return false;
  }
  
  try {
    await redis.set(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to Redis:', error);
    return false;
  }
}

export async function getFromRedis(key) {
  if (!redis) {
    console.warn('Redis not initialized, falling back to localStorage');
    return null;
  }
  
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get from Redis:', error);
    return null;
  }
}

export async function deleteFromRedis(key) {
  if (!redis) {
    console.warn('Redis not initialized, falling back to localStorage');
    return false;
  }
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Failed to delete from Redis:', error);
    return false;
  }
}

export async function listChatSessions() {
  if (!redis) {
    console.warn('Redis not initialized, falling back to localStorage');
    return [];
  }
  
  try {
    const keys = await redis.keys('chat:*');
    const sessions = [];
    
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const sessionData = JSON.parse(data);
        sessions.push({
          id: key.replace('chat:', ''),
          title: sessionData.title || 'Untitled Chat',
          lastModified: sessionData.lastModified || Date.now(),
          messageCount: sessionData.messages?.length || 0
        });
      }
    }
    
    return sessions.sort((a, b) => b.lastModified - a.lastModified);
  } catch (error) {
    console.error('Failed to list chat sessions:', error);
    return [];
  }
}

export function isRedisReady() {
  return redis !== null;
}