// @ts-nocheck
// Authentication Service for Blacktop Blackout OverWatch System
import { databaseService } from './database';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  department: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'supervisor'
  | 'operator'
  | 'viewer'
  | 'field_worker'
  | 'analyst';

export type Permission = 
  | 'view_map'
  | 'edit_map'
  | 'manage_widgets'
  | 'view_analytics'
  | 'manage_projects'
  | 'manage_users'
  | 'manage_equipment'
  | 'view_reports'
  | 'edit_reports'
  | 'manage_alerts'
  | 'system_admin'
  | 'data_export'
  | 'ai_access';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  expiresAt: Date;
  user: User;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  deviceInfo: string;
  ipAddress: string;
  isActive: boolean;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private readonly API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

  // Role Permissions Matrix
  private readonly ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
    super_admin: [
      'view_map', 'edit_map', 'manage_widgets', 'view_analytics', 'manage_projects',
      'manage_users', 'manage_equipment', 'view_reports', 'edit_reports', 'manage_alerts',
      'system_admin', 'data_export', 'ai_access'
    ],
    admin: [
      'view_map', 'edit_map', 'manage_widgets', 'view_analytics', 'manage_projects',
      'manage_users', 'manage_equipment', 'view_reports', 'edit_reports', 'manage_alerts',
      'data_export', 'ai_access'
    ],
    supervisor: [
      'view_map', 'edit_map', 'manage_widgets', 'view_analytics', 'manage_projects',
      'view_reports', 'edit_reports', 'manage_alerts', 'data_export'
    ],
    operator: [
      'view_map', 'edit_map', 'manage_widgets', 'view_analytics', 'view_reports', 'manage_alerts'
    ],
    analyst: [
      'view_map', 'view_analytics', 'view_reports', 'edit_reports', 'data_export', 'ai_access'
    ],
    field_worker: [
      'view_map', 'manage_widgets', 'view_reports'
    ],
    viewer: [
      'view_map', 'view_analytics', 'view_reports'
    ]
  };

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  constructor() {
    this.initializeFromStorage();
    this.startSessionCheck();
  }

  private initializeFromStorage(): void {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('currentUser');

      if (storedToken && storedUser) {
        this.authToken = storedToken;
        this.refreshToken = storedRefreshToken;
        this.currentUser = JSON.parse(storedUser);
        
        // Verify token is still valid
        this.verifyToken().catch(() => {
          this.logout();
        });
      }
    } catch (error) {
      console.error('Failed to initialize auth from storage:', error);
      this.logout();
    }
  }

  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const authData: AuthToken = await response.json();
      
      // Store authentication data
      this.authToken = authData.token;
      this.refreshToken = authData.refreshToken;
      this.currentUser = authData.user;

      // Persist to storage
      localStorage.setItem('authToken', authData.token);
      if (authData.refreshToken) {
        localStorage.setItem('refreshToken', authData.refreshToken);
      }
      localStorage.setItem('currentUser', JSON.stringify(authData.user));

      if (credentials.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Update user's last login
      this.currentUser.lastLogin = new Date();

      // Start session monitoring
      this.startSessionCheck();

      return this.currentUser;
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async logout(): Promise<void> {
    try {
      // Notify server about logout
      if (this.authToken) {
        await fetch(`${this.API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        });
      }
    } catch (error) {
      console.warn('Server logout failed:', error);
    } finally {
      // Clear local data
      this.authToken = null;
      this.refreshToken = null;
      this.currentUser = null;

      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('rememberMe');

      if (this.sessionCheckInterval) {
        clearInterval(this.sessionCheckInterval);
        this.sessionCheckInterval = null;
      }

      // Redirect to login page
      window.location.href = '/login';
    }
  }

  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.authToken = data.token;
      localStorage.setItem('authToken', data.token);

      return data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      throw error;
    }
  }

  private async verifyToken(): Promise<boolean> {
    if (!this.authToken) return false;

    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  private startSessionCheck(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      if (this.authToken) {
        const isValid = await this.verifyToken();
        if (!isValid) {
          try {
            await this.refreshAccessToken();
          } catch (error) {
            this.logout();
          }
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  // User Management
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  // Permission Checking
  hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;

    const rolePermissions = this.ROLE_PERMISSIONS[this.currentUser.role] || [];
    return rolePermissions.includes(permission) || this.currentUser.permissions.includes(permission);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  canAccessFeature(feature: string): boolean {
    const featurePermissions: Record<string, Permission[]> = {
      'overwatch-map': ['view_map'],
      'pavement-scan': ['view_map', 'view_analytics'],
      'fleet-tracking': ['view_map'],
      'weather-overlay': ['view_map'],
      'drawing-tools': ['edit_map'],
      'analytics-dashboard': ['view_analytics'],
      'project-management': ['manage_projects'],
      'user-management': ['manage_users'],
      'system-settings': ['system_admin'],
      'data-export': ['data_export'],
      'ai-features': ['ai_access']
    };

    const requiredPermissions = featurePermissions[feature] || [];
    return requiredPermissions.some(permission => this.hasPermission(permission));
  }

  // Session Management
  async getSessions(): Promise<Session[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/sessions`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get sessions:', error);
    }
    return [];
  }

  async revokeSession(sessionId: string): Promise<void> {
    try {
      await fetch(`${this.API_BASE_URL}/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });
    } catch (error) {
      console.error('Failed to revoke session:', error);
      throw error;
    }
  }

  // Password Management
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Password change failed');
      }
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Password reset request failed');
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw error;
    }
  }

  // User Profile Management
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Profile update failed');
      }

      const updatedUser = await response.json();
      this.currentUser = updatedUser;
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }

  // Two-Factor Authentication
  async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/2fa/enable`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error('2FA enable failed');
      }

      return await response.json();
    } catch (error) {
      console.error('2FA enable failed:', error);
      throw error;
    }
  }

  async verifyTwoFactor(token: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        throw new Error('2FA verification failed');
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
      throw error;
    }
  }

  // Activity Logging
  async logActivity(activity: string, data?: any): Promise<void> {
    try {
      await fetch(`${this.API_BASE_URL}/auth/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          activity,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (error) {
      console.warn('Activity logging failed:', error);
    }
  }

  // Utility Methods
  getTerminologyForUser(): 'military' | 'civilian' | 'both' {
    if (!this.currentUser) return 'civilian';

    // Military roles default to military terminology
    if (['super_admin', 'admin', 'supervisor'].includes(this.currentUser.role)) {
      return 'military';
    }

    // Field workers might prefer civilian terms
    if (['field_worker', 'operator'].includes(this.currentUser.role)) {
      return 'civilian';
    }

    return 'both';
  }

  getWelcomeMessage(): string {
    if (!this.currentUser) return 'Welcome';

    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 18 ? 'Good afternoon' : 'Good evening';
    
    return `${greeting}, ${this.currentUser.firstName}`;
  }

  shouldShowFeature(feature: string): boolean {
    return this.isAuthenticated() && this.canAccessFeature(feature);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// React Hook for Authentication
export const useAuth = () => {
  const [user, setUser] = React.useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      setUser(authService.getCurrentUser());
    };

    // Check auth status on mount and when storage changes
    checkAuth();
    window.addEventListener('storage', checkAuth);

    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const user = await authService.login(credentials);
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: authService.isAuthenticated(),
    isLoading,
    login,
    logout,
    hasPermission: authService.hasPermission.bind(authService),
    hasRole: authService.hasRole.bind(authService),
    canAccessFeature: authService.canAccessFeature.bind(authService)
  };
};

// Mock authentication for development
export const mockAuth = {
  async loginAsDemoUser(role: UserRole = 'supervisor'): Promise<User> {
    const mockUser: User = {
      id: 'demo-user-' + role,
      email: `demo-${role}@blacktop-blackout.com`,
      firstName: 'Demo',
      lastName: role.charAt(0).toUpperCase() + role.slice(1),
      role,
      permissions: authService['ROLE_PERMISSIONS'][role],
      department: 'Operations',
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Simulate API response
    const mockToken: AuthToken = {
      token: 'demo-jwt-token-' + Date.now(),
      refreshToken: 'demo-refresh-token-' + Date.now(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
      user: mockUser
    };

    authService['authToken'] = mockToken.token;
    authService['refreshToken'] = mockToken.refreshToken;
    authService['currentUser'] = mockUser;

    localStorage.setItem('authToken', mockToken.token);
    localStorage.setItem('refreshToken', mockToken.refreshToken);
    localStorage.setItem('currentUser', JSON.stringify(mockUser));

    return mockUser;
  }
};