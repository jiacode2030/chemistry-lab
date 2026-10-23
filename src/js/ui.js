function onTheme(){readTokens();redraw();}
const mq=matchMedia('(prefers-color-scheme: dark)');if(mq.addEventListener)mq.addEventListener('change',onTheme);
new MutationObserver(onTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
/* ---------------- Theme switch: auto (follows the device), light, dark ---------------- */
(function theme(){const b=$('#theme-btn'),root=document.documentElement,NAMES={auto:'auto',light:'light',dark:'dark'};
  function show(m){b.dataset.mode=m;$('.tl',b).textContent='Theme: '+NAMES[m];b.setAttribute('aria-label',`Color theme: ${NAMES[m]}. Click to change.`);}
  function apply(m){if(m==='auto')root.removeAttribute('data-theme');else root.setAttribute('data-theme',m);show(m);}
  const saved=store('chem-theme');if(saved&&NAMES[saved])apply(saved);else show('auto');
  let tm;b.addEventListener('click',()=>{const m={auto:'light',light:'dark',dark:'auto'}[b.dataset.mode]||'auto';
    if(!REDUCE){root.classList.add('theming');clearTimeout(tm);tm=setTimeout(()=>root.classList.remove('theming'),400);}apply(m);store('chem-theme',m);});})();
/* ---------------- Feedback motion: new text slides in; right answers burst ---------------- */
new MutationObserver(recs=>{const seen=new Set();recs.forEach(r=>{const el=r.target;if(!el.classList||seen.has(el))return;
  if(el.classList.contains('fb')||(el.parentElement&&el.parentElement.classList.contains('coach'))){seen.add(el);el.classList.remove('swap');void el.offsetWidth;el.classList.add('swap');}});})
  .observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{const b=e.target.closest('.quiz .opts button, .sopts button');if(!b)return;if(b.classList.contains('right')){burst(b);bubble(b,'Correct!');}else if(b.classList.contains('wrong'))bubble(b,'Not quite',true);});
