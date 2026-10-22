const VIEWS=['overview',...GROUPS.flatMap(g=>g.ids),'practice','frq','methods','exam','review'];
/* one highlight slides to the current module in the side nav */
function navSync(snap){const nav=$('#nav'),a=$('#nav a[aria-current="page"]');let ind=$('.ind',nav);
  if(!ind){ind=document.createElement('span');ind.className='ind';ind.setAttribute('aria-hidden','true');nav.prepend(ind);nav.classList.add('has-ind');snap=true;}
  if(!a||!a.offsetHeight){ind.style.opacity=0;return;}ind.style.opacity=1;if(snap)ind.classList.add('snap');
  ind.style.height=a.offsetHeight+'px';ind.style.transform=`translateY(${a.offsetTop}px)`;if(snap){void ind.offsetWidth;ind.classList.remove('snap');}
  const rail=$('.rail'),rr=rail.getBoundingClientRect(),ar=a.getBoundingClientRect();if(ar.top<rr.top+60||ar.bottom>rr.bottom-20)rail.scrollBy({top:ar.top-rr.top-rr.height/3,behavior:REDUCE?'auto':'smooth'});}
function route(){let id=(location.hash||'').slice(1);if(!VIEWS.includes(id))id='overview';const changed=id!==current,first=!current,back=VIEWS.indexOf(id)<VIEWS.indexOf(current);
  const apply=()=>{current=id;
    $$('.view').forEach(v=>v.hidden=v.id!=='v-'+id);$('#navsel').value=id;
    $$('.nav a').forEach(a=>{const on=a.dataset.view===id;a.setAttribute('aria-current',on?'page':'false');if(on&&a.scrollIntoView&&window.innerWidth<=900)a.scrollIntoView({block:'nearest',inline:'center'});});
    if(changed)window.scrollTo(0,0);redraw();navSync(first);stepSync(true);armReveal();};
  if(!changed||first||REDUCE){apply();return;}
  apply();const v=$('#v-'+id);v.classList.remove('enter','back');void v.offsetWidth;v.classList.add('enter');v.classList.toggle('back',back);}
window.addEventListener('hashchange',route);
let rz;new ResizeObserver(()=>{cancelAnimationFrame(rz);rz=requestAnimationFrame(()=>{redraw();navSync(true);stepSync(true);});}).observe(document.querySelector('main'));
/* ---------------- Report an issue ----------------
   Reports are saved to the artifact's db at reports/<viewer id>/items. Only the owner can read them.
