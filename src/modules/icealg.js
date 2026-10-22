
/* ---------------- ICE-table algebra: when is x small? ---------------- */
(function icealg(){
  const cv=$('#ia-canvas');if(!cv)return;let c=.1,K=1e-5;
  const exact=()=>(-K+Math.sqrt(K*K+4*K*c))/2,approx=()=>Math.sqrt(K*c);
  const sim=sim2d(cv,{h:w=>clamp(w*.5,260,360),draw(ctx,w,h){const box={x:58,y:12,w:w-74,h:h-48};const xmax=c;const ymax=Math.max(3*K,1e-12);
      const P=panel(ctx,box,[0,xmax],[0,ymax],{xn:5,yn:4,xlabel:'x (M)',ylabel:'x²/(c−x)',color:T.ink});
      const f=x=>x*x/(c-x),g=x=>x*x/c;
      curve(ctx,P,x=>Math.min(f(Math.min(x,c*.9999)),ymax*5),0,c*.9999,T.cx,2.6,300);
      curve(ctx,P,g,0,c,T.hot,2.4,300,[7,5]);
      line(ctx,P,0,K,xmax,K,T.cv,2);label(ctx,'K',P.box.x+P.box.w-4,P.Y(K)-8,T.cv,'right','bottom',LABEL);
      const xe=exact(),xa=approx();
      [[xe,T.cx],[xa,T.hot]].forEach(([x,col],i)=>{if(x<=xmax){ctx.save();ctx.strokeStyle=col;ctx.setLineDash([3,3]);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(P.X(x),P.Y(K));ctx.lineTo(P.X(x),box.y+box.h);ctx.stroke();ctx.restore();dot(ctx,P.X(x),P.Y(K),5,col);}});
      label(ctx,'exact',P.X(xe),box.y+box.h+16,T.cx,xe<xa?'right':'left','top',MONO);label(ctx,'shortcut',P.X(xa),box.y+box.h+30,T.hot,xe<xa?'left':'right','top',MONO);}});
  drawers.icealg=()=>sim.render();
  function upd(){const xe=exact(),xa=approx(),pct=xe/c*100,err=Math.abs(xa-xe)/xe*100,ok=pct<5;
    setText('ia-xe',sci(xe,2));setText('ia-xa',sci(xa,2));setText('ia-pct',fmt(pct,pct<10?2:1)+' %');setText('ia-err',fmt(err,err<10?2:1)+' %');
    const v=$('#ia-v');v.textContent=ok?'✓ x is small (under 5% of c): the shortcut is fine':'✗ x is more than 5% of c: use the quadratic';v.style.color=ok?'var(--good)':'var(--hot)';sim.render();}
  bindRange('ia-c',x=>sci(10**x,2)+' M',x=>{c=10**x;upd();});bindRange('ia-k',x=>sci(10**x,2),x=>{K=10**x;upd();});
  TIPS['ia-c']='More dilute means more of the acid ionizes, so x grows compared with c and the shortcut gets worse.';
  TIPS['ia-k']='A smaller K means less ionization, so x stays small compared with c and the shortcut is safe.';
  KEYS['ia-canvas']=['Move the sliders and watch where the curves cross the K line.',[['cx','exact: x²/(c−x)'],['hot','shortcut: x²/c','dash'],['cv','K']]];
  GLOSS['ice table']='A table with rows Initial, Change and Equilibrium that tracks amounts as a reaction reaches equilibrium.';
  TT.icealg='Make the 5% check a habit by requiring it in every written solution. Show that the shortcut error grows as c/K shrinks, using the slider, before giving the c/K > 400 rule.';
})();
(function(){
  PROBS.push({id:'ia-quad',topic:'icealg',title:'Solve the ICE quadratic',gen(){const c=pick([.010,.020,.050,.10,.20,.50]),K=pick([2e-3,5e-3,1.0e-2,2.0e-2,5e-2]);const x=(-K+Math.sqrt(K*K+4*K*c))/2;
    return {q:`For HA ⇌ H⁺ + A⁻ the equilibrium constant is K = ${sci(K,1)}. Starting with ${c.toFixed(3)} M HA and no products, find [H⁺] at equilibrium. (The shortcut is not valid here; use the quadratic.)`,ans:x,unit:'M',tol:.03,hint:'Set up K = x²/(c − x), rearrange to x² + Kx − Kc = 0 and use the quadratic formula. Keep the positive root.',
      sol:`x² + (${sci(K,1)})x − ${sci(K*c,2)} = 0 → x = [−${sci(K,1)} + √((${sci(K,1)})² + 4(${sci(K*c,2)}))]/2 = <b>${sci(x,2)} M</b>. (Check: x/c = ${fmt(x/c*100,0)}%, so the shortcut would not have worked.)`};}});
  PROBS.push({id:'ia-small',topic:'icealg',title:'The shortcut and its check',gen(){const c=pick([.10,.20,.50,1.0]),K=pick([1.0e-6,4.0e-6,1.8e-5,6.0e-5,2.0e-4]);const x=Math.sqrt(K*c);const pct=x/c*100;
    return {q:`A weak acid with K = ${sci(K,1)} starts at ${c.toFixed(2)} M. Use the x-is-small shortcut to find [H⁺].`,ans:x,unit:'M',tol:.03,hint:'x² / c = K, so x = √(Kc). Then check x / c × 100 against 5%.',
      sol:`x = √(${sci(K,1)} × ${c}) = <b>${sci(x,2)} M</b>. Check: ${sci(x,2)} / ${c} × 100 = ${pct<.1?pct.toFixed(3):pct.toFixed(2)}%, under 5%, so the shortcut is valid.`};}});
})();
