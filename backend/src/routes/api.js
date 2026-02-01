/**
 * API ROUTES - VordGuard Core Endpoints
 * 
 * Entry points for scene analysis and crisis Plan-B generation
 * 
 * These routes orchestrate the three layers:
 * 1. Scene Intelligence - Profile scene risk
 * 2. Spatial Feasibility - Score location readiness
 * 3. Crisis Decision Engine - Generate ranked Plan-B options
 * 
 * All responses include disclaimers: This is decision-support only, not professional advice
 */

const express = require("express");
const router = express.Router();

// Import services from all three layers
const { SceneRiskProfiler } = require("../services/sceneIntelligence/sceneRiskProfiler");
const { LocationReadinessScorer } = require("../services/spatialFeasibility/locationReadinessScorer");
const { PlanBGenerator } = require("../services/decisionEngine/planBGenerator");
const azureAI = require("../services/azureOpenAIService");

// Import mock data
const { mockLocations, mockScenes, mockCrisis, mockProjects } = require("../data/mockData");

// Initialize service instances (no state between requests)
const sceneProfiler = new SceneRiskProfiler();
const locationScorer = new LocationReadinessScorer();
const planBGenerator = new PlanBGenerator();


/**
 * HEALTH CHECK ENDPOINT
 * GET /api/health
 * 
 * Purpose: Verify backend is running and services are initialized
 * Used by frontend to check server connectivity
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "VordGuard Production Crisis Manager",
    timestamp: new Date().toISOString(),
    services: {
      sceneIntelligence: "ready",
      spatialFeasibility: "ready",
      crisisDecisionEngine: "ready",
    },
  });
});

/**
 * SCENE RISK ANALYSIS ENDPOINT
 * POST /api/analyze-scene-risk
 * 
 * Purpose: Profile production requirements of a scene and calculate risk
 * This is SCENE INTELLIGENCE LAYER output
 * 
 * Request body:
 * {
 *   sceneId: string,        // Scene identifier
 *   projectId: string       // Project context (optional)
 * }
 * 
 * Response:
 * {
 *   sceneId, riskScore (0-100), riskLevel (LOW/MODERATE/HIGH),
 *   factors: [{name, score, reason, weight}],
 *   summary: "Human-readable risk assessment"
 * }
 * 
 * Use case: Producer reviewing shot list and marking high-risk scenes
 */
router.post("/analyze-scene-risk", async (req, res) => {
  try {
    const { sceneId, sceneDescription, projectId } = req.body;

    // Validate request
    if (!sceneId && !sceneDescription) {
      return res.status(400).json({
        error: "Missing required field: sceneId or sceneDescription",
      });
    }

    let scene;

    // 1. Try to use AI to generate scene data from description (Real Intelligence)
    if (sceneDescription) {
      const aiParams = await azureAI.analyzeSceneDescription(sceneDescription);
      scene = {
        id: sceneId || "custom-scene",
        title: "Custom Scenario",
        description: sceneDescription,
        ...aiParams
      };
    } 
    // 2. Fallback to Mock Data lookup
    else {
      scene = mockScenes.find((s) => s.id === sceneId);
    }

    if (!scene) {
      return res.status(404).json({
        error: "Scene not found",
        sceneId,
        availableScenes: mockScenes.map((s) => ({
          id: s.id,
          title: s.title,
        })),
      });
    }

    // Analyze scene risk using Scene Intelligence layer
    const riskProfile = sceneProfiler.profileSceneRisk(scene);

    // Optional Azure AI narrative (advisory only)
    let aiNarrative = null;
    try {
      aiNarrative = await azureAI.generateSceneRiskNarrative(scene, riskProfile);
    } catch (aiError) {
      console.warn("Scene risk AI narrative failed:", aiError.message);
    }

    // Optional project info for context
    const projectContext = projectId
      ? mockProjects.find((project) => project.id === projectId)
      : null;

    // Return profile with disclaimers and advisory narrative
    res.json({
      success: true,
      data: {
        ...riskProfile,
        aiNarrative,
        projectContext: projectContext
          ? {
              id: projectContext.id,
              name: projectContext.name,
              budget: projectContext.budget,
              shootWindow: `${projectContext.shootStartDate} → ${projectContext.shootEndDate}`,
            }
          : null,
      },
      disclaimer:
        "Risk assessment based on deterministic production factors only. AI narrative is advisory guidance. Producer judgment required for final decisions.",
    });
  } catch (error) {
    console.error("Error analyzing scene risk:", error);
    res.status(500).json({
      error: "Failed to analyze scene risk",
      message: error.message,
    });
  }
});

/**
 * LOCATION READINESS SCORING ENDPOINT
 * POST /api/location-readiness
 * 
 * Purpose: Evaluate whether a location is ready for production
 * This is SPATIAL FEASIBILITY LAYER output
 * 
 * Request body:
 * {
 *   locationId: string    // Location identifier
 * }
 * 
 * Response:
 * {
 *   locationId, locationName, readinessScore (0-100),
 *   readinessStatus (NOT_READY/CAUTION/READY),
 *   factors: [{name, score, status, reason}],
 *   recommendation: "Can this location be used?"
 * }
 * 
 * Use case: Scout evaluates location feasibility before locking it in
 */
