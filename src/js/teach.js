
/* ---------------- Quizzes and worked-example steps ---------------- */
$$('.quiz').forEach(q=>{const right=+q.dataset.correct,btns=$$('.opts button',q),fb=$('.fb',q);
  btns.forEach((b,i)=>b.addEventListener('click',()=>{btns.forEach(x=>x.classList.remove('right','wrong'));
    if(i===right){b.classList.add('right');fb.textContent='Correct. '+q.dataset.explain;}else{b.classList.add('wrong');q.misses=(q.misses||0)+1;fb.textContent=q.misses>=2?'Not quite. Here is the idea: '+q.dataset.explain:'Not quite. Think about it once more, then try another answer.';}}));});
$$('.example').forEach(ex=>{const lis=$$('.exsteps li',ex),nx=$('[data-next]',ex),all=$('[data-all]',ex);if(!nx||!all)return;
  const upd=()=>{const shown=lis.filter(l=>!l.hidden).length;if(shown>=lis.length){nx.textContent='All steps shown';nx.disabled=true;all.textContent='Hide steps';}else{nx.disabled=false;nx.textContent=`Show step ${shown+1} of ${lis.length}`;all.textContent='Show all steps';}};
  nx.addEventListener('click',()=>{const h=lis.find(l=>l.hidden);if(h){lis.forEach(l=>{l.classList.remove('new');l.style.animationDelay='';});h.hidden=false;h.classList.add('new');}upd();});
  all.addEventListener('click',()=>{const allShown=lis.every(l=>!l.hidden);lis.forEach((l,i)=>{l.hidden=allShown;l.classList.remove('new');l.style.animationDelay=allShown?'':i*70+'ms';});upd();});upd();});

/* ---------------- "How to read it" keys and Set-it-up buttons ---------------- */
(function guides(){
  Object.entries(KEYS).forEach(([id,[todo,items]])=>{const cv=$('#'+id);if(!cv)return;const d=document.createElement('div');d.className='howto';
    d.innerHTML=`<span class="do">${todo}</span>`+items.map(([c,t,st])=>`<span class="key"><i class="${st||''}" style="--k:var(--${c})"></i>${t}</span>`).join('');(cv.closest('.v3')||cv).before(d);});
  document.addEventListener('click',e=>{const b=e.target.closest('[data-show]');if(!b)return;const acts=JSON.parse(b.dataset.show),sec=b.closest('.view');let first=null;
    acts.forEach(a=>{let el;if(a[0]==='click'){el=$(a[1],sec);el&&el.click();}else{el=$(a[0]);if(!el)return;
      if(el.type==='checkbox'){if(el.checked!==a[1]){el.checked=a[1];el.dispatchEvent(new Event('change',{bubbles:true}));el.dispatchEvent(new Event('input',{bubbles:true}));}}
      else{el.value=a[1];el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));}}first=first||el;});
    const lab=first&&first.closest('.lab');if(lab){const top=lab.getBoundingClientRect().top+scrollY-(innerWidth>900?70:80);scrollTo({top,behavior:REDUCE?'auto':'smooth'});lab.classList.add('flash');setTimeout(()=>lab.classList.remove('flash'),1200);}
    b.textContent='Set up ✓ (open the answer when ready)';setTimeout(()=>b.textContent='Set it up for me',4000);});})();

