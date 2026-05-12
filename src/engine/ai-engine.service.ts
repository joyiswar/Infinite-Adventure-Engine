import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GameState } from '../entities/gamestate.model';
import { Difficulty } from '../entities/savedata.model';
import { SupabaseService } from '../systems/supabase-system.service';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private storyHistory: string[] = [];

  constructor(
    private http: HttpClient,
    private supabase: SupabaseService,
  ) {}

  private get edgeFunctionUrl() {
    return `${this.supabase.url}/functions/v1/adventure-engine`;
  }

  getStoryHistory(): string[] {
    return this.storyHistory;
  }

  setStoryHistory(history: string[]): void {
    this.storyHistory = history;
  }

  async generateStorySegment(
    playerChoice?: string,
    difficulty: Difficulty = 'Normal',
    combatEncounters: number = 0,
  ): Promise<GameState> {
    const systemInstruction = `You are the Aether Engine GM, driving a high-fidelity 'Aether OS' tactical experience.

    MISSION CONTROL RULES:
    1. CURRENT_PHASE must transition logically: 'Diagnostics' -> 'Briefing' -> 'Ignition' -> 'ActiveOps'.
    2. Respond with ONLY valid JSON.
    3. Inject technical telemetry for every state.

    JSON SCHEMA:
    {
      "story": "Atmospheric narrative",
      "choices": [{"id": 1, "text": "Choice A"}],
      "quest": "Strategic objective",
      "inventory": [{"name": "Item", "description": "Desc"}],
      "imagePrompt": "Aether-Circuit cinematic visual style",
      "shouldGenerateNewImage": true,
      "phase": "Diagnostics" | "Briefing" | "Ignition" | "ActiveOps",
      "telemetry": {
        "neuralStability": 0-100,
        "aetherVelocity": 0-1,
        "gForce": 0-20
      },
      "outcome": "success" | "neutral" | "failure",
      "inCombat": boolean,
      "codexEntries": [{"title": "Entry", "content": "Text"}],
      "characterPortraitPrompt": "Portrait prompt (optional)"
    }`;

    let prompt = playerChoice
      ? `PLAYER CHOICE: ${playerChoice}. Continue the operation. History:\n${this.storyHistory.join('\n')}`
      : 'INITIALIZE MISSION: Diagnostics sequence required.';

    let lastError;
    for (let i = 0; i < 2; i++) {
      try {
        const { data: { session } } = await this.supabase.client.auth.getSession();
        const headers = {
          'Authorization': `Bearer ${session?.access_token || this.supabase.anonKey}`,
          'apikey': this.supabase.anonKey,
          'Content-Type': 'application/json',
        };

        const response = await firstValueFrom(
          this.http.post<any>(
            this.edgeFunctionUrl,
            { action: 'generateStory', payload: { prompt, systemInstruction } },
            { headers },
          ),
        );

        const gameState = response as GameState;
        this.storyHistory.push(`LOG: ${gameState.story.substring(0, 100)}`);
        if (this.storyHistory.length > 20) this.storyHistory.shift();
        return gameState;
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return this.getFallbackState();
  }

  async generateImage(prompt: string): Promise<string | null> { return null; }

  private getFallbackState(): GameState {
    return {
      story: 'CRITICAL_ERROR: Neural Uplink Failed. Attempting sub-system recovery...',
      choices: [{ id: 1, text: 'Force Reconnect' }],
      quest: 'System Recovery',
      inventory: [],
      imagePrompt: 'Static',
      shouldGenerateNewImage: true,
      outcome: 'failure',
      inCombat: false,
      phase: 'Diagnostics'
    };
  }
}
