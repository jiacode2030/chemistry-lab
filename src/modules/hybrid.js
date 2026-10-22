
/* ---------------- Hybridization, sigma and pi bonds ---------------- */
(function hybrid(){
  const cvA=$('#hy-canvas'),cvE=$('#hy-energy');if(!cvA)return;
  const HY={3:{name:'sp³',n:4,dirs:IDEAL[4],mix:[[1,0,0],[0,1,0],[0,0,1]],left:[],ang:'109.5°',ex:'CH₄, NH₃, H₂O, the C in C₂H₆'},2:{name:'sp²',n:3,dirs:IDEAL[3],mix:[[1,0,0],[0,1,0]],left:[[0,0,1]],ang:'120°',ex:'BF₃, C₂H₄, CH₂O, SO₂'},1:{name:'sp',n:2,dirs:IDEAL[2],mix:[[1,0,0]],left:[[0,1,0],[0,0,1]],ang:'180°',ex:'CO₂, HCN, C₂H₂, BeCl₂'}};
  let k=3,m=0,target=0,lastT=null;
  const LP=1.25,LH=1.55;
  const v3=view3d(cvA,{yaw:-.8,pitch:.4,dist:6,target:[0,0,0],min:3,max:12,height:w=>clamp(w*.8,270,360),scene:(S,t)=>{
    const dt=t==null||lastT==null?0:Math.min(.05,Math.max(0,t-lastT));lastT=t==null?null:t;if(m!==target){m+=Math.sign(target-m)*Math.min(Math.abs(target-m),dt*.55);if(Math.abs(m-target)<1e-3)m=target;$('#hy-mix').value=m;$('#hy-mix-out').textContent=Math.round(m*100)+'%';updE();}
    const H=HY[k],e=m*m*(3-2*m);/* smooth */
    S.ball([0,0,0],.6*(1-.35*e),T.hot,.5*(1-e)+.04,false);
    H.mix.forEach(a=>{[1,-1].forEach(s=>S.lobe([0,0,0],V3.mul(a,s),LP,.42,T.cx,.55*(1-e)+.02));});
    H.dirs.forEach(d=>{S.lobe([0,0,0],d,.3+(LH-.3)*e,.1+.42*e,T.cv,.62*e+.01);S.lobe([0,0,0],V3.mul(d,-1),.15+.4*e,.06+.2*e,T.ce,.5*e);});
    H.left.forEach(a=>[1,-1].forEach(s=>S.lobe([0,0,0],V3.mul(a,s),LP,.42,T.ca,.6)));
    S.atom([0,0,0],.12,T.ink);
    S.text([0,0,-2],e<.5?'s + p orbitals':H.name+' hybrids',T.muted,MONO);}});
  const simE=sim2d(cvE,{h:()=>clamp(cvA.clientWidth*.8,270,360),draw(ctx,w,h){const H=HY[k],e=m*m*(3-2*m),nP=H.mix.length,Es=0,Ep=1,Eh=(Es+nP*Ep)/(1+nP),bot=h-30,top=24,Y=E=>bot-(E-0)/1.15*(bot-top-6);
      ctx.strokeStyle=T.line;ctx.beginPath();ctx.moveTo(40,top);ctx.lineTo(40,bot);ctx.stroke();label(ctx,'energy',40,top-8,T.muted,'center','bottom',MONO);
      const lvl=(x,E,col,txt,ups)=>{ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,Y(E));ctx.lineTo(x+34,Y(E));ctx.stroke();if(ups){ctx.fillStyle=T.ce;ctx.font='600 18px "IBM Plex Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText('↑',x+17,Y(E)-1);}label(ctx,txt,x+17,Y(E)+6,col,'center','top',MONO);};
      const n=H.n+H.left.length,x0=Math.max(52,(w-n*52)/2+20);let c=0;
      lvl(x0+c++*52,Es+(Eh-Es)*e,e>.5?T.cv:T.hot,e>.5?H.name:'2s',true);
      H.mix.forEach(()=>{lvl(x0+c++*52,Ep+(Eh-Ep)*e,e>.5?T.cv:T.cx,e>.5?H.name:'2p',true);});
      H.left.forEach(()=>{lvl(x0+c++*52,Ep,T.ca,'2p',true);});
      label(ctx,'one electron in each orbital (carbon)',w/2,h-8,T.muted,'center','bottom',MONO);}});
  function updE(){simE.render();}
  function setK(n){k=n;m=0;target=0;$('#hy-mix').value=0;$('#hy-mix-out').textContent='0%';const H=HY[k];setText('hy-n',H.n+' '+H.name);setText('hy-ang',H.ang);setText('hy-p',H.left.length);setText('hy-ex',H.ex);v3.render();simE.render();}
  segBind('hy-type','k',x=>setK(+x));
  bindRange('hy-mix',x=>Math.round(x*100)+'%',x=>{m=x;target=x;simE.render();v3.render();},false);
  $('#hy-go').addEventListener('click',()=>{target=m>.5?0:1;$('#hy-go').textContent=target?'Un-mix':'Mix them';v3.render();});
  setK(3);
  /* ---------- Lab B: twist ---------- */
  const cvB=$('#hs-canvas'),cvF=$('#hs-energy');let mol='c2h4',tw=0;
  const BONDL={c2h6:.77,c2h4:.67,c2h2:.6},EN_ONLY=()=>mol==='c2h2';
  const rotX=(v,a)=>[v[0],v[1]*Math.cos(a)-v[2]*Math.sin(a),v[1]*Math.sin(a)+v[2]*Math.cos(a)];
  function geom(){const d=BONDL[mol],a=tw*D2R,C1=[-d,0,0],C2=[d,0,0],H=[];
    if(mol==='c2h6'){const s=.9428;[0,120,240].forEach(p=>{const r=p*D2R;H.push({c:0,v:[-1/3,s*Math.cos(r),s*Math.sin(r)]});H.push({c:1,v:[1/3,s*Math.cos(r+a),s*Math.sin(r+a)]});});}
    else if(mol==='c2h4'){const x=-.5225,y=.8526;[[1,1],[1,-1]].forEach(([_,sy])=>{H.push({c:0,v:[x,sy*y,0]});H.push({c:1,v:rotX([-x,sy*y,0],a)});});}
    else{H.push({c:0,v:[-1,0,0]});H.push({c:1,v:[1,0,0]});}
    return {C1,C2,H,d};}
  const lens={c2h6:1.09,c2h4:1.09,c2h2:1.06};
  const v3b=view3d(cvB,{yaw:-.9,pitch:.45,dist:6.2,target:[0,0,0],min:3,max:12,height:w=>clamp(w*.8,270,360),scene:(S,t)=>{
    const G=geom(),a=tw*D2R,cen=[G.C1,G.C2];
    /* sigma framework: bonds and hybrid lobes */
    S.bond(G.C1,G.C2,.1,atomCol('C'),atomCol('C'),1,.1);
    S.lobe(G.C1,[1,0,0],G.d*1.25,.28,T.cv,.45);S.lobe(G.C2,[-1,0,0],G.d*1.25,.28,T.cv,.45);
    G.H.forEach(h=>{const c=cen[h.c],L=lens[mol],p=V3.add(c,V3.mul(h.v,L));S.bond(c,p,.07,atomCol('C'),atomCol('H'),1,.1);S.lobe(c,h.v,L*.85,.2,T.cv,.35);S.atom(p,.2,atomCol('H'));});
    S.atom(G.C1,.28,atomCol('C'));S.atom(G.C2,.28,atomCol('C'));
    /* pi: left p orbitals fixed, right ones rotate with the twist */
    const pairs=mol==='c2h4'?[[[0,0,1]]]:mol==='c2h2'?[[[0,0,1]],[[0,1,0]]]:[];
    if(mol==='c2h4'){const nl=[0,0,1],nr=rotX([0,0,1],a),ov=Math.abs(Math.cos(a));
      [1,-1].forEach(s=>{S.lobe(G.C1,V3.mul(nl,s),1.15,.4,T.cx,.55);S.lobe(G.C2,V3.mul(nr,s),1.15,.4,T.ca,.55);});
      /* overlap bridge: lines joining matching lobe tips, thicker with more overlap */
      [1,-1].forEach(s=>{S.line(V3.add(G.C1,V3.mul(nl,.9*s)),V3.add(G.C2,V3.mul(nr,.9*s)),T.ce,1+9*ov);});}
    if(mol==='c2h2'){[[0,0,1],[0,1,0]].forEach((n,i)=>{const nr=rotX(n,a);[1,-1].forEach(s=>{S.lobe(G.C1,V3.mul(n,s),1.0,.34,i?T.hot:T.cx,.5);S.lobe(G.C2,V3.mul(nr,s),1.0,.34,i?T.hot:T.ca,.5);});});}
    if(mol==='c2h6')S.text([0,0,-1.9],'sigma bond only: the two ends can spin',T.muted,MONO);}});
  const energy=(m2,a)=>m2==='c2h4'?135*(1-Math.cos(2*a*D2R)):m2==='c2h6'?6*(1+Math.cos(3*a*D2R)):0;
  const simF=sim2d(cvF,{h:()=>clamp(cvB.clientWidth*.8,270,360),draw(ctx,w,h){const ymax=mol==='c2h4'?300:mol==='c2h6'?15:15,box={x:48,y:14,w:w-62,h:h-52};
      const P=panel(ctx,box,[0,180],[0,ymax],{xn:6,yn:4,xlabel:'twist angle (°)',ylabel:'energy (kJ/mol)',color:T.ink});curve(ctx,P,x=>energy(mol,x),0,180,T.hot,2.6,361);
      dot(ctx,P.X(tw),P.Y(energy(mol,tw)),6,T.surface,T.hot);if(mol==='c2h4')label(ctx,'barrier ≈ 270 kJ/mol',P.X(112),P.Y(262),T.hot,'left','middle',MONO);if(mol==='c2h6')label(ctx,'barrier ≈ 12 kJ/mol',P.X(60),P.Y(12)-8,T.hot,'left','bottom',MONO);if(mol==='c2h2')label(ctx,'no change: cylinder of π density',P.X(90),P.Y(ymax*.5),T.muted,'center','middle',MONO);}});
  drawers.hybrid=()=>{v3.render();simE.render();v3b.render();simF.render();};
  function updB(){const e=energy(mol,tw);setText('hs-b',{c2h6:'1 σ',c2h4:'1 σ + 1 π',c2h2:'1 σ + 2 π'}[mol]);setText('hs-ov',mol==='c2h6'?'no π bond':mol==='c2h4'?Math.round(Math.abs(Math.cos(tw*D2R))*100)+' %':'100 % (always)');setText('hs-e',e<.5?'about 0':fmt(e,e<10?1:0)+' kJ/mol');$('#hs-tw-out').textContent=tw+'°';
    setText('hs-why',{c2h6:'Only a σ bond joins the carbons. Head-on overlap does not depend on how the ends are turned, so the CH₃ groups spin almost freely (a small bump of about 12 kJ/mol when the hydrogens eclipse).',c2h4:'The π bond needs the two p orbitals parallel. Twisting turns them away from each other until, at 90°, there is no overlap and the π bond is broken. That costs a lot of energy, so the double bond is rigid. This is why cis and trans isomers exist.',c2h2:'The two π bonds form a cylinder of electron density around the C–C axis, so twisting changes nothing.'}[mol]);simF.render();v3b.render();}
  bindRange('hs-tw',x=>x+'°',x=>{tw=x;updB();},false);
  segBind('hs-mol','k',x=>{mol=x;tw=0;$('#hs-tw').value=0;$('#hs-tw').disabled=mol==='c2h2';updB();});
  updB();
  TIPS['hy-type:3']='Four regions of electron density: one s and three p orbitals mix into four sp³ orbitals.';
  TIPS['hy-type:2']='Three regions: one s and two p make three sp² orbitals; one p stays out of the mix.';
  TIPS['hy-type:1']='Two regions: one s and one p make two sp orbitals; two p orbitals stay out of the mix.';
  TIPS['hy-mix']='Slide to blend: the s and p levels meet at a common energy and the lobes reshape into hybrids.';
  TIPS['hs-tw']=()=>mol==='c2h4'?'Twisting the double bond pulls the p orbitals out of line: less overlap and a much higher energy.':mol==='c2h6'?'The single bond can rotate with only a small energy change.':'Nothing to twist: the two π bonds are symmetric around the axis.';
  KEYS['hy-canvas']=['Press Mix them, or drag the slider, then spin the view.',[['hot','s orbital'],['cx','p orbitals'],['cv','sp hybrids'],['ca','left-over p orbital']]];
  KEYS['hs-canvas']=['Move the twist slider and watch the lobes on the right-hand carbon turn.',[['cv','σ overlap (along the bond)'],['cx','p orbital, left carbon'],['ca','p orbital, right carbon'],['ce','π overlap']]];
  GLOSS['hybridization']='Mixing atomic orbitals (s and p) on one atom into new, equivalent hybrid orbitals.';
  GLOSS['sigma']='A bond formed by head-on overlap along the line between the nuclei. Every single bond is a σ bond.';
  GLOSS['pi']='A bond formed by sideways overlap of p orbitals above and below the bond axis. Double and triple bonds contain π bonds.';
  TT.hybrid='Use the regions-of-electron-density count from VSEPR as the key: it gives the hybridization directly. A modeling-clay demonstration of the rigidity of C=C versus C–C is memorable.';
})();
(function(){
  const HYB=[['CO₂',"C",'sp'],['BF₃','B','sp²'],['CH₄','C','sp³'],['NH₃','N','sp³'],['H₂O','O','sp³'],['C₂H₄','each C','sp²'],['C₂H₂','each C','sp'],['SO₂','S','sp²'],['HCN','C','sp'],['CH₂O','C','sp²'],['NO₃⁻','N','sp²'],['NH₄⁺','N','sp³'],['CO₃²⁻','C','sp²'],['CS₂','C','sp'],['PH₃','P','sp³']];
  PROBS.push({id:'hy-which',topic:'hybrid',title:'Hybridization of an atom',gen(){const [f,a,h]=pick(HYB),ch=['sp','sp²','sp³'];
    return {q:`What is the hybridization of the ${a==='each C'?'carbon atoms':a+' atom'} in ${f}?`,choices:ch,ans:ch.indexOf(h),hint:'Count the regions of electron density around the atom (bonded atoms plus lone pairs; multiple bonds count once): 2 → sp, 3 → sp², 4 → sp³.',
      sol:`${a==='each C'?'Each carbon':'The '+a} has ${{sp:2,'sp²':3,'sp³':4}[h]} regions of electron density, so it is <b>${h}</b>.`};}});
  const BONDS=[['C₂H₄',5,1],['C₂H₂',3,2],['HCN',2,2],['CO₂',2,2],['CH₂O',3,1],['N₂',1,2],['C₂H₆',7,0],['CH₃CHO (acetaldehyde)',6,1],['C₃H₆ (propene, CH₃–CH=CH₂)',8,1],['CH₃COOH (acetic acid)',7,1],['HCOOH (formic acid)',4,1],['CH₃CN (acetonitrile)',5,2]];
  PROBS.push({id:'hy-bonds',topic:'hybrid',title:'Count σ and π bonds',gen(){const [f,s,p]=pick(BONDS),kind=pick(['σ','π']),ans=kind==='σ'?s:p;
    return {q:`How many ${kind} bonds are in a molecule of ${f}?`,ans,unit:`${kind} bonds`,abs:.01,hint:'Draw the Lewis structure. Every bond has one σ; each extra bond in a double bond is a π, and a triple bond has two π.',
      sol:`${f} has <b>${s} σ</b> and <b>${p} π</b> bonds. (Every bond contains one σ; double bonds add one π, triple bonds add two.)`};}});
  PROBS.push({id:'hy-angle',topic:'hybrid',title:'Angle between hybrid orbitals',gen(){const [h,ang]=pick([['sp',180],['sp²',120],['sp³',109.5]]),ch=['180°','120°','109.5°','90°'];
    return {q:`What is the angle between two ${h} hybrid orbitals on the same atom?`,choices:ch,ans:ch.indexOf(ang+'°'),hint:'sp: two orbitals, as far apart as possible; sp²: a flat triangle; sp³: a tetrahedron.',sol:`${h} hybrids are arranged ${h==='sp'?'in a line':h==='sp²'?'in a flat triangle':'at the corners of a tetrahedron'}: <b>${ang}°</b>.`};}});
})();
