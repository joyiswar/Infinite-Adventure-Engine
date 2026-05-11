
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { GameState } from '../models/gamestate.model';
import { Difficulty } from '../models/savedata.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private storyHistory: string[] = [];

  private readonly supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  private readonly supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  private readonly edgeFunctionUrl = `${this.supabaseUrl}/functions/v1/adventure-engine`;

  constructor(private http: HttpClient) {}

  getStoryHistory(): string[] {
    return this.storyHistory;
  }

  setStoryHistory(history: string[]): void {
    this.storyHistory = history;
  }

  /**
   * Sanitizes user input to prevent potential injection.
   */
  private sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, '').slice(0, 500);
  }

  /**
   * Validates the structure of the AI-generated GameState.
   */
  private validateGameState(state: any): GameState {
    const defaultState: GameState = {
      story: 'The story continues in an unexpected way...',
      choices: [{ id: 1, text: 'Look around.' }],
      quest: 'Continue your adventure.',
      inventory: [],
      imagePrompt: 'A mysterious fantasy landscape, cinematic digital painting.',
      shouldGenerateNewImage: false,
      outcome: 'neutral',
      inCombat: false,
      codexEntries: []
    };

    if (!state || typeof state !== 'object') return defaultState;

    return {
      story: typeof state.story === 'string' ? state.story : defaultState.story,
      choices: Array.isArray(state.choices) ? state.choices.filter((c: any) => c && typeof c.text === 'string') : defaultState.choices,
      quest: typeof state.quest === 'string' ? state.quest : defaultState.quest,
      inventory: Array.isArray(state.inventory) ? state.inventory.filter((i: any) => i && typeof i.name === 'string') : defaultState.inventory,
      imagePrompt: typeof state.imagePrompt === 'string' ? state.imagePrompt : defaultState.imagePrompt,
      shouldGenerateNewImage: !!state.shouldGenerateNewImage,
      outcome: ['success', 'neutral', 'failure'].includes(state.outcome) ? state.outcome : defaultState.outcome,
      inCombat: !!state.inCombat,
      combatResult: ['victory', 'defeat'].includes(state.combatResult) ? state.combatResult : undefined,
      combatStage: state.combatStage && typeof state.combatStage.current === 'number' ? state.combatStage : undefined,
      codexEntries: Array.isArray(state.codexEntries) ? state.codexEntries.filter((e: any) => e && typeof e.title === 'string') : defaultState.codexEntries,
      unlockedAchievementId: typeof state.unlockedAchievementId === 'string' ? state.unlockedAchievementId : undefined,
      characterPortraitPrompt: typeof state.characterPortraitPrompt === 'string' ? state.characterPortraitPrompt : undefined
    };
  }

  async generateStorySegment(playerChoice?: string, difficulty: Difficulty = 'Normal', combatEncounters: number = 0): Promise<GameState> {
    const sanitizedChoice = playerChoice ? this.sanitizeInput(playerChoice) : undefined;
    
    let prompt = "Start a new fantasy adventure for me. I awaken in a mysterious place.";
    if (sanitizedChoice) {
      this.storyHistory.push(`Player chose: ${sanitizedChoice}`);
      prompt = `Continue the story based on the player's last choice. The story so far:\n${this.storyHistory.join('\n')}`;
    }

    try {
      const response = await lastValueFrom(
        this.http.post<any>(this.edgeFunctionUrl, {
          action: 'generateStory',
          prompt,
          difficulty,
          combatEncounters,
          history: this.storyHistory
        }, {
          headers: {
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json'
          }
        })
      );

      const validatedState = this.validateGameState(response);

      if (validatedState.story) {
        this.storyHistory.push(`Story continued: ${validatedState.story}`);
      }

      if (this.storyHistory.length > 20) {
        this.storyHistory = this.storyHistory.slice(-20);
      }
      return validatedState;

    } catch (error) {
      console.error('Error generating story segment:', error);
      return this.validateGameState(null);
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    const sanitizedPrompt = this.sanitizeInput(prompt);
    try {
      const response = await lastValueFrom(
        this.http.post<{ image: string }>(this.edgeFunctionUrl, {
          action: 'generateImage',
          prompt: sanitizedPrompt
        }, {
          headers: {
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json'
          }
        })
      );

      return (response && typeof response.image === 'string') ? response.image : null;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  }
}
