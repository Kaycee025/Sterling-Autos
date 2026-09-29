/**
 * Onah Franklyn Kenechukwu
 * 2026-09-29
 *
 * Sterling Autos — Sales Automation Engine
 * 
 * Implements a connected 3-stage sales workflow architecture:
 * - Stage 1 (Agent 1): Customer Requirement Analysis & Persona Extraction
 * - Stage 2 (Agent 2): Inventory Multi-Factor Scoring & Contextual Fit Engine
 * - Stage 3 (Agent 3): Personalized Sales Specialist Concierge & Follow-Up Generator
 * 
 * The UI presents this as one seamless, natural customer journey, while
 * maintaining strict sequential data flow internally for auditability.
 */

class SalesAutomationPipeline {
  constructor(inventory) {
    this.inventory = inventory || [];
    this.lastExecutionLog = null;
  }

  /**
   * Main entry point: Executes Stage 1 -> Stage 2 -> Stage 3 sequentially.
   * @param {Object} rawCustomerInput - Raw values submitted from Find Your Car form
   * @returns {Object} Full sales package containing recommendations and follow-up
   */
  async processCustomerJourney(rawCustomerInput) {
    const startTime = performance.now();

    // -------------------------------------------------------------
    // STAGE 1: Requirement Analysis & Profile Synthesis (Agent 1)
    // -------------------------------------------------------------
    const customerProfile = this.stage1_AnalyzeRequirements(rawCustomerInput);

    // -------------------------------------------------------------
    // STAGE 2: Multi-Factor Inventory Matching & Reasoning (Agent 2)
    // -------------------------------------------------------------
    const matchResults = this.stage2_MatchInventory(customerProfile);

    // -------------------------------------------------------------
    // STAGE 3: Personalized Follow-Up & Concierge Synthesis (Agent 3)
    // -------------------------------------------------------------
    const followUpPackage = this.stage3_GenerateFollowUp(customerProfile, matchResults);

    const totalDurationMs = Math.round(performance.now() - startTime);

    // Store execution telemetry for technical auditing
    this.lastExecutionLog = {
      timestamp: new Date().toISOString(),
      durationMs: totalDurationMs,
      stage1_Profile: customerProfile,
      stage2_Matching: matchResults,
      stage3_FollowUp: followUpPackage
    };

    return {
      profile: customerProfile,
      matches: matchResults,
      followUp: followUpPackage,
      telemetry: this.lastExecutionLog
    };
  }

