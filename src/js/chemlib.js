
/* ---------------- Chemistry helpers: atoms, molecules in 3D, particles in 2D ---------------- */
/* c: display colour (CPK-like), r: ball radius in the 3D views (Å-ish), en: Pauling electronegativity */
const ATOM={
  H:{c:'#EEF1F5',r:.27,en:2.20,n:'hydrogen'},Li:{c:'#B58BFF',r:.5,en:.98,n:'lithium'},Be:{c:'#8FD19E',r:.42,en:1.57,n:'beryllium'},B:{c:'#F0A58C',r:.4,en:2.04,n:'boron'},
  C:{c:'#4A5160',r:.4,en:2.55,n:'carbon'},N:{c:'#3E63DD',r:.38,en:3.04,n:'nitrogen'},O:{c:'#E5484D',r:.37,en:3.44,n:'oxygen'},F:{c:'#53C98A',r:.33,en:3.98,n:'fluorine'},
  Na:{c:'#9B72F5',r:.62,en:.93,n:'sodium'},Mg:{c:'#46B96B',r:.55,en:1.31,n:'magnesium'},Al:{c:'#B8A9A3',r:.5,en:1.61,n:'aluminum'},Si:{c:'#C9A87C',r:.5,en:1.90,n:'silicon'},
  P:{c:'#F08A24',r:.5,en:2.19,n:'phosphorus'},S:{c:'#E8C42A',r:.5,en:2.58,n:'sulfur'},Cl:{c:'#2FB55A',r:.48,en:3.16,n:'chlorine'},K:{c:'#8A5CE0',r:.72,en:.82,n:'potassium'},
  Ca:{c:'#3DAA6D',r:.64,en:1.00,n:'calcium'},Br:{c:'#A63A2A',r:.54,en:2.96,n:'bromine'},I:{c:'#7B2FA6',r:.6,en:2.66,n:'iodine'},Xe:{c:'#4FB9E3',r:.56,en:2.60,n:'xenon'},
  Kr:{c:'#5CC4DD',r:.5,en:3.00,n:'krypton'}
};
const atomCol=e=>(ATOM[e]||{c:'#999'}).c;
const D2R=Math.PI/180;
/* a bond at the given angle (degrees) from +x in the xy plane, length L */
const polar=(L,deg)=>[L*Math.cos(deg*D2R),L*Math.sin(deg*D2R),0];
/* unit vectors for the ideal arrangements of n regions of electron density */
const IDEAL={
  2:[[1,0,0],[-1,0,0]],
  3:[0,120,240].map(a=>[Math.cos(a*D2R),Math.sin(a*D2R),0]),
  4:[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>V3.norm(v)),
  5:[[0,0,1],[0,0,-1],...[0,120,240].map(a=>[Math.cos(a*D2R),Math.sin(a*D2R),0])],
  6:[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]
};
const angleBetween=(a,b)=>Math.acos(clamp(V3.dot(V3.norm(a),V3.norm(b)),-1,1))/D2R;
/* rotate vector v about unit axis k by angle th */
function rotAxis(v,k,th){const c=Math.cos(th),s=Math.sin(th);return V3.add(V3.add(V3.mul(v,c),V3.mul(V3.cross(k,v),s)),V3.mul(k,V3.dot(k,v)*(1-c)));}
/* Regions of electron density as charged balloons on a sphere around the central atom.
   state.dir are unit vectors, state.w the "size" of each balloon (a lone pair is fatter than a bonding pair),
   repulsion goes as 1/r², and each step slides every balloon along the sphere away from its neighbours. */
const LP_WEIGHT=1.24;
function relaxStep(dir,w,k=.02){const n=dir.length,F=dir.map(()=>[0,0,0]);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=V3.sub(dir[i],dir[j]),r=Math.max(.05,V3.len(d)),f=w[i]*w[j]/(r*r*r);F[i]=V3.add(F[i],V3.mul(d,f));F[j]=V3.sub(F[j],V3.mul(d,f));}
  let moved=0;for(let i=0;i<n;i++){const f=V3.sub(F[i],V3.mul(dir[i],V3.dot(F[i],dir[i])));const nd=V3.norm(V3.add(dir[i],V3.mul(f,k)));moved+=V3.len(V3.sub(nd,dir[i]));dir[i]=nd;}return moved;}
