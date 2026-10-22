
/* ---------------- Reaction rates & rate laws ---------------- */
const KUNIT=n=>({0:'M/s',1:'s⁻¹',2:'M⁻¹s⁻¹',3:'M⁻²s⁻¹'})[n];
(function rates(){
  const cv=$('#rt-canvas');if(!cv)return;
  const CA='#3E7BDC',CB='#14A5A5',CP='#2FA36B',H=240;
  const type=$('#rt-type');let P=[],hist=[],evs=[],run=false,tt=0,flash=[];
  const LAW={first:'rate = k[A]',second:'rate = k[A]²',ab:'rate = k[A][B]'};
  function fill(){const w=cv.clientWidth||300,nA=+$('#rt-a').value,nB=type.value==='ab'?+$('#rt-b').value:0;P=[];
    for(let i=0;i<nA+nB;i++)P.push({k:i<nA?'A':'B',x:12+Math.random()*(w-24),y:12+Math.random()*(H-24),a:Math.random()*6.28});
    P.forEach(p=>{const s=70+Math.random()*50;p.vx=Math.cos(p.a)*s;p.vy=Math.sin(p.a)*s;});hist=[];evs=[];flash=[];tt=0;}
  const cnt=k=>P.filter(p=>p.k===k).length;
  function react(a,b,t){a.k='P';a.x=(a.x+b.x)/2;a.y=(a.y+b.y)/2;b.dead=true;evs.push(t);flash.push({x:a.x,y:a.y,l:.5});}
  const sim=sim2d(cv,{h:()=>H,step(dt){if(!run)return;const w=cv.clientWidth;tt+=dt;
      P.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.x<6){p.x=6;p.vx=Math.abs(p.vx);}if(p.x>w-6){p.x=w-6;p.vx=-Math.abs(p.vx);}if(p.y<6){p.y=6;p.vy=Math.abs(p.vy);}if(p.y>H-6){p.y=H-6;p.vy=-Math.abs(p.vy);}});
      if(type.value==='first'){P.forEach(p=>{if(p.k==='A'&&Math.random()<.25*dt){p.k='P';evs.push(tt);flash.push({x:p.x,y:p.y,l:.5});}});}
      else{const need=type.value==='second'?['A','A']:['A','B'];for(let i=0;i<P.length;i++){const a=P[i];if(a.dead||a.k!==need[0])continue;for(let j=type.value==='second'?i+1:0;j<P.length;j++){const b=P[j];if(b===a||b.dead||b.k!==need[1])continue;
        if(Math.hypot(a.x-b.x,a.y-b.y)<13&&Math.random()<.4){react(a,b,tt);break;}}}P=P.filter(p=>!p.dead);}
      flash.forEach(f=>f.l-=dt);flash=flash.filter(f=>f.l>0);
      if(!hist.length||tt-hist[hist.length-1].t>.25)hist.push({t:tt,A:cnt('A'),B:cnt('B'),P:cnt('P')});
      while(evs.length&&tt-evs[0]>4)evs.shift();
      setText('rt-na',String(cnt('A')));setText('rt-np',String(cnt('P')));setText('rt-ev',String(evs.length));},
    draw(ctx,w,h){ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.strokeRect(1,1,w-2,H-2);
      P.forEach(p=>ball2(ctx,p.x,p.y,5.5,p.k==='A'?CA:p.k==='B'?CB:CP));
      flash.forEach(f=>{ctx.strokeStyle=alpha(CP,f.l*1.6);ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,f.y,6+(.5-f.l)*50,0,7);ctx.stroke();});
      label(ctx,'A',10,H+14,CA,'left','middle',MONO);if(type.value==='ab')label(ctx,'B',34,H+14,CB,'left','middle',MONO);label(ctx,'P',type.value==='ab'?58:34,H+14,CP,'left','middle',MONO);}});
  const g=$('#rt-graph'),sg=sim2d(g,{h:()=>H+24,draw(ctx,w,h){const tmax=Math.max(20,tt*1.1),nmax=Math.max(+$('#rt-a').value,type.value==='ab'?+$('#rt-b').value:0,10)+(type.value==='ab'?0:0);
      const Pn=panel(ctx,{x:40,y:12,w:w-54,h:h-48},[0,tmax],[0,nmax*1.08],{xn:4,yn:4,xlabel:'time (s)',ylabel:'particles',color:T.ink});
      const ser=[['A',CA],['P',CP]];if(type.value==='ab')ser.push(['B',CB]);
      ser.forEach(([k,c])=>{ctx.save();clip(ctx,Pn);ctx.strokeStyle=c;ctx.lineWidth=2.2;ctx.beginPath();hist.forEach((q,i)=>{const px=Pn.X(q.t),py=Pn.Y(q[k]);i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();ctx.restore();});}});
  function reset(){const two=type.value==='ab';$('#rt-bbox').hidden=!two;fill();run=false;$('#rt-go').textContent='Start';setText('rt-law',LAW[type.value]);setText('rt-na',String(cnt('A')));setText('rt-np','0');setText('rt-ev','0');sim.render();sg.render();}
  bindRange('rt-a',x=>x+'',()=>{if(!run)reset();},false);bindRange('rt-b',x=>x+'',()=>{if(!run)reset();},false);
  type.addEventListener('change',reset);$('#rt-new').addEventListener('click',reset);
  $('#rt-go').addEventListener('click',()=>{run=!run;$('#rt-go').textContent=run?'Pause':'Resume';sim.render();});
  $('#rt-lab').addEventListener('labreset',reset);
  reset();drawers.rates=()=>{sim.render();sg.render();};
  /* detective */
  let HID=null;
  function newExp(){const m=pick([0,1,1,2]),n=pick([0,1,1,2]),k=pick([.5,1.5,2.5,.02,.15,4]);HID={m,n,k};
    const t=[[.10,.10],[.20,.10],[.10,.20],[.20,.20]],o=pick([0,1]);if(o){t[3]=[.30,.10];t[2]=[.10,.30];}
    const rows=t.map(([a,b],i)=>`<tr><td>${i+1}</td><td>${a.toFixed(2)}</td><td>${b.toFixed(2)}</td><td><b>${sci(k*a**m*b**n,2)}</b></td></tr>`).join('');
    $('#ir-tab').innerHTML=`<thead><tr><th>Trial</th><th>[A] (M)</th><th>[B] (M)</th><th>Rate (M/s)</th></tr></thead><tbody>${rows}</tbody>`;$('#ir-fb').textContent='Compare two trials where only one concentration changes. By what factor did the rate change?';$('#ir-fb').className='small';}
  $('#ir-new').addEventListener('click',newExp);
  $('#ir-check').addEventListener('click',()=>{const m=+$('#ir-m').value,n=+$('#ir-n').value,f=$('#ir-fb');
    if(m===HID.m&&n===HID.n){f.textContent=`Yes: rate = k[A]${HID.m===0?'⁰':HID.m===1?'':'²'}[B]${HID.n===0?'⁰':HID.n===1?'':'²'}, and k = ${sci(HID.k)} ${KUNIT(HID.m+HID.n)}.`;f.className='small ok';}
    else{f.textContent=(m===HID.m?'Your order in A is right. ':'Recheck A: compare two trials where only [A] changes. ')+(n===HID.n?'Your order in B is right.':'Recheck B: compare two trials where only [B] changes.');f.className='small';}});
  newExp();
  TIPS['rt-type']='The type fixes the rate law: the exponents say how many particles must meet.';
  TIPS['rt-a']='More particles means a more crowded box; watch how the reaction count responds.';
  TIPS['rt-b']='B is a second reactant; each A + B encounter can make a product.';
  KEYS['rt-canvas']=['Blue = A, teal = B, green = product. A ring marks each reaction.',[['#3E7BDC','A'],['#14A5A5','B'],['#2FA36B','product']]];
  GLOSS['rate law']='An equation giving rate in terms of reactant concentrations, rate = k[A]^m[B]^n.';
  GLOSS['rate constant']='The proportionality constant k in the rate law; it depends on temperature.';
  GLOSS['order']='The exponent of a concentration in the rate law.';
  TT.rates='Have students predict the reaction count before changing a slider. The "orders are not coefficients" point comes up again in mechanisms.';
})();
(function(){
  const pw=(m)=>m===0?'':m===1?'[A]':'[A]²';
  PROBS.push({id:'rt-order',topic:'rates',title:'Order from two trials',gen(){const m=pick([0,1,2]),f=pick([2,3]),k=pick([.5,1.2,3.5,.04])*1e-3,a=pick([.10,.15,.20]),r1=k*a**m,r2=k*(a*f)**m;
    return {q:`For A → products, [A] = ${fmt(a,2)} M gives an initial rate of ${sci(r1,3)} M/s and [A] = ${fmt(a*f,2)} M gives ${sci(r2,3)} M/s. What is the order in A?`,ans:m,unit:'',abs:.01,hint:'Divide the two rates, and ask what power of the concentration ratio gives that factor.',sol:`Rate ratio = ${fmt(r2/r1,2)} and concentration ratio = ${f}; ${f}<sup>m</sup> = ${fmt(r2/r1,2)}, so m = <b>${m}</b>.`};}});
  PROBS.push({id:'rt-k',topic:'rates',title:'Rate constant from data',gen(){const m=pick([1,1,2]),n=pick([0,1,1]),a=pick([.10,.20,.25,.50]),b=pick([.10,.30,.40]),k=pick([.5,1.5,2.5,4,12]),r=+(k*a**m*b**n).toPrecision(3),kk=r/(a**m*b**n);
    return {q:`The rate law for a reaction is rate = k[A]${m>1?'²':''}${n===0?'':n===1?'[B]':'[B]²'}. At [A] = ${fmt(a,2)} M${n?` and [B] = ${fmt(b,2)} M`:''}, the rate is ${sci(r,3)} M/s. What is k? (units: ${KUNIT(m+n)})`,ans:kk,unit:KUNIT(m+n),tol:.02,hint:'Rearrange: k = rate ÷ (the concentrations raised to their orders).',sol:`k = ${sci(r,3)} ÷ (${fmt(a,2)}${m>1?'²':''}${n?` × ${fmt(b,2)}`:''}) = <b>${sci(kk,3)} ${KUNIT(m+n)}</b>.`};}});
  PROBS.push({id:'rt-units',topic:'rates',title:'Units of k',gen(){const N=pick([0,1,2,3]);const ch=['M/s','s⁻¹','M⁻¹s⁻¹','M⁻²s⁻¹'];
    return {q:`A reaction has an overall order of ${N}. What are the units of its rate constant k?`,choices:ch,ans:N,hint:'k has units of M^(1−N) per second.',sol:`Rate (M/s) = k·M<sup>${N}</sup>, so k = M<sup>${1-N}</sup>s⁻¹ = <b>${ch[N]}</b>.`};}});
  PROBS.push({id:'rt-rate',topic:'rates',title:'Rate from the rate law',gen(){const m=pick([1,2]),n=pick(m===1?[0,1,2]:[0,1]),k=pick([.5,2.5,.04,15]),a=pick([.10,.25,.50]),b=pick([.10,.20,.60]),r=k*a**m*b**n;
    return {q:`For rate = k[A]${m>1?'²':''}${n===0?'':n===1?'[B]':'[B]²'} with k = ${fmt(k,2)} ${KUNIT(m+n)}, find the rate when [A] = ${fmt(a,2)} M${n?` and [B] = ${fmt(b,2)} M`:''}.`,ans:r,unit:'M/s',tol:.02,hint:'Plug the concentrations in and raise each to its order.',sol:`rate = ${fmt(k,2)} × ${fmt(a,2)}${m>1?'²':''}${n?` × ${fmt(b,2)}${n>1?'²':''}`:''} = <b>${sci(r,3)} M/s</b>.`};}});
})();
