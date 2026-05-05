import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PerformanceMonitorService {
  private frameCount = 0;
  private lastTime = performance.now();

  fps = signal<number>(0);
  frameTime = signal<number>(0);
  memoryUsage = signal<number>(0);
  private lastFrameTime = performance.now();

  recordFrame() {
    const now = performance.now();
    const secondDelta = now - this.lastTime;
    const frameDelta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    if (secondDelta >= 1000) {
      this.fps.set(Math.round((this.frameCount * 1000) / secondDelta));
      this.frameCount = 0;
      this.lastTime = now;
    }

    this.frameTime.set(frameDelta);

    if ((performance as any).memory) {
      this.memoryUsage.set(Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024)));
    }
  }

  getMetrics() {
    return {
      fps: this.fps(),
      frameTime: this.frameTime(),
      memoryUsage: this.memoryUsage(),
      timestamp: Date.now(),
    };
  }
}
