
/* ---------------- Report an issue: opens a pre-filled GitHub issue (no server needed) ---------------- */
(function report(){
  const dlg=$('#rp'),form=$('#rp-form'),where=$('#rp-where'),type=$('#rp-type'),det=$('#rp-details'),ctxEl=$('#rp-ctx'),msg=$('#rp-msg');
  const REPO='https://github.com/jiacode2030/intulab-feedback';
  const COURSE='Chemistry Lab',COURSE_LABEL='course:chem',SITE_VERSION='2026-10-23';
  let ctx='';
  const viewName=v=>{if(v==='overview')return 'Overview';if(MODS[v])return MODS[v].t;const a=$(`#nav a[data-view="${v}"]`);return a?a.textContent.replace(/ \(\d+ due\)/,'').trim():v;};
  const clip=(t,n)=>t.length>n?t.slice(0,n-1)+'…':t;
  function fillWhere(){if(where.options.length)return;VIEWS.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=viewName(v);where.appendChild(o);});
    const o=document.createElement('option');o.value='site';o.textContent='The whole site';where.appendChild(o);}
  function open(btn){fillWhere();const v=btn.dataset.report;where.value=VIEWS.includes(v)?v:(VIEWS.includes(current)?current:'site');
    const card=btn.closest('.prob');
    if(card&&card.rpCtx){const c=card.rpCtx,q=$('.q',card).textContent.trim();
      ctx=clip(`Problem ${c.pid} "${c.title}": ${q}`,800)+(c.exam&&!card.querySelector('input:disabled')?' | the generated answer is attached after grading':` | Generated answer: ${typeof c.ans==='number'?fmt(c.ans,3):c.ans} ${c.unit}`);
      type.value='Wrong answer in a problem';ctxEl.textContent=ctx;}
    else{ctx=`View: ${viewName(where.value)} (#${where.value})`;ctxEl.textContent=ctx;if(type.value==='Wrong answer in a problem')type.selectedIndex=0;}
    msg.textContent='';msg.className='msg';if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');det.focus();}
  let closing=0;
  function close(){const end=()=>{clearTimeout(closing);closing=0;dlg.classList.remove('closing');if(dlg.close)dlg.close();else dlg.removeAttribute('open');};
    if(REDUCE||!dlg.open){end();return;}if(closing)return;dlg.classList.add('closing');closing=setTimeout(end,190);}
  dlg.addEventListener('cancel',e=>{e.preventDefault();close();});
  const text=()=>`Report an issue (Chemistry Lab)\nWhere: ${viewName(where.value)} (#${where.value})\nType: ${type.value}\nDetails: ${det.value.trim()}\nContext: ${ctx}`;
  form.addEventListener('submit',e=>{e.preventDefault();const details=det.value.trim();
    if(!details){msg.className='msg no';msg.textContent='Add a few words about the issue first.';det.focus();return;}
    const title=clip(`[${COURSE}] [${type.value}] ${viewName(where.value)}: ${details.replace(/\s+/g,' ')}`,100);
    const body=`**Course:** ${COURSE}\n**Module:** ${viewName(where.value)} (#${where.value})\n**Type:** ${type.value}\n**Site version:** ${SITE_VERSION}\n\n${details}\n\n**Context:** ${ctx}`;
    const url=REPO+'/issues/new?labels='+encodeURIComponent(COURSE_LABEL)+'&title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body);
    const w=window.open(url,'_blank');if(w)w.opener=null;msg.className='msg ok';msg.textContent=w?'Opened GitHub in a new tab. Press "Submit new issue" there.':'Your browser blocked the new tab. Use "Copy report text" and post it at '+REPO.replace('https://','')+'/issues.';});
  $('#rp-copy').addEventListener('click',async()=>{if(!det.value.trim()){msg.className='msg no';msg.textContent='Add a few words about the issue first.';det.focus();return;}
    let ok=false;try{await navigator.clipboard.writeText(text());ok=true;}catch(e){}msg.className='msg '+(ok?'ok':'no');msg.textContent=ok?'Copied. Paste it into a new issue or an email.':'Could not copy automatically.';});
  $('#rp-close').addEventListener('click',close);
  dlg.addEventListener('click',e=>{if(e.target===dlg)close();});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-report]');if(b){e.preventDefault();open(b);}});
})();

