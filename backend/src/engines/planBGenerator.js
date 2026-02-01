/**
 * VordGuard Plan-B Generator Engine
 * Creates 3 fallback production scenarios when crisis hits
 * Transparent, rule-based, explainable alternatives
 */

const { LocationReadinessCalculator } = require("./scoringEngine");

class PlanBGenerator {
  constructor() {
    this.readinessCalc = new LocationReadinessCalculator();
  }

  /**
   * Main entry point: Generate 3 Plan-B options for a crisis
   */
  generatePlanB(crisis, project, mockLocations) {
    const plans = [];

    // Plan B1: Backup Location
    const backupLocationPlan = this.generateBackupLocationPlan(
      crisis,
      project,
      mockLocations
    );
    plans.push(backupLocationPlan);

    // Plan B2: Alternate Shoot Days
    const alternateDaysPlan = this.generateAlternateDaysPlan(
      crisis,
      project
    );
    plans.push(alternateDaysPlan);

    // Plan B3: Scope Reduction
    const scopeReductionPlan = this.generateScopeReductionPlan(
      crisis,
      project
    );
    plans.push(scopeReductionPlan);

    return {
      crisisId: crisis.id,
      originalPlan: {
        location: crisis.originalLocation,
        shootDate: crisis.originalShootDate,
        scope: crisis.originalScope,
      },
      planBOptions: plans,
      generatedAt: new Date().toISOString(),
      disclaimer:
        "⚠️ Decision-support tool. Not legal/financial advice. Producer must validate all options.",
    };
  }

  /**
   * Plan B1: Find backup locations with better readiness
   */
  generateBackupLocationPlan(crisis, project, mockLocations) {
    // Filter locations: same region, different from original
    const candidates = mockLocations.filter(
      (loc) =>
        loc.region === crisis.region &&
        loc.id !== crisis.originalLocationId
    );

    // Score each candidate
    const scored = candidates
      .map((loc) => ({
        ...loc,
        analysis: this.readinessCalc.calculateReadinessScore(loc),
      }))
      .sort((a, b) => b.analysis.readinessScore - a.analysis.readinessScore)
      .slice(0, 2); // Take top 2

    const bestBackup = scored[0] || candidates[0];

    return {
      planType: "BACKUP_LOCATION",
      rank: 1,
      title: `Relocate to ${bestBackup.name}`,
      description: `Switch to nearby location with better production readiness.`,
      details: {
        newLocation: bestBackup.name,
        originalLocation: crisis.originalLocation,
        distance: `${bestBackup.distanceFromOriginalKm}km away`,
        reason: this.generateLocationRecommendationReason(
          bestBackup.analysis
        ),
      },
      metrics: {
        readinessScore: bestBackup.analysis.readinessScore,
        weatherStability: bestBackup.analysis.factors.weatherStability.score,
        permitApprovalDays:
          bestBackup.estimatedApprovalDays || 14,
      },
      impact: {
        budgetImpact: this.calculateBudgetImpact(
          "LOCATION_CHANGE",
          bestBackup
        ),
        disruptionLevel: this.calculateDisruption(
          "LOCATION_CHANGE",
          bestBackup
        ),
        confidenceLevel:
          bestBackup.analysis.readinessScore > 75 ? "HIGH" : "MEDIUM",
      },
      reasoning: `${bestBackup.name} offers ${bestBackup.analysis.readinessScore}% readiness vs ${crisis.originalReadinessScore || 50}% for original location. Key advantage: ${bestBackup.analysis.factors.weatherStability.reason}.`,
    };
  }

  /**
   * Plan B2: Find alternative shoot windows
   */
  generateAlternateDaysPlan(crisis, project) {
    const crisisMonth = new Date(crisis.originalShootDate).getMonth() + 1;
    const alternatives = [];

    // Look for weather-friendly windows in adjacent months
    const adjacentMonths = [
      (crisisMonth + 12) % 12 || 12,
      (crisisMonth + 1) % 12 || 12,
    ];

    adjacentMonths.forEach((month) => {
      const weatherRisk = this.estimateWeatherRiskForMonth(month);
      alternatives.push({
        month,
        weatherRisk,
        delay: Math.abs(month - crisisMonth) * 30, // Rough estimate
      });
    });

    const best = alternatives.reduce((a, b) =>
      a.weatherRisk < b.weatherRisk ? a : b
    );

    const monthName = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][best.month - 1];

