/**
 * SCENE INTELLIGENCE LAYER
 * 
 * Module: Scene Risk Profiler
 * Purpose: Analyze production requirements of a scene and calculate inherent risk factors
 * 
 * Context: This layer does NOT know about crisis or Plan-B options. It only profiles
 * individual scenes based on their technical and logistical complexity.
 * Think of this as a production manager reading a scene and marking it "easy", "moderate", or "high difficulty"
 * 
 * Philosophy: Rule-based only. No AI decisions. Pure production logic.
 * All calculations are transparent and explainable to producers.
 */

/**
 * Core Risk Profiler: Analyzes a scene against 5 independent risk factors
 * Each factor is scored 0-100 and weighted for final risk assessment
 */
class SceneRiskProfiler {
  /**
   * Main entry point: Complete risk profile for a scene
   * 
   * Input: scene object with production requirements
   * Output: Detailed risk profile with factors, score, and reasoning
   * 
   * This is what a Line Producer would create when reading a shot list
   */
  profileSceneRisk(scene) {
    // Validate input
    if (!scene || !scene.id) {
      throw new Error("Scene must have an ID");
    }

    // Calculate all 5 independent risk factors
    // Each factor is scored independently, then weighted together
    const weatherRisk = this._evaluateWeatherSensitivity(scene);
    const permitRisk = this._evaluatePermitDependency(scene);
    const equipmentRisk = this._evaluateEquipmentComplexity(scene);
    const crewLogisticsRisk = this._evaluateCrewAndLogistics(scene);
    const shootConstraintRisk = this._evaluateShootConstraints(scene);

    // Combine all factors with weights (percentages must sum to 100)
    // Weighting reflects real production priorities:
    // - Weather is most unpredictable (30%)
    // - Permits are hardest to change (25%)
    // - Equipment needs planning time (20%)
    // - Crew/logistics have medium flexibility (15%)
    // - Shoot constraints (night/special) lowest but still matter (10%)
    const factors = [
      { ...weatherRisk, weight: 0.3 },
      { ...permitRisk, weight: 0.25 },
      { ...equipmentRisk, weight: 0.2 },
      { ...crewLogisticsRisk, weight: 0.15 },
      { ...shootConstraintRisk, weight: 0.1 },
    ];

    const finalRiskScore = Math.round(
      factors.reduce((sum, f) => sum + f.score * f.weight, 0)
    );

    return {
      sceneId: scene.id,
      sceneTitle: scene.title || `Scene ${scene.id}`,
      riskScore: finalRiskScore,
      riskLevel: this._categorizeRiskLevel(finalRiskScore),
      factors: factors.map((f) => ({
        name: f.name,
        score: f.score,
        reason: f.reason,
        weight: Math.round(f.weight * 100) + "%",
      })),
      summary: this._generateRiskSummary(finalRiskScore, factors),
      disclaimer: "Risk assessment is based on production requirements only, not weather forecasts or external events.",
    };
  }

  // ============================================================================
  // FACTOR 1: WEATHER SENSITIVITY (30% weight)
  // Why: Weather is the single most unpredictable factor in outdoor shoots
  // ============================================================================
  _evaluateWeatherSensitivity(scene) {
    const season = scene.season || "monsoon"; // India context
    const shootDurationDays = scene.shootDurationDays || 1;
    const isOutdoor = scene.isOutdoor !== false; // Default: assume outdoor

    let baseScore = 30;
    let reason = "Indoor shoot or standard weather conditions";

    if (!isOutdoor) {
      baseScore = 10;
      reason = "Indoor/Controlled location - minimal weather impact";
    } else if (season === "monsoon") {
      baseScore = 85;
      reason =
        "Monsoon season: 80%+ rain probability, extreme weather windows unpredictable. " +
        "Outdoor shoots have <30% chance of success per day.";
    } else if (season === "summer") {
      baseScore = 45;
      reason =
        "Summer: Heat stress, afternoon thunderstorms, crew fatigue. " +
        "Best shoots before 11am or after 5pm. Reduces productive shooting hours by 40%.";
    } else if (season === "winter") {
      baseScore = 20;
      reason =
        "Winter: Stable, predictable weather. Longest daylight windows. " +
        "Minimal weather-related delays expected.";
    }

    // Longer shoots = more weather exposure
    // Rule: Each day beyond 3 adds 5% risk
    if (shootDurationDays > 3) {
      const additionalDays = shootDurationDays - 3;
      baseScore += additionalDays * 5;
      reason +=
        ` Multi-day outdoor shoot (${shootDurationDays} days): weather exposure accumulates.`;
    }

    return {
      name: "Weather Sensitivity",
      score: Math.min(100, baseScore),
      reason,
    };
  }

