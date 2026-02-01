/**
 * DECISION ENGINE - CRISIS PLAN-B GENERATOR
 * 
 * Module: Plan-B Generator
 * Purpose: When a production crisis hits, generate 3 ranked fallback options
 * 
 * Context: This is the core VordGuard engine. When a producer's original plan
 * fails (weather hits, permits denied, crew unavailable), this generates
 * structured alternatives to rescue the production.
 * 
 * Three Plan-B types:
 * 1. BACKUP_LOCATION - Move to a different location with better conditions
 * 2. ALTERNATE_SCHEDULE - Reschedule to safer weather/date window
 * 3. SCOPE_REDUCTION - Simplify the scene to remove crisis dependencies
 * 
 * Philosophy:
 * - All plans ranked by confidence (how likely to succeed)
 * - Producer chooses based on risk tolerance and budget
 * - NO AI recommendations. Producer makes final call.
 * - Every plan is explained in production terms
 */

const { LocationReadinessScorer } = require("../spatialFeasibility/locationReadinessScorer");
const { AlternativeReadinessEvaluator } = require("./readinessScorer");

class PlanBGenerator {
  constructor() {
    this.locationScorer = new LocationReadinessScorer();
    this.alternativeEvaluator = new AlternativeReadinessEvaluator();
  }

  /**
   * MAIN ENTRY POINT: Generate Plan-B options for a crisis
   * 
   * When a production crisis occurs, this function generates 3 ranked options:
   * - Plan B1: Move to backup location (if location was the problem)
   * - Plan B2: Move to alternate date (if weather/schedule was the problem)
   * - Plan B3: Reduce scope (if complexity/crew was the problem)
   * 
   * All plans are ranked by confidence. Producer chooses which to pursue.
   * 
   * Inputs:
   * - crisis: What went wrong (type, severity, original location, etc)
   * - originalScene: The scene that can't be shot
   * - allAvailableLocations: Pool of alternative locations
   * 
   * Output: 3 ranked plans with metrics, trade-offs, and confidence scores
   */
  generateCrisisPlanBOptions(crisis, originalScene, allAvailableLocations) {
    // Validate inputs
    if (!crisis || !originalScene) {
      throw new Error("Crisis and scene data required");
    }

    // Generate all 3 Plan-B options
    const planB1_BackupLocation = this._generateBackupLocationPlan(
      crisis,
      originalScene,
      allAvailableLocations
    );

    const planB2_AlternateSchedule = this._generateAlternateSchedulePlan(
      crisis,
      originalScene
    );

    const planB3_ScopeReduction = this._generateScopeReductionPlan(
      crisis,
      originalScene
    );

    // All plans ranked together by confidence + feasibility
    const allPlans = [planB1_BackupLocation, planB2_AlternateSchedule, planB3_ScopeReduction];

    // Sort by confidence (highest first)
    allPlans.sort((a, b) => b.confidenceScore - a.confidenceScore);

    // Add rank to each plan
    allPlans.forEach((plan, index) => {
      plan.rank = index + 1;
    });

    return {
      crisisId: crisis.id,
      crisisType: crisis.type,
      crisisSeverity: crisis.severity || "UNKNOWN",
      originalPlanDetails: {
        location: originalScene.location || crisis.originalLocation || "Unknown",
        scheduledDate: crisis.scheduledDate || "Unknown",
        scope: `${originalScene.sceneTitle || "Scene"} - ${originalScene.sceneType || "General"}`,
      },
      planBOptions: allPlans,
      generatedTimestamp: new Date().toISOString(),
      disclaimer:
        "⚠️ DECISION-SUPPORT TOOL ONLY. Not legal, regulatory, or professional advice. " +
        "Producer must validate all options with line producer, budget, and production requirements.",
    };
  }