function relaxAll(dir,w,iters=3000){for(let i=0;i<iters;i++)if(relaxStep(dir,w,.03)<1e-9)break;return dir;}
/* 2D particle drawing */
function ball2(ctx,x,y,r,col,stroke){ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=col;ctx.fill();
  const g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.05,x,y,r*1.02);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(.4,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=g;ctx.fill();
  ctx.lineWidth=1;ctx.strokeStyle=stroke||'rgba(0,0,0,.35)';ctx.stroke();ctx.restore();}
/* draw a molecule {atoms:[{e,p}],bonds:[[i,j,order]]} into a view3d scene.
   o.vib: bond-stretch amplitude (0..0.1) animated by time t; o.pop: per-atom scale 0..1 (for pop-in) */
function drawMol(S,mol,o={}){const t=o.t||0,vib=o.vib||0,off=o.at||[0,0,0],sc=o.scale||1;
  const pos=mol.atoms.map((a,i)=>{let p=a.p;if(vib){const ph=i*1.7;p=V3.mul(p,1+vib*Math.sin(t*9+ph)*.5);}return V3.add(V3.mul(p,sc),off);});
  mol.bonds.forEach(([i,j,ord])=>{const a=mol.atoms[i],b=mol.atoms[j];S.bond(pos[i],pos[j],.11*sc,atomCol(a.e),atomCol(b.e),ord||1,.17*sc);});
  mol.atoms.forEach((a,i)=>{const k=o.pop?clamp(o.pop(i),0,1.12):1;if(k<=0.01)return;S.atom(pos[i],ATOM[a.e].r*sc*k,atomCol(a.e));});
  return pos;}
/* small ready-made molecules (bond lengths in Å) */
const MOLS=(()=>{const m={};
  m.h2o={name:'Water, H₂O',atoms:[{e:'O',p:[0,0,0]},{e:'H',p:[.96*Math.cos(52.25*D2R),.96*Math.sin(52.25*D2R),0]},{e:'H',p:[.96*Math.cos(52.25*D2R),-.96*Math.sin(52.25*D2R),0]}],bonds:[[0,1],[0,2]]};
  m.ch4={name:'Methane, CH₄',atoms:[{e:'C',p:[0,0,0]},...IDEAL[4].map(v=>({e:'H',p:V3.mul(v,1.09)}))],bonds:[[0,1],[0,2],[0,3],[0,4]]};
  m.nh3={name:'Ammonia, NH₃',atoms:(()=>{const a=[{e:'N',p:[0,0,.1]}];/* H–N–H 107°: put the three H on a cone */const cone=Math.acos(Math.sqrt((1+2*Math.cos(107*D2R))/3));for(let k=0;k<3;k++){const ph=k*120*D2R;a.push({e:'H',p:[1.01*Math.sin(cone)*Math.cos(ph),1.01*Math.sin(cone)*Math.sin(ph),.1-1.01*Math.cos(cone)]});}return a;})(),bonds:[[0,1],[0,2],[0,3]]};
  m.co2={name:'Carbon dioxide, CO₂',atoms:[{e:'C',p:[0,0,0]},{e:'O',p:[1.16,0,0]},{e:'O',p:[-1.16,0,0]}],bonds:[[0,1,2],[0,2,2]]};
  m.c2h4={name:'Ethene, C₂H₄',atoms:[],bonds:[]};
  /* ethene: H–C–H angle 117°, so each C–H makes 121.5° with the C=C axis */
  {const L=1.09,a=121.5*D2R;m.c2h4.atoms=[{e:'C',p:[.67,0,0]},{e:'C',p:[-.67,0,0]},
    {e:'H',p:[.67+L*Math.cos(Math.PI-a),L*Math.sin(Math.PI-a),0]},{e:'H',p:[.67+L*Math.cos(Math.PI-a),-L*Math.sin(Math.PI-a),0]},
    {e:'H',p:[-.67-L*Math.cos(Math.PI-a),L*Math.sin(Math.PI-a),0]},{e:'H',p:[-.67-L*Math.cos(Math.PI-a),-L*Math.sin(Math.PI-a),0]}];m.c2h4.bonds=[[0,1,2],[0,2],[0,3],[1,4],[1,5]];}
  return m;})();

