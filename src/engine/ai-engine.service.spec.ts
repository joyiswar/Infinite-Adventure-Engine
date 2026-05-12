import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiService } from './ai-engine.service';
import { of, throwError } from 'rxjs';

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
      anonKey: 'test-key',
      client: {
        auth: {
          getSession: vi.fn().mockResolvedValue({ data: { session: null } })
        }
      },
      currentUser: vi.fn().mockReturnValue(null)
    };

    service = new GeminiService(mockHttp, mockSupabase);
  });

  it('should generate a story segment via edge function', async () => {
    const mockResponse = { story: 'A new tale begins.', choices: [] };
    mockHttp.post.mockReturnValue(of(mockResponse));

    const result = await service.generateStorySegment();
    expect(result.story).toBe('A new tale begins.');
  });

  it('should return fallback state on error', async () => {
    mockHttp.post.mockImplementation(() => { throw new Error('Network error'); });

    const result = await service.generateStorySegment();
    expect(result.story).toContain('CRITICAL_ERROR');
    expect(result.phase).toBe('Diagnostics');
  });
});
