
/* ---------------- Integrated rate laws ---------------- */
const IGK={0:{min:.002,max:.02,u:'M/s'},1:{min:.01,max:.1,u:'s⁻¹'},2:{min:.01,max:.1,u:'M⁻¹s⁻¹'}};
const igA=(o,k,t,A0=1)=>o===0?Math.max(0,A0-k*t):o===1?A0*Math.exp(-k*t):1/(1/A0+k*t);
const igHL=(o,k,A0=1)=>o===0?A0/(2*k):o===1?Math.LN2/k:1/(k*A0);
function igPanels(ctx,w,h,pts,fnA,hi,tm){const names=['[A] (M)','ln[A]','1/[A] (1/M)'],tr=[A=>A,A=>Math.log(A),A=>1/A],hh=(h-16)/3;
  for(let i=0;i<3;i++){const box={x:52,y:8+i*(hh+4),w:w-66,h:hh-22};let yr;const vals=pts.map(p=>tr[i](p.A));const lo=Math.min(...vals),hi2=Math.max(...vals),pad=(hi2-lo)*.12||.1;yr=i===0?[0,1.05]:[lo-pad,hi2+pad];
    const P=panel(ctx,box,[0,tm||Math.max(...pts.map(p=>p.t))*1.04||100],yr,{xn:5,yn:3,ylabel:names[i],xlabel:i===2?'time (s)':'',color:T.ink});
    if(hi===i){ctx.strokeStyle=T.cv;ctx.lineWidth=2.5;ctx.strokeRect(box.x-1,box.y-1,box.w+2,box.h+2);}
    ctx.save();clip(ctx,P);if(fnA){ctx.strokeStyle=T.cx;ctx.lineWidth=2.4;ctx.beginPath();pts.forEach((p,j)=>{const px=P.X(p.t),py=P.Y(tr[i](p.A));j?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();}
    else pts.forEach(p=>dot(ctx,P.X(p.t),P.Y(tr[i](p.A)),3.6,T.cx));ctx.restore();
}}
(function integrated(){
  const cv=$('#ig-jar');if(!cv)return;
  const ord=$('#ig-ord'),kS=$('#ig-k'),tS=$('#ig-t');let play=false,drops=[],P=[];
  const O=()=>+ord.value,K=()=>{const r=IGK[O()];return r.min+(r.max-r.min)*(+kS.value-1)/9;};
  const A=t=>igA(O(),K(),t);
  function mk(){const w=cv.clientWidth||300;P=[];for(let i=0;i<100;i++)P.push({x:16+Math.random()*(w-32),y:40+Math.random()*(260-60),r:Math.random(),vx:(Math.random()-.5)*40,vy:(Math.random()-.5)*40});}
  const jar=sim2d(cv,{h:()=>280,step(dt){if(play){tS.value=Math.min(100,+tS.value+dt*8);if(+tS.value>=100){play=false;$('#ig-play').textContent='Play';}upd();}const w=cv.clientWidth;
      P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<10||p.x>w-10)p.vx*=-1;if(p.y<30||p.y>270)p.vy*=-1;p.x=clamp(p.x,10,w-10);p.y=clamp(p.y,30,270);});},
    draw(ctx,w,h){const frac=A(+tS.value),nAlive=Math.round(frac*100);ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(1,24,w-2,h-26);label(ctx,'jar of A',8,12,T.muted,'left','middle',MONO);
      const sorted=P.slice().sort((a,b)=>a.r-b.r);sorted.forEach((p,i)=>{if(i<nAlive)ball2(ctx,p.x,p.y,5.5,'#3E7BDC');else ball2(ctx,p.x,p.y,4,alpha('#2FA36B',.28));});
      label(ctx,nAlive+' of 100 left',w-8,12,T.ink,'right','middle',MONO);}});
  const g=$('#ig-graph'),gs=sim2d(g,{h:()=>290,draw(ctx,w,h){const pts=[];for(let t=0;t<=100;t+=2){const a=A(t);if(a>.012)pts.push({t,A:a});}
      igPanels(ctx,w,h,pts,true,O(),104);const tmax=104;
      const x=52+(w-66)*(+tS.value/tmax);ctx.strokeStyle=T.hot;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(x,8);ctx.lineTo(x,h-18);ctx.stroke();ctx.setLineDash([]);}});
  function upd(){const t=+tS.value,a=A(t),hl=igHL(O(),K());setText('ig-k-out',fmt(K(),O()===0?3:3)+' '+IGK[O()].u);setText('ig-t-out',fmt(t,1)+' s');setText('ig-A',fmt(a,3)+' M');setText('ig-hl',fmt(hl,1)+' s'+(O()===1?' (constant)':O()===0?' (first one)':' (first one)'));setText('ig-fr',fmt(a*100,1)+'%');setText('ig-sl',['[A] vs t','ln[A] vs t','1/[A] vs t'][O()]);jar.render();gs.render();}
  ord.addEventListener('change',()=>{kS.value=5;upd();});bindRange('ig-k',()=>'',upd,false);bindRange('ig-t',()=>'',upd,false);
  $('#ig-play').addEventListener('click',()=>{if(+tS.value>=100)tS.value=0;play=!play;$('#ig-play').textContent=play?'Pause':'Play';upd();});
  $('#ig-lab').addEventListener('labreset',()=>{play=false;$('#ig-play').textContent='Play';upd();});
  mk();upd();drawers.integrated=upd;
  /* mystery */
  const mc=$('#my-canvas');let MY=null;
  const mys=sim2d(mc,{h:()=>300,draw(ctx,w,h){if(MY)igPanels(ctx,w,h,MY.pts,false,null);}});
  function newMy(){const o=pick([0,1,2]),k=IGK[o].min+(IGK[o].max-IGK[o].min)*Math.random()*.7+IGK[o].max*.2,pts=[];for(let t=0;t<=60;t+=10){const a=igA(o,k,t);if(a>.03)pts.push({t,A:a*(1+(Math.random()-.5)*.012)});}MY={o,pts};$('#my-fb').textContent='Which of the three graphs is a straight line? Its order is the answer.';$('#my-fb').className='small';mys.render();}
  $('#my-new').addEventListener('click',newMy);
  $('#my-check').addEventListener('click',()=>{const f=$('#my-fb'),a=+$('#my-sel').value;f.textContent=a===MY.o?['Yes: [A] vs t is the straight line, so the order is zero.','Yes: ln[A] vs t is the straight line, so the order is one.','Yes: 1/[A] vs t is the straight line, so the order is two.'][a]:'Not quite. Look again for the graph with no curve in it.';f.className='small '+(a===MY.o?'ok':'');});
  newMy();
  TIPS['ig-ord']='Zero, first and second order each give a different decay shape and a different straight-line graph.';
  TIPS['ig-k']='A larger k means a faster reaction and a shorter half-life.';
  TIPS['ig-t']='Drag time and watch the jar, the readouts and the dashed marker on the graphs.';
  KEYS['ig-jar']=['Press Play, or drag the time slider.',[['#3E7BDC','A (reactant)'],['#2FA36B','products']]];
  GLOSS['half-life']='The time for the concentration of a reactant to fall to half its value.';
  GLOSS['integrated rate law']='An equation giving concentration as a function of time.';
  TT.integrated='Make students predict the shape of ln[A] vs t before showing it. The "only first-order half-lives are constant" fact is a favourite exam point.';
})();
(function(){
  PROBS.push({id:'int-first',topic:'integrated',title:'First order: amount left',gen(){const k=pick([.0020,.012,.035,.0085]),A0=pick([.40,.80,1.20,2.00]),kt=pick([.4,.8,1.2,1.8,2.4]),t=Math.round(kt/k/10)*10,A=A0*Math.exp(-k*t);
    return {q:`A first-order reaction has k = ${sci(k,2)} s⁻¹. Starting from ${fmt(A0,2)} M, what is [A] after ${t} s?`,ans:A,unit:'M',tol:.02,hint:'ln[A] = ln[A]₀ − kt, so [A] = [A]₀e^(−kt).',sol:`kt = ${sci(k,2)} × ${t} = ${fmt(k*t,3)}; [A] = ${fmt(A0,2)} × e<sup>−${fmt(k*t,3)}</sup> = <b>${sci(A,3)} M</b>.`};}});
  PROBS.push({id:'int-time',topic:'integrated',title:'First order: time to reach a value',gen(){const k=pick([.0030,.015,.045,.0007]),A0=pick([.50,1.00,2.00]),f=pick([.25,.40,.10,.60]),A=A0*f,t=Math.log(A0/A)/k;
    return {q:`A first-order reaction has k = ${sci(k,2)} s⁻¹. How long does it take for [A] to fall from ${fmt(A0,2)} M to ${fmt(A,3)} M?`,ans:t,unit:'s',tol:.02,hint:'Rearrange ln[A]₀/[A] = kt for t.',sol:`t = ln(${fmt(A0,2)}/${fmt(A,3)}) ÷ ${sci(k,2)} = ${fmt(Math.log(A0/A),3)} ÷ ${sci(k,2)} = <b>${sci(t,3)} s</b>.`};}});
  PROBS.push({id:'int-half',topic:'integrated',title:'First-order half-life',gen(){const k=pick([.0030,.0150,.045,.0007,.12]),t=Math.LN2/k;
    return {q:`A first-order reaction has k = ${sci(k,2)} s⁻¹. What is its half-life?`,ans:t,unit:'s',tol:.02,hint:'For first order, t½ = 0.693/k.',sol:`t½ = 0.693 ÷ ${sci(k,2)} = <b>${sci(t,3)} s</b>.`};}});
  PROBS.push({id:'int-nhalf',topic:'integrated',title:'Half-lives and fraction left',gen(){const th=pick([12,25,40,58,120]),n=pick([2,3,4,5]),A0=pick([.80,1.60,2.40]),A=A0/2**n;
    return {q:`A first-order reaction has a half-life of ${th} s. If [A]₀ = ${fmt(A0,2)} M, what is [A] after ${th*n} s?`,ans:A,unit:'M',tol:.02,hint:`How many half-lives is ${th*n} s? Halve the concentration once for each.`,sol:`${th*n} s ÷ ${th} s = ${n} half-lives, so [A] = ${fmt(A0,2)} ÷ 2<sup>${n}</sup> = <b>${fmt(A,4)} M</b>.`};}});
  PROBS.push({id:'int-second',topic:'integrated',title:'Second order: amount left',gen(){const A0=pick([.20,.40,.80,1.00]),k=pick([.020,.060,.15]),t=pick([20,50,100,150]),A=1/(1/A0+k*t);
    return {q:`A second-order reaction has k = ${fmt(k,3)} M⁻¹s⁻¹ and [A]₀ = ${fmt(A0,2)} M. What is [A] after ${t} s?`,ans:A,unit:'M',tol:.02,hint:'1/[A] = 1/[A]₀ + kt.',sol:`1/[A] = 1/${fmt(A0,2)} + (${fmt(k,3)})(${t}) = ${fmt(1/A,3)}, so [A] = <b>${fmt(A,4)} M</b>.`};}});
  PROBS.push({id:'int-zero',topic:'integrated',title:'Zero order: amount left',gen(){const A0=pick([.80,1.20,2.00]),k=pick([.004,.010,.020]),t=Math.round(A0*pick([.2,.4,.6,.8])/k/5)*5,A=A0-k*t;
    return {q:`A zero-order reaction has k = ${fmt(k,3)} M/s and [A]₀ = ${fmt(A0,2)} M. What is [A] after ${t} s?`,ans:A,unit:'M',tol:.02,hint:'[A] = [A]₀ − kt.',sol:`[A] = ${fmt(A0,2)} − (${fmt(k,3)})(${t}) = <b>${fmt(A,3)} M</b>.`};}});
  PROBS.push({id:'int-ident',topic:'integrated',title:'Order from the straight-line plot',gen(){const o=pick([0,1,2]),pl=['[A] vs t','ln[A] vs t','1/[A] vs t'],ch=['zero order','first order','second order'];
    return {q:`A student plots data for a reaction three ways. The graph of ${pl[o]} is a straight line and the other two curve. What is the order of the reaction?`,choices:ch,ans:o,hint:'Zero order: [A] vs t. First: ln[A] vs t. Second: 1/[A] vs t.',sol:`A straight line for ${pl[o]} means <b>${ch[o]}</b>.`};}});
  PROBS.push({id:'int-slope',topic:'integrated',title:'k from the slope',gen(){const k=pick([.0125,.034,.0071,.058]),A0=pick([.5,1.0]),t=pick([40,60,80]);
    return {q:`For a first-order reaction, a plot of ln[A] vs t (t in seconds) is a straight line with slope −${sci(k,3)}. What is the half-life?`,ans:Math.LN2/k,unit:'s',tol:.02,hint:'The slope equals −k. Then t½ = 0.693/k.',sol:`k = ${sci(k,3)} s⁻¹; t½ = 0.693 ÷ ${sci(k,3)} = <b>${sci(Math.LN2/k,3)} s</b>.`};}});
})();
