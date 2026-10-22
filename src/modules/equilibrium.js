
/* ---------------- Equilibrium & K ---------------- */
function kfmt(K){return K>=100||K<.01?sci(K,2):fmt(K,K<1?3:2);}
(function equilibrium(){
  const cv=$('#eq2-canvas');if(!cv)return;
  const typeS=$('#eq2-type'),kS=$('#eq2-k'),stS=$('#eq2-start');
  const CA='#3E7BDC',CB='#2FA36B',NP=40,H=250;
  let ents=[],A=1,B=0,run=false,t=0,traj=[],ode={};
  const K=()=>Math.pow(10,+kS.value),two=()=>typeS.value==='a2b';
  function rates(){const k=K();return two()?{kf:.5*k,kr:.5}:{kf:.6*k/(1+k),kr:.6/(1+k)};}
  const fR=(a)=>two()?rates().kf*a*a:rates().kf*a,rR=(b)=>rates().kr*b;
  function init(){const s=stS.value;if(two()){A=s==='r'?1:s==='p'?0:.5;B=s==='r'?0:s==='p'?.5:.25;}else{A=s==='r'?1:s==='p'?0:.5;B=s==='r'?0:s==='p'?1:.5;}}
  function step(a,b,dt){const d=(a,b)=>two()?[-2*fR(a)+2*rR(b),fR(a)-rR(b)]:[-fR(a)+rR(b),fR(a)-rR(b)];const k1=d(a,b),k2=d(a+k1[0]*dt/2,b+k1[1]*dt/2),k3=d(a+k2[0]*dt/2,b+k2[1]*dt/2),k4=d(a+k3[0]*dt,b+k3[1]*dt);return [a+dt/6*(k1[0]+2*k2[0]+2*k3[0]+k4[0]),b+dt/6*(k1[1]+2*k2[1]+2*k3[1]+k4[1])];}
  function precompute(){init();traj=[];let a=A,b=B;const dt=.05;for(let i=0;i<=480;i++){traj.push({t:i*dt,A:a,B:b,f:fR(a),r:rR(b)});[a,b]=step(a,b,dt);}}
  function at(tt){const i=Math.min(traj.length-1,Math.floor(tt/.05));return traj[i];}
  const Q=(a,b)=>two()?b/(a*a):b/a;
  function ents_sync(a,b){/* particle entities follow the concentrations */
    const w=cv.clientWidth||300,wantB=Math.round(b*NP/(two()?1:1)),wantA=Math.round(a*NP/(two()?1:1));
    const bs=ents.filter(e=>e.k==='B'),as=ents.filter(e=>e.k==='A');
    const nB=two()?Math.round(b*NP):Math.round(b*NP),nA=Math.round(a*NP);
    const mk=(k,x,y)=>({k,x:x??12+Math.random()*(w-24),y:y??12+Math.random()*(H-24),vx:(Math.random()-.5)*150,vy:(Math.random()-.5)*150,fl:0});
    if(!two()){const need=nA+nB;while(ents.length<need)ents.push(mk('A'));while(ents.length>need)ents.pop();let cntA=ents.filter(e=>e.k==='A').length;
      for(const e of ents){if(cntA<nA&&e.k==='B'){e.k='A';e.fl=.5;cntA++;}else if(cntA>nA&&e.k==='A'){e.k='B';e.fl=.5;cntA--;}}}
    else{let cB=bs.length,cA=as.length;while(cB<nB&&cA>=2){const x=as.pop(),y=as.pop();ents.splice(ents.indexOf(x),1);ents.splice(ents.indexOf(y),1);ents.push(mk('B',(x.x+y.x)/2,(x.y+y.y)/2));ents[ents.length-1].fl=.5;cB++;cA-=2;}
      while(cB>nB){const x=bs.pop();ents.splice(ents.indexOf(x),1);ents.push(mk('A',x.x-8,x.y),mk('A',x.x+8,x.y));ents[ents.length-1].fl=.5;cB--;cA+=2;}
      while(cA<nA*1&&false){}
      let guard=0;while(ents.filter(e=>e.k==='A').length+ents.filter(e=>e.k==='B').length*2<NP&&guard++<200)ents.push(mk('A'));
      guard=0;while(ents.filter(e=>e.k==='A').length+ents.filter(e=>e.k==='B').length*2>NP&&guard++<200){const e=ents.find(e=>e.k==='A');if(!e)break;ents.splice(ents.indexOf(e),1);}}}
  const sim=sim2d(cv,{h:()=>H,step(dt){const w=cv.clientWidth;if(run){t=Math.min(24,t+dt);const s=at(t);A=s.A;B=s.B;}
      ents_sync(A,B);ents.forEach(e=>{e.x+=e.vx*dt;e.y+=e.vy*dt;e.fl=Math.max(0,e.fl-dt);if(e.x<8||e.x>w-8)e.vx*=-1;if(e.y<8||e.y>H-8)e.vy*=-1;e.x=clamp(e.x,8,w-8);e.y=clamp(e.y,8,H-8);});updR();},
    draw(ctx,w,h){ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(1,1,w-2,H-2);
      ents.forEach(e=>{const c=e.k==='A'?CA:CB;if(e.k==='B'&&two()){ball2(ctx,e.x-5,e.y,6,c);ball2(ctx,e.x+5,e.y,6,c);}else ball2(ctx,e.x,e.y,6.5,c);if(e.fl>0){ctx.strokeStyle=alpha(c,e.fl*2);ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,10+(.5-e.fl)*30,0,7);ctx.stroke();}});
      label(ctx,two()?'A (single)  B = A₂ (pair)':'A  ⇄  B',8,H+14,T.muted,'left','middle',MONO);}});
  const g=$('#eq2-graph'),gs=sim2d(g,{h:()=>H+24,draw(ctx,w,h){const hh=(h-20)/2,tm=24;
      const P1=panel(ctx,{x:44,y:8,w:w-58,h:hh-24},[0,tm],[0,1.05],{xn:4,yn:2,ylabel:'concentration (M)',color:T.ink});
      curve(ctx,P1,x=>at(x).A,0,tm,CA,2.4,120);curve(ctx,P1,x=>at(x).B,0,tm,CB,2.4,120);line(ctx,P1,t,0,t,1.05,T.hot,1.5,[4,3]);label(ctx,'A',P1.X(1),P1.Y(at(1).A)-6,CA,'left','bottom',MONO);label(ctx,'B',P1.X(1),P1.Y(at(1).B)-6,CB,'left','bottom',MONO);
      const mx=Math.max(...traj.map(s=>Math.max(s.f,s.r)))*1.1||1;const P2=panel(ctx,{x:44,y:hh+14,w:w-58,h:hh-24},[0,tm],[0,mx],{xn:4,yn:2,xlabel:'time (s)',ylabel:'rate (M/s)',color:T.ink});
      curve(ctx,P2,x=>at(x).f,0,tm,CA,2.4,120);curve(ctx,P2,x=>at(x).r,0,tm,CB,2.4,120,[6,3]);line(ctx,P2,t,0,t,mx,T.hot,1.5,[4,3]);label(ctx,'forward',P2.X(tm)-4,P2.Y(at(tm).f)-6,CA,'right','bottom',MONO);label(ctx,'reverse (dashed)',P2.X(tm)-4,P2.Y(at(tm).r)+6,CB,'right','top',MONO);}});
  function updR(){const q=A>1e-9?Q(A,B):Infinity,k=K(),s=Math.abs(Math.log(q/k))<.03||(!run&&t>0&&Math.abs(Math.log(q/k))<.05);setText('eq2-A',fmt(A,3)+' M');setText('eq2-B',fmt(B,3)+' M');setText('eq2-Q',isFinite(q)?kfmt(q):'∞');setText('eq2-kval',kfmt(k));
    setText('eq2-st',!isFinite(q)||q>k*1.03?'Q > K: shifting left':q<k/1.03?'Q < K: shifting right':'Q = K: equilibrium');setText('eq2-k-out','K = '+kfmt(k));}
  function upd(){precompute();t=0;run=false;$('#eq2-go').textContent='Start';ents=[];init();sim.render();gs.render();updR();}
  bindRange('eq2-k',()=>'',upd,false);typeS.addEventListener('change',upd);stS.addEventListener('change',upd);
  $('#eq2-go').addEventListener('click',()=>{if(run){run=false;$('#eq2-go').textContent='Resume';return;}if(t>=24||t===0&&false)upd();run=true;$('#eq2-go').textContent='Pause';sim.render();const tick=()=>{gs.render();if(run)requestAnimationFrame(tick);};tick();});
  $('#eq2-lab').addEventListener('labreset',upd);upd();
  /* Q vs K lab */
  const QR=[{t:'N₂O₄ ⇌ 2NO₂   (K = 0.36)',K:.36,r:1,p:2,rn:'N₂O₄',pn:'NO₂'},{t:'A ⇌ B   (K = 4.0)',K:4,r:1,p:1,rn:'A',pn:'B'},{t:'2A ⇌ B   (K = 0.50)',K:.5,r:2,p:1,rn:'A',pn:'B'}];
  const qs=$('#qk-rx'),qc=$('#qk-canvas');qs.innerHTML=QR.map((r,i)=>`<option value="${i}">${r.t}</option>`).join('');
  let qa=1,qb=.5,qrun=false;
  const qQ=(a,b,r)=>Math.pow(b,r.p)/Math.pow(a,r.r);
  /* equilibrium extent by bisection: x>0 forward */
  function qx(a,b,r){let lo=-b/r.p+1e-12,hi=a/r.r-1e-12;for(let i=0;i<80;i++){const m=(lo+hi)/2,q=qQ(a-r.r*m,b+r.p*m,r);q<r.K?lo=m:hi=m;}return (lo+hi)/2;}
  let sh=0;const qsim=sim2d(qc,{h:()=>250,step(dt){if(!qrun)return;sh=Math.min(1,sh+dt*.5);if(sh>=1)qrun=false;},
    draw(ctx,w,h){const r=QR[+qs.value],a0=+$('#qk-a').value,b0=+$('#qk-b').value,x=qx(a0,b0,r),e=sh<1?(1-Math.pow(1-sh,2)):1,a=a0-r.r*x*e,b=b0+r.p*x*e;
      const bx=50,bw=w-70,top=14,bh=130,mx=Math.max(2.2,a0+b0+1);const ax=v=>top+bh-bh*v/mx;
      ctx.strokeStyle=T.muted;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(bx,top);ctx.lineTo(bx,top+bh);ctx.lineTo(bx+bw,top+bh);ctx.stroke();label(ctx,'M',bx-8,top,T.muted,'right','top',MONO);
      [[a,'#3E7BDC',r.rn,.25],[b,'#2FA36B',r.pn,.6]].forEach(([v,c,n,fx])=>{const x0=bx+bw*fx-30;ctx.fillStyle=c;ctx.fillRect(x0,ax(v),60,top+bh-ax(v));label(ctx,fmt(v,2),x0+30,ax(v)-8,T.ink,'center','bottom',MONO);label(ctx,n,x0+30,top+bh+14,T.ink,'center','middle',MONO);});
      /* number line for log Q vs log K */
      const ny=h-48,lg=v=>Math.log10(v),lo=-3,hi=3,X=v=>bx+bw*(clamp(lg(v),lo,hi)-lo)/(hi-lo);ctx.strokeStyle=T.muted;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx,ny);ctx.lineTo(bx+bw,ny);ctx.stroke();
      for(let p=lo;p<=hi;p++){ctx.beginPath();ctx.moveTo(bx+bw*(p-lo)/(hi-lo),ny-4);ctx.lineTo(bx+bw*(p-lo)/(hi-lo),ny+4);ctx.stroke();label(ctx,'10'+(p<0?'⁻':'')+['⁰','¹','²','³'][Math.abs(p)],bx+bw*(p-lo)/(hi-lo),ny+16,T.muted,'center','middle',MONO);}
      const q=qQ(a,b,r);dot(ctx,X(r.K),ny,7,T.ink);label(ctx,'K',X(r.K),ny-14,T.ink,'center','bottom',MONO);dot(ctx,X(q),ny,6,T.ca);label(ctx,'Q',X(q),ny+30,T.ca,'center','top',MONO);
      const q0=qQ(a0,b0,r);if(sh<1&&Math.abs(Math.log(q0/r.K))>.03){const dir=q0<r.K?1:-1;arrow(ctx,X(q0)+dir*10,ny-30,X(q0)+dir*60,ny-30,T.hot,3);label(ctx,dir>0?'shifts right':'shifts left',X(q0)+dir*35,ny-40,T.hot,'center','bottom',MONO);}}});
  function qupd(){const r=QR[+qs.value],a0=+$('#qk-a').value,b0=+$('#qk-b').value,q=qQ(a0,b0,r);setText('qk-a-out',fmt(a0,2)+' M');setText('qk-b-out',fmt(b0,2)+' M');setText('qk-Q',kfmt(q));setText('qk-K',kfmt(r.K));
    setText('qk-dir',Math.abs(Math.log(q/r.K))<.03?'At equilibrium: no net change':q<r.K?'Q < K: forward (toward products)':'Q > K: reverse (toward reactants)');qsim.render();}
  bindRange('qk-a',()=>'',()=>{sh=0;qrun=false;qupd();},false);bindRange('qk-b',()=>'',()=>{sh=0;qrun=false;qupd();},false);qs.addEventListener('change',()=>{sh=0;qrun=false;qupd();});
  $('#qk-go').addEventListener('click',()=>{sh=0;qrun=true;qsim.render();});$('#qk-lab').addEventListener('labreset',()=>{sh=0;qrun=false;qupd();});qupd();
  drawers.equilibrium=()=>{sim.render();gs.render();qupd();};
  TIPS['eq2-type']='A ⇌ B has K = [B]/[A]; 2A ⇌ B has K = [B]/[A]².';
  TIPS['eq2-k']='K sets the final ratio of products to reactants. It does not change how fast you get there.';
  TIPS['eq2-start']='The same equilibrium mixture is reached from either side.';
  TIPS['qk-rx']='Pick a reaction; its K is fixed at the given temperature.';
  TIPS['qk-a']='Raise the reactant concentration and Q gets smaller.';
  TIPS['qk-b']='Raise the product concentration and Q gets bigger.';
  KEYS['eq2-canvas']=['Press Start. A ring marks a particle that just switched sides.',[['#3E7BDC','A'],['#2FA36B','B']]];
  GLOSS['equilibrium']='The state where forward and reverse rates are equal, so concentrations stop changing.';
  GLOSS['reaction quotient']='Q: the equilibrium expression evaluated with the current concentrations.';
  GLOSS['dynamic equilibrium']='Both reactions continue at equal rates, so amounts stay constant.';
  GLOSS['equilibrium constant']='K: the value of Q at equilibrium; it depends only on temperature.';
  TT.equilibrium='Insist on "equal rates, not equal amounts". Starting from the product side is the quickest way to show that K does not depend on the path.';
})();
(function(){
  const EX=[{eq:'N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',sp:[['N₂',1],['H₂',3],['NH₃',-2]]},{eq:'H₂(g) + I₂(g) ⇌ 2HI(g)',sp:[['H₂',1],['I₂',1],['HI',-2]]},{eq:'2SO₂(g) + O₂(g) ⇌ 2SO₃(g)',sp:[['SO₂',2],['O₂',1],['SO₃',-2]]},{eq:'N₂O₄(g) ⇌ 2NO₂(g)',sp:[['N₂O₄',1],['NO₂',-2]]},{eq:'CO(g) + 2H₂(g) ⇌ CH₃OH(g)',sp:[['CO',1],['H₂',2],['CH₃OH',-1]]}];
  const KX=(rx,c)=>{let r=1;rx.sp.forEach(([n,k],i)=>{r*=Math.pow(c[i],k>0?-k:-k);});return r;}; /* products have negative k in my notation: exponent -k = +coef */
  PROBS.push({id:'eq-K',topic:'equilibrium',title:'Calculate Kc',gen(){const rx=pick(EX),c=rx.sp.map(()=>pick([.10,.15,.20,.25,.30,.40,.50,.60])),K=KX(rx,c);
    return {q:`At equilibrium, ${rx.eq} has ${rx.sp.map((s,i)=>`[${s[0]}] = ${fmt(c[i],2)} M`).join(', ')}. What is K<sub>c</sub>?`,ans:K,unit:'',tol:.02,hint:'Products over reactants, each raised to its coefficient.',sol:`K<sub>c</sub> = ${rx.sp.filter(s=>s[1]<0).map(s=>`[${s[0]}]${-s[1]>1?'<sup>'+(-s[1])+'</sup>':''}`).join('')} / (${rx.sp.filter(s=>s[1]>0).map(s=>`[${s[0]}]${s[1]>1?'<sup>'+s[1]+'</sup>':''}`).join('')}) = <b>${sci(K,3)}</b>.`};}});
  PROBS.push({id:'eq-Q',topic:'equilibrium',title:'Which way does it shift?',gen(){const rx=pick(EX),c0=rx.sp.map(()=>pick([.10,.20,.30,.50,.80])),Q=KX(rx,c0),f=pick([.1,.25,4,10]),K=Q*f,ch=['Forward (toward products)','Reverse (toward reactants)','It is already at equilibrium'];
    return {q:`For ${rx.eq}, K<sub>c</sub> = ${sci(K,3)}. A mixture has ${rx.sp.map((s,i)=>`[${s[0]}] = ${fmt(c0[i],2)} M`).join(', ')}. In which direction will the reaction proceed?`,choices:ch,ans:Q<K?0:1,hint:'Compute Q with the same expression as K, then compare Q with K.',sol:`Q = ${sci(Q,3)}; K = ${sci(K,3)}. Q ${Q<K?'&lt;':'&gt;'} K, so the reaction goes <b>${Q<K?'forward':'in reverse'}</b>.`};}});
  PROBS.push({id:'eq-Kp',topic:'equilibrium',title:'Kp from Kc',gen(){const rx=pick([['N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',-2],['2SO₂(g) + O₂(g) ⇌ 2SO₃(g)',-1],['N₂O₄(g) ⇌ 2NO₂(g)',1],['H₂(g) + I₂(g) ⇌ 2HI(g)',0],['PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)',1]]),Kc=pick([.25,1.8,12,0.040,150]),T=pick([400,500,600,800,1000]),Kp=Kc*Math.pow(.08206*T,rx[1]);
    return {q:`For ${rx[0]}, K<sub>c</sub> = ${fmt(Kc,Kc<.1?3:2)} at ${T} K. What is K<sub>p</sub>? (R = 0.08206 L·atm/mol·K)`,ans:Kp,unit:'',tol:.02,hint:'Kp = Kc(RT)^Δn, where Δn = moles of gas in products − moles of gas in reactants.',sol:`Δn = ${rx[1]}; RT = ${fmt(.08206*T,2)}; K<sub>p</sub> = ${fmt(Kc,Kc<.1?3:2)} × ${fmt(.08206*T,2)}<sup>${rx[1]}</sup> = <b>${sci(Kp,3)}</b>.`};}});
  const XE=[['CaCO₃(s) ⇌ CaO(s) + CO₂(g)','K = [CO₂]',['K = [CaO][CO₂]/[CaCO₃]','K = [CO₂]','K = [CaCO₃]/[CO₂]','K = [CaO]/[CaCO₃]'],1],
    ['Fe₃O₄(s) + 4H₂(g) ⇌ 3Fe(s) + 4H₂O(g)','K = [H₂O]⁴/[H₂]⁴',['K = [Fe]³[H₂O]⁴/([Fe₃O₄][H₂]⁴)','K = [H₂]⁴/[H₂O]⁴','K = [H₂O]⁴/[H₂]⁴','K = [Fe]³/[Fe₃O₄]'],2],
    ['2NO₂(g) ⇌ N₂O₄(g)','K = [N₂O₄]/[NO₂]²',['K = [NO₂]²/[N₂O₄]','K = [N₂O₄]/[NO₂]','K = [N₂O₄]/[NO₂]²','K = 2[N₂O₄]/[NO₂]'],2],
    ['AgCl(s) ⇌ Ag⁺(aq) + Cl⁻(aq)','K = [Ag⁺][Cl⁻]',['K = [Ag⁺][Cl⁻]/[AgCl]','K = [AgCl]/([Ag⁺][Cl⁻])','K = [Ag⁺][Cl⁻]','K = [Ag⁺] + [Cl⁻]'],2],
    ['C(s) + CO₂(g) ⇌ 2CO(g)','K = [CO]²/[CO₂]',['K = [CO]²/([C][CO₂])','K = [CO]/[CO₂]','K = [CO]²/[CO₂]','K = [CO₂]/[CO]²'],2]];
  PROBS.push({id:'eq-expr',topic:'equilibrium',title:'Write the K expression',gen(){const [rx,,ch,a]=pick(XE);const i=Math.floor(Math.random()*4),shuffled=ch.slice(),corr=ch[a];const arr=ch.filter((x,j)=>j!==a);arr.splice(i,0,corr);
    return {q:`Which is the correct equilibrium-constant expression for ${rx}?`,choices:arr,ans:i,hint:'Products over reactants with coefficients as exponents; leave out pure solids and liquids.',sol:`<b>${corr}</b>. Pure solids and liquids (their concentrations are constant) don't appear.`};}});
  PROBS.push({id:'eq-manip',topic:'equilibrium',title:'Manipulating K',gen(){const K1=pick([.020,.50,4.0,25,150]),K2=pick([.10,2.5,8.0,40]),v=pick([0,1,2,3]);let q,ans,sol;
    if(v===0){q=`For reaction 1, K = ${fmt(K1,K1<.1?3:2)}. What is K for the reverse of reaction 1?`;ans=1/K1;sol=`K<sub>reverse</sub> = 1/K = <b>${sci(ans,3)}</b>.`;}
    else if(v===1){q=`For A ⇌ B, K = ${fmt(K1,K1<.1?3:2)}. What is K for 2A ⇌ 2B?`;ans=K1*K1;sol=`Doubling the equation squares K: ${fmt(K1,3)}² = <b>${sci(ans,3)}</b>.`;}
    else if(v===2){q=`A ⇌ B has K<sub>1</sub> = ${fmt(K1,K1<.1?3:2)} and B ⇌ C has K<sub>2</sub> = ${fmt(K2,K2<.1?3:2)}. What is K for A ⇌ C?`;ans=K1*K2;sol=`Adding reactions multiplies K: ${fmt(K1,3)} × ${fmt(K2,3)} = <b>${sci(ans,3)}</b>.`;}
    else{q=`A ⇌ B has K<sub>1</sub> = ${fmt(K1,K1<.1?3:2)} and C ⇌ B has K<sub>2</sub> = ${fmt(K2,K2<.1?3:2)}. What is K for A ⇌ C?`;ans=K1/K2;sol=`A ⇌ C = (A ⇌ B) + (B ⇌ C), and B ⇌ C is the reverse of C ⇌ B, so K = K<sub>1</sub>/K<sub>2</sub> = <b>${sci(ans,3)}</b>.`;}
    return {q,ans,unit:'',tol:.02,hint:'Reverse: 1/K. Multiply the equation by n: K^n. Add equations: multiply K values.',sol};}});
})();
