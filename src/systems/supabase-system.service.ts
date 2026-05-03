import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl =
      (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ugedscjzlezumceczfrk.supabase.co';
    const supabaseKey =
      (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnZWRzY2p6bGV6dW1jZWN6ZnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2OTI2NDgsImV4cCI6MjA5MzI2ODY0OH0.JOarma-bj8-ojSaB175krXGtqA7ni3OLTZdcLVpdunM';
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  get client() {
    return this.supabase;
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
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
