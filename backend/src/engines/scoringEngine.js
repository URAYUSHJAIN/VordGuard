/**
 * VordGuard Deterministic Scoring Engine
 * Rule-based, transparent calculations for production risk assessment
 * NO AI. Pure logic. Explainable.
 */

/**
 * Scene Risk Profile Analyzer
 * Calculates risk for a scene based on production requirements
 */
class SceneRiskAnalyzer {
  analyzeSceneRisk(scene) {
    const factors = [];
    let totalRiskScore = 0;

    // 1. Weather Sensitivity
    const weatherRisk = this.calculateWeatherRisk(scene);
    factors.push(weatherRisk);
    totalRiskScore += weatherRisk.score * 0.3; // 30% weight

    // 2. Permit Dependency
    const permitRisk = this.calculatePermitRisk(scene);
    factors.push(permitRisk);
    totalRiskScore += permitRisk.score * 0.25; // 25% weight

    // 3. Equipment Complexity
    const equipmentRisk = this.calculateEquipmentRisk(scene);
    factors.push(equipmentRisk);
    totalRiskScore += equipmentRisk.score * 0.2; // 20% weight

    // 4. Crowd/Logistics
    const logisticsRisk = this.calculateLogisticsRisk(scene);
    factors.push(logisticsRisk);
    totalRiskScore += logisticsRisk.score * 0.15; // 15% weight

    // 5. Night/Specialized Shoot
    const specializedRisk = this.calculateSpecializedRisk(scene);
    factors.push(specializedRisk);
    totalRiskScore += specializedRisk.score * 0.1; // 10% weight

    totalRiskScore = Math.min(100, Math.round(totalRiskScore));

    return {
      sceneId: scene.id,
      riskScore: totalRiskScore,
      riskLevel: this.getRiskLevel(totalRiskScore),
      factors,
      summary: this.generateRiskSummary(totalRiskScore, factors),
    };
  }

  calculateWeatherRisk(scene) {
    const season = scene.season || "monsoon"; // India context
    const shootDuration = scene.shootDurationDays || 1;

    let baseScore = 30; // Default moderate
    let reason = "Standard weather variability";

    if (season === "monsoon") {
      baseScore = 80;
      reason = "Monsoon season: high rain risk, unpredictable conditions";
    } else if (season === "summer") {
      baseScore = 40;
      reason = "Summer: heat challenges, afternoon delays likely";
    } else if (season === "winter") {
      baseScore = 20;
      reason = "Winter: stable, predictable weather";
    }

    // Increase score for longer shoots
    if (shootDuration > 5) {
      baseScore += 15;
      reason += "; Long shoot duration increases weather exposure";
    }

    return {
      factor: "Weather Sensitivity",
      score: Math.min(100, baseScore),
      reason,
    };
  }

  calculatePermitRisk(scene) {
    const locationType = scene.locationType || "studio"; // "studio", "public", "protected", "residential"
    const requiresPermit = scene.requiresPermit || false;

    let baseScore = 10;
    let reason = "Minimal permit requirements";

    if (requiresPermit) {
      if (locationType === "protected") {
        baseScore = 85;
        reason = "Protected/Heritage location: lengthy approval process (2-4 weeks)";
      } else if (locationType === "public") {
        baseScore = 65;
        reason = "Public space: permit needed, coordination with local authorities";
      } else if (locationType === "residential") {
        baseScore = 55;
        reason = "Residential area: noise/disturbance permits required";
      }
    }

    return {
      factor: "Permit Complexity",
      score: baseScore,
      reason,
    };
  }

  calculateEquipmentRisk(scene) {
    const hasSpecialEquipment = scene.hasSpecialEquipment || false;
    const droneRequired = scene.droneRequired || false;
    const craneRequired = scene.craneRequired || false;

    let baseScore = 20;
    let reason = "Standard camera equipment";

    if (droneRequired) {
      baseScore = 75;
      reason = "Drone required: airspace approval, weather dependency, operator availability";
    } else if (craneRequired) {
      baseScore = 60;
      reason = "Crane required: specialized crew, safety protocols, weather risk";
    } else if (hasSpecialEquipment) {
      baseScore = 40;
      reason = "Special equipment: sourcing delays possible, rental dependencies";
    }

    return {
      factor: "Equipment Complexity",
      score: baseScore,
      reason,
    };
  }

