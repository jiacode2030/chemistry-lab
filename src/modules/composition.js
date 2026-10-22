
/* ---------------- Composition & empirical formulas ---------------- */
function compositionData(f){/* percent -> grams -> moles -> ratio -> whole numbers, the way a student does it (percents rounded to 0.01) */
  const {M,count}=molarMass(f),els=Object.keys(count),pct=els.map(e=>+(count[e]*ATM[e]/M*100).toFixed(2)),mol=els.map((e,i)=>pct[i]/ATM[e]),mn=Math.min(...mol),ratio=mol.map(x=>x/mn);
  let k=1;for(;k<=8;k++)if(ratio.every(r=>Math.abs(r*k-Math.round(r*k))<=.1))break;
  const whole=ratio.map(r=>Math.round(r*k)),Me=whole.reduce((a,w,i)=>a+w*ATM[els[i]],0),n=Math.round(M/Me);
  return {f,M,els,pct,mol,ratio,k,whole,Me,n,count};}
const formulaStr=(els,nums)=>els.map((e,i)=>e+(nums[i]>1?nums[i]:'')).join('');
(function composition(){
  const cv=$('#cp-canvas');if(!cv)return;
  const LIST=['C6H12O6','H2O2','C6H6','C4H8O2','P4O10','N2O4','Fe2O3','C8H18'];
  const sel=$('#cp-sel');sel.innerHTML=LIST.map((f,i)=>{const d=compositionData(f);return `<option value="${f}">Compound ${i+1}: ${d.els.map((e,j)=>`${d.pct[j]}% ${e}`).join(', ')}</option>`;}).join('');
  ATM.P=ATM.P||30.97;
  const col=e=>e==='H'?'#9AA7B5':e==='Fe'?'#B7541E':atomCol(e);
  let D=compositionData(LIST[0]),step=0,cur=[],tgt=[];
  const STEPS=['Step 1 of 6. Pretend you have exactly 100 g, so each percent is a number of grams.','Step 2 of 6. Convert each mass to moles: divide by the molar mass of that element.','Step 3 of 6. Divide every amount by the smallest one, so the smallest becomes 1.','Step 4 of 6. If any ratio is not close to a whole number, multiply them all by the same small whole number.','Step 5 of 6. The whole numbers are the subscripts: this is the empirical formula.','Step 6 of 6. Divide the compound\'s molar mass by the empirical formula mass to get the molecular formula.'];
  const vals=s=>s===0?D.pct:s===1?D.mol:s===2?D.ratio:s===3?D.whole:D.whole;
  const unit=s=>['grams in 100 g','moles','ratio (÷ smallest)','whole-number ratio','atoms in the empirical formula','atoms in the molecular formula'][s];
  function table(){const h=['Element','Mass in 100 g (g)','Moles','÷ smallest',D.k>1?`× ${D.k}`:'× 1 (already whole)','Subscript'],rows=D.els.map((e,i)=>[e,D.pct[i].toFixed(2),step>=1?D.mol[i].toFixed(3):'—',step>=2?D.ratio[i].toFixed(2):'—',step>=3?String(Math.round(D.ratio[i]*D.k*100)/100):'—',step>=4?String(D.whole[i]):'—']);
    $('#cp-table').innerHTML='<thead><tr>'+h.map(x=>`<th>${x}</th>`).join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map((c,j)=>`<td${j===0?' style="font-weight:600"':''}>${c}</td>`).join('')+'</tr>').join('')+'</tbody>'+(step>=4?`<tfoot><tr><td colspan="6" style="font-weight:600">Empirical formula: ${fsub(formulaStr(D.els,D.whole))} (mass ${D.Me.toFixed(2)} g/mol)${step>=5?` · molar mass ${D.M.toFixed(2)} g/mol ÷ ${D.Me.toFixed(2)} = ${(D.M/D.Me).toFixed(2)} ≈ ${D.n} → molecular formula <span style="color:var(--good)">${fsub(formulaStr(D.els,D.whole.map(w=>w*D.n)))}</span>`:''}</td></tr></tfoot>`:'');}
  function go(s){step=clamp(s,0,5);tgt=vals(step).map((v,i)=>step===5?v*D.n:v);if(REDUCE)cur=tgt.slice();$('#cp-step').textContent=STEPS[step];$('#cp-back').disabled=step===0;$('#cp-next').textContent=step===5?'Start over':'Next step';table();sim.render();}
  function load(){D=compositionData(sel.value);cur=D.pct.map(()=>0);step=0;go(0);}
  const sim=sim2d(cv,{h:w=>clamp(w*.5,260,340),step(dt){cur=cur.map((c,i)=>c+((tgt[i]??0)-c)*Math.min(1,dt*4));},
    draw(ctx,w,h,t){const n=D.els.length,bx=56,bw=w-bx-16,H=h-70,base=h-34;const mx=Math.max(...tgt,1e-6)*1.18;const nice=niceStep(mx,4);
      ctx.strokeStyle=T.line;ctx.fillStyle=T.muted;ctx.font=MONO;ctx.textAlign='right';ctx.textBaseline='middle';ctx.lineWidth=1;
      for(let v=0;v<=mx;v+=nice){const y=Math.round(base-v/mx*H)+.5;ctx.beginPath();ctx.moveTo(bx,y);ctx.lineTo(bx+bw,y);ctx.stroke();ctx.fillText(tick(v,nice),bx-6,y);}
      label(ctx,unit(step),bx,10,T.ink,'left','middle',LABEL);
      const slot=bw/n,bwid=Math.min(70,slot*.55);
      D.els.forEach((e,i)=>{const x=bx+slot*(i+.5),v=cur[i]||0,hh=v/mx*H;
        if(step>=4){/* atoms */const N=Math.round(tgt[i]);const per=Math.max(1,Math.ceil(Math.sqrt(N)));for(let a=0;a<N;a++){const gx=a%per,gy=Math.floor(a/per);const r=Math.min(13,slot/(per*2.3));ball2(ctx,x+(gx-(per-1)/2)*r*2.2,base-18-gy*r*2.2,r,col(e),e==='H'?'rgba(0,0,0,.45)':null);}}
        else{ctx.fillStyle=col(e);ctx.fillRect(x-bwid/2,base-hh,bwid,hh);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.strokeRect(x-bwid/2+.5,base-hh+.5,bwid-1,hh);label(ctx,v>=100?v.toFixed(0):v.toFixed(step===3?0:2),x,base-hh-6,T.ink,'center','bottom',MONO);}
        label(ctx,e,x,base+14,T.ink,'center','top','700 15px "IBM Plex Sans",sans-serif');});
      if(step>=4)label(ctx,fsub(formulaStr(D.els,step===5?D.whole.map(w=>w*D.n):D.whole)),w-16,10,T.good,'right','middle','700 18px "IBM Plex Sans",sans-serif');}});
  drawers.composition=()=>sim.render();
  $('#cp-next').addEventListener('click',()=>{if(step===5){load();}else go(step+1);});$('#cp-back').addEventListener('click',()=>go(step-1));
  sel.addEventListener('change',load);load();
  TIPS['cp-sel']='Each compound is described only by its percent composition. Step through to find its formula.';
  GLOSS['empirical formula']='The simplest whole-number ratio of atoms in a compound.';
  GLOSS['molecular formula']='The actual number of each atom in one molecule: a whole-number multiple of the empirical formula.';
  TT.composition='Do one example with a fruit-salad ratio before using atoms. When students round 1.5 to 2, ask them to check by turning the formula back into mass percent.';
})();
(function(){
  const COMP=['C6H12O6','H2O2','C6H6','C4H8O2','P4O10','N2O4','Fe2O3','C8H18','C2H4','C3H6O3','C6H8O6','N2H4'];
  const el=e=>e;
  PROBS.push({id:'comp-pct',topic:'composition',title:'Mass percent of an element',gen(){const f=pick(['C6H12O6','CaCO3','H2SO4','Al2O3','NH3','C2H5OH','Ca(OH)2','Na2CO3','Fe2O3','C3H8']),{M,count}=molarMass(f),e=pick(Object.keys(count)),ans=count[e]*ATM[e]/M*100;
    return {q:`What is the mass percent of ${e} in ${fsub(f)}? (Use the atomic masses H 1.008, C 12.01, N 14.01, O 16.00, Na 22.99, Al 26.98, S 32.07, Ca 40.08, Fe 55.85.)`,ans,unit:'%',tol:.005,hint:'mass % = (mass of that element in one mole of compound ÷ molar mass of the compound) × 100.',
      sol:`M = ${M.toFixed(2)} g/mol. The ${e} in one mole weighs ${count[e]} × ${ATM[e]} = ${(count[e]*ATM[e]).toFixed(2)} g. ${(count[e]*ATM[e]).toFixed(2)} ÷ ${M.toFixed(2)} × 100 = <b>${ans.toFixed(1)}%</b>.`};}});
  PROBS.push({id:'comp-emp',topic:'composition',title:'Empirical formula from percent composition',gen(){const f=pick(['C6H12O6','H2O2','C6H6','C4H8O2','P4O10','N2O4','Fe2O3','C8H18','C2H4']),d=compositionData(f),ef=formulaStr(d.els,d.whole),opts=new Set([ef]);
    const tries=[formulaStr(d.els,d.pct.map(p=>Math.round(p/10))),formulaStr(d.els,d.whole.map((w,i)=>w+(i?1:0))),formulaStr(d.els,d.whole.slice().reverse()),formulaStr(d.els,d.whole.map(w=>w*2)),formulaStr(d.els,d.els.map((e,i)=>Math.max(1,Math.round(d.ratio[i]))))];
    tries.forEach(x=>{if(opts.size<4&&x!==ef&&!/^\D+$/.test('')&&x.length)opts.add(x);});let i=0;while(opts.size<4){opts.add(formulaStr(d.els,d.whole.map(w=>w+(++i))));}
    const ch=[...opts].sort(()=>Math.random()-.5);
    return {q:`A compound contains ${d.els.map((e,i)=>d.pct[i]+'% '+e).join(', ')} by mass. What is its empirical formula? (Atomic masses: H 1.008, C 12.01, N 14.01, O 16.00, P 30.97, Fe 55.85.)`,choices:ch.map(fsub),ans:ch.indexOf(ef),hint:'Assume 100 g, convert each mass to moles, divide by the smallest, and multiply to get whole numbers if needed.',
      sol:`Moles in 100 g: ${d.els.map((e,i)=>`${e} ${d.mol[i].toFixed(3)}`).join(', ')}. Divide by ${Math.min(...d.mol).toFixed(3)}: ${d.ratio.map(r=>r.toFixed(2)).join(' : ')}${d.k>1?`; multiply by ${d.k}`:''} → <b>${fsub(ef)}</b>.`};}});
  PROBS.push({id:'comp-mol',topic:'composition',title:'Molecular formula from the empirical formula',gen(){const f=pick(['C6H12O6','H2O2','C6H6','C4H8O2','P4O10','N2O4','C6H8O6']),d=compositionData(f),ef=formulaStr(d.els,d.whole),M=+(d.M*(1+(Math.random()-.5)*.006)).toFixed(1);
    const mult=[1,2,3,4,6].filter(k=>k!==d.n).sort(()=>Math.random()-.5).slice(0,3),ks=[d.n,...mult].sort((a,b)=>a-b),ch=ks.map(k=>fsub(formulaStr(d.els,d.whole.map(w=>w*k))));
    return {q:`The empirical formula of a compound is ${fsub(ef)} and its molar mass is ${M} g/mol. What is its molecular formula? (Atomic masses: H 1.008, C 12.01, N 14.01, O 16.00, P 30.97.)`,choices:ch,ans:ks.indexOf(d.n),hint:'Divide the molar mass by the empirical formula mass, round to a whole number n, and multiply every subscript by n.',
      sol:`Empirical formula mass = ${d.Me.toFixed(2)} g/mol. ${M} ÷ ${d.Me.toFixed(2)} = ${(M/d.Me).toFixed(2)} ≈ ${d.n}, so the molecular formula is <b>${fsub(formulaStr(d.els,d.whole.map(w=>w*d.n)))}</b>.`};}});
})();
