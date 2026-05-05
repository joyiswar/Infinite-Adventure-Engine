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
    const achievementsString = this.achievementsToAward
      .map((a) => `- ${a.id}: ${a.description}`)
      .join('\n');

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
      "inCombat": Boolean
    }

    VISUAL LANGUAGE: Aether-Circuit (Deep Space Charcoal, Ignition Amber, Neural Cyan).

    DIFFICULTY: ${difficulty}. Scale encounters and resource scarcity.

    Return ONLY raw JSON.`;

    let prompt = 'Start a new fantasy adventure for me. I awaken in a mysterious place.';
    if (playerChoice) {
      this.storyHistory.push(`Player chose: ${playerChoice}`);
      prompt = `Continue the story based on the player's last choice. The story so far:\n${this.storyHistory.join('\n')}`;
    }

    try {
      const {
        data: { session },
      } = await this.supabase.client.auth.getSession();
      const headers = {
        'Authorization': `Bearer ${session?.access_token || (this.supabase as any).anonKey}`,
        'apikey': (this.supabase as any).anonKey,
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
      console.error('Error generating story segment:', error);
      return this.getFallbackState();
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    return null;
  }

  private getFallbackState(): GameState {
    return {
      story: 'The mists of creation swirl, but the path ahead is unclear. An error has occurred.',
      choices: [{ id: 1, text: 'Try again.' }],
      quest: 'Recover from an error.',
      inventory: [],
      imagePrompt: 'A swirling vortex.',
      shouldGenerateNewImage: true,
      outcome: 'failure',
      inCombat: false,
      codexEntries: [],
    };
  }
}
