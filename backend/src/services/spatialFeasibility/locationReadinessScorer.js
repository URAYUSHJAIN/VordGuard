/**
 * SPATIAL FEASIBILITY LAYER
 * 
 * Module: Spatial & Location Evaluator
 * Purpose: Assess whether a production requirement can be adapted or moved
 * 
 * Context: This layer answers production questions like:
 * - "Can this indoor scene be shot outdoors instead?"
 * - "Can we shift this outdoor scene indoors?"
 * - "Can we reduce complexity without destroying artistic intent?"
 * 
 * Philosophy: Boolean checks + scoring. Transparent constraints. No hidden logic.
 * All decisions driven by explicit location attributes and scene requirements.
 */

/**
 * Location Readiness Scorer
 * 
 * Evaluates whether a location is "ready" for a scene
 * Based on 5 independent feasibility factors
 * 
 * Output: Score 0-100, with clear breakdown of what makes a location suitable
 */
class LocationReadinessScorer {
  /**
   * Main entry point: Can this location shoot this scene?
   * 
   * Returns: Score (0-100), status (NOT_READY / CAUTION / READY), and factor breakdown
   */
  evaluateLocationReadiness(location) {
    if (!location || !location.id) {
      throw new Error("Location must have an ID");
    }

    // Evaluate 5 independent feasibility factors
    // These determine whether a location can ACTUALLY support the production
    const permitReadiness = this._evaluatePermitReadiness(location);
    const weatherFeasibility = this._evaluateWeatherFeasibility(location);
    const crewAccessibility = this._evaluateCrewAccessibility(location);
    const costViability = this._evaluateCostViability(location);
    const regulatoryCompliance = this._evaluateRegulatoryCompliance(location);

    // Combine factors with equal weighting (20% each)
    // In reality, these are co-dependent: all must be acceptable for a location to work
    const factors = [
      { ...permitReadiness, weight: 0.2 },
      { ...weatherFeasibility, weight: 0.2 },
      { ...crewAccessibility, weight: 0.2 },
      { ...costViability, weight: 0.2 },
      { ...regulatoryCompliance, weight: 0.2 },
    ];

    const readinessScore = Math.round(
      factors.reduce((sum, f) => sum + f.score * f.weight, 0)
    );

    return {
      locationId: location.id,
      locationName: location.name,
      readinessScore,
      readinessStatus: this._categorizeReadiness(readinessScore),
      factors: factors.map((f) => ({
        name: f.name,
        score: f.score,
        status: f.status,
        reason: f.reason,
      })),
      recommendation: this._generateReadinessRecommendation(readinessScore),
      disclaimer:
        "Readiness score is based on location data only. Final feasibility requires on-site verification and producer judgment.",
    };
  }

  // ============================================================================
  // FACTOR 1: PERMIT READINESS (20% weight)
  // Why: Permits are the hard constraint. If not ready, location cannot be used.
  // ============================================================================
  _evaluatePermitReadiness(location) {
    const permitsObtained = location.permitsObtained || false;
    const daysToObtainPermit = location.estimatedPermitDays || 14;
    const isPermitFrequency = location.isPrePermitted || false;

    let score = 0;
    let status = "NOT_READY";
    let reason = "No permit data available";

    if (permitsObtained) {
      score = 95;
      status = "READY";
      reason = "All permits already obtained and valid. Location cleared to shoot immediately.";
    } else if (isPermitFrequency) {
      score = 75;
      status = "CAUTION";
      reason =
        "Location has pre-approval for film shoots. Standard permit application required (5-7 days). " +
        "Can be expedited.";
    } else if (daysToObtainPermit <= 7) {
      score = 60;
      status = "CAUTION";
      reason =
        `Quick permit turnaround (${daysToObtainPermit} days). Possible but requires immediate application. ` +
        "No delays acceptable.";
    } else if (daysToObtainPermit <= 14) {
      score = 40;
      status = "CAUTION";
      reason =
        `Moderate permit timeline (${daysToObtainPermit} days). Needs to start immediately. ` +
        "Backup location recommended.";
    } else {
      score = 15;
      status = "NOT_READY";
      reason =
        `Long permit process (${daysToObtainPermit}+ days). Not feasible for urgent shoots. ` +
        "Only viable for well-planned productions.";
    }

    return {
      name: "Permit Readiness",
      score,
      status,
      reason,
    };
  }

