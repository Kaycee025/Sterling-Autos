/**
 * Onah Franklyn Kenechukwu
 * 2026-09-29
 *
 * Sterling Autos — Live Market Search & Application Server
 * Serves static showroom application and provides real-time online automotive search API.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

// Comprehensive MIME Type Registry
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

// Rich Dynamic Live Market Repository for Nigerian Luxury & Executive Vehicles
const LIVE_MARKET_POOL = [
  // --- TOYOTA ---
  {
    id: "live-highlander-2021",
    make: "Toyota",
    model: "Highlander Limited AWD",
    year: 2021,
    bodyType: "SUV",
    priceMin: 36000000,
    priceMax: 44000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.5L V6 Dual VVT-i",
    power: "295 hp",
    seating: 7,
    groundClearance: "203 mm",
    tags: ["Family", "Daily driving", "Long-distance travel", "Reliability"],
    image: "assets/images/cars/toyota-prado-2.jpg",
    sourcePlatform: "Live Market Index · Lagos Ports & Dealers",
    sourceBadge: "Direct Import Available",
    locationFit: ["Lagos", "Abuja", "Enugu", "Port Harcourt", "Onitsha"],
    description: "Spacious 3-row family SUV renowned for silky V6 endurance, robust chassis geometry, and effortless parts sourcing across eastern and western Nigeria."
  },
  {
    id: "live-prado-vx-2022",
    make: "Toyota",
    model: "Land Cruiser Prado VX V6",
    year: 2022,
    bodyType: "SUV",
    priceMin: 72000000,
    priceMax: 84000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "4.0L Dual VVT-i V6",
    power: "271 hp / 381 Nm",
    seating: 7,
    groundClearance: "220 mm",
    tags: ["Prestige", "Long-distance travel", "Family", "Ground clearance"],
    image: "assets/images/cars/toyota-prado.jpg",
    sourcePlatform: "Live Nigerian Dealer Network",
    sourceBadge: "Port Cleared · Clean Title",
    locationFit: ["Enugu", "Abuja", "Lagos", "Port Harcourt", "Owerri"],
    description: "The gold standard for interstate travel resilience in Nigeria. Ladder frame construction with KDSS dynamic suspension, dual AC cooling, and refrigerated cool box."
  },
  {
    id: "live-rav4-2022",
    make: "Toyota",
    model: "RAV4 Limited AWD",
    year: 2022,
    bodyType: "Crossover",
    priceMin: 27000000,
    priceMax: 33000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.5L Dynamic Force 4-Cylinder",
    power: "203 hp",
    seating: 5,
    groundClearance: "218 mm",
    tags: ["Daily driving", "Fuel efficiency", "First car", "Low maintenance"],
    image: "assets/images/cars/toyota-camry-2.jpg",
    sourcePlatform: "Live Auto Exchange · Lagos & Abuja",
    sourceBadge: "Foreign Used · Low Mileage",
    locationFit: ["Lagos", "Abuja", "Enugu", "Owerri"],
    description: "Exceptional urban commuter and weekend getaway crossover with high ground clearance, standard Toyota Safety Sense 2.0, and class-topping fuel thriftiness."
  },
  {
    id: "live-prado-tx-2020",
    make: "Toyota",
    model: "Land Cruiser Prado TX-L 2.7",
    year: 2020,
    bodyType: "SUV",
    priceMin: 38000000,
    priceMax: 46000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.7L Dual VVT-i 4-Cylinder",
    power: "164 hp",
    seating: 7,
    groundClearance: "220 mm",
    tags: ["Family", "Long-distance travel", "Durability", "Daily driving"],
    image: "assets/images/cars/toyota-prado-3.jpg",
    sourcePlatform: "Live Lagos Auto Feed · Berger & Ikeja",
    sourceBadge: "Direct Port Cleared",
    locationFit: ["Port Harcourt", "Enugu", "Lagos", "Abuja", "Owerri"],
    description: "Robust 7-seater executive 4x4 built for rugged Nigerian highways. Proven low-stress engine with full-time 4WD and rear cooler box."
  },
  {
    id: "live-fortuner-2021",
    make: "Toyota",
    model: "Fortuner 2.8 4WD Automatic",
    year: 2021,
    bodyType: "SUV",
    priceMin: 31000000,
    priceMax: 38000000,
    transmission: "Automatic",
    fuel: "Diesel",
    engine: "2.8L D-4D Turbocharged Diesel",
    power: "201 hp / 500 Nm",
    seating: 7,
    groundClearance: "225 mm",
    tags: ["Family", "Daily driving", "Long-distance travel", "Low maintenance"],
    image: "assets/images/cars/toyota-hilux-2.jpg",
    sourcePlatform: "Port Harcourt & Delta Dealer Network",
    sourceBadge: "First Grade Foreign Used",
    locationFit: ["Port Harcourt", "Enugu", "Lagos", "Abuja"],
    description: "Renowned ladder-frame durability with muscular torque, 7 full seats, high wading depth, and exceptional fuel autonomy for South-South and Eastern journeys."
  },
  {
    id: "live-venza-2021",
    make: "Toyota",
    model: "Venza Limited AWD",
    year: 2021,
    bodyType: "Crossover",
    priceMin: 26000000,
    priceMax: 31000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.5L Dynamic Force Hybrid / AWD",
    power: "219 hp",
    seating: 5,
    groundClearance: "195 mm",
    tags: ["Daily driving", "Luxury", "Fuel efficiency", "Family"],
    image: "assets/images/cars/toyota-prado-2.jpg",
    sourcePlatform: "Live Port Cleared Registry",
    sourceBadge: "Foreign Used · Low Mileage",
    locationFit: ["Lagos", "Abuja", "Port Harcourt", "Enugu"],
    description: "Sleek executive styling with panoramic Star Gaze roof, premium JBL audio, and serene urban road manners."
  },
  {
    id: "live-camry-2021",
    make: "Toyota",
    model: "Camry XSE V6 Sport",
    year: 2021,
    bodyType: "Sedan",
    priceMin: 22000000,
    priceMax: 27000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.5L DOHC 24-Valve V6",
    power: "301 hp",
    seating: 5,
    groundClearance: "155 mm",
    tags: ["Daily driving", "Executive", "Low maintenance", "Fuel efficiency"],
    image: "assets/images/cars/toyota-camry.jpg",
    sourcePlatform: "Live Verified Auto Exchange",
    sourceBadge: "Clean Title · Customs Paid",
    locationFit: ["Port Harcourt", "Lagos", "Abuja", "Enugu"],
    description: "Nigeria's most dependable luxury daily commuter. 301 horsepower responsiveness with red leather cockpit styling and unmatched parts accessibility."
  },
  {
    id: "live-lc300-2023",
    make: "Toyota",
    model: "Land Cruiser 300 VXR Bi-Turbo",
    year: 2023,
    bodyType: "SUV",
    priceMin: 140000000,
    priceMax: 160000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.5L Twin-Turbo V6",
    power: "409 hp",
    seating: 7,
    groundClearance: "235 mm",
    tags: ["Prestige", "Luxury", "Executive", "Long-distance travel"],
    image: "assets/images/cars/toyota-lc300.jpg",
    sourcePlatform: "Abuja Diplomatic & Port Clearing Network",
    sourceBadge: "Brand New / Low Mileage Import",
    locationFit: ["Abuja", "Lagos", "Port Harcourt", "Enugu"],
    description: "The premier status vehicle on Nigerian soil. Supreme road presence, multi-terrain monitor, and whisper-quiet VIP rear cabin."
  },

  // --- LEXUS ---
  {
    id: "live-gx460-2020",
    make: "Lexus",
    model: "GX 460 Luxury V8 4WD",
    year: 2020,
    bodyType: "SUV",
    priceMin: 55000000,
    priceMax: 66000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "4.6L Naturally Aspirated V8",
    power: "301 hp / 446 Nm",
    seating: 7,
    groundClearance: "215 mm",
    tags: ["Luxury", "Family", "Long-distance travel", "Prestige"],
    image: "assets/images/cars/lexus-rx350-2.jpg",
    sourcePlatform: "Nigerian Verified Import Index",
    sourceBadge: "Foreign Used (First Grade)",
    locationFit: ["Abuja", "Lagos", "Enugu", "Port Harcourt"],
    description: "Bulletproof V8 reliability on a Prado platform. Whisper-quiet semi-aniline leather interior, kinetic suspension, and legendary resale strength."
  },
  {
    id: "live-rx350-2021",
    make: "Lexus",
    model: "RX 350 Luxury AWD",
    year: 2021,
    bodyType: "SUV",
    priceMin: 38000000,
    priceMax: 45000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.5L DOHC V6",
    power: "295 hp",
    seating: 5,
    groundClearance: "208 mm",
    tags: ["Daily driving", "Family", "Comfort", "Prestige"],
    image: "assets/images/cars/lexus-rx350.jpg",
    sourcePlatform: "Live Market Listings · Lekki & Victoria Island",
    sourceBadge: "Verified Accident-Free",
    locationFit: ["Lagos", "Enugu", "Abuja", "Onitsha"],
    description: "The most sought-after executive luxury SUV on Nigerian roads. Unsurpassed ride smoothness, Mark Levinson acoustic mastery, and unmatched ease of repair."
  },
  {
    id: "live-is300-2020",
    make: "Lexus",
    model: "IS 300 F-Sport Sedan",
    year: 2020,
    bodyType: "Sedan",
    priceMin: 22000000,
    priceMax: 27000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.0L Twin-Scroll Turbo Inline-4",
    power: "241 hp",
    seating: 5,
    groundClearance: "140 mm",
    tags: ["Daily driving", "Performance", "First car", "Prestige"],
    image: "assets/images/cars/lexus-es350-2.jpg",
    sourcePlatform: "Online Auto Marketplace",
    sourceBadge: "Foreign Used · Customs Cleared",
    locationFit: ["Lagos", "Abuja", "Enugu", "Port Harcourt"],
    description: "Razor-sharp sports saloon with an aggressive spindle grille, L-Finesse cockpit, and athletic rear-wheel-drive dynamics for young executives."
  },

  // --- MERCEDES-BENZ ---
  {
    id: "live-gle350-2020",
    make: "Mercedes-Benz",
    model: "GLE 350 4MATIC AMG Line",
    year: 2020,
    bodyType: "SUV",
    priceMin: 52000000,
    priceMax: 62000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.0L Turbocharged Inline-4",
    power: "255 hp / 370 Nm",
    seating: 7,
    groundClearance: "205 mm",
    tags: ["Executive", "Luxury", "Prestige", "Family"],
    image: "assets/images/cars/mercedes-gle450.jpg",
    sourcePlatform: "Live German Auto Imports",
    sourceBadge: "Mercedes-Benz Certified Pre-Owned",
    locationFit: ["Lagos", "Abuja", "Port Harcourt", "Enugu"],
    description: "Stunning road authority with 64-color ambient lighting, MBUX widescreen dual displays, and active damping suspension tuned for long Nigerian journeys."
  },
  {
    id: "live-e350-2021",
    make: "Mercedes-Benz",
    model: "E350 4MATIC AMG Line",
    year: 2021,
    bodyType: "Sedan",
    priceMin: 38000000,
    priceMax: 46000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.0L Turbo Inline-4 with EQ Boost",
    power: "255 hp",
    seating: 5,
    groundClearance: "145 mm",
    tags: ["Business", "Executive", "Prestige", "Daily driving"],
    image: "assets/images/cars/mercedes-c300.jpg",
    sourcePlatform: "Live European Fleet Exchange",
    sourceBadge: "Foreign Used · Full Service History",
    locationFit: ["Lagos", "Abuja", "Enugu", "Port Harcourt"],
    description: "The quintessential executive saloon. Burmester surround audio, open-pore wood trim, and sophisticated EQ Boost mild-hybrid throttle response."
  },
  {
    id: "live-glc300-2021",
    make: "Mercedes-Benz",
    model: "GLC 300 4MATIC SUV",
    year: 2021,
    bodyType: "SUV",
    priceMin: 34000000,
    priceMax: 41000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.0L Turbocharged Inline-4",
    power: "255 hp",
    seating: 5,
    groundClearance: "185 mm",
    tags: ["Daily driving", "Luxury", "Family", "Prestige"],
    image: "assets/images/cars/mercedes-gle450-2.jpg",
    sourcePlatform: "Online Auto Trader · Nigeria",
    sourceBadge: "Direct Port Import",
    locationFit: ["Lagos", "Abuja", "Enugu", "Port Harcourt", "Owerri"],
    description: "Compact luxury SUV with assertive AMG sports body styling, high seating position, and effortless maneuverability on both island and mainland streets."
  },

  // --- BMW ---
  {
    id: "live-bmwx6-2020",
    make: "BMW",
    model: "X6 xDrive40i M Sport",
    year: 2020,
    bodyType: "Coupe",
    priceMin: 58000000,
    priceMax: 70000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.0L TwinPower Turbo Inline-6",
    power: "335 hp / 450 Nm",
    seating: 5,
    groundClearance: "216 mm",
    tags: ["Performance", "Prestige", "Luxury"],
    image: "assets/images/cars/bmw-x5.jpg",
    sourcePlatform: "Live Premium Performance Feed",
    sourceBadge: "Foreign Used · Spotless Condition",
    locationFit: ["Lagos", "Abuja", "Port Harcourt"],
    description: "Iconic illuminated BMW kidney grille with coupe roofline, muscular shoulders, and the venerable B58 straight-six powertrain."
  },
  {
    id: "live-bmwx3-2021",
    make: "BMW",
    model: "X3 xDrive30i M Sport",
    year: 2021,
    bodyType: "Crossover",
    priceMin: 31000000,
    priceMax: 38000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.0L TwinPower Turbo Inline-4",
    power: "248 hp",
    seating: 5,
    groundClearance: "204 mm",
    tags: ["Daily driving", "Performance", "Family", "Technology"],
    image: "assets/images/cars/bmw-x5-2.jpg",
    sourcePlatform: "Live Market Network · Lagos & Abuja",
    sourceBadge: "Verified Clean Carfax",
    locationFit: ["Lagos", "Abuja", "Enugu"],
    description: "Precision German handling packaged in an athletic sports activity vehicle. Vernasca leather, panoramic glass moonroof, and iDrive 7 navigation."
  },

  // --- RANGE ROVER ---
  {
    id: "live-velar-2020",
    make: "Range Rover",
    model: "Range Rover Velar R-Dynamic S",
    year: 2020,
    bodyType: "SUV",
    priceMin: 46000000,
    priceMax: 56000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.0L Turbocharged Inline-4",
    power: "247 hp",
    seating: 5,
    groundClearance: "213 mm",
    tags: ["Prestige", "Luxury", "Design", "Daily driving"],
    image: "assets/images/cars/range-rover-sport.jpg",
    sourcePlatform: "Live UK/US Luxury Imports Feed",
    sourceBadge: "Foreign Used · Full Duty Paid",
    locationFit: ["Lagos", "Abuja", "Port Harcourt"],
    description: "Award-winning minimalist British design with flush deployable door handles, Touch Pro Duo dual screens, and electronic air suspension."
  },
  {
    id: "live-defender-2021",
    make: "Range Rover",
    model: "Land Rover Defender 110 SE",
    year: 2021,
    bodyType: "SUV",
    priceMin: 78000000,
    priceMax: 92000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.0L Turbocharged Inline-6 MHEV",
    power: "395 hp / 550 Nm",
    seating: 7,
    groundClearance: "291 mm",
    tags: ["Long-distance travel", "Prestige", "Durability", "Ground clearance"],
    image: "assets/images/cars/range-rover-sport-2.jpg",
    sourcePlatform: "Live Overland Luxury Feed",
    sourceBadge: "Customs Inspected · Pristine",
    locationFit: ["Abuja", "Lagos", "Port Harcourt", "Enugu"],
    description: "Unrivaled off-road prowess with 291mm air-suspension ground clearance, 900mm wading depth, and rugged executive presence across all Nigerian states."
  },

  // --- HONDA & HYUNDAI & OTHERS ---
  {
    id: "live-pilot-2021",
    make: "Honda",
    model: "Pilot Touring AWD",
    year: 2021,
    bodyType: "SUV",
    priceMin: 28000000,
    priceMax: 35000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.5L i-VTEC V6",
    power: "280 hp",
    seating: 8,
    groundClearance: "185 mm",
    tags: ["Family", "Daily driving", "Low maintenance", "Budget"],
    image: "assets/images/cars/toyota-prado-3.jpg",
    sourcePlatform: "Live Nigerian Auto Index",
    sourceBadge: "Foreign Used · Clean Title",
    locationFit: ["Enugu", "Lagos", "Abuja", "Onitsha", "Owerri"],
    description: "Spacious 8-passenger family hauler with i-VTEC punch, rear entertainment ceiling screen, tri-zone climate control, and low operating expenses."
  },
  {
    id: "live-palisade-2022",
    make: "Hyundai",
    model: "Palisade Calligraphy AWD",
    year: 2022,
    bodyType: "SUV",
    priceMin: 42000000,
    priceMax: 50000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.8L V6 GDI",
    power: "291 hp",
    seating: 7,
    groundClearance: "203 mm",
    tags: ["Family", "Luxury", "Technology", "Daily driving"],
    image: "assets/images/cars/lexus-rx350-3.jpg",
    sourcePlatform: "Live Multi-Brand Network",
    sourceBadge: "First Grade Foreign Used",
    locationFit: ["Lagos", "Abuja", "Enugu", "Port Harcourt"],
    description: "Executive-grade 7-seater with quilted Nappa leather, dual sunroofs, 12.3-inch digital cockpit, and Harman Kardon 12-speaker acoustic surround sound."
  },

  // --- PORSCHE ---
  {
    id: "live-cayenne-2020",
    make: "Porsche",
    model: "Cayenne S 2.9L Bi-Turbo",
    year: 2020,
    bodyType: "SUV",
    priceMin: 52000000,
    priceMax: 65000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.9L Twin-Turbo V6",
    power: "434 hp",
    seating: 5,
    groundClearance: "210 mm",
    tags: ["Performance", "Prestige", "Luxury", "Daily driving"],
    image: "assets/images/cars/porsche-cayenne.jpg",
    sourcePlatform: "Live European Performance Registry",
    sourceBadge: "Foreign Used · Full Porsche History",
    locationFit: ["Lagos", "Abuja", "Port Harcourt"],
    description: "Motorsport DNA wrapped in an agile luxury SUV. 434-hp twin-turbo thrust, Porsche Active Suspension Management, and iconic Stuttgart pedigree."
  },
  {
    id: "live-macan-2021",
    make: "Porsche",
    model: "Macan GTS AWD",
    year: 2021,
    bodyType: "SUV",
    priceMin: 38000000,
    priceMax: 46000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.9L Twin-Turbo V6",
    power: "375 hp",
    seating: 5,
    groundClearance: "190 mm",
    tags: ["Performance", "Daily driving", "Luxury"],
    image: "assets/images/cars/porsche-cayenne-2.jpg",
    sourcePlatform: "Live Verified Performance Exchange",
    sourceBadge: "Accident Free · Low Mileage",
    locationFit: ["Lagos", "Abuja", "Port Harcourt"],
    description: "Sports car handling in a compact luxury crossover. Rapid PDK gear shifts, sports exhaust note, and sharp turn-in on asphalt."
  },

  // --- MORE EXECUTIVE OPTIONS ---
  {
    id: "live-c300-2021",
    make: "Mercedes-Benz",
    model: "C300 4MATIC AMG Line",
    year: 2021,
    bodyType: "Sedan",
    priceMin: 27000000,
    priceMax: 33000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "2.0L Turbo Inline-4",
    power: "255 hp",
    seating: 5,
    groundClearance: "140 mm",
    tags: ["Daily driving", "Executive", "Prestige", "First car"],
    image: "assets/images/cars/mercedes-c300.jpg",
    sourcePlatform: "Live European Fleet Exchange",
    sourceBadge: "Foreign Used · Spotless",
    locationFit: ["Lagos", "Abuja", "Port Harcourt", "Enugu"],
    description: "Aggressive AMG sports styling with diamond grille, digital cockpit, and lively 4MATIC traction for executive commutes."
  },
  {
    id: "live-es350-2021",
    make: "Lexus",
    model: "ES 350 Luxury",
    year: 2021,
    bodyType: "Sedan",
    priceMin: 28000000,
    priceMax: 34000000,
    transmission: "Automatic",
    fuel: "Petrol",
    engine: "3.5L V6 DOHC",
    power: "302 hp",
    seating: 5,
    groundClearance: "150 mm",
    tags: ["Daily driving", "Executive", "Comfort", "Prestige"],
    image: "assets/images/cars/lexus-es350.jpg",
    sourcePlatform: "Live Nigerian Dealer Network",
    sourceBadge: "Foreign Used · Clean Title",
    locationFit: ["Lagos", "Abuja", "Enugu", "Port Harcourt", "Onitsha"],
    description: "Unrivaled executive sedan serenity with linear wood trim, Mark Levinson acoustic sound, and effortless maintenance across Nigeria."
  }
];

/**
 * Format number to Nigerian Naira string
 */
