
/* ---------------- Reference drawer: equations, periodic table, solubility ---------------- */
(function reference(){const fs=$('#fs'),btn=$('#fs-btn'),scrim=$('#fs-scrim'),tabs=$$('#fs-tabs button');
  $$('.body > div > *',fs).forEach((el,i)=>el.style.setProperty('--i',Math.min(i,16)));
  function tab(k){tabs.forEach(b=>b.setAttribute('aria-pressed',b.dataset.tab===k));$$('[data-pane]',fs).forEach(p=>p.hidden=p.dataset.pane!==k);fs.classList.toggle('wide',k==='pt');store('chem-fs-tab',k);const b=$('.body',fs);if(b)b.scrollTop=0;}
  function set(o,k){if(k)tab(k);fs.classList.toggle('open',o);fs.setAttribute('aria-hidden',!o);btn.setAttribute('aria-expanded',o);$('.fs-lbl',btn).textContent=o?'Hide reference':'Reference';scrim.classList.toggle('on',o);setTimeout(()=>redraw(),280);}
  tabs.forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
  btn.addEventListener('click',()=>set(!fs.classList.contains('open')));$('#fs-close').addEventListener('click',()=>set(false));scrim.addEventListener('click',()=>set(false));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&fs.classList.contains('open'))set(false);});
  /* modules can open a sheet: <button data-ref="pt"> */
  document.addEventListener('click',e=>{const b=e.target.closest('[data-ref]');if(b){e.preventDefault();set(true,b.dataset.ref);}});
  const saved=store('chem-fs-tab');tab(saved&&['eq','pt','sol'].includes(saved)?saved:'eq');
})();

/* ---------------- Interactive periodic table (tap an element) ---------------- */
(function periodic(){const host=$('#fs-pt');if(!host||typeof ELEMENTS==='undefined')return;
  host.innerHTML=`<p class="fine" style="margin-top:8px">Tap or click an element for its mass, electronegativity, electron configuration and common ions. Masses are rounded; the table on the AP exam is the one to trust for values. Electron configurations list orbitals in filling order, like the course does.</p>
    <div class="seg" id="pt-mode" role="group" aria-label="Color the table by"><button type="button" data-m="cat" aria-pressed="true">Color by category</button><button type="button" data-m="en" aria-pressed="false">Color by electronegativity</button></div>
    <div class="ptwrap" style="overflow-x:auto;padding:8px 2px 4px"><div class="ptgrid" id="pt-grid" role="group" aria-label="Periodic table"></div></div>
    <div class="ptleg" id="pt-leg"></div><div class="ptinfo" id="pt-info" aria-live="polite"></div>`;
  const grid=$('#pt-grid'),info=$('#pt-info'),leg=$('#pt-leg');let mode='cat',cur=8;
  const CAT={'alkali metal':'#E76F51','alkaline earth metal':'#E9A23B','transition metal':'#3E7BDC','post-transition metal':'#2FA57A','metalloid':'#8E6BD0','nonmetal':'#3DB5C9','halogen':'#D6568F','noble gas':'#7C8AA0','lanthanide':'#5E9C3F','actinide':'#B5651D','unknown':'#98A2B3'};
  const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));
  const heat=en=>{if(en==null)return '#98A2B3';const k=clamp((en-.7)/(3.98-.7),0,1),a=hex('#3E7BDC'),b=hex('#E76F51');return '#'+a.map((x,i)=>Math.round(x+(b[i]-x)*k).toString(16).padStart(2,'0')).join('');};
  const col=e=>mode==='cat'?CAT[e.cat]:heat(e.en);
  grid.innerHTML=ELEMENTS.map(e=>`<button type="button" data-z="${e.Z}" style="grid-row:${e.row};grid-column:${e.col}" aria-label="${e.name}, atomic number ${e.Z}" aria-pressed="false"><small>${e.Z}</small><b>${e.sym}</b></button>`).join('')
    +`<div class="ptnote" style="grid-row:6;grid-column:3">57–71</div><div class="ptnote" style="grid-row:7;grid-column:3">89–103</div><div style="grid-row:8;grid-column:1;height:6px"></div>`;
  function paint(){$$('button',grid).forEach(b=>{const e=ELEMENTS[+b.dataset.z-1];b.style.setProperty('--pc',col(e));});
    leg.innerHTML=mode==='cat'?Object.entries(CAT).map(([k,c])=>`<span><i style="--pc:${c}"></i>${k}</span>`).join(''):'<span class="heatbar"><i></i></span><span class="small">electronegativity: low (blue) → high (orange); gray = no value</span>';}
  function show(Z){cur=Z;const e=ELEMENTS[Z-1];$$('button',grid).forEach(b=>b.setAttribute('aria-pressed',+b.dataset.z===Z));
    const val=e.group&&e.group<=2?e.group:e.group&&e.group>=13?e.group-10:null;
    info.innerHTML=`<div class="sym" style="color:${CAT[e.cat]}">${e.sym}</div><div><b style="font:600 18px var(--f-display)">${e.name}</b> <span class="small">· ${e.cat}</span></div><div class="small">${e.group?`Group ${e.group}, period ${e.period}`:`Period ${e.period}, ${e.cat}`}</div>
      <dl><dt>Atomic number</dt><dd>${e.Z}</dd><dt>Atomic mass</dt><dd>${e.mass} u</dd><dt>Electronegativity</dt><dd>${e.en==null?'—':e.en.toFixed(2)} (Pauling)</dd><dt>Configuration</dt><dd>${e.cfg}${e.pred?' (predicted)':''}</dd>${val!=null?`<dt>Valence electrons</dt><dd>${val}</dd>`:''}<dt>Common ions</dt><dd>${e.ions||'—'}</dd></dl>`;}
  grid.addEventListener('click',e=>{const b=e.target.closest('button[data-z]');if(b)show(+b.dataset.z);});
  grid.addEventListener('keydown',e=>{const d={ArrowRight:[0,1],ArrowLeft:[0,-1],ArrowDown:[1,0],ArrowUp:[-1,0]}[e.key];if(!d)return;const b=document.activeElement.closest&&document.activeElement.closest('button[data-z]');if(!b)return;
    const c=ELEMENTS[+b.dataset.z-1];let r=c.row+d[0],k=c.col+d[1];let t=ELEMENTS.find(x=>x.row===r&&x.col===k);if(!t&&d[0]){r+=d[0];t=ELEMENTS.find(x=>x.row===r&&x.col===k);}
    if(t){e.preventDefault();$(`button[data-z="${t.Z}"]`,grid).focus();}});
  segBind('pt-mode','m',m=>{mode=m;paint();});
  paint();show(8);
})();
