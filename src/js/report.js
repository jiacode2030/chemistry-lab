
/* ---------------- Report an issue: opens a pre-filled GitHub issue (no server needed) ---------------- */
(function report(){
  const dlg=$('#rp'),form=$('#rp-form'),where=$('#rp-where'),type=$('#rp-type'),det=$('#rp-details'),ctxEl=$('#rp-ctx'),msg=$('#rp-msg');
  const REPO='https://github.com/jiacode2030/ap-labs-feedback';
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

/* Analytics: GoatCounter, shared with every AP Labs site. Anonymous, no cookies, no personal data.
   Loads only on the public GitHub Pages site, and counts each module view as its own page. */
(function analytics(){if(!/\.github\.io$/.test(location.hostname))return;
  /* honor Do Not Track and Global Privacy Control: no counter at all */
  if(navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true)return;window.goatcounter={no_onload:true};
  const s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.dataset.goatcounter='https://aplabs.goatcounter.com/count';
  const view=()=>{const id=(location.hash||'').slice(1)||'overview';if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count({path:location.pathname.replace(/\/$/,'')+'/'+id,title:id});};
  s.onload=()=>{view();addEventListener('hashchange',view);};document.head.appendChild(s);})();
