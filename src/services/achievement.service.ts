
import { Injectable, signal, WritableSignal } from '@angular/core';
import { Achievement } from '../models/achievement.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private readonly storageKey = 'adventure_achievements';
  
  achievements: WritableSignal<Achievement[]> = signal(this.loadAchievements());

  public onAchievementUnlocked = new Subject<Achievement>();

  private loadAchievements(): Achievement[] {
    const predefinedAchievements: Achievement[] = [
      { id: 'first-step', name: 'First Steps', description: 'Began your infinite adventure.', unlocked: false },
      { id: 'treasure-hunter', name: 'Treasure Hunter', description: 'Acquired your first item.', unlocked: false },
      { id: 'pathfinder', name: 'Pathfinder', description: 'Discovered a hidden location.', unlocked: false },
      { id: 'risky-business', name: 'Risky Business', description: 'Made a bold and unusual choice.', unlocked: false },
      { id: 'giant-slayer', name: 'Giant Slayer', description: 'Overcame a great challenge.', unlocked: false },
    ];

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const savedAchievements: Achievement[] = JSON.parse(saved);
        // Ensure all predefined achievements are present, even if added in a new version
        return predefinedAchievements.map(pa => {
          const savedVersion = savedAchievements.find(sa => sa.id === pa.id);
          return savedVersion || pa;
        });
      }
    } catch (e) {
      console.error('Failed to load achievements from localStorage', e);
    }
    return predefinedAchievements;
  }

  unlock(id: string): void {
    const achievementToUnlock = this.achievements().find(a => a.id === id);
    if (achievementToUnlock && !achievementToUnlock.unlocked) {
      this.achievements.update(achievements => 
        achievements.map(a => a.id === id ? { ...a, unlocked: true } : a)
      );
      this.saveAchievements();
      this.onAchievementUnlocked.next({ ...achievementToUnlock, unlocked: true });
    }
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements().filter(a => a.unlocked);
  }

  private saveAchievements(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.achievements()));
    } catch (e) {
      console.error('Failed to save achievements to localStorage', e);
    }
  }
}
