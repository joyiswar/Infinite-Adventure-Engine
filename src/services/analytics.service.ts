import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private supabase: SupabaseClient | null = null;

  constructor() {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('Supabase credentials missing. Analytics disabled.');
    }
  }

  async logPerformance(metrics: any) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.from('performance_logs').insert({
        ...metrics,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging performance:', error);
    }
  }

  async logEvent(eventType: string, payload: any) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase.from('gameplay_metrics').insert({
        event_type: eventType,
        payload,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }
}
