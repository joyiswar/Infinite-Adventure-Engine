
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { AdventureComponent } from './components/adventure/adventure.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { GameState } from './models/gamestate.model';
import { AchievementService } from './services/achievement.service';
import { Achievement } from './models/achievement.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AudioService } from './services/audio.service';
import { LoreCodexService } from './services/lore-codex.service';
import { CodexEntry } from './models/codex.model';
import { InventoryItem } from './models/inventory.model';

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
  
  inventory = signal<InventoryItem[]>([]);
  quest = signal<string>('Your quest has not yet been revealed.');
  characterPortraitUrl = signal<string>('');
  
  unlockedAchievements = signal<Achievement[]>([]);
  newAchievementUnlocked = signal(false);
  lastUnlockedAchievementId = signal<string | null>(null);
  private achievementSub!: Subscription;

  codex = signal<CodexEntry[]>([]);
  newCodexEntryAdded = signal(false);
  lastAddedCodexTitle = signal<string|null>(null);
  private codexSub!: Subscription;

  toast = signal<Toast>({ title: '', message: '', show: false });

  constructor(
    private achievementService: AchievementService,
    private audioService: AudioService,
    private loreCodexService: LoreCodexService
  ) {}

  ngOnInit(): void {
    this.unlockedAchievements.set(this.achievementService.getUnlockedAchievements());
    this.codex.set(this.loreCodexService.codex());
    
    this.achievementSub = this.achievementService.onAchievementUnlocked.subscribe(achievement => {
      this.unlockedAchievements.set(this.achievementService.getUnlockedAchievements());
      this.showToast('Achievement Unlocked!', achievement.name);
      this.audioService.playSound('achievement');
      
      this.lastUnlockedAchievementId.set(achievement.id);
      this.newAchievementUnlocked.set(true);
      setTimeout(() => this.newAchievementUnlocked.set(false), 1500);
    });

    this.codexSub = this.loreCodexService.onCodexEntryAdded.subscribe(entry => {
      this.codex.set(this.loreCodexService.codex());
      this.showToast('Codex Updated', entry.title);
      this.audioService.playSound('item');

      this.lastAddedCodexTitle.set(entry.title);
      this.newCodexEntryAdded.set(true);
      setTimeout(() => this.newCodexEntryAdded.set(false), 1500);
    });
  }

  ngOnDestroy(): void {
    this.achievementSub?.unsubscribe();
    this.codexSub?.unsubscribe();
  }

  onGameStateChange(newState: GameState) {
    this.inventory.set(newState.inventory);
    this.quest.set(newState.quest);
  }

  onPortraitChange(url: string) {
    this.characterPortraitUrl.set(url);
  }
  
  private showToast(title: string, message: string): void {
    this.toast.set({ title, message, show: true });
    setTimeout(() => {
      this.toast.update(t => ({...t, show: false}));
    }, 5000);
  }
}