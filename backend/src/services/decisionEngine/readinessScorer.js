/**
 * DECISION ENGINE LAYER
 * 
 * Module: Readiness & Alternative Scoring
 * Purpose: Score alternatives and rank them based on production viability
 * 
 * Context: This layer uses Scene Intelligence + Spatial Feasibility to determine
 * which alternatives are actually viable during a crisis.
 * 
 * Philosophy: Transparent ranking. All decisions rule-based. Explainable to producers.
 * NO AI ranking. Pure production logic combined with readiness scores.
 */

/**
 * Alternative Readiness Evaluator
 * 
 * Scores and ranks production alternatives (backup locations, alternate days, etc.)
 * based on how well they address crisis constraints
 */
class AlternativeReadinessEvaluator {
  /**
   * Score a backup location for viability during crisis
   * 
   * Inputs:
   * - backupLocation: Candidate location for shoot
   * - originalScene: The scene that needs to be moved
   * - crisisContext: What went wrong (weather, permit denied, etc.)
   * 
   * Output: Score + detailed reasoning for producer decision-making
   */
  scoreBackupLocationViability(backupLocation, originalScene, crisisContext) {
    if (!backupLocation || !originalScene) {
      throw new Error("Backup location and original scene required");
    }

    // Backup location must address the original crisis
    // If crisis was weather, new location must have better weather feasibility
    // If crisis was permit denial, new location must have faster permit timeline
    const crisisAlignment = this._evaluateCrisisAlignment(
      backupLocation,
      crisisContext
    );
    const sceneCompatibility = this._evaluateSceneCompatibility(
      backupLocation,
      originalScene
    );
    const productionReadiness = this._evaluateProductionReadiness(
      backupLocation
    );

    // Combine scores: 40% crisis alignment, 35% scene compat, 25% general readiness
    const viabilityScore = Math.round(
      crisisAlignment.score * 0.4 +
        sceneCompatibility.score * 0.35 +
        productionReadiness.score * 0.25
    );

    return {
      locationId: backupLocation.id,
      locationName: backupLocation.name,
      viabilityScore,
      viabilityStatus: this._categorizeViability(viabilityScore),
      components: [
        {
          factor: "Crisis Alignment",
          score: crisisAlignment.score,
          reason: crisisAlignment.reason,
          weight: "40%",
        },
        {
          factor: "Scene Compatibility",
          score: sceneCompatibility.score,
          reason: sceneCompatibility.reason,
          weight: "35%",
        },
        {
          factor: "Production Readiness",
          score: productionReadiness.score,
          reason: productionReadiness.reason,
          weight: "25%",
        },
      ],
      recommendedAction: this._recommendAlternative(viabilityScore),
    };
  }

  // ============================================================================
  // EVALUATION 1: Does this location solve the original crisis?
  // ============================================================================
  _evaluateCrisisAlignment(location, crisisContext) {
    if (!crisisContext) {
      return {
        score: 50,
        reason: "No crisis context provided. Generic viability applied.",
      };
    }

    const crisisType = crisisContext.type || "unknown";
    let score = 50;
    let reason = "Partial crisis mitigation";

    if (crisisType === "WEATHER") {
      // Weather crisis: New location must have better climate/weather protection
      const hasWeatherProtection = location.hasWeatherProtection || false;
      const climateType = location.climateType || "unknown";

      if (hasWeatherProtection) {
        score = 85;
        reason =
          "Location has weather protection (indoors/roofed). Eliminates weather crisis entirely.";
      } else if (climateType === "stable" || climateType === "arid") {
        score = 70;
        reason =
          "Location in stable weather zone. Lower rainfall than crisis area. Better outdoor viability.";
      } else {
        score = 40;
        reason =
          "Location in similar or worse weather zone. Partial crisis mitigation only.";
      }
    } else if (crisisType === "PERMIT_DENIED") {
      // Permit crisis: New location must have faster/easier permit path
      const permitDays = location.estimatedPermitDays || 14;
      const isPrePermitted = location.isPrePermitted || false;

      if (isPrePermitted) {
        score = 90;
        reason =
          "Location pre-permitted for film shoots. Can start immediately.";
      } else if (permitDays <= 5) {
        score = 75;
        reason =
          `Fast permit timeline (${permitDays} days). Can obtain permit before original shoot date.`;
      } else if (permitDays <= 10) {
        score = 55;
        reason =
          `Moderate permit timeline (${permitDays} days). Tight but possible timeline.`;
      } else {
        score = 30;
        reason =
          `Slow permit process (${permitDays}+ days). Does not solve original crisis.`;
      }
    } else if (crisisType === "EQUIPMENT_FAILURE") {
      // Equipment crisis: New location must have alternative equipment available
      const hasEquipmentSupport = location.hasEquipmentRental || false;

      if (hasEquipmentSupport) {
        score = 80;
        reason =
          "Location has equipment rental services. Can source replacement gear immediately.";
      } else {
        score = 50;
        reason =
          "Standard equipment support. May need to import from city. Delays possible.";
      }
    } else if (crisisType === "CREW_UNAVAILABLE") {
      // Crew crisis: New location must be accessible to remaining crew
      const distanceFromCity = location.distanceFromCityKm || 999;

      if (distanceFromCity < 20) {
        score = 75;
        reason =
          "City-adjacent location. Easier to bring in replacement crew/coordination.";
      } else if (distanceFromCity < 50) {
        score = 50;
        reason =
          "Moderate distance. Crew commute extended but manageable.";
      } else {
        score = 30;
        reason = "Remote location. Difficult to source replacement crew.";
      }
    }

    return { score: Math.min(100, score), reason };
  }

