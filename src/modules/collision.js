
/* ---------------- Collision theory & activation energy ---------------- */
const RK=8.314e-3; /* kJ/mol·K */
function mbTail(Ea,T){const rt=RK*T,x0=Ea/rt,N=800,top=x0+45;let s=0;const f=x=>2/Math.sqrt(Math.PI)*Math.sqrt(x)*Math.exp(-x);const hh=(top-x0)/N;
  for(let i=0;i<=N;i++){const x=x0+i*hh;s+=f(x)*(i===0||i===N?1:i%2?4:2);}return s*hh/3;}
const mbDens=(E,T)=>{const rt=RK*T,x=E/rt;return 2/Math.sqrt(Math.PI)*Math.sqrt(x)*Math.exp(-x)/rt;};
function peCurve(dh,ea){const sm=x=>x*x*(3-2*x),g=x=>Math.exp(-Math.pow((x-.5)/.2,2));
  let lo=0,hi=400;const mx=B=>{let m=-1e9;for(let i=0;i<=200;i++){const x=i/200,e=dh*sm(x)+B*g(x);if(e>m)m=e;}return m;};
  for(let i=0;i<50;i++){const mid=(lo+hi)/2;mx(mid)<ea?lo=mid:hi=mid;}const B=(lo+hi)/2;return x=>dh*sm(x)+B*g(x);}