  // ============================================================================
  // FACTOR 2: WEATHER FEASIBILITY (20% weight)
  // Why: A location's natural weather patterns determine when it can be used
  // ============================================================================
  _evaluateWeatherFeasibility(location) {
    const climateType = location.climateType || "temperate"; // monsoon, coastal, hill, desert, urban
    const averageRainfallPercent = location.averageRainfallPercent || 30;
    const hasWeatherProtection = location.hasWeatherProtection || false;

    let score = 50;
    let status = "CAUTION";
    let reason = "Standard location weather patterns";

    if (hasWeatherProtection) {
      score = 85;
      status = "READY";
      reason =
        "Location has built structures, roofing, or weather barriers. " +
        "Can adapt to outdoor scenes indoors. All-weather usable.";
    } else if (averageRainfallPercent < 20) {
      score = 75;
      status = "READY";
      reason =
        "Low rainfall area. Outdoor shoots viable year-round. " +
        "Minimal weather delays expected.";
    } else if (averageRainfallPercent < 50) {
      score = 55;
      status = "CAUTION";
      reason =
        `Moderate rainfall (${averageRainfallPercent}% days rainy). Plan outdoor shoots for dry season. ` +
        "Have indoor backup for improvisation scenes.";
    } else {
      score = 35;
      status = "CAUTION";
      reason =
        `High rainfall area (${averageRainfallPercent}% of season). Outdoor shoots risky. ` +
        "Primarily suited for monsoon/weather-dependent narratives.";
    }

    return {
      name: "Weather Feasibility",
      score,
      status,
      reason,
    };
  }

  // ============================================================================
  // FACTOR 3: CREW ACCESSIBILITY (20% weight)
  // Why: If crew can't reach the location, shoot cannot happen
  // ============================================================================
  _evaluateCrewAccessibility(location) {
    const distanceFromCityKm = location.distanceFromCityKm || 0;
    const hasParking = location.hasParking || false;
    const crewAccommodationNearby = location.crewAccommodationNearby || false;
    const hasInfrastructure = location.hasWaterPower || false;

    let score = 40;
    let status = "CAUTION";
    let reason = "Limited infrastructure";
    const accessFactors = [];

    // Distance: Every 10km adds accessibility challenge
    if (distanceFromCityKm < 10) {
      score += 25;
      accessFactors.push("Within city (quick access)");
    } else if (distanceFromCityKm < 30) {
      score += 15;
      accessFactors.push(`${distanceFromCityKm}km from city (45min-1hr commute)`);
    } else if (distanceFromCityKm < 60) {
      score += 5;
      accessFactors.push(`${distanceFromCityKm}km from city (remote location)`);
    } else {
      score -= 10;
      accessFactors.push(`${distanceFromCityKm}km from city (very remote)`);
    }

    if (hasParking) {
      score += 15;
      accessFactors.push("Ample parking for crew trucks");
    }

    if (crewAccommodationNearby) {
      score += 15;
      accessFactors.push("Hotels/accommodation nearby for long shoots");
    }

    if (hasInfrastructure) {
      score += 10;
      accessFactors.push("Water and power access confirmed");
    }

    score = Math.max(0, Math.min(100, score));
    status = score > 65 ? "READY" : score > 40 ? "CAUTION" : "NOT_READY";
    reason = accessFactors.join("; ");

    return {
      name: "Crew Accessibility",
      score,
      status,
      reason,
    };
  }

