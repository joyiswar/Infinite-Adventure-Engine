import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GameState } from '../entities/gamestate.model';
import { Difficulty } from '../entities/savedata.model';
import { SupabaseService } from '../systems/supabase-system.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private storyHistory: string[] = [];
  private readonly achievementsToAward = [
      { id: 'treasure-hunter', description: 'Acquire your first item.' },
      { id: 'pathfinder', description: 'Discover a hidden location or secret path.' },
      { id: 'risky-business', description: 'Make a particularly daring, unusual, or clever choice.' },
      { id: 'giant-slayer', description: 'Defeat a powerful foe or overcome a great challenge.' }
  ];

  constructor(private http: HttpClient, private supabase: SupabaseService) {}

  private get edgeFunctionUrl() {
    return `${this.supabase.url}/functions/v1/adventure-engine`;
  }

  getStoryHistory(): string[] {
    return this.storyHistory;
  }

  setStoryHistory(history: string[]): void {
    this.storyHistory = history;
  }

  async generateStorySegment(playerChoice?: string, difficulty: Difficulty = 'Normal', combatEncounters: number = 0): Promise<GameState> {
    const achievementsString = this.achievementsToAward.map(a => `- ${a.id}: ${a.description}`).join('\n');

    const systemInstruction = `You are an Advanced AI Game Master.
    Your mission is to orchestrate a complex, procedural fantasy world where choices have weight.

    CURRENT DIFFICULTY: ${difficulty}.
    - Scale encounters, puzzle complexity, and NPC hostility accordingly.
    - At 'Hard', include more tactical trade-offs and resource scarcity.

    PROCEDURAL DEPTH:
    - Introduce NPCs with unique motivations and secrets.
    - Create environmental events (weather changes, magical anomalies).
    - Track world state implicitly through narrative.

    COMBAT & CHALLENGES:
    - Manage structured combat. Completed encounters: ${combatEncounters}.
    - Ensure tactical variety based on enemy types (Brutes, Casters, etc.).

    ACHIEVEMENTS: ${achievementsString}

    LORE & WORLD-BUILDING:
    - Generate concise codex entries for NEW discoveries.

    Return valid JSON matching the GameState model.`;

    let prompt = "Start a new fantasy adventure for me. I awaken in a mysterious place.";
    if (playerChoice) {
      this.storyHistory.push(`Player chose: ${playerChoice}`);
      prompt = `Continue the story based on the player's last choice. The story so far:\n${this.storyHistory.join('\n')}`;
    }

    try {
      const { data: { session } } = await this.supabase.client.auth.getSession();
      const headers = {
        'Authorization': `Bearer ${session?.access_token || ''}`,
        'Content-Type': 'application/json'
      };

      const response = await firstValueFrom(this.http.post<any>(this.edgeFunctionUrl, {
        action: 'generateStory',
        payload: { prompt, systemInstruction }
      }, { headers }));

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
        codexEntries: []
      };
  }
}