  // ============================================================================
  // PLAN B OPTION 1: Backup Location
  // For when: Original location became unavailable (denied permit, owner changed mind, etc)
  // ============================================================================
  _generateBackupLocationPlan(crisis, originalScene, allAvailableLocations) {
    // Find best backup location from available pool
    if (!allAvailableLocations || allAvailableLocations.length === 0) {
      return this._generateEmptyBackupPlan(crisis, originalScene);
    }

    // Filter candidates: similar region, different from original
    const candidateLocations = allAvailableLocations.filter(
      (loc) =>
        loc.region === (crisis.region || "unknown") &&
        loc.id !== crisis.originalLocationId
    );

    // Score each candidate for crisis mitigation + scene compatibility
    const scoredCandidates = candidateLocations
      .map((loc) => ({
        ...loc,
        score: this.alternativeEvaluator.scoreBackupLocationViability(
          loc,
          originalScene,
          crisis
        ),
      }))
      .sort((a, b) => b.score.viabilityScore - a.score.viabilityScore);

    // Select best backup (Rank 1 alternative)
    const bestBackup = scoredCandidates[0];

    // Calculate impact metrics
    const budgetImpact = this._calculateLocationSwitchBudgetImpact(
      crisis.originalLocation,
      bestBackup.name
    );

    const disruptionImpact = this._calculateLocationSwitchDisruptionImpact(
      crisis,
      bestBackup
    );

    return {
      planType: "BACKUP_LOCATION",
      planTitle: `Move to ${bestBackup.name}`,
      planDescription:
        "Relocate production to a nearby location with better production conditions. " +
        "Fastest option if permits are ready or obtainable quickly.",
      proposedDetails: {
        newLocation: bestBackup.name,
        regionSame: bestBackup.region === crisis.region,
        distance:
          bestBackup.distanceFromOriginalKm !== undefined
            ? `${bestBackup.distanceFromOriginalKm}km away`
            : "Distance data unavailable",
      },
      viabilityAnalysis: {
        score: bestBackup.score.viabilityScore,
        status: bestBackup.score.viabilityStatus,
        recommendedAction: bestBackup.score.recommendedAction,
        factors: bestBackup.score.components,
      },
      impactMetrics: {
        budgetImpact,
        disruptionLevel: disruptionImpact.level,
        disruptionDetails: disruptionImpact.details,
        timeToImplement: "2-5 days (permit dependent)",
        crewLogisticsImpact: "Moderate - new location navigation needed",
      },
      confidenceScore: this._calculateBackupLocationConfidence(bestBackup.score),
      riskFactors: this._identifyBackupLocationRisks(bestBackup),
      producerConsideration:
        "Use this if permits are the main issue OR if original location became unavailable. " +
        "Require site survey before committing.",
    };
  }

  _generateEmptyBackupPlan(crisis, originalScene) {
    return {
      planType: "BACKUP_LOCATION",
      planTitle: "No Backup Locations Available",
      planDescription: "No alternative locations found in crisis database.",
      proposedDetails: {
        newLocation: "N/A",
        regionSame: false,
        distance: "N/A",
      },
      viabilityAnalysis: {
        score: 0,
        status: "NOT_VIABLE",
        recommendedAction: "✗ Plan not viable - no backup locations provided.",
        factors: [],
      },
      impactMetrics: {
        budgetImpact: "Unknown",
        disruptionLevel: "CRITICAL",
        disruptionDetails: "Cannot execute without location data.",
        timeToImplement: "N/A",
      },
      confidenceScore: 0,
      riskFactors: ["No backup location data provided"],
      producerConsideration: "Provide backup location data to use this option.",
    };
  }