document.addEventListener('submit',e=>{const card=e.target.closest('.prob');if(!card)return;const btn=$('button[type=submit]',card)||card;if($('.fb.ok',card)){burst(btn);bubble(btn,'Correct!');}});
/* ---------------- Popups and expanding panels ---------------- */
const ICON={x:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'};
function bubble(el,text,bad){if(REDUCE)return;const r=el.getBoundingClientRect(),b=document.createElement('span');b.className='bubble'+(bad?' no':'');b.textContent=text;b.setAttribute('aria-hidden','true');
  b.style.left=clamp(r.left+r.width-60,50,innerWidth-50)+'px';b.style.top=(r.top-30)+'px';document.body.appendChild(b);setTimeout(()=>b.remove(),1200);}
function confetti(x,y,n=40){FX.spray(x,y,n,{paper:true,speed:720,spread:1.5});}
/* open/close a dialog with the shared pop animation */
function popOpen(d){d.classList.remove('closing');if(d.showModal){if(!d.open)d.showModal();}else d.setAttribute('open','');}
function popClose(d,then){const end=()=>{d.classList.remove('closing','flip');if(d.close)d.close();else d.removeAttribute('open');then&&then();};if(REDUCE||!d.open){end();return;}d.classList.add('closing');setTimeout(end,190);}
/* FLIP: animate an element from a rectangle it used to occupy to where it is now */
function flipFrom(el,from,ms=480){if(REDUCE||!el.animate)return null;const to=el.getBoundingClientRect();if(!to.width||!to.height)return null;
  return el.animate([{transformOrigin:'0 0',transform:`translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`},{transformOrigin:'0 0',transform:'none'}],{duration:ms,easing:'cubic-bezier(.2,.9,.25,1.04)'});}

/* Search: jump to any module (button in the rail, or press / anywhere) */
(function search(){const d=$('#cmd'),q=$('#cmd-q'),list=$('#cmd-list');let items=[],sel=0;
  const all=()=>{const dn=store('chem-done')||{};const out=[];GROUPS.forEach(g=>g.ids.forEach(id=>out.push({id,t:MODS[id].t,d:MODS[id].d,w:g.w==='Optional'?'Math':g.w,done:!!dn[id]})));
    $$('#nav a').forEach(a=>{const v=a.dataset.view;if(v&&!MODS[v]&&v!=='overview')out.push({id:v,t:a.textContent.replace(/ \(\d+ due\)/,''),d:'Review and practice',w:'Review',done:false});});return out;};
  function render(){const words=q.value.toLowerCase().split(/\s+/).filter(Boolean);items=all().filter(it=>words.every(w=>(it.t+' '+it.d+' '+it.w).toLowerCase().includes(w)));sel=0;
    list.innerHTML=items.length?items.map((it,i)=>`<li role="option" id="cmd-o${i}" aria-selected="${i===0}" data-id="${it.id}" style="animation-delay:${Math.min(i,12)*18}ms"><span class="wk">${it.w}</span><b>${it.t}</b>${it.done?'<span class="ok">✓</span>':'<span></span>'}<span class="d">${it.d}</span></li>`).join('')
      :'<li class="none">No module matches that. Try a shorter word.</li>';}
  function move(k){if(!items.length)return;sel=(sel+k+items.length)%items.length;$$('li',list).forEach((li,i)=>li.setAttribute('aria-selected',i===sel));const li=$(`#cmd-o${sel}`);li&&li.scrollIntoView({block:'nearest'});q.setAttribute('aria-activedescendant','cmd-o'+sel);}
  function go(id){popClose(d,()=>{location.hash=id;});}
  function open(){q.value='';render();popOpen(d);q.focus();}
  q.addEventListener('input',render);
  q.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();move(1);}else if(e.key==='ArrowUp'){e.preventDefault();move(-1);}else if(e.key==='Enter'&&items[sel]){e.preventDefault();go(items[sel].id);}});
  list.addEventListener('click',e=>{const li=e.target.closest('li[data-id]');if(li)go(li.dataset.id);});
  list.addEventListener('mousemove',e=>{const li=e.target.closest('li[data-id]');if(!li)return;const i=$$('li',list).indexOf(li);if(i!==sel){sel=i;move(0);}});
  d.addEventListener('cancel',e=>{e.preventDefault();popClose(d);});d.addEventListener('click',e=>{if(e.target===d)popClose(d);});
  $('#cmd-btn').addEventListener('click',open);
  document.addEventListener('keydown',e=>{const tg=e.target,typing=tg.closest&&tg.closest('input,textarea,select,[contenteditable]');
    if(((e.key==='/'&&!typing)||((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'))&&!d.open){e.preventDefault();open();}});})();

/* Module preview: clicking a module card expands it into a preview */
(function preview(){const d=$('#mprev'),body=$('#mprev-body');let card=null;
  function countUp(el,to){if(REDUCE){el.textContent=to;return;}const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/600);el.textContent=Math.round(to*(1-(1-k)**3));if(k<1)requestAnimationFrame(f);};requestAnimationFrame(f);}
  function open(c){const id=(c.getAttribute('href')||'').slice(1);if(!MODS[id])return;card=c;const m=MODS[id],g=GROUPS.find(g=>g.ids.includes(id)),solved=store('chem-solved')||{},probs=PROBS.filter(p=>p.topic===id),
      ns=probs.filter(p=>solved[p.id]).length,dn=!!(store('chem-done')||{})[id],secs=$$('.steps a',$('#v-'+id)).map(a=>a.textContent.replace(/^\d+/,''));
    const i=GROUPS.flatMap(g=>g.ids).indexOf(id),dots=[0,1,2,3,4,5].map(k=>`<circle cx="${18+k*22}" cy="${14+2.4*k*k}" r="${k===5?7:6}" fill="var(--${k===5?'hot':'cx'})" opacity="${k===5?1:.25+k*.13}" style="animation-delay:${200+k*70}ms"/>`).join('');
    body.innerHTML=`<div class="mp-hero"><svg viewBox="0 0 150 110" aria-hidden="true">${dots}</svg><div class="eyebrow">${g?g.w+' · '+g.name:''}</div><h2 id="mprev-title">${m.t}</h2><p>${m.d}</p></div>
      <button type="button" class="mp-x" aria-label="Close preview">${ICON.x}</button>
      <div class="mp-body"><div class="mp-stats"><div><span>Module</span><strong>${i+1} / ${GROUPS.flatMap(g=>g.ids).length}</strong></div><div><span>Practice</span><strong><b class="cu">0</b>/${probs.length}</strong></div><div><span>Status</span><strong class="${dn?'yes':''}">${dn?'Done ✓':'Not yet'}</strong></div></div>
      ${secs.length?`<div><div class="small" style="margin-bottom:6px">Inside this module</div><div class="mp-chips">${secs.map((t,k)=>`<span style="animation-delay:${260+k*45}ms">${t}</span>`).join('')}</div></div>`:''}
      <div class="row"><span class="tag ${apTag(id)}">${m.ap}</span></div>
      <div class="mp-actions"><button type="button" class="btn" data-close>Back to all modules</button><a class="btn primary" href="#${id}" style="text-decoration:none">${dn?'Open again':'Start module'} →</a></div></div>`;
    const from=c.getBoundingClientRect();d.classList.toggle('flip',!REDUCE);popOpen(d);flipFrom(d,from,520);$$('.mp-body>*',d).forEach(x=>x.style.animationDelay='');countUp($('.cu',d),ns);$('.btn.primary',d).focus({preventScroll:true});}
  function close(){if(REDUCE||!card||!card.isConnected||!card.offsetWidth){popClose(d);return;}const to=card.getBoundingClientRect(),from=d.getBoundingClientRect();
    const an=d.animate([{transformOrigin:'0 0',transform:'none',opacity:1},{transformOrigin:'0 0',transform:`translate(${to.left-from.left}px,${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:0}],{duration:300,easing:'cubic-bezier(.4,0,1,1)'});
    an.onfinish=()=>{d.classList.remove('flip');d.close();};}
  document.addEventListener('click',e=>{const c=e.target.closest('a.mod');if(!c||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button)return;e.preventDefault();open(c);});
  d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close],.mp-x'))close();else if(e.target.closest('a.btn.primary')){d.classList.remove('flip');d.close();}});
  d.addEventListener('cancel',e=>{e.preventDefault();close();});})();

/* Simulations: Expand opens the panel as a big focus view, Close shrinks it back */
(function focusLab(){let openLab=null;const IC='<svg class="ic-out" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-7 7M10 20H4v-6M4 20l7-7"/></svg><svg class="ic-in" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10h-6V4M14 10l7-7M4 14h6v6M10 14l-7 7"/></svg>';
  function expand(lab){if(openLab)return;openLab=lab;lab.classList.remove('rv','in');const from=lab.getBoundingClientRect(),ph=document.createElement('div');ph.className='lab-ph';ph.style.height=from.height+'px';ph.textContent='Simulation open in focus view';
    lab.before(ph);lab._ph=ph;const sc=document.createElement('div');sc.className='lab-scrim';sc.addEventListener('click',()=>collapse());document.body.appendChild(sc);lab._sc=sc;
    lab.classList.add('big');document.documentElement.style.overflow='hidden';redraw();flipFrom(lab,from,520);setBtn(lab,true);$('.lab-x',lab).focus({preventScroll:true});}
  function collapse(){const lab=openLab;if(!lab)return;openLab=null;const from=lab.getBoundingClientRect();lab.classList.remove('big');document.documentElement.style.overflow='';lab._ph.remove();redraw();
    lab.classList.add('landing');const an=flipFrom(lab,from,420);const done=()=>lab.classList.remove('landing');if(an)an.onfinish=done;else done();
    const sc=lab._sc;if(REDUCE)sc.remove();else{sc.classList.add('out');setTimeout(()=>sc.remove(),200);}setBtn(lab,false);}
  function setBtn(lab,big){const b=$('.lab-x',lab);if(!b)return;$('span',b).textContent=big?'Close':'Expand';b.setAttribute('aria-label',big?'Close the focus view':'Expand this simulation');b.setAttribute('aria-expanded',big);}
  $$('.lab').forEach(lab=>{const bar=$('.labbar',lab);if(!bar)return;let row=bar.lastElementChild&&bar.lastElementChild.classList.contains('row')?bar.lastElementChild:null;
    if(!row){row=document.createElement('div');row.className='row';bar.appendChild(row);}
    const b=document.createElement('button');b.type='button';b.className='btn lab-x';b.innerHTML=IC+'<span>Expand</span>';b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Expand this simulation');
    b.addEventListener('click',()=>openLab===lab?collapse():expand(lab));row.appendChild(b);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&openLab){e.preventDefault();collapse();}});
  window.addEventListener('hashchange',()=>{if(openLab)collapse();});})();

/* Answers and scoring guides slide open and closed */
(function expandDetails(){document.addEventListener('click',e=>{const s=e.target.closest('summary');if(!s||REDUCE)return;const d=s.parentElement;if(!d||d.tagName!=='DETAILS'||!d.animate)return;e.preventDefault();
  if(d._an)d._an.cancel();const start=d.getBoundingClientRect().height;d.style.overflow='hidden';
  if(!d.open){d.open=true;const end=d.getBoundingClientRect().height;d._an=d.animate([{height:start+'px'},{height:end+'px'}],{duration:420,easing:'cubic-bezier(.2,.9,.25,1.04)'});}
  else{d.open=false;const end=d.getBoundingClientRect().height;d.open=true;d._an=d.animate([{height:start+'px'},{height:end+'px'}],{duration:240,easing:'cubic-bezier(.4,0,1,1)'});d._an.onfinish=()=>{d.open=false;};}
  d._an.addEventListener('finish',()=>{d.style.overflow='';d._an=null;});});})();

/* Sections that start below the fold rise in as they scroll into view */
(function reveal(){if(REDUCE||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const el=en.target;io.unobserve(el);el.classList.add('in');setTimeout(()=>el.classList.remove('rv','in'),800);}),{rootMargin:'0px 0px -6% 0px'});
  armReveal=()=>{$$('.rv').forEach(el=>el.classList.remove('rv','in'));io.disconnect();const sec=$('.view:not([hidden])');if(!sec)return;
    $$('.wrap>*:not(.head):not(.steps):not(.modgroups), .modgroups>.modgroup',sec).forEach(el=>{if(el.getBoundingClientRect().top>innerHeight*.92&&!el.classList.contains('big')){el.classList.add('rv');io.observe(el);}});};
  window.addEventListener('beforeprint',()=>$$('.rv').forEach(el=>el.classList.remove('rv','in')));})();

/* Module complete: a popup with a progress ring, confetti and a link to the next module */
(function cele(){const box=$('#cele');let tm=0;const order=GROUPS.flatMap(g=>g.ids);
  function hide(){if(box.hidden)return;clearTimeout(tm);if(REDUCE){box.hidden=true;return;}box.classList.add('out');setTimeout(()=>{box.hidden=true;box.classList.remove('out');},280);}
  celebrate=id=>{const dn=store('chem-done')||{},n=order.filter(k=>dn[k]).length,N=order.length,nx=order[order.indexOf(id)+1],C=2*Math.PI*24;
    box.innerHTML=`<svg class="ring" viewBox="0 0 54 54" aria-hidden="true"><circle class="bg" cx="27" cy="27" r="24"/><circle class="fg" cx="27" cy="27" r="24" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-(n-1)/N)}"/></svg>
      <b>Module complete!</b><button type="button" class="x" aria-label="Dismiss">×</button><span class="sub">${MODS[id].t} · ${n} of ${N} modules done</span>
      <div class="acts">${nx?`<a class="btn primary" href="#${nx}" style="text-decoration:none">Next: ${MODS[nx].t} →</a>`:`<a class="btn primary" href="#practice" style="text-decoration:none">Go to the practice set →</a>`}</div>`;
    box.hidden=false;box.classList.remove('out');void box.offsetWidth;const fg=$('.fg',box);requestAnimationFrame(()=>requestAnimationFrame(()=>fg.style.strokeDashoffset=C*(1-n/N)));
    const r=box.getBoundingClientRect();confetti(r.left+r.width/2,r.top+10);clearTimeout(tm);tm=setTimeout(hide,7000);};
  box.addEventListener('click',e=>{if(e.target.closest('.x,a'))hide();});box.addEventListener('mouseenter',()=>clearTimeout(tm));box.addEventListener('mouseleave',()=>{tm=setTimeout(hide,3000);});
  window.addEventListener('hashchange',()=>{if(!box.hidden&&!box.matches(':hover'))tm=setTimeout(hide,1500);});})();
(function words(){const h=$('.hero h1');if(!h)return;let k=0;const ws=[];const wrap=n=>[...n.childNodes].forEach(ch=>{if(ch.nodeType!==3){wrap(ch);return;}const f=document.createDocumentFragment();
  ch.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){f.append(p);return;}const w=document.createElement('span');w.className='w';w.textContent=p;ws.push(w);f.append(w);});ch.replaceWith(f);});wrap(h);
  if(REDUCE||!h.animate)return;
  /* drop from height 1 with g = 2 (so the first fall takes 1 time unit), bounce with e = 0.35 until it settles */
  const e=.35,frames=[],T0=[0];let v=2,t=1;while(v>.05&&T0.length<6){T0.push(t);t+=2*v*e/2;v*=e;}
  const tEnd=t,y=q=>{if(q<1)return 1-q*q;let tb=1,vb=2*e;while(tb+2*vb/2<q){tb+=vb;vb*=e;}const u=q-tb;return Math.max(0,vb*u-u*u);};
  for(let i=0;i<=48;i++){const q=i/48*tEnd;frames.push({transform:`translateY(${-y(q)*.55}em)`,opacity:Math.min(1,.15+q*1.4),offset:i/48});}
  ws.forEach((w,i)=>w.animate(frames,{duration:900,delay:80+i*85,easing:'linear',fill:'backwards'}));})();

/* ---------------- AP exam countdown ----------------
   College Board sets the date each year. Add the AP Chemistry date to AP_EXAM_DATES (YYYY-MM-DD) once it is posted at
   apstudents.collegeboard.org/exam-dates. Until then the page says the date isn't posted instead of guessing.
   AP Chemistry is a Session 2 (afternoon) exam, 12 p.m. local time for most schools; some locations differ, so the text says to confirm with your coordinator. */
const AP_EXAM_DATES=['2027-05-06'];
const myExamDate=()=>{try{return localStorage.getItem('chem-examdate')||'';}catch(e){return '';}};
(function countdown(){const el=$('#ap-count'),rl=$('#rail-count');if(!el)return;
  function paint(){const now=new Date(),link='<a href="https://apstudents.collegeboard.org/exam-dates" target="_blank" rel="noopener">official schedule</a>';
    const mine=myExamDate(),next=(mine?[mine]:AP_EXAM_DATES).map(d=>{const [y,m,dd]=d.split('-').map(Number);return new Date(y,m-1,dd);}).filter(x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()+1)>now).sort((a,b)=>a-b)[0];
    if(next){const days=Math.ceil((next-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/864e5),fd=next.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
      if(days<=0){el.innerHTML=`<span class="num">Today</span><span class="lbl">AP Chemistry exam day. Good luck!<small>${fd}</small></span>`;if(rl)rl.textContent='AP exam today. Good luck!';}
      else{el.innerHTML=`<span class="num">${days}</span><span class="lbl">day${days===1?'':'s'} until the AP Chemistry exam<small>${fd}${mine?'':', afternoon session (12 p.m. for most schools)'} · ${mine?'your date':link} · <button type="button" class="btn link ap-set" style="padding:0;min-height:0">${mine?'change':'set my date'}</button></small></span>`;if(rl)rl.textContent=`${days} day${days===1?'':'s'} to the AP exam`;}}
    else{const y=now.getMonth()>4?now.getFullYear()+1:now.getFullYear();el.innerHTML=`<span class="lbl">Next AP Chemistry exam: early to mid May ${y}<small>The exact date isn't listed here yet. Check the ${link}, or <button type="button" class="btn link ap-set" style="padding:0;min-height:0">set your own exam date</button> for a countdown.</small></span>`;if(rl)rl.textContent='';}
    const b=$('.ap-set');if(b)b.onclick=()=>{const v=prompt('Your AP Chemistry exam date (YYYY-MM-DD). Leave empty to clear.',myExamDate()||'');if(v===null)return;try{if(/^\d{4}-\d{2}-\d{2}$/.test(v.trim()))localStorage.setItem('chem-examdate',v.trim());else localStorage.removeItem('chem-examdate');}catch(e){}paint();};}
  paint();setInterval(paint,6e5);})();
