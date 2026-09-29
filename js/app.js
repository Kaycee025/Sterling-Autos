/**
 * Sterling Autos — Application Controller
 * Handles UI interactions, showroom catalog filtering, multi-step concierge flow,
 * modal dialogs, and integration with the 3-Stage Sales Automation Pipeline.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Sales Automation Engine with inventory database
  const pipeline = new SalesAutomationPipeline(VEHICLES_DATA);

  // State Management
  const state = {
    currentStep: 1,
    totalSteps: 5,
    formData: {
      budgetPreset: "20m-40m",
      customMinBudget: "",
      customMaxBudget: "",
      location: "Enugu",
      vehicleType: "any",
      brand: "any",
      purpose: "family",
      transmission: "any",
      fuel: "any",
      features: [],
      name: "",
      phone: "",
      email: ""
    },
    lastResults: null,
    selectedVehicleForModal: null,
    catalogFilters: {
      search: "",
      bodyType: "all",
      brand: "all",
      priceTier: "all",
      fuel: "all",
      location: "all"
    }
  };

  // --- Element References ---
  const header = document.querySelector(".site-header");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");
  const featuredGrid = document.getElementById("featuredGrid");
  const inventoryGrid = document.getElementById("inventoryGrid");
  const inventoryCountEl = document.getElementById("inventoryCount");

  // Finder Stepper Elements
  const finderSteps = document.querySelectorAll(".finder-step-content");
  const stepIndicators = document.querySelectorAll(".step-indicator-item");
  const prevStepBtn = document.getElementById("prevStepBtn");
  const nextStepBtn = document.getElementById("nextStepBtn");
  const finderLoadingState = document.getElementById("finderLoadingState");
  const finderCardContent = document.getElementById("finderCardContent");

  // Results Section Elements
  const resultsSection = document.getElementById("resultsSection");
  const resultsGrid = document.getElementById("resultsGrid");
  const resultsStatusMessage = document.getElementById("resultsStatusMessage");
  const resultsCountBadge = document.getElementById("resultsCountBadge");

  // Follow-Up Elements
  const followupSection = document.getElementById("followupSection");
  const consultantAvatar = document.getElementById("consultantAvatar");
  const consultantName = document.getElementById("consultantName");
  const consultantTitle = document.getElementById("consultantTitle");
  const consultantShowroom = document.getElementById("consultantShowroom");
  const personalizedLetterText = document.getElementById("personalizedLetterText");
  const customerInquiryDraftBox = document.getElementById("customerInquiryDraftBox");

  // Modals
  const vehicleModal = document.getElementById("vehicleModal");
  const bookingModal = document.getElementById("bookingModal");
  const inspectorDrawer = document.getElementById("inspectorDrawer");
  const inspectorTrigger = document.getElementById("inspectorTrigger");
  const closeInspectorBtn = document.getElementById("closeInspectorBtn");

  // ===============================================================
  // 1. NAVIGATION & SCROLL BEHAVIOR
  // ===============================================================
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => navMenu.classList.remove("open"));
    });
  }

  // ===============================================================
  // 2. RENDER FEATURED VEHICLES (6-8 Curated Cars)
  // ===============================================================
  function renderFeaturedVehicles() {
    if (!featuredGrid) return;
    const featuredList = VEHICLES_DATA.filter(v => v.featured).slice(0, 6);
    featuredGrid.innerHTML = featuredList.map(vehicle => createVehicleCardHTML(vehicle)).join("");
    attachCardListeners(featuredGrid);
  }

  // ===============================================================
  // 3. RENDER SHOWROOM INVENTORY (With Multi-Filter & Search)
  // ===============================================================
  function renderCatalog() {
    if (!inventoryGrid) return;
    
    let filtered = VEHICLES_DATA.filter(car => {
      // Search keyword
      if (state.catalogFilters.search) {
        const query = state.catalogFilters.search.toLowerCase();
        const matchTitle = `${car.year} ${car.make} ${car.model}`.toLowerCase().includes(query);
        const matchEngine = car.engine.toLowerCase().includes(query);
        const matchDesc = car.description.toLowerCase().includes(query);
        if (!matchTitle && !matchEngine && !matchDesc) return false;
      }

      // Body Type
      if (state.catalogFilters.bodyType !== "all" && car.bodyType.toLowerCase() !== state.catalogFilters.bodyType.toLowerCase()) {
        return false;
      }

      // Brand
      if (state.catalogFilters.brand !== "all" && car.make.toLowerCase() !== state.catalogFilters.brand.toLowerCase()) {
        return false;
      }

      // Price Tier
      if (state.catalogFilters.priceTier !== "all") {
        if (state.catalogFilters.priceTier === "under-30m" && car.price >= 30000000) return false;
        if (state.catalogFilters.priceTier === "30m-60m" && (car.price < 30000000 || car.price > 60000000)) return false;
        if (state.catalogFilters.priceTier === "60m-100m" && (car.price < 60000000 || car.price > 100000000)) return false;
        if (state.catalogFilters.priceTier === "100m-plus" && car.price < 100000000) return false;
      }

      // Fuel
      if (state.catalogFilters.fuel !== "all" && car.fuel.toLowerCase() !== state.catalogFilters.fuel.toLowerCase()) {
        return false;
      }

      // Location
      if (state.catalogFilters.location !== "all" && car.location.toLowerCase() !== state.catalogFilters.location.toLowerCase()) {
        return false;
      }

      return true;
    });

    if (inventoryCountEl) {
      inventoryCountEl.textContent = `Showing ${filtered.length} of ${VEHICLES_DATA.length} available vehicles`;
    }

    if (filtered.length === 0) {
      inventoryGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-xs);">
          <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-pure-white); margin-bottom: 0.5rem;">No vehicles matching your exact criteria</h3>
          <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem;">Try relaxing your filter parameters or reset to view all available showroom models.</p>
          <button class="btn btn-outline btn-sm" id="resetCatalogFiltersBtn">Reset Showroom Filters</button>
        </div>
      `;
      const resetBtn = document.getElementById("resetCatalogFiltersBtn");
      if (resetBtn) {
        resetBtn.addEventListener("click", resetCatalogFilters);
      }
    } else {
      inventoryGrid.innerHTML = filtered.map(vehicle => createVehicleCardHTML(vehicle)).join("");
      attachCardListeners(inventoryGrid);
    }
  }

  function resetCatalogFilters() {
    state.catalogFilters = {
      search: "",
      bodyType: "all",
      brand: "all",
      priceTier: "all",
      fuel: "all",
      location: "all"
    };
    const searchInput = document.getElementById("catalogSearchInput");
    const bodyFilter = document.getElementById("filterBodyType");
    const brandFilter = document.getElementById("filterBrand");
    const priceFilter = document.getElementById("filterPrice");
    const fuelFilter = document.getElementById("filterFuel");
    const locationFilter = document.getElementById("filterLocation");

    if (searchInput) searchInput.value = "";
    if (bodyFilter) bodyFilter.value = "all";
    if (brandFilter) brandFilter.value = "all";
    if (priceFilter) priceFilter.value = "all";
    if (fuelFilter) fuelFilter.value = "all";
    if (locationFilter) locationFilter.value = "all";

    renderCatalog();
  }

  // Setup catalog filter listeners
  function initCatalogFilters() {
    const searchInput = document.getElementById("catalogSearchInput");
    const bodyFilter = document.getElementById("filterBodyType");
    const brandFilter = document.getElementById("filterBrand");
    const priceFilter = document.getElementById("filterPrice");
    const fuelFilter = document.getElementById("filterFuel");
    const locationFilter = document.getElementById("filterLocation");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        state.catalogFilters.search = e.target.value.trim();
        renderCatalog();
      });
    }
    if (bodyFilter) {
      bodyFilter.addEventListener("change", (e) => {
        state.catalogFilters.bodyType = e.target.value;
        renderCatalog();
      });
    }
    if (brandFilter) {
      brandFilter.addEventListener("change", (e) => {
        state.catalogFilters.brand = e.target.value;
        renderCatalog();
      });
    }
    if (priceFilter) {
      priceFilter.addEventListener("change", (e) => {
        state.catalogFilters.priceTier = e.target.value;
        renderCatalog();
      });
    }
    if (fuelFilter) {
      fuelFilter.addEventListener("change", (e) => {
        state.catalogFilters.fuel = e.target.value;
        renderCatalog();
      });
    }
    if (locationFilter) {
      locationFilter.addEventListener("change", (e) => {
        state.catalogFilters.location = e.target.value;
        renderCatalog();
      });
    }
  }

  // ===============================================================
  // 4. VEHICLE CARD HTML TEMPLATE & LISTENERS
  // ===============================================================
  function createVehicleCardHTML(v) {
    return `
      <article class="vehicle-card" data-vehicle-id="${v.id}">
        <div class="vehicle-card-media">
          <img src="${v.image}" alt="${v.year} ${v.make} ${v.model}" class="vehicle-card-image" loading="lazy" />
        </div>
        <div class="vehicle-card-body">
          <div class="vehicle-card-make-year">${v.year} · ${v.make} · ${v.bodyType}</div>
          <h3 class="vehicle-card-title">${v.model}</h3>
          <div class="vehicle-card-price">${v.priceFormatted}</div>
          <div class="vehicle-card-specs">
            <span class="spec-item">${v.transmission}</span>
            <span class="spec-item">${v.fuel}</span>
            <span class="spec-item">${v.mileageFormatted}</span>
            <span class="spec-item">${v.location}</span>
          </div>
          <div class="vehicle-card-actions">
            <button class="btn btn-outline btn-sm view-details-btn" data-id="${v.id}">View Details</button>
            <button class="btn btn-primary btn-sm book-viewing-trigger" data-id="${v.id}">Book Viewing</button>
          </div>
        </div>
      </article>
    `;
  }

  function attachCardListeners(container) {
    container.querySelectorAll(".view-details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openVehicleModal(id);
      });
    });

    container.querySelectorAll(".book-viewing-trigger").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openBookingModal(id);
      });
    });

    // Interactive card spotlight tracking
    container.querySelectorAll(".vehicle-card").forEach(card => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--card-mouse-x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--card-mouse-y", `${e.clientY - rect.top}px`);
      });
    });
  }

  // ===============================================================
  // 5. "FIND YOUR CAR" MULTI-STEP CONCIERGE FLOW
  // ===============================================================
  function initFinderFlow() {
    // Selectable cards binding
    document.querySelectorAll(".selectable-card").forEach(card => {
      card.addEventListener("click", () => {
        const group = card.getAttribute("data-group");
        const value = card.getAttribute("data-value");

        if (group === "features") {
          // Multi-select for features
          card.classList.toggle("selected");
          if (card.classList.contains("selected")) {
            if (!state.formData.features.includes(value)) state.formData.features.push(value);
          } else {
            state.formData.features = state.formData.features.filter(f => f !== value);
          }
        } else {
          // Single select per group
          document.querySelectorAll(`.selectable-card[data-group="${group}"]`).forEach(c => c.classList.remove("selected"));
          card.classList.add("selected");
          state.formData[group] = value;

          // Toggle custom budget visibility
          if (group === "budgetPreset") {
            const customBudgetBox = document.getElementById("customBudgetBox");
            if (customBudgetBox) {
              customBudgetBox.style.display = (value === "custom") ? "grid" : "none";
            }
          }
        }
      });
    });

    // Custom budget inputs
    const customMinEl = document.getElementById("customMinBudget");
    const customMaxEl = document.getElementById("customMaxBudget");
    if (customMinEl) customMinEl.addEventListener("input", (e) => state.formData.customMinBudget = e.target.value);
    if (customMaxEl) customMaxEl.addEventListener("input", (e) => state.formData.customMaxBudget = e.target.value);

    // City Selector
    const finderLocationEl = document.getElementById("finderLocation");
    if (finderLocationEl) {
      finderLocationEl.addEventListener("change", (e) => state.formData.location = e.target.value);
    }

    // Step 5 User Details Inputs
    const clientNameEl = document.getElementById("clientName");
    const clientPhoneEl = document.getElementById("clientPhone");
    const clientEmailEl = document.getElementById("clientEmail");
    if (clientNameEl) clientNameEl.addEventListener("input", (e) => state.formData.name = e.target.value);
    if (clientPhoneEl) clientPhoneEl.addEventListener("input", (e) => state.formData.phone = e.target.value);
    if (clientEmailEl) clientEmailEl.addEventListener("input", (e) => state.formData.email = e.target.value);

    // Stepper navigation buttons
    if (nextStepBtn) {
      nextStepBtn.addEventListener("click", handleNextStep);
    }
    if (prevStepBtn) {
      prevStepBtn.addEventListener("click", handlePrevStep);
    }
  }

  function updateStepperUI() {
    finderSteps.forEach((step, idx) => {
      if (idx + 1 === state.currentStep) {
        step.classList.add("active");
      } else {
        step.classList.remove("active");
      }
    });

    stepIndicators.forEach((ind, idx) => {
      const stepNum = idx + 1;
      ind.classList.remove("active", "completed");
      if (stepNum === state.currentStep) {
        ind.classList.add("active");
      } else if (stepNum < state.currentStep) {
        ind.classList.add("completed");
      }
    });

    if (prevStepBtn) {
      prevStepBtn.style.visibility = (state.currentStep === 1) ? "hidden" : "visible";
    }

    if (nextStepBtn) {
      if (state.currentStep === state.totalSteps) {
        nextStepBtn.innerHTML = `<span>Find My Matches</span> →`;
        nextStepBtn.classList.remove("btn-primary");
        nextStepBtn.classList.add("btn-red");
      } else {
        nextStepBtn.innerHTML = `<span>Continue</span> →`;
        nextStepBtn.classList.remove("btn-red");
        nextStepBtn.classList.add("btn-primary");
      }
    }
  }

  function handleNextStep() {
    if (state.currentStep < state.totalSteps) {
      state.currentStep++;
      updateStepperUI();
    } else {
      // Final submission -> Trigger Automated Sales Workflow
      executeSalesWorkflow();
    }
  }

  function handlePrevStep() {
    if (state.currentStep > 1) {
      state.currentStep--;
      updateStepperUI();
    }
  }

  // ===============================================================
  // 6. EXECUTE CONNECTED SALES AUTOMATION PIPELINE
  // ===============================================================
  async function executeSalesWorkflow() {
    // Show refined concierge loading state
    if (finderCardContent && finderLoadingState) {
      finderCardContent.style.display = "none";
      finderLoadingState.style.display = "block";
    }

    // Natural brief pause to simulate intelligent inventory evaluation
    await new Promise(r => setTimeout(r, 650));

    // Process through the 3-agent pipeline
    const results = await pipeline.processCustomerJourney(state.formData);
    state.lastResults = results;

    // Reset finder card for re-use if desired
    if (finderCardContent && finderLoadingState) {
      finderLoadingState.style.display = "none";
      finderCardContent.style.display = "block";
    }

    // Render matches and follow-up
    renderMatchResults(results);
    renderFollowUpSection(results);
    updateInspectorDrawer(results.telemetry);

    // Smooth scroll to results
    if (resultsSection) {
      resultsSection.classList.add("active");
      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ===============================================================
  // 7. RENDER MATCH RESULTS & EDITORIAL REASONING
  // ===============================================================
  function renderMatchResults(results) {
    if (!resultsGrid) return;

    if (resultsStatusMessage) {
      resultsStatusMessage.textContent = results.matches.statusMessage;
    }
    if (resultsCountBadge) {
      resultsCountBadge.textContent = `${results.matches.recommendations.length} Curated Matches`;
    }

    resultsGrid.innerHTML = results.matches.recommendations.map(rec => {
      const v = rec.vehicle;
      return `
        <article class="match-card">
          <div class="match-card-media">
            <img src="${v.image}" alt="${v.year} ${v.make} ${v.model}" class="match-card-image" />
          </div>
          <div class="match-card-content">
            <div class="match-card-top">
              <div>
                <div class="vehicle-card-make-year">${v.year} · ${v.make} · ${v.bodyType}</div>
                <h3 class="match-card-title">${v.model}</h3>
              </div>
              <div class="match-card-price">${v.priceFormatted}</div>
            </div>

            <div class="match-card-specs-line">
              ${v.transmission} · ${v.fuel} · ${v.mileageFormatted} · ${v.engine}
            </div>

            <!-- Authentic Editorial "Why It Fits" Narrative -->
            <div class="why-it-fits-box">
              <div class="why-it-fits-label">Why it fits</div>
              <p class="why-it-fits-text">${rec.whyItFits}</p>
            </div>

            <div class="match-card-actions">
              <button class="btn btn-outline btn-sm view-details-btn" data-id="${v.id}">Full Vehicle Details</button>
              <button class="btn btn-primary btn-sm select-for-viewing-btn" data-id="${v.id}">Select For Private Viewing</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    // Attach listeners
    resultsGrid.querySelectorAll(".view-details-btn").forEach(btn => {
      btn.addEventListener("click", () => openVehicleModal(btn.getAttribute("data-id")));
    });

    resultsGrid.querySelectorAll(".select-for-viewing-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        openBookingModal(id);
      });
    });
  }

  // ===============================================================
  // 8. RENDER PERSONALIZED FOLLOW-UP (Stage 3 Output)
  // ===============================================================
  function renderFollowUpSection(results) {
    if (!followupSection) return;
    followupSection.style.display = "block";

    const { consultant, topVehicle, personalNote, customerInquiryDraft } = results.followUp;

    if (consultantAvatar) {
      consultantAvatar.textContent = consultant.name.split(" ").map(n => n[0]).join("");
    }
    if (consultantName) consultantName.textContent = consultant.name;
    if (consultantTitle) consultantTitle.textContent = consultant.role;
    if (consultantShowroom) consultantShowroom.textContent = consultant.showroom;
    if (personalizedLetterText) personalizedLetterText.textContent = personalNote;

    // Follow-up actions
    const bookViewingAction = document.getElementById("actionBookViewing");
    const talkSpecialistAction = document.getElementById("actionTalkSpecialist");
    const getInfoAction = document.getElementById("actionGetInfo");

    if (bookViewingAction) {
      bookViewingAction.onclick = () => openBookingModal(topVehicle.id);
    }

    if (talkSpecialistAction) {
      talkSpecialistAction.onclick = () => {
        const text = encodeURIComponent(customerInquiryDraft);
        // Clean professional WhatsApp or Tel prompt
        const confirmMsg = `Connect with ${consultant.name} (${consultant.role}) at ${consultant.phone}?\n\nDraft Message:\n"${customerInquiryDraft}"`;
        if (confirm(confirmMsg)) {
          window.open(`https://wa.me/2348031245500?text=${text}`, "_blank");
        }
      };
    }

    if (getInfoAction) {
      getInfoAction.onclick = () => {
        openVehicleModal(topVehicle.id);
      };
    }
  }

  // ===============================================================
  // 9. VEHICLE DETAILS MODAL
  // ===============================================================
  function openVehicleModal(vehicleId) {
    const v = VEHICLES_DATA.find(item => item.id === vehicleId);
    if (!v || !vehicleModal) return;

    state.selectedVehicleForModal = v;

    const modalImg = document.getElementById("modalVehicleImg");
    const modalTitle = document.getElementById("modalVehicleTitle");
    const modalPrice = document.getElementById("modalVehiclePrice");
    const modalMakeYear = document.getElementById("modalVehicleMakeYear");
    const modalDesc = document.getElementById("modalVehicleDescription");
    const modalSpecsTable = document.getElementById("modalSpecsTable");
    const modalFeaturesList = document.getElementById("modalFeaturesList");

    if (modalImg) modalImg.src = v.image;
    if (modalTitle) modalTitle.textContent = v.model;
    if (modalPrice) modalPrice.textContent = v.priceFormatted;
    if (modalMakeYear) modalMakeYear.textContent = `${v.year} · ${v.make} · ${v.bodyType}`;
    if (modalDesc) modalDesc.textContent = v.description;

    if (modalSpecsTable) {
      modalSpecsTable.innerHTML = `
        <tr><td>Transmission</td><td>${v.transmission}</td></tr>
        <tr><td>Fuel Type</td><td>${v.fuel}</td></tr>
        <tr><td>Mileage</td><td>${v.mileageFormatted}</td></tr>
        <tr><td>Engine</td><td>${v.engine}</td></tr>
        <tr><td>Horsepower / Torque</td><td>${v.power}</td></tr>
        <tr><td>Drivetrain</td><td>${v.driveType}</td></tr>
        <tr><td>Seating Capacity</td><td>${v.seating} Passengers</td></tr>
        <tr><td>Ground Clearance</td><td>${v.groundClearance}</td></tr>
        <tr><td>Exterior Color</td><td>${v.exteriorColor}</td></tr>
        <tr><td>Interior Trim</td><td>${v.interiorColor}</td></tr>
        <tr><td>Current Location</td><td>${v.showroom}</td></tr>
        <tr><td>Condition / Provenance</td><td>${v.condition}</td></tr>
      `;
    }

    if (modalFeaturesList) {
      modalFeaturesList.innerHTML = v.features.map(f => `<li style="margin-bottom: 0.35rem; font-size: 0.85rem; color: #D4D4D8;">✓ ${f}</li>`).join("");
    }

    // Modal Action buttons
    const modalBookBtn = document.getElementById("modalBookViewingBtn");
    if (modalBookBtn) {
      modalBookBtn.onclick = () => {
        closeAllModals();
        openBookingModal(v.id);
      };
    }

    vehicleModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // ===============================================================
  // 10. BOOK A VIEWING MODAL & CONFIRMATION
  // ===============================================================
  function openBookingModal(vehicleId = null) {
    if (!bookingModal) return;

    const selectEl = document.getElementById("bookingVehicleSelect");
    if (selectEl) {
      selectEl.innerHTML = VEHICLES_DATA.map(v => `
        <option value="${v.id}" ${vehicleId === v.id ? 'selected' : ''}>
          ${v.year} ${v.make} ${v.model} (${v.priceFormatted}) — ${v.location}
        </option>
      `).join("");
    }

    // Pre-fill user inputs if user filled Step 5
    const nameInput = document.getElementById("bookingName");
    const phoneInput = document.getElementById("bookingPhone");
    const emailInput = document.getElementById("bookingEmail");

    if (nameInput && state.formData.name) nameInput.value = state.formData.name;
    if (phoneInput && state.formData.phone) phoneInput.value = state.formData.phone;
    if (emailInput && state.formData.email) emailInput.value = state.formData.email;

    // Reset confirmed box
    const formBox = document.getElementById("bookingFormBody");
    const confirmedBox = document.getElementById("bookingConfirmedBox");
    if (formBox) formBox.style.display = "block";
    if (confirmedBox) confirmedBox.style.display = "none";

    bookingModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  // Handle booking form submission
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formBox = document.getElementById("bookingFormBody");
      const confirmedBox = document.getElementById("bookingConfirmedBox");
      const clientName = document.getElementById("bookingName").value || "Valued Client";
      const vehicleSelect = document.getElementById("bookingVehicleSelect");
      const vehicleText = vehicleSelect.options[vehicleSelect.selectedIndex].text;

      if (formBox) formBox.style.display = "none";
      if (confirmedBox) {
        confirmedBox.innerHTML = `
          <div style="font-size: 2.25rem; color: #FFFFFF; margin-bottom: 1rem;">✓</div>
          <h3 style="font-size: 1.5rem; font-weight: 700; color: #FFFFFF; margin-bottom: 0.5rem;">Viewing Request Received</h3>
          <p style="font-size: 0.95rem; color: #A1A1AA; line-height: 1.6; max-width: 480px; margin: 0 auto 1.5rem;">
            Thank you, ${clientName}. Your private viewing reservation for the <strong>${vehicleText}</strong> has been logged with our senior client desk. We will contact you shortly to confirm appointment details.
          </p>
          <button class="btn btn-outline btn-sm close-modal-btn" onclick="document.getElementById('bookingModal').classList.remove('active'); document.body.style.overflow='auto';">Done</button>
        `;
        confirmedBox.style.display = "block";
      }
    });
  }

  // Handle direct contact form
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thank you. Your message has been routed to our executive concierge team in Enugu and Lagos. We will respond promptly.");
      contactForm.reset();
    });
  }

  // Modal Closers
  function closeAllModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => m.classList.remove("active"));
    document.body.style.overflow = "auto";
  }

  document.querySelectorAll(".modal-close-btn, .close-modal-trigger").forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // ===============================================================
  // 11. TECHNICAL AUDIT INSPECTOR DRAWER
  // Demonstrates the 3-Agent connected pipeline telemetry
  // ===============================================================
  function initInspector() {
    if (inspectorTrigger && inspectorDrawer) {
      inspectorTrigger.addEventListener("click", () => {
        inspectorDrawer.classList.add("open");
      });
    }
    if (closeInspectorBtn && inspectorDrawer) {
      closeInspectorBtn.addEventListener("click", () => {
        inspectorDrawer.classList.remove("open");
      });
    }
  }

  function updateInspectorDrawer(telemetry) {
    if (!telemetry) return;
    const stage1El = document.getElementById("inspectorStage1Code");
    const stage2El = document.getElementById("inspectorStage2Code");
    const stage3El = document.getElementById("inspectorStage3Code");
    const execTimeEl = document.getElementById("inspectorExecTime");

    if (execTimeEl) execTimeEl.textContent = `${telemetry.durationMs}ms`;
    if (stage1El) stage1El.textContent = JSON.stringify(telemetry.stage1_Profile, null, 2);
    if (stage2El) {
      stage2El.textContent = JSON.stringify({
        status: telemetry.stage2_Matching.status,
        totalEvaluated: telemetry.stage2_Matching.totalEvaluated,
        recommendations: telemetry.stage2_Matching.recommendations.map(r => ({
          model: `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model}`,
          price: r.vehicle.priceFormatted,
          compositeScore: r.score,
          breakdown: r.breakdown,
          whyItFitsSnippet: r.whyItFits
        }))
      }, null, 2);
    }
    if (stage3El) stage3El.textContent = JSON.stringify(telemetry.stage3_FollowUp, null, 2);
  }

  // Global triggers
  window.openBookingModal = openBookingModal;
  window.openVehicleModal = openVehicleModal;

  // ===============================================================
  // 12. SCROLL-TRIGGERED REVEAL OBSERVER
  // Smoothly reveals elements as user traverses the showroom
  // ===============================================================
  function initScrollRevealObserver() {
    const targets = document.querySelectorAll(".section-header, .vehicle-card, .trust-item, .about-grid, .showroom-card, .finder-card, .followup-wrapper");
    targets.forEach((el, i) => {
      el.classList.add("reveal-on-scroll");
      if (el.classList.contains("vehicle-card") || el.classList.contains("trust-item")) {
        const delay = (i % 4) * 80;
        el.style.transitionDelay = `${delay}ms`;
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    targets.forEach(el => observer.observe(el));
  }

  // Header "Book a Viewing" button
  const headerBookingBtn = document.getElementById("headerBookViewingBtn");
  if (headerBookingBtn) {
    headerBookingBtn.addEventListener("click", () => openBookingModal());
  }

  // Initialize all components
  renderFeaturedVehicles();
  initCatalogFilters();
  renderCatalog();
  initFinderFlow();
  initInspector();
  initScrollRevealObserver();
});
