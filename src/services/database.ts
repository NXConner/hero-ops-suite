// Database Service Layer for Blacktop Blackout OverWatch System
// Supports both client-side IndexedDB and server-side API integration

interface UserPreferences {
  id: string;
  userId: string;
  terminologyMode: 'military' | 'civilian' | 'both';
  mapService: string;
  widgetLayouts: any;
  overlaySettings: any;
  notifications: boolean;
  theme: 'dark' | 'light' | 'auto';
  lastUpdated: Date;
}

interface WidgetLayout {
  id: string;
  userId: string;
  name: string;
  layout: any;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface HistoricalData {
  id: string;
  type: 'gps' | 'weather' | 'sensor' | 'scan';
  deviceId?: string;
  data: any;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface Project {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
  area: number;
  status: 'planning' | 'active' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  crew: string[];
  equipment: string[];
  scans: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Alert {
  id: string;
  type: 'weather' | 'maintenance' | 'geofence' | 'sensor' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data?: any;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

class DatabaseService {
  private static instance: DatabaseService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'OverWatchDB';
  private readonly DB_VERSION = 1;
  private readonly API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('Database failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.createObjectStores();
      };
    });
  }

  private createObjectStores(): void {
    if (!this.db) return;

    // User Preferences Store
    if (!this.db.objectStoreNames.contains('userPreferences')) {
      const userPrefStore = this.db.createObjectStore('userPreferences', { keyPath: 'id' });
      userPrefStore.createIndex('userId', 'userId', { unique: false });
    }

    // Widget Layouts Store
    if (!this.db.objectStoreNames.contains('widgetLayouts')) {
      const layoutStore = this.db.createObjectStore('widgetLayouts', { keyPath: 'id' });
      layoutStore.createIndex('userId', 'userId', { unique: false });
      layoutStore.createIndex('isDefault', 'isDefault', { unique: false });
    }

    // Historical Data Store
    if (!this.db.objectStoreNames.contains('historicalData')) {
      const historyStore = this.db.createObjectStore('historicalData', { keyPath: 'id' });
      historyStore.createIndex('type', 'type', { unique: false });
      historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      historyStore.createIndex('deviceId', 'deviceId', { unique: false });
    }

    // Projects Store
    if (!this.db.objectStoreNames.contains('projects')) {
      const projectStore = this.db.createObjectStore('projects', { keyPath: 'id' });
      projectStore.createIndex('status', 'status', { unique: false });
      projectStore.createIndex('startDate', 'startDate', { unique: false });
    }

    // Alerts Store
    if (!this.db.objectStoreNames.contains('alerts')) {
      const alertStore = this.db.createObjectStore('alerts', { keyPath: 'id' });
      alertStore.createIndex('type', 'type', { unique: false });
      alertStore.createIndex('severity', 'severity', { unique: false });
      alertStore.createIndex('acknowledged', 'acknowledged', { unique: false });
      alertStore.createIndex('createdAt', 'createdAt', { unique: false });
    }
  }

  // User Preferences Methods
  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      // Save locally
      await this.saveToStore('userPreferences', preferences);
      
      // Sync to server
      await this.syncToServer('preferences', preferences);
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw error;
    }
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      // Try to get from local storage first
      const local = await this.getFromStore('userPreferences', userId);
      if (local) return local;

      // Fallback to server
      const serverPrefs = await this.fetchFromServer(`preferences/${userId}`);
      if (serverPrefs) {
        await this.saveToStore('userPreferences', serverPrefs);
        return serverPrefs;
      }

