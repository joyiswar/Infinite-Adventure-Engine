import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GameState } from '../models/gamestate.model';
import { Difficulty } from '../models/savedata.model';
import { catchError, retry, throwError, timeout, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private storyHistory: string[] = [];

  private readonly supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
  private readonly supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

  // The core prompt logic and schema are now handled by the 'adventure-engine'
  // Edge Function in Supabase to keep secrets and complex logic secure.
  // This refactor follows the security directive to use a proxy.

  constructor(private http: HttpClient) {}

  getStoryHistory(): string[] {
    return this.storyHistory;
  }

  setStoryHistory(history: string[]): void {
    this.storyHistory = history;
  }

  private sanitizeInput(input: string): string {
    return input.replace(/[<>]/g, '').trim().substring(0, 500);
  }

  async generateStorySegment(playerChoice?: string, difficulty: Difficulty = 'Normal', combatEncounters: number = 0): Promise<GameState> {
    const sanitizedChoice = playerChoice ? this.sanitizeInput(playerChoice) : undefined;
    
    const payload = {
      action: 'generate_story',
      playerChoice: sanitizedChoice,
      difficulty,
      combatEncounters,
      history: this.storyHistory
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.supabaseKey}`
    });

    try {
      const response = await this.http.post<GameState>(
        `${this.supabaseUrl}/functions/v1/adventure-engine`,
        payload,
        { headers }
      ).pipe(
        timeout(30000),
        retry({
          count: 3,
          delay: (error, retryCount) => {
            const backoffTime = Math.pow(2, retryCount) * 1000;
            return of(null).pipe(timeout(backoffTime));
          }
        }),
        catchError(err => {
          console.error('Proxy Error:', err);
          return throwError(() => new Error('Failed to generate story segment via proxy.'));
        })
      ).toPromise();

      if (response) {
        if (playerChoice) {
           this.storyHistory.push(`Player chose: ${playerChoice}`);
        }
        this.storyHistory.push(`Story continued: ${response.story}`);
        if (this.storyHistory.length > 20) {
          this.storyHistory = this.storyHistory.slice(-20);
        }
        return response;
      }
      throw new Error('Empty response from proxy');

    } catch (error) {
      console.error('Error generating story segment:', error);
      return this.getFallbackState();
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    const payload = {
      action: 'generate_image',
      prompt
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.supabaseKey}`
    });

    try {
      const response = await this.http.post<{ image: string }>(
        `${this.supabaseUrl}/functions/v1/adventure-engine`,
        payload,
        { headers }
      ).pipe(
        timeout(60000),
        retry(2),
        catchError(err => {
          console.error('Image Proxy Error:', err);
          return of(null);
        })
      ).toPromise();

      return response ? response.image : null;
    } catch (error) {
      console.error('Error generating image via proxy:', error);
      return null;
    }
  }

  private getFallbackState(): GameState {
    return {
      story: 'The mists of creation swirl, but the path ahead is unclear. An error has occurred. Perhaps try making a different choice, or starting anew.',
      choices: [{ id: 1, text: 'Try to restart the adventure.' }],
      quest: 'Recover from a mysterious error.',
      inventory: [],
      imagePrompt: 'A swirling vortex of colorful magical energy, abstract digital painting, cinematic lighting.',
      shouldGenerateNewImage: true,
      outcome: 'failure',
      inCombat: false,
      codexEntries: []
    };
  }
}
