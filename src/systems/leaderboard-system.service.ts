import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase-system.service';

export interface LeaderboardEntry {
  username: string;
  score: number;
  encounters_won: number;
  achievements_count: number;
}

@Injectable({
  providedIn: 'root',
})
export class LeaderboardSystem {
  constructor(private supabase: SupabaseService) {}

  async updateScore(
    score: number,
    encountersWon: number,
    achievementsCount: number,
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.supabase.user;
      if (!user) return;

      const username =
        user.user_metadata?.['full_name'] || user.email?.split('@')[0] || 'Unknown Traveler';

      const { error } = await this.supabase.client.from('leaderboard').upsert(
        {
          user_id: user.id,
          username,
          score,
          encounters_won: encountersWon,
          achievements_count: achievementsCount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

      if (error) throw error;
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  }

  async getTopPlayers(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('leaderboard')
        .select('username, score, encounters_won, achievements_count')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }
}