  // ============================================================================
  // FACTOR 2: PERMIT DEPENDENCY (25% weight)
  // Why: Permits are the least flexible - they can't be changed day-of
  // ============================================================================
  _evaluatePermitDependency(scene) {
    const locationType = scene.locationType || "studio"; // studio, public, protected, residential
    const requiresPermit = scene.requiresPermit !== false; // Default: assume permit needed

    let baseScore = 5;
    let reason = "No permit needed or location pre-cleared";

    if (!requiresPermit) {
      baseScore = 5;
      reason = "Pre-cleared location or private property - no additional permits needed";
    } else if (locationType === "protected") {
      baseScore = 90;
      reason =
        "Heritage/Protected location: Approval from Archaeological Survey, Municipal Corporation, " +
        "and Environment Ministry. Timeline: 3-6 weeks. Extremely rigid. Changes impossible.";
    } else if (locationType === "public") {
      baseScore = 70;
      reason =
        "Public location (street, park): Municipal permits required. " +
        "Timeline: 2-3 weeks. Can be rushed but expensive. Limited flexibility once issued.";
    } else if (locationType === "residential") {
      baseScore = 55;
      reason =
        "Residential area: Noise clearance from neighbors, late-night permits from local authority. " +
        "Timeline: 1-2 weeks. Moderate flexibility if needed.";
    } else if (locationType === "studio") {
      baseScore = 10;
      reason =
        "Studio location: Internal management approval only. No government permits. " +
        "Most flexible option.";
    }

    return {
      name: "Permit Dependency",
      score: baseScore,
      reason,
    };
  }

  // ============================================================================
  // FACTOR 3: EQUIPMENT COMPLEXITY (20% weight)
  // Why: Complex rigs take time to build, break, and troubleshoot
  // ============================================================================
  _evaluateEquipmentComplexity(scene) {
    const hasSpecialRig = scene.hasSpecialRig || false;
    const hasVFXMarkers = scene.hasVFXMarkers || false;
    const requiresDrones = scene.requiresDrones || false;
    const requiresStabilizers = scene.requiresStabilizers || false;

    let baseScore = 20;
    let reason = "Standard equipment - cameras, lights, basic grips";
    const equipmentList = [];

    if (hasSpecialRig) {
      baseScore += 25;
      equipmentList.push("Custom rig/jib");
    }
    if (hasVFXMarkers) {
      baseScore += 15;
      equipmentList.push("VFX markers + green screen");
    }
    if (requiresDrones) {
      baseScore += 20;
      equipmentList.push("Drone (requires weather clearance)");
    }
    if (requiresStabilizers) {
      baseScore += 15;
      equipmentList.push("Stabilizers/gimbal systems");
    }

    if (equipmentList.length > 0) {
      reason =
        `Complex equipment required: ${equipmentList.join(", ")}. ` +
        `Setup time +2-4 hours, breakdown similar. Single failure halts shoot.`;
    }

    return {
      name: "Equipment Complexity",
      score: Math.min(100, baseScore),
      reason,
    };
  }

