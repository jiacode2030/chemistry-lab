
/* ---------------- Entropy & microstates ---------------- */
const KB=1.380649e-23;
const lnC=(n,k)=>{let s=0;for(let i=1;i<=k;i++)s+=Math.log((n-k+i)/i);return s;};
const SO={H2:['H₂(g)',130.6],O2:['O₂(g)',205.0],N2:['N₂(g)',191.6],NH3:['NH₃(g)',192.5],H2Ol:['H₂O(l)',69.9],H2Og:['H₂O(g)',188.8],CO2:['CO₂(g)',213.7],CaCO3:['CaCO₃(s)',92.9],CaO:['CaO(s)',39.8],NO2:['NO₂(g)',240.0],N2O4:['N₂O₄(g)',304.3],NaCl:['NaCl(s)',72.1],Naaq:['Na⁺(aq)',59.0],Claq:['Cl⁻(aq)',56.5],CH4:['CH₄(g)',186.3],SO2:['SO₂(g)',248.2],SO3:['SO₃(g)',256.8]};
const SR=[{R:[['H2',2],['O2',1]],P:[['H2Ol',2]]},{R:[['N2',1],['H2',3]],P:[['NH3',2]]},{R:[['CaCO3',1]],P:[['CaO',1],['CO2',1]]},{R:[['NO2',2]],P:[['N2O4',1]]},{R:[['NaCl',1]],P:[['Naaq',1],['Claq',1]]},{R:[['H2Ol',1]],P:[['H2Og',1]]},{R:[['CH4',1],['O2',2]],P:[['CO2',1],['H2Ol',2]]},{R:[['SO2',2],['O2',1]],P:[['SO3',2]]}];
const sSum=l=>l.reduce((a,[k,n])=>a+SO[k][1]*n,0);
(function entropy(){
  const cv=$('#et-canvas');if(!cv)return;const nS=$('#et-n'),H=240;let P=[],open=false,hist=[],frames=0,part=true;
  const N=()=>+nS.value;
  function init(){const w=cv.clientWidth||300;P=[];for(let i=0;i<N();i++)P.push({x:10+Math.random()*(w/2-20),y:10+Math.random()*(H-20),vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160});hist=new Array(N()+1).fill(0);frames=0;open=false;part=true;$('#et-go').textContent='Remove the partition';}
  const kNow=()=>P.filter(p=>p.x<(cv.clientWidth||300)/2).length;
  const sim=sim2d(cv,{h:()=>H,step(dt){const w=cv.clientWidth;P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<6){p.x=6;p.vx=Math.abs(p.vx);}if(p.x>w-6){p.x=w-6;p.vx=-Math.abs(p.vx);}if(p.y<6){p.y=6;p.vy=Math.abs(p.vy);}if(p.y>H-6){p.y=H-6;p.vy=-Math.abs(p.vy);}
        if(part){const m=w/2;if(p.x<m&&p.x>m-6){p.x=m-6;p.vx=-Math.abs(p.vx);}}});
      if(open){const k=kNow();hist[k]++;frames++;if(frames%4===0)upd(true);}},
    draw(ctx,w,h){ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(1,1,w-2,H-2);if(part){ctx.fillStyle=T.muted;ctx.fillRect(w/2-2,0,4,H);}else{ctx.setLineDash([4,4]);ctx.strokeStyle=T.grid;ctx.beginPath();ctx.moveTo(w/2,0);ctx.lineTo(w/2,H);ctx.stroke();ctx.setLineDash([]);}
      P.forEach(p=>ball2(ctx,p.x,p.y,6,'#3E7BDC'));}});
  const g=$('#et-graph'),gs=sim2d(g,{h:()=>H,draw(ctx,w,h){const n=N(),k=kNow(),bx=40,bw=w-52,by=14,bh=h-60;const mx=lnC(n,Math.floor(n/2));const Y=lw=>by+bh-bh*(Math.exp(lw-mx));
      const bw1=bw/(n+1);for(let j=0;j<=n;j++){const lw=lnC(n,j),y=Y(lw);ctx.fillStyle=j===k?'#E08A2E':alpha('#3E7BDC',.5);ctx.fillRect(bx+j*bw1+1,y,bw1-2,by+bh-y);}
      if(frames>150){const tot=hist.reduce((a,b)=>a+b,0)||1,mxh=Math.max(...hist)/tot;ctx.strokeStyle=T.cv;ctx.lineWidth=2.2;ctx.beginPath();hist.forEach((c,j)=>{const x=bx+(j+.5)*bw1,y=by+bh-bh*(c/tot)/(Math.exp(mx)/Math.pow(2,n));j?ctx.lineTo(x,Math.max(by,y)):ctx.moveTo(x,Math.max(by,y));});ctx.stroke();label(ctx,'green line: time spent',bx+bw-4,by+24,T.cv,'right','middle',MONO);}
      ctx.strokeStyle=T.muted;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx,by+bh);ctx.lineTo(bx+bw,by+bh);ctx.stroke();label(ctx,'number of particles in the left half',bx+bw/2,h-30,T.muted,'center','middle',MONO);label(ctx,'0',bx,h-14,T.muted,'center','middle',MONO);label(ctx,String(n),bx+bw,h-14,T.muted,'center','middle',MONO);label(ctx,'bar height = number of ways',bx+4,by+8,T.muted,'left','middle',MONO);}});
  function upd(fromStep){const n=N(),k=kNow(),lw=lnC(n,k);setText('et-n-out',n+'');setText('et-k',k+' of '+n);setText('et-w',n>30?sci(Math.exp(lw),2):fmt(Math.exp(lw),0));setText('et-tot',sci(Math.pow(2,n),2));setText('et-s',sci(KB*lw,2)+' J/K');
    const pb=Math.pow(.5,n);setText('et-back',n<=20?'1 in '+fmt(1/pb,0):'1 in '+sci(1/pb,1));if(!fromStep)sim.render();gs.render();}
  nS.addEventListener('input',()=>{init();upd();});$('#et-go').addEventListener('click',()=>{if(!open&&part){part=false;open=true;$('#et-go').textContent='Put them back (reset)';}else{init();}upd();});
  $('#et-lab').addEventListener('labreset',()=>{init();upd();});bindRange('et-n',()=>'',()=>{},false);init();upd();drawers.entropy=()=>{init();upd();};
  /* reaction entropy */
  const sel=$('#sx-sel');const nm=l=>l.map(([k,n])=>(n>1?n:'')+SO[k][0]).join(' + ');sel.innerHTML=SR.map((r,i)=>`<option value="${i}">${nm(r.R)} → ${nm(r.P)}</option>`).join('');let stp=0,pred='';
  const sum=sSum,gasN=l=>l.filter(([k])=>SO[k][0].includes('(g)')).reduce((a,[,n])=>a+n,0);
  function supd(){const r=SR[+sel.value],sp=sum(r.P),sr=sum(r.R),ds=sp-sr,L=[];
    L.push(`<span class="ln"><span class="lbl">Reaction</span>${nm(r.R)} → ${nm(r.P)}</span>`);
    L.push(`<span class="ln"><span class="lbl">Moles of gas</span>${gasN(r.R)} → ${gasN(r.P)}${pred?`  <small>(you predicted ${pred==='up'?'ΔS &gt; 0':'ΔS &lt; 0'})</small>`:''}</span>`);
    if(stp>=1)L.push(`<span class="ln"><span class="lbl">ΣnS° (products)</span>${r.P.map(([k,n])=>`${n>1?n+' × ':''}${fmt(SO[k][1],1)}`).join(' + ')} = ${fmt(sp,1)} J/K</span>`);
    if(stp>=2)L.push(`<span class="ln"><span class="lbl">ΣnS° (reactants)</span>${r.R.map(([k,n])=>`${n>1?n+' × ':''}${fmt(SO[k][1],1)}`).join(' + ')} = ${fmt(sr,1)} J/K</span>`);
    if(stp>=3){const ok=pred?((ds>0)===(pred==='up')):null;L.push(`<span class="ln"><span class="lbl">ΔS°</span><span class="net">${fmt(sp,1)} − ${fmt(sr,1)} = ${ds>0?'+':'−'}${fmt(Math.abs(ds),1)} J/K ${ok===null?'':ok?'✓ your prediction was right':'(your prediction was off: check the moles of gas and the phases)'}</span></span>`);}
    $('#sx-out').innerHTML=L.join('');$('#sx-back').disabled=stp===0;$('#sx-next').textContent=stp>=3?'Start over':'Next step';}
  $('#sx-pred').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;pred=b.dataset.p;supd();});
  sel.addEventListener('change',()=>{stp=0;pred='';supd();});$('#sx-next').addEventListener('click',()=>{stp=stp>=3?0:stp+1;supd();});$('#sx-back').addEventListener('click',()=>{stp=Math.max(0,stp-1);supd();});$('#sx-lab').addEventListener('labreset',()=>{stp=0;pred='';supd();});supd();
  TIPS['et-n']='More particles: the even split dominates much more strongly and "all on one side" becomes vanishingly rare.';
  TIPS['sx-sel']='Predict the sign from the moles of gas and the phases, then check with the numbers.';
  KEYS['et-canvas']=['Press Remove the partition, then change the number of particles.',[['#3E7BDC','gas particles'],['#E08A2E','current split']]];
  GLOSS['entropy']='A measure of the number of ways energy and matter can be arranged: S = kB ln W.';
  GLOSS['microstate']='One specific arrangement of the particles and their energy.';
  GLOSS['second law']='The total entropy of the universe increases in any spontaneous process.';
  GLOSS['spontaneous']='A process that proceeds on its own without continuous outside help.';
  TT.entropy='Use cards or coins: students see the even split dominate with just 10 coins. Then scale to a mole.';
})();
(function(){
  PROBS.push({id:'ent-sign',topic:'entropy',title:'Sign of ΔS',gen(){const Q=[['CaCO₃(s) → CaO(s) + CO₂(g)',0,'a gas is produced from solids'],['2H₂(g) + O₂(g) → 2H₂O(l)',1,'3 mol of gas become a liquid'],['N₂(g) + 3H₂(g) → 2NH₃(g)',1,'4 mol of gas become 2 mol of gas'],['H₂O(l) → H₂O(g)',0,'a liquid becomes a gas'],['NaCl(s) → Na⁺(aq) + Cl⁻(aq)',0,'an ordered solid becomes dispersed ions'],['2NO₂(g) → N₂O₄(g)',1,'2 mol of gas become 1 mol'],['H₂O(l) → H₂O(s)',1,'a liquid becomes a more ordered solid'],['C₆H₁₂O₆(s) + 6O₂(g) → 6CO₂(g) + 6H₂O(g)',0,'a solid and 6 mol of gas become 12 mol of gas'],['Ag⁺(aq) + Cl⁻(aq) → AgCl(s)',1,'dissolved ions form an ordered solid']],[eq,a,why]=pick(Q),ch=['ΔS is positive','ΔS is negative'];
    return {q:`Predict the sign of ΔS for: ${eq}`,choices:ch,ans:a,hint:'Compare the moles of gas, and the phases (gas > liquid > solid).',sol:`<b>${ch[a]}</b>: ${why}.`};}});
  PROBS.push({id:'ent-dS',topic:'entropy',title:'Calculate ΔS°',gen(){const r=pick(SR),sp=sSum(r.P),sr=sSum(r.R),ds=sp-sr,nm2=l=>l.map(([k,n])=>(n>1?n:'')+SO[k][0]).join(' + '),used=[...new Set([...r.R,...r.P].map(x=>x[0]))];
    return {q:`Using S° (J/mol·K): ${used.map(k=>`${SO[k][0]} ${SO[k][1]}`).join(', ')}; calculate ΔS° for ${nm2(r.R)} → ${nm2(r.P)}.`,ans:ds,unit:'J/K',tol:.02,hint:'ΔS° = ΣnS°(products) − ΣnS°(reactants). Multiply by coefficients.',sol:`Products: ${fmt(sp,1)} J/K; reactants: ${fmt(sr,1)} J/K; ΔS° = <b>${fmt(ds,1)} J/K</b>.`};}});
  const MR=[['1 mol of H₂O(g)','1 mol of H₂O(l)',0,'gases have more entropy than liquids'],['1 mol of NaCl(s)','1 mol of NaCl dissolved in water',1,'dissolved ions are more dispersed'],['1 mol of CO₂(g) at 400 K','1 mol of CO₂(g) at 300 K',0,'more thermal energy gives more ways to share it'],['1 mol of C(diamond)','1 mol of C(graphite)',1,'graphite is softer and less rigidly ordered'],['1 mol of He(g)','1 mol of CH₄(g)',1,'more complex molecules have more ways to store energy'],['2 mol of O₂(g)','1 mol of O₂(g)',0,'more particles means more arrangements'],['1 mol of Br₂(l)','1 mol of Br₂(g)',1,'gas beats liquid'],['1 mol of ice at 0 °C','1 mol of liquid water at 0 °C',1,'liquid beats solid']];
  PROBS.push({id:'ent-more',topic:'entropy',title:'Which has higher entropy?',gen(){const [a,b,w,why]=pick(MR);return {q:`Which has the higher entropy: ${a} or ${b}?`,choices:[a,b],ans:w,hint:'Think: phase, temperature, number of particles, molecular complexity.',sol:`<b>${w?b:a}</b>: ${why}.`};}});
  PROBS.push({id:'ent-W',topic:'entropy',title:'Boltzmann equation',gen(){const e=pick([20,22,23,24]),m=pick([1.5,2.0,3.2,4.5]),W=m*Math.pow(10,e),lnW=Math.log(W),S=KB*lnW;
    return {q:`A system has ${sci(W,2)} microstates (W). What is its entropy, S = k<sub>B</sub> ln W? (k<sub>B</sub> = 1.38×10⁻²³ J/K)`,ans:1.38e-23*lnW,unit:'J/K',tol:.02,hint:'Take the natural log of W, then multiply by k_B.',sol:`ln W = ${fmt(lnW,2)}; S = 1.38×10⁻²³ × ${fmt(lnW,2)} = <b>${sci(1.38e-23*lnW,3)} J/K</b>.`};}});
  PROBS.push({id:'ent-ways',topic:'entropy',title:'Count the arrangements',gen(){const n=pick([4,5,6,8]),k=pick([1,2,3]),W=Math.round(Math.exp(lnC(n,k)));
    return {q:`${n} distinguishable gas particles are in a box with two equal halves. In how many ways can exactly ${k} of them be in the left half?`,ans:W,unit:'ways',abs:.5,hint:'Choose which k of the n particles are on the left: C(n, k) = n! / (k!(n−k)!).',sol:`C(${n}, ${k}) = <b>${W}</b>.`};}});
})();
