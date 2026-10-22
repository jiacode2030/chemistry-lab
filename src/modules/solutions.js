
/* ---------------- Solutions & molarity ---------------- */
(function solutions(){
  const cv=$('#sl-canvas');if(!cv)return;
  const NW=95;let W=[],So=[],kind='nacl',t0=0,started=false;
  const INFO={nacl:{f:'ion–dipole attraction',r:'dissolves',n:'Water\'s negative oxygen ends point at Na⁺ and its positive hydrogen ends at Cl⁻. Each ion is surrounded by a shell of water (hydration), and the crystal comes apart.'},glu:{f:'hydrogen bonding (O–H groups)',r:'dissolves',n:'Glucose has many O–H groups that hydrogen bond to water, so the molecules leave the solid one by one but stay uncharged (they do not conduct).'},oil:{f:'only weak dispersion forces',r:'does not mix',n:'Hexane is nonpolar. Water molecules prefer to hydrogen bond with each other, so they squeeze the hexane molecules together into a separate layer.'}};
  function init(){const w=cv.clientWidth||500,h=Math.round(clamp(w*.5,260,340));W=[];So=[];
    for(let i=0;i<NW;i++)W.push({x:20+Math.random()*(w-40),y:h*.3+Math.random()*(h*.62),a:Math.random()*6.28,vx:0,vy:0});
    const cx=w/2,cy=h*.66;
    if(kind==='nacl'){for(let i=0;i<4;i++)for(let j=0;j<4;j++)So.push({x:cx+(i-1.5)*22,y:cy+(j-1.5)*22,pos:(i+j)%2===0,free:false,rel:Math.random()*3+.4,vx:0,vy:0,r:(i+j)%2===0?9:12});}
    else if(kind==='glu'){for(let i=0;i<14;i++)So.push({x:cx+(i%4-1.5)*24,y:cy+(Math.floor(i/4)-1.5)*24,free:false,rel:Math.random()*3+.4,vx:0,vy:0,r:11,a:Math.random()*6.28});}
    else{for(let i=0;i<16;i++)So.push({x:cx+(Math.random()-.5)*160,y:cy+(Math.random()-.5)*70,free:true,rel:0,vx:0,vy:0,r:10});}
    W=W.filter(q=>So.every(s=>Math.hypot(s.x-q.x,s.y-q.y)>s.r+9));t0=0;started=true;
    setText('sl-f',INFO[kind].f);setText('sl-r',INFO[kind].r);setText('sl-n',INFO[kind].n);}
  const sim=sim2d(cv,{h:w=>Math.round(clamp(w*.5,260,340)),step(dt){const w=cv.clientWidth,h=Math.round(clamp(w*.5,260,340));t0+=dt;
      So.forEach(s=>{if(!s.free&&t0>s.rel)s.free=true;if(s.free){s.vx+=(Math.random()-.5)*400*dt;s.vy+=(Math.random()-.5)*400*dt;s.vx*=.97;s.vy*=.97;
        if(kind==='oil'){let cx=0,cy=0;So.forEach(q=>{cx+=q.x;cy+=q.y;});cx/=So.length;cy/=So.length;s.vx+=(cx-s.x)*.8*dt;s.vy+=(cy-s.y)*.8*dt;}
        s.x+=s.vx*dt;s.y+=s.vy*dt;}});
      So.forEach(s=>{if(s.x<12)s.vx=Math.abs(s.vx);if(s.x>w-12)s.vx=-Math.abs(s.vx);if(s.y<h*.28)s.vy=Math.abs(s.vy);if(s.y>h-10)s.vy=-Math.abs(s.vy);});
      W.forEach(q=>{q.vx+=(Math.random()-.5)*400*dt;q.vy+=(Math.random()-.5)*400*dt;q.vx*=.9;q.vy*=.9;q.a+=(Math.random()-.5)*2.4*dt;
        [...So].forEach(s=>{const dx=q.x-s.x,dy=q.y-s.y,d=Math.hypot(dx,dy)||1;
          if(d<s.r+9){const f=(s.r+9-d)*8;q.vx+=dx/d*f*dt*10;q.vy+=dy/d*f*dt*10;}
          if(d<s.r+34&&kind!=='oil'&&s.free!==undefined){/* turn the dipole: positive end (H side) away from cations, toward anions */
            let want;if(kind==='nacl')want=Math.atan2(dy,dx)+(s.pos?0:Math.PI);else want=Math.atan2(dy,dx)+Math.PI/2;
            let da=Math.atan2(Math.sin(want-q.a),Math.cos(want-q.a));q.a+=da*Math.min(1,dt*(kind==='nacl'?8:3));}
          if(kind==='oil'&&d<s.r+22){q.vx+=dx/d*30*dt*10;q.vy+=dy/d*30*dt*10;}});
        W.forEach(o=>{if(o===q)return;const dx=q.x-o.x,dy=q.y-o.y,d=Math.hypot(dx,dy)||1;if(d<14){const f=(14-d)*5;q.vx+=dx/d*f*dt*10;q.vy+=dy/d*f*dt*10;}});
        q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.x<8){q.x=8;q.vx=Math.abs(q.vx);}if(q.x>w-8){q.x=w-8;q.vx=-Math.abs(q.vx);}if(q.y<h*.3){q.y=h*.3;q.vy=Math.abs(q.vy);}if(q.y>h-8){q.y=h-8;q.vy=-Math.abs(q.vy);}});},
    draw(ctx,w,h){ctx.fillStyle=alpha(T.cx,.07);ctx.fillRect(0,h*.28,w,h*.72);ctx.strokeStyle=T.cx;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,h*.28);ctx.lineTo(w,h*.28);ctx.stroke();label(ctx,'water',8,h*.28+4,T.cx,'left','top',MONO);
      W.forEach(q=>{const ux=Math.cos(q.a),uy=Math.sin(q.a);/* H end is the positive end (a points to it) */
        ctx.strokeStyle=alpha(T.muted,.5);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(q.x+ux*8,q.y+uy*8);ctx.stroke();
        ball2(ctx,q.x-ux*3,q.y-uy*3,5.2,'#E5484D');ball2(ctx,q.x+ux*8+uy*3,q.y+uy*8-ux*3,3,'#EEF1F5','rgba(0,0,0,.4)');ball2(ctx,q.x+ux*8-uy*3,q.y+uy*8+ux*3,3,'#EEF1F5','rgba(0,0,0,.4)');});
      So.forEach(s=>{if(kind==='nacl'){ball2(ctx,s.x,s.y,s.r,s.pos?'#3E63DD':'#2FB55A');label(ctx,s.pos?'+':'−',s.x,s.y,'#fff','center','middle','700 12px "IBM Plex Mono",monospace');}
        else if(kind==='glu'){ctx.fillStyle=alpha(T.ink,.7);ctx.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;ctx.lineTo(s.x+Math.cos(a)*s.r,s.y+Math.sin(a)*s.r);}ctx.closePath();ctx.fill();label(ctx,'OH',s.x,s.y,'#fff','center','middle','700 8px "IBM Plex Mono",monospace');}
        else{ctx.fillStyle=alpha('#C98A1B',.85);ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,7);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.stroke();}});
      label(ctx,'water: red = δ− oxygen, white = δ+ hydrogen',w-8,h-6,T.muted,'right','bottom',MONO);}});
  /* ---- dilution ---- */
  const dc=$('#dl-canvas'),dsim=sim2d(dc,{h:w=>clamp(w*.5,260,340),draw(ctx,w,h,t){const n=+$('#dl-n').value,v1=+$('#dl-v1').value,wd=+$('#dl-w').value,v2=v1+wd,m1=n/v1,m2=n/v2,N=Math.round(n*40),base=h-26,ph=h-60;
      const bw=Math.min(150,w*.3),bx=[w*.27,w*.73];[[v1,m1,'before'],[v2,m2,'after']].forEach(([v,m,nm],k)=>{const x=bx[k],ht=ph*v/3,top=base-ht;
        ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x-bw/2,base-ph*1.0);ctx.lineTo(x-bw/2,base);ctx.lineTo(x+bw/2,base);ctx.lineTo(x+bw/2,base-ph*1.0);ctx.stroke();
        ctx.fillStyle=alpha(T.cx,clamp(.12+m*.35,.1,.8));ctx.fillRect(x-bw/2+1.5,top,bw-3,ht);
        for(let i=0;i<N;i++){const r1=Math.sin(i*12.9898)*43758.5453%1,r2=Math.sin(i*78.233)*12345.678%1,px=x-bw/2+10+Math.abs(r1)*(bw-20)+Math.sin(t*2+i)*2,py=top+8+Math.abs(r2)*Math.max(1,ht-16)+Math.cos(t*2.3+i)*2;ball2(ctx,px,py,3.8,T.hot);}
        label(ctx,`${v.toFixed(2)} L · ${m.toFixed(2)} M`,x,base+6,T.ink,'center','top','600 13px "IBM Plex Mono",monospace');label(ctx,nm,x,top-8,T.muted,'center','bottom',MONO);});
      arrow(ctx,w*.42,base-ph*.3,w*.58,base-ph*.3,T.cx,3);label(ctx,'+ '+wd.toFixed(2)+' L water',w/2,base-ph*.3-10,T.cx,'center','bottom',MONO);}});
  function updD(){const n=+$('#dl-n').value,v1=+$('#dl-v1').value,wd=+$('#dl-w').value,v2=v1+wd;setText('dl-m1',(n/v1).toFixed(2)+' M');setText('dl-m2',(n/v2).toFixed(3)+' M');setText('dl-f',(v2/v1).toFixed(2)+'×');setText('dl-chk',`${(n/v1).toFixed(2)} × ${v1.toFixed(2)} = ${(n/v2).toFixed(3)} × ${v2.toFixed(2)} = ${n.toFixed(2)} mol`);dsim.render();}
  bindRange('dl-n',x=>x.toFixed(2)+' mol',updD);bindRange('dl-v1',x=>x.toFixed(2)+' L',updD);bindRange('dl-w',x=>x.toFixed(2)+' L',updD);
  $('#sl-sel').addEventListener('change',()=>{kind=$('#sl-sel').value;init();sim.render();});$('#sl-go').addEventListener('click',()=>{init();sim.render();});
  init();drawers.solutions=()=>{sim.render();dsim.render();};
  TIPS['sl-sel']='Compare how the water molecules behave around each solute.';
  TIPS['dl-w']='Adding water spreads the same number of solute particles over a bigger volume: lower molarity.';
  TIPS['dl-n']='More moles of solute in the same volume means a more concentrated solution.';
  KEYS['sl-canvas']=['Pick a solute and press Drop it in.',[['bad','water oxygen (δ−)'],['cx','cation / water'],['cv','anion']]];
  GLOSS['molarity']='Moles of solute per liter of solution (mol/L, written M).';
  GLOSS['solvent']='The substance that does the dissolving, usually the larger amount (water in aqueous solutions).';
  GLOSS['hydration']='Water molecules surrounding and stabilizing a dissolved ion.';
  TT.solutions='Ask students which way the water molecules should point before running the salt animation. The dilution lab makes M₁V₁ = M₂V₂ obvious: the number of dots never changes.';
})();
(function(){
  const SOL=[['NaCl'],['KCl'],['NaOH'],['C6H12O6'],['CaCl2'],['MgCl2'],['KNO3']];
  PROBS.push({id:'sol-molarity',topic:'solutions',title:'Molarity from a mass',gen(){const f=pick(['NaCl','KCl','NaOH','C6H12O6','CaCl2','MgCl2']),{M}=molarMass(f),g=ri(20,300)/10,V=ri(10,50)*10,ans=g/M/(V/1000);
    return {q:`${g.toFixed(1)} g of ${fsub(f)} is dissolved in water to make ${V} mL of solution. What is the molarity? (Atomic masses: H 1.008, C 12.01, O 16.00, Na 22.99, Mg 24.31, Cl 35.45, K 39.10, Ca 40.08.)`,ans,unit:'M',tol:.02,hint:'Convert grams to moles with the molar mass, convert mL to L, then divide.',sol:`n = ${g.toFixed(1)} ÷ ${M.toFixed(2)} = ${fmt(g/M,4)} mol; M = ${fmt(g/M,4)} mol ÷ ${(V/1000).toFixed(3)} L = <b>${fmt(ans,3)} M</b>.`};}});
  PROBS.push({id:'sol-dilution',topic:'solutions',title:'Dilution',gen(){const M1=ri(10,120)/10,M2=+(M1/ri(3,20)).toFixed(3),V2=ri(5,50)*10,ans=M2*V2/M1;
    return {q:`How many mL of ${M1.toFixed(1)} M stock solution are needed to prepare ${V2} mL of ${M2.toFixed(3)} M solution?`,ans,unit:'mL',tol:.02,hint:'M₁V₁ = M₂V₂, so V₁ = M₂V₂/M₁.',sol:`V₁ = (${M2.toFixed(3)})(${V2}) / ${M1.toFixed(1)} = <b>${fmt(ans,2)} mL</b>.`};}});
  PROBS.push({id:'sol-ions',topic:'solutions',title:'Ion concentrations',gen(){const [f,ion,k,nm]=pick([['CaCl₂','Cl⁻',2,''],['Na₂SO₄','Na⁺',2,''],['Al(NO₃)₃','NO₃⁻',3,''],['MgCl₂','Cl⁻',2,''],['K₃PO₄','K⁺',3,''],['Ca(NO₃)₂','NO₃⁻',2,''],['FeCl₃','Cl⁻',3,'']]),c=ri(2,40)/100,ans=c*k;
    return {q:`What is the concentration of ${ion} in a ${c.toFixed(2)} M solution of ${f}?`,ans,unit:'M',tol:.02,hint:'Write the dissociation equation. Each formula unit releases as many of this ion as its subscript.',sol:`Each ${f} gives ${k} ${ion}, so [${ion}] = ${k} × ${c.toFixed(2)} = <b>${fmt(ans,3)} M</b>.`};}});
  PROBS.push({id:'sol-mass',topic:'solutions',title:'Mass needed for a solution',gen(){const f=pick(['NaCl','KCl','NaOH','C6H12O6']),{M}=molarMass(f),c=ri(5,100)/100,V=ri(10,50)*10,ans=c*V/1000*M;
    return {q:`What mass of ${fsub(f)} is needed to make ${V} mL of ${c.toFixed(2)} M solution? (Atomic masses: H 1.008, C 12.01, O 16.00, Na 22.99, Cl 35.45, K 39.10.)`,ans,unit:'g',tol:.02,hint:'Moles = M × V (in L), then grams = moles × molar mass.',sol:`n = ${c.toFixed(2)} × ${(V/1000).toFixed(3)} = ${fmt(c*V/1000,4)} mol; mass = ${fmt(c*V/1000,4)} × ${M.toFixed(2)} = <b>${fmt(ans,2)} g</b>.`};}});
})();
