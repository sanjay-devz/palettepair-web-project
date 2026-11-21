(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const state = { base: '#A86DD6', harmony: 'complementary', colors: [], heading: 'Playfair Display', body: 'DM Sans', size: 42, style: 'normal', preview: 'landing' };
  const hexInput = $('#hexInput'), colorInput = $('#baseColor'), studioColor = $('#studioColor'), studioHex = $('#studioHex');

  function route() {
    const id = location.hash.slice(1) || 'home';
    const valid = ['home','discover','studio','about'].includes(id) ? id : 'home';
    $$('.page').forEach(p => p.classList.toggle('is-active', p.dataset.page === valid));
    $$('[data-route]').forEach(a => a.toggleAttribute('aria-current', a.dataset.route === valid));
    $('.main-nav').classList.remove('open');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  window.addEventListener('hashchange', route);
  $('.menu-toggle').addEventListener('click', () => $('.main-nav').classList.toggle('open'));

  const clamp = n => Math.max(0, Math.min(255, Math.round(n)));
  function hexToRgb(hex) { const s=hex.replace('#','');return {r:parseInt(s.slice(0,2),16),g:parseInt(s.slice(2,4),16),b:parseInt(s.slice(4,6),16)}; }
  function rgbToHex({r,g,b}) { return '#'+[r,g,b].map(v=>clamp(v).toString(16).padStart(2,'0')).join('').toUpperCase(); }
  function rgbToHsl({r,g,b}) { r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0,s=0,l=(max+min)/2;if(d){s=d/(1-Math.abs(2*l-1));switch(max){case r:h=((g-b)/d)%6;break;case g:h=(b-r)/d+2;break;default:h=(r-g)/d+4;}h*=60;if(h<0)h+=360;}return {h,s,l}; }
  function hslToHex(h,s,l) { h=((h%360)+360)%360;s=Math.max(0,Math.min(1,s));l=Math.max(0,Math.min(1,l));const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2;let rgb;if(h<60)rgb=[c,x,0];else if(h<120)rgb=[x,c,0];else if(h<180)rgb=[0,c,x];else if(h<240)rgb=[0,x,c];else if(h<300)rgb=[x,0,c];else rgb=[c,0,x];return rgbToHex({r:(rgb[0]+m)*255,g:(rgb[1]+m)*255,b:(rgb[2]+m)*255}); }
  function paletteFor(hex, type=state.harmony) { const hsl=rgbToHsl(hexToRgb(hex)), offsets={complementary:[0,180,25,205],analogous:[0,30,330,60],triadic:[0,120,240,180],split:[0,150,210,30]}[type]||[0,180,25,205];return offsets.map((offset,i)=>hslToHex(hsl.h+offset,Math.max(.42,Math.min(.76,hsl.s*(i===0?1:.9))),Math.max(.37,Math.min(.68,hsl.l*(i===0?1:(i===3?.83:1.05)))))); }
  function luminance(hex) { return Object.values(hexToRgb(hex)).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0); }
  function ratio(a,b) { const x=luminance(a),y=luminance(b);return ((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(2); }
  function announce(message) { const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(announce.timer);announce.timer=setTimeout(()=>toast.classList.remove('show'),1900); }
  function render() {
    state.colors=paletteFor(state.base);
    $('#swatches').innerHTML=state.colors.map(c=>`<div class="swatch" style="background:${c}" data-color="${c}" title="Click to use ${c}"><code>${c}</code></div>`).join('');
    $('#controlColors').innerHTML=state.colors.map(c=>`<button class="control-color" style="background:${c}" data-color="${c}" title="Use ${c}" aria-label="Use ${c}"></button>`).join('');
    $('#harmonyLabel').textContent=state.harmony[0].toUpperCase()+state.harmony.slice(1)+' palette';
    const ratioText=ratio(state.base,'#FFFFFF');$('#contrastRatio').textContent=`${ratioText}:1 on white`;
    const preview=$('#contrastPreview');preview.style.background=state.base;preview.style.color=luminance(state.base)>.36?'#242020':'#fff';
    document.documentElement.style.setProperty('--accent',state.base);document.documentElement.style.setProperty('--accent-2',state.colors[2]);
    hexInput.value=state.base;colorInput.value=state.base;studioColor.value=state.base;studioHex.value=state.base;
    applyTypography();
    $$('.swatch,[data-color]').forEach(el=>el.addEventListener('click',()=>setBase(el.dataset.color)));
  }
  function setBase(value) { if(!/^#[0-9a-f]{6}$/i.test(value))return;state.base=value.toUpperCase();render(); }
  function syncBase(input) { let v=input.value.trim();if(!v.startsWith('#'))v='#'+v;if(/^#[0-9a-f]{6}$/i.test(v))setBase(v); }
  function applyTypography(){const heading=$('#headingFont').value,body=$('#bodyFont').value,size=$('#fontSize').value;$('#mockTitle').style.fontFamily=`'${heading}', Georgia, serif`;$('#mockTitle').style.fontSize=`${size}px`;$('#mockTitle').style.fontStyle=state.style==='italic'?'italic':'normal';$('#mockTitle').style.fontWeight=state.style==='bold'?'700':'500';$('#mockBody').style.fontFamily=`'${body}', sans-serif`;$('#fontSizeValue').textContent=`${size}px`;}
  // Keep text controls in sync with both the wheel workspace and studio sidebar.
  colorInput.addEventListener('input',e=>setBase(e.target.value));studioColor.addEventListener('input',e=>setBase(e.target.value));
  hexInput.addEventListener('change',e=>syncBase(e.target));studioHex.addEventListener('change',e=>syncBase(e.target));
  $('#harmony').addEventListener('change',e=>{state.harmony=e.target.value;render();});
  $('#findMatch').addEventListener('click',()=>{render();announce('Your palette is ready');});
  $('#randomize').addEventListener('click',()=>{setBase(hslToHex(Math.random()*360,.55+Math.random()*.3,.46+Math.random()*.15));announce('A fresh palette, just for you');});
  $('#shuffleColor').addEventListener('click',()=>$('#randomize').click());
  $('#copyPalette').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(state.colors.join(', '));announce('Palette codes copied');}catch{announce(state.colors.join('  '));}});
  $$('.apply-harmony').forEach(button=>button.addEventListener('click',()=>{state.harmony=button.dataset.harmony;$('#harmony').value=state.harmony;location.hash='discover';render();}));
  $('#colorWheel').addEventListener('pointerdown',e=>{const rect=e.currentTarget.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width-.5,y=(e.clientY-rect.top)/rect.height-.5;const hue=(Math.atan2(y,x)*180/Math.PI+360)%360;const current=rgbToHsl(hexToRgb(state.base));setBase(hslToHex(hue,current.s||.62,current.l||.62));});
  $('#colorWheel').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();const current=rgbToHsl(hexToRgb(state.base));setBase(hslToHex(current.h+(e.key==='ArrowRight'||e.key==='ArrowUp'?5:-5),current.s,current.l));}});
  ['headingFont','bodyFont','fontSize'].forEach(id=>$('#'+id).addEventListener('input',applyTypography));
  $$('.style-choice').forEach(button=>button.addEventListener('click',()=>{state.style=button.dataset.style;$$('.style-choice').forEach(b=>b.classList.toggle('active',b===button));applyTypography();}));
  $$('.preview-tab').forEach(button=>button.addEventListener('click',()=>{$$('.preview-tab').forEach(b=>b.classList.toggle('active',b===button));state.preview=button.dataset.preview;const canvas=$('#liveCanvas');canvas.classList.toggle('mobile-preview',state.preview==='mobile');canvas.classList.toggle('article-preview',state.preview==='article');if(state.preview==='article')$('#mockTitle').innerHTML='Stories<br>with <em>color.</em>';else $('#mockTitle').innerHTML='Make room<br>for <em>good ideas.</em>';applyTypography();}));
  $('#copyCss').addEventListener('click',async()=>{const css=`:root { --brand: ${state.base}; }\nh1 { font-family: '${$('#headingFont').value}', serif; font-size: ${$('#fontSize').value}px; }\nbody { font-family: '${$('#bodyFont').value}', sans-serif; }`;try{await navigator.clipboard.writeText(css);announce('Type styles copied as CSS');}catch{announce(css);}});
  render();route();
})();
