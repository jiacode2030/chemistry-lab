
/* ---------------- Le Châtelier ---------------- */
const LCR=[{t:'N₂O₄ ⇌ 2NO₂  (endothermic)',sp:[{n:'N₂O₄',nu:-1,col:'#9FB6CC',g:true},{n:'NO₂',nu:2,col:'#B5651D',g:true}],dH:57.2,K1:4.6e-3,T1:298,n0:[.5,0],T:350,V:2,solution:false,tint:[1,'#B5651D']},
 {t:'N₂ + 3H₂ ⇌ 2NH₃  (exothermic)',sp:[{n:'N₂',nu:-1,col:'#3E7BDC',g:true},{n:'H₂',nu:-3,col:'#C8D2DE',g:true},{n:'NH₃',nu:2,col:'#2FA36B',g:true}],dH:-92.2,K1:3.5e8,T1:298,n0:[1,3,0],T:500,V:2,solution:false},
 {t:'Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺  (in water)',sp:[{n:'Fe³⁺',nu:-1,col:'#E0A82E'},{n:'SCN⁻',nu:-1,col:'#8B5CF6'},{n:'FeSCN²⁺',nu:1,col:'#D6303A'}],dH:0,K1:300,T1:298,n0:[.02,.02,0],T:298,V:2,solution:true,tint:[2,'#D6303A']}];
function lcK(r,T){return r.solution?r.K1:r.K1*Math.exp(-r.dH*1000/8.314*(1/T-1/r.T1));}
function lcQ(r,n,V){let q=1;r.sp.forEach((s,i)=>{q*=Math.pow(Math.max(n[i],1e-12)/V,s.nu);});return q;}
function lcXi(r,n,V,K){let lo=-Infinity,hi=Infinity;r.sp.forEach((s,i)=>{if(s.nu>0)lo=Math.max(lo,-n[i]/s.nu);else hi=Math.min(hi,n[i]/-s.nu);});lo+=1e-12;hi-=1e-12;if(lo>hi)return 0;
  for(let i=0;i<200;i++){const m=(lo+hi)/2,nn=n.map((v,j)=>v+r.sp[j].nu*m);lcQ(r,nn,V)<K?lo=m:hi=m;}return (lo+hi)/2;}
