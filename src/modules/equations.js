
/* ---------------- Balancing equations ---------------- */
const EQ_RX=[
  {r:['H2','O2'],p:['H2O'],c:[2,1,2]},{r:['N2','H2'],p:['NH3'],c:[1,3,2]},{r:['CH4','O2'],p:['CO2','H2O'],c:[1,2,1,2]},{r:['Fe','O2'],p:['Fe2O3'],c:[4,3,2]},
  {r:['Na','Cl2'],p:['NaCl'],c:[2,1,2]},{r:['KClO3'],p:['KCl','O2'],c:[2,2,3]},{r:['C2H4','O2'],p:['CO2','H2O'],c:[1,3,2,2]},{r:['Al','O2'],p:['Al2O3'],c:[4,3,2]},
  {r:['H2O2'],p:['H2O','O2'],c:[2,2,1]},{r:['Zn','HCl'],p:['ZnCl2','H2'],c:[1,2,1,1]}];
const eqSide=(fs,cs)=>fs.map((f,i)=>(cs[i]>1?cs[i]:'')+fsub(f)).join(' + ');
function eqCounts(fs,cs){const t={};fs.forEach((f,i)=>{const {count}=molarMass(f);Object.keys(count).forEach(e=>t[e]=(t[e]||0)+count[e]*cs[i]);});return t;}
(function equations(){
  const cv=$('#eq-canvas');if(!cv)return;
  const sel=$('#eq-sel');sel.innerHTML=EQ_RX.map((x,i)=>`<option value="${i}">${eqSide(x.r,x.r.map(()=>1))} → ${eqSide(x.p,x.p.map(()=>1))}</option>`).join('');
  let X=EQ_RX[0],co=[],anim=0,moving=false,pairs=[];
  const sp=()=>X.r.concat(X.p),nR=()=>X.r.length;
  function load(){X=EQ_RX[+sel.value];co=sp().map(()=>1);anim=0;moving=false;steppers();upd();}
  function steppers(){$('#eq-steppers').innerHTML=sp().map((f,i)=>`<span class="stp">${i===nR()?'<b class="arr">→</b>':i?'<b class="arr">+</b>':''}<span class="stp-b"><button type="button" data-i="${i}" data-d="-1" aria-label="Fewer ${fsub(f)}">−</button><output id="eq-c${i}">1</output><button type="button" data-i="${i}" data-d="1" aria-label="More ${fsub(f)}">+</button></span><span class="stp-f">${fsub(f)}</span></span>`).join('');}
  $('#eq-steppers').addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;const i=+b.dataset.i;co[i]=clamp(co[i]+ +b.dataset.d,0,8);anim=0;moving=false;upd();});
  const state=()=>{const L=eqCounts(X.r,co.slice(0,nR())),R=eqCounts(X.p,co.slice(nR())),els=[...new Set([...Object.keys(L),...Object.keys(R)])];const bal=els.every(e=>(L[e]||0)===(R[e]||0))&&co.every(c=>c>0);const g=co.reduce((a,c)=>gcd(a,c),0);return {L,R,els,bal,simplest:g<=1};};
  function upd(){const s=state();sp().forEach((f,i)=>{const o=$('#eq-c'+i);if(o)o.textContent=co[i];});
    $('#eq-line').innerHTML=`${eqSide(X.r,co.slice(0,nR()).map(c=>c||0))} → ${eqSide(X.p,co.slice(nR()).map(c=>c||0))}`;
    $('#eq-tally').innerHTML='<thead><tr><th>Atom</th><th>Reactants</th><th>Products</th><th></th></tr></thead><tbody>'+s.els.map(e=>{const a=s.L[e]||0,b=s.R[e]||0;return `<tr><td><b>${e}</b></td><td>${a}</td><td>${b}</td><td style="color:var(--${a===b?'good':'bad'});font-weight:600">${a===b?'✓ equal':'✗ '+(a>b?'too many on the left':'too many on the right')}</td></tr>`;}).join('')+'</tbody>';
    const fb=$('#eq-fb');if(co.some(c=>c===0)){fb.className='fb no';fb.textContent='A coefficient of 0 removes that substance. Use at least 1.';}else if(s.bal&&s.simplest){fb.className='fb ok';fb.textContent='Balanced, with the simplest whole numbers. Press React! to watch the atoms regroup.';}else if(s.bal){fb.className='fb no';fb.textContent='Balanced, but not in simplest terms: divide all the coefficients by their common factor.';}else{fb.className='fb no';fb.textContent='Not balanced yet: compare the atom counts in the table.';}
    $('#eq-go').disabled=!s.bal;sim.render();}
  /* layout: molecules on a grid per panel */
  function grid(list,x0,y0,w,h){const n=list.length;if(!n)return {pos:[],u:12};const cols=Math.max(1,Math.ceil(Math.sqrt(n*w/h))),rows=Math.ceil(n/cols),cell=Math.min(w/cols,h/rows),u=clamp(cell/3,6,26);
    return {u,pos:list.map((f,i)=>[x0+(i%cols+.5)*w/cols,y0+(Math.floor(i/cols)+.5)*h/rows,f])};}
  const sim=sim2d(cv,{h:w=>clamp(w*.5,260,340),step(dt){if(moving){anim=Math.min(1,anim+dt/1.6);if(anim>=1)moving=false;}},
    draw(ctx,w,h){const s=state(),pw=w/2-26,ph=h-40,Ls=[],Rs=[];X.r.forEach((f,i)=>{for(let k=0;k<co[i];k++)Ls.push(f);});X.p.forEach((f,i)=>{for(let k=0;k<co[nR()+i];k++)Rs.push(f);});
      const gl=grid(Ls,10,28,pw,ph),gr=grid(Rs,w/2+16,28,pw,ph),u=Math.min(gl.u,gr.u);
      label(ctx,'reactants',10+pw/2,10,T.cx,'center','middle','600 12px "IBM Plex Mono",monospace');label(ctx,'products',w/2+16+pw/2,10,T.cv,'center','middle','600 12px "IBM Plex Mono",monospace');
      arrow(ctx,w/2-16,h/2,w/2+10,h/2,T.ink,3);
      ctx.strokeStyle=T.line;ctx.setLineDash([4,4]);ctx.strokeRect(10,28,pw,ph);ctx.strokeRect(w/2+16,28,pw,ph);ctx.setLineDash([]);
      if(anim<=0||!s.bal){gl.pos.forEach(([x,y,f])=>drawMol2D(ctx,f,x,y,u));gr.pos.forEach(([x,y,f])=>drawMol2D(ctx,f,x,y,u,{alpha:anim>0?1:(s.bal?.35:1)}));}
      else{/* atoms travel from reactant molecules to product molecules */
        const from={},to={};gl.pos.forEach(([x,y,f])=>molAtoms(f).atoms.forEach(a=>{(from[a.e]=from[a.e]||[]).push([x+a.x*u,y+a.y*u]);}));
        gr.pos.forEach(([x,y,f])=>molAtoms(f).atoms.forEach(a=>{(to[a.e]=to[a.e]||[]).push([x+a.x*u,y+a.y*u]);}));
        const k=anim<.5?2*anim*anim:1-2*(1-anim)*(1-anim);
        if(anim>=1)gr.pos.forEach(([x,y,f])=>drawMol2D(ctx,f,x,y,u));
        else Object.keys(from).forEach(e=>from[e].forEach((p,i)=>{const q=(to[e]||[])[i]||p;const x=p[0]+(q[0]-p[0])*k,y=p[1]+(q[1]-p[1])*k-Math.sin(k*3.14)*18;ball2(ctx,x,y,u*(e==='H'?.3:.45),e2col(e),e==='H'?'rgba(0,0,0,.45)':null);}));}
    }});
  $('#eq-go').addEventListener('click',()=>{if(!state().bal)return;anim=REDUCE?1:.001;moving=!REDUCE;sim.render();if(anim>=1)burst($('#eq-go'),16);else setTimeout(()=>burst($('#eq-go'),22),1700);});
  $('#eq-reset').addEventListener('click',load);sel.addEventListener('change',load);
  load();drawers.equations=()=>sim.render();
  TIPS['eq-sel']='Count the atoms of each element on both sides before changing anything.';
  KEYS['eq-canvas']=['Use the + and − buttons to set the coefficients, then press React!.',[['cx','reactant side'],['cv','product side']]];
  GLOSS['coefficient']='The number in front of a formula in an equation. It says how many of that molecule or formula unit take part.';
  GLOSS['balanced']='Having the same number of each kind of atom on both sides of the equation.';
  TT.equations='Insist that students count atoms in a table instead of "by eye". A quick routine: balance elements that appear in only one reactant and one product first; leave O₂ and H₂ until the end.';
})();
const eqSame=(a,b)=>{const k=[...new Set([...Object.keys(a),...Object.keys(b)])];return k.every(e=>(a[e]||0)===(b[e]||0));};
(function(){
  const BAL=[['C3H8','O2','CO2','H2O',[1,5,3,4]],['C2H6','O2','CO2','H2O',[2,7,4,6]],['C4H10','O2','CO2','H2O',[2,13,8,10]],['Fe2O3','CO','Fe','CO2',[1,3,2,3]],['Al','HCl','AlCl3','H2',[2,6,2,3]],['NH3','O2','NO','H2O',[4,5,4,6]],['C6H12O6','O2','CO2','H2O',[1,6,6,6]],['Ca(OH)2','H3PO4','Ca3(PO4)2','H2O',[3,2,1,6]],['Mg','O2','MgO','',[2,1,2]],['Fe','O2','Fe2O3','',[4,3,2]],['Al','O2','Al2O3','',[4,3,2]],['Na','H2O','NaOH','H2',[2,2,2,1]],['KClO3','','KCl','O2',[2,2,3]],['Pb(NO3)2','KI','PbI2','KNO3',[1,2,1,2]]];
  PROBS.push({id:'eq-coef',topic:'equations',title:'Balance and read a coefficient',gen(){const [a,b,c,d,co]=pick(BAL),fs=[a,b,c,d].filter(x=>x),k=ri(0,fs.length-1),nr=b?(a&&b?2:1):1;
    const reac=[a,b].filter(x=>x),prod=[c,d].filter(x=>x);
    if(!eqSame(eqCounts(reac,co.slice(0,reac.length)),eqCounts(prod,co.slice(reac.length))))throw new Error('unbalanced bank entry '+reac+' '+prod);
    return {q:`Balance ${reac.map(fsub).join(' + ')} → ${prod.map(fsub).join(' + ')} using the smallest whole-number coefficients. What is the coefficient of ${fsub(fs[k])}?`,ans:co[k],unit:'',abs:.01,hint:'Balance the elements that appear in only one substance on each side first, and leave elements that appear alone (like O₂) for last.',
      sol:`Balanced: ${eqSide(reac,co.slice(0,reac.length))} → ${eqSide(prod,co.slice(reac.length))}. The coefficient of ${fsub(fs[k])} is <b>${co[k]}</b>.`};}});
  PROBS.push({id:'eq-count',topic:'equations',title:'Count the atoms',gen(){const f=pick(['Ca(OH)2','Al2(SO4)3','Mg3(PO4)2','Fe(NO3)3','(NH4)2SO4','C6H12O6','Na2CO3']),k=ri(2,5),{count}=molarMass(f),e=pick(Object.keys(count)),ans=k*count[e];
    return {q:`How many ${e} atoms are represented by ${k}${fsub(f)}?`,ans,unit:'atoms',abs:.01,hint:'Multiply the subscript of the atom (and any number outside parentheses) by the coefficient.',sol:`Each ${fsub(f)} has ${count[e]} ${e}; ${k} × ${count[e]} = <b>${ans}</b>.`};}});
  PROBS.push({id:'eq-check',topic:'equations',title:'Is it balanced?',gen(){const [a,b,c,d,co]=pick(BAL.filter(x=>x[1]&&x[3]));const bad=co.slice();const brk=Math.random()<.5;if(brk){const i=ri(0,3);bad[i]=bad[i]+1;}
    const reac=[a,b],prod=[c,d],okk=eqSame(eqCounts(reac,bad.slice(0,2)),eqCounts(prod,bad.slice(2))),ch=['balanced','not balanced'];
    return {q:`Is this equation balanced? ${eqSide(reac,bad.slice(0,2))} → ${eqSide(prod,bad.slice(2))}`,choices:ch,ans:okk?0:1,hint:'Count each kind of atom on both sides.',sol:`${okk?'Every atom count matches':'The atom counts do not match'}: <b>${okk?'balanced':'not balanced'}</b>.`};}});
})();