/* A damped, springy version of the balloon model for animation: each region of electron density has a position
   on the unit sphere and a velocity; neighbours push it away (1/r²), friction takes the energy out, so a shaken
   set of balloons wobbles and settles into the arrangement with the least repulsion. */
function DomainSim(dir,w){this.dir=dir.map(d=>V3.norm(d));this.vel=dir.map(()=>[0,0,0]);this.w=w;}
DomainSim.prototype.step=function(dt){const n=this.dir.length,F=this.dir.map(()=>[0,0,0]),P=this.dir;
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){const d=V3.sub(P[i],P[j]),r=Math.max(.12,V3.len(d)),f=this.w[i]*this.w[j]/(r*r*r);F[i]=V3.add(F[i],V3.mul(d,f));F[j]=V3.sub(F[j],V3.mul(d,f));}
  let ke=0;const damp=Math.exp(-5.5*dt);
  for(let i=0;i<n;i++){let a=F[i];a=V3.sub(a,V3.mul(P[i],V3.dot(a,P[i])));let v=V3.add(this.vel[i],V3.mul(a,18*dt));v=V3.sub(v,V3.mul(P[i],V3.dot(v,P[i])));v=V3.mul(v,damp);
    const sp=V3.len(v);if(sp>3)v=V3.mul(v,3/sp);this.vel[i]=v;P[i]=V3.norm(V3.add(P[i],V3.mul(v,dt)));ke+=sp*sp;}
  return ke;};
DomainSim.prototype.kick=function(amt){this.dir=this.dir.map(d=>{const r=[Math.random()-.5,Math.random()-.5,Math.random()-.5];return V3.norm(V3.add(d,V3.mul(r,amt*2)));});this.vel=this.dir.map(()=>[0,0,0]);};
DomainSim.prototype.settle=function(maxSteps=4000){for(let i=0;i<maxSteps;i++)if(this.step(1/60)<1e-10&&i>20)break;};
/* lone pairs are fatter balloons; the effect is fitted to NH₃ and H₂O (3 regions: weaker). 5–6 regions are drawn ideal. */
const lpWeight=n=>n<=3?1.07:n===4?LP_WEIGHT:1;

/* ---------------- sim2d: one animation loop per canvas ----------------
   o.h(w) height, o.step(dt,t) physics, o.draw(ctx,w,h,t) drawing. Runs only while the canvas is on screen and its module is open;
   with reduced motion it draws once and again whenever the module calls .render() after a control changes. */
function sim2d(cv,o){let seen=true,last=0,t=0,raf=0,inF=false;
  const live=()=>seen&&!document.hidden&&cv.offsetParent!==null;
  function render(){const w=cv.clientWidth;if(!w)return;const h=o.h?o.h(w):clamp(w*.5,240,380);const c=prep(cv,h);if(!c)return;o.draw(c.ctx,w,h,t);}
  function frame(ts){raf=0;if(!live()){last=0;return;}inF=true;const dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;t+=dt;try{if(o.step&&!(o.paused&&o.paused()))o.step(dt,t);render();}finally{inF=false;}raf=requestAnimationFrame(frame);}
  function kick(){if(REDUCE){render();return;}if(!raf&&!inF&&live())raf=requestAnimationFrame(frame);}
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{seen=es[es.length-1].isIntersecting;if(seen)kick();}).observe(cv);
  document.addEventListener('visibilitychange',kick);window.addEventListener('hashchange',()=>setTimeout(kick,50));
  if(o.drag){cv.classList.add('drag');cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);o.drag('down',e,cv);kick();});cv.addEventListener('pointermove',e=>{o.drag('move',e,cv);if(REDUCE)render();});
    const up=e=>o.drag('up',e,cv);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);}
  setTimeout(kick,30);
  return {render:()=>{render();kick();},get t(){return t;}};}
