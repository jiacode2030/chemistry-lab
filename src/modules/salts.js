
/* ---------------- Salt solutions, polyprotic acids & species vs pH ---------------- */
const SHS=[
 {n:'NaCl',cat:['Na⁺','NaOH (strong base)',0],an:['Cl⁻','HCl (strong acid)',0]},
 {n:'NaCH₃COO',cat:['Na⁺','NaOH (strong base)',0],an:['CH₃COO⁻','CH₃COOH (weak acid, Ka 1.8×10⁻⁵)',1.8e-5]},
 {n:'NaF',cat:['Na⁺','NaOH (strong base)',0],an:['F⁻','HF (weak acid, Ka 6.8×10⁻⁴)',6.8e-4]},
 {n:'NH₄Cl',cat:['NH₄⁺','NH₃ (weak base, Kb 1.8×10⁻⁵)',5.6e-10,'acid'],an:['Cl⁻','HCl (strong acid)',0]},
 {n:'KNO₃',cat:['K⁺','KOH (strong base)',0],an:['NO₃⁻','HNO₃ (strong acid)',0]},
 {n:'NaCN',cat:['Na⁺','NaOH (strong base)',0],an:['CN⁻','HCN (weak acid, Ka 4.9×10⁻¹⁰)',4.9e-10]},
 {n:'NH₄NO₃',cat:['NH₄⁺','NH₃ (weak base, Kb 1.8×10⁻⁵)',5.6e-10,'acid'],an:['NO₃⁻','HNO₃ (strong acid)',0]},
 {n:'NH₄CH₃COO',cat:['NH₄⁺','NH₃ (weak base, Kb 1.8×10⁻⁵)',5.6e-10,'acid'],an:['CH₃COO⁻','CH₃COOH (weak acid, Ka 1.8×10⁻⁵)',1.8e-5],both:true}];
function shPH(s,c){/* returns {ph, kind, K, ion} */const ca=s.cat[2]&&s.cat[3]==='acid',an=s.an[2];
  if(s.both)return {ph:7.0,kind:'nearly neutral (Ka of NH₄⁺ ≈ Kb of CH₃COO⁻)',K:null};
  if(ca&&!an){const x=Math.sqrt(s.cat[2]*c);return {ph:wkPH(s.cat[2],c,'acid'),kind:'acidic',K:s.cat[2],ion:s.cat[0],type:'acid',x};}
  if(an&&!ca){const Kb=1e-14/s.an[2];return {ph:wkPH(Kb,c,'base'),kind:'basic',K:Kb,ion:s.an[0],type:'base'};}
  return {ph:7.0,kind:'neutral',K:null};}
