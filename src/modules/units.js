
/* ---------------- Units & dimensional analysis ---------------- */
(function units(){
  const host=$('#un-chain');if(!host)return;
  const NA=6.022e23;
  const F=(nv,nu,dv,du)=>({n:{v:nv,u:nu},d:{v:dv,u:du}});
  const PROB=[
    {q:'Convert 2.50 L to mL.',start:{t:'2.50',v:2.5,sf:3,n:['L'],d:[]},target:{n:['mL'],d:[]},tiles:[F(1000,'mL',1,'L'),F(100,'cm',1,'m'),F(1,'mL',1000,'L')]},
    {q:'Convert a speed of 72 km/h to m/s.',start:{t:'72',v:72,sf:2,n:['km'],d:['h']},target:{n:['m'],d:['s']},tiles:[F(1000,'m',1,'km'),F(3600,'s',1,'h'),F(60,'min',1,'h'),F(60,'s',1,'min')]},
    {q:'How many formula units of NaCl are in 45.0 g of NaCl?',start:{t:'45.0',v:45,sf:3,n:['g NaCl'],d:[]},target:{n:['formula units NaCl'],d:[]},tiles:[F(1,'mol NaCl',58.44,'g NaCl'),F(NA,'formula units NaCl',1,'mol NaCl'),F(1000,'mg NaCl',1,'g NaCl'),F(1,'kg NaCl',1000,'g NaCl')]},
    {q:'What is the mass in kg of 250 mL of ethanol (density 0.789 g/mL)?',start:{t:'250',v:250,sf:3,n:['mL ethanol'],d:[]},target:{n:['kg ethanol'],d:[]},tiles:[F(.789,'g ethanol',1,'mL ethanol'),F(1,'kg ethanol',1000,'g ethanol'),F(1000,'mL ethanol',1,'L ethanol')]},
    {q:'What is the mass of 0.250 mol of CO₂?',start:{t:'0.250',v:.25,sf:3,n:['mol CO₂'],d:[]},target:{n:['g CO₂'],d:[]},tiles:[F(44.01,'g CO₂',1,'mol CO₂'),F(2,'mol O',1,'mol CO₂'),F(NA,'molecules CO₂',1,'mol CO₂')]},
    {q:'How many H atoms are in 5.0 g of water?',start:{t:'5.0',v:5,sf:2,n:['g H₂O'],d:[]},target:{n:['atoms H'],d:[]},tiles:[F(1,'mol H₂O',18.02,'g H₂O'),F(2,'mol H',1,'mol H₂O'),F(NA,'atoms H',1,'mol H'),F(1,'mol H',2,'mol H₂O')]}
  ];
  const sel=$('#un-prob');sel.innerHTML=PROB.map((p,i)=>`<option value="${i}">${p.q.replace(/\.$|\?$/,'')}</option>`).join('');
  let cur=0,chain=[],flips=[];
  const numTxt=v=>v>=1e5||v<1e-3?sci(v,3).replace(/ × /,' × '):String(+v.toPrecision(6));
  const tileHTML=(f,cls='')=>`<span class="frac ${cls}"><span class="n"><span class="u">${numTxt(f.n.v)} ${f.n.u}</span></span><span class="d"><span class="u">${numTxt(f.d.v)} ${f.d.u}</span></span></span>`;
  const inv=f=>({n:f.d,d:f.n});
  function compute(){/* cancel matching unit labels between numerators and denominators across the whole chain */
    const P=PROB[cur];const items=[{n:[{u:P.start.n[0]||null,v:P.start.v,k:'s'}].filter(x=>x.u),d:P.start.d.map(u=>({u})),v:P.start.v,t:P.start.t,start:true}];
    chain.forEach(f=>items.push({n:[{u:f.n.u}],d:[{u:f.d.u}],v:f.n.v/f.d.v,f}));
    const nums=[],dens=[];items.forEach((it,i)=>{it.n.forEach(x=>nums.push({u:x.u,i,x:false}));it.d.forEach(x=>dens.push({u:x.u,i,x:false}));});
    nums.forEach(a=>{const m=dens.find(b=>!b.x&&b.u===a.u);if(m){a.x=true;m.x=true;}});
    let val=1;items.forEach(it=>val*=it.v);
    return {items,nums,dens,val,left:{n:nums.filter(a=>!a.x).map(a=>a.u),d:dens.filter(a=>!a.x).map(a=>a.u)}};}
  function render(){const P=PROB[cur],c=compute();
    const cell=(it,i)=>{const n=c.nums.filter(a=>a.i===i),d=c.dens.filter(a=>a.i===i);
      const side=(arr,val)=>(val!=null?`<span>${val} </span>`:'')+(arr.length?arr.map(a=>`<span class="u${a.x?' x':''}">${a.u}</span>`).join(' '):'');
      if(it.start)return `<span class="frac"><span class="n"><span>${it.t||numTxt(it.v)}</span> ${n.map(a=>`<span class="u${a.x?' x':''}">${a.u}</span>`).join(' ')}</span><span class="d${d.length?'':' one'}">${d.length?d.map(a=>`<span class="u${a.x?' x':''}">${a.u}</span>`).join(' '):'1'}</span></span>`;
      const f=it.f;return `<span class="frac rm" data-i="${i-1}" role="button" tabindex="0" aria-label="Remove this factor"><span class="n"><span>${numTxt(f.n.v)}</span> <span class="u${n[0].x?' x':''}">${f.n.u}</span></span><span class="d"><span>${numTxt(f.d.v)}</span> <span class="u${d[0].x?' x':''}">${f.d.u}</span></span></span>`;};
    host.innerHTML=c.items.map((it,i)=>(i?'<span class="times">×</span>':'')+cell(it,i)).join('')+(chain.length?'':'<span class="small" style="margin-left:8px">Add a factor from below.</span>');
    const res=$('#un-res'),L=c.left,ok=chain.length&&L.d.length===P.target.d.length&&L.n.length===P.target.n.length&&L.n.every((u,k)=>u===P.target.n[k])&&L.d.every((u,k)=>u===P.target.d[k]);
    const unitTxt=(L.n.join(' · ')||'1')+(L.d.length?' / '+L.d.join(' · '):'');
    if(!chain.length){res.className='un-res';res.textContent=`Start: ${P.start.t} ${P.start.n.join(' ')}${P.start.d.length?'/'+P.start.d.join(' '):''}. Target unit: ${P.target.n.join(' ')}${P.target.d.length?' / '+P.target.d.join(' '):''}.`;}
    else if(ok){const v=+c.val.toPrecision(P.start.sf);res.className='un-res ok';res.textContent=`✓ Units cancel to ${unitTxt}. Answer: ${v>=1e5||v<1e-3?sci(v,P.start.sf-1):String(v)} ${unitTxt}`;if(!res.dataset.done||res.dataset.done!==String(chain.length)){burst(res,22);}res.dataset.done=String(chain.length);}
    else{res.className='un-res warn';res.dataset.done='';res.textContent=`Units left: ${unitTxt}. Target: ${P.target.n.join(' ')}${P.target.d.length?' / '+P.target.d.join(' '):''}.`;}
  }
  function tiles(){const P=PROB[cur];$('#un-tiles').innerHTML=P.tiles.map((f,i)=>`<div class="un-tile" data-i="${i}">${tileHTML(flips[i]?inv(f):f)}<button type="button" class="flip" aria-label="Flip this factor upside down" title="Flip">⇅</button></div>`).join('');}
  function load(i){cur=i;chain=[];flips=PROB[cur].tiles.map(()=>false);$('#un-q').textContent=PROB[cur].q;$('#un-res').dataset.done='';tiles();render();}
  $('#un-tiles').addEventListener('click',e=>{const t=e.target.closest('.un-tile');if(!t)return;const i=+t.dataset.i,f=PROB[cur].tiles[i];
    if(e.target.closest('.flip')){flips[i]=!flips[i];tiles();return;}if(e.target.closest('.frac')){chain.push(flips[i]?inv(f):f);render();}});
  host.addEventListener('click',e=>{const r=e.target.closest('.frac.rm');if(!r)return;chain.splice(+r.dataset.i,1);render();});
  host.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const r=e.target.closest('.frac.rm');if(!r)return;e.preventDefault();chain.splice(+r.dataset.i,1);render();});
  $('#un-clear').addEventListener('click',()=>{chain=[];$('#un-res').dataset.done='';render();});
  sel.addEventListener('change',()=>load(+sel.value));
  load(0);
  TIPS['un-prob']='Look at the starting unit and the target unit. Each factor you add should cancel one unit and bring in the next one on the way to the target.';
  GLOSS['conversion factor']='A fraction equal to 1 that relates two units, such as 1000 mL / 1 L.';
  GLOSS['dimensional analysis']='Solving a problem by carrying units through the math and cancelling them.';
  TT.units='Insist on units next to every number from the first day. Students who write units catch their own errors: ask "what do the units say?" before "what did you get?". Let them add a wrong factor on purpose and see that nothing cancels.';
})();
(function(){
  const MM=[['NaCl',58.44],['glucose, C₆H₁₂O₆',180.16],['CaCO₃',100.09],['sucrose, C₁₂H₂₂O₁₁',342.30],['KCl',74.55],['MgCl₂',95.21],['NaOH',40.00]];
  PROBS.push({id:'units-mg-mol',topic:'units',title:'Milligrams to moles',gen(){const [n,M]=pick(MM),mg=ri(120,980)*5;const ans=mg/1000/M;
    return {q:`A tablet contains ${mg} mg of ${n} (molar mass ${M} g/mol). How many moles is that?`,ans,unit:'mol',hint:'Convert mg to g first (1 g = 1000 mg), then divide by the molar mass. Check that g cancels.',
      sol:`${mg} mg × (1 g / 1000 mg) × (1 mol / ${M} g) = <b>${sci(ans,3)} mol</b>. The mg cancel, then the g cancel.`};}});
  PROBS.push({id:'units-mph',topic:'units',title:'Miles per hour to m/s',gen(){const v=ri(30,80);const ans=v*1609.344/3600;
    return {q:`A car travels at ${v} mi/h. What is its speed in m/s? (1 mi = 1609.344 m exactly.)`,ans,unit:'m/s',hint:'Two conversions: miles to meters, hours to seconds (3600 s in 1 h). Put each unit you want to remove on the other side of the fraction.',
      sol:`${v} mi/h × (1609.344 m / 1 mi) × (1 h / 3600 s) = <b>${fmt(ans,2)} m/s</b>.`};}});
  PROBS.push({id:'units-molecules',topic:'units',title:'Grams to molecules',gen(){const g=ri(2,40),M=18.02;const ans=g/M*6.022e23;
    return {q:`How many molecules of water are in ${g} g of H₂O? (Molar mass 18.02 g/mol; give your answer in scientific notation, like 1.2e24.)`,ans,unit:'molecules',hint:'Grams to moles using the molar mass, then moles to molecules using Avogadro\'s number, 6.022 × 10²³ per mole.',
      sol:`${g} g × (1 mol / 18.02 g) × (6.022 × 10²³ molecules / 1 mol) = <b>${sci(ans,3)} molecules</b>.`};}});
})();
