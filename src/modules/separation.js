
/* ---------------- Separating mixtures ---------------- */
(function separation(){
  const cv=$('#sp-canvas');if(!cv)return;
  const MIX=[[['yellow',.15,'#E8C42A'],['red',.45,'#D9453B'],['blue',.8,'#3E63DD']],[['yellow',.1,'#E8C42A'],['orange',.3,'#E8832A'],['red',.55,'#D9453B'],['blue',.85,'#3E63DD']]];
  let mix=0,s=.55,front=0,running=false;
  const rf=p=>.04+.9/(1+Math.exp(-7*(s-p)));
  const sim=sim2d(cv,{h:w=>clamp(w*.6,300,380),step(dt){if(running){front=Math.min(1,front+dt*.16);if(front>=1)running=false;}},
    draw(ctx,w,h){const px=w*.3,pw=Math.min(190,w*.34),top=16,bot=h-34,base=bot-14,len=base-top-10,fy=base-len*front;ctx.fillStyle=alpha(T.sunk,1);ctx.fillRect(px,top,pw,bot-top);ctx.strokeStyle=T.line;ctx.strokeRect(px+.5,top+.5,pw,bot-top);
      ctx.fillStyle=alpha(T.cx,.18);ctx.fillRect(px,fy,pw,bot-fy);label(ctx,'solvent',px+pw+8,Math.max(fy,top+6)+10,T.cx,'left','middle',MONO);ctx.strokeStyle=T.cx;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px,fy);ctx.lineTo(px+pw,fy);ctx.stroke();label(ctx,'solvent front',px-8,fy,T.cx,'right','middle',MONO);
      ctx.strokeStyle=T.ink;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(px,base);ctx.lineTo(px+pw,base);ctx.stroke();ctx.setLineDash([]);label(ctx,'start line (pencil)',px-8,base,T.muted,'right','middle',MONO);
      const n=MIX[mix].length;MIX[mix].forEach(([nm,p,c],i)=>{const x=px+pw*(i+1)/(n+1),d=rf(p)*(base-fy),y=base-d;ctx.fillStyle=alpha(c,.85);ctx.beginPath();ctx.ellipse(x,y,12,Math.min(9+d*.04,14),0,0,7);ctx.fill();
        if(front>0){ctx.strokeStyle=alpha(c,.3);ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,base);ctx.lineTo(x,y);ctx.stroke();}
        if(front>.02){ctx.strokeStyle=T.muted;ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(x+16,y);ctx.lineTo(px+pw+60,y);ctx.stroke();ctx.setLineDash([]);label(ctx,nm+'  Rf '+(front>.99?rf(p).toFixed(2):'…'),px+pw+64,y,c,'left','middle','600 12px "IBM Plex Mono",monospace');}});
      label(ctx,'paper (polar stationary phase)',px+pw/2,bot+8,T.muted,'center','top',MONO);}});
  function ro(){$('#sp-ro').innerHTML=MIX[mix].map(([n,p,c])=>`<div><span>R<sub>f</sub> of ${n}</span><strong style="color:${c}">${rf(p).toFixed(2)}</strong></div>`).join('');}
  function upd(){$('#sp-s-out').textContent=s<.3?'nonpolar':s>.7?'very polar':'moderately polar';ro();sim.render();}
  $('#sp-go').addEventListener('click',()=>{front=0;running=!REDUCE;if(REDUCE)front=1;sim.render();});$('#sp-mix').addEventListener('change',()=>{mix=+$('#sp-mix').value;front=0;running=false;upd();});$('#sp-s').addEventListener('input',()=>{s=+$('#sp-s').value;front=0;running=false;upd();});
  front=1;upd();
  /* ---- distillation ---- */
  const R8=8.314,A={Tb:351.55,H:38600},B={Tb:373.15,H:40700};
  const Pv=(c,T)=>Math.exp(-(c.H/R8)*(1/T-1/c.Tb));
  const bp=x=>solve(T=>x*Pv(A,T)+(1-x)*Pv(B,T)-1,330,400);
  const N0=60;let pot=[],vap=[],recA=0,recB=0,heating=false,acc=0,hist=[];const dcv=$('#ds-canvas'),gcv=$('#ds-graph');
  function reset(){const xa=+$('#ds-x').value,nA=Math.round(N0*xa);pot=[];for(let i=0;i<N0;i++)pot.push({t:i<nA?'A':'B',x:Math.random(),y:Math.random(),p:Math.random()*6});vap=[];recA=0;recB=0;heating=false;hist=[];$('#ds-go').textContent='Heat';readout();dsim.render();gsim.render();}
  const xp=()=>{const a=pot.filter(p=>p.t==='A').length;return pot.length?a/pot.length:0;};
  function readout(){const x=xp(),T=pot.length?bp(x):373.15,y=pot.length?x*Pv(A,T):0,rec=recA+recB;setText('ds-t',(T-273.15).toFixed(1)+' °C');setText('ds-xp',(x*100).toFixed(0)+' %');setText('ds-y',pot.length?(y*100).toFixed(0)+' %':'—');setText('ds-xd',rec?(recA/rec*100).toFixed(0)+' %':'—');}
  const dsim=sim2d(dcv,{h:w=>clamp(w*.62,260,320),step(dt){if(heating&&pot.length){acc+=dt*(+$('#ds-p').value)*.9;while(acc>1&&pot.length){acc-=1;const x=xp(),T=bp(x),yA=x*Pv(A,T),isA=Math.random()<yA;const idx=pot.findIndex(p=>p.t===(isA?'A':'B'));const k=idx<0?0:idx;const m=pot.splice(k,1)[0];vap.push({t:m.t,u:0});hist.push([1-pot.length/N0,bp(xp())-273.15]);}}
      vap.forEach(v=>{v.u+=dt*.6;if(v.u>=1&&!v.done){v.done=true;if(v.t==='A')recA++;else recB++;}});vap=vap.filter(v=>v.u<1);if(heating&&!pot.length){heating=false;$('#ds-go').textContent='Heat';}
      pot.forEach(p=>{p.p+=dt*(heating?5:2);});},
    draw(ctx,w,h,t){const fx=w*.12,fy=h*.5,fw=Math.min(120,w*.24),fh=h*.42;const path=u=>{if(u<.35)return [fx+fw*.5,fy-u/.35*(h*.3)];if(u<.7){const k=(u-.35)/.35;return [fx+fw*.5+k*(w*.5),fy-h*.3+k*h*.18];}const k=(u-.7)/.3;return [fx+fw*.5+w*.5,fy-h*.12+k*(h*.2)];};
      ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(fx+fw*.35,fy-h*.3);ctx.lineTo(fx+fw*.35,fy);ctx.lineTo(fx,fy+8);ctx.lineTo(fx,fy+fh);ctx.lineTo(fx+fw,fy+fh);ctx.lineTo(fx+fw,fy+8);ctx.lineTo(fx+fw*.65,fy);ctx.lineTo(fx+fw*.65,fy-h*.3);ctx.stroke();
      const lvl=Math.max(6,fh*pot.length/N0);ctx.fillStyle=alpha(T.cx,.12);ctx.fillRect(fx+2,fy+fh-lvl,fw-4,lvl);
      pot.forEach((p,i)=>{const px=fx+8+((Math.sin(i*12.99)*43758.5%1+1)%1)*(fw-16),py=fy+fh-8-((Math.sin(i*78.2)*12345.6%1+1)%1)*Math.max(4,lvl-12);ball2(ctx,px+Math.sin(p.p)*2,py+Math.cos(p.p*1.3)*2,3.6,p.t==='A'?T.cx:T.hot);});
      if(heating){for(let k=0;k<4;k++){ctx.fillStyle=alpha(T.hot,.6);ctx.beginPath();ctx.moveTo(fx+fw*(.2+k*.2),fy+fh+8);ctx.quadraticCurveTo(fx+fw*(.25+k*.2),fy+fh+18+Math.sin(t*8+k)*3,fx+fw*(.2+k*.2)+4,fy+fh+26);ctx.lineTo(fx+fw*(.2+k*.2)-4,fy+fh+26);ctx.fill();}}
      ctx.strokeStyle=T.muted;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(fx+fw*.5,fy-h*.3);ctx.lineTo(fx+fw*.5+w*.5,fy-h*.12);ctx.stroke();ctx.strokeStyle=alpha(T.cx,.35);ctx.lineWidth=11;ctx.stroke();label(ctx,'condenser (cold water)',fx+fw*.5+w*.27,fy-h*.3+8,T.cx,'center','bottom',MONO);
      vap.forEach(v=>{const [x,y]=path(Math.min(v.u,.99));ball2(ctx,x,y,3.6,v.t==='A'?T.cx:T.hot);});
      const rx=fx+fw*.5+w*.5-26,ry=fy+fh*.45,rw=52,rh=h*.38;ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(rx,ry,rw,rh);const tot=recA+recB,lv=rh*Math.min(1,tot/N0*2.2);
      if(tot){ctx.fillStyle=alpha(T.hot,.35);ctx.fillRect(rx+1.5,ry+rh-lv,rw-3,lv);ctx.fillStyle=alpha(T.cx,.45);ctx.fillRect(rx+1.5,ry+rh-lv,rw-3,lv*recA/tot);}
      label(ctx,'receiver',rx+rw/2,ry+rh+8,T.muted,'center','top',MONO);label(ctx,'pot',fx+fw/2,fy+fh+30,T.muted,'center','top',MONO);
      label(ctx,'● ethanol  ● water',8,8,T.muted,'left','top',MONO);const th=pot.length?bp(xp())-273.15:100;ctx.fillStyle=T.ink;ctx.fillRect(fx+fw*.5-1.5,fy-h*.33,3,h*.2);label(ctx,th.toFixed(1)+' °C',fx+fw*.5+8,fy-h*.2,T.hot,'left','middle','600 12px "IBM Plex Mono",monospace');}});
  const gsim=sim2d(gcv,{h:w=>clamp(w*.62,260,320),draw(ctx,w,h){const P=panel(ctx,{x:48,y:12,w:w-62,h:h-46},[0,1],[75,105],{xn:5,yn:3,xlabel:'fraction distilled',ylabel:'pot temperature (°C)',color:T.ink});line(ctx,P,0,78.4,1,78.4,T.cx,1,[4,4]);line(ctx,P,0,100,1,100,T.hot,1,[4,4]);label(ctx,'ethanol boils 78.4 °C',P.X(.98),P.Y(78.4)-3,T.cx,'right','bottom',MONO);label(ctx,'water boils 100 °C',P.X(.98),P.Y(100)-3,T.hot,'right','bottom',MONO);
      const x0=+$('#ds-x').value;const pts=[[0,bp(x0)-273.15],...hist];ctx.save();clip(ctx,P);ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(P.X(p[0]),P.Y(p[1])):ctx.moveTo(P.X(p[0]),P.Y(p[1])));ctx.stroke();ctx.restore();const l=pts[pts.length-1];dot(ctx,P.X(l[0]),P.Y(l[1]),5.5,T.hot,T.surface);}});
  $('#ds-go').addEventListener('click',()=>{heating=!heating;$('#ds-go').textContent=heating?'Pause':'Heat';});$('#ds-reset').addEventListener('click',reset);
  $('#ds-x').addEventListener('input',()=>{$('#ds-x-out').textContent=(+$('#ds-x').value*100).toFixed(0)+' % ethanol';reset();});bindRange('ds-p',x=>x,()=>{},false);$('#ds-x-out').textContent='50 % ethanol';
  setInterval(()=>{if(current==='separation'){readout();gsim.render();}},300);
  reset();drawers.separation=()=>{sim.render();dsim.render();gsim.render();};
  TIPS['sp-s']='A more polar solvent competes better with the polar paper, so polar dyes travel further.';
  TIPS['sp-mix']='Each dye has its own polarity, so each lands at its own distance.';
  TIPS['ds-x']='The more ethanol you start with, the lower the boiling temperature and the more ethanol in the first distillate.';
  TIPS['ds-p']='Heat gently: a slow rate gives a better separation.';
  KEYS['sp-canvas']=['Press Run it and compare how far each spot travels.',[['cx','solvent front']]];
  GLOSS['chromatography']='Separating a mixture by how strongly each part is attracted to a stationary phase compared with a moving solvent.';
  GLOSS['distillation']='Separating liquids by boiling the mixture and condensing the vapor, using differences in boiling point.';
  GLOSS['rf']='The distance a spot travels divided by the distance the solvent front travels.';
  TT.separation='Link both methods back to intermolecular forces: strong attraction to the paper means a small Rf; strong attractions in a liquid mean a high boiling point.';
})();
(function(){
  PROBS.push({id:'sp-rf',topic:'separation',title:'Calculate Rf',gen(){const f=ri(60,120)/10,d=ri(8,Math.round(f*9))/10,rfv=d/f;
    return {q:`In paper chromatography the solvent front travels ${f.toFixed(1)} cm from the start line, and a dye spot travels ${d.toFixed(1)} cm. What is the Rf of the dye?`,ans:rfv,unit:'',tol:.02,hint:'Rf = distance traveled by the spot ÷ distance traveled by the solvent front.',sol:`Rf = ${d.toFixed(1)} / ${f.toFixed(1)} = <b>${rfv.toFixed(2)}</b>.`};}});
  const SC=[['sand and water','filtration'],['ethanol and water','distillation'],['the dyes in black ink','chromatography'],['salt dissolved in water (recover the salt)','evaporation'],['chalk powder suspended in water','filtration'],['two liquids with boiling points of 65 °C and 110 °C','distillation'],['the pigments in spinach leaves','chromatography'],['sugar dissolved in water (recover the sugar)','evaporation']],ch=['filtration','distillation','chromatography','evaporation'];
  PROBS.push({id:'sp-method',topic:'separation',title:'Choose the separation method',gen(){const [d,m]=pick(SC);
    return {q:`Which method is best to separate ${d}?`,choices:ch,ans:ch.indexOf(m),hint:'Match the property that differs: particle size, volatility, or attraction to a surface.',sol:`<b>${m}</b>: ${m==='filtration'?'an insoluble solid is much larger than the liquid\'s particles':m==='distillation'?'the liquids differ in boiling point':m==='chromatography'?'the components differ in attraction to the stationary phase':'the solvent is volatile and the solid is not'}.`};}});
  PROBS.push({id:'sp-distill',topic:'separation',title:'What distills first?',gen(){const L=[['ethanol (bp 78 °C)','water (bp 100 °C)'],['acetone (bp 56 °C)','water (bp 100 °C)'],['hexane (bp 69 °C)','octane (bp 126 °C)'],['water (bp 100 °C)','glycerol (bp 290 °C)']],[a,b]=pick(L),sw=Math.random()<.5,x=sw?b:a,y=sw?a:b;
    return {q:`A mixture of ${x} and ${y} is slowly heated in a distillation apparatus. Which liquid is enriched in the first drops of distillate?`,choices:[x,y],ans:x===a?0:1,hint:'The more volatile liquid has the lower boiling point (weaker intermolecular forces), so more of it is in the vapor.',sol:`The lower boiling point means weaker attractions and more vapor: <b>${a}</b>.`};}});
})();
