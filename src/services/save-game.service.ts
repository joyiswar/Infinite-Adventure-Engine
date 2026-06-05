
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

  private isValidSaveData(data: any): data is SaveData {
    return (
      data &&
      typeof data === 'object' &&
      data.gameState &&
      Array.isArray(data.storyHistory) &&
      typeof data.timestamp === 'number' &&
      !Object.prototype.hasOwnProperty.call(data, '__proto__')
    );
  }

  load(slotId: number): SaveData | null {
    try {
      const key = `${this.savePrefix}${slotId}`;
      const savedData = localStorage.getItem(key);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (this.isValidSaveData(parsed)) {
          console.log(`Game loaded from slot ${slotId}`);
          return parsed;
        } else {
          console.error(`Invalid save data in slot ${slotId}`);
          return null;
        }
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
