'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const REDUCE=matchMedia('(prefers-reduced-motion: reduce)').matches;
let T={};
function readTokens(){const cs=getComputedStyle(document.documentElement);const g=n=>cs.getPropertyValue(n).trim();
  T={surface:g('--surface'),sunk:g('--sunk'),ink:g('--ink'),muted:g('--muted'),line:g('--line'),grid:g('--grid'),cx:g('--cx'),cv:g('--cv'),ca:g('--ca'),hot:g('--hot'),good:g('--good'),bad:g('--bad'),ce:g('--ce')};}
readTokens();
const MONO='11px "IBM Plex Mono", ui-monospace, monospace';
const LABEL='600 12px "IBM Plex Sans", system-ui, sans-serif';

function fmt(n,d=2){if(n==null||!isFinite(n))return '—';const a=Math.abs(n);if(a!==0&&(a<1e-3||a>=1e5))return sci(n);let s=n.toFixed(d);if(/^-0(\.0+)?$/.test(s))s=s.slice(1);return s.replace('-','−');}
const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
function sci(n,d=2){if(n==null||!isFinite(n))return '—';if(n===0)return '0';let e=Math.floor(Math.log10(Math.abs(n))+1e-12),m=Math.abs(n)/10**e;if(+m.toFixed(d)>=10){m/=10;e+=1;}
  return (n<0?'−':'')+m.toFixed(d)+' × 10'+String(e).split('').map(ch=>SUP[ch]).join('');}
function num(n){return String(+(+n).toFixed(3)).replace('-','−');}
function clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function niceStep(range,n){const raw=range/n;const mag=Math.pow(10,Math.floor(Math.log10(raw)));const r=raw/mag;return (r<1.5?1:r<3?2:r<7?5:10)*mag;}
function tick(v,step){return fmt(v,Math.max(0,-Math.floor(Math.log10(step)+1e-9)));}
function alpha(c,a){if(c&&c[0]==='#'){let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}return c;}
function prep(cv,h){const w=cv.clientWidth;if(!w)return null;const dpr=window.devicePixelRatio||1;cv.style.height=h+'px';
  const W=Math.round(w*dpr),H=Math.round(h*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  const ctx=cv.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);return {ctx,w,h};}
