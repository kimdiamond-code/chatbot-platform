// Authentication Service
// Handles login, logout, session management

const AUTH_STORAGE_KEY = 'chatbot_auth';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.initializeAuth();
  }

  initializeAuth() {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        // Check if token is expired
        if (data.expiresAt && new Date(data.expiresAt) > new Date()) {
          this.currentUser = data;
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to parse stored auth:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
  }

  async login(email, password) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'auth',
          action: 'login',
          email,
          password
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Login response not OK:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Login failed');
        } catch (e) {
          throw new Error(`Login failed: ${response.statusText}`);
        }
      }

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse login response:', e);
        throw new Error('Invalid server response. Please try again.');
      }

      if (!data.success) {
        throw new Error(data.error || 'Login failed');
      }

      // Store auth data
      const authData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        organizationId: data.user.organization_id,
        token: data.token,
        expiresAt: data.expiresAt
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      this.currentUser = authData;
      this.notifyListeners();

      return authData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async signup(email, password, name) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'auth',
          action: 'signup',
          email,
          password,
          name
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Signup response not OK:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || 'Signup failed');
        } catch (e) {
          throw new Error(`Signup failed: ${response.statusText}`);
        }
      }

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse signup response:', e);
        throw new Error('Invalid server response. Please try again.');
      }

      if (!data.success) {
        throw new Error(data.error || 'Signup failed');
      }

      // Store auth data (auto-login after signup)
      const authData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        organizationId: data.user.organization_id,
        token: data.token,
        expiresAt: data.expiresAt
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      this.currentUser = authData;
      this.notifyListeners();

      return authData;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      if (this.currentUser?.token) {
        await fetch('/api/consolidated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: 'auth',
            action: 'logout',
            token: this.currentUser.token
          })
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      this.currentUser = null;
      this.notifyListeners();
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  getToken() {
    return this.currentUser?.token;
  }

  // Subscribe to auth changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'auth',
          action: 'request_reset',
          email
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Password reset request failed:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error('Failed to request password reset. Please try again later.');
      }

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse password reset response:', e);
        throw new Error('Invalid server response. Please try again.');
      }

      return data;
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'auth',
          action: 'reset_password',
          token,
          newPassword
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Change password (when logged in)
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await fetch('/api/consolidated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'auth',
          action: 'change_password',
          token: this.currentUser?.token,
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
