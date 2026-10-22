
/* ---------------- VSEPR: balloon lab + molecule explorer ---------------- */
(function vsepr(){
  const cvB=$('#vb-canvas'),cvM=$('#vm-canvas');if(!cvB||!cvM)return;
  const rand3=()=>V3.norm([Math.random()-.5,Math.random()-.5,Math.random()-.5]);
  const SHAPE_N={2:'Linear',3:'Trigonal planar',4:'Tetrahedral',5:'Trigonal bipyramidal',6:'Octahedral'};
  const SHAPE={'2,0':'linear','3,0':'trigonal planar','3,1':'bent','4,0':'tetrahedral','4,1':'trigonal pyramidal','4,2':'bent','5,0':'trigonal bipyramidal','5,1':'seesaw','5,2':'T-shaped','5,3':'linear','6,0':'octahedral','6,1':'square pyramidal','6,2':'square planar'};
  const EGEO={2:'linear',3:'trigonal planar',4:'tetrahedral',5:'trigonal bipyramidal',6:'octahedral'};
  const sub=n=>String(n).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
  const tick=(S,c,u,v)=>{};
  let lastT=null;const dtOf=t=>{if(t==null)return 0;const d=lastT==null?0:Math.min(.05,Math.max(0,t-lastT));lastT=t;return d;};
  const stepSim=(sim,dt)=>{if(!dt)return;let k=0;while(dt>1e-6&&k++<6){const h=Math.min(dt,1/90);sim.step(h);dt-=h;}};
  const palette=()=>[T.cx,T.cv,T.ca,T.hot,T.ce,T.ink];

  /* ---------- Lab 1: n balloons ---------- */
  let nB=4,simB=null,angB=0,lastReadB='';
  function newB(kick){const dirs=Array.from({length:nB},rand3);simB=new DomainSim(dirs,Array(nB).fill(1));if(REDUCE){simB.settle();}}
  function neighbors(dir){const n=dir.length,ch=[];let mn=9;for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=V3.len(V3.sub(dir[i],dir[j]));ch.push([i,j,d]);mn=Math.min(mn,d);}
    return ch.filter(c=>c[2]<=mn*1.25);}
  function lobeAt(S,c,ax,len,rad,col,al,t,i){const w=1+.035*Math.sin((t||0)*3+i*1.3);S.lobe(c,ax,len,rad*w,col,al);}
  const vB=view3d(cvB,{yaw:-.9,pitch:.38,dist:5.2,target:[0,0,0],min:3,max:12,height:w=>clamp(w*.62,270,430),scene:(S,t)=>{
    stepSim(simB,dtOf(t));const dir=simB.dir,col=palette();
    dir.forEach((d,i)=>lobeAt(S,[0,0,0],d,1.7,.6,col[i%6],.5,t,i));
    S.atom([0,0,0],.2,T.ink);
    const nb=neighbors(dir);
    if($('#vb-hull').checked)nb.forEach(([i,j])=>S.line(V3.mul(dir[i],1.7),V3.mul(dir[j],1.7),T.muted,1.4,[4,4]));
    let best=null,bi=0;nb.forEach(c=>{const a=angleBetween(dir[c[0]],dir[c[1]]);if(!best||a<best){best=a;bi=c;}});
    if($('#vb-angle').checked&&best){const [i,j]=bi,a=dir[i],b=dir[j];S.arc([0,0,0],a,b,1.0,T.hot,2.4);const m=V3.norm(V3.add(a,b));if(V3.len(V3.add(a,b))>1e-3)S.text(V3.mul(m,1.35),best.toFixed(1)+'°',T.hot,'600 13px "IBM Plex Mono",monospace');else S.text([0,0,.6],'180°',T.hot,'600 13px "IBM Plex Mono",monospace');}
    const angs=[...new Set(nb.map(c=>angleBetween(dir[c[0]],dir[c[1]]).toFixed(1)))].sort((x,y)=>x-y);
    const txt=angs.map(a=>a+'°').join(' and ');if(txt!==lastReadB){lastReadB=txt;setText('vb-r-ang',txt);}
  }});
  function updB(){setText('vb-r-n',nB);setText('vb-r-shape',SHAPE_N[nB]+(nB>4?' (extension)':''));lastReadB='';}
  bindRange('vb-n',x=>x+' balloons',x=>{nB=x;newB();updB();vB.render();});
  $('#vb-angle').addEventListener('change',()=>vB.render());$('#vb-hull').addEventListener('change',()=>vB.render());
  $('#vb-shake').addEventListener('click',()=>{simB.kick(.9);if(REDUCE)simB.settle();vB.render();});
  newB();updB();
  TIPS['vb-n']=el=>({2:'Two balloons: as far apart as possible is 180°, a straight line.',3:'Three balloons spread flat into a triangle, 120° apart.',4:'Four balloons can\'t stay flat. Pointing at the corners of a tetrahedron gives 109.5°.',5:'Five balloons: three flat around the middle (120°) and one up, one down (90° to the middle ones). Beyond many courses.',6:'Six balloons point along ±x, ±y and ±z, all 90° from their neighbors. Beyond many courses.'})[+el.value];
  TIPS['vb-angle']='The orange arc is the angle between the two closest balloons.';
  TIPS['vb-hull']='The dashed outline joins neighboring balloon tips. It shows the shape the regions make.';
  KEYS['vb-canvas']=['Move the slider, then press Shake and watch them settle.',[['cv','each color is one region of electron density'],['hot','angle between the closest two','dash'],['muted','outline of the shape','dash']]];

  /* ---------- Lab 2: molecules ---------- */
  const L=(e,order,len)=>({e,order,len});
  const MOLEC=[
    {id:'co2',f:'CO₂',n:'Carbon dioxide',c:'C',lig:[L('O',2,1.16),L('O',2,1.16)],lp:0,txt:'180°',info:'Each double bond is one region of electron density, so carbon has 2 regions and they point opposite ways.'},
    {id:'hcn',f:'HCN',n:'Hydrogen cyanide',c:'C',lig:[L('H',1,1.07),L('N',3,1.16)],lp:0,txt:'180°',info:'A triple bond is still one region, so carbon has 2 regions: linear.'},
    {id:'bf3',f:'BF₃',n:'Boron trifluoride',c:'B',lig:[L('F',1,1.31),L('F',1,1.31),L('F',1,1.31)],lp:0,txt:'120°',info:'Boron ends up with only six electrons around it, an exception to the octet rule.'},
    {id:'h2co',f:'CH₂O',n:'Formaldehyde',c:'C',lig:[L('O',2,1.21),L('H',1,1.10),L('H',1,1.10)],lp:0,txt:'H–C–H ≈ 116°, H–C=O ≈ 122°',info:'Three regions: the C=O double bond counts once. The double bond is a bit bigger than a single bond, so the H–C–H angle is a little under 120°.'},
    {id:'so2',f:'SO₂',n:'Sulfur dioxide',c:'S',lig:[L('O',1.5,1.43),L('O',1.5,1.43)],lp:1,txt:'≈ 119°',info:'Two resonance forms, so each S–O bond is between single and double (drawn as one solid and one thin line).'},
    {id:'ch4',f:'CH₄',n:'Methane',c:'C',lig:[L('H',1,1.09),L('H',1,1.09),L('H',1,1.09),L('H',1,1.09)],lp:0,txt:'109.5°',info:'Four identical bonds: the perfect tetrahedron.'},
    {id:'nh4',f:'NH₄⁺',n:'Ammonium ion',c:'N',lig:[L('H',1,1.03),L('H',1,1.03),L('H',1,1.03),L('H',1,1.03)],lp:0,txt:'109.5°',charge:'+',info:'The lone pair of NH₃ is now shared with an H⁺ in a fourth bond, so all four regions are alike: tetrahedral.'},
    {id:'nh3',f:'NH₃',n:'Ammonia',c:'N',lig:[L('H',1,1.01),L('H',1,1.01),L('H',1,1.01)],lp:1,txt:'≈ 107°',info:'One lone pair is the fattest balloon, squeezing the three N–H bonds together.'},
    {id:'h2o',f:'H₂O',n:'Water',c:'O',lig:[L('H',1,.96),L('H',1,.96)],lp:2,txt:'104.5°',info:'Two lone pairs squeeze the O–H bonds even more than in ammonia.'},
    {id:'ccl4',f:'CCl₄',n:'Carbon tetrachloride',c:'C',lig:[L('Cl',1,1.77),L('Cl',1,1.77),L('Cl',1,1.77),L('Cl',1,1.77)],lp:0,txt:'109.5°',info:'Polar bonds, but four identical dipoles in a tetrahedron cancel exactly.'},
    {id:'ch2cl2',f:'CH₂Cl₂',n:'Dichloromethane',c:'C',lig:[L('Cl',1,1.77),L('Cl',1,1.77),L('H',1,1.09),L('H',1,1.09)],lp:0,txt:'≈ 112°',info:'Tetrahedral, but the outer atoms are not identical, so the dipoles do not cancel. (The real angles are slightly distorted; the model draws ideal ones.)'},
    {id:'pcl5',f:'PCl₅',n:'Phosphorus pentachloride',ext:1,c:'P',lig:Array.from({length:5},()=>L('Cl',1,2.05)),lp:0,txt:'90° and 120°',info:'Extension. Drawn with ideal angles.'},
    {id:'sf4',f:'SF₄',n:'Sulfur tetrafluoride',ext:1,c:'S',lig:Array.from({length:4},()=>L('F',1,1.6)),lp:1,txt:'≈ 173° and ≈ 102° (measured)',info:'Extension. The lone pair sits in the middle plane, where it has the most room. Drawn with ideal angles; the real axial and equatorial angles are a little smaller.'},
    {id:'clf3',f:'ClF₃',n:'Chlorine trifluoride',ext:1,c:'Cl',lig:Array.from({length:3},()=>L('F',1,1.7)),lp:2,txt:'≈ 87.5° (measured)',info:'Extension. Both lone pairs sit in the middle plane. Drawn with ideal angles.'},
    {id:'xef2',f:'XeF₂',n:'Xenon difluoride',ext:1,c:'Xe',lig:[L('F',1,2.0),L('F',1,2.0)],lp:3,txt:'180°',info:'Extension. Three lone pairs sit in the middle plane, 120° apart, and the two F atoms are left on the axis.'},
    {id:'sf6',f:'SF₆',n:'Sulfur hexafluoride',ext:1,c:'S',lig:Array.from({length:6},()=>L('F',1,1.56)),lp:0,txt:'90°',info:'Extension. Six identical bonds along ±x, ±y, ±z.'},
    {id:'brf5',f:'BrF₅',n:'Bromine pentafluoride',ext:1,c:'Br',lig:Array.from({length:5},()=>L('F',1,1.77)),lp:1,txt:'≈ 85° (measured)',info:'Extension. The lone pair takes one octahedral position; five F atoms form a square pyramid.'},
    {id:'xef4',f:'XeF₄',n:'Xenon tetrafluoride',ext:1,c:'Xe',lig:Array.from({length:4},()=>L('F',1,1.95)),lp:2,txt:'90°',info:'Extension. The two lone pairs sit opposite each other, above and below, leaving a flat square of F atoms.'}
  ];
  const sel=$('#vm-mol');
  const grp=[['2 regions of electron density',m=>m.lig.length+m.lp===2],['3 regions',m=>m.lig.length+m.lp===3],['4 regions',m=>m.lig.length+m.lp===4],['Extension: 5 and 6 regions',m=>m.ext]];
  sel.innerHTML=grp.map(([l,f])=>`<optgroup label="${l}">${MOLEC.filter(f).map(m=>`<option value="${m.id}">${m.f} · ${m.n}</option>`).join('')}</optgroup>`).join('');
  sel.value='h2o';
  /* build the domain list: ligands + lone pairs placed on the ideal sites (lone pairs take the roomiest sites first) */
  function build(m){const n=m.lig.length+m.lp,sites=IDEAL[n];let lpSites;
    if(n===5)lpSites=[2,3,4].slice(0,m.lp);else if(n===6)lpSites=[5,4].slice(0,m.lp);else lpSites=Array.from({length:m.lp},(_,i)=>n-1-i);
    const ligSites=sites.map((_,i)=>i).filter(i=>!lpSites.includes(i));
    const dom=Array(n).fill(null);m.lig.forEach((l,k)=>dom[ligSites[k]]={type:'b',l});lpSites.forEach(i=>dom[i]={type:'lp'});
    const w=dom.map(d=>d.type==='lp'?lpWeight(n):1);return {m,n,dom,w};}
  let S0=null,sim=null,tSwitch=0,angIdx=0,tNow=0,pairs=[],vmView=null;
  function load(id,jiggle=.55){const m=MOLEC.find(x=>x.id===id)||MOLEC[0];S0=build(m);const sites=IDEAL[S0.n];sim=new DomainSim(sites,S0.w);sim.kick(jiggle);tSwitch=tNow;angIdx=0;if(REDUCE){sim.settle();}refresh();if(vmView)vmView.setHome({dist:4.4+1.9*Math.max(...m.lig.map(l=>l.len))});}
  const en=e=>ATOM[e].en;
  function dipoles(){const cen=MOLEC.find(x=>x===S0.m).c;let net=[0,0,0];const per=[];S0.dom.forEach((d,i)=>{if(d.type!=='b'){per.push(null);return;}const dEN=en(d.l.e)-en(cen),v=V3.mul(sim.dir[i],dEN);per.push(dEN);net=V3.add(net,v);});return {net,per};}
  function lists(){/* distinct bond angles between ligand pairs, by rounded model angle */
    const idx=S0.dom.map((d,i)=>d.type==='b'?i:-1).filter(i=>i>=0),seen=new Map();for(let a=0;a<idx.length;a++)for(let b=a+1;b<idx.length;b++){const ang=angleBetween(sim.dir[idx[a]],sim.dir[idx[b]]),key=Math.round(ang/2);if(!seen.has(key))seen.set(key,[idx[a],idx[b]]);}
    return [...seen.values()].sort((p,q)=>angleBetween(sim.dir[p[0]],sim.dir[p[1]])-angleBetween(sim.dir[q[0]],sim.dir[q[1]]));}
  function refresh(){const m=S0.m,nl=m.lig.length;const axe='AX'+(nl>1?sub(nl):'')+(m.lp?'E'+(m.lp>1?sub(m.lp):''):'');
    setHTML('vm-name',`${m.n}, ${m.f}${m.ext?'<small>extension</small>':''}`);
    setText('vm-r-axe',`${S0.n}  (${nl} + ${m.lp})  ${axe}`);setText('vm-r-eg',EGEO[S0.n]);setText('vm-r-shape',SHAPE[S0.n+','+m.lp]);setText('vm-r-txt',m.txt);
    setText('vm-info',`${m.f}: ${S0.n} regions of electron density (${nl} bonded atom${nl>1?'s':''}${m.lp?` + ${m.lp} lone pair${m.lp>1?'s':''}`:''}), so the electron geometry is ${EGEO[S0.n]} and the molecular shape is ${SHAPE[S0.n+','+m.lp]}. ${m.info||''}`);
    const dp=dipoles();const netLen=V3.len(dp.net),polar=netLen>.12;
    const ion=!!m.charge;const el=$('#vm-r-pol');
    el.innerHTML=ion?'<span class="chip">ion (charged)</span>':`<span class="chip ${polar?'no':'yes'}">${polar?'polar':'nonpolar'}</span>`;
    const els=[...new Set([m.c,...m.lig.map(l=>l.e)])];$('#vm-key').innerHTML=els.map(e=>`<span><i style="--k:${atomCol(e)}"></i>${e} · ${ATOM[e].n}</span>`).join('')+`<span><i style="--k:var(--ce)"></i>lone pair</span>`;
    pairs=[];}
  /* q > 0: electron-rich (partly negative, red); q < 0: electron-poor (partly positive, blue) */
  function chgCol(base,q){if(Math.abs(q)<.2)return base;const k=clamp(Math.abs(q)/1.6,0,1),tgt=q>0?'#E5484D':'#4C7DFF';return mix(base,tgt,.35+.55*k);}
  function mix(a,b,k){const h=c=>{c=c.slice(1);return [0,2,4].map(i=>parseInt(c.slice(i,i+2),16));},A=h(a),B=h(b);return '#'+A.map((x,i)=>Math.round(x+(B[i]-x)*k).toString(16).padStart(2,'0')).join('');}
  const vM=view3d(cvM,{yaw:-.8,pitch:.3,dist:5.4,target:[0,0,0],min:3,max:14,height:w=>clamp(w*.62,290,450),scene:(S,t)=>{
    tNow=t==null?0:t;stepSim(sim,dtOf(t));const m=S0.m,dir=sim.dir,cen=m.c,sc=1,age=tNow-tSwitch;
    const showD=$('#vm-dom').checked,showA=$('#vm-ang').checked,showDip=$('#vm-dip').checked,showQ=$('#vm-chg').checked;
    const dp=dipoles(),pop=i=>REDUCE?1:clamp(age*2.2-i*.1,0,1.1);
    /* partial charge of each atom (arbitrary scale): more electronegative ligands pull electrons */
    const qLig=S0.dom.map(d=>d.type==='b'?en(d.l.e)-en(cen):0),qCen=-qLig.reduce((a,b)=>a+b,0);
    const bcol=m.id==='nh4'?atomCol('N'):atomCol(cen);
    let lpN=0;
    S0.dom.forEach((d,i)=>{const dv=dir[i];
      if(d.type==='lp'){if(showD)S.lobe([0,0,0],dv,Math.max(.3,1.25*pop(i)),.62,T.ce,.5);lpN++;return;}
      const p=V3.mul(dv,d.l.len*sc*pop(i)),lc=showQ?chgCol(atomCol(d.l.e),qLig[i]*1.6):atomCol(d.l.e),cc=showQ?chgCol(bcol,qCen):bcol;
      if(showD)S.lobe([0,0,0],dv,Math.max(.4,d.l.len*.92*pop(i)),.5,T.cx,.3);
      S.bond([0,0,0],p,.1,cc,lc,d.l.order,.17);
      S.atom(p,ATOM[d.l.e].r*1.15*Math.min(1,pop(i)),lc);
      if(showQ&&Math.abs(qLig[i])>=.25)S.text(V3.add(p,V3.mul(dv,.55)),qLig[i]>0?'δ−':'δ+',qLig[i]>0?T.bad:T.cx,'600 13px "IBM Plex Sans",sans-serif');
      if(showDip&&Math.abs(qLig[i])>.05){const dd=V3.mul(dv,qLig[i]>0?1:-1),a=V3.mul(dv,d.l.len*.28),b=V3.mul(dv,d.l.len*.78);qLig[i]>0?S.arrow(V3.add(a,[0,0,.28]),V3.add(b,[0,0,.28]),T.hot,3):S.arrow(V3.add(b,[0,0,.28]),V3.add(a,[0,0,.28]),T.hot,3);}
    });
    S.atom([0,0,0],ATOM[cen].r*1.2,showQ?chgCol(bcol,qCen*1.6):bcol);
    if(showQ&&Math.abs(qCen)>=.25)S.text([0,0,ATOM[cen].r*1.2+.45],qCen>0?'δ−':'δ+',qCen>0?T.bad:T.cx,'600 13px "IBM Plex Sans",sans-serif');
    if(showQ&&m.charge)S.text([0,0,-ATOM[cen].r*1.2-.5],'overall '+m.charge,T.muted,MONO);
    if(showDip){const nl=V3.len(dp.net);if(nl>.12){const u=V3.norm(dp.net),len=Math.min(2.4,.7+nl*.55);S.arrow(V3.mul(u,-.3),V3.mul(u,len),T.ca,5,'net dipole');}}
    /* a bond angle: arc between two ligand directions */
    const pl=lists();if(showA&&pl.length){const pr=pl[angIdx%pl.length],a=dir[pr[0]],b=dir[pr[1]],ang=angleBetween(a,b);S.arc([0,0,0],a,b,.85,T.hot,2.6);const mid=V3.add(a,b);
      S.text(V3.len(mid)>1e-3?V3.mul(V3.norm(mid),1.15):[0,0,.9],ang.toFixed(1)+'°',T.hot,'600 13px "IBM Plex Mono",monospace');
      const w=$('#vm-r-model');const s=pl.map(q=>angleBetween(dir[q[0]],dir[q[1]]).toFixed(1)+'°').join(' · ');if(w.textContent!==s)w.textContent=s;}
    else{const w=$('#vm-r-model');const s=pl.length?pl.map(q=>angleBetween(dir[q[0]],dir[q[1]]).toFixed(1)+'°').join(' · '):'—';if(w.textContent!==s)w.textContent=s;}
  }});
  vmView=vM;
  sel.addEventListener('change',()=>{load(sel.value);vM.render();});
  ['vm-dom','vm-ang','vm-dip','vm-chg'].forEach(id=>$('#'+id).addEventListener('change',()=>vM.render()));
  $('#vm-next').addEventListener('click',()=>{angIdx++;$('#vm-ang').checked=true;vM.render();});
  $('#vm-shake').addEventListener('click',()=>{sim.kick(.7);if(REDUCE)sim.settle();vM.render();});
  load('h2o');
  TIPS['vm-mol']=el=>{const m=MOLEC.find(x=>x.id===el.value);return m?`${m.f}: ${m.lig.length+m.lp} regions of electron density, ${m.lp} lone pair${m.lp===1?'':'s'}. Spin it, then look at the readout.`:'';};
  TIPS['vm-dom']='Blue balloons are bonding regions, gold ones are lone pairs. Turn them off to see just the atoms (the molecular shape).';
  TIPS['vm-ang']='The orange arc shows a bond angle in this model. "Next angle" cycles through the different angles when there is more than one.';
  TIPS['vm-dip']='Each orange arrow points toward the more electronegative atom. The magenta arrow is the sum: if it vanishes, the molecule is nonpolar.';
  TIPS['vm-chg']='Red means a partly negative atom (δ−), blue partly positive (δ+). The pulling is toward the more electronegative atom.';
  KEYS['vm-canvas']=['Pick a molecule, drag to spin it, then flip the switches.',[['cx','bonding region'],['ce','lone pair'],['hot','bond angle · bond dipole'],['ca','net dipole (if any)']]];
  GLOSS['region of electron density']='A bond (single, double or triple) or a lone pair around a central atom. Each counts once.';
  GLOSS['lone pair']='Two valence electrons that belong to one atom and are not shared in a bond.';
  GLOSS['tetrahedron']='A pyramid with four triangular faces. Its corners are 109.5° apart as seen from the center.';
  GLOSS['dipole']='A pair of equal and opposite partial charges, drawn as an arrow toward the negative end.';
  GLOSS['electronegative']='Pulling shared electrons strongly toward itself.';
  GLOSS['electronegativity']='How strongly an atom pulls shared electrons toward itself. Fluorine is the highest.';
  TT.vsepr='Bring balloons or toothpick-and-marshmallow kits. Ask students to predict the angle before showing it, then the polarity before turning on the dipoles. The most productive confusion: electron geometry versus molecular shape. Ask "if you could only see the atoms, what shape would you see?"';
})();

