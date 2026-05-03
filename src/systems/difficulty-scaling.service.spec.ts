import { describe, it, expect, beforeEach } from 'vitest';
import { DifficultyScalingService } from './difficulty-scaling.service';

describe('DifficultyScalingService', () => {
  let service: DifficultyScalingService;

  beforeEach(() => {
    service = new DifficultyScalingService();
  });

  it('should start with Normal difficulty', () => {
    expect(service.currentDifficulty()).toBe('Normal');
  });

  it('should upgrade to Hard after 3 successes', () => {
    service.update('success');
    service.update('success');
    service.update('success');
    expect(service.currentDifficulty()).toBe('Hard');
  });

  it('should downgrade from Hard to Normal after 1 failure', () => {
    service.set('Hard');
    service.update('failure');
    expect(service.currentDifficulty()).toBe('Normal');
  });

  it('should reset successes on failure', () => {
    service.update('success');
    service.update('failure');
    service.update('success');
    service.update('success');
    // Still Normal because streak was broken
    expect(service.currentDifficulty()).toBe('Normal');
  });
});
