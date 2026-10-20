/* Atlas de Microbiología GERMEN · mecanismos animados (1/2): toxinas, invasión y evasión
   Cada escena es un SVG de 600×340. El paso activo se refleja como clases acumuladas (s1, s2…) y data-step. */
window.ATLAS = window.ATLAS || {};
(function (A) {
  const rnd = s => () => (s = (s*16807) % 2147483647) / 2147483647;
  const f = n => n.toFixed(1);
  const sv = A.sv = {
    rnd,
    mem:(x1,x2,y,c='') => { let s = `<g class="${c}"><rect x="${x1}" y="${y-8}" width="${x2-x1}" height="16" fill="var(--m-mem)"/>`; for (let x=x1+5; x<x2; x+=10) s += `<circle cx="${x}" cy="${y-7}" r="3.6" fill="var(--m-head)"/><circle cx="${x}" cy="${y+7}" r="3.6" fill="var(--m-head)"/>`; return s + '</g>'; },
    tx:(x,y,s,c='',a='start') => `<text x="${x}" y="${y}" class="${c}" text-anchor="${a}">${s}</text>`,
    bac:(x,y,w,h,c='') => `<rect class="${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w,h)/2}" fill="var(--m-bac)" stroke="var(--m-bac-s)" stroke-width="2.5"/>`,
    ab:(x,y,rot,c='',col='var(--accent)',st='') => `<g class="${c}" style="${st}"><path transform="translate(${f(x)} ${f(y)}) rotate(${f(rot)})" d="M0 0V-12M0-12L-8-22M0-12L8-22" stroke="${col}" stroke-width="4" stroke-linecap="round" fill="none"/></g>`,
    ring:(cx,cy,fill) => [0,1,2,3,4].map(k => { const a = k/5*Math.PI*2; return `<circle cx="${f(cx+Math.cos(a)*13)}" cy="${f(cy+Math.sin(a)*6)}" r="7" fill="${fill}"/>`; }).join(''),
    rec:(xs,y,col) => xs.map(x => `<path d="M${x} ${y}v-12m0 0l-5-6m5 6l5-6" stroke="${col}" stroke-width="2.5" fill="none"/>`).join(''),
    flow:(cls,n,x,y,R,o) => { let s = ''; for (let i=0;i<n;i++){ const dx = o.dx[0]+R()*(o.dx[1]-o.dx[0]), dy = o.dy[0]+R()*(o.dy[1]-o.dy[0]); s += `<${o.shape||'circle'} class="${cls}" ${o.shape==='text' ? `x="${f(x+(o.jx||0)*(R()-.5))}" y="${f(y+(o.jy||0)*(R()-.5))}"` : `cx="${f(x+(o.jx||0)*(R()-.5))}" cy="${f(y+(o.jy||0)*(R()-.5))}" r="${o.r||4}"`} fill="${o.fill[i%o.fill.length]}" style="--dx:${f(dx)}px;--dy:${f(dy)}px;animation-delay:${f(i*(o.gap||.25))}s">${o.shape==='text' ? o.txt : ''}</${o.shape||'circle'}>`; } return s; }
  };
  const MX = A.MX = {};

  MX.ab5 = {
    title:o => `${o.ab5.tox}: diarrea secretora`,
    steps:() => [['Unión al receptor','La subunidad B, un anillo de cinco piezas, se une al gangliósido GM1 de la membrana apical del enterocito.'],['Entrada a la célula','La toxina entra por endocitosis y viaja por transporte retrógrado; el fragmento A1 llega al citoplasma.'],['AMPc sin freno','A1 ADP-ribosila la proteína Gsα y la deja encendida: la adenilato ciclasa produce AMPc sin parar.'],['Diarrea secretora','El AMPc activa la PKA, que abre el canal CFTR. Sale cloro a la luz intestinal y lo siguen sodio y agua: diarrea acuosa masiva sin destrucción de la mucosa.']],
    svg:o => { const R = rnd(3); let s = `<rect x="0" y="138" width="600" height="202" fill="var(--m-cell)"/>` + sv.mem(0,600,138) + sv.mem(0,600,326) + sv.tx(16,24,'Luz intestinal') + sv.tx(16,170,'Enterocito');
      s += sv.rec([196,214,232,250],129,'var(--r3)') + sv.tx(262,112,'GM1');
      s += `<g class="tox">${sv.ring(223,100,'var(--r3)')}<circle cx="223" cy="80" r="9" fill="var(--accent2)"/></g>` + sv.tx(150,52,o.ab5.tox,'b');
      s += `<circle class="ves" cx="250" cy="200" r="24" fill="none" stroke="var(--m-head)" stroke-width="5"/><circle class="a1" cx="250" cy="200" r="8" fill="var(--accent2)"/>` + sv.tx(280,204,'A1','a1l');
      s += `<rect x="440" y="282" width="64" height="30" rx="8" fill="var(--r4)"/>` + sv.tx(472,301,'AC','b','middle') + `<circle class="gs" cx="418" cy="296" r="14" fill="var(--muted)"/>` + sv.tx(418,300,'Gs','b','middle');
      s += sv.flow('camp',14,478,262,R,{dx:[-30,30],dy:[-90,-40],jx:60,jy:20,fill:['var(--r2)'],gap:.16}) + sv.tx(520,246,'AMPc','campl');
      s += `<rect x="470" y="124" width="9" height="28" rx="3" fill="var(--r2)"/><rect x="489" y="124" width="9" height="28" rx="3" fill="var(--r2)"/>` + sv.tx(506,164,'CFTR');
      s += sv.flow('cl',8,484,146,R,{dx:[-45,45],dy:[-130,-90],fill:['var(--r2)'],r:4.5,gap:.3});
      for (let i=0;i<9;i++){ const x = 430+R()*150; s += `<path class="h2o" d="M${f(x)} 124c-5 7-7 11-7 14a7 7 0 0 0 14 0c0-3-2-7-7-14z" fill="var(--m-water)" style="--dx:${f((R()-.5)*30)}px;--dy:${f(-70-R()*30)}px;animation-delay:${f(R()*2.4)}s"/>`; }
      return s + sv.tx(590,40,'Cl⁻ · Na⁺ · H₂O → diarrea','b h2ol','end'); },
    css:`.mx-ab5 .tox{transform:translate(-120px,-40px)}.mx-ab5.s1 .tox{transform:translate(0,14px)}.mx-ab5.s2 .tox{opacity:.25}
.mx-ab5 :is(.ves,.a1,.a1l,.camp,.campl,.cl,.h2o,.h2ol){opacity:0}.mx-ab5.s2 :is(.ves,.a1,.a1l){opacity:1}
.mx-ab5.s3 .a1{transform:translate(168px,96px)}.mx-ab5.s3 .a1l{opacity:0}.mx-ab5.s3 .gs{fill:var(--accent)}
.mx-ab5.s3 .camp{animation:mxUp 2.4s var(--ease-std) infinite}.mx-ab5.s3 .campl,.mx-ab5.s4 .h2ol{opacity:1}
.mx-ab5.s4 .cl{animation:mxUp 2.2s var(--ease-std) infinite}.mx-ab5.s4 .h2o{animation:mxUp 2.6s var(--ease-std) infinite}`
  };

  MX.shiga = {
    title:() => 'Toxina Shiga: el ribosoma se detiene',
    steps:() => [['Unión a Gb3','La subunidad B se une al glucolípido Gb3, abundante en el endotelio del riñón, el intestino y el cerebro.'],['Transporte retrógrado','La toxina viaja en vesículas desde el aparato de Golgi hasta el retículo endoplásmico.'],['Ataque al ribosoma','El fragmento A1 sale al citoplasma y quita una adenina del ARNr 28S (actividad N-glucosidasa).'],['Muerte celular','El ribosoma ya no fabrica proteínas y la célula muere. El daño del endotelio glomerular causa el síndrome hemolítico urémico.']],
    svg:() => { let s = `<rect x="0" y="128" width="600" height="212" fill="var(--m-cell)"/>` + sv.mem(0,600,128) + sv.tx(16,24,'Luz intestinal / sangre') + sv.tx(16,160,'Célula endotelial');
      s += sv.rec([124,142,160,178],119,'var(--r5)') + sv.tx(190,104,'Gb3');
      s += `<g class="tox">${sv.ring(151,100,'var(--r5)')}<circle cx="151" cy="80" r="9" fill="var(--accent2)"/></g>`;
      s += `<g class="sv"><circle cx="151" cy="176" r="18" fill="none" stroke="var(--m-head)" stroke-width="4"/><circle cx="151" cy="176" r="6" fill="var(--accent2)"/></g>`;
      for (let i=0;i<4;i++) s += `<path d="M272 ${206+i*8}q29-12 58 0" stroke="var(--r4)" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      s += sv.tx(301,256,'Golgi','','middle') + `<path d="M405 186c18-16 36 16 54 0s36 16 54 0M405 206c18-16 36 16 54 0s36 16 54 0" stroke="var(--r6)" stroke-width="5" fill="none"/>` + sv.tx(460,236,'Retículo endoplásmico','','middle');
      s += `<ellipse cx="170" cy="282" rx="34" ry="20" fill="var(--r2)"/><ellipse cx="170" cy="306" rx="24" ry="11" fill="var(--r5)"/>` + sv.tx(16,334,'Ribosoma · ARNr 28S');
      s += `<circle class="ade" cx="176" cy="266" r="6" fill="var(--accent)"/><path class="chain" d="M204 290c16-12 30 12 46 0s30 12 46 0 30 12 46 0" stroke="var(--accent)" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="150" stroke-dashoffset="150"/>`;
      s += `<circle class="a1" cx="451" cy="196" r="7" fill="var(--accent2)"/><rect class="dead" x="0" y="136" width="600" height="204" fill="var(--accent2)"/>` + sv.tx(584,170,'Muerte celular → SHU','b deadl','end');
      return s; },
    css:`.mx-shiga .tox{transform:translate(-90px,-40px)}.mx-shiga.s1 .tox{transform:translate(0,14px)}.mx-shiga.s2 .tox{opacity:.2}
.mx-shiga :is(.sv,.a1,.dead,.deadl){opacity:0}.mx-shiga.s2 .sv{opacity:1;transform:translate(150px,40px)}.mx-shiga.s3 .sv{transform:translate(300px,20px);opacity:.35}
.mx-shiga.s3 .a1{opacity:1;transform:translate(-275px,72px);transition-delay:.9s}.mx-shiga.s3 .ade{transform:translate(-40px,-56px);opacity:0;transition-delay:2s}
.mx-shiga .chain{animation:mxDash 2.6s linear infinite}.mx-shiga.s4 .chain{animation:none;stroke-dashoffset:95;stroke:var(--muted)}
.mx-shiga.s4 .dead{opacity:.13}.mx-shiga.s4 .deadl{opacity:1}`
  };

  MX.t3ss = {
    title:() => 'Sistema de secreción tipo III',
    steps:o => [['Contacto',`${o.short} se acerca a la célula y apoya la punta de su inyectisoma, una «jeringa» molecular de más de 20 proteínas.`],['Translocón','Las proteínas de la punta abren un poro en la membrana del huésped y conectan la aguja con su citoplasma.'],['Inyección',`Las proteínas efectoras (${o.t3.eff}) viajan desplegadas por la aguja directamente al interior de la célula.`],['Resultado',o.t3.end]],
    svg:o => { const t = o.t3, R = rnd(9); let s = `<rect x="0" y="222" width="600" height="118" fill="var(--m-cell)"/>` + sv.mem(0,600,222) + sv.tx(16,330,t.host);
      if (t.engulf) s += `<path class="ruf" d="M160 216C118 170 112 110 150 62" stroke="var(--accent)" stroke-width="12" stroke-linecap="round" fill="none"/><path class="ruf" d="M440 216C482 170 488 110 450 62" stroke="var(--accent)" stroke-width="12" stroke-linecap="round" fill="none"/><path class="act" d="M220 240l20 30M260 238l-10 34M340 238l12 34M380 240l-18 30" stroke="var(--accent)" stroke-width="3"/>`;
      else s += `<path class="arm" d="M570 330C560 250 520 190 470 150" stroke="var(--m-cell-s)" stroke-width="18" stroke-linecap="round" fill="none" stroke-dasharray="260" stroke-dashoffset="260"/><g class="no"><path d="M488 140l24 24m0-24l-24 24" stroke="var(--accent2)" stroke-width="5" stroke-linecap="round"/>${sv.tx(590,124,'Fagocito paralizado','b','end')}</g>`;
      s += `<g class="bac">${sv.bac(150,30,300,84)}<rect x="288" y="110" width="24" height="12" rx="3" fill="var(--r4)"/><path d="M300 122V180" stroke="var(--r4)" stroke-width="6" stroke-linecap="round"/>${sv.tx(318,168,'Inyectisoma')}${sv.tx(300,78,o.short,'b','middle')}</g>`;
      s += `<g class="pore"><rect x="284" y="206" width="9" height="28" rx="3" fill="var(--accent2)"/><rect x="307" y="206" width="9" height="28" rx="3" fill="var(--accent2)"/></g>`;
      s += sv.flow('eff',10,300,212,R,{dx:[-120,120],dy:[50,105],fill:['var(--r1)','var(--r2)','var(--r5)'],r:5,gap:.26}) + sv.tx(590,262,t.eff,'effl','end');
      return s; },
    css:`.mx-t3ss .bac{transform:translate(0,-26px)}.mx-t3ss.s1 .bac{transform:translate(0,30px)}
.mx-t3ss :is(.pore,.eff,.effl,.act,.no){opacity:0}.mx-t3ss.s2 .pore,.mx-t3ss.s3 .effl,.mx-t3ss.s4 :is(.act,.no){opacity:1}
.mx-t3ss.s3 .eff{animation:mxUp 2.6s var(--ease-std) infinite}
.mx-t3ss .ruf{stroke-dasharray:200;stroke-dashoffset:200}.mx-t3ss.s4 .ruf{stroke-dashoffset:0}
.mx-t3ss.s1 .arm{stroke-dashoffset:60}.mx-t3ss.s4 .arm{stroke-dashoffset:210}`
  };

  MX.superag = {
    title:() => 'Superantígeno: activación masiva de linfocitos T',
    steps:o => [['Presentación normal','La célula presentadora muestra un péptido en el surco del MHC-II. Solo los pocos linfocitos T con el receptor exacto lo reconocen.'],['Puente superantígeno',`${o.sag} se une por fuera del surco al MHC-II y a la región Vβ del receptor T, sin procesar ningún péptido.`],['Activación masiva','Se activan hasta 20–30 % de todos los linfocitos T del cuerpo, cuando lo normal es menos de 0,01 %.'],['Tormenta de citocinas','Liberan IL-2, TNF-α e IFN-γ en cantidades enormes: fiebre alta, exantema, hipotensión y falla multiorgánica (síndrome de choque tóxico).']],
    svg:() => { const R = rnd(4); let s = `<path d="M0 30H200C244 30 256 80 256 150C256 220 244 270 200 270H0Z" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="3"/>` + sv.tx(16,22,'Célula presentadora (APC)');
      s += `<rect x="256" y="132" width="34" height="10" rx="4" fill="var(--r3)"/><rect x="256" y="160" width="34" height="10" rx="4" fill="var(--r3)"/>` + sv.tx(206,190,'MHC-II') + `<circle class="pep" cx="284" cy="151" r="6" fill="var(--r1)"/>`;
      s += `<g class="tc"><path d="M600 30H400C356 30 344 80 344 150C344 220 356 270 400 270H600Z" fill="var(--m-bac)" stroke="var(--m-bac-s)" stroke-width="3"/><rect x="310" y="132" width="34" height="10" rx="4" fill="var(--r4)"/><rect x="310" y="160" width="34" height="10" rx="4" fill="var(--r4)"/>${sv.tx(584,264,'Linfocito T','','end')}${sv.tx(356,190,'TCR')}</g>`;
      s += `<g class="sag"><path d="M282 96L320 96L314 134L288 134Z" fill="var(--accent2)"/>${sv.tx(326,90,'Superantígeno','b')}</g>`;
      for (let i=0;i<22;i++) s += `<circle class="cel${i%4===1||i===10?' on':''}" cx="${f(40+i*24.8)}" cy="300" r="8" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="2" style="transition-delay:${i*50}ms"/>`;
      s += sv.tx(300,330,'Hasta 20–30 % de los linfocitos T se activan','b s3l','middle');
      for (let i=0;i<26;i++){ const a = i/26*Math.PI*2; s += `<circle class="cy" cx="300" cy="150" r="4" fill="${['var(--r2)','var(--r5)','var(--accent)'][i%3]}" style="--dx:${f(Math.cos(a)*(90+R()*90))}px;--dy:${f(Math.sin(a)*(60+R()*60))}px;animation-delay:${f(R()*2)}s"/>`; }
      return s + sv.tx(300,22,'IL-2 · TNF-α · IFN-γ','b s4l','middle'); },
    css:`.mx-superag .tc{transform:translate(60px,0)}.mx-superag.s1 .tc{transform:translate(-14px,0)}.mx-superag.s2 .tc{transform:none}
.mx-superag .sag{transform:translate(0,-80px);opacity:0}.mx-superag.s2 .sag{transform:none;opacity:1}.mx-superag.s2 .pep{opacity:.3}
.mx-superag :is(.s3l,.s4l,.cy){opacity:0}.mx-superag.s3 .cel.on{fill:var(--accent)}.mx-superag.s3 .s3l,.mx-superag.s4 .s4l{opacity:1}
.mx-superag.s4 .cy{animation:mxUp 2.2s var(--ease-std) infinite}`
  };

  MX.capsule = {
    title:() => 'La cápsula frente a la fagocitosis',
    steps:o => [['Bacteria sin cápsula','El complemento (C3b) y los anticuerpos recubren la superficie (opsonización): el macrófago la reconoce y la fagocita.'],['Con cápsula',`La cápsula de ${o.short} es un gel resbaladizo de polisacárido: el C3b no se fija bien y el macrófago no tiene de dónde agarrarse.`],['Anticuerpos anticapsulares',o.capVax ? 'Las vacunas inducen anticuerpos contra el polisacárido capsular. Al cubrir la cápsula, permiten la fagocitosis.' : 'Contra Klebsiella aún no hay vacuna aprobada, pero los anticuerpos contra la cápsula también permiten la fagocitosis.']],
    svg:() => { const R = rnd(6);
      let s = `<path d="M600 34C480 34 438 84 446 140C410 150 410 196 446 206C438 262 480 306 600 306Z" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="3"/>` + sv.tx(588,26,'Macrófago','','end');
      const halo = `<ellipse cx="190" cy="170" rx="96" ry="62" fill="var(--r3)" fill-opacity=".2" stroke="var(--r3)" stroke-dasharray="4 5" stroke-width="2"/>`;
      let c3 = ''; for (let i=0;i<10;i++){ const a = i/10*Math.PI*2; c3 += `<circle class="c3" cx="${f(190+66*Math.cos(a))}" cy="${f(170+32*Math.sin(a))}" r="5" fill="var(--r2)" style="--ox:${f(Math.cos(a)*60)}px;--oy:${f(Math.sin(a)*50)}px"/>`; }
      s += `<g class="scA">${sv.tx(16,26,'Sin cápsula','b')}<g class="eng">${sv.bac(130,144,120,52)}${c3}</g></g>`;
      let bo = ''; for (let i=0;i<9;i++){ const a = i/9*Math.PI*2; bo += `<circle class="c3b" cx="${f(190+150*Math.cos(a))}" cy="${f(170+100*Math.sin(a))}" r="5" fill="var(--r2)" style="--dx:${f(-Math.cos(a)*48)}px;--dy:${f(-Math.sin(a)*34)}px;animation-delay:${f(R()*1.5)}s"/>`; }
      s += `<g class="scB">${sv.tx(16,26,'Con cápsula','b')}${halo}${sv.bac(130,144,120,52)}${bo}<path class="arm" d="M446 170C400 168 340 170 300 170" stroke="var(--m-cell-s)" stroke-width="20" stroke-linecap="round" fill="none" stroke-dasharray="150"/>${sv.tx(300,322,'El C3b no se fija y el macrófago no logra atraparla','','middle')}</g>`;
      let abs = ''; for (let i=0;i<9;i++){ const a = i/9*Math.PI*2; const x = 190+104*Math.cos(a), y = 170+68*Math.sin(a); abs += sv.ab(x, y, Math.atan2(-Math.cos(a), Math.sin(a))*180/Math.PI, 'abk', 'var(--accent)', `--ox:${f(Math.cos(a)*50)}px;--oy:${f(Math.sin(a)*40)}px`); }
      s += `<g class="scC">${sv.tx(16,26,'Con anticuerpos anticapsulares','b')}<g class="eng2">${halo}${sv.bac(130,144,120,52)}${abs}</g></g>`;
      return s; },
    css:`.mx-capsule :is(.scA,.scB,.scC){opacity:0}.mx-capsule[data-step="1"] .scA,.mx-capsule[data-step="2"] .scB,.mx-capsule[data-step="3"] .scC{opacity:1}
.mx-capsule .c3,.mx-capsule .abk{transform:translate(var(--ox),var(--oy));opacity:0}
.mx-capsule[data-step="1"] .c3,.mx-capsule[data-step="3"] .abk{transform:none;opacity:1;transition-delay:.3s}
.mx-capsule .eng,.mx-capsule .eng2{transform-box:fill-box;transform-origin:center}
.mx-capsule[data-step="1"] .eng{animation:mxEngulf 3.6s var(--ease-out) 1.6s forwards}.mx-capsule[data-step="3"] .eng2{animation:mxEngulf 3.6s var(--ease-out) 2s forwards}
.mx-capsule[data-step="2"] .c3b{animation:mxBounce 2.2s var(--ease-std) infinite}.mx-capsule[data-step="2"] .arm{animation:mxReach 2.6s var(--ease-std) infinite}`
  };

  MX.urease = {
    title:() => 'Ureasa: un escudo contra el ácido',
    steps:() => [['Un ambiente letal','La luz gástrica tiene un pH cercano a 2. Casi ninguna bacteria sobrevive allí más que unos minutos.'],['Entra la urea','H. pylori capta la urea del jugo gástrico. La ureasa es una de sus proteínas más abundantes.'],['Escudo de amoníaco','La ureasa produce amoníaco y CO₂. El amoníaco neutraliza los protones y crea una burbuja casi neutra alrededor de la bacteria.'],['Hacia el epitelio','Protegida, nada con sus flagelos a través del moco hasta el epitelio, donde se adhiere e inyecta CagA en las células gástricas.']],
    svg:() => { const R = rnd(11); let s = sv.tx(16,24,'Luz gástrica') + sv.tx(16,44,'pH ≈ 2','b');
      s += `<path d="M0 238C100 226 200 250 300 238S500 226 600 240V290H0Z" fill="var(--r3)" fill-opacity=".16"/>` + sv.tx(16,262,'Moco');
      for (let i=0;i<6;i++) s += `<rect x="${i*100+2}" y="290" width="96" height="60" rx="6" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="2"/>`;
      s += sv.tx(16,318,'Epitelio gástrico');
      for (let i=0;i<32;i++){ const x = 30+R()*550, y = 60+R()*160, near = Math.hypot(x-150,y-110) < 95; s += `<text class="hp${near?' near':''}" x="${f(x)}" y="${f(y)}" style="fill:var(--r1);font-size:13px">H⁺</text>`; }
      s += `<g class="mv"><circle class="cloud" cx="150" cy="110" r="80" fill="var(--accent)"/>`;
      s += `<path d="M100 110c12-20 24-20 36 0s24 20 36 0 24-20 36 0" stroke="var(--m-bac-s)" stroke-width="15" stroke-linecap="round" fill="none"/><path d="M100 110c12-20 24-20 36 0s24 20 36 0 24-20 36 0" stroke="var(--m-bac)" stroke-width="9" stroke-linecap="round" fill="none"/>`;
      s += `<path d="M208 110c10-8 20 8 32 0M208 106c10-14 20 0 30-10M208 114c10 0 20 14 30 6" stroke="var(--m-bac-s)" stroke-width="2" fill="none"/>` + sv.tx(150,206,'NH₃ · pH ≈ 7','b cl2','middle') + `</g>`;
      s += sv.flow('ur',6,150,110,R,{shape:'text',txt:'urea',dx:[0,0],dy:[0,0],fill:['var(--r5)'],gap:.4});
      return s + sv.flow('cag',6,372,270,R,{dx:[-20,20],dy:[40,55],fill:['var(--accent2)'],gap:.3}); },
    css:`.mx-urease .cloud{transform-box:fill-box;transform-origin:center;transform:scale(0);opacity:0}.mx-urease.s3 .cloud{transform:scale(1);opacity:.22}
.mx-urease .ur{opacity:0}.mx-urease.s2 .ur{animation:mxIn 2.4s var(--ease-std) infinite}.mx-urease.s3 .ur{animation:none;opacity:0}
.mx-urease .ur:nth-of-type(6n+1){--sx:-140px;--sy:-60px}.mx-urease .ur:nth-of-type(6n+2){--sx:180px;--sy:-50px}.mx-urease .ur:nth-of-type(6n+3){--sx:200px;--sy:60px}.mx-urease .ur:nth-of-type(6n+4){--sx:-120px;--sy:80px}.mx-urease .ur:nth-of-type(6n+5){--sx:60px;--sy:-90px}.mx-urease .ur:nth-of-type(6n){--sx:260px;--sy:10px}
.mx-urease .cl2,.mx-urease .cag{opacity:0}.mx-urease.s3 .cl2{opacity:1}.mx-urease.s3 .hp.near{opacity:.12}
.mx-urease.s4 .mv{transform:translate(220px,148px)}.mx-urease.s4 .cag{animation:mxUp 2s var(--ease-std) 1.2s infinite}`
  };

  MX.phagosome = {
    title:() => 'Sobrevivir dentro del macrófago',
    steps:() => [['Fagocitosis','Un macrófago alveolar ingiere el bacilo inhalado dentro de un fagosoma.'],['Fusión bloqueada','Lípidos de la pared y proteínas como PknG y SapM impiden que el fagosoma se acidifique y se fusione con los lisosomas.'],['Escape y multiplicación','Con ESX-1 y ESAT-6 perfora el fagosoma, llega al citoplasma y se multiplica lentamente, cada 18–24 horas.'],['Granuloma','Linfocitos y macrófagos rodean a las células infectadas: el granuloma contiene la infección, pero el bacilo puede sobrevivir años en su interior.']],
    svg:() => { const R = rnd(13); let s = `<ellipse cx="300" cy="180" rx="250" ry="150" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="3"/><ellipse cx="160" cy="200" rx="52" ry="34" fill="var(--m-cell-s)" fill-opacity=".5"/>` + sv.tx(60,46,'Macrófago alveolar');
      s += `<rect class="mb" x="470" y="6" width="46" height="16" rx="8" fill="var(--accent2)"/><circle class="ph" cx="353" cy="160" r="34" stroke="var(--m-head)" stroke-width="4" fill="none"/>`;
      [[470,250,-85,-60],[240,270,80,-75],[470,110,-80,35]].forEach(([x,y,dx,dy]) => { s += `<g class="ly" style="--dx:${dx}px;--dy:${dy}px"><circle cx="${x}" cy="${y}" r="15" fill="var(--r4)"/><circle cx="${x-4}" cy="${y-3}" r="2.5" fill="var(--bg)"/><circle cx="${x+5}" cy="${y+4}" r="2.5" fill="var(--bg)"/></g>`; });
      s += sv.tx(470,296,'Lisosomas','','middle') + sv.tx(396,118,'✕ sin fusión','b blk');
      for (let i=0;i<7;i++) s += `<rect class="mb2" x="${f(380+R()*130)}" y="${f(140+R()*120)}" width="40" height="13" rx="6.5" fill="var(--accent2)" transform="rotate(${f((R()-.5)*60)} 450 200)" style="transition-delay:${i*180}ms"/>`;
      s += sv.tx(330,104,'ESX-1 / ESAT-6','b esx');
      let gr = `<g class="gr"><rect width="600" height="340" fill="var(--bg)" opacity=".94"/><circle cx="300" cy="170" r="52" fill="var(--r2)" fill-opacity=".45"/>` + sv.tx(300,174,'Necrosis caseosa','','middle');
      for (let i=0;i<14;i++){ const a = i/14*Math.PI*2; gr += `<circle cx="${f(300+Math.cos(a)*88)}" cy="${f(170+Math.sin(a)*88)}" r="18" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="2"/>`; }
      for (let i=0;i<30;i++){ const a = i/30*Math.PI*2; gr += `<circle cx="${f(300+Math.cos(a)*132)}" cy="${f(170+Math.sin(a)*132)}" r="8" fill="var(--r4)"/>`; }
      return s + gr + sv.tx(300,24,'Granuloma','b','middle') + sv.tx(470,330,'Linfocitos','','middle') + `</g>`; },
    css:`.mx-phagosome .mb{transform:none}.mx-phagosome.s1 .mb{transform:translate(-140px,147px)}
.mx-phagosome :is(.ph,.blk,.mb2,.esx,.gr){opacity:0}.mx-phagosome.s1 .ph{opacity:1;transition-delay:.9s}
.mx-phagosome.s2 .ly{animation:mxBounce 2.4s var(--ease-std) infinite}.mx-phagosome.s2 .blk{opacity:1}
.mx-phagosome.s3 .ph{stroke-dasharray:8 10;stroke:var(--accent2)}.mx-phagosome.s3 :is(.mb2,.esx){opacity:1}.mx-phagosome.s3 .blk{opacity:0}
.mx-phagosome.s4 .gr{opacity:1}`
  };

  MX.fusion = {
    title:o => `Entrada a la célula: ${o.fusion.lig} y ${o.fusion.rec}`,
    steps:o => o.fusion.txt,
    svg:o => { const F = o.fusion, endo = F.mode === 'endosome', R = rnd(17);
      let s = `<rect x="0" y="222" width="600" height="118" fill="var(--m-cell)"/>` + sv.mem(0,600,222,'flat') + sv.tx(16,330,`Célula · receptor ${F.rec}`);
      if (endo) s += `<g class="pit"><rect x="0" y="214" width="600" height="126" fill="var(--m-cell)"/><path d="M0 222H200C230 222 220 330 300 330C380 330 370 222 400 222H600" stroke="var(--m-mem)" stroke-width="16" fill="none"/><path d="M0 222H200C230 222 220 330 300 330C380 330 370 222 400 222H600" stroke="var(--m-head)" stroke-width="5" stroke-dasharray="2 8" fill="none"/>${[0,1,2,3,4,5].map(i => `<text x="${262+i*14}" y="${270+(i%2)*22}" style="fill:var(--r1);font-size:12px">H⁺</text>`).join('')}${sv.tx(420,300,'Endosoma · pH ≈ 5','b')}</g>`;
      for (const x of [270,300,330]) s += `<g class="rec"><rect x="${x-4}" y="192" width="8" height="22" rx="3" fill="var(--r4)"/><circle cx="${x}" cy="190" r="6" fill="var(--r4)"/></g>`;
      let sp = ''; for (let i=0;i<12;i++){ const a = i/12*Math.PI*2; sp += `<path d="M${f(300+Math.cos(a)*47)} ${f(92+Math.sin(a)*47)}L${f(300+Math.cos(a)*58)} ${f(92+Math.sin(a)*58)}" stroke="var(--accent2)" stroke-width="3"/><circle cx="${f(300+Math.cos(a)*62)}" cy="${f(92+Math.sin(a)*62)}" r="5.5" fill="var(--accent2)"/>`; }
      s += `<g class="vir">${sp}<circle cx="300" cy="92" r="44" fill="var(--m-bac)" stroke="var(--m-head)" stroke-width="6"/>${F.cone ? `<path d="M286 74L322 96L292 116Z" fill="var(--r2)" fill-opacity=".5" stroke="var(--r2)" stroke-width="2"/>` : `<path d="M276 92c8-14 16 14 24 0s16 14 24 0" stroke="var(--r2)" stroke-width="3" fill="none"/>`}</g>`;
      s += sv.tx(372,52,F.lig,'b');
      s += `<g class="co"><circle cx="238" cy="200" r="11" fill="var(--r5)"/>${sv.tx(228,252,F.co,'b','end')}</g>`;
      s += `<rect class="pore" x="272" y="${endo ? 318 : 212}" width="56" height="20" fill="var(--m-cell)"/>`;
      if (F.cone) s += `<path class="gen2 cone" d="M286 262L322 284L292 304Z" fill="var(--r2)" fill-opacity=".6" stroke="var(--r2)" stroke-width="2"/>`;
      else for (let i=0;i<4;i++) s += `<path class="gen2" d="M${280+i*8} 252c8-12 16 12 24 0s16 12 24 0" stroke="var(--r2)" stroke-width="3" fill="none" style="--dx:${f((R()-.5)*160)}px;--dy:${f(40+R()*30)}px;animation-delay:${f(i*.5)}s"/>`;
      return s + sv.tx(590,316,F.gen,'b g2l','end'); },
    css:`.mx-fusion .vir{transform:translate(0,-20px)}.mx-fusion.s1 .vir{transform:translate(0,40px)}
.mx-fusion :is(.co,.pit,.pore,.gen2,.g2l){opacity:0}.mx-fusion.s2 .co{opacity:1}
.mx-fusion.s2 .pit{opacity:1}.mx-fusion.s2:has(.pit) .vir{transform:translate(0,140px)}.mx-fusion.s2:has(.pit) .rec{opacity:0}
.mx-fusion.s3 .vir{transform:translate(0,98px) scale(.9,.75)}.mx-fusion.s3:has(.pit) .vir{transform:translate(0,170px) scale(.85,.7)}.mx-fusion.s3 .pore{opacity:1}
.mx-fusion.s4 .vir{opacity:.2}.mx-fusion.s4 .g2l{opacity:1}.mx-fusion.s4 .gen2{animation:mxUp 3s var(--ease-std) infinite}
.mx-fusion.s4 .cone{--dx:40px;--dy:30px}`
  };

  MX.phage = {
    title:() => 'Ciclo lítico del fago T4',
    steps:() => [['Reconocimiento','Las fibras largas de la cola tantean la superficie y se unen a OmpC o al LPS de E. coli.'],['Anclaje','La placa basal cambia de forma y despliega fibras cortas que la fijan a la membrana externa.'],['Contracción e inyección','La vaina se contrae como un resorte, el tubo interno atraviesa la envoltura y el ADN entra a la bacteria.'],['Replicación y lisis','En unos 25 minutos se ensamblan 100–200 fagos nuevos; holina y endolisina rompen la célula y los liberan.']],
    svg:() => { const R = rnd(19); let s = `<rect x="0" y="244" width="600" height="96" fill="var(--m-bac)"/>` + sv.mem(0,600,204) + `<rect x="0" y="214" width="600" height="12" fill="var(--r5)" fill-opacity=".5"/>` + sv.mem(0,600,236);
      s += sv.tx(16,192,'Membrana externa · peptidoglicano · membrana interna') + sv.tx(16,332,'E. coli');
      const hex = (cx,cy,r) => Array.from({length:6}, (_,k) => { const a = k/6*Math.PI*2+Math.PI/6; return `${f(cx+Math.cos(a)*r)},${f(cy+Math.sin(a)*r)}`; }).join(' ');
      s += `<g class="ph"><g class="hd"><polygon points="${hex(300,46,30)}" fill="var(--m-cell)" stroke="var(--r4)" stroke-width="3"/><path d="M286 40c8-10 20 10 28 0M286 52c8-10 20 10 28 0" stroke="var(--r2)" stroke-width="2.5" fill="none"/><rect x="292" y="76" width="16" height="6" fill="var(--r4)"/></g>`;
      s += `<g class="sh"><rect x="290" y="82" width="20" height="60" rx="3" fill="var(--r2)"/>${[0,1,2,3,4,5].map(i => `<path d="M290 ${90+i*9}h20" stroke="var(--bg)" stroke-width="1.5"/>`).join('')}</g>`;
      s += `<path class="tb" d="M300 150V232" stroke="var(--accent)" stroke-width="4"/><rect x="284" y="142" width="32" height="8" rx="2" fill="var(--r4)"/><path d="M286 146l-40-16-22 50M314 146l40-16 22 50" stroke="var(--r4)" stroke-width="3" fill="none"/><path class="pins" d="M290 150l-6 10M310 150l6 10" stroke="var(--r4)" stroke-width="3"/></g>`;
      s += `<path class="dna" d="M300 282c14 8-14 16 0 24s-14 16 0 24 14 8 30 4" stroke="var(--r2)" stroke-width="3" fill="none" stroke-dasharray="90" stroke-dashoffset="90"/>`;
      for (let i=0;i<12;i++){ const x = 60+R()*480, y = 262+R()*58; s += `<g class="np" style="transition-delay:${i*120}ms"><polygon points="${hex(x,y,6)}" fill="var(--m-cell)" stroke="var(--r4)" stroke-width="1.5"/><path d="M${f(x)} ${f(y+6)}v8" stroke="var(--r2)" stroke-width="2"/></g>`; }
      return s + `<path class="ck" d="M90 196l12 16-9 12 14 14M470 196l-10 18 12 10-8 16" stroke="var(--accent2)" stroke-width="3" fill="none"/>` + sv.tx(590,192,'Lisis: 100–200 fagos nuevos','b ckl','end'); },
    css:`.mx-phage .ph{transform:translate(0,-60px)}.mx-phage.s1 .ph{transform:translate(0,22px)}.mx-phage.s2 .ph{transform:translate(0,48px)}
.mx-phage :is(.pins,.tb,.np,.ck,.ckl){opacity:0}.mx-phage.s2 .pins{opacity:1}
.mx-phage .sh{transform-box:fill-box;transform-origin:50% 100%}.mx-phage.s3 .sh{transform:scaleY(.45)}.mx-phage.s3 .hd{transform:translate(0,33px)}
.mx-phage.s3 .tb{opacity:1}.mx-phage.s3 .dna{stroke-dashoffset:0;transition-delay:.8s}
.mx-phage.s4 :is(.np,.ck,.ckl){opacity:1}.mx-phage.s4 .ph{opacity:.35}`
  };
})(window.ATLAS);
