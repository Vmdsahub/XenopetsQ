import { supabase, handleSupabaseError } from '../lib/supabase';
import { AuthUser, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth';

export class SupabaseAuthService {
  private static instance: SupabaseAuthService;
  
  public static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        return {
          success: false,
          message: 'Passwords do not match',
          errors: [{ field: 'confirmPassword', message: 'Passwords do not match' }]
        };
      }

      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            phone: credentials.phone,
            language: this.detectLanguage()
          }
        }
      });

      if (error) {
        return {
          success: false,
          message: handleSupabaseError(error),
          errors: [{ field: 'general', message: handleSupabaseError(error) }]
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: 'Registration failed',
          errors: [{ field: 'general', message: 'Failed to create user account' }]
        };
      }

      // Get the created profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        username: profile?.username || credentials.username,
        phone: profile?.phone || credentials.phone,
        isAdmin: profile?.is_admin || false,
        isVerified: data.user.email_confirmed_at !== null,
        language: profile?.language || this.detectLanguage(),
        accountScore: profile?.account_score || 0,
        daysPlayed: profile?.days_played || 0,
        totalXenocoins: profile?.total_xenocoins || 0,
        createdAt: new Date(data.user.created_at),
        lastLogin: new Date(),
        preferences: profile?.preferences || this.getDefaultPreferences()
      };

      return {
        success: true,
        user: authUser,
        token: data.session?.access_token,
        message: 'Registration successful'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.',
        errors: [{ field: 'general', message: 'An unexpected error occurred' }]
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {
        return {
          success: false,
          message: handleSupabaseError(error),
          errors: [{ field: 'general', message: handleSupabaseError(error) }]
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          message: 'Login failed',
          errors: [{ field: 'general', message: 'Invalid credentials' }]
        };
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        username: profile?.username || 'User',
        phone: profile?.phone,
        isAdmin: profile?.is_admin || false,
        isVerified: data.user.email_confirmed_at !== null,
        language: profile?.language || this.detectLanguage(),
        accountScore: profile?.account_score || 0,
        daysPlayed: profile?.days_played || 0,
        totalXenocoins: profile?.total_xenocoins || 0,
        createdAt: new Date(data.user.created_at),
        lastLogin: new Date(profile?.last_login || data.user.created_at),
        preferences: profile?.preferences || this.getDefaultPreferences()
      };

      return {
        success: true,
        user: authUser,
        token: data.session.access_token,
        message: 'Login successful'
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed. Please try again.',
        errors: [{ field: 'general', message: 'An unexpected error occurred' }]
      };
    }
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return {
          success: false,
          message: handleSupabaseError(error),
          errors: [{ field: 'email', message: handleSupabaseError(error) }]
        };
      }

      return {
        success: true,
        message: 'Password reset link has been sent to your email.'
      };

    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: 'Password reset failed. Please try again.',
        errors: [{ field: 'general', message: 'An unexpected error occurred' }]
      };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email!,
        username: profile?.username || 'User',
        phone: profile?.phone,
        isAdmin: profile?.is_admin || false,
        isVerified: user.email_confirmed_at !== null,
        language: profile?.language || this.detectLanguage(),
        accountScore: profile?.account_score || 0,
        daysPlayed: profile?.days_played || 0,
        totalXenocoins: profile?.total_xenocoins || 0,
        createdAt: new Date(user.created_at),
        lastLogin: new Date(profile?.last_login || user.created_at),
        preferences: profile?.preferences || this.getDefaultPreferences()
      };

    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  private detectLanguage(): string {
    const userLang = navigator.language || navigator.languages[0];
    const countryCode = userLang.split('-')[0];
    
    const languageMap: Record<string, string> = {
      'pt': 'pt-BR',
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN'
    };
    
    return languageMap[countryCode] || 'en-US';
  }

  private getDefaultPreferences() {
    return {
      notifications: true,
      soundEffects: true,
      musicVolume: 0.7,
      language: this.detectLanguage(),
      theme: 'light' as const,
      privacy: {
        showOnline: true,
        allowDuels: true,
        allowTrades: true
      }
    };
  }
}

export const supabaseAuthService = SupabaseAuthService.getInstance();