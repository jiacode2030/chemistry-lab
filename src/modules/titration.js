
/* ---------------- Titration curves & indicators ---------------- */
const TT_AN=[{n:'HCl (strong acid) with NaOH',kind:'sa',Ka:1e9,pKa:null,tn:'NaOH'},{n:'CH₃COOH (Ka 1.8×10⁻⁵) with NaOH',kind:'wa',Ka:1.8e-5,tn:'NaOH'},{n:'HCN (Ka 4.9×10⁻¹⁰) with NaOH',kind:'wa',Ka:4.9e-10,tn:'NaOH'},{n:'NH₃ (Kb 1.8×10⁻⁵) with HCl',kind:'wb',Ka:1e-14/1.8e-5,tn:'HCl'},{n:'NaOH (strong base) with HCl',kind:'sb',Ka:1,tn:'HCl'}];
const TT_IND=[{n:'methyl orange (3.1–4.4)',lo:3.1,hi:4.4,a:'#E5484D',b:'#F5C34D'},{n:'methyl red (4.4–6.2)',lo:4.4,hi:6.2,a:'#E5484D',b:'#F5C34D'},{n:'bromothymol blue (6.0–7.6)',lo:6.0,hi:7.6,a:'#F5C34D',b:'#3E7BDC'},{n:'phenolphthalein (8.2–10.0)',lo:8.2,hi:10.0,a:'rgba(255,255,255,0)',b:'#E0368A'}];
function ttPH(an,Ca,Va,Cb,Vb){/* Va, Vb in mL; Ca analyte conc, Cb titrant conc */const Vt=Va+Vb,nA=Ca*Va/Vt,nT=Cb*Vb/Vt,Kw=1e-14;
  let f;if(an.kind==='sa'||an.kind==='wa'){f=h=>nT+h-Kw/h-nA*an.Ka/(an.Ka+h);}else if(an.kind==='wb'){f=h=>h+nA*h/(h+an.Ka)-nT-Kw/h;}else{f=h=>nA*0+(nA)+h-nT-Kw/h;}
  if(an.kind==='sb')f=h=>nA+h-nT-Kw/h;let lo=1e-15,hi=10;for(let i=0;i<200;i++){const m=Math.sqrt(lo*hi);f(m)<0?lo=m:hi=m;}return -Math.log10(Math.sqrt(lo*hi));}
