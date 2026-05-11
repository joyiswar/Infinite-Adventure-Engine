
import { Injectable } from '@angular/core';
import { SaveData } from '../models/savedata.model';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SaveGameService {
  private readonly savePrefix = 'adventure_save_slot_';
  private supabase: SupabaseClient | null = null;

  constructor() {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      this.supabase = createClient(supabaseUrl, supabaseAnonKey);
    }
  }

  async save(slotId: number, data: SaveData): Promise<void> {
    // 1. Save to Local Storage (Fallback/Offline)
    try {
      const key = `${this.savePrefix}${slotId}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Game saved to local slot ${slotId}`);
    } catch (error) {
      console.error(`Error saving game to local slot ${slotId}:`, error);
    }

    // 2. Save to Supabase (Cloud Save) if authenticated
    if (this.supabase) {
      try {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (user) {
          const { error } = await this.supabase
            .from('save_slots')
            .upsert({
              user_id: user.id,
              slot_id: slotId,
              save_data: data,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,slot_id' });

          if (error) throw error;
          console.log(`Game saved to Supabase slot ${slotId}`);
        }
      } catch (error) {
        console.error(`Error saving game to Supabase:`, error);
      }
    }
  }

  async load(slotId: number): Promise<SaveData | null> {
    // 1. Try to load from Supabase if authenticated (preferred)
    if (this.supabase) {
      try {
        const { data: { user } } = await this.supabase.auth.getUser();
        if (user) {
          const { data, error } = await this.supabase
            .from('save_slots')
            .select('save_data')
            .eq('user_id', user.id)
            .eq('slot_id', slotId)
            .single();

          if (data && !error) {
            console.log(`Game loaded from Supabase slot ${slotId}`);
            return data.save_data as SaveData;
          }
        }
      } catch (error) {
        console.warn(`Could not load from Supabase, falling back to local storage:`, error);
      }
    }

    // 2. Fallback to Local Storage
    try {
      const key = `${this.savePrefix}${slotId}`;
      const savedData = localStorage.getItem(key);
      if (savedData) {
        console.log(`Game loaded from local slot ${slotId}`);
        return JSON.parse(savedData) as SaveData;
      }
    } catch (error) {
      console.error(`Error loading game from local slot ${slotId}:`, error);
    }

    return null;
  }

  async getSaveSlots(): Promise<(SaveData | null)[]> {
    const slots = [0, 1, 2, 3];
    const promises = slots.map(id => this.load(id));
    return Promise.all(promises);
  }
}
