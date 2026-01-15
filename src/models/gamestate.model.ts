
import { CodexEntry } from "./codex.model";
import { InventoryItem } from "./inventory.model";

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
  unlockedAchievementId?: string;
  outcome?: 'success' | 'neutral' | 'failure';
  inCombat?: boolean;
  combatResult?: 'victory' | 'defeat';
  combatStage?: {
    current: number;
    total: number;
  };
  codexEntries?: CodexEntry[];
  characterPortraitPrompt?: string;
}