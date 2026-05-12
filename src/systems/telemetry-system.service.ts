import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TelemetrySystem {
  // Real-time technical metrics
  neuralStability = signal(99.8);
  aetherVelocity = signal(0.88);
  gForce = signal(12.4);
  syncLevel = signal(82);
  syncVariance = signal(0.002);
  feedbackStatus = signal('NOMINAL');

  // Game progression metrics
  level = signal(1);
  xp = signal(0);
  rank = signal('Novice Operative');
  missionCompletion = signal(0);

  private interval: any;

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    this.interval = setInterval(() => {
      // Realistic technical fluctuations
      const change = (Math.random() - 0.5) * 0.4;
      this.neuralStability.update(v => Math.min(100, Math.max(85, v + change)));
      this.aetherVelocity.update(v => Math.min(1.0, Math.max(0, v + (Math.random() - 0.5) * 0.02)));
      this.gForce.update(v => Math.min(20, Math.max(0.5, v + (Math.random() - 0.5) * 0.8)));
      this.syncLevel.update(v => Math.min(100, Math.max(60, v + (Math.random() - 0.5) * 0.15)));
      this.syncVariance.update(v => Math.max(0.0001, Math.min(0.01, v + (Math.random() - 0.5) * 0.0008)));

      const currentStability = this.neuralStability();
      if (currentStability < 88) {
        this.feedbackStatus.set('CRITICAL');
      } else if (currentStability < 92) {
        this.feedbackStatus.set('UNSTABLE');
      } else if (currentStability < 96) {
        this.feedbackStatus.set('CAUTION');
      } else {
        this.feedbackStatus.set('NOMINAL');
      }
    }, 1500);
  }

  updateProgression(encountersWon: number, achievementsCount: number) {
    const calculatedLevel = Math.floor((encountersWon * 100 + achievementsCount * 50) / 250) + 1;
    this.level.set(calculatedLevel);

    if (calculatedLevel > 20) this.rank.set('Apex Harbinger');
    else if (calculatedLevel > 10) this.rank.set('Veteran Ranger');
    else if (calculatedLevel > 5) this.rank.set('Tactical Scout');
    else this.rank.set('Novice Operative');

    // Simulate mission completion based on current quest depth (mock)
    this.missionCompletion.update(v => Math.min(100, v + (Math.random() * 2)));
  }

  stopSimulation() {
    if (this.interval) clearInterval(this.interval);
  }
}