    return {
      planType: "ALTERNATE_SHOOT_DAYS",
      rank: 2,
      title: `Reschedule to ${monthName} (${best.delay} day delay)`,
      description: `Push production to weather-favorable window.`,
      details: {
        originalDate: crisis.originalShootDate,
        newMonth: monthName,
        estimatedDelay: `${best.delay} days`,
        reason: this.getMonthRecommendationReason(best.month),
      },
      metrics: {
        weatherRiskReduction:
          ((crisis.weatherRisk || 60) - best.weatherRisk) + "%",
        permitApprovalTimeGained: "14-21 days",
        scheduleFlexibility: "MEDIUM",
      },
      impact: {
        budgetImpact: this.calculateBudgetImpact(
          "RESCHEDULE",
          best
        ),
        disruptionLevel: "MEDIUM",
        confidenceLevel: "HIGH",
      },
      reasoning: `Rescheduling to ${monthName} reduces weather risk from 60% to ${best.weatherRisk}%. Additional benefit: ${best.delay} extra days for permits and planning.`,
    };
  }

  /**
   * Plan B3: Reduce scope to minimize risk
   */
  generateScopeReductionPlan(crisis, project) {
    const reductions = [];

    // Option 1: Reduce shoot days
    if (crisis.shootDurationDays > 1) {
      reductions.push({
        type: "REDUCE_DAYS",
        from: crisis.shootDurationDays,
        to: Math.ceil(crisis.shootDurationDays * 0.7),
        name: `Reduce from ${crisis.shootDurationDays} to ${Math.ceil(crisis.shootDurationDays * 0.7)} days`,
        budgetSaving: 20,
        feasibility: "HIGH",
        tradeoff:
          "Fewer shooting days = tighter schedule, less coverage buffer",
      },
    });

    // Option 2: Switch night → day
    if (crisis.hasNightShoot) {
      reductions.push({
        type: "SWITCH_NIGHT_TO_DAY",
        name: "Convert night scenes to day/dusk shots",
        budgetSaving: 25,
        feasibility: "MEDIUM",
        tradeoff:
          "Visual aesthetic changes. May require script adjustments.",
      });
    }

    // Option 3: Reduce equipment complexity
    if (crisis.hasDrone || crisis.hasCrane) {
      reductions.push({
        type: "REDUCE_EQUIPMENT",
        name: "Replace drone/crane with sticks/dolly",
        budgetSaving: 30,
        feasibility: "MEDIUM",
        tradeoff: "Different visual style. Limited POVs.",
      });
    }

    // Option 4: Reduce crowd
    if (crisis.crowdSize > 30) {
      reductions.push({
        type: "REDUCE_CROWD",
        from: crisis.crowdSize,
        to: Math.ceil(crisis.crowdSize * 0.6),
        name: `Reduce extras from ${crisis.crowdSize} to ${Math.ceil(crisis.crowdSize * 0.6)}`,
        budgetSaving: 15,
        feasibility: "MEDIUM",
        tradeoff: "Less grand look. Focus on key scenes.",
      });
    }

    const best = reductions[0] || {
      type: "MINIMAL_SCOPE",
      name: "Minimize to essential shots only",
      budgetSaving: 35,
      feasibility: "HIGH",
      tradeoff: "Significantly reduced production value",
    };

    return {
      planType: "SCOPE_REDUCTION",
      rank: 3,
      title: `Reduce Scope: ${best.name}`,
      description: `Scale back production requirements to mitigate crisis impact.`,
      details: {
        reductionType: best.type,
        originalScope: crisis.originalScope,
        description: best.name,
      },
      metrics: {
        budgetSavings: `${best.budgetSaving}%`,
        scheduleCompression: "10-15%",
        riskMitigation: "SIGNIFICANT",
      },
      impact: {
        budgetImpact: "POSITIVE",
        disruptionLevel: "LOW",
        confidenceLevel: best.feasibility === "HIGH" ? "HIGH" : "MEDIUM",
      },
      reasoning: `${best.name}. Budget saving: ~${best.budgetSaving}%. Tradeoff: ${best.tradeoff}. Producer judgment needed on creative implications.`,
    };
  }

  // ===== Helper Methods =====

  generateLocationRecommendationReason(analysis) {
    const topFactor = Object.entries(analysis.factors).sort(
      (a, b) => b[1].score - a[1].score
    )[0];

    return topFactor
      ? `Strong point: ${topFactor[1].reason}`
      : "Improved overall readiness";
  }

  getMonthRecommendationReason(month) {
    // India-specific
    if (month >= 12 || month <= 2) {
      return "Winter: clear skies, minimal rain, ideal conditions";
    } else if (month >= 3 && month <= 5) {
      return "Pre-monsoon: warm but stable";
    } else if (month >= 6 && month <= 9) {
      return "Monsoon: high rain risk";
    }
    return "Post-monsoon transition";
  }

  estimateWeatherRiskForMonth(month) {
    // Simplified India monsoon risk
    if (month >= 6 && month <= 9) return 70; // High risk
    if (month >= 3 && month <= 5) return 40; // Medium risk
    return 15; // Low risk (winter/post-monsoon)
  }

  calculateBudgetImpact(planType, details) {
    const impacts = {
      LOCATION_CHANGE: details.rentalCostUSD > 10000 ? "HIGH" : "MEDIUM",
      RESCHEDULE: "LOW",
      REDUCE_EQUIPMENT: "POSITIVE",
    };
    return impacts[planType] || "MEDIUM";
  }

  calculateDisruption(planType, details) {
    const disruptions = {
      LOCATION_CHANGE: "MEDIUM",
      RESCHEDULE: "HIGH",
      REDUCE_EQUIPMENT: "MEDIUM",
    };
    return disruptions[planType] || "MEDIUM";
  }
}

module.exports = { PlanBGenerator };
