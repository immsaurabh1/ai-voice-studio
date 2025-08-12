// Storage utilities for AI Voice Studio

export interface StoredAudio {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  audioData?: string; // base64 for real audio
  audioUrl?: string; // URL for mock audio
  duration: number;
  timestamp: number;
}

export interface AppState {
  lastGeneratedAudio?: StoredAudio | null;
  history: StoredAudio[];
  settings?: {
    maxHistoryItems: number;
    autoSave: boolean;
  };
}

class StorageManager {
  private readonly STORAGE_KEY = 'ai-voice-studio-data';
  private readonly MAX_HISTORY_ITEMS = 10;

  // Get all app data
  private getAppData(): AppState {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          history: parsed.history || [],
          lastGeneratedAudio: parsed.lastGeneratedAudio,
          settings: {
            maxHistoryItems: this.MAX_HISTORY_ITEMS,
            autoSave: true,
            ...parsed.settings
          }
        };
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    return {
      history: [],
      settings: {
        maxHistoryItems: this.MAX_HISTORY_ITEMS,
        autoSave: true
      }
    };
  }

  // Save all app data
  private saveAppData(data: AppState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // If storage is full, try to clear old items
      this.clearOldHistory();
    }
  }

  // Add audio to history
  addToHistory(audio: StoredAudio): void {
    try {
      const appData = this.getAppData();
      
      // Remove duplicate if exists
      const filteredHistory = appData.history.filter(item => item.id !== audio.id);
      
      // Add new item to beginning
      const updatedHistory = [audio, ...filteredHistory];
      
      // Limit history size
      if (updatedHistory.length > this.MAX_HISTORY_ITEMS) {
        updatedHistory.splice(this.MAX_HISTORY_ITEMS);
      }
      
      // Update app data
      appData.history = updatedHistory;
      appData.lastGeneratedAudio = audio;
      
      this.saveAppData(appData);
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  }

  // Get history
  getHistory(): StoredAudio[] {
    try {
      const appData = this.getAppData();
      return appData.history || [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  // Get last generated audio
  getLastGeneratedAudio(): StoredAudio | null {
    try {
      const appData = this.getAppData();
      return appData.lastGeneratedAudio || null;
    } catch (error) {
      console.error('Error getting last generated audio:', error);
      return null;
    }
  }

  // Remove item from history
  removeFromHistory(id: string): void {
    try {
      const appData = this.getAppData();
      appData.history = appData.history.filter(item => item.id !== id);
      this.saveAppData(appData);
    } catch (error) {
      console.error('Error removing from history:', error);
    }
  }

  // Clear all history
  clearHistory(): void {
    try {
      const appData = this.getAppData();
      appData.history = [];
      appData.lastGeneratedAudio = null;
      this.saveAppData(appData);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }

  // Clear old history items to free up space
  private clearOldHistory(): void {
    const appData = this.getAppData();
    const halfSize = Math.floor(this.MAX_HISTORY_ITEMS / 2);
    const updatedHistory = appData.history.slice(0, halfSize);
    
    const updatedAppData: AppState = {
      ...appData,
      history: updatedHistory
    };
    
    this.saveAppData(updatedAppData);
    console.log('🧹 Cleared old history items to free up space');
  }

  // Get storage information
  getStorageInfo() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      const size = data ? new Blob([data]).size : 0;
      const maxSize = 5 * 1024 * 1024; // 5MB limit
      
      return {
        used: size,
        max: maxSize,
        percentage: (size / maxSize) * 100,
        available: maxSize - size
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const storageManager = new StorageManager(); 