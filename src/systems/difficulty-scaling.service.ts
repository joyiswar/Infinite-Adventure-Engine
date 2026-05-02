import { Injectable, signal } from '@angular/core';
import { Difficulty } from '../entities/savedata.model';
import { GameState } from '../entities/gamestate.model';

@Injectable({
  providedIn: 'root'
})
export class DifficultyScalingService {
  currentDifficulty = signal<Difficulty>('Normal');
  private successStreak = 0;

  update(outcome: GameState['outcome']): void {
    if (outcome === 'success') {
      this.successStreak++;
      if (this.currentDifficulty() === 'Normal' && this.successStreak >= 3) {
        this.currentDifficulty.set('Hard');
        this.successStreak = 0;
      } else if (this.currentDifficulty() === 'Easy' && this.successStreak >= 2) {
        this.currentDifficulty.set('Normal');
        this.successStreak = 0;
      }
    } else if (outcome === 'failure') {
      this.successStreak = 0;
      if (this.currentDifficulty() === 'Hard') {
        this.currentDifficulty.set('Normal');
      } else if (this.currentDifficulty() === 'Normal') {
        this.currentDifficulty.set('Easy');
      }
    }
  }

  set(difficulty: Difficulty): void {
    this.currentDifficulty.set(difficulty);
    this.successStreak = 0;
  }
}
