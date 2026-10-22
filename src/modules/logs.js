
/* ---------------- Logs & pH math ---------------- */
(function logs(){
  const cv=$('#lg-canvas');if(!cv)return;
  let pH=3;
  /* universal-indicator colours */
  const HUE=[[0,0],[3,18],[5,42],[6,58],[7,125],[8,160],[9,190],[10,222],[11,250],[12,272],[14,290]];
  function hue(p){for(let i=1;i<HUE.length;i++)if(p<=HUE[i][0]){const [a,ha]=HUE[i-1],[b,hb]=HUE[i];return ha+(hb-ha)*(p-a)/(b-a);}return 290;}
  const phCol=(p,l=52)=>`hsl(${hue(p)},78%,${l}%)`;
  const sup=n=>String(n).split('').map(c=>SUP[c]).join('');
  const tubes=[];let hover=-1;
  function bar(ctx,x,y,w,h,col,txt,top){ctx.fillStyle=col;ctx.fillRect(x,y-h,w,h);if(txt)label(ctx,txt,x+w/2,y-h-8,T.ink,'center','bottom',MONO);}
  const sim=sim2d(cv,{h:w=>clamp(w*.66,330,430),drag:(k,e)=>{if(k==='up')return;const [x]=ptr(e,cv);let best=0,bd=1e9;tubes.forEach((t,i)=>{const d=Math.abs(t-x);if(d<bd){bd=d;best=i;}});if(k==='down'||e.buttons){const el=$('#lg-ph');el.value=best;el.dispatchEvent(new Event('input',{bubbles:true}));}},
    draw(ctx,w,h,t){const n=15,gap=w/n;tubes.length=0;const sel=Math.round(pH);const wob=Math.sin(t*3)*2;
      for(let i=0;i<n;i++){const cx=gap*(i+.5);tubes.push(cx);const on=i===sel,tw=Math.min(24,gap*.6),th=84,y0=18+(on?-8:0);
        ctx.save();ctx.translate(cx,y0);ctx.beginPath();ctx.roundRect(-tw/2,0,tw,th,[2,2,tw/2,tw/2]);ctx.fillStyle=T.surface;ctx.fill();
        ctx.save();ctx.clip();ctx.fillStyle=phCol(i);const lv=th*.78;ctx.fillRect(-tw/2,th-lv+(on?wob*.4:0),tw,lv);
        ctx.fillStyle='rgba(255,255,255,.28)';ctx.fillRect(-tw/2+3,th-lv,3,lv);ctx.restore();
        ctx.lineWidth=on?2.5:1.3;ctx.strokeStyle=on?T.ink:T.muted;ctx.stroke();ctx.restore();
        label(ctx,String(i),cx,y0+th+14,on?T.ink:T.muted,'center','middle',on?'700 13px "IBM Plex Mono",monospace':MONO);}
      /* marker at the exact pH on the strip below the tubes */
      const mx=gap*(pH+.5);ctx.fillStyle=T.ink;ctx.beginPath();ctx.moveTo(mx,134);ctx.lineTo(mx-6,144);ctx.lineTo(mx+6,144);ctx.fill();
      label(ctx,'acidic',gap*.5,152,T.cx,'left','top',MONO);label(ctx,'neutral',gap*7.5,152,T.cv,'center','top',MONO);label(ctx,'basic',w-gap*.5,152,T.ca,'right','top',MONO);
      /* two charts of [H+] */
      const top=210,bot=h-22,H=bot-top,half=w/2;const hc=10**-pH,hn=1e-7;
      label(ctx,'Linear scale: [H⁺] in M',16,top-18,T.ink,'left','middle',LABEL);label(ctx,'Log scale: pH',half+16,top-18,T.ink,'left','middle',LABEL);
      ctx.strokeStyle=T.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(40,bot+.5);ctx.lineTo(half-16,bot+.5);ctx.moveTo(half+40,bot+.5);ctx.lineTo(w-16,bot+.5);ctx.stroke();
      const bw=Math.min(54,(half-90)/3);
      [[pH,hc,'this solution',T.cx],[7,hn,'pure water',T.cv]].forEach(([p,v,nm,col],k)=>{
        const lx=60+k*(bw+34),hl=Math.max(0,v*H);ctx.fillStyle=col;ctx.fillRect(lx,bot-Math.max(hl,1.2),bw,Math.max(hl,1.2));
        label(ctx,sci(v,2).replace(' × ','×'),lx+bw/2,bot-Math.max(hl,1.2)-6,T.ink,'center','bottom',MONO);label(ctx,nm,lx+bw/2,bot+11,T.muted,'center','top',MONO);
        const gx=half+60+k*(bw+34),gh=Math.max(1.2,(14-p)/14*H);ctx.fillStyle=col;ctx.fillRect(gx,bot-gh,bw,gh);label(ctx,'pH '+(k?'7':pH.toFixed(1)),gx+bw/2,bot-gh-6,T.ink,'center','bottom',MONO);label(ctx,nm,gx+bw/2,bot+11,T.muted,'center','top',MONO);});
      if(hc*H<3)label(ctx,'too small to see!',60+bw+8+bw/2,bot-26,T.hot,'center','bottom',MONO);
      ctx.fillStyle=T.muted;ctx.font=MONO;ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText('1 M',half-30,top+2);ctx.fillText('14',w-6,top+2);ctx.fillText('0',w-6,bot-2);
    }});
  drawers.logs=()=>sim.render();
  bindRange('lg-ph',x=>x.toFixed(1),x=>{pH=x;const h=10**-x,oh=10**(x-14);setText('lg-h',sci(h,2));setText('lg-oh',sci(oh,2));setText('lg-poh',(14-x).toFixed(1));
    const r=10**(7-x);setText('lg-vs',Math.abs(x-7)<.05?'neutral':x<7?`${r>=1e5?sci(r,1):fmt(r,r<10?1:0)}× more H⁺`:`${(1/r)>=1e5?sci(1/r,1):fmt(1/r,1/r<10?1:0)}× less H⁺`);sim.render();});
  /* converter */
  function conv(){const hRaw=$('#lg-in-h').value,p=parseNum(hRaw),s1=$('#lg-s1'),s2=$('#lg-s2');
    if(isFinite(p)&&p>0){const ph=-Math.log10(p);const m=String(hRaw).replace(/[^0-9.e+\-×x^]/gi,'');const sf=((String(hRaw).match(/^[-+]?[\d.]+/)||[''])[0].replace(/^0*\.?0*/,'').replace('.','')||'1').length;
      s1.innerHTML=`−log(${sci(p,Math.max(1,sf-1))}) = ${ph.toFixed(3)}<br>→ <b>pH = ${ph.toFixed(Math.max(1,sf))}</b> (${sf} sig fig${sf===1?'':'s'} → ${sf} decimal place${sf===1?'':'s'})`;}else s1.textContent='Enter a positive concentration like 3.2e-4.';
    const q=parseFloat($('#lg-in-ph').value);if(isFinite(q)){const dec=(($('#lg-in-ph').value.split('.')[1])||'').length||1;s2.innerHTML=`10<sup>−${q}</sup> = ${sci(10**-q,6)}<br>→ <b>[H⁺] = ${sci(10**-q,Math.max(1,dec))} M</b> (${dec} decimal place${dec===1?'':'s'} → ${dec} sig fig${dec===1?'':'s'})`;}else s2.textContent='Enter a pH like 4.37.';}
  ['lg-in-h','lg-in-ph'].forEach(id=>$('#'+id).addEventListener('input',conv));conv();
  TIPS['lg-ph']=el=>{const p=+el.value;return p<7?`pH ${p.toFixed(1)}: more H⁺ than pure water. Each unit lower means ten times more H⁺.`:p>7?`pH ${p.toFixed(1)}: less H⁺ than pure water, more OH⁻. Each unit higher means ten times less H⁺.`:'pH 7: [H⁺] = [OH⁻] = 1.0 × 10⁻⁷ M. Neutral.';};
  TIPS['lg-in-h']='The number of digits you type sets the number of decimal places in the pH.';
  KEYS['lg-canvas']=['Tap a tube or slide the pH. Compare the two bar charts.',[['cx','this solution'],['cv','pure water (pH 7)']]];
  GLOSS['logarithm']='The power you raise 10 to get the number: log 1000 = 3.';
  GLOSS['poh']='−log[OH⁻]. pH + pOH = 14.00 at 25 °C.';
  TT.logs='Let students push 10^x and log on the calculator back and forth until the inverse relationship feels natural. Ask for an estimate (between which two whole pH numbers?) before pressing keys.';
})();
(function(){
  PROBS.push({id:'logs-ph',topic:'logs',title:'pH from [H⁺]',gen(){const a=ri(11,98)/10,n=ri(2,11),h=a*10**-n,ans=-Math.log10(h);
    return {q:`A solution has [H⁺] = ${sci(h,1)} M. What is its pH?`,ans,unit:'',abs:.02,hint:'pH = −log[H⁺]. Split the log: log(a × 10⁻ⁿ) = log a − n.',
      sol:`pH = −log(${sci(h,1)}) = −(log ${a} − ${n}) = −(${Math.log10(a).toFixed(3)} − ${n}) = <b>${ans.toFixed(2)}</b>.`};}});
  PROBS.push({id:'logs-h',topic:'logs',title:'[H⁺] from pH',gen(){const pH=ri(150,1250)/100,ans=10**-pH;
    return {q:`A solution has pH = ${pH.toFixed(2)}. What is [H⁺] in mol/L? (Scientific notation is fine: 4.3e-5.)`,ans,unit:'M',tol:.03,hint:'[H⁺] = 10^(−pH). Use the 10ˣ key on your calculator.',
      sol:`[H⁺] = 10<sup>−${pH.toFixed(2)}</sup> = <b>${sci(ans,2)} M</b>.`};}});
  PROBS.push({id:'logs-ratio',topic:'logs',title:'How many times more acidic?',gen(){const a=ri(1,9),d=ri(1,5),b=a+d,ans=10**d;
    return {q:`How many times greater is [H⁺] in a solution of pH ${a} than in a solution of pH ${b}?`,ans,unit:'times',hint:'Each pH unit is a factor of 10. Count the steps.',
      sol:`The difference is ${b} − ${a} = ${d} pH units, so [H⁺] differs by 10<sup>${d}</sup> = <b>${ans.toLocaleString('en-US')}</b>.`};}});
})();
