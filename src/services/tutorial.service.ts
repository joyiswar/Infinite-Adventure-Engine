
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TutorialService {
  private readonly combatTutorialKey = 'adventure_combat_tutorial_seen';

  hasSeenCombatTutorial(): boolean {
    try {
      return localStorage.getItem(this.combatTutorialKey) === 'true';
    } catch (e) {
      console.error('Failed to access localStorage', e);
      // Fail safe: if we can't read, assume they haven't seen it, but it won't be saved.
      return false;
    }
  }

  markCombatTutorialAsSeen(): void {
    try {
      localStorage.setItem(this.combatTutorialKey, 'true');
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  }
}