  // ===============================================================
  // STAGE 1 (AGENT 1): REQUIREMENT ANALYSIS & PROFILE EXTRACTION
  // ===============================================================
  stage1_AnalyzeRequirements(input) {
    // 1. Normalize Budget
    let minBudget = 0;
    let maxBudget = 300000000; // default ceiling: 300M Naira

    if (input.budgetPreset) {
      switch (input.budgetPreset) {
        case "under-10m":
          minBudget = 0;
          maxBudget = 10000000;
          break;
        case "10m-20m":
          minBudget = 10000000;
          maxBudget = 20000000;
          break;
        case "20m-40m":
          minBudget = 20000000;
          maxBudget = 40000000;
          break;
        case "40m-70m":
          minBudget = 40000000;
          maxBudget = 70000000;
          break;
        case "70m-plus":
          minBudget = 70000000;
          maxBudget = 300000000;
          break;
        case "custom":
          minBudget = Number(input.customMinBudget) || 0;
          maxBudget = Number(input.customMaxBudget) || 200000000;
          break;
        default:
          minBudget = 0;
          maxBudget = 300000000;
      }
    } else if (input.customMaxBudget) {
      minBudget = Number(input.customMinBudget) || 0;
      maxBudget = Number(input.customMaxBudget) || 200000000;
    }

    // 2. Classify Intended Lifestyle & Driver Persona (Supports single or multi-purpose)
    let purposes = [];
    if (Array.isArray(input.purposes) && input.purposes.length > 0) {
      purposes = [...input.purposes];
    } else if (Array.isArray(input.purpose) && input.purpose.length > 0) {
      purposes = [...input.purpose];
    } else if (typeof input.purpose === "string" && input.purpose.trim()) {
      purposes = input.purpose.split(",").map(p => p.trim()).filter(Boolean);
    }
    if (purposes.length === 0) {
      purposes = ["daily-driving"];
    }

    const primaryPurpose = purposes[0];

    const lifestylePersonas = {
      "family": {
        name: "Family Comfort & Safety",
        priorities: ["seating-capacity", "ride-comfort", "cargo-space", "ground-clearance"],
        weightSpace: 0.35,
        weightReliability: 0.25,
        weightBudget: 0.25,
        weightPerformance: 0.15
      },
      "business": {
        name: "Executive & Corporate Presence",
        priorities: ["prestige", "cabin-quietness", "executive-styling", "reliability"],
        weightSpace: 0.20,
        weightReliability: 0.25,
        weightBudget: 0.25,
        weightPerformance: 0.30
      },
      "daily-driving": {
        name: "Everyday Urban Dependability",
        priorities: ["fuel-economy", "easy-maintenance", "comfort", "reliability"],
        weightSpace: 0.20,
        weightReliability: 0.35,
        weightBudget: 0.30,
        weightPerformance: 0.15
      },
      "long-distance": {
        name: "Inter-State Highway Touring",
        priorities: ["ground-clearance", "durability", "fuel-range", "cabin-comfort"],
        weightSpace: 0.30,
        weightReliability: 0.30,
        weightBudget: 0.20,
        weightPerformance: 0.20
      },
      "luxury": {
        name: "Elite Prestige & Bespoke Luxury",
        priorities: ["prestige", "craftsmanship", "brand-heritage", "cutting-edge-tech"],
        weightSpace: 0.15,
        weightReliability: 0.20,
        weightBudget: 0.15,
        weightPerformance: 0.50
      },
      "performance": {
        name: "Dynamic Power & Driving Engagement",
        priorities: ["acceleration", "handling-poise", "exhaust-character", "styling"],
        weightSpace: 0.10,
        weightReliability: 0.20,
        weightBudget: 0.20,
        weightPerformance: 0.50
      },
      "first-car": {
        name: "Accessible First-Time Ownership",
        priorities: ["low-maintenance", "fuel-efficiency", "parts-availability", "budget"],
        weightSpace: 0.15,
        weightReliability: 0.40,
        weightBudget: 0.35,
        weightPerformance: 0.10
      }
    };

    let persona;
    if (purposes.length === 1) {
      persona = lifestylePersonas[primaryPurpose] || lifestylePersonas["daily-driving"];
    } else {
      const personaNames = purposes.map(p => lifestylePersonas[p] ? lifestylePersonas[p].name.split("&")[0].trim() : p);
      const combinedPriorities = [...new Set(purposes.flatMap(p => lifestylePersonas[p] ? lifestylePersonas[p].priorities : []))];
      persona = {
        name: `${personaNames.slice(0, 2).join(" & ")}${personaNames.length > 2 ? ' Versatility' : ''}`,
        priorities: combinedPriorities,
        weightSpace: 0.25,
        weightReliability: 0.25,
        weightBudget: 0.25,
        weightPerformance: 0.25
      };
    }

    // 3. Customer geographic context
    const location = input.location || "Enugu";

    // 4. Construct structured, immutable profile
    return {
      customerName: (input.name && input.name.trim()) ? input.name.trim() : "Valued Client",
      customerPhone: input.phone || "",
      customerEmail: input.email || "",
      budgetRange: {
        min: minBudget,
        max: maxBudget,
        label: this.formatNairaRange(minBudget, maxBudget)
      },
      vehicleTypePreference: input.vehicleType || "any",
      brandPreference: input.brand || "any",
      transmissionPreference: input.transmission || "any",
      fuelPreference: input.fuel || "any",
      intendedPurpose: primaryPurpose,
      intendedPurposes: purposes,
      lifestylePersona: persona,
      location: location,
      importantFeatures: Array.isArray(input.features) ? input.features : (input.features ? [input.features] : []),
      extractedAt: new Date().toISOString()
    };
  }