      return null;
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return null;
    }
  }

  // Widget Layout Methods
  async saveWidgetLayout(layout: WidgetLayout): Promise<void> {
    try {
      await this.saveToStore('widgetLayouts', layout);
      await this.syncToServer('layouts', layout);
    } catch (error) {
      console.error('Failed to save widget layout:', error);
      throw error;
    }
  }

  async getWidgetLayouts(userId: string): Promise<WidgetLayout[]> {
    try {
      const layouts = await this.getAllFromStore('widgetLayouts', 'userId', userId);
      return layouts || [];
    } catch (error) {
      console.error('Failed to get widget layouts:', error);
      return [];
    }
  }

  async deleteWidgetLayout(layoutId: string): Promise<void> {
    try {
      await this.deleteFromStore('widgetLayouts', layoutId);
      await this.deleteFromServer(`layouts/${layoutId}`);
    } catch (error) {
      console.error('Failed to delete widget layout:', error);
      throw error;
    }
  }

  // Historical Data Methods
  async saveHistoricalData(data: HistoricalData): Promise<void> {
    try {
      await this.saveToStore('historicalData', data);
      // Historical data can be batch uploaded to reduce server load
    } catch (error) {
      console.error('Failed to save historical data:', error);
      throw error;
    }
  }

  async getHistoricalData(
    type: HistoricalData['type'],
    startDate: Date,
    endDate: Date,
    deviceId?: string
  ): Promise<HistoricalData[]> {
    try {
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('Database not initialized'));
          return;
        }

        const transaction = this.db.transaction(['historicalData'], 'readonly');
        const store = transaction.objectStore('historicalData');
        const index = store.index('timestamp');
        const range = IDBKeyRange.bound(startDate, endDate);
        const request = index.getAll(range);

        request.onsuccess = () => {
          let results = request.result.filter((item: HistoricalData) => item.type === type);
          if (deviceId) {
            results = results.filter((item: HistoricalData) => item.deviceId === deviceId);
          }
          resolve(results);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get historical data:', error);
      return [];
    }
  }

  // Project Methods
  async saveProject(project: Project): Promise<void> {
    try {
      await this.saveToStore('projects', project);
      await this.syncToServer('projects', project);
    } catch (error) {
      console.error('Failed to save project:', error);
      throw error;
    }
  }

  async getProjects(): Promise<Project[]> {
    try {
      const projects = await this.getAllFromStore('projects');
      return projects || [];
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  async updateProjectStatus(projectId: string, status: Project['status']): Promise<void> {
    try {
      const project = await this.getFromStore('projects', projectId);
      if (project) {
        project.status = status;
        project.updatedAt = new Date();
        await this.saveProject(project);
      }
    } catch (error) {
      console.error('Failed to update project status:', error);
      throw error;
    }
  }

  // Alert Methods
  async saveAlert(alert: Alert): Promise<void> {
    try {
      await this.saveToStore('alerts', alert);
      await this.syncToServer('alerts', alert);
    } catch (error) {
      console.error('Failed to save alert:', error);
      throw error;
    }
  }

  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const allAlerts = await this.getAllFromStore('alerts');
      const now = new Date();
      return (allAlerts || []).filter((alert: Alert) => 
        !alert.acknowledged && 
        (!alert.expiresAt || alert.expiresAt > now)
      );
    } catch (error) {
      console.error('Failed to get active alerts:', error);
      return [];
    }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      const alert = await this.getFromStore('alerts', alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date();
        await this.saveAlert(alert);
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  }

  // Generic Store Methods
  private async saveToStore(storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async getFromStore(storeName: string, key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllFromStore(storeName: string, indexName?: string, indexValue?: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request: IDBRequest;
      if (indexName && indexValue !== undefined) {
        const index = store.index(indexName);
        request = index.getAll(indexValue);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async deleteFromStore(storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Server Sync Methods
  private async syncToServer(endpoint: string, data: any): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Server sync failed: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Server sync failed, data saved locally:', error);
      // Continue without failing - offline support
    }
  }

  private async fetchFromServer(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Server fetch failed:', error);
    }
    return null;
  }

  private async deleteFromServer(endpoint: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Server delete failed: ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Server delete failed:', error);
    }
  }

  private getAuthToken(): string {
    return localStorage.getItem('authToken') || '';
  }

  // Bulk Operations
  async bulkSyncHistoricalData(): Promise<void> {
    try {
      const unsyncedData = await this.getAllFromStore('historicalData');
      if (unsyncedData.length > 0) {
        await this.syncToServer('historical-data/bulk', unsyncedData);
      }
    } catch (error) {
      console.error('Bulk sync failed:', error);
    }
  }

  // Data Export/Import
  async exportAllData(): Promise<any> {
    try {
      const data = {
        userPreferences: await this.getAllFromStore('userPreferences'),
        widgetLayouts: await this.getAllFromStore('widgetLayouts'),
        projects: await this.getAllFromStore('projects'),
        alerts: await this.getAllFromStore('alerts'),
        exportDate: new Date().toISOString()
      };
      return data;
    } catch (error) {
      console.error('Data export failed:', error);
      throw error;
    }
  }

  async importData(data: any): Promise<void> {
    try {
      if (data.userPreferences) {
        for (const pref of data.userPreferences) {
          await this.saveToStore('userPreferences', pref);
        }
      }
      if (data.widgetLayouts) {
        for (const layout of data.widgetLayouts) {
          await this.saveToStore('widgetLayouts', layout);
        }
      }
      if (data.projects) {
        for (const project of data.projects) {
          await this.saveToStore('projects', project);
        }
      }
      if (data.alerts) {
        for (const alert of data.alerts) {
          await this.saveToStore('alerts', alert);
        }
      }
    } catch (error) {
      console.error('Data import failed:', error);
      throw error;
    }
  }

  // Cleanup old data
  async cleanupOldData(days: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // Clean old historical data
      const oldHistoricalData = await this.getAllFromStore('historicalData');
      for (const item of oldHistoricalData) {
        if (new Date(item.timestamp) < cutoffDate) {
          await this.deleteFromStore('historicalData', item.id);
        }
      }

      // Clean old acknowledged alerts
      const oldAlerts = await this.getAllFromStore('alerts');
      for (const alert of oldAlerts) {
        if (alert.acknowledged && alert.acknowledgedAt && new Date(alert.acknowledgedAt) < cutoffDate) {
          await this.deleteFromStore('alerts', alert.id);
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();

// Initialize database on import
databaseService.initialize().catch(console.error);

// Export types for use in other components
export type { UserPreferences, WidgetLayout, HistoricalData, Project, Alert };