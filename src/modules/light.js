
/* ---------------- Light & Beer–Lambert ---------------- */
const H_P=6.626e-34,C_L=2.998e8,N_A=6.022e23,EV=1.602e-19;
function wlRGB(nm){let r=0,g=0,b=0;if(nm>=380&&nm<440){r=-(nm-440)/60;b=1;}else if(nm<490){g=(nm-440)/50;b=1;}else if(nm<510){g=1;b=-(nm-510)/20;}else if(nm<580){r=(nm-510)/70;g=1;}else if(nm<645){r=1;g=-(nm-645)/65;}else if(nm<=700)r=1;
  const f=nm<420?.3+.7*(nm-380)/40:nm>700?.3+.7*(780-nm)/80:1;return [r,g,b].map(x=>Math.round(255*Math.pow(clamp(x*f,0,1),.8)));}
(function light(){
  const cv=$('#lt-canvas');if(!cv)return;
  const REG=[['gamma rays',-13,-11,'#8E6BD0','Produced in nuclear reactions. Energies of about 10⁸ kJ/mol: they break nuclei apart and strip atoms.'],['X-rays',-11,-8,'#5B7DD6','Eject inner-shell (core) electrons. Used in imaging and in X-ray photoelectron spectroscopy.'],['ultraviolet',-8,-6.4,'#7A4DD6','Excites valence electrons; high-energy UV can break bonds. Sunburn is bond damage in skin.'],['visible',-6.4,-6.15,'#4DB06B','Excites valence electrons in many molecules: this is what gives compounds their color.'],['infrared',-6.15,-3,'#D9534F','Makes bonds stretch and bend (molecular vibrations). IR spectroscopy identifies functional groups.'],['microwave',-3,-1,'#E9A23B','Makes whole molecules rotate. Microwave ovens heat the rotation of water molecules.'],['radio waves',-1,4,'#98A2B3','Flip nuclear spins in a magnetic field: the basis of NMR and MRI.']];
  let e=-6.3;
  const regOf=x=>REG.find(r=>x>=r[1]&&x<r[2])||REG[REG.length-1];
  const sim=sim2d(cv,{h:w=>clamp(w*.34,200,260),draw(ctx,w,h,t){const bx=16,bw=w-32,X=v=>bx+(v+12)/15*bw,by=18,bh=36;
      REG.forEach(r=>{const x0=X(Math.max(r[1],-12)),x1=X(Math.min(r[2],3));ctx.fillStyle=alpha(r[3],.35);ctx.fillRect(x0,by,x1-x0,bh);label(ctx,r[0],(x0+x1)/2,by+bh/2,T.ink,'center','middle',w<520?'600 9px "IBM Plex Mono",monospace':'600 11px "IBM Plex Mono",monospace');});
      for(let nm=400;nm<=700;nm+=4){const c=wlRGB(nm),x0=X(Math.log10(nm*1e-9)),x1=X(Math.log10((nm+4)*1e-9));ctx.fillStyle=`rgb(${c})`;ctx.fillRect(x0,by+bh+2,x1-x0+.5,8);}
      ctx.strokeStyle=T.line;ctx.fillStyle=T.muted;ctx.font=MONO;ctx.textAlign='center';ctx.textBaseline='top';[-12,-9,-6,-3,0,3].forEach(v=>{ctx.beginPath();ctx.moveTo(X(v),by+bh+14);ctx.lineTo(X(v),by+bh+19);ctx.stroke();ctx.fillText('10'+String(v).replace('-','⁻').replace(/\d/g,d=>SUP[d]),X(v),by+bh+21);});
      const mx=X(e);ctx.fillStyle=T.ink;ctx.beginPath();ctx.moveTo(mx,by+bh+12);ctx.lineTo(mx-7,by+bh+24);ctx.lineTo(mx+7,by+bh+24);ctx.fill();label(ctx,'wavelength (m)',w-16,by+bh+38,T.muted,'right','top',MONO);
      /* the wave: drawn with a wavelength that follows the slider (compressed so it is always visible) */
      const wy=h-48,lam=clamp(8*Math.pow(10,(e+8)*.3),4,w*.8),nm=Math.pow(10,e)*1e9,col=nm>=380&&nm<=780?`rgb(${wlRGB(nm)})`:regOf(e)[3];
      ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();for(let x=0;x<=w;x+=2){const y=wy+Math.sin((x/lam-t*1.6)*6.2832)*26;x?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();
      label(ctx,'wave drawn compressed to fit',8,h-6,T.muted,'left','bottom',MONO);}});
  function upd(){const lam=Math.pow(10,e),nu=C_L/lam,E=H_P*nu,R=regOf(e);const sup=n=>String(n).split('').map(c=>SUP[c]).join('');
    $('#lt-w-out').textContent=lam>=1?fmt(lam,1)+' m':lam>=1e-3?fmt(lam*1e3,1)+' mm':lam>=1e-6?fmt(lam*1e6,2)+' µm':lam>=1e-9?fmt(lam*1e9,1)+' nm':fmt(lam*1e12,1)+' pm';
    setText('lt-reg',R[0]);setText('lt-nu',sci(nu,2)+' Hz');setText('lt-ej',sci(E,2)+' J');setText('lt-ek',sci(E*N_A/1000,2)+' kJ/mol');setText('lt-use',R[4]);sim.render();}
  $('#lt-w').addEventListener('input',()=>{e=+$('#lt-w').value;upd();});upd();
  /* ---- photoelectric ---- */
  const MET={Cs:2.14,K:2.30,Zn:4.33,Cu:4.65};const pm=$('#pe2-m');pm.innerHTML=Object.keys(MET).map(k=>`<option value="${k}">${k}: Φ = ${MET[k]} eV</option>`).join('');pm.value='Cs';
  let fq=4,inten=4,ph=[],el=[],em=0,tn=0;const pc=$('#pe2-canvas');
  const sim2=sim2d(pc,{h:w=>clamp(w*.42,230,300),step(dt){const w=pc.clientWidth,h=pc.clientHeight||260,E=H_P*fq*1e14/EV,phi=MET[pm.value],KE=E-phi;em+=dt*inten*1.4;
      while(em>1){em-=1;ph.push({x:20,y:h*.2+Math.random()*h*.55,hit:false});}
      ph.forEach(p=>{p.x+=dt*230;if(!p.hit&&p.x>w*.62){p.hit=true;p.dead=true;if(KE>0)el.push({x:p.x,y:p.y,vx:Math.sqrt(KE)*60+20,vy:-30+Math.random()*60,age:0});}});ph=ph.filter(p=>!p.dead);
      el.forEach(q=>{q.x+=q.vx*dt*.7;q.y+=q.vy*dt*.7;q.age+=dt;q.vx*=-1*0+1;});el=el.filter(q=>q.x<w+10&&q.y>0&&q.y<h&&q.age<4);},
    draw(ctx,w,h,t){const E=H_P*fq*1e14/EV,phi=MET[pm.value],KE=E-phi,nm=C_L/(fq*1e14)*1e9,col=nm>=380&&nm<=780?`rgb(${wlRGB(nm)})`:nm<380?'#8E6BD0':'#D9534F';
      ctx.fillStyle=T.muted;ctx.fillRect(w*.62,h*.1,26,h*.8);ctx.fillStyle=alpha(T.ink,.4);ctx.fillRect(w*.62+26,h*.1,6,h*.8);label(ctx,pm.value,w*.62+13,h*.5,'#fff','center','middle','700 14px "IBM Plex Sans",sans-serif');
      ph.forEach(p=>{ctx.strokeStyle=col;ctx.lineWidth=2.5;ctx.beginPath();for(let k=0;k<16;k++){const x=p.x-k*2,y=p.y+Math.sin(k*(.35+fq*.05)-t*20)*(5-k*.2);k?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();});
      el.forEach(q=>{ball2(ctx,q.x,q.y,5,T.ce);});
      label(ctx,KE>0?'electrons ejected with KE = '+KE.toFixed(2)+' eV':'photons are absorbed or reflected: no electrons escape',w*.5,10,KE>0?T.good:T.hot,'center','top','600 13px "IBM Plex Mono",monospace');
      label(ctx,'photon energy '+E.toFixed(2)+' eV  vs  work function '+phi+' eV',w*.5,h-8,T.muted,'center','bottom',MONO);}});
  function upd2(){const E=H_P*fq*1e14/EV,phi=MET[pm.value],KE=E-phi;$('#pe2-f-out').textContent=fmt(fq,1)+' × 10¹⁴ Hz';$('#pe2-i-out').textContent=inten;
    setText('pe2-e',E.toFixed(2)+' eV');setText('pe2-w',phi+' eV');setText('pe2-k',KE>0?KE.toFixed(2)+' eV ('+sci(KE*EV,2)+' J)':'none');setText('pe2-th',sci(phi*EV/H_P,2)+' Hz');
    setText('pe2-msg',KE>0?'Each photon has enough energy to free one electron; the extra becomes kinetic energy. More intense light frees more electrons, with the same energy each.':'Each photon is too weak to free an electron. Making the light brighter sends more photons but never gives one photon more energy, so nothing happens.');sim2.render();}
  $('#pe2-f').addEventListener('input',()=>{fq=+$('#pe2-f').value;upd2();});$('#pe2-i').addEventListener('input',()=>{inten=+$('#pe2-i').value;upd2();});pm.addEventListener('change',upd2);upd2();
  /* ---- Beer-Lambert ---- */
  const DYE={'crystal violet':{eps:8.7e4,cmax:2e-5,nm:590,col:[120,40,180]},'KMnO₄':{eps:2.4e3,cmax:5e-4,nm:525,col:[150,30,120]},'Cu²⁺(aq)':{eps:12,cmax:.5,nm:810,col:[80,150,220]}};
  const bd=$('#bl-d');bd.innerHTML=Object.keys(DYE).map(k=>`<option value="${k}">${k} (ε = ${sci(DYE[k].eps,1)} M⁻¹cm⁻¹ at ${DYE[k].nm} nm)</option>`).join('');
  let bph=[],bem=0,passed=0,sent=0;const bc=$('#bl-canvas');
  const cur=()=>{const d=DYE[bd.value],c=+$('#bl-c').value*d.cmax,b=+$('#bl-b').value,A=d.eps*b*c;return {d,c,b,A};};
  const simB=sim2d(bc,{h:w=>clamp(w*.5,230,280),step(dt){const {d,c,b,A}=cur();bem+=dt*14;while(bem>1){bem-=1;const u=Math.random(),dist=c>0?-Math.log(1-u)/(Math.LN10*d.eps*c):1e9;bph.push({x:36,abs:dist<b?dist/b:2,dead:false});sent++;}
      const w=bc.clientWidth,x0=w*.28,x1=w*.28+clamp(b*34,30,150);bph.forEach(p=>{p.x+=dt*180;const fr=clamp((p.x-x0)/(x1-x0),0,2);if(!p.dead&&p.abs<2&&fr>=p.abs&&fr<2){p.dead=true;}if(p.x>w-24&&!p.counted&&!p.dead){p.counted=true;passed++;}});bph=bph.filter(p=>p.x<w-14&&!(p.dead&&p.x>w));
      if(sent>400){sent=Math.round(sent/2);passed=Math.round(passed/2);}},
    draw(ctx,w,h,t){const {d,c,b,A}=cur(),cy=h*.5,x0=w*.28,len=clamp(b*34,30,150),x1=x0+len,T0=Math.pow(10,-A);
      ctx.fillStyle=T.muted;ctx.fillRect(8,cy-14,28,28);label(ctx,'lamp',22,cy+20,T.muted,'center','top',MONO);ctx.fillStyle=T.ink;ctx.fillRect(w-24,cy-18,16,36);label(ctx,'detector',w-16,cy+24,T.muted,'center','top',MONO);
      ctx.fillStyle=`rgba(${d.col},${clamp(.06+c/d.cmax*.6,.05,.75)})`;ctx.fillRect(x0,cy-34,len,68);ctx.strokeStyle=T.ink;ctx.lineWidth=2;ctx.strokeRect(x0+.5,cy-34.5,len,69);label(ctx,'cuvette, b = '+b+' cm',x0+len/2,cy-42,T.ink,'center','bottom',MONO);
      const nm=d.nm,pc2=`rgb(${wlRGB(nm>700?650:nm)})`;bph.forEach(p=>{if(p.dead)return;ctx.fillStyle=pc2;ctx.beginPath();ctx.arc(p.x,cy+((p.id=p.id||Math.random())*24)-12,3,0,7);ctx.fill();});
      label(ctx,'I₀ = 100%',8,10,T.muted,'left','top',MONO);label(ctx,'I = '+(T0*100).toFixed(T0<.1?2:1)+'%',w-8,10,T.hot,'right','top','600 12px "IBM Plex Mono",monospace');}});
  const bg=$('#bl-graph'),simG=sim2d(bg,{h:w=>clamp(w*.5,230,280),draw(ctx,w,h){const {d,c,b,A}=cur(),Amax=d.eps*4*d.cmax;const P=panel(ctx,{x:44,y:12,w:w-58,h:h-46},[0,1],[0,2],{xn:4,yn:4,xlabel:'concentration (fraction of '+sci(d.cmax,1)+' M)',ylabel:'absorbance A',color:T.ink});
      line(ctx,P,0,0,1,Math.min(d.eps*b*d.cmax,2),T.cx,2.6);if(d.eps*b*d.cmax>2)line(ctx,P,2/(d.eps*b*d.cmax),2,1,2,T.cx,0);dot(ctx,P.X(c/d.cmax),P.Y(Math.min(A,2)),6.5,T.hot,T.surface);if(A>2)label(ctx,'off the scale',P.X(c/d.cmax),P.Y(2)+14,T.hot,'center','top',MONO);
      line(ctx,P,0,1,1,1,T.muted,1,[4,4]);label(ctx,'A = 1 (keep below this for accuracy)',P.box.x+6,P.Y(1)-4,T.muted,'left','bottom',MONO);}});
  function updB(){const {d,c,b,A}=cur();$('#bl-c-out').textContent=sci(c,2)+' M';$('#bl-b-out').textContent=b+' cm';setText('bl-a',A.toFixed(3));setText('bl-t',(Math.pow(10,-A)*100).toFixed(1)+' %');sent=0;passed=0;bph=[];simB.render();simG.render();}
  ['bl-c','bl-b'].forEach(id=>$('#'+id).addEventListener('input',updB));bd.addEventListener('change',updB);setInterval(()=>{if(current==='light')setText('bl-m',sent>20?(passed/Math.max(sent-3,1)*100).toFixed(0)+' % of the photons':'counting…');},500);updB();
  drawers.light=()=>{sim.render();sim2.render();simB.render();simG.render();};
  TIPS['lt-w']='Slide across the spectrum: shorter wavelength means higher frequency and more energy per photon.';
  TIPS['pe2-f']='Only the frequency of the light (the energy of each photon) decides whether electrons escape.';
  TIPS['pe2-i']='Intensity is the number of photons per second: more electrons, but the same energy each.';
  TIPS['bl-c']='More dye in the path absorbs more photons: A rises in direct proportion.';
  TIPS['bl-b']='A longer path means more dye along the beam, so more absorption: A is proportional to b.';
  KEYS['bl-canvas']=['Change the concentration and the path length and watch the photons.',[['hot','light that survives (I/I₀)']]];
  GLOSS['photon']='A packet of light energy, E = hν.';
  GLOSS['absorbance']='A = −log(I/I₀). It is proportional to concentration and path length.';
  GLOSS['wavelength']='The distance between successive wave crests; shorter wavelength means more energetic light.';
  TT.light='Keep the three labs distinct: the spectrum is about photon energy, the photoelectric effect shows that energy comes in packets, Beer\'s law is about counting absorbing particles. The straight-line A versus c plot is the key to every spectrophotometry lab.';
})();
(function(){
  PROBS.push({id:'lt-energy',topic:'light',title:'Energy of a photon',gen(){const nm=ri(200,750),E=H_P*C_L/(nm*1e-9);
    return {q:`What is the energy of one photon of light with wavelength ${nm} nm? (h = 6.626 × 10⁻³⁴ J·s, c = 2.998 × 10⁸ m/s. Answer in joules, like 3.2e-19.)`,ans:E,unit:'J',tol:.02,hint:'Convert nm to m, then E = hc/λ.',sol:`E = (6.626 × 10⁻³⁴)(2.998 × 10⁸) / (${nm} × 10⁻⁹) = <b>${sci(E,3)} J</b>.`};}});
  PROBS.push({id:'lt-freq',topic:'light',title:'Frequency from wavelength',gen(){const nm=ri(100,900),nu=C_L/(nm*1e-9);
    return {q:`What is the frequency of light with a wavelength of ${nm} nm? (c = 2.998 × 10⁸ m/s. Answer in Hz, like 6.0e14.)`,ans:nu,unit:'Hz',tol:.02,hint:'c = λν, so ν = c/λ. Convert nm to m first.',sol:`ν = (2.998 × 10⁸) / (${nm} × 10⁻⁹) = <b>${sci(nu,3)} Hz</b>.`};}});
  PROBS.push({id:'lt-photoelectric',topic:'light',title:'Photoelectric effect',gen(){const phi=ri(25,50)/10*1e-19,nm=ri(150,260),E=H_P*C_L/(nm*1e-9),KE=E-phi;
    if(KE<=0)return PROBS.find(p=>p.id==='lt-photoelectric').gen();
    return {q:`The work function of a metal is ${sci(phi,2)} J. Light of wavelength ${nm} nm strikes it. What is the maximum kinetic energy of the ejected electrons? (h = 6.626 × 10⁻³⁴ J·s, c = 2.998 × 10⁸ m/s.)`,ans:KE,unit:'J',tol:.03,hint:'KE = hν − Φ, where hν = hc/λ.',sol:`hν = ${sci(E,3)} J; KE = ${sci(E,3)} − ${sci(phi,2)} = <b>${sci(KE,3)} J</b>.`};}});
  PROBS.push({id:'lt-beer',topic:'light',title:"Beer's law",gen(){const eps=pick([1500,3200,8500,12000,25000]),b=pick([1,1,2,0.5]),A=ri(10,90)/100,c=A/(eps*b);
    return {q:`A solution in a ${b}-cm cuvette has an absorbance of ${A.toFixed(2)} at a wavelength where ε = ${eps.toLocaleString('en-US')} M⁻¹cm⁻¹. What is its concentration? (Answer like 4.5e-5.)`,ans:c,unit:'M',tol:.02,hint:'A = εbc, so c = A/(εb).',sol:`c = ${A.toFixed(2)} / (${eps} × ${b}) = <b>${sci(c,3)} M</b>.`};}});
})();
