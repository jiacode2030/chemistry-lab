
/* ---------------- Orbital shapes in 3D ---------------- */
(function orbitals(){
  const cv=$('#or-canvas'),cr=$('#or-radial');if(!cv)return;
  const ORBS=[['1s','1s','s',1,0,'1s'],['2s','2s','s',2,0,'2s'],['2px','2p','px',2,1,'2p<sub>x</sub>'],['2py','2p','py',2,1,'2p<sub>y</sub>'],['2pz','2p','pz',2,1,'2p<sub>z</sub>'],
    ['3s','3s','s',3,0,'3s'],['3pz','3p','pz',3,1,'3p<sub>z</sub>'],['3dz2','3d','dz2',3,2,'3d<sub>z²</sub>'],['3dx2y2','3d','dx2y2',3,2,'3d<sub>x²−y²</sub>'],['3dxy','3d','dxy',3,2,'3d<sub>xy</sub>'],['3dxz','3d','dxz',3,2,'3d<sub>xz</sub>'],['3dyz','3d','dyz',3,2,'3d<sub>yz</sub>']];
  const LAB={'1s':'1s','2s':'2s','2px':'2pₓ','2py':'2p_y','2pz':'2p_z','3s':'3s','3pz':'3p_z','3dz2':'3d_z²','3dx2y2':'3d_x²−y²','3dxy':'3d_xy','3dxz':'3d_xz','3dyz':'3d_yz'};
  const sel=$('#or-sel');sel.innerHTML=ORBS.map(o=>`<option value="${o[0]}">${LAB[o[0]]}</option>`).join('');sel.value='1s';
  const RMAX={'1s':30,'2s':60,'2p':60,'3s':120,'3p':120,'3d':120},SC=.2;
  const cache={};const model=(nl,ang)=>cache[nl+ang]||(cache[nl+ang]=orbitalModel(nl,ang,RMAX[nl]));
  let sets=[],shown=0,cur=ORBS[0],mdl=null,view=null,lobes=false,subset=[];
  const sub=n=>String(n);
  function build(){cur=ORBS.find(o=>o[0]===sel.value);const nl=cur[1];lobes=$('#or-set').checked&&cur[4]>0;
    subset=ORBS.filter(o=>o[1]===nl&&o[3]===cur[3]);const list=[cur];
    mdl=model(nl,cur[2]);sets=list.map(o=>({o,m:model(o[1],o[2]),pts:model(o[1],o[2]).sample(3000)}));shown=REDUCE?9999:0;
    const r90=mdl.r90;if(view)view.setHome({dist:Math.max(3.4,r90*SC*3.3+1)});
    setHTML('or-nl',`${cur[3]}${['s','p','d'][cur[4]]}`);setText('or-rn',cur[3]-cur[4]-1);setText('or-an',cur[4]);setText('or-pk',fmt(mdl.peak,2)+' a₀ ('+fmt(mdl.peak*.529177,2)+' Å)');setText('or-r90',fmt(r90,1)+' a₀ ('+fmt(r90*.529177,1)+' Å)');}
  const PAL=()=>[T.cx,T.hot,T.cv,T.ca,T.ce];
  view=view3d(cv,{yaw:-.8,pitch:.4,dist:4,target:[0,0,0],min:1.5,max:30,height:w=>clamp(w*.62,300,440),scene:(S,t)=>{
    const phase=$('#or-phase').checked&&!lobes,pal=PAL();
    if(lobes){const L=mdl.peak*SC*1.7,pal5=PAL(),D=(x,y,z)=>V3.norm([x,y,z]);
      const DIRS={px:[[1,0,0],[-1,0,0]],py:[[0,1,0],[0,-1,0]],pz:[[0,0,1],[0,0,-1]],dz2:[[0,0,1],[0,0,-1]],dx2y2:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]],dxy:[D(1,1,0),D(-1,1,0),D(-1,-1,0),D(1,-1,0)],dxz:[D(1,0,1),D(-1,0,1),D(-1,0,-1),D(1,0,-1)],dyz:[D(0,1,1),D(0,-1,1),D(0,-1,-1),D(0,1,-1)]};
      subset.forEach((o,k)=>{const col=pal5[k%5],ang=o[2],dirs=DIRS[ang]||[],len=ang==='dz2'?L*.95:L,rad=ang[0]==='d'?len*.34:len*.42;
        dirs.forEach(d=>S.lobe([0,0,0],d,len,rad,col,.62));
        if(ang==='dz2'){const rg=[];for(let i=0;i<=48;i++){const a=i/48*6.2832;rg.push([Math.cos(a)*L*.5,Math.sin(a)*L*.5,0]);}S.path(rg,alpha(col,.7),9,null,undefined);}
        S.text(V3.mul(dirs[0]||[0,0,1],len*1.12),LAB[o[0]].replace(/^\d/,''),col,'600 12px "IBM Plex Mono",monospace');});}
    else sets.forEach((st,si)=>{const n=Math.min(Math.floor(shown),st.pts.length);
      if(phase){const pos=[],neg=[];for(let i=0;i<n;i++){const q=st.pts[i];(q.sign>0?pos:neg).push(V3.mul(q.p,SC));}S.dots(pos,.016,T.cx,.8);S.dots(neg,.016,T.hot,.8);}
      else S.dots(st.pts.slice(0,n).map(q=>V3.mul(q.p,SC)),.016,T.cx,.78);
      if(n>0&&n<st.pts.length){S.ball(V3.mul(st.pts[n-1].p,SC),.05,T.ce,1,false);}});
    S.atom([0,0,0],.07,T.ink);
    const L5=5*SC,zb=-(mdl.r90*SC+.4);S.line([-L5/2,0,zb],[L5/2,0,zb],T.ce,3);S.text([0,0,zb-.2],'5 a₀ ≈ 2.6 Å',T.ce,MONO);
    S.line([-1,0,0].map(v=>v*mdl.r90*SC*1.1),[1,0,0].map(v=>v*mdl.r90*SC*1.1),T.line,1);S.line([0,-1,0].map(v=>v*mdl.r90*SC*1.1),[0,1,0].map(v=>v*mdl.r90*SC*1.1),T.line,1);S.line([0,0,-1].map(v=>v*mdl.r90*SC*1.1),[0,0,1].map(v=>v*mdl.r90*SC*1.1),T.line,1);
    S.text([mdl.r90*SC*1.15,0,0],'x',T.muted,MONO);S.text([0,mdl.r90*SC*1.15,0],'y',T.muted,MONO);S.text([0,0,mdl.r90*SC*1.15],'z',T.muted,MONO);}});
  const sim=sim2d(cr,{h:w=>clamp(w*.3,170,230),step(dt){if(shown<9999)shown=Math.min(9999,shown+dt*600);if(shown<9999)view&&view.render();},
    draw(ctx,w,h){const m=mdl,rp=Math.min(RMAX[cur[1]],m.r90*1.7),bx=44,by=10,bw=w-bx-14,bh=h-44;const dens=r=>{const R=ORB_R[cur[1]](r);return r*r*R*R/m.tot;};
      let mx=0;for(let r=0;r<=rp;r+=rp/300)mx=Math.max(mx,dens(r));
      const P=panel(ctx,{x:bx,y:by,w:bw,h:bh},[0,rp],[0,mx*1.18],{xn:6,yn:3,xlabel:'distance r (a₀)',ylabel:'probability density',color:T.ink});
      /* histogram of the snapshots shown so far */
      const pts=sets[0].pts,n=Math.min(Math.floor(shown),pts.length),B=48,bw2=rp/B,cnt=Array(B).fill(0);for(let i=0;i<n;i++){const b=Math.floor(pts[i].r/bw2);if(b<B)cnt[b]++;}
      if(n>0){ctx.fillStyle=alpha(T.ce,.45);cnt.forEach((c,b)=>{const d=c/(n*bw2),y=P.Y(Math.min(d,mx*1.18));ctx.fillRect(P.X(b*bw2),y,P.X(bw2)-P.X(0)-1,bh+by-y);});}
      area(ctx,P,dens,0,rp,T.cx,.15,300);curve(ctx,P,dens,0,rp,T.cx,2.4,300);
      m.nodes.forEach(r=>{if(r<rp){line(ctx,P,r,0,r,mx*1.18,T.bad,1.4,[4,4]);label(ctx,'node',P.X(r)+4,by+8,T.bad,'left','top',MONO);}});
      line(ctx,P,m.peak,0,m.peak,dens(m.peak),T.hot,1.6,[3,3]);dot(ctx,P.X(m.peak),P.Y(dens(m.peak)),4.5,T.hot);label(ctx,'most likely',P.X(m.peak)+8,P.Y(dens(m.peak))+2,T.hot,'left','top',MONO);}});
  drawers.orbitals=()=>{view.render();sim.render();};
  function change(){build();view.render();sim.render();}
  sel.addEventListener('change',change);$('#or-set').addEventListener('change',change);$('#or-phase').addEventListener('change',()=>view.render());
  $('#or-again').addEventListener('click',()=>{sets.forEach(st=>st.pts=st.m.sample(st.pts.length));shown=REDUCE?9999:0;view.render();});$('#or-all').addEventListener('click',()=>{shown=9999;view.render();sim.render();});
  build();
  TIPS['or-sel']=el=>({'1s':'1s: a ball, densest at the center, most likely at 1 a₀ (the Bohr radius).','2s':'2s: bigger, with one spherical node (a gap in the cloud).','3s':'3s: bigger again, with two radial nodes.','2px':'p orbitals have two lobes with a plane node between them.','2py':'p orbitals have two lobes with a plane node between them.','2pz':'p orbitals have two lobes with a plane node between them.','3pz':'3p has two lobes and also one radial node.'})[el.value]||'d orbitals have two angular nodes: four lobes (or two lobes and a donut for d_z²).';
  TIPS['or-set']='Boundary surfaces: each lobe encloses the region where the electron is found most of the time. The orbitals of a subshell have the same energy.';
  TIPS['or-phase']='Blue and orange are the two signs of the wavefunction. They are not electric charges, but they decide how orbitals combine when atoms bond.';
  KEYS['or-canvas']=['Drag to spin it. Each dot is one snapshot of the electron.',[['cx','electron position'],['ce','newest snapshot · scale bar']]];
  GLOSS['orbital']='A region of space where an electron is likely to be found, described by a probability pattern.';
  GLOSS['node']='A place where the probability of finding the electron is zero.';
  TT.orbitals='Say "probability cloud" from the start and avoid orbits. Let the snapshots build slowly and ask students to predict where the next dot will land. Then connect nodes to the number n − 1.';
})();
(function(){
  const SPEC=[['1s',1,0],['2s',2,0],['2p',2,1],['3s',3,0],['3p',3,1],['3d',3,2]];
  PROBS.push({id:'orb-nodes',topic:'orbitals',title:'Counting nodes',gen(){const [nl,n,l]=pick(SPEC.filter(s=>s[0]!=='1s')),kind=pick(['radial','angular','total']),ans=kind==='radial'?n-l-1:kind==='angular'?l:n-1;
    return {q:`How many ${kind} nodes does a ${nl} orbital have?`,ans,unit:'nodes',abs:.01,hint:'Total nodes = n − 1. Angular nodes = ℓ (s = 0, p = 1, d = 2). Radial nodes = n − ℓ − 1.',sol:`For ${nl}, n = ${n} and ℓ = ${l}. Radial: n − ℓ − 1 = ${n-l-1}. Angular: ℓ = ${l}. Total: n − 1 = ${n-1}. So <b>${ans}</b> ${kind} node${ans===1?'':'s'}.`};}});
  PROBS.push({id:'orb-count',topic:'orbitals',title:'Orbitals and electrons in a subshell or shell',gen(){const mode=pick(['subshell-orbitals','subshell-electrons','shell-orbitals','shell-electrons']),l=ri(0,3),n=ri(2,4),nm='spdf'[l];
    const ans={'subshell-orbitals':2*l+1,'subshell-electrons':2*(2*l+1),'shell-orbitals':n*n,'shell-electrons':2*n*n}[mode];
    const q={'subshell-orbitals':`How many orbitals are in a ${nm} subshell?`,'subshell-electrons':`What is the maximum number of electrons in a ${nm} subshell?`,'shell-orbitals':`How many orbitals are in the n = ${n} shell?`,'shell-electrons':`What is the maximum number of electrons in the n = ${n} shell?`}[mode];
    return {q,ans,unit:'',abs:.01,hint:'A subshell with quantum number ℓ has 2ℓ + 1 orbitals (s 1, p 3, d 5, f 7). A shell n has n² orbitals. Each orbital holds two electrons.',
      sol:{'subshell-orbitals':`2ℓ + 1 = 2(${l}) + 1 = <b>${ans}</b>.`,'subshell-electrons':`2 × (2ℓ + 1) = 2 × ${2*l+1} = <b>${ans}</b>.`,'shell-orbitals':`n² = ${n}² = <b>${ans}</b>.`,'shell-electrons':`2n² = 2 × ${n}² = <b>${ans}</b>.`}[mode]};}});
  PROBS.push({id:'orb-size',topic:'orbitals',title:'Which orbital is larger?',gen(){const a=pick(['1s','2s','2p']),b=pick(['3s','3p','3d']);const ch=[a,b,'They are the same size'];
    return {q:`In a hydrogen atom, which orbital is larger on average: ${a} or ${b}?`,choices:ch,ans:1,hint:'The size grows with the shell number n.',sol:`Orbital size and energy increase with n: n = ${b[0]} is larger than n = ${a[0]}, so <b>${b}</b>.`};}});
})();
