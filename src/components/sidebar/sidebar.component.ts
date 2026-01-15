
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Achievement } from '../../models/achievement.model';
import { CodexEntry } from '../../models/codex.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  inventory = input.required<string[]>();
  quest = input.required<string>();
  achievements = input.required<Achievement[]>();
  newAchievement = input<boolean>(false);
  lastUnlockedId = input<string | null>(null);

  codex = input<CodexEntry[]>([]);
  newCodexEntry = input<boolean>(false);
  lastAddedCodexTitle = input<string | null>(null);
}