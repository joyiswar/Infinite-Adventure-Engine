
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AdventureComponent } from './components/adventure/adventure.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { GameState } from './models/gamestate.model';
import { AchievementService } from './services/achievement.service';
import { Achievement } from './models/achievement.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AudioService } from './services/audio.service';

interface Toast {
  title: string;
  message: string;
  show: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AdventureComponent, SidebarComponent]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Infinite Adventure Engine';
  
  inventory = signal<string[]>([]);
  quest = signal<string>('Your quest has not yet been revealed.');
  unlockedAchievements = signal<Achievement[]>([]);
  newAchievementUnlocked = signal(false);
  lastUnlockedAchievementId = signal<string | null>(null);

  toast = signal<Toast>({ title: '', message: '', show: false });
  private achievementSub!: Subscription;

  constructor(
    private achievementService: AchievementService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.unlockedAchievements.set(this.achievementService.getUnlockedAchievements());
    
    this.achievementSub = this.achievementService.onAchievementUnlocked.subscribe(achievement => {
      this.unlockedAchievements.set(this.achievementService.getUnlockedAchievements());
      this.showToast('Achievement Unlocked!', achievement.name);
      this.audioService.playSound('achievement');
      
      this.lastUnlockedAchievementId.set(achievement.id);
      this.newAchievementUnlocked.set(true);
      setTimeout(() => this.newAchievementUnlocked.set(false), 1500);
    });
  }

  ngOnDestroy(): void {
    this.achievementSub?.unsubscribe();
  }

  onGameStateChange(newState: GameState) {
    this.inventory.set(newState.inventory);
    this.quest.set(newState.quest);
  }
  
  private showToast(title: string, message: string): void {
    this.toast.set({ title, message, show: true });
    setTimeout(() => {
      this.toast.update(t => ({...t, show: false}));
    }, 5000);
  }
}
