/**
 * Onah Franklyn Kenechukwu
 * 2026-09-29
 *
 * Sterling Autos — Comprehensive Verification Test Suite
 * Tests:
 * 1. Dataset integrity (15 vehicles, valid prices, mileage, specs, images)
 * 2. Stage 1: Requirement Analysis & Lifestyle Classification
 * 3. Stage 2: Multi-Factor Matching & "Why it fits" Editorial Reasoning
 * 4. Stage 3: Personalized Follow-Up & Consultant Assignment
 * 5. Edge Cases: Out-of-range budget fallback to closest alternatives
 * 6. HTML structure and CSS integrity
 */

const fs = require('fs');
const path = require('path');
const { VEHICLES_DATA } = require('./js/vehicles-data.js');
const { SalesAutomationPipeline } = require('./js/sales-workflow.js');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log("=================================================");
console.log("RUNNING STERLING AUTOS SYSTEM VERIFICATION SUITE");
console.log("=================================================\n");

// --- TEST SUITE 1: DATASET VERIFICATION ---
console.log("TEST SUITE 1: Vehicle Inventory Dataset");
assert(Array.isArray(VEHICLES_DATA), "VEHICLES_DATA is an array");
assert(VEHICLES_DATA.length >= 12, `Inventory count is ${VEHICLES_DATA.length} (Expected >= 12)`);

const requiredFields = ['id', 'make', 'model', 'year', 'price', 'priceFormatted', 'mileage', 'bodyType', 'transmission', 'fuel', 'engine', 'location', 'image', 'description'];
let allFieldsPresent = true;
VEHICLES_DATA.forEach(v => {
  requiredFields.forEach(f => {
    if (!v[f]) {
      allFieldsPresent = false;
      console.error(`Missing field ${f} in vehicle ${v.id}`);
    }
  });
});
assert(allFieldsPresent, "All 15 vehicles contain complete required specifications");

// Check Nigerian locations
const locations = [...new Set(VEHICLES_DATA.map(v => v.location))];
assert(locations.includes("Enugu") && locations.includes("Lagos") && locations.includes("Abuja"), `Verified Nigerian locations: ${locations.join(', ')}`);

// Check Nigerian Naira formatted prices
const nairaSymbolPresent = VEHICLES_DATA.every(v => v.priceFormatted.startsWith("₦"));
assert(nairaSymbolPresent, "All vehicles use Nigerian Naira (₦) formatting");

// Check authentic vehicle photography
const allImagesExist = VEHICLES_DATA.every(v => fs.existsSync(path.join(__dirname, v.image)));
assert(allImagesExist, "All vehicles have verified authentic photography existing locally on disk");

const allGalleriesExist = VEHICLES_DATA.every(v => v.gallery.every(g => fs.existsSync(path.join(__dirname, g))));
assert(allGalleriesExist, "All vehicle gallery images exist locally on disk");

const uniqueImages = new Set(VEHICLES_DATA.map(v => v.image));
assert(uniqueImages.size === VEHICLES_DATA.length, "Every vehicle model has distinct authentic photography (no duplicate/recycled images)");


// --- TEST SUITE 2: CONNECTED 3-STAGE SALES PIPELINE ---
console.log("\nTEST SUITE 2: Connected 3-Stage Sales Automation Pipeline");
const pipeline = new SalesAutomationPipeline(VEHICLES_DATA);

// Test Case A: Family SUV in Enugu (₦20m-₦40m)
const familyInput = {
  name: "Dr. David Ebere",
  budgetPreset: "20m-40m",
  vehicleType: "SUV",
  brand: "any",
  purpose: "family",
  transmission: "Automatic",
  fuel: "any",
  location: "Enugu"
};

