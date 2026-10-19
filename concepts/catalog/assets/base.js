/* Shared helpers for the variant catalog: design switcher, picks, counters and six pointer-reactive canvas backgrounds. */
(function(){
  const root=document.documentElement;
  const KEY='lohaza-design',PKEY='lohaza-picks';
  const store={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(_){return d;}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}}
  };
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function defaultDesign(){
    const t=root.getAttribute('data-theme');
    if(t==='dark')return 'b';
    if(t==='light')return 'a';
    return matchMedia('(prefers-color-scheme: dark)').matches?'b':'a';
  }
  root.setAttribute('data-design',store.get(KEY,null)||defaultDesign());

  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const fmt=n=>Math.round(n).toLocaleString('uk-UA');
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const wait=ms=>new Promise(r=>setTimeout(r,RM?Math.min(ms,60):ms));
  const DESIGNS=[['a','Світлий'],['b','Pro'],['c','Скло']];

  function setDesign(d){
    root.setAttribute('data-design',d);store.set(KEY,d);
    $$('[data-set-design]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.setDesign===d)));
    document.dispatchEvent(new CustomEvent('designchange',{detail:d}));
  }
  function designSeg(){
    const cur=root.getAttribute('data-design');
    return `<div class="seg" role="group" aria-label="Дизайн-напрям">${DESIGNS.map(([k,n])=>`<button type="button" data-set-design="${k}" aria-pressed="${k===cur}">${n}</button>`).join('')}</div>`;
  }
  function tween(el,to,o={}){
    const from=o.from!=null?o.from:(+el.dataset.v||0),dur=RM?1:(o.dur||600),suf=o.suffix||'',pre=o.prefix||'',f=o.format||fmt;
    el.dataset.v=to;const t0=performance.now();
    const step=now=>{const k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=pre+f(from+(to-from)*e)+suf;if(k<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  }
  function onView(el,cb,th=.35){
    if(!('IntersectionObserver' in window)){cb();return;}
    const io=new IntersectionObserver(es=>{if(es[0].isIntersecting){io.disconnect();cb();}},{threshold:th});io.observe(el);
  }
  function initPicks(){
    const picks=store.get(PKEY,{});
    $$('.variant').forEach(v=>{
      const b=$('.pick',v);if(!b)return;
      const key=v.dataset.key,letter=v.dataset.variant;
      const sync=()=>{const on=store.get(PKEY,{})[key]===letter;b.setAttribute('aria-pressed',String(on));b.textContent=on?'Обрано':'Обрати цей';};
      sync();
      b.addEventListener('click',()=>{const p=store.get(PKEY,{});if(p[key]===letter)delete p[key];else p[key]=letter;store.set(PKEY,p);$$('.variant').forEach(x=>{const bb=$('.pick',x);if(bb&&x.dataset.key===key){const on=p[key]===x.dataset.variant;bb.setAttribute('aria-pressed',String(on));bb.textContent=on?'Обрано':'Обрати цей';}});});
    });
    return picks;
  }
  function injectBar(){
    const title=document.body.dataset.title;
    if(!title)return;
    const bar=document.createElement('div');bar.className='bar';
    bar.innerHTML=`<div class="wrap bar-in"><div class="bar-l">${document.body.dataset.hub?'':'<a class="back" href="./">‹ Усі секції</a>'}<b>${esc(title)}</b></div>${designSeg()}</div>`;
    document.body.prepend(bar);
  }
  document.addEventListener('click',e=>{const b=e.target.closest('[data-set-design]');if(b)setDesign(b.dataset.setDesign);});

  /* ---------- canvas backgrounds ---------- */
  function colors(){
    const cs=getComputedStyle(root),g=n=>cs.getPropertyValue(n).trim();
    return{accent:g('--accent'),ink:g('--ink'),muted:g('--muted'),line:g('--line'),good:g('--good'),warn:g('--warn'),bg:g('--bg'),dark:root.getAttribute('data-design')==='b'};
  }
  const TAU=Math.PI*2;
  const BG={
    dots:{
      name:'Магнітна сітка',
      init(W,H){const s=26,pts=[];for(let y=s/2;y<H;y+=s)for(let x=s/2;x<W;x+=s)pts.push([x,y]);return{pts};},
      frame(ctx,W,H,st,m,t,C){
        ctx.clearRect(0,0,W,H);const R=160;
        for(const[x,y]of st.pts){
          const dx=m.x-x,dy=m.y-y,d=Math.hypot(dx,dy);let k=d<R?1-d/R:0;k*=k;
          const px=x+dx*k*.24,py=y+dy*k*.24+Math.sin(t*1.3+x*.02+y*.015)*.7;
          ctx.globalAlpha=k>.02?.35+k*.65:.3;ctx.fillStyle=k>.02?C.accent:C.muted;
          ctx.beginPath();ctx.arc(px,py,1.1+k*2.8,0,TAU);ctx.fill();
        }
        ctx.globalAlpha=1;
      }
    },
    network:{
      name:'Мережа агентів',
      init(W,H){const n=Math.round(Math.max(24,Math.min(90,W*H/9000))),ns=[];for(let i=0;i<n;i++)ns.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35});return{ns};},
      frame(ctx,W,H,st,m,t,C){
        ctx.clearRect(0,0,W,H);const ns=st.ns,L=115,R=180;
        for(const p of ns){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;}
        ctx.strokeStyle=C.muted;ctx.lineWidth=1;
        for(let i=0;i<ns.length;i++)for(let j=i+1;j<ns.length;j++){const a=ns[i],b=ns[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<L){ctx.globalAlpha=(1-d/L)*.22;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}}
        ctx.strokeStyle=C.accent;ctx.fillStyle=C.accent;
        for(const p of ns){const d=Math.hypot(p.x-m.x,p.y-m.y);if(d<R){const k=1-d/R;ctx.globalAlpha=k*.75;ctx.lineWidth=.8+k*1.2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(m.x,m.y);ctx.stroke();const ph=(t*.7+p.x*.013)%1;ctx.beginPath();ctx.arc(p.x+(m.x-p.x)*ph,p.y+(m.y-p.y)*ph,1.7,0,TAU);ctx.fill();}}
        for(const p of ns){const d=Math.hypot(p.x-m.x,p.y-m.y),k=d<R?1-d/R:0;ctx.globalAlpha=.45+k*.55;ctx.fillStyle=k>0?C.accent:C.muted;ctx.beginPath();ctx.arc(p.x,p.y,1.8+k*2.2,0,TAU);ctx.fill();}
        ctx.globalAlpha=1;ctx.fillStyle=C.accent;ctx.beginPath();ctx.arc(m.x,m.y,3.5,0,TAU);ctx.fill();
      }
    },
    flow:{
      name:'Потік даних',
      init(W,H){const n=Math.round(Math.max(80,Math.min(420,W*H/2600))),ps=[];for(let i=0;i<n;i++)ps.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*.9});return{ps};},
      frame(ctx,W,H,st,m,t,C){
        ctx.clearRect(0,0,W,H);const R=130;const near=new Path2D(),far=new Path2D();
        for(const p of st.ps){
          let vx=1+p.s,vy=Math.sin(p.y*.012+t*.6+p.x*.004)*.55;
          const dx=p.x-m.x,dy=p.y-m.y,d=Math.hypot(dx,dy)||1;let hot=false;
          if(d<R){const f=(1-d/R)*2.4;vx+=dx/d*f;vy+=dy/d*f;hot=true;}
          p.x+=vx;p.y+=vy;
          if(p.x>W+12||p.y<-12||p.y>H+12){p.x=-12;p.y=Math.random()*H;}
          if(p.x<-14)p.x=-12;
          const path=hot?near:far;path.moveTo(p.x-vx*5,p.y-vy*5);path.lineTo(p.x,p.y);
        }
        ctx.lineCap='round';ctx.lineWidth=1.4;
        ctx.globalAlpha=.3;ctx.strokeStyle=C.muted;ctx.stroke(far);
        ctx.globalAlpha=.9;ctx.strokeStyle=C.accent;ctx.lineWidth=1.8;ctx.stroke(near);
        ctx.globalAlpha=1;
      }
    },
    spotlight:{
      name:'Прожектор-креслення',
      init(W,H,C,prev,dpr){
        const off=document.createElement('canvas'),spot=document.createElement('canvas');
        for(const c of[off,spot]){c.width=Math.round(W*dpr);c.height=Math.round(H*dpr);}
        const o=off.getContext('2d');o.setTransform(dpr,0,0,dpr,0,0);
        o.strokeStyle=C.accent;o.fillStyle=C.accent;o.lineWidth=1;
        o.globalAlpha=.35;for(let x=0;x<W;x+=40){o.beginPath();o.moveTo(x+.5,0);o.lineTo(x+.5,H);o.stroke();}for(let y=0;y<H;y+=40){o.beginPath();o.moveTo(0,y+.5);o.lineTo(W,y+.5);o.stroke();}
        const labels=['Тригер','AI-агент','HubSpot','Перевірка','Telegram','Звіт','Excel → API','Рахунок','Людина ✓','CRM'];
        const cols=Math.max(3,Math.floor(W/200)),rows=Math.max(2,Math.floor(H/120)),cw=W/cols,rh=H/rows;let li=0;const nodes=[];
        for(let c=0;c<cols;c++)for(let r=0;r<rows;r++){if(((c*7+r*3)%4)===0)continue;nodes.push({x:c*cw+cw*.18,y:r*rh+rh*.35,c,r});}
        o.globalAlpha=.9;o.lineWidth=1.4;
        for(const n of nodes){const nx=nodes.find(k=>k.c===n.c+1&&Math.abs(k.r-n.r)<=1);if(nx){o.beginPath();o.moveTo(n.x+120,n.y+16);o.bezierCurveTo(n.x+150,n.y+16,nx.x-30,nx.y+16,nx.x,nx.y+16);o.stroke();}}
        o.font='500 12px "JetBrains Mono", monospace';
        for(const n of nodes){o.globalAlpha=.9;o.beginPath();if(o.roundRect)o.roundRect(n.x,n.y,120,32,9);else o.rect(n.x,n.y,120,32);o.stroke();o.globalAlpha=.8;o.fillText(labels[li++%labels.length],n.x+12,n.y+20);}
        return{off,spot};
      },
      frame(ctx,W,H,st,m,t,C){
        ctx.clearRect(0,0,W,H);
        ctx.globalAlpha=.07;ctx.drawImage(st.off,0,0,W,H);ctx.globalAlpha=1;
        const s=st.spot.getContext('2d');s.setTransform(1,0,0,1,0,0);s.globalCompositeOperation='source-over';s.clearRect(0,0,st.spot.width,st.spot.height);
        s.drawImage(st.off,0,0);
        const sx=st.spot.width/W,R=220*sx,g=s.createRadialGradient(m.x*sx,m.y*sx,0,m.x*sx,m.y*sx,R);
        g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.55,'rgba(0,0,0,.6)');g.addColorStop(1,'rgba(0,0,0,0)');
        s.globalCompositeOperation='destination-in';s.fillStyle=g;s.fillRect(0,0,st.spot.width,st.spot.height);s.globalCompositeOperation='source-over';
        ctx.drawImage(st.spot,0,0,W,H);
        const gl=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,260);gl.addColorStop(0,C.accent);gl.addColorStop(1,'rgba(0,0,0,0)');
        ctx.globalAlpha=.1;ctx.fillStyle=gl;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;
      }
    },
    order:{
      name:'Хаос → порядок',
      init(W,H){const s=30,ps=[];for(let y=s;y<H-s/2;y+=s)for(let x=s;x<W-s/2;x+=s)ps.push({hx:x,hy:y,cx:Math.random()*W,cy:Math.random()*H,ph:Math.random()*TAU,s:0});return{ps};},
      frame(ctx,W,H,st,m,t,C){
        ctx.clearRect(0,0,W,H);const R=210;const ordered=new Path2D(),loose=new Path2D();
        for(const p of st.ps){
          const d=Math.hypot(p.hx-m.x,p.hy-m.y),k=Math.max(0,1-d/R);p.s+=(k-p.s)*.07;
          const e=p.s*p.s*(3-2*p.s);
          const cx=p.cx+Math.sin(t*.5+p.ph)*22,cy=p.cy+Math.cos(t*.42+p.ph*1.3)*22;
          const x=cx+(p.hx-cx)*e,y=cy+(p.hy-cy)*e;
          if(e>.5){ordered.rect(x-2,y-2,4,4);}else{loose.moveTo(x+1.6,y);loose.arc(x,y,1.6,0,TAU);}
        }
        ctx.globalAlpha=.35;ctx.fillStyle=C.muted;ctx.fill(loose);
        ctx.globalAlpha=.95;ctx.fillStyle=C.accent;ctx.fill(ordered);ctx.globalAlpha=1;
      }
    },
    aurora:{
      name:'Аврора',
      init(W,H,C){return{b:[{x:W*.3,y:H*.4,k:.05,c:'accent',o:[-.18,-.1]},{x:W*.7,y:H*.6,k:.03,c:'good',o:[.2,.12]},{x:W*.5,y:H*.3,k:.018,c:'warn',o:[.05,-.22]}]};},
      frame(ctx,W,H,st,m,t,C){
        ctx.clearRect(0,0,W,H);const R=Math.max(W,H)*.42;
        ctx.globalCompositeOperation=C.dark?'lighter':'source-over';
        for(const b of st.b){
          const tx=m.x+b.o[0]*W+Math.sin(t*.3+b.k*90)*40,ty=m.y+b.o[1]*H+Math.cos(t*.25+b.k*60)*40;
          b.x+=(tx-b.x)*b.k;b.y+=(ty-b.y)*b.k;
          const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,R);g.addColorStop(0,C[b.c]);g.addColorStop(1,'rgba(0,0,0,0)');
          ctx.globalAlpha=C.dark?.32:.22;ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
        }
        ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
      }
    }
  };
  function bg(canvas,type){
    const host=canvas.parentElement,ctx=canvas.getContext('2d');
    let W=1,H=1,dpr=1,C=colors(),st=null,running=false,visible=false,raf=0,impl=BG[type];
    const t0=performance.now(),mouse={x:0,y:0,on:false,tm:0},cur={x:0,y:0,init:false};
    function target(t){
      if(mouse.on)return mouse;
      return{x:W*(.5+.33*Math.sin(t*.42)),y:H*(.5+.3*Math.sin(t*.67+1))};
    }
    function draw(now){
      const t=(now-t0)/1000,tg=target(t);
      if(!cur.init){cur.x=tg.x;cur.y=tg.y;cur.init=true;}
      cur.x+=(tg.x-cur.x)*.14;cur.y+=(tg.y-cur.y)*.14;
      impl.frame(ctx,W,H,st,cur,t,C);
    }
    function loop(now){if(!running)return;draw(now);raf=requestAnimationFrame(loop);}
    function start(){if(running||RM)return;running=true;raf=requestAnimationFrame(loop);}
    function stop(){running=false;cancelAnimationFrame(raf);}
    function rebuild(){st=impl.init(W,H,C,st,dpr);if(RM||!running){cur.init=false;draw(performance.now());}}
    function resize(){
      const r=host.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);
      W=Math.max(1,r.width);H=Math.max(1,r.height);
      canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);rebuild();
    }
    host.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;mouse.on=true;clearTimeout(mouse.tm);mouse.tm=setTimeout(()=>{mouse.on=false;},2200);},{passive:true});
    host.addEventListener('pointerleave',()=>{mouse.on=false;});
    if('ResizeObserver' in window)new ResizeObserver(resize).observe(host);else addEventListener('resize',resize);
    if('IntersectionObserver' in window)new IntersectionObserver(es=>{visible=es[0].isIntersecting;visible?start():stop();}).observe(host);else start();
    document.addEventListener('designchange',()=>{C=colors();rebuild();});
    resize();
    return{set(type2){impl=BG[type2];rebuild();}};
  }

  window.UI={$,$$,fmt,esc,wait,RM,tween,onView,store,bg,BG,setDesign,PKEY,KEY,DESIGNS};
  document.addEventListener('DOMContentLoaded',()=>{
    injectBar();initPicks();
    document.querySelectorAll('canvas[data-bg]').forEach(c=>bg(c,c.dataset.bg));
  });
})();
