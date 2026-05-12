import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private _anonKey: string;

  currentUser = signal<User | null>(null);
  authInitialized = signal<boolean>(false);

  constructor() {
    const supabaseUrl =
      (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ugedscjzlezumceczfrk.supabase.co';
    const supabaseKey =
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZWRzY2p6bGV6dW1jZWN6ZnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2OTI2NDgsImV4cCI6MjA5MzI2ODY0OH0.JOarma-bj8-ojSaB175krXGtqA7ni3OLTZdcLVpdunM';

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      }
    });
    this._anonKey = supabaseKey;

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Aether Engine Auth Sync:', event, session?.user?.email);
      this.currentUser.set(session?.user ?? null);
      this.authInitialized.set(true);

      // Clear hash if we just logged in
      if (event === 'SIGNED_IN' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    // Initial session recovery
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session) {
        console.log('Restored session for:', session.user.email);
        this.currentUser.set(session.user);
      }
    } catch (e) {
      console.error('Initial auth recovery failed:', e);
    } finally {
      this.authInitialized.set(true);
    }
  }

  get anonKey() { return this._anonKey; }

  get client() {
    return this.supabase;
  }

  async signInWithGoogle() {
    return await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: false
      }
    });
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    this.currentUser.set(null);
    return { error };
  }

  get user() {
    return this.supabase.auth.getUser();
  }

  get url() {
    return (
      (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ugedscjzlezumceczfrk.supabase.co'
    );
  }
}
