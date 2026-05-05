import { CodexEntry } from './codex.model';
import { InventoryItem } from './inventory.model';

export type MissionPhase = 'Diagnostics' | 'Briefing' | 'Ignition' | 'ActiveOps';

export interface Choice {
  id: number;
  text: string;
}

export interface GameState {
  story: string;
  choices: Choice[];
  quest: string;
  inventory: InventoryItem[];
  imagePrompt: string;
  shouldGenerateNewImage: boolean;
  phase: MissionPhase;
  telemetry?: {
    neuralStability: number;
    aetherVelocity: number;
    gForce: number;
  };
  unlockedAchievementId?: string;
  outcome?: 'success' | 'neutral' | 'failure';
  inCombat?: boolean;
  combatResult?: 'victory' | 'defeat';
  codexEntries?: CodexEntry[];
  characterPortraitPrompt?: string;
}
