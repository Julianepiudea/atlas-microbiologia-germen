/* Atlas de Microbiología GERMEN · Laboratorio virtual: sensibilidad antimicrobiana (Kirby-Bauer, microdilución, sistema automatizado) */
(function (A) {
  const LAB = A.LAB, S = LAB.S, el = S.el, esc = LAB.esc, AB = LAB.AB, fmt = LAB.fmtC;
  const it = s => `<i class="sp">${s}</i>`;
  const sir = c => `<span class="sir ${c[0] === 'S' && c !== 'SDD' ? 'S' : c[0] === 'R' ? 'R' : c === '—' ? 'N' : 'I'}">${c}</span>`;

  /* botón dibujado en el SVG */
  LAB.sbtn = (ctx, parent, x, y, w, label, fn, pri) => {
    const g = el('g', {transform:`translate(${x} ${y})`, class:'sbtn' + (pri ? ' pri' : '')}, parent);
    el('rect', {width:w, height:36, rx:10}, g);
    const t = el('text', {x:w/2, y:23, 'text-anchor':'middle'}, g); t.textContent = label;
    ctx.clickable(g, label, fn, true); return g;
  };
  const clock = (svg, x, y) => { const g = el('g', {transform:`translate(${x} ${y})`, opacity:0}, svg); el('circle', {r:28, class:'box'}, g);
    const h = el('line', {x1:0, y1:0, x2:0, y2:-20, stroke:'var(--accent)', 'stroke-width':3, 'stroke-linecap':'round'}, g); const t = el('text', {y:48, 'text-anchor':'middle', class:'sm'}, g);
    return {g, set(hh, lab){ h.setAttribute('transform', `rotate(${hh*30})`); t.textContent = lab; }}; };

  /* ======================= Kirby-Bauer ======================= */
  function kbCat(std, code, z, d){
    if (d.intr?.includes(code)) return 'R intrínseca';
    if (d.pheno?.type === 'dtest' && code === d.pheno.to) return 'R (prueba D +)';
    if (d.haze === code) return 'R (colonias en el halo)';
    const bp = LAB.KBP[std][code]; if (!bp) return '—';
    if (std === 'SPN' && code === 'OXA') return z >= 20 ? 'S (penicilina)' : 'Hacer CIM';
    if (z >= bp[0]) return 'S';
    if (bp[1] != null && z <= bp[1]) return 'R';
    return bp[2] || 'I';
  }

  LAB.sims.kb = {
    key:'kb', title:'Kirby-Bauer', sub:'Difusión en disco',
    about:`<p>Discos de papel con una carga fija de antibiótico se colocan sobre agar Mueller-Hinton sembrado en césped. El fármaco difunde y forma un <b>gradiente de concentración</b>; donde supera la concentración inhibitoria la bacteria no crece y aparece un <b>halo</b>.</p>
      <p>El diámetro (mm) se compara con los puntos de corte de CLSI o EUCAST: un halo mayor indica mayor sensibilidad. La técnica exige estandarización estricta: inóculo de <b>0,5 McFarland</b> (≈1,5 × 10⁸ UFC/mL), agar de 4 mm, discos en los 15 minutos siguientes e incubación de 16–18 h a 35 °C.</p>`,
    refs:'Puntos de corte: CLSI M100 (ilustrativos; verifique la edición vigente). Placas de 150 mm.',
    mount(ctx){
      const d = ctx.d, std = d.std, svg = ctx.svg(), s = 3.2, CX = 650, CY = 282, R = 75*s;
      const st = {mcf:0, cov:0, z:{}};
      const defs = el('defs', {}, svg);
      defs.innerHTML = `<pattern id="lawn" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="${d.blood ? '#c9cfb0' : '#efe3c2'}"/><circle cx="2" cy="2" r="1.3" fill="${d.blood ? '#a9b38c' : '#dccb9c'}"/><circle cx="5.5" cy="5" r="1" fill="${d.blood ? '#b3bd97' : '#e3d4a8'}"/></pattern>
        <mask id="kbM" maskUnits="userSpaceOnUse" x="0" y="0" width="960" height="560"><circle cx="${CX}" cy="${CY}" r="${R}" fill="#fff"/><g id="kbZ"></g></mask>
        <clipPath id="kbClip"><circle cx="${CX}" cy="${CY}" r="${R-3}"/></clipPath>`;
      /* estación de McFarland */
      const mf = el('g', {}, svg);
      el('text', {x:40, y:44, class:'tb'}, mf).textContent = 'Ajuste del inóculo';
      el('rect', {x:40, y:84, width:240, height:228, rx:10, fill:'#fbfaf5', stroke:'var(--lb-line)'}, mf);
      for (let i = 0; i < 7; i++) el('rect', {x:52, y:108+i*28, width:216, height:5, fill:'#151515'}, mf);
      const mkTube = (x, lab) => { const g = el('g', {transform:`translate(${x} 96)`}, mf); el('rect', {x:0, y:0, width:44, height:200, rx:20, fill:'rgba(255,255,255,.15)', stroke:'#7d8a91', 'stroke-width':2}, g);
        const f = el('rect', {x:2, y:40, width:40, height:158, rx:18, fill:'#f4efe0', opacity:0}, g); const t = el('text', {x:22, y:224, 'text-anchor':'middle', class:'sm', fill:'#333'}, g); t.textContent = lab; return f; };
      const std05 = mkTube(84, '0,5 patrón'); std05.setAttribute('opacity', .5*.62);
      const smp = mkTube(186, 'Muestra');
      const read = el('text', {x:160, y:72, 'text-anchor':'middle', class:'tb'}, mf);
      const setM = v => { st.mcf = Math.max(0, Math.min(2, v)); smp.setAttribute('opacity', Math.min(.95, st.mcf*.62)); read.textContent = `Densitómetro: ${st.mcf.toFixed(2).replace('.',',')} McFarland`; read.setAttribute('fill', Math.abs(st.mcf-.5) <= .08 ? 'var(--accent)' : 'currentColor'); };
      setM(0);
      /* placa */
      const pl = el('g', {}, svg);
      el('circle', {cx:CX, cy:CY, r:R+8, class:'glass'}, pl);
      el('circle', {cx:CX, cy:CY, r:R, fill:d.blood ? '#8f1d26' : '#d4ad62'}, pl);
      const strokes = el('g', {'clip-path':'url(#kbClip)'}, pl);
      const lawn = el('circle', {cx:CX, cy:CY, r:R, fill:'url(#lawn)', mask:'url(#kbM)', opacity:0}, pl);
      const haze = el('g', {opacity:0}, pl), disks = el('g', {}, pl), meas = el('g', {}, pl);
      const zg = svg.querySelector('#kbZ');
      el('text', {x:CX, y:CY+R+34, 'text-anchor':'middle', class:'mut sm'}, svg).textContent = `${d.blood ? 'Mueller-Hinton con 5 % de sangre de carnero' : 'Agar Mueller-Hinton'} · 150 mm`;
      const cov = el('text', {x:CX, y:28, 'text-anchor':'middle', class:'tb'}, svg);
      const D = d.disks.map(([code, z0], i) => ({code, z0, x:CX + d.pos[i][0]*s, y:CY + d.pos[i][1]*s}));
      const byCode = c => D.find(x => x.code === c);

      /* cobertura del hisopo */
      const G = 26, cells = new Set(), inside = [];
      for (let i = 0; i < G; i++) for (let j = 0; j < G; j++){ const x = CX - R + (i+.5)*2*R/G, y = CY - R + (j+.5)*2*R/G; if (Math.hypot(x-CX, y-CY) < R-6) inside.push(i*G+j); }
      const mark = (x, y) => { for (let i = 0; i < G; i++) for (let j = 0; j < G; j++){ const cx = CX - R + (i+.5)*2*R/G, cy = CY - R + (j+.5)*2*R/G; if (Math.hypot(cx-x, cy-y) < 22) cells.add(i*G+j); }
        st.cov = inside.filter(k => cells.has(k)).length / inside.length; cov.textContent = `Cobertura del césped: ${Math.round(st.cov*100)} %`; };
      const zigzag = ang => { const pts = [], a = ang*Math.PI/180, u = [Math.cos(a), Math.sin(a)], v = [-u[1], u[0]];
        for (let k = -R; k <= R; k += 26){ const half = Math.sqrt(Math.max(0, R*R - k*k)) - 8; pts.push([CX + v[0]*k - u[0]*half, CY + v[1]*k - u[1]*half], [CX + v[0]*k + u[0]*half, CY + v[1]*k + u[1]*half]); }
        for (let i = 1; i < pts.length; i += 4){ const t = pts[i]; pts[i] = pts[i-1]; pts[i-1] = t; } return pts; };

      const zoneShape = (k, r) => {
        zg.innerHTML = ''; D.forEach(x => { const zr = Math.max(3, (x.z/2)*s*r); el('circle', {cx:x.x, cy:x.y, r:zr, fill:'#000'}, zg); });
        if (d.pheno?.type === 'esbl'){ const F = byCode(d.pheno.from); d.pheno.to.forEach(c => { const T = byCode(c), dx = F.x-T.x, dy = F.y-T.y, dist = Math.hypot(dx,dy), ang = Math.atan2(dy,dx)*180/Math.PI;
          const ex = T.x + dx*.48, ey = T.y + dy*.48; el('ellipse', {cx:ex, cy:ey, rx:dist*.36*r, ry:(T.z/2)*s*.8*r, transform:`rotate(${ang} ${ex} ${ey})`, fill:'#000'}, zg); }); }
        if (d.pheno?.type === 'dtest'){ const E = byCode(d.pheno.from), Cc = byCode(d.pheno.to), zr = (Cc.z/2)*s*r, ux = (E.x-Cc.x), uy = (E.y-Cc.y), L = Math.hypot(ux,uy), u = [ux/L, uy/L], v = [-u[1], u[0]], h = zr*.28;
          /* el segmento del halo de clindamicina que mira hacia la eritromicina vuelve a tener crecimiento: zona en «D» */
          if (zr > h + 2){ const w = Math.sqrt(zr*zr - h*h), p1 = [Cc.x + u[0]*h + v[0]*w, Cc.y + u[1]*h + v[1]*w], p2 = [Cc.x + u[0]*h - v[0]*w, Cc.y + u[1]*h - v[1]*w];
            const ang = p => Math.atan2(p[1]-Cc.y, p[0]-Cc.x), TAU = Math.PI*2, nrm = a => ((a % TAU) + TAU) % TAU;
            const a1 = ang(p1), sweep = nrm(Math.atan2(u[1], u[0]) - a1) < nrm(ang(p2) - a1) ? 1 : 0;
            el('path', {d:`M${p1[0]} ${p1[1]}A${zr} ${zr} 0 0 ${sweep} ${p2[0]} ${p2[1]}Z`, fill:'#fff'}, zg); } }
      };

      const finalZones = () => { const delta = Math.max(-5, Math.min(5, Math.round((.5 - st.mcf)*8))); D.forEach(x => x.z = x.z0 <= 6 ? 6 : Math.max(6, x.z0 + delta)); return delta; };
      const measured = new Set();
      const tbl = () => {
        const rows = D.filter(x => measured.has(x.code)).map(x => { const bp = LAB.KBP[std][x.code]; return `<tr><td>${AB[x.code][0]} <small>${AB[x.code][1]}</small></td><td><b>${x.z}</b></td><td class="nw">${bp ? `≥${bp[0]}${bp[1] != null ? ` / ≤${bp[1]}` : ''}` : '—'}</td><td>${sir(kbCat(std, x.code, x.z, d))}</td></tr>`; }).join('');
        return `<table class="lb-tbl"><thead><tr><th>Antibiótico</th><th>Halo (mm)</th><th>S / R</th><th>Categoría</th></tr></thead><tbody>${rows}</tbody></table>`;
      };
      const measure = async x => {
        if (measured.has(x.code)) return; measured.add(x.code);
        let ang = 0; if (d.pheno && (d.pheno.to === x.code || d.pheno.to?.includes?.(x.code))){ const F = byCode(d.pheno.from); ang = Math.atan2(F.y-x.y, F.x-x.x) + Math.PI/2; }
        const r = Math.max(x.z, 6)/2*s, ux = Math.cos(ang), uy = Math.sin(ang);
        const g = el('g', {}, meas), ln = el('line', {x1:x.x, y1:x.y, x2:x.x, y2:x.y, stroke:'var(--accent)', 'stroke-width':2.5}, g);
        const t = el('text', {x:x.x + uy*(r+14)*0, y:x.y - r - 8, 'text-anchor':'middle', class:'tb sm meas'}, g);
        await ctx.tween(500, k => { ln.setAttribute('x1', x.x - ux*r*k); ln.setAttribute('y1', x.y - uy*r*k); ln.setAttribute('x2', x.x + ux*r*k); ln.setAttribute('y2', x.y + uy*r*k); });
        t.textContent = `${x.z} mm`;
        ctx.say(`<b>${AB[x.code][0]} ${AB[x.code][1]}</b>: halo de ${x.z} mm → ${kbCat(std, x.code, x.z, d)}.${x.code === d.haze ? ' Hay colonias finas dentro del halo: se lee el borde del crecimiento, no el halo aparente.' : ''}`);
        ctx.result(tbl());
      };

      return [
        {t:'Ajustar el inóculo a 0,5 McFarland', d:'Suspenda colonias en solución salina y compare la turbidez con el patrón 0,5 McFarland frente a la tarjeta de líneas negras. Use los botones del banco; un inóculo incorrecto altera el tamaño de los halos.', btn:'Preparar inóculo',
          async run(auto){
            if (auto){ await ctx.tween(1200, t => setM(.5*t)); return; }
            return new Promise(res => {
              const b1 = LAB.sbtn(ctx, mf, 40, 330, 116, '+ colonias', () => setM(st.mcf + .17));
              const b2 = LAB.sbtn(ctx, mf, 164, 330, 116, '+ salina', () => setM(st.mcf * .78));
              const b3 = LAB.sbtn(ctx, mf, 40, 376, 240, 'Confirmar inóculo', () => { [b1,b2,b3].forEach(b => b.remove());
                ctx.say(Math.abs(st.mcf-.5) <= .08 ? 'Inóculo correcto: ≈1,5 × 10⁸ UFC/mL.' : st.mcf > .5 ? 'Inóculo demasiado denso: los halos serán más pequeños (falsa resistencia).' : 'Inóculo demasiado diluido: los halos serán más grandes (falsa sensibilidad).'); res(); }, true);
            });
          }},
        {t:'Sembrar en césped', d:'Con un hisopo empapado en la suspensión se estría toda la superficie en tres direcciones, girando la placa unos 60° cada vez, para obtener un crecimiento confluente. Arrastre sobre la placa para sembrar.', btn:'Sembrar',
          async run(auto){
            const stroke = pts => { const p = el('polyline', {points:'', fill:'none', stroke:'#fff8e4', 'stroke-width':40, 'stroke-linecap':'round', 'stroke-linejoin':'round', opacity:.22}, strokes); return p; };
            const autoSow = async () => { for (const a of [0, 60, 120]){ const pts = zigzag(a), p = stroke(); let acc = [];
              await ctx.tween(900, t => { const n = Math.floor(t*(pts.length-1)); while (acc.length <= n){ const q = pts[acc.length]; acc.push(q); mark(q[0], q[1]);
                if (acc.length > 1){ const a0 = acc[acc.length-2]; for (let f = .25; f < 1; f += .25) mark(S.lerp(a0[0], q[0], f), S.lerp(a0[1], q[1], f)); } } p.setAttribute('points', acc.map(q => q.join(',')).join(' ')); }, S.ease.lin); } };
            if (auto){ await autoSow(); return; }
            return new Promise(res => {
              svg.style.touchAction = 'none'; let cur = null, pts = [];
              const done = () => { svg.style.touchAction = ''; svg.onpointerdown = svg.onpointermove = svg.onpointerup = null; helper.remove(); res(); };
              svg.onpointerdown = e => { const p = ctx.pt(svg, e); if (Math.hypot(p.x-CX, p.y-CY) > R) return; cur = stroke(); pts = []; svg.setPointerCapture(e.pointerId); };
              svg.onpointermove = e => { if (!cur) return; const p = ctx.pt(svg, e); pts.push(`${p.x},${p.y}`); cur.setAttribute('points', pts.join(' ')); mark(p.x, p.y); if (st.cov >= .9){ cur = null; ctx.say('Césped completo: ya puede colocar los discos.'); done(); } };
              svg.onpointerup = () => { cur = null; };
              const helper = LAB.sbtn(ctx, svg, CX - 110, 500, 220, 'Sembrar por mí', async () => { helper.remove(); svg.onpointerdown = null; await autoSow(); done(); });
              mark(-999, -999);
            });
          }},
        {t:'Colocar los discos', d:'Antes de 15 minutos se colocan los discos con un dispensador o con pinzas estériles, a más de 24 mm de distancia entre centros, presionándolos para que hagan contacto con el agar.', btn:'Dispensar discos',
          async run(){
            cov.textContent = '';
            for (const x of D){ const g = el('g', {}, disks); const c = el('circle', {cx:x.x, cy:x.y - 60, r:3.2*s, fill:'#fff', stroke:'#9aa', 'stroke-width':1.2, opacity:0}, g);
              const t = el('text', {x:x.x, y:x.y + 3.5, 'text-anchor':'middle', class:'disk', opacity:0}, g); t.textContent = x.code; x.g = g;
              await ctx.tween(260, k => { c.setAttribute('cy', x.y - 60*(1-k)); c.setAttribute('opacity', k); t.setAttribute('opacity', k); }, S.ease.back); }
          }},
        {t:'Incubar', d:`Placas invertidas a 35 ± 2 °C en aire ambiente durante 16–18 h${d.blood ? ' (estreptococos: 5 % de CO₂, 20–24 h)' : ''}${d.hours === 24 ? '; para vancomicina en enterococos, 24 h completas' : ''}. Mientras tanto, el antibiótico difunde y la bacteria compite por crecer.`, btn:'Incubar',
          async run(){
            const delta = finalZones(); const ck = clock(svg, 900, 60); ck.g.setAttribute('opacity', 1);
            strokes.setAttribute('opacity', .6);
            await ctx.tween(2600, t => { ck.set(t*18, `${Math.round(t*(d.hours === 24 ? 24 : 18))} h`); lawn.setAttribute('opacity', Math.min(1, t*1.3)); strokes.setAttribute('opacity', .6*(1-t)); zoneShape(0, Math.min(1, .25 + t)); }, S.ease.io);
            if (d.haze){ const x = byCode(d.haze), r = x.z/2*s; for (let i = 0; i < 40; i++){ const a = i*2.399, rr = Math.sqrt(i/40)*r*.92; if (rr > 3.4*s) el('circle', {cx:x.x + rr*Math.cos(a), cy:x.y + rr*Math.sin(a), r:1.3, fill:'#efe3c2'}, haze); }
              await ctx.tween(500, t => haze.setAttribute('opacity', .75*t)); }
            ck.g.remove();
            if (delta) ctx.say(`Por el inóculo ${delta < 0 ? 'denso' : 'diluido'}, todos los halos cambiaron unos ${Math.abs(delta)} mm: un error técnico puede cambiar la categoría.`);
          }},
        {t:'Medir los halos', d:'Con regla o calibrador, por el reverso de la placa sobre fondo negro, mida el diámetro de inhibición completa en milímetros (incluido el disco). Toque cada disco para medirlo.', btn:'Medir',
          async run(auto){
            if (auto){ for (const x of D) await measure(x); return; }
            return new Promise(res => {
              D.forEach(x => ctx.clickable(x.g, `Medir ${AB[x.code][0]}`, async () => { await measure(x); if (measured.size === D.length) res(); }, true));
              x0 = LAB.sbtn(ctx, svg, CX - 110, 500, 220, 'Medir todos', async () => { x0.remove(); for (const x of D) await measure(x); res(); });
              D.forEach(x => x.g.classList.add('lb-pulse'));
            }).then(() => { D.forEach(x => x.g.classList.remove('lb-pulse')); x0?.remove(); });
          }},
        {t:'Interpretar', d:'Cada diámetro se compara con los puntos de corte para su grupo de microorganismos. Además se buscan fenotipos de resistencia en la disposición de los halos.', btn:'Interpretar',
          async run(){
            const hl = el('g', {}, svg);
            if (d.pheno?.type === 'esbl'){ const F = byCode(d.pheno.from); d.pheno.to.forEach(c => { const T = byCode(c); el('line', {x1:T.x, y1:T.y, x2:F.x, y2:F.y, stroke:'var(--accent2)', 'stroke-width':3, 'stroke-dasharray':'6 6', class:'lb-pulse'}, hl); }); }
            if (d.pheno?.type === 'dtest'){ const Cc = byCode(d.pheno.to); el('circle', {cx:Cc.x, cy:Cc.y, r:Cc.z/2*s + 6, fill:'none', stroke:'var(--accent2)', 'stroke-width':3, 'stroke-dasharray':'6 6', class:'lb-pulse'}, hl);
              el('text', {x:Cc.x + 40, y:Cc.y - Cc.z/2*s - 14, class:'tb sm', fill:'var(--accent2)'}, hl).textContent = 'Zona en «D»'; }
            const off = Math.abs(st.mcf - .5) > .08;
            ctx.result(`<p class="lb-std">Puntos de corte para <b>${LAB.KBSTD[std]}</b></p>${tbl()}<p>${d.concl}</p>${off ? `<p class="lb-warn"><b>Control de calidad:</b> el inóculo fue de ${st.mcf.toFixed(2).replace('.',',')} McFarland. En el laboratorio esta prueba se repetiría.</p>` : ''}`);
            ctx.say('Revise la tabla de resultados y el fenotipo resaltado en la placa.');
          }}
      ];
      var x0;
    }
  };

  /* ======================= Microdilución en caldo ======================= */
  function micCat(row, mic, d){
    const [code, , , Sb, Rb] = row;
    if (d.dual === code) return mic >= .12 ? (mic <= 2 ? 'R (meningitis) · S (otros)' : mic >= 8 ? 'R' : 'R (meningitis) · I (otros)') : 'S';
    if (Sb == null && Rb == null) return '—';
    if (Sb == null) return mic >= Rb ? 'R' : 'I';
    if (mic <= Sb) return 'S';
    if (Rb != null && mic >= Rb) return 'R';
    if (code === 'FEP' || code === 'FLC') return 'SDD';
    return 'I';
  }
  LAB.micOf = row => { const [, cmax, mic] = row; return mic === '>' ? cmax*2 : mic === '≤' ? cmax/512 : mic; };
  LAB.micTxt = row => { const [, cmax, mic] = row; return mic === '>' ? `>${fmt(cmax)}` : mic === '≤' ? `≤${fmt(cmax/512)}` : fmt(mic); };
  LAB.micCat = micCat;

  LAB.sims.bmd = {
    key:'bmd', title:'Microdilución en caldo', sub:'Concentración inhibitoria mínima (CIM)',
    about:`<p>Es el <b>método de referencia</b>. En una microplaca de 96 pocillos se preparan <b>diluciones dobles seriadas</b> de cada antibiótico (64, 32, 16… µg/mL) y se inoculan con ≈5 × 10⁵ UFC/mL.</p>
      <p>Tras la incubación, la <b>CIM</b> es la menor concentración que inhibe el crecimiento visible. Se interpreta con los puntos de corte, que integran farmacocinética, farmacodinamia y resultados clínicos. Algunos fármacos, como la colistina o la vancomicina en estafilococos, <b>solo</b> se pueden evaluar así.</p>`,
    refs:'CLSI M07 y M100 (bacterias), M27 (levaduras). Valores ilustrativos coherentes con el fenotipo del aislamiento.',
    mount(ctx){
      const d = ctx.d, rows = d.rows, svg = ctx.svg();
      const X0 = 170, Y0 = 110, DX = 58, DY = 44, r = 17;
      el('text', {x:40, y:44, class:'tb'}, svg).textContent = 'Microplaca de 96 pocillos';
      el('text', {x:40, y:66, class:'mut sm'}, svg).textContent = d.med;
      el('rect', {x:X0-46, y:Y0-36, width:DX*12+60, height:DY*8+50, rx:20, class:'box'}, svg);
      for (let c = 0; c < 12; c++) el('text', {x:X0 + c*DX, y:Y0-16, 'text-anchor':'middle', class:'mut sm'}, svg).textContent = c < 10 ? c+1 : c === 10 ? 'C+' : 'C−';
      const W = [];
      for (let i = 0; i < 8; i++){
        const row = rows[i];
        el('text', {x:X0-60, y:Y0 + i*DY + 5, 'text-anchor':'end', class:row ? 'tb sm' : 'mut sm'}, svg).textContent = row ? row[0] : 'ABCDEFGH'[i];
        W[i] = [];
        for (let c = 0; c < 12; c++){
          const g = el('g', {}, svg), cx = X0 + c*DX, cy = Y0 + i*DY;
          el('circle', {cx, cy, r, fill:'var(--lb-well)', stroke:'var(--lb-line)', 'stroke-width':1.2}, g);
          const liq = el('circle', {cx, cy, r:r-2.5, fill:'#f3e7b8', opacity:0}, g);
          const cloud = el('circle', {cx, cy, r:r-2.5, fill:'#fff', opacity:0}, g);
          const btn = el('circle', {cx, cy, r:0, fill:'#e8dcc0', stroke:'#c9b88a', 'stroke-width':1}, g);
          W[i][c] = {g, liq, btn, cloud, cx, cy};
        }
      }
      const conc = (row, c) => row[1] / Math.pow(2, c);
      const label = el('text', {x:480, y:Y0 + 8*DY + 22, 'text-anchor':'middle', class:'mut sm'}, svg);
      label.textContent = 'Columnas 1→10: concentración ×½ · botón marrón = crecimiento · C+ crecimiento · C− esterilidad';
      const tip = el('text', {x:480, y:Y0 + 8*DY + 46, 'text-anchor':'middle', class:'tb sm'}, svg);
      const grows = (row, c) => { if (c === 10) return true; if (c === 11) return false; const m = LAB.micOf(row); return conc(row, c) < m; };
      const pip = el('g', {opacity:0}, svg);
      for (let i = 0; i < 8; i++) el('path', {d:`M-6 ${Y0 + i*DY - 46}h12l-4 22h-4z`, fill:'#cfd8dc', stroke:'#7d8a91'}, pip);
      el('rect', {x:-14, y:Y0-80, width:28, height:DY*7+40, rx:8, fill:'#55636b', opacity:.85}, pip);
      const answered = {};

      return [
        {t:'Diluciones dobles seriadas', d:'Se dispensa la concentración más alta en la columna 1 y con una pipeta multicanal se transfiere la mitad a la columna siguiente, una y otra vez, hasta la columna 10.', btn:'Diluir',
          async run(){
            pip.setAttribute('opacity', 1);
            for (let c = 0; c < 10; c++){
              await ctx.tween(260, t => pip.setAttribute('transform', `translate(${X0 + (c-1+t)*DX} 0)`), S.ease.io);
              rows.forEach((row, i) => { W[i][c].liq.setAttribute('opacity', 1); W[i][c].liq.setAttribute('fill', S.mix('#f8f1d6', '#e9c766', Math.max(0, 1 - c/9)*.55)); });
              tip.textContent = `Columna ${c+1}: ${rows.map(row => `${row[0]} ${fmt(conc(row, c))}`).slice(0,4).join(' · ')}…`;
            }
            rows.forEach((row, i) => [10,11].forEach(c => { W[i][c].liq.setAttribute('opacity', 1); W[i][c].liq.setAttribute('fill', '#f6eecb'); }));
            pip.setAttribute('opacity', 0); tip.textContent = '';
          }},
        {t:'Inocular', d:'La suspensión ajustada a 0,5 McFarland se diluye para que cada pocillo reciba ≈5 × 10⁵ UFC/mL. El control de esterilidad (C−) no se inocula.', btn:'Inocular',
          async run(){
            pip.setAttribute('opacity', 1);
            for (let c = 0; c < 11; c++){
              await ctx.tween(180, t => pip.setAttribute('transform', `translate(${X0 + (c-1+t)*DX} 0)`));
              rows.forEach((row, i) => W[i][c].liq.setAttribute('stroke', '#bfae7a'));
            }
            pip.setAttribute('opacity', 0);
          }},
        {t:'Incubar', d:'Microplaca tapada, a 35 °C en aire ambiente durante 16–20 h (24 h para algunos fármacos y para levaduras).', btn:'Incubar',
          async run(){
            const ck = clock(svg, 900, 52); ck.g.setAttribute('opacity', 1);
            await ctx.tween(2200, t => { ck.set(t*20, `${Math.round(t*(d.fungi ? 24 : 18))} h`);
              rows.forEach((row, i) => W[i].forEach((w, c) => { const g = grows(row, c), trail = d.fungi && ['FLC','VRC'].includes(row[0]) && !g && c < 10;
                if (g) { w.btn.setAttribute('r', 8*t); w.btn.setAttribute('fill', '#9c7a3c'); w.btn.setAttribute('stroke', '#6f5524'); w.liq.setAttribute('fill', S.mix('#f8f1d6', '#fffaf0', t)); w.cloud.setAttribute('opacity', .55*t); } else if (trail){ w.btn.setAttribute('r', 4*t); w.btn.setAttribute('fill', '#b89a5e'); } })); }, S.ease.io);
            ck.g.remove();
          }},
        {t:'Leer la CIM', d:'Un botón o turbidez en el fondo indica crecimiento. Verifique primero los controles (C+ con crecimiento, C− limpio) y luego toque, en cada fila, el primer pocillo sin crecimiento visible.', btn:'Leer',
          async run(auto){
            const target = row => { for (let c = 9; c >= 0; c--) if (!grows(row, c)) return c; return -1; };
            const show = (i, ok) => { const row = rows[i], c = target(row); answered[i] = true;
              if (c >= 0) el('circle', {cx:W[i][c].cx, cy:W[i][c].cy, r:r+4, fill:'none', stroke:ok ? 'var(--accent)' : 'var(--accent2)', 'stroke-width':3}, svg);
              const t = el('text', {x:X0 + 12*DX - 20, y:Y0 + i*DY + 5, class:'tb sm'}, svg); t.textContent = `CIM ${LAB.micTxt(row)}`; };
            if (auto){ for (let i = 0; i < rows.length; i++){ show(i, true); await ctx.wait(250); } return; }
            return new Promise(res => {
              const check = () => { if (Object.keys(answered).length === rows.length){ all.remove(); res(); } };
              rows.forEach((row, i) => W[i].forEach((w, c) => { if (c > 9) return; ctx.clickable(w.g, `${row[0]} ${fmt(conc(row, c))} µg/mL`, () => {
                if (answered[i]) return; const tc = target(row);
                if (c === tc){ show(i, true); ctx.say(`<b>${AB[row[0]][0]}</b>: correcto, CIM = ${LAB.micTxt(row)} µg/mL.`); }
                else if (tc < 0 && c === 9){ show(i, true); ctx.say(`<b>${AB[row[0]][0]}</b>: crece en todos los pocillos → CIM ${LAB.micTxt(row)} µg/mL.`); }
                else { w.g.animate?.([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}], {duration:260});
                  ctx.say(tc < 0 ? `En la fila ${row[0]} todos los pocillos tienen crecimiento: toque la última columna (10).` : grows(row, c) ? 'Ese pocillo tiene crecimiento (botón en el fondo): la concentración no alcanzó. Busque más a la izquierda.' : 'Ese pocillo está limpio, pero hay otro limpio con menor concentración (más a la derecha).'); }
                check(); }, true); }));
              const all = LAB.sbtn(ctx, svg, 370, 506, 220, 'Mostrar respuestas', () => { rows.forEach((_, i) => !answered[i] && show(i, true)); check(); });
            });
          }},
        {t:'Interpretar', d:'Cada CIM se compara con los puntos de corte clínicos. La CIM no se compara entre antibióticos distintos: cada fármaco tiene su propio punto de corte.', btn:'Interpretar',
          async run(){
            ctx.result(`<table class="lb-tbl"><thead><tr><th>Antibiótico</th><th>CIM (µg/mL)</th><th>S ≤ / R ≥</th><th>Categoría</th></tr></thead><tbody>${rows.map(row => { const m = LAB.micOf(row), c = micCat(row, m, d);
              return `<tr><td>${AB[row[0]][0]}${row[5] ? `<small>${row[5]}</small>` : ''}</td><td><b>${LAB.micTxt(row)}</b></td><td class="nw">${row[3] != null ? fmt(row[3]) : '—'} / ${row[4] != null ? fmt(row[4]) : '—'}</td><td>${sir(c)}</td></tr>`; }).join('')}</tbody></table>
              ${d.fungi ? '<p>En levaduras, azoles y equinocandinas se leen al <b>50 % de inhibición</b>: el crecimiento residual («arrastre» o <i>trailing</i>) no indica resistencia.</p>' : ''}
              ${d.dual ? '<p>Neumococo: la penicilina tiene dos puntos de corte. Con CIM de 2 µg/mL es <b>resistente en meningitis</b> (no penetra lo suficiente en el LCR) y <b>sensible</b> en neumonía tratada por vía intravenosa.</p>' : ''}`);
          }}
      ];
    }
  };

  /* ======================= Sistema automatizado (tipo VITEK 2) ======================= */
  LAB.sims.auto = {
    key:'auto', title:'Sistema automatizado', sub:'Tarjetas de identificación y sensibilidad',
    about:`<p>Equipos como <b>VITEK 2</b>, <b>BD Phoenix</b> o <b>MicroScan</b> miniaturizan las pruebas bioquímicas y la microdilución en tarjetas o paneles. Una suspensión estandarizada se carga al vacío en decenas de micropocillos.</p>
      <p>El equipo los lee por <b>fluorescencia, colorimetría y turbidez</b> cada 15 minutos. Con las curvas de crecimiento estima la CIM mediante algoritmos, y un <b>sistema experto</b> revisa la coherencia del perfil y propone el fenotipo de resistencia. Entrega la identificación en unas 4–10 h y la sensibilidad en 6–18 h.</p>`,
    refs:'Esquema genérico inspirado en VITEK 2 (bioMérieux). Probabilidades y tiempos ilustrativos.',
    mount(ctx){
      const d = ctx.d, svg = ctx.svg(), card = LAB.CARDS[d.card], key = LAB.CARDKEY[ctx.o.id] || {}, bmd = LAB.BMD[ctx.o.id];
      const r = LAB.seed('card'+ctx.o.id), react = card.map(t => t in key ? key[t] : r() < .36 ? 1 : 0);
      const mkCard = (x, y, n, title, col) => { const g = el('g', {transform:`translate(${x} ${y})`}, svg);
        el('rect', {width:300, height:150, rx:10, fill:'#f4f6f7', stroke:'#90a0a8'}, g); el('rect', {width:300, height:22, rx:10, fill:col}, g);
        el('text', {x:12, y:16, class:'sm', fill:'#fff'}, g).textContent = title;
        const wells = []; for (let k = 0; k < 64; k++){ const cx = 22 + (k%16)*17.4, cy = 40 + Math.floor(k/16)*26;
          wells.push(el('rect', {x:cx-6, y:cy-8, width:12, height:16, rx:3, fill:'#dfe5e8', stroke:'#b5c0c6'}, g)); }
        el('path', {d:'M300 75h40', stroke:'#8899a0', 'stroke-width':4}, g); return {g, wells}; };
      el('text', {x:40, y:44, class:'tb'}, svg).textContent = `Tarjetas ${d.card} (identificación) y ${d.ast} (sensibilidad)`;
      const idc = mkCard(40, 80, card.length, `${d.card} · ${card.length} pruebas`, '#5a6fd6');
      const astc = mkCard(40, 260, 64, `${d.ast} · antibióticos en diluciones`, '#d6705a');
      const tubeG = el('g', {transform:'translate(420 140)'}, svg);
      el('rect', {width:40, height:170, rx:16, fill:'rgba(255,255,255,.15)', stroke:'#7d8a91', 'stroke-width':2}, tubeG);
      const susp = el('rect', {x:2, y:50, width:36, height:118, rx:14, fill:'#f2ead2', opacity:.3}, tubeG);
      el('text', {x:20, y:196, 'text-anchor':'middle', class:'mut sm'}, tubeG).textContent = 'NaCl 0,45 %';
      const dens = el('text', {x:440, y:124, 'text-anchor':'middle', class:'tb sm'}, svg);
      /* equipo y gráfica */
      const ins = el('g', {}, svg);
      el('rect', {x:520, y:70, width:410, height:420, rx:18, class:'box'}, ins);
      el('text', {x:540, y:100, class:'tb sm'}, ins).textContent = 'Lector · incubador a 35,5 °C';
      const clk = el('text', {x:910, y:100, 'text-anchor':'end', class:'tb sm'}, ins);
      const GX0 = 560, GX1 = 900, GY0 = 300, GY1 = 130;
      el('line', {x1:GX0, x2:GX1, y1:GY0, y2:GY0, stroke:'var(--lb-line)'}, ins); el('line', {x1:GX0, x2:GX0, y1:GY0, y2:GY1, stroke:'var(--lb-line)'}, ins);
      el('text', {x:GX1, y:GY0+20, 'text-anchor':'end', class:'mut sm'}, ins).textContent = 'tiempo (h)';
      el('text', {x:GX0, y:GY1-10, class:'mut sm'}, ins).textContent = 'Turbidez (lecturas cada 15 min)';
      const rowsAst = bmd.rows.slice(0, 8);
      const Rrow = rowsAst.find(x => LAB.micCat(x, LAB.micOf(x), bmd)[0] === 'R') || rowsAst[0], Srow = rowsAst.find(x => LAB.micCat(x, LAB.micOf(x), bmd) === 'S') || rowsAst[1];
      const curves = [['Control de crecimiento', '#9aa6ad', 1], [`${AB[Rrow[0]][0]} (R)`, 'var(--r1)', .92], [`${AB[Srow[0]][0]} (S)`, 'var(--r5)', .05]].map(([n, c, k], i) => ({n, k, p:el('path', {fill:'none', stroke:c, 'stroke-width':2.6}, ins), t:Object.assign(el('text', {x:GX0+8, y:GY1 + 14 + i*18, class:'sm', fill:c}, ins), {textContent:n})}));
      const idBar = el('rect', {x:540, y:350, width:0, height:14, rx:7, fill:'var(--accent)'}, ins);
      el('rect', {x:540, y:350, width:370, height:14, rx:7, fill:'none', stroke:'var(--lb-line)'}, ins);
      const idTxt = el('text', {x:540, y:340, class:'sm'}, ins);
      const astBar = el('rect', {x:540, y:410, width:0, height:14, rx:7, fill:'var(--accent2)'}, ins);
      el('rect', {x:540, y:410, width:370, height:14, rx:7, fill:'none', stroke:'var(--lb-line)'}, ins);
      const astTxt = el('text', {x:540, y:400, class:'sm'}, ins);
      const sig = (t, k) => k * 1/(1+Math.exp(-(t-.35)*12));

      return [
        {t:'Suspensión estandarizada', d:'Colonias de 18–24 h se suspenden en solución salina al 0,45 % hasta 0,50–0,63 McFarland, medidos con densitómetro (DensiCHEK).', btn:'Preparar suspensión',
          async run(){ await ctx.tween(1200, t => { susp.setAttribute('opacity', .3 + t*.5); dens.textContent = `${(t*.55).toFixed(2).replace('.',',')} McF`; }); }},
        {t:'Cargar el casete', d:'Tubo y tarjetas se colocan en el casete, con el tubito de transferencia sumergido en la suspensión. El lector de código de barras vincula cada tarjeta con el paciente.', btn:'Cargar casete',
          async run(){ const scan = el('rect', {x:40, y:80, width:300, height:4, fill:'#ff3b3b', opacity:.85}, svg);
            await ctx.tween(1000, t => scan.setAttribute('y', 80 + t*330), S.ease.io); scan.remove(); }},
        {t:'Llenado al vacío y sellado', d:'En la cámara de llenado se hace vacío y, al restablecer la presión, la suspensión entra por el tubito y llena todos los micropocillos. Luego se corta y sella el tubito.', btn:'Llenar',
          async run(){ await ctx.tween(1600, t => { const n = Math.floor(t*64); [idc, astc].forEach(c => c.wells.forEach((w, k) => k < n && w.setAttribute('fill', '#efe4c2'))); susp.setAttribute('height', 118 - t*60); susp.setAttribute('y', 50 + t*60); }, S.ease.lin); }},
        {t:'Incubación y lectura óptica', d:'Cada 15 minutos el equipo lee cada pocillo. En la tarjeta de identificación, los sustratos cambian de color o de fluorescencia. En la de sensibilidad, compara la turbidez de cada antibiótico con la del control de crecimiento.', btn:'Incubar y leer',
          async run(){
            const H = Math.max(d.asth, d.idh), N = 120;
            await ctx.tween(4200, (e, t) => {
              const h = t*H; clk.textContent = `${Math.floor(h)} h ${String(Math.floor((h%1)*60/15)*15).padStart(2,'0')} min`;
              curves.forEach(c => { let s = `M${GX0} ${GY0}`; const end = Math.floor(t*N); for (let i = 0; i <= end; i++){ const u = i/N; s += `L${GX0 + u*(GX1-GX0)} ${GY0 - sig(u, c.k)*(GY0-GY1-30)}`; } c.p.setAttribute('d', s); });
              const pid = Math.min(1, h/d.idh), pa = Math.min(1, h/d.asth);
              idBar.setAttribute('width', 370*pid); astBar.setAttribute('width', 370*pa);
              idTxt.textContent = pid < 1 ? `Identificación: analizando perfil… ${Math.round(pid*100)} %` : `Identificación lista a las ${d.idh} h`;
              astTxt.textContent = pa < 1 ? `Sensibilidad: estimando CIM… ${Math.round(pa*100)} %` : `Sensibilidad lista a las ${d.asth} h`;
              idc.wells.forEach((w, k) => { if (k < card.length && react[k] && r() < pid*.08) w.setAttribute('fill', '#7c5bd0'); });
              astc.wells.forEach((w, k) => { const g = k % 8 === 0 || (k*7)%5 > 1; if (g && Math.random() < pa*.05) w.setAttribute('fill', '#cdb98a'); });
            }, S.ease.lin);
            idc.wells.forEach((w, k) => w.setAttribute('fill', k < card.length ? (react[k] ? '#7c5bd0' : '#e8ecee') : '#dfe5e8'));
          }},
        {t:'Informe y sistema experto', d:'El programa compara el biopatrón con su base de datos y da la probabilidad de identificación. Luego calcula las CIM y el sistema experto valida los fenotipos antes de que el microbiólogo libere el informe.', btn:'Ver informe',
          async run(){
            const pos = card.filter((t, k) => react[k]);
            ctx.result(`<div class="lb-score"><span class="big">${d.prob} %</span><div><b>${it(esc(ctx.o.sp))}</b><small>Identificación «${d.lvl}» · ${String(d.idh).replace('.',',')} h</small></div></div>
              <p class="lb-bio"><b>Biopatrón (pruebas positivas):</b> ${pos.join(' · ')}</p>
              <table class="lb-tbl"><thead><tr><th>Antibiótico</th><th>CIM</th><th>Categoría</th></tr></thead><tbody>${rowsAst.map(row => `<tr><td>${AB[row[0]][0]}</td><td><b>${LAB.micTxt(row)}</b></td><td>${sir(LAB.micCat(row, LAB.micOf(row), bmd))}</td></tr>`).join('')}</tbody></table>
              <div class="lb-aes"><h4>Sistema experto</h4><ul>${d.aes.map(a => `<li>${a}</li>`).join('')}</ul></div>${d.tip ? `<p class="lb-warn">${d.tip}</p>` : ''}
              <p>El microbiólogo revisa y valida el informe: el equipo no reemplaza el criterio profesional.</p>`);
          }}
      ];
    }
  };
})(window.ATLAS);
