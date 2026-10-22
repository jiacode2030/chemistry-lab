(function exam(){const box=$('#ex-weeks');let N=10,timed=false,timer=null,cards=[];
  GROUPS.forEach((g,i)=>{const b=document.createElement('button');b.type='button';b.dataset.i=i;b.setAttribute('aria-pressed','false');b.textContent=g.w==='Optional'?'Math toolkit':g.w;b.title=g.name;b.addEventListener('click',()=>b.setAttribute('aria-pressed',String(b.getAttribute('aria-pressed')!=='true')));box.appendChild(b);});
  segBind('ex-n','n',v=>N=+v);segBind('ex-t','t',v=>timed=v==='on');
  $('#ex-all').addEventListener('click',()=>$$('#ex-weeks button').forEach(b=>b.setAttribute('aria-pressed','true')));
  $('#ex-none').addEventListener('click',()=>$$('#ex-weeks button').forEach(b=>b.setAttribute('aria-pressed','false')));
  function start(){const sel=$$('#ex-weeks button').filter(b=>b.getAttribute('aria-pressed')==='true').map(b=>GROUPS[+b.dataset.i]),msg=$('#ex-msg');
    if(!sel.length){msg.textContent='Pick at least one unit first.';return;}
    const ids=new Set(sel.flatMap(g=>g.ids));let pool=PROBS.filter(p=>ids.has(p.topic));if(!pool.length){msg.textContent='No practice problems in those units yet. Add another unit.';return;}
    pool=pool.map(p=>[Math.random(),p]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]).slice(0,N);msg.textContent=pool.length<N?`Only ${pool.length} problems exist for those units, so the set has ${pool.length}.`:'';
    const list=$('#ex-list');list.innerHTML='';cards=pool.map((p,i)=>{const c=probCard(p,{mode:'exam',badge:`<span class="tag ap">Q${i+1}</span>`});list.appendChild(c);return c;});
    $('#ex-run').hidden=false;$('#ex-result').hidden=true;$('#ex-submit').hidden=false;$('#ex-setup').hidden=true;clearInterval(timer);const tEl=$('#ex-timer');
    if(timed){let left=pool.length*90;const tick=()=>{tEl.textContent=`Time left ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;if(left--<=0)finish();};tick();timer=setInterval(tick,1000);}else tEl.textContent=`${pool.length} problems · untimed`;
    scrollTo({top:$('#ex-run').getBoundingClientRect().top+scrollY-80,behavior:REDUCE?'auto':'smooth'});}
  function finish(){clearInterval(timer);if(!cards.length)return;let right=0;const by={};
    cards.forEach(c=>{const ok=c.grade(),t=PROBS.find(p=>p.id===c.pid).topic;if(ok)right++;else reviewMiss(c.pid);by[t]=by[t]||[0,0];by[t][1]++;if(ok)by[t][0]++;});
    $('#ex-submit').hidden=true;$('#ex-timer').textContent=`Graded: ${right} of ${cards.length}`;const r=$('#ex-result');r.hidden=false;
    r.innerHTML=`<h2>${right} of ${cards.length} correct (${Math.round(100*right/cards.length)}%)</h2><p class="small" style="margin:0">Each problem now shows the answer and a full solution. Missed problems were added to <a href="#review">Review my mistakes</a> with new numbers.</p><div class="tablewrap"><table style="min-width:0"><thead><tr><th>Topic</th><th>Score</th><th></th></tr></thead><tbody>`+
      Object.entries(by).sort((a,b)=>a[1][0]/a[1][1]-b[1][0]/b[1][1]).map(([t,[a,n]])=>`<tr><td>${MODS[t].t}</td><td>${a}/${n}</td><td>${a<n?`<a href="#${t}">Revisit this module</a>`:'✓'}</td></tr>`).join('')+`</tbody></table></div><div class="row"><button type="button" class="btn primary" id="ex-again">Build another set</button></div>`;
    $('#ex-again').addEventListener('click',()=>{$('#ex-setup').hidden=false;$('#ex-run').hidden=true;cards=[];scrollTo(0,0);});cards=[];
    r.scrollIntoView({behavior:REDUCE?'auto':'smooth',block:'start'});}
  $('#ex-start').addEventListener('click',start);$('#ex-submit').addEventListener('click',finish);})();
(function review(){function render(all){const r=reviewGet(),now=Date.now(),list=$('#rv-list');list.innerHTML='';const ids=Object.keys(r).filter(id=>PROBS.some(p=>p.id===id));
    const dueIds=ids.filter(id=>r[id].due<=now),later=ids.filter(id=>r[id].due>now),show=all?ids:dueIds;
    setText('rv-stats',ids.length?`${dueIds.length} due now · ${later.length} scheduled later`:'Your queue is empty');
    if(!show.length){list.innerHTML=`<p class="small" style="margin:0">${ids.length?'Nothing due right now. Next review: '+new Date(Math.min(...later.map(id=>r[id].due))).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'})+'.':'Nothing to review yet. Problems you miss in the <a href="#practice">practice set</a> or <a href="#exam">exam review</a> will show up here.'}</p>`;return;}
    show.forEach(id=>{const p=PROBS.find(q=>q.id===id),e=r[id];const c=probCard(p,{mode:'review',badge:`<span class="tag calc">missed ${e.n}×</span><span class="tag">${e.streak} of 3 reviews done</span>`,
      onRight:el=>{const res=reviewHit(id);$('.done',el).textContent=res==='mastered'?'Mastered ✓':typeof res==='number'?`Next review in ${[1,3,7][res-1]} day${res>1?'s':''}`:'';},onWrong:()=>reviewMiss(id)});list.appendChild(c);});}
  const go=()=>{if(location.hash==='#review')render(false);};window.addEventListener('hashchange',go);$('#rv-all').addEventListener('click',()=>render(true));go();reviewBadge();})();
/* ---------------- Router, resize, theme ---------------- */
