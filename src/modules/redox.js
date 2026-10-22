
/* ---------------- Oxidation states & redox ---------------- */
const RD_RX=[{m:'Zn',nM:2,ion:'Cu²⁺',q:2,prod:'Cu',mcol:'#7C8FA6',icol:'#3E7BDC',pcol:'#C77A3B',eq:'Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)',ox:'Zn: 0 → +2',re:'Cu²⁺: +2 → 0',ra:'Zn',oa:'Cu²⁺',half:['Zn → Zn²⁺ + 2e⁻','Cu²⁺ + 2e⁻ → Cu']},
  {m:'Mg',nM:2,ion:'H⁺',q:1,prod:'H₂',mcol:'#8FD1A2',icol:'#E5484D',pcol:'#EEF1F5',gas:true,eq:'Mg(s) + 2H⁺(aq) → Mg²⁺(aq) + H₂(g)',ox:'Mg: 0 → +2',re:'H⁺: +1 → 0',ra:'Mg',oa:'H⁺',half:['Mg → Mg²⁺ + 2e⁻','2H⁺ + 2e⁻ → H₂']},
  {m:'Cu',nM:2,ion:'Ag⁺',q:1,prod:'Ag',mcol:'#C77A3B',icol:'#B4BBC6',pcol:'#C0C6CF',eq:'Cu(s) + 2Ag⁺(aq) → Cu²⁺(aq) + 2Ag(s)',ox:'Cu: 0 → +2',re:'Ag⁺: +1 → 0',ra:'Cu',oa:'Ag⁺',half:['Cu → Cu²⁺ + 2e⁻','Ag⁺ + e⁻ → Ag (×2)']},
  {m:'Fe',nM:2,ion:'Cu²⁺',q:2,prod:'Cu',mcol:'#9B8F85',icol:'#3E7BDC',pcol:'#C77A3B',eq:'Fe(s) + Cu²⁺(aq) → Fe²⁺(aq) + Cu(s)',ox:'Fe: 0 → +2',re:'Cu²⁺: +2 → 0',ra:'Fe',oa:'Cu²⁺',half:['Fe → Fe²⁺ + 2e⁻','Cu²⁺ + 2e⁻ → Cu']}];
const ON=[ // species, atoms [element, count, known ox or null], charge
  ['h2o','H₂O',[['H',2,1],['O',1,-2]],0],['co2','CO₂',[['C',1,null],['O',2,-2]],0],['kmno4','KMnO₄',[['K',1,1],['Mn',1,null],['O',4,-2]],0],['h2so4','H₂SO₄',[['H',2,1],['S',1,null],['O',4,-2]],0],
  ['nh3','NH₃',[['N',1,null],['H',3,1]],0],['h2o2','H₂O₂',[['H',2,1],['O',2,-1]],0],['fe2o3','Fe₂O₃',[['Fe',2,null],['O',3,-2]],0],['cr2o7','Cr₂O₇²⁻',[['Cr',2,null],['O',7,-2]],-2],
  ['no3','NO₃⁻',[['N',1,null],['O',3,-2]],-1],['so4','SO₄²⁻',[['S',1,null],['O',4,-2]],-2],['mno2','MnO₂',[['Mn',1,null],['O',2,-2]],0],['ch4','CH₄',[['C',1,null],['H',4,1]],0],
  ['nah','NaH',[['Na',1,1],['H',1,-1]],0],['clo3','ClO₃⁻',[['Cl',1,null],['O',3,-2]],-1],['ch3oh','CH₃OH',[['C',1,null],['H',4,1],['O',1,-2]],0]];