  // ============================================================================
  // EVALUATION 2: Can the original scene be shot at this new location?
  // ============================================================================
  _evaluateSceneCompatibility(location, originalScene) {
    const sceneType = originalScene.sceneType || "generic";
    const isOutdoor = originalScene.isOutdoor || false;
    const requiresSpecificAesthetic = originalScene.requiresSpecificAesthetic ||
      false;
    const locationAesthetic = location.aestheticMatch || [];

    let score = 50;
    let reason = "Moderate visual compatibility";

    // For outdoor scenes, MUST move to location with outdoor capability
    if (isOutdoor && !location.hasOutdoorArea) {
      score = 20;
      reason =
        "Original scene requires outdoor shoot. New location has no outdoor area. " +
        "Scene would require major rewrite.";
    } else if (isOutdoor && location.hasOutdoorArea) {
      score = 75;
      reason =
        "Both locations have outdoor areas. Visual rewrite possible but manageable.";
    }

    // Check aesthetic match
    if (requiresSpecificAesthetic) {
      const aestheticMatched = locationAesthetic.some((a) =>
        originalScene.requiredAesthetic?.includes(a)
      );

      if (aestheticMatched) {
        score = Math.min(90, score + 20);
        reason += " Aesthetic characteristics align with original scene intent.";
      } else {
        score = Math.max(30, score - 20);
        reason +=
          " Location aesthetic differs from original. Creative adaptation required.";
      }
    }

    return { score: Math.min(100, score), reason };
  }

  // ============================================================================
  // EVALUATION 3: How ready is this location to shoot, in general?
  // ============================================================================
  _evaluateProductionReadiness(location) {
    const permitsObtained = location.permitsObtained || false;
    const isPrepped = location.isPrepped || false;
    const crewAccessibility = location.hasParking ? 70 : 40;

    let score = 50;
    let reason = "Standard readiness";

    if (permitsObtained && isPrepped) {
      score = 95;
      reason = "Location fully prepared and permitted. Can start shooting immediately.";
    } else if (permitsObtained) {
      score = 75;
      reason = "Permits obtained. Location needs basic setup only.";
    } else if (isPrepped) {
      score = 65;
      reason = "Location setup complete. Permits still pending but can be expedited.";
    } else {
      score = 45;
      reason = "Location requires full prep and permit process.";
    }

    return { score, reason };
  }

  // ============================================================================
  // HELPER: Viability Status
  // ============================================================================
  _categorizeViability(score) {
    if (score >= 75) return "HIGHLY_VIABLE";
    if (score >= 55) return "VIABLE";
    if (score >= 35) return "QUESTIONABLE";
    return "NOT_VIABLE";
  }

  // ============================================================================
  // HELPER: Recommendation
  // ============================================================================
  _recommendAlternative(score) {
    const status = this._categorizeViability(score);

    if (status === "HIGHLY_VIABLE") {
      return "✓ RECOMMENDED. This location solves the crisis and can accommodate the scene.";
    } else if (status === "VIABLE") {
      return (
        "≈ CONSIDER. Location is viable but has constraints. " +
        "Director may need to adapt scene for new location."
      );
    } else if (status === "QUESTIONABLE") {
      return (
        "⚠ RISKY. Location has significant constraints. " +
        "Only use if no other options available."
      );
    } else {
      return (
        "✗ NOT RECOMMENDED. Location does not address crisis or is incompatible with scene."
      );
    }
  }
}

module.exports = {
  AlternativeReadinessEvaluator,
};
