import { Component, Input, computed, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryItem } from '../../entities/inventory.model';
import { Achievement } from '../../entities/achievement.model';
import { CodexEntry } from '../../entities/codex.model';
import { SupabaseService } from '../../systems/supabase-system.service';
import { PlayGamesService } from '../../systems/play-games.service';
import { TelemetrySystem } from '../../systems/telemetry-system.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  @Input() inventory: InventoryItem[] | null = [];
  @Input() quest: string = '';
  @Input() achievements: Achievement[] = [];
  @Input() newAchievement: boolean = false;
  @Input() lastUnlockedId: string | null = null;
  @Input() codex: CodexEntry[] = [];
  @Input() newCodexEntry: boolean = false;
  @Input() lastAddedCodexTitle: string | null = null;
  @Input() characterPortraitUrl: string = '';

  @Output() itemDetail = new EventEmitter<InventoryItem>();

  user = computed(() => this.supabase.currentUser());

  constructor(
    private supabase: SupabaseService,
    public playGames: PlayGamesService,
    public telemetry: TelemetrySystem
  ) {}

  async login() {
    await this.supabase.signInWithGoogle();
  }

  async logout() {
    await this.supabase.signOut();
    window.location.reload();
  }

  showItemDetail(item: InventoryItem) {
    this.itemDetail.emit(item);
  }

  async linkPlayGames() {
    await this.playGames.linkAccount();
  }
}