router.post("/location-readiness", (req, res) => {
  try {
    const { locationId } = req.body;

    // Validate request
    if (!locationId) {
      return res.status(400).json({
        error: "Missing required field: locationId",
      });
    }

    // Fetch location from mock data
    const location = mockLocations.find((l) => l.id === locationId);

    if (!location) {
      return res.status(404).json({
        error: "Location not found",
        locationId,
        availableLocations: mockLocations.map((l) => ({
          id: l.id,
          name: l.name,
          readinessLevel: "See full evaluation",
        })),
      });
    }

    // Evaluate location readiness using Spatial Feasibility layer
    const readiness = locationScorer.evaluateLocationReadiness(location);

    // Return readiness evaluation with disclaimer
    res.json({
      success: true,
      data: readiness,
      disclaimer:
        "Readiness score is based on location data only. Final feasibility requires on-site verification by production team.",
    });
  } catch (error) {
    console.error("Error evaluating location readiness:", error);
    res.status(500).json({
      error: "Failed to evaluate location readiness",
      message: error.message,
    });
  }
});

/**
 * PLAN-B CRISIS GENERATOR ENDPOINT
 * POST /api/generate-plan-b
 * 
 * Purpose: Generate 3 ranked Plan-B options when production crisis hits
 * This is the CRISIS DECISION ENGINE core functionality
 * 
 * Request body:
 * {
 *   crisisId: string,     // Crisis identifier
 *   projectId: string,    // Project context
 *   scenesToAffect: [string]  // Array of scene IDs affected (optional)
 * }
 * 
 * Response:
 * {
 *   crisisId, crisisType, crisisSeverity,
 *   originalPlanDetails: {location, scheduledDate, scope},
 *   planBOptions: [
 *     {
 *       rank: 1,
 *       planType, planTitle, planDescription,
 *       viabilityAnalysis: {score, status, factors},
 *       impactMetrics: {budgetImpact, disruptionLevel, timeToImplement},
 *       confidenceScore: 0-100,
 *       riskFactors: [strings],
 *       producerConsideration: "Why choose this plan?"
 *     },
 *     ... (2 more plans)
 *   ]
 * }
 * 
 * Use case: Production crisis hits - generate structured rescue options
 * Producer evaluates 3 options and picks best fit for their budget/timeline/risk tolerance
 */
router.post("/generate-plan-b", async (req, res) => {
  try {
    const { crisisId, projectId, scenesToAffect } = req.body;

    // Validate request
    if (!crisisId) {
      return res.status(400).json({
        error: "Missing required field: crisisId",
      });
    }

    // Fetch crisis details from mock data (supports object or array)
    let crisis = null;
    if (Array.isArray(mockCrisis)) {
      crisis = mockCrisis.find((c) => c.id === crisisId);
    } else if (mockCrisis && typeof mockCrisis === 'object') {
      crisis = mockCrisis.id === crisisId ? mockCrisis : null;
    }

    if (!crisis) {
      return res.status(404).json({
        error: "Crisis not found",
        crisisId,
        availableCrises: mockCrisis.map((c) => ({
          id: c.id,
          type: c.type,
          severity: c.severity,
        })),
      });
    }

    // Fetch primary scene (or use first affected scene)
    let primaryScene = mockScenes.find((s) => s.id === (crisis.affectedSceneId || crisis.sceneId));
    if (!primaryScene && scenesToAffect && scenesToAffect.length > 0) {
      primaryScene = mockScenes.find((s) => s.id === scenesToAffect[0]);
    }

    if (!primaryScene) {
      primaryScene = mockScenes[0]; // Fallback to first scene in mock data
    }

    // Generate Plan-B options using Crisis Decision Engine
    const planBResponse = planBGenerator.generateCrisisPlanBOptions(
      crisis,
      primaryScene,
      mockLocations
    );

    // AI VISUALIZATION LAYER: Generate concept frames for each plan
    // This connects the Logical Engine to the Generative Vision Model
    try {
        const enrichedPlans = await Promise.all(
            planBResponse.planBOptions.map(async (plan) => {
                try {
                    // Create a prompt that describes the production scenario visually
                    const visualPrompt = `Filmmaking concept art: ${plan.planTitle}. Scenario: ${plan.planDescription}. Mood: Cinematic, production planning, storyboard style.`;
                    
                    // Call the AI Service
                    const imageUrl = await azureAI.generateConceptFrame(visualPrompt);
                    
                    return {
                        ...plan,
                        visualConceptUrl: imageUrl
                    };
                } catch (err) {
                    console.warn(`[AI WARN] Verification failed for plan ${plan.rank}:`, err.message);
                    // Return plan without visual if AI fails (don't break the whole response)
                    return {
                        ...plan,
                        visualConceptUrl: null 
                    };
                }
            })
        );
        planBResponse.planBOptions = enrichedPlans;
    } catch (enrichmentError) {
        console.error("Critical failure in AI enrichment:", enrichmentError);
        // Continue without visuals rather than failing the request
    }

    // Return ranked Plan-B options with producer guidance
    res.json({
      success: true,
      data: planBResponse,
      disclaimer:
        "DECISION-SUPPORT TOOL ONLY. All plans must be validated by production team. " +
        "Not legal, financial, or professional advice. Producer makes final call.",
    });
  } catch (error) {
    console.error("Error generating Plan-B:", error);
    res.status(500).json({
      error: "Failed to generate Plan-B options",
      message: error.message,
    });
  }
});

