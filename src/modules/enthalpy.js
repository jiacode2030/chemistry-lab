
/* ---------------- Enthalpy, Hess's law & bond energies ---------------- */
const HSP={CO2:'CO₂',CO:'CO',O2:'O₂',C:'C',H2:'H₂',H2O:'H₂O',C2H2:'C₂H₂',N2:'N₂',NO:'NO',NO2:'NO₂',N2O4:'N₂O₄',CH4:'CH₄',H2O2:'H₂O₂'};
const HSETS=[
 {t:'C(s) + ½O₂(g) → CO(g)',tg:{C:-1,O2:-.5,CO:1},dh:-110.5,steps:[{r:{C:-1,O2:-1,CO2:1},dh:-393.5},{r:{CO:-1,O2:-.5,CO2:1},dh:-283.0}],ans:[1,-1]},
 {t:'2C(s) + H₂(g) → C₂H₂(g)',tg:{C:-2,H2:-1,C2H2:1},dh:226.8,steps:[{r:{C:-1,O2:-1,CO2:1},dh:-393.5},{r:{H2:-1,O2:-.5,H2O:1},dh:-285.8},{r:{C2H2:-1,O2:-2.5,CO2:2,H2O:1},dh:-1299.6}],ans:[2,1,-1]},
 {t:'N₂(g) + 2O₂(g) → 2NO₂(g)',tg:{N2:-1,O2:-2,NO2:2},dh:66.4,steps:[{r:{N2:-1,O2:-1,NO:2},dh:180.5},{r:{NO:-2,O2:-1,NO2:2},dh:-114.1}],ans:[1,1]},
 {t:'2NO₂(g) → N₂O₄(g)',tg:{NO2:-2,N2O4:1},dh:-57.2,steps:[{r:{N2:-1,O2:-2,NO2:2},dh:66.4},{r:{N2:-1,O2:-2,N2O4:1},dh:9.2}],ans:[-1,1]}];
