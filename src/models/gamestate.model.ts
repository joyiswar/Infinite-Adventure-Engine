
export interface Choice {
  id: number;
  text: string;
}

export interface GameState {
  story: string;
  choices: Choice[];
  quest: string;
  inventory: string[];
  imagePrompt: string;
  unlockedAchievementId?: string;
  outcome?: 'success' | 'neutral' | 'failure';
  inCombat?: boolean;
  combatResult?: 'victory' | 'defeat';
  combatStage?: {
    current: number;
    total: number;
  };
}