  // ============================================================================
  // PLAN B OPTION 2: Alternate Schedule
  // For when: Weather or crew availability on specific date is the problem
  // ============================================================================
  _generateAlternateSchedulePlan(crisis, originalScene) {
    // Weather-based rescheduling
    // In real production: Use weather forecasts + historical data
    // For this system: Rule-based decision on best reschedule window

    const crisisType = crisis.type || "UNKNOWN";
    let scheduleSuggestion = "";
    let timelineShift = 0;
    let weatherRationale = "";

    if (crisisType === "WEATHER" || crisisType === "MONSOON") {
      // Monsoon season: Move 2-3 weeks to safer window
      timelineShift = 21; // days
      scheduleSuggestion = "Move 2-3 weeks forward to post-monsoon window";
      weatherRationale =
        "Monsoon cycle: High rain probability until mid-October. " +
        "Safe window opens last week of October (70%+ clear weather).";
    } else if (crisisType === "CREW_UNAVAILABLE") {
      // Crew issue: Move 1-2 weeks
      timelineShift = 10;
      scheduleSuggestion = "Move 1-2 weeks forward to allow crew availability";
      weatherRationale = "Allows key crew members to complete other commitments.";
    } else {
      // Generic: Move 1 week
      timelineShift = 7;
      scheduleSuggestion = "Move 1 week forward";
      weatherRationale = "Provides buffer for crisis resolution.";
    }

    const newScheduledDate = new Date(
      new Date(crisis.scheduledDate || new Date()).getTime() +
        timelineShift * 24 * 60 * 60 * 1000
    );

    return {
      planType: "ALTERNATE_SCHEDULE",
      planTitle: `Reschedule ${timelineShift} days`,
      planDescription:
        "Keep location and scope same, but move shoot to a different date with better conditions. " +
        "Requires crew and stakeholder re-coordination but simplest logistics.",
      proposedDetails: {
        originalDate: crisis.scheduledDate || "Unknown",
        newDate: newScheduledDate.toISOString().split("T")[0],
        daysShifted: timelineShift,
        sameLocation: true,
        sameScope: true,
      },
      scheduleSuggestion,
      weatherRationale,
      impactMetrics: {
        budgetImpact: "Minimal to None",
        budgetDetails: "No location or logistics cost change. Possible crew re-booking fees.",
        disruptionLevel: "MODERATE",
        disruptionDetails: "Requires re-confirming crew, vendor, and post-production schedules.",
        timeToImplement: "Immediate if crew available, 3-7 days if re-booking needed",
        crewLogisticsImpact:
          "All crew keep same roles. Accommodation/transport needs re-check.",
      },
      confidenceScore: this._calculateAlternateScheduleConfidence(crisis, timelineShift),
      riskFactors: this._identifyAlternateScheduleRisks(crisis, timelineShift),
      producerConsideration:
        "Use if ONLY weather or crew availability is the issue, not location/permits. " +
        "Check post-production timeline impact before committing.",
    };
  }

  // ============================================================================
  // PLAN B OPTION 3: Scope Reduction
  // For when: Scene is too complex/risky as originally conceived
  // ============================================================================
  _generateScopeReductionPlan(crisis, originalScene) {
    // Identify which aspect of scene can be simplified to reduce risk
    const sceneType = originalScene.sceneType || "generic";
    let scopeReduction = "";
    let artisticImpact = "";
    let budgetSaving = 0;
    let crewReduction = 0;

    // Rule 1: If outdoor scene, move to controlled setting
    if (originalScene.isOutdoor) {
      scopeReduction =
        "Move from outdoor location to studio/controlled set. " +
        "Reduce crew, simplify logistics, eliminate weather risk.";
      artisticImpact = "Visual aesthetic changes. Scene becomes interior/controlled. Director re-blocking needed.";
      budgetSaving = 25; // 25% cost reduction
      crewReduction = 30; // 30% fewer crew
    }

    // Rule 2: If complex equipment, use simpler gear
    if (originalScene.hasSpecialRig) {
      scopeReduction +=
        " Simplify camera movement (no custom rigs, use handheld instead).";
      artisticImpact +=
        " Scene feels more intimate/handheld vs. choreographed camera. Director adjustment needed.";
      budgetSaving += 20;
      crewReduction += 20;
    }

    // Rule 3: If night shoot, convert to day
    if (originalScene.isNightShoot) {
      scopeReduction += " Convert night shoot to day shoot.";
      artisticImpact += " Lighting and mood changes. Director must adapt narrative.";
      budgetSaving += 40; // Night shoots are expensive
      crewReduction += 25;
    }

    // Rule 4: If multi-location, focus on key location only
    if (originalScene.isMultiLocation) {
      scopeReduction +=
        " Focus on single key location instead of multi-location sequence.";
      artisticImpact +=
        " Scene loses montage/multi-location scope. Becomes single-location scene.";
      budgetSaving += 35;
      crewReduction += 40;
    }

    return {
      planType: "SCOPE_REDUCTION",
      planTitle: "Simplify Scene Scope",
      planDescription:
        "Reduce complexity and technical difficulty of scene. " +
        "Removes crisis dependencies (weather, complex equipment, large crew). " +
        "Significant artistic trade-off but fastest, cheapest option.",
      proposedChanges: {
        description: scopeReduction || "Assess scene for simplification opportunities",
        artisticImpact: artisticImpact || "Scene adaptation needed",
      },
      simplificationStrategy: this._generateScopeSimplificationStrategy(
        originalScene
      ),
      impactMetrics: {
        budgetImpact: `${Math.round(budgetSaving)}% cost reduction`,
        budgetDetails: `From ₹${Math.round(originalScene.estimatedBudget || 100000)} to ₹${Math.round((originalScene.estimatedBudget || 100000) * (1 - budgetSaving / 100))}`,
        disruptionLevel: "HIGH",
        disruptionDetails:
          "Director must adapt scene. Re-blocking, possibly re-casting needed.",
        timeToImplement: "3-5 days for director re-conception and crew re-planning",
        crewReduction: `${crewReduction}% fewer crew (${Math.round((originalScene.crewHeadcount || 30) * crewReduction / 100)} fewer people)`,
      },
      confidenceScore: 85, // Simplification almost always works
      riskFactors: [
        "Director may reject reduced scope",
        "Re-shot scene may not match original intent",
        "Visual continuity with other scenes may break",
      ],
      producerConsideration:
        "Use ONLY if timeline/location/budget issues are critical. " +
        "Requires director buy-in. May damage scene quality. Last-resort option.",
    };
  }

