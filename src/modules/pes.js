
/* ---------------- Electron configuration & PES ---------------- */
const PES_DATA={1:[1.31],2:[2.37],3:[6.26,.52],4:[11.5,.90],5:[19.3,1.36,.80],6:[28.1,1.72,1.09],7:[39.6,2.45,1.40],8:[52.6,3.12,1.31],9:[67.2,3.88,1.68],10:[84.0,4.68,2.08],
  11:[104,6.84,3.67,.496],12:[126,9.07,5.31,.738],13:[151,12.1,7.19,1.09,.578],14:[178,15.1,10.2,1.46,.786],15:[208,19.7,14.5,1.95,1.06],16:[239,23.9,17.4,2.05,1.00],17:[273,26.8,20.2,2.38,1.25],18:[310,31.5,24.1,2.82,1.52]};
const PES_SUB=[['1s',2,1],['2s',2,1],['2p',6,3],['3s',2,1],['3p',6,3]];/* name, capacity, boxes */
function pesShells(Z){let left=Z;const out=[];PES_SUB.forEach(([n,cap,boxes],i)=>{if(left<=0)return;const k=Math.min(cap,left);left-=k;out.push({n,k,cap,boxes,E:PES_DATA[Z][i]});});return out;}
/* Hund's rule: electrons per box, first one up in each box, then pair */
const pesCfgStr=z=>pesShells(z).map(s=>s.n+String(s.k).split('').map(c=>SUP[c]).join('')).join(' ');
function pesBoxes(k,boxes){const b=Array(boxes).fill(0);for(let i=0;i<k;i++)b[i%boxes]++;return b;}
(function pes(){
  const cvA=$('#pe-atom'),cvS=$('#pe-spec'),cvB=$('#pe-box');if(!cvA)return;
  let Z=8,lastZ=8,tAdd=-9,play=false,pt=0;
  const cfgStr=pesCfgStr;
  const SHELLS=n=>{const s=pesShells(Z),o=[0,0,0];s.forEach(x=>{o[+x.n[0]-1]+=x.k;});return o;};
  const TILT=[[0,0],[.65,.5],[-.6,1.6]];
  const v3=view3d(cvA,{yaw:-.7,pitch:.45,dist:8.2,target:[0,0,0],min:4,max:16,height:w=>clamp(w*.8,260,340),scene:(S,t)=>{
    const tt=t==null?0:t,sh=SHELLS();const age=tt-tAdd;
    [1,2,3].forEach((n,i)=>{const N=sh[i];if(!N)return;const r=.85*n+(n===3?.15:0);const [tx,ty]=TILT[i];
      const rot=p=>{/* tilt the orbit plane about x by tx then z by ty */let [x,y,z]=p;let y1=y*Math.cos(tx)-z*Math.sin(tx),z1=y*Math.sin(tx)+z*Math.cos(tx);return [x*Math.cos(ty)-y1*Math.sin(ty),x*Math.sin(ty)+y1*Math.cos(ty),z1];};
      const ring=Array.from({length:49},(_,k)=>rot([r*Math.cos(k/48*6.2832),r*Math.sin(k/48*6.2832),0]));S.path(ring,T.line,1.3,null,undefined);
      for(let e=0;e<N;e++){const th=(tt*(1.6/n**1.3))+e/N*6.2832;const isNew=Z>lastZ&&e===N-1&&sh.slice(0,i).reduce((a,b)=>a+b,0)+N===Z;
        const pos=rot([r*Math.cos(th),r*Math.sin(th),0]);S.ball(pos,.13*(isNew&&age<1?1+1.2*(1-age):1),T.ce,1,false);}});
    S.atom([0,0,0],.45,T.hot);S.text([0,0,.95],'+'+Z,T.hot,'600 13px "IBM Plex Mono",monospace');}});
  const simS=sim2d(cvS,{h:()=>clamp(cvS.clientWidth*.8,260,340),draw(ctx,w,h,t){const sh=pesShells(Z),bx=14,bw=w-bx-14,bot=h-44,top=22,H=bot-top;
      const L=v=>Math.log10(v),lo=L(.35),hi=L(450),X=E=>bx+(hi-L(E))/(hi-lo)*bw;
      ctx.strokeStyle=T.line;ctx.lineWidth=1;ctx.fillStyle=T.muted;ctx.font=MONO;ctx.textAlign='center';ctx.textBaseline='top';
      [.5,1,2,5,10,20,50,100,200,400].forEach(E=>{const x=Math.round(X(E))+.5;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bot);ctx.stroke();ctx.fillText(E,x,bot+5);});
      ctx.strokeStyle=T.ink;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(bx,bot+.5);ctx.lineTo(bx+bw,bot+.5);ctx.stroke();
      label(ctx,'binding energy (MJ/mol), high → low',bx+bw/2,h-14,T.muted,'center','middle',MONO);
      const cols=[T.cx,T.hot,T.cv,T.ca,T.ce];
      sh.forEach((s,i)=>{const x=X(s.E),pk=s.k/6,hh=Math.max(.14,pk)*H*.92*Math.min(1,(t-0)*0+1);
        ctx.fillStyle=alpha(cols[i],.9);ctx.beginPath();ctx.moveTo(x-5,bot);ctx.lineTo(x-2.2,bot-hh+5);ctx.quadraticCurveTo(x,bot-hh-3,x+2.2,bot-hh+5);ctx.lineTo(x+5,bot);ctx.fill();
        label(ctx,s.n,x,bot-hh-16,cols[i],'center','bottom','700 13px "IBM Plex Sans",sans-serif');label(ctx,String(s.k),x,bot-hh-3,T.ink,'center','bottom',MONO);});}});
  const simB=sim2d(cvB,{h:()=>86,draw(ctx,w,h,t){const sh=pesShells(Z);const items=PES_SUB.map((p,i)=>({p,s:sh[i]}));const boxW=30,gap=8;let total=0;PES_SUB.forEach(p=>total+=p[2]*boxW+gap*2);let x=Math.max(8,(w-total)/2);
      items.forEach(({p,s})=>{const [n,cap,bx]=p;const occ=s?pesBoxes(s.k,bx):Array(bx).fill(0);
        for(let b=0;b<bx;b++){const bxp=x+b*boxW;ctx.strokeStyle=s?T.ink:T.line;ctx.lineWidth=1.6;ctx.strokeRect(bxp+.5,22.5,boxW-4,34);
          ctx.fillStyle=T.ce;ctx.font='600 20px "IBM Plex Sans",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
          if(occ[b]>=1)ctx.fillText('↑',bxp+(boxW-4)/2-(occ[b]===2?5:0),40);if(occ[b]===2)ctx.fillText('↓',bxp+(boxW-4)/2+5,40);}
        label(ctx,n,x+(bx*boxW-4)/2,70,s?T.ink:T.muted,'center','middle','600 13px "IBM Plex Mono",monospace');x+=bx*boxW+gap*2;});}});
  drawers.pes=()=>{v3.render();simS.render();simB.render();};
  function upd(){const sh=pesShells(Z),boxes=sh.reduce((a,s)=>a.concat(pesBoxes(s.k,s.boxes)),[]),un=boxes.filter(x=>x===1).length;
    setText('pe-el',`${ELEMENTS[Z-1].name} (${ELEMENTS[Z-1].sym})`);setText('pe-cfg',cfgStr(Z));setText('pe-np',sh.length);setText('pe-un',un);setText('pe-ie',String(sh[sh.length-1].E));drawers.pes();}
  bindRange('pe-z',x=>x,x=>{lastZ=Z;Z=x;if(Z>lastZ)tAdd=(v3.t||performance.now()/1000);upd();},false);
  $('#pe-play').addEventListener('click',()=>{play=!play;$('#pe-play').textContent=play?'Pause':'Build up the table';if(play&&Z>=18){$('#pe-z').value=1;$('#pe-z').dispatchEvent(new Event('input',{bubbles:true}));}});
  setInterval(()=>{if(!play||document.hidden||current!=='pes')return;const el=$('#pe-z');if(+el.value>=18){play=false;$('#pe-play').textContent='Build up the table';return;}el.value=+el.value+1;el.dispatchEvent(new Event('input',{bubbles:true}));},1400);
  $('#pe-z-out').textContent=Z;upd();
  TIPS['pe-z']=el=>{const z=+el.value,s=pesShells(z);const l=s[s.length-1];return `${ELEMENTS[z-1].name}: ${cfgStr(z)}. The last electron went into ${l.n}. In the PES, that subshell is the peak farthest to the right.`;};
  KEYS['pe-spec']=['Slide Z and watch peaks appear and shift left.',[['cx','1s'],['hot','2s'],['cv','2p'],['ca','3s'],['ce','3p']]];
  GLOSS['electron configuration']='Which subshells hold the electrons of an atom, such as 1s² 2s² 2p⁴.';
  GLOSS['subshell']='A group of equal-energy orbitals within a shell: s (1 orbital), p (3), d (5).';
  GLOSS['binding energy']='The energy needed to remove an electron from the atom.';
  TT.pes='Cover the configuration and ask students to read it off the spectrum. The two common mistakes are reading height as energy and forgetting that the axis runs high to low.';
})();
(function(){
  const cfgStr=pesCfgStr;
  const NAMES=[null,'H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar'];
  PROBS.push({id:'pes-which',topic:'pes',title:'Which element has this PES?',gen(){const Z=ri(5,18),sh=pesShells(Z),opts=[Z];[Z-1,Z+1,Z+2,Z-2].forEach(z=>{if(z>=3&&z<=18&&opts.length<4&&!opts.includes(z))opts.push(z);});const ch=opts.sort(()=>Math.random()-.5);
    return {q:`A photoelectron spectrum shows ${sh.length} peaks with relative heights ${sh.map(s=>s.k).join(', ')} (from highest to lowest binding energy). Which element is it?`,choices:ch.map(z=>NAMES[z]),ans:ch.indexOf(Z),hint:'Peak heights are electron counts. Add them to get the number of electrons, which equals the atomic number for a neutral atom.',
      sol:`${sh.map(s=>s.k).join(' + ')} = ${Z} electrons → Z = ${Z}: <b>${NAMES[Z]}</b> (${cfgStr(Z)}).`};}});
  PROBS.push({id:'pes-unpaired',topic:'pes',title:'Unpaired electrons',gen(){const Z=ri(3,18),sh=pesShells(Z),un=sh.reduce((a,s)=>a.concat(pesBoxes(s.k,s.boxes)),[]).filter(x=>x===1).length;
    return {q:`How many unpaired electrons are in a ground-state atom of ${NAMES[Z]} (Z = ${Z})?`,ans:un,unit:'electrons',abs:.01,hint:'Write the configuration, then place the electrons of the outer subshell in boxes using Hund\'s rule: one in each box before pairing.',
      sol:`${NAMES[Z]}: ${cfgStr(Z)}. The outer subshell has ${sh[sh.length-1].k} electron${sh[sh.length-1].k>1?'s':''} in ${sh[sh.length-1].boxes} box${sh[sh.length-1].boxes>1?'es':''}; by Hund's rule that leaves <b>${un}</b> unpaired.`};}});
  PROBS.push({id:'pes-compare',topic:'pes',title:'Comparing two spectra',gen(){const a=ri(3,8),b=a+ri(2,9),A=pesShells(a),B=pesShells(b),which=pick(['1s','1s','outermost']);
    const ch=[`${NAMES[a]}`,`${NAMES[b]}`,'They are equal'],ans=1;
    const q=which==='1s'?`Which element has its 1s peak at the higher binding energy: ${NAMES[a]} or ${NAMES[b]}?`:`Which has the larger number of peaks? ${NAMES[a]} (${A.length} peaks) or ${NAMES[b]}?`;
    if(which==='1s')return {q,choices:ch,ans:1,hint:'Both 1s electrons feel only the nucleus and the other 1s electron. Which nucleus has more protons?',sol:`${NAMES[b]} has ${b} protons against ${a} for ${NAMES[a]}, so it pulls its 1s electrons harder: <b>${NAMES[b]}</b>.`};
    const ans2=B.length>A.length?1:B.length===A.length?2:0,ch2=[`${NAMES[a]} (${A.length} peaks)`,`${NAMES[b]} (${B.length} peaks)`,'They have the same number of peaks'];
    return {q:`Which has more peaks in its photoelectron spectrum: ${NAMES[a]} or ${NAMES[b]}?`,choices:ch2,ans:ans2,hint:'The number of peaks is the number of occupied subshells.',sol:`${NAMES[a]}: ${cfgStr(a)} (${A.length} subshells). ${NAMES[b]}: ${cfgStr(b)} (${B.length} subshells). <b>${ch2[ans2]}</b>.`};}});
})();