const PPA=[{n:'Acetic acid (monoprotic)',forms:['CH₃COOH','CH₃COO⁻'],pk:[4.74]},{n:'Ammonium ion NH₄⁺',forms:['NH₄⁺','NH₃'],pk:[9.25]},{n:'Carbonic acid (diprotic)',forms:['H₂CO₃','HCO₃⁻','CO₃²⁻'],pk:[6.35,10.33]},{n:'Phosphoric acid (triprotic)',forms:['H₃PO₄','H₂PO₄⁻','HPO₄²⁻','PO₄³⁻'],pk:[2.15,7.20,12.35]}];
function ppFrac(pk,pH){const h=Math.pow(10,-pH),K=pk.map(p=>Math.pow(10,-p));const t=[1];let c=1;K.forEach(k=>{c*=k/h;t.push(c);});const s=t.reduce((a,b)=>a+b,0);return t.map(v=>v/s);}
(function salts(){
  const cv=$('#sh-canvas');if(!cv)return;const ss=$('#sh-salt'),cS=$('#sh-c');ss.innerHTML=SHS.map((s,i)=>`<option value="${i}">${s.n}</option>`).join('');ss.value='1';
  const cur=()=>{const s=SHS[+ss.value],c=Math.pow(10,+cS.value);return {s,c,r:shPH(s,c)};};
  const sim=sim2d(cv,{h:()=>230,draw(ctx,w,h){const {s,r}=cur(),y=h/2-6;ctx.fillStyle=alpha('#7FB4F0',.15);ctx.fillRect(0,0,w,h);const bx=w*.18,ax=w*.82;
      /* crystal in the middle splitting into ions */
      ctx.fillStyle='#EEF1F5';ctx.strokeStyle=T.ink;ctx.lineWidth=1.5;ctx.fillRect(w/2-26,y-18,52,36);ctx.strokeRect(w/2-26,y-18,52,36);label(ctx,s.n,w/2,y,T.ink,'center','middle','700 12px "IBM Plex Mono",monospace');
      arrow(ctx,w/2-34,y,bx+42,y,T.muted,2);arrow(ctx,w/2+34,y,ax-42,y,T.muted,2);
      const ion=(x,name,from,K,isAcid)=>{const hy=K>0&&(isAcid!==undefined);const col=!K?'#9FB6CC':(isAcid?'#E5484D':'#8B5CF6');ball2(ctx,x,y,26,col);label(ctx,name,x,y,'#fff','center','middle',(name.length>5?'700 10px':'700 13px')+' "IBM Plex Mono",monospace');label(ctx,'from',x,y+44,T.muted,'center','middle',MONO);label(ctx,from.split(' (')[0],x,y+58,T.ink,'center','middle',MONO);label(ctx,from.includes('strong')?'strong → bystander':'weak → reacts',x,y+73,from.includes('strong')?T.muted:T.hot,'center','middle',MONO);};
      ion(bx,s.cat[0],s.cat[1],s.cat[3]==='acid'?1:0,s.cat[3]==='acid'?true:undefined);ion(ax,s.an[0],s.an[1],s.an[2]&&!s.both?1:(s.both?1:0),false);
      if(r.type){const ex=r.type==='acid'?bx:ax;ctx.strokeStyle=T.hot;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(ex,y,30,0,7);ctx.stroke();ctx.setLineDash([]);}
      label(ctx,'water',w/2,22,T.muted,'center','middle',MONO);}});
  const g=$('#sh-graph'),gs=sim2d(g,{h:()=>230,draw(ctx,w,h){const {r}=cur(),bx=20,bw=w-40,y=h/2;for(let i=0;i<=14;i++){const x=bx+bw*i/14,t=i/14;ctx.fillStyle=`rgb(${Math.round(225-170*t)},${Math.round(80+110*(1-Math.abs(t-.5)*1.4))},${Math.round(90+150*t)})`;ctx.fillRect(x-bw/28,y-14,bw/14+1,28);if(i%2===0)label(ctx,String(i),x,y+30,T.muted,'center','middle',MONO);}
      const px=bx+bw*clamp(r.ph,0,14)/14;ctx.fillStyle=T.ink;ctx.beginPath();ctx.moveTo(px,y-18);ctx.lineTo(px-7,y-32);ctx.lineTo(px+7,y-32);ctx.closePath();ctx.fill();label(ctx,'pH '+fmt(r.ph,2),px,y-42,T.ink,'center','middle','700 13px "IBM Plex Mono",monospace');label(ctx,'acidic',bx+20,y+52,T.muted,'left','middle',MONO);label(ctx,'basic',bx+bw-20,y+52,T.muted,'right','middle',MONO);}});
  function upd(){const {s,c,r}=cur();setText('sh-c-out',sci(c,1)+' M');setText('sh-cat',s.cat[0]+' ← '+s.cat[1]);setText('sh-an',s.an[0]+' ← '+s.an[1]);setText('sh-res',r.kind);setText('sh-ph',r.ph===7&&r.kind!=='neutral'?'≈ 7':fmt(r.ph,2));
    let eq='';if(r.type==='base')eq=`<span class="ln"><span class="lbl">Hydrolysis</span>${r.ion} + H₂O ⇌ ${s.an[1].split(' (')[0]} + OH⁻</span><span class="ln"><span class="lbl">Constant</span>K<sub>b</sub> = K<sub>w</sub>/K<sub>a</sub> = ${sci(r.K,2)}</span>`;
    else if(r.type==='acid')eq=`<span class="ln"><span class="lbl">Hydrolysis</span>${r.ion} + H₂O ⇌ NH₃ + H₃O⁺</span><span class="ln"><span class="lbl">Constant</span>K<sub>a</sub> = K<sub>w</sub>/K<sub>b</sub> = ${sci(r.K,2)}</span>`;
    else eq=`<span class="ln"><span class="lbl">Hydrolysis</span>${s.both?'both ions react about equally: K<sub>a</sub> of NH₄⁺ ≈ K<sub>b</sub> of CH₃COO⁻':'neither ion reacts with water'}</span>`;
    $('#sh-eq').innerHTML=eq;sim.render();gs.render();}
  ss.addEventListener('change',upd);bindRange('sh-c',()=>'',upd,false);$('#sh-lab').addEventListener('labreset',upd);upd();
  /* species vs pH */
  const ps=$('#pp-sel'),pH=$('#pp-ph');ps.innerHTML=PPA.map((a,i)=>`<option value="${i}">${a.n}</option>`).join('');ps.value='3';
  const FC=['#E5484D','#E0A82E','#2FA36B','#3E7BDC'];
  const pb=$('#pp-canvas'),psim=sim2d(pb,{h:()=>240,draw(ctx,w,h){const a=PPA[+ps.value],f=ppFrac(a.pk,+pH.value),n=a.forms.length,bw=Math.min(70,(w-40)/n-14),top=16,bh=h-60;ctx.strokeStyle=T.muted;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(30,top);ctx.lineTo(30,top+bh);ctx.lineTo(w-8,top+bh);ctx.stroke();
      a.forms.forEach((nm,i)=>{const cx=30+(w-40)*(i+.5)/n,y=top+bh-bh*f[i];ctx.fillStyle=FC[i];ctx.fillRect(cx-bw/2,y,bw,top+bh-y);label(ctx,fmt(f[i]*100,f[i]<.01?2:0)+'%',cx,y-8,T.ink,'center','bottom',MONO);label(ctx,nm,cx,top+bh+16,T.ink,'center','middle',MONO);});}});
  const pg=$('#pp-graph'),pgs=sim2d(pg,{h:()=>240,draw(ctx,w,h){const a=PPA[+ps.value],P=panel(ctx,{x:40,y:12,w:w-54,h:h-46},[0,14],[0,1],{xn:7,yn:4,xlabel:'pH',ylabel:'fraction',color:T.ink});a.forms.forEach((nm,i)=>{curve(ctx,P,x=>ppFrac(a.pk,x)[i],0,14,FC[i],2.6,140);});a.pk.forEach((p,i)=>{line(ctx,P,p,0,p,1,T.muted,1.2,[4,3]);label(ctx,'pKa'+(a.pk.length>1?i+1:'')+' '+fmt(p,2),p>9?P.X(p)-3:P.X(p)+3,P.box.y+22+i*12,T.muted,p>9?'right':'left','middle',MONO);});
      line(ctx,P,+pH.value,0,+pH.value,1,T.ink,2);}});
  function pupd(){const a=PPA[+ps.value],f=ppFrac(a.pk,+pH.value);setText('pp-ph-out',fmt(+pH.value,2));$('#pp-read').innerHTML=a.forms.map((nm,i)=>`<div><span>${nm}</span><strong style="color:${FC[i]}">${fmt(f[i]*100,f[i]<.01?2:1)}%</strong></div>`).join('');
    const best=f.indexOf(Math.max(...f));$('#pp-note').textContent=`Dominant form: ${a.forms[best]}. `+a.pk.map((p,i)=>`pH ${+pH.value<p?'below':'above'} pKa${a.pk.length>1?i+1:''} (${fmt(p,2)}): ${a.forms[+pH.value<p?i:i+1]} beats ${a.forms[+pH.value<p?i+1:i]}`).join(' · ');psim.render();pgs.render();}
  ps.addEventListener('change',pupd);bindRange('pp-ph',()=>'',pupd,false);$('#pp-lab').addEventListener('labreset',pupd);pupd();drawers.salts=()=>{upd();pupd();};
  TIPS['sh-salt']='Ask where each ion came from: strong parents leave an ion alone; weak parents make it react with water.';
  TIPS['sh-c']='A more concentrated salt solution is further from pH 7.';
  TIPS['pp-sel']='Each removable proton has its own pKa.';
  TIPS['pp-ph']='Below a pKa the protonated form dominates; above it, the deprotonated form.';
  KEYS['sh-canvas']=['Pick a salt and see which ion reacts with water.',[['#E5484D','acidic cation'],['#8B5CF6','basic anion'],['#9FB6CC','bystander ion']]];
  GLOSS['hydrolysis']='The reaction of an ion with water that changes the pH of the solution.';
  GLOSS['polyprotic']='An acid that can donate more than one proton, each with its own Ka.';
  GLOSS['amphiprotic']='A species that can act as either an acid or a base (for example water or HCO₃⁻).';
  TT.salts='Ask "where did each ion come from?" before any calculation. It prevents most errors on salt-solution questions.';
})();
(function(){
  const CAT=SHS.filter(s=>!s.both&&(s.cat[3]==='acid'||s.an[2])&&s.n!=='NaCl');
  PROBS.push({id:'salt-type',topic:'salts',title:'Acidic, basic or neutral?',gen(){const s=pick(SHS),r=shPH(s,.1),ch=['acidic','neutral','basic'],a=s.both?1:r.kind==='acidic'?0:r.kind==='basic'?2:1;
    return {q:`Will an aqueous solution of ${s.n} be acidic, neutral or basic (at 25 °C)?`,choices:ch,ans:a,hint:'Identify the parent acid and base of each ion. Strong parents give bystander ions; weak parents give ions that react with water.',sol:`<b>${ch[a]}</b>. ${s.cat[0]} comes from ${s.cat[1]}; ${s.an[0]} comes from ${s.an[1]}.${s.both?' Ka(NH₄⁺) ≈ Kb(CH₃COO⁻), so the effects cancel.':''}`};}});
  PROBS.push({id:'salt-pH',topic:'salts',title:'pH of a salt solution',gen(){const s=pick(CAT),c=pick([.050,.10,.20,.50,.010]),r=shPH(s,c);
    return {q:`What is the pH of ${fmt(c,3)} M ${s.n}? (${s.cat[3]==='acid'?'K<sub>b</sub> of NH₃ = 1.8×10⁻⁵':'K<sub>a</sub> of '+s.an[1].split(' ')[0]+' = '+sci(s.an[2],1)}; K<sub>w</sub> = 1.0×10⁻¹⁴)`,ans:r.ph,unit:'',abs:.03,hint:`Find which ion reacts, get its ${r.type==='base'?'K_b = K_w/K_a':'K_a = K_w/K_b'}, then solve x²/(c − x) = K.`,sol:`${r.ion} reacts with water; K = ${sci(r.K,2)}; x = ${r.type==='base'?'[OH⁻]':'[H₃O⁺]'} = ${sci(wkSolve(r.K,c,r.type),2)} M; pH = <b>${fmt(r.ph,2)}</b>.`};}});
  PROBS.push({id:'salt-ratio',topic:'salts',title:'Which form dominates?',gen(){const a=pick(PPA),pk=pick(a.pk),i=a.pk.indexOf(pk),d=pick([-1.5,-.8,.8,1.5]),ph=+(pk+d).toFixed(1),ch=[a.forms[i],a.forms[i+1]];
    return {q:`${a.n.split(' (')[0]} has a pK<sub>a</sub> of ${fmt(pk,2)} for ${a.forms[i]} ⇌ ${a.forms[i+1]} + H⁺. In a solution of pH ${fmt(ph,1)}, which of these two forms is present in the larger amount?`,choices:ch,ans:d<0?0:1,hint:'Compare the pH with the pKa: below it the protonated (more H) form dominates; above it, the deprotonated form.',sol:`pH ${d<0?'<':'>'} pK<sub>a</sub>, so <b>${ch[d<0?0:1]}</b> dominates (ratio [${a.forms[i+1]}]/[${a.forms[i]}] = 10<sup>${fmt(d,1)}</sup> = ${fmt(Math.pow(10,d),2)}).`};}});
  PROBS.push({id:'salt-poly',topic:'salts',title:'Polyprotic acid facts',gen(){const Q=[['For a triprotic acid like H₃PO₄, which is true?',['Ka1 > Ka2 > Ka3','Ka1 = Ka2 = Ka3','Ka3 is the largest','All three protons come off equally easily'],0,'each successive proton comes off an ion that is already more negative, so it is held more tightly'],['Which species is amphiprotic?',['HCO₃⁻','CO₃²⁻','H₂CO₃','Cl⁻'],0,'HCO₃⁻ can donate a proton (to CO₃²⁻) or accept one (to H₂CO₃)'],['The pH of a solution of a diprotic acid with Ka1 ≫ Ka2 is determined mainly by…',['the first dissociation','the second dissociation','the average of the two','the conjugate base only'],0,'the first proton produces far more H₃O⁺ than the second'],['At the second half-equivalence point of a diprotic acid titration, pH equals…',['pKa2','pKa1','7','(pKa1 + pKa2)/2 only at the first equivalence point'],0,'at that point [HA⁻] = [A²⁻], so pH = pKa2']],[q,ch,a,why]=pick(Q);
    return {q,choices:ch,ans:a,hint:'Think about removing a proton from a species that is already negative.',sol:`<b>${ch[a]}</b>: ${why}.`};}});
})();
