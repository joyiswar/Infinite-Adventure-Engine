
import { Injectable } from '@angular/core';
import { SaveData } from '../models/savedata.model';

@Injectable({
  providedIn: 'root'
})
export class SaveGameService {
  private readonly savePrefix = 'adventure_save_slot_';

  save(slotId: number, data: SaveData): void {
    try {
      const key = `${this.savePrefix}${slotId}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Game saved to slot ${slotId}`);
    } catch (error) {
      console.error(`Error saving game to slot ${slotId}:`, error);
      // Optionally notify the user that the save failed
    }
  }

  load(slotId: number): SaveData | null {
    try {
      const key = `${this.savePrefix}${slotId}`;
      const savedData = localStorage.getItem(key);
      if (savedData) {
        console.log(`Game loaded from slot ${slotId}`);
        return JSON.parse(savedData) as SaveData;
      }
      return null;
    } catch (error) {
      console.error(`Error loading game from slot ${slotId}:`, error);
      return null;
    }
  }

  getSaveSlots(): (SaveData | null)[] {
    const slots = [0, 1, 2, 3]; // Slot 0 is now the autosave slot
    return slots.map(id => this.load(id));
  }
}
