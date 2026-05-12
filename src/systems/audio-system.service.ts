import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API is not supported in this browser');
    }
  }

  async playSound(type: 'choice' | 'victory' | 'defeat' | 'item' | 'achievement'): Promise<void> {
    if (!this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;

    switch (type) {
      case 'choice':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, now);
        oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.1);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;
      case 'victory': {
        const victoryFreqs = [523.25, 659.25, 783.99, 1046.50];
        victoryFreqs.forEach((freq, i) => {
          const osc = this.audioContext!.createOscillator();
          const gn = this.audioContext!.createGain();
          osc.connect(gn);
          gn.connect(this.audioContext!.destination);
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gn.gain.setValueAtTime(0.1, now + i * 0.1);
          gn.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.3);
        });
        break;
      }
      case 'defeat':
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, now);
        oscillator.frequency.linearRampToValueAtTime(55, now + 0.5);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;
      case 'item':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(1760, now + 0.05);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;
      case 'achievement': {
        const achFreqs = [880, 1100, 1320];
        achFreqs.forEach((freq, i) => {
          const osc = this.audioContext!.createOscillator();
          const gn = this.audioContext!.createGain();
          osc.connect(gn);
          gn.connect(this.audioContext!.destination);
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gn.gain.setValueAtTime(0.1, now + i * 0.05);
          gn.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.5);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.5);
        });
        break;
      }
    }
  }
}