(function titration(){
  const cv=$('#tt-canvas');if(!cv)return;const an=$('#tt-an'),caS=$('#tt-ca'),cbS=$('#tt-cb'),ind=$('#tt-ind'),vS=$('#tt-v');an.innerHTML=TT_AN.map((a,i)=>`<option value="${i}">${a.n}</option>`).join('');ind.innerHTML=TT_IND.map((a,i)=>`<option value="${i}">${a.n}</option>`).join('');ind.value=3;an.value=1;
  const H=300,Va=25;let drip=false,drops=[],P=[],lastPH=0;const A=()=>TT_AN[+an.value],Ca=()=>+caS.value,Cb=()=>+cbS.value,Ve=()=>Ca()*Va/Cb(),ph=v=>ttPH(A(),Ca(),Va,Cb(),v);
  const colOf=pH=>{const I=TT_IND[+ind.value],t=clamp((pH-I.lo)/(I.hi-I.lo),0,1);const c1=I.a,c2=I.b;const parse=c=>{if(c.startsWith('rgba'))return [255,255,255,0];const n=parseInt(c.slice(1),16);return [n>>16&255,n>>8&255,n&255,1];};const a=parse(c1),b=parse(c2);const m=a.map((v,i)=>v+(b[i]-v)*t);return `rgba(${Math.round(m[0])},${Math.round(m[1])},${Math.round(m[2])},${(.12+.5*m[3])})`;};
  function fillP(w){P=[];for(let i=0;i<110;i++)P.push({x:Math.random(),y:Math.random(),vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random(),k:i%5});}
  const flask=(ctx,cx,top,w,h)=>{ctx.beginPath();ctx.moveTo(cx-14,top);ctx.lineTo(cx-14,top+h*.28);ctx.lineTo(cx-w/2,top+h);ctx.lineTo(cx+w/2,top+h);ctx.lineTo(cx+14,top+h*.28);ctx.lineTo(cx+14,top);};
  const sim=sim2d(cv,{h:()=>H,step(dt){if(drip){vS.value=Math.min(50,+vS.value+dt*(Math.abs(+vS.value-Ve())<2?1.5:5));if(+vS.value>=50){drip=false;$('#tt-drip').textContent='Drip';}upd(true);}
      if(!P.length)fillP(cv.clientWidth);P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<0||p.x>1)p.vx*=-1;if(p.y<0||p.y>1)p.vy*=-1;p.x=clamp(p.x,0,1);p.y=clamp(p.y,0,1);});
      if(drip&&Math.random()<dt*6)drops.push({y:40,v:0});drops.forEach(d=>{d.v+=500*dt;d.y+=d.v*dt;});drops=drops.filter(d=>d.y<150);},
    draw(ctx,w,h){const v=+vS.value,a=A(),pH=ph(v),cx=w/2,fw=Math.min(180,w*.7),ft=140,fh=130;
      /* burette */
      const bx=cx,by=8,bh=120,fillH=bh*(1-v/50)*1;ctx.strokeStyle=T.ink;ctx.lineWidth=2;ctx.strokeRect(bx-7,by,14,bh);ctx.fillStyle=alpha('#E0A82E',.4);ctx.fillRect(bx-6,by+bh-fillH,12,fillH);for(let i=0;i<=5;i++){ctx.beginPath();ctx.moveTo(bx+7,by+i*bh/5);ctx.lineTo(bx+13,by+i*bh/5);ctx.stroke();}
      ctx.fillStyle=T.ink;ctx.fillRect(bx-3,by+bh,6,8);label(ctx,a.tn,bx+18,by+8,T.muted,'left','middle',MONO);label(ctx,fmt(Cb(),2)+' M',bx+18,by+22,T.muted,'left','middle',MONO);
      drops.forEach(d=>{ctx.fillStyle='#E0A82E';ctx.beginPath();ctx.arc(bx,by+bh+8+d.y*.2,3,0,7);ctx.fill();});
      /* flask */
      ctx.fillStyle=colOf(pH);ctx.beginPath();ctx.moveTo(cx-fw/2*.9,ft+fh*.6);ctx.lineTo(cx-fw/2,ft+fh);ctx.lineTo(cx+fw/2,ft+fh);ctx.lineTo(cx+fw/2*.9,ft+fh*.6);ctx.closePath();ctx.fill();flask(ctx,cx,ft,fw,fh);ctx.strokeStyle=T.ink;ctx.lineWidth=2.4;ctx.stroke();
      /* particles */
      const ve=Ve(),fr=clamp(v/ve,0,1),ex=Math.max(0,(v-ve)/ve),N=36,cnt={};
      const spec=a.kind==='sa'?[['H₃O⁺',N*(1-fr),'#3E7BDC'],['Cl⁻',N,'#2FA36B'],['Na⁺',N*Math.min(v/ve,1.0)+N*ex,'#E0A82E'],['OH⁻',N*ex,'#E5484D']]:a.kind==='wa'?[['HA',N*(1-fr),'#9FB6CC'],['A⁻',N*fr,'#8B5CF6'],['Na⁺',N*fr+N*ex,'#E0A82E'],['OH⁻',N*ex,'#E5484D']]:a.kind==='wb'?[['B',N*(1-fr),'#9FB6CC'],['BH⁺',N*fr,'#3E7BDC'],['Cl⁻',N*fr+N*ex,'#2FA36B'],['H₃O⁺',N*ex,'#3E7BDC']]:[['OH⁻',N*(1-fr),'#E5484D'],['Na⁺',N,'#E0A82E'],['Cl⁻',N*fr+N*ex,'#2FA36B'],['H₃O⁺',N*ex,'#3E7BDC']];
      const left=fw*.8,x0=cx-left/2*.9,y0=ft+fh*.66,hh=fh*.28;let idx=0;
      spec.forEach(([n,c,col],si)=>{const k=Math.min(40,Math.round(c));for(let i=0;i<k;i++){const p=P[(si*23+i)%P.length];ball2(ctx,x0+p.x*left*.9,y0+p.y*hh,3.6,col);}});
      ctx.save();ctx.font='11px "IBM Plex Mono",monospace';spec.forEach(([n,c,col],i)=>{if(Math.round(c)<1)return;ctx.fillStyle=col;ctx.beginPath();ctx.arc(10,ft+10+i*16,4,0,7);ctx.fill();ctx.fillStyle=T.ink;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(n,19,ft+10+i*16);});ctx.restore();
      label(ctx,'pH '+fmt(pH,2),cx,H-6,T.ink,'center','middle','600 14px "IBM Plex Mono",monospace');}});
  const g=$('#tt-graph'),gs=sim2d(g,{h:()=>H,draw(ctx,w,h){const a=A(),Pn=panel(ctx,{x:44,y:12,w:w-58,h:h-48},[0,50],[0,14],{xn:5,yn:7,xlabel:'volume added (mL)',ylabel:'pH',color:T.ink}),I=TT_IND[+ind.value];
      ctx.fillStyle=alpha(T.hot,.14);ctx.fillRect(Pn.box.x,Pn.Y(I.hi),Pn.box.w,Pn.Y(I.lo)-Pn.Y(I.hi));label(ctx,'indicator range',Pn.box.x+Pn.box.w-4,Pn.Y(I.hi)+10,T.hot,'right','middle',MONO);
      curve(ctx,Pn,x=>ph(Math.max(x,0)),0,50,T.cx,2.8,400);const ve=Ve();line(ctx,Pn,ve,0,ve,14,T.muted,1.5,[5,4]);label(ctx,'equivalence',Pn.X(ve)+4,Pn.box.y+22,T.muted,'left','middle',MONO);
      if(a.kind==='wa'||a.kind==='wb'){line(ctx,Pn,ve/2,0,ve/2,14,T.ca,1.2,[3,3]);label(ctx,'½ eq',Pn.X(ve/2)+3,Pn.box.y+10,T.ca,'left','middle',MONO);}
      const v=+vS.value;dot(ctx,Pn.X(v),Pn.Y(ph(v)),6.5,T.ink,'#fff');}});
  function where(v){const ve=Ve(),a=A(),d=v-ve;if(v<.05)return 'start';if(Math.abs(d)<ve*.012)return 'equivalence point';if(d>0)return 'past equivalence (excess '+(a.tn==='NaOH'?'OH⁻':'H₃O⁺')+')';if(a.kind==='wa'||a.kind==='wb')return Math.abs(v-ve/2)<ve*.02?'half-equivalence: pH = pKa':'buffer region';return 'before equivalence';}
  function upd(fromStep){const v=+vS.value,a=A(),ve=Ve(),pe=ph(ve);setText('tt-ca-out',fmt(Ca(),2)+' M');setText('tt-cb-out',fmt(Cb(),2)+' M');setText('tt-v-out',fmt(v,2)+' mL');setText('tt-ph',fmt(ph(v),2));setText('tt-where',where(v));setText('tt-ve',fmt(ve,2)+' mL');setText('tt-pe',fmt(pe,2));
    setText('tt-ph2',a.kind==='wa'||a.kind==='wb'?fmt(ph(ve/2),2):'—');if(!fromStep)sim.render();gs.render();}
  [an,ind].forEach(e=>e.addEventListener('change',()=>{vS.value=0;drip=false;$('#tt-drip').textContent='Drip';upd();}));['tt-ca','tt-cb'].forEach(id=>bindRange(id,()=>'',()=>{upd();},false));bindRange('tt-v',()=>'',()=>{drip=false;upd();},false);
  $('#tt-drip').addEventListener('click',()=>{if(+vS.value>=50)vS.value=0;drip=!drip;$('#tt-drip').textContent=drip?'Pause':'Drip';upd(true);sim.render();});$('#tt-lab').addEventListener('labreset',()=>{vS.value=0;drip=false;$('#tt-drip').textContent='Drip';upd();});
  fillP(cv.clientWidth||300);upd();drawers.titration=upd;
  TIPS['tt-an']='A strong acid, a weak acid, a weak base and a strong base each give a different curve.';
  TIPS['tt-ca']='More concentrated flask contents need more titrant, so equivalence moves right.';
  TIPS['tt-cb']='A more concentrated titrant reaches equivalence sooner.';
  TIPS['tt-ind']='A good indicator changes color across the steep part of the curve, where the pH jumps.';
  TIPS['tt-v']='Drag the volume and watch the pH, the particles and the dot on the curve.';
  KEYS['tt-canvas']=['Press Drip, or drag the volume slider.',[['hot','indicator range on the curve']]];
  GLOSS['titration']='Adding a solution of known concentration to another until the reaction is exactly complete.';
  GLOSS['equivalence point']='The point where moles of titrant added exactly equal the moles of analyte present.';
  GLOSS['indicator']='A weak acid or base whose color changes over a narrow pH range.';
  GLOSS['buffer region']='The part of a weak-acid titration where HA and A⁻ are both present and the pH changes slowly.';
  GLOSS['half-equivalence']='The point where half of the weak acid has been neutralized: [HA] = [A⁻], so pH = pKa.';
  TT.titration='Have students sketch the curve for each analyte before running it, then label the buffer region and half-equivalence point.';
})();
(function(){
  const pKa=K=>-Math.log10(K);const AC=[['CH₃COOH',1.8e-5],['HF',6.8e-4],['HNO₂',4.5e-4],['HCOOH',1.8e-4],['HClO',3.0e-8]];
  PROBS.push({id:'tit-V',topic:'titration',title:'Volume at equivalence',gen(){const k=pick([['HCl',1,'NaOH'],['CH₃COOH',1,'NaOH'],['H₂SO₄',2,'NaOH'],['HNO₃',1,'KOH'],['HCl',1,'Ba(OH)₂']]),Ca=pick([.100,.150,.250,.0800]),Va=pick([20.0,25.0,40.0,50.0]),Cb=pick([.100,.200,.125,.150]),nb=k[2]==='Ba(OH)₂'?2:1,V=Ca*Va*k[1]/(Cb*nb);
    return {q:`What volume of ${fmt(Cb,3)} M ${k[2]} is needed to reach the equivalence point with ${fmt(Va,1)} mL of ${fmt(Ca,3)} M ${k[0]}?`,ans:V,unit:'mL',tol:.01,hint:'Moles of H⁺ supplied must equal moles of OH⁻ supplied. Watch for acids or bases that give 2 per formula unit.',sol:`n(H⁺) = ${fmt(Ca*Va,3)} mmol × ${k[1]} = ${fmt(Ca*Va*k[1],3)} mmol; V = ${fmt(Ca*Va*k[1],3)} / (${fmt(Cb,3)} × ${nb}) = <b>${fmt(V,2)} mL</b>.`};}});
  PROBS.push({id:'tit-conc',topic:'titration',title:'Unknown concentration from a titration',gen(){const Va=pick([10.0,20.0,25.0]),Cb=pick([.100,.0500,.1500]),Ve=pick([12.4,18.6,22.3,27.8,33.1]),Ca=Cb*Ve/Va;
    return {q:`A ${fmt(Va,1)} mL sample of HCl of unknown concentration requires ${fmt(Ve,1)} mL of ${fmt(Cb,4)} M NaOH to reach the endpoint. What is the concentration of the HCl?`,ans:Ca,unit:'M',tol:.01,hint:'n(base) = C × V at the endpoint. Acid and base react 1:1.',sol:`n(OH⁻) = ${fmt(Cb,4)} × ${fmt(Ve,1)} = ${fmt(Cb*Ve,3)} mmol = n(H⁺); C = ${fmt(Cb*Ve,3)}/${fmt(Va,1)} = <b>${fmt(Ca,4)} M</b>.`};}});
  PROBS.push({id:'tit-strong',topic:'titration',title:'pH during a strong-strong titration',gen(){const Ca=pick([.100,.200]),Va=pick([25.0,50.0]),Cb=Ca,Ve=Va;let Vb;const pts=[.2,.5,.8,1.25,1.5];const f=pick(pts);Vb=Va*f;const nA=Ca*Va,nB=Cb*Vb,Vt=Va+Vb,ex=nA-nB,ph=ex>0?-Math.log10(ex/Vt):14+Math.log10(-ex/Vt);
    return {q:`${fmt(Va,1)} mL of ${fmt(Ca,3)} M HCl is titrated with ${fmt(Cb,3)} M NaOH. What is the pH after ${fmt(Vb,1)} mL of NaOH has been added?`,ans:ph,unit:'',abs:.03,hint:'Find the moles of H⁺ and OH⁻; subtract; divide the leftover by the total volume; convert to pH.',sol:`n(H⁺) = ${fmt(nA,2)} mmol, n(OH⁻) = ${fmt(nB,2)} mmol. Excess ${ex>0?'H⁺':'OH⁻'} = ${fmt(Math.abs(ex),2)} mmol in ${fmt(Vt,1)} mL = ${sci(Math.abs(ex)/Vt,3)} M, so pH = <b>${fmt(ph,2)}</b>.`};}});
  PROBS.push({id:'tit-half',topic:'titration',title:'Half-equivalence point',gen(){const [n,K]=pick(AC);
    return {q:`A solution of ${n} (K<sub>a</sub> = ${sci(K,2)}) is titrated with NaOH. What is the pH at the half-equivalence point?`,ans:pKa(K),unit:'',abs:.03,hint:'At half-equivalence [HA] = [A⁻], so the log term in Henderson–Hasselbalch is zero.',sol:`pH = pK<sub>a</sub> = −log(${sci(K,2)}) = <b>${fmt(pKa(K),2)}</b>.`};}});
  PROBS.push({id:'tit-buffer',topic:'titration',title:'pH in the buffer region',gen(){const [n,K]=pick(AC),Ca=pick([.100,.200]),Va=pick([25.0,50.0]),f=pick([.2,.3,.4,.6,.7,.8]),Cb=Ca,Vb=Va*f,nHA=Ca*Va-Cb*Vb,nA=Cb*Vb,ph=pKa(K)+Math.log10(nA/nHA);
    return {q:`${fmt(Va,1)} mL of ${fmt(Ca,3)} M ${n} (K<sub>a</sub> = ${sci(K,2)}) is titrated with ${fmt(Cb,3)} M NaOH. What is the pH after ${fmt(Vb,1)} mL of NaOH has been added?`,ans:ph,unit:'',abs:.03,hint:'Before equivalence the mixture is a buffer: find moles of HA left and A⁻ made, then use pH = pKa + log(A⁻/HA).',sol:`n(HA) left = ${fmt(Ca*Va,2)} − ${fmt(Cb*Vb,2)} = ${fmt(nHA,2)} mmol; n(A⁻) = ${fmt(nA,2)} mmol. pH = ${fmt(pKa(K),2)} + log(${fmt(nA,2)}/${fmt(nHA,2)}) = <b>${fmt(ph,2)}</b>.`};}});
  PROBS.push({id:'tit-eq',topic:'titration',title:'pH at the equivalence point',gen(){const [n,K]=pick(AC.filter(x=>x[1]<1e-3)),Ca=pick([.100,.200]),Va=pick([25.0,50.0]),Cb=Ca,Vt=Va+Va*Ca/Cb,cA=Ca*Va/Vt,Kb=1e-14/K,x=Math.sqrt(Kb*cA),ph=14+Math.log10(x);
    return {q:`${fmt(Va,1)} mL of ${fmt(Ca,3)} M ${n} (K<sub>a</sub> = ${sci(K,2)}) is titrated to the equivalence point with ${fmt(Cb,3)} M NaOH. What is the pH at equivalence?`,ans:ph,unit:'',abs:.04,hint:'At equivalence only the conjugate base A⁻ remains. Find its concentration (total volume!), then Kb = Kw/Ka and [OH⁻] = √(Kb·c).',sol:`[A⁻] = ${fmt(Ca*Va,2)} mmol / ${fmt(Vt,1)} mL = ${fmt(cA,4)} M; K<sub>b</sub> = ${sci(Kb,2)}; [OH⁻] = √(${sci(Kb,2)} × ${fmt(cA,4)}) = ${sci(x,2)} M; pOH = ${fmt(-Math.log10(x),2)}, pH = <b>${fmt(ph,2)}</b>.`};}});
  const IN=[['methyl orange',3.1,4.4],['methyl red',4.4,6.2],['bromothymol blue',6.0,7.6],['phenolphthalein',8.2,10.0]];
  PROBS.push({id:'tit-ind',topic:'titration',title:'Choose an indicator',gen(){const opts=[['a strong acid with a strong base',7.0,2],['acetic acid with NaOH',8.7,3],['ammonia with HCl',5.3,1]],[nm,pe,ai]=pick(opts),ch=IN.map(i=>`${i[0]} (${i[1]}–${i[2]})`);
    return {q:`The equivalence point of the titration of ${nm} has a pH of about ${pe}. Which indicator is the best choice?`,choices:ch,ans:ai,hint:'Choose the indicator whose color-change range includes the pH at equivalence.',sol:`The best choice is <b>${ch[ai]}</b>: its range contains pH ${pe}.`};}});
})();
