import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../entities/inventory.model';
import { Achievement } from '../../entities/achievement.model';
import { CodexEntry } from '../../entities/codex.model';
import { SupabaseService } from '../../systems/supabase-system.service';
import { PlayGamesService } from '../../systems/play-games.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() inventory: InventoryItem[] = [];
  @Input() quest: string = '';
  @Input() achievements: Achievement[] = [];
  @Input() newAchievement: boolean = false;
  @Input() lastUnlockedId: string | null = null;
  @Input() codex: CodexEntry[] = [];
  @Input() newCodexEntry: boolean = false;
  @Input() lastAddedCodexTitle: string | null = null;
  @Input() characterPortraitUrl: string = '';

  user = signal<any>(null);

  constructor(
    private supabase: SupabaseService,
    public playGames: PlayGamesService
  ) {
    this.checkUser();
  }

  async checkUser() {
    const { data: { user } } = await this.supabase.user;
    this.user.set(user);
  }

  async login() {
    await this.supabase.signInWithGoogle();
    await this.checkUser();
  }

  async logout() {
    await this.supabase.signOut();
    this.user.set(null);
    window.location.reload();
  }

  isAchievementNew(id: string): boolean {
    return this.newAchievement && this.lastUnlockedId === id;
  }

  isCodexNew(title: string): boolean {
    return this.newCodexEntry && this.lastAddedCodexTitle === title;
  }

  async linkPlayGames() {
    await this.playGames.linkAccount();
  }
}