  // ===============================================================
  // STAGE 2 (AGENT 2): MULTI-FACTOR INVENTORY MATCHING & REASONING
  // ===============================================================
  stage2_MatchInventory(profile) {
    const scoredVehicles = this.inventory.map(vehicle => {
      const evaluation = this.evaluateVehicleFitness(vehicle, profile);
      return {
        vehicle,
        score: evaluation.compositeScore,
        breakdown: evaluation.breakdown,
        isStrictBudgetMatch: evaluation.isStrictBudgetMatch,
        whyItFits: this.synthesizeWhyItFits(vehicle, profile, evaluation)
      };
    });

    // Sort by composite score descending
    scoredVehicles.sort((a, b) => b.score - a.score);

    // Filter into optimal matches (must have strong score AND close/within budget)
    const strongMatches = scoredVehicles.filter(item => {
      const isBudgetSensible = item.isStrictBudgetMatch || (item.vehicle.price <= profile.budgetRange.max * 1.15);
      return item.score >= 65 && isBudgetSensible;
    });

    const hasExactMatches = strongMatches.length > 0;

    const recommendedList = hasExactMatches 
      ? strongMatches.slice(0, 4) 
      : scoredVehicles.slice(0, 3); // Fallback to closest 3 alternatives

    return {
      hasExactMatches,
      status: hasExactMatches ? "optimal_matches_found" : "closest_alternatives_suggested",
      statusMessage: hasExactMatches 
        ? "Based on what you told us, these vehicles are worth a closer look."
        : "We couldn't find an exact match. Here are a few options that come closest to what you're looking for.",
      recommendations: recommendedList,
      totalEvaluated: this.inventory.length
    };
  }

