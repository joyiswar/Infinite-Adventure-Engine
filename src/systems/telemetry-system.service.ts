import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TelemetrySystem {
  neuralStability = signal(99.8);
  aetherVelocity = signal(0.88);
  gForce = signal(12.4);
  syncLevel = signal(82);
  syncVariance = signal(0.002);
  feedbackStatus = signal('NOMINAL');

  private interval: any;

  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    this.interval = setInterval(() => {
      // Subtle fluctuations for "live" feel
      this.neuralStability.update(v => Math.min(100, Math.max(90, v + (Math.random() - 0.5) * 0.2)));
      this.aetherVelocity.update(v => Math.min(1.0, Math.max(0, v + (Math.random() - 0.5) * 0.01)));
      this.gForce.update(v => Math.min(20, Math.max(1, v + (Math.random() - 0.5) * 0.5)));
      this.syncLevel.update(v => Math.min(100, Math.max(70, v + (Math.random() - 0.5) * 0.1)));
      this.syncVariance.update(v => Math.max(0.001, v + (Math.random() - 0.5) * 0.0005));

      if (this.neuralStability() < 92) {
        this.feedbackStatus.set('UNSTABLE');
      } else if (this.neuralStability() < 95) {
        this.feedbackStatus.set('CAUTION');
      } else {
        this.feedbackStatus.set('NOMINAL');
      }
    }, 2000);
  }

  stopSimulation() {
    if (this.interval) clearInterval(this.interval);
  }
}