(function lechatelier(){
  const cv=$('#lc-canvas');if(!cv)return;const rs=$('#lc-rx'),tS=$('#lc-t'),vS=$('#lc-v'),ss=$('#lc-sp');rs.innerHTML=LCR.map((r,i)=>`<option value="${i}">${r.t}</option>`).join('');
  let r=LCR[0],n=[],hist=[],marks=[],tm=0,P=[],scale=20,V=2,lastQ=0;const H=270,TAU=1.2,HM=36;
  const cur=()=>({K:lcK(r,+tS.value),V:+vS.value});
  function load(){r=LCR[+rs.value];ss.innerHTML=r.sp.map((s,i)=>`<option value="${i}">${s.n}</option>`).join('');tS.value=r.T;vS.value=r.V;tS.disabled=r.solution;vS.min=r.solution?1:.5;
    V=r.V;n=r.n0.slice();let K=lcK(r,r.T);const xi=lcXi(r,n,V,K);n=n.map((v,i)=>Math.max(v+r.sp[i].nu*xi,0));scale=34/(n.reduce((a,b)=>a+b,0)||1);hist=[];marks=[];tm=0;P=[];sync();upd();}
  function sync(){const w=cv.clientWidth||300;r.sp.forEach((s,i)=>{const want=Math.min(110,Math.round(n[i]*scale));P=P.filter(p=>p.i!==i||true);let have=P.filter(p=>p.i===i);while(have.length<want){const a=Math.random()*6.28;P.push({i,x:12+Math.random()*(w-24),y:12+Math.random()*(H-24),vx:Math.cos(a)*90,vy:Math.sin(a)*90});have=P.filter(p=>p.i===i);}
      while(have.length>want){const k=P.indexOf(have.pop());P.splice(k,1);}});}
  const conc=()=>n.map(v=>v/V);
  const sim=sim2d(cv,{h:()=>H,step(dt){const K=lcK(r,+tS.value);V+=(+vS.value-V)*Math.min(1,dt*6);
      const xi=lcXi(r,n,V,K),f=1-Math.exp(-dt/TAU);n=n.map((v,i)=>Math.max(v+r.sp[i].nu*xi*f,0));tm+=dt;if(!hist.length||tm-hist[hist.length-1].t>.1)hist.push({t:tm,c:conc(),Q:lcQ(r,n,V),K});
      if(hist.length>HM*10)hist.shift();sync();const w=cv.clientWidth,top=H*(1-(V/4)*.9+.1*0)-0;
      const ht=clamp(V/4,.2,1)*H;P.forEach(p=>{p.x+=p.vx*dt*Math.sqrt(+tS.value/300);p.y+=p.vy*dt*Math.sqrt(+tS.value/300);if(p.x<8||p.x>w-8)p.vx*=-1;const lim=H-ht;if(p.y<lim+8){p.y=lim+8;p.vy=Math.abs(p.vy);}if(p.y>H-8){p.y=H-8;p.vy=-Math.abs(p.vy);}p.x=clamp(p.x,8,w-8);});upd(true);},
    draw(ctx,w,h){const ht=clamp(V/4,.2,1)*H,y0=H-ht,c=conc();
      if(r.tint){const cc=c[r.tint[0]],a=clamp(cc/(r.solution?.012:.35),0,1)*.55;ctx.fillStyle=alpha(r.tint[1],a);ctx.fillRect(0,y0,w,ht);}else{ctx.fillStyle=alpha('#3E7BDC',.05);ctx.fillRect(0,y0,w,ht);}
      ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(1,y0,w-2,ht-1);
      ctx.fillStyle=T.muted;ctx.fillRect(2,y0-8,w-4,8);ctx.fillRect(w/2-3,0,6,y0-8);
      P.forEach(p=>ball2(ctx,p.x,p.y,6,r.sp[p.i].col,'rgba(0,0,0,.25)'));
      r.sp.forEach((s,i)=>{ctx.fillStyle=s.col;ctx.beginPath();ctx.arc(14+i*70,H+12,5,0,7);ctx.fill();label(ctx,s.n,24+i*70,H+12,T.ink,'left','middle',MONO);});}});
  const g=$('#lc-graph'),gs=sim2d(g,{h:()=>H+24,draw(ctx,w,h){const hh=h-70;let mx=0;hist.forEach(q=>q.c.forEach(v=>mx=Math.max(mx,v)));mx=mx*1.15||1;const t1=hist.length?hist[hist.length-1].t:HM,t0=Math.max(0,t1-HM);
      const Pn=panel(ctx,{x:50,y:10,w:w-64,h:hh-14},[t0,t0+HM],[0,mx],{xn:4,yn:3,xlabel:'time (s)',ylabel:'concentration (M)',color:T.ink});
      r.sp.forEach((s,i)=>{ctx.save();clip(ctx,Pn);ctx.strokeStyle=s.col==='#C8D2DE'?'#7E94AD':s.col;ctx.lineWidth=2.4;ctx.beginPath();hist.forEach((q,j)=>{const px=Pn.X(q.t),py=Pn.Y(q.c[i]);j?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();ctx.restore();});
      marks.forEach(m=>{if(m.t>=t0){line(ctx,Pn,m.t,0,m.t,mx,T.hot,1.5,[4,3]);label(ctx,m.s,Pn.X(m.t)+3,Pn.box.y+10+((marks.indexOf(m))%3)*12,T.hot,'left','middle',MONO);}});
      /* Q vs K gauge */
      const K=lcK(r,+tS.value),Q=lcQ(r,n,V),gy=h-26,lg=v=>Math.log10(Math.max(v,1e-30)),c0=lg(K),X=v=>50+(w-64)*(clamp(lg(v)-c0,-2,2)+2)/4;ctx.strokeStyle=T.muted;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(50,gy);ctx.lineTo(w-14,gy);ctx.stroke();
      dot(ctx,X(K),gy,7,T.ink);label(ctx,'K',X(K),gy-12,T.ink,'center','bottom',MONO);dot(ctx,X(Q),gy,6,T.ca);label(ctx,'Q',X(Q),gy+14,T.ca,'center','top',MONO);label(ctx,'Q < K: → right',50,gy+14,T.muted,'left','top',MONO);label(ctx,'Q > K: ← left',w-14,gy+14,T.muted,'right','top',MONO);}});
  function upd(fromStep){const K=lcK(r,+tS.value),Q=lcQ(r,n,V);setText('lc-t-out',tS.value+' K');setText('lc-v-out',fmt(+vS.value,1)+' L');setText('lc-K',kfmt(K));setText('lc-Q',kfmt(Q));
    const d=Math.log(Q/K);setText('lc-st',Math.abs(d)<.02?'At equilibrium':d<0?'Q < K: shifting right':'Q > K: shifting left');setText('lc-sh',Math.abs(d)<.02?'none':d<0?'toward products':'toward reactants');if(!fromStep){sim.render();}gs.render();}
  const mark=s=>marks.push({t:tm,s});
  tS.addEventListener('input',()=>{mark(`T → ${tS.value} K`);upd();});vS.addEventListener('input',()=>{marks.length&&marks[marks.length-1].s.startsWith('V')&&tm-marks[marks.length-1].t<.8?marks[marks.length-1].s=`V → ${fmt(+vS.value,1)} L`:mark(`V → ${fmt(+vS.value,1)} L`);upd();});
  $('#lc-add').addEventListener('click',()=>{const i=+ss.value;n[i]+=r.solution?.01:.5*Math.max(1,r.n0[0]);mark('+'+r.sp[i].n);sync();upd();});
  $('#lc-rem').addEventListener('click',()=>{const i=+ss.value;n[i]*=.5;mark('−'+r.sp[i].n);sync();upd();});
  $('#lc-cat').addEventListener('click',()=>{mark('catalyst: no shift');$('#lc-sh').textContent='none (K and Q unchanged)';});
  rs.addEventListener('change',load);$('#lc-lab').addEventListener('labreset',load);
  bindRange('lc-t',()=>'',()=>{},false);bindRange('lc-v',()=>'',()=>{},false);load();drawers.lechatelier=()=>{sync();upd();};
  TIPS['lc-rx']='Each system has its own K(T), its own ΔH and its own number of moles on each side.';
  TIPS['lc-t']='Temperature changes K itself, not just Q.';
  TIPS['lc-v']='Changing the volume changes every concentration, so Q changes, but K does not.';
  TIPS['lc-sp']='Pick which substance the Add and Remove buttons act on.';
  KEYS['lc-canvas']=['Make a change and watch the graph react.',[['#3E7BDC','reactants'],['#2FA36B','products']]];
  GLOSS['Le Châtelier\'s principle']='If a system at equilibrium is disturbed, it shifts in the direction that partly offsets the disturbance.';
  GLOSS['shift']='A net reaction in one direction that brings Q back to K.';
  TT.lechatelier='Have students write Q vs K for every stress. It avoids rote rules and explains why catalysts, inert gases and K behave the way they do.';
})();
(function(){
  const RX=[['N₂(g) + 3H₂(g) ⇌ 2NH₃(g)',-92,-2],['N₂O₄(g) ⇌ 2NO₂(g)',57,1],['H₂(g) + I₂(g) ⇌ 2HI(g)',-9.6,0],['2SO₂(g) + O₂(g) ⇌ 2SO₃(g)',-198,-1],['CaCO₃(s) ⇌ CaO(s) + CO₂(g)',178,1],['PCl₅(g) ⇌ PCl₃(g) + Cl₂(g)',88,1],['N₂(g) + O₂(g) ⇌ 2NO(g)',180,0]];
  PROBS.push({id:'le-shift',topic:'lechatelier',title:'Which way does it shift?',gen(){const [eq,dH,dn]=pick(RX),sp=eq.split('⇌').map(s=>s.trim()),first=eq.split('⇌')[0].trim().split(' + ')[0].replace(/^\d+/,''),last=eq.split('⇌')[1].trim().split(' + ')[0].replace(/^\d+/,'');
    const solF=/\(s\)/.test(first),solL=/\(s\)/.test(last);const S=[['an additional amount of '+first.replace(/\(.*\)/,'')+(solF?' (a pure solid)':'')+' is added',()=>solF?2:0,solF?'a pure solid is not in the Q expression, so its amount doesn\'t matter':'adding a reactant lowers Q below K'],['some '+last.replace(/\(.*\)/,'')+(solL?' (a pure solid)':'')+' is removed',()=>solL?2:0,solL?'a pure solid is not in the Q expression, so removing some changes nothing':'removing a product lowers Q below K'],['the temperature is raised',()=>dH>0?0:1,dH>0?'endothermic: heat acts as a reactant, so more heat favors products':'exothermic: heat acts as a product, so more heat favors reactants'],['the temperature is lowered',()=>dH>0?1:0,dH>0?'endothermic: removing heat favors reactants':'exothermic: removing heat favors products'],['the volume of the container is decreased (pressure increases)',()=>dn<0?0:dn>0?1:2,dn<0?'fewer moles of gas on the product side':dn>0?'fewer moles of gas on the reactant side':'equal moles of gas on both sides, so no shift'],['the volume of the container is increased',()=>dn<0?1:dn>0?0:2,dn<0?'more moles of gas on the reactant side':dn>0?'more moles of gas on the product side':'equal moles of gas on both sides, so no shift'],['a catalyst is added',()=>2,'a catalyst speeds both directions equally'],['argon gas is added at constant volume',()=>2,'no concentration changes, so Q still equals K']];
    let [txt,fn,why]=pick(S);const a=fn(),ch=['Shifts toward products (right)','Shifts toward reactants (left)','No shift'];
    if((txt.includes('volume')||txt.includes('Ar')||txt.includes('argon'))&&false){}
    return {q:`For ${eq} (ΔH = ${dH>0?'+':''}${dH} kJ), what happens to the equilibrium when ${txt}?`,choices:ch,ans:a,hint:'Compare Q with K, or ask which direction would partly undo the stress.',sol:`<b>${ch[a]}</b>: ${why}.`};}});
  PROBS.push({id:'le-K',topic:'lechatelier',title:'What changes K?',gen(){const S=['Adding more reactant','Decreasing the volume','Adding a catalyst','Raising the temperature of an endothermic reaction','Removing a product','Adding an inert gas'],ch=S.slice();const i=ch.indexOf('Raising the temperature of an endothermic reaction');
    return {q:'Which change alters the numerical value of the equilibrium constant K?',choices:ch,ans:i,hint:'K depends only on temperature.',sol:'Only a change in temperature changes K (it <b>increases</b> for an endothermic reaction). Concentration, volume, inert gas and catalyst changes don\'t.'};}});
  PROBS.push({id:'le-vh',topic:'lechatelier',title:'K at a new temperature',gen(){let dH,T1,T2,K1,K2,n=0;do{dH=pick([-92,-58,-40,45,57,88]);T1=pick([298,350,400,500]);T2=T1+pick([50,100,150,-50]);K1=pick([.015,0.36,4.5,25,150]);K2=K1*Math.exp(-dH*1000/8.314*(1/T2-1/T1));}while((Math.abs(Math.log(K2/K1))>6||K2<1e-6||K2>1e6)&&++n<60);
    return {q:`A reaction has ΔH = ${dH>0?'+':''}${dH} kJ/mol and K = ${fmt(K1,K1<.1?3:2)} at ${T1} K. Estimate K at ${T2} K. (R = 8.314 J/mol·K; assume ΔH is constant.)`,ans:K2,unit:'',tol:.03,hint:'ln(K₂/K₁) = −(ΔH/R)(1/T₂ − 1/T₁), with ΔH in joules.',sol:`ln(K₂/K₁) = −(${dH*1000}/8.314)(1/${T2} − 1/${T1}) = ${fmt(Math.log(K2/K1),3)}; K₂ = <b>${sci(K2,3)}</b> (K ${K2>K1?'increased':'decreased'}: ${dH>0?'endothermic':'exothermic'} reaction, T ${T2>T1?'raised':'lowered'}).`};}});
})();
