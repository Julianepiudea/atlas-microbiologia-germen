/* Atlas de Microbiología GERMEN · Laboratorio virtual: diagnóstico molecular (PCR convencional y PCR multiplex tipo FilmArray) */
(function (A) {
  const LAB = A.LAB, S = LAB.S, el = S.el, esc = LAB.esc;
  const it = s => `<i class="sp">${s}</i>`;

  /* ======================= PCR convencional ======================= */
  const REAG = [['buf','Tampón','#9fc2d8','Mantiene el pH y la fuerza iónica.'],['mg','MgCl₂','#c9d6df','Cofactor indispensable de la polimerasa.'],['dntp','dNTP','#f2c14e','Los cuatro nucleótidos: los «ladrillos» del ADN nuevo.'],
    ['fw','Cebador F','#58c49a','Oligonucleótido que reconoce el extremo 5′ de la diana.'],['rv','Cebador R','#3aa6c9','Oligonucleótido de la hebra complementaria.'],['taq','Taq','#c77dff','ADN polimerasa termoestable de Thermus aquaticus.'],['tpl','ADN molde','#ff8c6e','ADN extraído del aislamiento o de la muestra.']];

  LAB.sims.pcr = {
    key:'pcr', title:'PCR convencional', sub:'Amplificación y electroforesis',
    about:`<p>La <b>reacción en cadena de la polimerasa</b> copia un fragmento específico de ADN delimitado por dos <b>cebadores</b>. Cada ciclo tiene tres pasos: <b>desnaturalización</b> (94–95 °C, se separan las hebras), <b>hibridación</b> (50–65 °C, los cebadores se unen) y <b>extensión</b> (72 °C, la Taq polimerasa sintetiza la hebra nueva).</p>
      <p>Cada ciclo duplica el número de copias (2ⁿ): tras 30 ciclos hay más de mil millones. El producto se ve en un <b>gel de agarosa</b>, donde el ADN migra hacia el polo positivo y los fragmentos pequeños avanzan más; se compara con un marcador de peso molecular.</p>`,
    refs:'Tamaños de amplicón según pares de cebadores publicados de uso frecuente; con otros cebadores varían.',
    mount(ctx){
      const d = ctx.d, svg = ctx.svg(), st = {mix:new Set(), ta:d.tm - 4};
      el('text', {x:30, y:40, class:'tb'}, svg).textContent = `Diana: ${d.gene} · ${d.bp} pb`;
      el('text', {x:30, y:62, class:'mut sm'}, svg).textContent = d.what;
      /* gradilla de reactivos */
      const rack = el('g', {}, svg), vials = {};
      REAG.forEach(([k, n, c], i) => { const x = 34 + (i%4)*74, y = 92 + Math.floor(i/4)*112, g = el('g', {transform:`translate(${x} ${y})`}, rack);
        el('rect', {x:6, y:0, width:34, height:12, rx:3, fill:c}, g); el('path', {d:'M4 12h38l-5 54q-14 12 -28 0z', fill:'rgba(255,255,255,.2)', stroke:'#7d8a91', 'stroke-width':1.6}, g);
        el('path', {d:'M8 34h30l-3 32q-12 9 -24 0z', fill:c, opacity:.6}, g);
        const t = el('text', {x:23, y:86, 'text-anchor':'middle', class:'sm'}, g); t.textContent = n; const ok = el('text', {x:23, y:-6, 'text-anchor':'middle', class:'tb sm', fill:'var(--accent)'}, g); vials[k] = {g, ok, x:x+23, y}; });
      /* tubo de PCR */
      const tb = el('g', {transform:'translate(120 330)'}, svg);
      el('path', {d:'M0 0h44l-8 80q-14 14 -28 0z', fill:'rgba(255,255,255,.18)', stroke:'#7d8a91', 'stroke-width':2}, tb); el('rect', {x:-4, y:-12, width:52, height:12, rx:4, fill:'#c8d2d8'}, tb);
      const lvl = el('path', {d:'M10 70h24l-2 10q-10 8 -20 0z', fill:'#b8e0f0', opacity:.0}, tb);
      el('text', {x:22, y:122, 'text-anchor':'middle', class:'sm'}, tb).textContent = 'Mezcla de reacción (25 µL)';
      const list = el('text', {x:30, y:500, class:'mut sm'}, svg);
      const upd = () => { list.textContent = `${st.mix.size}/7 componentes`; lvl.setAttribute('opacity', st.mix.size ? .35 + st.mix.size*.08 : 0); };
      const add = async k => { if (st.mix.has(k)) return; st.mix.add(k); const v = vials[k]; v.ok.textContent = '✓';
        const tip = el('path', {d:'M-3 -40h6l-1 34h-4z', fill:'#e6ecef', stroke:'#7d8a91', transform:`translate(${v.x} ${v.y})`}, svg);
        await ctx.tween(500, t => tip.setAttribute('transform', `translate(${S.lerp(v.x, 142, t)} ${S.lerp(v.y, 330, t) - Math.sin(t*Math.PI)*40})`), S.ease.io); tip.remove(); upd();
        ctx.say(`${REAG.find(r => r[0] === k)[1]}: ${REAG.find(r => r[0] === k)[3]}`); };
      upd();
      /* termociclador */
      const GX0 = 350, GX1 = 930, GY = T => 230 - (T-40)/(100-40)*150;
      const th = el('g', {}, svg);
      el('rect', {x:GX0-20, y:60, width:GX1-GX0+30, height:200, rx:16, class:'box'}, th);
      el('text', {x:GX0, y:84, class:'tb sm'}, th).textContent = 'Termociclador';
      const cyc = el('text', {x:GX1-6, y:84, 'text-anchor':'end', class:'tb sm'}, th);
      const prof = el('path', {fill:'none', stroke:'var(--accent)', 'stroke-width':2.4}, th);
      const tempT = el('text', {x:GX0, y:250, class:'mut sm'}, th);
      /* vista molecular */
      const mol = el('g', {}, svg);
      const MY = 340, MX0 = 370, MX1 = 910;
      const top = el('line', {x1:MX0, x2:MX1, y1:MY, y2:MY, stroke:'#5fd2ee', 'stroke-width':6, 'stroke-linecap':'round'}, mol);
      const bot = el('line', {x1:MX0, x2:MX1, y1:MY+14, y2:MY+14, stroke:'#ff9b72', 'stroke-width':6, 'stroke-linecap':'round'}, mol);
      const tgt = el('rect', {x:530, y:MY-14, width:220, height:42, rx:8, fill:'none', stroke:'var(--accent)', 'stroke-dasharray':'5 5'}, mol);
      el('text', {x:640, y:MY-22, 'text-anchor':'middle', class:'sm'}, mol).textContent = `Región diana (${d.gene})`;
      const pF = el('path', {d:'M0 0h46l10 0', stroke:'#58c49a', 'stroke-width':6, fill:'none', 'stroke-linecap':'round', opacity:0}, mol);
      const pR = el('path', {d:'M0 0h-46', stroke:'#3aa6c9', 'stroke-width':6, fill:'none', 'stroke-linecap':'round', opacity:0}, mol);
      const nF = el('line', {stroke:'#58c49a', 'stroke-width':6, 'stroke-linecap':'round', opacity:0}, mol), nR = el('line', {stroke:'#3aa6c9', 'stroke-width':6, 'stroke-linecap':'round', opacity:0}, mol);
      const pol = el('ellipse', {rx:16, ry:11, fill:'#c77dff', opacity:0}, mol);
      const phase = el('text', {x:640, y:440, 'text-anchor':'middle', class:'tb'}, mol);
      const copies = el('text', {x:640, y:466, 'text-anchor':'middle', class:'mut sm'}, mol);
      const cbar = el('rect', {x:450, y:480, width:0, height:10, rx:5, fill:'var(--accent)'}, mol); el('rect', {x:450, y:480, width:380, height:10, rx:5, fill:'none', stroke:'var(--lb-line)'}, mol);
      mol.setAttribute('opacity', 0);

      const outcome = () => { const m = st.mix, core = ['mg','dntp','fw','rv','taq'].every(k => m.has(k));
        if (!core) return {amp:0, why:`Falta ${REAG.filter(r => ['mg','dntp','fw','rv','taq'].includes(r[0]) && !m.has(r[0])).map(r => r[1]).join(', ')}: no hay amplificación ni siquiera en el control positivo.`};
        let amp = m.has('buf') ? 1 : .45, extra = 0, why = '';
        if (st.ta < d.tm - 8){ extra = 1; why = 'Hibridación demasiado baja: los cebadores se unen a sitios parecidos y aparecen bandas inespecíficas.'; }
        else if (st.ta > d.tm + 2){ amp *= st.ta > d.tm + 5 ? 0 : .3; why = 'Hibridación demasiado alta: los cebadores casi no se unen y el producto es escaso o nulo.'; }
        if (!m.has('buf')) why += ' Sin tampón la eficiencia cae.';
        return {amp, extra, why, tpl:m.has('tpl')}; };

      return [
        {t:'Preparar la mezcla de reacción', d:'En hielo y en un área limpia se combinan los componentes. Toque cada reactivo para añadirlo al tubo: si falta alguno, la reacción fallará y los controles lo delatarán.', btn:'Preparar mezcla',
          async run(auto){
            if (auto){ for (const r of REAG) await add(r[0]); return; }
            return new Promise(res => { REAG.forEach(([k]) => ctx.clickable(vials[k].g, `Añadir ${REAG.find(r => r[0] === k)[1]}`, () => add(k), true));
              const b = LAB.sbtn(ctx, svg, 30, 512, 250, 'Tubo listo', () => { b.remove(); if (st.mix.size < 7) ctx.say(`Ha preparado la mezcla con ${st.mix.size} de 7 componentes. Veremos qué ocurre…`); res(); }, true); });
          }},
        {t:'Programar el termociclador', d:`Temperatura de fusión (Tm) de los cebadores: ${d.tm} °C. La hibridación suele programarse 3–5 °C por debajo de la Tm. Ajuste la temperatura de hibridación y confirme: 35 ciclos de 95 °C · Ta · 72 °C.`, btn:'Programar',
          async run(auto){
            const g = el('g', {}, svg), X0 = GX0 + 20, X1 = GX1 - 40, tx = T => X0 + (T-45)/(72-45)*(X1-X0);
            el('text', {x:X0, y:118, class:'sm'}, g).textContent = 'Temperatura de hibridación (Ta)';
            el('line', {x1:X0, x2:X1, y1:150, y2:150, stroke:'var(--lb-line)', 'stroke-width':6, 'stroke-linecap':'round'}, g);
            el('rect', {x:tx(d.tm-5), y:144, width:tx(d.tm-3)-tx(d.tm-5), height:12, rx:6, fill:'var(--accent)', opacity:.35}, g);
            [45,50,55,60,65,70].forEach(T => el('text', {x:tx(T), y:178, 'text-anchor':'middle', class:'mut sm'}, g).textContent = T + ' °C');
            const knob = el('circle', {cy:150, r:13, fill:'var(--accent)', stroke:'#fff', 'stroke-width':3, class:'lb-hit'}, g), val = el('text', {y:132, 'text-anchor':'middle', class:'tb sm'}, g);
            const set = T => { st.ta = Math.round(Math.max(45, Math.min(72, T))); knob.setAttribute('cx', tx(st.ta)); val.setAttribute('x', tx(st.ta)); val.textContent = `${st.ta} °C`; };
            set(auto ? d.tm - 4 : 48);
            if (auto){ await ctx.tween(900, t => set(S.lerp(48, d.tm-4, t))); g.remove(); return; }
            return new Promise(res => {
              let drag = false; svg.style.touchAction = 'none';
              knob.addEventListener('pointerdown', e => { drag = true; svg.setPointerCapture(e.pointerId); });
              svg.addEventListener('pointermove', e => { if (drag){ const p = ctx.pt(svg, e); set(45 + (p.x - X0)/(X1-X0)*27); } });
              svg.addEventListener('pointerup', () => drag = false);
              LAB.sbtn(ctx, g, X0, 196, 44, '−', () => set(st.ta - 1)); LAB.sbtn(ctx, g, X0 + 52, 196, 44, '+', () => set(st.ta + 1));
              LAB.sbtn(ctx, g, X1 - 200, 196, 200, 'Confirmar programa', () => { svg.style.touchAction = ''; g.remove(); ctx.say(`Programa: 95 °C 30 s · ${st.ta} °C 30 s · 72 °C 45 s, 35 ciclos, y extensión final de 72 °C 5 min.`); res(); }, true);
            });
          }},
        {t:'Ciclos de amplificación', d:'Observe las tres etapas de cada ciclo y cómo las copias del amplicón crecen de forma exponencial hasta llegar a una meseta, cuando se agotan los reactivos.', btn:'Iniciar ciclos',
          async run(){
            const out = st.out = outcome(); mol.setAttribute('opacity', 1);
            let path = `M${GX0} ${GY(25)}`, x = GX0; const seg = (T, w) => { path += `L${x+4} ${GY(T)}L${x+w} ${GY(T)}`; x += w; prof.setAttribute('d', path); };
            const step = async (T, label, w, anim) => { tempT.textContent = `${label} · ${T} °C`; phase.textContent = label; seg(T, w); if (anim) await anim(); };
            for (let c = 1; c <= 3; c++){
              cyc.textContent = `Ciclo ${c} de 35`;
              await step(95, 'Desnaturalización', 26, () => ctx.tween(700, t => { top.setAttribute('y1', MY - 26*t); top.setAttribute('y2', MY - 26*t); bot.setAttribute('y1', MY+14 + 26*t); bot.setAttribute('y2', MY+14 + 26*t); [pF,pR,nF,nR,pol].forEach(e => e.setAttribute('opacity', 0)); }));
              await step(st.ta, 'Hibridación de los cebadores', 26, () => ctx.tween(700, t => { const ok = out.amp > 0 && st.mix.has('fw') && st.mix.has('rv');
                pF.setAttribute('transform', `translate(530 ${MY+31 + 14*(1-t)})`); pR.setAttribute('transform', `translate(750 ${MY-17 - 14*(1-t)})`); pF.setAttribute('opacity', ok ? t : t*.25); pR.setAttribute('opacity', ok ? t : t*.25); }));
              await step(72, 'Extensión por la Taq polimerasa', 26, () => ctx.tween(900, t => { if (!out.amp) return; const a = Math.min(1, out.amp);
                nF.setAttribute('x1', 586); nF.setAttribute('y1', MY+31); nF.setAttribute('x2', 586 + 300*t*a); nF.setAttribute('y2', MY+31); nF.setAttribute('opacity', 1);
                nR.setAttribute('x1', 704); nR.setAttribute('y1', MY-17); nR.setAttribute('x2', 704 - 300*t*a); nR.setAttribute('y2', MY-17); nR.setAttribute('opacity', 1);
                pol.setAttribute('cx', 586 + 300*t*a); pol.setAttribute('cy', MY+31); pol.setAttribute('opacity', 1); }));
              copies.textContent = out.amp && out.tpl ? `Copias del amplicón por molécula de molde: ${2**c}` : 'Sin productos nuevos';
            }
            phase.textContent = 'Ciclos 4–35 (acelerado)'; tempT.textContent = '';
            let drawn = 3; const w3 = (GX1 - 10 - x)/32/3;
            await ctx.tween(2600, t => { const c = 3 + Math.round(t*32); cyc.textContent = `Ciclo ${c} de 35`; while (drawn < c){ seg(95, w3); seg(st.ta, w3); seg(72, w3); drawn++; }
              const eff = out.amp && out.tpl ? out.amp : 0, lg = Math.min(c, 30)*Math.log10(2)*eff, plate = Math.min(1, lg/9.03);
              cbar.setAttribute('width', 380*plate); copies.textContent = eff ? `≈ 10^${lg.toFixed(1).replace('.',',')} copias${c > 30 ? ' · meseta' : ''}` : 'Sin amplificación detectable'; }, S.ease.lin);
            cyc.textContent = 'Fin: extensión final a 72 °C'; mol.setAttribute('opacity', .2);
          }},
        {t:'Electroforesis en gel de agarosa', d:'Gel de agarosa al 1,5 % con un colorante de ADN. Se cargan el marcador de peso molecular, la muestra, el control positivo y el control negativo (sin molde), y se aplica corriente.', btn:'Correr el gel',
          async run(){
            mol.remove(); const out = st.out;
            const g = el('g', {}, svg), GX = 470, GYt = 280, GW = 360, GH = 250;
            el('rect', {x:GX, y:GYt, width:GW, height:GH, rx:8, fill:'#1d2a32', stroke:'#3d5560'}, g);
            el('text', {x:GX-12, y:GYt+8, 'text-anchor':'end', class:'sm'}, g).textContent = '− (cátodo)'; el('text', {x:GX-12, y:GYt+GH, 'text-anchor':'end', class:'sm'}, g).textContent = '+ (ánodo)';
            const lanes = [['M','Marcador 100 pb'],['1','Muestra'],['C+','Control +'],['C−','Control −']], lx = k => GX + 50 + k*86;
            lanes.forEach(([l], k) => { el('rect', {x:lx(k)-24, y:GYt+14, width:48, height:8, rx:2, fill:'#0d161b'}, g); el('text', {x:lx(k), y:GYt-10, 'text-anchor':'middle', class:'tb sm'}, g).textContent = l; });
            const y = bp => GYt + 34 + (Math.log10(1600) - Math.log10(bp))/(Math.log10(1600) - Math.log10(80))*(GH-50);
            const bands = [], band = (k, bp, a, w = 46, smear) => { const r = el('rect', {x:lx(k)-w/2, y:GYt+16, width:w, height:smear ? 30 : 5, rx:2, fill:'#ff9df5', opacity:0}, g); bands.push({r, to:y(bp), a}); };
            [100,200,300,400,500,600,700,800,900,1000,1500].forEach(bp => band(0, bp, bp === 500 || bp === 1000 ? 1 : .6));
            const prod = (k, has) => { if (!has || !out.amp) return; band(k, d.bp, Math.min(1, out.amp));
              if (out.extra){ const r = LAB.seed(d.gene); band(k, Math.round(d.bp*(.35+r()*.2)), .45); band(k, Math.round(d.bp*(1.6+r()*.5)), .35); band(k, Math.round(d.bp*.7), .25, 46, true); } };
            prod(1, out.tpl); prod(2, true);
            const dye = el('g', {}, g); lanes.forEach((_, k) => el('rect', {x:lx(k)-20, y:GYt+16, width:40, height:5, fill:'#4a68ff', opacity:.8}, dye));
            await ctx.tween(2600, t => { dye.setAttribute('transform', `translate(0 ${t*(GH-70)})`); bands.forEach(b => b.r.setAttribute('y', GYt+16 + (b.to - GYt - 16)*t)); }, S.ease.io);
            el('text', {x:GX+GW/2, y:GYt+GH+26, 'text-anchor':'middle', class:'mut sm'}, svg).textContent = 'Transiluminador UV / luz azul';
            await ctx.tween(900, t => { g.firstChild.setAttribute('fill', S.mix('#1d2a32', '#0b0f1a', t)); bands.forEach(b => b.r.setAttribute('opacity', b.a*t)); dye.setAttribute('opacity', 1-t); });
            [100,500,1000,1500].forEach(bp => el('text', {x:GX-12, y:y(bp)+5, 'text-anchor':'end', class:'mut sm'}, g).textContent = bp + ' pb');
          }},
        {t:'Interpretar', d:'La prueba es válida si el control positivo muestra la banda esperada y el negativo está limpio. Una banda del tamaño esperado en la muestra indica que la diana está presente.', btn:'Interpretar',
          async run(){
            const out = st.out, valid = out.amp > 0, pos = valid && out.tpl;
            ctx.result(`<div class="lb-score"><span class="big ${pos ? '' : 'neg'}">${!valid ? 'Inválida' : pos ? 'Positiva' : 'Negativa'}</span><div><b>${d.gene} · ${d.bp} pb</b><small>${d.what}</small></div></div>
              <ul class="lb-list"><li>Control positivo: ${valid ? `banda de ${d.bp} pb ✓` : 'sin banda ✗'}</li><li>Control negativo: limpio ✓ (sin contaminación)</li><li>Muestra: ${pos ? `banda a la altura de ${d.bp} pb${out.extra ? ' y bandas inespecíficas' : ''}` : 'sin banda'}</li></ul>
              ${out.why ? `<p class="lb-warn">${out.why}</p>` : ''}${valid && !out.tpl ? '<p class="lb-warn">El tubo de la muestra no tenía ADN molde: resultado falsamente negativo. Por eso muchos ensayos incluyen un control interno de amplificación en cada tubo.</p>' : ''}
              ${d.approx ? '<p class="lb-refs">Tamaño del amplicón aproximado.</p>' : ''}
              <p>Hoy predomina la <b>PCR en tiempo real</b>, que mide la fluorescencia en cada ciclo, no necesita gel y permite cuantificar (por ejemplo, la carga viral).</p>`);
          }}
      ];
    }
  };

  /* ======================= PCR multiplex tipo FilmArray ======================= */
  LAB.sims.film = {
    key:'film', title:'PCR multiplex (FilmArray)', sub:'Panel sindrómico en una hora',
    about:`<p>Los paneles <b>sindrómicos</b> (BioFire FilmArray) detectan a la vez decenas de patógenos y genes de resistencia en una bolsa (<i>pouch</i>) cerrada que contiene todos los reactivos liofilizados.</p>
      <p>El equipo hace todo: <b>lisis mecánica</b> con perlas, <b>extracción</b> con perlas magnéticas, una <b>PCR multiplex</b> de primera etapa y una <b>PCR anidada</b> de segunda etapa en una matriz de pocillos, cada uno con cebadores para una diana. Al final, un <b>análisis de curvas de fusión</b> confirma cada producto por su temperatura de fusión característica. Requiere unos 2 minutos de trabajo manual y alrededor de una hora de corrida.</p>`,
    refs:'Composición de paneles: BCID2 (43 dianas), gastrointestinal (22), meningitis/encefalitis (14) y respiratorio RP2.1 (22). Curvas y disposición de la matriz esquemáticas.',
    mount(ctx){
      const d = ctx.d, P = LAB.PANELS[d.p], svg = ctx.svg(), T = P.targets, hit = new Set(d.hit);
      el('text', {x:30, y:40, class:'tb'}, svg).textContent = P.name;
      el('text', {x:30, y:62, class:'mut sm'}, svg).textContent = `Muestra: ${P.sample} · ${T.length} dianas`;
      /* pouch */
      const pc = el('g', {transform:'translate(30 90)'}, svg);
      el('rect', {x:0, y:0, width:500, height:400, rx:18, fill:'rgba(255,255,255,.08)', stroke:'var(--lb-line)', 'stroke-width':2}, pc);
      el('rect', {x:10, y:20, width:58, height:360, rx:10, fill:'#cfd6da', opacity:.85}, pc);
      const ports = []; for (let i = 0; i < 11; i++) ports.push(el('circle', {cx:39, cy:44 + i*31, r:9, fill:'#eef1f2', stroke:'#8a979e'}, pc));
      el('text', {x:39, y:396, 'text-anchor':'middle', class:'mut sm'}, pc).textContent = 'Reactivos';
      const blist = (x, y, w, h, n) => { el('rect', {x, y, width:w, height:h, rx:h/2, fill:'rgba(255,255,255,.12)', stroke:'var(--lb-line)'}, pc); const t = el('text', {x:x+w/2, y:y+h+18, 'text-anchor':'middle', class:'mut sm'}, pc); t.textContent = n; return el('g', {}, pc); };
      const lys = blist(92, 40, 110, 70, 'Lisis con perlas'), mag = blist(92, 150, 110, 60, 'Perlas magnéticas'), p1 = blist(92, 250, 110, 60, 'PCR 1 (multiplex)');
      const nW = Math.max(T.length*2 + 4, 36), cols = 12, rows = Math.ceil(nW/cols), cw = 22, wells = [];
      const AX = 230, AY = 40;
      el('rect', {x:AX-10, y:AY-10, width:cols*cw+20, height:rows*cw+20, rx:10, fill:'rgba(255,255,255,.05)', stroke:'var(--lb-line)'}, pc);
      el('text', {x:AX + cols*cw/2, y:AY + rows*cw + 30, 'text-anchor':'middle', class:'mut sm'}, pc).textContent = 'Matriz de PCR 2 (anidada)';
      const assign = []; T.forEach((t, i) => assign.push(i, i)); assign.push('PCR2', 'PCR2', 'RNA', 'RNA'); while (assign.length < rows*cols) assign.push(null);
      const order = assign.map((a, k) => [a, LAB.seed('w'+k)()]).sort((a,b) => a[1]-b[1]).map(x => x[0]);
      order.forEach((a, k) => { const x = AX + (k%cols)*cw + cw/2, y = AY + Math.floor(k/cols)*cw + cw/2;
        const c = el('circle', {cx:x, cy:y, r:7.5, fill:'#2a3a42', stroke:'#506570'}, pc); wells.push({c, a, x:x+30, y:y+90}); });
      /* gráfica de fusión */
      const MX0 = 580, MX1 = 930, MY0 = 520, MY1 = 330, tx = T2 => MX0 + (T2-65)/(95-65)*(MX1-MX0);
      const mg = el('g', {opacity:0}, svg);
      el('rect', {x:MX0-20, y:MY1-40, width:MX1-MX0+30, height:MY0-MY1+80, rx:14, class:'box'}, mg);
      el('text', {x:MX0, y:MY1-16, class:'tb sm'}, mg).textContent = 'Curvas de fusión (−dF/dT)';
      el('line', {x1:MX0, x2:MX1, y1:MY0, y2:MY0, stroke:'var(--lb-line)'}, mg);
      [70,75,80,85,90].forEach(t2 => el('text', {x:tx(t2), y:MY0+18, 'text-anchor':'middle', class:'mut sm'}, mg).textContent = t2 + ' °C');
      const mcur = el('g', {}, mg);
      /* panel de estado */
      const sg = el('g', {}, svg), steps = ['Hidratación','Carga de muestra','Lisis y extracción','PCR 1 multiplex','PCR 2 anidada','Fusión y análisis'];
      el('rect', {x:560, y:80, width:370, height:200, rx:14, class:'box'}, sg);
      el('text', {x:578, y:106, class:'tb sm'}, sg).textContent = 'Instrumento';
      const timer = el('text', {x:912, y:106, 'text-anchor':'end', class:'tb sm'}, sg);
      const sl = steps.map((s, i) => { const t = el('text', {x:600, y:136 + i*24, class:'sm mut'}, sg); t.textContent = s; const dot = el('circle', {cx:586, cy:131 + i*24, r:5, fill:'var(--lb-line)'}, sg); return {t, dot}; });
      const mark = i => sl.forEach((s, k) => { s.dot.setAttribute('fill', k < i ? 'var(--accent)' : k === i ? 'var(--accent2)' : 'var(--lb-line)'); s.t.setAttribute('class', k <= i ? 'sm' : 'sm mut'); });
      let mins = 0; const clockTo = (m, ms) => ctx.tween(ms, t => timer.textContent = `${Math.round(S.lerp(mins, m, t))} min`).then(() => mins = m);
      const tmOf = i => 76 + LAB.seed('tm'+T[i])()*12;
      const inject = async (col, y0) => { const v = el('g', {}, svg); el('rect', {x:-10, y:-60, width:20, height:56, rx:6, fill:col}, v); el('path', {d:'M-2 -4h4l-2 18z', fill:'#bbb'}, v);
        await ctx.tween(700, t => v.setAttribute('transform', `translate(${69 + 0*t} ${S.lerp(20, y0, t)})`), S.ease.io); await ctx.wait(250); v.remove(); };

      const tip = el('text', {x:280, y:540, 'text-anchor':'middle', class:'tb sm'}, svg);
      const report = () => `<table class="lb-tbl film"><tbody>${T.map(t => `<tr class="${hit.has(t) ? 'hit' : ''}"><td>${t.includes(' ') && /^[A-Z][a-z]+ [a-z]/.test(t) ? it(esc(t)) : esc(t)}</td><td>${hit.has(t) ? '<span class="sir D">Detectado</span>' : '<span class="nd">No detectado</span>'}</td></tr>`).join('')}</tbody></table>`;

      return [
        {t:'Hidratar el pouch', d:'El pouch se coloca en la estación de carga y se inyecta la solución de hidratación, que disuelve los reactivos liofilizados de cada compartimento.', btn:'Hidratar',
          async run(){ mark(0); await inject('#3a7bd5', 70); await ctx.tween(1000, t => ports.forEach((p, i) => i/11 < t && p.setAttribute('fill', '#a9d4ff'))); }},
        {t:'Cargar la muestra', d:`Se mezclan ${P.sample.toLowerCase().includes('líquido') ? '0,2 mL de LCR' : 'la muestra'} con el tampón de muestra y se inyectan en el puerto correspondiente. Desde aquí el sistema está cerrado: menos contaminación.`, btn:'Cargar muestra',
          async run(){ mark(1); await inject('#d64545', 40); ports[0].setAttribute('fill', '#ffb3a8'); await clockTo(2, 500); }},
        {t:'Lisis y extracción', d:'Perlas de cerámica agitadas a alta velocidad rompen bacterias, hongos y virus. Luego, perlas magnéticas capturan los ácidos nucleicos, que se lavan y se eluyen. Un control de proceso verifica toda la extracción.', btn:'Iniciar corrida',
          async run(){ mark(2); const beads = []; for (let i = 0; i < 26; i++) beads.push(el('circle', {cx:147, cy:130, r:3.5, fill:'#e8e8e8'}, lys));
            await ctx.tween(1600, (e, t) => beads.forEach((b, i) => { b.setAttribute('cx', 105 + ((i*37 + t*900*((i%3)+1)) % 84)); b.setAttribute('cy', 50 + ((i*53 + t*700*((i%4)+1)) % 50) + 30*0); }), S.ease.lin);
            const mb = []; for (let i = 0; i < 18; i++) mb.push(el('circle', {cx:110 + (i*13)%80, cy:160 + (i*7)%40, r:3, fill:'#6b4b2a'}, mag));
            await ctx.tween(1200, t => mb.forEach((b, i) => { b.setAttribute('cx', S.lerp(110 + (i*13)%80, 190, t)); }), S.ease.io);
            await clockTo(9, 400); }},
        {t:'PCR 1: multiplex', d:'Una PCR con todos los pares de cebadores externos amplifica a la vez cualquier diana presente. El producto se diluye para la segunda etapa.', btn:'PCR 1',
          async run(){ mark(3); const bg = el('rect', {x:96, y:254, width:102, height:52, rx:26, fill:'#ff6b6b', opacity:0}, pc);
            const dots = el('g', {}, p1); hit.forEach((h, k) => { for (let i = 0; i < 10; i++) el('circle', {cx:110 + LAB.seed(h+i)()*80, cy:262 + LAB.seed(h+'y'+i)()*36, r:0, fill:['#5fd2ee','#86e08f','#ffc85e'][k%3]}, dots); });
            await ctx.tween(2200, (e, t) => { bg.setAttribute('opacity', .15 + .25*Math.abs(Math.sin(t*Math.PI*12))); [...dots.children].forEach((c, i) => c.setAttribute('r', Math.min(3, Math.max(0, t*26 - i%10*2)*.25))); }, S.ease.lin);
            bg.remove(); await clockTo(28, 600); }},
        {t:'PCR 2: anidada en la matriz', d:'La matriz tiene pocillos con cebadores internos para cada diana. Los positivos emiten fluorescencia gracias a un colorante que se une al ADN de doble cadena. Toque un pocillo para ver su diana.', btn:'PCR 2',
          async run(){ mark(4);
            const lit = w => w.a !== null && (w.a === 'PCR2' || w.a === 'RNA' || hit.has(T[w.a]));
            await ctx.tween(2600, (e, t) => wells.forEach((w, k) => { if (lit(w)) w.c.setAttribute('fill', S.mix('#2a3a42', w.a === 'PCR2' || w.a === 'RNA' ? '#7fc4ff' : '#6ef0c6', Math.min(1, Math.max(0, t*1.6 - (k%7)*.06)))); }), S.ease.lin);
            wells.forEach(w => { if (w.a === null) return; const name = w.a === 'PCR2' ? 'Control de PCR 2' : w.a === 'RNA' ? 'Control de proceso (ARN)' : T[w.a];
              ctx.clickable(w.c, name, () => { tip.textContent = `${name}: ${lit(w) ? 'positivo' : 'negativo'}`; }, true); });
            await clockTo(52, 700); }},
        {t:'Curvas de fusión y reporte', d:'Al calentar lentamente, cada producto se separa a su temperatura de fusión (Tm) característica y la fluorescencia cae. El programa exige picos con la Tm esperada en los pocillos replicados para dar un «Detectado».', btn:'Analizar',
          async run(){ mark(5); mg.setAttribute('opacity', 1);
            const series = [...d.hit.map(h => [h, tmOf(T.indexOf(h)), '#6ef0c6']), ['Control de proceso', 81.5, '#7fc4ff']];
            series.forEach(([n, tm, c], i) => { const p = el('path', {fill:'none', stroke:c, 'stroke-width':2.4}, mcur); p.dataset.tm = tm; el('text', {x:tx(tm), y:MY1 + 6 + i*16 - 4, 'text-anchor':'middle', class:'sm', fill:c}, mcur).textContent = `${n.length > 22 ? n.slice(0,20)+'…' : n} · ${tm.toFixed(1).replace('.',',')} °C`; });
            const neg = el('path', {fill:'none', stroke:'#7d8a91', 'stroke-width':1.4, opacity:.6}, mcur);
            await ctx.tween(2000, (e, t) => { const Tm = 65 + t*30;
              [...mcur.querySelectorAll('path')].forEach(p => { const tm = +p.dataset.tm || null; let s = '';
                for (let T2 = 65; T2 <= Tm; T2 += .25){ const v = tm ? Math.exp(-(((T2-tm)/1.1)**2)) : .04*Math.sin(T2); s += `${s ? 'L' : 'M'}${tx(T2)} ${MY0 - v*(MY0-MY1-60) - (tm ? 0 : 6)}`; } p.setAttribute('d', s); }); }, S.ease.lin);
            await clockTo(P.min, 500); mark(6);
            ctx.result(`<div class="lb-score"><span class="big">${d.hit.length}</span><div><b>${d.hit.length === 1 ? 'diana detectada' : 'dianas detectadas'}</b><small>Controles internos válidos · ${P.min} min</small></div></div>${report()}${d.note ? `<p class="lb-warn">${d.note}</p>` : ''}
              <p>Detectar ADN no prueba que el microorganismo esté vivo ni reemplaza el cultivo cuando se necesita el antibiograma completo. Un gen de resistencia se asigna al aislamiento solo cuando hay un único microorganismo compatible detectado.</p>`);
          }}
      ];
    }
  };
})(window.ATLAS);
