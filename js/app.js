/* Atlas de Microbiología GERMEN · interfaz: catálogo, ficha, platina, animaciones y tema */
(function (A) {
  const {ORGS, CATS, RANIM, GROUPS, FILTERS, WALL_NAME, MX} = A;
  const $ = s => document.querySelector(s);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = {idx:0, filter:'all', q:'', tab:'ficha', stain:false, ocular:false, rotate:!reduce, deep:false};
  let viewer = null;
  const pad = n => String(n).padStart(2,'0');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  const nameStyle = o => o.roman ? 'style="font-style:normal;font-family:var(--f-display);font-weight:700"' : '';
  const deepWord = o => o.wall==='cut' ? 'Interior' : (o.wall==='proto'||o.wall==='knob') ? 'Membrana' : 'Pared';
  const deepCta = o => o.wall==='cut' ? 'Abrir el virión y ver su genoma' : o.wall==='proto' ? 'Ver la membrana y el citoesqueleto' : o.wall==='knob' ? 'Ver la membrana del eritrocito parasitado' : o.wall==='fungal' ? 'Ver la pared fúngica por dentro' : 'Ver la pared celular por dentro';

  /* estilos de las animaciones */
  const st = document.createElement('style'); st.textContent = Object.values(MX).map(m => m.css).join('\n'); document.head.appendChild(st);

  function glyph(t){
    const s = 'stroke="currentColor" stroke-width="1.4" fill="var(--h)" fill-opacity=".55"';
    const m = {
      coccus:`<circle cx="9" cy="10" r="4" ${s}/><circle cx="15.5" cy="9" r="4" ${s}/><circle cx="12" cy="15.5" r="4" ${s}/>`,
      diplo:`<path d="M12 12c-1-4 0-7 0-9-3 2-5 6-4 9zM12 12c1 4 0 7 0 9 3-2 5-6 4-9z" ${s}/><ellipse cx="12" cy="12" rx="7" ry="10" fill="none" stroke="currentColor" stroke-dasharray="2 2" opacity=".6"/>`,
      chain:`<ellipse cx="4.5" cy="12" rx="3.5" ry="2.8" ${s}/><ellipse cx="10" cy="12" rx="3.5" ry="2.8" ${s}/><ellipse cx="16" cy="12" rx="3.5" ry="2.8" ${s}/><ellipse cx="21" cy="12" rx="2.5" ry="2.4" ${s}/>`,
      rod:`<rect x="4" y="9" width="16" height="7" rx="3.5" ${s}/><path d="M4 12c-2 0-2 3-3 3M20 12c2 0 2-3 3-3" stroke="currentColor" fill="none"/>`,
      rodtail:`<rect x="10" y="9" width="12" height="7" rx="3.5" ${s}/><path d="M10 12L2 8M10 12L1 12M10 12L2 16" stroke="currentColor" fill="none" opacity=".7"/>`,
      rodcap:`<rect x="1.5" y="6" width="21" height="12" rx="6" fill="none" stroke="currentColor" stroke-dasharray="2 2" opacity=".6"/><rect x="5" y="9" width="14" height="6" rx="3" ${s}/>`,
      rodflag:`<rect x="2" y="9" width="12" height="6" rx="3" ${s}/><path d="M14 12c2-3 3 3 5 0s3 3 4 0" stroke="currentColor" fill="none"/>`,
      coccobac:`<rect x="3" y="7" width="8" height="10" rx="4" ${s}/><rect x="12" y="7" width="8" height="10" rx="4" ${s}/>`,
      bean:`<path d="M11 5c-5 0-7 3-7 7s2 7 7 7c-1-2-1-12 0-14zM13 5c5 0 7 3 7 7s-2 7-7 7c1-2 1-12 0-14z" ${s}/>`,
      cord:`<rect x="2" y="7" width="11" height="3" rx="1.5" ${s} transform="rotate(-10 7 8)"/><rect x="9" y="11" width="11" height="3" rx="1.5" ${s} transform="rotate(8 14 12)"/><rect x="4" y="15" width="11" height="3" rx="1.5" ${s}/>`,
      curved:`<path d="M5 17c0-6 5-10 11-10" stroke="currentColor" stroke-width="5" stroke-linecap="round" fill="none" opacity=".9"/><path d="M5 17c0-6 5-10 11-10" stroke="var(--h)" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M16 7c2 0 3-2 5-1" stroke="currentColor" fill="none"/>`,
      spiral:`<path d="M3 14c2-6 4-6 6 0s4 6 6 0" stroke="currentColor" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M3 14c2-6 4-6 6 0s4 6 6 0" stroke="var(--h)" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M15 14l3-4M15 14l4-2M15 14l4 0" stroke="currentColor" fill="none"/>`,
      spore:`<rect x="2" y="9" width="20" height="6" rx="3" ${s}/><ellipse cx="17.5" cy="12" rx="2.6" ry="3.6" fill="currentColor" opacity=".85"/>`,
      spiro:`<path d="M1 12c1.5-4 3-4 4.5 0s3 4 4.5 0 3-4 4.5 0 3 4 4.5 0 3-4 4.5 0" stroke="var(--h)" stroke-width="2.2" fill="none"/><path d="M1 12c1.5-4 3-4 4.5 0s3 4 4.5 0 3-4 4.5 0 3 4 4.5 0 3-4 4.5 0" stroke="currentColor" stroke-width=".8" fill="none"/>`,
      yeast:`<ellipse cx="9" cy="13" rx="5.5" ry="6.5" ${s}/><circle cx="16.5" cy="7" r="3.2" ${s}/><path d="M13 17c3 1 5 3 8 3" stroke="currentColor" stroke-width="2" fill="none"/>`,
      mold:`<path d="M12 23V12" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="4" ${s}/>${[-60,-30,0,30,60].map(a => { const r = a*Math.PI/180; return `<circle cx="${(12+Math.sin(r)*7.5).toFixed(1)}" cy="${(9-Math.cos(r)*7.5).toFixed(1)}" r="1.5" fill="currentColor"/>`; }).join('')}`,
      proto:`<path d="M12 3c5 0 7 4 6 8-1 3-4 6-6 10-2-4-5-7-6-10-1-4 1-8 6-8z" ${s}/><circle cx="10" cy="8.5" r="1.4" fill="currentColor"/><circle cx="14" cy="8.5" r="1.4" fill="currentColor"/>`,
      rbc:`<ellipse cx="12" cy="12" rx="10" ry="8" ${s}/><circle cx="14" cy="11" r="3" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="16.4" cy="9.6" r="1.1" fill="currentColor"/>`,
      virus:`<circle cx="12" cy="12" r="6" ${s}/><g stroke="currentColor"><path d="M12 6V3M12 18v3M6 12H3M18 12h3M7.8 7.8 5.6 5.6M16.2 16.2l2.2 2.2M7.8 16.2l-2.2 2.2M16.2 7.8l2.2-2.2"/></g><g fill="currentColor"><circle cx="12" cy="2.6" r="1.2"/><circle cx="12" cy="21.4" r="1.2"/><circle cx="2.6" cy="12" r="1.2"/><circle cx="21.4" cy="12" r="1.2"/></g>`,
      hiv:`<circle cx="12" cy="12" r="8" ${s}/><path d="M9.5 8l6 4-6 4z" fill="currentColor" opacity=".8"/><g stroke="currentColor"><path d="M12 4V2M20 12h2M12 20v2M4 12H2"/></g>`,
      flu:`<circle cx="12" cy="12" r="7.5" ${s}/><g stroke="currentColor" stroke-width="1.6"><path d="M9 9v6M12 8v8M15 9v6"/></g><g stroke="currentColor"><path d="M12 4.5V2M19.5 12H22M12 19.5V22M4.5 12H2M17 7l2-2M7 17l-2 2M17 17l2 2M7 7L5 5"/></g>`,
      phage:`<path d="M12 2l4 2.5v5L12 12 8 9.5v-5z" ${s}/><path d="M12 12v6" stroke="currentColor" stroke-width="2.4"/><path d="M9 18h6M9.5 18l-4 3 1 2M14.5 18l4 3-1 2" stroke="currentColor" fill="none"/>`
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${m[t] || m.coccus}</svg>`;
  }

  function visible(){
    const q = norm(state.q.trim());
    return ORGS.map((o,i) => [o,i]).filter(([o]) => {
      if (!(state.filter==='all' || o.grp===state.filter || (state.filter==='virus' && o.grp==='fago'))) return false;
      return !q || norm(o.sp+' '+o.com+' '+o.dis.join(' ')+' '+GROUPS[o.grp]).includes(q);
    });
  }
  function renderFilters(){ $('#filters').innerHTML = FILTERS.map(([k,l]) => `<button class="chip" type="button" data-f="${k}" aria-pressed="${state.filter===k}">${l}</button>`).join(''); }
  function renderList(){
    const v = visible();
    $('#count').textContent = `${v.length} de ${ORGS.length}`;
    $('#list').innerHTML = v.length ? v.map(([o,i],k) => `<li class="rise" style="--i:${Math.min(k,12)}"><button class="item" type="button" data-i="${i}" aria-current="${i===state.idx}" style="--h:${o.hue}">
      <span class="glyph">${glyph(o.glyph)}</span><span style="min-width:0"><span class="nm" ${o.roman?'style="font-style:normal;font-family:var(--f-display);font-weight:600;font-size:15px"':''}>${esc(o.sp)}</span><span class="gp">${GROUPS[o.grp]}</span></span><span class="no">${pad(i+1)}</span></button></li>`).join('')
      : `<li class="empty">Ningún espécimen coincide con «${esc(state.q)}». Prueba con otro nombre o enfermedad.</li>`;
  }

  function sizeSVG(o){
    const W = 340, x = v => 16+(Math.log10(v)+2)/4*(W-32), fmt = v => v < 1 ? `${Math.round(v*1000)} nm` : `${String(v).replace('.',',')} µm`;
    const mx = x(o.sizeUm), anchor = mx < 70 ? 'start' : mx > W-70 ? 'end' : 'middle';
    let s = `<svg viewBox="0 0 ${W} 72" role="img" aria-label="Tamaño en escala logarítmica: ${fmt(o.sizeUm)}"><line x1="16" x2="${W-16}" y1="36" y2="36" stroke="var(--line2)" stroke-width="2"/>`;
    for (let d=-2; d<=2; d++){ const xx = x(10**d); s += `<line x1="${xx}" x2="${xx}" y1="32" y2="40" stroke="var(--muted)"/>`; }
    [[0.1,'Virus'],[1,'Bacteria'],[7,'Eritrocito'],[70,'Cabello']].forEach(([v,l]) => { const xx = x(v); s += `<circle cx="${xx}" cy="36" r="3.5" fill="var(--bg)" stroke="var(--muted)" stroke-width="1.4"/><text x="${xx}" y="58" text-anchor="middle" font-size="10" font-family="var(--f-mono)" fill="var(--muted)">${l}</text><text x="${xx}" y="69" text-anchor="middle" font-size="9" font-family="var(--f-mono)" fill="var(--muted)">${fmt(v)}</text>`; });
    return s + `<path d="M${mx-6} 18L${mx+6} 18L${mx} 27Z" fill="var(--accent)"/><circle cx="${mx}" cy="36" r="5.5" fill="var(--accent)"/><text x="${mx}" y="12" text-anchor="${anchor}" font-size="11" font-weight="600" font-family="var(--f-mono)" fill="var(--fg)">${esc(o.short)} · ${fmt(o.sizeUm)}</text></svg>`;
  }

  const playIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
  function renderPanel(){
    const o = ORGS[state.idx], L = o.labels || {};
    const tabs = [['ficha','Ficha'],['path',L.path||'Patogenicidad'],['res',L.res||'Resistencia'],['dx','Diagnóstico']];
    let body = '';
    if (state.tab === 'ficha'){
      body = `<button class="cta rise" style="--i:0" type="button" data-deep><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/></svg><span><b>${deepCta(o)}</b><small>${WALL_NAME[o.wall]} · también puedes acercar el zoom en el visor</small></span></button>
      <div class="sec rise" style="--i:1"><h2>Características</h2><dl class="facts">${o.ficha.map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}<dt>Tinción</dt><dd>${o.stain.name}</dd></dl>${o.src?`<p class="src">${o.src}</p>`:''}</div>
      <div class="sec sizes rise" style="--i:2"><h2>Escala logarítmica de tamaño</h2>${sizeSVG(o)}</div>
      <div class="sec rise" style="--i:3"><h2>${L.dis||'Enfermedades'}</h2><div class="tags">${o.dis.map(d => `<span>${d}</span>`).join('')}</div></div>
      <div class="fact rise" style="--i:4"><b>Dato de laboratorio</b><p>${o.fact}</p></div>`;
    } else if (state.tab === 'path'){
      const anims = [...new Set(o.path.map(p => p[3]).filter(Boolean))];
      body = (anims.length ? `<div class="sec rise" style="--i:0"><h2>Mecanismos animados</h2><div class="mlist">${anims.map(a => `<button class="mcard" type="button" data-anim="${a}"><span class="pl">${playIcon}</span><span>${MX[a].title(o)}</span></button>`).join('')}</div></div>` : '')
        + `<ul class="items">${o.path.map(([t,d,h,a],k) => `<li class="it rise" style="--i:${k+1}"><div class="it-h"><b>${t}</b><span class="acts">${a?`<button class="see" type="button" data-anim="${a}">${playIcon}Animación</button>`:''}${h?`<button class="see" type="button" data-hs="${h}" aria-label="Ver ${esc(t)} en el modelo 3D"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>3D</button>`:''}</span></div><p>${d}</p></li>`).join('')}</ul>`;
    } else if (state.tab === 'res'){
      const cnt = Object.keys(CATS).map(k => [k, o.res.filter(r => r[0]===k).length]);
      body = `<div class="sec rise" style="--i:0"><h2>Huella de mecanismos · toca ▶ para ver cómo funcionan</h2><div class="fp">${cnt.map(([k,c]) => `<div class="fp-row ${c?'':'zero'}" style="--rc:var(${CATS[k][1]})"><span>${CATS[k][0]}</span><span class="bar"><i style="width:${Math.min(c,3)/3*100}%"></i></span><span class="n">${c}</span>${c && RANIM[k] ? `<button class="fpp" type="button" data-anim="${RANIM[k]}" aria-label="Animación: ${CATS[k][0]}">${playIcon}</button>` : '<span></span>'}</div>`).join('')}</div></div>
      <ul class="items">${o.res.map(([c,t,d,dr],k) => `<li class="it rise" style="--i:${k+1};--rc:var(${CATS[c][1]})"><span class="cat">${CATS[c][0]}</span><div class="it-h" style="margin-top:6px"><b>${t}</b></div><p>${d}</p><div class="drugs"><span>Afecta a:</span> ${dr}</div></li>`).join('')}</ul>`;
    } else {
      body = `<div class="sec rise" style="--i:0"><h2>Claves de laboratorio</h2><ul class="dx">${o.dx.map(d => `<li>${d}</li>`).join('')}</ul></div>
      <p class="foot rise" style="--i:1">Material educativo. Las decisiones clínicas deben seguir las guías locales y el antibiograma del aislamiento.</p>`;
    }
    $('#panel').innerHTML = `<p class="eyebrow">${GROUPS[o.grp]} · espécimen ${pad(state.idx+1)}</p>
      <h1 ${nameStyle(o)}>${esc(o.sp)}</h1><p class="com">${o.com}</p>
      <div class="badges">${o.who?`<span class="badge who"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17v.5"/></svg>${o.who}</span>`:''}<span class="badge">${o.ficha[0][1]}</span></div>
      <div class="tabs" role="tablist" aria-label="Secciones de la ficha">${tabs.map(([k,l]) => `<button class="tab" role="tab" type="button" id="tab-${k}" data-tab="${k}" aria-selected="${state.tab===k}" tabindex="${state.tab===k?0:-1}">${l}</button>`).join('')}</div>
      <div class="tabbody" role="tabpanel" aria-labelledby="tab-${state.tab}">${body}</div>
      <p class="credit">Atlas de Microbiología · Grupo GERMEN</p>`;
  }

  function renderStage(){
    const o = ORGS[state.idx], wallView = state.deep && o.wall !== 'cut';
    const line = state.deep ? WALL_NAME[o.wall] : state.stain ? o.stain.name : 'Vista 3D en color';
    $('#slide').innerHTML = `<span class="frost"></span><div class="lab"><div class="no">Preparación n.º ${pad(state.idx+1)}</div><div class="sp" ${nameStyle(o)}>${esc(o.sp)}</div><div class="st">${line}</div></div>`;
    $('#pos').textContent = `${pad(state.idx+1)} / ${ORGS.length}`;
    $('#stainLbl').textContent = o.stain.name.length > 14 ? 'Microscopio' : o.stain.name;
    $('#stainBtn').setAttribute('aria-pressed', state.stain && !wallView); $('#stainBtn').disabled = wallView;
    $('#deepLbl').textContent = deepWord(o); $('#deepBtn').setAttribute('aria-pressed', state.deep);
    $('#stage').dataset.field = state.stain && !wallView ? o.stain.bg : 'nat';
    const n = $('#stainnote'); n.hidden = !(state.stain && !wallView); if (!n.hidden) n.textContent = o.stain.note;
    viewer?.reframe();
  }

  function showCard(key){
    const c = $('#card');
    document.querySelectorAll('.hs').forEach(b => b.classList.toggle('on', b.dataset.key === key));
    if (!key){ c.hidden = true; return; }
    const inf = viewer?.info(key) || ORGS[state.idx].hs[key]; if (!inf){ c.hidden = true; return; }
    c.hidden = false;
    c.innerHTML = `<button class="x" type="button" aria-label="Cerrar"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6 6 18"/></svg></button><h3>${inf[0]}</h3><p>${inf[1]}</p>`;
    c.querySelector('.x').onclick = () => showCard(null);
  }

  function select(i){
    state.idx = (i + ORGS.length) % ORGS.length; state.deep = false; showCard(null); closeMech();
    renderList(); renderPanel(); renderStage();
    try { history.replaceState(null, '', '#' + ORGS[state.idx].id); } catch(e) {}
    if (!viewer) return;
    const cw = $('#cw');
    if (reduce){ viewer.load(ORGS[state.idx]); return; }
    cw.classList.add('defocus'); clearTimeout(select.t);
    select.t = setTimeout(() => { viewer.load(ORGS[state.idx]); requestAnimationFrame(() => requestAnimationFrame(() => cw.classList.remove('defocus'))); }, 240);
  }
  function step(d){ const v = visible().map(([,i]) => i), list = v.length ? v : ORGS.map((_,i) => i); let k = list.indexOf(state.idx); k = k < 0 ? 0 : (k+d+list.length) % list.length; select(list[k]); }
  const toStage = () => { if (innerWidth <= 1180) $('#stage').scrollIntoView({behavior:reduce?'auto':'smooth', block:'center'}); };

  /* Motor de animaciones */
  let mx = null;
  function openMech(key, opener){
    const o = ORGS[state.idx], M = MX[key]; if (!M) return;
    closeMech(); showCard(null);
    const steps = M.steps(o), el = $('#mech'); el.hidden = false;
    el.innerHTML = `<div class="mx-head"><div><p class="eyebrow">Mecanismo animado · ${esc(o.short)}</p><h2>${M.title(o)}</h2></div><button class="iconbtn" type="button" id="mxClose" aria-label="Cerrar animación"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <div class="mx-svg"><svg viewBox="0 0 600 340" class="mx mx-${key}" data-step="0" role="img" aria-label="${esc(M.title(o))}">${M.svg(o)}</svg></div>
      <div class="mx-foot"><div class="mx-txt" aria-live="polite"><b id="mxT"></b><p id="mxD"></p></div>
      <div class="mx-ctl"><button class="iconbtn" type="button" id="mxPrev" aria-label="Paso anterior"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m15 18-6-6 6-6"/></svg></button>
      <div class="mx-dots">${steps.map((_,k) => `<button class="mxdot" type="button" data-k="${k+1}" aria-label="Paso ${k+1}"></button>`).join('')}</div>
      <button class="iconbtn" type="button" id="mxPlay" aria-label="Pausar"></button>
      <button class="iconbtn" type="button" id="mxNext" aria-label="Paso siguiente"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg></button></div></div>`;
    const svg = el.querySelector('svg.mx');
    mx = {i:0, n:steps.length, playing:!reduce, timer:null, opener};
    const pauseI = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
    const paint = () => { $('#mxPlay').innerHTML = mx.playing ? pauseI : playIcon.replace('12','16').replace('12','16'); $('#mxPlay').setAttribute('aria-label', mx.playing ? 'Pausar' : 'Reproducir'); };
    const go = n => { mx.i = Math.max(1, Math.min(mx.n, n)); svg.dataset.step = mx.i; svg.setAttribute('class', `mx mx-${key} ` + Array.from({length:mx.i}, (_,k) => 's'+(k+1)).join(' '));
      $('#mxT').textContent = `${mx.i}. ${steps[mx.i-1][0]}`; $('#mxD').textContent = steps[mx.i-1][1];
      el.querySelectorAll('.mxdot').forEach(d => d.setAttribute('aria-current', +d.dataset.k === mx.i)); };
    const tick = () => { clearTimeout(mx.timer); if (!mx.playing) return; mx.timer = setTimeout(() => { if (mx.i >= mx.n){ mx.playing = false; paint(); return; } go(mx.i+1); tick(); }, 5600); };
    mx.go = n => { go(n); tick(); };
    $('#mxClose').onclick = closeMech;
    $('#mxPrev').onclick = () => mx.go(mx.i-1);
    $('#mxNext').onclick = () => mx.go(mx.i+1);
    $('#mxPlay').onclick = () => { mx.playing = !mx.playing; if (mx.playing && mx.i >= mx.n) go(0), go(1); paint(); tick(); };
    el.querySelector('.mx-dots').onclick = e => { const b = e.target.closest('.mxdot'); if (b) mx.go(+b.dataset.k); };
    paint(); requestAnimationFrame(() => requestAnimationFrame(() => { go(1); tick(); }));
    $('#mxClose').focus({preventScroll:true}); toStage();
  }
  function closeMech(){ if (!mx) return; clearTimeout(mx.timer); const op = mx.opener; mx = null; const el = $('#mech'); el.hidden = true; el.innerHTML = ''; if (op && document.contains(op)) op.focus({preventScroll:true}); }

  /* Tema */
  const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  const curTheme = () => document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  const paintTheme = () => { $('#themeBtn').innerHTML = curTheme()==='dark' ? sun : moon; };
  try { const t = localStorage.getItem('atlas-theme'); if (t) document.documentElement.dataset.theme = t; } catch(e) {}
  $('#themeBtn').onclick = () => { const t = curTheme()==='dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; try { localStorage.setItem('atlas-theme', t); } catch(e) {} paintTheme(); viewer?.theme(); };
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => { paintTheme(); viewer?.theme(); });
  paintTheme();

  $('#ticks').innerHTML = Array.from({length:21}, (_,k) => { const x = 10+k*10, h = k%5===0 ? 9 : 5; return `<path d="M${x} ${20-h}v${h*2}"/>`; }).join('') + [0,5,10].map(k => `<text x="${10+k*20}" y="38" font-size="7" text-anchor="middle" fill="currentColor" stroke="none" font-family="monospace">${k}</text>`).join('');

  /* Eventos */
  $('#filters').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; state.filter = b.dataset.f; renderFilters(); renderList(); });
  $('#list').addEventListener('click', e => { const b = e.target.closest('[data-i]'); if (b) select(+b.dataset.i); });
  $('#q').addEventListener('input', e => { state.q = e.target.value; renderList(); });
  $('#q').addEventListener('keydown', e => { if (e.key === 'Enter'){ const v = visible(); if (v.length) select(v[0][1]); } });
  $('#panel').addEventListener('click', e => {
    const t = e.target.closest('[data-tab]'); if (t){ state.tab = t.dataset.tab; renderPanel(); $('#tab-'+state.tab)?.focus(); return; }
    const a = e.target.closest('[data-anim]'); if (a){ openMech(a.dataset.anim, a); return; }
    const d = e.target.closest('[data-deep]'); if (d){ closeMech(); viewer?.setDeep(true); toStage(); return; }
    const h = e.target.closest('[data-hs]'); if (h){ closeMech(); showCard(h.dataset.hs); viewer?.focus(h.dataset.hs); toStage(); }
  });
  $('#panel').addEventListener('keydown', e => {
    if (!e.target.matches('.tab') || !['ArrowLeft','ArrowRight'].includes(e.key)) return;
    const ks = ['ficha','path','res','dx']; const k = ks.indexOf(state.tab) + (e.key==='ArrowRight' ? 1 : -1); state.tab = ks[(k+4)%4]; renderPanel(); $('#tab-'+state.tab).focus();
  });
  $('#prev').onclick = () => step(-1);
  $('#next').onclick = () => step(1);
  $('#stainBtn').onclick = () => { state.stain = !state.stain; renderStage(); viewer?.stain(state.stain); };
  $('#deepBtn').onclick = () => viewer?.setDeep(!state.deep);
  $('#ocuBtn').onclick = () => { state.ocular = !state.ocular; $('#ocular').classList.toggle('on', state.ocular); $('#ocuBtn').setAttribute('aria-pressed', state.ocular); };
  $('#rotBtn').onclick = () => { state.rotate = !state.rotate; $('#rotBtn').setAttribute('aria-pressed', state.rotate); viewer?.rotate(state.rotate); };
  $('#rotBtn').setAttribute('aria-pressed', state.rotate);
  $('#resetBtn').onclick = () => { viewer?.reset(); showCard(null); };
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape'){ if (mx) closeMech(); else showCard(null); return; }
    if (e.target.matches('input,textarea,.tab') || mx) return;
    if (e.key === 'ArrowRight'){ step(1); e.preventDefault(); } else if (e.key === 'ArrowLeft'){ step(-1); e.preventDefault(); }
  });

  const fromHash = ORGS.findIndex(o => '#'+o.id === location.hash);
  state.idx = fromHash >= 0 ? fromHash : 0;
  renderFilters(); renderList(); renderPanel(); renderStage();

  /* Visor 3D */
  Promise.all([import('three'), import('three/addons/controls/OrbitControls.js'), import('three/addons/environments/RoomEnvironment.js'), import('three/addons/utils/BufferGeometryUtils.js')])
    .then(([THREE, {OrbitControls}, {RoomEnvironment}, {mergeVertices}]) => {
      viewer = A.createViewer({THREE, OrbitControls, RoomEnvironment, mergeVertices}, {
        state, reduce,
        els:{stage:$('#stage'), cw:$('#cw'), hsl:$('#hsl'), hint:$('#hint'), scaleBar:$('#scaleBar'), scaleTxt:$('#scaleTxt'), stTop:$('#stTop'), stBot:$('#stBot')},
        onHs:showCard, cardOpen:() => !$('#card').hidden,
        onRotate:on => $('#rotBtn').setAttribute('aria-pressed', on),
        onDeepChange:() => { showCard(null); renderStage(); }
      });
      viewer.load(ORGS[state.idx]);
      $('#boot').hidden = true; $('#scale').hidden = false;
    })
    .catch(err => {
      console.error(err);
      $('#boot').innerHTML = '<div style="max-width:320px;text-transform:none;letter-spacing:0;font-size:13px;line-height:1.5">No se pudo iniciar el visor 3D en este navegador (WebGL desactivado o sin conexión al CDN). La ficha, la patogenicidad, la resistencia y las animaciones siguen disponibles.</div>';
    });
})(window.ATLAS);
