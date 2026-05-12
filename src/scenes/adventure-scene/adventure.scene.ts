import { Component, OnInit, signal, effect, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState, Choice } from '../../entities/gamestate.model';
import { SaveData } from '../../entities/savedata.model';
import { GeminiService } from '../../engine/ai-engine.service';
import { AchievementService } from '../../systems/achievement-system.service';
import { SaveGameService } from '../../systems/persistence-system.service';
import { AudioService } from '../../systems/audio-system.service';
import { TutorialService } from '../../systems/tutorial-system.service';
import { LoreCodexService } from '../../systems/codex-system.service';
import { DifficultyScalingService } from '../../systems/difficulty-scaling.service';
import { LeaderboardSystem, LeaderboardEntry } from '../../systems/leaderboard-system.service';
import { PlayGamesService } from '../../systems/play-games.service';
import { RenderingEngine } from '../../engine/rendering-engine.service';
import { TelemetrySystem } from '../../systems/telemetry-system.service';

@Component({
  selector: 'app-adventure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adventure.scene.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdventureComponent implements OnInit, AfterViewInit {
  @Output() gameStateChange = new EventEmitter<GameState>();
  @Output() portraitChange = new EventEmitter<string>();
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;

  gameState = signal<GameState | null>(null);
  currentImage = signal<string>('');
  characterPortraitUrl = signal<string>('');
  isLoading = signal<boolean>(true);
  loadingMessage = signal<string>('Initializing Neural Link...');

  combatEncounters = signal<number>(0);
  encountersWon = signal<number>(0);

  isModalOpen = signal(false);
  modalMode = signal<'Save' | 'Load' | 'Leaderboard'>('Save');
  saveSlots = signal<(SaveData | null)[]>([]);
  leaderboardData = signal<LeaderboardEntry[]>([]);

  private choiceCounter = 0;
  private readonly autosaveInterval = 5;

  private loadingMessages = [
    'SYCHRONIZING NEURAL STREAM...',
    'DECRYPTING ETHER FRAGMENTS...',
    'CALIBRATING AETHER CIRCUIT...',
    'ESTABLISHING VISUAL UPLINK...',
    'MAPPING COGNITIVE VECTORS...'
  ];

  constructor(
    private geminiService: GeminiService,
    private achievementService: AchievementService,
    private saveGameService: SaveGameService,
    private audioService: AudioService,
    private tutorialService: TutorialService,
    private loreCodexService: LoreCodexService,
    private leaderboardSystem: LeaderboardSystem,
    private playGames: PlayGamesService,
    private renderingEngine: RenderingEngine,
    public telemetry: TelemetrySystem,
    public difficultyService: DifficultyScalingService
  ) {
    effect(() => {
      const state = this.gameState();
      if (state) {
        this.gameStateChange.emit(state);
        this.telemetry.updateProgression(this.encountersWon(), this.achievementService.getUnlockedAchievements().length);
      }
    });
  }

  ngOnInit(): void {
    this.startGame();
  }

  ngAfterViewInit(): void {
    if (this.canvasContainer) {
      this.renderingEngine.init(this.canvasContainer);
    }
  }

  async startGame(): Promise<void> {
    this.isLoading.set(true);
    this.updateLoadingMessage();
    const initialState = await this.geminiService.generateStorySegment();
    this.processNewState(initialState);
    this.isLoading.set(false);
  }

  async handleChoice(choice: Choice): Promise<void> {
    if (this.isLoading()) return;

    this.audioService.playSound('choice');
    this.isLoading.set(true);
    this.updateLoadingMessage();

    const newState = await this.geminiService.generateStorySegment(choice.text, this.difficultyService.currentDifficulty(), this.combatEncounters());
    this.processNewState(newState);

    if (newState.codexEntries && newState.codexEntries.length > 0) {
      this.loreCodexService.addEntries(newState.codexEntries);
    }

    this.difficultyService.update(newState.outcome);
    if (newState.combatResult === 'victory') {
      this.encountersWon.update(c => c + 1);
      this.syncLeaderboard();
    }

    this.isLoading.set(false);
    this.choiceCounter++;
    if (this.choiceCounter % this.autosaveInterval === 0) this.handleAutosave();
  }

  private processNewState(newState: GameState) {
    this.gameState.set(newState);
    if (newState.telemetry) {
        this.telemetry.neuralStability.set(newState.telemetry.neuralStability);
        this.telemetry.aetherVelocity.set(newState.telemetry.aetherVelocity);
        this.telemetry.gForce.set(newState.telemetry.gForce);
    }
  }

  private async syncLeaderboard() {
      const score = (this.encountersWon() * 100) + (this.achievementService.getUnlockedAchievements().length * 50);
      await this.leaderboardSystem.updateScore(score, this.encountersWon(), this.achievementService.getUnlockedAchievements().length);
  }

  private updateLoadingMessage(): void {
    this.loadingMessage.set(this.loadingMessages[Math.floor(Math.random() * this.loadingMessages.length)]);
  }

  async openModal(mode: 'Save' | 'Load' | 'Leaderboard'): Promise<void> {
    this.modalMode.set(mode);
    if (mode === 'Leaderboard') {
        this.leaderboardData.set(await this.leaderboardSystem.getTopPlayers());
    } else {
        this.saveSlots.set(await this.saveGameService.getSaveSlots());
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void { this.isModalOpen.set(false); }

  private async handleAutosave(): Promise<void> {
    const saveData = this.getCurrentSaveData();
    if(saveData) await this.saveGameService.save(0, saveData);
  }

  private getCurrentSaveData(): SaveData | null {
    const state = this.gameState();
    if (!state) return null;
    return {
      gameState: state,
      currentImage: this.currentImage(),
      characterPortraitUrl: this.characterPortraitUrl(),
      storyHistory: this.geminiService.getStoryHistory(),
      achievements: this.achievementService.achievements(),
      difficulty: this.difficultyService.currentDifficulty(),
      combatEncounters: this.combatEncounters(),
      codex: this.loreCodexService.codex(),
      timestamp: Date.now()
    };
  }

  async handleSave(slotId: number) {
    const data = this.getCurrentSaveData();
    if (data) {
        await this.saveGameService.save(slotId, data);
        this.syncLeaderboard();
        this.closeModal();
    }
  }

  async handleLoad(slotId: number) {
    const data = await this.saveGameService.load(slotId);
    if (data) {
        this.gameState.set(data.gameState);
        this.closeModal();
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }
}
