
/* ---------------- Bonding & potential energy ---------------- */
const BONDS=[['H–H',['H','H'],74,436],['H–Cl',['H','Cl'],127,431],['Cl–Cl',['Cl','Cl'],199,243],['F–F',['F','F'],142,159],['O=O',['O','O'],121,498],['N≡N',['N','N'],110,945],['C–C',['C','C'],154,347],['C=C',['C','C'],134,614],['C≡C',['C','C'],120,839]];
const COVR={H:31,C:76,N:71,O:66,F:57,Cl:102};
const BD_EN={H:2.20,C:2.55,N:3.04,O:3.44,F:3.98,Cl:3.16,Br:2.96,Na:.93,Mg:1.31,K:.82,Al:1.61};
const BD_METAL=new Set(['Na','Mg','K','Al']);
function bondType(a,b){const ma=BD_METAL.has(a),mb=BD_METAL.has(b),d=Math.abs(BD_EN[a]-BD_EN[b]);if(ma&&mb)return {t:'metallic',d};if(ma!==mb)return {t:'ionic',d};return {t:d<.4?'nonpolar covalent':'polar covalent',d};}
(function bonding(){
  const cv=$('#bd-canvas');if(!cv)return;
  const sel=$('#bd-sel');sel.innerHTML=BONDS.map(b=>`<option value="${b[0]}">${b[0]} · ${b[2]} pm · ${b[3]} kJ/mol</option>`).join('');sel.value='H–H';
  const A=0.02;let B=BONDS[0],r=150,v=0,running=false;
  const V=x=>B[3]*((1-Math.exp(-A*(x-B[2])))**2-1),dV=x=>2*B[3]*(1-Math.exp(-A*(x-B[2])))*A*Math.exp(-A*(x-B[2])),mu=()=>2*B[3]*A*A/((2*Math.PI/1.1)**2);
  function setB(){B=BONDS.find(b=>b[0]===sel.value);const el=$('#bd-r');el.value=clamp(Math.round(B[2]*2),50,300);r=+el.value;v=0;running=false;$('#bd-r-out').textContent=r+' pm';upd();}
  const sim=sim2d(cv,{h:w=>clamp(w*.62,300,400),step(dt){if(!running)return;let t=dt;while(t>1e-6){const h=Math.min(t,1/240);v+=(-dV(r)/mu()-.35*v)*h;r+=v*h;t-=h;}r=clamp(r,35,330);if(Math.abs(v)<.4&&Math.abs(r-B[2])<.8){v=0;r=B[2];running=false;}const el=$('#bd-r');el.value=clamp(Math.round(r),50,300);$('#bd-r-out').textContent=Math.round(r)+' pm';updRead();},
    draw(ctx,w,h,t){const top=24,mid=h*.38;const sc=Math.min(1.1,(w-120)/330)*(w<520?.8:1);
      /* atoms */
      const cx=w/2,x1=cx-r*sc/2*1.0,x2=cx+r*sc/2,ra=B[2]*COVR[B[1][0]]/(COVR[B[1][0]]+COVR[B[1][1]])*sc,rb=B[2]*COVR[B[1][1]]/(COVR[B[1][0]]+COVR[B[1][1]])*sc;
      const y=top+46;ctx.strokeStyle=T.muted;ctx.lineWidth=2;ctx.beginPath();const n=14;for(let i=0;i<=n;i++){const x=x1+(x2-x1)*i/n,yy=y+(i%2?6:-6)*(i>0&&i<n?1:0);i?ctx.lineTo(x,yy):ctx.moveTo(x,yy);}ctx.stroke();
      ball2(ctx,x1,y,ra,atomCol(B[1][0]),B[1][0]==='H'?'rgba(0,0,0,.4)':null);ball2(ctx,x2,y,rb,atomCol(B[1][1]),B[1][1]==='H'?'rgba(0,0,0,.4)':null);
      label(ctx,B[1][0],x1,y-Math.max(ra,18)-8,T.ink,'center','bottom','600 13px "IBM Plex Sans",sans-serif');label(ctx,B[1][1],x2,y-Math.max(rb,18)-8,T.ink,'center','bottom','600 13px "IBM Plex Sans",sans-serif');
      /* forces */
      const F=-dV(r),len=clamp(Math.abs(F)/B[3]*900,0,70);if(len>3){const dir=F<0?1:-1;/* F<0: energy falls as r grows? attraction when r > re */arrow(ctx,x1+(F<0?ra:-ra)*0,y+Math.max(ra,rb)+16,x1+(F<0?len:-len)*0+(F<0?len:-len),y+Math.max(ra,rb)+16,T.hot,2.5);}
      /* curve */
      const box={x:60,y:y+Math.max(ra,rb)+34,w:w-76,h:h-(y+Math.max(ra,rb)+34)-34};const emax=B[3]*.9;const P=panel(ctx,box,[40,320],[-B[3]*1.2,emax],{xn:6,yn:4,xlabel:'distance r (pm)',ylabel:'energy (kJ/mol)',color:T.ink});
      ctx.save();clip(ctx,P);area(ctx,P,x=>Math.min(V(x),emax),40,320,T.cx,.0,10);ctx.restore();curve(ctx,P,x=>Math.min(V(x),emax*1.2),40,320,T.cx,2.6,300);
      line(ctx,P,40,0,320,0,T.muted,1,[4,4]);label(ctx,'atoms far apart: 0',P.X(318),P.Y(0)-6,T.muted,'right','bottom',MONO);
      line(ctx,P,B[2],-B[3],B[2],0,T.cv,1.4,[4,4]);label(ctx,'bond length',P.X(B[2])+6,P.Y(-B[3]*.5),T.cv,'left','middle',MONO);
      line(ctx,P,40,-B[3],B[2],-B[3],T.cv,1.4,[4,4]);label(ctx,'bond energy '+B[3],P.X(48),P.Y(-B[3])+14,T.cv,'left','top',MONO);
      const e=clamp(V(r),-B[3]*1.2,emax*1.05);dot(ctx,P.X(clamp(r,40,320)),P.Y(e),7,T.hot,T.surface);}});
  drawers.bonding=()=>{sim.render();sim2.render();};
  function updRead(){const e=V(r);setText('bd-now',Math.round(r)+' pm');setText('bd-pe',(e>=0?'+':'−')+Math.abs(Math.round(e))+' kJ/mol');setText('bd-len',B[2]+' pm');setText('bd-en',B[3]+' kJ/mol');
    setText('bd-what',Math.abs(r-B[2])<3?'at the minimum: most stable':r>B[2]?'too far: attraction pulls them in':'too close: repulsion pushes them out');}
  function upd(){updRead();sim.render();}
  bindRange('bd-r',x=>x+' pm',x=>{r=x;v=0;running=false;upd();},false);
  sel.addEventListener('change',setB);$('#bd-go').addEventListener('click',()=>{running=true;sim.render();});
  /* ---- bond-type animation ---- */
  const els=Object.keys(BD_EN);const sa=$('#bd-a'),sb=$('#bd-b');const opt=els.map(e=>`<option value="${e}">${e} · EN ${BD_EN[e].toFixed(2)}</option>`).join('');sa.innerHTML=opt;sb.innerHTML=opt;sa.value='H';sb.value='Cl';
  let eA='H',eB='Cl';const cv2=$('#bd-type');
  const sim2=sim2d(cv2,{h:w=>clamp(w*.4,200,270),draw(ctx,w,h,t){const bt=bondType(eA,eB),cy=h/2,dEN=BD_EN[eB]-BD_EN[eA];
      const rA=eA==='H'?20:eA==='Na'||eA==='K'||eA==='Mg'||eA==='Al'?36:28,rB=eB==='H'?20:eB==='Na'||eB==='K'||eB==='Mg'||eB==='Al'?36:28;
      if(bt.t==='metallic'){const n=Math.min(5,Math.max(3,Math.floor(w/90)));const gap=Math.min(90,(w-60)/n);for(let i=0;i<n;i++){for(let j=0;j<2;j++){const x=w/2+(i-(n-1)/2)*gap,y=cy+(j-.5)*gap*.9;ball2(ctx,x,y,15,T.cx);label(ctx,'+',x,y,'#fff','center','middle','700 14px "IBM Plex Mono",monospace');}}
        for(let k=0;k<22;k++){const ph=k*1.7;const x=w/2+Math.sin(t*(1+k%5*.35)+ph)*(w*.4),y=cy+Math.cos(t*(1.2+k%4*.3)+ph*1.3)*(h*.38);dot(ctx,x,y,3.4,T.ce);}label(ctx,'a sea of shared electrons moves among the positive ions',w/2,h-6,T.muted,'center','bottom',MONO);return;}
      const sep=clamp(w*.26,80,150),x1=w/2-sep/2,x2=w/2+sep/2,ca=atomCol(eA),cb=atomCol(eB);
      if(bt.t==='ionic'){const metalA=BD_METAL.has(eA),xm=metalA?x1:x2,xn=metalA?x2:x1,ph=(t%4)/4,hop=clamp((ph-.15)/.5,0,1);const gx=xm+(xn-xm)*hop;
        ball2(ctx,xm,cy,rA*(1-.25*hop)*(metalA?1:rB/rA),T.cx);ball2(ctx,xn,cy,(metalA?rB:rA)*(1+.2*hop),T.ca);label(ctx,metalA?eA:eB,xm,cy,'#fff','center','middle','700 14px "IBM Plex Sans",sans-serif');label(ctx,metalA?eB:eA,xn,cy,'#fff','center','middle','700 14px "IBM Plex Sans",sans-serif');
        if(hop<1)dot(ctx,gx,cy-4-Math.sin(hop*3.14)*30,5,T.ce);else dot(ctx,xn+10*Math.cos(t*4),cy-14+10*Math.sin(t*4),5,T.ce);
        if(hop>=1){label(ctx,'+',xm,cy-rA-18,T.cx,'center','bottom','700 20px "IBM Plex Mono",monospace');label(ctx,'−',xn,cy-rB-18,T.ca,'center','bottom','700 20px "IBM Plex Mono",monospace');arrow(ctx,xm+30,cy+50,xn-30,cy+50,T.hot,2);arrow(ctx,xn-30,cy+50,xm+30,cy+50,T.hot,2);label(ctx,'attraction between ions',w/2,cy+56,T.hot,'center','top',MONO);}
        else label(ctx,'the metal gives its outer electron away…',w/2,h-6,T.muted,'center','bottom',MONO);return;}
      /* covalent: the shared pair sits between the atoms, pulled toward the more electronegative atom */
      const off=clamp(dEN*sep*.22,-sep*.38,sep*.38),mx=w/2+off;
      const g=ctx.createRadialGradient(mx,cy,2,mx,cy,sep*.55);g.addColorStop(0,alpha(T.ce,.45));g.addColorStop(1,alpha(T.ce,0));ctx.fillStyle=g;ctx.fillRect(mx-sep*.7,cy-sep*.55,sep*1.4,sep*1.1);
      ball2(ctx,x1,cy,rA,ca,eA==='H'?'rgba(0,0,0,.4)':null);ball2(ctx,x2,cy,rB,cb,eB==='H'?'rgba(0,0,0,.4)':null);
      for(let k=0;k<2;k++){const a=t*5+k*3.14,ex=mx+Math.cos(a)*sep*.2,ey=cy+Math.sin(a*1.3)*sep*.2;dot(ctx,ex,ey,4.5,T.ce);}
      label(ctx,eA,x1,cy-Math.max(rA,22)-8,T.ink,'center','bottom','600 14px "IBM Plex Sans",sans-serif');label(ctx,eB,x2,cy-Math.max(rB,22)-8,T.ink,'center','bottom','600 14px "IBM Plex Sans",sans-serif');
      if(bt.t==='polar covalent'){const neg=dEN>0?x2:x1,pos=dEN>0?x1:x2;label(ctx,'δ−',neg,cy+Math.max(rA,rB)+12,T.bad,'center','top','700 16px "IBM Plex Sans",sans-serif');label(ctx,'δ+',pos,cy+Math.max(rA,rB)+12,T.cx,'center','top','700 16px "IBM Plex Sans",sans-serif');}
      label(ctx,bt.t==='nonpolar covalent'?'the electron pair is shared equally':'the electron pair is pulled toward the more electronegative atom',w/2,h-6,T.muted,'center','bottom',MONO);}});
  function upd2(){eA=sa.value;eB=sb.value;const bt=bondType(eA,eB);setText('bd-en2',`${eA} ${BD_EN[eA].toFixed(2)} · ${eB} ${BD_EN[eB].toFixed(2)}`);setText('bd-den',bt.d.toFixed(2));setText('bd-typ',bt.t);
    setText('bd-why',bt.t==='metallic'?'Two metals: the outer electrons are shared among all the atoms (metallic bonding).':bt.t==='ionic'?'A metal with a nonmetal: the nonmetal takes the metal\'s outer electron completely, and the ions attract.':`Two nonmetals share electrons. ${bt.t==='nonpolar covalent'?'The difference is small (below about 0.4), so the sharing is nearly equal.':'The difference is large enough that the electrons spend more time near the more electronegative atom.'}`);sim2.render();}
  sa.addEventListener('change',upd2);sb.addEventListener('change',upd2);
  setB();upd2();
  TIPS['bd-sel']='A deeper, narrower well means a stronger, shorter bond. Triple bonds are the deepest.';
  TIPS['bd-r']='Pull the atoms apart or squeeze them together and watch the potential energy dot move on the curve.';
  TIPS['bd-a']=TIPS['bd-b']='The difference in electronegativity, and whether the atoms are metals, decide the bond type.';
  KEYS['bd-canvas']=['Move the slider, then press Let go.',[['cx','potential energy'],['cv','bond length and bond energy','dash'],['hot','current state · net force']]];
  GLOSS['bond energy']='The energy needed to separate two bonded atoms completely: the depth of the energy well.';
  GLOSS['bond length']='The distance between the two nuclei at the minimum of the energy curve.';
  TT.bonding='Start from the question "why would atoms ever stick together?" and answer it with the energy curve. Ask students to sketch the curve for a stronger bond before showing it. Emphasize that breaking bonds absorbs energy.';
})();
(function(){
  const PAIRS=[['H','H'],['C','H'],['H','Cl'],['H','F'],['Na','Cl'],['Na','Na'],['C','O'],['O','H'],['N','H'],['Mg','O'],['K','Br'],['Cl','Cl'],['C','Cl'],['Al','Al'],['Mg','Cl']];
  PROBS.push({id:'bd-type',topic:'bonding',title:'Classify the bond',gen(){const [a,b]=pick(PAIRS),bt=bondType(a,b),ch=['ionic','polar covalent','nonpolar covalent','metallic'],ans=ch.indexOf(bt.t);
    return {q:`What type of bond holds ${a} to ${b}? (Electronegativity: ${[...new Set([a,b])].map(e=>e+' '+BD_EN[e].toFixed(2)).join(', ')}; metals: Na, Mg, K, Al.)`,choices:ch,ans,hint:'Two metals: metallic. A metal and a nonmetal: ionic. Two nonmetals: covalent, polar if the electronegativity difference is more than about 0.4.',
      sol:`${BD_METAL.has(a)&&BD_METAL.has(b)?'Both are metals.':BD_METAL.has(a)!==BD_METAL.has(b)?'One is a metal and one a nonmetal.':`Both are nonmetals, with ΔEN = ${bt.d.toFixed(2)}.`} The bond is <b>${bt.t}</b>.`};}});
  PROBS.push({id:'bd-compare',topic:'bonding',title:'Bond length and strength',gen(){const sets=[['C–C','C=C','C≡C'],['O=O','F–F','N≡N'],['H–H','Cl–Cl','F–F'],['H–Cl','Cl–Cl','C–C']],set=pick(sets),kind=pick(['shortest bond length','highest bond energy','longest bond length','lowest bond energy']);
    const D=n=>BONDS.find(b=>b[0]===n),key=kind.includes('length')?2:3,sign=kind.startsWith('shortest')||kind.startsWith('lowest')?1:-1;const best=set.slice().sort((x,y)=>sign*(D(x)[key]-D(y)[key]))[0];
    return {q:`Which of these has the ${kind}: ${set.join(', ')}? (Bond lengths and energies: ${set.map(n=>`${n} ${D(n)[2]} pm, ${D(n)[3]} kJ/mol`).join('; ')}.)`,choices:set,ans:set.indexOf(best),hint:'Use the data. Stronger bonds are generally shorter: the energy well is deeper and its minimum is at a smaller distance.',sol:`Comparing the numbers, the ${kind} belongs to <b>${best}</b> (${D(best)[2]} pm, ${D(best)[3]} kJ/mol).`};}});
  PROBS.push({id:'bd-polar',topic:'bonding',title:'Which bond is most polar?',gen(){const pool=[['H','H'],['C','H'],['N','H'],['O','H'],['H','F'],['H','Cl'],['C','O'],['C','F'],['C','Cl'],['N','O']],set=[];while(set.length<3){const p=pick(pool);if(!set.includes(p))set.push(p);}
    const d=p=>Math.abs(BD_EN[p[0]]-BD_EN[p[1]]),best=set.slice().sort((x,y)=>d(y)-d(x))[0],nm=p=>p[0]+'–'+p[1];
    return {q:`Which of these bonds is the most polar: ${set.map(nm).join(', ')}? (Electronegativity: H 2.20, C 2.55, N 3.04, O 3.44, F 3.98, Cl 3.16.)`,choices:set.map(nm),ans:set.indexOf(best),hint:'The larger the electronegativity difference, the more polar the bond.',sol:`ΔEN: ${set.map(p=>`${nm(p)} ${d(p).toFixed(2)}`).join(', ')}. The largest is <b>${nm(best)}</b>.`};}});
})();
