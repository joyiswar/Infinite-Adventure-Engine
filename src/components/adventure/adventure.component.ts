
import { ChangeDetectionStrategy, Component, effect, EventEmitter, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState, Choice } from '../../models/gamestate.model';
import { GeminiService } from '../../services/gemini.service';
import { AchievementService } from '../../services/achievement.service';
import { SaveGameService } from '../../services/save-game.service';
import { Difficulty, SaveData } from '../../models/savedata.model';
import { AudioService } from '../../services/audio.service';
import { TutorialService } from '../../services/tutorial.service';

@Component({
  selector: 'app-adventure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adventure.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdventureComponent implements OnInit {
  @Output() gameStateChange = new EventEmitter<GameState>();

  gameState = signal<GameState | null>(null);
  currentImage = signal<string>('');
  isLoading = signal<boolean>(true);
  loadingMessage = signal<string>('The mists of fate are swirling...');
  showVictoryBanner = signal(false);
  showDefeatBanner = signal(false);
  showCombatTutorial = signal(false);
  imageError = signal<boolean>(false);
  
  difficulty = signal<Difficulty>('Normal');
  combatEncounters = signal<number>(0);
  private successStreak = 0;
  
  isModalOpen = signal(false);
  modalMode = signal<'Save' | 'Load'>('Save');
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
    private tutorialService: TutorialService
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

  async startGame(): Promise<void> {
    this.isLoading.set(true);
    this.updateLoadingMessage();
    const initialState = await this.geminiService.generateStorySegment(undefined, this.difficulty(), this.combatEncounters());
    this.gameState.set(initialState);
    const initialImage = await this.geminiService.generateImage(initialState.imagePrompt);
    if (initialImage) {
      this.currentImage.set(initialImage);
    } else {
      this.imageError.set(true);
    }
    this.achievementService.unlock('first-step');
    this.isLoading.set(false);
  }

  async handleChoice(choice: Choice): Promise<void> {
    if (this.isLoading()) return;
    
    this.audioService.playSound('choice');
    this.isLoading.set(true);
    this.updateLoadingMessage();
    this.currentImage.set('');
    this.imageError.set(false);
    
    const oldInventorySize = this.gameState()?.inventory.length ?? 0;
    const newState = await this.geminiService.generateStorySegment(choice.text, this.difficulty(), this.combatEncounters());
    
    this.updateDifficulty(newState.outcome);

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
      setTimeout(() => this.showVictoryBanner.set(false), 3000);
    } else if (newState.combatResult === 'defeat') {
      this.audioService.playSound('defeat');
      this.showDefeatBanner.set(true);
      this.combatEncounters.update(c => c + 1);
      setTimeout(() => this.showDefeatBanner.set(false), 4000);
    }

    this.gameState.set(newState);
    const newImage = await this.geminiService.generateImage(newState.imagePrompt);
    if (newImage) {
      this.currentImage.set(newImage);
    } else {
      this.imageError.set(true);
    }

    this.isLoading.set(false);
    
    this.choiceCounter++;
    if (this.choiceCounter % this.autosaveInterval === 0) {
      this.handleAutosave();
    }
  }
  
  private updateDifficulty(outcome: GameState['outcome']): void {
    if (outcome === 'success') {
      this.successStreak++;
      if (this.difficulty() === 'Normal' && this.successStreak >= 3) {
        this.difficulty.set('Hard');
        this.successStreak = 0;
      } else if (this.difficulty() === 'Easy' && this.successStreak >= 2) {
        this.difficulty.set('Normal');
        this.successStreak = 0;
      }
    } else if (outcome === 'failure') {
      this.successStreak = 0;
      if (this.difficulty() === 'Hard') {
        this.difficulty.set('Normal');
      } else if (this.difficulty() === 'Normal') {
        this.difficulty.set('Easy');
      }
    }
  }
  
  private updateLoadingMessage(): void {
    const randomIndex = Math.floor(Math.random() * this.loadingMessages.length);
    this.loadingMessage.set(this.loadingMessages[randomIndex]);
  }

  openModal(mode: 'Save' | 'Load'): void {
    this.modalMode.set(mode);
    this.saveSlots.set(this.saveGameService.getSaveSlots());
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
      storyHistory: this.geminiService.getStoryHistory(),
      achievements: this.achievementService.achievements(),
      difficulty: this.difficulty(),
      combatEncounters: this.combatEncounters(),
      timestamp: Date.now()
    };
  }

  handleSave(slotId: number): void {
    const saveData = this.getCurrentSaveData();
    if (saveData) {
      this.saveGameService.save(slotId, saveData);
      this.closeModal();
    }
  }
  
  private handleAutosave(): void {
    const saveData = this.getCurrentSaveData();
    if(saveData) {
      this.saveGameService.save(0, saveData); // Slot 0 is for autosave
      console.log('Game autosaved.');
    }
  }

  handleLoad(slotId: number): void {
    const saveData = this.saveGameService.load(slotId);
    if (saveData) {
      this.isLoading.set(true);
      this.updateLoadingMessage();
      this.imageError.set(false);
      
      this.gameState.set(saveData.gameState);
      this.currentImage.set(saveData.currentImage);
      this.geminiService.setStoryHistory(saveData.storyHistory);
      this.achievementService.achievements.set(saveData.achievements);
      this.difficulty.set(saveData.difficulty);
      this.combatEncounters.set(saveData.combatEncounters ?? 0);

      setTimeout(() => this.isLoading.set(false), 200);
      this.closeModal();
    }
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}