(function collision(){
  const cv=$('#cl-canvas');if(!cv)return;
  const tS=$('#cl-t'),eS=$('#cl-ea'),cat=$('#cl-cat'),ori=$('#cl-or'),zm=$('#cl-zoom');
  const H=250,gauss=()=>Math.sqrt(-2*Math.log(1-Math.random()))*Math.cos(6.2832*Math.random());let P=[],fl=[],nR=0;
  const Eeff=()=>+eS.value*(cat.checked?.6:1);
  function fill(){const w=cv.clientWidth||300;P=[];for(let i=0;i<38;i++){const s=70;P.push({x:10+Math.random()*(w-20),y:10+Math.random()*(H-20),vx:gauss()*s,vy:gauss()*s,th:Math.random()*6.28,w:(Math.random()-.5)*3,hot:0});}fl=[];nR=0;}
  function scaleV(){const k=Math.sqrt(+tS.value/(scaleV.last||300));P.forEach(p=>{p.vx*=k;p.vy*=k;});scaleV.last=+tS.value;}
  const sim=sim2d(cv,{h:()=>H,step(dt){const w=cv.clientWidth,T=+tS.value,sg=70*Math.sqrt(T/300),thr=(Eeff()/(RK*T))/6*sg*sg;
      P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.th+=p.w*dt;p.hot=Math.max(0,p.hot-dt);if(p.x<6){p.x=6;p.vx=Math.abs(p.vx);}if(p.x>w-6){p.x=w-6;p.vx=-Math.abs(p.vx);}if(p.y<6){p.y=6;p.vy=Math.abs(p.vy);}if(p.y>H-6){p.y=H-6;p.vy=-Math.abs(p.vy);}});
      for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);if(d>12||d<1e-6)continue;const nx=dx/d,ny=dy/d,vr=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(vr<=0)continue;
        const E=.25*vr*vr;let ok=E>=thr;if(ok&&ori.checked){const fa=Math.cos(a.th)*nx+Math.sin(a.th)*ny>0,fb=Math.cos(b.th)*-nx+Math.sin(b.th)*-ny>0;ok=fa&&fb;}
        if(ok&&a.hot<=0&&b.hot<=0){nR++;a.hot=b.hot=.9;fl.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2,l:.6});}
        a.vx-=vr*nx;a.vy-=vr*ny;b.vx+=vr*nx;b.vy+=vr*ny;}
      fl.forEach(f=>f.l-=dt);fl=fl.filter(f=>f.l>0);setText('cl-n',String(nR));},
    draw(ctx,w,h){ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(1,1,w-2,H-2);
      P.forEach(p=>{ball2(ctx,p.x,p.y,6,p.hot>0?'#2FA36B':'#3E7BDC');if(ori.checked){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(p.x+Math.cos(p.th)*3.6,p.y+Math.sin(p.th)*3.6,1.8,0,7);ctx.fill();}});
      fl.forEach(f=>{ctx.strokeStyle=alpha('#2FA36B',f.l*1.6);ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,6+(.6-f.l)*45,0,7);ctx.stroke();});}});
  const g=$('#cl-graph'),gs=sim2d(g,{h:()=>H,draw(ctx,w,h){const T=+tS.value,E=Eeff(),zoom=zm.checked,xmax=Math.max(70,+eS.value*1.15);
      const f=e=>mbDens(e,T),f0=e=>mbDens(e,300);const ymax=zoom?Math.max(f(E),f0(E))*4:f(RK*T/2)*1.1;
      const Pn=panel(ctx,{x:44,y:12,w:w-58,h:h-46},[0,xmax],[0,ymax],{xn:4,yn:3,xlabel:'energy (kJ/mol)',ylabel:zoom?'fraction (tail magnified)':'fraction of collisions',color:T_.ink});
      if(T!==300)curve(ctx,Pn,f0,0.01,xmax,T_.muted,1.6,300,[5,4]);
      ctx.save();clip(ctx,Pn);ctx.fillStyle=alpha(T_.hot,.35);ctx.beginPath();ctx.moveTo(Pn.X(E),Pn.Y(0));for(let e=E;e<=xmax;e+=xmax/200)ctx.lineTo(Pn.X(e),Pn.Y(f(e)));ctx.lineTo(Pn.X(xmax),Pn.Y(0));ctx.closePath();ctx.fill();ctx.restore();
      curve(ctx,Pn,f,0.01,xmax,T_.cx,2.4,300);ctx.save();clip(ctx,Pn);ctx.strokeStyle=T_.ink;ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.beginPath();ctx.moveTo(Pn.X(E),Pn.box.y);ctx.lineTo(Pn.X(E),Pn.box.y+Pn.box.h);ctx.stroke();ctx.restore();
      label(ctx,'Eₐ',Pn.X(E)+4,Pn.box.y+10,T_.ink,'left','middle',MONO);if(T!==300)label(ctx,'dashed: 300 K',Pn.box.x+Pn.box.w-4,Pn.box.y+10,T_.muted,'right','middle',MONO);}});
  const T_=T;
  function upd(){const T=+tS.value,E=Eeff();setText('cl-t-out',T+' K');setText('cl-ea-out',eS.value+' kJ/mol');setText('cl-ee',fmt(E,0)+' kJ/mol');setText('cl-fr',sci(mbTail(E,T),2));
    const rel=Math.exp(-E/(RK*T))/Math.exp(-(+eS.value)/(RK*300));setText('cl-rel',(rel>=.01&&rel<1000?fmt(rel,2):sci(rel,2))+'×');scaleV();sim.render();gs.render();}
  bindRange('cl-t',()=>'',upd,false);bindRange('cl-ea',()=>'',upd,false);[cat,ori,zm].forEach(c=>c.addEventListener('change',()=>{upd();}));
  $('#cl-lab').addEventListener('labreset',()=>{fill();scaleV.last=300;upd();});
  fill();scaleV.last=300;upd();drawers.collision=upd;
  /* energy hill */
  const pc=$('#eh-canvas'),dh=$('#eh-dh'),pea=$('#eh-ea'),pcat=$('#eh-cat');let u=0,roll=false,wait=0;
  const dims=()=>{const D=+dh.value,Ea0=Math.max(+pea.value,Math.max(0,D)+8),Ea=pcat.checked?Math.max(Ea0*.6,Math.max(0,D)+8):Ea0;return {D,Ea0,Ea};};
  const psim=sim2d(pc,{h:()=>280,step(dt){if(!roll)return;const {D,Ea}=dims(),f=peCurve(D,Ea);if(wait>0){wait-=dt;if(wait<=0)u=0;return;}const Et=Ea*1.04,v=Math.sqrt(Math.max(Et-f(u),.02*Et))*.06;u+=v*dt;if(u>=1){u=1;wait=1.2;}},
    draw(ctx,w,h){const {D,Ea0,Ea}=dims(),box={x:56,y:14,w:w-72,h:h-44},lo=Math.min(0,D)-10,hi=Math.max(Ea0,Ea)+Math.max(0,D)*0+16;
      const Pn=panel(ctx,box,[0,1],[lo,hi],{xn:1,yn:4,ylabel:'energy (kJ/mol)',color:T_.ink});ctx.save();ctx.fillStyle=T_.muted;ctx.font=MONO;ctx.textAlign='center';ctx.fillText('reaction progress →',box.x+box.w/2,box.y+box.h+16);ctx.restore();
      if(pcat.checked)curve(ctx,Pn,peCurve(D,Ea0),0,1,T_.muted,1.6,200,[5,4]);const f=peCurve(D,Ea);curve(ctx,Pn,f,0,1,pcat.checked?T_.cv:T_.cx,2.8,240);
      line(ctx,Pn,0,0,.25,0,T_.muted,1,[3,3]);line(ctx,Pn,.5,0,.5,Ea,T_.hot,1,[3,3]);
      arrow(ctx,Pn.X(.12),Pn.Y(0),Pn.X(.12),Pn.Y(Ea),T_.hot,2);label(ctx,'Eₐ',Pn.X(.12)+6,Pn.Y(Ea/2),T_.hot,'left','middle',MONO);
      arrow(ctx,Pn.X(.92),Pn.Y(0),Pn.X(.92),Pn.Y(D),T_.ca,2);label(ctx,'ΔH',Pn.X(.92)-6,Pn.Y(D/2),T_.ca,'right','middle',MONO);
      label(ctx,'reactants',Pn.X(.05),Pn.Y(0)-12,T_.ink,'left','bottom',MONO);label(ctx,'products',Pn.X(.86),Pn.Y(D)-12,T_.ink,'right','bottom',MONO);label(ctx,'transition state',Pn.X(.5),Pn.Y(Ea)-8,T_.ink,'center','bottom',MONO);
      const bx=Pn.X(u),by=Pn.Y(f(u));ball2(ctx,bx,by-8,8,u<.5?'#3E7BDC':'#2FA36B');}});
  function pupd(){const {D,Ea0,Ea}=dims();setText('eh-dh-out',dh.value+' kJ/mol');setText('eh-ea-out',pea.value+' kJ/mol');setText('eh-f',fmt(Ea,0)+' kJ/mol');setText('eh-r',fmt(Ea-D,0)+' kJ/mol');setText('eh-d',(D>0?'+':D<0?'−':'')+Math.abs(D)+' kJ/mol');setText('eh-ty',D<0?'exothermic':D>0?'endothermic':'thermoneutral');psim.render();}
  bindRange('eh-dh',()=>'',pupd,false);bindRange('eh-ea',()=>'',pupd,false);pcat.addEventListener('change',pupd);
  $('#eh-go').addEventListener('click',()=>{roll=true;u=0;wait=0;psim.render();});
  $('#eh-lab').addEventListener('labreset',()=>{roll=false;u=0;pupd();});
  pupd();drawers.collision=()=>{upd();pupd();};
  TIPS['cl-t']='Hotter gas: the whole curve flattens and the tail beyond Eₐ grows much faster than the average.';
  TIPS['cl-ea']='A taller hill means fewer collisions clear it.';
  TIPS['cl-cat']='A catalyst gives a lower hill. Same temperature, same curve, but Eₐ moves left into a fatter region.';
  TIPS['cl-or']='Collisions only count if both particles face each other; white dots mark each particle\'s reactive side.';
  TIPS['cl-zoom']='Rescales the vertical axis so the tail above Eₐ is visible.';
  TIPS['eh-dh']='ΔH sets how far the products sit below or above the reactants.';
  TIPS['eh-ea']='Eₐ is measured from the reactants to the top of the hill.';
  TIPS['eh-cat']='The catalyst path (colored) is lower; the original path is dashed.';
  KEYS['cl-canvas']=['Raise the temperature and watch the green rings.',[['#3E7BDC','reactant particles'],['#2FA36B','reacting']]];
  GLOSS['activation energy']='The minimum energy colliding particles need to react; the height of the energy hill.';
  GLOSS['catalyst']='A substance that speeds up a reaction by lowering the activation energy, and is not consumed.';
  GLOSS['transition state']='The highest-energy arrangement of atoms on the way from reactants to products.';
  TT.collision='Connect to the Unit 3 Maxwell-Boltzmann module: same curve, now with Eₐ marked. Stress that a catalyst changes the path, not the endpoints.';
})();
(function(){
  const R=8.314;
  PROBS.push({id:'col-arr',topic:'collision',title:'Rate change with temperature',gen(){const Ea=pick([50,60,75,85]),T1=pick([290,300,310]),T2=T1+pick([10,20,30,50]),r=Math.exp(Ea*1000/R*(1/T1-1/T2));
    return {q:`A reaction has E<sub>a</sub> = ${Ea} kJ/mol. By what factor does its rate constant increase when the temperature rises from ${T1} K to ${T2} K? (R = 8.314 J/mol·K)`,ans:r,unit:'×',tol:.03,hint:'ln(k₂/k₁) = (Eₐ/R)(1/T₁ − 1/T₂). Use Eₐ in joules.',sol:`ln(k₂/k₁) = (${Ea*1000}/8.314)(1/${T1} − 1/${T2}) = ${fmt(Math.log(r),3)}, so k₂/k₁ = <b>${fmt(r,2)}</b>.`};}});
  PROBS.push({id:'col-ea',topic:'collision',title:'Eₐ from two rate constants',gen(){const Ea=pick([45,60,75,90]),T1=pick([300,310]),T2=T1+pick([30,40,50]),k1=pick([1.5e-3,4.0e-4,2.2e-2]),k2=+(k1*Math.exp(Ea*1000/R*(1/T1-1/T2))).toPrecision(3),E=R*Math.log(k2/k1)/(1/T1-1/T2)/1000;
    return {q:`A first-order reaction has k = ${sci(k1,2)} s⁻¹ at ${T1} K and k = ${sci(k2,3)} s⁻¹ at ${T2} K. What is the activation energy? (R = 8.314 J/mol·K)`,ans:E,unit:'kJ/mol',tol:.03,hint:'Rearrange ln(k₂/k₁) = (Eₐ/R)(1/T₁ − 1/T₂) for Eₐ.',sol:`Eₐ = R·ln(k₂/k₁) ÷ (1/${T1} − 1/${T2}) = <b>${fmt(E,1)} kJ/mol</b>.`};}});
  PROBS.push({id:'col-diag',topic:'collision',title:'Read an energy diagram',gen(){const Rr=pick([10,20,30,40]),TS=Rr+pick([45,60,75,90]),Pp=Rr+pick([-50,-30,-15,20]),what=pick(['fwd','rev','dh']);
    const ans=what==='fwd'?TS-Rr:what==='rev'?TS-Pp:Pp-Rr,nm={fwd:'activation energy of the forward reaction',rev:'activation energy of the reverse reaction',dh:'ΔH of the forward reaction'}[what];
    return {q:`On an energy diagram the reactants are at ${Rr} kJ/mol, the transition state at ${TS} kJ/mol and the products at ${Pp} kJ/mol. What is the ${nm}?`,ans:ans,unit:'kJ/mol',abs:.5,hint:'Forward Eₐ = TS − reactants; reverse Eₐ = TS − products; ΔH = products − reactants.',sol:`${what==='fwd'?`${TS} − ${Rr}`:what==='rev'?`${TS} − (${Pp})`:`${Pp} − ${Rr}`} = <b>${ans} kJ/mol</b>.`};}});
  PROBS.push({id:'col-slope',topic:'collision',title:'Eₐ from an Arrhenius plot',gen(){const Ea=pick([40,55,70,95,110]),sl=+(-Ea*1000/R).toPrecision(3);
    return {q:`A plot of ln k vs 1/T (T in kelvin) is a straight line with slope ${sci(sl,3)} K. What is the activation energy? (R = 8.314 J/mol·K)`,ans:-sl*R/1000,unit:'kJ/mol',tol:.02,hint:'The slope of ln k vs 1/T is −Eₐ/R.',sol:`Eₐ = −slope × R = ${fmt(-sl,0)} × 8.314 = ${fmt(-sl*R,0)} J/mol = <b>${fmt(-sl*R/1000,1)} kJ/mol</b>.`};}});
  const CQ=[['A catalyst is added to a reaction at constant temperature. Which quantity does NOT change?',['The activation energy','The overall ΔH','The rate constant k','The reaction pathway'],1,'A catalyst changes the path and the activation energy (so k), but the reactants and products are the same, so ΔH stays the same.'],
    ['Why does a modest rise in temperature increase a reaction rate so much?',['The particles collide a few percent more often','A much larger fraction of collisions has energy of at least Eₐ','Eₐ decreases when it is hot','The reaction becomes less exothermic'],1,'The fraction of collisions above Eₐ is exponentially sensitive to temperature; the collision frequency rises only slightly.'],
    ['When the temperature of a gas rises, how does its Boltzmann energy distribution change?',['The peak moves to lower energy','It becomes narrower and taller','The peak flattens, moves right and the high-energy tail grows','Nothing changes except the area'],2,'The curve flattens and shifts to higher energy; the area stays 1, but the tail above Eₐ grows.'],
    ['Which statement about a catalyst is true?',['It lowers the activation energy of both forward and reverse reactions','It increases the yield at equilibrium','It supplies energy to the reactants','It is consumed in the reaction'],0,'A catalyst lowers the barrier in both directions and is regenerated; it doesn\'t change the equilibrium position.'],
    ['Two particles collide with enough energy but the wrong orientation. What most likely happens?',['They react anyway','They bounce apart','They form a catalyst','They gain energy'],1,'Effective collisions need enough energy and the correct orientation.']];
  PROBS.push({id:'col-concept',topic:'collision',title:'Collision-theory concept',gen(){const [q,ch,a,why]=pick(CQ);return {q,choices:ch,ans:a,hint:'Think about the hill the particles must climb and what a catalyst or heat does to it.',sol:why};}});
})();