function arrow(ctx,x1,y1,x2,y2,color,w=2,dash){const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy);if(L<2)return;
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=w;ctx.lineCap='round';const hl=Math.min(10,L*.45),ux=dx/L,uy=dy/L;
  if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2-ux*hl*.7,y2-uy*hl*.7);ctx.stroke();ctx.setLineDash([]);
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-ux*hl-uy*hl*.5,y2-uy*hl+ux*hl*.5);ctx.lineTo(x2-ux*hl+uy*hl*.5,y2-uy*hl-ux*hl*.5);ctx.closePath();ctx.fill();ctx.restore();}
function dot(ctx,x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke();}}
function label(ctx,text,x,y,color,align='left',base='middle',font=LABEL){ctx.font=font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline=base;ctx.fillText(text,x,y);}
function panel(ctx,box,xr,yr,o={}){
  const X=t=>box.x+(t-xr[0])/(xr[1]-xr[0])*box.w, Y=v=>box.y+box.h-(v-yr[0])/(yr[1]-yr[0])*box.h;
  ctx.save();ctx.lineWidth=1;ctx.font=MONO;ctx.fillStyle=T.muted;ctx.strokeStyle=T.grid;
  const xs=niceStep(xr[1]-xr[0],o.xn||6),ys=niceStep(yr[1]-yr[0],o.yn||4);
  ctx.textAlign='center';ctx.textBaseline='top';
  for(let t=Math.ceil(xr[0]/xs-1e-9)*xs;t<=xr[1]+1e-9;t+=xs){const px=Math.round(X(t))+.5;ctx.beginPath();ctx.moveTo(px,box.y);ctx.lineTo(px,box.y+box.h);ctx.stroke();ctx.fillText(tick(t,xs),px,box.y+box.h+4);}
  ctx.textAlign='right';ctx.textBaseline='middle';
  for(let v=Math.ceil(yr[0]/ys-1e-9)*ys;v<=yr[1]+1e-9;v+=ys){const py=Math.round(Y(v))+.5;ctx.beginPath();ctx.moveTo(box.x,py);ctx.lineTo(box.x+box.w,py);ctx.stroke();ctx.fillText(tick(v,ys),box.x-6,py);}
  ctx.strokeStyle=T.muted;ctx.globalAlpha=.6;
  if(yr[0]<=0&&yr[1]>=0){const py=Math.round(Y(0))+.5;ctx.beginPath();ctx.moveTo(box.x,py);ctx.lineTo(box.x+box.w,py);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(box.x+.5,box.y);ctx.lineTo(box.x+.5,box.y+box.h);ctx.stroke();ctx.globalAlpha=1;
  if(o.ylabel)label(ctx,o.ylabel,box.x+8,box.y+5,o.color||T.ink,'left','top');
  if(o.xlabel)label(ctx,o.xlabel,box.x+box.w-4,box.y+box.h-4,T.muted,'right','bottom',MONO);
  ctx.restore();return {X,Y,box};
}
function clip(ctx,P){ctx.beginPath();ctx.rect(P.box.x,P.box.y,P.box.w,P.box.h);ctx.clip();}
function curve(ctx,P,f,a,b,color,w=2.25,n=260,dash){ctx.save();clip(ctx,P);ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineJoin='round';if(dash)ctx.setLineDash(dash);ctx.beginPath();
  for(let i=0;i<=n;i++){const t=a+(b-a)*i/n;const px=P.X(t),py=P.Y(f(t));i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.stroke();ctx.restore();}
function area(ctx,P,f,a,b,color,al=.2,n=200){if(b<=a)return;ctx.save();clip(ctx,P);ctx.fillStyle=alpha(color,al);ctx.beginPath();ctx.moveTo(P.X(a),P.Y(0));
  for(let i=0;i<=n;i++){const t=a+(b-a)*i/n;ctx.lineTo(P.X(t),P.Y(f(t)));}ctx.lineTo(P.X(b),P.Y(0));ctx.closePath();ctx.fill();ctx.restore();}
function line(ctx,P,x1,y1,x2,y2,color,w=1.5,dash){ctx.save();clip(ctx,P);ctx.strokeStyle=color;ctx.lineWidth=w;if(dash)ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(P.X(x1),P.Y(y1));ctx.lineTo(P.X(x2),P.Y(y2));ctx.stroke();ctx.restore();}
function bindRange(id,f,cb){const el=$('#'+id),out=$('#'+id+'-out');const up=()=>{if(out)out.textContent=f(+el.value);cb&&cb(+el.value);};el.addEventListener('input',up);if(out)out.textContent=f(+el.value);return el;}
function store(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v));}catch(e){return null;}}

const drawers={};
let current='overview';
let stepSync=()=>{},celebrate=()=>{},armReveal=()=>{};
/* ---------------- Real motion ----------------
   UI particles are projectiles: launched with a velocity, pulled down by gravity, slowed by air drag
   (paper confetti flutters as it turns). UI easing is a damped spring, solved from x'' = −ω²x − 2ζωx'. */
