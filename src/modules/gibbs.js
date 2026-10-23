
/* ---------------- Gibbs free energy ---------------- */
const GBR=[{t:'Ice melts: H₂O(s) → H₂O(l)',H:6.01,S:22.0},{t:'Water boils: H₂O(l) → H₂O(g)',H:40.7,S:109},{t:'N₂ + 3H₂ → 2NH₃',H:-92.2,S:-198.7},{t:'CaCO₃(s) → CaO(s) + CO₂(g)',H:178.3,S:160.6},{t:'H₂ + Cl₂ → 2HCl',H:-184.6,S:20},{t:'2NO₂ → N₂O₄',H:-57.2,S:-175.8},{t:'3O₂ → 2O₃  (ozone)',H:285.4,S:-137.2},{t:'NH₄NO₃(s) dissolves in water',H:25.7,S:108.7}];
(function gibbs(){
  const cv=$('#gb-canvas');if(!cv)return;const rs=$('#gb-rx'),hS=$('#gb-H'),sS=$('#gb-S'),tS=$('#gb-T');rs.innerHTML=GBR.map((r,i)=>`<option value="${i}">${r.t}</option>`).join('');
  const R=8.314e-3,G=()=>(+hS.value)-(+tS.value)*(+sS.value)/1000;
  const sim=sim2d(cv,{h:()=>260,draw(ctx,w,h){const H=+hS.value,Tk=+tS.value,TS=Tk*(+sS.value)/1000,g=G(),mx=Math.max(Math.abs(H),Math.abs(TS),Math.abs(g),50)*1.2,zy=h/2-6,Y=v=>zy-(h/2-34)*v/mx;
      ctx.strokeStyle=T_ink();ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(30,zy);ctx.lineTo(w-10,zy);ctx.stroke();
      const items=[['ΔH',H,'#E08A2E','energy term'],['−TΔS',-TS,'#3E7BDC','disorder term'],['ΔG',g,g<0?'#2FA36B':'#E5484D',g<0?'favorable':'not favorable']],bw=Math.min(70,(w-80)/3-14);
      items.forEach(([n,v,c,sub],i)=>{const cx=30+(w-40)*(i+.5)/3;ctx.fillStyle=c;const y1=Y(v);ctx.fillRect(cx-bw/2,Math.min(zy,y1),bw,Math.abs(y1-zy)||1);label(ctx,(v>=0?'+':'−')+fmt(Math.abs(v),1),cx,(v>=0?y1-8:y1+8),T.ink,'center',v>=0?'bottom':'top',MONO);label(ctx,n,cx,h-30,T.ink,'center','middle','600 13px "IBM Plex Mono",monospace');label(ctx,sub,cx,h-14,T.muted,'center','middle',MONO);});
      label(ctx,'kJ',22,14,T.muted,'right','middle',MONO);
      ['=','+'].forEach(()=>{});label(ctx,'ΔG = ΔH + (−TΔS)',w/2,12,T.muted,'center','middle',MONO);}});
  const g=$('#gb-graph'),gs=sim2d(g,{h:()=>260,draw(ctx,w,h){const H=+hS.value,S=+sS.value/1000,Tk=+tS.value,lo=Math.min(-100,H-1500*S,H-100*S)-20,hi=Math.max(100,H-1500*S,H-100*S)+20;const Pn=panel(ctx,{x:50,y:12,w:w-64,h:h-46},[100,1500],[lo,hi],{xn:5,yn:4,xlabel:'T (K)',ylabel:'ΔG (kJ)',color:T.ink});
      ctx.save();clip(ctx,Pn);const y0=Pn.Y(0);ctx.fillStyle=alpha('#2FA36B',.1);ctx.fillRect(Pn.box.x,y0,Pn.box.w,Pn.box.y+Pn.box.h-y0);ctx.fillStyle=alpha('#E5484D',.08);ctx.fillRect(Pn.box.x,Pn.box.y,Pn.box.w,y0-Pn.box.y);ctx.restore();
      label(ctx,'favorable (ΔG < 0)',Pn.box.x+Pn.box.w-4,Pn.box.y+Pn.box.h-20,T.cv,'right','bottom',MONO);label(ctx,'not favorable (ΔG > 0)',Pn.box.x+Pn.box.w-4,Pn.box.y+10,T.ca,'right','middle',MONO);
      curve(ctx,Pn,t=>H-t*S,100,1500,T.cx,2.8,40);if(S!==0&&H/S>100&&H/S<1500){const tc=H/S;dot(ctx,Pn.X(tc),Pn.Y(0),6,T.hot);label(ctx,'T = '+fmt(tc,0)+' K',Pn.X(tc),Pn.Y(0)-12,T.hot,'center','bottom',MONO);}
      dot(ctx,Pn.X(Tk),Pn.Y(G()),7,T.ink,'#fff');}});
  function upd(){const H=+hS.value,S=+sS.value,T=+tS.value,g=G(),K=Math.exp(-g/(R*T)),Tc=S!==0?H/(S/1000):NaN;
    setText('gb-H-out',(H>=0?'+':'−')+fmt(Math.abs(H),1)+' kJ');setText('gb-S-out',(S>=0?'+':'−')+fmt(Math.abs(S),1)+' J/K');setText('gb-T-out',T+' K');setText('gb-G',(g>=0?'+':'−')+fmt(Math.abs(g),1)+' kJ');
    setText('gb-v',Math.abs(g)<.5?'at equilibrium (ΔG ≈ 0)':g<0?'favorable (spontaneous)':'not favorable');setText('gb-Tc',(S!==0&&Tc>0)?fmt(Tc,0)+' K':'none (never flips)');setText('gb-K',K>1e6||K<1e-6?sci(K,2):fmt(K,K<1?4:2));
    const ds=-H*1000/T+S;setText('gb-U',(ds+0>=0?'+':'−')+fmt(Math.abs(S-H*1000/T),1)+' J/K');
    const c=H<0&&S>0?0:H>0&&S<0?1:H<0&&S<0?2:3,rows=[['−','+','always favorable'],['+','−','never favorable'],['−','−','favorable at low T'],['+','+','favorable at high T']];
    $('#gb-tab').innerHTML=`<thead><tr><th>ΔH</th><th>ΔS</th><th>Result</th></tr></thead><tbody>${rows.map((r,i)=>`<tr${i===c?' style="background:var(--sunk);font-weight:600"':''}><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody>`;sim.render();gs.render();qupd();}
  function setRx(){const r=GBR[+rs.value];hS.value=r.H;sS.value=r.S;upd();}
  rs.addEventListener('change',setRx);['gb-H','gb-S','gb-T'].forEach(id=>bindRange(id,()=>'',upd,false));$('#gb-lab').addEventListener('labreset',setRx);
  /* Q lab */
  const qc=$('#gq-canvas'),qS=$('#gq-q');const qsim=sim2d(qc,{h:()=>230,draw(ctx,w,h){const Tk=+tS.value,g0=G(),lnK=-g0/(R*Tk),P=panel(ctx,{x:50,y:12,w:w-64,h:h-46},[-8,8],[-60,60],{xn:4,yn:4,xlabel:'log₁₀ Q',ylabel:'ΔG (kJ)',color:T_ink()});
      curve(ctx,P,x=>g0+R*Tk*Math.LN10*x,-8,8,T.cx,2.8,50);const lq=+qS.value,gg=g0+R*Tk*Math.LN10*lq,lk=lnK/Math.LN10;line(ctx,P,lk,-60,lk,60,T.ca,1.5,[5,4]);label(ctx,'Q = K',P.X(lk),P.box.y+10,T.ca,'center','middle',MONO);dot(ctx,P.X(lq),P.Y(clamp(gg,-60,60)),7,T.ink,'#fff');
      label(ctx,gg<0?'forward':'reverse',P.X(lq),P.Y(clamp(gg,-60,60))-14,gg<0?T.cv:T.hot,'center','bottom',MONO);}});
  function qupd(){const T=+tS.value,g0=G(),lq=+qS.value,gg=g0+R*T*Math.LN10*lq,K=Math.exp(-g0/(R*T));setText('gq-q-out','Q = '+sci(Math.pow(10,lq),1));setText('gq-g0',(g0>=0?'+':'−')+fmt(Math.abs(g0),1)+' kJ');setText('gq-K',sci(K,2));setText('gq-G',(gg>=0?'+':'−')+fmt(Math.abs(gg),1)+' kJ');
    setText('gq-d',Math.abs(gg)<.3?'at equilibrium (Q = K)':gg<0?'ΔG < 0: runs forward':'ΔG > 0: runs in reverse');qsim.render();}
  bindRange('gq-q',()=>'',qupd,false);$('#gq-lab').addEventListener('labreset',qupd);setRx();drawers.gibbs=upd;
  TIPS['gb-rx']='Each preset sets realistic ΔH and ΔS values; you can adjust either one afterwards.';
  TIPS['gb-H']='ΔH: negative releases heat (favors the reaction).';
  TIPS['gb-S']='ΔS: positive means more disorder (favors the reaction, more so when it is hot).';
  TIPS['gb-T']='Temperature multiplies the entropy term. Slide across the crossover and watch ΔG change sign.';
  TIPS['gq-q']='When Q is smaller than K the reaction goes forward; when it is larger, in reverse.';
  KEYS['gb-canvas']=['Pick a process and slide the temperature.',[['#E08A2E','ΔH term'],['#3E7BDC','−TΔS term']]];
  GLOSS['Gibbs free energy']='G = H − TS; a process at constant T and P is favorable when ΔG is negative.';
  GLOSS['thermodynamically favorable']='A process with a negative ΔG; it can occur without continuous outside energy input (it says nothing about speed).';
  TT.gibbs='Draw the four-quadrant table with students first (signs of ΔH and ΔS), then use the slider to check each corner.';
})();
(function(){
  PROBS.push({id:'gib-dG',topic:'gibbs',title:'Calculate ΔG°',gen(){const H=pick([-92.2,-57.2,-184.6,+178.3,+41.2,-890.3,+131.3]),S=pick([-198.7,-175.8,+20.0,+160.6,+42.0,-242.8,+133.6,+10.5]),T=pick([298,350,400,500,800,1000]),g=H-T*S/1000;
    return {q:`For a reaction, ΔH° = ${H>0?'+':''}${H} kJ and ΔS° = ${S>0?'+':''}${S} J/K. Calculate ΔG° at ${T} K.`,ans:g,unit:'kJ',tol:.01,hint:'ΔG° = ΔH° − TΔS°. Convert ΔS° to kJ/K first.',sol:`ΔG° = ${H} − (${T})(${S/1000}) = <b>${fmt(g,1)} kJ</b> (${g<0?'favorable':'not favorable'}).`};}});
  PROBS.push({id:'gib-T',topic:'gibbs',title:'Temperature of the sign change',gen(){const H=pick([+178.3,+40.7,+131.3,+91.0,-92.2,-57.2,+66.4]),S=H>0?pick([+160.6,+109,+133.6,+215,+190]):pick([-198.7,-175.8,-160,-120]),Tc=H/(S/1000);
    return {q:`A reaction has ΔH° = ${H>0?'+':''}${H} kJ and ΔS° = ${S>0?'+':''}${S} J/K. At what temperature does ΔG° change sign?`,ans:Tc,unit:'K',tol:.02,hint:'Set ΔG° = 0: T = ΔH°/ΔS°. Use consistent units.',sol:`T = ${H} kJ / (${S/1000} kJ/K) = <b>${fmt(Tc,0)} K</b>. ${H>0?'The reaction is favorable above this temperature.':'The reaction is favorable below this temperature.'}`};}});
  PROBS.push({id:'gib-K',topic:'gibbs',title:'K from ΔG°',gen(){const g=pick([-45,-20,-5,-120,10,25,60,-80]),T=pick([298,350,400,500]),K=Math.exp(-g*1000/(8.314*T));
    return {q:`ΔG° = ${g>0?'+':''}${g} kJ/mol for a reaction at ${T} K. What is K? (R = 8.314 J/mol·K)`,ans:K,unit:'',tol:.03,hint:'K = exp(−ΔG°/RT) with ΔG° in joules.',sol:`K = exp(−(${g*1000})/(8.314 × ${T})) = exp(${fmt(-g*1000/(8.314*T),3)}) = <b>${sci(K,3)}</b>.`};}});
  PROBS.push({id:'gib-G0',topic:'gibbs',title:'ΔG° from K',gen(){const K=pick([1.8e-5,4.5e3,6.5e8,2.0e-3,1.0e5,50,0.36]),T=pick([298,350,500]),g=-8.314*T*Math.log(K)/1000;
    return {q:`A reaction has K = ${sci(K,2)} at ${T} K. What is ΔG°? (R = 8.314 J/mol·K)`,ans:g,unit:'kJ/mol',tol:.02,hint:'ΔG° = −RT ln K.',sol:`ΔG° = −(8.314)(${T}) ln(${sci(K,2)}) = <b>${fmt(g,1)} kJ/mol</b>.`};}});
  PROBS.push({id:'gib-Q',topic:'gibbs',title:'ΔG at non-standard conditions',gen(){const g0=pick([-30,-10,5,20,-50]),Q=pick([1e-4,1e-2,1.0,50,2e3,1e5]),T=pick([298,350,400]),g=g0+8.314e-3*T*Math.log(Q);
    return {q:`A reaction has ΔG° = ${g0>0?'+':''}${g0} kJ/mol at ${T} K. What is ΔG when Q = ${sci(Q,1)}? (R = 8.314 J/mol·K)`,ans:g,unit:'kJ/mol',tol:.03,hint:'ΔG = ΔG° + RT ln Q.',sol:`ΔG = ${g0} + (8.314×10⁻³)(${T}) ln(${sci(Q,1)}) = <b>${fmt(g,1)} kJ/mol</b>; the reaction goes ${g<0?'forward':'in reverse'}.`};}});
  PROBS.push({id:'gib-sign',topic:'gibbs',title:'When is it favorable?',gen(){const Q=[['−','+','always favorable',0],['+','−','never favorable',1],['−','−','favorable only at low temperatures',2],['+','+','favorable only at high temperatures',3]],[hs,ss,res,a]=pick(Q),ch=Q.map(x=>x[2]);
    return {q:`A process has a ${hs==='−'?'negative':'positive'} ΔH and a ${ss==='−'?'negative':'positive'} ΔS. When is it thermodynamically favorable?`,choices:ch,ans:a,hint:'ΔG = ΔH − TΔS. Which way does the −TΔS term move as T increases?',sol:`<b>${res}</b>.`};}});
  PROBS.push({id:'gib-surr',topic:'gibbs',title:'Entropy of the surroundings',gen(){const H=pick([-92.2,-184.6,-57.2,+41.2,+178.3,-890.3]),T=pick([298,350,500]),ds=-H*1000/T;
    return {q:`A reaction has ΔH = ${H>0?'+':''}${H} kJ at ${T} K. What is ΔS of the surroundings?`,ans:ds,unit:'J/K',tol:.02,hint:'ΔS(surr) = −ΔH/T. Convert kJ to J.',sol:`ΔS<sub>surr</sub> = −(${H*1000} J)/${T} K = <b>${fmt(ds,1)} J/K</b>. ${ds>0?'Heat released into the surroundings raises their entropy.':'Heat absorbed from the surroundings lowers their entropy.'}`};}});
})();

(function(){
  PROBS.push({id:'gib-couple',topic:'gibbs',title:'Coupled reactions',gen(){const a=pick([13.8,15,20,28,9.5]),b=pick([-30,-31,-35,-40,-5,-12]),tot=a+b;
    return {q:`An unfavorable reaction has ΔG° = +${a} kJ/mol. It is coupled to a reaction with ΔG° = ${b} kJ/mol. What is ΔG° for the coupled process, and does it proceed?`,choices:[`${fmt(tot,1)} kJ/mol; it proceeds`,`${fmt(tot,1)} kJ/mol; it does not proceed`],ans:tot<0?0:1,hint:'Add the two ΔG° values. A negative total means the coupled reaction is favorable.',sol:`ΔG° = ${a} + (${b}) = <b>${fmt(tot,1)} kJ/mol</b>: ${tot<0?'negative, so the coupled reaction proceeds':'positive, so it does not proceed'}.`};}});
  const R=[['CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',[['CH₄',-50.8],['CO₂',-394.4],['H₂O(l)',-237.1]],-394.4+2*-237.1-(-50.8)],['2NO(g) + O₂(g) → 2NO₂(g)',[['NO',86.6],['NO₂',51.3]],2*51.3-2*86.6],['CaCO₃(s) → CaO(s) + CO₂(g)',[['CaCO₃',-1128.8],['CaO',-603.3],['CO₂',-394.4]],-603.3-394.4+1128.8],['N₂(g) + 3H₂(g) → 2NH₃(g)',[['NH₃',-16.5]],2*-16.5]];
  PROBS.push({id:'gib-dGf',topic:'gibbs',title:'ΔG° from free energies of formation',gen(){const [eq,d,ans]=pick(R);
    return {q:`Using ΔG°<sub>f</sub> (kJ/mol): ${d.map(([n,v])=>n+' '+(v>0?'+':'')+v).join(', ')} (elements in their standard states are 0), find ΔG° for ${eq}.`,ans,unit:'kJ',tol:.01,hint:'ΔG° = ΣnΔG°f(products) − ΣnΔG°f(reactants), with coefficients.',sol:`ΔG° = <b>${fmt(ans,1)} kJ</b> (${ans<0?'favorable':'not favorable'}).`};}});
  const Q=[['Diamond converts to graphite with ΔG° < 0, yet diamonds last for ages. Why?',['The activation energy is very high, so the reaction is extremely slow','The reaction is not thermodynamically favorable','ΔG° is positive','Diamond has higher entropy than graphite'],0,'a negative ΔG° says nothing about rate'],['A reaction has ΔG° < 0. Which conclusion is justified?',['The reaction is thermodynamically favorable (K > 1), but its rate is not known','The reaction is fast','The reaction has a low activation energy','The reaction goes to completion instantly'],0,'ΔG° gives direction and extent, not speed'],['A reaction can form product A quickly (low Ea) or product B slowly (more stable). If the reaction is not reversible and time is short, which forms mostly?',['A, the kinetic product','B, the thermodynamic product','Equal amounts','Neither'],0,'the faster pathway wins when equilibrium cannot be reached']];
  PROBS.push({id:'gib-kin',topic:'gibbs',title:'Thermodynamic vs kinetic',gen(){const [q,ch,a,why]=pick(Q);return {q,choices:ch,ans:a,hint:'Separate "can it happen" (ΔG) from "how fast" (activation energy).',sol:`<b>${ch[a]}</b>: ${why}.`};}});
})();