  /**
   * Multi-factor scoring algorithm. Computes genuine 0-100 score based on 6 weighted pillars.
   */
  evaluateVehicleFitness(vehicle, profile) {
    const breakdown = {
      budgetFit: 0,        // 30 pts max
      bodyTypeFit: 0,      // 25 pts max
      brandFit: 0,         // 15 pts max
      purposeFit: 0,       // 15 pts max
      powertrainFit: 0,    // 10 pts max
      locationBonus: 0     // 5 pts max
    };

    // 1. Budget Fit (Max 30 pts)
    const { min, max } = profile.budgetRange;
    let isStrictBudgetMatch = false;

    if (vehicle.price >= min && vehicle.price <= max) {
      breakdown.budgetFit = 30;
      isStrictBudgetMatch = true;
    } else if (vehicle.price < min) {
      // Under budget: still good, slight penalty if way below expectations for luxury
      const ratio = vehicle.price / Math.max(min, 1);
      breakdown.budgetFit = Math.max(15, Math.round(30 * ratio));
    } else {
      // Over budget: smooth decay penalty curve
      const overagePercent = (vehicle.price - max) / max;
      if (overagePercent <= 0.15) {
        breakdown.budgetFit = 20; // 15% stretch is common
      } else if (overagePercent <= 0.30) {
        breakdown.budgetFit = 10;
      } else {
        breakdown.budgetFit = 2;
      }
    }

    // 2. Body Type Fit (Max 25 pts)
    if (profile.vehicleTypePreference === "any") {
      breakdown.bodyTypeFit = 20;
    } else if (vehicle.bodyType.toLowerCase() === profile.vehicleTypePreference.toLowerCase()) {
      breakdown.bodyTypeFit = 25;
    } else if (
      (profile.vehicleTypePreference.toLowerCase() === "suv" && vehicle.bodyType.toLowerCase() === "crossover") ||
      (profile.vehicleTypePreference.toLowerCase() === "crossover" && vehicle.bodyType.toLowerCase() === "suv")
    ) {
      breakdown.bodyTypeFit = 18; // Related styles
    } else {
      breakdown.bodyTypeFit = 5;
    }

    // 3. Brand Fit (Max 15 pts)
    if (profile.brandPreference === "any") {
      breakdown.brandFit = 12;
    } else if (vehicle.make.toLowerCase() === profile.brandPreference.toLowerCase()) {
      breakdown.brandFit = 15;
    } else {
      breakdown.brandFit = 4;
    }

    // 4. Purpose & Lifestyle Suitability (Max 15 pts, supports multi-purpose evaluation)
    const purposes = (profile.intendedPurposes && profile.intendedPurposes.length > 0)
      ? profile.intendedPurposes
      : [profile.intendedPurpose || "daily-driving"];

    let totalPurposePoints = 0;
    let matchingPurposesCount = 0;

    for (const purp of purposes) {
      let currentScore = 6;
      if (purp === "family") {
        if (vehicle.seating >= 7) currentScore = 10;
        else if (vehicle.bodyType === "SUV") currentScore = 8;
        else if (vehicle.bodyType === "Sedan") currentScore = 5;
      } else if (purp === "business" || purp === "luxury") {
        if (vehicle.tags.includes("Prestige") || vehicle.tags.includes("Luxury") || vehicle.tags.includes("Executive")) {
          currentScore = 10;
        } else if (vehicle.price >= 50000000) {
          currentScore = 7;
        }
      } else if (purp === "long-distance") {
        if (vehicle.tags.includes("Long-distance travel") || vehicle.driveType.includes("4WD") || vehicle.driveType.includes("AWD")) {
          currentScore = 10;
        } else {
          currentScore = 6;
        }
      } else if (purp === "daily-driving" || purp === "first-car") {
        if (vehicle.tags.includes("Low maintenance") || vehicle.tags.includes("Daily driving") || vehicle.tags.includes("Fuel efficiency")) {
          currentScore = 10;
        } else {
          currentScore = 6;
        }
      } else if (purp === "performance") {
        if (vehicle.tags.includes("Performance")) {
          currentScore = 10;
        } else {
          currentScore = 5;
        }
      }

      if (currentScore >= 8) matchingPurposesCount++;
      totalPurposePoints += currentScore;
    }

    let calculatedPurposeFit = Math.round(totalPurposePoints / purposes.length);
    // Multi-purpose synergy bonus: vehicle satisfies multiple selected purposes at once
    if (purposes.length > 1 && matchingPurposesCount > 1) {
      calculatedPurposeFit += Math.min(3, matchingPurposesCount);
    }
    breakdown.purposeFit = Math.min(15, Math.max(6, calculatedPurposeFit + 4));

    // 5. Powertrain (Transmission & Fuel) (Max 10 pts)
    let powertrainScore = 6;
    if (profile.transmissionPreference === "any" || vehicle.transmission.toLowerCase() === profile.transmissionPreference.toLowerCase()) {
      powertrainScore += 2;
    }
    if (profile.fuelPreference === "any" || vehicle.fuel.toLowerCase() === profile.fuelPreference.toLowerCase()) {
      powertrainScore += 2;
    }
    breakdown.powertrainFit = Math.min(10, powertrainScore);

    // 6. Location Logistics Factor (Max 5 pts)
    if (vehicle.location.toLowerCase() === profile.location.toLowerCase()) {
      breakdown.locationBonus = 5; // Ready in customer's local city showroom
    } else {
      breakdown.locationBonus = 3; // Available via inter-branch Sterling transfer
    }

    // Calculate genuine composite score
    const compositeScore = Math.min(99, Math.max(35, 
      breakdown.budgetFit +
      breakdown.bodyTypeFit +
      breakdown.brandFit +
      breakdown.purposeFit +
      breakdown.powertrainFit +
      breakdown.locationBonus
    ));

    return {
      compositeScore,
      breakdown,
      isStrictBudgetMatch
    };
  }

