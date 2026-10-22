
/* ---------------- Lewis structures & formal charge ---------------- */
const LW_V={H:1,C:4,N:5,O:6,F:7,Cl:7,S:6,P:5,B:3,Br:7};
/* atoms: element and layout position (−1..1); skeleton: single bonds; vars: final structures {b: [[i,j,order]], lp: lone pairs per atom, note} */
const LW=[
 {id:'h2o',f:'H₂O',charge:0,atoms:[['O',0,0],['H',-.7,.55],['H',.7,.55]],skel:[[0,1],[0,2]],vars:[{b:[[0,1,1],[0,2,1]],lp:[2,0,0],note:'Oxygen has two bonds and two lone pairs: an octet. Both hydrogens have a duet.'}]},
 {id:'nh3',f:'NH₃',charge:0,atoms:[['N',0,-.1],['H',-.8,.55],['H',0,.8],['H',.8,.55]],skel:[[0,1],[0,2],[0,3]],vars:[{b:[[0,1,1],[0,2,1],[0,3,1]],lp:[1,0,0,0],note:'Nitrogen has three bonds and one lone pair.'}]},
 {id:'ch4',f:'CH₄',charge:0,atoms:[['C',0,0],['H',-.8,-.6],['H',.8,-.6],['H',-.8,.6],['H',.8,.6]],skel:[[0,1],[0,2],[0,3],[0,4]],vars:[{b:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]],lp:[0,0,0,0,0],note:'Carbon forms four single bonds and needs no lone pairs.'}]},
 {id:'co2',f:'CO₂',charge:0,atoms:[['C',0,0],['O',-.85,0],['O',.85,0]],skel:[[0,1],[0,2]],vars:[{b:[[0,1,2],[0,2,2]],lp:[0,2,2],note:'Two double bonds: every atom has formal charge 0. The best structure.'},{b:[[0,1,3],[0,2,1]],lp:[0,1,3],note:'Also obeys the octet, but one oxygen is +1 and the other −1: a worse structure.'}]},
 {id:'hcn',f:'HCN',charge:0,atoms:[['H',-.9,0],['C',0,0],['N',.85,0]],skel:[[0,1],[1,2]],vars:[{b:[[0,1,1],[1,2,3]],lp:[0,0,1],note:'A triple bond between C and N and one lone pair on N. All formal charges are 0.'}]},
 {id:'n2',f:'N₂',charge:0,atoms:[['N',-.5,0],['N',.5,0]],skel:[[0,1]],vars:[{b:[[0,1,3]],lp:[1,1],note:'A triple bond and one lone pair on each nitrogen: ten electrons in total.'}]},
 {id:'co',f:'CO',charge:0,atoms:[['C',-.5,0],['O',.5,0]],skel:[[0,1]],vars:[{b:[[0,1,3]],lp:[1,1],note:'Both atoms get octets with a triple bond, but this puts −1 on carbon and +1 on oxygen, the less electronegative atom carrying the negative charge. It is an odd molecule.'}]},
 {id:'o3',f:'O₃',charge:0,atoms:[['O',0,-.25],['O',-.85,.55],['O',.85,.55]],skel:[[0,1],[0,2]],vars:[{b:[[0,1,2],[0,2,1]],lp:[1,2,3],note:'Resonance form A: the double bond is on the left.'},{b:[[0,1,1],[0,2,2]],lp:[1,3,2],note:'Resonance form B: the double bond is on the right. The real molecule is a hybrid of A and B (bond order 1.5).'}]},
 {id:'so2',f:'SO₂',charge:0,atoms:[['S',0,-.25],['O',-.85,.55],['O',.85,.55]],skel:[[0,1],[0,2]],vars:[{b:[[0,1,2],[0,2,2]],lp:[1,2,2],note:'Two double bonds: all formal charges are 0, but sulfur has 10 electrons (an expanded octet).'},{b:[[0,1,2],[0,2,1]],lp:[1,2,3],note:'An octet structure with a double and a single bond: S is +1 and the single-bonded O is −1. Resonance with the other side.'}]},
 {id:'no3',f:'NO₃⁻',charge:-1,atoms:[['N',0,0],['O',0,-.9],['O',-.85,.5],['O',.85,.5]],skel:[[0,1],[0,2],[0,3]],vars:[{b:[[0,1,2],[0,2,1],[0,3,1]],lp:[0,2,3,3],note:'Resonance form 1: double bond on the top oxygen.'},{b:[[0,1,1],[0,2,2],[0,3,1]],lp:[0,3,2,3],note:'Resonance form 2: double bond on the lower left oxygen.'},{b:[[0,1,1],[0,2,1],[0,3,2]],lp:[0,3,3,2],note:'Resonance form 3: double bond on the lower right oxygen. The real ion is the average of all three: each N–O bond has order 4/3.'}]},
 {id:'co3',f:'CO₃²⁻',charge:-2,atoms:[['C',0,0],['O',0,-.9],['O',-.85,.5],['O',.85,.5]],skel:[[0,1],[0,2],[0,3]],vars:[{b:[[0,1,2],[0,2,1],[0,3,1]],lp:[0,2,3,3],note:'Resonance form 1.'},{b:[[0,1,1],[0,2,2],[0,3,1]],lp:[0,3,2,3],note:'Resonance form 2.'},{b:[[0,1,1],[0,2,1],[0,3,2]],lp:[0,3,3,2],note:'Resonance form 3. The real ion is the average: each C–O bond has order 4/3.'}]},
 {id:'nh4',f:'NH₄⁺',charge:1,atoms:[['N',0,0],['H',-.8,-.6],['H',.8,-.6],['H',-.8,.6],['H',.8,.6]],skel:[[0,1],[0,2],[0,3],[0,4]],vars:[{b:[[0,1,1],[0,2,1],[0,3,1],[0,4,1]],lp:[0,0,0,0,0],note:'Four bonds and no lone pair on nitrogen: formal charge +1, which is the charge of the ion.'}]}
];
const lwVE=m=>m.atoms.reduce((a,x)=>a+LW_V[x[0]],0)-m.charge;
const lwFC=(m,v)=>m.atoms.map((a,i)=>LW_V[a[0]]-2*v.lp[i]-v.b.reduce((s,b)=>s+(b[0]===i||b[1]===i?b[2]:0),0));
const lwEl=(m,v,i)=>2*v.lp[i]+2*v.b.reduce((s,b)=>s+(b[0]===i||b[1]===i?b[2]:0),0);
(function lewis(){
  const cv=$('#lw-canvas');if(!cv)return;
  const sel=$('#lw-sel');sel.innerHTML=LW.map(m=>`<option value="${m.id}">${m.f}</option>`).join('');sel.value='co2';
  const STEPS=['Step 1 of 5. Count every valence electron (adjust for the charge).','Step 2 of 5. Skeleton: put the least electronegative atom in the middle and join the others to it with single bonds.','Step 3 of 5. Add lone pairs to finish the octets, then move lone pairs into multiple bonds if the central atom is short.','Step 4 of 5. Check each atom: green ring = full shell, orange = not an octet.','Step 5 of 5. Formal charge on every atom: FC = V − L − B/2. The best structure has them closest to zero.'];
  let M=LW[3],vi=0,step=0,tAt=0;
  function build(){M=LW.find(m=>m.id===sel.value);vi=0;const seg=$('#lw-var');seg.innerHTML=M.vars.map((v,i)=>`<button type="button" data-v="${i}" aria-pressed="${i===0}">${M.vars.length>1?(M.id==='o3'||M.id.match(/no3|co3/)?'Resonance form '+(i+1):i===0?'A':'B'):'This structure'}</button>`).join('');
    $$('#lw-var button').forEach(b=>b.addEventListener('click',()=>{$$('#lw-var button').forEach(x=>x.setAttribute('aria-pressed',x===b));vi=+b.dataset.v;tAt=sim.t;upd();}));go(0);}
  function go(s){step=clamp(s,0,4);tAt=sim?sim.t:0;$('#lw-step').textContent=STEPS[step];$('#lw-back').disabled=step===0;$('#lw-next').textContent=step===4?'Start over':'Next step';upd();}
  function upd(){const v=M.vars[vi],fc=lwFC(M,v),ve=lwVE(M),used=v.lp.reduce((a,x)=>a+2*x,0)+v.b.reduce((a,b)=>a+2*b[2],0);
    setText('lw-ve',ve);setText('lw-used',step>=2?`${used} of ${ve}`:'—');
    $('#lw-fc').textContent=step>=4?M.atoms.map((a,i)=>a[0]+(M.atoms.filter(x=>x[0]===a[0]).length>1?'#'+(M.atoms.slice(0,i).filter(x=>x[0]===a[0]).length+1):'')+' '+(fc[i]>0?'+'+fc[i]:fc[i]<0?'−'+Math.abs(fc[i]):'0')).join(' · ')+`  (sum ${fc.reduce((a,b)=>a+b,0)>0?'+':''}${fc.reduce((a,b)=>a+b,0)})`:'—';
    const ok=M.atoms.map((a,i)=>{const e=lwEl(M,v,i);return a[0]==='H'?e===2:e===8;});const exp=M.atoms.map((a,i)=>lwEl(M,v,i));
    $('#lw-oct').textContent=step>=3?M.atoms.map((a,i)=>a[0]+': '+exp[i]).join(' · ')+(ok.every(x=>x)?'  ✓ all full':'  (see rings)'):'—';
    setText('lw-note',step>=2?v.note:'');sim.render();}
  const sim=sim2d(cv,{h:w=>clamp(w*.46,250,330),draw(ctx,w,h,t){const v=M.vars[vi],fc=lwFC(M,v),age=t-tAt;const S=Math.min(w*.36,h*.34),cx=w/2,cy=h/2+4;
      const P=M.atoms.map(a=>[cx+a[1]*S,cy+a[2]*S]);
      /* bonds */
      const orders=step>=2?v.b:M.skel.map(b=>[b[0],b[1],1]);
      orders.forEach(([i,j,o])=>{const A=P[i],B=P[j],dx=B[0]-A[0],dy=B[1]-A[1],L=Math.hypot(dx,dy),ux=dx/L,uy=dy/L,nx=-uy,ny=ux,sh=18,off=o===1?[0]:o===2?[-4,4]:[-6,0,6];
        ctx.strokeStyle=T.ink;ctx.lineWidth=2.6;ctx.lineCap='round';off.forEach(k=>{ctx.beginPath();ctx.moveTo(A[0]+ux*sh+nx*k,A[1]+uy*sh+ny*k);ctx.lineTo(B[0]-ux*sh+nx*k,B[1]-uy*sh+ny*k);ctx.stroke();});});
      /* lone pairs */
      if(step>=2){M.atoms.forEach((a,i)=>{const n=v.lp[i];if(!n)return;const angs=[];orders.forEach(([p,q])=>{if(p===i)angs.push(Math.atan2(P[q][1]-P[i][1],P[q][0]-P[i][0]));if(q===i)angs.push(Math.atan2(P[p][1]-P[i][1],P[p][0]-P[i][0]));});
        const cand=Array.from({length:12},(_,k)=>k*Math.PI/6).filter(c=>angs.every(b=>Math.abs(Math.atan2(Math.sin(c-b),Math.cos(c-b)))>.8)),chosen=[];
        while(chosen.length<n&&cand.length){let best=0,bd=-1;cand.forEach((c,k)=>{const d=Math.min(...[...angs,...chosen].map(b=>Math.abs(Math.atan2(Math.sin(c-b),Math.cos(c-b)))),9);if(d>bd){bd=d;best=k;}});chosen.push(cand.splice(best,1)[0]);}
        chosen.forEach((c,k)=>{const pop=REDUCE?1:clamp(age*2.5-k*.3-i*.05,0,1),R=24;for(const s of[-1,1]){const px=P[i][0]+Math.cos(c)*R+Math.cos(c+1.5708)*s*4,py=P[i][1]+Math.sin(c)*R+Math.sin(c+1.5708)*s*4;dot(ctx,px,py,3.6*pop,T.ce);}});});}
      /* atoms */
      M.atoms.forEach((a,i)=>{const [x,y]=P[i];const e=lwEl(M,v,i);const full=a[0]==='H'?e===2:e===8;
        if(step>=3){ctx.strokeStyle=full?T.good:T.hot;ctx.lineWidth=2.5;ctx.setLineDash(full?[]:[5,4]);ctx.beginPath();ctx.arc(x,y,19,0,7);ctx.stroke();ctx.setLineDash([]);}
        ctx.fillStyle=T.surface;ctx.beginPath();ctx.arc(x,y,15,0,7);ctx.fill();label(ctx,a[0],x,y,T.ink,'center','middle','700 20px "IBM Plex Sans",sans-serif');
        if(step>=3)label(ctx,e+' e⁻',x,y+40,full?T.good:T.hot,'center','top',MONO);
        if(step>=4){const f=fc[i],txt=f>0?'+'+f:f<0?'−'+Math.abs(f):'0';const bx=x+24,by=y-26;ctx.fillStyle=f===0?T.sunk:f>0?alpha(T.cx,.2):alpha(T.bad,.18);ctx.beginPath();ctx.arc(bx,by,12,0,7);ctx.fill();ctx.strokeStyle=f===0?T.muted:f>0?T.cx:T.bad;ctx.lineWidth=1.5;ctx.stroke();label(ctx,txt,bx,by,f===0?T.muted:f>0?T.cx:T.bad,'center','middle','700 13px "IBM Plex Mono",monospace');}});
      if(step===0){/* electron counter */const n=lwVE(M);for(let k=0;k<n;k++){const a=k*.9+t*.4,r=20+k*3.2;dot(ctx,w/2+Math.cos(a)*(40+k*4),h-34+Math.sin(a*1.2)*10,0,T.ce);}
        const per=Math.min(n,16),x0=w/2-per*7;for(let k=0;k<n;k++){const row=Math.floor(k/16),col=k%16,pop=REDUCE?1:clamp(age*10-k*.6,0,1);dot(ctx,x0+col*14+(n<16?(16-n)*7:0)*0,h-26-row*14,4.6*pop,T.ce);}
        label(ctx,n+' valence electrons to place',w/2,h-52,T.muted,'center','bottom',MONO);}}});
  drawers.lewis=()=>sim.render();
  sel.addEventListener('change',build);$('#lw-next').addEventListener('click',()=>{if(step===4)go(0);else go(step+1);});$('#lw-back').addEventListener('click',()=>go(step-1));
  build();go(4);
  TIPS['lw-sel']='Pick a species, then step through the recipe or jump to the last step to see formal charges.';
  KEYS['lw-canvas']=['Press Next step to build the structure, or pick a structure with the buttons.',[['ce','lone pair'],['good','full shell'],['hot','not an octet'],['cx','formal charge (circles)']]];
  GLOSS['octet']='Eight electrons in the outer shell; the stable arrangement most atoms in periods 2 and 3 aim for.';
  GLOSS['formal charge']='The charge an atom would have if all bonding electrons were shared equally: valence electrons minus lone-pair electrons minus half the bonding electrons.';
  GLOSS['resonance']='When more than one valid Lewis structure exists, the real molecule is a hybrid (average) of them.';
  GLOSS['lone pair']='Two valence electrons that belong to one atom and are not shared in a bond.';
  TT.lewis='Students lose points by miscounting electrons, so make the count its own step with a check at the end ("do my dots match my total?"). Resonance is best taught as measured bond lengths: all the same.';
})();
(function(){
  const SPEC=[['NH₃',{N:1,H:3},0],['H₂O',{H:2,O:1},0],['CO₂',{C:1,O:2},0],['NO₃⁻',{N:1,O:3},-1],['SO₄²⁻',{S:1,O:4},-2],['PO₄³⁻',{P:1,O:4},-3],['NH₄⁺',{N:1,H:4},1],['ClO₃⁻',{Cl:1,O:3},-1],['CN⁻',{C:1,N:1},-1],['O₃',{O:3},0],['HCN',{H:1,C:1,N:1},0],['CO₃²⁻',{C:1,O:3},-2],['SO₂',{S:1,O:2},0],['CH₂O',{C:1,H:2,O:1},0],['H₃O⁺',{H:3,O:1},1],['PCl₃',{P:1,Cl:3},0]];
  PROBS.push({id:'lw-count',topic:'lewis',title:'Count the valence electrons',gen(){const [f,at,ch]=pick(SPEC),ans=Object.entries(at).reduce((a,[e,n])=>a+LW_V[e]*n,0)-ch;
    return {q:`How many valence electrons must the Lewis structure of ${f} show?`,ans,unit:'electrons',abs:.01,hint:'Add the valence electrons of every atom (H 1, C 4, N 5, O 6, F and Cl 7, S 6, P 5). Add one for each unit of negative charge; subtract one for each positive charge.',
      sol:`${Object.entries(at).map(([e,n])=>`${n}(${LW_V[e]})`).join(' + ')}${ch?` ${ch<0?'+':'−'} ${Math.abs(ch)} (charge)`:''} = <b>${ans}</b>.`};}});
  PROBS.push({id:'lw-fc',topic:'lewis',title:'Find the formal charge',gen(){const cands=[];LW.forEach(m=>m.vars.forEach((v,vi)=>m.atoms.forEach((a,i)=>cands.push([m,v,vi,i]))));const [m,v,vi,i]=pick(cands),el=m.atoms[i][0],bonds=v.b.reduce((s,b)=>s+(b[0]===i||b[1]===i?b[2]:0),0),lp=v.lp[i],ans=LW_V[el]-2*lp-bonds;
    const bondDesc=v.b.filter(b=>b[0]===i||b[1]===i).map(b=>({1:'single',2:'double',3:'triple',1.5:'1.5'})[b[2]]).join(' + ');
    return {q:`In one Lewis structure of ${m.f}, an atom of ${el} has ${bonds} bond${bonds===1?'':'s'} (${bondDesc}) and ${lp} lone pair${lp===1?'':'s'}. What is its formal charge? (${el} has ${LW_V[el]} valence electrons.)`,ans,unit:'',abs:.01,hint:'FC = valence electrons − lone-pair electrons − (bonding electrons ÷ 2). Each lone pair is 2 electrons; the number of bonds equals half the bonding electrons.',
      sol:`FC = ${LW_V[el]} − ${2*lp} − ${bonds} = <b>${ans>0?'+'+ans:ans}</b>.`};}});
  PROBS.push({id:'lw-lp',topic:'lewis',title:'Lone pairs on the central atom',gen(){const T2=[['H₂O',2],['NH₃',1],['CH₄',0],['CO₂',0],['SO₂',1],['HCN',0],['NH₄⁺',0],['H₃O⁺',1],['PCl₃',1],['CF₄',0],['H₂S',2],['OF₂',2]],[f,ans]=pick(T2);
    return {q:`How many lone pairs are on the central atom in the Lewis structure of ${f}? (Use the octet-obeying structure.)`,ans,unit:'lone pairs',abs:.01,hint:'Count the valence electrons, subtract the bonds you draw, and place what is left as lone pairs (outer atoms first). Whatever remains goes on the central atom.',
      sol:`The central atom of ${f} ends up with <b>${ans}</b> lone pair${ans===1?'':'s'}.`};}});
})();
