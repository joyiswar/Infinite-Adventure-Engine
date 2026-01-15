
import { Achievement } from "./achievement.model";
import { CodexEntry } from "./codex.model";
import { GameState } from "./gamestate.model";

export type Difficulty = 'Easy' | 'Normal' | 'Hard';

export interface SaveData {
  gameState: GameState;
  currentImage: string;
  characterPortraitUrl?: string;
  storyHistory: string[];
  achievements: Achievement[];
  difficulty: Difficulty;
  combatEncounters: number;
  timestamp: number;
  codex?: CodexEntry[];
}