/* Analytics: GoatCounter, shared with every Intulab site. Anonymous, no cookies, no personal data.
   Loads only on the public GitHub Pages site, and counts each module view as its own page. */
(function analytics(){if(!/\.github\.io$/.test(location.hostname))return;
  /* honor Do Not Track and Global Privacy Control: no counter at all */
  if(navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;window.goatcounter={no_onload:true};
  const s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.dataset.goatcounter='https://intulab.goatcounter.com/count';
  const view=()=>{const id=(location.hash||'').slice(1)||'overview';if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:location.pathname.replace(/\/$/,'')+'/'+id,title:id});};
  s.onload=()=>{view();addEventListener('hashchange',view);};document.head.appendChild(s);})();
/* Intulab app: offline support (sw.js). Only on the live site, and localhost for testing. */
if('serviceWorker' in navigator&&(/\.github\.io$/.test(location.hostname)||location.hostname==='localhost'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
/* Get the Intulab app (same app as the Intulab page; hidden once you're in it) */
(function appInstall(){var btns=document.querySelectorAll('.appbtn,.appbtn2'),dlg=document.getElementById('app-dlg');if(!btns.length||!dlg)return;
  var each=function(f){Array.prototype.forEach.call(btns,f);};
  if(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)return;
  each(function(b){b.hidden=false;});var prompt=null;
  var ua=navigator.userAgent,os=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)?'ios':/Android/.test(ua)?'android':'desktop';
  var form=dlg.querySelector('form'),mine=dlg.querySelector('[data-os="'+os+'"]'),more=document.createElement('details');more.innerHTML='<summary>Other devices</summary>';
  Array.prototype.forEach.call(dlg.querySelectorAll('.appos'),function(el){if(el!==mine)more.appendChild(el);});form.insertBefore(more,form.querySelector('.approw'));
  addEventListener('beforeinstallprompt',function(e){e.preventDefault();prompt=e;});
  addEventListener('appinstalled',function(){each(function(b){b.hidden=true;});});
  each(function(b){b.addEventListener('click',function(){if(prompt){prompt.prompt();prompt=null;return;}if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');});});})();
/* Pointer feel (same as the Intulab landing page): on the overview a soft glow and a few sparks follow the mouse; module cards tilt toward it and light up. Mouse and trackpad only, never with reduced motion. */
(function pointerFeel(){var fine=matchMedia('(hover: hover) and (pointer: fine)'),rm=matchMedia('(prefers-reduced-motion: reduce)');if(!fine.matches||rm.matches)return;
  var g=document.createElement('div');g.id='ptr';g.setAttribute('aria-hidden','true');document.body.appendChild(g);
  var onOv=function(){return !location.hash||location.hash==='#overview';},sync=function(){g.classList.toggle('ov',onOv());};sync();addEventListener('hashchange',sync);
  var x=0,y=0,tx=0,ty=0,raf=0,last=0,sparks=0;function loop(){x+=(tx-x)*.18;y+=(ty-y)*.18;g.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';raf=(Math.abs(tx-x)+Math.abs(ty-y)>.5)?requestAnimationFrame(loop):0;}
  function spark(px,py){if(sparks>18)return;var s=document.createElement('i');s.className='spark';s.style.left=px+'px';s.style.top=py+'px';s.style.setProperty('--dx',((Math.random()-.5)*46).toFixed(0)+'px');s.style.setProperty('--dy',(-14-Math.random()*34).toFixed(0)+'px');sparks++;s.addEventListener('animationend',function(){s.remove();sparks--;});document.body.appendChild(s);}
  addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;tx=e.clientX;ty=e.clientY;if(g.classList.contains('ov')){g.classList.add('on');if(!raf)raf=requestAnimationFrame(loop);var n=performance.now();if(n-last>70){last=n;spark(e.clientX,e.clientY);}}
    var c=e.target.closest&&e.target.closest('a.mod');if(c){var r=c.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
      c.style.setProperty('--mx',(px*100).toFixed(1)+'%');c.style.setProperty('--my',(py*100).toFixed(1)+'%');c.style.setProperty('--ry',((px-.5)*5).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-py)*5).toFixed(2)+'deg');}},{passive:true});
  document.addEventListener('pointerout',function(e){var c=e.target.closest&&e.target.closest('a.mod');if(c&&!c.contains(e.relatedTarget)){c.style.removeProperty('--rx');c.style.removeProperty('--ry');}if(!e.relatedTarget)g.classList.remove('on');});})();
/* Phone UI pass (same in every lab): the floating button shrinks to its icon while you scroll and the page keeps room for it; a revealed worked-example step lights up its part of the figure; quiz answers pulse or shake. Honors reduced motion. */
(function phoneUI(){var rm=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width: 900px)'),fs=document.querySelector('.fs-btn');
  if(fs){var setH=function(){document.documentElement.style.setProperty('--fsb',Math.ceil(fs.getBoundingClientRect().height||52)+'px');};setH();addEventListener('resize',setH);
    var t=0;addEventListener('scroll',function(){if(!phone.matches||rm.matches)return;fs.classList.add('fs-mini');clearTimeout(t);t=setTimeout(function(){fs.classList.remove('fs-mini');},700);},{passive:true});}
  document.addEventListener('click',function(e){var nx=e.target.closest&&e.target.closest('[data-next]'),all=e.target.closest&&e.target.closest('[data-all]');if(!nx&&!all)return;var ex=(nx||all).closest('.example');if(!ex)return;
    var shown=ex.querySelectorAll('.exsteps li:not([hidden])').length;
    Array.prototype.forEach.call(ex.querySelectorAll('.stepfig'),function(f){Array.prototype.forEach.call(f.querySelectorAll('[data-s]'),function(el){el.classList.toggle('cur',!el.hidden&&+el.dataset.s===shown);});f.classList.toggle('stephl',!!nx&&!!f.querySelector('[data-s].cur'));});
    Array.prototype.forEach.call(ex.querySelectorAll('.fbd'),function(f){f.classList.toggle('stephl',!!nx&&shown>1);});});
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.quiz .opts button');if(!b||rm.matches)return;b.classList.remove('pulse','shake');void b.offsetWidth;
    if(b.classList.contains('right'))b.classList.add('pulse');
    else if(b.classList.contains('wrong')){b.classList.add('shake');var fb=b.closest('.quiz').querySelector('.fb');if(fb){fb.classList.remove('fb-pop');void fb.offsetWidth;fb.classList.add('fb-pop');if(fb.getBoundingClientRect().bottom>innerHeight-80)fb.scrollIntoView({block:'center',behavior:'smooth'});}}});})();
/* UX pack (same in every lab): remembers the last module you opened (this device only) and offers Continue on the overview; thin reading-progress bar; soft cross-fade when the theme changes. */
(function uxPack(){var KEY='chem-last',rm=matchMedia('(prefers-reduced-motion: reduce)');
  var ls=function(f){try{return f();}catch(e){return null;}};
  var titleOf=function(id){var a=document.querySelector('#nav a[data-view="'+id+'"]');return a?a.textContent.replace(/\s+/g,' ').trim():null;};
  var save=function(){var id=(location.hash||'').slice(1);if(!id||id==='overview'||id==='practice'||!document.getElementById('v-'+id))return;var t=titleOf(id);if(!t)return;ls(function(){localStorage.setItem(KEY,JSON.stringify({id:id,t:t,ts:Date.now()}));});};
  var load=function(){return ls(function(){var o=JSON.parse(localStorage.getItem(KEY)||'null');return o&&o.id&&o.t?o:null;});};
  var addContinue=function(){var o=load(),ov=document.getElementById('v-overview');if(!ov||!o||!document.getElementById('v-'+o.id))return;var row=ov.querySelector('.hero .row');if(!row||row.querySelector('.cont'))return;
    var a=document.createElement('a');a.className='btn primary cont';a.href='#'+o.id;a.style.textDecoration='none';a.textContent='Continue: '+o.t;row.prepend(a);var st=row.querySelector('.btn.primary:not(.cont)');if(st)st.classList.remove('primary');};
  save();addContinue();addEventListener('hashchange',save);
  var bar=document.createElement('div');bar.id='rdbar';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
  var upd=function(){var h=document.documentElement.scrollHeight-innerHeight;bar.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0).toFixed(3)+')';};
  addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);addEventListener('hashchange',function(){setTimeout(upd,80);});upd();
  var fs=document.querySelector('.fs-btn');if(fs&&!fs.getAttribute('aria-label'))fs.setAttribute('aria-label',fs.textContent.replace(/\s+/g,' ').trim());
  document.addEventListener('click',function(e){if(rm.matches)return;var b=e.target.closest&&e.target.closest('#theme-btn,.themebtn');if(!b)return;var d=document.documentElement;d.classList.add('theme-fade');setTimeout(function(){d.classList.remove('theme-fade');},450);},true);})();
