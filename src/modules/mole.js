
/* ---------------- Moles & molar mass ---------------- */
const ATM={H:1.008,He:4.003,Li:6.94,Be:9.012,B:10.81,C:12.01,N:14.01,O:16.00,F:19.00,Ne:20.18,Na:22.99,Mg:24.31,Al:26.98,Si:28.09,P:30.97,S:32.07,Cl:35.45,Ar:39.95,K:39.10,Ca:40.08,Fe:55.85,Cu:63.55,Zn:65.38,Br:79.90,Ag:107.87,I:126.90,Ba:137.33,Pb:207.2};
/* molar mass of a formula string like Ca(OH)2 or C6H12O6, using the atomic masses above (the two-decimal values used on the AP sheet) */
function molarMass(f){const st=[{}];let i=0;
  while(i<f.length){const ch=f[i];if(ch==='('){st.push({});i++;}
    else if(ch===')'){i++;let n='';while(/\d/.test(f[i]||''))n+=f[i++];const top=st.pop(),k=n?+n:1;Object.keys(top).forEach(e=>st[st.length-1][e]=(st[st.length-1][e]||0)+top[e]*k);}
    else{const m=f.slice(i).match(/^[A-Z][a-z]?/);const e=m[0];i+=e.length;let n='';while(/\d/.test(f[i]||''))n+=f[i++];const top=st[st.length-1];top[e]=(top[e]||0)+(n?+n:1);}}
  const c=st[0];return {M:Object.keys(c).reduce((a,e)=>a+ATM[e]*c[e],0),count:c};}
