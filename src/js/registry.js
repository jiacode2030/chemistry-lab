
/* ---------------- Roster and registries (the data blocks are injected by build.py) ---------------- */
const MODS=@@MODS@@;
const GROUPS=@@GROUPS@@;
const ROADMAP=@@ROADMAP@@; /* every unit, with ids (built) and soon (planned, not built yet) */
const TIPS={},TT={},GLOSS={},KEYS={},PROBS=[],FRQS=[],GLYPH={};
const METHODS={clues:[],items:[]};
Object.keys(MODS).forEach(id=>{const g=ROADMAP.find(g=>g.ids.includes(id)||g.soon.includes(id));MODS[id].ap=g?g.tag:'';MODS[id].w=g?g.w:'';});
const apTag=id=>MODS[id].ap.startsWith('AP')?'ap':'na';

/* ---------------- Small shared helpers ---------------- */
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const rf=(a,b,st)=>+(a+Math.round(Math.random()*((b-a)/st))*st).toFixed(6);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const log10=Math.log10;
function sig(x,n=3){return +(+x).toPrecision(n);}
function ticker(id,fn){let last=0;function loop(ts){if(current===id&&!document.hidden){const dt=last?Math.min(.05,(ts-last)/1000):0;fn(dt);}last=ts;requestAnimationFrame(loop);}requestAnimationFrame(loop);}
function playBtn(id,get,set){const b=$('#'+id);const upd=()=>b.textContent=get()?'Pause':'Play';b.addEventListener('click',()=>{set(!get());upd();});upd();}
function segBind(id,attr,cb){const btns=$$('#'+id+' button');btns.forEach(b=>b.addEventListener('click',()=>{btns.forEach(x=>x.setAttribute('aria-pressed',x===b));cb(b.dataset[attr],b);}));}
function setText(id,v){const el=$('#'+id);if(el)el.textContent=v;}
function setHTML(id,v){const el=$('#'+id);if(el)el.innerHTML=v;}
/* the Coach line of the lab with this id (or the lab containing this element) */
function coachSay(sel,text){const el=typeof sel==='string'?$(sel):sel;const lab=el&&el.closest('.lab');const c=lab&&$('.coach',lab);if(!c)return;c.lastChild.textContent=text;c.classList.add('flash');setTimeout(()=>c.classList.remove('flash'),500);}
/* accept 1.8e-5, 1.8x10^-5, 1.8 × 10⁻⁵, 1,000, −3 */
function parseNum(raw){let s=String(raw).trim();const sup={'⁻':'-','⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
  s=s.replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/g,c=>sup[c]).replace(/[−–]/g,'-').replace(/,/g,'').replace(/\s+/g,'');
  s=s.replace(/^([-+]?[\d.]+)[×x*]10\^?\(?([-+]?\d+)\)?$/i,'$1e$2');
  if(!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s))return NaN;return parseFloat(s);}
/* a problem's answer is right if it is within d.tol (relative, default 2%) or d.abs (absolute) */
function ansOK(x,d){const t=d.abs!=null?d.abs:Math.max((d.tol??.02)*Math.abs(d.ans),d.floor||0);return Math.abs(x-d.ans)<=t;}
