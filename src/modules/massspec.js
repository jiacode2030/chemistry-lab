
/* ---------------- Mass spectra & average atomic mass ---------------- */
(function massspec(){
  const cv=$('#ms-canvas');if(!cv)return;
  /* isotopic masses (u) and natural abundances (%) */
  const EL={Li:{ptv:6.94,iso:[[6,6.015,7.59],[7,7.016,92.41]]},B:{ptv:10.81,iso:[[10,10.013,19.9],[11,11.009,80.1]]},Ne:{ptv:20.18,iso:[[20,19.992,90.48],[21,20.994,.27],[22,21.991,9.25]]},
    Mg:{ptv:24.31,iso:[[24,23.985,78.99],[25,24.986,10.00],[26,25.983,11.01]]},Cl:{ptv:35.45,iso:[[35,34.969,75.78],[37,36.966,24.22]]},Cu:{ptv:63.55,iso:[[63,62.930,69.15],[65,64.928,30.85]]},Br:{ptv:79.90,iso:[[79,78.918,50.69],[81,80.916,49.31]]}};
  const sel=$('#ms-el');sel.innerHTML=Object.keys(EL).map(k=>`<option value="${k}">${k} · ${EL[k].iso.length} isotopes</option>`).join('');sel.value='Cl';
  const sup=n=>String(n).split('').map(c=>SUP[c]).join('');
  let el='Cl',iso=[],grow=0,hits=[],ions=[],emit=0,rock=0,rockV=0,total=0;
  function load(){el=sel.value;const E=EL[el];iso=E.iso.map(([A,m,ab])=>({A,m,ab}));hits=iso.map(()=>0);ions=[];total=0;grow=REDUCE?1:0;
    const w=$('#ms-what'),ab=$('#ms-ab'),two=iso.length===2;w.disabled=!two;if(!two)w.checked=false;ab.disabled=!(w.checked&&two);
    if(!w.checked)ab.value=Math.round(iso[0].ab);else apply();setText('ms-pt',E.ptv.toFixed(2)+' u');upd();}
  function apply(){if(iso.length===2&&$('#ms-what').checked){const a=+$('#ms-ab').value;iso[0].ab=a;iso[1].ab=100-a;hits=iso.map(()=>0);ions=[];total=0;rockV+=4;}}
  const avg=()=>iso.reduce((a,i)=>a+i.ab/100*i.m,0)/(iso.reduce((a,i)=>a+i.ab/100,0)||1);
  function upd(){const v=avg();setText('ms-avg',v.toFixed(2)+' u');setText('ms-n',total);
    setText('ms-calc',iso.map(i=>`${(i.ab/100).toFixed(4)} × ${i.m.toFixed(3)}`).join(' + ')+' = '+v.toFixed(2));sim.render();}
  let X=null;
  const sim=sim2d(cv,{h:w=>clamp(w*.92,440,580),
    step(dt){grow=Math.min(1,grow+dt*1.4);rockV+=(-rock*60-rockV*5)*dt;rock+=rockV*dt;emit+=dt*(iso.length?7:0);
      while(emit>1){emit-=1;const r=Math.random()*iso.reduce((a,i)=>a+i.ab,0);let a=0,k=0;for(;k<iso.length;k++){a+=iso[k].ab;if(r<=a)break;}k=Math.min(k,iso.length-1);if(iso[k].ab>0)ions.push({k,u:0});}
      ions.forEach(io=>{io.u+=dt/1.5;if(io.u>=1&&!io.done){io.done=true;hits[io.k]++;total++;if(total%3===0)setText('ms-n',total);}});ions=ions.filter(io=>io.u<1.12);},
    draw(ctx,w,h,t){const m0=Math.min(...iso.map(i=>i.m))-1.6,m1=Math.max(...iso.map(i=>i.m))+1.6;const half=h*.46;
      const bx=56,bw=w-bx-18;X=m=>bx+(m-m0)/(m1-m0)*bw;const plateY=half,src=bx+bw*.04;
      /* magnetic field region */
      ctx.fillStyle=alpha(T.ca,.07);ctx.fillRect(bx,12,bw,plateY-12);ctx.strokeStyle=alpha(T.ca,.4);ctx.setLineDash([4,5]);ctx.strokeRect(bx+.5,12.5,bw-1,plateY-12);ctx.setLineDash([]);
      ctx.fillStyle=alpha(T.ca,.5);ctx.font=MONO;ctx.textAlign='left';for(let x=bx+14;x<bx+bw-8;x+=34)for(let y=26;y<plateY-14;y+=30)ctx.fillText('•',x,y);
      label(ctx,'magnetic field (out of the page): lighter ions bend more',bx+bw-8,22,T.ca,'right','top',MONO);
      ctx.fillStyle=T.ink;ctx.fillRect(bx,plateY,bw,3);label(ctx,'detector',bx-6,plateY+1,T.muted,'right','middle',MONO);
      ctx.fillStyle=T.muted;ctx.fillRect(src-9,plateY-4,18,10);label(ctx,'source',src,plateY+18,T.muted,'center','top',MONO);
      /* ions */
      const cols=[T.cx,T.hot,T.cv];
      ions.forEach(io=>{const I=iso[io.k];const xe=X(I.m),r=(xe-src)/2,u=Math.min(1,io.u),th=Math.PI*u;const x=src+r*(1-Math.cos(th)),y=plateY-4-r*Math.sin(th)*Math.min(1,(plateY-30)/Math.max(r,1));
        if(io.u<1.0){ctx.strokeStyle=alpha(cols[io.k%3],.18);ctx.lineWidth=1.5;ctx.beginPath();for(let a=0;a<=th;a+=.1){ctx.lineTo(src+r*(1-Math.cos(a)),plateY-4-r*Math.sin(a)*Math.min(1,(plateY-30)/Math.max(r,1)));}ctx.stroke();ball2(ctx,x,y,5,cols[io.k%3]);}
        else{const f=(io.u-1)/.12;ctx.fillStyle=alpha(cols[io.k%3],1-f);ctx.beginPath();ctx.arc(xe,plateY+2,5+f*10,0,7);ctx.fill();}});
      /* spectrum */
      const top=plateY+44,bot=h-112,H=bot-top,P={X,Y:v=>bot-v/100*H};
      ctx.strokeStyle=T.line;ctx.lineWidth=1;ctx.fillStyle=T.muted;ctx.font=MONO;ctx.textAlign='right';ctx.textBaseline='middle';
      [0,25,50,75,100].forEach(v=>{const y=Math.round(P.Y(v))+.5;ctx.beginPath();ctx.moveTo(bx,y);ctx.lineTo(bx+bw,y);ctx.stroke();ctx.fillText(v,bx-6,y);});
      label(ctx,'relative abundance (%)',bx+bw,top-14,T.muted,'right','middle',MONO);
      const tot=iso.reduce((a,i)=>a+i.ab,0),mx=Math.max(...hits,1);
      iso.forEach((I,k)=>{const x=X(I.m),bwid=Math.max(10,Math.min(40,bw/(m1-m0)*.5));const hh=I.ab*grow;
        ctx.fillStyle=alpha(cols[k%3],.25);ctx.fillRect(x-bwid/2,P.Y(hh),bwid,bot-P.Y(hh));ctx.strokeStyle=cols[k%3];ctx.lineWidth=2;ctx.strokeRect(x-bwid/2,P.Y(hh),bwid,bot-P.Y(hh));
        const meas=total?hits[k]/total*100:0;ctx.fillStyle=cols[k%3];ctx.fillRect(x-bwid/2+3,P.Y(meas*grow),bwid-6,bot-P.Y(meas*grow));
        label(ctx,I.ab.toFixed(I.ab<1?2:1)+' %',x,P.Y(hh)-6,T.ink,'center','bottom',MONO);label(ctx,sup(I.A)+(el),x,bot+10,cols[k%3],'center','top','600 13px "IBM Plex Sans",sans-serif');label(ctx,I.m.toFixed(3),x,bot+27,T.muted,'center','top',MONO);});
      ctx.strokeStyle=T.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx,bot+.5);ctx.lineTo(bx+bw,bot+.5);ctx.stroke();
      /* seesaw: weights on a beam, balanced at the average mass */
      const a=avg(),fx=X(a),by=bot+86;
      ctx.fillStyle=T.hot;ctx.beginPath();ctx.moveTo(fx,by+2);ctx.lineTo(fx-10,by+22);ctx.lineTo(fx+10,by+22);ctx.fill();
      ctx.save();ctx.translate(fx,by);ctx.rotate(rock*.05);ctx.strokeStyle=T.ink;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(X(m0+.3)-fx,0);ctx.lineTo(X(m1-.3)-fx,0);ctx.stroke();
      iso.forEach((I,k)=>{const r=4+Math.sqrt(I.ab/tot)*15;ctx.fillStyle=cols[k%3];ctx.beginPath();ctx.arc(X(I.m)-fx,-r-2,r,0,7);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;ctx.stroke();});ctx.restore();
      ctx.strokeStyle=T.hot;ctx.setLineDash([4,4]);ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(fx,top-4);ctx.lineTo(fx,bot+50);ctx.stroke();ctx.setLineDash([]);
      label(ctx,'balance point = average '+a.toFixed(2)+' u',fx,by+26,T.hot,'center','top','600 13px "IBM Plex Mono",monospace');label(ctx,'weight = abundance',bx,by+26,T.muted,'left','top',MONO);}});
  drawers.massspec=()=>sim.render();
  sel.addEventListener('change',load);
  $('#ms-what').addEventListener('change',()=>{$('#ms-ab').disabled=!$('#ms-what').checked;if($('#ms-what').checked)apply();else{iso=EL[el].iso.map(([A,m,ab])=>({A,m,ab}));hits=iso.map(()=>0);ions=[];total=0;$('#ms-ab').value=Math.round(iso[0].ab);}upd();});
  bindRange('ms-ab',x=>x+' %',x=>{if($('#ms-what').checked){apply();upd();}},false);
  load();
  TIPS['ms-el']='Each peak is one isotope; its height is how common it is. The seesaw balances at the average atomic mass.';
  TIPS['ms-what']='Take control of the abundances and watch the average move toward the more abundant isotope.';
  TIPS['ms-ab']='More of the lighter isotope pulls the balance point toward it.';
  KEYS['ms-canvas']=['Watch ions fly through the field and land. Solid bars count what has been detected so far.',[['cx','lighter isotope'],['hot','heavier isotope · average mass'],['ca','magnetic field']]];
  GLOSS['isotope']='Atoms of the same element with different numbers of neutrons, so different masses.';
  GLOSS['mass spectrum']='A plot of relative abundance against mass: one peak for each isotope.';
  TT.massspec='A weighted average is the whole idea, so connect it to a course grade where tests count more than quizzes. Ask students to guess whether the average will be closer to the left or the right peak before they use the sliders.';
})();
(function(){
  PROBS.push({id:'ms-avg',topic:'massspec',title:'Average atomic mass from isotopes',gen(){const A=ri(20,200),d=ri(1,3),p=ri(10,90),ma=+(A-ri(1,70)/1000).toFixed(3),mb=+(A+d-ri(1,70)/1000).toFixed(3),ans=(p*ma+(100-p)*mb)/100;
    return {q:`An element has two isotopes: one of mass ${ma} u (${p}% abundant) and one of mass ${mb} u (${100-p}% abundant). What is its average atomic mass?`,ans,unit:'u',tol:.0008,hint:'Weighted average: multiply each mass by its fractional abundance, then add.',
      sol:`(${p/100}) × ${ma} + (${(100-p)/100}) × ${mb} = ${fmt(p/100*ma,3)} + ${fmt((100-p)/100*mb,3)} = <b>${fmt(ans,2)} u</b>.`};}});
  PROBS.push({id:'ms-abund',topic:'massspec',title:'Abundance from the average mass',gen(){const A=ri(20,150),d=pick([1,2]),ma=+(A-.02).toFixed(3),mb=+(A+d-.03).toFixed(3),p=ri(15,85),avg=(p*ma+(100-p)*mb)/100;
    return {q:`An element has two isotopes with masses ${ma} u and ${mb} u. Its average atomic mass is ${avg.toFixed(3)} u. What percent of its atoms are the lighter isotope?`,ans:p,unit:'%',abs:.6,hint:'Let x be the fraction of the lighter isotope: x(ma) + (1 − x)(mb) = average. Solve for x.',
      sol:`x(${ma}) + (1 − x)(${mb}) = ${avg.toFixed(3)} → x = (${mb} − ${avg.toFixed(3)}) / (${mb} − ${ma}) = ${fmt((mb-avg)/(mb-ma),3)}, so <b>${p}%</b> (to the precision given).`};}});
  PROBS.push({id:'ms-spectrum',topic:'massspec',title:'Read an average from peak heights',gen(){const a=ri(20,120),d=pick([1,2,3]),b=a+d,ha=pick([10,20,25,30,40,60,70,75,80,90]),hb=100-ha;const ans=(ha*a+hb*b)/100;
    return {q:`A mass spectrum shows two peaks: at mass ${a} with relative height ${ha}, and at mass ${b} with relative height ${hb}. Estimate the average atomic mass using the mass numbers.`,ans,unit:'u',tol:.002,hint:'Convert the heights to fractions (they sum to 100), then weight each mass.',
      sol:`(${ha}/100)(${a}) + (${hb}/100)(${b}) = <b>${fmt(ans,2)} u</b>.`};}});
})();
