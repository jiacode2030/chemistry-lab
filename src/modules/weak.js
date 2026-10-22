
/* ---------------- Weak acids & bases ---------------- */
const WK=[{n:'HF',k:6.8e-4,t:'acid'},{n:'HNO₂',k:4.5e-4,t:'acid'},{n:'HCOOH',k:1.8e-4,t:'acid'},{n:'CH₃COOH',k:1.8e-5,t:'acid'},{n:'HClO',k:3.0e-8,t:'acid'},{n:'HCN',k:4.9e-10,t:'acid'},{n:'NH₃',k:1.8e-5,t:'base'},{n:'CH₃NH₂',k:4.4e-4,t:'base'},{n:'C₅H₅N (pyridine)',k:1.7e-9,t:'base'}];
function wkSolve(K,c,type){/* returns x = [H3O+] (acid) or [OH-] (base) from charge balance */let lo=1e-16,hi=Math.max(c,1e-7)+1e-6;const f=h=>h-1e-14/h-c*K/(K+h);for(let i=0;i<200;i++){const m=Math.sqrt(lo*hi);f(m)<0?lo=m:hi=m;}return Math.sqrt(lo*hi);}
function wkPH(K,c,type){const x=wkSolve(K,c,type);return type==='acid'?-Math.log10(x):14+Math.log10(x);}
function wkIon(K,c,type){const x=wkSolve(K,c,type);const own=x-1e-14/x;return own/c;}
(function weak(){
  const cv=$('#wk-canvas');if(!cv)return;const sp=$('#wk-sp'),cS=$('#wk-c');sp.innerHTML=WK.map(w=>`<option value="${w.n}">${w.n}  (${w.t==='acid'?'Ka':'Kb'} = ${sci(w.k,1)})</option>`).join('');sp.value='CH₃COOH';
  const H=260,N=60;let rng=[];for(let i=0;i<N;i++)rng.push(Math.random());let pos=[],pos2=[];
  const cur=()=>{const w=WK.find(q=>q.n===sp.value),c=Math.pow(10,+cS.value),a=wkIon(w.k,c,w.t),x=wkSolve(w.k,c,w.t);return {w,c,a,x,ph:wkPH(w.k,c,w.t)};};
  function layout(w){const mk=()=>({x:20+Math.random()*(w-40),y:20+Math.random()*(H-60),vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60,ph:Math.random()*6.28});pos=[];pos2=[];for(let i=0;i<N;i++){pos.push(mk());pos2.push(mk());}}
  const sim=sim2d(cv,{h:()=>H+20,step(dt){const w=cv.clientWidth,hw=w/2-8;if(!pos.length)layout(hw);const mv=p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<14||p.x>hw-14)p.vx*=-1;if(p.y<14||p.y>H-14)p.vy*=-1;p.x=clamp(p.x,14,hw-14);p.y=clamp(p.y,14,H-14);};pos.forEach(mv);pos2.forEach(mv);},
    draw(ctx,w,h){const s=cur(),hw=w/2-8,acid=s.w.t==='acid';[0,1].forEach(side=>{const ox=side?w/2+8:0;ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(ox+1,1,hw,H);label(ctx,side?(acid?'strong acid, same concentration':'strong base, same concentration'):s.w.n,ox+8,H+10,T.muted,'left','middle',MONO);});
      const nIon=Math.min(N,Math.round(s.a*N)),P=pos;
      /* weak: first nIon are ionized pairs (A⁻ + H₃O⁺), rest are intact molecules */
      P.forEach((p,i)=>{const ox=0;if(i<nIon){ball2(ctx,ox+p.x-5,p.y,6.5,'#8B5CF6');ball2(ctx,ox+p.x+7,p.y+5,5,'#3E7BDC');}else{ball2(ctx,ox+p.x-4,p.y,7,'#9FB6CC');ball2(ctx,ox+p.x+6,p.y,4,'#EEF1F5','rgba(0,0,0,.4)');}});
      pos2.forEach(p=>{const ox=w/2+8;ball2(ctx,ox+p.x-5,p.y,6.5,'#8B5CF6');ball2(ctx,ox+p.x+7,p.y+5,5,'#3E7BDC');});
      label(ctx,`${nIon} of ${N} ionized${s.a*N<.5&&s.a>0?' (about '+fmt(s.a*N,2)+')':''}`,8,12,T.ink,'left','middle',MONO);label(ctx,`${N} of ${N} ionized`,w/2+16,12,T.ink,'left','middle',MONO);}});
  const g=$('#wk-graph'),gs=sim2d(g,{h:()=>H+20,draw(ctx,w,h){const s=cur(),P=panel(ctx,{x:46,y:12,w:w-60,h:h-48},[-4,0],[0,100],{xn:4,yn:4,xlabel:'log c',ylabel:'% ionized',color:T.ink});
      curve(ctx,P,x=>wkIon(s.w.k,Math.pow(10,x),s.w.t)*100,-4,0,T.cx,2.6,160);const a=s.a*100;dot(ctx,P.X(+cS.value),P.Y(a),6,T.ink);label(ctx,fmt(a,a<1?2:1)+'%',P.X(+cS.value)+8,P.Y(a)-8,T.ink,'left','bottom',MONO);}});
  function upd(){const s=cur(),kc=1e-14/s.w.k;setText('wk-c-out',sci(s.c,1)+' M');setText('wk-ph',fmt(s.ph,2));setText('wk-pct',fmt(s.a*100,s.a<.01?3:2)+'%');setText('wk-k',sci(s.w.k,2));setText('wk-kc',sci(kc,2));setText('wk-one',s.a>0?fmt(1/s.a,0)+' molecules':'—');
    $('#wk-note').textContent=s.a<.05?`x/c = ${fmt(s.a*100,2)}%: under 5%, so the "x is small" shortcut works here.`:`x/c = ${fmt(s.a*100,1)}%: over 5%, so the shortcut would fail; solve the quadratic.`;sim.render();gs.render();}
  sp.addEventListener('change',upd);bindRange('wk-c',()=>'',upd,false);$('#wk-lab').addEventListener('labreset',upd);upd();drawers.weak=()=>{layout(cv.clientWidth/2-8);upd();};
  TIPS['wk-sp']='Smaller K means fewer molecules ionize. Bases ionize by taking a proton from water.';
  TIPS['wk-c']='Dilution raises the percent ionized, but the pH still moves toward neutral.';
  KEYS['wk-canvas']=['Pick a species and compare the left beaker with the strong acid on the right.',[['#8B5CF6','anion (A⁻)'],['#3E7BDC','H₃O⁺'],['#9FB6CC','intact molecule']]];
  GLOSS['weak acid']='An acid that only partly ionizes in water.';
  GLOSS['Ka']='The equilibrium constant for a weak acid ionizing; a larger Ka means a stronger acid.';
  GLOSS['Kb']='The equilibrium constant for a weak base reacting with water.';
  GLOSS['percent ionization']='The fraction of acid molecules that have ionized, times 100.';
  TT.weak='Ask: "What would you see in the left beaker for 0.001 M HCN?" Few ions at all. Then reveal the 1-in-45 000 figure.';
})();
(function(){
  const AC=WK.filter(w=>w.t==='acid'&&w.n!=='HCN'),BS=WK.filter(w=>w.t==='base');
  PROBS.push({id:'wk-pH',topic:'weak',title:'pH of a weak acid',gen(){const w=pick(AC),c=pick([.010,.050,.10,.20,.50,1.0]),x=wkSolve(w.k,c,'acid'),ph=-Math.log10(x);
    return {q:`What is the pH of ${fmt(c,3)} M ${w.n}? (K<sub>a</sub> = ${sci(w.k,1)})`,ans:ph,unit:'',abs:.03,hint:'Set up an ICE table: Ka = x²/(c − x). Check the 5% rule; if it fails, use the quadratic formula.',sol:`x = [H₃O⁺] = ${sci(x,3)} M (${fmt(x/c*100,1)}% of ${fmt(c,3)} M${x/c<.05?'':'; the shortcut would fail, so use the quadratic'}). pH = <b>${fmt(ph,2)}</b>.`};}});
  PROBS.push({id:'wk-Ka',topic:'weak',title:'Ka from a measured pH',gen(){const w=pick(AC),c=pick([.050,.10,.20,.50]),ph=+wkPH(w.k,c,'acid').toFixed(2),x=Math.pow(10,-ph),Ka=x*x/(c-x);
    return {q:`A ${fmt(c,2)} M solution of a weak monoprotic acid has pH ${fmt(ph,2)}. What is its K<sub>a</sub>?`,ans:Ka,unit:'',tol:.03,hint:'[H₃O⁺] = 10^(−pH) = [A⁻]. Then Ka = x²/(c − x).',sol:`x = 10<sup>−${fmt(ph,2)}</sup> = ${sci(x,3)} M. K<sub>a</sub> = (${sci(x,3)})² / (${fmt(c,2)} − ${sci(x,3)}) = <b>${sci(Ka,2)}</b>.`};}});
  PROBS.push({id:'wk-pct',topic:'weak',title:'Percent ionization',gen(){const w=pick(AC),c=pick([.0010,.010,.10,.50]),a=wkIon(w.k,c,'acid');
    return {q:`What percent of ${w.n} molecules are ionized in a ${sci(c,1)} M solution? (K<sub>a</sub> = ${sci(w.k,1)})`,ans:a*100,unit:'%',tol:.04,hint:'Find x (the equilibrium [H₃O⁺]), then % = x/c × 100. Use the quadratic if the 5% rule fails.',sol:`x = ${sci(wkSolve(w.k,c,'acid'),3)} M; % ionized = x/${sci(c,1)} × 100 = <b>${fmt(a*100,a*100<1?2:1)}%</b>.`};}});
  PROBS.push({id:'wk-base',topic:'weak',title:'pH of a weak base',gen(){const w=pick(BS.filter(b=>b.k>1e-6)),c=pick([.010,.050,.10,.20,.50]),ph=wkPH(w.k,c,'base');
    return {q:`What is the pH of ${fmt(c,3)} M ${w.n.split(' ')[0]}? (K<sub>b</sub> = ${sci(w.k,1)}; K<sub>w</sub> = 1.0×10⁻¹⁴)`,ans:ph,unit:'',abs:.03,hint:'B + H₂O ⇌ BH⁺ + OH⁻: Kb = x²/(c − x) with x = [OH⁻]. Find pOH, then pH = 14 − pOH.',sol:`[OH⁻] = x = ${sci(wkSolve(w.k,c,'base'),3)} M; pOH = ${fmt(14-ph,2)}; pH = <b>${fmt(ph,2)}</b>.`};}});
  PROBS.push({id:'wk-conj',topic:'weak',title:'K of the conjugate',gen(){const w=pick(WK),conj=1e-14/w.k;
    return {q:`${w.t==='acid'?'The K<sub>a</sub> of '+w.n+' is '+sci(w.k,1)+'. What is the K<sub>b</sub> of its conjugate base?':'The K<sub>b</sub> of '+w.n.split(' ')[0]+' is '+sci(w.k,1)+'. What is the K<sub>a</sub> of its conjugate acid?'} (K<sub>w</sub> = 1.0×10⁻¹⁴)`,ans:conj,unit:'',tol:.03,hint:'Ka × Kb = Kw for a conjugate pair.',sol:`K = 1.0×10⁻¹⁴ / ${sci(w.k,1)} = <b>${sci(conj,2)}</b>.`};}});
  const ST=[['HClO₃','HClO₂','HClO₃','it has more oxygen atoms, which pull electron density from the O–H bond and stabilize the conjugate base'],['HF','HCl','HCl','the H–Cl bond is longer and weaker than H–F, so it gives up H⁺ more easily'],['H₂S','H₂O','H₂S','the H–S bond is longer and weaker than H–O (down a group, bond strength dominates)'],['CH₃COOH','ClCH₂COOH','ClCH₂COOH','the electronegative chlorine pulls electron density away and stabilizes the anion'],['H₂SO₄','H₂SO₃','H₂SO₄','it has more oxygen atoms on the central atom'],['HBr','HF','HBr','the H–Br bond is much weaker than H–F'],['NH₃','H₂O','H₂O','oxygen is more electronegative than nitrogen (across a period electronegativity dominates)']];
  PROBS.push({id:'wk-struct',topic:'weak',title:'Which acid is stronger?',gen(){const [a,b,s,why]=pick(ST),ch=Math.random()<.5?[a,b]:[b,a];
    return {q:`Which is the stronger acid: ${ch[0]} or ${ch[1]}?`,choices:ch,ans:ch.indexOf(s),hint:'Think about bond strength (down a group), electronegativity (across a period), and the number of oxygens or electronegative substituents.',sol:`<b>${s}</b>: ${why}.`};}});
})();
