/**
 * Azure OpenAI Service - VordGuard Studio
 * 
 * Centralized service for all AI interactions.
 * 
 * COMPLIANCE RULES:
 * 1. ONLY Azure OpenAI allowed.
 * 2. NO decision making, scoring, or ranking.
 * 3. Advisory text and conceptual images only.
 * 
 * Uses:
 * - Chat Completion (model-router) for text
 * - Image Generation (FLUX.1-Kontext-pro or DALL-E) for concepts
 */

const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");
require("dotenv").config();

class AzureOpenAIService {
  constructor() {
    // Per hackathon rules, only OPENAI_API_KEY is used
    this.apiKey = process.env.OPENAI_API_KEY;

    // Defaults aligned to hackathon guidance
    this.endpoint = "https://models.inference.ai.azure.com"; // Azure AI Inference shared endpoint
    this.deploymentName = "model-router"; // Chat completion via model router
    this.imageDeploymentName = "flux.1-kontext-pro"; // Concept frame generator

    // Initialize client if credentials exist
    if (this.apiKey) {
      this.client = new OpenAIClient(
        this.endpoint,
        new AzureKeyCredential(this.apiKey)
      );
    } else {
      console.warn("⚠️ OPENAI_API_KEY missing. AI features will return mocked advisory responses.");
    }
  }

  /**
   * 1. SHOT LIST GENERATOR
   * Generate shot suggestions based on scene description.
   * Advisory only.
   */
  async generateShotList(sceneDescription, mood) {
    if (!this.client) return this._mockResponse("Shot List");

    const messages = [
      { role: "system", content: "You are an expert cinematographer assistant. Suggest creative shots based on scene descriptions. Output formatted as JSON list of shots." },
      { role: "user", content: `Scene: ${sceneDescription}\nMood: ${mood}\n\nGenerate 5-7 key shots. Include Type, Angle, Movement, and Action.` }
    ];

    return this._callChat(messages);
  }

  /**
   * 2. DIRECTOR / PRODUCER NOTES
   * Convert technical planning data into human-readable guidance.
   */
  async generateDirectorNotes(planDetails) {
    if (!this.client) return this._mockResponse("Director Notes");

    const messages = [
      { role: "system", content: "You are a production assistant. Summarize technical planning data into a helpful note for the Director. Focus on constraints and opportunities. Do NOT give orders." },
      { role: "user", content: `Technical Details: ${JSON.stringify(planDetails)}\n\nWrite a brief note.` }
    ];

    return this._callChat(messages);
  }

  /**
   * 2b. SCENE RISK NARRATIVE
   * Translate deterministic risk profile into advisory language for producers.
   */
  async generateSceneRiskNarrative(scene, riskProfile) {
    if (!this.client) return this._mockResponse("Scene Risk Narrative");

    const messages = [
      {
        role: "system",
        content:
          "You are a production risk advisor. Explain scene risk in calm, actionable language. Highlight key factors, mitigation ideas, and remind producers that scores are deterministic and AI is advisory only."
      },
      {
        role: "user",
        content: `Scene Title: ${scene.title || scene.id}\nScene Description: ${scene.description || "N/A"}\nDeterministic Summary: ${riskProfile.summary}\nRisk Factors: ${riskProfile.factors
          .map((f) => `${f.name}: score ${f.score}, reason: ${f.reason}`)
          .join(" | ")}\n\nProvide a concise narrative (120 words max).`
      }
    ];

    return this._callChat(messages);
  }

  /**
   * 3. PLAN-B EXPLANATION
   * Explain textual context for a generated Plan-B.
   * STRICTLY FORBIDDEN: Ranking, scoring, or recommending.
   * ONLY explain the trade-offs.
   */
  async generatePlanBExplanation(plan, crisis) {
    if (!this.client) return this._mockResponse("Plan-B Context");

    const messages = [
      { role: "system", content: "You are a crisis manager assistant. Explain the trade-offs of this specific fallback plan. Be neutral. Do not rank or score." },
      { role: "user", content: `Crisis: ${crisis.type}\nPlan: ${plan.planTitle}\nDetails: ${plan.planDescription}\n\nExplain the pros/cons and potential impact.` }
    ];

    return this._callChat(messages);
  }

