
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
        items: { 
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING, description: 'A detailed, flavorful description of the item, 1-2 sentences long.' }
          },
          required: ['name', 'description']
        },
        description: 'A list of all items the player currently possesses. This should be a complete list, including previously held items. For each item, provide a flavorful description.'
      },
      imagePrompt: { type: Type.STRING, description: 'A detailed, descriptive prompt for an image generation model to visualize the current scene. It MUST include the style: "cinematic fantasy digital painting, epic lighting, detailed environment". Maintain character and object consistency from the story. Describe the main character and the scene vividly.' },
      shouldGenerateNewImage: { type: Type.BOOLEAN, description: 'Set to true if the scene has changed significantly enough to require a new image. Set to false for minor actions or dialogue updates where the previous image is still relevant.' },
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
      },
      codexEntries: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING }
          },
          required: ['title', 'content']
        },
        description: 'An array of new lore codex entries discovered in this turn. A codex entry should be created for any new, significant named character, location, item, or plot point. Only include newly discovered information. Return an empty array if nothing new was discovered.'
      },
      characterPortraitPrompt: {
        type: Type.STRING,
        description: 'A prompt for a character portrait. If interacting with an NPC, describe their face and expression. If alone, describe the player character. Style MUST be: "close-up character portrait, fantasy digital painting, detailed face, expressive". If not applicable, return null.'
      }
    },
    required: ['story', 'choices', 'quest', 'inventory', 'imagePrompt', 'shouldGenerateNewImage', 'outcome', 'inCombat']
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
    
    ENEMY BESTIARY: To make combat varied, create enemies with distinct characteristics. You are not limited to this list, but use it as inspiration. Describe the enemy's actions vividly. The player's choices should reflect tactical options against that enemy type.
    - Brutes (e.g., Ogres, Minotaurs): Slow but powerful. Their attacks are devastating but might be telegraphed. Choices could involve dodging, parrying, or finding a weak point.
    - Skirmishers (e.g., Goblin scouts, Harpies): Fast and evasive. Hard to hit with direct attacks. Choices might involve area-of-effect attacks, traps, or predicting their movement.
    - Casters (e.g., Rogue Mages, Imps): Use magical attacks from a distance. Often have low health. Choices could involve interrupting their spells, closing the distance quickly, or using magical resistance.
    - Tanks (e.g., Iron Golems, heavily armored knights): Extremely durable. Choices should focus on finding chinks in their armor, using powerful magic, or wearing them down over time.
    - Swarms (e.g., Giant Rats, Kobold packs): Individually weak, but dangerous in numbers. Choices might involve crowd control or targeting a leader.
    
    COMBAT: You must manage a structured combat system.
    - When a fight begins, set 'inCombat' to true.
    - While 'inCombat' is true, the choices MUST be combat-oriented and tactically relevant to the enemy type. Use the player's inventory to generate 'Use Item' choices.
    - Narrate the outcome of each combat action with vivid, descriptive text.
    - When the combat ends (player wins or loses), you MUST set 'inCombat' back to false and provide normal narrative choices.
    - Crucially, when combat ends, you MUST set the 'combatResult' field: 'victory' if the player won, 'defeat' if they lost.
    
    COMBAT ESCALATION: The difficulty and complexity of combat should increase as the player completes more battles. The player has completed ${combatEncounters} combat encounters so far.
    - Encounters 0-2: Keep fights simple, against a single Skirmisher or a small Swarm.
    - Encounters 3-5: Introduce a Brute, a Caster with a couple of Swarm minions, or a pair of Skirmishers.
    - Encounters 6+: You can now create multi-stage boss battles (e.g., against a powerful Tank or Caster), or fights against multiple dangerous foes (e.g., a Brute backed up by two Skirmishers).

    MULTI-STAGE COMBAT: For a boss battle, use the 'combatStage' field.
    - When a multi-stage fight begins, set 'inCombat' to true and define the stages, e.g., { "current": 1, "total": 3 }.
    - When a stage is cleared, describe the transition (e.g., "The beast roars, entering a new phase!"), increment 'combatStage.current', but KEEP 'inCombat' as true. 'combatResult' should remain null.
    - The fight only ends when the FINAL stage is won ('current' equals 'total'). At this point, set 'inCombat' to false and 'combatResult' to 'victory'.
    - If the player is defeated at any stage, the entire combat ends. Set 'inCombat' to false and 'combatResult' to 'defeat'.

    ACHIEVEMENTS: You can award achievements. When the player's actions meet the criteria, set the 'unlockedAchievementId' in your response. Only award an achievement once.
    Available achievements to award:
    ${achievementsString}

    LORE CODEX: You must identify important lore elements as they are introduced.
    - When a new, significant named character, location, magical item, or important plot point is introduced, create a codex entry for it.
    - Populate the 'codexEntries' array with these new entries.
    - The entry 'title' should be the name of the subject (e.g., "The Whispering Caverns", "Grak the Goblin Chief").
    - The entry 'content' should be a concise, 1-2 sentence encyclopedia-style description.
    - CRITICAL: Only return entries for lore that is NEWLY discovered in the current story segment. Do not repeat entries from previous turns. If no new lore is discovered, return an empty array.

    CHARACTER PORTRAIT: You must also generate a prompt for a character portrait.
    - If the story describes an interaction with a specific NPC, the prompt should be for their portrait, describing their face, species, and expression.
    - If the player is alone, the prompt should describe the player character's portrait, reflecting their current emotional state (e.g., determined, scared, curious).
    - The prompt style MUST be 'close-up character portrait, fantasy digital painting, detailed face, expressive'.
    - If no specific character is relevant to the scene (e.g., just describing a landscape), you MUST return null for this field.

    RESOURCE MANAGEMENT: To ensure a smooth experience, you must manage resources.
    - Image Generation: Generating images is resource-intensive. You MUST set 'shouldGenerateNewImage' to 'false' if the scene or characters have not changed significantly. For example, during a conversation, or after a minor action like inspecting an object in the same room, the image should not be regenerated. Only set it to 'true' when moving to a new location, a new character appears, or a dramatic event visually transforms the scene. This is a critical instruction.
    
    You MUST provide a response in the specified JSON format. Update the inventory (with descriptions) and quest based on the events in the story.
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
        shouldGenerateNewImage: true,
        outcome: 'failure',
        inCombat: false,
        codexEntries: []
      };
    }
  }

  async generateImage(prompt: string): Promise<string | null> {
    try {
      const response = await this.ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
      });

      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  }
}