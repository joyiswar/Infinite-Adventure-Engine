
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { GameState } from '../models/gamestate.model';
import { Difficulty } from '../models/savedata.model';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private readonly ai: GoogleGenAI;
  private storyHistory: string[] = [];
  private readonly achievementsToAward = [
      { id: 'treasure-hunter', description: 'Acquire your first item.' },
      { id: 'pathfinder', description: 'Discover a hidden location or secret path.' },
      { id: 'risky-business', description: 'Make a particularly daring, unusual, or clever choice.' },
      { id: 'giant-slayer', description: 'Defeat a powerful foe or overcome a great challenge.' }
  ];

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private readonly responseSchema = {
    type: Type.OBJECT,
    properties: {
      story: { type: Type.STRING, description: 'The next part of the story, about 2-3 paragraphs long, describing what happens next.' },
      choices: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER },
            text: { type: Type.STRING }
          },
          required: ['id', 'text']
        },
        description: 'An array of 3 distinct choices for the player. Each choice must be a short, actionable phrase.'
      },
      quest: { type: Type.STRING, description: 'A brief, one-sentence description of the current main quest objective.' },
      inventory: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of all items the player currently possesses. This should be a complete list, including previously held items.'
      },
      imagePrompt: { type: Type.STRING, description: 'A detailed, descriptive prompt for an image generation model to visualize the current scene. It MUST include the style: "cinematic fantasy digital painting, epic lighting, detailed environment". Maintain character and object consistency from the story. Describe the main character and the scene vividly.' },
      unlockedAchievementId: { type: Type.STRING, description: 'The ID of an achievement unlocked in this turn, if any. Only award achievements from the provided list. Return null if no achievement is unlocked.'},
      outcome: { type: Type.STRING, description: 'The outcome for the player from this story segment. Must be one of: "success", "neutral", or "failure". This reflects whether the choice led to a positive, neutral, or negative result.'},
      inCombat: { type: Type.BOOLEAN, description: 'Set to true if the player is in a combat encounter, false otherwise. This is critical.'},
      combatResult: { type: Type.STRING, description: 'Only set when combat ends. Set to "victory" if the player wins, or "defeat" if they lose. Otherwise, return null.'},
      combatStage: {
        type: Type.OBJECT,
        properties: {
          current: { type: Type.NUMBER },
          total: { type: Type.NUMBER }
        },
        description: 'For multi-stage boss battles, this object indicates the current and total stages. Return null for normal combat.'
      }
    },
    required: ['story', 'choices', 'quest', 'inventory', 'imagePrompt', 'outcome', 'inCombat']
  };

  getStoryHistory(): string[] {
    return this.storyHistory;
  }

  setStoryHistory(history: string[]): void {
    this.storyHistory = history;
  }

  async generateStorySegment(playerChoice?: string, difficulty: Difficulty = 'Normal', combatEncounters: number = 0): Promise<GameState> {
    const achievementsString = this.achievementsToAward.map(a => `- ${a.id}: ${a.description}`).join('\n');
    const systemInstruction = `You are a master storyteller and game master for an infinite choose-your-own-adventure game. 
    Your goal is to create a rich, engaging, and ever-evolving fantasy narrative. The story should be immersive and adapt dynamically to the player's choices.
    The current game difficulty is ${difficulty}. Adjust the challenge accordingly. For 'Hard', create tougher challenges. For 'Easy', be more forgiving.
    
    COMBAT: You must manage a structured combat system.
    - When a fight begins, set 'inCombat' to true.
    - While 'inCombat' is true, the choices MUST be combat-oriented (e.g., 'Attack with sword', 'Defend with shield', 'Use healing potion'). Be creative and context-aware. Use the player's inventory to generate 'Use Item' choices.
    - Narrate the outcome of each combat action with vivid, descriptive text. Describe the impact of attacks, the feel of blocking a blow, or the effect of a spell.
    - When the combat ends (player wins or loses), you MUST set 'inCombat' back to false and provide normal narrative choices.
    - Crucially, when combat ends, you MUST set the 'combatResult' field: 'victory' if the player won, 'defeat' if they lost.
    
    COMBAT ESCALATION: The difficulty of combat should increase as the player wins more battles. The player has completed ${combatEncounters} combat encounters so far.
    - Encounters 0-2: Keep fights simple, against a single, standard enemy.
    - Encounters 3-5: Introduce slightly tougher enemies or pairs of weaker enemies.
    - Encounters 6+: You can now create multi-stage boss battles or fights against multiple dangerous foes.

    MULTI-STAGE COMBAT: For a boss battle, use the 'combatStage' field.
    - When a multi-stage fight begins, set 'inCombat' to true and define the stages, e.g., { "current": 1, "total": 3 }.
    - When a stage is cleared, describe the transition (e.g., "The beast roars, entering a new phase!"), increment 'combatStage.current', but KEEP 'inCombat' as true. 'combatResult' should remain null.
    - The fight only ends when the FINAL stage is won ('current' equals 'total'). At this point, set 'inCombat' to false and 'combatResult' to 'victory'.
    - If the player is defeated at any stage, the entire combat ends. Set 'inCombat' to false and 'combatResult' to 'defeat'.

    ACHIEVEMENTS: You can award achievements. When the player's actions meet the criteria, set the 'unlockedAchievementId' in your response. Only award an achievement once.
    Available achievements to award:
    ${achievementsString}
    
    You MUST provide a response in the specified JSON format. Update the inventory and quest based on the events in the story.
    The imagePrompt must be highly detailed and adhere to the consistent art style.
    The 'outcome' field is critical for game mechanics and must reflect the result of the player's action.`;

    let prompt = "Start a new fantasy adventure for me. I awaken in a mysterious place.";
    if (playerChoice) {
      this.storyHistory.push(`Player chose: ${playerChoice}`);
      prompt = `Continue the story based on the player's last choice. The story so far:\n${this.storyHistory.join('\n')}`;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: this.responseSchema,
        },
      });

      const gameState = JSON.parse(response.text) as GameState;
      this.storyHistory.push(`Story continued: ${gameState.story}`);
      // Keep history from getting too long to save tokens
      if (this.storyHistory.length > 20) {
        this.storyHistory = this.storyHistory.slice(-20);
      }
      return gameState;

    } catch (error) {
      console.error('Error generating story segment:', error);
      // Provide a fallback state on error
      return {
        story: 'The mists of creation swirl, but the path ahead is unclear. An error has occurred. Perhaps try making a different choice, or starting anew.',
        choices: [{ id: 1, text: 'Try to restart the adventure.' }],
        quest: 'Recover from a mysterious error.',
        inventory: [],
        imagePrompt: 'A swirling vortex of colorful magical energy, abstract digital painting, cinematic lighting.',
        outcome: 'failure',
        inCombat: false
      };
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });

      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
      console.error('Error generating image:', error);
      return 'https://picsum.photos/1024/576'; // Fallback image
    }
  }
}