const FX=(()=>{let cv=null,ctx=null,parts=[],raf=0,last=0;const g=1500;
  function fit(){const d=devicePixelRatio||1;cv.width=innerWidth*d;cv.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0);}
  function step(ts){const dt=last?Math.min(.033,(ts-last)/1000):.016;last=ts;ctx.clearRect(0,0,innerWidth,innerHeight);
    parts=parts.filter(p=>{p.vy+=g*p.gk*dt;const dr=Math.exp(-p.drag*dt);p.vx*=dr;p.vy*=dr;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.w*dt;p.life+=dt;
      const a=Math.min(1,(p.max-p.life)/.35);if(a<=0||p.y>innerHeight+30)return false;
      ctx.save();ctx.globalAlpha=a;ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.col;
      if(p.paper){ctx.scale(1,Math.cos(p.life*p.flip));ctx.fillRect(-p.s,-p.s*.6,p.s*2,p.s*1.2);}else{ctx.beginPath();ctx.arc(0,0,p.s,0,7);ctx.fill();}ctx.restore();return true;});
    if(parts.length)raf=requestAnimationFrame(step);else{raf=0;last=0;}}
  return {spray(x,y,n,o={}){if(REDUCE)return;if(!cv){cv=document.createElement('canvas');cv.className='fx';cv.setAttribute('aria-hidden','true');document.body.appendChild(cv);ctx=cv.getContext('2d');addEventListener('resize',fit);}fit();
    const cols=o.cols||[T.cx,T.cv,T.ca,T.hot];for(let i=0;i<n;i++){const ang=(o.dir??-Math.PI/2)+(Math.random()-.5)*(o.spread??Math.PI*2),sp=(o.speed||300)*(.55+Math.random()*.6);
      parts.push({x,y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,rot:Math.random()*6,w:(Math.random()-.5)*14,flip:6+Math.random()*10,s:o.paper?3+Math.random()*3:2+Math.random()*2.2,
        col:cols[i%cols.length],paper:!!o.paper,drag:o.paper?1.6:2.2,gk:o.paper?1:.6,life:0,max:o.life||(o.paper?2.4:.9)});}
    if(!raf)raf=requestAnimationFrame(step);}};})();
function burst(el,n=14){if(REDUCE||!el)return;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;FX.spray(clamp(r.left+r.width-28,8,innerWidth-8),r.top+r.height/2,n,{speed:320});}
(function springs(){if(!(window.CSS&&CSS.supports&&CSS.supports('transition-timing-function','linear(0, 1)')))return;
  const mk=z=>{const w0=Math.log(400)/z,wd=w0*Math.sqrt(1-z*z),pts=[];for(let i=0;i<=40;i++){const t=i/40;pts.push(+(1-Math.exp(-z*w0*t)*(Math.cos(wd*t)+z*w0/wd*Math.sin(wd*t))).toFixed(4));}return `linear(${pts.join(',')})`;};
  const st=document.documentElement.style;st.setProperty('--ease-spring',mk(.42));st.setProperty('--ease-out',mk(.82));})();
function redraw(id){const f=drawers[id||current];if(f)f();}

/* ---------------- 3D views: a small perspective renderer on a 2D canvas ----------------
   z is up. Drag to orbit all the way around, pinch or Ctrl+scroll to zoom, arrow keys when focused,
   double-click to reset. Each frame the scene adds primitives; they are drawn far to near. */