  calculateLogisticsRisk(scene) {
    const crowdSize = scene.crowdSize || 0; // 0 = no crowd, 1-50 = small, 50+ = large
    const catering = scene.cateringRequired || false;
    const transportRequired = scene.transportRequired || false;

    let baseScore = 15;
    let reason = "Standard crew logistics";

    if (crowdSize > 100) {
      baseScore = 70;
      reason = "Large crowd (100+): coordination complexity, safety permits, traffic control";
    } else if (crowdSize > 30) {
      baseScore = 45;
      reason = "Medium crowd (30-100): crowd management, safety briefings needed";
    } else if (crowdSize > 0) {
      baseScore = 25;
      reason = "Small crowd (1-30): minor coordination overhead";
    }

    if (catering) {
      baseScore += 10;
      reason += "; Catering adds supply chain dependency";
    }

    if (transportRequired) {
      baseScore += 10;
      reason += "; Transport logistics increases coordination points";
    }

    return {
      factor: "Crowd & Logistics",
      score: Math.min(100, baseScore),
      reason,
    };
  }

  calculateSpecializedRisk(scene) {
    const isNightShoot = scene.isNightShoot || false;
    const underwaterShoot = scene.underwaterShoot || false;
    const aerialShoot = scene.aerialShoot || false;

    let baseScore = 10;
    let reason = "Standard day shoot";

    if (underwaterShoot) {
      baseScore = 90;
      reason = "Underwater shoot: extreme risk, specialized safety protocols, weather dependent";
    } else if (aerialShoot) {
      baseScore = 80;
      reason = "Aerial shoot: airspace clearance, weather critical, insurance requirements";
    } else if (isNightShoot) {
      baseScore = 45;
      reason = "Night shoot: lighting setup time, crew fatigue, safety concerns";
    }

    return {
      factor: "Specialized Requirements",
      score: baseScore,
      reason,
    };
  }

  getRiskLevel(score) {
    if (score < 35) return "LOW";
    if (score < 65) return "MEDIUM";
    return "HIGH";
  }

  generateRiskSummary(score, factors) {
    const topRisks = factors
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    const topRiskNames = topRisks.map((f) => f.factor.toLowerCase()).join(", ");

    if (score < 35) {
      return `Low-risk scene. Main considerations: ${topRiskNames}.`;
    } else if (score < 65) {
      return `Moderate risk. Key challenges: ${topRiskNames}. Plan-B recommended.`;
    } else {
      return `High-risk scene. Critical factors: ${topRiskNames}. Fallback plans essential.`;
    }
  }
}

/**
 * Location Readiness Calculator
 * Determines how "ready" a location is for production
 * Output: 0-100 score with transparent factor breakdown
 */
class LocationReadinessCalculator {
  calculateReadinessScore(location) {
    const factors = {};

    // 1. Permit Complexity (25%)
    factors.permitComplexity = this.scorePermitComplexity(location);

    // 2. Weather Stability (25%)
    factors.weatherStability = this.scoreWeatherStability(location);

    // 3. Crew Availability (20%)
    factors.crewAvailability = this.scoreCrewAvailability(location);

    // 4. Cost Volatility (15%)
    factors.costVolatility = this.scoreCostVolatility(location);

    // 5. Regulatory Risk (15%)
    factors.regulatoryRisk = this.scoreRegulatoryRisk(location);

    // Weighted calculation
    const readinessScore = Math.round(
      factors.permitComplexity.score * 0.25 +
      factors.weatherStability.score * 0.25 +
      factors.crewAvailability.score * 0.2 +
      factors.costVolatility.score * 0.15 +
      factors.regulatoryRisk.score * 0.15
    );

    return {
      locationId: location.id,
      locationName: location.name,
      readinessScore: Math.min(100, readinessScore),
      readinessLevel: this.getReadinessLevel(readinessScore),
      factors,
      recommendation: this.generateReadinessRecommendation(readinessScore),
    };
  }

  scorePermitComplexity(location) {
    const permitStatus = location.permitStatus || "pending"; // "approved", "pending", "denied"
    const approvalDays = location.estimatedApprovalDays || 14;

    let score = 50;
    let reason = "Average permit timeline";

    if (permitStatus === "approved") {
      score = 95;
      reason = "Permits already approved. Ready to shoot.";
    } else if (permitStatus === "denied") {
      score = 10;
      reason = "Permits denied. Location not available.";
    } else if (approvalDays <= 3) {
      score = 80;
      reason = `Fast-track approval: ${approvalDays} days. Low permit risk.`;
    } else if (approvalDays <= 7) {
      score = 60;
      reason = `Standard approval: ${approvalDays} days. Moderate risk.`;
    } else {
      score = 35;
      reason = `Long approval: ${approvalDays} days. Plan alternatives.`;
    }

    return { score, reason };
  }

