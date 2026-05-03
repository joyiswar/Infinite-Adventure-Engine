import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeminiService } from './ai-engine.service';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { SupabaseService } from '../systems/supabase-system.service';

describe('GeminiService', () => {
  let service: GeminiService;
  let mockHttp: any;
  let mockSupabase: any;

  beforeEach(() => {
    mockHttp = {
      post: vi.fn()
    };
    mockSupabase = {
      url: 'https://test.supabase.co',
      client: {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } })
        }
      }
    };
    service = new GeminiService(mockHttp as unknown as HttpClient, mockSupabase as unknown as SupabaseService);
  });

  it('should generate a story segment via edge function', async () => {
    const mockResponse = { story: 'A new adventure begins.' };
    mockHttp.post.mockReturnValue(of(mockResponse));

    const result = await service.generateStorySegment();

    expect(mockHttp.post).toHaveBeenCalled();
    expect(result.story).toBe('A new adventure begins.');
  });

  it('should return fallback state on error', async () => {
    mockHttp.post.mockImplementation(() => { throw new Error('Network error'); });

    const result = await service.generateStorySegment();

    expect(result.outcome).toBe('failure');
    expect(result.story).toContain('error has occurred');
  });
});
