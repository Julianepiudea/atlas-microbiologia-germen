/* Atlas de Microbiología GERMEN · Laboratorio virtual: identificación (MALDI-TOF y series bioquímicas) */
(function (A) {
  const LAB = A.LAB, S = LAB.S, el = S.el, esc = LAB.esc;
  const it = s => `<i class="sp">${s}</i>`;

  /* ======================= MALDI-TOF ======================= */
  function peaksOf(id){
    const base = {shigella:'ecoli'}[id] || id, r = LAB.seed('mz'+base), P = [];
    for (let i = 0; i < 17; i++) P.push({m:Math.round(2600 + Math.pow(r(),1.25)*10400), a:.12 + .88*Math.pow(r(),1.7)});
    const r2 = LAB.seed('sp'+id); for (let i = 0; i < 2; i++) P.push({m:Math.round(3000 + r2()*9000), a:.15 + .3*r2()});
    const mx = Math.max(...P.map(p => p.a)); P.forEach(p => p.a /= mx);
    return P.sort((a,b) => a.m-b.m);
  }
  function altPeaks(P, score, key){ const r = LAB.seed(key), keep = Math.max(.25, (score-1.2)/1.2);
    return P.map(p => r() < keep ? {m:p.m + Math.round((r()-.5)*6), a:Math.max(.08, p.a*(.6+r()*.7))} : {m:Math.round(2600 + r()*10400), a:.1 + r()*.6}); }

  LAB.sims.maldi = {
    key:'maldi', title:'MALDI-TOF', sub:'Huella proteica por espectrometría de masas',
    about:`<p>La <b>desorción/ionización láser asistida por matriz</b> vaporiza e ioniza las proteínas de una colonia, sobre todo las <b>ribosomales</b>, que son abundantes y propias de cada especie. Los iones se aceleran en un campo eléctrico y vuelan por un tubo al vacío: el <b>tiempo de vuelo</b> es proporcional a la raíz de su masa/carga (m/z), así que los livianos llegan primero.</p>
      <p>El espectro (2.000–20.000 m/z) se compara con una biblioteca de referencia. En el sistema Biotyper: <b>≥2,00</b> especie, <b>1,70–1,99</b> género, <b>&lt;1,70</b> sin identificación fiable.</p>`,
    refs:'Espectros esquemáticos con fines didácticos. Puntuaciones con la escala de Bruker Biotyper; VITEK MS usa porcentaje de confianza.',
    mount(ctx){
      const d = ctx.d, o = ctx.o, svg = ctx.svg(), P = peaksOf(o.id);
      const name = d.rep || o.sp;
      /* placa de Petri */
      const dish = el('g', {}, svg);
      el('circle', {cx:170, cy:430, r:100, class:'glass'}, dish);
      el('circle', {cx:170, cy:430, r:92, fill:'#d8c38a', opacity:.9}, dish);
      const rr = LAB.seed('col'+o.id), cols = [];
      for (let i = 0; i < 26; i++){ const a = rr()*6.28, R = 12 + rr()*68, c = el('circle', {cx:170+R*Math.cos(a), cy:430+R*Math.sin(a), r:3+rr()*5, fill:'#f3ead2', stroke:'#c9b88a', 'stroke-width':.8}, dish); cols.push(c); }
      el('text', {x:170, y:552, 'text-anchor':'middle', class:'mut'}, dish).textContent = 'Cultivo de 18–24 h';
      /* placa diana */
      const tgt = el('g', {}, svg);
      el('rect', {x:40, y:52, width:270, height:200, rx:12, fill:'url(#steel)', stroke:'var(--lb-line)'}, tgt);
      const defs = el('defs', {}, svg);
      defs.innerHTML = `<linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#cfd6da"/><stop offset=".5" stop-color="#9aa6ad"/><stop offset="1" stop-color="#c3cbcf"/></linearGradient>
        <radialGradient id="ion" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>
        <linearGradient id="specF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".45"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient>`;
      for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) el('circle', {cx:70+c*30, cy:84+r*30, r:10, fill:'#b9c2c7', stroke:'#7d8a91', 'stroke-width':1}, tgt);
      const spot = el('circle', {cx:70, cy:84, r:10, fill:'none', stroke:'var(--accent)', 'stroke-width':2.4, class:'lb-pulse'}, tgt);
      const smear = el('circle', {cx:70, cy:84, r:0, fill:'#efe4c6'}, tgt);
      const cryst = el('g', {opacity:0}, tgt);
      for (let i = 0; i < 14; i++){ const a = i*2.4, R = 2+ (i%5)*1.6; el('path', {d:`M${70+R*Math.cos(a)} ${84+R*Math.sin(a)}l2 -3l2 3z`, fill:'#fff', opacity:.9}, cryst); }
      el('text', {x:175, y:42, 'text-anchor':'middle', class:'mut'}, svg).textContent = 'Placa diana de acero (pocillo A1)';
      /* instrumento */
      const ins = el('g', {}, svg);
      el('rect', {x:372, y:60, width:556, height:170, rx:18, class:'box'}, ins);
      el('text', {x:388, y:84, class:'mut'}, ins).textContent = 'Alto vacío · 10⁻⁷ mbar';
      const plate = el('rect', {x:404, y:126, width:12, height:76, rx:3, fill:'#a8b2b8', opacity:.35}, ins);
      el('text', {x:410, y:220, 'text-anchor':'middle', class:'mut sm'}, ins).textContent = '+20 kV';
      for (let i = 0; i < 6; i++) el('line', {x1:456, x2:456, y1:124+i*14, y2:132+i*14, stroke:'var(--lb-ink)', 'stroke-width':2}, ins);
      el('text', {x:456, y:220, 'text-anchor':'middle', class:'mut sm'}, ins).textContent = '0 V';
      el('rect', {x:470, y:140, width:410, height:46, rx:23, fill:'none', stroke:'var(--lb-line)', 'stroke-dasharray':'5 5'}, ins);
      el('text', {x:675, y:132, 'text-anchor':'middle', class:'mut'}, ins).textContent = 'Tubo de vuelo libre de campo';
      el('rect', {x:884, y:128, width:20, height:70, rx:4, fill:'var(--accent)', opacity:.75}, ins);
      el('text', {x:894, y:220, 'text-anchor':'middle', class:'mut sm'}, ins).textContent = 'Detector';
      el('rect', {x:396, y:90, width:70, height:22, rx:5, fill:'#5b3fa6'}, ins);
      el('text', {x:431, y:106, 'text-anchor':'middle', class:'sm', fill:'#fff'}, ins).textContent = 'Láser N₂';
      const beam = el('line', {x1:431, y1:112, x2:416, y2:163, stroke:'#ff5edb', 'stroke-width':3, opacity:0}, ins);
      const ions = el('g', {}, ins);
      /* espectro */
      const X0 = 400, X1 = 920, Y0 = 520, Y1 = 290, mz = m => X0 + (m-2000)/(14000-2000)*(X1-X0);
      const ax = el('g', {}, svg);
      el('line', {x1:X0, x2:X1, y1:Y0, y2:Y0, stroke:'var(--lb-line)'}, ax);
      for (let m = 2000; m <= 14000; m += 2000){ el('line', {x1:mz(m), x2:mz(m), y1:Y0, y2:Y0+6, stroke:'var(--lb-line)'}, ax); el('text', {x:mz(m), y:Y0+22, 'text-anchor':'middle', class:'mut sm'}, ax).textContent = m.toLocaleString('es'); }
      el('text', {x:X1, y:Y0+42, 'text-anchor':'end', class:'mut sm'}, ax).textContent = 'm/z (Da)';
      el('text', {x:X0, y:Y1-36, class:'mut sm'}, ax).textContent = 'Intensidad relativa';
      const area = el('path', {fill:'url(#specF)'}, svg), line = el('path', {fill:'none', stroke:'var(--accent)', 'stroke-width':1.6}, svg);
      const ref = el('path', {fill:'none', stroke:'var(--accent2)', 'stroke-width':1.4, opacity:0}, svg);
      const lab = el('g', {}, svg), over = el('g', {}, svg);
      const amp = P.map(() => 0);
      const draw = (A2 = amp, target = line, dir = 1, ar = area) => {
        let s = `M${X0} ${Y0}`;
        for (let x = X0; x <= X1; x += 1){ const m = 2000 + (x-X0)/(X1-X0)*12000; let v = 0;
          P.forEach((p,i) => { const sg = 10 + p.m*.003, dd = (m-p.m)/sg; if (Math.abs(dd) < 4) v = Math.max(v, A2[i]*Math.exp(-dd*dd/2)); });
          v += .012*Math.abs(Math.sin(x*1.7)*Math.cos(x*.31)) * (A2 === amp && amp.some(a => a > 0) ? 1 : 0);
          s += `L${x} ${Y0 - dir*v*(Y0-Y1)}`; }
        target.setAttribute('d', s); if (ar) ar.setAttribute('d', s + `L${X1} ${Y0}Z`);
      };

      const pickCol = cols[3];
      return [
        {t:'Tomar una colonia', d:`Con un palillo estéril se toma una colonia aislada y se extiende en capa fina sobre el pocillo A1. Preparación para este aislamiento: <b>${d.prep}</b>.`, btn:'Tomar colonia',
          pre(){ pickCol.classList.add('lb-pulse'); pickCol.setAttribute('stroke','var(--accent)'); pickCol.setAttribute('stroke-width', 2.5); },
          async run(){
            pickCol.classList.remove('lb-pulse');
            const stick = el('line', {x1:pickCol.getAttribute('cx'), y1:pickCol.getAttribute('cy')-60, x2:pickCol.getAttribute('cx'), y2:pickCol.getAttribute('cy'), stroke:'#d9b77c', 'stroke-width':4, 'stroke-linecap':'round'}, svg);
            const x0 = +pickCol.getAttribute('cx'), y0 = +pickCol.getAttribute('cy');
            await ctx.tween(500, t => stick.setAttribute('y2', y0 - 8*(1-t)));
            await ctx.tween(1100, t => { const x = S.lerp(x0, 70, t), y = S.lerp(y0, 84, t) - Math.sin(t*Math.PI)*120; stick.setAttribute('x1', x); stick.setAttribute('x2', x); stick.setAttribute('y1', y-60); stick.setAttribute('y2', y); }, S.ease.io);
            await ctx.tween(700, t => smear.setAttribute('r', 8.5*t));
            stick.remove();
          }},
        {t:'Cubrir con matriz', d:'Se añade 1 µL de matriz (ácido α-ciano-4-hidroxicinámico, HCCA) y se deja secar: cocristaliza con las proteínas y absorbe la energía del láser.', btn:'Añadir matriz',
          async run(){
            const drop = el('path', {d:'M0 -10 C6 0 6 6 0 8 C-6 6 -6 0 0 -10z', fill:'#ffe680', transform:'translate(70 20)'}, svg);
            await ctx.tween(800, t => drop.setAttribute('transform', `translate(70 ${20+t*60})`), S.ease.io);
            drop.remove(); smear.setAttribute('fill', '#f4e9a8');
            await ctx.tween(1100, t => cryst.setAttribute('opacity', t));
            spot.classList.remove('lb-pulse');
          }},
        {t:'Cargar la placa', d:'La placa entra en la fuente de iones del equipo, donde se hace alto vacío para que los iones viajen sin chocar con moléculas de aire.', btn:'Introducir en el equipo',
          async run(){
            await ctx.tween(1200, t => { tgt.setAttribute('transform', `translate(${t*360} ${t*70}) scale(${1-t*.82})`); tgt.setAttribute('opacity', 1-t*.9); }, S.ease.io);
            await ctx.tween(500, t => plate.setAttribute('opacity', .35 + t*.65));
          }},
        {t:'Disparar el láser', d:'Pulsos de láser UV (337 nm) desorben e ionizan la muestra. Un campo de 20 kV acelera los iones; en el tubo vuelan sin fuerza y se separan por su m/z. Observe que los iones pequeños llegan primero al detector.', btn:'Disparar el láser',
          async run(){
            const N = ctx.reduce ? 0 : 150, W = P.reduce((s,p) => s+p.a, 0), parts = [];
            for (let i = 0; i < N; i++){ let r = Math.random()*W, k = 0; while (r > P[k].a && k < P.length-1){ r -= P[k].a; k++; }
              parts.push({k, t0:Math.floor(i/30)*.16 + Math.random()*.04, c:el('circle', {r:2 + P[k].m/4000, cx:416, cy:163, fill:'url(#ion)', opacity:0}, ions), done:false}); }
            const total = 3.4, gain = P.map(p => p.a/Math.max(1, N*p.a/W));
            await ctx.tween(total*1000, (e, t) => {
              const T = t*total;
              beam.setAttribute('opacity', [0,.16,.32,.48,.64].some(s => T > s && T < s+.07) ? 1 : 0);
              parts.forEach(p => { const dt = T - p.t0; if (dt < 0) return; const fl = .9 + 1.9*Math.sqrt(P[p.k].m/12000), u = dt/fl;
                if (u >= 1){ if (!p.done){ p.done = true; p.c.setAttribute('opacity', 0); amp[p.k] = Math.min(P[p.k].a, amp[p.k] + gain[p.k]*P[p.k].a); } return; }
                const x = u < .08 ? 416 + (u/.08)**2*40 : 456 + (u-.08)/.92*428; p.c.setAttribute('cx', x); p.c.setAttribute('cy', 163 + Math.sin(p.k*7+u*9)*6*u); p.c.setAttribute('opacity', 1); });
              draw();
            }, S.ease.lin);
            P.forEach((p,i) => amp[i] = p.a); draw(); ions.innerHTML = ''; beam.setAttribute('opacity', 0);
            [...P].sort((a,b) => b.a-a.a).slice(0,5).forEach(p => { const t = el('text', {x:mz(p.m), y:Y0 - p.a*(Y0-Y1) - 8, 'text-anchor':'middle', class:'sm'}, lab); t.textContent = p.m.toLocaleString('es'); });
          }},
        {t:'Comparar con la biblioteca', d:'El programa compara el espectro con miles de espectros de referencia y calcula una puntuación de similitud (picos coincidentes, intensidad y coherencia).', btn:'Buscar en la base de datos',
          async run(){
            const cands = [[name, d.s], ...d.alt].sort((a,b) => b[1]-a[1]);
            for (let i = cands.length-1; i >= 0; i--){
              const [nm, sc] = cands[i], Q = altPeaks(P, sc, nm), save = P.map(p => ({...p}));
              Q.forEach((q,k) => P[k] = {...P[k], m:q.m}); const QA = Q.map(q => q.a);
              ref.setAttribute('opacity', .9); draw(QA, ref, .95, null); P.forEach((p,k) => P[k] = save[k]);
              over.innerHTML = `<text x="${X1}" y="${Y1+4}" text-anchor="end" class="sm" fill="var(--accent2)">Referencia: ${esc(nm)}</text>`;
              await ctx.wait(900);
            }
            ref.setAttribute('opacity', 0); over.innerHTML = '';
            const lvl = s => s >= 2 ? ['Especie', 'S'] : s >= 1.7 ? ['Género', 'I'] : ['No fiable', 'R'];
            const top = cands[0];
            ctx.result(`<div class="lb-score"><span class="big">${top[1].toFixed(2).replace('.',',')}</span><div><b>${it(esc(top[0]))}</b><small>${d.lvlTxt || (lvl(top[1])[0] === 'Especie' ? 'Identificación a nivel de especie' : 'Identificación probable de género')}</small></div></div>
              <table class="lb-tbl"><thead><tr><th>Coincidencia</th><th>Puntuación</th><th></th></tr></thead><tbody>${cands.map(([n,s]) => `<tr><td>${it(esc(n))}</td><td><span class="bar"><i style="width:${Math.max(0,Math.min(1,(s-1)/1.6))*100}%"></i></span> ${s.toFixed(2).replace('.',',')}</td><td><span class="sir ${lvl(s)[1]}">${lvl(s)[0]}</span></td></tr>`).join('')}</tbody></table>
              <p class="${d.warn ? 'lb-warn' : ''}">${d.warn ? '<b>Atención:</b> ' : ''}${d.note}</p>`);
            ctx.say(d.warn ? 'Puntuación alta, pero con especies muy cercanas: lea la advertencia.' : 'Identificación lista en menos de un minuto por muestra.');
          }}
      ];
    }
  };

  /* ======================= Series bioquímicas ======================= */
  const C = {red:'#cf3a3a', yel:'#e9c43a', blk:'#232022', pur:'#7b3fa0', grn:'#2f8f4a', blu:'#2557c4', pink:'#e0448f', ura:'#eab676', brn:'#b88a52', beige:'#e8dcb3', broth:'#eee0a6', plasma:'#f1d58a', blood:'#9d1c25'};
  function tube(svg, x, y, o){
    const g = el('g', {transform:`translate(${x} ${y})`}, svg), id = 'tc'+Math.random().toString(36).slice(2,8);
    const W = 46, H = 196;
    const shape = `M0 0H${W}V${H-W/2}A${W/2} ${W/2} 0 0 1 0 ${H-W/2}Z`;
    el('clipPath', {id}, g).innerHTML = `<path d="${shape}"/>`;
    const m = el('g', {'clip-path':`url(#${id})`}, g);
    const top = o.kind === 'slant' ? 70 : o.kind === 'deep' ? 70 : 92;
    const butt = el('rect', {x:-2, y:o.kind === 'slant' ? 118 : top, width:W+4, height:H, fill:o.butt}, m);
    const slant = o.kind === 'slant' ? el('path', {d:`M-2 ${top}L${W+2} ${top+52}V122H-2Z`, fill:o.slant}, m) : null;
    const black = el('rect', {x:-2, y:H, width:W+4, height:0, fill:C.blk, opacity:.92}, m);
    const cloud = el('rect', {x:-2, y:top+6, width:W+4, height:H, fill:'#fff', opacity:0}, m);
    const stab = el('line', {x1:W/2, x2:W/2, y1:top+8, y2:H-20, stroke:'#fff', 'stroke-width':2, opacity:0}, m);
    const ring = el('rect', {x:-2, y:top-10, width:W+4, height:12, fill:'transparent'}, m);
    const bub = el('g', {opacity:0}, m);
    [[12,160,4],[30,140,3],[20,176,5],[34,170,2.5],[10,134,2.5]].forEach(([cx,cy,r]) => el('circle', {cx, cy, r, fill:'none', stroke:'#fff', 'stroke-width':1.4}, bub));
    el('path', {d:`M6 150l10 6l-4 8l12 6`, fill:'none', stroke:'#fff', 'stroke-width':1.5}, bub);
    el('path', {d:shape, class:'glass'}, g);
    el('rect', {x:-4, y:-18, width:W+8, height:24, rx:5, fill:o.cap || '#8aa0a8'}, g);
    const lbl = el('text', {x:W/2, y:H+26, 'text-anchor':'middle', class:'tb sm'}, g); lbl.textContent = o.label;
    const res = el('text', {x:W/2, y:H+46, 'text-anchor':'middle', class:'mut sm'}, g);
    return {g, butt, slant, black, cloud, stab, ring, bub, res, W, H, top, x, y};
  }
  const recolor = (n, from, to) => t => n && n.setAttribute('fill', S.mix(from, to, t));

  /* definición de pruebas por panel: init (colores), fin(d) → cambios, read(d) → [corto, explicación] */
  const PANEL = {
    ent:{name:'Gramnegativos: fermentadores y no fermentadores', incub:'18–24 h a 35 °C', tests:[
      {k:'ox', label:'Oxidasa', kind:'strip', read:d => d.ox ? ['+','Púrpura en 10 s: tiene citocromo c oxidasa (Pseudomonas, Vibrio, Neisseria).'] : ['−','Sin cambio: oxidasa negativa (Enterobacterales, Acinetobacter).']},
      {k:'tsi', label:'TSI', kind:'slant', slant:C.red, butt:C.red, fin:d => ({slant:d.tsi[0]==='A'?C.yel:C.red, butt:d.tsi[1]==='A'?C.yel:C.red, gas:d.tsi[2], h2s:d.tsi[3]}),
        read:d => [`${d.tsi[0]}/${d.tsi[1]}${d.tsi[2]?' gas':''}${d.tsi[3]?' H₂S':''}`, d.tsi[0]==='K'&&d.tsi[1]==='K' ? 'K/K: no fermenta la glucosa (no fermentador).' : d.tsi[0]==='K' ? 'K/A: fermenta solo la glucosa; la lactosa y la sacarosa no.' : 'A/A: fermenta glucosa y lactosa o sacarosa.']},
      {k:'sim', label:'SIM', kind:'deep', slant:C.beige, butt:C.beige, reagent:'Kovac', fin:d => ({h2s:d.tsi[3], mot:d.mot, ring:d.ind?C.red:C.yel}),
        read:d => [`${d.tsi[3]?'H₂S+ ':''}Ind ${d.ind?'+':'−'} Mot ${d.mot?'+':'−'}`, `${d.ind?'Anillo rojo con Kovac: degrada triptófano a indol. ':'Anillo amarillo: indol negativo. '}${d.mot?'Crecimiento difuso desde la punción: móvil.':'Crecimiento solo en la línea de punción: inmóvil.'}`]},
      {k:'cit', label:'Citrato', kind:'slant', slant:C.grn, butt:C.grn, fin:d => ({slant:d.cit?C.blu:C.grn, butt:d.cit?C.blu:C.grn}), read:d => d.cit ? ['+','Azul: usa el citrato como única fuente de carbono.'] : ['−','Verde: no usa citrato.']},
      {k:'ure', label:'Urea', kind:'slant', slant:C.ura, butt:C.ura, fin:d => ({slant:d.ure?C.pink:C.ura, butt:d.ure?C.pink:C.ura}), read:d => d.ure ? ['+','Rosado: la ureasa libera amoníaco y alcaliniza.'] : ['−','Sin cambio: ureasa negativa.']},
      {k:'lia', label:'LIA', kind:'slant', slant:C.pur, butt:C.pur, fin:d => ({slant:C.pur, butt:d.lia[1]==='A'?C.yel:C.pur, h2s:d.tsi[3]}), read:d => [d.lia[1]==='A'?'K/A':'K/K', d.lia[1]==='A' ? 'Fondo amarillo: no descarboxila la lisina.' : 'Fondo púrpura: lisina descarboxilasa positiva (o no fermentador).']},
      {k:'mr', label:'RM', kind:'broth', slant:C.broth, butt:C.broth, reagent:'Rojo de metilo', fin:d => ({col:d.mr?C.red:C.yel}), read:d => d.mr ? ['+','Rojo: fermentación ácido-mixta estable.'] : ['−','Amarillo: rojo de metilo negativo.']},
      {k:'vp', label:'VP', kind:'broth', slant:C.broth, butt:C.broth, reagent:'α-naftol + KOH', fin:d => ({col:d.vp?C.red:C.brn}), read:d => d.vp ? ['+','Rojo: produce acetoína (vía butanodiólica).'] : ['−','Cobrizo: Voges-Proskauer negativo.']}
    ]},
    gpc:{name:'Cocos grampositivos', incub:'18–24 h a 35 °C (5 % CO₂ para estreptococos)', tests:[
      {k:'cat', label:'Catalasa', kind:'slide', read:d => d.cat ? ['+','Burbujas con H₂O₂ al 3 %: Staphylococcus.'] : ['−','Sin burbujas: Streptococcus o Enterococcus.']},
      {k:'coa', label:'Coagulasa', kind:'broth', slant:C.plasma, butt:C.plasma, fin:d => ({clot:d.coa}), read:d => d.coa ? ['+','Coágulo en plasma de conejo: S. aureus.'] : ['−','Sin coágulo.']},
      {k:'hem', label:'Agar sangre', kind:'plate', read:d => ({b:['β','Hemólisis completa (halo transparente).'], a:['α','Halo verdoso: oxidación de la hemoglobina.'], g:['γ','Sin hemólisis.']})[d.hem]},
      {k:'opt', label:'Optoquina', kind:'disk', read:d => d.opt ? ['S','Halo ≥14 mm: sensible (S. pneumoniae).'] : ['R','Sin halo: resistente.']},
      {k:'bil', label:'Sol. bilis', kind:'broth', slant:C.broth, butt:C.broth, turb:1, reagent:'Desoxicolato', fin:d => ({clear:d.bil}), read:d => d.bil ? ['+','Se aclara: la autolisina LytA lisa la bacteria.'] : ['−','Sigue turbio.']},
      {k:'be', label:'Bilis-esculina', kind:'slant', slant:C.beige, butt:C.beige, fin:d => ({slant:d.be?C.blk:C.beige, butt:d.be?C.blk:C.beige}), read:d => d.be ? ['+','Ennegrecido: hidroliza la esculina en presencia de bilis.'] : ['−','Sin cambio.']},
      {k:'nacl', label:'NaCl 6,5 %', kind:'broth', slant:C.broth, butt:C.broth, fin:d => ({turb:d.nacl}), read:d => d.nacl ? ['+','Turbio: tolera sal (Enterococcus, S. aureus).'] : ['−','Claro: no crece.']},
      {k:'pyr', label:'PYR', kind:'strip', reagent:'Cinamaldehído', read:d => d.pyr ? ['+','Rojo: pirrolidonil arilamidasa (Enterococcus, S. pyogenes).'] : ['−','Sin color.']}
    ]},
    nei:{name:'Neisseria: utilización de carbohidratos (CTA)', incub:'24–72 h a 35 °C', tests:[
      {k:'ox', label:'Oxidasa', kind:'strip', read:d => d.ox ? ['+','Púrpura: oxidasa positiva.'] : ['−','Sin color.']},
      {k:'cat', label:'Catalasa', kind:'slide', read:d => d.cat ? ['+','Burbujas.'] : ['−','Sin burbujas.']},
      ...[['glu','Glucosa'],['mal','Maltosa'],['lac','Lactosa'],['sac','Sacarosa']].map(([k,l]) => ({k, label:l, kind:'deep', slant:C.red, butt:C.red, fin:d => ({top:d[k]?C.yel:C.red}), read:d => d[k] ? ['+',`Amarillo en la superficie: utiliza ${l.toLowerCase()} (oxidativo).`] : ['−','Sin cambio.']}))
    ]},
    yst:{name:'Levaduras', incub:'2–3 h (tubo germinativo) a 48–72 h', tests:[
      {k:'gt', label:'Tubo germ.', kind:'micro', read:d => d.gt ? ['+','Tubos germinativos sin constricción en 2–3 h en suero a 37 °C.'] : ['−','Sin tubos.']},
      {k:'cla', label:'Clamidosporas', kind:'micro2', read:d => d.cla ? ['+','Clamidosporas terminales en agar harina de maíz con Tween 80.'] : ['−','Ausentes.']},
      {k:'chr', label:'CHROMagar', kind:'plate', read:d => ['Verde','Colonias verdes: C. albicans (C. dubliniensis da verde más oscuro).']},
      {k:'ure', label:'Urea', kind:'slant', slant:C.ura, butt:C.ura, fin:d => ({slant:d.ure?C.pink:C.ura, butt:d.ure?C.pink:C.ura}), read:d => d.ure ? ['+','Rosado (Cryptococcus).'] : ['−','Ureasa negativa: descarta Cryptococcus.']}
    ]}
  };
  const QUIZ = {ent:['ecoli','kpneumo','salmonella','shigella','yersinia','paeru','abaum','vchol'], gpc:['saureus','spneumo','efaecalis'], nei:['nmen','ngon'], yst:['calb']};

  LAB.sims.bioq = {
    key:'bioq', title:'Series bioquímicas', sub:'Pruebas metabólicas clásicas',
    about:`<p>Cada medio revela una capacidad metabólica: fermentar azúcares (el ácido vira el indicador), producir H₂S (precipitado negro de sulfuro de hierro), descarboxilar aminoácidos, hidrolizar urea o usar citrato. El <b>perfil</b> de positivos y negativos se compara con tablas o claves dicotómicas para identificar el género y la especie.</p>
      <p>Primero se orienta con el Gram, la oxidasa y la catalasa; luego se elige la batería adecuada.</p>`,
    refs:'Lecturas típicas; existen cepas atípicas. En la práctica se usan galerías comerciales (API, sistemas automatizados) o MALDI-TOF.',
    mount(ctx){
      const d = ctx.d, P = PANEL[d.p], svg = ctx.svg(), n = P.tests.length;
      el('text', {x:30, y:40, class:'tb'}, svg).textContent = P.name;
      el('text', {x:30, y:62, class:'mut sm'}, svg).textContent = 'Cultivo puro de 18–24 h · ' + P.incub;
      el('rect', {x:20, y:418, width:920, height:16, rx:6, class:'box'}, svg);
      const gap = 900/n, items = P.tests.map((T,i) => ({T, x:30 + gap*i + gap/2 - 23}));
      items.forEach(I => { const T = I.T, x = I.x;
        if (['slant','deep','broth'].includes(T.kind)) I.tube = tube(svg, x, 170, {kind:T.kind, slant:T.slant, butt:T.butt, label:T.label, cap:T.kind==='broth'?'#b9a27a':'#8aa0a8'});
        else { const g = el('g', {transform:`translate(${x} 170)`}, svg); I.tube = {g, res:null};
          if (T.kind === 'strip'){ el('rect', {x:3, y:110, width:40, height:60, rx:4, fill:'#f4f1e6', stroke:'var(--lb-line)'}, g); I.spot = el('circle', {cx:23, cy:140, r:12, fill:'#e9e2c8'}, g); }
          if (T.kind === 'slide'){ el('rect', {x:-8, y:120, width:62, height:36, rx:3, fill:'#cfe3ea', opacity:.7, stroke:'var(--lb-line)'}, g); I.spot = el('circle', {cx:23, cy:138, r:9, fill:'#efe6cc'}, g); I.bub = el('g', {opacity:0}, g); for (let k = 0; k < 10; k++) el('circle', {cx:12+(k*7)%24, cy:128+(k*5)%20, r:1.5+(k%3), fill:'none', stroke:'#fff', 'stroke-width':1.2}, I.bub); }
          if (T.kind === 'plate' || T.kind === 'disk'){ const base = T.k === 'chr' ? '#e9d7c1' : C.blood; el('circle', {cx:23, cy:130, r:40, class:'glass'}, g); I.agar = el('circle', {cx:23, cy:130, r:36, fill:base}, g);
            I.halo = el('circle', {cx:23, cy:130, r:0, fill:'#e8b18a', opacity:.6}, g); I.colg = el('g', {opacity:0}, g);
            for (let k = 0; k < 9; k++){ const a = k*.7, R = 6+k*2.6; el('circle', {cx:23+R*Math.cos(a), cy:130+R*Math.sin(a), r:2.6, fill:T.k==='chr'?'#3fae6a':'#e8e0cf'}, I.colg); }
            if (T.kind === 'disk') el('circle', {cx:23, cy:130, r:5, fill:'#fff', stroke:'#999'}, g); }
          if (T.kind === 'micro' || T.kind === 'micro2'){ el('circle', {cx:23, cy:130, r:40, fill:'#f7f3e6', stroke:'var(--lb-line)', 'stroke-width':3}, g); I.colg = el('g', {opacity:0}, g);
            for (let k = 0; k < 6; k++){ const cx = 6+(k*13)%36, cy = 112+(k*17)%38; el('ellipse', {cx, cy, rx:4.5, ry:3.6, fill:'#c8b8e8', stroke:'#7a64b8'}, I.colg);
              if (T.kind === 'micro') el('path', {d:`M${cx+4} ${cy}q8 ${k%2?-6:6} 16 ${k%2?-2:3}`, fill:'none', stroke:'#7a64b8', 'stroke-width':2.4, 'stroke-linecap':'round'}, I.colg);
              else el('circle', {cx:cx+9, cy:cy-6, r:5, fill:'#9b84d6', stroke:'#5b44a0', 'stroke-width':1.5}, I.colg); } }
          const l = el('text', {x:23, y:222, 'text-anchor':'middle', class:'tb sm'}, g); l.textContent = T.label;
          I.tube.res = el('text', {x:23, y:242, 'text-anchor':'middle', class:'mut sm'}, g); }
      });
      const clock = el('g', {opacity:0, transform:'translate(860 60)'}, svg);
      el('circle', {r:30, class:'box'}, clock); const hand = el('line', {x1:0, y1:0, x2:0, y2:-22, stroke:'var(--accent)', 'stroke-width':3, 'stroke-linecap':'round'}, clock);
      const hrs = el('text', {y:52, 'text-anchor':'middle', class:'sm'}, clock);
      const cover = el('rect', {x:20, y:140, width:920, height:300, rx:16, fill:'#ffb347', opacity:0}, svg);

      const apply = async () => {
        await ctx.tween(1800, t => items.forEach(I => { const T = I.T, f = T.fin ? T.fin(d) : {}, tb = I.tube;
          if (f.slant) recolor(tb.slant || tb.butt, T.slant, f.slant)(t);
          if (f.butt) recolor(tb.butt, T.butt, f.butt)(t);
          if (f.col){ recolor(tb.butt, T.butt, f.col)(0); }
          if (f.top) tb.ring.setAttribute('fill', S.mix(T.butt, f.top, t)), tb.ring.setAttribute('height', 40), tb.ring.setAttribute('y', tb.top-2);
          if (f.h2s){ tb.black.setAttribute('y', tb.H - 90*t); tb.black.setAttribute('height', 90*t); }
          if (f.gas) tb.bub.setAttribute('opacity', t);
          if (T.kind === 'deep' && T.k === 'sim'){ if (f.mot) tb.cloud.setAttribute('opacity', .35*t); else tb.stab.setAttribute('opacity', .8*t); }
          if (f.turb || T.turb) tb.cloud.setAttribute('opacity', .45*t);
          if (f.clot) tb.butt.setAttribute('fill', S.mix(C.plasma, '#d9a94a', t));
          if (T.kind === 'plate' || T.kind === 'disk'){ I.colg.setAttribute('opacity', t);
            if (T.k === 'hem' && d.hem !== 'g') { I.halo.setAttribute('r', 30*t); I.halo.setAttribute('fill', d.hem === 'b' ? '#f0c7a8' : '#6f8f3a'); }
            if (T.k === 'opt'){ I.colg.setAttribute('opacity', d.opt ? 0 : t); I.halo.setAttribute('r', d.opt ? 16*t : 0); I.halo.setAttribute('fill', '#c45a5a'); } }
          if (T.kind === 'micro' || T.kind === 'micro2') I.colg.setAttribute('opacity', t);
        }));
      };
      const readAll = () => {
        items.forEach(I => { const [s] = I.T.read(d); if (I.tube.res) I.tube.res.textContent = s; const tgt = I.tube.g;
          ctx.clickable(tgt, `${I.T.label}: ${s}`, () => { items.forEach(J => J.tube.g.classList.remove('sel')); tgt.classList.add('sel'); const [sh, ex] = I.T.read(d); ctx.say(`<b>${I.T.label} · ${sh}</b><br>${ex}`); }); });
      };
      const opts = (() => { const pool = QUIZ[d.p].filter(x => x !== ctx.o.id); const r = LAB.seed(ctx.o.id+'q'); const pick = pool.sort(() => r()-.5).slice(0,3); const all = [ctx.o.id, ...pick]; return all.sort(() => r()-.5); })();

      return [
        {t:'Inocular la batería', d:'Con el asa o la aguja recta se siembra cada medio: punción hasta el fondo y estría en la superficie inclinada (TSI, LIA, citrato, urea); punción recta en SIM; suspensión en caldos.', btn:'Inocular',
          async run(){
            const nd = el('line', {x1:0, y1:0, x2:0, y2:120, stroke:'#c0c6ca', 'stroke-width':3, 'stroke-linecap':'round'}, svg);
            for (const I of items){ const x = I.x + 23; nd.setAttribute('x1', x); nd.setAttribute('x2', x);
              await ctx.tween(260, t => { nd.setAttribute('y1', 30 + t*130); nd.setAttribute('y2', 150 + t*130); }, S.ease.io);
              if (I.spot) I.spot.setAttribute('fill', '#e4d8b2');
              await ctx.tween(200, t => { nd.setAttribute('y1', 160 - t*130); nd.setAttribute('y2', 280 - t*130); }); }
            nd.remove();
          }},
        {t:'Incubar', d:`Incubación ${P.incub}. Los indicadores de pH viran según los productos del metabolismo: ácido (amarillo con rojo de fenol) o álcali (rojo o fucsia).`, btn:'Incubar',
          async run(){
            clock.setAttribute('opacity', 1);
            await ctx.tween(500, t => cover.setAttribute('opacity', .12*t));
            await ctx.tween(1800, t => { hand.setAttribute('transform', `rotate(${t*720})`); hrs.textContent = Math.round(t*24) + ' h'; }, S.ease.io);
            await ctx.tween(400, t => cover.setAttribute('opacity', .12*(1-t)));
            await apply();
          }},
        {t:'Añadir reactivos', d:'Algunas pruebas se revelan al final: Kovac para el indol, rojo de metilo, α-naftol y KOH para Voges-Proskauer, reactivo de oxidasa, peróxido para catalasa, cinamaldehído para PYR o desoxicolato para la solubilidad en bilis.', btn:'Revelar',
          async run(){
            for (const I of items){ const T = I.T, f = T.fin ? T.fin(d) : {}, tb = I.tube, x = I.x + 23;
              const need = T.reagent || ['strip','slide'].includes(T.kind); if (!need) continue;
              const drop = el('path', {d:'M0 -9 C5 0 5 5 0 7 C-5 5 -5 0 0 -9z', fill:'#f6d36b', transform:`translate(${x} 110)`}, svg);
              await ctx.tween(380, t => drop.setAttribute('transform', `translate(${x} ${110 + t*(T.kind==='strip'||T.kind==='slide'?190:150)})`), S.ease.io); drop.remove();
              if (T.k === 'sim') await ctx.tween(500, t => { tb.ring.setAttribute('fill', S.mix('#f5e9b0', f.ring, t)); tb.ring.setAttribute('y', tb.top-10); tb.ring.setAttribute('height', 14); });
              else if (T.kind === 'broth' && f.col) await ctx.tween(600, recolor(tb.butt, T.butt, f.col));
              else if (T.k === 'bil') await ctx.tween(700, t => tb.cloud.setAttribute('opacity', .45*(1 - (f.clear ? t : 0))));
              else if (T.k === 'ox') await ctx.tween(600, t => I.spot.setAttribute('fill', S.mix('#e4d8b2', d.ox ? '#3c1a6b' : '#e4d8b2', t)));
              else if (T.k === 'pyr') await ctx.tween(600, t => I.spot.setAttribute('fill', S.mix('#e4d8b2', d.pyr ? '#d42a4a' : '#efe2a8', t)));
              else if (T.k === 'cat') await ctx.tween(600, t => I.bub.setAttribute('opacity', d.cat ? t : 0));
            }
          }},
        {t:'Leer e interpretar', d:'Toque cada prueba para ver su lectura. Con el perfil completo, use la clave de identificación.', btn:'Leer resultados',
          async run(){
            readAll();
            const rows = P.tests.map(T => { const [s, ex] = T.read(d); return `<tr><td>${T.label}</td><td><b>${s}</b></td><td>${ex}</td></tr>`; }).join('');
            ctx.result(`<table class="lb-tbl"><thead><tr><th>Prueba</th><th>Lectura</th><th>Significado</th></tr></thead><tbody>${rows}</tbody></table>${d.note ? `<p class="lb-warn">${d.note}</p>` : ''}
              <div class="lb-quiz"><h4>¿Qué microorganismo tiene este perfil?</h4><div>${opts.map(id => `<button type="button" class="lb-btn sm" data-q="${id}">${it(esc(LAB.byId(id).sp))}</button>`).join('')}</div><p id="lbQ" aria-live="polite"></p></div>`);
            document.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { const ok = b.dataset.q === ctx.o.id; b.classList.add(ok ? 'ok' : 'no');
              document.getElementById('lbQ').innerHTML = ok ? `Correcto: el perfil corresponde a ${it(esc(ctx.o.sp))}.` : 'Ese perfil no coincide. Revise las pruebas clave y vuelva a intentarlo.'; });
            ctx.say('Toque cualquier tubo o placa para ver su lectura e interpretación.');
          }}
      ];
    }
  };
})(window.ATLAS);
