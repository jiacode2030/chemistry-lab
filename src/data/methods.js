/* Clue table and "which tool?" items for the Which-tool trainer. */
METHODS.clues.push(
 ['"how many grams / moles / molecules…"','The mole road: grams ↔ moles ↔ particles, using the balanced equation\'s coefficients'],
 ['Two reactant amounts given; "limiting", "theoretical yield", "percent yield"','Convert both to moles, compare with the mole ratio; the smaller predicted product amount limits'],
 ['Solution mixed or diluted; "what is the new concentration"','M₁V₁ = M₂V₂ for dilution; moles ÷ total volume after mixing'],
 ['Gas, with P, V, T or n','Ideal gas law PV = nRT (or combined gas law; partial pressures for mixtures)'],
 ['Photon, wavelength, frequency, energy of light','E = hν = hc/λ'],
 ['Spectrum with peaks; "binding energy"','Photoelectron spectrum: each peak = a subshell, height = electrons'],
 ['"Is the molecule polar?", "what shape?"','Lewis diagram → VSEPR shape → do the bond dipoles cancel?'],
 ['Compare boiling points, solubility or vapor pressure','Identify the strongest intermolecular force in each (dispersion, dipole, H-bond, ionic)'],
 ['Metal dropped in water; temperature change; coffee cup','q = mcΔT with q(lost) = −q(gained)'],
 ['Melting or boiling at constant temperature','q = mΔH(fus or vap): no temperature change'],
 ['Reaction is a sum of other reactions','Hess\'s law: reverse (flip sign), multiply (scale ΔH), add'],
 ['Formation enthalpies given','ΔH° = ΣnΔH°f(products) − ΣnΔH°f(reactants)'],
 ['Bond energies given','ΔH ≈ Σ(bonds broken) − Σ(bonds formed)'],
 ['Table of initial rates for different concentrations','Compare two trials that change one concentration; get the orders, then k'],
 ['"After how long…", "half-life", concentration vs time','Integrated rate law for the order (zero, first or second)'],
 ['Rate at two temperatures; activation energy','Arrhenius equation (two-point form)'],
 ['Mechanism with a "slow step"','Rate law of the slow step, with intermediates replaced using the fast steps'],
 ['"At equilibrium"; K given; starting amounts','K expression → ICE table → solve for x (check the 5% rule)'],
 ['A stress is applied to an equilibrium','Q vs K, or Le Châtelier (only temperature changes K)'],
 ['Strong acid or strong base; pH or pOH','Complete ionization: pH = −log c (count OH⁻ per formula unit for bases)'],
 ['Weak acid or base; Ka or Kb given','ICE table with Ka or Kb; x = [H₃O⁺] or [OH⁻]'],
 ['Solution contains a weak acid and its conjugate base','Buffer: Henderson–Hasselbalch (stoichiometry first if acid or base is added)'],
 ['Titration; "equivalence", "half-equivalence", "indicator"','Moles reacted, then the region of the curve; pH = pKa at half-equivalence'],
 ['Ksp, solubility, "will a precipitate form?"','Ksp expression; compare Q with Ksp after dilution; common-ion effect'],
 ['"Spontaneous?", ΔH and ΔS, temperature','ΔG = ΔH − TΔS (watch the J versus kJ)'],
 ['ΔG° and K, or Q and the direction','ΔG° = −RT ln K; ΔG = ΔG° + RT ln Q'],
 ['Two half-reactions, voltage, battery, anode and cathode','E°cell = E°cathode − E°anode; Nernst equation if concentrations differ from 1 M'],
 ['Plating, current and time','Faraday: q = It → mol e⁻ → mol product → mass']
);
(function(){
 const T={mole:'Mole road',lim:'Limiting reactant / percent yield',dil:'M₁V₁ = M₂V₂ (dilution)',gas:'Ideal gas law',mcdt:'q = mcΔT',ph:'q = mΔH (phase change)',hess:'Hess\'s law',hf:'ΔH° from ΔH°f sums',bond:'Bond energies',orders:'Compare trials (rate law)',integ:'Integrated rate law',arr:'Arrhenius equation',ice:'ICE table with K',qk:'Q versus K',strong:'pH = −log c',weak:'Weak-acid ICE (Ka)',hh:'Henderson–Hasselbalch',tit:'Titration regions',dG:'ΔG = ΔH − TΔS',dGK:'ΔG° = −RT ln K',cell:'E°cell and Nernst',far:'Faraday\'s law',ksp:'Ksp and Q',vsepr:'Lewis → VSEPR → polarity',imf:'Intermolecular forces'};
 const add=(q,right,wrong,explain,miss)=>{const opts=[right,...wrong];const order=[0,1,2,3].sort(()=>Math.random()-.5);const shuffled=order.map(i=>opts[i]);METHODS.items.push({q,opts:shuffled,correct:shuffled.indexOf(right),explain,miss});};
 add('How many grams of CO₂ form when 15.0 g of propane burns completely in excess oxygen?',T.mole,[T.lim,T.hf,T.gas],'One reactant amount is given and the other is in excess: grams → moles → mole ratio → grams.');
 add('5.0 g of N₂ and 5.0 g of H₂ react to make NH₃. What is the theoretical yield?',T.lim,[T.mole,T.ice,T.hh],'Two amounts are given, so find which one runs out first.');
 add('25.0 mL of 12.0 M HCl is diluted to 500.0 mL. What is the new concentration?',T.dil,[T.mole,T.strong,T.tit],'Dilution only changes volume, so moles stay the same: M₁V₁ = M₂V₂.');
 add('What is the pressure of 0.250 mol of gas in 3.00 L at 350 K?',T.gas,[T.mole,T.mcdt,T.qk],'P, V, n and T are all gas-law variables: PV = nRT.');
 add('A 45 g piece of metal at 95 °C is dropped into 120 g of water at 21 °C. What is the final temperature?',T.mcdt,[T.ph,T.hess,T.dG],'Heat lost by the metal equals heat gained by the water: set the two mcΔT terms equal.');
 add('How much energy is needed to turn 36 g of ice at 0 °C into water at 0 °C?',T.ph,[T.mcdt,T.hess,T.bond],'The temperature does not change during melting, so use q = mΔH (fusion), not mcΔT.');
 add('You know ΔH for C + O₂ → CO₂ and for CO + ½O₂ → CO₂. Find ΔH for C + ½O₂ → CO.',T.hess,[T.hf,T.bond,T.mcdt],'The target is a sum of the given reactions (one reversed): Hess\'s law.');
 add('Standard enthalpies of formation are listed for every species in a combustion. Find ΔH°.',T.hf,[T.hess,T.bond,T.dG],'Products minus reactants, each multiplied by its coefficient.');
 add('Rate is measured at three different concentrations of A and B. Find the rate law.',T.orders,[T.integ,T.arr,T.ice],'Compare two experiments in which only one concentration changes.');
 add('A first-order reaction has k = 0.025 s⁻¹. How much is left after 90 s?',T.integ,[T.orders,T.arr,T.qk],'A concentration at a later time needs the integrated rate law for that order.');
 add('The rate constant doubles when the temperature rises from 300 K to 310 K. Estimate the activation energy.',T.arr,[T.integ,T.dGK,T.orders],'Two rate constants at two temperatures: the two-point Arrhenius equation.');
 add('Initial 0.50 M N₂O₄; K = 0.36 for N₂O₄ ⇌ 2NO₂. What are the equilibrium concentrations?',T.ice,[T.qk,T.weak,T.dGK],'Starting amounts plus K: set up an ICE table.');
 add('A mixture has Q = 12 for a reaction with K = 4.0. Which way does it shift?',T.qk,[T.ice,T.dGK,T.hh],'Compare Q with K: Q > K means the reaction goes in reverse.');
 add('What is the pH of 0.0025 M Ba(OH)₂?',T.strong,[T.weak,T.hh,T.tit],'A strong base dissociates completely: [OH⁻] = 2 × 0.0025, then pOH → pH.');
 add('What is the pH of 0.10 M HF (Ka = 6.8×10⁻⁴)?',T.weak,[T.strong,T.hh,T.tit],'A weak acid ionizes only partly: use Ka with an ICE table.');
 add('You have 0.30 M CH₃COOH and 0.20 M CH₃COONa. What is the pH?',T.hh,[T.weak,T.strong,T.tit],'A weak acid with its conjugate base is a buffer: Henderson–Hasselbalch.');
 add('25.0 mL of weak acid is titrated; what is the pH after adding exactly half the volume needed to reach equivalence?',T.tit,[T.hh,T.weak,T.strong],'Think about the region of the curve; at half-equivalence [HA] = [A⁻], so pH = pKa.');
 add('Will a precipitate of PbI₂ form when 50.0 mL of 1.0×10⁻³ M Pb(NO₃)₂ is mixed with 50.0 mL of 2.0×10⁻³ M KI?',T.ksp,[T.ice,T.lim,T.dil],'Dilute each ion on mixing, compute Q, and compare it with Ksp.');
 add('For a reaction with ΔH = +50 kJ and ΔS = +120 J/K, find the temperature above which it is spontaneous.',T.dG,[T.dGK,T.hess,T.arr],'Set ΔG = ΔH − TΔS = 0 and solve for T (watch the units).');
 add('K = 2.5×10⁴ at 298 K. Find ΔG°.',T.dGK,[T.dG,T.ice,T.qk],'ΔG° and K are linked by ΔG° = −RT ln K.');
 add('Find the voltage of a Zn|Zn²⁺(0.10 M)||Cu²⁺(1.0 M)|Cu cell.',T.cell,[T.dG,T.far,T.hh],'Half-reaction potentials plus non-standard concentrations: E°cell then Nernst.');
 add('How many grams of copper plate onto a cathode when 3.00 A flows for 40.0 minutes through Cu²⁺?',T.far,[T.cell,T.mole,T.gas],'Current and time give charge, then moles of electrons, then moles of metal.');
 add('Is SF₄ polar or nonpolar?',T.vsepr,[T.imf,T.ice,T.hess],'Draw the Lewis diagram, predict the shape, and see whether the bond dipoles cancel.');
 add('Why does ethanol (CH₃CH₂OH) boil at a higher temperature than dimethyl ether (CH₃OCH₃)?',T.imf,[T.vsepr,T.mole,T.hess],'Same formula: compare the strongest intermolecular force (hydrogen bonding in ethanol).');
})();
