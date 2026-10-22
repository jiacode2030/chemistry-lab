
/* ---------------- Periodic trends & Coulomb's law ---------------- */
const TR_LIST=[3,4,5,6,7,8,9,11,12,13,14,15,16,17,19,20,31,32,33,34,35];
const TR_R={3:128,4:96,5:84,6:76,7:71,8:66,9:57,11:166,12:141,13:121,14:111,15:107,16:105,17:102,19:203,20:176,31:122,32:120,33:119,34:120,35:120};
const TR_IE={3:520,4:900,5:801,6:1086,7:1402,8:1314,9:1681,11:496,12:738,13:578,14:787,15:1012,16:1000,17:1251,19:419,20:590,31:579,32:762,33:947,34:941,35:1140};
const TR_VAL={3:1,4:2,5:3,6:4,7:5,8:6,9:7,11:1,12:2,13:3,14:4,15:5,16:6,17:7,19:1,20:2,31:3,32:4,33:5,34:6,35:7};
const trShell=z=>z<=10?2:z<=18?3:4;
(function trends(){
  const cl=$('#tr-cl');if(!cl)return;
  /* ---- Coulomb ---- */
  let q1=1,q2=1,r=3,tR=3,dragging=false;
  const simC=sim2d(cl,{h:w=>clamp(w*.3,170,220),step(dt){tR=r;},
    drag:(k,e)=>{if(k==='down'){dragging=true;}if(k==='up'){dragging=false;return;}if(!dragging)return;const [x]=ptr(e,cl),w=cl.clientWidth,x0=w*.16,sc=(w*.8-x0)/6.4;const nr=clamp(Math.round((x-x0)/sc*4)/4,1,6);const el=$('#tr-r');el.value=nr;el.dispatchEvent(new Event('input',{bubbles:true}));},
    draw(ctx,w,h,t){const x0=w*.16,sc=(w*.8-x0)/6.4,y=h*.48,x1=x0+r*sc;
      ctx.strokeStyle=T.line;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(x0,y+36);ctx.lineTo(x1,y+36);ctx.stroke();ctx.setLineDash([]);label(ctx,'r = '+r.toFixed(2),(x0+x1)/2,y+48,T.muted,'center','top',MONO);
      const F=q1*q2/(r*r),F0=1/9,len=clamp(Math.sqrt(F/F0)*38,10,Math.min(w*.3,160));
      arrow(ctx,x0+22,y,x0+22+len,y,T.hot,3.4);arrow(ctx,x1-22,y,x1-22-len,y,T.hot,3.4);
      ball2(ctx,x0,y,16+q1*2.2,T.cx);label(ctx,'+'+q1,x0,y,'#fff','center','middle','700 14px "IBM Plex Mono",monospace');
      ball2(ctx,x1,y,12+q2*2.2,T.ca);label(ctx,'−'+q2,x1,y,'#fff','center','middle','700 14px "IBM Plex Mono",monospace');
      label(ctx,'drag the electron',x1,y-44,T.muted,'center','bottom',MONO);}});
  const rel=()=>q1*q2/(r*r);
  function updC(){const F=rel(),F0=1/9;setText('tr-f',F.toFixed(3));const x=F/F0;setText('tr-fx',Math.abs(x-1)<.005?'same as the start (q = 1, 1, r = 3)':`${x>=1?x.toFixed(2):x.toFixed(3)}× the starting force`);simC.render();}
  bindRange('tr-q1',x=>'+'+x,x=>{q1=x;updC();});bindRange('tr-q2',x=>'−'+x,x=>{q2=x;updC();});bindRange('tr-r',x=>x.toFixed(2),x=>{r=x;updC();});
  /* ---- Trend explorer ---- */
  const ch=$('#tr-chart'),at=$('#tr-atom');let prop='r',idx=5,rShown=null,zShown=null;
  const val=z=>prop==='r'?TR_R[z]:prop==='ie'?TR_IE[z]:ELEMENTS[z-1].en;
  const UNIT={r:'pm',ie:'kJ/mol',en:''},NAME={r:'Atomic radius (covalent, pm)',ie:'First ionization energy (kJ/mol)',en:'Electronegativity (Pauling)'};
  const PC=()=>({2:T.cx,3:T.hot,4:T.cv});
  const simChart=sim2d(ch,{h:()=>clamp(ch.clientWidth*.78,250,320),drag:(k,e)=>{if(k==='up')return;if(k==='move'&&!e.buttons)return;const [x]=ptr(e,ch);const bx=44,bw=ch.clientWidth-bx-12;const z=2+(x-bx)/bw*34;let best=0,bd=1e9;TR_LIST.forEach((q,i)=>{const d=Math.abs(q-z);if(d<bd){bd=d;best=i;}});const el=$('#tr-i');el.value=best;el.dispatchEvent(new Event('input',{bubbles:true}));},
    draw(ctx,w,h){const vs=TR_LIST.map(val),mx=Math.max(...vs)*1.1,box={x:44,y:14,w:w-44-12,h:h-48};const P=panel(ctx,box,[2,36],[0,mx],{xn:6,yn:4,xlabel:'atomic number Z',ylabel:NAME[prop],color:T.ink});const pc=PC();
      [2,3,4].forEach(p=>{const zs=TR_LIST.filter(z=>trShell(z)===p);ctx.save();ctx.strokeStyle=pc[p];ctx.lineWidth=2;ctx.beginPath();zs.forEach((z,i)=>i?ctx.lineTo(P.X(z),P.Y(val(z))):ctx.moveTo(P.X(z),P.Y(val(z))));ctx.stroke();ctx.restore();zs.forEach(z=>dot(ctx,P.X(z),P.Y(val(z)),4,pc[p]));
        label(ctx,'period '+p,P.X(zs[zs.length-1])+(p===4?-8:6),P.Y(val(zs[zs.length-1]))-(p===4?-14:0),pc[p],p===4?'right':'left','middle',MONO);});
      const z=TR_LIST[idx];ctx.save();ctx.strokeStyle=T.ink;ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(P.X(z),box.y);ctx.lineTo(P.X(z),box.y+box.h);ctx.stroke();ctx.restore();dot(ctx,P.X(z),P.Y(val(z)),7,T.surface,T.ink);label(ctx,ELEMENTS[z-1].sym,P.X(z),P.Y(val(z))-12,T.ink,'center','bottom','700 14px "IBM Plex Sans",sans-serif');}});
  const simAtom=sim2d(at,{h:()=>clamp(ch.clientWidth*.78,250,320),step(dt){const z=TR_LIST[idx],tr=TR_R[z],tz=TR_VAL[z];rShown=rShown==null?tr:rShown+(tr-rShown)*Math.min(1,dt*5);zShown=zShown==null?tz:zShown+(tz-zShown)*Math.min(1,dt*5);},
    draw(ctx,w,h,t){const z=TR_LIST[idx],cx=w*.42,cy=h/2,k=(Math.min(w,h)*.42)/210,R=(rShown??TR_R[z])*k,n=trShell(z);
      /* shells to scale: core shells inside */
      ctx.strokeStyle=T.line;ctx.lineWidth=1.2;[2,3].forEach(s=>{if(s<n){const rr=(s===2?60:110)*k*(n===4?1.1:1);ctx.beginPath();ctx.arc(cx,cy,rr,0,7);ctx.stroke();}});
      ctx.fillStyle=alpha(T.cx,.07);ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fill();ctx.strokeStyle=T.cx;ctx.lineWidth=2;ctx.stroke();
      const core=z-TR_VAL[z];ball2(ctx,cx,cy,13,T.hot);label(ctx,'+'+z,cx,cy,'#fff','center','middle','700 11px "IBM Plex Mono",monospace');
      label(ctx,core+' core electrons in the inner shells (rings)',cx,h-26,T.muted,'center','bottom',MONO);
      const th=t*(1.6/Math.sqrt(n))+0;const ex=cx+R*Math.cos(th),ey=cy+R*Math.sin(th);ball2(ctx,ex,ey,6,T.ce);
      /* the pull toward the nucleus: length ~ Zeff / r² */
      const F=(zShown??TR_VAL[z])/((R/k)**2)*1e4;const len=clamp(F*3,6,R*.8);const ux=(cx-ex)/R,uy=(cy-ey)/R;arrow(ctx,ex,ey,ex+ux*len,ey+uy*len,T.hot,3);
      label(ctx,'orange arrow: pull on the outer electron',8,10,T.hot,'left','top',MONO);label(ctx,'shell '+n,cx,cy-R-6,T.cx,'center','bottom',MONO);
      label(ctx,'radius '+TR_R[z]+' pm · Zeff ≈ '+TR_VAL[z],cx,h-8,T.ink,'center','bottom',MONO);}});
  drawers.trends=()=>{simC.render();simChart.render();simAtom.render();};
  function upd(){const z=TR_LIST[idx],E=ELEMENTS[z-1];setText('tr-el',`${E.name} (${E.sym})`);const v=val(z);setText('tr-v',prop==='r'?v+' pm':prop==='ie'?v+' kJ/mol':v.toFixed(2));setText('tr-vl',NAME[prop].replace(/ \(.*\)/,''));
    setText('tr-core',z-TR_VAL[z]);setText('tr-zeff',TR_VAL[z]);setText('tr-n',trShell(z));$('#tr-i-out').textContent=E.sym;drawers.trends();}
  bindRange('tr-i',x=>ELEMENTS[TR_LIST[x]-1].sym,x=>{idx=x;upd();});
  segBind('tr-prop','k',k=>{prop=k;upd();});
  updC();upd();
  TIPS['tr-q1']='More positive charge pulls harder: the force is proportional to q₁.';
  TIPS['tr-q2']='Force is proportional to the product of the charges, so doubling either one doubles it.';
  TIPS['tr-r']='Force falls with the square of the distance: double r and the force is a quarter, triple r and it is a ninth.';
  TIPS['tr-i']=el=>{const z=TR_LIST[+el.value],E=ELEMENTS[z-1];return `${E.name}: outer electron in shell ${trShell(z)}, Zeff ≈ ${TR_VAL[z]}. Compare with the element next to it.`;};
  TIPS['tr-prop:r']='Radius shrinks across a period (Zeff grows) and grows down a group (new shells).';
  TIPS['tr-prop:ie']='Ionization energy is the cost of removing the outer electron: it follows the pull, so it rises across a period and falls down a group.';
  TIPS['tr-prop:en']='Electronegativity is how strongly an atom pulls on shared electrons: it also rises across a period and falls down a group.';
  KEYS['tr-chart']=['Tap a point or use the slider. Compare along a period and down a group.',[['cx','period 2'],['hot','period 3'],['cv','period 4']]];
  GLOSS['coulomb']='The force between charges: proportional to q₁q₂ and inversely proportional to the distance squared.';
  GLOSS['effective nuclear charge']='The positive charge an outer electron actually feels, after inner electrons cancel part of the nucleus: about Z minus the core electrons.';
  GLOSS['ionization energy']='The energy needed to remove an electron from a gaseous atom.';
  GLOSS['electronegativity']='How strongly an atom pulls shared electrons toward itself.';
  TT.trends='Ask for two reasons in every explanation: the charge the outer electron feels (Zeff) and how far away it is (the shell). Rubrics reward both. Let students drag the electron in the Coulomb lab until inverse-square feels natural.';
})();
(function(){
  const NAME={3:'Li',4:'Be',5:'B',6:'C',7:'N',8:'O',9:'F',11:'Na',12:'Mg',13:'Al',14:'Si',15:'P',16:'S',17:'Cl',19:'K',20:'Ca',31:'Ga',32:'Ge',33:'As',34:'Se',35:'Br'};
  const EXC=[[4,5],[7,8],[12,13],[15,16]];
  function pair(){let a,b;do{a=pick(TR_LIST);b=pick(TR_LIST);}while(a===b);return [a,b];}
  PROBS.push({id:'tr-radius',topic:'trends',title:'Which atom is larger?',gen(){const [a,b]=pair(),big=TR_R[a]>TR_R[b]?a:b,small=big===a?b:a;const ch=[NAME[a],NAME[b]];
    const same=trShell(a)===trShell(b);
    return {q:`Which atom has the larger atomic radius: ${NAME[a]} or ${NAME[b]}?`,choices:ch,ans:big===a?0:1,hint:'Compare the shell of the outer electron first (more shells means larger), then the effective nuclear charge for atoms in the same period.',
      sol:`${same?`${NAME[a]} and ${NAME[b]} are in the same period, and the one with the lower Z<sub>eff</sub> (fewer protons pulling on the same shell) is larger.`:`${NAME[big]} has its outer electron in shell ${trShell(big)}, compared with shell ${trShell(small)} for ${NAME[small]}.`} The larger atom is <b>${NAME[big]}</b> (${TR_R[big]} pm against ${TR_R[small]} pm).`};}});
  PROBS.push({id:'tr-ie',topic:'trends',title:'Which has the higher ionization energy?',gen(){const [a,b]=pair(),hi=TR_IE[a]>TR_IE[b]?a:b,lo=hi===a?b:a;const ch=[NAME[a],NAME[b]];
    const exc=EXC.some(([x,y])=>(a===x&&b===y)||(a===y&&b===x));const same=trShell(a)===trShell(b);
    return {q:`Which has the higher first ionization energy: ${NAME[a]} or ${NAME[b]}?`,choices:ch,ans:hi===a?0:1,hint:'Higher Zeff and a smaller distance mean the outer electron is held more tightly. Watch for the two small exceptions in each period.',
      sol:`${exc?'This is one of the exceptions: a p electron is removed more easily than an s electron of the same shell (Be → B, Mg → Al), or a paired p electron is removed more easily than an unpaired one (N → O, P → S).':same?`Same period: the one farther right has the larger Z<sub>eff</sub>.`:`${NAME[hi]}'s outer electron is in a smaller shell (${trShell(hi)} against ${trShell(lo)}), so it is closer to the nucleus.`} The higher ionization energy is <b>${NAME[hi]}</b> (${TR_IE[hi]} kJ/mol against ${TR_IE[lo]} kJ/mol).`};}});
  PROBS.push({id:'tr-coulomb',topic:'trends',title:"Coulomb's law scaling",gen(){const a=pick([2,3,4]),b=pick([1,2,3]),d=pick([2,3,.5]),ans=a*b/(d*d);
    return {q:`Two oppositely charged particles attract with force F. The positive charge is multiplied by ${a}, the negative charge by ${b}, and the distance between them is ${d===.5?'halved':'multiplied by '+d}. By what factor does the force change?`,ans,unit:'× F',tol:.02,hint:'F is proportional to q₁q₂/r². Multiply the charge factors and divide by the square of the distance factor.',
      sol:`Factor = (${a} × ${b}) / ${d}² = ${a*b} / ${d*d} = <b>${fmt(ans,3)}</b>.`};}});
})();