const onSolve=sp=>{const k=sp[2].find(a=>a[2]===null),known=sp[2].reduce((s,a)=>s+(a[2]!==null?a[1]*a[2]:0),0);return k?(sp[3]-known)/k[1]:null;};
const onFmt=n=>n>0?'+'+n:n<0?'−'+Math.abs(n):'0';
(function redox(){
  const cv=$('#rd-canvas');if(!cv)return;
  const sel=$('#rd-sel');sel.innerHTML=RD_RX.map((r,i)=>`<option value="${i}">${r.eq}</option>`).join('');
  let W0=0,X=RD_RX[0],run=false,atoms=[],ions=[],es=[],dep=[],bub=[],tAcc=0,done=0,total=0;
  function reset(){X=RD_RX[+sel.value];run=false;const w=cv.clientWidth||500;W0=w;atoms=[];for(let i=0;i<5;i++)for(let j=0;j<8;j++)atoms.push({x:w*.2+i*14,y:70+j*18,gone:false});
    ions=[];total=6;for(let i=0;i<6;i++)ions.push({x:w*.4+Math.random()*(w*.55),y:100+Math.random()*180,vx:0,vy:0,used:false});es=[];dep=[];bub=[];tAcc=0;done=0;
    setText('rd-ox','—');setText('rd-re','—');setText('rd-ra','—');setText('rd-oa','—');$('#rd-eq').innerHTML='';sim.render();}
  const fixW=w=>{if(w!==W0){const k=w/W0;atoms.forEach(a=>a.x+=(w-W0)*.2);ions.forEach(i=>i.x*=k);dep.forEach(d=>d.x+=(w-W0)*.2);W0=w;}};
  const sim=sim2d(cv,{h:w=>clamp(w*.55,300,380),step(dt){const w=cv.clientWidth;fixW(w);if(!run)return;tAcc+=dt;
      if(tAcc>1.1&&done<total){tAcc=0;const surf=atoms.filter(a=>!a.gone&&a.x>w*.2+4*14-1);const pool=surf.length?surf:atoms.filter(a=>!a.gone);const a=pool[Math.floor(Math.random()*pool.length)];
        if(a){a.gone=true;const nI=X.nM/X.q;const sup=ions.filter(i=>!i.used);const take=sup.slice(0,nI);if(!take.length)return;
          for(let k=0;k<X.nM;k++)es.push({x:a.x,y:a.y,tx:take[Math.min(k,take.length-1)],life:0,k});take.forEach(i=>i.used=true);
          ions.push({x:a.x+14,y:a.y,vx:20,vy:(Math.random()-.5)*30,used:false,prod:true});done+=take.length;}}
      es.forEach(e=>{e.life+=dt;const ti=e.tx;const px=w*.2+5*14+4,tx=ti.x,ty=ti.y;const u=Math.min(1,e.life/1.1);e.x+=((e.life<.5?w*.2+14*2:tx)-e.x)*Math.min(1,dt*3);e.y+=((e.life<.5?e.y:ty)-e.y)*Math.min(1,dt*3);
        if(e.life>1.1&&!e.done){e.done=true;if(!ti.landed){ti.landed=true;ti.used=true;if(X.gas)bub.push({x:ti.x,y:ti.y,r:5,v:30+Math.random()*30});else dep.push({x:w*.2+5*14+6+(dep.length%3)*9,y:70+Math.floor(dep.length/3)*14%140+Math.random()*4});}}});
      es=es.filter(e=>!e.done);ions.forEach(i=>{if(i.landed)return;i.vx+=(Math.random()-.5)*300*dt;i.vy+=(Math.random()-.5)*300*dt;i.vx*=.95;i.vy*=.95;i.x+=i.vx*dt;i.y+=i.vy*dt;if(i.x<w*.2+80)i.x=w*.2+80;if(i.x>w-12)i.vx=-Math.abs(i.vx);if(i.y<90)i.vy=Math.abs(i.vy);if(i.y>h0()-14)i.vy=-Math.abs(i.vy);});
      ions=ions.filter(i=>!i.landed);bub.forEach(b=>{b.y-=b.v*dt;});bub=bub.filter(b=>b.y>40);
      if(done>=total&&!es.length){run=false;$('#rd-eq').innerHTML=`<span class="ln"><span class="lbl">Oxidation half-reaction</span>${X.half[0]}</span><span class="ln"><span class="lbl">Reduction half-reaction</span>${X.half[1]}</span><span class="ln"><span class="lbl">Net equation</span><span class="net">${X.eq}</span></span>`;}
      if(done>0){setText('rd-ox',X.ox);setText('rd-re',X.re);setText('rd-ra',X.ra+' (oxidized)');setText('rd-oa',X.oa+' (reduced)');}},
    draw(ctx,w,h,t){fixW(w);ctx.fillStyle=alpha(X.icol==='#3E7BDC'?T.cx:T.hot,.09);ctx.fillRect(0,60,w,h-60);ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(1,60,w-2,h-62);label(ctx,'solution',w-8,66,T.muted,'right','top',MONO);
      ctx.fillStyle=alpha(X.mcol,.22);ctx.fillRect(w*.2-8,20,5*14+14,h-24-20);ctx.strokeStyle=X.mcol;ctx.lineWidth=1.5;ctx.strokeRect(w*.2-8,20,5*14+14,h-44);label(ctx,X.m+' strip',w*.2+28,12,T.ink,'center','middle',MONO);
      atoms.forEach(a=>{if(a.gone)return;ball2(ctx,a.x+(a.y>60?Math.sin(t*3+a.y)*.6:0),a.y,6,X.mcol);});dep.forEach(d=>ball2(ctx,d.x,d.y,5.5,X.pcol,'rgba(0,0,0,.3)'));
      ions.forEach(i=>{if(i.prod){ball2(ctx,i.x,i.y,6.5,X.mcol);label(ctx,'+',i.x,i.y,'#fff','center','middle','700 10px "IBM Plex Mono",monospace');}else{ball2(ctx,i.x,i.y,6.5,X.icol);label(ctx,'+',i.x,i.y,'#fff','center','middle','700 10px "IBM Plex Mono",monospace');}});
      es.forEach(e=>{dot(ctx,e.x,e.y,3.6,T.ce);});bub.forEach(b=>{ctx.strokeStyle=T.muted;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,7);ctx.stroke();});
      label(ctx,'gold dots: electrons',8,h-6,T.ce,'left','bottom',MONO);label(ctx,X.ion+(X.q===1&&X.ion!=='H⁺'?'':'')+' in solution',w-8,h-6,T.muted,'right','bottom',MONO);}});
  const h0=()=>cv.clientHeight||320;
  $('#rd-go').addEventListener('click',()=>{if(done>=total)reset();run=true;sim.render();});sel.addEventListener('change',reset);
  reset();drawers.redox=()=>sim.render();
  /* ---- oxidation numbers ---- */
  const os=$('#on-sel');os.innerHTML=ON.map(s=>`<option value="${s[0]}">${s[1]}</option>`).join('');os.value='kmno4';let ostep=0;
  function ond(){const sp=ON.find(s=>s[0]===os.value),x=onSolve(sp);
    const chips=sp[2].map(a=>{const ox=a[2]!==null?a[2]:x;const show=ostep>=1&&a[2]!==null||ostep>=2;return `<span class="chip-d ${a[2]===null?'amb':'sig'}"><b>${a[0]}${a[1]>1?'<sub>'+a[1]+'</sub>':''}</b><small>${show?onFmt(ox)+' each':(a[2]===null?'unknown':'?')}</small></span>`;}).join('');
    $('#on-chips').innerHTML=chips+(sp[3]?`<span class="chip-x">charge ${sp[3]>0?'+':'−'}${Math.abs(sp[3])}</span>`:'');
    const terms=sp[2].map(a=>`${a[1]>1?a[1]+'(':'('}${a[2]!==null?onFmt(a[2]):'x'})`).join(' + ');
    $('#on-eq').innerHTML=ostep>=1?`${terms} = ${sp[3]}${ostep>=2?`<br>so x = <b>${onFmt(x)}</b>`:''}`:'';
    $('#on-note').textContent=ostep===0?'Step 1: use the rules for the atoms that are always the same (O is −2, H is +1, group 1 is +1). The sum must equal the overall charge.':ostep===1?'Step 2: write the sum with x for the unknown atom. Each atom\'s number is multiplied by how many there are.':`Step 3: solve for x. ${sp[0]==='h2o2'||sp[0]==='nah'?'This is an exception: '+(sp[0]==='nah'?'hydrogen is −1 in a metal hydride.':'oxygen is −1 in a peroxide.'):''}`;
    $('#on-back').disabled=ostep===0;$('#on-next').textContent=ostep===2?'Start over':'Next step';}
  os.addEventListener('change',()=>{ostep=0;ond();});$('#on-next').addEventListener('click',()=>{ostep=ostep===2?0:ostep+1;ond();});$('#on-back').addEventListener('click',()=>{ostep=Math.max(0,ostep-1);ond();});ond();
  TIPS['rd-sel']='Compare how many electrons each metal atom gives up with how many each ion can accept.';
  TIPS['on-sel']='Use the fixed rules first, then solve for the one unknown atom.';
  KEYS['rd-canvas']=['Press Dip the metal in and follow the gold electrons.',[['ce','electrons']]];
  GLOSS['oxidation']='Loss of electrons: the oxidation number increases.';
  GLOSS['reduction']='Gain of electrons: the oxidation number decreases.';
  GLOSS['oxidizing agent']='The species that is reduced; it takes electrons from another substance.';
  GLOSS['reducing agent']='The species that is oxidized; it gives electrons to another substance.';
  GLOSS['oxidation number']='The charge an atom would have if all its bonds were completely ionic.';
  TT.redox='Keep two columns on the board, "who loses electrons" and "who gains", and make students label each agent. OIL RIG is worth repeating, and so is the check that electrons lost equal electrons gained.';
})();
(function(){
  PROBS.push({id:'rd-number',topic:'redox',title:'Oxidation number of an element',gen(){const sp=pick(ON.filter(s=>s[2].some(a=>a[2]===null))),x=onSolve(sp),el=sp[2].find(a=>a[2]===null)[0];
    return {q:`What is the oxidation number of ${el} in ${sp[1]}?`,ans:x,unit:'',abs:.01,hint:'Assign the fixed ones first (O −2, H +1, group 1 +1), then make the total equal the overall charge.',sol:`${sp[2].map(a=>`${a[1]>1?a[1]+'(':'('}${a[2]!==null?onFmt(a[2]):'x'})`).join(' + ')} = ${sp[3]}, so ${el} is <b>${onFmt(x)}</b>.`};}});
  const AG=[['Zn + Cu²⁺ → Zn²⁺ + Cu','Cu²⁺','Zn'],['Mg + 2H⁺ → Mg²⁺ + H₂','H⁺','Mg'],['Cu + 2Ag⁺ → Cu²⁺ + 2Ag','Ag⁺','Cu'],['2Na + Cl₂ → 2NaCl','Cl₂','Na'],['2H₂ + O₂ → 2H₂O','O₂','H₂'],['Fe + 2Fe³⁺ → 3Fe²⁺','Fe³⁺','Fe'],['Cl₂ + 2Br⁻ → 2Cl⁻ + Br₂','Cl₂','Br⁻'],['2Al + 3Cl₂ → 2AlCl₃','Cl₂','Al']];
  PROBS.push({id:'rd-agent',topic:'redox',title:'Oxidizing or reducing agent',gen(){const [eq,oa,ra]=pick(AG),which=pick(['oxidizing','reducing']),cand=eq.replace(/→/,'+').split('+').map(s=>s.trim().replace(/^\d+/,'')).filter(x=>x),ch=[...new Set(cand)].slice(0,4);const ans=which==='oxidizing'?oa:ra;
    return {q:`In the reaction ${eq}, which species is the ${which} agent?`,choices:ch,ans:ch.indexOf(ans),hint:'The oxidizing agent is reduced (gains electrons); the reducing agent is oxidized (loses electrons). Find which oxidation numbers go down and up.',sol:`The ${which} agent is <b>${ans}</b>.`};}});
  const HR=[['Al → Al³⁺',3],['Fe²⁺ → Fe³⁺',1],['Cl₂ → 2Cl⁻',2],['Zn → Zn²⁺',2],['MnO₄⁻ → Mn²⁺ (acidic)',5],['Cr₂O₇²⁻ → 2Cr³⁺ (acidic)',6],['NO₃⁻ → NO (acidic)',3],['Cu²⁺ → Cu⁺',1],['2Br⁻ → Br₂',2],['Sn²⁺ → Sn⁴⁺',2]];
  PROBS.push({id:'rd-electrons',topic:'redox',title:'Electrons in a half-reaction',gen(){const [h,e]=pick(HR);
    return {q:`How many electrons appear in the balanced half-reaction ${h}?`,ans:e,unit:'electrons',abs:.01,hint:'Find the change in oxidation number per atom and multiply by the number of atoms that change.',sol:`The change in oxidation number, times the number of atoms, is <b>${e}</b> electron${e>1?'s':''}.`};}});
})();