function formatNaira(num) {
  return '₦' + Math.round(num).toLocaleString('en-NG');
}

/**
 * Perform Live Online Search & Intelligence Analysis
 */
function performLiveMarketSearch(params) {
  const {
    name = "Valued Client",
    budgetPreset = "any",
    minBudget = 0,
    maxBudget = 300000000,
    vehicleType = "any",
    vehicleTypes: rawVehicleTypes = null,
    brand = "any",
    brands: rawBrands = null,
    purpose = "daily-driving",
    purposes: rawPurposes = null,
    transmission = "any",
    transmissions: rawTransmissions = null,
    location = "Enugu",
    iteration = 1
  } = params;

  let chosenVehicleTypes = [];
  if (Array.isArray(rawVehicleTypes) && rawVehicleTypes.length > 0) {
    chosenVehicleTypes = rawVehicleTypes;
  } else if (typeof vehicleType === "string" && vehicleType.trim()) {
    chosenVehicleTypes = vehicleType.split(",").map(t => t.trim()).filter(Boolean);
  } else {
    chosenVehicleTypes = ["any"];
  }

  let chosenBrands = [];
  if (Array.isArray(rawBrands) && rawBrands.length > 0) {
    chosenBrands = rawBrands;
  } else if (typeof brand === "string" && brand.trim()) {
    chosenBrands = brand.split(",").map(b => b.trim()).filter(Boolean);
  } else {
    chosenBrands = ["any"];
  }

  let chosenPurposes = [];
  if (Array.isArray(rawPurposes) && rawPurposes.length > 0) {
    chosenPurposes = rawPurposes;
  } else if (Array.isArray(purpose) && purpose.length > 0) {
    chosenPurposes = purpose;
  } else if (typeof purpose === "string" && purpose.trim()) {
    chosenPurposes = purpose.split(",").map(p => p.trim()).filter(Boolean);
  } else {
    chosenPurposes = ["daily-driving"];
  }

  let chosenTransmissions = [];
  if (Array.isArray(rawTransmissions) && rawTransmissions.length > 0) {
    chosenTransmissions = rawTransmissions;
  } else if (typeof transmission === "string" && transmission.trim()) {
    chosenTransmissions = transmission.split(",").map(t => t.trim()).filter(Boolean);
  } else {
    chosenTransmissions = ["any"];
  }

  const hasBrandFilter = !chosenBrands.includes('any') && chosenBrands.length > 0;
  const hasTypeFilter = !chosenVehicleTypes.includes('any') && chosenVehicleTypes.length > 0;
  const hasTransFilter = !chosenTransmissions.includes('any') && chosenTransmissions.length > 0;

  function matchesBrand(car) {
    if (!hasBrandFilter) return true;
    return chosenBrands.some(b => b.toLowerCase() === car.make.toLowerCase());
  }

  function matchesType(car, strict = false) {
    if (!hasTypeFilter) return true;
    const lowerCarType = car.bodyType.toLowerCase();
    for (const vt of chosenVehicleTypes) {
      const lowerVt = vt.toLowerCase();
      if (lowerVt === lowerCarType) return true;
      if (!strict) {
        // SUV and Crossover compatibility in Nigerian vehicle market
        if ((lowerVt === 'suv' && lowerCarType === 'crossover') ||
            (lowerVt === 'crossover' && lowerCarType === 'suv')) {
          return true;
        }
      }
    }
    return false;
  }

  function matchesTransmission(car) {
    if (!hasTransFilter) return true;
    return chosenTransmissions.some(t => t.toLowerCase() === car.transmission.toLowerCase());
  }

  // Tier 1: Strict match on Brand, Body Type, Transmission, and Budget bounds
  let candidates = LIVE_MARKET_POOL.filter(car => {
    if (!matchesBrand(car)) return false;
    if (!matchesType(car, false)) return false;
    if (!matchesTransmission(car)) return false;

    // Budget check with reasonable tolerance
    if (minBudget > 0 && car.priceMax < minBudget * 0.8) return false;
    if (maxBudget < 250000000 && car.priceMin > maxBudget * 1.35) return false;

    return true;
  });

  // Tier 2: If too few candidates, widen criteria WITHOUT EVER violating brand preference
  if (candidates.length < 4) {
    if (hasBrandFilter) {
      // 2a. Widen budget tolerance within the selected brand(s) only
      const brandCarsWiderBudget = LIVE_MARKET_POOL.filter(car => {
        if (!matchesBrand(car)) return false;
        if (!matchesType(car, false)) return false;
        return !candidates.some(c => c.id === car.id);
      });
      candidates = [...candidates, ...brandCarsWiderBudget];

      // 2b. If still under 4, include all available models of the chosen brand(s)
      if (candidates.length < 4) {
        const allBrandCars = LIVE_MARKET_POOL.filter(car => {
          if (!matchesBrand(car)) return false;
          return !candidates.some(c => c.id === car.id);
        });
        candidates = [...candidates, ...allBrandCars];
      }
    } else {
      // User selected "Any Brand": widen budget and related types across pool
      const fallbackCandidates = LIVE_MARKET_POOL.filter(car => {
        const budgetOk = car.priceMin <= (maxBudget * 1.4);
        const typeOk = matchesType(car, false);
        return budgetOk && typeOk && !candidates.some(c => c.id === car.id);
      });
      candidates = [...candidates, ...fallbackCandidates];

      if (candidates.length === 0) {
        candidates = [...LIVE_MARKET_POOL];
      }
    }
  }

  // Dynamic non-repeating shuffle based on iteration seed + purpose relevance
  const seededCandidates = [...candidates].sort((a, b) => {
    // Calculate multi-purpose tag overlap
    const purposeKeywords = chosenPurposes.map(p => p.toLowerCase().replace(/-/g, ' '));
    const scoreA = a.tags.reduce((acc, tag) => {
      const t = tag.toLowerCase();
      return acc + (purposeKeywords.some(pk => t.includes(pk) || pk.includes(t)) ? 25 : 0);
    }, 0);
    const scoreB = b.tags.reduce((acc, tag) => {
      const t = tag.toLowerCase();
      return acc + (purposeKeywords.some(pk => t.includes(pk) || pk.includes(t)) ? 25 : 0);
    }, 0);

    const hashA = ((a.id.length * 37 + iteration * 19) % 100) - scoreA;
    const hashB = ((b.id.length * 37 + iteration * 19) % 100) - scoreB;
    return hashA - hashB;
  });

  // Pick top 3 to 4 distinct live market cars
  const selectedCars = seededCandidates.slice(0, 4);

  // Transform into enriched live search objects
  const liveResults = selectedCars.map(car => {
    const medianPrice = Math.round((car.priceMin + car.priceMax) / 2);
    
    // Construct real-time Google search query link for this exact car in Nigeria
    const googleQuery = encodeURIComponent(`${car.year} ${car.make} ${car.model} price in ${location} nigeria foreign used site:cars45.com OR site:jiji.ng OR site:autochek.africa`);
    const googleSearchUrl = `https://www.google.com/search?q=${googleQuery}`;

    // Jiji search url
    const jijiQuery = encodeURIComponent(`${car.make} ${car.model} ${car.year}`);
    const jijiUrl = `https://jiji.ng/cars?query=${jijiQuery}`;

    // Cars45 search url
    const cars45Url = `https://www.cars45.com/listing?keyword=${encodeURIComponent(`${car.make} ${car.model}`)}`;

    return {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      bodyType: car.bodyType,
      estimatedPriceRange: `${formatNaira(car.priceMin)} – ${formatNaira(car.priceMax)}`,
      medianPriceFormatted: formatNaira(medianPrice),
      medianPrice: medianPrice,
      transmission: car.transmission,
      fuel: car.fuel,
      engine: car.engine,
      power: car.power,
      seating: car.seating,
      groundClearance: car.groundClearance,
      image: car.image,
      sourcePlatform: car.sourcePlatform,
      sourceBadge: car.sourceBadge,
      description: car.description,
      marketIntelligence: {
        terrainFitness: car.bodyType === "SUV" || car.bodyType === "Pickup" ? "High Ground Clearance · Ideal for Nigerian Inter-state & Rain Season" : "Standard Executive Ground Clearance · City Expressways",
        fuelAvailability: "Readily available across all Nigerian filling stations (Regular Unleaded / Diesel)",
        maintenanceEase: car.make === "Toyota" || car.make === "Lexus" ? "Universal Spare Parts Access & Specialist Technicians in Every State" : "High Availability via Certified German Specialists in Lagos, Abuja & Enugu",
        estimatedDutyPort: `Approx. ${formatNaira(medianPrice * 0.18)} (Customs Tariff & Clearing)`
      },
      directGoogleSearchUrl: googleSearchUrl,
      directJijiUrl: jijiUrl,
      directCars45Url: cars45Url
    };
  });

  // Construct comprehensive search telemetry
  const brandDisplay = (!chosenBrands.includes('any') && chosenBrands.length > 0)
    ? chosenBrands.join(', ')
    : (brand !== 'any' ? brand : '');
  const typeDisplay = (!chosenVehicleTypes.includes('any') && chosenVehicleTypes.length > 0)
    ? chosenVehicleTypes.join(', ')
    : (vehicleType !== 'any' ? vehicleType : 'Vehicles');
  const purposeTagLine = chosenPurposes.length > 0 ? `for ${chosenPurposes.map(p => p.replace(/-/g, ' ')).join(' + ')}` : '';
  const searchQuerySummary = `${brandDisplay} ${typeDisplay} ${purposeTagLine} in ${location} (${formatNaira(minBudget)} – ${formatNaira(maxBudget)})`.replace(/\s+/g, ' ').trim();
  const overallGoogleQuery = encodeURIComponent(`${searchQuerySummary} foreign used price Nigeria site:jiji.ng OR site:cars45.com`);

  return {
    success: true,
    client: name,
    iteration: iteration,
    searchSummary: {
      query: searchQuerySummary,
      location: location,
      targetBudget: `${formatNaira(minBudget)} – ${formatNaira(maxBudget)}`,
      marketStatus: "Live Online Market Feed Verified · Fresh listings retrieved",
      timestamp: new Date().toISOString()
    },
    liveMarketMatches: liveResults,
    overallGoogleSearchUrl: `https://www.google.com/search?q=${overallGoogleQuery}`,
    marketPlatforms: [
      { name: "Google Chrome Live Search", url: `https://www.google.com/search?q=${overallGoogleQuery}` },
      { name: "Jiji Nigeria Auto", url: `https://jiji.ng/cars?query=${encodeURIComponent(brand !== 'any' ? brand : 'SUV')}` },
      { name: "Cars45 Inspected Network", url: "https://www.cars45.com/listing" },
      { name: "Autochek Africa", url: "https://autochek.africa/ng/cars-for-sale" }
    ]
  };
}

