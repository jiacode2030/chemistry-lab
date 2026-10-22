
/* ---------------- Reaction mechanisms ---------------- */
const MECH=[
 {t:'NO₂ + CO → NO + CO₂',net:'NO₂ + CO → NO + CO₂',steps:[['NO₂ + NO₂ → NO₃ + NO','slow','bimolecular'],['NO₃ + CO → NO₂ + CO₂','fast','bimolecular']],E:[0,90,40,60,-20],
  sp:[['NO₂','reactant'],['CO','reactant'],['NO','product'],['CO₂','product'],['NO₃','intermediate']],rate:'rate = k[NO₂]²',ord:2,
  der:['The slowest step sets the overall rate. That is step 1.','Step 1 is elementary, so its rate law comes from its coefficients: rate = k₁[NO₂][NO₂] = k₁[NO₂]².','Step 1 has no intermediate among its reactants, so no substitution is needed.','Final answer: rate = k[NO₂]². CO is absent because it reacts only after the slow step.'],
  wrongR:['rate = k[NO₂][CO]','rate = k[NO₃][CO]','rate = k[NO₂][CO][NO]'],wrongN:['NO₂ + NO₃ → NO + CO₂','NO₃ + CO → NO + CO₂','2NO₂ + CO → NO₃ + NO + CO₂']},
 {t:'H₂O₂ + I⁻ (iodide catalyst)',net:'2H₂O₂ → 2H₂O + O₂',steps:[['H₂O₂ + I⁻ → H₂O + OI⁻','slow','bimolecular'],['H₂O₂ + OI⁻ → H₂O + O₂ + I⁻','fast','bimolecular']],E:[0,75,45,35,-60],
  sp:[['H₂O₂','reactant'],['H₂O','product'],['O₂','product'],['OI⁻','intermediate'],['I⁻','catalyst']],rate:'rate = k[H₂O₂][I⁻]',ord:2,
  der:['The slowest step sets the overall rate. That is step 1.','Step 1 is elementary: rate = k₁[H₂O₂][I⁻].','Step 1 contains no intermediate (OI⁻ appears only later), so no substitution is needed.','Final answer: rate = k[H₂O₂][I⁻]. The catalyst I⁻ appears in the rate law even though it is not in the overall equation.'],
  wrongR:['rate = k[H₂O₂]²','rate = k[H₂O₂][OI⁻]','rate = k[H₂O₂]²[I⁻]'],wrongN:['H₂O₂ + I⁻ → H₂O + O₂ + OI⁻','H₂O₂ → H₂O + O₂','2H₂O₂ + I⁻ → 2H₂O + O₂ + I⁻ + OI⁻']},
 {t:'2NO + O₂ → 2NO₂',net:'2NO + O₂ → 2NO₂',steps:[['NO + NO ⇌ N₂O₂','fast eq','bimolecular'],['N₂O₂ + O₂ → 2NO₂','slow','bimolecular']],E:[0,25,10,60,-45],
  sp:[['NO','reactant'],['O₂','reactant'],['NO₂','product'],['N₂O₂','intermediate']],rate:'rate = k[NO]²[O₂]',ord:3,
  der:['The slowest step sets the overall rate. That is step 2.','Step 2 is elementary: rate = k₂[N₂O₂][O₂].','N₂O₂ is an intermediate, so it must go. Step 1 is a fast equilibrium: forward rate = reverse rate, k₁[NO]² = k₋₁[N₂O₂], so [N₂O₂] = (k₁/k₋₁)[NO]².','Substitute: rate = k₂(k₁/k₋₁)[NO]²[O₂] = k[NO]²[O₂].'],
  wrongR:['rate = k[NO][O₂]','rate = k[N₂O₂][O₂]','rate = k[NO]²'],wrongN:['N₂O₂ + O₂ → 2NO₂','NO + O₂ → NO₂','2NO + O₂ → N₂O₂ + NO₂']},
 {t:'O₃ + O → 2O₂ (chlorine catalyst)',net:'O₃ + O → 2O₂',steps:[['Cl + O₃ → ClO + O₂','slow','bimolecular'],['ClO + O → Cl + O₂','fast','bimolecular']],E:[0,50,10,25,-80],
  sp:[['O₃','reactant'],['O','reactant'],['O₂','product'],['ClO','intermediate'],['Cl','catalyst']],rate:'rate = k[Cl][O₃]',ord:2,
  der:['The slowest step sets the overall rate. That is step 1.','Step 1 is elementary: rate = k₁[Cl][O₃].','Both Cl and O₃ are species we can measure (ClO, the intermediate, is not in this step).','Final answer: rate = k[Cl][O₃]. The catalyst Cl appears in the rate law, and the other reactant, O, does not.'],
  wrongR:['rate = k[O₃][O]','rate = k[ClO][O]','rate = k[Cl][O₃][O]'],wrongN:['Cl + O₃ + O → ClO + 2O₂','O₃ → O₂ + O','ClO + O₃ → Cl + 2O₂']},
 {t:'NO + O₃ → NO₂ + O₂ (one step)',net:'NO + O₃ → NO₂ + O₂',steps:[['NO + O₃ → NO₂ + O₂','slow','bimolecular']],E:[0,45,-60],
  sp:[['NO','reactant'],['O₃','reactant'],['NO₂','product'],['O₂','product']],rate:'rate = k[NO][O₃]',ord:2,
  der:['There is only one step, so it is the rate-determining step.','It is elementary, so the coefficients give the orders: rate = k[NO][O₃].','No intermediates, so no substitution is needed.','Final answer: rate = k[NO][O₃]. For a one-step reaction the rate law really can be read from the equation.'],
  wrongR:['rate = k[NO₂][O₂]','rate = k[NO]²[O₃]','rate = k[NO]'],wrongN:['NO + O₃ → NO₃ + O','NO₂ + O₂ → NO + O₃','NO + 2O₃ → NO₂ + 2O₂']}];