  /**
   * Generates a natural, human editorial "Why it fits" explanation.
   * Completely avoids robotic AI copy and fake numbers.
   */
  synthesizeWhyItFits(vehicle, profile, evaluation) {
    const reasons = [];

    // Budget commentary
    if (evaluation.isStrictBudgetMatch) {
      reasons.push(`comfortably aligns with your budget of ${profile.budgetRange.label}`);
    } else if (vehicle.price > profile.budgetRange.max) {
      reasons.push(`presents exceptional long-term value just above your initial budget target`);
    } else {
      reasons.push(`leaves comfortable headroom within your target expenditure`);
    }

    // Purpose & capability commentary (Multi-purpose editorial narrative)
    const purposes = (profile.intendedPurposes && profile.intendedPurposes.length > 0)
      ? profile.intendedPurposes
      : [profile.intendedPurpose];

    const purposeSnippets = [];
    for (const purp of purposes) {
      if (purp === "family") {
        if (vehicle.seating >= 7) {
          purposeSnippets.push(`delivering the expansive 7-passenger capacity and safety features your family needs`);
        } else {
          purposeSnippets.push(`providing generous passenger legroom and family-friendly cargo versatility`);
        }
      } else if (purp === "business") {
        purposeSnippets.push(`projecting an authoritative executive presence for corporate engagements`);
      } else if (purp === "daily-driving") {
        purposeSnippets.push(`offering effortless daily drivability and low maintenance reliability`);
      } else if (purp === "long-distance") {
        purposeSnippets.push(`equipped with robust terrain clearance and highway cruising composure for inter-state journeys`);
      } else if (purp === "luxury") {
        purposeSnippets.push(`delivering peerless cabin craftsmanship and bespoke road presence`);
      } else if (purp === "performance") {
        purposeSnippets.push(`delivering razor-sharp throttle responsiveness and sports-tuned suspension`);
      } else if (purp === "first-car") {
        purposeSnippets.push(`renowned for bulletproof mechanical dependability and readily available parts`);
      }
    }

    if (purposeSnippets.length === 1) {
      reasons.push(purposeSnippets[0]);
    } else if (purposeSnippets.length === 2) {
      reasons.push(`${purposeSnippets[0]}, while simultaneously ${purposeSnippets[1]}`);
    } else if (purposeSnippets.length > 2) {
      const primaryTwo = purposeSnippets.slice(0, 2).join(", while ");
      reasons.push(`${primaryTwo}, paired with multi-purpose lifestyle versatility`);
    }

    // Location note
    const locationNote = vehicle.location.toLowerCase() === profile.location.toLowerCase()
      ? `currently available for direct viewing at our ${vehicle.showroom}`
      : `available in our inventory with expedited private delivery to ${profile.location}`;

    // Combine into cohesive, natural editorial copy
    return `This ${vehicle.year} ${vehicle.model} stands out because it ${reasons.join(", ")}, and is ${locationNote}.`;
  }