const hsFmt=o=>{const L=[],R=[];Object.entries(o).forEach(([k,v])=>{const c=Math.abs(v),s=(c===1?'':c===.5?'½':c%1?c:c)+HSP[k];if(Math.abs(v)<1e-9)return;(v<0?L:R).push(s);});return (L.join(' + ')||'—')+' → '+(R.join(' + ')||'—');};
const hsMul=[-2,-1,-.5,0,.5,1,2];
(function enthalpy(){
  const sel=$('#hl-set');if(!sel)return;sel.innerHTML=HSETS.map((s,i)=>`<option value="${i}">${s.t}</option>`).join('');
  let S=HSETS[0],mult=[];const cv=$('#hl-canvas');
  function build(){S=HSETS[+sel.value];mult=S.steps.map(()=>0);$('#hl-rows').innerHTML=S.steps.map((s,i)=>`<div class="hl-row"><span class="hl-eq">${hsFmt(s.r)} <small>ΔH = ${s.dh>0?'+':'−'}${Math.abs(s.dh)} kJ</small></span><label>× <select data-i="${i}" aria-label="multiplier for step ${i+1}">${hsMul.map(m=>`<option value="${m}"${m===0?' selected':''}>${m===.5?'½':m===-.5?'−½':m}</option>`).join('')}</select></label></div>`).join('');upd();}
  function net(){const t={};S.steps.forEach((s,i)=>Object.entries(s.r).forEach(([k,v])=>t[k]=(t[k]||0)+v*mult[i]));Object.keys(t).forEach(k=>{if(Math.abs(t[k])<1e-9)delete t[k];});return t;}
  const same=(a,b)=>{const ks=new Set([...Object.keys(a),...Object.keys(b)]);return [...ks].every(k=>Math.abs((a[k]||0)-(b[k]||0))<1e-9);};
  function upd(){const n=net(),sum=S.steps.reduce((a,s,i)=>a+s.dh*mult[i],0),ok=Object.keys(n).length&&same(n,S.tg);setText('hl-net',Object.keys(n).length?hsFmt(n):'(choose multipliers)');setText('hl-sum',(sum>=0?'+':'−')+fmt(Math.abs(sum),1)+' kJ');
    const o=$('#hl-ok');o.textContent=ok?'Yes! ΔH = '+(sum>=0?'+':'−')+fmt(Math.abs(sum),1)+' kJ':'Not yet';o.className=ok?'v':'';sim.render();}
  $('#hl-rows').addEventListener('change',e=>{const i=e.target.dataset.i;if(i===undefined)return;mult[+i]=+e.target.value;upd();});
  const sim=sim2d(cv,{h:()=>200,draw(ctx,w,h){const vals=[0];let acc=0;S.steps.forEach((s,i)=>{acc+=s.dh*mult[i];vals.push(acc);});const tg=S.dh,all=[...vals,0,tg],lo=Math.min(...all)-20,hi=Math.max(...all)+20;
      const P=panel(ctx,{x:56,y:10,w:w-72,h:h-34},[0,S.steps.length+1],[lo,hi],{xn:1,yn:4,ylabel:'ΔH (kJ)',color:T.ink});
      line(ctx,P,0,0,S.steps.length+1,0,T.muted,1,[4,4]);
      for(let i=0;i<S.steps.length;i++){if(mult[i]===0)continue;const y0=vals[i],y1=vals[i+1];arrow(ctx,P.X(i+.5),P.Y(y0),P.X(i+.5),P.Y(y1),y1<y0?T.cv:T.hot,3);label(ctx,'step '+(i+1)+(mult[i]!==1?' ×'+(mult[i]===.5?'½':mult[i]===-.5?'−½':mult[i]):''),P.X(i+.5),P.Y((y0+y1)/2),T.ink,'left','middle',MONO);}
      ctx.save();ctx.strokeStyle=T.ca;ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.moveTo(P.X(.1),P.Y(tg));ctx.lineTo(P.X(S.steps.length+.9),P.Y(tg));ctx.stroke();ctx.restore();label(ctx,'target ΔH = '+(tg>=0?'+':'−')+Math.abs(tg),P.X(S.steps.length+.9),P.Y(tg)-6,T.ca,'right','bottom',MONO);
      dot(ctx,P.X(S.steps.length+.3),P.Y(vals[vals.length-1]),6,T.ink);label(ctx,'your total',P.X(S.steps.length+.3)-10,P.Y(vals[vals.length-1]),T.ink,'right','middle',MONO);}});
  sel.addEventListener('change',build);$('#hl-new').addEventListener('click',()=>{sel.value=(+sel.value+1)%HSETS.length;build();});$('#hl-lab').addEventListener('labreset',build);build();
  /* bond energies */
  const BE={'H–H':436,'Cl–Cl':243,'H–Cl':431,'C–H':413,'O=O':498,'C=O':799,'O–H':467,'N≡N':945,'N–H':391};
  const BR=[{t:'H₂ + Cl₂ → 2HCl',R:[['H2',1],['Cl2',1]],P:[['HCl',2]],br:[['H–H',1],['Cl–Cl',1]],fo:[['H–Cl',2]]},
    {t:'CH₄ + 2O₂ → CO₂ + 2H₂O',R:[['CH4',1],['O2',2]],P:[['CO2',1],['H2O',2]],br:[['C–H',4],['O=O',2]],fo:[['C=O',2],['O–H',4]]},
    {t:'N₂ + 3H₂ → 2NH₃',R:[['N2',1],['H2',3]],P:[['NH3',2]],br:[['N≡N',1],['H–H',3]],fo:[['N–H',6]]},
    {t:'2H₂ + O₂ → 2H₂O',R:[['H2',2],['O2',1]],P:[['H2O',2]],br:[['H–H',2],['O=O',1]],fo:[['O–H',4]]}];
  const bs=$('#be-sel'),bp=$('#be-p'),bc=$('#be-canvas');bs.innerHTML=BR.map((r,i)=>`<option value="${i}">${r.t}</option>`).join('');let play=false;
  const tot=l=>l.reduce((a,[b,n])=>a+BE[b]*n,0);
  const bsim=sim2d(bc,{h:()=>330,step(dt){if(!play)return;bp.value=Math.min(200,+bp.value+dt*30);if(+bp.value>=200){play=false;$('#be-play').textContent='Play';}bupd(true);},
    draw(ctx,w,h){const r=BR[+bs.value],p=+bp.value/100,pb=clamp(p,0,1),pf=clamp(p-1,0,1),Bk=tot(r.br),Fm=tot(r.fo),top=h*.52,u=Math.min(34,w/22);
      const spread=(list,cx0,sp)=>{const items=[];list.forEach(([f,n])=>{for(let i=0;i<n;i++)items.push(f);});const gap=u*3.1,x0=cx0-(items.length-1)*gap/2;return items.map((f,i)=>[f,x0+i*gap]);};
      const reac=spread(r.R,w/2,0),prod=spread(r.P,w/2,0);
      /* free atoms */
      const atomsOf=list=>{const a=[];list.forEach(([f,x])=>{const m=molAtoms(f);m.atoms.forEach(at=>a.push({e:at.e,x:x+at.x*u*(1+pb*1.6)*1,y:top*.5+at.y*u*(1+pb*1.6)+Math.sin(sim.t*3+a.length)*pb*(1-pf)*3}));});return a;};
      if(pb<1&&pf===0){reac.forEach(([f,x])=>{const a=1-pb*.9;drawMol2D(ctx,f,x,top*.5,u,{alpha:1-pb});});}
      if(p>0&&pf<1){const A=atomsOf(reac);ctx.save();ctx.globalAlpha=Math.min(1,pb*4)*(1-pf);A.forEach(a=>ball2(ctx,a.x,a.y,u*(a.e==='H'?.3:.45),e2col(a.e),a.e==='H'?'rgba(0,0,0,.45)':null));ctx.restore();}
      if(pf>0)prod.forEach(([f,x])=>drawMol2D(ctx,f,x,top*.5,u,{alpha:pf}));
      label(ctx,p<1?(p<.02?'reactants':'breaking bonds: energy IN'):p<1.98?'forming bonds: energy OUT':'products',w/2,14,p<1?T.hot:T.cv,'center','middle','600 13px "IBM Plex Mono",monospace');
      const H0=h*.58,box={x:70,y:H0,w:w-90,h:h-H0-14},lo=Math.min(0,Bk-Fm)-60,hi=Bk+80,Pn=panel(ctx,box,[0,3],[lo,hi],{xn:1,yn:3,ylabel:'energy (kJ)',color:T.ink});
      const e=p<1?Bk*pb:Bk-Fm*pf*(p>=1?1:0)*(1)-0;const lv=p<=1?Bk*p:Bk-Fm*(p-1);
      line(ctx,Pn,0,0,3,0,T.muted,1,[3,3]);
      [['reactants',0,0,1,T.ink],['atoms',1,Bk,2,T.hot],['products',2,Bk-Fm,3,T.cv]].forEach(([n,i,y,x2,c])=>{line(ctx,Pn,i+.05,y,x2-.05,y,c,3);label(ctx,n,Pn.X(i+.5),Pn.Y(y)-8,c,'center','bottom',MONO);});
      if(Bk>0){arrow(ctx,Pn.X(.95),Pn.Y(0),Pn.X(.95),Pn.Y(Bk),T.hot,2);label(ctx,'+'+Bk,Pn.X(.95)-5,Pn.Y(Bk/2),T.hot,'right','middle',MONO);}
      arrow(ctx,Pn.X(1.95),Pn.Y(Bk),Pn.X(1.95),Pn.Y(Bk-Fm),T.cv,2);label(ctx,'−'+Fm,Pn.X(1.95)-5,Pn.Y(Bk-Fm/2),T.cv,'right','middle',MONO);
      const dh=Bk-Fm;ctx.save();ctx.strokeStyle=T.ca;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(Pn.X(2.4),Pn.Y(0));ctx.lineTo(Pn.X(2.4),Pn.Y(dh));ctx.stroke();ctx.restore();label(ctx,'ΔH = '+(dh>0?'+':'−')+Math.abs(dh),Pn.X(2.45),Pn.Y(dh/2),T.ca,'left','middle',MONO);
      const bx=p<=1?.5+p*.5:1.5+(p-1)*1,by=p<=1?Bk*p:Bk-Fm*(p-1);dot(ctx,Pn.X(p<=1?p:p),Pn.Y(by),6,T.ink);}});
  function bupd(fromPlay){const r=BR[+bs.value],Bk=tot(r.br),Fm=tot(r.fo);setText('be-p-out',+bp.value<5?'start':+bp.value<100?'breaking':+bp.value<195?'forming':'done');
    $('#be-tab').innerHTML=`<thead><tr><th>Bond</th><th>Per mol</th><th>Count</th><th>Total (kJ)</th></tr></thead><tbody>${r.br.map(([b,n])=>`<tr><td>${b} <small>broken</small></td><td>${BE[b]}</td><td>${n}</td><td>+${BE[b]*n}</td></tr>`).join('')}${r.fo.map(([b,n])=>`<tr><td>${b} <small>formed</small></td><td>${BE[b]}</td><td>${n}</td><td>−${BE[b]*n}</td></tr>`).join('')}</tbody>`;
    setText('be-in','+'+Bk+' kJ');setText('be-out','−'+Fm+' kJ');setText('be-dh',(Bk-Fm>0?'+':'−')+Math.abs(Bk-Fm)+' kJ ('+(Bk-Fm<0?'exothermic':'endothermic')+')');if(!fromPlay)bsim.render();else bsim.render();}
  bs.addEventListener('change',()=>{bp.value=0;play=false;$('#be-play').textContent='Play';bupd();});bindRange('be-p',()=>'',()=>bupd(),false);
  $('#be-play').addEventListener('click',()=>{if(+bp.value>=200)bp.value=0;play=!play;$('#be-play').textContent=play?'Pause':'Play';bupd(true);});$('#be-lab').addEventListener('labreset',()=>{bp.value=0;play=false;$('#be-play').textContent='Play';bupd();});
  const bpOut=$('#be-p-out');bupd();
  /* formation */
  const HF={CH4:-74.8,O2:0,CO2:-393.5,H2O:-285.8,H2Og:-241.8,C2H6:-84.7,NH3:-45.9,NO:90.3,NO2:33.2,N2O4:9.2,Fe2O3:-824.2,Al:0,Al2O3:-1675.7,Fe:0,SO2:-296.8,SO3:-395.7};
  const FN={CH4:'CH₄(g)',O2:'O₂(g)',CO2:'CO₂(g)',H2O:'H₂O(l)',H2Og:'H₂O(g)',C2H6:'C₂H₆(g)',NH3:'NH₃(g)',NO:'NO(g)',NO2:'NO₂(g)',N2O4:'N₂O₄(g)',Fe2O3:'Fe₂O₃(s)',Al:'Al(s)',Al2O3:'Al₂O₃(s)',Fe:'Fe(s)',SO2:'SO₂(g)',SO3:'SO₃(g)'};
  const FR=[{R:[['CH4',1],['O2',2]],P:[['CO2',1],['H2O',2]]},{R:[['C2H6',2],['O2',7]],P:[['CO2',4],['H2O',6]]},{R:[['NH3',4],['O2',5]],P:[['NO',4],['H2Og',6]]},{R:[['NO2',2]],P:[['N2O4',1]]},{R:[['Fe2O3',1],['Al',2]],P:[['Al2O3',1],['Fe',2]]},{R:[['SO2',2],['O2',1]],P:[['SO3',2]]}];
  const eqS=l=>l.map(([k,n])=>(n>1?n:'')+FN[k]).join(' + ');
  const fs=$('#fm-sel');fs.innerHTML=FR.map((r,i)=>`<option value="${i}">${eqS(r.R)} → ${eqS(r.P)}</option>`).join('');let fst=0;
  const sumL=l=>l.reduce((a,[k,n])=>a+HF[k]*n,0),terms=l=>l.map(([k,n])=>`${n>1?n+'(':'('}${fmt(HF[k],1)})`).join(' + ');
  function fupd(){const r=FR[+fs.value],sp=sumL(r.P),sr=sumL(r.R),dh=sp-sr,L=[];
    L.push(`<span class="ln"><span class="lbl">Reaction</span>${eqS(r.R)} → ${eqS(r.P)}</span>`);
    if(fst>=1)L.push(`<span class="ln"><span class="lbl">ΣnΔH°f (products)</span>${terms(r.P)} = ${fmt(sp,1)} kJ</span>`);
    if(fst>=2)L.push(`<span class="ln"><span class="lbl">ΣnΔH°f (reactants)</span>${terms(r.R)} = ${fmt(sr,1)} kJ${r.R.some(([k])=>HF[k]===0)?' <small>(elements are 0)</small>':''}</span>`);
    if(fst>=3)L.push(`<span class="ln"><span class="lbl">ΔH°</span><span class="net">${fmt(sp,1)} − (${fmt(sr,1)}) = ${fmt(dh,1)} kJ (${dh<0?'exothermic':'endothermic'})</span></span>`);
    $('#fm-out').innerHTML=L.join('');$('#fm-back').disabled=fst===0;$('#fm-next').textContent=fst>=3?'Start over':'Next step';}
  fs.addEventListener('change',()=>{fst=0;fupd();});$('#fm-next').addEventListener('click',()=>{fst=fst>=3?0:fst+1;fupd();});$('#fm-back').addEventListener('click',()=>{fst=Math.max(0,fst-1);fupd();});$('#fm-lab').addEventListener('labreset',()=>{fst=0;fupd();});fupd();
  drawers.enthalpy=()=>{sim.render();bsim.render();};
  TIPS['hl-set']='Each puzzle gives known reactions; choose a multiplier for each to build the target.';
  TIPS['be-sel']='Pick a reaction and scrub the progress slider to break, then make, bonds.';
  TIPS['be-p']='First half: bonds break (energy in). Second half: new bonds form (energy out).';
  TIPS['fm-sel']='Step through products minus reactants.';
  KEYS['be-canvas']=['Press Play, or drag the progress slider.',[['hot','energy in'],['cv','energy out'],['ca','net ΔH']]];
  GLOSS['enthalpy']='The heat content of a system at constant pressure; ΔH is the heat exchanged at constant pressure.';
  GLOSS['hess\'s law']='If a reaction is the sum of other reactions, its ΔH is the sum of theirs.';
  GLOSS['state function']='A quantity that depends only on the current state, not on the path taken.';
  GLOSS['bond energy']='The energy needed to break one mole of a particular bond in the gas phase.';
  TT.enthalpy='Draw the energy ladder on the board: up for breaking, down for forming. It explains the sign of ΔH more than any rule.';
})();
(function(){
  const BEv={'H–H':436,'Cl–Cl':243,'H–Cl':431,'C–H':413,'O=O':498,'C=O':799,'O–H':467,'N≡N':945,'N–H':391};
  PROBS.push({id:'en-hess',topic:'enthalpy',title:'Hess\'s law',gen(){const a=pick([-120,-85,-210,-310,45,90,150]),b=pick([-60,-140,-250,70,110,-95]),v=pick([0,1,2,3]);let q,ans,sol;
    if(v===0){q=`Given A → B, ΔH = ${a} kJ and B → C, ΔH = ${b} kJ, what is ΔH for A → C?`;ans=a+b;sol=`Add: ${a} + (${b}) = <b>${ans} kJ</b>.`;}
    else if(v===1){q=`Given A → B, ΔH = ${a} kJ and B → C, ΔH = ${b} kJ, what is ΔH for C → A?`;ans=-(a+b);sol=`A → C is ${a+b} kJ; reversing flips the sign: <b>${ans} kJ</b>.`;}
    else if(v===2){q=`Given A → B, ΔH = ${a} kJ and B → C, ΔH = ${b} kJ, what is ΔH for 2A → 2C?`;ans=2*(a+b);sol=`A → C is ${a+b} kJ; doubling the equation doubles ΔH: <b>${ans} kJ</b>.`;}
    else{q=`Given A → C, ΔH = ${a+b} kJ and B → C, ΔH = ${b} kJ, what is ΔH for A → B?`;ans=a;sol=`A → B equals (A → C) plus (C → B): ${a+b} + (${-b}) = <b>${ans} kJ</b>.`;}
    return {q,ans,unit:'kJ',abs:.5,hint:'Reverse a step: flip the sign. Multiply a step: multiply ΔH. Then add.',sol};}});
  const FO=[['CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',[['CH₄',-74.8],['CO₂',-393.5],['H₂O(l)',-285.8]],-74.8*-1,-393.5+2*-285.8],
    ['2NO₂(g) → N₂O₄(g)',[['NO₂',33.2],['N₂O₄',9.2]],0,9.2-2*33.2],
    ['Fe₂O₃(s) + 2Al(s) → Al₂O₃(s) + 2Fe(s)',[['Fe₂O₃(s)',-824.2],['Al₂O₃(s)',-1675.7]],0,-1675.7+824.2],
    ['2SO₂(g) + O₂(g) → 2SO₃(g)',[['SO₂',-296.8],['SO₃',-395.7]],0,2*-395.7-2*-296.8],
    ['4NH₃(g) + 5O₂(g) → 4NO(g) + 6H₂O(g)',[['NH₃',-45.9],['NO',90.3],['H₂O(g)',-241.8]],0,4*90.3+6*-241.8-4*-45.9]];
  PROBS.push({id:'en-formation',topic:'enthalpy',title:'ΔH from formation enthalpies',gen(){const [eq,d,,ans]=pick(FO);
    return {q:`Use standard enthalpies of formation (kJ/mol): ${d.map(([n,v])=>`${n} ${v>0?'+':''}${v}`).join(', ')}; ΔH°f of every element in its standard state is 0. Find ΔH° for: ${eq}`,ans,unit:'kJ',tol:.01,hint:'ΔH° = Σ n·ΔH°f(products) − Σ n·ΔH°f(reactants). Multiply each by its coefficient.',sol:`ΔH° = <b>${fmt(ans,1)} kJ</b>.`};}});
  const BRX=[['H₂ + Cl₂ → 2HCl',[['H–H',1],['Cl–Cl',1]],[['H–Cl',2]]],['N₂ + 3H₂ → 2NH₃',[['N≡N',1],['H–H',3]],[['N–H',6]]],['2H₂ + O₂ → 2H₂O',[['H–H',2],['O=O',1]],[['O–H',4]]],['CH₄ + 2O₂ → CO₂ + 2H₂O',[['C–H',4],['O=O',2]],[['C=O',2],['O–H',4]]]];
  PROBS.push({id:'en-bond',topic:'enthalpy',title:'ΔH from bond energies',gen(){const [eq,br,fo]=pick(BRX),B=br.reduce((a,[b,n])=>a+BEv[b]*n,0),F=fo.reduce((a,[b,n])=>a+BEv[b]*n,0),used=[...br,...fo].map(([b])=>b).filter((b,i,a)=>a.indexOf(b)===i);
    return {q:`Average bond energies (kJ/mol): ${used.map(b=>`${b} ${BEv[b]}`).join(', ')}. Estimate ΔH for ${eq}.`,ans:B-F,unit:'kJ',tol:.01,hint:'Add the energy to break every bond in the reactants, then subtract the energy released forming every bond in the products.',sol:`Broken: ${br.map(([b,n])=>`${n}×${BEv[b]}`).join(' + ')} = ${B} kJ. Formed: ${fo.map(([b,n])=>`${n}×${BEv[b]}`).join(' + ')} = ${F} kJ. ΔH = ${B} − ${F} = <b>${B-F} kJ</b>.`};}});
  const HR=[['CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',-890.3,16.04,'CH₄',1],['2C₂H₆(g) + 7O₂(g) → 4CO₂(g) + 6H₂O(l)',-3119.4,30.07,'C₂H₆',2],['C₃H₈(g) + 5O₂(g) → 3CO₂(g) + 4H₂O(l)',-2220,44.10,'C₃H₈',1],['2H₂(g) + O₂(g) → 2H₂O(l)',-571.6,2.016,'H₂',2]];
  PROBS.push({id:'en-heat',topic:'enthalpy',title:'Heat from a given mass',gen(){const [eq,dh,M,nm,c]=pick(HR),m=pick([5.0,10.0,25.0,40.0]),q=m/M/c*Math.abs(dh);
    return {q:`${eq}, ΔH = ${dh} kJ. How much heat is released when ${fmt(m,1)} g of ${nm} burns completely? (molar mass ${M} g/mol)`,ans:q,unit:'kJ',tol:.02,hint:'Grams → moles of fuel → divide by its coefficient (ΔH is per reaction as written) → multiply by |ΔH|.',sol:`n = ${fmt(m,1)}/${M} = ${fmt(m/M,3)} mol; reactions = ${fmt(m/M,3)} ÷ ${c} = ${fmt(m/M/c,3)}; q = <b>${fmt(q,0)} kJ</b> released.`};}});
  PROBS.push({id:'en-concept',topic:'enthalpy',title:'Exothermic or endothermic?',gen(){const B=pick([600,800,950,1200]),F=B+pick([-250,-120,90,200,310]),dh=B-F;
    return {q:`Breaking all the bonds in the reactants takes ${B} kJ, and forming all the bonds in the products releases ${F} kJ. What is ΔH?`,ans:dh,unit:'kJ',abs:.5,hint:'ΔH = energy in − energy out.',sol:`ΔH = ${B} − ${F} = <b>${dh} kJ</b> (${dh<0?'exothermic':'endothermic'}).`};}});
})();