const MC_COL={reactant:'#3E7BDC',product:'#2FA36B',intermediate:'#8B5CF6',catalyst:'#E08A2E'};
function mechCurve(E){const n=E.length;return x=>{x=clamp(x,0,1);const s=x*(n-1),i=Math.min(n-2,Math.floor(s)),f=s-i;return E[i]+(E[i+1]-E[i])*(1-Math.cos(Math.PI*f))/2;};}
(function mechanism(){
  const cv=$('#mc-canvas');if(!cv)return;const sel=$('#mc-sel');sel.innerHTML=MECH.map((m,i)=>`<option value="${i}">${m.t}</option>`).join('');
  let M=MECH[0],f=mechCurve(M.E),guess=-1,roll=false,u=0,wait=0,done=false;
  const peaks=()=>M.E.map((e,i)=>i).filter(i=>i%2===1);
  const rds=()=>{let b=-1,bi=-1;peaks().forEach(i=>{if(M.E[i]>b){b=M.E[i];bi=i;}});return (bi-1)/2;};
  function steps(){$('#mc-steps').innerHTML=M.steps.map((s,i)=>`<div class="stp"><b>Step ${i+1}</b> <span>${s[0]}</span>${done||guess>=0?` <em class="${s[1]==='slow'?'slow':'fast'}">${s[1]==='slow'?'slow (rate-determining)':s[1]==='eq'?'fast equilibrium':'fast'}</em>`:''}</div>`).join('')+`<div class="stp"><b>Overall</b> <span>${M.net}</span></div>`;}
  function load(){M=MECH[+sel.value];f=mechCurve(M.E);guess=-1;done=false;u=0;roll=false;wait=0;$('#mc-fb').textContent=M.steps.length===1?'This reaction has one step, so one hill. Press Roll the ball.':'Tap the hill you think is the rate-determining step.';$('#mc-fb').className='small';steps();sim.render();
    dr=0;mrender();msInit();}
  const sim=sim2d(cv,{h:()=>270,step(dt){if(!roll)return;if(wait>0){wait-=dt;if(wait<=0){u=0;}return;}const Et=Math.max(...M.E)*1.05+4,v=Math.sqrt(Math.max(Et-f(u),.03*Et))*.045/Math.max(1,M.steps.length-.5);u+=v*dt;if(u>=1){u=1;wait=1.3;}},
    draw(ctx,w,h){const lo=Math.min(...M.E)-15,hi=Math.max(...M.E)+22,box={x:50,y:12,w:w-66,h:h-40},P=panel(ctx,box,[0,1],[lo,hi],{xn:1,yn:4,ylabel:'energy',color:T.ink});
      label(ctx,'reaction progress →',box.x+box.w/2,box.y+box.h+16,T.muted,'center','middle',MONO);
      const hl=guess>=0?peaks()[guess]:-1;
      curve(ctx,P,f,0,1,T.cx,2.8,300);
      M.E.forEach((e,i)=>{const x=i/(M.E.length-1);if(i%2===1){const hi2=hl===i;ctx.save();ctx.fillStyle=hi2?alpha(T.hot,.9):alpha(T.hot,.2);ctx.beginPath();ctx.arc(P.X(x),P.Y(e),hi2?9:7,0,7);ctx.fill();ctx.restore();label(ctx,'TS'+((i+1)/2),P.X(x),P.Y(e)-14,T.ink,'center','bottom',MONO);}
        else if(i>0&&i<M.E.length-1)label(ctx,'intermediate',P.X(x),P.Y(e)+14,MC_COL.intermediate,'center','top',MONO);});
      label(ctx,'reactants',P.X(0)+4,P.Y(M.E[0])-12,T.ink,'left','bottom',MONO);label(ctx,'products',P.X(1)-4,P.Y(M.E[M.E.length-1])-12,T.ink,'right','bottom',MONO);
      if(done){const i=peaks()[rds()];label(ctx,'highest hill = slow step',P.X((i)/(M.E.length-1)),P.Y(M.E[i])-34,T.hot,'center','bottom',MONO);}
      ball2(ctx,P.X(u),P.Y(f(u))-8,8,u<.99?'#3E7BDC':'#2FA36B');},
    drag(kind,e,c){if(kind!=='down')return;const [x,y]=ptr(e,c),w=c.clientWidth,bx=50,bw=w-66,xx=(x-bx)/bw,n=M.E.length-1;let best=-1,bd=.2;peaks().forEach((i,k)=>{const d=Math.abs(i/n-xx);if(d<bd){bd=d;best=k;}});if(best<0)return;
      guess=best;done=true;const ok=best===rds();$('#mc-fb').textContent=ok?`Yes: the tallest hill is the slowest step. That is step ${best+1}: ${M.steps[best][0]}.`:`Not quite. Compare the heights: the highest hill is the slowest step (step ${rds()+1}).`;$('#mc-fb').className='small '+(ok?'ok':'');steps();sim.render();}});
  sel.addEventListener('change',load);$('#mc-go').addEventListener('click',()=>{roll=true;u=0;wait=0;sim.render();});$('#mc-lab').addEventListener('labreset',load);
  /* derivation */
  let dr=0;function mrender(){setText('mr-net',M.net);$('#mr-out').innerHTML=M.der.slice(0,dr).map(s=>`<li>${s}</li>`).join('');setText('mr-rate',dr>=M.der.length?M.rate.replace('rate = ',''):'?');setText('mr-ord',dr>=M.der.length?String(M.ord):'?');
    $('#mr-back').disabled=dr===0;$('#mr-next').textContent=dr>=M.der.length?'Start over':'Next step';}
  $('#mr-next').addEventListener('click',()=>{dr=dr>=M.der.length?0:dr+1;mrender();});$('#mr-back').addEventListener('click',()=>{dr=Math.max(0,dr-1);mrender();});
  /* species */
  const RL=['unlabeled','reactant','product','intermediate','catalyst'];let lab={};
  function msInit(){lab={};M.sp.forEach(s=>lab[s[0]]=0);msRender();$('#mq-fb').textContent='Tap a species to cycle: reactant, product, intermediate, catalyst. Then press Check.';$('#mq-fb').className='small';}
  function msRender(res){$('#mq-chips').innerHTML=M.sp.map(s=>{const L=lab[s[0]],c=L?MC_COL[RL[L]]:'';const st=res===undefined?'':(RL[L]===s[1]?'outline:2px solid #2FA36B':'outline:2px solid #E5484D');return `<button type="button" class="chip-d" data-s="${s[0]}" style="${c?'border-color:'+c+';':''}${st}"><b>${s[0]}</b><small style="${c?'color:'+c:''}">${RL[L]}</small></button>`;}).join('');}
  $('#mq-chips').addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(!b)return;lab[b.dataset.s]=(lab[b.dataset.s]+1)%5;msRender();});
  $('#mq-check').addEventListener('click',()=>{const bad=M.sp.filter(s=>RL[lab[s[0]]]!==s[1]);msRender(1);const f=$('#mq-fb');f.textContent=bad.length?`${M.sp.length-bad.length} of ${M.sp.length} correct. Remember: an intermediate is made then used up; a catalyst is used then regenerated.`:'All correct!';f.className='small '+(bad.length?'':'ok');});
  $('#mr-lab').addEventListener('labreset',()=>{dr=0;mrender();});$('#mq-lab').addEventListener('labreset',msInit);
  load();drawers.mechanism=()=>sim.render();
  TIPS['mc-sel']='Each mechanism is a list of elementary steps; their sum is the overall reaction.';
  KEYS['mc-canvas']=['Tap the highest hill, then press Roll the ball.',[['hot','transition state'],['#8B5CF6','intermediate']]];
  GLOSS['elementary step']='A single molecular event (one collision or breakup); its rate law follows from its coefficients.';
  GLOSS['intermediate']='A species made in one step of a mechanism and used up in a later one.';
  GLOSS['rate-determining step']='The slowest elementary step; it sets the overall reaction rate.';
  GLOSS['molecularity']='The number of particles that collide in an elementary step.';
  TT.mechanism='Use the sandwich-shop analogy. Common exam move: given a mechanism, students must remove intermediates from the rate law.';
})();
(function(){
  PROBS.push({id:'mech-rate',topic:'mechanism',title:'Rate law from a mechanism',gen(){const m=pick(MECH.slice(0,5)),ch=[m.rate,...m.wrongR],i=Math.floor(Math.random()*4);ch.splice(0,1);ch.splice(i,0,m.rate);
    return {q:`A proposed mechanism for ${m.net}:<br>${m.steps.map((s,j)=>`Step ${j+1} (${s[1]==='eq'?'fast equilibrium':s[1]}): ${s[0]}`).join('<br>')}<br>Which rate law does it predict?`,choices:ch,ans:i,hint:'Find the slow step, write its rate from its coefficients, then replace any intermediate using the fast step before it.',sol:`<b>${m.rate}</b>.<br>${m.der.join(' ')}`};}});
  PROBS.push({id:'mech-net',topic:'mechanism',title:'Overall reaction from the steps',gen(){const m=pick(MECH.slice(0,4)),ch=[m.net,...m.wrongN],i=Math.floor(Math.random()*4);ch.splice(0,1);ch.splice(i,0,m.net);
    return {q:`A mechanism has these steps:<br>${m.steps.map((s,j)=>`Step ${j+1}: ${s[0]}`).join('<br>')}<br>What is the overall reaction?`,choices:ch,ans:i,hint:'Add the steps, then cancel any species that appears on both sides.',sol:`Adding and cancelling gives <b>${m.net}</b>.`};}});
  PROBS.push({id:'mech-species',topic:'mechanism',title:'Intermediate or catalyst?',gen(){const role=pick(['intermediate','catalyst']),ms=MECH.filter(m=>m.sp.some(s=>s[1]===role)),m=pick(ms),ans=m.sp.find(s=>s[1]===role)[0];
    const others=m.sp.filter(s=>s[1]!==role).map(s=>s[0]).sort(()=>Math.random()-.5).slice(0,3),ch=[...others];const i=Math.floor(Math.random()*(ch.length+1));ch.splice(i,0,ans);
    return {q:`In the mechanism for ${m.net}:<br>${m.steps.map((s,j)=>`Step ${j+1}: ${s[0]}`).join('<br>')}<br>Which species is a${role==='intermediate'?'n':''} ${role}?`,choices:ch,ans:i,hint:role==='intermediate'?'An intermediate is produced in one step and consumed in a later one.':'A catalyst is consumed in one step and regenerated in a later one.',sol:`<b>${ans}</b> is the ${role}: ${role==='intermediate'?'it is made in one step and used up in another':'it is used in one step and re-formed in another'}, so it is absent from the overall reaction.`};}});
  const EL=[['A + B → products',2],['2A → products',2],['A → products',1],['2NO + Cl₂ → 2NOCl',3],['NO + O₃ → NO₂ + O₂',2],['2NO₂ → N₂O₄',2],['O₃ → O₂ + O',1],['A + 2B → products',3]];
  PROBS.push({id:'mech-elem',topic:'mechanism',title:'Overall order of an elementary step',gen(){const [eq,n]=pick(EL);
    return {q:`The reaction ${eq} is a single elementary step. What is the overall order of its rate law?`,ans:n,unit:'',abs:.01,hint:'For an elementary step, each reactant\'s order equals its coefficient. Add them.',sol:`The orders equal the reactant coefficients, which add to <b>${n}</b>.`};}});
})();
