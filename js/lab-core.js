/* Atlas de Microbiología GERMEN · Laboratorio virtual: modo, estaciones, protocolo paso a paso y utilidades de animación */
(function (A) {
  const LAB = A.LAB, ORGS = A.ORGS;
  const $ = s => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const byId = id => ORGS.find(o => o.id === id);
  LAB.esc = esc; LAB.byId = byId;

  LAB.GROUPS = [['id','Identificación',['maldi','bioq']], ['ast','Sensibilidad antimicrobiana',['kb','bmd','auto']], ['mol','Diagnóstico molecular',['pcr','film']]];
  const groupOf = k => LAB.GROUPS.find(g => g[2].includes(k));
  const ICON = {
    maldi:'<path d="M4 18h16M7 18V9l5-5 5 5v9"/><path d="M10 13h4M12 4v3"/><circle cx="12" cy="13" r="1.4" fill="currentColor"/>',
    bioq:'<path d="M6 3v13a3 3 0 0 0 6 0V3M5 3h8M14 3v13a3 3 0 0 0 6 0V3M13 3h8"/><path d="M6 11h6M14 13h6"/>',
    kb:'<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.6"/><circle cx="15" cy="14" r="1.6"/><circle cx="9" cy="10" r="4" stroke-dasharray="2 2"/>',
    bmd:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="7.5" cy="9.5" r="1.3"/><circle cx="12" cy="9.5" r="1.3"/><circle cx="16.5" cy="9.5" r="1.3"/><circle cx="7.5" cy="14.5" r="1.3"/><circle cx="12" cy="14.5" r="1.3"/><circle cx="16.5" cy="14.5" r="1.3" fill="currentColor"/>',
    auto:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 21h10M12 17v4M7 9h6M7 12h4"/><circle cx="17" cy="10.5" r="2"/>',
    pcr:'<path d="M7 3c0 4 10 5 10 9s-10 5-10 9M17 3c0 4-10 5-10 9s10 5 10 9"/><path d="M8 7h8M8 17h8M9.5 12h5"/>',
    film:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12M15 9v12M9 15h12"/><circle cx="6" cy="6" r="1" fill="currentColor"/>'
  };
  LAB.icon = (k, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;

  /* ---------- utilidades SVG y animación ---------- */
  const S = LAB.S = {
    el(tag, attrs = {}, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; },
    html(parent, str){ parent.insertAdjacentHTML('beforeend', str); return parent.lastElementChild; },
    ease:{out:t => 1-Math.pow(1-t,3), io:t => t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2, lin:t => t, back:t => 1+2.2*Math.pow(t-1,3)+1.2*Math.pow(t-1,2)},
    lerp:(a,b,t) => a+(b-a)*t,
    mix(c1, c2, t){ const p = c => [1,3,5].map(i => parseInt(c.slice(i,i+2),16)); const a = p(c1), b = p(c2); return '#'+a.map((v,i) => Math.round(v+(b[i]-v)*t).toString(16).padStart(2,'0')).join(''); }
  };

  /* ---------- estado ---------- */
  const st = LAB.state = {mode:'atlas', sim:'maldi', org:null, run:null};
  const eligible = k => ORGS.filter(o => LAB.for(k)[o.id]);

  function token(){ return {alive:true, speed:1}; }
  function makeCtx(run, sim, o){
    const stage = $('#lbStage');
    const k = () => reduce ? .04 : run.speed;
    const ctx = {
      o, run, reduce, stage, LAB,
      d: LAB.for(sim.key)[o.id],
      tween(ms, fn, ease = S.ease.out){ return new Promise(res => { if (!run.alive) return; const dur = ms*k(), t0 = performance.now();
        const f = now => { if (!run.alive) return; const t = dur <= 0 ? 1 : Math.max(0, Math.min(1, (now-t0)/dur)); fn(ease(t), t); if (t < 1) requestAnimationFrame(f); else res(); };
        requestAnimationFrame(f); }); },
      wait(ms){ return new Promise(res => { if (!run.alive) return; setTimeout(() => run.alive && res(), ms*k()); }); },
      say(h){ const n = $('#lbSay'); n.innerHTML = h; n.classList.remove('flash'); void n.offsetWidth; n.classList.add('flash'); },
      result(h){ const r = $('#lbRes'); r.hidden = !h; r.innerHTML = h ? `<h3>Resultado e interpretación</h3>${h}` : ''; if (h && innerWidth <= 1180) {} },
      svg(w = 960, h = 560){ stage.innerHTML = ''; const s = S.el('svg', {viewBox:`0 0 ${w} ${h}`, class:'lb-svg', role:'img', 'aria-label':sim.title}); stage.appendChild(s); return s; },
      clickable(el, label, fn, always){ el.classList.add('lb-hit'); el.setAttribute('tabindex','0'); el.setAttribute('role','button'); el.setAttribute('aria-label', label);
        const go = e => { if (!run.alive || (run.busy && !always)) return; e.preventDefault(); fn(e); };
        el.addEventListener('click', go); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') go(e); }); },
      pt(svg, e){ const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
    };
    return ctx;
  }

  /* Ejecuta las etapas: cada una tiene {t, d, btn, run(auto)} */
  function flow(ctx, stages){
    const run = ctx.run; let i = 0, auto = false;
    const steps = $('#lbSteps'), acts = $('#lbActs'), prog = $('#lbProg');
    steps.innerHTML = stages.map((s,k) => `<li data-k="${k}"><span class="n">${k+1}</span><div><b>${s.t}</b><p>${s.d}</p></div></li>`).join('');
    prog.innerHTML = stages.map(() => '<i></i>').join('');
    const paint = () => {
      steps.querySelectorAll('li').forEach((li,k) => li.dataset.s = k < i ? 'done' : k === i ? 'now' : 'next');
      prog.querySelectorAll('i').forEach((b,k) => b.dataset.s = k < i ? 'done' : k === i ? 'now' : '');
      const cur = steps.querySelector('[data-s="now"]'); if (cur && innerWidth > 1180) cur.scrollIntoView({block:'nearest', behavior:reduce?'auto':'smooth'});
      const s = stages[i];
      acts.innerHTML = s ? `<button class="lb-btn pri" type="button" id="lbGo" ${run.busy?'disabled':''}>${s.btn}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="m9 18 6-6-6-6"/></svg></button>
        ${i === 0 ? `<button class="lb-btn" type="button" id="lbAuto">${playI}Demostración</button>` : ''}`
        : `<button class="lb-btn pri" type="button" id="lbAgain">${againI}Repetir</button>`;
      acts.insertAdjacentHTML('beforeend', `<button class="lb-btn ghost" type="button" id="lbReset" aria-label="Reiniciar la práctica">${againI}<span>Reiniciar</span></button>`);
      $('#lbGo') && ($('#lbGo').onclick = () => next(false));
      $('#lbAuto') && ($('#lbAuto').onclick = () => { auto = true; run.speed = .55; next(true); });
      $('#lbAgain') && ($('#lbAgain').onclick = () => mount());
      $('#lbReset').onclick = () => mount();
    };
    async function next(a){
      const s = stages[i]; if (!s || run.busy) return;
      run.busy = true; paint();
      ctx.say('');
      await s.run(a || auto);
      if (!run.alive) return;
      run.busy = false; i++; paint();
      if (auto && i < stages.length){ await ctx.wait(650); if (run.alive) next(true); }
    }
    ctx.next = () => next(false);
    paint();
    if (stages[0]?.pre) stages[0].pre();
  }
  const playI = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>';
  const againI = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';

  /* ---------- montaje ---------- */
  function mount(){
    if (st.run) st.run.alive = false;
    const sim = LAB.sims[st.sim]; if (!sim) return;
    const list = eligible(st.sim);
    if (!list.some(o => o.id === st.org)) st.org = list[0].id;
    const o = byId(st.org), g = groupOf(st.sim);
    st.run = token();
    $('#lbEyebrow').textContent = g[1];
    $('#lbTitle').textContent = sim.title;
    $('#lbOrg').innerHTML = list.map(x => `<option value="${x.id}" ${x.id===o.id?'selected':''}>${esc(x.sp)}</option>`).join('');
    $('#lbOrgLink').dataset.id = o.id;
    $('#lbAbout').innerHTML = `<h3>Fundamento</h3>${sim.about}${sim.refs ? `<p class="lb-refs">${sim.refs}</p>` : ''}`;
    $('#lbSay').innerHTML = ''; $('#lbRes').hidden = true; $('#lbRes').innerHTML = '';
    document.querySelectorAll('#labRail [data-sim]').forEach(b => b.setAttribute('aria-current', b.dataset.sim === st.sim));
    const ctx = makeCtx(st.run, sim, o);
    $('#lbStage').innerHTML = '';
    $('#lbStage').dataset.sim = st.sim;
    flow(ctx, sim.mount(ctx));
    const h = `#lab/${st.sim}/${o.id}`; if (location.hash !== h) history.replaceState(null, '', h);
  }

  function renderRail(){
    $('#labRail').innerHTML = LAB.GROUPS.map(([gk, gl, ks]) => `<div class="rail-g"><h2>${gl}</h2>${ks.filter(k => LAB.sims[k]).map(k => { const s = LAB.sims[k]; return `<button type="button" class="rail-b" data-sim="${k}">${LAB.icon(k, 20)}<span><b>${s.title}</b><small>${s.sub}</small></span></button>`; }).join('')}</div>`).join('')
      + `<p class="rail-note">Elige una técnica y un aislamiento del atlas. Los resultados corresponden a ese microorganismo.</p>`;
  }

  function setMode(m, push = true){
    st.mode = m;
    const app = $('.app');
    app.classList.toggle('labmode', m === 'lab');
    $('#lab').hidden = m !== 'lab';
    document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === m));
    if (m === 'lab'){ if (!st.run || !st.run.alive) mount(); }
    else { if (st.run) st.run.alive = false; st.run = null; $('#lbStage').innerHTML = '';
      const o = ORGS[A.atlasIdx?.() ?? 0]; if (push) history.replaceState(null, '', '#' + (o?.id || '')); A.onAtlasShow?.(); }
    window.scrollTo({top:0});
  }
  A.openLab = (sim, orgId) => { st.sim = sim; if (orgId) st.org = orgId; if (st.run) st.run.alive = false; st.run = null; setMode('lab'); };
  A.labLinks = o => {
    const ks = LAB.order.filter(k => LAB.sims[k] && LAB.for(k)[o.id]); if (!ks.length) return '';
    return `<div class="sec rise" style="--i:2"><h2>Practica en el laboratorio virtual</h2><div class="lablinks">${ks.map(k => `<button type="button" class="lablink" data-lab="${k}">${LAB.icon(k,16)}${LAB.sims[k].title}</button>`).join('')}</div></div>`;
  };

  /* ---------- eventos ---------- */
  document.addEventListener('DOMContentLoaded', init);
  if (document.readyState !== 'loading') setTimeout(init);
  let inited = false;
  function init(){
    if (inited) return; inited = true;
    renderRail();
    document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
    $('#labRail').addEventListener('click', e => { const b = e.target.closest('[data-sim]'); if (!b) return; st.sim = b.dataset.sim; mount(); if (innerWidth <= 1180) $('#bench').scrollIntoView({behavior:reduce?'auto':'smooth', block:'start'}); });
    $('#lbOrg').addEventListener('change', e => { st.org = e.target.value; mount(); });
    $('#lbOrgLink').addEventListener('click', () => { const i = ORGS.findIndex(o => o.id === st.org); setMode('atlas', false); A.selectOrg?.(i); history.replaceState(null, '', '#' + st.org); });
    $('#panel').addEventListener('click', e => { const b = e.target.closest('[data-lab]'); if (b){ const o = ORGS[A.atlasIdx?.() ?? 0]; A.openLab(b.dataset.lab, o.id); } });
    const m = location.hash.match(/^#lab(?:\/(\w+))?(?:\/(\w+))?/);
    if (m){ if (m[1] && LAB.sims[m[1]]) st.sim = m[1]; if (m[2]) st.org = m[2]; setMode('lab', false); }
  }
})(window.ATLAS);