  // ===============================================================
  // STAGE 3 (AGENT 3): PERSONALIZED FOLLOW-UP & CONCIERGE SYNTHESIS
  // ===============================================================
  stage3_GenerateFollowUp(profile, matchResults, selectedVehicle = null) {
    const topVehicle = selectedVehicle || (matchResults.recommendations.length > 0 ? matchResults.recommendations[0].vehicle : this.inventory[0]);

    // Handle names with professional or honorific titles (e.g. Dr. David Ebere -> David)
    let customerFirstName = "Valued Client";
    if (profile.customerName && profile.customerName.trim()) {
      const parts = profile.customerName.trim().split(/\s+/);
      const titles = ["dr", "dr.", "engr", "engr.", "chief", "barr", "barr.", "senator", "prof", "prof.", "alhaji", "mr", "mr.", "mrs", "mrs.", "ms", "ms."];
      if (parts.length > 1 && titles.includes(parts[0].toLowerCase())) {
        customerFirstName = parts[1];
      } else {
        customerFirstName = parts[0];
      }
    }
    const city = profile.location || "Enugu";

    // Showroom specialist mapping based on location
    const showroomConsultants = {
      "Enugu": {
        name: "Emeka Nwosu",
        role: "Senior Client Advisor",
        showroom: "Independence Layout Showroom, Enugu",
        phone: "+234 803 124 5500",
        email: "e.nwosu@sterlingautos.ng"
      },
      "Lagos": {
        name: "Babatunde Alabi",
        role: "Head of Private Client Sales",
        showroom: "Victoria Island Showroom, Lagos",
        phone: "+234 802 987 1122",
        email: "b.alabi@sterlingautos.ng"
      },
      "Abuja": {
        name: "Amina Bello",
        role: "Executive Portfolio Specialist",
        showroom: "Central Business District Showroom, Abuja",
        phone: "+234 809 455 3300",
        email: "a.bello@sterlingautos.ng"
      },
      "Port Harcourt": {
        name: "Tamuno Briggs",
        role: "Client Relationship Manager",
        showroom: "GRA Phase 2 Showroom, Port Harcourt",
        phone: "+234 814 670 9944",
        email: "t.briggs@sterlingautos.ng"
      },
      "Onitsha": {
        name: "Chukwudi Okafor",
        role: "Commercial & Private Sales Lead",
        showroom: "Commercial District Showroom, Onitsha",
        phone: "+234 806 331 8822",
        email: "c.okafor@sterlingautos.ng"
      },
      "Owerri": {
        name: "Ifeanyi Nwachukwu",
        role: "Senior Sales Consultant",
        showroom: "Bank Road Showroom, Owerri",
        phone: "+234 805 772 4411",
        email: "i.nwachukwu@sterlingautos.ng"
      }
    };

    const consultant = showroomConsultants[city] || showroomConsultants["Enugu"];

    // 1. Personalized Dealer Note (Human, understated, professional)
    const topPicks = matchResults.recommendations.slice(0, 2).map(r => `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model}`).join(" and ");

    const purposeSummary = (profile.intendedPurposes && profile.intendedPurposes.length > 1)
      ? profile.intendedPurposes.map(p => p.replace(/-/g, " ")).join(" and ")
      : profile.intendedPurpose.replace(/-/g, " ");

    const personalNote = `Hello ${customerFirstName}, based on what you shared with us regarding your search in ${city}, I believe the ${topPicks} are worth a closer look. Both vehicles provide the ${profile.vehicleTypePreference !== "any" ? profile.vehicleTypePreference : "driving experience"} you requested, align closely with your ${profile.budgetRange.label} target, and are well suited to ${purposeSummary}. Whenever you are ready, I would be pleased to welcome you for a private walkthrough.`;

    // 2. Pre-composed Viewing Request Message (Natural customer voice)
    const customerInquiryDraft = `Hello ${consultant.name}, I recently completed your Find My Car consultation for a vehicle suited for ${purposeSummary} in ${city}. I am interested in the ${topVehicle.year} ${topVehicle.make} ${topVehicle.model} (${topVehicle.priceFormatted}). Please let me know available slots to schedule a private viewing.`;

    // 3. Actionable Concierge Triggers
    return {
      consultant,
      topVehicle,
      personalNote,
      customerInquiryDraft,
      recommendedActions: [
        {
          id: "book-viewing",
          label: "Request a Viewing",
          description: `Schedule a private appointment with ${consultant.name} at our ${consultant.showroom}.`
        },
        {
          id: "talk-specialist",
          label: "Talk to a Sales Specialist",
          description: `Direct consultation with ${consultant.name} (${consultant.phone}) via WhatsApp or Phone.`
        },
        {
          id: "get-info",
          label: "Get More Information",
          description: `Receive full Carfax/inspection documentation and comprehensive spec sheet.`
        }
      ]
    };
  }

  // ===============================================================
  // HELPER FORMATTING
  // ===============================================================
  formatNairaRange(min, max) {
    if (min === 0 && max <= 10000000) return "Under ₦10m";
    if (min >= 10000000 && max <= 20000000) return "₦10m–₦20m";
    if (min >= 20000000 && max <= 40000000) return "₦20m–₦40m";
    if (min >= 40000000 && max <= 70000000) return "₦40m–₦70m";
    if (min >= 70000000) return "₦70m+";
    return `₦${(min / 1000000).toFixed(0)}m–₦${(max / 1000000).toFixed(0)}m`;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SalesAutomationPipeline };
}
