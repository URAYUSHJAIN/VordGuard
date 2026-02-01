/**
 * VordGuard Backend Server
 * 
 * Production Crisis Management Platform
 * 
 * Architecture: Three-layer decision system
 * 1. Scene Intelligence Layer - Profile scene risk
 * 2. Spatial Feasibility Layer - Evaluate location readiness
 * 3. Crisis Decision Engine - Generate Plan-B rescue options
 * 
 * This server orchestrates those layers via REST API
 * All decisions are deterministic (rule-based), transparent, and explainable to producers
 * 
 * Disclaimer: Decision-support tool only. Not professional or legal advice.
 */

const express = require("express");
const cors = require("cors");
require('dotenv').config();
const apiRoutes = require("./src/routes/api");

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

// CORS: Allow frontend requests from any origin (for hackathon/demo)
// Production: Restrict to specific domains
app.use(cors());

// Body parsing: JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging: Track all API calls for debugging
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path}`
  );
  next();
});

// ============================================================================
// API ROUTES
// ============================================================================

// Mount all API routes at /api prefix
// Routes include:
// - Scene risk analysis
// - Location readiness scoring
// - Crisis Plan-B generation
// - Helper endpoints (scenes, locations lists)
app.use("/api", apiRoutes);

// ============================================================================
// ROOT ENDPOINT - Service information
// ============================================================================

// GET /
// Returns: Service info, available endpoints, disclaimer
app.get("/", (req, res) => {
  res.json({
    service: "VordGuard Studio - Production Crisis Manager",
    description: "Decision-support platform for film production crises",
    version: "1.0.0",
    architecture: {
      layer1: "Scene Intelligence - Risk profiling",
      layer2: "Spatial Feasibility - Location readiness",
      layer3: "Crisis Decision Engine - Plan-B generation",
    },
    endpoints: {
      health: "GET /api/health",
      analyzeSceneRisk: "POST /api/analyze-scene-risk",
      locationReadiness: "POST /api/location-readiness",
      generatePlanB: "POST /api/generate-plan-b",
      scenes: "GET /api/scenes/:projectId",
      locations: "GET /api/locations/region/:region",
    },
    disclaimer:
      "⚠️ DECISION-SUPPORT TOOL ONLY. Not legal, financial, or professional advice. " +
      "For film production planning. Producer judgment required for all final decisions.",
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// Global error handler: Catch unhandled errors
app.use((err, req, res, next) => {
  console.error("[ERROR]", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// 404 handler: Route not found
app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint Not Found",
    path: req.path,
    availableEndpoints: [
      "GET /",
      "GET /api/health",
      "POST /api/analyze-scene-risk",
      "POST /api/location-readiness",
      "POST /api/generate-plan-b",
      "GET /api/scenes/:projectId",
      "GET /api/locations/region/:region",
    ],
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Start Express server
app.listen(PORT, () => {
  console.log(
    `\n╔════════════════════════════════════════╗`
  );
  console.log(
    `║   🎬 VordGuard Studio - Backend        ║`
  );
  console.log(
    `║   Production Crisis Manager            ║`
  );
  console.log(
    `╚════════════════════════════════════════╝\n`
  );
  console.log(`✓ Scene Intelligence layer: READY`);
  console.log(`✓ Spatial Feasibility layer: READY`);
  console.log(`✓ Crisis Decision Engine: READY`);
  console.log(`\n✓ Server running: http://localhost:${PORT}`);
  console.log(`✓ API Health: http://localhost:${PORT}/api/health`);
  console.log(
    `\n⚠️  DISCLAIMER: Decision-support tool only. Not professional advice.\n`
  );
});

module.exports = app;
