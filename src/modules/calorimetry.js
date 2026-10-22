
/* ---------------- Calorimetry ---------------- */
const CAL_METALS={Al:{n:'Aluminum',c:.897,col:'#B8B8C0'},Fe:{n:'Iron',c:.449,col:'#9B8F85'},Cu:{n:'Copper',c:.385,col:'#C77A3B'},Zn:{n:'Zinc',c:.388,col:'#7C8FA6'},Ag:{n:'Silver',c:.235,col:'#C0C6CF'},Pb:{n:'Lead',c:.129,col:'#6B7280'}};
const CAL_SALTS={NH4NO3:{f:'NH₄NO₃',dh:25.7,M:80.04},NH4Cl:{f:'NH₄Cl',dh:14.8,M:53.49},KCl:{f:'KCl',dh:17.2,M:74.55},NaCl:{f:'NaCl',dh:3.9,M:58.44},NaOH:{f:'NaOH',dh:-44.5,M:40.00},CaCl2:{f:'CaCl₂',dh:-82.8,M:110.98},LiCl:{f:'LiCl',dh:-37.0,M:42.39}};
function calCup(ctx,x,y,w,h,T,o={}){const t=clamp((T-10)/90,0,1),r=Math.round(60+195*t),b=Math.round(235-190*t);ctx.fillStyle=`rgba(${r},120,${b},.30)`;ctx.fillRect(x,y,w,h);ctx.strokeStyle=T_ink();ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y-26);ctx.lineTo(x,y+h);ctx.lineTo(x+w,y+h);ctx.lineTo(x+w,y-26);ctx.stroke();}
const T_ink=()=>T.ink;
function calTherm(ctx,x,y,h,T0,lo,hi,col){ctx.fillStyle=alpha(T.hot,.12);ctx.fillRect(x,y,12,h);const f=clamp((T0-lo)/(hi-lo),0,1);ctx.fillStyle=col||T.hot;ctx.fillRect(x,y+h*(1-f),12,h*f);ctx.strokeStyle=T.ink;ctx.lineWidth=1.5;ctx.strokeRect(x,y,12,h);label(ctx,fmt(T0,1)+' °C',x+6,y+h+12,T.ink,'center','top',MONO);}
(function calorimetry(){
  const cv=$('#ca-canvas');if(!cv)return;
  const sel=$('#ca-metal');sel.innerHTML=Object.keys(CAL_METALS).map(k=>`<option value="${k}">${CAL_METALS[k].n} (c = ${CAL_METALS[k].c})</option>`).join('');sel.value='Cu';
  const ids=['mm','mT','wm','wT'],V=()=>({mm:+$('#ca-mm').value,mT:+$('#ca-mT').value,wm:+$('#ca-wm').value,wT:+$('#ca-wT').value,c:CAL_METALS[sel.value].c});
  const Tf=v=>(v.mm*v.c*v.mT+v.wm*4.184*v.wT)/(v.mm*v.c+v.wm*4.184);let t=0,run=false,heat=[];const TAU=5;
  const Tm=(v,tt)=>{const f=Tf(v);return f+(v.mT-f)*Math.exp(-tt/TAU);},Tw=(v,tt)=>{const f=Tf(v);return f+(v.wT-f)*Math.exp(-tt/TAU);};
  const sim=sim2d(cv,{h:()=>260,step(dt){const v=V();if(run){t+=dt;if(t>30)run=false;const rate=Math.max(0,Tm(v,t)-Tw(v,t));if(Math.random()<rate/60*dt*60)heat.push({x:0,y:0,u:0,r:Math.random()});}heat.forEach(p=>p.u+=dt*1.5);heat=heat.filter(p=>p.u<1);},
    draw(ctx,w,h){const v=V(),tm=run||t>0?Tm(v,t):v.mT,tw=run||t>0?Tw(v,t):v.wT,cx=w*.18,cw=w*.64,cy=60,ch=h-90;calCup(ctx,cx,cy,cw,ch,tw);
      const mw=44+v.mm*.22,mh=mw*.8,my=run||t>0?cy+ch-mh-4:cy-mh-14,mx=cx+cw/2-mw/2,hotf=clamp((tm-20)/80,0,1);
      ctx.fillStyle=CAL_METALS[sel.value].col;ctx.fillRect(mx,my,mw,mh);ctx.fillStyle=`rgba(255,110,40,${hotf*.55})`;ctx.fillRect(mx,my,mw,mh);ctx.strokeStyle=T.ink;ctx.lineWidth=1.5;ctx.strokeRect(mx,my,mw,mh);label(ctx,sel.value,mx+mw/2,my+mh/2,'#fff','center','middle','700 13px "IBM Plex Mono",monospace');
      for(let i=0;i<22;i++){const px=cx+10+((i*37+Math.sin(sim.t*(2+tw/25)+i)*5+cw*5)%(cw-20)),py=cy+10+((i*53+Math.cos(sim.t*(2+tw/25)+i*1.7)*5+400)%(ch-20));if(py>mh+my-2&&px>mx-4&&px<mx+mw+4&&py<my+mh+4)continue;dot(ctx,px,py,2.4,alpha('#3E7BDC',.55));}
      heat.forEach(p=>{const a=p.r*6.28,sx=mx+mw/2+Math.cos(a)*mw*.45,sy=my+mh/2+Math.sin(a)*mh*.45,ex=sx+Math.cos(a)*60,ey=sy+Math.sin(a)*60;dot(ctx,sx+(ex-sx)*p.u,sy+(ey-sy)*p.u,3.3,alpha(T.hot,1-p.u));});
      calTherm(ctx,cx+cw+10,cy-20,ch+10,tw,10,100);label(ctx,'water',cx+8,cy+ch-8,T.muted,'left','bottom',MONO);label(ctx,fmt(v.mm,0)+' g metal',cx,16,T.ink,'left','middle',MONO);label(ctx,fmt(v.wm,0)+' g water',cx,34,T.ink,'left','middle',MONO);}});
  const g=$('#ca-graph'),gs=sim2d(g,{h:()=>260,draw(ctx,w,h){const v=V(),lo=Math.min(v.wT,Tf(v))-5,hi=v.mT+5;const Pn=panel(ctx,{x:44,y:12,w:w-58,h:h-46},[0,30],[lo,hi],{xn:5,yn:4,xlabel:'time (s)',ylabel:'T (°C)',color:T.ink});
      curve(ctx,Pn,x=>Tm(v,x),0,Math.max(.01,Math.min(t,30)),T.hot,2.8,120);curve(ctx,Pn,x=>Tw(v,x),0,Math.max(.01,Math.min(t,30)),T.cx,2.8,120);
      line(ctx,Pn,0,Tf(v),30,Tf(v),T.muted,1.2,[5,4]);label(ctx,'final '+fmt(Tf(v),1)+' °C',Pn.X(30)-4,Pn.Y(Tf(v))-6,T.muted,'right','bottom',MONO);
      label(ctx,'metal',Pn.X(1),Pn.Y(v.mT)+10,T.hot,'left','top',MONO);label(ctx,'water',Pn.X(1),Pn.Y(v.wT)-8,T.cx,'left','bottom',MONO);}});
  function upd(){const v=V(),f=Tf(v),q=v.wm*4.184*(f-v.wT);setText('ca-mm-out',v.mm+' g');setText('ca-mT-out',v.mT+' °C');setText('ca-wm-out',v.wm+' g');setText('ca-wT-out',v.wT+' °C');
    setText('ca-tf',fmt(f,1)+' °C');setText('ca-ql','−'+fmt(q,0)+' J');setText('ca-qg','+'+fmt(q,0)+' J');setText('ca-c',v.c+' J/g·°C');sim.render();gs.render();}
  ids.forEach(k=>bindRange('ca-'+k,()=>'',()=>{t=0;run=false;upd();},false));sel.addEventListener('change',()=>{t=0;run=false;upd();});
  $('#ca-go').addEventListener('click',()=>{t=0;run=true;heat=[];sim.render();gs.render();const tick=()=>{gs.render();if(run)requestAnimationFrame(tick);};tick();});
  $('#ca-lab').addEventListener('labreset',()=>{t=0;run=false;upd();});
  upd();
  /* dissolving */
  const cb=$('#cb-canvas'),ss=$('#cb-salt');ss.innerHTML=Object.keys(CAL_SALTS).map(k=>`<option value="${k}">${CAL_SALTS[k].f}</option>`).join('');ss.value='NH4NO3';
  let t2=0,run2=false,ions=[];const S=()=>{const s=CAL_SALTS[ss.value],m=+$('#cb-m').value,n=m/s.M,q=-s.dh*1000*n;const dT=q/((100+m)*4.184);return {s,m,n,q,dT};};
  const T2=(d,tt)=>20+d.dT*(1-Math.exp(-tt/4));
  const sim2=sim2d(cb,{h:()=>260,step(dt){if(run2){t2+=dt;if(t2>25)run2=false;const d=S(),frac=1-Math.exp(-t2/4);if(ions.length<(frac*40)&&Math.random()<.8)ions.push({x:0,y:0,vx:(Math.random()-.5)*50,vy:(Math.random()-.5)*50,c:Math.random()<.5});}
      ions.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;});},
    draw(ctx,w,h){const d=S(),Tn=run2||t2>0?T2(d,t2):20,cx=w*.18,cw=w*.64,cy=60,ch=h-90;calCup(ctx,cx,cy,cw,ch,Tn);const frac=run2||t2>0?1-Math.exp(-t2/4):0,cs=(1-frac)*(18+d.m*.9);
      if(cs>.5){ctx.fillStyle='#EEF1F5';ctx.strokeStyle=T.ink;ctx.lineWidth=1.4;ctx.fillRect(cx+cw/2-cs/2,cy+ch-cs-4,cs,cs);ctx.strokeRect(cx+cw/2-cs/2,cy+ch-cs-4,cs,cs);}
      ions.forEach(p=>{const bx=cx+cw/2,by=cy+ch-10;const x=clamp(bx+p.x,cx+8,cx+cw-8),y=clamp(by+p.y-(Math.min(t2,6))*8,cy+8,cy+ch-8);dot(ctx,x,y,3.8,p.c?'#3E7BDC':'#8B5CF6');});
      calTherm(ctx,cx+cw+10,cy-20,ch+10,Tn,5,40,Tn>20.2?T.hot:Tn<19.8?'#4C8DF6':T.hot);label(ctx,d.s.f+', '+fmt(d.m,1)+' g in 100 g water',cx,16,T.ink,'left','middle',MONO);}});
  const g2=$('#cb-graph'),gs2=sim2d(g2,{h:()=>260,draw(ctx,w,h){const d=S(),lo=Math.min(20,20+d.dT)-3,hi=Math.max(20,20+d.dT)+3;const Pn=panel(ctx,{x:44,y:12,w:w-58,h:h-46},[0,25],[lo,hi],{xn:5,yn:4,xlabel:'time (s)',ylabel:'T (°C)',color:T.ink});
      curve(ctx,Pn,x=>T2(d,x),0,Math.max(.01,Math.min(t2,25)),d.dT>=0?T.hot:T.cx,2.8,120);line(ctx,Pn,0,20,25,20,T.muted,1.2,[5,4]);}});
  function upd2(){const d=S();setText('cb-m-out',fmt(d.m,1)+' g');setText('cb-dT',(d.dT>=0?'+':'−')+fmt(Math.abs(d.dT),1)+' °C');setText('cb-q',(d.q>=0?'−':'+')+fmt(Math.abs(d.q),0)+' J');
    setText('cb-dh',(d.s.dh>0?'+':'−')+fmt(Math.abs(d.s.dh),1)+' kJ/mol');setText('cb-ty',d.s.dh>0?'endothermic':'exothermic');sim2.render();gs2.render();}
  bindRange('cb-m',()=>'',()=>{t2=0;run2=false;ions=[];upd2();},false);ss.addEventListener('change',()=>{t2=0;run2=false;ions=[];upd2();});
  $('#cb-go').addEventListener('click',()=>{t2=0;run2=true;ions=[];const tick=()=>{gs2.render();if(run2)requestAnimationFrame(tick);};tick();});$('#cb-lab').addEventListener('labreset',()=>{t2=0;run2=false;ions=[];upd2();});
  upd2();drawers.calorimetry=()=>{upd();upd2();};
  TIPS['ca-metal']='A larger specific heat means the metal stores more energy per gram per degree.';
  TIPS['ca-mm']='More metal means more stored heat, so the water ends hotter.';
  TIPS['ca-mT']='A hotter metal brings more energy to share.';
  TIPS['ca-wm']='More water means the same heat is spread over more mass, so its temperature changes less.';
  TIPS['ca-wT']='The final temperature always lies between the two starting temperatures.';
  TIPS['cb-salt']='Pick a substance; the sign of ΔH tells you whether the cup gets cold or hot.';
  TIPS['cb-m']='More dissolved means more moles, so a larger temperature change.';
  KEYS['ca-canvas']=['Press Drop it in and watch the orange heat dots leave the metal.',[['hot','heat flowing'],['cx','water (cooler)']]];
  GLOSS['calorimeter']='An insulated container used to measure heat by the temperature change of water.';
  GLOSS['exothermic']='A process that releases heat to its surroundings (ΔH is negative).';
  GLOSS['endothermic']='A process that absorbs heat from its surroundings (ΔH is positive).';
  GLOSS['specific heat']='The heat needed to raise the temperature of 1 g of a substance by 1 °C.';
  TT.calorimetry='Have students predict the final temperature qualitatively (closer to which starting value?) before using the slider.';
})();
(function(){
  PROBS.push({id:'cal-final',topic:'calorimetry',title:'Final temperature of a mixture',gen(){const k=pick(Object.keys(CAL_METALS)),M=CAL_METALS[k],mm=pick([40,60,80,100,150]),mT=pick([85,90,95,99]),wm=pick([80,100,150,200]),wT=pick([18,20,22,25]),f=(mm*M.c*mT+wm*4.184*wT)/(mm*M.c+wm*4.184);
    return {q:`A ${mm} g sample of ${M.n.toLowerCase()} (c = ${M.c} J/g·°C) at ${mT} °C is dropped into ${wm} g of water at ${wT} °C in an insulated cup. What is the final temperature? (c<sub>water</sub> = 4.184 J/g·°C)`,ans:f,unit:'°C',tol:.01,hint:'Heat lost by the metal = heat gained by the water. Set mcΔT equal for both.',sol:`${mm}(${M.c})(${mT} − T) = ${wm}(4.184)(T − ${wT}); T = <b>${fmt(f,1)} °C</b>.`};}});
  PROBS.push({id:'cal-c',topic:'calorimetry',title:'Specific heat of an unknown metal',gen(){const M=pick(Object.values(CAL_METALS)),mm=pick([40,50,60,75]),wm=pick([75,100,125]),mT=pick([95,98,99]),wT=pick([20,21,22]),f=+(((mm*M.c*mT+wm*4.184*wT)/(mm*M.c+wm*4.184))).toFixed(1),c=wm*4.184*(f-wT)/(mm*(mT-f));
    return {q:`A ${mm} g piece of an unknown metal at ${mT} °C is added to ${wm} g of water at ${wT} °C. The final temperature is ${fmt(f,1)} °C. What is the specific heat of the metal? (c<sub>water</sub> = 4.184 J/g·°C)`,ans:c,unit:'J/g·°C',tol:.03,hint:'q for the water = −q for the metal. Solve −m c ΔT(metal) = m c ΔT(water) for c.',sol:`q<sub>water</sub> = ${wm}(4.184)(${fmt(f-wT,1)}) = ${fmt(wm*4.184*(f-wT),0)} J; c = ${fmt(wm*4.184*(f-wT),0)} ÷ (${mm} × ${fmt(mT-f,1)}) = <b>${fmt(c,3)} J/g·°C</b>.`};}});
  PROBS.push({id:'cal-dh',topic:'calorimetry',title:'ΔH of dissolving',gen(){const k=pick(Object.keys(CAL_SALTS).filter(x=>Math.abs(CAL_SALTS[x].dh)>14)),s=CAL_SALTS[k],m=pick([4.0,5.0,8.0,10.0]),n=m/s.M,dT=+((-s.dh*1000*n)/((100+m)*4.184)).toFixed(1),q=(100+m)*4.184*dT,dh=-q/n/1000;
    return {q:`${fmt(m,1)} g of ${s.f} (molar mass ${s.M} g/mol) is dissolved in 100.0 g of water in a coffee-cup calorimeter. The temperature ${dT>0?'rises':'falls'} by ${fmt(Math.abs(dT),1)} °C. Assume the solution (${fmt(100+m,1)} g) has c = 4.184 J/g·°C. What is ΔH for dissolving, in kJ per mole? (Include the sign.)`,ans:dh,unit:'kJ/mol',tol:.03,hint:'q(solution) = mcΔT. Then q(rxn) = −q(solution). Divide by moles.',sol:`q<sub>soln</sub> = ${fmt(100+m,1)}(4.184)(${dT>0?'+':'−'}${fmt(Math.abs(dT),1)}) = ${fmt(q,0)} J, so q<sub>rxn</sub> = ${fmt(-q,0)} J. n = ${fmt(n,4)} mol. ΔH = <b>${fmt(dh,1)} kJ/mol</b>.`};}});
  PROBS.push({id:'cal-neut',topic:'calorimetry',title:'Neutralization calorimetry',gen(){const V=pick([50,75,100]),Mo=pick([.50,1.0,1.5,2.0]),n=V/1000*Mo,dT=+((55.8*n*1000)/(2*V*4.184)).toFixed(1),q=2*V*4.184*dT,dh=-q/n/1000;
    return {q:`${V} mL of ${fmt(Mo,2)} M HCl is mixed with ${V} mL of ${fmt(Mo,2)} M NaOH in a coffee-cup calorimeter; the temperature rises by ${fmt(dT,1)} °C. Assume the solution has density 1.00 g/mL and c = 4.184 J/g·°C. What is ΔH for the reaction per mole of water formed?`,ans:dh,unit:'kJ/mol',tol:.03,hint:'Mass = total volume × 1.00 g/mL. q = mcΔT, then ΔH = −q ÷ moles.',sol:`q = ${2*V}(4.184)(${fmt(dT,1)}) = ${fmt(q,0)} J; moles H₂O = ${fmt(n,4)}; ΔH = −${fmt(q/1000,2)} kJ ÷ ${fmt(n,4)} mol = <b>${fmt(dh,1)} kJ/mol</b>.`};}});
  const BC=[['glucose (C₆H₁₂O₆)',180.16,2803],['sucrose (C₁₂H₂₂O₁₁)',342.30,5640],['naphthalene (C₁₀H₈)',128.17,5157]];
  PROBS.push({id:'cal-bomb',topic:'calorimetry',title:'Bomb calorimeter',gen(){const [nm,M,E]=pick(BC),C=pick([9.8,10.5,11.2,12.0]),m=pick([.50,.80,1.00,1.20]),n=m/M,dT=+(E*n/C).toFixed(2),q=C*dT,dE=-q/n;
    return {q:`A bomb calorimeter has a heat capacity of ${fmt(C,1)} kJ/°C. Burning ${fmt(m,2)} g of ${nm}, molar mass ${M} g/mol, raises its temperature by ${fmt(dT,2)} °C. What is the heat of combustion, in kJ per mole? (Include the sign.)`,ans:dE,unit:'kJ/mol',tol:.03,hint:'q(calorimeter) = CΔT. The reaction released that heat, so q(rxn) is its negative; then divide by moles.',sol:`q = ${fmt(C,1)} × ${fmt(dT,2)} = ${fmt(q,2)} kJ; n = ${fmt(m,2)}/${M} = ${fmt(n,5)} mol; ΔE = −${fmt(q,2)} ÷ ${fmt(n,5)} = <b>${fmt(dE,0)} kJ/mol</b>.`};}});
})();
