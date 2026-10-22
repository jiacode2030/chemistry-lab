
/* ---------------- Types of solids ---------------- */
(function solids(){
  const cv=$('#sd-canvas');if(!cv)return;
  const INFO={ionic:{p:'Na⁺ and Cl⁻ ions',h:'attraction between opposite charges (ionic bonds)',mp:'801 °C (NaCl)',Tm:1074},metal:{p:'Cu²⁺-like cations in a sea of electrons',h:'metallic bonding: delocalized electrons',mp:'1085 °C (Cu)',Tm:1358},net:{p:'carbon atoms',h:'covalent bonds throughout the crystal',mp:'about 3550 °C (diamond, under pressure)',Tm:3850},mol:{p:'CO₂ molecules',h:'weak intermolecular forces (dispersion)',mp:'−78 °C sublimes (CO₂); I₂ melts at 114 °C',Tm:230}};
  let type='ionic',shear=0,Tk=300,cache={};
  function build(k){if(cache[k])return cache[k];let A=[],B=[];
    if(k==='ionic'){for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let l=0;l<3;l++){const pos=(i+j+l)%2===0;A.push({p:[i-1,j-1,l-1],r:pos?.17:.27,c:pos?'#3E63DD':'#2FB55A',top:l===2,s:pos?'+':'−'});}
      for(let x=0;x<A.length;x++)for(let y=x+1;y<A.length;y++)if(Math.abs(V3.len(V3.sub(A[x].p,A[y].p))-1)<.01)B.push([A[x],A[y]]);}
    else if(k==='metal'){const z=[0,.8165,1.633];for(let L=0;L<3;L++)for(let a=0;a<3;a++)for(let b=0;b<3;b++){const off=L===1?[.5,.2887]:[0,0];A.push({p:[a+.5*b+off[0]-1.25,b*.866+off[1]-.9,z[L]-.8],r:.42,c:'#C77A3B',top:L===2});}}
    else if(k==='net'){const a=2.3,bas=[[0,0,0],[.5,.5,0],[.5,0,.5],[0,.5,.5],[.25,.25,.25],[.75,.75,.25],[.75,.25,.75],[.25,.75,.75]];
      for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let l=0;l<2;l++)bas.forEach(b=>{const p=[i+b[0],j+b[1],l+b[2]];if(p.every(x=>x<=1.001)&&!A.some(q=>V3.len(V3.sub(q.p,p.map(x=>(x-.5)*a)))<.01))A.push({p:p.map(x=>(x-.5)*a),r:.2,c:'#4A5160',top:p[2]>.7});});
      for(let x=0;x<A.length;x++)for(let y=x+1;y<A.length;y++)if(Math.abs(V3.len(V3.sub(A[x].p,A[y].p))-a*.433)<.03)B.push([A[x],A[y]]);A=A.filter(q=>B.some(b=>b[0]===q||b[1]===q));}
    else{const dirs=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>V3.norm(v));let n=0;for(let i=0;i<2;i++)for(let j=0;j<2;j++)for(let l=0;l<2;l++){const c=[(i-.5)*2.3,(j-.5)*2.3,(l-.5)*2.3],d=dirs[n++%4];
      const C={p:c,r:.2,c:'#4A5160',top:l===1,mol:true},O1={p:V3.add(c,V3.mul(d,.62)),r:.22,c:'#E5484D',top:l===1,mol:true},O2={p:V3.sub(c,V3.mul(d,.62)),r:.22,c:'#E5484D',top:l===1,mol:true};A.push(C,O1,O2);B.push([C,O1],[C,O2]);}}
    A.forEach((a,i)=>{a.p0=a.p;a.ph=i*1.7;});return cache[k]={A,B};}
  const v3=view3d(cv,{yaw:-.8,pitch:.4,dist:7.5,target:[0,0,0],min:4,max:16,height:w=>clamp(w*.55,300,420),scene:(S,t)=>{
    const {A,B}=build(type),info=INFO[type],melted=Tk>info.Tm,amp=(.012+Tk/info.Tm*.06)*(melted?1+(Tk/info.Tm-1)*6:1),tt=t||0;
    let cracked=type==='ionic'&&shear>.5,dxTop=type==='net'?Math.min(shear,.06):shear;if(cracked)dxTop=shear+(shear-.5)*1.4;
    const pos=new Map();A.forEach(a=>{let p=V3.add(a.p0,[0,0,0]);if(a.top)p=V3.add(p,[dxTop,0,cracked?.35:0]);
      const j=amp*(melted?2.2:1);p=V3.add(p,[Math.sin(tt*5+a.ph)*j,Math.sin(tt*4.3+a.ph*1.3)*j,Math.cos(tt*4.7+a.ph*.7)*j]);pos.set(a,p);});
    if(!melted){B.forEach(([a,b])=>{const pa=pos.get(a),pb=pos.get(b),stretched=V3.len(V3.sub(pb,pa))>V3.len(V3.sub(b.p0,a.p0))*1.08;if(type==='net'||type==='mol')S.bond(pa,pb,.07,a.c,b.c,type==='mol'?2:1,.1);else S.line(pa,pb,stretched?T.bad:T.line,stretched?2.4:1.2);});}
    if(type==='metal'&&!melted)for(let e=0;e<26;e++){const ph=e*2.1;S.ball([Math.sin(tt*1.3+ph)*1.9,Math.cos(tt*1.1+ph*1.3)*1.4,Math.sin(tt*.9+ph*.7)*1.1],.07,T.ce,.9,false);}
    if(type==='metal'&&melted)for(let e=0;e<26;e++){const ph=e*2.1;S.ball([Math.sin(tt*2.3+ph)*2.4,Math.cos(tt*2.1+ph*1.3)*2,Math.sin(tt*1.9+ph*.7)*1.8],.07,T.ce,.9,false);}
    A.forEach(a=>{let p=pos.get(a);if(melted){p=V3.add(p,[Math.sin(tt*.8+a.ph)*.9,Math.cos(tt*.7+a.ph*1.2)*.9,Math.sin(tt*.9+a.ph*.5)*.9]);}S.atom(p,a.r,a.c);});
    if(type==='ionic'&&shear>.4&&shear<=.62)S.text([0,0,1.7],'like charges are lining up…',T.hot,MONO);
    if(cracked)S.text([0,0,1.95],'repulsion: the crystal cracks!',T.bad,'700 13px "IBM Plex Mono",monospace');}});
  const msg=()=>{const melted=Tk>INFO[type].Tm;if(melted)return {ionic:'melted: ions are free to move (the liquid conducts)',metal:'melted: cations flow; electrons still shared',net:'melted (only at extreme heat)',mol:'melted or vaporized: weak forces overcome'}[type];
    if(type==='ionic'&&shear>.5)return 'brittle: it shatters';if(type==='ionic'&&shear>.05)return 'strained: opposite charges pulled apart';if(type==='metal'&&shear>.05)return 'layers slide, bonding stays: malleable';if(type==='net'&&shear>.05)return 'refuses to move: hard (bonds stretch)';if(type==='mol'&&shear>.05)return 'layers slide easily: soft';return 'a solid, vibrating in place';};
  function upd(){const i=INFO[type];setText('sd-p',i.p);setText('sd-h',i.h);setText('sd-mp',i.mp);setText('sd-w',msg());$$('#sd-table tbody tr').forEach(r=>r.style.background=r.dataset.k===type?'color-mix(in srgb,var(--cx) 12%,transparent)':'');$('#sd-shear-out').textContent=fmt(shear,2)+' spacing';$('#sd-temp-out').textContent=Tk+' K';v3.render();}
  drawers.solids=()=>v3.render();
  segBind('sd-type','k',k=>{type=k;upd();});bindRange('sd-shear',x=>fmt(x,2)+' spacing',x=>{shear=x;upd();},false);bindRange('sd-temp',x=>x+' K',x=>{Tk=x;upd();},false);
  upd();
  TIPS['sd-shear']=()=>({ionic:'Push past half a spacing: like charges meet and repel, so ionic crystals are brittle.',metal:'Layers of cations glide over each other, held by the electron sea: metals are malleable.',net:'Every atom is locked by covalent bonds, so the crystal will not shear: very hard.',mol:'Only weak forces hold the molecules, so the layers slide easily: soft.'})[type];
  TIPS['sd-temp']='Melting means overcoming the forces that hold the particles. Compare how much heat each type needs.';
  KEYS['sd-canvas']=['Choose a solid, then try the two sliders and spin the crystal.',[['cx','cations'],['cv','anions'],['ce','electrons (metal)'],['bad','stretched bond']]];
  GLOSS['lattice']='A regular repeating three-dimensional arrangement of particles in a crystal.';
  GLOSS['malleable']='Able to be hammered into shape without breaking.';
  GLOSS['brittle']='Shatters when struck or pushed rather than bending.';
  TT.solids='Open with the two questions: what are the particles, what holds them? Students then derive the properties table instead of memorizing it. Ask why ionic solids shatter before showing the shear slider.';
})();
(function(){
  const K=[['NaCl','ionic'],['KBr','ionic'],['MgO','ionic'],['Cu','metallic'],['Fe','metallic'],['Ag','metallic'],['diamond','covalent network'],['SiO₂','covalent network'],['SiC','covalent network'],['CO₂','molecular'],['I₂','molecular'],['sucrose','molecular']],ch=['ionic','metallic','covalent network','molecular'];
  PROBS.push({id:'sd-classify',topic:'solids',title:'Type of solid',gen(){const [f,t]=pick(K);
    return {q:`What type of solid is ${f}?`,choices:ch,ans:ch.indexOf(t),hint:'What are the particles (ions, metal atoms, atoms in a network, molecules), and what holds them?',sol:`${f} is a <b>${t}</b> solid.`};}});
  const P=[['It conducts electricity as a solid and is malleable','metallic'],['It is very hard, has a very high melting point and does not conduct even when molten','covalent network'],['It is brittle, does not conduct as a solid, but conducts when molten','ionic'],['It is soft, melts below 150 °C and does not conduct','molecular'],['It is shiny, ductile and conducts electricity','metallic'],['It dissolves in water to form a conducting solution and shatters when struck','ionic']];
  PROBS.push({id:'sd-property',topic:'solids',title:'Identify the solid from its properties',gen(){const [d,t]=pick(P);
    return {q:`A solid has these properties: ${d.charAt(0).toLowerCase()+d.slice(1)}. Which type of solid is it?`,choices:ch,ans:ch.indexOf(t),hint:'Match the behavior to the particles: mobile electrons conduct; locked ions do not; network bonds are very strong; molecular forces are weak.',sol:`This fits a <b>${t}</b> solid.`};}});
  const MP={NaCl:801,KCl:770,MgO:2852,LiF:845,KBr:734,CaO:2613,NaF:993,NaI:661,BaO:1923};
  const pairs=[['MgO','NaCl'],['NaCl','KCl'],['CaO','NaF'],['LiF','KBr'],['NaCl','NaI'],['MgO','BaO']];
  PROBS.push({id:'sd-lattice',topic:'solids',title:'Which ionic solid melts higher?',gen(){const [a,b]=pick(pairs),sw=Math.random()<.5,x=sw?b:a,y=sw?a:b,hi=MP[x]>MP[y]?x:y;
    return {q:`Which has the higher melting point, ${x} or ${y}?`,choices:[x,y],ans:hi===x?0:1,hint:'Coulomb\'s law: larger ion charges and smaller ions give a stronger lattice and a higher melting point.',sol:`<b>${hi}</b> melts higher (${MP[hi]} °C against ${MP[hi===x?y:x]} °C): its ions have ${/MgO|CaO|BaO/.test(hi)&&!/MgO|CaO|BaO/.test(hi===x?y:x)?'2+ and 2− charges, against 1+ and 1−':'a smaller radius (a smaller ion gets closer to its neighbor, so the attraction is stronger)'}.`};}});
})();
