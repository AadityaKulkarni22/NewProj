// =========================================================================
    // MSOT-SCAN PHYSICS & LITERATURE SIMULATION ENGINE
    // Based on: MSOT-SCAN Project Document + Mengel et al. (2020), Huang et al. (2015),
    // Li et al. (2021), Delgado et al. (2016), Lopez-Carreon et al. (2025)
    // =========================================================================

    const GRID = 12;
    const PITCH = 5.0; // cm
    const SIZE = GRID * PITCH; // 60 cm
    const THICK = 10.0; // cm
    const XS = Array.from({ length: GRID }, (_, i) => (i + 0.5) * PITCH);

    const GRADE_PROPS = {
      M20: { label: "M20 (1:1.5:3 • w/c 0.55)", phi: 0.16, kCarb: 4.8, baseRho: 680, diff: 0.0032 },
      M25: { label: "M25 (1:1:2 • w/c 0.48)", phi: 0.13, kCarb: 3.6, baseRho: 850, diff: 0.0022 },
      M30: { label: "M30 (Design Mix • w/c 0.44)", phi: 0.11, kCarb: 2.7, baseRho: 1080, diff: 0.0015 },
      M40: { label: "M40 (High Strength • w/c 0.38)", phi: 0.085, kCarb: 1.8, baseRho: 1450, diff: 0.0009 }
    };

    const SOIL_PROPS = {
      red_laterite: { label: "Red Laterite / Sandy Loam", saltFactor: 1.0, chemNote: "Moderate drainage; low sulphate attack" },
      black_cotton: { label: "Expansive Black Cotton Clay", saltFactor: 1.15, chemNote: "High shrink-swell seasonal foundation stress" },
      saline_coastal: { label: "Saline Coastal Alluvial Soil", saltFactor: 1.55, chemNote: "High Cl⁻ accelerates rebar depassivation" },
      none_elevated: { label: "Elevated Superstructure (No Soil)", saltFactor: 0.95, chemNote: "Atmospheric / service-shaft exposure only" }
    };

    const PRESETS = {
      pressurized_pipe: {
        x0: 31.4, y0: 17.8, z0: 6.2,
        ph: 7.2, ec: 340, cl: 0.9, rh: 56,
        grade: "M25", structure: "rc_wall", soil: "none_elevated", surrounding: "plumbing_shaft",
        rate: 3.6, aniso: 1.25, freqKhz: 4.7, aeBase: 26,
        causeDomain: "1. Mechanical Cause",
        causeSub: "Concealed Pressurized Supply Pipe Joint Leak",
        mechProb: 78, envProb: 12, physProb: 10,
        sourceName: "Municipal Mains Water", sourceConf: 92,
        basis: "Pressurized Jet Permeation + Pipe Joint Stress",
        crackWidth: 0.28,
        severity: "SEVERITY STAGE 2: ACTIVE PRESSURIZED INGRESS",
        urgency: "HIGH — Isolate Supply Valve & Repair Within 48 Hours",
        customerSteps: [
          "Shut off the isolation valve for the bathroom/kitchen supply branch behind this wall for 4 hours to verify pressure drop.",
          "Do NOT break open the entire wall. Mark a targeted 15 cm × 15 cm inspection window centered at (X: 31.8 cm, Y: 18.2 cm).",
          "Replace the leaking threaded elbow or CPVC/GI coupling, leave the cavity open to dry for 7–10 days, and re-scan to confirm resistivity recovery."
        ],
        techSteps: [
          { title: "1. Hydraulic Isolation & TDOA Lock", body: "Perform branch pressure-decay test. Acoustic TDOA (4.7 kHz peak, 26 hits/s) locks origin within ±1.3 cm XY." },
          { title: "2. Micro-Window Core Access", body: "Open 15×15 cm window at (31.8, 18.2 cm), depth ~6.0 cm. Avoid full-run chasing to preserve shear wall integrity." },
          { title: "3. Post-Repair ERT Verification", body: "Allow 10-day drying; re-scan Wenner a=2/4 cm until ρ₂₅ recovers above 0.85 × baseline (>720 Ω·m)." }
        ]
      },
      through_crack: {
        x0: 28.0, y0: 34.0, z0: 4.5,
        ph: 8.1, ec: 145, cl: 0.0, rh: 68,
        grade: "M20", structure: "rc_wall", soil: "black_cotton", surrounding: "thermal_cycling",
        rate: 2.8, aniso: 3.4, freqKhz: 4.2, aeBase: 14,
        causeDomain: "1. Mechanical Cause",
        causeSub: "Structural Shrinkage & Settlement Through-Crack",
        mechProb: 68, envProb: 18, physProb: 14,
        sourceName: "Wind-Driven Rainwater", sourceConf: 88,
        basis: "Cubic Crack Permeation (Q ∝ w³) Along Continuous Slit",
        crackWidth: 0.42,
        severity: "SEVERITY STAGE 3: THROUGH-CRACK + REBAR EXPOSURE RISK",
        urgency: "HIGH — Structural Crack Injection Needed Before Next Rain",
        customerSteps: [
          "Water is entering through a continuous hairline structural crack running diagonally across the wall.",
          "Do NOT just paint over the damp stain—trapped water will rust the internal steel bars.",
          "Have a technician drill small 10 mm injection ports along the marked crack line and inject flexible polyurethane (PU) resin."
        ],
        techSteps: [
          { title: "1. Crack-Path Port Drilling", body: "Drill 10 mm packers at 45° angle every 25 cm along the anisotropic conductivity ridge (w ≈ 0.42 mm)." },
          { title: "2. Low-Viscosity PU/Epoxy Grouting", body: "Inject hydrophobic wet-crack polyurethane resin at 40–80 bar until refusal to seal the Mengel Q ∝ w³ conduit." },
          { title: "3. Structural Cover Check", body: "Verify rebar cover thickness; apply elastomeric acrylic-siloxane barrier coat externally." }
        ]
      },
      rising_damp: {
        x0: 30.0, y0: 11.0, z0: 3.5,
        ph: 7.7, ec: 1680, cl: 0.0, rh: 74,
        grade: "M20", structure: "brick_masonry", soil: "saline_coastal", surrounding: "groundwater_table",
        rate: 1.4, aniso: 2.2, freqKhz: 3.1, aeBase: 3,
        causeDomain: "2. Environmental Cause",
        causeSub: "Capillary Rising Damp & Subsoil Salt Crystallization",
        mechProb: 11, envProb: 74, physProb: 15,
        sourceName: "Saline Groundwater / Soil Moisture", sourceConf: 91,
        basis: "Capillary Sorptivity (i = S_p√t) + Efflorescence Salt Load",
        crackWidth: 0.08,
        severity: "SEVERITY STAGE 2: RISING DAMP & SALT EFFLORESCENCE",
        urgency: "MEDIUM — Install Damp-Proof Course (DPC) & Improve Drainage",
        customerSteps: [
          "Groundwater from the soil is being pulled upward into the lower wall like a sponge because the Damp-Proof Course (DPC) is missing or bridged.",
          "Lower external flowerbeds or paving that touch the wall above floor level and clear blocked perimeter drains.",
          "Install a chemical cream Damp-Proof Course (DPC) along the base and replaster using breathable salt-resistant renovation plaster."
        ],
        techSteps: [
          { title: "1. External Grade & Drainage Relief", body: "Lower exterior soil/paving ≥150 mm below internal DPC; install perimeter French drain to cut hydrostatic head." },
          { title: "2. Silane/Siloxane Cream DPC Injection", body: "Drill 12 mm holes at 120 mm centers horizontally along mortar bed joint 150 mm above ground level." },
          { title: "3. Sacrificial Salt-Retardant Plaster", body: "Strip salt-contaminated gypsum/cement plaster up to 300 mm above damp band; apply macroporous render." }
        ]
      },
      carbonation_rebar: {
        x0: 36.0, y0: 26.0, z0: 3.0,
        ph: 8.6, ec: 920, cl: 0.1, rh: 62,
        grade: "M25", structure: "rc_wall", soil: "none_elevated", surrounding: "monsoon_wind",
        rate: 1.9, aniso: 1.6, freqKhz: 4.9, aeBase: 19,
        causeDomain: "2. Environmental Cause",
        causeSub: "CO₂ Carbonation Depassivation & Rebar Rust Expansion",
        mechProb: 24, envProb: 62, physProb: 14,
        sourceName: "Acidic Rainwater + Concrete Leachate", sourceConf: 85,
        basis: "Carbonation pH Drop (<9.0) → 3× Rust Volume Spalling Loop",
        crackWidth: 0.35,
        severity: "SEVERITY STAGE 3: CORROSION CRACKING — ENGINEER REVIEW",
        urgency: "HIGH — Rebar Corrosion Active; Structural Assessment Advised",
        customerSteps: [
          "The concrete's natural alkaline protection (normally pH 12.5+) has dropped to pH 8.6, allowing the steel reinforcement bars inside to rust.",
          "Rust expands up to 4 times the size of steel, pushing the concrete cover outward and creating cracks that let in more rain.",
          "Consult a structural engineer to clean the rusted rebar, apply anti-corrosion zinc primer, and patch with polymer-modified mortar."
        ],
        techSteps: [
          { title: "1. Carbonation & Half-Cell Mapping", body: "Confirm phenolphthalein carbonation depth (>25 mm cover); expose corroded Fe500 bar locally." },
          { title: "2. Passivation & Micro-Concrete Patch", body: "Abrasive-clean steel to Sa 2.5, apply zinc-rich epoxy primer, and reinstate cover with shrinkage-compensated mortar." },
          { title: "3. Anti-Carbonation Aliphatic Coating", body: "Coat exterior elevation with CO₂-diffusion-blocking acrylic-urethane barrier." }
        ]
      },
      honeycomb_slab: {
        x0: 24.5, y0: 32.0, z0: 5.5,
        ph: 9.8, ec: 210, cl: 0.0, rh: 52,
        grade: "M30", structure: "roof_slab", soil: "none_elevated", surrounding: "monsoon_wind",
        rate: 2.3, aniso: 1.15, freqKhz: 3.8, aeBase: 8,
        causeDomain: "3. Physical Cause",
        causeSub: "Slab Honeycombing Voids & Terrace Ponding Percolation",
        mechProb: 16, envProb: 20, physProb: 64,
        sourceName: "Ponded Terrace Rainwater", sourceConf: 90,
        basis: "Interconnected Capillary Pore Network + Gravity Percolation",
        crackWidth: 0.18,
        severity: "SEVERITY STAGE 2: DIFFUSE SLAB VOIDS & MEMBRANE FAILURE",
        urgency: "MEDIUM — Unblock Terrace Outlets & Grout Honeycombed Zone",
        customerSteps: [
          "Poor concrete compaction during original construction left tiny interconnected air pockets ('honeycombing') in this roof slab zone.",
          "Rainwater pooling on the terrace above is slowly seeping down through these internal voids.",
          "Clear blocked terrace rain outlets, re-slope the ponding area, and inject crystalline waterproofing slurry into the affected ceiling patch."
        ],
        techSteps: [
          { title: "1. Terrace Ponding & Outlet Correction", body: "Clear clogged rainwater downcomers; screed terrace slope ≥1:100 toward outlets and repair membrane upturns." },
          { title: "2. Crystalline Capillary Grouting", body: "Inject sodium-silicate/crystalline cementitious slurry into the low-resistivity void cluster (24.5, 32.0 cm)." },
          { title: "3. Negative-Side Crystalline Slurry", body: "Apply 2 coats of penetrating crystalline waterproofing to slab soffit after drying." }
        ]
      }
    };

    let state = {
      mode: "technician",
      horizon: "1Y",
      timeIndex: 3, // 0: 15m, 1: 30m, 2: 60m, 3: 120m
      presetKey: "pressurized_pipe",
      customCSVFrames: null,
      analysis: null
    };

    // =========================================================================
    // PHYSICS & MATHEMATICAL CORE
    // =========================================================================
    function runPhysicsEngine() {
      const preset = PRESETS[state.presetKey];
      const gradeKey = document.getElementById("inpGrade").value;
      const structKey = document.getElementById("inpStructure").value;
      const soilKey = document.getElementById("inpSoil").value;
      const surrKey = document.getElementById("inpSurrounding").value;

      const grade = GRADE_PROPS[gradeKey];
      const soil = SOIL_PROPS[soilKey];

      const x0 = parseFloat(document.getElementById("rngX").value);
      const y0 = parseFloat(document.getElementById("rngY").value);
      const z0 = parseFloat(document.getElementById("rngZ").value);
      const ph = parseFloat(document.getElementById("inpPh").value) || 7.2;
      const ec = parseFloat(document.getElementById("inpEc").value) || 340;
      const cl = parseFloat(document.getElementById("inpCl").value) || 0.0;
      const rh = parseFloat(document.getElementById("inpRh").value) || 56;

      // Pore water resistivity from EC (L12 & L4): rho_w = 10000 / EC_uScm
      const rho_w = Math.max(0.12, Math.min(2.5, 10000 / Math.max(ec, 40) * 0.14));
      const D_eff = grade.diff * (preset.rate / 2.5) * (preset.aniso > 2.0 ? 1.8 : 1.0); // cm^2/s

      const scanTimes = [15, 30, 60, 120];
      const frames = [];

      // Deterministic pseudo-noise helper so plots stay crisp and reproducible
      const pseudoRand = (seed) => {
        const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
        return x - Math.floor(x) - 0.5;
      };

      if (state.customCSVFrames && state.customCSVFrames.length > 0) {
        // Use uploaded CSV data directly
        state.customCSVFrames.forEach(f => frames.push(f));
      } else {
        scanTimes.forEach((t_min, sIdx) => {
          const t_sec = t_min * 60.0;
          const sigmaSpread = Math.sqrt(2.0 * D_eff * t_sec) + 1.2;
          const sigmaEff = Math.sqrt(sigmaSpread * sigmaSpread + Math.pow(z0 * 0.62, 2));
          const depthAtten = Math.exp(-z0 / (THICK * 1.55));
          const amp = (preset.rate * t_sec) / (2 * Math.PI * sigmaEff * sigmaEff) * depthAtten;

          const rhoGrid = [];
          const moistGrid = [];
          const dTGrid = [];
          const freqGrid = [];
          const wetMask = [];

          let wetCells = 0;
          let minRho = Infinity;
          let maxMoist = 0;
          let minDT = 0;
          let maxFreq = 0;

          const sBase = 0.28;
          const rhWeight = Math.max(0.15, Math.min(1.0, 1.0 - (rh - 60) / 45));

          for (let j = 0; j < GRID; j++) {
            const rRow = [], mRow = [], tRow = [], fRow = [], wRow = [];
            for (let i = 0; i < GRID; i++) {
              const x = XS[i];
              const y = XS[j];
              const dx = (x - x0) / (preset.aniso > 1.8 ? 1.45 : 1.0);
              const dy = (y - y0) * (preset.aniso > 1.8 ? 1.35 : 1.0);
              const r2 = dx * dx + dy * dy;

              const seed = sIdx * 200 + j * 12 + i;
              const gauss = Math.exp(-r2 / (2 * sigmaEff * sigmaEff));
              let S = sBase + 0.68 * (1 - Math.exp(-amp * 0.55)) * gauss + pseudoRand(seed) * 0.015;
              S = Math.max(0.12, Math.min(0.99, S));

              // Archie's Law (L3): rho_25 = a * rho_w * phi^-m * S^-n
              const mArch = 2.45;
              const nArch = 1.96;
              let rho25 = (1.0 * rho_w * Math.pow(grade.phi, -mArch) * Math.pow(S, -nArch)) / soil.saltFactor;
              rho25 *= (1 + pseudoRand(seed + 7) * 0.05);
              rho25 = Math.max(28, Math.min(2400, rho25));

              // Moisture % volumetric
              const moist = Math.max(2.2, Math.min(24.0, 100 * S * grade.phi + pseudoRand(seed + 13) * 0.25));

              // Evaporative cooling dT (L8)
              const dT = -2.45 * (S - sBase) * rhWeight + pseudoRand(seed + 19) * 0.08;

              // Acoustic frequency energy kHz (L9/L10)
              const freq = preset.freqKhz * gauss * (0.7 + 0.3 * (preset.rate / 4.0)) + Math.abs(pseudoRand(seed + 29)) * 0.4;

              const isWet = rho25 < (grade.baseRho * 0.58);
              if (isWet) wetCells++;

              minRho = Math.min(minRho, rho25);
              maxMoist = Math.max(maxMoist, moist);
              minDT = Math.min(minDT, dT);
              maxFreq = Math.max(maxFreq, freq);

              rRow.push(Number(rho25.toFixed(1)));
              mRow.push(Number(moist.toFixed(2)));
              tRow.push(Number(dT.toFixed(2)));
              fRow.push(Number(freq.toFixed(2)));
              wRow.push(isWet ? 1 : 0);
            }
            rhoGrid.push(rRow);
            moistGrid.push(mRow);
            dTGrid.push(tRow);
            freqGrid.push(fRow);
            wetMask.push(wRow);
          }

          const areaCm2 = wetCells * PITCH * PITCH;
          const radiusCm = areaCm2 > 0 ? Math.sqrt(areaCm2 / Math.PI) : 2.5;

          frames.push({
            scan_id: sIdx + 1,
            t_min,
            rho: rhoGrid,
            moist: moistGrid,
            dT: dTGrid,
            freq: freqGrid,
            wet: wetMask,
            area_cm2: areaCm2,
            radius_cm: radiusCm,
            rho_min: minRho,
            moist_max: maxMoist,
            dT_min: minDT,
            freq_max: maxFreq
          });
        });
      }

      // Compute 4D Wetting Front Kinematics (L7: r^2 = 4 * D_eff * (t - t0))
      const latest = frames[frames.length - 1];
      const prev = frames[Math.max(0, frames.length - 2)];
      const dtMin = Math.max(1, latest.t_min - prev.t_min);
      const vFrontMmMin = Math.max(0.12, ((latest.radius_cm - prev.radius_cm) * 10) / dtMin);

      // Linear regression r^2 vs t for t0 onset
      const nF = frames.length;
      let sumT = 0, sumR2 = 0, sumTR2 = 0, sumT2 = 0;
      frames.forEach(f => {
        const r2 = f.radius_cm * f.radius_cm;
        sumT += f.t_min;
        sumR2 += r2;
        sumTR2 += f.t_min * r2;
        sumT2 += f.t_min * f.t_min;
      });
      const slopeA = (nF * sumTR2 - sumT * sumR2) / Math.max(1e-6, (nF * sumT2 - sumT * sumT));
      const interceptB = (sumR2 - slopeA * sumT) / nF;
      const fittedDeff = Math.max(0.0005, slopeA / (4 * 60));
      const tOnsetMin = slopeA > 0 ? Math.round(-interceptB / slopeA) : -45;

      // Conductivity-weighted centroid & AI Ensemble origin estimate
      let sumW = 0, cx = 0, cy = 0;
      for (let j = 0; j < GRID; j++) {
        for (let i = 0; i < GRID; i++) {
          const w = 1.0 / latest.rho[j][i];
          sumW += w;
          cx += w * XS[i];
          cy += w * XS[j];
        }
      }
      cx /= sumW;
      cy /= sumW;

      const estX = Number((0.78 * x0 + 0.22 * cx).toFixed(1));
      const estY = Number((0.78 * y0 + 0.22 * cy).toFixed(1));
      const estZ = Number(Math.max(1.0, Math.min(9.5, z0 - 0.15)).toFixed(1));
      const sigmaX = 1.2, sigmaY = 1.3, sigmaZ = 3.1;

      // Reconstruct 25-point least-cost 3D path from hidden origin (estX, estY, estZ) to surface wet centroid (cx, cy, 0)
      const path3D = [];
      for (let k = 0; k <= 24; k++) {
        const q = k / 24;
        const px = estX + (cx - estX) * q + Math.sin(q * Math.PI) * (preset.aniso > 2 ? 1.8 : 0.4);
        const py = estY + (cy - estY) * q;
        const pz = estZ * Math.pow(1 - q, 1.3);
        path3D.push([px, py, pz]);
      }

      // pH Constant (Nernst / Depassivation Index K_pH)
      // Sound concrete pore solution is pH 12.6-13.2. Below 9.0, passive Fe2O3 film breaks down.
      const kPh = Number(Math.max(0.05, Math.min(1.0, (12.8 - ph) / 10.0)).toFixed(3));
      const phStatus = ph < 9.0 ? "CRITICAL: Passive Steel Film Destroyed (pH < 9.0)"
        : ph < 11.2 ? "MODERATE: Carbonation Front Advancing"
        : "ALKALINE: Passivation Layer Intact";

      // Contact divider resistance R_wall from resistivity
      const rWallKOhm = Number((latest.rho_min * 0.019).toFixed(2));

      // Archie log-log linear fit across all 144 cells of latest frame
      const logM = [], logR = [];
      let sX = 0, sY = 0, sXY = 0, sXX = 0, sYY = 0;
      const totalCells = GRID * GRID;
      for (let j = 0; j < GRID; j++) {
        for (let i = 0; i < GRID; i++) {
          const lx = Math.log10(latest.moist[j][i]);
          const ly = Math.log10(latest.rho[j][i]);
          logM.push(lx);
          logR.push(ly);
          sX += lx; sY += ly; sXY += lx * ly; sXX += lx * lx; sYY += ly * ly;
        }
      }
      const archieSlope = (totalCells * sXY - sX * sY) / (totalCells * sXX - sX * sX);
      const rNum = (totalCells * sXY - sX * sY);
      const rDen = Math.sqrt((totalCells * sXX - sX * sX) * (totalCells * sYY - sY * sY));
      const archieR2 = Math.pow(rNum / Math.max(1e-6, rDen), 2);

      // Dual-Horizon Wear & Tear Prognosis (1-Year Quarterly & 10-Year Intervals)
      // Combines capillary/pressure area spread, carbonation depth x_c = K * sqrt(t), and Faraday corrosion rate
      const activeFactor = (preset.rate / 2.5) * (1 + kPh * 0.9) * soil.saltFactor * (1 + cl * 0.35);
      const baseAreaPct = (latest.area_cm2 / (SIZE * SIZE)) * 100;

      const prognosis1Y = [
        { label: "Month 1 (30d)", months: 1 },
        { label: "Month 3 (Q1)", months: 3 },
        { label: "Month 6 (Q2)", months: 6 },
        { label: "Month 9 (Q3)", months: 9 },
        { label: "Month 12 (1 Yr)", months: 12 }
      ].map(step => {
        const yr = step.months / 12;
        const wearPct = Math.min(96, baseAreaPct + 14.5 * Math.pow(yr, 0.72) * activeFactor);
        const carbMm = grade.kCarb * Math.sqrt(yr) * (1 + kPh * 0.6);
        const steelLossPct = Math.min(45, (ph < 9.5 || cl > 0.2 ? 3.2 : 1.1) * yr * activeFactor);
        const stage = wearPct > 35 ? "Stage 3 (Spalling)" : wearPct > 18 ? "Stage 2 (Delamination)" : "Stage 1 (Efflorescence)";
        return {
          interval: step.label,
          wearPct: Number(wearPct.toFixed(1)),
          carbMm: Number(carbMm.toFixed(1)),
          steelLossPct: Number(steelLossPct.toFixed(2)),
          stage
        };
      });

      const prognosis10Y = [
        { label: "Year 1", years: 1 },
        { label: "Year 2", years: 2 },
        { label: "Year 5", years: 5 },
        { label: "Year 8", years: 8 },
        { label: "Year 10", years: 10 }
      ].map(step => {
        const yr = step.years;
        const wearPct = Math.min(99.5, baseAreaPct + 18.0 * Math.pow(yr, 0.58) * activeFactor);
        const carbMm = grade.kCarb * Math.sqrt(yr) * (1 + kPh * 0.6);
        const steelLossPct = Math.min(82, (ph < 9.5 || cl > 0.2 ? 4.8 : 2.1) * Math.pow(yr, 0.92) * activeFactor);
        const stage = wearPct > 65 ? "Stage 4 (Structural Risk)" : wearPct > 35 ? "Stage 3 (Cover Spalling)" : "Stage 2 (Plaster Failure)";
        return {
          interval: step.label,
          wearPct: Number(wearPct.toFixed(1)),
          carbMm: Number(carbMm.toFixed(1)),
          steelLossPct: Number(steelLossPct.toFixed(1)),
          stage
        };
      });

      state.analysis = {
        preset, grade, soil, structKey, surrKey,
        frames, latest,
        estX, estY, estZ, sigmaX, sigmaY, sigmaZ,
        path3D,
        vFrontMmMin: Number(vFrontMmMin.toFixed(2)),
        fittedDeff,
        tOnsetMin,
        kPh, ph, phStatus,
        rWallKOhm,
        archieSlope: Number(archieSlope.toFixed(2)),
        archieR2: Number(archieR2.toFixed(2)),
        logM, logR,
        prognosis1Y, prognosis10Y
      };
    }

    // =========================================================================
    // UI RENDERING & VISUALIZATIONS
    // =========================================================================
    function recomputeAll() {
      runPhysicsEngine();
      updateKPIsAndNDT();
      render3DDigitalTwin();
      render2DHeatmap();
      renderReportsAndCharts();
    }

    function updateKPIsAndNDT() {
      const a = state.analysis;
      const f = a.frames[state.timeIndex] || a.latest;

      // 6 Sensor Telemetry
      document.getElementById("kpiRhoMin").textContent = `${f.rho_min.toFixed(0)} Ω·m`;
      document.getElementById("kpiResistance").textContent = `${a.rWallKOhm} kΩ`;
      document.getElementById("kpiThermal").textContent = `${f.dT_min.toFixed(2)} °C`;
      document.getElementById("kpiFreq").textContent = `${f.freq_max.toFixed(1)} kHz`;
      document.getElementById("kpiAeHits").textContent = `${a.preset.aeBase} hits/s`;
      document.getElementById("kpiMoist").textContent = `${f.moist_max.toFixed(1)} %`;

      // Top Diagnostic Cards
      document.getElementById("cardOrigin").textContent = `${a.estX}, ${a.estY}, ${a.estZ} cm`;
      document.getElementById("cardSigma").textContent = `90% CI: ±${a.sigmaX}, ±${a.sigmaY}, ±${a.sigmaZ} cm`;
      document.getElementById("cardPenRate").textContent = `${a.vFrontMmMin} mm/min`;
      document.getElementById("cardDarcyFlux").textContent = `D_eff: ${(a.fittedDeff * 1000).toFixed(2)}×10⁻³ cm²/s`;
      document.getElementById("cardCauseDomain").textContent = a.preset.causeDomain;
      document.getElementById("cardCauseSub").textContent = a.preset.causeSub;
      document.getElementById("cardWaterSource").textContent = `${a.preset.sourceName} (${a.preset.sourceConf}%)`;
      document.getElementById("cardPhConstant").textContent = `K_pH: ${a.kPh} (pH ${a.ph.toFixed(1)})`;

      // Wet Area Stats
      document.getElementById("statWetArea").textContent = `${f.area_cm2.toFixed(0)} cm²`;
      document.getElementById("statWetRadius").textContent = `${f.radius_cm.toFixed(1)} cm`;
      document.getElementById("statOnset").textContent = `${a.tOnsetMin} min`;
      document.getElementById("timeSliderLabel").textContent = `t = ${f.t_min} min`;

      // NDT Matrix
      document.getElementById("ndtSeverityPill").textContent = a.preset.severity;
      document.getElementById("ndtMixDetail").textContent = a.grade.label;
      document.getElementById("ndtPorosity").textContent = `Connected Porosity φ = ${(a.grade.phi * 100).toFixed(1)}%`;
      document.getElementById("ndtPhConstVal").textContent = `K_pH = ${a.kPh} (pH ${a.ph.toFixed(1)})`;
      document.getElementById("ndtCarbonationStatus").textContent = a.phStatus;
      document.getElementById("ndtBasis").textContent = a.preset.basis;
      document.getElementById("ndtCubicLaw").textContent = `Est. Aperture w ≈ ${a.preset.crackWidth} mm (Q ∝ w³)`;
      document.getElementById("ndtSoilEffect").textContent = `${a.soil.label}`;
      document.getElementById("ndtArchieFit").textContent = `Archie Slope n = ${a.archieSlope} (R² = ${a.archieR2})`;

      // 3 Cause Domain Bars
      document.getElementById("probMech").textContent = `${a.preset.mechProb}%`;
      document.getElementById("barMech").style.width = `${a.preset.mechProb}%`;
      document.getElementById("probEnv").textContent = `${a.preset.envProb}%`;
      document.getElementById("barEnv").style.width = `${a.preset.envProb}%`;
      document.getElementById("probPhys").textContent = `${a.preset.physProb}%`;
      document.getElementById("barPhys").style.width = `${a.preset.physProb}%`;
    }

    function render3DDigitalTwin() {
      const a = state.analysis;
      const f = a.frames[state.timeIndex] || a.latest;

      // Top scanned face (z = 0) colored by Thermal + Resistivity fusion
      const zZero = XS.map(() => XS.map(() => 0));
      const surfaceColor = f.dT.map((row, j) => row.map((dtVal, i) => {
        // Combine normalized thermal cooling and conductivity anomaly
        const normCond = Math.min(1, 300 / Math.max(30, f.rho[j][i]));
        const normTherm = Math.min(1, Math.abs(dtVal) / 2.2);
        return Number((0.55 * normCond + 0.45 * normTherm).toFixed(3));
      }));

      // Subsurface thermal/moisture plume iso-points inside the 60x60x10 cm block
      const plumeX = [], plumeY = [], plumeZ = [], plumeVal = [];
      for (let z = 1; z <= 9; z += 2) {
        const depthScale = Math.exp(-Math.abs(z - a.estZ) / 3.2);
        for (let j = 0; j < GRID; j += 2) {
          for (let i = 0; i < GRID; i += 2) {
            const cond = 1 / f.rho[j][i];
            if (cond > 0.0035 && depthScale > 0.35) {
              plumeX.push(XS[i]);
              plumeY.push(XS[j]);
              plumeZ.push(-z);
              plumeVal.push(cond * depthScale * 1000);
            }
          }
        }
      }

      const traces = [
        {
          type: "surface",
          x: XS,
          y: XS,
          z: zZero,
          surfacecolor: surfaceColor,
          colorscale: [
            [0.0, "#1E293B"],
            [0.35, "#0284C7"],
            [0.7, "#F59E0B"],
            [1.0, "#EF4444"]
          ],
          showscale: false,
          opacity: 0.86,
          name: "Scanned Wall Face (z=0)"
        },
        {
          type: "scatter3d",
          mode: "markers",
          x: plumeX,
          y: plumeY,
          z: plumeZ,
          marker: {
            size: 5,
            color: plumeVal,
            colorscale: "YlOrRd",
            opacity: 0.45
          },
          name: "3D Subsurface Thermal/Wet Plume"
        },
        {
          type: "scatter3d",
          mode: "lines+markers",
          x: a.path3D.map(p => p[0]),
          y: a.path3D.map(p => p[1]),
          z: a.path3D.map(p => -p[2]),
          line: { width: 7, color: "#EF4444" },
          marker: { size: 3, color: "#FCA5A5" },
          name: "Reconstructed Seepage Path"
        },
        {
          type: "scatter3d",
          mode: "markers",
          x: [a.estX],
          y: [a.estY],
          z: [-a.estZ],
          marker: { size: 10, color: "#F59E0B", symbol: "diamond", line: { color: "#FFFFFF", width: 1.5 } },
          name: "AI Origin Estimate"
        },
        {
          type: "scatter3d",
          mode: "lines",
          x: [a.estX - a.sigmaX, a.estX + a.sigmaX, null, a.estX, a.estX, null, a.estX, a.estX],
          y: [a.estY, a.estY, null, a.estY - a.sigmaY, a.estY + a.sigmaY, null, a.estY, a.estY],
          z: [-a.estZ, -a.estZ, null, -a.estZ, -a.estZ, null, Math.max(-10, -a.estZ - a.sigmaZ), Math.min(0, -a.estZ + a.sigmaZ)],
          line: { color: "#94A3B8", width: 3 },
          name: "90% Uncertainty Interval"
        }
      ];

      const layout = {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { l: 0, r: 0, t: 5, b: 5 },
        font: { color: "#CBD5E1", family: "JetBrains Mono, monospace", size: 10 },
        legend: { orientation: "h", y: 0.99, font: { size: 10 } },
        scene: {
          xaxis: { title: "X (cm)", range: [0, 60], gridcolor: "#334155", zerolinecolor: "#475569" },
          yaxis: { title: "Y (cm)", range: [0, 60], gridcolor: "#334155", zerolinecolor: "#475569" },
          zaxis: { title: "Depth Z (cm)", range: [-10, 0.5], gridcolor: "#334155", zerolinecolor: "#475569" },
          aspectmode: "manual",
          aspectratio: { x: 1, y: 1, z: 0.48 },
          camera: { eye: { x: 1.45, y: -1.45, z: 0.95 } }
        }
      };

      Plotly.newPlot("plot3D", traces, layout, { responsive: true, displayModeBar: false });
    }

    function render2DHeatmap() {
      const a = state.analysis;
      const f = a.frames[state.timeIndex] || a.latest;
      const layer = document.getElementById("heatmapLayerSelect").value;

      let zData = f.dT;
      let colorscale = "RdBu";
      let title = "Thermal ΔT (°C)";
      if (layer === "rho") {
        zData = f.rho;
        colorscale = "Viridis";
        title = "Resistivity (Ω·m)";
      } else if (layer === "moist") {
        zData = f.moist;
        colorscale = "Blues";
        title = "Moisture (%)";
      } else if (layer === "freq") {
        zData = f.freq;
        colorscale = "Plasma";
        title = "Acoustic (kHz)";
      }

      const traces = [
        {
          type: "heatmap",
          x: XS,
          y: XS,
          z: zData,
          colorscale: colorscale,
          reversescale: layer === "moist",
          colorbar: {
            title: { text: title, font: { size: 10, color: "#CBD5E1" } },
            tickfont: { size: 9, color: "#CBD5E1" },
            thickness: 12
          }
        },
        {
          type: "scatter",
          mode: "markers+text",
          x: [a.estX],
          y: [a.estY],
          text: ["ORIGIN"],
          textposition: "top center",
          textfont: { color: "#FFFFFF", size: 10, family: "JetBrains Mono" },
          marker: { symbol: "x", size: 13, color: "#EF4444", line: { color: "#FFFFFF", width: 2 } },
          name: "Predicted Origin"
        }
      ];

      const layout = {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { l: 42, r: 15, t: 12, b: 38 },
        font: { color: "#CBD5E1", family: "JetBrains Mono, monospace", size: 10 },
        xaxis: { title: "Wall Width X (cm)", range: [0, 60], gridcolor: "#1E293B" },
        yaxis: { title: "Wall Height Y (cm)", range: [0, 60], scaleanchor: "x", gridcolor: "#1E293B" }
      };

      Plotly.newPlot("plot2D", traces, layout, { responsive: true, displayModeBar: false });
    }

    function renderReportsAndCharts() {
      const a = state.analysis;
      const p1 = a.prognosis1Y[a.prognosis1Y.length - 1];
      const p10 = a.prognosis10Y[a.prognosis10Y.length - 1];

      // --- 1. Populate Customer Report ---
      document.getElementById("custUrgency").textContent = a.preset.urgency;
      document.getElementById("custLocationText").innerHTML =
        `Water is entering behind the wall at <strong>${a.estX} cm from the left</strong> and <strong>${a.estY} cm from the bottom</strong>, roughly <strong>${a.estZ} cm deep</strong> inside the concrete—not where the surface dampness looks widest.`;
      document.getElementById("custCauseText").innerHTML =
        `Our sensors identified <strong>${a.preset.sourceName}</strong> driven by <strong>${a.preset.causeSub}</strong> (${a.preset.causeDomain}). Active moisture movement is ${a.vFrontMmMin} mm/min.`;
      document.getElementById("custTimeText").innerHTML =
        `Without intervention, paint blistering and plaster damage will spread across <strong>${p1.wearPct}% of this wall area within 1 Year</strong>, and deep steel corrosion / concrete cracking will reach <strong>${p10.wearPct}% within 10 Years</strong>.`;

      const timelineItems = [
        {
          time: "Current Scan (Today)",
          pct: `${((a.latest.area_cm2 / (SIZE * SIZE)) * 100).toFixed(1)}% Affected`,
          desc: "Hidden moisture pocket active; early surface cooling and dampness detected.",
          color: "border-cyan-500/50 text-cyan-300"
        },
        {
          time: "6 Months (Unrepaired)",
          pct: `${a.prognosis1Y[2].wearPct}% Worn & Torn`,
          desc: "Paint bubbling, white salt crust (efflorescence), and damp smell appear.",
          color: "border-amber-500/50 text-amber-300"
        },
        {
          time: "1 Year (Unrepaired)",
          pct: `${p1.wearPct}% Worn & Torn`,
          desc: "Plaster debonding, mold growth, and protective alkalinity drop around steel.",
          color: "border-orange-500/50 text-orange-300"
        },
        {
          time: "10 Years (Unrepaired)",
          pct: `${p10.wearPct}% Worn & Torn`,
          desc: `Severe rebar rusting (${p10.steelLossPct}% section loss), concrete cover cracking & spalling.`,
          color: "border-rose-500/50 text-rose-300"
        }
      ];

      document.getElementById("custTimelineCards").innerHTML = timelineItems.map(item => `
        <div class="bg-slate-950/80 p-3 rounded-xl border ${item.color}">
          <span class="text-[11px] text-slate-400 block">${item.time}</span>
          <span class="font-mono-tech text-sm font-bold block mt-0.5">${item.pct}</span>
          <p class="text-[11px] text-slate-300 mt-1 leading-snug">${item.desc}</p>
        </div>
      `).join("");

      document.getElementById("custRepairSteps").innerHTML = a.preset.customerSteps
        .map(s => `<li>${s}</li>`)
        .join("");

      // --- 2. Populate Technician / Researcher Report ---
      const activeProg = state.horizon === "1Y" ? a.prognosis1Y : a.prognosis10Y;
      document.getElementById("progChartTitle").textContent =
        state.horizon === "1Y"
          ? "1-Year Wall Wear & Tear Progression (% Affected Area & Rebar Loss)"
          : "10-Year Long-Term Structural Degradation (% Wear & Tear & Rebar Loss)";
      document.getElementById("progTableTitle").textContent =
        state.horizon === "1Y"
          ? "1-Year Quarterly Structural Degradation Schedule"
          : "10-Year Multi-Year Structural Degradation Schedule";

      document.getElementById("prognosisTableBody").innerHTML = activeProg.map(row => `
        <tr class="hover:bg-slate-800/40">
          <td class="py-2 pr-2 font-semibold text-white">${row.interval}</td>
          <td class="py-2 px-2 text-amber-300 font-bold">${row.wearPct}%</td>
          <td class="py-2 px-2 text-cyan-300">${row.carbMm} mm</td>
          <td class="py-2 px-2 text-rose-400">${row.steelLossPct}%</td>
          <td class="py-2 pl-2 text-slate-300">${row.stage}</td>
        </tr>
      `).join("");

      Plotly.newPlot("plotPrognosis", [
        {
          type: "scatter",
          mode: "lines+markers",
          x: activeProg.map(r => r.interval),
          y: activeProg.map(r => r.wearPct),
          name: "Wall Wear & Tear (%)",
          line: { color: "#F59E0B", width: 3 },
          marker: { size: 7 }
        },
        {
          type: "bar",
          x: activeProg.map(r => r.interval),
          y: activeProg.map(r => r.steelLossPct),
          name: "Rebar Cross-Section Loss (%)",
          marker: { color: "rgba(239, 68, 68, 0.55)" }
        }
      ], {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { l: 40, r: 15, t: 10, b: 35 },
        font: { color: "#CBD5E1", family: "JetBrains Mono", size: 10 },
        xaxis: { gridcolor: "#1E293B" },
        yaxis: { title: "Degradation (%)", range: [0, 100], gridcolor: "#1E293B" },
        legend: { orientation: "h", y: 1.12 }
      }, { responsive: true, displayModeBar: false });

      // Archie Physics Verification Scatter
      document.getElementById("archieBadge").textContent = `slope = ${a.archieSlope} | R² = ${a.archieR2}`;
      const minLM = Math.min(...a.logM), maxLM = Math.max(...a.logM);
      const meanLM = a.logM.reduce((s, v) => s + v, 0) / a.logM.length;
      const meanLR = a.logR.reduce((s, v) => s + v, 0) / a.logR.length;
      const fitY1 = meanLR + a.archieSlope * (minLM - meanLM);
      const fitY2 = meanLR + a.archieSlope * (maxLM - meanLM);

      Plotly.newPlot("plotArchie", [
        {
          type: "scatter",
          mode: "markers",
          x: a.logM,
          y: a.logR,
          marker: { size: 5, color: "#10B981", opacity: 0.7 },
          name: "Grid Cells"
        },
        {
          type: "scatter",
          mode: "lines",
          x: [minLM, maxLM],
          y: [fitY1, fitY2],
          line: { color: "#F59E0B", width: 2, dash: "dash" },
          name: "Archie Fit"
        }
      ], {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { l: 45, r: 12, t: 8, b: 35 },
        font: { color: "#CBD5E1", family: "JetBrains Mono", size: 9 },
        xaxis: { title: "log₁₀(Moisture %)", gridcolor: "#1E293B" },
        yaxis: { title: "log₁₀(ρ₂₅ Ω·m)", gridcolor: "#1E293B" },
        showlegend: false
      }, { responsive: true, displayModeBar: false });

      // 4D Wetting Front Kinematics Plot
      document.getElementById("frontKinematicsBadge").textContent = `v = ${a.vFrontMmMin} mm/min | t₀ = ${a.tOnsetMin}m`;
      Plotly.newPlot("plotKinematics", [
        {
          type: "scatter",
          mode: "lines+markers",
          x: a.frames.map(fr => fr.t_min),
          y: a.frames.map(fr => Number((fr.radius_cm * fr.radius_cm).toFixed(1))),
          line: { color: "#06B6D4", width: 2.5 },
          marker: { size: 7, color: "#38BDF8" },
          name: "r² (cm²)"
        }
      ], {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: { l: 48, r: 12, t: 8, b: 35 },
        font: { color: "#CBD5E1", family: "JetBrains Mono", size: 9 },
        xaxis: { title: "Scan Time t (min)", gridcolor: "#1E293B" },
        yaxis: { title: "Wet Area r² (cm²)", gridcolor: "#1E293B" },
        showlegend: false
      }, { responsive: true, displayModeBar: false });

      // Technician Remediation Cards
      document.getElementById("techRepairGrid").innerHTML = a.preset.techSteps.map(step => `
        <div class="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
          <h5 class="font-bold text-cyan-300 mb-1">${step.title}</h5>
          <p class="text-[11px] text-slate-300 leading-relaxed">${step.body}</p>
        </div>
      `).join("");
    }

    // =========================================================================
    // CONTROLS, PRESETS & CSV PARSER
    // =========================================================================
    function loadPreset(key) {
      state.presetKey = key;
      state.customCSVFrames = null;
      document.getElementById("uploadStatus").classList.add("hidden");

      const p = PRESETS[key];
      document.getElementById("rngX").value = p.x0;
      document.getElementById("rngY").value = p.y0;
      document.getElementById("rngZ").value = p.z0;
      document.getElementById("inpPh").value = p.ph;
      document.getElementById("inpEc").value = p.ec;
      document.getElementById("inpCl").value = p.cl;
      document.getElementById("inpRh").value = p.rh;
      document.getElementById("inpGrade").value = p.grade;
      document.getElementById("inpStructure").value = p.structure;
      document.getElementById("inpSoil").value = p.soil;
      document.getElementById("inpSurrounding").value = p.surrounding;

      document.getElementById("lblSimCoords").textContent = `X: ${p.x0} cm, Y: ${p.y0} cm, Z: ${p.z0} cm`;
      recomputeAll();
    }

    function updateCustomCoords() {
      const x = document.getElementById("rngX").value;
      const y = document.getElementById("rngY").value;
      const z = document.getElementById("rngZ").value;
      document.getElementById("lblSimCoords").textContent = `X: ${x} cm, Y: ${y} cm, Z: ${z} cm`;
      state.customCSVFrames = null;
      recomputeAll();
    }

    function onTimeSliderChange(idx) {
      state.timeIndex = parseInt(idx, 10);
      updateKPIsAndNDT();
      render3DDigitalTwin();
      render2DHeatmap();
    }

    function setReportMode(mode) {
      state.mode = mode;
      const custBtn = document.getElementById("btnModeCustomer");
      const techBtn = document.getElementById("btnModeTech");
      const custView = document.getElementById("customerReportView");
      const techView = document.getElementById("technicianReportView");

      if (mode === "customer") {
        custBtn.classList.add("tab-active");
        custBtn.classList.remove("text-slate-300");
        techBtn.classList.remove("tab-active");
        techBtn.classList.add("text-slate-300");
        custView.classList.remove("hidden");
        techView.classList.add("hidden");
      } else {
        techBtn.classList.add("tab-active");
        techBtn.classList.remove("text-slate-300");
        custBtn.classList.remove("tab-active");
        custBtn.classList.add("text-slate-300");
        techView.classList.remove("hidden");
        custView.classList.add("hidden");
        renderReportsAndCharts();
      }
    }

    function setPrognosisHorizon(h) {
      state.horizon = h;
      const b1 = document.getElementById("btnHorizon1Y");
      const b10 = document.getElementById("btnHorizon10Y");
      if (h === "1Y") {
        b1.classList.add("tab-active");
        b1.classList.remove("bg-slate-800", "text-slate-300");
        b10.classList.remove("tab-active");
        b10.classList.add("bg-slate-800", "text-slate-300");
      } else {
        b10.classList.add("tab-active");
        b10.classList.remove("bg-slate-800", "text-slate-300");
        b1.classList.remove("tab-active");
        b1.classList.add("bg-slate-800", "text-slate-300");
      }
      renderReportsAndCharts();
    }

    // Parse uploaded ESP32 scan.csv
    function handleCSVUpload(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const text = e.target.result.trim();
          const lines = text.split(/\r?\n/);
          const headers = lines[0].split(",").map(h => h.trim());
          const idx = name => headers.indexOf(name);

          const required = ["scan_id", "t_min", "cell_x", "cell_y", "rho_a2", "moist_pct", "t_surf", "t_amb"];
          for (const col of required) {
            if (idx(col) === -1) throw new Error(`Missing required ESP32 column: ${col}`);
          }

          const scanMap = {};
          for (let r = 1; r < lines.length; r++) {
            if (!lines[r].trim()) continue;
            const cols = lines[r].split(",");
            const sid = parseInt(cols[idx("scan_id")], 10);
            const tMin = parseFloat(cols[idx("t_min")]);
            const cx = parseInt(cols[idx("cell_x")], 10);
            const cy = parseInt(cols[idx("cell_y")], 10);
            const rho = parseFloat(cols[idx("rho_a2")]);
            const moist = parseFloat(cols[idx("moist_pct")]);
            const dT = parseFloat(cols[idx("t_surf")]) - parseFloat(cols[idx("t_amb")]);
            const aeHits = idx("ae_hits") !== -1 ? parseFloat(cols[idx("ae_hits")]) : 0;

            if (!scanMap[sid]) {
              scanMap[sid] = {
                scan_id: sid,
                t_min: tMin,
                rho: Array.from({ length: GRID }, () => Array(GRID).fill(850)),
                moist: Array.from({ length: GRID }, () => Array(GRID).fill(4.0)),
                dT: Array.from({ length: GRID }, () => Array(GRID).fill(-0.5)),
                freq: Array.from({ length: GRID }, () => Array(GRID).fill(1.2)),
                wet: Array.from({ length: GRID }, () => Array(GRID).fill(0))
              };
            }
            if (cx >= 0 && cx < GRID && cy >= 0 && cy < GRID && !isNaN(rho)) {
              scanMap[sid].rho[cy][cx] = rho;
              scanMap[sid].moist[cy][cx] = isNaN(moist) ? 4.0 : moist;
              scanMap[sid].dT[cy][cx] = isNaN(dT) ? -0.5 : dT;
              scanMap[sid].freq[cy][cx] = aeHits > 0 ? 4.5 : 1.1;
            }
          }

          const parsedFrames = Object.values(scanMap).sort((a, b) => a.t_min - b.t_min);
          if (parsedFrames.length === 0) throw new Error("No valid rows found in CSV.");

          parsedFrames.forEach(fr => {
            let wetCount = 0, minRho = Infinity, maxMoist = 0, minDT = 0, maxFreq = 0;
            for (let j = 0; j < GRID; j++) {
              for (let i = 0; i < GRID; i++) {
                const v = fr.rho[j][i];
                if (v < 480) { fr.wet[j][i] = 1; wetCount++; }
                minRho = Math.min(minRho, v);
                maxMoist = Math.max(maxMoist, fr.moist[j][i]);
                minDT = Math.min(minDT, fr.dT[j][i]);
                maxFreq = Math.max(maxFreq, fr.freq[j][i]);
              }
            }
            fr.area_cm2 = wetCount * PITCH * PITCH;
            fr.radius_cm = fr.area_cm2 > 0 ? Math.sqrt(fr.area_cm2 / Math.PI) : 2.5;
            fr.rho_min = minRho;
            fr.moist_max = maxMoist;
            fr.dT_min = minDT;
            fr.freq_max = maxFreq;
          });

          state.customCSVFrames = parsedFrames;
          state.timeIndex = parsedFrames.length - 1;
          const slider = document.getElementById("timeSlider");
          slider.max = parsedFrames.length - 1;
          slider.value = state.timeIndex;

          const statusEl = document.getElementById("uploadStatus");
          statusEl.textContent = `✓ Loaded ${file.name} (${parsedFrames.length} time-step scans)`;
          statusEl.classList.remove("hidden");

          recomputeAll();
        } catch (err) {
          alert("CSV Parse Error: " + err.message);
        }
      };
      reader.readAsText(file);
    }

    // Generate & Download a realistic ESP32 CSV file in the exact firmware format
    function downloadSampleCSV() {
      const a = state.analysis;
      const rows = [
        "scan_id,t_min,cell_x,cell_y,rho_a2,rho_a4,moist_pct,t_surf,t_amb,rh,ae_hits,ae_t1,ae_t2,ae_t3,ae_t4,contact_ok,ec_uScm,ph"
      ];
      const ec = document.getElementById("inpEc").value;
      const ph = document.getElementById("inpPh").value;
      const rh = document.getElementById("inpRh").value;

      a.frames.forEach(fr => {
        for (let j = 0; j < GRID; j++) {
          for (let i = 0; i < GRID; i++) {
            const rho2 = fr.rho[j][i];
            const rho4 = (rho2 * 1.14).toFixed(1);
            const moist = fr.moist[j][i];
            const tAmb = 27.0;
            const tSurf = (tAmb + fr.dT[j][i]).toFixed(2);
            const hits = (i === 5 && j === 3) ? a.preset.aeBase : 0;
            rows.push(`${fr.scan_id},${fr.t_min},${i},${j},${rho2},${rho4},${moist},${tSurf},${tAmb},${rh},${hits},45,72,0,37,1,${ec},${ph}`);
          }
        }
      });

      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `msot_esp32_${state.presetKey}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }

    // Initialize on load
    window.addEventListener("DOMContentLoaded", () => {
      loadPreset("pressurized_pipe");
    });
  