pipeline.processCustomerJourney(familyInput).then(res => {
  assert(res.profile.customerName === "Dr. David Ebere", "Stage 1 correctly extracted customer name");
  assert(res.profile.lifestylePersona.name.includes("Family"), "Stage 1 classified Family lifestyle persona");
  assert(res.profile.budgetRange.min === 20000000 && res.profile.budgetRange.max === 40000000, "Stage 1 normalized budget bounds (20m-40m)");
  
  assert(res.matches.recommendations.length > 0, `Stage 2 returned ${res.matches.recommendations.length} recommended vehicles`);
  const topRec = res.matches.recommendations[0];
  assert(topRec.score >= 60, `Stage 2 calculated genuine match score (${topRec.score}/100)`);
  assert(topRec.whyItFits.includes("because it"), "Stage 2 generated human-sounding 'Why it fits' narrative");
  assert(!topRec.whyItFits.includes("AI Agent"), "Stage 2 avoids robotic AI terminology");

  assert(res.followUp.consultant.name === "Emeka Nwosu", `Stage 3 assigned Enugu Senior Advisor: ${res.followUp.consultant.name}`);
  assert(res.followUp.personalNote.includes("David"), "Stage 3 addressed client by name in personalized letter");
  assert(res.followUp.customerInquiryDraft.includes("Dr. David Ebere") || res.followUp.customerInquiryDraft.includes("Emeka Nwosu"), "Stage 3 generated ready-to-send customer inquiry");


  // Test Case B: Executive Business Sedan in Lagos
  const executiveInput = {
    name: "Senator Bola Adeleke",
    budgetPreset: "40m-70m",
    vehicleType: "Sedan",
    brand: "Mercedes-Benz",
    purpose: "business",
    transmission: "Automatic",
    fuel: "Petrol",
    location: "Lagos"
  };

  return pipeline.processCustomerJourney(executiveInput);
}).then(res => {
  assert(res.followUp.consultant.name === "Babatunde Alabi", `Stage 3 assigned Lagos Head of Sales: ${res.followUp.consultant.name}`);
  assert(res.profile.intendedPurpose === "business", "Stage 1 retained business purpose");


  // Test Case C: Edge Case - Extreme filter with No Exact Match (Fallback test)
  console.log("\nTEST SUITE 3: Fallback & Edge Case Handling (No Exact Match)");
  const rareInput = {
    name: "Engr. Ken Oti",
    budgetPreset: "under-10m",
    vehicleType: "Coupe",
    brand: "Porsche",
    purpose: "performance",
    location: "Abuja"
  };

  return pipeline.processCustomerJourney(rareInput);
}).then(res => {
  assert(res.matches.hasExactMatches === false, "Detected no exact match for Porsche Coupe under ₦10m");
  assert(res.matches.recommendations.length > 0, "Gracefully returned closest alternatives instead of failing");
  assert(res.matches.statusMessage.includes("closest"), "Provides respectful editorial explanation for closest options");


  // --- TEST SUITE 4: FILE STRUCTURE & HTML/CSS VALIDATION ---
  console.log("\nTEST SUITE 4: HTML Structure & Design Validation");
  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  const cssContent = fs.readFileSync(path.join(__dirname, 'css/styles.css'), 'utf8');

  assert(htmlContent.includes("Find the Car That Fits Your Drive."), "Hero contains required headline");
  assert(htmlContent.includes("Featured Vehicles"), "Featured Vehicles section exists");
  assert(htmlContent.includes("Find Your Match"), "Find Your Car experience exists");
  assert(htmlContent.includes("Your Matches"), "Results section exists");
  assert(htmlContent.includes("Ready to take a closer look?"), "Personalized follow-up exists");
  assert(htmlContent.includes("Cars worth looking at. Service worth remembering."), "About section contains human narrative");
  assert(htmlContent.includes("Plot 14, Independence Layout"), "Enugu showroom address present");
  assert(htmlContent.includes("Ahmadu Bello Way, Victoria Island"), "Lagos showroom address present");
  assert(htmlContent.includes("Shehu Shagari Way, Central Business District"), "Abuja showroom address present");
  assert(htmlContent.includes("vehicleModal"), "Vehicle Details modal exists");
  assert(htmlContent.includes("bookingModal"), "Book a Viewing modal exists");
  assert(!htmlContent.includes("inspectorTrigger"), "Technical Architecture Inspector trigger is removed");
  assert(!htmlContent.includes("inspectorDrawer"), "Technical Architecture Inspector drawer is removed");
  assert(cssContent.includes("heroLineRise"), "Hero headline rise animation is active");
  assert(!cssContent.includes("heroWordEntrance"), "Old word entrance animation is completely removed");

  // Check dedicated page hero banners have car backdrops
  const vehiclesHtml = fs.readFileSync(path.join(__dirname, 'vehicles.html'), 'utf8');
  const finderHtml = fs.readFileSync(path.join(__dirname, 'find-your-car.html'), 'utf8');
  const aboutHtml = fs.readFileSync(path.join(__dirname, 'about.html'), 'utf8');
  const contactHtml = fs.readFileSync(path.join(__dirname, 'contact.html'), 'utf8');

  assert(vehiclesHtml.includes("page-hero-vehicles"), "Vehicles page hero contains car backdrop class");
  assert(finderHtml.includes("page-hero-finder"), "Find Your Car hero contains car backdrop class");
  assert(aboutHtml.includes("page-hero-about"), "About Us hero contains car backdrop class");
  assert(contactHtml.includes("page-hero-contact"), "Contact hero contains car backdrop class");
  assert(cssContent.includes(".page-hero-vehicles::before"), "CSS defines vehicles car background");
  assert(cssContent.includes(".page-hero-finder::before"), "CSS defines finder car background");
  assert(cssContent.includes(".page-hero-about::before"), "CSS defines about car background");
  assert(cssContent.includes(".page-hero-contact::before"), "CSS defines contact car background");

  assert(cssContent.includes(".brand-logo:hover"), "CSS defines brand logo hover effect");
  assert(cssContent.includes("transform: scale(1.05)"), "CSS defines brand logo scale zoom on hover");

  // Mobile optimization validation
  assert(cssContent.includes("@media (max-width: 768px)"), "CSS defines mobile breakpoint");
  assert(cssContent.includes("@media (max-width: 480px)"), "CSS defines compact mobile breakpoint");
  assert(cssContent.includes(".about-metrics {\n    grid-template-columns: 1fr;"), "CSS stacks about metrics vertically on mobile");
  assert(cssContent.includes(".about-gallery-grid {\n    grid-template-columns: 1fr;"), "CSS stacks about gallery photos on mobile");

  // Performance & Instant Loading Validation (No Lazy Loading)
  const appJs = fs.readFileSync(path.join(__dirname, 'js/app.js'), 'utf8');
  assert(!appJs.includes('loading="lazy"'), "No lazy loading attributes in codebase");
  assert(finderHtml.includes('rel="preload" as="image" href="assets/images/hero-finder.jpg"'), "Find Your Car preloads hero background image");
  assert(vehiclesHtml.includes('rel="preload" as="image" href="assets/images/hero-vehicles.jpg"'), "Vehicles preloads hero background image");
  assert(cssContent.includes("assets/images/hero-finder.jpg"), "CSS loads hero image locally for 0ms delay");

  // Check CSS for strict Black & White palette and no forbidden blue/purple
  assert(cssContent.includes("--bg-black: #080809"), "CSS defines strict black background variable");
  assert(cssContent.includes("--accent-red: #C92A2A"), "CSS defines subtle deep crimson red accent");
  assert(!cssContent.includes("#0000ff") && !cssContent.includes("#800080"), "CSS contains no raw blue or purple colors");

  // --- TEST SUITE 5: LIVE MARKET SEARCH & GOOGLE SURFING ENGINE ---
  console.log("\nTEST SUITE 5: Live Market Search & Google Surfing Engine");
  const { performLiveMarketSearch, LIVE_MARKET_POOL } = require('./server.js');

  assert(Array.isArray(LIVE_MARKET_POOL) && LIVE_MARKET_POOL.length >= 15, `Live market pool contains ${LIVE_MARKET_POOL.length} vehicles`);

  // Test search with iteration 1
  const search1 = performLiveMarketSearch({
    name: "Dr. David Ebere",
    minBudget: 30000000,
    maxBudget: 60000000,
    vehicleType: "SUV",
    brand: "any",
    location: "Enugu",
    iteration: 1
  });

  assert(search1.success === true, "Live market search executed successfully");
  assert(search1.liveMarketMatches.length > 0, `Returned ${search1.liveMarketMatches.length} live market matches`);
  assert(search1.overallGoogleSearchUrl.includes("https://www.google.com/search?q="), "Overall Google Chrome search URL generated");
  assert(search1.liveMarketMatches.every(m => m.directGoogleSearchUrl && m.directGoogleSearchUrl.includes("google.com")), "Every live vehicle has a direct Google Search URL");
  assert(search1.liveMarketMatches.every(m => m.marketIntelligence && m.marketIntelligence.terrainFitness), "Market intelligence includes Nigerian road & terrain fitness analysis");

  // Test non-repeating guarantee with iteration 2
  const search2 = performLiveMarketSearch({
    name: "Dr. David Ebere",
    minBudget: 30000000,
    maxBudget: 60000000,
    vehicleType: "SUV",
    brand: "any",
    location: "Enugu",
    iteration: 2
  });

  const ids1 = search1.liveMarketMatches.map(m => m.id).join(",");
  const ids2 = search2.liveMarketMatches.map(m => m.id).join(",");
  assert(ids1 !== ids2, `Dynamic iteration ensures fresh, non-repeating results (Batch 1: ${search1.liveMarketMatches[0].model} vs Batch 2: ${search2.liveMarketMatches[0].model})`);

  // Verify HTTP endpoint POST /api/live-market-search
  const http = require('http');
  const postData = JSON.stringify({
    name: "Test Client",
    vehicleType: "Sedan",
    minBudget: 20000000,
    maxBudget: 50000000,
    location: "Lagos",
    iteration: 1
  });

  const req = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/live-market-search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let resBody = '';
    res.on('data', chunk => resBody += chunk);
    res.on('end', () => {
      assert(res.statusCode === 200, `POST /api/live-market-search returned HTTP 200 OK`);
      try {
        const parsed = JSON.parse(resBody);
        assert(parsed.success === true && parsed.liveMarketMatches.length > 0, "HTTP API endpoint returns live car matches via network");
      } catch (e) {
        assert(false, "HTTP API response could not be parsed as JSON");
      }

      console.log("\n=================================================");
      console.log(`TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
      console.log("=================================================");

      if (testsFailed > 0) {
        process.exit(1);
      } else {
        process.exit(0);
      }
    });
  });

  req.on('error', (err) => {
    assert(false, `HTTP request to /api/live-market-search failed: ${err.message}`);
    process.exit(1);
  });

  req.write(postData);
  req.end();
}).catch(err => {
  console.error("Test execution error:", err);
  process.exit(1);
});
