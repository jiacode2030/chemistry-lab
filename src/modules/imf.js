
/* ---------------- Intermolecular forces ---------------- */
const IMF_SUB=[['He','London dispersion (very weak)',4.2,'#7CC4E6'],['Ar','London dispersion',87.3,'#4FB9E3'],['CH₄','London dispersion',111.7,'#4A5160'],['C₄H₁₀','London dispersion (larger molecule)',272.7,'#6B7280'],['HCl','dipole–dipole',188.1,'#2FB55A'],['NH₃','hydrogen bonding',239.8,'#3E63DD'],['H₂O','hydrogen bonding',373.15,'#E5484D'],['HF','hydrogen bonding',292.7,'#53C98A']];
(function imf(){
  const cv=$('#im-canvas');if(!cv)return;
  const sel=$('#im-sub');sel.innerHTML=IMF_SUB.map(s=>`<option value="${s[0]}">${s[0]} · boils at ${s[2]} K</option>`).join('');sel.value='H₂O';
  const N=64,L=16;let P,Tk=100,S0=IMF_SUB[6],bound=1,acc=0;
  function init(){const side=Math.ceil(Math.sqrt(N));P={x:[],y:[],vx:[],vy:[],fx:Array(N).fill(0),fy:Array(N).fill(0)};
    for(let i=0;i<N;i++){P.x.push((i%side+.5)*L/side*.55+L*.22);P.y.push((Math.floor(i/side)+.5)*L/side*.55+L*.22);const a=Math.random()*6.283;P.vx.push(.3*Math.cos(a));P.vy.push(.3*Math.sin(a));}forces();}
  function forces(){const {x,y,fx,fy}=P;fx.fill(0);fy.fill(0);for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const dx=x[i]-x[j],dy=y[i]-y[j],r2=dx*dx+dy*dy;if(r2<6.25){const i2=1/Math.max(r2,.64),i6=i2*i2*i2,f=24*i6*(2*i6-1)*i2;fx[i]+=f*dx;fy[i]+=f*dy;fx[j]-=f*dx;fy[j]-=f*dy;}}}
  const Tstar=()=>.55*Tk/S0[2];
  function stepMD(){const dt=.004,{x,y,vx,vy,fx,fy}=P;let ke=0;
    for(let i=0;i<N;i++){vx[i]+=.5*dt*fx[i];vy[i]+=.5*dt*fy[i];x[i]+=dt*vx[i];y[i]+=dt*vy[i];if(x[i]<0){x[i]=-x[i];vx[i]=-vx[i];}if(x[i]>L){x[i]=2*L-x[i];vx[i]=-vx[i];}if(y[i]<0){y[i]=-y[i];vy[i]=-vy[i];}if(y[i]>L){y[i]=2*L-y[i];vy[i]=-vy[i];}}
    forces();for(let i=0;i<N;i++){vx[i]+=.5*dt*fx[i];vy[i]+=.5*dt*fy[i];ke+=vx[i]*vx[i]+vy[i]*vy[i];}
    const T=ke/(2*N),tgt=Math.max(Tstar(),.002),lam=Math.sqrt(1+.03*(tgt/Math.max(T,1e-6)-1));for(let i=0;i<N;i++){vx[i]*=lam;vy[i]*=lam;}}
  const sim=sim2d(cv,{h:w=>clamp(w*.62,300,420),step(){for(let k=0;k<10;k++)stepMD();acc++;if(acc%20===0){let c=0;for(let i=0;i<N;i++){let nb=0;for(let j=0;j<N;j++)if(j!==i){const dx=P.x[i]-P.x[j],dy=P.y[i]-P.y[j];if(dx*dx+dy*dy<2.56)nb++;}if(nb>=3)c++;}bound+=(c/N-bound)*.3;phase();}},
    draw(ctx,w,h){const s=Math.min(w-20,h-20)/L,ox=(w-L*s)/2,oy=(h-L*s)/2;ctx.strokeStyle=T.line;ctx.lineWidth=2;ctx.strokeRect(ox,oy,L*s,L*s);
      if($('#im-links').checked){ctx.strokeStyle=alpha(T.hot,.4);ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){const dx=P.x[i]-P.x[j],dy=P.y[i]-P.y[j];if(dx*dx+dy*dy<1.9){ctx.moveTo(ox+P.x[i]*s,oy+P.y[i]*s);ctx.lineTo(ox+P.x[j]*s,oy+P.y[j]*s);}}ctx.stroke();}
      for(let i=0;i<N;i++)ball2(ctx,ox+P.x[i]*s,oy+P.y[i]*s,.5*s,S0[3]);}});
  function phase(){const b=bound;setText('im-ph',b>.8?'clumped: liquid or solid':b>.45?'clumps and vapor (boiling)':'free molecules: gas');}
  function upd(){S0=IMF_SUB.find(s=>s[0]===sel.value);setText('im-f',S0[1]);setText('im-bp',S0[2]+' K ('+(S0[2]-273.15).toFixed(0)+' °C)');setText('im-k',Tk+' K ('+(Tk-273.15).toFixed(0)+' °C)');phase();sim.render();}
  bindRange('im-t',x=>x+' K',x=>{Tk=x;upd();});sel.addEventListener('change',()=>{bound=1;upd();});$('#im-links').addEventListener('change',()=>sim.render());
  init();upd();
  /* hydride chart */
  const H=[[14,'CH₄',16.04,111.7],[14,'SiH₄',32.12,161.3],[14,'GeH₄',76.67,184.7],[14,'SnH₄',122.74,221],[15,'NH₃',17.03,239.8],[15,'PH₃',34.00,185.4],[15,'AsH₃',77.95,210.6],[15,'SbH₃',124.77,256],[16,'H₂O',18.02,373.15],[16,'H₂S',34.08,212.8],[16,'H₂Se',80.98,231.8],[16,'H₂Te',129.62,271],[17,'HF',20.01,292.7],[17,'HCl',36.46,188.1],[17,'HBr',80.91,206.4],[17,'HI',127.91,237.8]];
  const GC={14:T=>T.ink,15:T=>T.cx,16:T=>T.bad,17:T=>T.cv};
  const sim2=sim2d($('#im-bpc'),{h:w=>clamp(w*.55,260,360),draw(ctx,w,h){const P=panel(ctx,{x:52,y:12,w:w-70,h:h-50},[0,140],[100,400],{xn:7,yn:3,xlabel:'molar mass (g/mol)',ylabel:'boiling point (K)',color:T.ink});
    [14,15,16,17].forEach(g=>{if(!$('#im-g'+g).checked)return;const pts=H.filter(x=>x[0]===g),col=GC[g](T);ctx.save();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(P.X(p[2]),P.Y(p[3])):ctx.moveTo(P.X(p[2]),P.Y(p[3])));ctx.stroke();ctx.restore();
      pts.forEach(p=>{dot(ctx,P.X(p[2]),P.Y(p[3]),4.5,col);label(ctx,p[1],P.X(p[2])+7,P.Y(p[3])-2,col,'left','bottom',MONO);});});}});
  ['14','15','16','17'].forEach(g=>$('#im-g'+g).addEventListener('change',()=>sim2.render()));
  drawers.imf=()=>{sim.render();sim2.render();};
  TIPS['im-sub']='The attraction strength is scaled from this substance\'s real boiling point.';
  TIPS['im-t']='Raising the temperature makes molecules move faster until they can escape each other: the boiling point.';
  TIPS['im-links']='Lines join neighbors close enough to attract. Count how many each molecule has as you heat.';
  KEYS['im-canvas']=['Choose a substance and slide the temperature.',[['hot','attractions between neighbors','dash']]];
  GLOSS['london dispersion']='Weak attraction from momentary dipoles; present in all substances and stronger for larger electron clouds.';
  GLOSS['hydrogen bonding']='Strong attraction between an H bonded to N, O or F and a lone pair on another N, O or F.';
  GLOSS['intermolecular']='Between molecules (as opposed to inside them).';
  TT.imf='Say "what do you break when water boils?" until students answer "only attractions between molecules". Use the hydride graph to argue that hydrogen bonding is an extra effect on top of the dispersion trend.';
})();
(function(){
  const F=[['CH₄','London dispersion'],['Ar','London dispersion'],['CO₂','London dispersion'],['N₂','London dispersion'],['HCl','dipole–dipole'],['HBr','dipole–dipole'],['CH₃Cl','dipole–dipole'],['CH₃OCH₃','dipole–dipole'],['H₂O','hydrogen bonding'],['NH₃','hydrogen bonding'],['CH₃OH','hydrogen bonding'],['HF','hydrogen bonding'],['CH₃CH₂OH','hydrogen bonding']];
  PROBS.push({id:'imf-which',topic:'imf',title:'The strongest intermolecular force',gen(){const [f,t]=pick(F),ch=['London dispersion','dipole–dipole','hydrogen bonding'];
    return {q:`What is the strongest type of intermolecular force between molecules of ${f}?`,choices:ch,ans:ch.indexOf(t),hint:'Is the molecule polar? Does it have an H bonded to N, O or F? Otherwise only dispersion forces act.',sol:`${t==='hydrogen bonding'?'It has an H bonded to N, O or F (and a lone pair to bond to).':t==='dipole–dipole'?'It is polar but has no H on N, O or F.':'It is nonpolar.'} The strongest force is <b>${t}</b>.`};}});
  const BP={'CH₄':111.7,'C₂H₆':184.6,'C₃H₈':231.1,'C₄H₁₀':272.7,'H₂O':373.2,'H₂S':212.8,'HF':292.7,'HCl':188.1,'NH₃':239.8,'PH₃':185.4,'CH₃OH':337.8,'CH₃CH₃':184.6,'Ar':87.3,'Ne':27.1,'CH₃CH₂OH':351.4,'Br₂':332,'Cl₂':239.1,'HBr':206.4,'HI':237.8};
  const PAIRS=[['H₂O','H₂S'],['HF','HCl'],['NH₃','PH₃'],['CH₄','C₄H₁₀'],['Ar','Ne'],['CH₃OH','C₂H₆'],['Br₂','Cl₂'],['HI','HCl'],['CH₃CH₂OH','C₃H₈']];
  PROBS.push({id:'imf-bp',topic:'imf',title:'Which boils at the higher temperature?',gen(){const [a,b]=pick(PAIRS),sw=Math.random()<.5,x=sw?b:a,y=sw?a:b,hi=BP[x]>BP[y]?x:y;
    return {q:`Which has the higher boiling point, ${x} or ${y}?`,choices:[x,y],ans:hi===x?0:1,hint:'Compare the strongest IMF first (hydrogen bonding > dipole–dipole > dispersion). If they are the same type, the larger molecule (more electrons) wins.',sol:`<b>${hi}</b> (${BP[hi]} K against ${BP[hi===x?y:x]} K): it has stronger intermolecular attractions.`};}});
  const SOL=[['NaCl','yes','ion–dipole attraction to water'],['CH₃OH','yes','it hydrogen bonds with water'],['glucose','yes','many O–H groups hydrogen bond with water'],['NH₃','yes','it hydrogen bonds with water'],['CCl₄','no','it is nonpolar, so water prefers its own hydrogen bonds'],['hexane (C₆H₁₄)','no','it is nonpolar'],['I₂','no','it is nonpolar'],['CH₄','no','it is nonpolar']];
  PROBS.push({id:'imf-like',topic:'imf',title:'Like dissolves like',gen(){const [f,a,why]=pick(SOL),ch=['soluble in water','not very soluble in water'];
    return {q:`Is ${f} likely to be soluble in water?`,choices:ch,ans:a==='yes'?0:1,hint:'Water is polar and hydrogen bonds. Substances that can form strong attractions with water dissolve; nonpolar ones do not.',sol:`${f} is <b>${a==='yes'?'soluble':'not very soluble'}</b>: ${why}.`};}});
})();

(function(){
  const Q=[['Which attraction mainly pulls an NaCl crystal apart when it dissolves in water?',['Ion–dipole forces between the ions and water','London dispersion forces between the ions','Covalent bonds between Na and Cl','Hydrogen bonds between Na⁺ and Cl⁻'],0,'water\'s partial charges surround each ion'],['Why is KBr soluble in water but not in hexane?',['Hexane cannot form ion–dipole attractions strong enough to separate the ions','KBr is nonpolar','Hexane is too dense','The ions are too large'],0,'nonpolar hexane has only dispersion forces, far weaker than the lattice attraction'],['Which is the strongest of these attractions?',['Ion–dipole','Hydrogen bonding','Dipole–dipole','London dispersion'],0,'ion–dipole involves a full ionic charge']];
  PROBS.push({id:'imf-ion',topic:'imf',title:'Ion–dipole forces',gen(){const [q,ch,a,why]=pick(Q);return {q,choices:ch,ans:a,hint:'Think about which particles are charged and which are only partially charged.',sol:`<b>${ch[a]}</b>: ${why}.`};}});
})();
