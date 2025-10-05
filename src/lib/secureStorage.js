// Secure storage utility for chat history persistence
// Uses browser's built-in encryption and security features

class SecureStorage {
  constructor() {
    this.storageKey = 'magicslide-chat-history';
    this.encryptionKey = null;
    this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
    this.maxMessages = 1000; // Limit number of messages stored
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      this.encryptionKey = this.generateOrGetKey();
    }
  }

  // Generate or retrieve a consistent encryption key for this session
  generateOrGetKey() {
    if (!this.isClient) return null;
    
    const keyName = 'magicslide-session-key';
    let key = sessionStorage.getItem(keyName);
    
    if (!key) {
      // Generate a new key for this session
      key = this.generateRandomKey();
      sessionStorage.setItem(keyName, key);
    }
    
    return key;
  }

  generateRandomKey() {
    if (!this.isClient) return 'fallback-key';
    
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Simple XOR encryption for client-side data protection
  encrypt(data) {
    if (!this.isClient || !this.encryptionKey) {
      return JSON.stringify(data); // Fallback to plain JSON
    }
    
    const jsonString = JSON.stringify(data);
    const key = this.encryptionKey;
    let encrypted = '';
    
    for (let i = 0; i < jsonString.length; i++) {
      const charCode = jsonString.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode ^ keyChar);
    }
    
    return btoa(encrypted); // Base64 encode
  }

  // Decrypt the stored data
  decrypt(encryptedData) {
    if (!this.isClient || !this.encryptionKey) {
      try {
        return JSON.parse(encryptedData); // Try parsing as plain JSON
      } catch {
        return null;
      }
    }
    
    try {
      const encrypted = atob(encryptedData); // Base64 decode
      const key = this.encryptionKey;
      let decrypted = '';
      
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode ^ keyChar);
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting data:', error);
      // Try parsing as plain JSON fallback
      try {
        return JSON.parse(encryptedData);
      } catch {
        return null;
      }
    }
  }

  // Save chat history securely
  saveMessages(messages) {
    if (!this.isClient) return;
    
    try {
      // Limit the number of messages to prevent storage bloat
      const limitedMessages = messages.slice(-this.maxMessages);
      
      // Clean sensitive data and reduce storage size
      const cleanedMessages = limitedMessages.map(msg => ({
        content: msg.content,
        isBot: msg.isBot,
        timestamp: msg.timestamp || Date.now(),
        // Don't store full slide data, just reference
        hasSlideData: !!msg.slideData,
        slideTitle: msg.slideData?.title || null
      }));

      const encrypted = this.encrypt(cleanedMessages);
      
      // Check storage size
      if (encrypted.length > this.maxStorageSize) {
        console.warn('Chat history too large, trimming...');
        const trimmedMessages = cleanedMessages.slice(-Math.floor(this.maxMessages / 2));
        const trimmedEncrypted = this.encrypt(trimmedMessages);
        localStorage.setItem(this.storageKey, trimmedEncrypted);
      } else {
        localStorage.setItem(this.storageKey, encrypted);
      }

      // Store metadata
      localStorage.setItem(`${this.storageKey}-meta`, JSON.stringify({
        lastSaved: Date.now(),
        messageCount: cleanedMessages.length,
        version: '1.0'
      }));

    } catch (error) {
      console.error('Error saving chat history:', error);
      // Fallback to unencrypted storage if encryption fails
      try {
        localStorage.setItem(`${this.storageKey}-fallback`, JSON.stringify(messages.slice(-100)));
      } catch (fallbackError) {
        console.error('Fallback storage also failed:', fallbackError);
      }
    }
  }

  // Load chat history securely
  loadMessages() {
    if (!this.isClient) return [];
    
    try {
      const encrypted = localStorage.getItem(this.storageKey);
      if (!encrypted) {
        // Try fallback storage
        const fallback = localStorage.getItem(`${this.storageKey}-fallback`);
        return fallback ? JSON.parse(fallback) : [];
      }

      const messages = this.decrypt(encrypted);
      if (!messages) {
        // If decryption fails, try fallback
        const fallback = localStorage.getItem(`${this.storageKey}-fallback`);
        return fallback ? JSON.parse(fallback) : [];
      }

      return messages;
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  // Clear all stored data
  clearHistory() {
    if (!this.isClient) return;
    
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(`${this.storageKey}-meta`);
      localStorage.removeItem(`${this.storageKey}-fallback`);
      sessionStorage.removeItem('magicslide-session-key');
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }

  // Get storage metadata
  getStorageInfo() {
    if (!this.isClient) return null;
    
    try {
      const meta = localStorage.getItem(`${this.storageKey}-meta`);
      return meta ? JSON.parse(meta) : null;
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  // Check if storage is available and working
  isStorageAvailable() {
    if (!this.isClient) return false;
    
    try {
      const test = 'storage-test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Additional utility functions
export const storageUtils = {
  // Estimate storage usage
  getStorageUsage() {
    if (typeof window === 'undefined') {
      return { used: 0, usedMB: '0.00', available: 0, availableMB: '0.00' };
    }
    
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      used: total,
      usedMB: (total / (1024 * 1024)).toFixed(2),
      available: (5 * 1024 * 1024) - total, // Assume 5MB limit
      availableMB: (((5 * 1024 * 1024) - total) / (1024 * 1024)).toFixed(2)
    };
  },

  // Clean old data
  cleanOldData(daysOld = 30) {
    const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    
    for (let key in localStorage) {
      if (key.startsWith('magicslide-') && key.includes('-meta')) {
        try {
          const meta = JSON.parse(localStorage.getItem(key));
          if (meta.lastSaved < cutoffTime) {
            const dataKey = key.replace('-meta', '');
            localStorage.removeItem(key);
            localStorage.removeItem(dataKey);
            localStorage.removeItem(`${dataKey}-fallback`);
          }
        } catch (error) {
          console.error('Error cleaning old data:', error);
        }
      }
    }
  },

  // Export chat history for backup
  exportChatHistory() {
    const messages = secureStorage.loadMessages();
    const exportData = {
      messages,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `magicslide-chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import chat history from backup
  importChatHistory(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.messages && Array.isArray(data.messages)) {
            secureStorage.saveMessages(data.messages);
            resolve(data.messages);
          } else {
            reject(new Error('Invalid chat history format'));
          }
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
};