/* Delight pack (same in every lab). Hover effects need a mouse and no reduced-motion setting; the burst on a right answer works on any device. */
(function delight(){var fine=matchMedia('(hover: hover) and (pointer: fine)'),rm=matchMedia('(prefers-reduced-motion: reduce)');
  var onOv=function(){return !location.hash||location.hash==='#overview';};
  function burstAt(el){var r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;for(var i=0;i<12;i++){(function(){var s=document.createElement('i');s.className='spark';s.style.left=cx+'px';s.style.top=cy+'px';var a=Math.random()*Math.PI*2,d=34+Math.random()*52;s.style.setProperty('--dx',(Math.cos(a)*d).toFixed(0)+'px');s.style.setProperty('--dy',(Math.sin(a)*d).toFixed(0)+'px');s.addEventListener('animationend',function(){s.remove();});document.body.appendChild(s);})();}}
  document.addEventListener('click',function(e){if(rm.matches)return;var b=e.target.closest&&e.target.closest('.quiz .opts button');if(b)setTimeout(function(){if(b.classList.contains('right'))burstAt(b);},0);});
  if(!fine.matches||rm.matches)return;
  var hl=null,fig=null,btns=[];function grab(){var ov=document.getElementById('v-overview');if(!ov)return;hl=ov.querySelector('.hero h1 .hl');if(hl&&/text/.test(getComputedStyle(hl).webkitBackgroundClip||getComputedStyle(hl).backgroundClip))hl.classList.add('gx');else hl=null;fig=ov.querySelector('.hero .strobe,.hero>figure');btns=[].slice.call(ov.querySelectorAll('.hero .btn.primary'));}
  grab();
  addEventListener('pointermove',function(e){if(e.pointerType!=='mouse'||!onOv())return;
    if(hl)hl.style.setProperty('--gx',Math.round(e.clientX/innerWidth*100)+'%');
    btns.forEach(function(b){var r=b.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy);if(d<110){var k=(1-d/110)*7;b.style.translate=(dx/Math.max(d,1)*k).toFixed(1)+'px '+(dy/Math.max(d,1)*k).toFixed(1)+'px';}else b.style.translate='';});
    if(fig){var r=fig.getBoundingClientRect();if(e.clientX>r.left&&e.clientX<r.right&&e.clientY>r.top&&e.clientY<r.bottom){var px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;fig.style.transform='perspective(900px) rotateX('+(-py*4).toFixed(2)+'deg) rotateY('+(px*5).toFixed(2)+'deg)';}else fig.style.transform='';}},{passive:true});
  document.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||!onOv())return;var s=document.createElement('i');s.className='ring';s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';s.addEventListener('animationend',function(){s.remove();});document.body.appendChild(s);});
  addEventListener('hashchange',function(){if(!onOv()){btns.forEach(function(b){b.style.translate='';});if(fig)fig.style.transform='';}});})();