const V3={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len:a=>Math.hypot(a[0],a[1],a[2])};
V3.norm=a=>V3.mul(a,1/(V3.len(a)||1));
function shade(c,k){if(!c||c[0]!=='#')return c;let h=c.slice(1);if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16),f=v=>Math.round(clamp(k<1?v*k:v+(255-v)*(k-1),0,255));return `rgb(${f(n>>16&255)},${f(n>>8&255)},${f(n&255)})`;}
const STARS=Array.from({length:140},(_,i)=>{const u=Math.sin(i*12.9898)*43758.5453%1,v=Math.sin(i*78.233)*12345.678%1,th=Math.abs(u)*Math.PI*2,ph=Math.acos(2*Math.abs(v)-1);return [40*Math.sin(ph)*Math.cos(th),40*Math.sin(ph)*Math.sin(th),40*Math.cos(ph),.6+Math.abs(u*v)*1.6];});
function view3d(cv,o){
  let cam={yaw:o.yaw??-.9,pitch:o.pitch??.42,dist:o.dist??9,target:o.target||[0,0,0]},home={...cam};
  let vy=0,vp=0,active=0,raf=0,lastT=0,pinch=0,seen=true;const ptrs=new Map(),mn=o.min||2.5,mx=o.max||40;
  const wrap=document.createElement('div');wrap.className='v3';cv.before(wrap);wrap.appendChild(cv);cv.tabIndex=0;cv.classList.add('drag');
  wrap.insertAdjacentHTML('beforeend','<span class="v3hint" aria-hidden="true">Drag to spin 360°</span><div class="v3ui"><button type="button" data-z="in" aria-label="Zoom in">+</button><button type="button" data-z="out" aria-label="Zoom out">−</button><button type="button" data-z="home" aria-label="Reset the view">⟲</button></div>');
  const live=()=>seen&&!document.hidden&&cv.offsetParent!==null;
  function render(t){const w=cv.clientWidth;if(!w)return;const big=cv.closest('.lab.big');const h=Math.round(big?Math.max((o.height||(x=>clamp(x*.62,260,420)))(w),innerHeight*.6):(o.height||(x=>clamp(x*.62,260,420)))(w));
    const c=prep(cv,h);if(!c)return;const ctx=c.ctx,tg=cam.target,cy=Math.cos(cam.yaw),sy=Math.sin(cam.yaw),cp=Math.cos(cam.pitch),sp=Math.sin(cam.pitch);
    const eye=[tg[0]+cam.dist*cp*cy,tg[1]+cam.dist*cp*sy,tg[2]+cam.dist*sp],f=V3.norm(V3.sub(tg,eye)),r=V3.norm(V3.cross(f,[0,0,1])),u=V3.cross(r,f),F=Math.min(w,h)*1.25,ox=w/2,oy=h/2;
    const P=p=>{const d=V3.sub(p,eye),z=V3.dot(d,f);if(z<.05)return null;const k=F/z;return [ox+V3.dot(d,r)*k,oy-V3.dot(d,u)*k,z,k];};
    const L=[],push=(z,fn)=>L.push([z,fn]);
    const LIGHT=V3.norm([-.45,-.35,.82]);
    const S={P,pitch:cam.pitch,eye,
      line(a,b,col,lw=1.5,dash){const A=P(a),B=P(b);if(!A||!B)return;push((A[2]+B[2])/2,x=>{x.save();x.strokeStyle=col;x.lineWidth=lw;x.lineCap='round';if(dash)x.setLineDash(dash);x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(B[0],B[1]);x.stroke();x.restore();});},
      path(pts,col,lw=1.5,dash,z){const Q=pts.map(P);if(Q.some(q=>!q))return;push(z??Q.reduce((s,q)=>s+q[2],0)/Q.length,x=>{x.save();x.strokeStyle=col;x.lineWidth=lw;if(dash)x.setLineDash(dash);x.beginPath();Q.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.stroke();x.restore();});},
      arrow(a,b,col,lw=3,lab){const d=V3.sub(b,a),n=V3.len(d);if(n<1e-6)return;const hl=Math.min(.3,n*.4),A=P(a),B=P(b),K=P(V3.sub(b,V3.mul(d,hl/n)));if(!A||!B||!K)return;
        push((A[2]+B[2])/2,x=>{const dx=B[0]-K[0],dy=B[1]-K[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,hh=Math.max(8,Math.min(l,26)),hw=hh*.5;
          x.save();x.strokeStyle=x.fillStyle=col;x.lineWidth=lw;x.lineCap='round';x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(B[0]-ux*hh*.7,B[1]-uy*hh*.7);x.stroke();
          x.beginPath();x.moveTo(B[0],B[1]);x.lineTo(B[0]-ux*hh-uy*hw,B[1]-uy*hh+ux*hw);x.lineTo(B[0]-ux*hh+uy*hw,B[1]-uy*hh-ux*hw);x.closePath();x.fill();x.restore();});
        if(lab)S.text(V3.add(b,V3.mul(d,.3/n)),lab,col);},
      ball(p,rad,col,al=1,shadow=true){const C=P(p);if(!C)return;const R=Math.max(1.5,rad*C[3]);
        if(shadow&&p[2]>0){const G=P([p[0],p[1],0]);if(G){const g=Math.max(.12,Math.abs(Math.sin(cam.pitch)));push(G[2]+1e6,x=>{x.save();x.globalAlpha=.22*al;x.fillStyle='#000';x.beginPath();x.ellipse(G[0],G[1],R,R*g,0,0,7);x.fill();x.restore();});}}
        push(C[2],x=>{x.save();x.globalAlpha=al;x.beginPath();x.arc(C[0],C[1],R,0,7);x.fillStyle=col;x.fill();
          const g=x.createRadialGradient(C[0]-R*.35,C[1]-R*.4,R*.05,C[0],C[1],R*1.02);g.addColorStop(0,'rgba(255,255,255,.8)');g.addColorStop(.32,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.38)');x.fillStyle=g;x.fill();x.restore();});},
      poly(pts,fill,stroke,z){const Q=pts.map(P);if(Q.some(q=>!q))return;push(z??Q.reduce((s,q)=>s+q[2],0)/Q.length,x=>{x.beginPath();Q.forEach((q,i)=>i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));x.closePath();if(fill){x.fillStyle=fill;x.fill();}if(stroke){x.strokeStyle=stroke;x.lineWidth=1.5;x.stroke();}});},
      text(p,str,col,font=LABEL){const C=P(p);if(!C)return;push(-1e9+C[2],x=>{x.save();x.font=font;const w2=x.measureText(str).width/2+5;x.fillStyle=alpha(T.surface,.78);x.beginPath();x.roundRect?x.roundRect(C[0]-w2,C[1]-10,w2*2,20,6):x.rect(C[0]-w2,C[1]-10,w2*2,20);x.fill();x.restore();label(x,str,C[0],C[1],col,'center','middle',font);});},
      grid(x0,x1,y0,y1,st=1){S.poly([[x0,y0,0],[x1,y0,0],[x1,y1,0],[x0,y1,0]],alpha(T.sunk,.55),null,2e6);
        for(let x=x0;x<=x1+1e-9;x+=st)S.line([x,y0,0],[x,y1,0],T.line,1),L[L.length-1][0]=1.5e6;for(let y=y0;y<=y1+1e-9;y+=st)S.line([x0,y,0],[x1,y,0],T.line,1),L[L.length-1][0]=1.5e6;},
      box(c,dim,rot,col,al=1){const [hx,hy,hz]=dim.map(v=>v/2),cr=Math.cos(rot),sr=Math.sin(rot),W=q=>[c[0]+q[0]*cr+q[2]*sr,c[1]+q[1],c[2]-q[0]*sr+q[2]*cr];
        const v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(q=>W([q[0]*hx,q[1]*hy,q[2]*hz]));
        [[0,1,2,3,[0,0,-1]],[4,5,6,7,[0,0,1]],[0,1,5,4,[0,-1,0]],[2,3,7,6,[0,1,0]],[1,2,6,5,[1,0,0]],[0,3,7,4,[-1,0,0]]].forEach(([a,b,cc,d,nl])=>{
          const n=[nl[0]*cr+nl[2]*sr,nl[1],-nl[0]*sr+nl[2]*cr],ctr=V3.mul(V3.add(V3.add(v[a],v[b]),V3.add(v[cc],v[d])),.25);if(V3.dot(n,V3.sub(eye,ctr))<=0)return;
          const lit=.62+.38*Math.max(0,V3.dot(n,LIGHT));S.poly([v[a],v[b],v[cc],v[d]],al<1?alpha(col,al):shade(col,lit),al<1?alpha(col,.9):shade(col,lit*.8));});},
      tube(a,b,rad,col){const A=P(a),B=P(b);if(!A||!B)return;push((A[2]+B[2])/2-.001,x=>{const w=Math.max(1.5,rad*(A[3]+B[3]));x.save();x.lineCap='round';x.strokeStyle=shade(col,.72);x.lineWidth=w+1.6;x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(B[0],B[1]);x.stroke();
          x.strokeStyle=col;x.lineWidth=w;x.stroke();x.strokeStyle=shade(col,1.25);x.lineWidth=w*.32;x.beginPath();x.moveTo(A[0]-w*.18,A[1]-w*.2);x.lineTo(B[0]-w*.18,B[1]-w*.2);x.stroke();x.restore();});},
      disk(c,R,col,n=48,stroke){S.poly(Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [c[0]+R*Math.cos(a),c[1]+R*Math.sin(a),c[2]];}),col,stroke);},

      /* chemistry primitives: atoms, two-tone bonds, translucent lobes (meshes) */
      atom(p,rad,col,al=1){const C=P(p);if(!C)return;const R=Math.max(2,rad*C[3]);push(C[2],x=>{x.save();x.globalAlpha=al;x.beginPath();x.arc(C[0],C[1],R,0,7);x.fillStyle=col;x.fill();
          const g=x.createRadialGradient(C[0]-R*.35,C[1]-R*.4,R*.05,C[0],C[1],R*1.02);g.addColorStop(0,'rgba(255,255,255,.75)');g.addColorStop(.35,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.38)');
          x.fillStyle=g;x.fill();x.lineWidth=1;x.strokeStyle='rgba(0,0,0,.35)';x.stroke();x.restore();});},
      bond(a,b,rad,colA,colB,order=1,sep=.16){const d=V3.sub(b,a),n=V3.len(d);if(n<1e-6)return;const u=V3.mul(d,1/n);
        let q=Math.abs(u[2])<.9?[0,0,1]:[1,0,0];const o=V3.norm(V3.cross(u,q)),offs=order===1?[0]:order===2||order===1.5?[-sep/2,sep/2]:[-sep,0,sep],mid=V3.mul(V3.add(a,b),.5);
        offs.forEach((k,ix)=>{const off=V3.mul(o,k),a2=V3.add(a,off),b2=V3.add(b,off),m2=V3.add(mid,off),r=order===1?rad:order===1.5&&ix?rad*.34:rad*.62;S.tube(a2,m2,r,colA);S.tube(m2,b2,r,colB);});},
      lobe(c,ax,len,rad,col,al=.5){/* a soft teardrop balloon: tip at c, pointing along unit vector ax. One silhouette (union of circles) plus a highlight. */
        const N=14,Q=[];let zs=0;for(let i=0;i<=N;i++){const s=i/N,q=P(V3.add(c,V3.mul(ax,len*s)));if(!q)return;const rho=rad*Math.pow(Math.sin(Math.PI*s),.75)*(.3+.7*s);Q.push([q[0],q[1],Math.max(.5,rho*q[3])]);zs+=q[2];}
        const bq=Q[9],R=bq[2];push(zs/(N+1),x=>{x.save();x.beginPath();Q.forEach(q=>{x.moveTo(q[0]+q[2],q[1]);x.arc(q[0],q[1],q[2],0,7);});x.fillStyle=alpha(col,al);x.fill();
          const g=x.createRadialGradient(bq[0]-R*.35,bq[1]-R*.4,R*.08,bq[0],bq[1],R*1.9);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.35,'rgba(255,255,255,.06)');g.addColorStop(1,'rgba(0,0,0,.22)');x.fillStyle=g;x.fill();x.restore();});},
      mesh(tris,col,al=.5,wire){/* tris: array of [p,q,r] triangles; lit by a fixed light, sorted with everything else */
        tris.forEach(t=>{const A=P(t[0]),B=P(t[1]),C2=P(t[2]);if(!A||!B||!C2)return;const n=V3.norm(V3.cross(V3.sub(t[1],t[0]),V3.sub(t[2],t[0])));const ctr=V3.mul(V3.add(V3.add(t[0],t[1]),t[2]),1/3);
          const facing=V3.dot(n,V3.sub(eye,ctr))>=0?1:-1,lit=.55+.45*Math.abs(V3.dot(n,LIGHT));
          push((A[2]+B[2]+C2[2])/3,x=>{x.beginPath();x.moveTo(A[0],A[1]);x.lineTo(B[0],B[1]);x.lineTo(C2[0],C2[1]);x.closePath();x.fillStyle=alpha(shade(col,lit),al);x.fill();if(wire){x.strokeStyle=alpha(shade(col,lit*.7),Math.min(1,al+.2));x.lineWidth=.6;x.stroke();}});});},
      dots(pts,rad,col,al=.6){pts.forEach(p=>{const C=P(p);if(!C)return;push(C[2],x=>{x.globalAlpha=al;x.fillStyle=col;x.beginPath();x.arc(C[0],C[1],Math.max(.8,rad*C[3]),0,7);x.fill();x.globalAlpha=1;});});},
      arc(c,a,b,r,col,lw=1.8,n=18){/* arc around c from direction a to direction b (unit vectors), radius r */
        const dot=Math.max(-1,Math.min(1,V3.dot(a,b))),th=Math.acos(dot);if(th<1e-3)return;let w=V3.cross(a,b);if(V3.len(w)<1e-6)return;w=V3.norm(w);const perp=V3.cross(w,a),pts=[];
        for(let i=0;i<=n;i++){const t=th*i/n;pts.push(V3.add(c,V3.mul(V3.add(V3.mul(a,Math.cos(t)),V3.mul(perp,Math.sin(t))),r)));}S.path(pts,col,lw,null,-1e8);},
      stars(){STARS.forEach(([a,b,c2,sz])=>{const C=P(V3.add(cam.target,[a,b,c2]));if(C)push(3e6,x=>{x.fillStyle=alpha(T.muted,.55);x.fillRect(C[0],C[1],sz,sz);});});}};
    o.scene(S,t);L.sort((a,b)=>b[0]-a[0]);L.forEach(e=>e[1](ctx));}
  function frame(ts){raf=0;const dt=lastT?Math.min(.05,(ts-lastT)/1000):0;lastT=ts;
    if(!ptrs.size){if(Math.abs(vy)>2e-4||Math.abs(vp)>2e-4){cam.yaw+=vy;cam.pitch=clamp(cam.pitch+vp,-1.45,1.45);vy*=.93;vp*=.93;}else if(o.auto!==false&&ts-active>3500)cam.yaw+=dt*.22;}
    render(ts/1000);if(live())raf=requestAnimationFrame(frame);}
  function kick(){if(REDUCE){render(null);return;}if(!raf&&live())raf=requestAnimationFrame(frame);}
  const touch=()=>{active=performance.now();kick();};
  const pd=()=>{const v=[...ptrs.values()];return Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);};
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);vy=vp=0;if(ptrs.size===2)pinch=pd();wrap.classList.add('used');touch();});
  cv.addEventListener('pointermove',e=>{const pv=ptrs.get(e.pointerId);if(!pv)return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptrs.size===2){const d=pd();if(pinch)cam.dist=clamp(cam.dist*pinch/d,mn,mx);pinch=d;}else{vy=-(e.clientX-pv[0])*.009;vp=(e.clientY-pv[1])*.007;cam.yaw+=vy;cam.pitch=clamp(cam.pitch+vp,-1.45,1.45);}
    if(REDUCE)vy=vp=0;touch();});
  const up=e=>{ptrs.delete(e.pointerId);pinch=0;touch();};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();cam.dist=clamp(cam.dist*Math.exp(e.deltaY*.01),mn,mx);touch();},{passive:false});
  cv.addEventListener('keydown',e=>{const k={ArrowLeft:[.15,0],ArrowRight:[-.15,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}[e.key];
    if(k){cam.yaw+=k[0];cam.pitch=clamp(cam.pitch+k[1],-1.45,1.45);}else if(e.key==='+'||e.key==='=')cam.dist=clamp(cam.dist*.85,mn,mx);else if(e.key==='-')cam.dist=clamp(cam.dist/.85,mn,mx);else return;e.preventDefault();touch();});
  const goHome=()=>{cam={...home,target:[...home.target]};vy=vp=0;touch();};cv.addEventListener('dblclick',goHome);
  wrap.querySelector('.v3ui').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const z=b.dataset.z;if(z==='home')goHome();else cam.dist=clamp(cam.dist*(z==='in'?.8:1.25),mn,mx);touch();});
  if('IntersectionObserver' in window)new IntersectionObserver(es=>{seen=es[es.length-1].isIntersecting;if(seen)kick();}).observe(cv);
  document.addEventListener('visibilitychange',kick);window.addEventListener('hashchange',()=>setTimeout(kick,50));
  return {render:()=>{render(REDUCE?null:performance.now()/1000);kick();},setHome(h){home={...home,...h};goHome();}};}