  // ============================================================================
  // FACTOR 4: CREW & LOGISTICS (15% weight)
  // Why: Logistics delays are common but sometimes manageable
  // ============================================================================
  _evaluateCrewAndLogistics(scene) {
    const crewHeadcount = scene.crewHeadcount || 20;
    const requiresArtisans = scene.requiresArtisans || false; // Stunt/dance/specialized artists
    const isMultiLocation = scene.isMultiLocation || false;

    let baseScore = 15;
    let reason = "Standard crew logistics";

    // Crew headcount: >100 people = coordination nightmare
    if (crewHeadcount > 100) {
      baseScore += 20;
      reason += `; Large crew (${crewHeadcount} people): Coordination, parking, meal logistics complex.`;
    } else if (crewHeadcount > 50) {
      baseScore += 10;
      reason += `; Medium crew (${crewHeadcount} people): Standard coordination needed.`;
    }

    // Specialized crew = hard to find replacements
    if (requiresArtisans) {
      baseScore += 20;
      reason +=
        "; Requires specialized artists (stunt coordinator, choreographer, etc). " +
        "Cannot be replaced day-of. Must be locked in 2-3 weeks before shoot.";
    }

    // Multi-location shoots = complex logistics
    if (isMultiLocation) {
      baseScore += 15;
      reason +=
        "; Multiple locations in one day: Transport, setup/breakdown time multiplied. " +
        "Any delay cascades to next location.";
    }

    return {
      name: "Crew & Logistics",
      score: Math.min(100, baseScore),
      reason,
    };
  }

  // ============================================================================
  // FACTOR 5: SHOOT CONSTRAINTS (10% weight)
  // Why: Night shoots and specialized requirements add complexity
  // ============================================================================
  _evaluateShootConstraints(scene) {
    const isNightShoot = scene.isNightShoot || false;
    const isDaytimeOnly = scene.isDaytimeOnly || false;
    const requiresLiveAction = scene.requiresLiveAction || false;

    let baseScore = 5;
    let reason = "Standard daytime shoot";

    if (isNightShoot) {
      baseScore += 35;
      reason =
        "Night shoot: Requires full lighting rig, power generation, silent night permission. " +
        "Setup +3-4 hours, crew fatigue factor high. Weather window unpredictable at night.";
    }

    if (isDaytimeOnly) {
      baseScore += 20;
      reason +=
        "; Strict daytime constraint: Window limited to 6-8 hours. " +
        "Cannot push into evening. No flexibility on schedule.";
    }

    if (requiresLiveAction) {
      baseScore += 25;
      reason +=
        "; Requires live action/animals: Cannot reset easily. " +
        "Each take requires reset time, talent/animal cooperation.";
    }

    return {
      name: "Shoot Constraints",
      score: Math.min(100, baseScore),
      reason,
    };
  }

  // ============================================================================
  // HELPER: Risk Level Categorization
  // ============================================================================
  _categorizeRiskLevel(score) {
    // Ranges calibrated for film production reality
    // 0-30: Can handle with standard planning
    // 31-60: Needs contingency planning
    // 61-100: Requires backup plan, crisis prep likely
    if (score < 30) return "LOW";
    if (score < 60) return "MODERATE";
    return "HIGH";
  }

  // ============================================================================
  // HELPER: Generate Human-Readable Summary
  // ============================================================================
  _generateRiskSummary(finalScore, factors) {
    // Identify which factors are causing the highest risk
    const topFactors = factors
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    const level = this._categorizeRiskLevel(finalScore);

    let summary = "";

    if (level === "LOW") {
      summary =
        "Low production risk. Standard crew and planning sufficient. " +
        "Can absorb minor delays without impacting schedule.";
    } else if (level === "MODERATE") {
      summary =
        "Moderate risk. Requires experienced crew and contingency planning. " +
        "Should have backup location scouted. ";
    } else {
      summary =
        "HIGH RISK. Requires crisis Plan-B and senior producer oversight. " +
        "Should consider moving to safer date/location. ";
    }

    // Add top 2 factors causing risk
    if (topFactors.length > 0) {
      summary +=
        `Primary risk factors: ${topFactors.map((f) => f.name).join(", ")}.`;
    }

    return summary;
  }
}

// Export for use in other services
module.exports = {
  SceneRiskProfiler,
};
