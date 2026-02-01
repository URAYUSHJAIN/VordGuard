/**
 * VordGuard MongoDB Models
 * Mongoose schemas for projects, scenes, crises, and plan results
 */

// Note: For hackathon, we're using mock data. In production, connect to MongoDB

/**
 * Project Schema
 * Represents a film production project
 */
const ProjectSchema = {
  id: String, // UUID
  name: String, // "Monsoon Chronicles"
  director: String,
  producer: String,
  region: String, // "India", "Mumbai", etc.
  budget: Number, // In USD
  shootStartDate: String, // ISO date
  shootEndDate: String,
  totalShootDays: Number,
  createdAt: String,
  status: String, // "pre-production", "in-production", "wrapped"
};

/**
 * Scene Schema
 * Individual scene within a project
 */
const SceneSchema = {
  id: String,
  projectId: String,
  sceneNumber: String, // "1-A", "5-B"
  description: String, // Scene content
  location: String,
  locationType: String, // "studio", "public", "protected", "residential"
  shootDurationDays: Number,
  season: String, // "monsoon", "summer", "winter"
  
  // Special requirements
  requiresPermit: Boolean,
  isNightShoot: Boolean,
  droneRequired: Boolean,
  craneRequired: Boolean,
  hasSpecialEquipment: Boolean,
  underwaterShoot: Boolean,
  aerialShoot: Boolean,
  
  // Crowd logistics
  crowdSize: Number,
  cateringRequired: Boolean,
  transportRequired: Boolean,
  
  // Risk assessment
  riskProfile: {
    riskScore: Number,
    riskLevel: String, // "LOW", "MEDIUM", "HIGH"
    factors: Array,
    summary: String,
  },
  
  createdAt: String,
};

/**
 * Crisis Event Schema
 * When something goes wrong during production
 */
const CrisisSchema = {
  id: String,
  projectId: String,
  sceneId: String,
  crisisType: String, // "weather", "permit", "budget", "crew", "equipment"
  description: String, // What went wrong
  severity: String, // "LOW", "MEDIUM", "HIGH"
  
  // Original plan details
  originalLocation: String,
  originalLocationId: String,
  originalReadinessScore: Number,
  originalShootDate: String,
  originalScope: Object, // Scene scope details
  
  // Context
  region: String,
  shootDurationDays: Number,
  weatherRisk: Number,
  crowdSize: Number,
  hasNightShoot: Boolean,
  hasDrone: Boolean,
  hasCrane: Boolean,
  
  // Status
  resolvedAt: String,
  resolutionApproach: String, // Which Plan-B was chosen
  
  createdAt: String,
};

/**
 * Plan B Result Schema
 * Generated fallback plans for a crisis
 */
const PlanBResultSchema = {
  id: String,
  crisisId: String,
  projectId: String,
  
  // Original vs Fallback
  originalPlan: {
    location: String,
    shootDate: String,
    scope: Object,
  },
  
  // 3 Plan-B options
  planBOptions: [
    {
      planType: String, // "BACKUP_LOCATION", "ALTERNATE_SHOOT_DAYS", "SCOPE_REDUCTION"
      rank: Number, // 1, 2, 3
      title: String,
      description: String,
      details: Object,
      metrics: Object,
      impact: {
        budgetImpact: String, // "POSITIVE", "NEUTRAL", "HIGH"
        disruptionLevel: String, // "LOW", "MEDIUM", "HIGH"
        confidenceLevel: String, // "LOW", "MEDIUM", "HIGH"
      },
      reasoning: String, // Explainable reason
    },
  ],
  
  generatedAt: String,
  selectedPlanIndex: Number, // Which plan was chosen by producer
  producerNotes: String,
};

/**
 * Location Database Schema
 * Mock locations for Plan-B generation
 */
const LocationSchema = {
  id: String,
  name: String,
  region: String, // "Mumbai", "Goa", "Delhi", etc.
  state: String,
  locationType: String,
  
  // Logistics
  crewDistanceKm: Number, // From main hub
  crewHubsNearby: Number,
  distanceFromOriginalKm: Number,
  
  // Permit
  permitStatus: String, // "approved", "pending", "denied"
  estimatedApprovalDays: Number,
  
  // Cost
  rentalCostUSD: Number,
  priceStability: String, // "fixed", "moderate", "volatile"
  
  // Environment
  climate: String,
  monthOfShoot: Number, // 1-12
  
  // Restrictions
  restrictionLevel: String, // "open", "moderate", "restricted"
  requiresSpecialLicense: Boolean,
  
  // Readiness (cached)
  readinessScore: Number,
  readinessLevel: String,
  
  lastUpdated: String,
};

module.exports = {
  ProjectSchema,
  SceneSchema,
  CrisisSchema,
  PlanBResultSchema,
  LocationSchema,
};
