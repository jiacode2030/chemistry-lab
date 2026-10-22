
/* ---------------- Gas laws & kinetic theory ---------------- */
const RG=0.08206;
const VDW={'He':[.0346,.0238],'N₂':[1.370,.0387],'CH₄':[2.253,.0428],'CO₂':[3.640,.04267],'NH₃':[4.225,.0371]};
(function gases(){
  const cv=$('#gs-canvas');if(!cv)return;
  const MODES={boyle:{inp:['v'],law:"Boyle's law: at constant temperature and amount, pressure is inversely proportional to volume. Move the volume slider; pressure follows.",d:{n:1,t:300}},
    charles:{inp:['t'],law:"Charles's law: at constant pressure and amount, volume is proportional to the Kelvin temperature. Heat the gas; the piston rises.",d:{n:1,p:1}},
    gay:{inp:['t'],law:"Gay-Lussac's law: at constant volume and amount, pressure is proportional to the Kelvin temperature. Heat the gas in a rigid tank.",d:{n:1,v:24.6}},
    avo:{inp:['n'],law:"Avogadro's law: at constant pressure and temperature, volume is proportional to the number of moles. Add gas; the piston rises.",d:{p:1,t:300}},
    real:{inp:['n','t','v'],law:'Real gas (van der Waals): squeeze and cool it and compare the real pressure with the ideal-gas prediction.',d:{}}};
  const sel=$('#gs-gas');sel.innerHTML=Object.keys(VDW).map(g=>`<option value="${g}">${g}</option>`).join('');sel.value='N₂';
  let mode='boyle',S={p:1,v:24.6,t:300,n:1},parts=[],hits=[],pxCur=0,tPrev=300;
  const el={p:$('#gs-p'),v:$('#gs-v'),t:$('#gs-t'),n:$('#gs-n')};
  const vdw=(n,t,v)=>{const [a,b]=VDW[sel.value];v=Math.max(v,n*b*1.02);return n*RG*t/(v-n*b)-a*n*n/(v*v);};
  function compute(){const M=MODES[mode];
    if(mode==='boyle'||mode==='gay')S.p=S.n*RG*S.t/S.v;else if(mode==='charles'||mode==='avo')S.v=S.n*RG*S.t/S.p;else S.p=vdw(S.n,S.t,S.v);}
  function sync(){['p','v','t','n'].forEach(k=>{const e=el[k];e.value=clamp(S[k],+e.min,+e.max);const o=$('#gs-'+k+'-out');o.textContent=({p:x=>fmt(x,x<10?2:0)+' atm',v:x=>fmt(x,x<10?2:1)+' L',t:x=>x+' K',n:x=>fmt(x,1)+' mol'})[k](S[k]);});}
  function setMode(m){mode=m;const M=MODES[m];S={p:1,v:24.6,t:300,n:1,...M.d};
    el.v.min=m==='real'?.05:5;el.v.step=m==='real'?.05:.5;el.n.max=m==='avo'?2:3;S.v=m==='real'?5:S.v;
    ['p','v','t','n'].forEach(k=>{el[k].disabled=!M.inp.includes(k);});$('#gs-p').closest('.ctl').hidden=m==='real';$('#gs-gasbox').hidden=m!=='real';$('#gs-realbox').hidden=m!=='real';$('#gs-zbox').hidden=m!=='real';
    $('#gs-law').textContent=M.law;compute();sync();fit();upd();}
  function fit(){const N=Math.round(S.n*14),w=cv.clientWidth||400,h=230;while(parts.length<N)parts.push({x:Math.random()*60,y:Math.random()*h,a:Math.random()*6.28,u:Math.random()});parts.length=N;tPrev=S.t;}
  const sim=sim2d(cv,{h:()=>272,step(dt){const w=cv.clientWidth,boxW=w-56,tx=Math.max(24,boxW*S.v/50);pxCur=pxCur?pxCur+(tx-pxCur)*Math.min(1,dt*6):tx;
      const sig=60*Math.sqrt(S.t/300),H=230,now=performance.now();
      parts.forEach(p=>{if(!p.vx){const s=sig*Math.sqrt(-2*Math.log(1-p.u*.999));p.vx=s*Math.cos(p.a);p.vy=s*Math.sin(p.a);p.s=s;}
        const k=Math.sqrt(S.t/ (p.T||300));if(p.T!==S.t){p.vx*=k;p.vy*=k;p.T=S.t;}
        p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<4){p.x=4;p.vx=Math.abs(p.vx);}if(p.y<4){p.y=4;p.vy=Math.abs(p.vy);}if(p.y>H-4){p.y=H-4;p.vy=-Math.abs(p.vy);}
        if(p.x>pxCur-4){p.x=pxCur-4;if(p.vx>0){p.vx=-p.vx;hits.push(now);}}});
      while(hits.length&&now-hits[0]>1000)hits.shift();},
    draw(ctx,w,h){const H=230,x0=8,y0=10;ctx.save();ctx.translate(x0,y0);ctx.strokeStyle=T.ink;ctx.lineWidth=3;ctx.strokeRect(0,0,Math.max(pxCur,10),H);
      const r=mode==='real'?2.4+VDW[sel.value][1]*50:3.2;parts.forEach(p=>ball2(ctx,p.x,p.y,r,mode==='real'?T.ca:T.cx));
      /* piston: plate, rod and a stack of weights for pressure */
      ctx.fillStyle=T.muted;ctx.fillRect(pxCur-3,-6,9,H+12);ctx.fillRect(pxCur+6,H/2-4,w-pxCur-30,8);
      const nw=clamp(Math.round(S.p*2),1,10);ctx.fillStyle=T.ink;for(let i=0;i<nw;i++)ctx.fillRect(pxCur+6,H/2-14-i*8+(-4),20,6);
      label(ctx,'P = '+fmt(S.p,S.p<10?2:0)+' atm',Math.max(pxCur/2,50),H+10,T.muted,'center','top',MONO);
      const arrowLen=clamp(S.p*10,6,50);arrow(ctx,pxCur+12,H-14,pxCur+12,H-14-0,T.hot,1);ctx.restore();}});
  const g=$('#gs-graph'),simG=sim2d(g,{h:()=>272,draw(ctx,w,h){const box={x:48,y:12,w:w-62,h:h-46};let P,xr,yr,cx,cy,lab;
      if(mode==='real'){const [a,b]=VDW[sel.value];xr=[0,500];yr=[.2,2.0];P=panel(ctx,box,xr,yr,{xn:5,yn:4,xlabel:'pressure (atm)',ylabel:'Z = PV/nRT',color:T.ink});line(ctx,P,0,1,500,1,T.muted,1.5,[5,4]);label(ctx,'ideal gas',P.X(495),P.Y(1)-6,T.muted,'right','bottom',MONO);
        ctx.save();clip(ctx,P);ctx.strokeStyle=T.ca;ctx.lineWidth=2.4;ctx.beginPath();let first=true,lastP=0;for(let v=60;v>=b*1.12;v*=.97){const p=vdw(1,S.t,v),z=p*v/(RG*S.t);if(p>500||p<lastP)break;lastP=p;first?ctx.moveTo(P.X(p),P.Y(z)):ctx.lineTo(P.X(p),P.Y(z));first=false;}ctx.stroke();ctx.restore();
        const Z=S.p*S.v/(S.n*RG*S.t);if(S.p<=500)dot(ctx,P.X(S.p),P.Y(clamp(Z,.2,2)),6,T.hot,T.surface);label(ctx,sel.value+' at '+S.t+' K',P.X(250),P.Y(1.85),T.ca,'center','middle',MONO);return;}
      const C={boyle:{x:'v',y:'p',xr:[0,50],yr:[0,5.2],xl:'V (L)',yl:'P (atm)',f:x=>S.n*RG*S.t/x},charles:{x:'t',y:'v',xr:[0,600],yr:[0,55],xl:'T (K)',yl:'V (L)',f:x=>S.n*RG*x/S.p},gay:{x:'t',y:'p',xr:[0,600],yr:[0,2.4],xl:'T (K)',yl:'P (atm)',f:x=>S.n*RG*x/S.v},avo:{x:'n',y:'v',xr:[0,2.05],yr:[0,55],xl:'n (mol)',yl:'V (L)',f:x=>x*RG*S.t/S.p}}[mode];
      P=panel(ctx,box,C.xr,C.yr,{xn:5,yn:4,xlabel:C.xl,ylabel:C.yl,color:T.ink});curve(ctx,P,C.f,Math.max(C.xr[0]+(mode==='boyle'?4:0),0.001),C.xr[1],T.cx,2.6,200);dot(ctx,P.X(S[C.x]),P.Y(S[C.y]),6.5,T.hot,T.surface);}});
  drawers.gases=()=>{sim.render();simG.render();mb.render();};
  function upd(){const id=S.n*RG*S.t/S.v;setText('gs-pid',fmt(id,id<10?2:1)+' atm');
    if(mode==='real'){const pr=vdw(S.n,S.t,S.v),z=pr*S.v/(S.n*RG*S.t);setText('gs-preal',fmt(pr,pr<10?2:1)+' atm');setText('gs-z',fmt(z,3));setText('gs-note',z<.98?'Z < 1: attractions between the particles dominate, so the pressure is lower than ideal.':z>1.02?'Z > 1: the particles\' own volume dominates, so the pressure is higher than ideal.':'Close to ideal: the particles are far apart and moving fast.');}else setText('gs-note','');
    simG.render();sim.render();}
  setInterval(()=>{if(current==='gases')setText('gs-hits',hits.length);},250);
  ['p','v','t','n'].forEach(k=>el[k].addEventListener('input',()=>{S[k]=+el[k].value;if(k==='n')fit();compute();sync();upd();}));
  sel.addEventListener('change',()=>{compute();sync();upd();});
  segBind('gs-mode','k',m=>setMode(m));
  /* ---- Maxwell-Boltzmann ---- */
  const GAS={'He':4.003,'N₂':28.01,'CO₂':44.01},R8=8.314;
  $('#mb-gas').innerHTML=Object.keys(GAS).map(k=>`<option value="${k}">${k}</option>`).join('');$('#mb-gas').value='N₂';
  let mm='T';
  const fMB=(v,Tk,M)=>{const m=M/1000;return 4*Math.PI*Math.pow(m/(2*Math.PI*R8*Tk),1.5)*v*v*Math.exp(-m*v*v/(2*R8*Tk));};
  const sp=(Tk,M)=>({up:Math.sqrt(2*R8*Tk/(M/1000)),av:Math.sqrt(8*R8*Tk/(Math.PI*M/1000)),rms:Math.sqrt(3*R8*Tk/(M/1000))});
  const mb=sim2d($('#mb-canvas'),{h:w=>clamp(w*.45,250,330),draw(ctx,w,h){const T1=+$('#mb-t1').value,T2=+$('#mb-t2').value,g=$('#mb-gas').value,M=GAS[g];
      const sets=mm==='T'?[[g,T1,M,T.cx],[g,T2,M,T.hot]]:Object.keys(GAS).map((k,i)=>[k,T1,GAS[k],[T.cx,T.cv,T.hot][i]]);
      const vmax=Math.ceil(Math.max(...sets.map(s=>sp(s[1],s[2]).rms))*3/500)*500;let ymax=0;sets.forEach(s=>{for(let v=0;v<=vmax;v+=vmax/200)ymax=Math.max(ymax,fMB(v,s[1],s[2]));});
      const P=panel(ctx,{x:56,y:12,w:w-72,h:h-48},[0,vmax],[0,ymax*1.15],{xn:6,yn:3,xlabel:'speed (m/s)',ylabel:'fraction of molecules',color:T.ink});
      sets.forEach(s=>{area(ctx,P,v=>fMB(v,s[1],s[2]),0,vmax,s[3],.14,200);curve(ctx,P,v=>fMB(v,s[1],s[2]),0,vmax,s[3],2.6,200);});
      sets.forEach((s,i)=>label(ctx,`${s[0]}, ${s[1]} K`,P.box.x+P.box.w-6,P.box.y+8+i*16,s[3],'right','top',MONO));
      const ref=sets.find(x=>x[0]===g)||sets[0],q=sp(ref[1],ref[2]);[['up',q.up,'most probable'],['av',q.av,'average'],['rms',q.rms,'rms']].forEach(([k,v,n],i)=>{line(ctx,P,v,0,v,fMB(v,ref[1],ref[2]),T.ink,1.2,[3,3]);label(ctx,n,P.X(v)+(i===0?-4:4),P.Y(fMB(v,ref[1],ref[2]))-4-(i===2?14:0),T.ink,i===0?'right':'left','bottom',MONO);});}});
  function updMB(){const T1=+$('#mb-t1').value,M=GAS[$('#mb-gas').value],q=sp(T1,M);$('#mb-t1-out').textContent=T1+' K';$('#mb-t2-out').textContent=$('#mb-t2').value+' K';
    setText('mb-up',fmt(q.up,0)+' m/s');setText('mb-uav',fmt(q.av,0)+' m/s');setText('mb-urms',fmt(q.rms,0)+' m/s');setText('mb-ke',fmt(1.5*R8*T1/1000,2)+' kJ/mol');mb.render();}
  ['mb-t1','mb-t2','mb-gas'].forEach(id=>$('#'+id).addEventListener('input',updMB));$('#mb-gas').addEventListener('change',updMB);
  segBind('mb-mode','k',m=>{mm=m;$('#mb-t2box').hidden=m==='M';updMB();});
  setMode('boyle');updMB();
  TIPS['gs-v']='Smaller volume: the same particles hit the walls more often, so the pressure rises.';
  TIPS['gs-t']='Hotter: the particles move faster, so they hit the piston harder and more often.';
  TIPS['gs-n']='More particles: more hits on the wall, so more pressure or more volume.';
  TIPS['gs-gas']='Larger a means stronger attractions; larger b means bigger molecules.';
  TIPS['mb-t1']='A higher temperature shifts the peak to higher speed and flattens the curve; the area stays 1.';
  TIPS['mb-gas']='At the same temperature, lighter molecules are faster.';
  KEYS['gs-canvas']=['Choose a law, then move the one slider that is not grayed out.',[['cx','gas particles'],['hot','current state on the graph']]];
  GLOSS['kinetic molecular theory']='A gas is made of tiny particles in constant random motion; temperature measures their average kinetic energy.';
  GLOSS['mole fraction']='The moles of one gas divided by the total moles in the mixture.';
  GLOSS['partial pressure']='The pressure one gas in a mixture would exert if it were alone.';
  TT.gases='Have students predict the direction of every change before touching the slider. The four named laws are all PV = nRT with two things held fixed. The Real gas mode answers "when does the ideal gas law fail?" with evidence rather than a list.';
})();
(function(){
  PROBS.push({id:'gas-ideal',topic:'gases',title:'Ideal gas law',gen(){const n=ri(2,40)/10,P=ri(5,40)/10,Tc=ri(0,150)*2+10,ans=n*RG*(Tc+273.15)/P;
    return {q:`What volume does ${n.toFixed(1)} mol of an ideal gas occupy at ${P.toFixed(1)} atm and ${Tc} °C?`,ans,unit:'L',tol:.02,hint:'Convert °C to K by adding 273.15, then V = nRT/P with R = 0.08206 L·atm/(mol·K).',sol:`T = ${Tc} + 273.15 = ${(Tc+273.15).toFixed(2)} K. V = (${n.toFixed(1)})(0.08206)(${(Tc+273.15).toFixed(2)}) / ${P.toFixed(1)} = <b>${fmt(ans,2)} L</b>.`};}});
  PROBS.push({id:'gas-combined',topic:'gases',title:'Combined gas law',gen(){const P1=ri(5,30)/10,V1=ri(20,90)/10,T1=ri(0,100)*2+5,P2=ri(5,40)/10,T2=ri(0,100)*2+5,ans=P1*V1*(T2+273.15)/((T1+273.15)*P2);
    return {q:`A sealed sample of gas has V = ${V1.toFixed(1)} L at ${P1.toFixed(1)} atm and ${T1} °C. What volume will it have at ${P2.toFixed(1)} atm and ${T2} °C?`,ans,unit:'L',tol:.02,hint:'P₁V₁/T₁ = P₂V₂/T₂ with temperatures in kelvins.',sol:`V₂ = V₁(P₁/P₂)(T₂/T₁) = ${V1.toFixed(1)} × (${P1.toFixed(1)}/${P2.toFixed(1)}) × (${(T2+273.15).toFixed(2)}/${(T1+273.15).toFixed(2)}) = <b>${fmt(ans,2)} L</b>.`};}});
  PROBS.push({id:'gas-partial',topic:'gases',title:'Partial pressure',gen(){const a=ri(5,40)/10,b=ri(5,40)/10,c=ri(0,30)/10,Pt=ri(10,40)/10,ans=a/(a+b+c)*Pt;
    return {q:`A mixture contains ${a.toFixed(1)} mol N₂, ${b.toFixed(1)} mol O₂${c>0?` and ${c.toFixed(1)} mol Ar`:''}. The total pressure is ${Pt.toFixed(1)} atm. What is the partial pressure of N₂?`,ans,unit:'atm',tol:.02,hint:'P(N₂) = X(N₂) × P(total), where X is the mole fraction.',sol:`X = ${a.toFixed(1)} / ${(a+b+c).toFixed(1)} = ${fmt(a/(a+b+c),3)}; P = ${fmt(a/(a+b+c),3)} × ${Pt.toFixed(1)} = <b>${fmt(ans,3)} atm</b>.`};}});
  const MG=[['CO₂',44.01],['N₂',28.01],['O₂',32.00],['CH₄',16.04],['NH₃',17.03],['SO₂',64.07],['Ar',39.95]];
  PROBS.push({id:'gas-molarmass',topic:'gases',title:'Molar mass from gas density',gen(){const [f,M]=pick(MG),P=ri(8,20)/10,Tc=ri(0,60)*2,d=P*M/(RG*(Tc+273.15));
    return {q:`An unknown gas has a density of ${d.toFixed(3)} g/L at ${P.toFixed(1)} atm and ${Tc} °C. What is its molar mass?`,ans:M,unit:'g/mol',tol:.02,hint:'Density d = mass/V, and PV = nRT gives M = dRT/P.',sol:`M = dRT/P = (${d.toFixed(3)})(0.08206)(${(Tc+273.15).toFixed(2)}) / ${P.toFixed(1)} = <b>${fmt(M,1)} g/mol</b> (it could be ${f}).`};}});
})();