/* ---------------- Teaching layer: steps, coach, glossary, tips, progress ---------------- */
(function teach(){
  const order=GROUPS.flatMap(g=>g.ids);const done=()=>store('chem-done')||{};
  function setDone(id,v){const d=done(),was=!!d[id];if(v)d[id]=1;else delete d[id];store('chem-done',d);paint();if(v&&!was)celebrate(id);}
  function paint(){const d=done();$$('#nav a').forEach(a=>a.classList.toggle('done',!!d[a.dataset.view]));
    $$('.mod').forEach(m=>m.classList.toggle('done',!!d[(m.getAttribute('href')||'').slice(1)]));
    $$('[data-done-btn]').forEach(b=>{const on=!!d[b.dataset.doneBtn];if(on===b.classList.contains('isdone')&&b.childNodes.length)return;b.classList.toggle('isdone',on);
      b.innerHTML=on?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>Done':'Mark as done';});
    const n=order.filter(k=>d[k]).length;const el=$('#ov-prog');if(el)el.textContent=`${n} of ${order.length} modules done`;
    const rp=$('#rail-prog');if(rp)rp.textContent=`${n} of ${order.length} modules done`;const rm=$('#rail-meter');if(rm)rm.style.setProperty('--p',order.length?n/order.length:0);}
  const _rm=renderMods;renderMods=function(){_rm();paint();};
  order.forEach((id,i)=>{const sec=$('#v-'+id);if(!sec)return;const wrap=$('.wrap',sec),head=$('.head',sec);
    const g=GROUPS.find(g=>g.ids.includes(id));const eb=$('.eyebrow',head);if(eb){const t=document.createElement('span');t.textContent=g.w==='Optional'?'Math toolkit':g.w+' · '+g.name;eb.prepend(t);}
    if(TT[id]){const q=$('.quiz',sec);const tip=document.createElement('div');tip.className='ttip';tip.innerHTML=`<h3>Teaching tip</h3><p>${TT[id]}</p>`;(q||wrap.lastChild).before(tip);}
    const parts=[['.intuit','The idea'],['.assume','What changed'],['.lab','Explore'],['.try','Try this'],['.example','Worked example'],['.oops','Mistakes'],['.prose','Explanation'],['.ttip','Tip'],['.quiz','Check yourself']];
    const found=parts.map(([sel,lab])=>[$(sel,sec),lab]).filter(x=>x[0]).sort((a,b)=>a[0].compareDocumentPosition(b[0])&4?-1:1);
    const bar=document.createElement('nav');bar.className='steps';bar.setAttribute('aria-label','Sections of this module');
    found.forEach(([el,lab],k)=>{el.id=el.id||`${id}-s${k}`;const a=document.createElement('a');a.href='#'+id;a.innerHTML=`<span class="sn">${k+1}</span>${lab}`;a.dataset.target=el.id;
      a.addEventListener('click',e=>{e.preventDefault();const top=$('#'+a.dataset.target).getBoundingClientRect().top+scrollY-(innerWidth>900?64:80);scrollTo({top,behavior:REDUCE?'auto':'smooth'});});bar.appendChild(a);});
    const ind=document.createElement('span');ind.className='ind';ind.setAttribute('aria-hidden','true');bar.prepend(ind);bar.classList.add('has-ind');
    head.after(bar);
    const prev=order[i-1],next=order[i+1]||'practice';const nm=k=>k==='practice'?'Practice set':MODS[k].t;
    const nav=document.createElement('div');nav.className='modnav';
    nav.innerHTML=(prev?`<a href="#${prev}"><span>← Previous</span><strong>${nm(prev)}</strong></a>`:'<div></div>')+`<div class="mid"><button type="button" class="btn" data-done-btn="${id}">Mark as done</button><button type="button" class="btn link rp-link" data-report="${id}">Report an issue</button></div><a class="nx" href="#${next}"><span>Next →</span><strong>${nm(next)}</strong></a>`;
    wrap.appendChild(nav);
    $$('.quiz',sec).forEach(q=>$$('.opts button',q).forEach((b,j)=>b.addEventListener('click',()=>{if(j===+q.dataset.correct)setDone(id,true);})));
  });
  document.addEventListener('click',e=>{const b=e.target.closest('[data-done-btn]');if(b){const id=b.dataset.doneBtn;setDone(id,!done()[id]);if(done()[id])burst(b,18);}});
  stepSync=snap=>{const sec=$('.view:not([hidden])');if(!sec)return;const bar=$('.steps',sec);if(!bar)return;const links=$$('a',bar);if(!links.length)return;let cur=links[0];
    links.forEach(a=>{const el=$('#'+a.dataset.target);if(el&&el.getBoundingClientRect().top<innerHeight*.35)cur=a;});
    const moved=!cur.classList.contains('on');links.forEach(a=>a.classList.toggle('on',a===cur));
    const ind=$('.ind',bar);if(!ind||!cur.offsetWidth)return;if(snap||!ind.style.width)ind.classList.add('snap');
    ind.style.top=cur.offsetTop+'px';ind.style.height=cur.offsetHeight+'px';ind.style.width=cur.offsetWidth+'px';ind.style.transform=`translateX(${cur.offsetLeft}px)`;
    if(ind.classList.contains('snap')){void ind.offsetWidth;ind.classList.remove('snap');}
    if(moved){const L=cur.offsetLeft,R=L+cur.offsetWidth;if(L<bar.scrollLeft||R>bar.scrollLeft+bar.clientWidth)bar.scrollTo({left:Math.max(0,L-16),behavior:REDUCE?'auto':'smooth'});}};
  window.addEventListener('scroll',()=>stepSync(),{passive:true});
  /* Coach line + Reset button on every lab that has controls. Reset also re-presses the starting button of each segmented control. */
  $$('.lab').forEach(lab=>{const inputs=$$('input[type=range],input[type=checkbox],select',lab);const segs=$$('.seg',lab);if(!inputs.length&&!segs.length)return;
    const coach=document.createElement('p');coach.className='coach';coach.setAttribute('aria-live','polite');coach.innerHTML='<b>Coach</b><span>Move any control and I\'ll explain what it changes.</span>';lab.appendChild(coach);
    const tipOf=(k,el)=>{const t=TIPS[k];return typeof t==='function'?t(el):t;};
    let ft;lab.addEventListener('input',e=>{const t=tipOf(e.target.id,e.target);if(!t)return;coach.lastChild.textContent=t;coach.classList.add('flash');clearTimeout(ft);ft=setTimeout(()=>coach.classList.remove('flash'),500);});
    lab.addEventListener('change',e=>{if(e.target.type==='checkbox'||e.target.tagName==='SELECT'){const t=tipOf(e.target.id,e.target);if(t)coach.lastChild.textContent=t;}});
    lab.addEventListener('click',e=>{const b=e.target.closest('.seg button');if(!b)return;const key=(b.parentElement.id||'')+':'+(b.dataset.k||b.dataset.n||b.dataset.t||b.id||b.textContent);const t=tipOf(key,b)||tipOf(b.id,b);if(t){coach.lastChild.textContent=t;coach.classList.add('flash');clearTimeout(ft);ft=setTimeout(()=>coach.classList.remove('flash'),500);}});
    const defs=inputs.map(x=>[x,x.type==='checkbox'?x.checked:x.value]);const segDefs=segs.map(sg=>[sg,$$('button',sg).find(b=>b.getAttribute('aria-pressed')==='true')]);const bar=$('.labbar',lab);
    if(bar&&lab.dataset.reset!=='own'){const r=document.createElement('button');r.type='button';r.className='btn';r.textContent='Reset';r.title='Put every control in this panel back to its starting value';
      r.addEventListener('click',()=>{defs.forEach(([x,v])=>{if(x.type==='checkbox'){if(x.checked!==v){x.checked=v;x.dispatchEvent(new Event('change',{bubbles:true}));}}else if(x.value!==v){x.value=v;x.dispatchEvent(new Event(x.tagName==='SELECT'?'change':'input',{bubbles:true}));}});
        segDefs.forEach(([sg,b])=>{if(b&&b.getAttribute('aria-pressed')!=='true')b.click();});coach.lastChild.textContent='Everything is back to its starting values.';
        lab.dispatchEvent(new CustomEvent('labreset'));});
      let row=bar.lastElementChild&&bar.lastElementChild.classList.contains('row')?bar.lastElementChild:null;if(!row){row=document.createElement('div');row.className='row';const last=bar.lastElementChild;if(last&&last.tagName==='BUTTON')row.appendChild(last);bar.appendChild(row);}row.appendChild(r);}});
  /* glossary pop-ups: the first use of each term in a module becomes a dotted, tappable word */
  const tip=document.createElement('div');tip.id='gtip';tip.hidden=true;document.body.appendChild(tip);
  const terms=Object.keys(GLOSS).sort((a,b)=>b.length-a.length);
  if(terms.length){const re=new RegExp('\\b('+terms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','i');
    $$('.view').forEach(sec=>{const used=new Set();$$('.intuit p, .lede, .prose p, .prose li, .try li > p, .oops li',sec).forEach(box=>{
      const w=document.createTreeWalker(box,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement.closest('.m,a,.gloss,b,summary,sub,sup,button')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
      nodes.forEach(n=>{const m=n.nodeValue.match(re);if(!m)return;const key=m[1].toLowerCase();if(used.has(key))return;used.add(key);
        const after=n.splitText(m.index);after.nodeValue=after.nodeValue.slice(m[1].length);const sp=document.createElement('span');sp.className='gloss';sp.tabIndex=0;sp.textContent=m[1];sp.dataset.term=key;n.after(sp);});});});}
  function show(el){const r=el.getBoundingClientRect();tip.innerHTML=`<b>${el.dataset.term}</b>${GLOSS[el.dataset.term]}`;tip.hidden=false;const tw=tip.offsetWidth,th=tip.offsetHeight;
    let x=clamp(r.left+r.width/2-tw/2,8,innerWidth-tw-8),y=r.top-th-8;if(y<8)y=r.bottom+8;tip.style.left=x+'px';tip.style.top=y+'px';}
  const hide=()=>tip.hidden=true;
  document.addEventListener('pointerover',e=>{const g=e.target.closest&&e.target.closest('.gloss');if(g&&e.pointerType==='mouse')show(g);});
  document.addEventListener('pointerout',e=>{if(e.target.closest&&e.target.closest('.gloss')&&e.pointerType==='mouse')hide();});
  document.addEventListener('focusin',e=>{if(e.target.classList&&e.target.classList.contains('gloss'))show(e.target);});
  document.addEventListener('focusout',e=>{if(e.target.classList&&e.target.classList.contains('gloss'))hide();});
  document.addEventListener('click',e=>{const g=e.target.closest('.gloss');if(g){tip.hidden&&show(g);}else hide();});
  window.addEventListener('scroll',hide,{passive:true});window.addEventListener('hashchange',hide);
  paint();
})();