  _generateScopeSimplificationStrategy(scene) {
    const strategies = [];

    if (scene.isOutdoor) {
      strategies.push("Studio version: Recreate location as controlled set");
    }
    if (scene.hasSpecialRig) {
      strategies.push("Handheld camera: Remove complex rig");
    }
    if (scene.isNightShoot) {
      strategies.push("Day version: Adjust scene to day time");
    }
    if (scene.crewHeadcount > 50) {
      strategies.push(`Reduce crew: Scale from ${scene.crewHeadcount} to ~${Math.round(scene.crewHeadcount * 0.6)} essential crew`);
    }

    return strategies.length > 0 ? strategies : ["Evaluate scene for any simplification opportunity"];
  }

  // ============================================================================
  // HELPER: Calculate confidence scores for each plan
  // ============================================================================
  _calculateBackupLocationConfidence(viabilityScore) {
    // Backup location confidence depends on how viable the location is
    // Max: 85% (always some execution risk with new location)
    return Math.min(85, Math.round((viabilityScore.viabilityScore / 100) * 85));
  }

  _calculateAlternateScheduleConfidence(crisis, timelineShift) {
    // Rescheduling confidence depends on how much time we're shifting
    // More time = higher confidence (more buffer)
    // Base: 70% + adjustment
    const timeBuffer = Math.min(20, Math.round(timelineShift / 7)); // +20% for 2+ weeks
    return 70 + timeBuffer;
  }

  // ============================================================================
  // HELPER: Calculate budget impact of location switch
  // ============================================================================
  _calculateLocationSwitchBudgetImpact(originalLocation, newLocation) {
    // Rough estimate: 20-30% increase for location change
    // In reality: Would pull from location cost database
    return "Estimated +20-30% due to location change costs, permit expediting, crew logistics";
  }

  // ============================================================================
  // HELPER: Calculate disruption impact
  // ============================================================================
  _calculateLocationSwitchDisruptionImpact(crisis, newLocation) {
    const distanceChange =
      newLocation.distanceFromOriginalKm || 0;

    if (distanceChange < 15) {
      return {
        level: "LOW",
        details: "Close by location. Minimal crew disruption.",
      };
    } else if (distanceChange < 50) {
      return {
        level: "MODERATE",
        details: "Travel distance increased. Crew commute +30-45min each way.",
      };
    } else {
      return {
        level: "HIGH",
        details: "Significant distance. May require overnight accommodation for crew.",
      };
    }
  }

  // ============================================================================
  // HELPER: Identify risks in backup location plan
  // ============================================================================
  _identifyBackupLocationRisks(backupLocation) {
    const risks = [];

    if (backupLocation.score.viabilityScore < 60) {
      risks.push("Low viability score - location may not adequately address crisis");
    }

    if (backupLocation.distanceFromOriginalKm > 50) {
      risks.push("Remote location - crew logistics complex");
    }

    if (!backupLocation.permitsObtained) {
      risks.push("Permits not yet obtained - timeline risk");
    }

    if (backupLocation.locationType === "protected") {
      risks.push("Heritage/Protected location - rigid regulatory constraints");
    }

    return risks.length > 0 ? risks : ["Standard execution risks"];
  }

  // ============================================================================
  // HELPER: Identify risks in rescheduling plan
  // ============================================================================
  _identifyAlternateScheduleRisks(crisis, timelineShift) {
    const risks = [];

    if (timelineShift < 7) {
      risks.push("Short timeline shift - original crisis conditions may persist");
    }

    risks.push("Crew/vendor re-booking may not be available");
    risks.push("Post-production timeline may become compressed");
    risks.push("Budget inflation due to extended timeline");

    return risks;
  }
}

module.exports = {
  PlanBGenerator,
};
