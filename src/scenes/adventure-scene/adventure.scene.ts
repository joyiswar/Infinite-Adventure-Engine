import { ChangeDetectionStrategy, Component, effect, EventEmitter, OnInit, Output, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState, Choice } from '../../entities/gamestate.model';
import { GeminiService } from '../../engine/ai-engine.service';
import { AchievementService } from '../../systems/achievement-system.service';
import { SaveGameService } from '../../systems/persistence-system.service';
import { Difficulty, SaveData } from '../../entities/savedata.model';
import { AudioService } from '../../systems/audio-system.service';
import { TutorialService } from '../../systems/tutorial-system.service';
import { LoreCodexService } from '../../systems/codex-system.service';
import { DifficultyScalingService } from '../../systems/difficulty-scaling.service';
import { LeaderboardSystem } from '../../systems/leaderboard-system.service';
import { RenderingEngine } from '../../engine/rendering-engine.service';
import { InventoryItem } from '../../entities/inventory.model';

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
  @ViewChild('canvasContainer') canvasContainer!: ElementRef;

  gameState = signal<GameState | null>(null);
  currentImage = signal<string>('');
  characterPortraitUrl = signal<string>('');
  isLoading = signal<boolean>(true);
  loadingMessage = signal<string>('The mists of fate are swirling...');
  showVictoryBanner = signal(false);
  showDefeatBanner = signal(false);
  showCombatTutorial = signal(false);
  imageError = signal<boolean>(false);
  imageGenerationCooldown = signal(0);

  combatEncounters = signal<number>(0);
  encountersWon = signal<number>(0);

  isModalOpen = signal(false);
  modalMode = signal<'Save' | 'Load' | 'Leaderboard'>('Save');
  saveSlots = signal<(SaveData | null)[]>([]);

  private choiceCounter = 0;
  private readonly autosaveInterval = 5;

  private loadingMessages = [
    'Forging your path through the ether...',
    'Consulting the ancient scrolls...',
    'Illustrating your next chapter...',
    'The weaver of tales spins her thread...',
    'Destiny is being written...'
  ];

  constructor(
    private geminiService: GeminiService,
    private achievementService: AchievementService,
    private saveGameService: SaveGameService,
    private audioService: AudioService,
    private tutorialService: TutorialService,
    private loreCodexService: LoreCodexService,
    private leaderboardSystem: LeaderboardSystem,
    private renderingEngine: RenderingEngine,
    public difficultyService: DifficultyScalingService
  ) {
    effect(() => {
      const state = this.gameState();
      if (state) {
        this.gameStateChange.emit(state);
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
    const initialState = await this.geminiService.generateStorySegment(undefined, this.difficultyService.currentDifficulty(), this.combatEncounters());
    this.gameState.set(initialState);
    const initialImage = await this.geminiService.generateImage(initialState.imagePrompt);
    if (initialImage) {
      this.currentImage.set(initialImage);
    } else {
      this.imageError.set(true);
      this.imageGenerationCooldown.set(3);
    }
    this.achievementService.unlock('first-step');
    this.isLoading.set(false);
  }

  async handleChoice(choice: Choice): Promise<void> {
    if (this.isLoading()) return;

    this.audioService.playSound('choice');
    this.isLoading.set(true);
    this.updateLoadingMessage();

    const oldInventorySize = this.gameState()?.inventory.length ?? 0;
    const newState = await this.geminiService.generateStorySegment(choice.text, this.difficultyService.currentDifficulty(), this.combatEncounters());

    const imagePromises: Promise<string | null>[] = [];
    const wantsNewImage = newState.shouldGenerateNewImage;
    const isOnCooldown = this.imageGenerationCooldown() > 0;

    if (wantsNewImage && !isOnCooldown) {
      this.imageError.set(false);
      imagePromises.push(this.geminiService.generateImage(newState.imagePrompt));
    } else {
      if (wantsNewImage && isOnCooldown) {
        this.imageGenerationCooldown.update(c => c - 1);
      } else {
        this.imageError.set(false);
      }
      imagePromises.push(Promise.resolve(null));
    }

    if (newState.characterPortraitPrompt) {
      imagePromises.push(this.geminiService.generateImage(newState.characterPortraitPrompt));
    } else {
      imagePromises.push(Promise.resolve(null));
    }

    const [mainImageUrl, portraitUrl] = await Promise.all(imagePromises);

    if (mainImageUrl) {
      this.currentImage.set(mainImageUrl);
    } else if (wantsNewImage && !isOnCooldown) {
      this.imageError.set(true);
      this.imageGenerationCooldown.set(3);
    }

    if (portraitUrl) {
      this.characterPortraitUrl.set(portraitUrl);
      this.portraitChange.emit(portraitUrl);
    }

    if (newState.codexEntries && newState.codexEntries.length > 0) {
      this.loreCodexService.addEntries(newState.codexEntries);
    }

    this.gameState.set(newState);
    this.difficultyService.update(newState.outcome);

    if (newState.inCombat && !this.tutorialService.hasSeenCombatTutorial()) {
      this.showCombatTutorial.set(true);
    }

    if (newState.unlockedAchievementId) {
      this.achievementService.unlock(newState.unlockedAchievementId);
    }
    if (newState.inventory.length > oldInventorySize) {
        this.achievementService.unlock('treasure-hunter');
        this.audioService.playSound('item');
    }

    if (newState.combatResult === 'victory') {
      this.audioService.playSound('victory');
      this.showVictoryBanner.set(true);
      this.combatEncounters.update(c => c + 1);
      this.encountersWon.update(c => c + 1);
      this.syncLeaderboard();
      setTimeout(() => this.showVictoryBanner.set(false), 3000);
    } else if (newState.combatResult === 'defeat') {
      this.audioService.playSound('defeat');
      this.showDefeatBanner.set(true);
      this.combatEncounters.update(c => c + 1);
      setTimeout(() => this.showDefeatBanner.set(false), 4000);
    }

    this.isLoading.set(false);

    this.choiceCounter++;
    if (this.choiceCounter % this.autosaveInterval === 0) {
      this.handleAutosave();
    }
  }

  private async syncLeaderboard() {
      const score = (this.encountersWon() * 100) + (this.achievementService.getUnlockedAchievements().length * 50);
      await this.leaderboardSystem.updateScore(score, this.encountersWon(), this.achievementService.getUnlockedAchievements().length);
  }

  private updateLoadingMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.loadingMessages.length);
    this.loadingMessage.set(this.loadingMessages[randomIndex]);
  }

  async openModal(mode: 'Save' | 'Load' | 'Leaderboard'): Promise<void> {
    this.modalMode.set(mode);
    if (mode !== 'Leaderboard') {
        const slots = await this.saveGameService.getSaveSlots();
        this.saveSlots.set(slots);
    }
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  closeCombatTutorial(): void {
    this.showCombatTutorial.set(false);
    this.tutorialService.markCombatTutorialAsSeen();
  }

  private getCurrentSaveData(): SaveData | null {
    const currentState = this.gameState();
    if (!currentState) return null;

    return {
      gameState: currentState,
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

  async handleSave(slotId: number): Promise<void> {
    const saveData = this.getCurrentSaveData();
    if (saveData) {
      await this.saveGameService.save(slotId, saveData);
      this.syncLeaderboard();
      this.closeModal();
    }
  }

  private async handleAutosave(): Promise<void> {
    const saveData = this.getCurrentSaveData();
    if(saveData) {
      await this.saveGameService.save(0, saveData);
      console.log('Game autosaved.');
    }
  }

  async handleLoad(slotId: number): Promise<void> {
    const saveData = await this.saveGameService.load(slotId);
    if (saveData) {
      this.isLoading.set(true);
      this.updateLoadingMessage();
      this.imageError.set(false);

      this.gameState.set(saveData.gameState);
      this.currentImage.set(saveData.currentImage);
      this.characterPortraitUrl.set(saveData.characterPortraitUrl ?? '');
      this.portraitChange.emit(this.characterPortraitUrl());
      this.geminiService.setStoryHistory(saveData.storyHistory);
      this.achievementService.achievements.set(saveData.achievements);
      this.difficulty.set(saveData.difficulty);
      this.combatEncounters.set(saveData.combatEncounters ?? 0);
      this.loreCodexService.codex.set(saveData.codex ?? []);

      setTimeout(() => this.isLoading.set(false), 200);
      this.closeModal();
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}
