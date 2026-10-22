
/* ---------------- ICE tables ---------------- */
const ICR=[{t:'N₂O₄ ⇌ 2NO₂',R:[['N₂O₄',1]],P:[['NO₂',2]],K:.36,c0:.1},{t:'PCl₅ ⇌ PCl₃ + Cl₂',R:[['PCl₅',1]],P:[['PCl₃',1],['Cl₂',1]],K:.042,c0:.5},{t:'H₂ + I₂ ⇌ 2HI',R:[['H₂',1],['I₂',1]],P:[['HI',2]],K:50,c0:.5},{t:'A ⇌ B',R:[['A',1]],P:[['B',1]],K:.01,c0:.5},{t:'2HI ⇌ H₂ + I₂',R:[['HI',2]],P:[['H₂',1],['I₂',1]],K:.02,c0:.5}];
function icQ(r,c0,x){let n=1,d=1;r.P.forEach(([,c])=>n*=Math.pow(c*x,c));r.R.forEach(([,c])=>d*=Math.pow(c0-c*x,c));return n/d;}
function icXmax(r,c0){return Math.min(...r.R.map(([,c])=>c0/c));}
function icSolve(r,c0,K){let lo=0,hi=icXmax(r,c0)*(1-1e-12);for(let i=0;i<200;i++){const m=(lo+hi)/2;icQ(r,c0,m)<K?lo=m:hi=m;}return (lo+hi)/2;}
function icApprox(r,c0,K){let rhs=K,e=0,cp=1;r.R.forEach(([,c])=>rhs*=Math.pow(c0,c));r.P.forEach(([,c])=>{e+=c;cp*=Math.pow(c,c);});return Math.pow(rhs/cp,1/e);}
(function icecalc(){
  const cb=$('#ic-bars');if(!cb)return;const rs=$('#ic-rx'),kS=$('#ic-k'),cS=$('#ic-c0'),xS=$('#ic-x');rs.innerHTML=ICR.map((r,i)=>`<option value="${i}">${r.t}</option>`).join('');
  let r=ICR[0],anim=false,target=0;const K=()=>Math.pow(10,+kS.value),c0=()=>+cS.value,xmax=()=>icXmax(r,c0()),X=()=>+xS.value/1000*xmax();
  const bars=sim2d(cb,{h:()=>250,step(dt){if(!anim)return;const cur=+xS.value,tg=target/xmax()*1000;const d=tg-cur;if(Math.abs(d)<1){xS.value=tg;anim=false;}else xS.value=cur+d*Math.min(1,dt*4);upd();},
    draw(ctx,w,h){const sp=[...r.R.map(([n,c])=>({n,c,s:-1,i:c0()})),...r.P.map(([n,c])=>({n,c,s:1,i:0}))],mx=Math.max(c0(),...sp.map(s=>s.i+s.c*xmax()))*1.12,x=X(),bw=Math.min(60,(w-80)/sp.length-16),top=16,bh=h-60;const Y=v=>top+bh-bh*v/mx;
      ctx.strokeStyle=T.muted;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(40,top);ctx.lineTo(40,top+bh);ctx.lineTo(w-10,top+bh);ctx.stroke();label(ctx,'M',34,top,T.muted,'right','top',MONO);
      sp.forEach((s,k)=>{const cx=40+(w-50)*(k+.5)/sp.length,v=s.i+s.s*s.c*x,col=s.s<0?'#3E7BDC':'#2FA36B';ctx.fillStyle=col;ctx.fillRect(cx-bw/2,Y(v),bw,top+bh-Y(v));ctx.strokeStyle=T.ink;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.strokeRect(cx-bw/2,Y(s.i),bw,top+bh-Y(s.i));ctx.setLineDash([]);
        label(ctx,fmt(v,3),cx,Y(v)-6,T.ink,'center','bottom',MONO);label(ctx,s.n,cx,top+bh+14,T.ink,'center','middle',MONO);});}});
  const g=$('#ic-graph'),gs=sim2d(g,{h:()=>250,draw(ctx,w,h){const k=K(),xm=xmax(),lo=Math.log10(k)-4,hi=Math.log10(k)+4,Pn=panel(ctx,{x:50,y:12,w:w-64,h:h-46},[0,xm],[lo,hi],{xn:4,yn:4,xlabel:'x (M)',ylabel:'log₁₀ Q',color:T.ink});
      ctx.save();clip(ctx,Pn);ctx.strokeStyle=T.ca;ctx.lineWidth=2.6;ctx.beginPath();let st=false;for(let i=1;i<=300;i++){const x=xm*i/301,q=icQ(r,c0(),x);const y=clamp(Math.log10(q),lo-1,hi+1);st?ctx.lineTo(Pn.X(x),Pn.Y(y)):ctx.moveTo(Pn.X(x),Pn.Y(y));st=true;}ctx.stroke();ctx.restore();
      line(ctx,Pn,0,Math.log10(k),xm,Math.log10(k),T.ink,2,[6,4]);label(ctx,'log K',Pn.X(xm)-4,Pn.Y(Math.log10(k))-6,T.ink,'right','bottom',MONO);
      const xs=icSolve(r,c0(),k);dot(ctx,Pn.X(xs),Pn.Y(Math.log10(k)),6,T.cv);label(ctx,'x = '+fmt(xs,4),Pn.X(xs),Pn.Y(Math.log10(k))+12,T.cv,'center','top',MONO);
      const x=X(),q=icQ(r,c0(),x);if(x>0)dot(ctx,Pn.X(x),Pn.Y(clamp(Math.log10(q),lo,hi)),7,T.ink,'#fff');}});
  function upd(){const k=K(),x=X(),q=icQ(r,c0(),x),xs=icSolve(r,c0(),k),xa=icApprox(r,c0(),k),ratio=x>0?q/k:0;setText('ic-k-out',kfmt(k));setText('ic-c0-out',fmt(c0(),2)+' M');setText('ic-x-out',fmt(x,4)+' M');
    setText('ic-Q',x>0?kfmt(q):'0');setText('ic-kv',kfmt(k));const ve=Math.abs(Math.log(ratio||1e-9))<.02;setText('ic-v',x===0?'Slide x to the right':ve?'Q = K: this is equilibrium!':ratio<1?'Q < K: x too small':'Q > K: x too big');
    setText('ic-pct',fmt(xs/c0()*100,1)+'% at equilibrium');
    const ok=xs/c0()<.05;$('#ic-approx').innerHTML=`Exact x = ${fmt(xs,4)} M (${fmt(xs/c0()*100,1)}% of the start). Shortcut x ≈ ${fmt(xa,4)} M. ${ok?'<b>5% rule passes</b>: the shortcut is fine.':'<b>5% rule fails</b>: the shortcut is off by '+fmt(Math.abs(xa-xs)/xs*100,0)+'%; solve the full equation.'}`;
    const rows=[...r.R.map(([n,c])=>({n,c,s:-1,i:c0()})),...r.P.map(([n,c])=>({n,c,s:1,i:0}))];
    $('#ic-tab').innerHTML=`<thead><tr><th></th>${rows.map(s=>`<th>${s.n}</th>`).join('')}</tr></thead><tbody><tr><td><b>I</b></td>${rows.map(s=>`<td>${fmt(s.i,3)}</td>`).join('')}</tr><tr><td><b>C</b></td>${rows.map(s=>`<td>${s.s<0?'−':'+'}${s.c>1?s.c:''}x</td>`).join('')}</tr><tr><td><b>E</b></td>${rows.map(s=>`<td>${fmt(s.i+s.s*s.c*x,3)}</td>`).join('')}</tr></tbody>`;
    bars.render();gs.render();}
  function load(){r=ICR[+rs.value];kS.value=Math.log10(r.K).toFixed(2);cS.value=r.c0;xS.value=0;anim=false;upd();}
  rs.addEventListener('change',load);bindRange('ic-k',()=>'',()=>{xS.value=0;upd();},false);bindRange('ic-c0',()=>'',()=>{xS.value=0;upd();},false);bindRange('ic-x',()=>'',()=>{anim=false;upd();},false);
  $('#ic-solve').addEventListener('click',()=>{target=icSolve(r,c0(),K());anim=true;bars.render();});$('#ic-lab').addEventListener('labreset',load);load();drawers.icecalc=upd;
  TIPS['ic-rx']='Different stoichiometries change the equation for Q, and how big x gets.';
  TIPS['ic-k']='A small K means very little reacts; a big K means it goes nearly to completion.';
  TIPS['ic-c0']='Higher starting amounts mean the shortcut gets worse for reactions that make more moles.';
  TIPS['ic-x']='Slide x. Q climbs as x grows; stop where Q = K.';
  KEYS['ic-bars']=['Slide x, or press Solve for me.',[['#3E7BDC','reactants'],['#2FA36B','products']]];
  GLOSS['ICE table']='A table of Initial, Change and Equilibrium concentrations used to solve equilibrium problems.';
  GLOSS['5% rule']='The shortcut is acceptable if x is less than 5% of the starting concentration.';
  TT.icecalc='Have students guess x first from the bar chart, then check it. Many errors come from forgetting to multiply x by the coefficient.';
})();
(function(){
  PROBS.push({id:'ice-x',topic:'icecalc',title:'ICE: x is small',gen(){const c0=pick([.50,.80,1.0,1.5]),K=pick([1.8e-6,4.0e-7,6.0e-8,2.5e-6]),ra=pick(['A ⇌ B + C','A ⇌ 2B']);const two=ra==='A ⇌ 2B',x=two?Math.sqrt(K*c0/4):Math.sqrt(K*c0),ok=x/c0<.05;
    return {q:`For ${ra}, K = ${sci(K,2)}. Starting with ${fmt(c0,2)} M A and no products, find [${two?'B':'B'}] at equilibrium. (Use the 5% rule to justify any approximation.)`,ans:two?2*x:x,unit:'M',tol:.03,hint:`Set up: A = ${fmt(c0,2)} − x, ${two?'B = 2x':'B = C = x'}. Since K is tiny, start with ${fmt(c0,2)} − x ≈ ${fmt(c0,2)}.`,sol:`K = ${two?'(2x)²':'x²'}/${fmt(c0,2)} so x = ${sci(x,3)} M (${fmt(x/c0*100,3)}% of start: the approximation is valid). [B] = <b>${sci(two?2*x:x,3)} M</b>.`};}});
  PROBS.push({id:'ice-quad',topic:'icecalc',title:'ICE: quadratic',gen(){const c0=pick([.10,.20,.50,1.0]),K=pick([.042,.36,.15,.80]),rx=pick(['PCl₅ ⇌ PCl₃ + Cl₂','A ⇌ B + C']);const x=(-K+Math.sqrt(K*K+4*K*c0))/2;
    return {q:`For ${rx}, K = ${fmt(K,3)}. Starting with ${fmt(c0,2)} M of the reactant and none of the products, what is the equilibrium concentration of each product?`,ans:x,unit:'M',tol:.03,hint:'x²/(c0 − x) = K. Check the 5% rule; if it fails, rearrange to x² + Kx − Kc0 = 0 and use the quadratic formula.',sol:`x² + ${fmt(K,3)}x − ${fmt(K*c0,4)} = 0, so x = [−${fmt(K,3)} + √(${fmt(K*K+4*K*c0,4)})]/2 = <b>${fmt(x,4)} M</b> (${fmt(x/c0*100,0)}% of the start: the shortcut would have failed).`};}});
  PROBS.push({id:'ice-K',topic:'icecalc',title:'K from one equilibrium measurement',gen(){const c0=pick([.50,1.0,2.0]),f=pick([.2,.4,.6]),x=f*c0,Kd=2*x,rx='A + B ⇌ 2C'; /* A=B=c0, measure C */const Cm=2*x,A=c0-x,K=(Cm*Cm)/(A*A);
    return {q:`A + B ⇌ 2C. A flask starts with ${fmt(c0,2)} M A, ${fmt(c0,2)} M B and no C. At equilibrium [C] = ${fmt(Cm,3)} M. Find K<sub>c</sub>.`,ans:K,unit:'',tol:.02,hint:'Because C = 2x, find x from the measured [C], then [A] = [B] = start − x.',sol:`2x = ${fmt(Cm,3)} so x = ${fmt(x,3)}; [A] = [B] = ${fmt(A,3)} M. K = (${fmt(Cm,3)})² / (${fmt(A,3)})² = <b>${fmt(K,2)}</b>.`};}});
  PROBS.push({id:'ice-pct',topic:'icecalc',title:'Is the shortcut valid?',gen(){const c0=pick([.10,.25,.50,1.0]),x=c0*pick([.01,.03,.04,.06,.08,.12]),ok=x/c0<.05;
    return {q:`An ICE-table shortcut gives x = ${sci(x,2)} M for a reaction that started at ${fmt(c0,2)} M. Is the approximation acceptable?`,choices:['Yes: x is less than 5% of the start','No: x is 5% or more of the start'],ans:ok?0:1,hint:'Compute x ÷ start × 100 and compare with 5%.',sol:`x/start = ${sci(x,2)}/${fmt(c0,2)} = ${fmt(x/c0*100,1)}%, which is ${ok?'below':'above'} 5%: <b>${ok?'acceptable':'not acceptable'}</b>.`};}});
})();
