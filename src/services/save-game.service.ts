import { Injectable } from '@angular/core';
import { SaveData } from '../models/savedata.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class SaveGameService {
  constructor(private supabase: SupabaseService) {}

  async save(slotId: number, data: SaveData): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.user;
      if (!user) {
        // Fallback to localStorage if not logged in
        localStorage.setItem(`adventure_save_slot_${slotId}`, JSON.stringify(data));
        return;
      }

      const { error } = await this.supabase.client
        .from('save_slots')
        .upsert({
          slot_id: slotId,
          user_id: user.id,
          data: data as any,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,slot_id' });

      if (error) throw error;
      console.log(`Game saved to slot ${slotId} in cloud`);
    } catch (error) {
      console.error(`Error saving game to slot ${slotId}:`, error);
    }
  }

  async load(slotId: number): Promise<SaveData | null> {
    try {
      const { data: { user } } = await this.supabase.user;
      if (!user) {
        const savedData = localStorage.getItem(`adventure_save_slot_${slotId}`);
        return savedData ? JSON.parse(savedData) as SaveData : null;
      }

      const { data, error } = await this.supabase.client
        .from('save_slots')
        .select('data')
        .eq('user_id', user.id)
        .eq('slot_id', slotId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data ? (data.data as unknown as SaveData) : null;
    } catch (error) {
      console.error(`Error loading game from slot ${slotId}:`, error);
      return null;
    }
  }

  async getSaveSlots(): Promise<(SaveData | null)[]> {
    const { data: { user } } = await this.supabase.user;
    if (!user) {
      return [0, 1, 2, 3].map(id => {
        const savedData = localStorage.getItem(`adventure_save_slot_${id}`);
        return savedData ? JSON.parse(savedData) as SaveData : null;
      });
    }

    const { data, error } = await this.supabase.client
      .from('save_slots')
      .select('slot_id, data')
      .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching save slots:', error);
        return [null, null, null, null];
    }

    const slots: (SaveData | null)[] = [null, null, null, null];
    data?.forEach(item => {
      if (item.slot_id >= 0 && item.slot_id <= 3) {
        slots[item.slot_id] = item.data as unknown as SaveData;
      }
    });
    return slots;
  }
}
