
import { Injectable, signal, WritableSignal } from '@angular/core';
import { CodexEntry } from '../models/codex.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoreCodexService {
  private readonly storageKey = 'adventure_codex';
  
  codex: WritableSignal<CodexEntry[]> = signal(this.loadCodex());
  public onCodexEntryAdded = new Subject<CodexEntry>();

  private loadCodex(): CodexEntry[] {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load codex from localStorage', e);
      return [];
    }
  }

  addEntries(newEntries: CodexEntry[]): void {
    if (!newEntries || newEntries.length === 0) {
      return;
    }

    const currentTitles = new Set(this.codex().map(entry => entry.title.toLowerCase()));
    const uniqueNewEntries = newEntries.filter(entry => !currentTitles.has(entry.title.toLowerCase()));

    if (uniqueNewEntries.length > 0) {
      this.codex.update(currentCodex => [...currentCodex, ...uniqueNewEntries]);
      this.saveCodex();
      uniqueNewEntries.forEach(entry => this.onCodexEntryAdded.next(entry));
    }
  }

  private saveCodex(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.codex()));
    } catch (e) {
      console.error('Failed to save codex to localStorage', e);
    }
  }
}