/* pointer position inside a canvas, in css pixels */
const ptr=(e,cv)=>{const r=cv.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top];};
/* a swarm of simple particles in a box: positions in css pixels, optional pairwise collisions */
function swarm(n,w,h,speed,r){const a=[];for(let i=0;i<n;i++){const ang=Math.random()*6.283,s=speed*(.4+Math.random()*1.2);a.push({x:r+Math.random()*(w-2*r),y:r+Math.random()*(h-2*r),vx:Math.cos(ang)*s,vy:Math.sin(ang)*s});}return a;}
/* species colours follow the site's colour roles */
const SPC=()=>({A:T.cx,B:T.hot,C:T.cv,D:T.ca,E:T.ce,I:T.ink});
/* quadratic roots of a x² + b x + c = 0 (real roots, ascending) */
function quad(a,b,c){const d=b*b-4*a*c;if(d<0)return [];const s=Math.sqrt(d),q=-.5*(b+Math.sign(b||1)*s);const r=[q/a,c/q].filter(isFinite).sort((x,y)=>x-y);return r;}
/* bisection solve of f(x)=0 on [a,b] (f changes sign) */
function solve(f,a,b,n=200){let fa=f(a);for(let i=0;i<n;i++){const m=(a+b)/2,fm=f(m);if((fm<0)===(fa<0)){a=m;fa=fm;}else b=m;}return (a+b)/2;}

/* formula text helpers */
const SUBD='₀₁₂₃₄₅₆₇₈₉';
const fsub=f=>String(f).replace(/(\d+)/g,d=>[...d].map(c=>SUBD[c]).join(''));
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);

/* ---------------- Hydrogen-like orbitals: radial distribution and Monte Carlo snapshots (lengths in Bohr radii a0) ---------------- */
const ORB_R={ /* radial functions up to a constant factor */
  '1s':r=>Math.exp(-r),'2s':r=>(2-r)*Math.exp(-r/2),'2p':r=>r*Math.exp(-r/2),
  '3s':r=>(27-18*r+2*r*r)*Math.exp(-r/3),'3p':r=>r*(1-r/6)*Math.exp(-r/3),'3d':r=>r*r*Math.exp(-r/3)};
const ORB_Y={ /* angular functions (unnormalized, real forms) and their maximum of Y² on the unit sphere */
  s:{f:()=>1,m:1},px:{f:(x)=>x,m:1},py:{f:(x,y)=>y,m:1},pz:{f:(x,y,z)=>z,m:1},
  dz2:{f:(x,y,z)=>3*z*z-1,m:4},dx2y2:{f:(x,y)=>x*x-y*y,m:1},dxy:{f:(x,y)=>x*y,m:.25},dxz:{f:(x,y,z)=>x*z,m:.25},dyz:{f:(x,y,z)=>y*z,m:.25}};
function orbitalModel(nl,ang,rmax){
  const R=ORB_R[nl],N=1200,dr=rmax/N,P=[],cdf=[0];let tot=0;
  for(let i=0;i<=N;i++){const r=i*dr,v=r*r*R(r)*R(r);P.push(v);}
  for(let i=1;i<=N;i++){tot+=(P[i-1]+P[i])/2*dr;cdf.push(tot);}
  const peak=P.indexOf(Math.max(...P))*dr;
  const at=q=>{let lo=0,hi=N;const t=q*tot;while(hi-lo>1){const m=(lo+hi)>>1;if(cdf[m]<t)lo=m;else hi=m;}return lo*dr;};
  const nodes=[];for(let i=1;i<=N;i++){const a=R((i-1)*dr),b=R(i*dr);if((a>0&&b<=0)||(a<0&&b>=0))nodes.push(i*dr);}
  const Y=ORB_Y[ang];
  function sample(n){const out=[];while(out.length<n){const r=at(Math.random());
    let x,y,z,f;for(let k=0;k<200;k++){const u=Math.random()*2-1,ph=Math.random()*6.2832,s=Math.sqrt(1-u*u);x=s*Math.cos(ph);y=s*Math.sin(ph);z=u;f=Y.f(x,y,z);if(Math.random()<f*f/Y.m)break;}
    const sign=(R(r)<0?-1:1)*(Y.f(x,y,z)<0?-1:1);out.push({p:[x*r,y*r,z*r],r,sign});}return out;}
  return {peak,r90:at(.9),nodes,sample,tot};}