(function(){
  const Q=[['In a catalytic converter, solid platinum speeds up gas-phase reactions. This is…',['heterogeneous catalysis','homogeneous catalysis','an enzyme','an inhibitor'],0,'the catalyst (solid) is in a different phase from the reactants (gases)'],['Iodide ions dissolved in water speed up the decomposition of dissolved H₂O₂. This is…',['homogeneous catalysis','heterogeneous catalysis','a surface reaction','an enzyme'],0,'catalyst and reactants are in the same (aqueous) phase'],['An enzyme speeds up a biochemical reaction by…',['providing an active site that lowers the activation energy','raising the temperature of the cell','changing ΔH of the reaction','increasing the equilibrium constant'],0,'the substrate binds in the right orientation and the transition state is stabilized'],['Adding a catalyst to a reaction at equilibrium…',['reaches equilibrium faster but does not change the amounts at equilibrium','shifts it toward products','increases K','changes ΔH'],0,'both directions speed up equally']];
  PROBS.push({id:'col-cattype',topic:'collision',title:'Types of catalysts',gen(){const [q,ch,a,why]=pick(Q);return {q,choices:ch,ans:a,hint:'Compare the phase of the catalyst with that of the reactants, and remember what catalysts can and cannot change.',sol:`<b>${ch[a]}</b>: ${why}.`};}});
})();
