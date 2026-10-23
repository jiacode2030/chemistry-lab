
/* ---------------- Heat, temperature & phase changes ---------------- */
const HC={ci:2.09,cw:4.184,cs:2.01,hf:334,hv:2260}; /* J/g·°C, J/g */
function heatSegs(m){return [{n:'ice warms',eq:'q = mcΔT',q:m*HC.ci*20,T0:-20,T1:0},{n:'melting',eq:'q = mΔH_fus',q:m*HC.hf,T0:0,T1:0},{n:'water warms',eq:'q = mcΔT',q:m*HC.cw*100,T0:0,T1:100},{n:'boiling',eq:'q = mΔH_vap',q:m*HC.hv,T0:100,T1:100},{n:'steam warms',eq:'q = mcΔT',q:m*HC.cs*20,T0:100,T1:120}];}
function heatAt(m,Q){const S=heatSegs(m);let acc=0;for(let i=0;i<S.length;i++){const s=S[i];if(Q<=acc+s.q||i===S.length-1){const f=clamp((Q-acc)/s.q,0,1);return {i,s,f,T:s.T0+(s.T1-s.T0)*f};}acc+=s.q;}}
(function heatflow(){
  const cv=$('#hf-canvas');if(!cv)return;const mS=$('#hf-m'),qS=$('#hf-q');let play=false,P=[];const N=36,H=250;
  const mass=()=>+mS.value,Qtot=()=>heatSegs(mass()).reduce((a,s)=>a+s.q,0),Q=()=>qS.value/1000*Qtot();
  function init(){const w=cv.clientWidth||300,sp=Math.min(30,(w-40)/6);P=[];for(let i=0;i<N;i++){const row=Math.floor((N-1-i)/6),col=(N-1-i)%6;P.push({sx:(w-6*sp)/2+sp/2+col*sp+(row%2?sp/2:0)*0.5,sy:H-18-row*sp*.9,x:0,y:0,vx:0,vy:0,ph:Math.random()*6.28,st:'s'});P[i].x=P[i].sx;P[i].y=P[i].sy;}}
  function states(){const r=heatAt(mass(),Q()),i=r.i,f=r.f;let nS=N,nG=0;if(i===0)nS=N;else if(i===1)nS=Math.round(N*(1-f));else nS=0;if(i===3)nG=Math.round(N*f);else if(i===4)nG=N;return {r,nS,nG};}
  const sim=sim2d(cv,{h:()=>H,step(dt,t){if(play){qS.value=Math.min(1000,+qS.value+dt*45);if(+qS.value>=1000){play=false;$('#hf-play').textContent='Heater on';}upd(true);}
      const {r,nS,nG}=states(),w=cv.clientWidth,Tk=r.T+273,sp=Math.sqrt(Tk/273);
      P.forEach((p,i)=>{const want=i<nG?'g':i>=N-nS?'s':'l';if(want!==p.st){p.st=want;if(want!=='s'){const a=Math.random()*6.28;p.vx=Math.cos(a)*60;p.vy=Math.sin(a)*60;}}
        if(p.st==='s'){const amp=.6+(Tk-253)/273*2.4;p.x+=(p.sx+Math.sin(t*9+p.ph)*amp-p.x)*Math.min(1,dt*8);p.y+=(p.sy+Math.cos(t*8+p.ph*1.3)*amp-p.y)*Math.min(1,dt*8);}
        else{const spd=p.st==='g'?150*sp:50*sp;const L=Math.hypot(p.vx,p.vy)||1;p.vx+=(p.vx/L*spd-p.vx)*Math.min(1,dt*2);p.vy+=(p.vy/L*spd-p.vy)*Math.min(1,dt*2);p.x+=p.vx*dt;p.y+=p.vy*dt;
          const top=p.st==='l'?H*.52:6;if(p.st==='l'&&p.y<top)p.vy+=400*dt;if(p.x<8){p.x=8;p.vx=Math.abs(p.vx);}if(p.x>w-8){p.x=w-8;p.vx=-Math.abs(p.vx);}if(p.y<6){p.y=6;p.vy=Math.abs(p.vy);}if(p.y>H-8){p.y=H-8;p.vy=-Math.abs(p.vy);}}});},
    draw(ctx,w,h){const {r}=states();ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(1,1,w-2,H-2);
      const hot=clamp((r.T+20)/140,0,1);P.forEach(p=>{const c=p.st==='s'?'#6FA8DC':p.st==='l'?'#3E7BDC':'#8B5CF6';ball2(ctx,p.x,p.y,6.5,c);});
      label(ctx,['solid ice','ice + liquid','liquid water','liquid + gas','steam'][r.i],10,12,T.muted,'left','middle',MONO);
      const lx=w-24;ctx.fillStyle=alpha(T.hot,.15);ctx.fillRect(lx,10,12,H-20);ctx.fillStyle=T.hot;const th=(H-20)*clamp((r.T+30)/160,0,1);ctx.fillRect(lx,H-10-th,12,th);}});
  const g=$('#hf-graph'),gs=sim2d(g,{h:()=>H,draw(ctx,w,h){const m=mass(),S=heatSegs(m),tot=Qtot()/1000,q=Q()/1000;
      const Pn=panel(ctx,{x:46,y:12,w:w-60,h:h-46},[0,tot],[-30,130],{xn:5,yn:4,xlabel:'heat added (kJ)',ylabel:'T (°C)',color:T.ink});
      let acc=0;S.forEach((s,i)=>{const a=acc/1000,b=(acc+s.q)/1000;ctx.save();clip(ctx,Pn);ctx.strokeStyle=i%2?T.hot:T.cx;ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(Pn.X(a),Pn.Y(s.T0));ctx.lineTo(Pn.X(b),Pn.Y(s.T1));ctx.stroke();ctx.restore();acc+=s.q;});
      const r=heatAt(m,Q());dot(ctx,Pn.X(q),Pn.Y(r.T),6,T.ink,T.surface||'#fff');
      label(ctx,'melting',Pn.X((S[0].q+S[1].q/2)/1000),Pn.Y(0)-8,T.hot,'center','bottom',MONO);label(ctx,'boiling',Pn.X((S[0].q+S[1].q+S[2].q+S[3].q/2)/1000),Pn.Y(100)-8,T.hot,'center','bottom',MONO);}});
  function upd(fromPlay){const r=heatAt(mass(),Q());setText('hf-m-out',mass()+' g');setText('hf-q-out',fmt(Q()/1000,2)+' kJ');setText('hf-T',fmt(r.T,1)+' °C');setText('hf-heat',fmt(Q()/1000,2)+' kJ');
    setText('hf-ph',['solid ice','ice + water','liquid water','water + steam','steam'][r.i]);setText('hf-eq',r.s.eq);if(!fromPlay){sim.render();}gs.render();}
  bindRange('hf-m',()=>'',()=>upd(),false);bindRange('hf-q',()=>'',()=>upd(),false);
  $('#hf-play').addEventListener('click',()=>{if(+qS.value>=1000)qS.value=0;play=!play;$('#hf-play').textContent=play?'Pause':'Heater on';upd();});
  $('#hf-lab').addEventListener('labreset',()=>{play=false;$('#hf-play').textContent='Heater on';upd();});
  init();upd();drawers.heatflow=()=>{init();upd();};
  TIPS['hf-m']='More mass needs proportionally more heat, but the plateau temperatures stay the same.';
  TIPS['hf-q']='Slide the heat and watch the temperature, the particles and the graph together.';
  KEYS['hf-canvas']=['Press Heater on, or drag the heat slider.',[['#6FA8DC','solid'],['#3E7BDC','liquid'],['#8B5CF6','gas']]];
  GLOSS['specific heat']='The heat needed to raise the temperature of 1 g of a substance by 1 °C.';
  GLOSS['heat']='Energy transferred because of a temperature difference.';
  GLOSS['enthalpy of fusion']='The heat needed to melt a substance at its melting point.';
  GLOSS['enthalpy of vaporization']='The heat needed to vaporize a substance at its boiling point.';
  TT.heatflow='Have students sketch the heating curve before the slider moves. Emphasize: slope segments use mcΔT; flat segments use mΔH.';
})();
(function(){
  const m18=18.02;
  PROBS.push({id:'hf-q',topic:'heatflow',title:'Heat to change temperature',gen(){const m=pick([25,50,75,120,200]),T1=pick([15,20,22,25]),T2=pick([55,65,80,90]),q=m*4.184*(T2-T1);
    return {q:`How much heat is needed to warm ${m} g of liquid water from ${T1} °C to ${T2} °C? (c = 4.184 J/g·°C)`,ans:q/1000,unit:'kJ',tol:.02,hint:'q = mcΔT.',sol:`q = (${m})(4.184)(${T2-T1}) = ${fmt(q,0)} J = <b>${fmt(q/1000,2)} kJ</b>.`};}});
  PROBS.push({id:'hf-melt',topic:'heatflow',title:'Heat to melt',gen(){const m=pick([18.0,36.0,54.0,90.0,12.0]),q=m/m18*6.01;
    return {q:`How much heat is needed to melt ${m} g of ice at 0 °C? (ΔH<sub>fus</sub> = 6.01 kJ/mol; molar mass of H₂O = 18.02 g/mol)`,ans:q,unit:'kJ',tol:.02,hint:'Convert grams to moles first, then multiply by ΔH_fus.',sol:`n = ${m}/18.02 = ${fmt(m/m18,3)} mol; q = ${fmt(m/m18,3)} × 6.01 = <b>${fmt(q,2)} kJ</b>.`};}});
  PROBS.push({id:'hf-vap',topic:'heatflow',title:'Heat to boil',gen(){const m=pick([9.0,27.0,45.0,72.0,100.0]),q=m/m18*40.7;
    return {q:`How much heat is needed to vaporize ${m} g of water at 100 °C? (ΔH<sub>vap</sub> = 40.7 kJ/mol)`,ans:q,unit:'kJ',tol:.02,hint:'Moles first, then n × ΔH_vap.',sol:`n = ${m}/18.02 = ${fmt(m/m18,3)} mol; q = ${fmt(m/m18,3)} × 40.7 = <b>${fmt(q,1)} kJ</b>.`};}});
  PROBS.push({id:'hf-multi',topic:'heatflow',title:'Ice to warm water',gen(){const m=pick([10,20,30,50]),T1=pick([5,10,15]),T2=pick([20,35,50,70]),q1=m*2.09*T1,q2=m*334,q3=m*4.184*T2,q=q1+q2+q3;
    return {q:`How much heat is needed to turn ${m} g of ice at −${T1} °C into liquid water at ${T2} °C? (c<sub>ice</sub> = 2.09 J/g·°C, c<sub>water</sub> = 4.184 J/g·°C, ΔH<sub>fus</sub> = 334 J/g)`,ans:q/1000,unit:'kJ',tol:.02,hint:'Three pieces: warm the ice, melt it, warm the water.',sol:`q₁ = ${m}(2.09)(${T1}) = ${fmt(q1,0)} J; q₂ = ${m}(334) = ${fmt(q2,0)} J; q₃ = ${m}(4.184)(${T2}) = ${fmt(q3,0)} J. Total = <b>${fmt(q/1000,2)} kJ</b>.`};}});
  PROBS.push({id:'hf-concept',topic:'heatflow',title:'Heating-curve concept',gen(){const Q=[['On a heating curve, why is the plateau at the boiling point so much longer than the one at the melting point?',['Boiling needs far more energy per gram, because the particles must be separated completely','Water is hotter when it boils','The heater works more slowly','Steam has a larger specific heat than ice'],0,'ΔH_vap (2260 J/g) is about seven times ΔH_fus (334 J/g): more attractions must be overcome.'],
      ['During a phase change at constant pressure, the added heat goes into…',['Raising the average kinetic energy','Increasing the potential energy of the particles','Raising the temperature','Breaking covalent bonds inside each molecule'],1,'The particles move apart or leave the lattice, raising potential energy; the average kinetic energy (temperature) stays the same, and bonds inside the molecules aren\'t broken.'],
      ['Two samples of the same liquid, one of mass 10 g and one of 20 g, absorb the same amount of heat. Which warms more?',['The 10 g sample','The 20 g sample','They warm the same','Cannot tell'],0,'ΔT = q/(mc): half the mass means twice the temperature change.']];
    const [q,ch,a,why]=pick(Q);return {q,choices:ch,ans:a,hint:'Think about what the energy does to the particles at each stage.',sol:why};}});
})();

(function(){
  const Q=[['A hot metal block is placed in cool water in an insulated container. At thermal equilibrium…',['both have the same temperature','the metal is still hotter','the water is hotter','both are at the average of their masses'],0,'heat flows until the temperatures are equal'],['Two objects reach thermal equilibrium. Which statement is true?',['The heat lost by the hotter object equals the heat gained by the cooler one (no energy is lost)','The hotter object loses more energy than the cooler one gains','Temperature is transferred from hot to cold','Both have the same heat content'],0,'energy is conserved'],['Heat always flows…',['from higher temperature to lower temperature','from more massive to less massive objects','from lower to higher temperature','from objects with more heat to objects with less heat'],0,'it is the temperature difference that drives the flow']];
  PROBS.push({id:'hf-equil',topic:'heatflow',title:'Thermal equilibrium',gen(){const [q,ch,a,why]=pick(Q);return {q,choices:ch,ans:a,hint:'Think about the direction of energy flow and conservation of energy.',sol:`<b>${ch[a]}</b>: ${why}.`};}});
})();
