
/* ---------------- Buffers ---------------- */
const BFP=[{n:'CH₃COOH / CH₃COO⁻',pKa:-Math.log10(1.8e-5),Ka:1.8e-5,ha:'CH₃COOH',a:'CH₃COO⁻'},{n:'HF / F⁻',Ka:6.8e-4,pKa:-Math.log10(6.8e-4),ha:'HF',a:'F⁻'},{n:'HClO / ClO⁻',Ka:3.0e-8,pKa:-Math.log10(3.0e-8),ha:'HClO',a:'ClO⁻'},{n:'NH₄⁺ / NH₃',Ka:5.6e-10,pKa:-Math.log10(5.6e-10),ha:'NH₄⁺',a:'NH₃'},{n:'H₂PO₄⁻ / HPO₄²⁻',Ka:6.2e-8,pKa:-Math.log10(6.2e-8),ha:'H₂PO₄⁻',a:'HPO₄²⁻'}];
function bfPH(Ka,nHA,nA,addMol,V){/* addMol>0 strong base, <0 strong acid (moles); V in L */const Ct=(nHA+nA)/V,Na=(nA+Math.max(addMol,0))/V,Cl=Math.max(-addMol,0)/V,Kw=1e-14;const f=h=>Na+h-Kw/h-Cl-Ct*Ka/(Ka+h);let lo=1e-15,hi=10;for(let i=0;i<200;i++){const m=Math.sqrt(lo*hi);f(m)<0?lo=m:hi=m;}return -Math.log10(Math.sqrt(lo*hi));}
function bfWater(addMol,V){const c=Math.abs(addMol)/V;if(addMol===0)return 7;const h=phExact(c,addMol<0?'acid':'base',1e-14);return -Math.log10(h);}
(function buffers(){
  const cv=$('#bf-canvas');if(!cv)return;const pS=$('#bf-pair'),cS=$('#bf-ct'),rS=$('#bf-r'),aS=$('#bf-add');pS.innerHTML=BFP.map((p,i)=>`<option value="${i}">${p.n}  (pKa ${fmt(p.pKa,2)})</option>`).join('');
  const H=260,V=1;let P=[],Q=[];const cur=()=>{const p=BFP[+pS.value],Ct=Math.pow(10,+cS.value),r=Math.pow(10,+rS.value),nHA=Ct/(1+r),nA=Ct-nHA,add=+aS.value/1000;return {p,Ct,r,nHA,nA,add,ph:bfPH(p.Ka,nHA,nA,add,V),ph0:bfPH(p.Ka,nHA,nA,0,V),pw:bfWater(add,V)};};
  const mk=w=>({x:12+Math.random()*(w-24),y:20+Math.random()*(H-60),vx:(Math.random()-.5)*50,vy:(Math.random()-.5)*50});
  const ensure=()=>{if(!P.length){const hw=(cv.clientWidth||300)/2-8;for(let i=0;i<50;i++){P.push(mk(hw));Q.push(mk(hw));}}};
  const sim=sim2d(cv,{h:()=>H+20,step(dt){const hw=cv.clientWidth/2-8;ensure();[...P,...Q].forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<10||p.x>hw-10)p.vx*=-1;if(p.y<20||p.y>H-12)p.vy*=-1;p.x=clamp(p.x,10,hw-10);p.y=clamp(p.y,20,H-12);});},
    draw(ctx,w,h){ensure();const s=cur(),hw=w/2-8,N=50;[0,1].forEach(k=>{const ox=k?w/2+8:0;ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(ox+1,1,hw,H);const ph=k?s.pw:s.ph;const t=clamp(ph/14,0,1);ctx.fillStyle=`rgba(${Math.round(230-190*t)},${Math.round(80+60*t)},${Math.round(80+160*t)},.14)`;ctx.fillRect(ox+2,2,hw-2,H-2);label(ctx,(k?'plain water':'buffer')+' · pH '+fmt(ph,2),ox+8,12,T.ink,'left','middle','600 12px "IBM Plex Mono",monospace');});
      /* buffer particles: counts proportional to moles (relative to initial total) */
      const tot=s.nHA+s.nA,nHA=s.nHA+Math.max(-s.add,0)-Math.max(s.add,0),nA=s.nA-Math.max(-s.add,0)+Math.max(s.add,0),sc=N/tot;
      const cHA=clamp(Math.round(Math.max(nHA,0)*sc),0,N*2),cA=clamp(Math.round(Math.max(nA,0)*sc),0,N*2);let i=0;
      for(let j=0;j<cHA;j++){const p=P[i++%P.length];ball2(ctx,p.x-3,p.y,6.5,'#9FB6CC');ball2(ctx,p.x+6,p.y,3.6,'#EEF1F5','rgba(0,0,0,.4)');}for(let j=0;j<cA;j++){const p=P[i++%P.length];ball2(ctx,p.x,p.y,6,'#8B5CF6');}
      const exA=Math.max(-s.add-s.nA,0),exB=Math.max(s.add-s.nHA,0);
      /* plain water: H3O+/OH- counts on log scale */
      const hw0=Math.pow(10,-s.pw),ohw=Math.pow(10,s.pw-14),nH=clamp(Math.round(Math.log10(hw0*1e9+1)*5),0,40),nO=clamp(Math.round(Math.log10(ohw*1e9+1)*5),0,40);
      for(let j=0;j<nH;j++){const p=Q[j%Q.length];ball2(ctx,w/2+8+p.x,p.y,5,'#3E7BDC');}for(let j=0;j<nO;j++){const p=Q[(j+25)%Q.length];ball2(ctx,w/2+8+p.x,p.y,5,'#E5484D');}
      label(ctx,'HA (gray) · A⁻ (violet)',8,H+10,T.muted,'left','middle',MONO);label(ctx,'H₃O⁺ (blue) · OH⁻ (red)',w/2+16,H+10,T.muted,'left','middle',MONO);}});
  const g=$('#bf-graph'),gs=sim2d(g,{h:()=>H+20,draw(ctx,w,h){const s=cur(),Pn=panel(ctx,{x:44,y:12,w:w-58,h:h-48},[-.1,.1],[0,14],{xn:4,yn:7,xlabel:'strong base added (mol); acid is negative',ylabel:'pH',color:T.ink});
      curve(ctx,Pn,x=>bfWater(x,V),-.1,.1,T.hot,2.2,200,[6,4]);curve(ctx,Pn,x=>bfPH(s.p.Ka,s.nHA,s.nA,x,V),-.1,.1,T.cx,2.8,200);
      dot(ctx,Pn.X(s.add),Pn.Y(s.ph),6,T.ink);dot(ctx,Pn.X(s.add),Pn.Y(s.pw),5,T.ca);label(ctx,'buffer',Pn.box.x+70,Pn.box.y+12,T.cx,'left','middle',MONO);label(ctx,'plain water (dashed)',Pn.box.x+70,Pn.box.y+26,T.hot,'left','middle',MONO);}});
  function upd(){const s=cur(),d=s.ph-s.ph0;setText('bf-ct-out',fmt(s.Ct,3)+' M');setText('bf-r-out',fmt(s.r,2)+':1');setText('bf-add-out',(s.add>=0?'+':'−')+fmt(Math.abs(s.add),3)+' mol '+(s.add>=0?'base':s.add<0?'acid':''));
    setText('bf-ph',fmt(s.ph,2));setText('bf-pw',fmt(s.pw,2));setText('bf-d',(d>=0?'+':'−')+fmt(Math.abs(d),2));
    const hA=s.nHA+Math.max(-s.add,0)-Math.max(s.add,0),aA=s.nA-Math.max(-s.add,0)+Math.max(s.add,0);setText('bf-left',fmt(Math.max(hA,0)*1000,0)+' / '+fmt(Math.max(aA,0)*1000,0));
    $('#bf-note').textContent=(s.add<0&&-s.add>s.nA)||(s.add>0&&s.add>s.nHA)?'The buffer is exhausted: one component has run out, so the pH now behaves like a strong acid or base.':`pH = pKa ${s.r>=1?'+':'−'} ... = ${fmt(s.p.pKa,2)} + log(${fmt(Math.max(aA,1e-9)*1000,0)}/${fmt(Math.max(hA,1e-9)*1000,0)}) = ${fmt(s.p.pKa+Math.log10(Math.max(aA,1e-9)/Math.max(hA,1e-9)),2)} (Henderson–Hasselbalch). It resists the change by converting the strong acid or base into its weak partner.`;sim.render();gs.render();}
  pS.addEventListener('change',upd);['bf-ct','bf-r','bf-add'].forEach(id=>bindRange(id,()=>'',upd,false));$('#bf-lab').addEventListener('labreset',upd);upd();
  /* pick a buffer */
  const bc=$('#pb-canvas'),bph=$('#pb-ph');
  const bsim=sim2d(bc,{h:()=>200,draw(ctx,w,h){const x0=30,x1=w-20,X=p=>x0+(x1-x0)*(p-0)/14,t=+bph.value;ctx.strokeStyle=T.muted;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,h-34);ctx.lineTo(x1,h-34);ctx.stroke();for(let p=0;p<=14;p+=2){label(ctx,String(p),X(p),h-18,T.muted,'center','middle',MONO);}
      BFP.forEach((b,i)=>{const y=16+i*28,lo=b.pKa-1,hi=b.pKa+1;const ok=t>=lo&&t<=hi;ctx.fillStyle=alpha(ok?'#2FA36B':'#9FB6CC',ok?.7:.45);ctx.fillRect(X(lo),y,X(hi)-X(lo),18);dot(ctx,X(b.pKa),y+9,4,T.ink);label(ctx,b.n.split(' ')[0]+' (pKa '+fmt(b.pKa,2)+')',X(hi)+6<w-120?X(hi)+6:X(lo)-6,y+9,T.ink,X(hi)+6<w-120?'left':'right','middle',MONO);});
      ctx.strokeStyle=T.hot;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(X(t),6);ctx.lineTo(X(t),h-34);ctx.stroke();label(ctx,'target '+fmt(t,1),X(t),h-4,T.hot,'center','middle',MONO);}});
  function bupd(){const t=+bph.value;setText('pb-ph-out',fmt(t,1));const best=BFP.slice().sort((a,b)=>Math.abs(a.pKa-t)-Math.abs(b.pKa-t))[0],r=Math.pow(10,t-best.pKa);
    $('#pb-note').innerHTML=Math.abs(best.pKa-t)<=1?`Best choice here: <b>${best.n}</b> (pK<sub>a</sub> ${fmt(best.pKa,2)}). Use [A⁻]/[HA] = 10<sup>${fmt(t,1)} − ${fmt(best.pKa,2)}</sup> = <b>${fmt(r,2)}</b>. (Closeness of pK<sub>a</sub> is the chemistry criterion; real buffers also depend on safety and compatibility. Phosphate is the usual choice near pH 7.4.)`:`None of these pairs is within one unit of pH ${fmt(t,1)}. Closest is ${best.n} (pK<sub>a</sub> ${fmt(best.pKa,2)}), but its ratio would be ${r>=1?fmt(r,0):'1:'+fmt(1/r,0)}: too lopsided to buffer well.`;bsim.render();}
  bindRange('pb-ph',()=>'',bupd,false);bupd();drawers.buffers=()=>{upd();bupd();};
  TIPS['bf-pair']='The pKa of the pair sets where the buffer works best.';
  TIPS['bf-ct']='More concentrated buffer: more capacity, same pH.';
  TIPS['bf-r']='The ratio of base to acid sets the pH, via Henderson–Hasselbalch.';
  TIPS['bf-add']='Slide left to add strong acid, right to add strong base. Watch the two beakers.';
  TIPS['pb-ph']='A buffer works within about one pH unit of its pKa.';
  KEYS['bf-canvas']=['Slide the strong acid or base control and compare the two beakers.',[['#9FB6CC','HA'],['#8B5CF6','A⁻']]];
  GLOSS['buffer']='A solution containing a weak acid and its conjugate base (or a weak base and its conjugate acid) that resists changes in pH.';
  GLOSS['Henderson–Hasselbalch']='pH = pKa + log([A⁻]/[HA]), the buffer pH equation.';
  GLOSS['buffer capacity']='How much strong acid or base a buffer can absorb before its pH changes sharply.';
  TT.buffers='Do the stoichiometry-then-equilibrium sequence out loud: react, then Henderson–Hasselbalch. It is the most common source of lost points.';
})();
(function(){
  const SALT={'CH₃COOH / CH₃COO⁻':['NaCH₃COO',82.03],'HF / F⁻':['NaF',41.99],'HClO / ClO⁻':['NaClO',74.44],'NH₄⁺ / NH₃':['NH₄Cl',53.49]};
  PROBS.push({id:'buf-HH',topic:'buffers',title:'pH of a buffer',gen(){const p=pick(BFP.slice(0,4)),ha=pick([.10,.20,.30,.50]),a=pick([.10,.15,.25,.40,.60]),ph=p.pKa+Math.log10(a/ha);
    return {q:`A buffer is made with ${fmt(ha,2)} M ${p.ha} and ${fmt(a,2)} M ${p.a} (K<sub>a</sub> of ${p.ha} = ${sci(p.Ka,2)}). What is its pH?`,ans:ph,unit:'',abs:.03,hint:'Henderson–Hasselbalch: pH = pKa + log([base]/[acid]).',sol:`pK<sub>a</sub> = ${fmt(p.pKa,2)}; pH = ${fmt(p.pKa,2)} + log(${fmt(a,2)}/${fmt(ha,2)}) = <b>${fmt(ph,2)}</b>.`};}});
  /* these problems state pKa to 2 decimals, so they compute with that same rounded value */
  const asShown=b=>Object.assign({},b,{pKa:+b.pKa.toFixed(2)});
  PROBS.push({id:'buf-add',topic:'buffers',title:'pH after adding strong acid or base',gen(){const p=asShown(pick(BFP.slice(0,4))),V=pick([.500,1.00,.250]),ha=pick([.20,.30,.40]),a=pick([.20,.30,.40]),n=pick([.0050,.010,.020]),acid=Math.random()<.5,nHA=ha*V,nA=a*V;const nH2=acid?nHA+n:nHA-n,nA2=acid?nA-n:nA+n,ok=nH2>0&&nA2>0;
    const ph=p.pKa+Math.log10(nA2/nH2);return ok?{q:`${fmt(V*1000,0)} mL of a buffer contains ${fmt(ha,2)} M ${p.ha} and ${fmt(a,2)} M ${p.a} (pK<sub>a</sub> = ${fmt(p.pKa,2)}). What is the pH after ${fmt(n,4)} mol of ${acid?'HCl':'NaOH'} is added? (Ignore the volume change.)`,ans:ph,unit:'',abs:.03,hint:`Strong ${acid?'acid':'base'} reacts completely with the ${acid?p.a:p.ha}: ${acid?'A⁻ → HA':'HA → A⁻'}. Update the moles, then use Henderson–Hasselbalch.`,sol:`Moles before: ${p.ha} ${fmt(nHA,4)}, ${p.a} ${fmt(nA,4)}. After: ${p.ha} ${fmt(nH2,4)}, ${p.a} ${fmt(nA2,4)}. pH = ${fmt(p.pKa,2)} + log(${fmt(nA2,4)}/${fmt(nH2,4)}) = <b>${fmt(ph,2)}</b>.`}:this.gen();}});
  PROBS.push({id:'buf-ratio',topic:'buffers',title:'Ratio needed for a target pH',gen(){const p=asShown(pick(BFP.slice(0,4))),t=+(p.pKa+pick([-.8,-.5,-.3,.3,.5,.9])).toFixed(1),r=Math.pow(10,t-p.pKa);
    return {q:`What ratio [${p.a}]/[${p.ha}] gives a buffer of pH ${fmt(t,1)}? (pK<sub>a</sub> of ${p.ha} = ${fmt(p.pKa,2)})`,ans:r,unit:'',tol:.03,hint:'Rearrange: [base]/[acid] = 10^(pH − pKa).',sol:`10<sup>${fmt(t,1)} − ${fmt(p.pKa,2)}</sup> = <b>${fmt(r,2)}</b>.`};}});
  PROBS.push({id:'buf-which',topic:'buffers',title:'Best buffer for a pH',gen(){const t=pick([3.4,4.5,5.2,7.2,7.6,9.0,9.5]),sorted=BFP.slice().sort((a,b)=>Math.abs(a.pKa-t)-Math.abs(b.pKa-t)),best=sorted[0],ch=BFP.map(b=>`${b.n} (pKa ${fmt(b.pKa,2)})`);const names=BFP.slice(0,4).concat([BFP[4]]);
    return {q:`Which conjugate pair is the best choice for preparing a buffer at pH ${fmt(t,1)}?`,choices:ch,ans:BFP.indexOf(best),hint:'Choose the pair whose pKa is closest to the target pH.',sol:`<b>${best.n}</b> has pK<sub>a</sub> ${fmt(best.pKa,2)}, the closest to ${fmt(t,1)}.`};}});
  PROBS.push({id:'buf-prep',topic:'buffers',title:'Mass of salt to make a buffer',gen(){const k=pick(Object.keys(SALT)),p=asShown(BFP.find(b=>b.n===k)),[sn,M]=SALT[k],V=pick([.250,.500,1.00]),c=pick([.20,.30,.50]),t=+(p.pKa+pick([-.3,.2,.4,.5])).toFixed(2),r=Math.pow(10,t-p.pKa);
    const base=k.startsWith('NH₄');const nHA=c*V,nA=nHA*r,m=nA*M;
    return base?{q:`How many grams of NH₄Cl (53.49 g/mol) must be added to ${fmt(V*1000,0)} mL of ${fmt(c,2)} M NH₃ to make a buffer of pH ${fmt(t,2)}? (pK<sub>a</sub> of NH₄⁺ = ${fmt(p.pKa,2)}; ignore volume change.)`,ans:(c*V*Math.pow(10,p.pKa-t))*53.49,unit:'g',tol:.03,hint:'For NH₃/NH₄⁺, [NH₄⁺]/[NH₃] = 10^(pKa − pH).',sol:`ratio [NH₄⁺]/[NH₃] = 10<sup>${fmt(p.pKa,2)} − ${fmt(t,2)}</sup> = ${fmt(Math.pow(10,p.pKa-t),3)}; n(NH₄⁺) = ${fmt(c*V*Math.pow(10,p.pKa-t),4)} mol; mass = <b>${fmt((c*V*Math.pow(10,p.pKa-t))*53.49,2)} g</b>.`}:{q:`How many grams of ${sn} (${M} g/mol) must be added to ${fmt(V*1000,0)} mL of ${fmt(c,2)} M ${p.ha} to make a buffer of pH ${fmt(t,2)}? (pK<sub>a</sub> = ${fmt(p.pKa,2)}; ignore volume change.)`,ans:m,unit:'g',tol:.03,hint:'[A⁻]/[HA] = 10^(pH − pKa). Then moles of A⁻ × molar mass.',sol:`ratio = 10<sup>${fmt(t,2)} − ${fmt(p.pKa,2)}</sup> = ${fmt(r,3)}; n(A⁻) = ${fmt(r,3)} × ${fmt(nHA,4)} = ${fmt(nA,4)} mol; mass = <b>${fmt(m,2)} g</b>.`};}});
  const BQ=[['CH₃COOH and NaCH₃COO',true],['NH₃ and NH₄Cl',true],['HF and NaF',true],['HCl and NaCl',false],['NaOH and NaNO₃',false],['HNO₃ and KNO₃',false],['NaCl and NaOH',false],['H₂CO₃ and NaHCO₃',true]];
  PROBS.push({id:'buf-concept',topic:'buffers',title:'Which mixture is a buffer?',gen(){const good=pick(BQ.filter(x=>x[1])),bad=BQ.filter(x=>!x[1]).sort(()=>Math.random()-.5).slice(0,3),i=Math.floor(Math.random()*4),arr=bad.map(x=>x[0]);arr.splice(i,0,good[0]);
    return {q:'Which of these mixtures (equal volumes of equal concentrations) will act as a buffer?',choices:arr,ans:i,hint:'A buffer needs a weak acid and its conjugate base (or a weak base and its conjugate acid), both present.',sol:`<b>${good[0]}</b> contains a weak acid/base and its conjugate partner; the others contain a strong acid or base or lack a conjugate pair.`};}});
})();
