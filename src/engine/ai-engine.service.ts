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
  private readonly achievementsToAward = [
    { id: 'treasure-hunter', description: 'Acquire your first item.' },
    { id: 'pathfinder', description: 'Discover a hidden location or secret path.' },
    { id: 'risky-business', description: 'Make a particularly daring, unusual, or clever choice.' },
    { id: 'giant-slayer', description: 'Defeat a powerful foe or overcome a great challenge.' },
  ];

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
    const systemInstruction = `You are the Aether Engine OS, a high-fidelity tactical interface for a sci-fi extraction experience.

    MISSION PHASES:
    1. 'Diagnostics': Sub-system verification and neural link calibration.
    2. 'Briefing': Tactical intel, objective setting, and threat analysis.
    3. 'Ignition': Cinematic transition sequence monitoring physics data (G-Force, Aether Velocity) and cognitive strain.
    4. 'ActiveOps': Real-time mission management and resource tracking.

    JSON SCHEMA:
    {
      "story": "Narrative string",
      "choices": [{"id": Number, "text": "String"}],
      "quest": "Current goal summary",
      "inventory": [{"name": "String", "description": "String"}],
      "imagePrompt": "Aether-Circuit style visual prompt",
      "shouldGenerateNewImage": Boolean,
      "phase": "Diagnostics" | "Briefing" | "Ignition" | "ActiveOps",
      "telemetry": {
        "neuralStability": Number (0-100),
        "aetherVelocity": Number (0-1),
        "gForce": Number (0-20)
      },
      "outcome": "success" | "neutral" | "failure",
      "inCombat": Boolean,
      "codexEntries": [{"title": "String", "content": "String"}],
      "unlockedAchievementId": "String (optional)"
    }

    VISUAL LANGUAGE: Aether-Circuit (Deep Space Charcoal, Ignition Amber, Neural Cyan).

    DIFFICULTY: ${difficulty}. Scale encounters and resource scarcity.

    Return ONLY raw JSON.`;

    let prompt = 'Start a new fantasy adventure for me. I awaken in a mysterious place.';
    if (playerChoice) {
      this.storyHistory.push(`Player chose: ${playerChoice}`);
      prompt = `Continue the story based on the player's last choice. The story so far:\n${this.storyHistory.join('\n')}`;
    }

    // Client-side retry logic for network transient errors
    let lastError;
    for (let i = 0; i < 2; i++) {
      try {
        const {
          data: { session },
        } = await this.supabase.client.auth.getSession();

        // Ensure apikey is passed in headers for anonymous access or verified access
        const headers = {
          'Authorization': `Bearer ${session?.access_token || this.supabase.anonKey}`,
          'apikey': this.supabase.anonKey,
          'Content-Type': 'application/json',
        };

        const response = await firstValueFrom(
          this.http.post<any>(
            this.edgeFunctionUrl,
            {
              action: 'generateStory',
              payload: { prompt, systemInstruction },
            },
            { headers },
          ),
        );

        const gameState = response as GameState;
        this.storyHistory.push(`Story continued: ${gameState.story}`);
        if (this.storyHistory.length > 20) {
          this.storyHistory = this.storyHistory.slice(-20);
        }
        return gameState;
      } catch (error) {
        lastError = error;
        console.warn(`GeminiService attempt ${i + 1} failed: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    console.error('All attempts to generate story segment failed:', lastError);
    return this.getFallbackState();
  }

  async generateImage(prompt: string): Promise<string | null> {
    return null;
  }

  private getFallbackState(): GameState {
    return {
      story: 'Neural link interrupted. Re-establishing connection through fallback sub-systems...',
      choices: [{ id: 1, text: 'Retry Link' }],
      quest: 'Recover from Neural Link failure.',
      inventory: [],
      imagePrompt: 'Static and noise on a tactical display.',
      shouldGenerateNewImage: true,
      outcome: 'failure',
      inCombat: false,
      codexEntries: [],
      phase: 'Diagnostics'
    };
  }
}
