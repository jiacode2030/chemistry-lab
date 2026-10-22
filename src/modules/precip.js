
/* ---------------- Net ionic equations & precipitation ---------------- */
const PR_CAT={Ag:[1,'Ag','Ag⁺'],Na:[1,'Na','Na⁺'],K:[1,'K','K⁺'],Pb:[2,'Pb','Pb²⁺'],Ba:[2,'Ba','Ba²⁺'],Ca:[2,'Ca','Ca²⁺'],Cu:[2,'Cu','Cu²⁺'],Mg:[2,'Mg','Mg²⁺'],Fe:[3,'Fe','Fe³⁺']};
const PR_AN={Cl:[-1,'Cl','Cl⁻',false],NO3:[-1,'NO₃','NO₃⁻',true],I:[-1,'I','I⁻',false],SO4:[-2,'SO₄','SO₄²⁻',true],OH:[-1,'OH','OH⁻',true],CO3:[-2,'CO₃','CO₃²⁻',true]};
function prSoluble(c,a){if(['Na','K'].includes(c))return true;if(a==='NO3')return true;if(a==='Cl'||a==='I')return !['Ag','Pb'].includes(c);if(a==='SO4')return !['Ba','Pb'].includes(c);return false;}
function prFormula(c,a){const q=PR_CAT[c][0],z=-PR_AN[a][0],g=gcd(q,z),nc=z/g,na=q/g,A=PR_AN[a];const an=na===1?A[1]:(A[3]?`(${A[1]})${na}`:A[1]+na);return PR_CAT[c][1]+(nc>1?nc:'')+an;}
const prFsub=f=>f.replace(/(\d+)/g,d=>[...d].map(c=>'₀₁₂₃₄₅₆₇₈₉'[c]).join(''));
const PR_COL={AgCl:'#E9ECF1',PbI2:'#F2D12E',BaSO4:'#E9ECF1',CuOH2:'#5B9BE8',CaCO3:'#E9ECF1',FeOH3:'#B35A2B',PbCl2:'#E9ECF1'};
function prReaction(a,b){/* a=[cat,an] of salt 1, b=[cat,an] of salt 2 */
  const S1=prFormula(a[0],a[1]),S2=prFormula(b[0],b[1]),P1=prFormula(a[0],b[1]),P2=prFormula(b[0],a[1]),s1=prSoluble(a[0],b[1]),s2=prSoluble(b[0],a[1]);
  /* coefficients from ion balance, by search */
  const n=(c,an)=>[-PR_AN[an][0]/gcd(PR_CAT[c][0],-PR_AN[an][0]),PR_CAT[c][0]/gcd(PR_CAT[c][0],-PR_AN[an][0])];
  const n1=n(a[0],a[1]),n2=n(b[0],b[1]),p1=n(a[0],b[1]),p2=n(b[0],a[1]);let co=null;
  for(let c1=1;c1<=6&&!co;c1++)for(let c2=1;c2<=6&&!co;c2++)for(let q1=1;q1<=6&&!co;q1++)for(let q2=1;q2<=6&&!co;q2++){
    if(c1*n1[0]===q1*p1[0]&&c2*n2[1]===q1*p1[1]&&c2*n2[0]===q2*p2[0]&&c1*n1[1]===q2*p2[1])co=[c1,c2,q1,q2];}
  if(!co)co=[1,1,1,1];
  const ion=(c,an,k)=>[[k*(c==='x'?0:0),''],];
  const species=[];/* complete ionic: left ions */
  const ions=(c,an,k)=>{const [nc,na]=n(c,an);return [[k*nc,PR_CAT[c][2],'c:'+c],[k*na,PR_AN[an][2],'a:'+an]];};
  const left=[...ions(a[0],a[1],co[0]),...ions(b[0],b[1],co[1])];
  const right=[];if(s1)right.push(...ions(a[0],b[1],co[2]));else right.push([co[2],prFsub(P1)+'(s)','s:1']);if(s2)right.push(...ions(b[0],a[1],co[3]));else right.push([co[3],prFsub(P2)+'(s)','s:2']);
  /* merge duplicate ions on each side */
  const merge=L=>{const m=new Map();L.forEach(([k,t,id])=>m.set(id,(m.get(id)||[0,t,id]).map((v,i)=>i===0?v+k:v)));return [...m.values()];};
  const Lm=merge(left),Rm=merge(right),spect=Lm.filter(l=>Rm.some(r=>r[2]===l[2]&&!r[2].startsWith('s')));
  const rxn=s1&&s2?null:1;
  return {S1,S2,P1,P2,s1,s2,co,Lm,Rm,spect,reacts:!(s1&&s2),
    mol:`${co[0]>1?co[0]:''}${prFsub(S1)}(aq) + ${co[1]>1?co[1]:''}${prFsub(S2)}(aq) → ${co[2]>1?co[2]:''}${prFsub(P1)}(${s1?'aq':'s'}) + ${co[3]>1?co[3]:''}${prFsub(P2)}(${s2?'aq':'s'})`};}