/* Practice problems for VSEPR */
(function(){
  const SP=[ /* species: central atom regions, lone pairs on the central atom, shape, polar (null for ions) */
    ['CO₂',2,0,'linear',false],['CS₂',2,0,'linear',false],['HCN',2,0,'linear',true],['BF₃',3,0,'trigonal planar',false],['SO₃',3,0,'trigonal planar',false],['CH₂O',3,0,'trigonal planar',true],
    ['SO₂',3,1,'bent',true],['NO₂⁻',3,1,'bent',null],['CH₄',4,0,'tetrahedral',false],['CCl₄',4,0,'tetrahedral',false],['CH₂Cl₂',4,0,'tetrahedral',true],['NH₄⁺',4,0,'tetrahedral',null],
    ['NH₃',4,1,'trigonal pyramidal',true],['PCl₃',4,1,'trigonal pyramidal',true],['ClO₃⁻',4,1,'trigonal pyramidal',null],['H₂O',4,2,'bent',true],['OF₂',4,2,'bent',true],['SCl₂',4,2,'bent',true]];
  const SHAPES=['linear','trigonal planar','bent','tetrahedral','trigonal pyramidal'];
  const shuffle=a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
  PROBS.push({id:'vsepr-count',topic:'vsepr',title:'Regions of electron density',gen(){const s=pick(SP),[f,n,lp]=s;
    return {q:`How many regions of electron density surround the central atom of ${f}? (A double or triple bond counts as one region.)`,ans:n,unit:'regions',abs:.01,hint:'Draw the Lewis structure. Count bonded atoms around the central atom, plus its lone pairs. Each multiple bond is one region.',
      sol:`The central atom of ${f} has ${n-lp} bonded atom${n-lp>1?'s':''} and ${lp} lone pair${lp===1?'':'s'}: ${n-lp} + ${lp} = <b>${n} regions</b>.`};}});
  PROBS.push({id:'vsepr-shape',topic:'vsepr',title:'Predict the molecular shape',gen(){const s=pick(SP),[f,n,lp,shape]=s;const wrong=shuffle(SHAPES.filter(x=>x!==shape)).slice(0,3);const ch=shuffle([shape,...wrong]);
    return {q:`What is the molecular shape of ${f}?`,choices:ch,ans:ch.indexOf(shape),hint:'Count the regions of electron density around the central atom, spread them out, then name the shape using only the atoms.',
      sol:`${n} regions (${n-lp} bonded + ${lp} lone pair${lp===1?'':'s'}) give a ${['','','linear','trigonal planar','tetrahedral'][n]} electron geometry. Using only the atoms, the molecular shape is <b>${shape}</b>.`};}});
  PROBS.push({id:'vsepr-polar',topic:'vsepr',title:'Polar or nonpolar?',gen(){const s=pick(SP.filter(x=>x[4]!==null)),[f,n,lp,shape,pol]=s;const ch=['polar','nonpolar'];
    return {q:`Is the molecule ${f} polar or nonpolar?`,choices:ch,ans:pol?0:1,hint:'First find the shape. Then ask whether the bond dipoles point in directions that cancel.',
      sol:`${f} is ${shape}. ${pol?'The bond dipoles (or the lone pair) leave a net dipole because the shape is not symmetric with identical outer atoms.':'All the outer atoms are identical and arranged symmetrically, so the bond dipoles cancel.'} It is <b>${pol?'polar':'nonpolar'}</b>.`};}});
})();
