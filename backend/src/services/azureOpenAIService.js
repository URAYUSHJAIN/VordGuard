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

// Removed specific Azure SDK imports to use fetch compatible with GitHub Models
require("dotenv").config();

class AzureOpenAIService {
  constructor() {
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    this.endpoint = process.env.AZURE_OPENAI_API_ENDPOINT; 
    this.deploymentName = "gpt-4o"; 
    
    this.hasKey = !!this.apiKey && this.apiKey !== "your_key_here";
    
    if (!this.hasKey) {
      console.warn("⚠️ AZURE_OPENAI_API_KEY is missing or incorrect in backend/.env. AI features will return mocked advisory responses.");
    } else {
      console.log("✅ Azure OpenAI Key loaded successfully.");
    }
  }

  get client() { return this.hasKey ? {} : null; } // Return object so property access doesn't crash immediate check, but methods will need to be fixed

  /**
   * 1. SHOT LIST GENERATOR (AI)
   * Generate shot suggestions based on scene description.
   * Advisory only.
   */
  async generateShotList(sceneDescription, mood) {
    // Attempt multiple fallbacks for robustness in hackathon demos
    if (!this.client) {
        // If we want to simulate AI without the key (for demo UI purposes), we can't.
        // But the user asked to "give data with the ai not by the mock data".
        // This implies they expect it to work.
        // We will log a clearer error for them to fix their env.
        console.warn(">> AI REQUEST FAILED: AZURE_OPENAI_API_KEY is missing in backend .env");
        return this._mockResponse("Shot List"); 
    }

    const messages = [
      { 
          role: "system", 
          content: "You are an expert cinematographer assistant. Suggest creative shots based on scene descriptions. Output formatted as JSON list of shots. JSON ONLY. No markdown." 
      },
      { 
          role: "user", 
          content: `Scene: ${sceneDescription}\nMood: ${mood}\n\nGenerate 4 distinct shots (Master, Medium, Close-up, Detail). Include fields: type, angle, movement, equipment, location (brief), setup_time.` 
      }
    ];

    try {
        const result = await this._callChat(messages);
        
        // Try parsing the content to ensure it's valid JSON for the frontend
        let shots = [];
        try {
            const cleanContent = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
            shots = JSON.parse(cleanContent);
            if (!Array.isArray(shots) && shots.shots) shots = shots.shots; // Handle wrapper
        } catch(e) {
            console.warn("AI returned non-JSON:", result.content);
            // Fallback to text if parsing fails, but wrappper needed
            return {
                content: result.content, // Raw text mainly
                isRaw: true,
                disclaimer: result.disclaimer
            };
        }

        return {
            shots: shots,
            disclaimer: result.disclaimer
        };

    } catch (e) {
        return this._mockResponse("Shot List (Error)");
    }
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
   * 3. PLAN-B ADVISORY
   * Explain textual context for a generated Plan-B.
   * STRICTLY FORBIDDEN: Ranking, scoring, or recommending.
   * ONLY explain the trade-offs.
   */
  async generatePlanBExplanation(plan, crisis) {
    if (!this.client) return this._mockResponse("Plan-B Context");

    const messages = [
      { 
        role: "system", 
        content: `You are a Crisis Management Consultant for film sets. I have a production crisis: ${crisis.type}.

I am considering this Plan-B: ${plan.planTitle}. Technical Metrics: Disruption Score: ${plan.metrics?.disruptionScore || 'N/A'}, Sustainability Rating: ${plan.metrics?.sustainabilityRating || 'N/A'}, Budget Impact: ${plan.metrics?.budgetImpact || 'N/A'}.

Task: Provide a concise narrative (100 words max) explaining the trade-offs.

Focus on the Artistic Impact (how the scene's look changes).

Focus on Logistical Relief (why this solves the permit or weather issue).

Maintain a neutral, advisory tone. Do not rank this plan against others.` 
      },
      { role: "user", content: `Explain the trade-offs for this Plan-B.` }
    ];

    return this._callChat(messages);
  }

  /**
   * 3b. SUSTAINABILITY & INNOVATION (GREEN MEMO)
   * Analyze the plan for sustainability improvements.
   */
  async generateSustainabilityMemo(plan) {
    if (!this.client) return this._mockResponse("Sustainability Memo");

    const messages = [
      {
        role: "system",
        content: `Analyze this production fallback plan: ${plan.planTitle} - ${plan.planDescription}.

Task: Suggest 3 specific ways to make this 'Plan B' more sustainable.

Examples: 'Using local crew to reduce travel emissions' or 'Switching to LED lighting for the rescheduled night shoot'.

Assign a Sustainability Badge (Bronze/Silver/Gold) based on the carbon footprint reduction of the suggested changes.`
      },
      { role: "user", content: "Generate the Green Memo." }
    ];

    return this._callChat(messages);
  }

  /**
   * 4. CONCEPT FRAME GENERATOR (IMAGE)
   * Generate visual mood board reference.
   */
  async generateConceptFrame(description) {
    if (!this.hasKey) return { imageUrl: null, disclaimer: "AI Service Unavailable" };

    try {
      const response = await fetch(`${this.endpoint}/images/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt: description,
          model: "dall-e-3",
          n: 1,
          size: "1024x1024"
        })
      });

      if (!response.ok) {
         console.warn("Image Gen failed", response.status);
         return { imageUrl: "https://placehold.co/1024x1024?text=Image+Generation+Not+Supported", disclaimer: "Image Generation Unavailable" };
      }

      const result = await response.json();
      return {
        imageUrl: result.data[0].url,
        disclaimer: "Generated using DALL-E 3"
      };

    } catch (e) {
      console.error(e);
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
   * 6. SCENE PARAMETER EXTRACTION (Producer Persona)
   * Analyze scene description and extract production metadata.
   */
  async analyzeSceneDescription(description) {
    // If no client, return safe defaults
    if (!this.client) {
      return {
        isOutdoor: true,
        season: "monsoon",
        shootDurationDays: 1,
        requiresPermit: true,
        hasSpecialRig: false,
        crewHeadcount: 20,
        isNightShoot: false,
        locationType: "urban_street"
      };
    }

    const messages = [
      { 
        role: "system", 
        content: `You are a Senior Line Producer. Analyze the following film scene description and extract production metadata.

Instructions:

Set isOutdoor to true if the scene is set in a street, park, or open area.

Infer the season ('monsoon', 'summer', 'winter') based on weather mentions like 'rain', 'heat', or 'snow'.

Estimate crewHeadcount: use 15 for dialogues, 50 for action, and 100+ for crowds.

Identify specialRequirements such as 'drones', 'night shoot', or 'VFX markers'.

Output ONLY a strict JSON object with these keys: isOutdoor, season, shootDurationDays, requiresPermit, hasSpecialRig, crewHeadcount, isNightShoot, locationType.`
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
        requiresPermit: true,
        hasSpecialRig: false,
        crewHeadcount: 20,
        isNightShoot: false,
        locationType: "unknown"
      };
    }
  }

  /**
   * 7. SET LAYOUT GENERATOR (AI)
   * Generate a visual set layout based on scene description.
   */
  async generateSetLayout(sceneDescription) {
    if (!this.client) {
      console.warn("⚠️ generating mock layout because AI is not configured");
      // Add slight randomness to mock positions so it feels alive
      const r = () => Math.floor(Math.random() * 50) - 25; 
      
      return { 
        layout: [
          { "type": "camera-main", "x": 400 + r(), "y": 450 + r(), "label": "Main Cam" },
          { "type": "light-key", "x": 200 + r(), "y": 200 + r(), "label": "Key Light" },
          { "type": "light-fill", "x": 600 + r(), "y": 250 + r(), "label": "Fill Light" },
          { "type": "actor", "x": 400, "y": 300, "label": "Actor" },
          { "type": "director", "x": 400 + r(), "y": 550, "label": "Director" }
        ], 
        disclaimer: "Mock Layout - AI Disabled" 
      };
    }

    const messages = [
      {
        role: "system",
        content: `You are a Director of Photography. Create a lighting and camera floor plan for a film set based on the scene description.

Output ONLY a JSON list of items to place on a 800x600 canvas.
Coordinate system: (0,0) is top-left, (400,300) is center.

Items allowed keys (type): 
- 'camera-main', 'camera-b', 'camera-drone'
- 'light-key', 'light-fill', 'light-back', 'reflector'
- 'director', 'dp', 'actor', 'crew-member'
- 'table', 'vehicle', 'prop-generic'
- 'marker-a'

Format: 
[
  { "type": "camera-main", "x": 400, "y": 500, "label": "Main Cam" },
  { "type": "actor", "x": 400, "y": 300, "label": "Hero" }
]

Keep it to 5-10 essential items.`
      },
      { role: "user", content: `Scene: ${sceneDescription}` }
    ];

    try {
      const result = await this._callChat(messages);
      const cleanJson = result.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return { 
        layout: JSON.parse(cleanJson),
        disclaimer: result.disclaimer 
      };
    } catch (e) {
      console.warn("Failed to generate layout", e);
      return { layout: [], error: "Failed to generate layout" };
    }
  }

  /**
   * 8. CONCEPT FRAME GENERATOR (Vision)
   * Generate visual concept art for Plan-B scenarios.
   */
  async generateConceptFrame(prompt) {
    // If no client/key, return immediate mock
    if (!this.client) {
        console.log("Returning mock image (No AI Config)");
        return "https://placehold.co/600x400/1a1a2e/FFF?text=Visual+Concept+(Mock)";
    }

    try {
        const url = `${this.endpoint}openai/deployments/Dalle3/images/generations?api-version=2024-02-01`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': this.apiKey
            },
            body: JSON.stringify({
                prompt: prompt,
                n: 1,
                size: "1024x1024"
            })
        });

        if (!response.ok) {
            console.warn(`Image Gen Failed (${response.status}) - using fallback`);
            const errorBody = await response.text();
            console.error("Error Body:", errorBody);
            return "https://placehold.co/600x400/7f1d1d/FFF?text=AI+Image+Gen+Failed";
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].url;
        }
        throw new Error("No image data in response");

    } catch (e) {
        console.error("Concept Frame Error:", e.message);
        return "https://placehold.co/600x400/1a1a2e/FFF?text=Visuals+Offline";
    }
  }

  // --- INTERNAL HELPERS ---

  async _callChat(messages) {
    try {
      // Use native fetch (Node 18+)
      const url = `${this.endpoint}openai/deployments/${this.deploymentName}/chat/completions?api-version=2024-02-01`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey
        },
        body: JSON.stringify({
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("AI API Error:", response.status, errText);
        // Fallback to mock on auth error to keep app working
        if (response.status === 401 || response.status === 403) {
           return this._mockDataForMessages(messages);
        }
        throw new Error(`API Request failed: ${response.status}`);
      }

      const result = await response.json();
      return {
        content: result.choices[0].message.content,
        disclaimer: "Generated using Azure OpenAI – Advisory Only"
      };
    } catch (error) {
      console.error("Azure OpenAI Chat Error:", error.message);
      // Last resort fallback
      return this._mockDataForMessages(messages);
    }
  }

  _mockDataForMessages(messages) {
      const lastMsg = messages[messages.length - 1].content.toLowerCase();
      
      // Shot list fallback
      if (lastMsg.includes("json list of shots") || lastMsg.includes("generate 4 distinct shots")) {
         return {
             content: JSON.stringify([
                { type: "Master Shot", angle: "Eye Level", movement: "Static", description: "MOCK: Wide view of the scene location.", equipment: "Tripod", setup_time: "15 min" },
                { type: "Medium Shot", angle: "Eye Level", movement: "Pan", description: "MOCK: Characters interaction.", equipment: "Steadicam", setup_time: "20 min" },
                { type: "Close Up", angle: "Low Angle", movement: "Static", description: "MOCK: Emotional reaction.", equipment: "50mm Lens", setup_time: "10 min" },
                { type: "Detail", angle: "High Angle", movement: "Static", description: "MOCK: Key prop focus.", equipment: "Macro Lens", setup_time: "15 min" }
             ]),
             disclaimer: "⚠️ AI Key Invalid - Using Mock Data"
         }
      }

      // Default fallback
      return {
          content: "AI Service Unavailable. Please check your API Key. (Mock Response)",
          disclaimer: "⚠️ AI Key Invalid - Using Mock Data"
      };
  }

  _mockResponse(type) {
    return {
      content: `[MOCK] Azure OpenAI credentials not configured. This is a placeholder for ${type}.`,
      disclaimer: "Mock Data - AI Disabled"
    };
  }
}

module.exports = new AzureOpenAIService();