  scoreWeatherStability(location) {
    const climate = location.climate || "subtropical"; // "tropical", "subtropical", "temperate", "arid"
    const monthOfShoot = location.monthOfShoot || 6; // 1-12

    let score = 50;
    let reason = "Moderate weather predictability";

    // India-specific logic
    if (climate === "tropical" && (monthOfShoot >= 6 && monthOfShoot <= 9)) {
      score = 25;
      reason = "Monsoon months: high rain probability (60%+). Weather unstable.";
    } else if (climate === "subtropical" && (monthOfShoot >= 12 || monthOfShoot <= 2)) {
      score = 85;
      reason = "Winter months: clear skies, minimal weather disruption. Ideal.";
    } else if (monthOfShoot >= 3 && monthOfShoot <= 5) {
      score = 40;
      reason = "Summer: intense heat, afternoon thunderstorms possible.";
    } else {
      score = 70;
      reason = "Off-season: stable weather expected.";
    }

    return { score, reason };
  }

  scoreCrewAvailability(location) {
    const crewDistance = location.crewDistanceKm || 50; // km from main hub
    const crewHubsNearby = location.crewHubsNearby || 0; // number of major crew hubs

    let score = 50;
    let reason = "Moderate crew availability";

    if (crewDistance < 10 && crewHubsNearby >= 2) {
      score = 95;
      reason = "Central location. Multiple crew hubs nearby. Easy recruitment.";
    } else if (crewDistance < 50 && crewHubsNearby >= 1) {
      score = 75;
      reason = `Within commute range (${crewDistance}km). Crew available.`;
    } else if (crewDistance < 100) {
      score = 55;
      reason = `Remote (${crewDistance}km). Crew willing but requires accommodation.`;
    } else {
      score = 25;
      reason = `Very remote (${crewDistance}km+). Difficulty recruiting quality crew.`;
    }

    return { score, reason };
  }

  scoreCostVolatility(location) {
    const rentalCostUSD = location.rentalCostUSD || 5000;
    const priceStability = location.priceStability || "moderate"; // "fixed", "moderate", "volatile"

    let score = 50;
    let reason = "Moderate cost stability";

    if (priceStability === "fixed" && rentalCostUSD < 10000) {
      score = 90;
      reason = `Fixed rate: $${rentalCostUSD}. Predictable budgeting.`;
    } else if (priceStability === "moderate") {
      score = 55;
      reason = `Moderate volatility. Rate: $${rentalCostUSD}. Budget buffer needed.`;
    } else {
      score = 20;
      reason = `Volatile pricing. Potential cost overruns. High budget risk.`;
    }

    return { score, reason };
  }

  scoreRegulatoryRisk(location) {
    const restrictionLevel = location.restrictionLevel || "moderate"; // "open", "moderate", "restricted"
    const requiresSpecialLicense = location.requiresSpecialLicense || false;

    let score = 50;
    let reason = "Standard regulatory requirements";

    if (restrictionLevel === "open" && !requiresSpecialLicense) {
      score = 90;
      reason = "Open location. No special licenses needed.";
    } else if (restrictionLevel === "moderate") {
      score = 55;
      reason = "Moderate restrictions. Standard compliance needed.";
    } else {
      score = 20;
      reason = "Heavily restricted. Specialized permits required. High complexity.";
    }

    if (requiresSpecialLicense) {
      score -= 20;
      reason += " Special license mandatory.";
    }

    return { score: Math.max(0, score), reason };
  }

  getReadinessLevel(score) {
    if (score >= 80) return "READY";
    if (score >= 50) return "CAUTION";
    return "NOT_READY";
  }

  generateReadinessRecommendation(score) {
    if (score >= 80) {
      return "✅ Location is production-ready. Proceed with confidence.";
    } else if (score >= 50) {
      return "⚠️ Location usable but with dependencies. Prepare fallbacks.";
    } else {
      return "❌ Location not recommended. Too many risk factors. Use Plan-B locations.";
    }
  }
}

module.exports = {
  SceneRiskAnalyzer,
  LocationReadinessCalculator,
};
