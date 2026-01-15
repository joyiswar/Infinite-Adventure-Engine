
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;

  private initializeAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser");
      }
    }
  }

  playSound(type: 'choice' | 'item' | 'achievement' | 'victory'): void {
    this.initializeAudioContext();
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);

    switch(type) {
      case 'choice':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.2);
        break;
      case 'item':
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.3);
        break;
      case 'achievement':
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C5
        gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.5);

        const osc2 = this.audioContext.createOscillator();
        osc2.connect(gainNode);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(783, this.audioContext.currentTime); // G5
        osc2.start(this.audioContext.currentTime + 0.1);
        osc2.stop(this.audioContext.currentTime + 0.4);
        break;
      case 'victory':
        gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        // C4
        oscillator.frequency.setValueAtTime(261.6, this.audioContext.currentTime);
        // E4
        oscillator.frequency.setValueAtTime(329.6, this.audioContext.currentTime + 0.1);
        // G4
        oscillator.frequency.setValueAtTime(392.0, this.audioContext.currentTime + 0.2);
        // C5
        oscillator.frequency.setValueAtTime(523.2, this.audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 1);
        break;
    }

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 1);
  }
}
