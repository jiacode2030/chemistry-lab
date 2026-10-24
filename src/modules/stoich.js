
/* ---------------- Stoichiometry & limiting reagent ---------------- */
const ST_RX=[{r:['N2','H2'],p:['NH3'],c:[1,3,2]},{r:['H2','O2'],p:['H2O'],c:[2,1,2]},{r:['Na','Cl2'],p:['NaCl'],c:[2,1,2]},{r:['CH4','O2'],p:['CO2','H2O'],c:[1,2,1,2]},{r:['Mg','O2'],p:['MgO'],c:[2,1,2]},{r:['Fe','O2'],p:['Fe2O3'],c:[4,3,2]}];
const MM_=f=>molarMass(f).M;
(function stoich(){
  const cv=$('#st-canvas');if(!cv)return;
  const sel=$('#st-sel');sel.innerHTML=ST_RX.slice(0,4).map((x,i)=>`<option value="${i}">${eqSide(x.r,x.c.slice(0,x.r.length))} → ${eqSide(x.p,x.c.slice(x.r.length))}</option>`).join('');
  let X=ST_RX[0],n=[4,6],step=0,flight=null,running=false,fT=0;const MOLP=.5;
  const co=x=>x.c;const nr=()=>X.r.length;
  const ext=()=>Math.floor(Math.min(n[0]/X.c[0],n[1]/X.c[1])+1e-9);
  const yieldP=()=>+$('#st-y').value/100;
  const theory=j=>ext()*X.c[nr()+j];
  const actual=j=>Math.round(theory(j)*yieldP());
  function load(){X=ST_RX[+sel.value];const A=$('#st-a'),B=$('#st-b');A.max=12;B.max=24;n=[+A.value,+B.value];$('#st-al').innerHTML=fsub(X.r[0])+' (particles)';$('#st-bl').innerHTML=fsub(X.r[1])+' (particles)';reset();}
  function reset(){step=0;flight=null;running=false;n=[+$('#st-a').value,+$('#st-b').value];$('#st-a-out').textContent=n[0];$('#st-b-out').textContent=n[1];$('#st-y-out').textContent=$('#st-y').value+' %';table();sim.render();}
  /* fixed slots so molecules do not re-layout while reacting */
  function slots(){const w=cv.clientWidth,h=cv.clientHeight||300,pw=w/2-26,ph=h-36;const L=[];X.r.forEach((f,i)=>{for(let k=0;k<n[i];k++)L.push({f,s:i,k});});const P=[];X.p.forEach((f,j)=>{for(let k=0;k<theory(j);k++)P.push({f,s:j,k});});
    const mk=(list,x0)=>{const m=list.length||1,cols=Math.max(1,Math.ceil(Math.sqrt(m*pw/ph))),rows=Math.ceil(m/cols),cell=Math.min(pw/cols,ph/rows);list.forEach((o,i)=>{o.x=x0+(i%cols+.5)*pw/cols;o.y=26+(Math.floor(i/cols)+.5)*ph/rows;o.u=clamp(cell/3,6,22);});};
    mk(L,10);mk(P,w/2+16);const u=Math.min(...[...L,...P].map(o=>o.u),22);L.forEach(o=>o.u=u);P.forEach(o=>o.u=u);return {L,P,w,h,pw,ph};}
  const sim=sim2d(cv,{h:w=>clamp(w*.5,260,330),step(dt){if(!running)return;if(flight===null){if(step>=ext()){running=false;table();return;}flight=0;}else{flight+=dt/.55;if(flight>=1){flight=null;step++;table();}}},
    draw(ctx,w,h){const S=slots(),u=S.L.length+S.P.length?Math.min(S.L[0]?.u||22,S.P[0]?.u||22):16;label(ctx,'reactants',10+S.pw/2,10,T.cx,'center','middle','600 12px "IBM Plex Mono",monospace');label(ctx,'products',w/2+16+S.pw/2,10,T.cv,'center','middle','600 12px "IBM Plex Mono",monospace');
      ctx.strokeStyle=T.line;ctx.setLineDash([4,4]);ctx.strokeRect(10,26,S.pw,S.ph);ctx.strokeRect(w/2+16,26,S.pw,S.ph);ctx.setLineDash([]);arrow(ctx,w/2-16,h/2,w/2+10,h/2,T.ink,3);
      const used=[0,0];X.r.forEach((f,i)=>{used[i]=step*X.c[i];});const fl=flight!=null;const usedNext=[0,0];if(fl)X.r.forEach((f,i)=>{usedNext[i]=(step+1)*X.c[i];});
      const flyFrom={};S.L.forEach(o=>{const left=n[o.s]-used[o.s];const idx=o.k;const gone=idx>=left;if(!gone){const goingNow=fl&&idx>=n[o.s]-usedNext[o.s];if(goingNow){molAtoms(o.f).atoms.forEach(a=>{(flyFrom[a.e]=flyFrom[a.e]||[]).push([o.x+a.x*o.u,o.y+a.y*o.u]);});}else drawMol2D(ctx,o.f,o.x,o.y,o.u);}});
      const made=X.p.map((f,j)=>Math.min(step*X.c[nr()+j],yieldP()<1?actual(j):1e9));const newSlots=[];
      S.P.forEach(o=>{const sh=o.k<made[o.s];if(sh)drawMol2D(ctx,o.f,o.x,o.y,o.u);else if(fl&&o.k<(step+1)*X.c[nr()+o.s]&&(yieldP()>=1||o.k<actual(o.s)))newSlots.push(o);else if(o.k<theory(o.s)&&step>=ext()&&ext()>0&&yieldP()<1)drawMol2D(ctx,o.f,o.x,o.y,o.u,{alpha:.12});});
      if(fl){const to={};newSlots.forEach(o=>molAtoms(o.f).atoms.forEach(a=>{(to[a.e]=to[a.e]||[]).push([o.x+a.x*o.u,o.y+a.y*o.u]);}));const k=flight<.5?2*flight*flight:1-2*(1-flight)*(1-flight);
        Object.keys(flyFrom).forEach(e=>flyFrom[e].forEach((p,i)=>{const q=(to[e]||[])[i]||p;ball2(ctx,p[0]+(q[0]-p[0])*k,p[1]+(q[1]-p[1])*k-Math.sin(k*3.14)*16,u*(e==='H'?.3:.45),e2col(e),e==='H'?'rgba(0,0,0,.45)':null);}));}}});
  function table(){const e=ext(),done=step>=e&&e>=0&&!running,all=X.r.concat(X.p),cs=X.c,rows=[];
    all.forEach((f,i)=>{const isR=i<nr(),M=MM_(f),start=isR?n[i]:0,molS=start*MOLP,usedM=isR?e*cs[i]*MOLP:0,madeM=isR?0:e*cs[i]*MOLP;rows.push([fsub(f),M.toFixed(2),isR?start:'—',isR?fmt(molS,2):'—',isR?fmt(molS*M,1):'—',isR?fmt(usedM,2):'—',isR?fmt(molS-usedM,2):'—',isR?fmt((molS-usedM)*M,1):fmt(madeM*M,1)]);});
    $('#st-table').innerHTML='<thead><tr><th>Species</th><th>M (g/mol)</th><th>Start (particles)</th><th>Start (mol)</th><th>Start (g)</th><th>Used (mol)</th><th>Left (mol)</th><th>Left / made (g)</th></tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>`<td>${c}</td>`).join('')+'</tr>').join('')+'</tbody>';
    const ra=n[0]/cs[0],rb=n[1]/cs[1];const lim=ra===rb?'both (exact ratio)':ra<rb?fsub(X.r[0]):fsub(X.r[1]);setHTML('st-lim',n[0]===0||n[1]===0?(n[0]===0?fsub(X.r[0]):fsub(X.r[1])):lim);
    const left=X.r.map((f,i)=>({f,l:n[i]-e*cs[i]})).filter(o=>o.l>0);setHTML('st-left',left.length?left.map(o=>`${o.l} ${fsub(o.f)}`).join(', '):'nothing');
    const f0=X.p[0],th=e*cs[nr()]*MOLP*MM_(f0),ac=th*yieldP();setHTML('st-th',`${fmt(th,1)} g ${fsub(f0)}`);setHTML('st-ac',`${fmt(ac,1)} g (${Math.round(yieldP()*100)}%)`);}
  $('#st-go').addEventListener('click',()=>{if(ext()<1){setHTML('st-lim','not enough of one reactant');return;}step=0;flight=null;running=!REDUCE;if(REDUCE){step=ext();table();}sim.render();});
  $('#st-reset').addEventListener('click',reset);sel.addEventListener('change',load);
  ['st-a','st-b','st-y'].forEach(id=>$('#'+id).addEventListener('input',reset));
  load();drawers.stoich=()=>sim.render();
  TIPS['st-sel']='Read the coefficients as particle ratios.';
  TIPS['st-a']=TIPS['st-b']='Change how many of each reactant you start with. The one that runs out first is limiting.';
  TIPS['st-y']='Real reactions lose some product. The theoretical yield stays the same; the actual yield falls.';
  KEYS['st-canvas']=['Choose amounts and press Run.',[['cx','reactants'],['cv','products']]];
  GLOSS['limiting reagent']='The reactant that is used up first, which limits how much product can form.';
  GLOSS['theoretical yield']='The maximum amount of product that could form, calculated from the limiting reagent.';
  GLOSS['percent yield']='Actual yield divided by theoretical yield, times 100.';
  TT.stoich='Start with the sandwich analogy, then replace sandwiches with particles before introducing grams. The sequence "particles → moles → grams" is how to scaffold a mass problem.';
})();
(function(){
  const pickR=()=>pick(ST_RX);
  function setup(){const X=pickR(),a=ri(30,400)/10,b=ri(30,400)/10,Ma=MM_(X.r[0]),Mb=MM_(X.r[1]),na=a/Ma,nb=b/Mb,ra=na/X.c[0],rb=nb/X.c[1],limI=ra<rb?0:1,xi=Math.min(ra,rb);return {X,a,b,Ma,Mb,na,nb,limI,xi};}
  const eq=X=>`${eqSide(X.r,X.c.slice(0,X.r.length))} → ${eqSide(X.p,X.c.slice(X.r.length))}`;
  PROBS.push({id:'st-limiting',topic:'stoich',title:'Which is the limiting reagent?',gen(){const s=setup(),X=s.X;
    return {q:`${eq(X)}. A mixture contains ${s.a.toFixed(1)} g of ${fsub(X.r[0])} and ${s.b.toFixed(1)} g of ${fsub(X.r[1])}. Which is the limiting reagent? (Use molar masses from the periodic table.)`,choices:X.r.map(fsub),ans:s.limI,hint:'Convert both masses to moles, divide each by its coefficient, and compare: the smaller number is limiting.',
      sol:`${fsub(X.r[0])}: ${s.a.toFixed(1)} ÷ ${s.Ma.toFixed(2)} = ${s.na.toFixed(3)} mol ÷ ${X.c[0]} = ${(s.na/X.c[0]).toFixed(3)}; ${fsub(X.r[1])}: ${s.b.toFixed(1)} ÷ ${s.Mb.toFixed(2)} = ${s.nb.toFixed(3)} mol ÷ ${X.c[1]} = ${(s.nb/X.c[1]).toFixed(3)}. The smaller is <b>${fsub(X.r[s.limI])}</b>.`};}});
  PROBS.push({id:'st-theory',topic:'stoich',title:'Theoretical yield',gen(){const s=setup(),X=s.X,Mp=MM_(X.p[0]),ans=s.xi*X.c[X.r.length]*Mp;
    return {q:`${eq(X)}. ${s.a.toFixed(1)} g of ${fsub(X.r[0])} reacts with ${s.b.toFixed(1)} g of ${fsub(X.r[1])}. What is the theoretical yield of ${fsub(X.p[0])}, in grams?`,ans,unit:'g',tol:.02,hint:'Find the limiting reagent first, then use its moles and the mole ratio to get moles of product, then grams.',
      sol:`Limiting reagent: ${fsub(X.r[s.limI])}. Moles of ${fsub(X.p[0])} = ${s.xi.toFixed(4)} × ${X.c[X.r.length]} = ${(s.xi*X.c[X.r.length]).toFixed(4)} mol; × ${Mp.toFixed(2)} g/mol = <b>${fmt(ans,2)} g</b>.`};}});
  PROBS.push({id:'st-excess',topic:'stoich',title:'Excess reactant left over',gen(){const s=setup(),X=s.X,ex=1-s.limI,used=s.xi*X.c[ex]*(ex?MM_(X.r[1]):MM_(X.r[0])),have=ex?s.b:s.a,ans=have-used;
    return {q:`${eq(X)}. ${s.a.toFixed(1)} g of ${fsub(X.r[0])} reacts with ${s.b.toFixed(1)} g of ${fsub(X.r[1])}. How many grams of the excess reactant remain after the reaction is complete?`,ans,unit:'g',abs:Math.max(.05,Math.abs(have)*.02),hint:'Find the moles of excess reactant that the limiting reagent uses, convert to grams, and subtract from what you started with.',
      sol:`${fsub(X.r[s.limI])} is limiting. The reaction uses ${s.xi.toFixed(4)} × ${X.c[ex]} = ${(s.xi*X.c[ex]).toFixed(4)} mol of ${fsub(X.r[ex])}, which is ${used.toFixed(2)} g. Left: ${have.toFixed(1)} − ${used.toFixed(2)} = <b>${fmt(ans,2)} g</b>.`};}});
  PROBS.push({id:'st-percent',topic:'stoich',title:'Percent yield',gen(){const s=setup(),X=s.X,Mp=MM_(X.p[0]),th=s.xi*X.c[X.r.length]*Mp,act=+(th*ri(55,96)/100).toFixed(2),pct=act/th*100;
    return {q:`${eq(X)}. From ${s.a.toFixed(1)} g of ${fsub(X.r[0])} and ${s.b.toFixed(1)} g of ${fsub(X.r[1])}, a student collects ${fmt(act,2)} g of ${fsub(X.p[0])}. What is the percent yield?`,ans:pct,show:fmt(pct,1),unit:'%',tol:.025,hint:'Percent yield = actual ÷ theoretical × 100. Find the theoretical yield from the limiting reagent.',
      sol:`Theoretical yield = ${th.toFixed(2)} g (from the limiting reagent ${fsub(X.r[s.limI])}). Percent yield = ${act.toFixed(2)} / ${th.toFixed(2)} × 100 = <b>${fmt(pct,1)}%</b>.`};}});
})();