/* ---------------- 2D particle diagrams of formulas (for reaction pictures) ---------------- */
const MOL2={};
function molAtoms(f){/* relative positions in bond lengths, plus bonds; cached per formula string */
  if(MOL2[f])return MOL2[f];const {count}=molarMass(f),els=Object.keys(count);let list=[];els.forEach(e=>{for(let i=0;i<count[e];i++)list.push(e);});
  const cen=els.find(e=>count[e]===1&&e!=='H'&&list.length>2),atoms=[],bonds=[];
  if(list.length===1)atoms.push({e:list[0],x:0,y:0});
  else if(list.length===2){atoms.push({e:list[0],x:-.5,y:0},{e:list[1],x:.5,y:0});bonds.push([0,1]);}
  else if(cen){atoms.push({e:cen,x:0,y:0});const oth=list.filter((e,i)=>!(e===cen&&list.indexOf(cen)===i)),n=oth.length,hy=oth.every(e=>e==='H')&&n===2;
    oth.forEach((e,i)=>{const a=n===2?(hy?(i?1:-1)*52.25*D2R+Math.PI/2*0:(i?Math.PI:0)):i/n*Math.PI*2+(n===4?Math.PI/4:Math.PI/2);const ang=n===2&&hy?(Math.PI/2+(i?1:-1)*52.25*D2R):a;atoms.push({e,x:Math.cos(ang),y:-Math.sin(ang)});bonds.push([0,atoms.length-1]);});}
  else{const n=list.length;list.forEach((e,i)=>{const a=i/n*Math.PI*2;atoms.push({e,x:Math.cos(a)*.75*(n>3?1:.8),y:Math.sin(a)*.75*(n>3?1:.8)});});for(let i=0;i<n;i++)if(n>2&&i<n-1)bonds.push([i,i+1]);if(n>3)bonds.push([n-1,0]);}
  return MOL2[f]={atoms,bonds};}
const e2col=e=>e==='H'?'#EEF1F5':e==='Fe'?'#B7541E':e==='Al'?'#B8A9A3':e==='Zn'?'#7C8FA6':e==='Cu'?'#C77A3B':e==='Ag'?'#C0C6CF':e==='Pb'?'#6B7280':e==='Ba'?'#3DAA6D':e==='Ca'?'#3DAA6D':ATOM[e]?atomCol(e):'#999';
function drawMol2D(ctx,f,cx,cy,u,o={}){const m=molAtoms(f),al=o.alpha??1;ctx.save();ctx.globalAlpha=al;
  ctx.strokeStyle=T.ink;ctx.lineWidth=Math.max(1.5,u*.12);ctx.lineCap='round';m.bonds.forEach(([i,j])=>{ctx.beginPath();ctx.moveTo(cx+m.atoms[i].x*u,cy+m.atoms[i].y*u);ctx.lineTo(cx+m.atoms[j].x*u,cy+m.atoms[j].y*u);ctx.stroke();});
  m.atoms.forEach(a=>{const r=u*(a.e==='H'?.3:.45);ball2(ctx,cx+a.x*u,cy+a.y*u,r,e2col(a.e),a.e==='H'?'rgba(0,0,0,.45)':null);});ctx.restore();return m;}