  // ============================================================================
  // FACTOR 4: COST VIABILITY (20% weight)
  // Why: Budget determines whether alternatives are actually available
  // ============================================================================
  _evaluateCostViability(location) {
    const costPerDay = location.costPerDay || 5000; // Base unit
    const requiresSpecialCharges = location.requiresSpecialCharges || false;
    const isFreeBudgetOption = location.isBudgetFriendly || false;

    let score = 50;
    let status = "CAUTION";
    let reason = "Standard location costs";

    if (isFreeBudgetOption) {
      score = 90;
      status = "READY";
      reason =
        "Budget-friendly location. Free or minimal charges. " +
        "Ideal for low-budget productions or contingency shoots.";
    } else if (costPerDay < 3000) {
      score = 75;
      status = "READY";
      reason =
        `Affordable location (₹${costPerDay}/day). ` +
        "Multiple days feasible within typical budgets.";
    } else if (costPerDay < 8000) {
      score = 55;
      status = "CAUTION";
      reason =
        `Premium location (₹${costPerDay}/day). ` +
        "Multiple-day shoots strain budget. Best for key scenes.";
    } else {
      score = 30;
      status = "NOT_READY";
      reason =
        `High-cost location (₹${costPerDay}/day). ` +
        "Only viable for single-day shoots or top-tier productions.";
    }

    if (requiresSpecialCharges) {
      score -= 10;
      reason +=
        " Additional fees for special requirements (permits, crowd control, etc).";
    }

    return {
      name: "Cost Viability",
      score: Math.max(0, Math.min(100, score)),
      status,
      reason,
    };
  }

  // ============================================================================
  // FACTOR 5: REGULATORY COMPLIANCE (20% weight)
  // Why: Some locations have hard regulatory constraints
  // ============================================================================
  _evaluateRegulatoryCompliance(location) {
    const locationType = location.locationType || "private";
    const hasEnvironmentalClearance = location.hasEnvironmentalClearance || false;
    const isHeritageMarked = location.isHeritageMarked || false;
    const requiresSpecialApprovals = location.requiresSpecialApprovals || false;

    let score = 70;
    let status = "READY";
    let reason = "Standard regulatory status";

    if (locationType === "private") {
      score = 85;
      status = "READY";
      reason =
        "Private location. Owner permission sufficient. No government approvals needed beyond basic permits.";
    } else if (locationType === "public") {
      score = 60;
      status = "CAUTION";
      reason =
        "Public space. Municipal approval required. Standard regulations apply. " +
        "Need crowd management plan.";
    } else if (locationType === "protected") {
      score = 25;
      status = "NOT_READY";
      reason =
        "Protected/Heritage location. Requires ASI clearance + environmental assessment. " +
        "Timeline: 4-8 weeks. Nearly impossible for crisis shoots.";
    }

    if (isHeritageMarked) {
      score -= 20;
      reason +=
        " Heritage marking: Strict rules on equipment, crew size, modifications.";
    }

    if (hasEnvironmentalClearance) {
      score += 15;
      reason +=
        " Environmental clearance already obtained. One less approval needed.";
    }

    if (requiresSpecialApprovals) {
      score -= 15;
      reason +=
        " Special approvals required (ASI, Wildlife Board, etc.). Delays likely.";
    }

    return {
      name: "Regulatory Compliance",
      score: Math.max(0, Math.min(100, score)),
      status,
      reason,
    };
  }

  // ============================================================================
  // HELPER: Readiness Status Categorization
  // ============================================================================
  _categorizeReadiness(score) {
    // Ranges: Is this location actually usable?
    // 0-40: Not ready without major effort
    // 41-70: Caution - usable but has constraints
    // 71-100: Ready to shoot
    if (score < 40) return "NOT_READY";
    if (score < 70) return "CAUTION";
    return "READY";
  }

  // ============================================================================
  // HELPER: Recommendation Based on Readiness
  // ============================================================================
  _generateReadinessRecommendation(score) {
    const status = this._categorizeReadiness(score);

    if (status === "READY") {
      return "✓ Location is production-ready. Can proceed with standard planning.";
    } else if (status === "CAUTION") {
      return (
        "⚠ Location viable but has constraints. " +
        "Recommended: Verify critical factors on-site before finalizing schedule."
      );
    } else {
      return (
        "✗ Location NOT ready for immediate use. " +
        "Would require 2-4 weeks preparation or regulatory approvals. Not recommended for crisis scenarios."
      );
    }
  }
}

module.exports = {
  LocationReadinessScorer,
};