(function mole(){
  const cv=$('#ml-canvas');if(!cv)return;
  const SUB=[['C','C',12.01],['Al','Al',26.98],['Fe','Fe',55.85],['Cu','Cu',63.55],['H₂O','H2O',null],['NaCl','NaCl',null],['C₆H₁₂O₆','C6H12O6',null],['CO₂','CO2',null]].map(([n,f,m])=>({n,f,M:m||molarMass(f).M}));
  const opts=SUB.map(s=>`<option value="${s.n}">${s.n} · ${s.M.toFixed(2)} g/mol</option>`).join('');$('#ml-a').innerHTML=opts;$('#ml-b').innerHTML=opts;$('#ml-a').value='C';$('#ml-b').value='NaCl';
  let mode='n',val=1,tilt=0,tgt=0;const dots={a:[],b:[]};const NA=6.022e23;
  const get=k=>SUB.find(s=>s.n===$(k).value);
  const amt=()=>{const A=get('#ml-a'),B=get('#ml-b');return mode==='n'?{nA:val,nB:val,mA:val*A.M,mB:val*B.M}:{nA:val/A.M,nB:val/B.M,mA:val,mB:val};};
  /* dots: one dot = 1/6 mol, so 6 dots per mole; the number per pan comes from the amount */
  function layout(){const q=amt();[['a',q.nA],['b',q.nB]].forEach(([k,n])=>{const N=Math.max(1,Math.round(n*6));const a=dots[k];while(a.length<N)a.push({x:Math.random(),y:Math.random(),p:Math.random()*6.28});a.length=N;});}
  const sim=sim2d(cv,{h:w=>clamp(w*.55,280,360),step(dt){const q=amt(),d=clamp((q.mB-q.mA)/Math.max(q.mA,q.mB,1)*.38,-.38,.38);tgt=d;tilt+=(tgt-tilt)*Math.min(1,dt*4);},
    draw(ctx,w,h,t){const q=amt(),A=get('#ml-a'),B=get('#ml-b'),cx=w/2,py=70,L=Math.min(w*.36,230);
      /* stand */
      ctx.fillStyle=T.line;ctx.beginPath();ctx.moveTo(cx-40,h-18);ctx.lineTo(cx+40,h-18);ctx.lineTo(cx+5,py+10);ctx.lineTo(cx-5,py+10);ctx.fill();
      ctx.strokeStyle=T.ink;ctx.lineWidth=5;ctx.lineCap='round';
      const ax=cx-Math.cos(tilt)*L,ay=py+Math.sin(tilt)*L*-1,bx=cx+Math.cos(tilt)*L,by=py+Math.sin(tilt)*L;/* positive tilt: right pan heavier (goes down) */
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();dot(ctx,cx,py,7,T.ink);
      [[ax,ay,'a',T.cx,A,q.nA,q.mA],[bx,by,'b',T.hot,B,q.nB,q.mB]].forEach(([x,y,k,col,S,n,m])=>{
        ctx.strokeStyle=T.muted;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-34,y+58);ctx.moveTo(x,y);ctx.lineTo(x+34,y+58);ctx.stroke();
        ctx.fillStyle=alpha(T.sunk,.9);ctx.strokeStyle=T.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-52,y+58);ctx.lineTo(x+52,y+58);ctx.stroke();
        const a=dots[k];const cols=Math.max(4,Math.ceil(Math.sqrt(a.length*1.6)));a.forEach((d,i)=>{const gx=(i%cols)-(cols-1)/2,gy=Math.floor(i/cols);const px=x+gx*9+Math.sin(t*3+d.p)*1.2,py2=y+54-6-gy*9+Math.cos(t*2.6+d.p)*1.2;ball2(ctx,px,py2,4.2,col);});
        label(ctx,S.n,x,y+82,col,'center','top','700 14px "IBM Plex Sans",sans-serif');label(ctx,`${fmt(m,2)} g`,x,y+100,T.ink,'center','top',MONO);});
      label(ctx,'one dot = 1/6 mole = '+sci(NA/6,2)+' particles',w/2,h-4,T.muted,'center','bottom',MONO);
      if(Math.abs(q.mA-q.mB)<1e-6)label(ctx,'balanced: equal masses',cx,py-40,T.cv,'center','middle','600 13px "IBM Plex Sans",sans-serif');}});
  drawers.mole=()=>sim.render();
  function upd(){const q=amt();layout();setText('ml-na',fmt(q.nA,3)+' mol');setText('ml-ma',fmt(q.mA,2)+' g');setText('ml-nb',fmt(q.nB,3)+' mol');setText('ml-mb',fmt(q.mB,2)+' g');
    setText('ml-np',mode==='n'?sci(q.nA*NA,3):`${sci(q.nA*NA,2)} (left), ${sci(q.nB*NA,2)} (right)`);sim.render();}
  function setMode(m){mode=m;const el=$('#ml-v');if(m==='n'){el.min=.25;el.max=3;el.step=.25;el.value=1;val=1;$('#ml-vl').textContent='Moles on each pan';}else{el.min=2;el.max=60;el.step=1;el.value=24;val=24;$('#ml-vl').textContent='Mass on each pan';}$('#ml-v-out').textContent=m==='n'?'1 mol':'24 g';upd();}
  segBind('ml-mode','k',m=>setMode(m));
  bindRange('ml-v',x=>mode==='n'?fmt(x,2)+' mol':x+' g',x=>{val=x;upd();},false);
  ['ml-a','ml-b'].forEach(id=>$('#'+id).addEventListener('change',upd));
  setMode('n');
  TIPS['ml-a']=TIPS['ml-b']='Compare the molar masses in the list: the heavier the particle, the more a mole of it weighs.';
  TIPS['ml-v']=()=>mode==='n'?'Same number of particles on both pans: the beam tilts because the particles have different masses.':'Same mass on both pans: the beam stays level, but the lighter particles are more numerous.';
  GLOSS['mole']='6.022 × 10²³ particles. One mole of a substance has a mass in grams equal to its molar mass.';
  GLOSS['molar mass']='The mass of one mole of a substance, in g/mol. For an element it is the atomic mass on the periodic table.';
  TT.mole='Use the dozen analogy, then break it: a dozen eggs and a dozen bowling balls have the same number but not the same mass. Have students predict which pan is heavier before they press anything.';
})();
(function(){
  const COMP=['H2O','CO2','NH3','CH4','C2H5OH','NaOH','CaCO3','H2SO4','Na2CO3','Al2O3','C6H12O6','Ca(OH)2','MgCl2','C3H8'];
  const nice=f=>f.replace(/(\d+)/g,d=>[...d].map(c=>'₀₁₂₃₄₅₆₇₈₉'[c]).join(''));
  const MSTR='(atomic masses: H 1.008, C 12.01, N 14.01, O 16.00, Na 22.99, Mg 24.31, Al 26.98, S 32.07, Cl 35.45, Ca 40.08)';
  PROBS.push({id:'mole-M',topic:'mole',title:'Molar mass of a compound',gen(){const f=pick(COMP),{M,count}=molarMass(f);
    return {q:`What is the molar mass of ${nice(f)}? ${MSTR}`,ans:M,unit:'g/mol',tol:.005,hint:'Add the atomic masses, counting each atom as many times as the formula says (and multiplying anything in parentheses).',
      sol:`${Object.entries(count).map(([e,n])=>`${n}(${ATM[e]})`).join(' + ')} = <b>${M.toFixed(2)} g/mol</b>.`};}});
  PROBS.push({id:'mole-n',topic:'mole',title:'Grams to moles',gen(){const f=pick(COMP),{M}=molarMass(f),g=ri(5,200)/ (pick([1,2,5])),n=g/M;
    return {q:`How many moles are in ${g.toFixed(1)} g of ${nice(f)}? ${MSTR}`,ans:n,unit:'mol',tol:.02,hint:'n = m / M. Find M first by adding atomic masses.',
      sol:`M = ${M.toFixed(2)} g/mol, so n = ${g.toFixed(1)} g ÷ ${M.toFixed(2)} g/mol = <b>${fmt(n,3)} mol</b>.`};}});
  PROBS.push({id:'mole-atoms',topic:'mole',title:'Counting atoms in a sample',gen(){const T=[['C6H12O6','O',6,'oxygen'],['H2O','H',2,'hydrogen'],['C2H5OH','H',6,'hydrogen'],['Al2O3','O',3,'oxygen'],['Ca(OH)2','H',2,'hydrogen'],['CaCO3','O',3,'oxygen']],[f,el,k,name]=pick(T),{M}=molarMass(f),g=ri(2,50),N=g/M*k*6.022e23;
    return {q:`How many ${name} atoms are in ${g.toFixed(1)} g of ${nice(f)}? Give your answer in scientific notation (like 3.2e23). ${MSTR}`,ans:N,unit:'atoms',tol:.02,hint:'Grams to moles of compound, then multiply by the number of that atom in one formula unit, then by Avogadro\'s number.',
      sol:`n = ${g.toFixed(1)} g ÷ ${M.toFixed(2)} g/mol = ${fmt(g/M,4)} mol; each formula unit has ${k} ${el}, so ${fmt(g/M*k,4)} mol of ${el}; × 6.022 × 10²³ = <b>${sci(N,3)} atoms</b>.`};}});
})();