function prNet(rx){/* net ionic: ions on the left that end up in a solid */
  if(!rx.reacts)return null;const left=[],R=rx.Rm.filter(r=>r[2].startsWith('s'));
  rx.Lm.forEach(l=>{if(!rx.spect.some(s=>s[2]===l[2]))left.push(l);});
  const sol=R.map(r=>({k:r[0],t:r[1]}));const g=[...left.map(l=>l[0]),...sol.map(s=>s.k)].reduce((a,b)=>gcd(a,b));
  const fmtIon=(k,t)=>`${k/g>1?k/g:''}${t.includes('(s)')?t:t+'(aq)'}`;
  return `${left.map(l=>fmtIon(l[0],l[1])).join(' + ')} → ${sol.map(s=>fmtIon(s.k,s.t)).join(' + ')}`;}
(function precip(){
  const cv=$('#pr-canvas');if(!cv)return;
  const RX=[[['Ag','NO3'],['Na','Cl']],[['Pb','NO3'],['K','I']],[['Ba','Cl'],['Na','SO4']],[['Cu','SO4'],['Na','OH']],[['Ca','Cl'],['Na','CO3']],[['Fe','Cl'],['Na','OH']],[['Na','Cl'],['K','NO3']],[['Pb','NO3'],['Na','Cl']]];
  const sel=$('#pr-sel');sel.innerHTML=RX.map((r,i)=>`<option value="${i}">${prFsub(prFormula(r[0][0],r[0][1]))}(aq) + ${prFsub(prFormula(r[1][0],r[1][1]))}(aq)</option>`).join('');
  const CC={Ag:'#B4BBC6',Na:'#9B72F5',K:'#8A5CE0',Pb:'#7A8494',Ba:'#3DAA6D',Ca:'#4DB87A',Cu:'#3E7BDC',Mg:'#46B96B',Fe:'#C0662B'},AC={Cl:'#2FB55A',NO3:'#4FB9E3',I:'#7B2FA6',SO4:'#E8C42A',OH:'#E5484D',CO3:'#6B7280'};
  let rx=null,pairs=[],ions=[],mixed=false,heights=[],t0=0;
  function build(){const r=RX[+sel.value];rx=prReaction(r[0],r[1]);const w=cv.clientWidth||500,h=Math.round(clamp(w*.55,280,360));ions=[];heights=Array(Math.ceil(w/11)).fill(0);mixed=false;
    [[r[0],0],[r[1],1]].forEach(([s,side])=>{const [nc,na]=[-PR_AN[s[1]][0]/gcd(PR_CAT[s[0]][0],-PR_AN[s[1]][0]),PR_CAT[s[0]][0]/gcd(PR_CAT[s[0]][0],-PR_AN[s[1]][0])];
      for(let k=0;k<5;k++){for(let i=0;i<nc;i++)ions.push(mk('c',s[0],side,w,h));for(let i=0;i<na;i++)ions.push(mk('a',s[1],side,w,h));}});
    t0=0;eqs();}
  const mk=(kind,id,side,w,h)=>({kind,id,x:side*w/2+12+Math.random()*(w/2-24),y:h*.3+Math.random()*h*.55,vx:(Math.random()-.5)*60,vy:(Math.random()-.5)*60,solid:false,rest:false,side});
  function eqs(){const nt=prNet(rx);const L=rx.Lm.map(l=>`${l[0]>1?l[0]:''}${l[1].includes('(s)')?l[1]:l[1]+'(aq)'}`);
    const sp=new Set(rx.spect.map(s=>s[2])),fm=(arr)=>arr.map(l=>{const t=`${l[0]>1?l[0]:''}${l[1].includes('(s)')?l[1]:l[1]+'(aq)'}`;return sp.has(l[2])?`<span class="sp">${t}</span>`:t;}).join(' + ');
    $('#pr-eqs').innerHTML=`<span class="ln"><span class="lbl">Molecular equation</span>${rx.mol}${rx.reacts?'':'  (no reaction: all products soluble)'}</span><span class="ln"><span class="lbl">Complete ionic equation</span>${fm(rx.Lm)} → ${fm(rx.Rm)}</span><span class="ln"><span class="lbl">Net ionic equation</span><span class="net">${nt?nt.replace(/\b([A-Za-z]+\d?)\(s\)/g,'$&'):'no reaction (every ion is a spectator)'}</span></span>`;
    const solid=[!rx.s1&&prFsub(rx.P1),!rx.s2&&prFsub(rx.P2)].filter(Boolean);setText('pr-p',solid.length?solid.join(' and ')+' (solid)':'none');setText('pr-s',rx.spect.length?rx.spect.map(s=>s[1]).filter((v,i,a)=>a.indexOf(v)===i).join(', '):'all ions are spectators');}
  const sim=sim2d(cv,{h:w=>Math.round(clamp(w*.55,280,360)),step(dt){const w=cv.clientWidth,h=Math.round(clamp(w*.55,280,360)),floor=h-8;t0+=dt;
      ions.forEach(a=>{if(a.rest)return;if(a.solid){a.vy+=420*dt;a.vx*=.96;a.vy*=.985;a.x+=a.vx*dt;a.y+=a.vy*dt;const col=clamp(Math.floor(a.x/11),0,heights.length-1);const stop=floor-heights[col]*10;if(a.y>=stop){a.y=stop;a.rest=true;heights[col]++;}return;}
        a.vx+=(Math.random()-.5)*3200*dt;a.vy+=(Math.random()-.5)*3200*dt;a.vx*=.93;a.vy*=.93;a.x+=a.vx*dt;a.y+=a.vy*dt;
        if(!mixed){const lo=a.side?w/2+3:6,hi=a.side?w-6:w/2-3;if(a.x<lo){a.x=lo;a.vx=Math.abs(a.vx);}if(a.x>hi){a.x=hi;a.vx=-Math.abs(a.vx);}}else{if(a.x<6){a.x=6;a.vx=Math.abs(a.vx);}if(a.x>w-6){a.x=w-6;a.vx=-Math.abs(a.vx);}}
        if(a.y<h*.25){a.y=h*.25;a.vy=Math.abs(a.vy);}if(a.y>h*.9){a.y=h*.9;a.vy=-Math.abs(a.vy);}});
      if(mixed)for(let i=0;i<ions.length;i++){const a=ions[i];if(a.solid||a.kind!=='c')continue;for(let j=0;j<ions.length;j++){const b=ions[j];if(b.solid||b.kind!=='a')continue;const dd=Math.hypot(a.x-b.x,a.y-b.y)||1;if(dd<110&&!prSoluble(a.id,b.id)){const f=1500*dt/Math.max(dd/40,1);a.vx+=(b.x-a.x)/dd*f;a.vy+=(b.y-a.y)/dd*f;b.vx-=(b.x-a.x)/dd*f;b.vy-=(b.y-a.y)/dd*f;}if(dd<17&&!prSoluble(a.id,b.id)){a.solid=b.solid=true;a.key=b.key=prFormula(a.id,b.id).replace(/[()]/g,'');a.vx=b.vx=0;break;}}}},
    draw(ctx,w,h){ctx.fillStyle=alpha(T.cx,.07);ctx.fillRect(0,h*.25,w,h*.75);ctx.strokeStyle=T.cx;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,h*.25);ctx.lineTo(w,h*.25);ctx.stroke();
      if(!mixed){ctx.strokeStyle=T.ink;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w/2,h*.15);ctx.lineTo(w/2,h);ctx.stroke();const r=RX[+sel.value];label(ctx,prFsub(rx.S1)+'(aq)',w*.25,h*.12,T.ink,'center','middle','600 13px "IBM Plex Mono",monospace');label(ctx,prFsub(rx.S2)+'(aq)',w*.75,h*.12,T.ink,'center','middle','600 13px "IBM Plex Mono",monospace');}
      ions.forEach(a=>{const col=a.solid?(PR_COL[a.key]||'#E9ECF1'):a.kind==='c'?CC[a.id]:AC[a.id],r=a.kind==='c'?6.5:8.5;ball2(ctx,a.x,a.y,a.solid?7.5:r,col,a.solid&&(PR_COL[a.key]||'#E9ECF1')==='#E9ECF1'?'rgba(0,0,0,.35)':null);
        if(!a.solid)label(ctx,a.kind==='c'?'+':'−',a.x,a.y,'#fff','center','middle','700 10px "IBM Plex Mono",monospace');});
      const legend=[...new Set(ions.filter(a=>!a.solid).map(a=>a.kind+a.id))];label(ctx,'ions: small = cations (+), large = anions (−); grains = solid precipitate',8,h-4,T.muted,'left','bottom',MONO);}});
  $('#pr-mix').addEventListener('click',()=>{mixed=true;sim.render();});sel.addEventListener('change',()=>{build();sim.render();});
  build();drawers.precip=()=>sim.render();
  TIPS['pr-sel']='Swap the partners and check each new compound against the solubility rules.';
  KEYS['pr-canvas']=['Pick a pair of solutions and press Mix them.',[['cx','water'],['good','net ionic equation (below)']]];
  GLOSS['precipitate']='An insoluble solid that forms when two solutions are mixed.';
  GLOSS['spectator ion']='An ion that is present but does not take part in the reaction; it appears unchanged on both sides.';
  GLOSS['net ionic equation']='An equation showing only the particles that actually change, with spectator ions removed.';
  TT.precip='Have students predict precipitates with the Reference sheet open and no hints, then verify with the animation. Ask for the number of each ion in the beaker before and after.';
})();
(function(){
  const RX=[[['Ag','NO3'],['Na','Cl']],[['Pb','NO3'],['K','I']],[['Ba','Cl'],['Na','SO4']],[['Cu','SO4'],['Na','OH']],[['Ca','Cl'],['Na','CO3']],[['Fe','Cl'],['Na','OH']],[['Na','Cl'],['K','NO3']],[['Pb','NO3'],['Na','Cl']],[['Mg','Cl'],['K','NO3']],[['Ba','NO3'],['K','SO4']],[['Na','OH'],['K','Cl']],[['Ca','Cl'],['Ba','NO3']]];
  const nm=(c,a)=>prFsub(prFormula(c,a));
  PROBS.push({id:'pr-form',topic:'precip',title:'Will a precipitate form?',gen(){const r=pick(RX),rx=prReaction(r[0],r[1]),ch=['yes','no'];
    return {q:`Aqueous ${nm(...r[0])} is mixed with aqueous ${nm(...r[1])}. Does a precipitate form?`,choices:ch,ans:rx.reacts?0:1,hint:'Swap the partners to get the two possible products, then check each against the solubility rules.',sol:`Possible products: ${prFsub(rx.P1)} (${rx.s1?'soluble':'insoluble'}) and ${prFsub(rx.P2)} (${rx.s2?'soluble':'insoluble'}). <b>${rx.reacts?'Yes':'No'}</b>.`};}});
  PROBS.push({id:'pr-which',topic:'precip',title:'Identify the precipitate',gen(){const rs=RX.filter(r=>prReaction(r[0],r[1]).reacts),r=pick(rs),rx=prReaction(r[0],r[1]),solid=rx.s1?rx.P2:rx.P1,others=['AgCl','PbI2','BaSO4','Cu(OH)2','CaCO3','Fe(OH)3','NaCl','KNO3','NaNO3'].filter(x=>prFsub(x).replace(/[()]/g,'')!==prFsub(solid).replace(/[()]/g,'')),ch=[solid,...others.sort(()=>Math.random()-.5).slice(0,3)].sort(()=>Math.random()-.5);
    return {q:`Aqueous ${nm(...r[0])} is mixed with aqueous ${nm(...r[1])}. Which compound precipitates?`,choices:ch.map(prFsub),ans:ch.indexOf(solid),hint:'Swap the cations and anions, then check which new compound is insoluble.',sol:`The precipitate is <b>${prFsub(solid)}</b>. Net ionic equation: ${prNet(rx)}.`};}});
  PROBS.push({id:'pr-mass',topic:'precip',title:'Mass of precipitate',gen(){const rs=[[['Ag','NO3'],['Na','Cl'],'AgCl',1],[['Ba','Cl'],['Na','SO4'],'BaSO4',1],[['Pb','NO3'],['K','I'],'PbI2',1],[['Ca','Cl'],['Na','CO3'],'CaCO3',1]],[a,b,f]=pick(rs),M=ri(2,9)/20,V=ri(20,80),mm=MM_(f==='PbI2'?'PbI2':f),n=M*V/1000;
    /* first reactant's cation is limiting; second is in large excess; 1:1 in the cation for these */
    const mol=a[0][0]+'';const ans=n*mm;
    return {q:`${V.toFixed(0)} mL of ${M.toFixed(2)} M ${nm(...a)} is mixed with an excess of aqueous ${nm(...b)}. What mass of ${prFsub(f)} precipitates? (Atomic masses: Ag 107.87, Ba 137.33, Pb 207.2, Ca 40.08, Cl 35.45, S 32.07, O 16.00, I 126.90, C 12.01.)`,ans,unit:'g',tol:.02,hint:'The cation of the first salt is limiting. Moles of cation = M × V (L); the net ionic equation shows the ratio to the precipitate; then convert to grams.',
      sol:`n = ${M.toFixed(2)} × ${(V/1000).toFixed(3)} = ${n.toFixed(5)} mol of cation, which gives ${n.toFixed(5)} mol ${prFsub(f)} (1:1 with the cation); mass = ${n.toFixed(5)} × ${mm.toFixed(2)} = <b>${fmt(ans,3)} g</b>.`};}});
})();