/**
 * SCENES ENDPOINT
 * GET /api/scenes/:projectId
 * 
 * Purpose: Fetch all scenes for a project
 * Helper endpoint for frontend scene selection
 */
router.get("/scenes/:projectId", (req, res) => {
  try {
    const { projectId } = req.params;

    // In full system, would query from database
    // For hackathon: Return mock scenes
    const scenes = mockScenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      sceneType: scene.sceneType,
      isOutdoor: scene.isOutdoor,
      shootDurationDays: scene.shootDurationDays,
    }));

    res.json({
      success: true,
      projectId,
      data: {
        sceneCount: scenes.length,
        scenes,
      },
    });
  } catch (error) {
    console.error("Error fetching scenes:", error);
    res.status(500).json({
      error: "Failed to fetch scenes",
      message: error.message,
    });
  }
});

/**
 * LOCATIONS ENDPOINT
 * GET /api/locations/region/:region
 * 
 * Purpose: Fetch all locations in a region
 * Helper endpoint for Plan-B location selection
 */
router.get("/locations/region/:region", (req, res) => {
  try {
    const { region } = req.params;

    // Filter locations by region
    const locations = mockLocations
      .filter((loc) => !region || loc.region.toLowerCase() === region.toLowerCase())
      .map((loc) => ({
        id: loc.id,
        name: loc.name,
        region: loc.region,
        locationType: loc.locationType,
        permitsObtained: loc.permitsObtained,
      }));

    res.json({
      success: true,
      region: region || "all",
      data: {
        locationCount: locations.length,
        locations,
      },
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    res.status(500).json({
      error: "Failed to fetch locations",
      message: error.message,
    });
  }
});

/* =========================================================================
   AZURE OPENAI INTEGRATION ROUTES
   Advisory Intelligence - Strictly separated from core logic
   ========================================================================= */

/**
 * GENERATE SHOT LIST (AI)
 * POST /api/ai/shot-list
 */
router.post("/ai/shot-list", async (req, res) => {
  try {
    const { sceneDescription, mood } = req.body;
    const result = await azureAI.generateShotList(sceneDescription, mood);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: "AI Generation Failed" });
  }
});

/**
 * GENERATE DIRECTOR NOTES (AI)
 * POST /api/ai/director-notes
 */
router.post("/ai/director-notes", async (req, res) => {
  try {
    const { planDetails } = req.body;
    const result = await azureAI.generateDirectorNotes(planDetails);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: "AI Generation Failed" });
  }
});

/**
 * GENERATE PLAN-B EXPLANATION (AI)
 * POST /api/ai/plan-b-explanation
 */
router.post("/ai/plan-b-explanation", async (req, res) => {
  try {
    const { plan, crisis } = req.body;
    const result = await azureAI.generatePlanBExplanation(plan, crisis);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: "AI Generation Failed" });
  }
});

/**
 * GENERATE SUSTAINABILITY MEMO (AI)
 * POST /api/ai/sustainability-memo
 */
router.post("/ai/sustainability-memo", async (req, res) => {
  try {
    const { plan } = req.body;
    const result = await azureAI.generateSustainabilityMemo(plan);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: "AI Generation Failed" });
  }
});

/**
 * GENERATE CONCEPT FRAME (AI - Image)
 * POST /api/ai/concept-frame
 */
router.post("/ai/concept-frame", async (req, res) => {
  try {
    const { description } = req.body;
    const result = await azureAI.generateConceptFrame(description);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: "Image Generation Failed" });
  }
});

/**
 * GENERATE PITCH SUMMARY (AI)
 * POST /api/ai/pitch-summary
 */
router.post("/ai/pitch-summary", async (req, res) => {
  try {
    const { projectData } = req.body;
    const result = await azureAI.generatePitchSummary(projectData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: "AI Generation Failed" });
  }
});

/**
 * GENERATE SET LAYOUT (AI)
 * POST /api/ai/set-layout
 */
router.post("/ai/set-layout", async (req, res) => {
  try {
    const { sceneDescription } = req.body;
    const result = await azureAI.generateSetLayout(sceneDescription);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("AI Route Error:", error);
    res.status(500).json({ error: "Layout Generation Failed" });
  }
});

module.exports = router;
