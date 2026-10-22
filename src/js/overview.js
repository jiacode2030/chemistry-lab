
/* ---------------- Overview: a molecule you can spin, and the module cards ---------------- */
(function hero(){
  const cv=$('#hero-canvas'),seg=$('#hero-mol'),cap=$('#hero-cap');if(!cv)return;
  const order=[['h2o','H₂O'],['ch4','CH₄'],['nh3','NH₃'],['co2','CO₂'],['c2h4','C₂H₄']];
  const INFO={h2o:'Water is bent: 104.5°. Two lone pairs crowd the bonds closer than the tetrahedral 109.5°.',ch4:'Methane is tetrahedral: four bonds as far apart as they can get, 109.5°.',
    nh3:'Ammonia is a trigonal pyramid: one lone pair squeezes the H–N–H angle to 107°.',co2:'Carbon dioxide is linear: two double bonds, 180°, and the two polar bonds cancel.',c2h4:'Ethene is flat: each carbon has three regions of electron density, about 120° apart.'};
  let cur='h2o',t0=0,tNow=0;
  seg.innerHTML=order.map(([k,l],i)=>`<button type="button" data-k="${k}" aria-pressed="${i===0}">${l}</button>`).join('');
  segBind('hero-mol','k',k=>{cur=k;t0=tNow;cap.textContent=INFO[k]+' Drag to spin it.';v.render();});
  cap.textContent=INFO.h2o+' Drag to spin it.';
  const ease=x=>{x=clamp(x,0,1);const c=1.70158;return 1+(c+1)*Math.pow(x-1,3)+c*Math.pow(x-1,2);};
  const v=view3d(cv,{yaw:-.8,pitch:.32,dist:5.6,target:[0,0,0],min:3,max:12,height:w=>clamp(w*.78,250,350),scene:(S,t)=>{
    tNow=t==null?0:t;const m=MOLS[cur];const c=m.atoms.reduce((a,x)=>V3.add(a,x.p),[0,0,0]).map(x=>x/m.atoms.length);
    const mol={atoms:m.atoms.map(a=>({e:a.e,p:V3.sub(a.p,c)})),bonds:m.bonds};
    drawMol(S,mol,{t:tNow,vib:REDUCE?0:.03,scale:1.35,pop:i=>REDUCE?1:ease((tNow-t0)*1.8-i*.12)});
    S.text([0,0,-1.9],m.name,T.muted,MONO);}});
  drawers.overview=()=>v.render();
})();

function renderMods(){const solved=store('chem-solved')||{};const cnt={};let k=0;PROBS.forEach(p=>{const c=cnt[p.topic]=cnt[p.topic]||[0,0];c[1]++;if(solved[p.id])c[0]++;});
  $('#modgrid').innerHTML=ROADMAP.map(g=>`<div class="modgroup"><div class="eyebrow">${g.w}</div><h3 class="gtitle">${g.name}</h3><div class="modgrid-inner">${g.ids.map(id=>{const m=MODS[id],c=cnt[id]||[0,0];
    return `<a class="mod" href="#${id}" style="--i:${Math.min(k++,14)}">${GLYPH[id]?`<span class="glyph" aria-hidden="true"><svg viewBox="0 0 24 24">${GLYPH[id]}</svg></span>`:''}<h3>${m.t}</h3><p>${m.d}</p><div class="row"><span class="tag ${apTag(id)}">${m.ap}</span><span class="prog">${c[1]?`${c[0]}/${c[1]} solved`:''}</span></div></a>`;}).join('')}${g.soon.map(id=>{const m=MODS[id];
    return `<div class="mod soon" aria-disabled="true"><h3>${m.t}</h3><p>${m.d}</p><div class="row"><span class="tag na">Coming soon</span></div></div>`;}).join('')}</div></div>`).join('');}
(function ovStatic(){
  const first=GROUPS.length?GROUPS[0].ids[0]:null,st=$('#ov-start');if(first&&st){st.href='#'+first;st.textContent='Start with '+MODS[first].t;}
  $('#ov-map').innerHTML=ROADMAP.map(g=>`<tr><td>${g.w==='Optional'?'—':g.w.replace('Unit ','')}</td><td>${g.name}</td><td>${g.ids.map(id=>`<a href="#${id}">${MODS[id].t}</a>`).concat(g.soon.map(id=>`<span class="small">${MODS[id].t} (soon)</span>`)).join(', ')}</td></tr>`).join('');
})();

/* ---------------- Side menu: one link per module, grouped by unit, then the review pages ---------------- */
(function buildNav(){let nh='<a href="#overview" data-view="overview">Overview</a>',sh='<option value="overview">Overview</option>';
  GROUPS.forEach(g=>{nh+=`<div class="grp">${g.w==='Optional'?'Optional':g.w} · ${g.name}</div>`;sh+=`<optgroup label="${g.w==='Optional'?'Optional':g.w} · ${g.name}">`;
    g.ids.forEach(id=>{nh+=`<a href="#${id}" data-view="${id}">${MODS[id].t}</a>`;sh+=`<option value="${id}">${MODS[id].t}</option>`;});sh+='</optgroup>';});
  const REV=[['practice','Practice set'],['methods','Which tool?'],['exam','Exam review'],['review','Review my mistakes'],['frq','FRQ practice']];
  nh+='<div class="grp">Review</div>'+REV.map(([v,t])=>`<a href="#${v}" data-view="${v}">${t}</a>`).join('');
  sh+='<optgroup label="Review">'+REV.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')+'</optgroup>';
  $('#nav').innerHTML=nh;const sel=$('#navsel');sel.innerHTML=sh;sel.addEventListener('change',()=>{location.hash=sel.value;});})();
