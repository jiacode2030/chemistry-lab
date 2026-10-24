
/* ---------------- Scientific notation & significant figures ---------------- */
(function sigfigs(){
  if(!$('#sf-in'))return;
  /* classify the digits of a number typed as 0.00450, 1200, 1200., 3.00e5, 3.00 x 10^5 */
  function parse(raw){let s=String(raw).trim().replace(/[−–]/g,'-').replace(/,/g,'').replace(/\s+/g,'');let exp=null;
    const m=s.match(/^([-+]?[\d.]+)(?:e|[x×*]10\^?)([-+]?\d+)$/i);if(m){s=m[1];exp=+m[2];}
    if(!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(s))return null;const neg=s[0]==='-';s=s.replace(/^[-+]/,'');
    const dot=s.indexOf('.')>=0;const chars=s.split('');const digits=chars.map((c,i)=>({c,i})).filter(o=>o.c!=='.');
    const firstNZ=digits.findIndex(o=>o.c!=='0');if(firstNZ<0)return {zero:true};
    let lastSig=digits.length-1;if(!dot&&exp===null){while(lastSig>firstNZ&&digits[lastSig].c==='0')lastSig--;}
    const kind=chars.map((c,i)=>{if(c==='.')return 'pt';const k=digits.findIndex(o=>o.i===i);return k<firstNZ?'lead':k>lastSig?'amb':'sig';});
    const sigDigits=digits.slice(firstNZ,lastSig+1).map(o=>o.c).join('');
    const ambiguous=lastSig<digits.length-1;
    /* exponent of the first significant digit */
    const intLen=dot?s.indexOf('.'):s.length;let E=intLen-1-digits[firstNZ].i+(digits[firstNZ].i>intLen?1:0);
    E=(dot&&digits[firstNZ].i>intLen)?-(digits[firstNZ].i-intLen):(intLen-1-digits[firstNZ].i);
    return {chars,kind,n:sigDigits.length,sigDigits,E:E+(exp||0),neg,exp,ambiguous};}
  const sup=n=>String(n).split('').map(c=>SUP[c]).join('');
  const sciStr=p=>`${p.neg?'−':''}${p.sigDigits[0]}${p.sigDigits.length>1?'.'+p.sigDigits.slice(1):''} × 10${sup(p.E)}`;
  function chipHTML(p){const lab={sig:'counts',lead:'place-holder',amb:'unclear',pt:''};let h='';
    p.chars.forEach((c,i)=>{h+=`<span class="chip-d ${p.kind[i]}"><b>${c}</b><small>${lab[p.kind[i]]}</small></span>`;});
    if(p.exp!==null)h+=`<span class="chip-x">× 10${sup(p.exp)}</span>`;return h;}
  /* Lab 1 */
  const inp=$('#sf-in');
  function lab1(){const p=parse(inp.value);const chips=$('#sf-chips');
    if(!p||p.zero){chips.innerHTML='<span class="small">Enter a nonzero number like 0.004050, 1200 or 3.00e5.</span>';setText('sf-n','—');setText('sf-sci','—');setText('sf-why','');return;}
    chips.innerHTML=chipHTML(p);setText('sf-n',p.n);setText('sf-sci',sciStr(p));
    setText('sf-why',p.ambiguous?'The trailing zeros in a number with no decimal point are ambiguous, so they are not counted. Write the number in scientific notation (for example 1.2 × 10³, 1.20 × 10³ or 1.200 × 10³) to say how many you mean.':p.kind.includes('lead')?'The gray digits are leading zeros. They only show where the decimal point is, so they never count.':'Every digit from the first nonzero digit to the end counts. Trailing zeros after a decimal point show that the digit was measured.');}
  inp.addEventListener('input',()=>{$$('#sf-pick button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===inp.value));lab1();});
  $$('#sf-pick button').forEach(b=>b.addEventListener('click',()=>{$$('#sf-pick button').forEach(x=>x.setAttribute('aria-pressed',x===b));inp.value=b.dataset.v;lab1();}));
  lab1();
  /* Lab 2 */
  const decs=p=>{/* decimal places of a plain number string; integers count as 0 */const s=p.chars.join('');const i=s.indexOf('.');return i<0?0:s.length-i-1;};
  function sigRound(x,n){if(x===0)return '0';const s=Math.abs(x)>=1e6||Math.abs(x)<1e-3?null:x.toPrecision(n);if(s&&!/e/.test(s))return s.replace('-','−');return sci(x,n-1);}
  function lab2(){const pa=parse($('#sf-a').value),pb=parse($('#sf-b').value),op=$('#sf-op').value,col=$('#sf-col');
    if(!pa||!pb||pa.zero||pb.zero||pa.exp!==null||pb.exp!==null){col.textContent='Enter two plain nonzero numbers (like 12.11 and 0.023).';['sf-raw','sf-rule','sf-ans'].forEach(i=>setText(i,'—'));return;}
    const a=parseFloat(pa.chars.join(''))*(pa.neg?-1:1),b=parseFloat(pb.chars.join(''))*(pb.neg?-1:1);
    const raw=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:a/b;if(!isFinite(raw)){col.textContent='That is undefined.';return;}
    setText('sf-raw',String(+raw.toPrecision(10)).replace('-','−'));
    if(op==='+'||op==='-'){const da=decs(pa),db=decs(pb),lim=Math.min(da,db);
      const sa=pa.chars.join(''),sb=pb.chars.join('');const iA=sa.indexOf('.')<0?sa.length:sa.indexOf('.'),iB=sb.indexOf('.')<0?sb.length:sb.indexOf('.');
      const left=Math.max(iA,iB),right=Math.max(da,db),W=left+(right?1+right:0);
      const rowOf=(s,iInt,d,label)=>{const pad=' '.repeat(left-iInt);let h='';const full=pad+s+(d===0&&right?' ':'' );let chars=(pad+s).split('');while(chars.length<W)chars.push(' ');
        let k=0;chars.forEach((c,idx)=>{let cls='';const decIdx=idx-left-1;if(decIdx>=lim&&c!==' '&&c!=='.')cls=' unc';h+=`<span class="cd${cls}">${c}</span>`;});return `<span class="row">${h} <span style="color:var(--muted);font-size:12px">${label}</span></span>`;};
      const resStr=(op==='+'?a+b:a-b).toFixed(right);const iR=resStr.indexOf('.')<0?resStr.length:resStr.indexOf('.');
      let rc=(' '.repeat(Math.max(0,left-iR))+resStr).split('');while(rc.length<W)rc.push(' ');
      const rh=rc.map((c,idx)=>{const decIdx=idx-left-1;return `<span class="cd${decIdx>=lim&&c!==' '&&c!=='.'?' unc':''}${decIdx===lim-1||(lim===0&&idx===left-1)?' lim':''}">${c}</span>`;}).join('');
      col.innerHTML=rowOf(sa,iA,da,`${da} decimal place${da===1?'':'s'}`)+rowOf((op==='-'?'−':'')+sb,iB,db,`${db} decimal place${db===1?'':'s'}`)+'<span class="sep"></span>'+`<span class="row">${rh} <span style="color:var(--muted);font-size:12px">orange digits are not trusted</span></span>`;
      const ans=(op==='+'?a+b:a-b).toFixed(lim);setText('sf-rule',`Keep ${lim} decimal place${lim===1?'':'s'} (the fewest)`);setText('sf-ans',ans.replace('-','−'));}
    else{const lim=Math.min(pa.n,pb.n);
      const bar=(p,l)=>`<span class="row">${l.padEnd(14)} ${'●'.repeat(p.n)}${'○'.repeat(Math.max(0,8-p.n))}  ${p.n} sig fig${p.n===1?'':'s'}</span>`;
      col.innerHTML=bar(pa,'first number')+bar(pb,'second number')+'<span class="sep"></span>'+`<span class="row">${'result'.padEnd(14)} ${'●'.repeat(lim)}${'○'.repeat(Math.max(0,8-lim))}  ${lim} sig fig${lim===1?'':'s'} (the fewest)</span>`;
      setText('sf-rule',`Keep ${lim} significant figure${lim===1?'':'s'} (the fewest)`);setText('sf-ans',sigRound(raw,lim));}}
  ['sf-a','sf-b'].forEach(id=>$('#'+id).addEventListener('input',lab2));$('#sf-op').addEventListener('change',lab2);lab2();
  /* Lab 3 */
  const Q=[['Avogadro\'s number (mol⁻¹)',6.022e23],['mass of an electron (kg)',9.109e-31],['speed of light (m/s)',2.998e8],['Kw at 25 °C',1.0e-14],['radius of a hydrogen atom (m)',5.29e-11],['Planck\'s constant (J·s)',6.626e-34]];
  $('#sf-q').innerHTML=Q.map((q,i)=>`<option value="${i}">${q[0]}</option>`).join('');
  function lab3(){const [nm,v]=Q[+$('#sf-q').value],E=Math.floor(Math.log10(v)+1e-12),n=E+(+$('#sf-e').value);
    const digs=String(v.toExponential(3)).split('e')[0].replace('.','').replace(/0+$/,'')||'1';
    let p=1+(E-n),txt;if(p<=0)txt='0.'+'0'.repeat(-p)+digs;else if(p>=digs.length)txt=digs+'0'.repeat(p-digs.length);else txt=digs.slice(0,p)+'.'+digs.slice(p);
    const m=v/10**n,ok=m>=1&&m<10;
    $('#sf-slide').innerHTML=txt.split('').map(c=>`<span class="chip-d ${c==='.'?'pt':'sig'}"><b>${c}</b><small></small></span>`).join('')+`<span class="chip-x">× 10${sup(n)}</span>`;
    setText('sf-w',`${txt} × 10${sup(n)}`);const o=$('#sf-ok');o.textContent=ok?'✓ yes: 1 ≤ mantissa < 10':'✗ no: mantissa is '+(m>=10?'10 or more':'less than 1');o.style.color=ok?'var(--good)':'var(--hot)';
    $('#sf-e-out').textContent='10'+sup(n);}
  $('#sf-q').addEventListener('change',()=>{$('#sf-e').value=0;lab3();});$('#sf-e').addEventListener('input',lab3);lab3();
  TIPS['sf-in']='Green digits count. Gray digits are leading zeros (place-holders). Orange digits are trailing zeros with no decimal point: unclear.';
  TIPS['sf-op']='Switch between the two rules: significant figures for multiply and divide, decimal places for add and subtract.';
  TIPS['sf-e']='Slide the decimal point. The number never changes, only how it is written. The goal is a mantissa between 1 and 10.';
  GLOSS['significant']='Digits you can trust: every certain digit plus the first uncertain one.';
  GLOSS['scientific notation']='A number written as m × 10ⁿ with 1 ≤ m < 10.';
  TT.sigfigs='The two rules are easy to mix up. Give both a picture: significant figures count digits (relative uncertainty), decimal places line up columns (absolute uncertainty). Ask students to find the least precise measurement before calculating.';
})();
(function(){
  const COUNTS=[['0.00520',3],['1.0800',5],['4500.',4],['0.0030',2],['120.0',4],['3.0 × 10⁵',2],['908',3],['0.700',3],['2.50 × 10⁻³',3],['6.0220',5],['10.0',3],['0.0004',1],['5000.',4],['7.00 × 10²',3]];
  PROBS.push({id:'sf-count',topic:'sigfigs',title:'Count the significant figures',gen(){const [s,n]=pick(COUNTS);
    return {q:`How many significant figures are in ${s}?`,ans:n,unit:'sig figs',abs:.01,hint:'Leading zeros never count. Zeros after a decimal point and after a nonzero digit do count. Trailing zeros with no decimal point are not counted.',
      sol:`${s} has <b>${n}</b> significant figure${n===1?'':'s'}.`};}});
  const rnd=(sf)=>{let d=ri(10**(sf-1),10**sf-1);if(d%10===0)d+=1;return d/10**(sf-1)*10**ri(0,1);};
  const txt=(v,sf)=>sf===1?String(v):(()=>{const e=Math.floor(Math.log10(v));return v.toFixed(Math.max(0,sf-1-e));})();
  /* the digits dropped when x is rounded to n sig figs are exactly 5, 50, 500…: a tie, which textbooks round differently, so those are re-drawn */
  const sigTie=(x,n)=>/^50*$/.test(x.toExponential(11).split('e')[0].replace('.','').slice(n));
  PROBS.push({id:'sf-mult',topic:'sigfigs',title:'Multiplying with sig figs',gen(){let s1,s2,a,b,raw,lim;do{s1=ri(2,4);s2=ri(2,4);a=+rnd(s1).toPrecision(s1);b=+rnd(s2).toPrecision(s2);lim=Math.min(s1,s2);raw=a*b;}while(sigTie(raw,lim));const ans=+raw.toPrecision(lim),show=sigRoundTxt(raw,lim);
    const ta=a.toPrecision(s1),tb=b.toPrecision(s2);
    return {q:`Multiply ${ta} × ${tb} and report the answer with the correct number of significant figures.`,ans,sig:lim,show,unit:'',hint:`Count the significant figures in each number. The answer keeps the smaller count. Type it rounded, with exactly that many significant figures (write a trailing decimal point, like 450., if a final zero counts).`,
      sol:`${ta} has ${s1} significant figures and ${tb} has ${s2}. The calculator gives ${+raw.toPrecision(8)}; keep ${lim}: <b>${show}</b>${show.endsWith('.')?' (the decimal point shows that the final zero is significant).':'.'}`};}});
  /* 450 to 3 sig figs is written 450. so the final zero is clearly significant */
  function sigRoundTxt(x,n){const s=x.toPrecision(n);if(/e/.test(s))return sci(x,n-1);return /^\d*0$/.test(s)&&!s.includes('.')?s+'.':s;}
  PROBS.push({id:'sf-add',topic:'sigfigs',title:'Adding with decimal places',gen(){let d1,d2,d3,a,b,c,lim,S;do{d1=ri(0,2);d2=ri(1,3);d3=ri(0,3);a=(ri(100,990)/10**d1).toFixed(d1);b=(ri(1,99)/10**d2+ri(1,30)).toFixed(d2);c=(ri(1,90)/10**d3).toFixed(d3);lim=Math.min(d1,d2,d3);
      /* exact sum in units of 0.001, so a tie (a dropped 5, 50 or 500) is caught and re-drawn */
      S=[a,b,c].reduce((t,v)=>t+Math.round(+v*1000),0);}while(lim<3&&2*(S%10**(3-lim))===10**(3-lim));
    const raw=S/1000,show=raw.toFixed(lim),ans=+show;
    return {q:`Add ${a} + ${b} + ${c} and report the answer with the correct number of decimal places.`,ans,dp:lim,show,unit:'',hint:'Count the decimal places in each number. The sum can have no more than the smallest count. Type it rounded, with exactly that many decimal places.',
      sol:`The numbers have ${d1}, ${d2} and ${d3} decimal places. The sum is ${raw}; keep ${lim}: <b>${show}</b>.`};}});
})();
