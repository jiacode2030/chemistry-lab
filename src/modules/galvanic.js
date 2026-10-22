
/* ---------------- Galvanic cells ---------------- */
const GV={Mg:{z:2,E:-2.37,col:'#C9CED8',sol:'#E9EEF5',ion:'Mg²⁺'},Al:{z:3,E:-1.66,col:'#B8BCC6',sol:'#E9EEF5',ion:'Al³⁺'},Zn:{z:2,E:-0.76,col:'#7C8FA6',sol:'#E9EEF5',ion:'Zn²⁺'},Fe:{z:2,E:-0.44,col:'#8C8680',sol:'#CFE7C7',ion:'Fe²⁺'},Ni:{z:2,E:-0.26,col:'#A8B3AE',sol:'#9ED8B0',ion:'Ni²⁺'},Pb:{z:2,E:-0.13,col:'#6B7280',sol:'#E9EEF5',ion:'Pb²⁺'},Cu:{z:2,E:0.34,col:'#C77A3B',sol:'#7FB4F0',ion:'Cu²⁺'},Ag:{z:1,E:0.80,col:'#C8CDD6',sol:'#E9EEF5',ion:'Ag⁺'}};
const gvN=(a,b)=>{const g=(x,y)=>y?g(y,x%y):x;return a*b/g(a,b);};
const FARADAY=96485;
(function galvanic(){
  const cv=$('#gv-canvas');if(!cv)return;const L=$('#gv-L'),Rr=$('#gv-R'),cl=$('#gv-cl'),cr=$('#gv-cr'),xs=$('#gv-x');const keys=Object.keys(GV);L.innerHTML=Rr.innerHTML=keys.map(k=>`<option value="${k}">${k} (${GV[k].ion}/${k}, E° = ${GV[k].E>0?'+':''}${GV[k].E.toFixed(2)} V)</option>`).join('');L.value='Zn';Rr.value='Cu';
  const H=372;let run=false,es=[],ions=[];
  const half=(k,c)=>GV[k].E+(0.0592/GV[k].z)*Math.log10(c);
  function state(xi){/* xi: extent in mol of the overall reaction (1 L each) */const a=L.value,b=Rr.value,c1=Math.pow(10,+cl.value),c2=Math.pow(10,+cr.value);
    let E1=half(a,c1),E2=half(b,c2);let an,ca,can,cca;if(E1<E2){an=a;ca=b;can=c1;cca=c2;}else{an=b;ca=a;can=c2;cca=c1;}
    const na=GV[an].z,nc=GV[ca].z,n=gvN(na,nc),dA=n/na,dC=n/nc;const cA=can+dA*xi,cC=Math.max(cca-dC*xi,1e-12);
    return {an,ca,anLeft:an===a&&!(a===b&&E1>=E2),n,na,nc,dA,dC,cA,cC,can,cca,E:half(ca,cC)-half(an,cA),E0:GV[ca].E-GV[an].E,Q:Math.pow(cA,n/na)/Math.pow(cC,n/nc)};}
  function xiEq(){const s0=state(0);let lo=0,hi=Math.max(s0.cca/s0.dC,1e-9)*(1-1e-9);if(state(lo).E<=0)return 0;for(let i=0;i<100;i++){const m=(lo+hi)/2;state(m).E>0?lo=m:hi=m;}return (lo+hi)/2;}
  const xi=()=>+xs.value/1000*xiEq();
  const sim=sim2d(cv,{h:()=>H,step(dt){if(run){xs.value=Math.min(1000,+xs.value+dt*55);if(+xs.value>=1000)run=false;upd(true);}const s=state(xi()),w=cv.clientWidth;const flow=s.E>1e-3;if(flow&&Math.random()<dt*(4+Math.min(s.E,2)*3))es.push({u:0});es.forEach(e=>e.u+=dt*.45);es=es.filter(e=>e.u<1);
      ions.forEach(p=>{p.u+=dt*.25*(flow?1:0);if(p.u>1)p.u-=1;});if(!ions.length)for(let i=0;i<8;i++)ions.push({u:i/8,k:i%2});},
    draw(ctx,w,h){const s=state(xi()),Ls=L.value,Rs=Rr.value,bw=Math.min(170,w*.32),by=152,bh=170,lx=w*.2-bw/2+10,rx=w*.8-bw/2-10,cxL=lx+bw/2,cxR=rx+bw/2;
      const sideL=s.anLeft,anS=s.an,caS=s.ca;const concL=sideL?s.cA:s.cC,concR=sideL?s.cC:s.cA;
      const beaker=(x,k,conc,isAn)=>{const t=clamp(Math.log10(conc)/3+1,.15,1);ctx.fillStyle=alpha(GV[k].sol,t*.7);ctx.fillRect(x,by+20,bw,bh-20);ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,by);ctx.lineTo(x,by+bh);ctx.lineTo(x+bw,by+bh);ctx.lineTo(x+bw,by);ctx.stroke();
        const grow=isAn?-1:1,frac=xiEq()?xi()/xiEq():0,wd=14+grow*6*frac;ctx.fillStyle=GV[k].col;ctx.fillRect(x+bw/2-wd/2,by-40,wd,bh+10);ctx.strokeStyle=T.ink;ctx.lineWidth=1.2;ctx.strokeRect(x+bw/2-wd/2,by-40,wd,bh+10);
        label(ctx,k+(isAn?'  (anode, −)':'  (cathode, +)'),x+bw/2,by+bh+14,isAn?T.ca:T.cx,'center','middle','600 12px "IBM Plex Mono",monospace');label(ctx,GV[k].ion+' '+sci(conc,1)+' M',x+bw/2,by+bh+30,T.muted,'center','middle',MONO);
        const nn=clamp(Math.round(3+4*Math.log10(conc*1000)),1,14);for(let i=0;i<nn;i++){const px=x+10+((i*47+sim.t*10*(i%3+1))%(bw-20)),py=by+30+((i*31+Math.sin(sim.t*2+i)*8+200)%(bh-50));dot(ctx,px,py,3.4,k==='Cu'?'#2350C6':'#7D9DFF');}};
      beaker(lx,Ls,concL,sideL);beaker(rx,Rs,concR,!sideL);
      /* wire */
      const wy=by-70,x0=cxL,x1=cxR;ctx.strokeStyle=T.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x0,by-40);ctx.lineTo(x0,wy);ctx.lineTo(x1,wy);ctx.lineTo(x1,by-40);ctx.stroke();
      /* voltmeter */
      const vx=w/2,vy=wy;ctx.fillStyle=T.surface||'#fff';ctx.beginPath();ctx.arc(vx,vy,25,0,7);ctx.fill();ctx.strokeStyle=T.ink;ctx.lineWidth=2.5;ctx.stroke();label(ctx,'V',vx,vy-9,T.muted,'center','middle',MONO);label(ctx,fmt(Math.max(s.E,0),2),vx,vy+7,T.ink,'center','middle','700 13px "IBM Plex Mono",monospace');
      /* electrons: from anode side to cathode side along the wire */
      const pa=u=>{const ax=sideL?x0:x1,bx=sideL?x1:x0;const t=u;if(t<.2)return [ax,by-40+(wy-(by-40))*(t/.2)];if(t<.8)return [ax+(bx-ax)*((t-.2)/.6),wy];return [bx,wy+((by-40)-wy)*((t-.8)/.2)];};
      es.forEach(e=>{const [px,py]=pa(e.u);dot(ctx,px,py,4,T.ce);});label(ctx,'e⁻ flow: anode → cathode',w/2,wy-34,T.ce,'center','middle',MONO);
      /* salt bridge */
      const sb=by+10;ctx.strokeStyle=T.muted;ctx.lineWidth=14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(lx+bw-8,sb-30);ctx.lineTo(lx+bw-8,sb-44);ctx.lineTo(rx+8,sb-44);ctx.lineTo(rx+8,sb-30);ctx.stroke();ctx.strokeStyle=alpha(T.hot,.35);ctx.lineWidth=9;ctx.stroke();ctx.lineCap='butt';
      /* ions in bridge: anions toward anode, cations toward cathode */
      ions.forEach(p=>{const ax=sideL?lx+bw-8:rx+8,cx=sideL?rx+8:lx+bw-8,y=sb-44;const t=p.u;const an=p.k===0;const x=an?cx+(ax-cx)*t:ax+(cx-ax)*t;dot(ctx,x,y,3,an?'#8B5CF6':'#E0A82E');});
      label(ctx,'salt bridge: anions → anode, cations → cathode',w/2,H-8,T.muted,'center','middle',MONO);
      label(ctx,'Oxidation: anode (An Ox)  ·  Reduction: cathode (Red Cat)',w/2,12,T.muted,'center','middle',MONO);}});
  const g=$('#gv-ladder'),gs=sim2d(g,{h:()=>H,draw(ctx,w,h){const s=state(xi()),lo=-2.6,hi=1.1,Y=v=>16+(h-40)*(1-(v-lo)/(hi-lo));ctx.strokeStyle=T.muted;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(46,12);ctx.lineTo(46,h-18);ctx.stroke();
      for(let v=-2;v<=1;v++){ctx.strokeStyle=T.grid;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(46,Y(v));ctx.lineTo(w-8,Y(v));ctx.stroke();label(ctx,(v>0?'+':'')+v+' V',42,Y(v),T.muted,'right','middle',MONO);}
      keys.forEach(k=>{const on=k===s.an||k===s.ca,y=Y(GV[k].E);ctx.fillStyle=on?(k===s.ca?T.cx:T.ca):alpha(T.muted,.5);ctx.fillRect(56,y-3,on?90:60,6);label(ctx,k+' '+GV[k].E.toFixed(2),on?152:122,y,on?T.ink:T.muted,'left','middle',on?'600 12px "IBM Plex Mono",monospace':MONO);});
      const ya=Y(GV[s.an].E),yc=Y(GV[s.ca].E);if(Math.abs(ya-yc)>6){arrow(ctx,w*.58,ya,w*.58,yc,T.ce,3);label(ctx,'E°cell '+fmt(s.E0,2)+' V',w-4,(ya+yc)/2,T.ink,'right','middle',MONO);}label(ctx,'reduction potential',50,6,T.muted,'left','middle',MONO);label(ctx,'higher = wants electrons more',w-4,h-6,T.muted,'right','middle',MONO);}});
  function upd(fromStep){const s=state(xi());setText('gv-cl-out',sci(Math.pow(10,+cl.value),1)+' M');setText('gv-cr-out',sci(Math.pow(10,+cr.value),1)+' M');setText('gv-x-out',Math.round(+xs.value/10)+'%');
    setText('gv-E0',(s.E0>=0?'+':'−')+fmt(Math.abs(s.E0),2)+' V');setText('gv-E',fmt(Math.max(s.E,0),3)+' V');setText('gv-an',s.an);setText('gv-ca',s.ca);setText('gv-Q',sci(s.Q,2));setText('gv-n',s.n+'');const G0=-s.n*FARADAY*s.E0/1000;setText('gv-G',(G0>=0?'+':'−')+fmt(Math.abs(G0),1)+' kJ');setText('gv-K',sci(Math.pow(10,s.n*s.E0/.0592),2));
    const ma=GV[s.an],mc=GV[s.ca];$('#gv-eq').innerHTML=`<span class="ln"><span class="lbl">Anode (oxidation)</span>${s.n/s.na>1?s.n/s.na:''}${s.an} → ${s.n/s.na>1?s.n/s.na:''}${ma.ion} + ${s.n}e⁻</span><span class="ln"><span class="lbl">Cathode (reduction)</span>${s.n/s.nc>1?s.n/s.nc:''}${mc.ion} + ${s.n}e⁻ → ${s.n/s.nc>1?s.n/s.nc:''}${s.ca}</span><span class="ln"><span class="lbl">Overall</span><span class="net">${s.n/s.na>1?s.n/s.na:''}${s.an} + ${s.n/s.nc>1?s.n/s.nc:''}${mc.ion} → ${s.n/s.na>1?s.n/s.na:''}${ma.ion} + ${s.n/s.nc>1?s.n/s.nc:''}${s.ca}</span></span>`;
    if(!fromStep)sim.render();gs.render();}
  [L,Rr].forEach(e=>e.addEventListener('change',()=>{xs.value=0;run=false;$('#gv-go').textContent='Run the cell';upd();}));['gv-cl','gv-cr'].forEach(id=>bindRange(id,()=>'',()=>{xs.value=0;upd();},false));bindRange('gv-x',()=>'',()=>{run=false;upd();},false);
  $('#gv-go').addEventListener('click',()=>{if(+xs.value>=1000)xs.value=0;run=!run;$('#gv-go').textContent=run?'Pause':'Run the cell';upd(true);sim.render();});$('#gv-lab').addEventListener('labreset',()=>{xs.value=0;run=false;$('#gv-go').textContent='Run the cell';upd();});
  upd();drawers.galvanic=upd;
  TIPS['gv-L']='Pick any two metals. The one with the lower reduction potential becomes the anode.';
  TIPS['gv-R']='The metal with the higher reduction potential becomes the cathode.';
  TIPS['gv-cl']='Lower concentration of ions makes that half-cell a stronger electron donor.';
  TIPS['gv-cr']='Concentrations change Q and therefore the voltage (Nernst), not E°.';
  TIPS['gv-x']='Drag or press Run to discharge the cell. E falls to 0 V when Q = K.';
  KEYS['gv-canvas']=['Choose two metals and press Run the cell.',[['ce','electrons'],['#E0A82E','cations in the salt bridge'],['#8B5CF6','anions in the salt bridge']]];
  GLOSS['anode']='The electrode where oxidation occurs.';
  GLOSS['cathode']='The electrode where reduction occurs.';
  GLOSS['salt bridge']='A tube of ions that connects the two half-cells and keeps each solution electrically neutral.';
  GLOSS['Nernst equation']='E = E° − (RT/nF) ln Q: cell potential at non-standard concentrations.';
  GLOSS['standard reduction potential']='The voltage of a half-reaction written as a reduction, measured against the standard hydrogen electrode.';
  TT.galvanic='Run the same cell until it dies, then link E → 0 with Q → K. That ties the whole unit together.';
})();
(function(){
  const POOL=Object.keys(GV);
  const half=k=>`${GV[k].ion} + ${GV[k].z}e⁻ → ${k}`;
  PROBS.push({id:'gal-E0',topic:'galvanic',title:'Standard cell potential',gen(){const [a,b]=POOL.slice().sort(()=>Math.random()-.5).slice(0,2),cath=GV[a].E>GV[b].E?a:b,an=cath===a?b:a,E=GV[cath].E-GV[an].E;
    return {q:`Given the standard reduction potentials ${half(a)} (${GV[a].E>0?'+':''}${GV[a].E.toFixed(2)} V) and ${half(b)} (${GV[b].E>0?'+':''}${GV[b].E.toFixed(2)} V), find E°cell for the galvanic cell built from them.`,ans:E,unit:'V',abs:.011,hint:'The metal with the higher reduction potential is the cathode. E°cell = E°cathode − E°anode.',sol:`Cathode: ${cath}; anode: ${an}. E°<sub>cell</sub> = ${GV[cath].E.toFixed(2)} − (${GV[an].E.toFixed(2)}) = <b>${E.toFixed(2)} V</b>.`};}});
  PROBS.push({id:'gal-anode',topic:'galvanic',title:'Which electrode is the anode?',gen(){const [a,b]=POOL.slice().sort(()=>Math.random()-.5).slice(0,2),an=GV[a].E<GV[b].E?a:b,i=Math.floor(Math.random()*2),ch=[a,b];
    return {q:`A galvanic cell is built from ${a} in ${GV[a].ion} solution (E° = ${GV[a].E>0?'+':''}${GV[a].E.toFixed(2)} V) and ${b} in ${GV[b].ion} solution (E° = ${GV[b].E>0?'+':''}${GV[b].E.toFixed(2)} V). Which metal is the anode?`,choices:ch,ans:ch.indexOf(an),hint:'Oxidation occurs at the anode. The species with the lower reduction potential is the one oxidized.',sol:`<b>${an}</b> has the lower reduction potential, so it is oxidized (anode); electrons flow from ${an} to ${an===a?b:a}.`};}});
  PROBS.push({id:'gal-Nernst',topic:'galvanic',title:'Nernst equation',gen(){const [a,b]=pick([['Zn','Cu'],['Fe','Cu'],['Zn','Ag'],['Ni','Cu'],['Mg','Cu']]),E0=GV[b].E-GV[a].E,n=gvN(GV[a].z,GV[b].z),ca=pick([.010,.10,1.0,2.0]),cb=pick([.0010,.010,.10,1.0]),Q=Math.pow(ca,n/GV[a].z)/Math.pow(cb,n/GV[b].z),E=E0-(.0592/n)*Math.log10(Q);
    return {q:`Cell: ${a}(s) | ${GV[a].ion}(${fmt(ca,3)} M) || ${GV[b].ion}(${fmt(cb,4)} M) | ${b}(s). E° = ${E0.toFixed(2)} V and n = ${n}. What is E at 25 °C?`,ans:E,unit:'V',abs:.011,hint:'E = E° − (0.0592/n) log Q, with Q = [anode ion]^(coef)/[cathode ion]^(coef).',sol:`Q = ${sci(Q,3)}; E = ${E0.toFixed(2)} − (0.0592/${n}) log(${sci(Q,3)}) = <b>${E.toFixed(3)} V</b>.`};}});
  PROBS.push({id:'gal-DG',topic:'galvanic',title:'ΔG° from E°',gen(){const n=pick([1,2,3,6]),E=pick([.46,1.10,.78,.34,1.56,2.05]),G=-n*FARADAY*E/1000;
    return {q:`A cell reaction transfers ${n} mole${n>1?'s':''} of electrons and has E° = ${E.toFixed(2)} V. Calculate ΔG° in kJ per mole of reaction. (F = 96 485 C/mol)`,ans:G,unit:'kJ',tol:.01,hint:'ΔG° = −nFE°. 1 V·C = 1 J.',sol:`ΔG° = −(${n})(96485)(${E.toFixed(2)}) = ${fmt(G*1000,0)} J = <b>${fmt(G,1)} kJ</b>.`};}});
  PROBS.push({id:'gal-K',topic:'galvanic',title:'K from E°',gen(){const n=pick([1,2,3]),E=pick([.10,.25,.46,.78,1.10,-.15]),K=Math.pow(10,n*E/.0592);
    return {q:`A cell reaction has n = ${n} and E° = ${E>0?'+':''}${E.toFixed(2)} V at 25 °C. What is K?`,ans:K,unit:'',tol:.05,hint:'log K = nE°/0.0592.',sol:`log K = (${n})(${E.toFixed(2)})/0.0592 = ${fmt(n*E/.0592,2)}; K = <b>${sci(K,2)}</b>.`};}});
  PROBS.push({id:'gal-conc',topic:'galvanic',title:'Concentration cell',gen(){const m=pick(['Cu','Ag','Zn','Ni']),c1=pick([1.0,.50,.10]),f=pick([.1,.01,.001]),c2=c1*f,n=GV[m].z,E=(.0592/n)*Math.log10(c1/c2);
    return {q:`A concentration cell has two ${m} electrodes in ${GV[m].ion} solutions of ${fmt(c1,2)} M and ${sci(c2,2)} M. What is the cell potential at 25 °C?`,ans:E,unit:'V',abs:.006,hint:'E° = 0. Use E = −(0.0592/n) log Q with Q = [dilute]/[concentrated].',sol:`n = ${n}; Q = ${sci(c2,2)}/${fmt(c1,2)}; E = −(0.0592/${n}) log(${sci(c2/c1,2)}) = <b>${E.toFixed(3)} V</b>. The dilute side is the anode.`};}});
  PROBS.push({id:'gal-flow',topic:'galvanic',title:'Flow in a galvanic cell',gen(){const Q=[['In the external wire of a galvanic cell, electrons flow from…',['anode to cathode','cathode to anode','salt bridge to anode','anode to salt bridge'],0,'electrons leave the anode (oxidation) and arrive at the cathode (reduction)'],['In the salt bridge of a galvanic cell, anions move toward…',['the anode','the cathode','the voltmeter','neither electrode'],0,'oxidation at the anode creates excess positive charge there; anions move in to neutralize it'],['As a galvanic cell runs, the mass of the anode…',['decreases (the metal dissolves)','increases','stays the same','doubles'],0,'the anode metal is oxidized to its ions, which enter the solution'],['As a galvanic cell runs down, the cell potential…',['decreases toward 0 V','increases','stays at E°','becomes negative'],0,'Q rises toward K, and at equilibrium E = 0 V'],['Which electrode is positive in a galvanic cell?',['the cathode','the anode','both','neither'],0,'the cathode is the positive terminal (the anode is negative)']],[q,ch,a,why]=pick(Q);
    return {q,choices:ch,ans:a,hint:'An Ox and Red Cat: oxidation at the anode, reduction at the cathode.',sol:`<b>${ch[a]}</b>: ${why}.`};}});
})();
