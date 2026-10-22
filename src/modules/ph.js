
/* ---------------- Acids, bases, pH & strong acids ---------------- */
const KW_T={0:1.14e-15,10:2.93e-15,25:1.0e-14,40:2.92e-14,50:5.47e-14,60:9.61e-14,100:5.13e-13};
const phExact=(c,kind,Kw)=>{/* c in M of strong acid or base */const h=kind==='acid'?(c+Math.sqrt(c*c+4*Kw))/2:Kw/((c+Math.sqrt(c*c+4*Kw))/2);return h;};
(function ph(){
  const cv=$('#pt-canvas');if(!cv)return;
  const PTR=[{t:'HCl + H₂O → H₃O⁺ + Cl⁻',A:'HCl',B:'H2O',CA:'H3O',CB:'Cl',an:'HCl',bn:'H₂O',can:'H₃O⁺',cbn:'Cl⁻',ch:[0,0,1,-1],weak:false},{t:'NH₃ + H₂O ⇌ NH₄⁺ + OH⁻',A:'H2O',B:'NH3',CA:'NH4',CB:'OH',an:'H₂O',bn:'NH₃',can:'NH₄⁺',cbn:'OH⁻',ch:[0,0,1,-1],weak:true},{t:'H₂O + H₂O ⇌ H₃O⁺ + OH⁻  (autoionization)',A:'H2O',B:'H2O',CA:'H3O',CB:'OH',an:'H₂O',bn:'H₂O',can:'H₃O⁺',cbn:'OH⁻',ch:[0,0,1,-1],weak:true},{t:'HF + H₂O ⇌ H₃O⁺ + F⁻',A:'HF',B:'H2O',CA:'H3O',CB:'F',an:'HF',bn:'H₂O',can:'H₃O⁺',cbn:'F⁻',ch:[0,0,1,-1],weak:true}];
  const rs=$('#pt-rx'),pS=$('#pt-p'),H=250;rs.innerHTML=PTR.map((r,i)=>`<option value="${i}">${r.t}</option>`).join('');let play=false;
  const lab=(ctx,t,x,y,c)=>label(ctx,t,x,y,c,'center','middle','700 12px "IBM Plex Mono",monospace');
  /* find which atom in the acid is the donated H: the H atom of the acid pointing toward the base */
  const sim=sim2d(cv,{h:()=>H,step(dt){if(!play)return;pS.value=Math.min(100,+pS.value+dt*22);if(+pS.value>=100){play=false;$('#pt-play').textContent='Play';}upd();},
    draw(ctx,w,h){const r=PTR[+rs.value],p=+pS.value/100,u=Math.min(40,w/9),cy=H*.52,apr=clamp(p/.35,0,1),tr=clamp((p-.35)/.25,0,1),sep=clamp((p-.6)/.4,0,1);
      const ease=v=>v*v*(3-2*v),a=ease(apr),t=ease(tr),s=ease(sep);
      const ax=w*.2+(w*.17)*a-(w*.1)*s,bx=w*.8-(w*.17)*a+(w*.1)*s;
      const ma=molAtoms(r.A),mb=molAtoms(r.B);
      /* the acid's H nearest the base: pick H atom with the largest x (facing base) */
      let hi=-1,bestx=-1e9;ma.atoms.forEach((q,i)=>{if(q.e==='H'&&q.x>bestx){bestx=q.x;hi=i;}});
      const hx0=ax+ma.atoms[hi].x*u,hy0=cy+ma.atoms[hi].y*u;const baseAtom=mb.atoms.findIndex(q=>q.e!=='H')>=0?mb.atoms.findIndex(q=>q.e!=='H'):0;const tx=bx+mb.atoms[baseAtom].x*u-u*.6,ty=cy+mb.atoms[baseAtom].y*u;
      if(p<.35+.25*0||t<1){ /* reactants: acid without its donated H, base */
        ctx.save();ctx.globalAlpha=1;
        /* acid minus donated H */
        ctx.strokeStyle=T.ink;ctx.lineWidth=Math.max(1.5,u*.12);ctx.lineCap='round';ma.bonds.forEach(([i,j])=>{if(i===hi||j===hi)return;ctx.beginPath();ctx.moveTo(ax+ma.atoms[i].x*u,cy+ma.atoms[i].y*u);ctx.lineTo(ax+ma.atoms[j].x*u,cy+ma.atoms[j].y*u);ctx.stroke();});
        ma.atoms.forEach((q,i)=>{if(i===hi)return;ball2(ctx,ax+q.x*u,cy+q.y*u,u*(q.e==='H'?.3:.45),e2col(q.e),q.e==='H'?'rgba(0,0,0,.45)':null);});
        /* the donated H bond (fades once it leaves) */
        const hpx=hx0+(tx-hx0)*t,hpy=hy0+(ty-hy0)*t;
        if(t<.02){ctx.beginPath();ctx.moveTo(ax+ma.atoms[ma.bonds.find(b=>b.includes(hi)).find(k=>k!==hi)].x*u,cy+ma.atoms[ma.bonds.find(b=>b.includes(hi)).find(k=>k!==hi)].y*u);ctx.lineTo(hx0,hy0);ctx.stroke();}
        /* base */
        mb.bonds.forEach(([i,j])=>{ctx.beginPath();ctx.moveTo(bx+mb.atoms[i].x*u,cy+mb.atoms[i].y*u);ctx.lineTo(bx+mb.atoms[j].x*u,cy+mb.atoms[j].y*u);ctx.stroke();});
        mb.atoms.forEach(q=>ball2(ctx,bx+q.x*u,cy+q.y*u,u*(q.e==='H'?.3:.45),e2col(q.e),q.e==='H'?'rgba(0,0,0,.45)':null));
        ball2(ctx,hpx,hpy,u*.34,'#F5C34D','rgba(0,0,0,.4)');if(t>0&&t<1){ctx.strokeStyle=alpha(T.hot,.7);ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(hx0,hy0);ctx.lineTo(hpx,hpy);ctx.stroke();ctx.setLineDash([]);}
        ctx.restore();
        lab(ctx,r.an,ax,cy+u*1.9,T.ca);lab(ctx,r.bn,bx,cy+u*1.9,T.cx);
        if(t<.02)label(ctx,'acid',ax,cy-u*1.9,T.ca,'center','middle',MONO),label(ctx,'base',bx,cy-u*1.9,T.cx,'center','middle',MONO);
      }
      if(t>=1){ /* products */
        drawMol2D(ctx,r.CB,ax,cy,u);drawMol2D(ctx,r.CA,bx,cy,u);lab(ctx,r.cbn,ax,cy+u*1.9,T.ca);lab(ctx,r.can,bx,cy+u*1.9,T.cx);label(ctx,'conjugate base',ax,cy-u*1.9,T.ca,'center','middle',MONO);label(ctx,'conjugate acid',bx,cy-u*1.9,T.cx,'center','middle',MONO);}
      label(ctx,p<.35?'molecules collide':p<.6?'the H⁺ jumps (gold)':'new species drift apart',w/2,16,T.muted,'center','middle',MONO);}});
  function upd(){const r=PTR[+rs.value];setText('pt-p-out',+pS.value<35?'approach':+pS.value<60?'transfer':'products');setText('pt-acid',r.an);setText('pt-base',r.bn);setText('pt-cb',r.cbn);setText('pt-ca',r.can);sim.render();}
  rs.addEventListener('change',()=>{pS.value=0;play=false;$('#pt-play').textContent='Play';upd();});bindRange('pt-p',()=>'',()=>upd(),false);
  $('#pt-play').addEventListener('click',()=>{if(+pS.value>=100)pS.value=0;play=!play;$('#pt-play').textContent=play?'Pause':'Play';upd();});$('#pt-lab').addEventListener('labreset',()=>{pS.value=0;play=false;$('#pt-play').textContent='Play';upd();});upd();
  /* strong acid / base */
  const kS=$('#sa-kind'),cS=$('#sa-c'),tS=$('#sa-T');tS.innerHTML=Object.keys(KW_T).map(k=>`<option value="${k}">${k} °C  (Kw = ${sci(KW_T[k],2)})</option>`).join('');tS.value='25';
  const st=()=>{const c=Math.pow(10,+cS.value),kind=kS.value,Kw=KW_T[tS.value],h=phExact(c,kind,Kw),oh=Kw/h;return {c,kind,Kw,h,oh};};
  const bc=$('#sa-canvas'),bsim=sim2d(bc,{h:()=>240,draw(ctx,w,h){const s=st(),lo=-15,hi=1,Y=v=>14+(h-60)*(1-(clamp(Math.log10(v),lo,hi)-lo)/(hi-lo));ctx.strokeStyle=T.muted;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(50,12);ctx.lineTo(50,h-44);ctx.lineTo(w-10,h-44);ctx.stroke();
      for(let p=lo;p<=hi;p+=2){const y=Y(Math.pow(10,p));ctx.strokeStyle=T.grid;ctx.beginPath();ctx.moveTo(50,y);ctx.lineTo(w-10,y);ctx.stroke();label(ctx,'10'+(p<0?'⁻':'')+String(Math.abs(p)).split('').map(d=>'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join(''),46,y,T.muted,'right','middle',MONO);}
      [[s.h,'#3E7BDC','[H₃O⁺]',.28],[s.oh,'#8B5CF6','[OH⁻]',.62]].forEach(([v,c,n,fx])=>{const x0=50+(w-60)*fx-34,y=Y(v);ctx.fillStyle=c;ctx.fillRect(x0,y,68,h-44-y);label(ctx,n,x0+34,h-26,T.ink,'center','middle',MONO);label(ctx,sci(v,1),x0+34,y-8,T.ink,'center','bottom',MONO);});
      const nh=Math.sqrt(s.Kw);ctx.strokeStyle=T.hot;ctx.lineWidth=1.5;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(50,Y(nh));ctx.lineTo(w-10,Y(nh));ctx.stroke();ctx.setLineDash([]);label(ctx,'neutral',w-12,Y(nh)-6,T.hot,'right','bottom',MONO);}});
  const gc=$('#sa-graph'),gsim=sim2d(gc,{h:()=>240,draw(ctx,w,h){const s=st(),P=panel(ctx,{x:44,y:12,w:w-58,h:h-46},[0,9],[0,14],{xn:3,yn:4,xlabel:'−log c',ylabel:s.kind==='acid'?'pH':'pH',color:T.ink});
      if(s.kind==='acid')line(ctx,P,0,0,9,9,T.muted,1.6,[6,4]);else line(ctx,P,0,14,9,5,T.muted,1.6,[6,4]);
      curve(ctx,P,x=>{const c=Math.pow(10,-x),hh=phExact(c,s.kind,s.Kw);return -Math.log10(hh);},0,9,T.cx,2.6,200);
      const x=-+cS.value,hh=s.h;dot(ctx,P.X(x),P.Y(-Math.log10(hh)),6,T.ink);label(ctx,'dashed: simple formula',P.box.x+P.box.w-4,P.box.y+10,T.muted,'right','middle',MONO);}});
  function sup(n){return String(n).split('').map(d=>d==='-'?'⁻':'⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');}
  function supd(){const s=st(),ph=-Math.log10(s.h),poh=-Math.log10(s.oh),naive=s.kind==='acid'?-Math.log10(s.c):-Math.log10(s.Kw)+Math.log10(s.c)*1;
    setText('sa-c-out',sci(s.c,1)+' M');setText('sa-h',sci(s.h,2)+' M');setText('sa-oh',sci(s.oh,2)+' M');setText('sa-ph',fmt(ph,2));setText('sa-poh',fmt(poh,2));
    const nv=s.kind==='acid'?-Math.log10(s.c):-Math.log10(s.Kw)+(-Math.log10(s.c))*-1;const naivePH=s.kind==='acid'?-Math.log10(s.c):-Math.log10(s.Kw)-(-Math.log10(s.c));setText('sa-naive',fmt(naivePH,2));
    const neut=-Math.log10(s.Kw)/2,off=Math.abs(naivePH-ph);$('#sa-note').textContent=off>.05?`The simple formula is off by ${fmt(off,2)}: at this dilution water's own ions matter. The solution is still ${s.kind==='acid'?'acidic':'basic'} (neutral here is pH ${fmt(neut,2)}).`:`At this concentration the simple formula works (it differs by ${fmt(off,3)} from the exact value). Neutral at this temperature is pH ${fmt(neut,2)}.`;bsim.render();gsim.render();}
  [kS,tS].forEach(e=>e.addEventListener('change',supd));bindRange('sa-c',()=>'',supd,false);supd();drawers.ph=()=>{upd();supd();};
  TIPS['pt-rx']='Look for the H that jumps: it leaves the acid and attaches to the base.';
  TIPS['pt-p']='Scrub through approach, transfer and separation.';
  TIPS['sa-kind']='Strong acids set [H₃O⁺]; strong bases set [OH⁻].';
  TIPS['sa-c']='Every factor of 10 in concentration is one pH unit, until water\'s own ions matter.';
  TIPS['sa-T']='Kw rises with temperature, so neutral is not always pH 7.';
  KEYS['pt-canvas']=['Press Play and follow the gold proton.',[['hot','proton transfer']]];
  GLOSS['Brønsted–Lowry']='A model in which acids donate protons and bases accept them.';
  GLOSS['conjugate']='The partner formed when an acid loses H⁺ (its conjugate base) or a base gains H⁺ (its conjugate acid).';
  GLOSS['autoionization']='Water molecules transferring protons to each other: 2H₂O ⇌ H₃O⁺ + OH⁻.';
  GLOSS['strong acid']='An acid that ionizes completely in water.';
  GLOSS['Kw']='The ion-product constant of water, [H₃O⁺][OH⁻] = 1.0×10⁻¹⁴ at 25 °C.';
  TT.ph='Have students say the conjugate pair out loud for each reaction. Introduce the neutral-is-not-7 point with the temperature select.';
})();
(function(){
  const SA=[['HCl',1],['HNO₃',1],['HBr',1],['HClO₄',1]],SB=[['NaOH',1],['KOH',1],['Ba(OH)₂',2],['Ca(OH)₂',2],['LiOH',1]];
  PROBS.push({id:'ph-strong',topic:'ph',title:'pH of a strong acid',gen(){const [a]=pick(SA),c=pick([.0010,.025,.15,.0045,.0080,.50,.0072]),ph=-Math.log10(c);
    return {q:`What is the pH of ${sci(c,2)} M ${a}?`,ans:ph,unit:'',abs:.02,hint:'A strong acid ionizes completely: [H₃O⁺] = c. pH = −log[H₃O⁺].',sol:`[H₃O⁺] = ${sci(c,2)} M, so pH = −log(${sci(c,2)}) = <b>${fmt(ph,2)}</b>.`};}});
  PROBS.push({id:'ph-base',topic:'ph',title:'pH of a strong base',gen(){const [b,n]=pick(SB),c=pick([.0010,.025,.15,.0045,.020,.080]),oh=n*c,ph=14+Math.log10(oh);
    return {q:`What is the pH of ${sci(c,2)} M ${b} at 25 °C?`,ans:ph,unit:'',abs:.02,hint:`Count the OH⁻ per formula unit (${b} gives ${n}), find pOH, then pH = 14 − pOH.`,sol:`[OH⁻] = ${n} × ${sci(c,2)} = ${sci(oh,2)} M; pOH = ${fmt(-Math.log10(oh),2)}; pH = <b>${fmt(ph,2)}</b>.`};}});
  PROBS.push({id:'ph-dil',topic:'ph',title:'pH after dilution',gen(){const c=pick([.10,.20,.50,1.0]),V1=pick([10.0,25.0,50.0]),V2=pick([250,500,1000]),c2=c*V1/V2,ph=-Math.log10(c2);
    return {q:`${fmt(V1,1)} mL of ${fmt(c,2)} M HCl is diluted with water to a total volume of ${V2} mL. What is the pH of the diluted solution?`,ans:ph,unit:'',abs:.02,hint:'Use M₁V₁ = M₂V₂ to find the new concentration, then pH = −log c.',sol:`M₂ = ${fmt(c,2)} × ${fmt(V1,1)} / ${V2} = ${sci(c2,3)} M; pH = <b>${fmt(ph,2)}</b>.`};}});
  PROBS.push({id:'ph-mix',topic:'ph',title:'pH after mixing acid and base',gen(){let a,b,Va,Vb,ca,cb,na,nb,n=0;do{ca=pick([.10,.20,.050,.15]);cb=pick([.10,.20,.050,.15]);Va=pick([25,50,75,100]);Vb=pick([25,50,75,100]);na=ca*Va/1000;nb=cb*Vb/1000;n++;}while(Math.abs(na-nb)/(na+nb)<.06&&n<80);
    const Vt=(Va+Vb)/1000,ex=na-nb,acid=ex>0,c=Math.abs(ex)/Vt,ph=acid?-Math.log10(c):14+Math.log10(c);
    return {q:`${Va} mL of ${fmt(ca,3)} M HCl is mixed with ${Vb} mL of ${fmt(cb,3)} M NaOH. What is the pH of the mixture at 25 °C?`,ans:ph,unit:'',abs:.03,hint:'Moles of H⁺ and OH⁻ react 1:1. Find which is in excess, then divide the leftover moles by the total volume.',sol:`n(H⁺) = ${fmt(na,5)} mol, n(OH⁻) = ${fmt(nb,5)} mol. Excess ${acid?'H⁺':'OH⁻'} = ${fmt(Math.abs(ex),5)} mol in ${fmt(Vt*1000,0)} mL → ${sci(c,3)} M, so pH = <b>${fmt(ph,2)}</b>.`};}});
  PROBS.push({id:'ph-neutral',topic:'ph',title:'Neutral pH at another temperature',gen(){const T=pick([0,40,50,60,100]),K=KW_T[T],ph=-Math.log10(K)/2;
    return {q:`At ${T} °C, K<sub>w</sub> = ${sci(K,2)}. What is the pH of pure water at this temperature?`,ans:ph,unit:'',abs:.03,hint:'In pure water [H₃O⁺] = [OH⁻], so [H₃O⁺] = √K_w.',sol:`[H₃O⁺] = √(${sci(K,2)}) = ${sci(Math.sqrt(K),3)} M; pH = <b>${fmt(ph,2)}</b>. Pure water is still neutral; neutral just isn't pH 7 here.`};}});
  const CJ=[['NH₃','NH₄⁺','base'],['HCO₃⁻','CO₃²⁻','acid'],['H₂O','OH⁻','acid'],['CH₃COOH','CH₃COO⁻','acid'],['H₂PO₄⁻','HPO₄²⁻','acid'],['F⁻','HF','base'],['H₂O','H₃O⁺','base'],['HSO₄⁻','SO₄²⁻','acid'],['CO₃²⁻','HCO₃⁻','base']];
  PROBS.push({id:'ph-conj',topic:'ph',title:'Conjugate acid or base',gen(){const [sp,cj,role]=pick(CJ),opts=[...new Set([cj,...CJ.map(x=>x[1]).sort(()=>Math.random()-.5)])].slice(0,4);if(!opts.includes(cj))opts[0]=cj;const ans=opts.indexOf(cj),i=Math.floor(Math.random()*4),arr=opts.filter(x=>x!==cj);arr.splice(i,0,cj);
    return {q:`What is the conjugate ${role==='acid'?'base':'acid'} of ${sp}?`,choices:arr.slice(0,4),ans:i,hint:role==='acid'?'Remove one H⁺ (lower the charge by 1).':'Add one H⁺ (raise the charge by 1).',sol:`${role==='acid'?'Remove':'Add'} one H⁺ ${role==='acid'?'from':'to'} ${sp}: <b>${cj}</b>.`};}});
})();