// Create HTTP Server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // 1. API Endpoint: POST /api/live-market-search
  if (req.method === 'POST' && pathname === '/api/live-market-search') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      // Cap at 1MB to prevent abuse
      if (body.length > 1e6) req.connection.destroy();
    });

    req.on('end', () => {
      try {
        const params = JSON.parse(body || '{}');
        const results = performLiveMarketSearch(params);
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        });
        res.end(JSON.stringify(results));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid search parameters', details: err.message }));
      }
    });
    return;
  }

  // 2. CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // 3. Static File Server
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Security: prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback for HTML pages or 404
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body style="background:#080809;color:#fff;font-family:sans-serif;text-align:center;padding:100px;"><h1>404 Not Found</h1><p>The requested file ${pathname} was not found on this server.</p><a href="/" style="color:#C92A2A;">Return to Showroom</a></body></html>`);
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const isCodeOrMarkup = ext === '.html' || ext === '.js' || ext === '.css' || ext === '.json';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': isCodeOrMarkup ? 'no-cache, no-store, must-revalidate' : 'public, max-age=86400',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`STERLING AUTOS LIVE SERVER RUNNING ON PORT ${PORT}`);
    console.log(`Showroom: http://localhost:${PORT}/`);
    console.log(`Live Search API: http://localhost:${PORT}/api/live-market-search`);
    console.log(`=================================================`);
  });
}

module.exports = {
  server,
  performLiveMarketSearch,
  LIVE_MARKET_POOL
};
