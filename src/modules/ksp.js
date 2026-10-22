
/* ---------------- Solubility equilibria ---------------- */
const KSP=[{f:'AgCl',c:'Ag⁺',an:'Cl⁻',a:1,b:1,K:1.8e-10,M:143.32},{f:'BaSO₄',c:'Ba²⁺',an:'SO₄²⁻',a:1,b:1,K:1.1e-10,M:233.39},{f:'CaF₂',c:'Ca²⁺',an:'F⁻',a:1,b:2,K:3.9e-11,M:78.07},{f:'PbI₂',c:'Pb²⁺',an:'I⁻',a:1,b:2,K:9.8e-9,M:461.0},{f:'Mg(OH)₂',c:'Mg²⁺',an:'OH⁻',a:1,b:2,K:5.6e-12,M:58.32},{f:'Ag₂CrO₄',c:'Ag⁺',an:'CrO₄²⁻',a:2,b:1,K:1.1e-12,M:331.73},{f:'CaCO₃',c:'Ca²⁺',an:'CO₃²⁻',a:1,b:1,K:3.4e-9,M:100.09},{f:'AgBr',c:'Ag⁺',an:'Br⁻',a:1,b:1,K:5.4e-13,M:187.77}];
function kspS(r,cc,ca){/* solubility with common ion concentrations cc (cation) and ca (anion) */let lo=0,hi=1;const f=s=>Math.pow(r.a*s+cc,r.a)*Math.pow(r.b*s+ca,r.b);for(let i=0;i<300;i++){const m=(lo+hi)/2;f(m)<r.K?lo=m:hi=m;}return (lo+hi)/2;}
const kspPure=r=>kspS(r,0,0);
(function ksp(){
  const cv=$('#ks-canvas');if(!cv)return;const ss=$('#ks-salt'),cS=$('#ks-c'),wS=$('#ks-which');ss.innerHTML=KSP.map((r,i)=>`<option value="${i}">${r.f}   (Ksp = ${sci(r.K,1)})</option>`).join('');
  const H=260;let ions=[],t=0,run=false,prog=0;const cur=()=>{const r=KSP[+ss.value],c=+cS.value,w=wS.value,s=kspS(r,w==='cat'?c:0,w==='an'?c:0);return {r,c,s,cat:r.a*s+(w==='cat'?c:0),an:r.b*s+(w==='an'?c:0)};};
  const cnt=s=>clamp(Math.round(2+5*(Math.log10(Math.max(s,1e-12))+8)),0,44);
  const sim=sim2d(cv,{h:()=>H,step(dt){const w=cv.clientWidth;if(run){prog=Math.min(1,prog+dt*.35);if(prog>=1)run=false;}const {s}=cur(),want=Math.round(cnt(s)*prog),wantTot=Math.max(0,want);
      while(ions.length<wantTot*2){const a=Math.random()*6.28;ions.push({x:w/2+(Math.random()-.5)*60,y:H-40,vx:Math.cos(a)*60,vy:Math.sin(a)*60-20,k:ions.length%2});}while(ions.length>wantTot*2)ions.pop();
      ions.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx+=(Math.random()-.5)*200*dt;p.vy+=(Math.random()-.5)*200*dt;const sp=Math.hypot(p.vx,p.vy)||1;if(sp>80){p.vx*=80/sp;p.vy*=80/sp;}if(p.x<8||p.x>w-8)p.vx*=-1;if(p.y<40||p.y>H-10)p.vy*=-1;p.x=clamp(p.x,8,w-8);p.y=clamp(p.y,40,H-10);});},
    draw(ctx,w,h){ctx.fillStyle=alpha('#3E7BDC',.09);ctx.fillRect(0,40,w,H-40);ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(1,20);ctx.lineTo(1,H);ctx.lineTo(w-1,H);ctx.lineTo(w-1,20);ctx.stroke();
      const sz=run||prog>0?28*(1-.04*prog):28;ctx.fillStyle='#EEF1F5';ctx.strokeStyle=T.ink;ctx.lineWidth=1.5;ctx.fillRect(w/2-sz/2,H-sz-2,sz,sz);ctx.strokeRect(w/2-sz/2,H-sz-2,sz,sz);label(ctx,cur().r.f,w/2,H-sz/2-2,T.ink,'center','middle','600 11px "IBM Plex Mono",monospace');
      ions.forEach(p=>ball2(ctx,p.x,p.y,5.5,p.k?'#8B5CF6':'#3E7BDC'));
      label(ctx,'cations (blue)  anions (violet)',8,12,T.muted,'left','middle',MONO);}});
  const g=$('#ks-graph'),gs=sim2d(g,{h:()=>H,draw(ctx,w,h){const {r,c}=cur(),w2=wS.value,lo=-11,hi=0,P=panel(ctx,{x:50,y:12,w:w-64,h:h-46},[0,.2],[lo,hi],{xn:4,yn:4,xlabel:'common ion (M)',ylabel:'log₁₀ s',color:T.ink});
      curve(ctx,P,x=>Math.log10(kspS(r,w2==='cat'?x:0,w2==='an'?x:0)),0,.2,T.cx,2.6,160);const s=cur().s;dot(ctx,P.X(c),P.Y(Math.log10(s)),6,T.ink);label(ctx,'s = '+sci(s,2)+' M',P.X(c)+8,P.Y(Math.log10(s))-10,T.ink,'left','bottom',MONO);}});
  function upd(){const {r,c,s,cat,an}=cur();setText('ks-c-out',fmt(c,3)+' M');setText('ks-ksp',sci(r.K,2));setText('ks-s',sci(s,2)+' M');setText('ks-cat',sci(cat,2)+' M');setText('ks-an',sci(an,2)+' M');setText('ks-gl',sci(s*r.M,2)+' g/L');sim.render();gs.render();}
  ss.addEventListener('change',()=>{prog=0;run=false;ions=[];upd();});wS.addEventListener('change',()=>{upd();});bindRange('ks-c',()=>'',upd,false);
  $('#ks-go').addEventListener('click',()=>{prog=0;ions=[];run=true;sim.render();});$('#ks-lab').addEventListener('labreset',()=>{prog=0;run=false;ions=[];upd();});upd();
  /* mixing */
  const ms=$('#mx-salt');ms.innerHTML=KSP.map((r,i)=>`<option value="${i}">${r.f}  (Ksp = ${sci(r.K,1)})</option>`).join('');
  const mc=$('#mx-canvas');let pour=0,mrun=false,gr=[];
  const mx=()=>{const r=KSP[+ms.value],V=+$('#mx-v').value,c1=Math.pow(10,+$('#mx-c1').value),c2=Math.pow(10,+$('#mx-c2').value),ca=c1/2,an=c2/2,Q=Math.pow(ca,r.a)*Math.pow(an,r.b);return {r,V,ca,an,Q,yes:Q>r.K};};
  const msim=sim2d(mc,{h:()=>250,step(dt){if(mrun){pour=Math.min(1,pour+dt*.5);if(pour>=1)mrun=false;}const {yes,Q,r}=mx(),w=mc.clientWidth;const want=pour>=1&&yes?clamp(Math.round(6*Math.log10(Q/r.K)),3,40):0;while(gr.length<want)gr.push({x:w/2-60+Math.random()*120,y:60,vy:0,done:false});while(gr.length>want)gr.pop();gr.forEach(p=>{if(!p.done){p.vy+=240*dt;p.y+=p.vy*dt;if(p.y>200-p.k||p.y>200){p.y=200-Math.random()*14;p.done=true;}}});},
    draw(ctx,w,h){const {r,ca,an,yes}=mx(),bx=w/2-90,by=40,bw=180,bh=170;
      ctx.fillStyle=alpha('#3E7BDC',.09);const lv=40+(170*(1-clamp(pour*.7+.3*0,0,1)*.55));ctx.fillRect(bx,by+bh*.25,bw,bh*.75);ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx,by+bh);ctx.lineTo(bx+bw,by+bh);ctx.lineTo(bx+bw,by);ctx.stroke();
      const nIon=p=>clamp(Math.round(2+4*(Math.log10(p)+6)),0,22);const nc=nIon(ca),na=nIon(an);const seed=i=>{const v=Math.sin(i*12.9898+78.233)*43758.5453;return v-Math.floor(v);};
      for(let i=0;i<nc;i++)ball2(ctx,bx+10+seed(i)*(bw-20),by+bh*.25+10+seed(i+50)*(bh*.75-20)+Math.sin(sim.t*2+i)*3,5,'#3E7BDC');for(let i=0;i<na;i++)ball2(ctx,bx+10+seed(i+100)*(bw-20),by+bh*.25+10+seed(i+150)*(bh*.75-20)+Math.cos(sim.t*2+i)*3,5,'#8B5CF6');
      gr.forEach(p=>{ctx.fillStyle='#EEF1F5';ctx.strokeStyle=T.ink;ctx.lineWidth=1;ctx.fillRect(p.x-4,p.y-4,8,8);ctx.strokeRect(p.x-4,p.y-4,8,8);});
      label(ctx,'after mixing: '+r.c+' (blue), '+r.an+' (violet)',w/2,16,T.muted,'center','middle',MONO);if(pour>=1)label(ctx,yes?'precipitate '+r.f+'!':'no precipitate',w/2,h-12,yes?T.hot:T.cv,'center','middle','600 14px "IBM Plex Mono",monospace');}});
  const stop=()=>{pour=0;mrun=false;gr=[];};
  function mupd(){const m=mx();setText('mx-c1-out',sci(Math.pow(10,+$('#mx-c1').value),1)+' M');setText('mx-c2-out',sci(Math.pow(10,+$('#mx-c2').value),1)+' M');setText('mx-v-out',m.V+' mL');setText('mx-ca',sci(m.ca,2)+' M');setText('mx-an',sci(m.an,2)+' M');setText('mx-q',sci(m.Q,2));setText('mx-k',sci(m.r.K,2));setText('mx-r',m.yes?'Q > Ksp: precipitate forms':'Q < Ksp: stays dissolved');msim.render();}
  ms.addEventListener('change',()=>{stop();mupd();});['mx-c1','mx-c2','mx-v'].forEach(id=>bindRange(id,()=>'',()=>{stop();mupd();},false));$('#mx-go').addEventListener('click',()=>{pour=0;gr=[];mrun=true;msim.render();});$('#mx-lab').addEventListener('labreset',()=>{stop();mupd();});mupd();
  drawers.ksp=()=>{upd();mupd();};
  TIPS['ks-salt']='A salt with a smaller Ksp dissolves less, as long as you compare salts with the same formula type.';
  TIPS['ks-c']='More of an ion that is already part of the salt shifts the equilibrium left.';
  TIPS['ks-which']='Choose which ion you are adding from outside (for example NaCl supplies Cl⁻).';
  TIPS['mx-salt']='Pick which combination of ions you might get.';
  TIPS['mx-c1']='Concentration of the cation in its own solution, before mixing (log scale).';
  TIPS['mx-c2']='Concentration of the anion in its own solution, before mixing (log scale).';
  TIPS['mx-v']='Equal volumes are mixed, so each concentration is halved.';
  KEYS['ks-canvas']=['Press Add the crystal and watch the ions leave it.',[['#3E7BDC','cations'],['#8B5CF6','anions']]];
  GLOSS['solubility product']='Ksp: the equilibrium constant for a salt dissolving; it contains the ion concentrations only.';
  GLOSS['molar solubility']='The number of moles of a salt that dissolve per liter of solution.';
  GLOSS['common ion']='An ion already present in the solution that is also released by a dissolving salt; it lowers the salt\'s solubility.';
  GLOSS['saturated']='A solution holding the maximum dissolved solute at equilibrium (Q = Ksp).';
  TT.ksp='Do the common-ion case on the board with the same salt twice. Seeing the number fall by four orders of magnitude makes the Le Châtelier link stick.';
})();
(function(){
  const SS=KSP;const sF=r=>{const fm=(n,m)=>m>1?`${n}<sub>${m}</sub>`:n;return r.f;};
  const rK=(r)=>r.K;
  PROBS.push({id:'ksp-s',topic:'ksp',title:'Molar solubility from Ksp',gen(){const r=pick(SS),s=kspPure(r);
    return {q:`The K<sub>sp</sub> of ${r.f} is ${sci(r.K,2)}. What is its molar solubility in pure water?`,ans:s,unit:'mol/L',tol:.03,hint:`Write K<sub>sp</sub> = [${r.c}]${r.a>1?'<sup>'+r.a+'</sup>':''}[${r.an}]${r.b>1?'<sup>'+r.b+'</sup>':''} in terms of s: [${r.c}] = ${r.a>1?r.a+'s':'s'}, [${r.an}] = ${r.b>1?r.b+'s':'s'}.`,sol:`K<sub>sp</sub> = ${r.a>1?'('+r.a+'s)<sup>'+r.a+'</sup>':'s'}${r.b>1?'('+r.b+'s)<sup>'+r.b+'</sup>':'·s'} = ${fmt(Math.pow(r.a,r.a)*Math.pow(r.b,r.b),0)}s<sup>${r.a+r.b}</sup>, so s = <b>${sci(s,3)} M</b>.`};}});
  PROBS.push({id:'ksp-K',topic:'ksp',title:'Ksp from solubility',gen(){const r=pick(SS),s0=kspPure(r),gl=+(s0*r.M).toPrecision(2),s=gl/r.M,K=Math.pow(r.a*s,r.a)*Math.pow(r.b*s,r.b);
    return {q:`${r.f} (molar mass ${r.M} g/mol) dissolves to the extent of ${sci(gl,2)} g per liter of saturated solution at 25 °C. Calculate K<sub>sp</sub>.`,ans:K,unit:'',tol:.03,hint:'Convert g/L to mol/L to get s, then [ions] from the formula, then K_sp.',sol:`s = ${sci(gl,2)}/${r.M} = ${sci(s,3)} M; [${r.c}] = ${r.a>1?r.a+'s':'s'}, [${r.an}] = ${r.b>1?r.b+'s':'s'}; K<sub>sp</sub> = <b>${sci(K,2)}</b>.`};}});
  PROBS.push({id:'ksp-common',topic:'ksp',title:'Solubility with a common ion',gen(){const r=pick(SS.filter(x=>x.f!=='Mg(OH)₂'&&x.f!=='CaCO₃')),c=pick([.010,.050,.10,.20]),useCat=Math.random()<.5,s=kspS(r,useCat?c:0,useCat?0:c),src=useCat?(r.c==='Ag⁺'?'AgNO₃':r.c==='Ba²⁺'?'Ba(NO₃)₂':r.c==='Ca²⁺'?'CaCl₂':r.c==='Pb²⁺'?'Pb(NO₃)₂':'Mg(NO₃)₂'):(r.an==='Cl⁻'?'NaCl':r.an==='Br⁻'?'NaBr':r.an==='I⁻'?'NaI':r.an==='F⁻'?'NaF':r.an==='SO₄²⁻'?'Na₂SO₄':'Na₂CrO₄');
    return {q:`What is the molar solubility of ${r.f} (K<sub>sp</sub> = ${sci(r.K,2)}) in ${fmt(c,3)} M of the ${useCat?r.c:r.an} ion, supplied by ${src}?`,ans:s,unit:'mol/L',tol:.04,hint:'Add the common ion\'s starting concentration to the total, then assume s is small compared with it.',sol:`${useCat?`K<sub>sp</sub> = (${r.a>1?r.a+'s + ':'s + '}${fmt(c,3)})${r.a>1?'<sup>'+r.a+'</sup>':''}`:`[${r.c}] = ${r.a>1?r.a+'s':'s'}`}… solving gives s = <b>${sci(s,3)} M</b> (smaller than in pure water, ${sci(kspPure(r),2)} M).`};}});
  PROBS.push({id:'ksp-precip',topic:'ksp',title:'Will a precipitate form?',gen(){let r,V1,V2,f,c1,Vt,c2,n=0;do{r=pick(SS.filter(x=>x.a===1&&x.b===1));V1=pick([25,50,75,100]);V2=pick([25,50,100]);f=pick([.1,.3,3,10,30]);c1=Math.pow(10,-pick([2,3,4,5]));Vt=V1+V2;c2=+(r.K*f*Vt*Vt/(c1*V1*V2)).toPrecision(2);}while((c2<1e-6||c2>.5)&&++n<60);const Q=(c1*V1/Vt)*(c2*V2/Vt),yes=Q>r.K;
    return {q:`${V1} mL of ${sci(c1,1)} M ${r.c} solution is mixed with ${V2} mL of ${sci(c2,2)} M ${r.an} solution. K<sub>sp</sub> of ${r.f} is ${sci(r.K,2)}. Does a precipitate form?`,choices:['Yes, a precipitate forms','No precipitate forms'],ans:yes?0:1,hint:'Find each ion\'s concentration after mixing (dilution!), compute Q, and compare it with K_sp.',sol:`[${r.c}] = ${sci(c1,1)}×${V1}/${Vt} = ${sci(c1*V1/Vt,2)}; [${r.an}] = ${sci(c2*V2/Vt,2)}; Q = ${sci(Q,2)}, which is ${yes?'greater':'less'} than K<sub>sp</sub> = ${sci(r.K,2)}: <b>${yes?'precipitate forms':'no precipitate'}</b>.`};}});
  PROBS.push({id:'ksp-pH',topic:'ksp',title:'pH of a saturated hydroxide',gen(){const K=pick([5.6e-12,1.8e-11,2.0e-13]),nm={5.6e-12:'Mg(OH)₂',1.8e-11:'Mn(OH)₂',2.0e-13:'Fe(OH)₂'}[K],s=Math.cbrt(K/4),pH=14+Math.log10(2*s);
    return {q:`${nm} has K<sub>sp</sub> = ${sci(K,2)}. What is the pH of a saturated solution in pure water at 25 °C?`,ans:pH,unit:'',abs:.05,hint:'K_sp = s(2s)² = 4s³. [OH⁻] = 2s, then pOH and pH.',sol:`s = (K<sub>sp</sub>/4)<sup>1/3</sup> = ${sci(s,3)} M; [OH⁻] = 2s = ${sci(2*s,3)} M; pOH = ${fmt(-Math.log10(2*s),2)}; pH = <b>${fmt(pH,2)}</b>.`};}});
})();