  /**
   * 4. CONCEPT FRAME GENERATOR (IMAGE)
   * Generate visual mood board reference.
   */
  async generateConceptFrame(description) {
    if (!this.client) return { imageUrl: null, disclaimer: "AI Service Unavailable" };

    try {
      // Note: Image generation call structure depends on specific model version/endpoint
      // This follows standard Azure OpenAI Image Gen pattern
      const results = await this.client.getImages(
        this.imageDeploymentName,
        { prompt: description, n: 1, size: "1024x1024" }
      );

      const imageUrl = results.data[0].url;
      
      return {
        imageUrl: imageUrl,
        disclaimer: "Generated using Azure OpenAI – Advisory Only"
      };
    } catch (error) {
      console.error("Azure OpenAI Image Error:", error.message);
      // Fallback or error handling
      return { imageUrl: null, error: "Image generation failed" };
    }
  }

  /**
   * 5. PITCH SUMMARY GENERATOR
   * Summarize the project or plan for a presentation.
   */
  async generatePitchSummary(projectData) {
    if (!this.client) return this._mockResponse("Pitch Summary");

    const messages = [
      { role: "system", content: "You are a pitch deck copywriter. Create a compelling 1-paragraph summary of this production plan/rescue." },
      { role: "user", content: `Project Data: ${JSON.stringify(projectData)}` }
    ];

    return this._callChat(messages);
  }

  /**
   * 6. SCENE PARAMETER EXTRACTION
   * Extract technical production parameters from a scene description.
   * Used to feed the deterministic risk profiler.
   */
  async extractSceneParameters(description) {
    // If no client, return safe defaults that will trigger moderate risk
    if (!this.client) {
      return {
        isOutdoor: true,
        season: "monsoon", 
        shootDurationDays: 1,
        permitRequired: true,
        stuntRisk: "low",
        equipmentLevel: "standard",
        crewSize: 20,
        timeOfDay: "day"
      };
    }

    const messages = [
      { 
        role: "system", 
        content: `You are a Line Producer. Analyze the scene description and extract these JSON parameters:
        - isOutdoor: boolean
        - season: "monsoon" | "summer" | "winter" (infer from context, default "monsoon")
        - shootDurationDays: number (estimate based on complexity)
        - permitRequired: boolean (true if public space, road, etc)
        - stuntRisk: "none" | "low" | "high"
        - equipmentLevel: "minimal" | "standard" | "heavy"
        - crewSize: number (estimate)
        - timeOfDay: "day" | "night"
        
        Output JSON only.` 
      },
      { role: "user", content: `Scene Description: "${description}"` }
    ];

    try {
      const result = await this._callChat(messages);
      // Clean up markdown code blocks if present
      const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn("Failed to parse scene parameters via AI, using defaults", e);
      return {
        isOutdoor: true,
        season: "monsoon",
        shootDurationDays: 1,
        permitRequired: false,
        stuntRisk: "low",
        equipmentLevel: "standard",
        crewSize: 15,
        timeOfDay: "day"
      };
    }
  }

  // --- INTERNAL HELPERS ---

  async _callChat(messages) {
    try {
      const result = await this.client.getChatCompletions(
        this.deploymentName, 
        messages,
        { temperature: 0.7, maxTokens: 800 }
      );

      return {
        content: result.choices[0].message.content,
        disclaimer: "Generated using Azure OpenAI – Advisory Only"
      };
    } catch (error) {
      console.error("Azure OpenAI Chat Error:", error.message);
      return {
        content: "AI service temporarily unavailable.",
        error: true
      };
    }
  }

  _mockResponse(type) {
    return {
      content: `[MOCK] Azure OpenAI credentials not configured. This is a placeholder for ${type}.`,
      disclaimer: "Mock Data - AI Disabled"
    };
  }
}

module.exports = new AzureOpenAIService();
