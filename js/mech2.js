/* Atlas de Microbiología GERMEN · mecanismos animados (2/2): citoesqueleto, variación antigénica, biopelícula, malaria y resistencia */
(function (A) {
  const sv = A.sv, MX = A.MX, rnd = sv.rnd, f = n => n.toFixed(1);
  const rod = (x,y,rot,c='',st='') => `<g class="${c}" style="${st}"><rect x="${f(x-13)}" y="${f(y-6)}" width="26" height="12" rx="6" fill="var(--m-bac)" stroke="var(--m-bac-s)" stroke-width="2" transform="rotate(${f(rot)} ${f(x)} ${f(y)})"/></g>`;

  MX.glucosyl = {
    title:() => 'Toxinas A y B: colapso del citoesqueleto',
    steps:() => [['Unión y entrada','TcdA y TcdB se unen a receptores del colonocito (por ejemplo, frizzled y CSPG4 para TcdB) y entran por endocitosis.'],['Translocación','La acidez del endosoma cambia la forma de la toxina; su dominio glucosiltransferasa pasa al citoplasma.'],['Glucosilación de Rho','El dominio añade glucosa a las GTPasas Rho, Rac y Cdc42. El citoesqueleto de actina colapsa y la célula se redondea.'],['Colitis','Se abren las uniones estrechas, sale líquido y llegan neutrófilos. Fibrina, moco y restos celulares forman las pseudomembranas.']],
    svg:() => { const R = rnd(23); let s = sv.tx(16,24,'Luz del colon');
      [30,215,400].forEach((x,i) => { s += `<g class="c${i+1}"><rect x="${x}" y="130" width="170" height="200" rx="10" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="2.5"/>`; for (let k=0;k<6;k++) s += `<path class="af" d="M${x+20+k*26} 150V318" stroke="var(--accent)" stroke-width="2" opacity=".7"/>`; s += `</g>`; });
      s += `<rect class="tj" x="200" y="132" width="15" height="16" fill="var(--r5)"/><rect class="tj" x="385" y="132" width="15" height="16" fill="var(--r5)"/>`;
      s += `<g class="tx"><rect x="280" y="30" width="40" height="18" rx="9" fill="var(--r1)"/><circle cx="300" cy="30" r="7" fill="var(--accent2)"/></g><circle class="vs" cx="300" cy="170" r="26" fill="none" stroke="var(--m-head)" stroke-width="4"/>`;
      s += [0,1,2].map(i => `<text class="hx" x="${286+i*10}" y="${164+i*8}" style="fill:var(--r1);font-size:11px">H⁺</text>`).join('') + `<circle class="gtd" cx="300" cy="170" r="7" fill="var(--accent2)"/>`;
      [[250,250],[330,240],[270,290],[345,285]].forEach(([x,y]) => { s += `<circle cx="${x}" cy="${y}" r="8" fill="var(--r4)"/><polygon class="glc" points="${x+8},${y-14} ${x+14},${y-11} ${x+14},${y-5} ${x+8},${y-2} ${x+2},${y-5} ${x+2},${y-11}" fill="var(--r2)"/>`; });
      s += sv.tx(360,320,'Rho · Rac · Cdc42','b');
      s += sv.flow('fl',8,207,140,R,{dx:[-20,20],dy:[-110,-80],fill:['var(--m-water)'],r:4,gap:.3}) + sv.flow('fl',8,392,140,R,{dx:[-20,20],dy:[-110,-80],fill:['var(--m-water)'],r:4,gap:.3});
      s += sv.flow('neu',3,207,320,R,{dx:[-10,10],dy:[-220,-200],fill:['var(--r6)'],r:9,gap:.9});
      return s + `<path class="pm" d="M0 108C120 96 240 120 360 104S540 96 600 110V128H0Z" fill="var(--r2)" fill-opacity=".5"/>` + sv.tx(590,96,'Pseudomembrana','b pml','end'); },
    css:`.mx-glucosyl .tx{transform:translate(0,-10px)}.mx-glucosyl.s1 .tx{transform:translate(0,132px);opacity:.6}
.mx-glucosyl :is(.vs,.hx,.gtd,.glc,.fl,.neu,.pm,.pml){opacity:0}.mx-glucosyl.s1 .vs,.mx-glucosyl.s2 .hx{opacity:1}
.mx-glucosyl.s2 .gtd{opacity:1;transform:translate(-40px,70px)}.mx-glucosyl.s3 .glc{opacity:1}
.mx-glucosyl .af{transform-box:fill-box;transform-origin:center}.mx-glucosyl.s3 .c2 .af{transform:scaleY(.3);opacity:.2}
.mx-glucosyl .c2{transform-box:fill-box;transform-origin:center}.mx-glucosyl.s3 .c2{transform:scale(.92,.86)}
.mx-glucosyl.s4 .tj{opacity:0}.mx-glucosyl.s4 .c1{transform:translate(-8px,0)}.mx-glucosyl.s4 .c3{transform:translate(8px,0)}.mx-glucosyl.s4 :is(.c1,.c3) .af{opacity:.25}
.mx-glucosyl.s4 .fl{animation:mxUp 2.2s var(--ease-std) infinite}.mx-glucosyl.s4 .neu{animation:mxUp 4s var(--ease-std) infinite}.mx-glucosyl.s4 :is(.pm,.pml){opacity:1}`
  };

  MX.antigenic = {
    title:o => `Variación antigénica de ${o.antig.prot}`,
    steps:o => [['Anticuerpos eficaces',`El sistema inmune produce anticuerpos contra la variante de ${o.antig.prot} que está en la superficie.`],['Cambio de gen',o.antig.sw],['Nueva cubierta',`La nueva ${o.antig.prot} tiene otra secuencia: los anticuerpos previos ya no la reconocen y la población escapa.`],['Persistencia',o.antig.end]],
    svg:o => { let s = `<ellipse cx="300" cy="140" rx="150" ry="65" fill="var(--m-bac)" stroke="var(--m-bac-s)" stroke-width="3"/>` + sv.tx(16,24,`${o.short} · superficie: ${o.antig.prot}`,'b');
      const lol = (c,col) => { let g = `<g class="${c}">`; for (let i=0;i<18;i++){ const a = i/18*Math.PI*2, c1 = Math.cos(a), s1 = Math.sin(a); g += `<path d="M${f(300+150*c1)} ${f(140+65*s1)}L${f(300+168*c1)} ${f(140+82*s1)}" stroke="${col}" stroke-width="3"/><circle cx="${f(300+172*c1)}" cy="${f(140+86*s1)}" r="7" fill="${col}"/>`; } return g + '</g>'; };
      s += lol('vA','var(--r3)') + lol('vB','var(--r2)');
      s += `<rect class="es" x="230" y="150" width="40" height="14" rx="3" fill="var(--r3)" stroke="var(--accent)" stroke-width="2"/>` + ['var(--r2)','var(--r5)','var(--r4)','var(--r6)'].map((c,i) => `<rect x="${290+i*30}" y="150" width="26" height="14" rx="3" fill="${c}"/>`).join('');
      s += `<rect class="mv" x="290" y="150" width="26" height="14" rx="3" fill="var(--r2)"/>` + sv.tx(250,186,'expresión','','middle') + sv.tx(345,186,'silenciosos','','middle');
      for (let i=0;i<8;i++){ const a = i/8*Math.PI*2+.2, c1 = Math.cos(a), s1 = Math.sin(a), x = 300+250*c1, y = 140+128*s1, rot = Math.atan2(-c1, s1)*180/Math.PI;
        s += sv.ab(x, y, rot, 'abA', 'var(--r3)', `--dx:${f(-c1*68)}px;--dy:${f(-s1*36)}px;--ox:${f(c1*40)}px;--oy:${f(s1*30)}px`);
        if (i%2===0) s += sv.ab(x, y, rot, 'abB', 'var(--r2)', `--dx:${f(-c1*68)}px;--dy:${f(-s1*36)}px`); }
      return s + sv.tx(300,328,'Nuevos anticuerpos… y otro cambio: el ciclo se repite','b s4l','middle'); },
    css:`.mx-antigenic .vB{opacity:0}.mx-antigenic.s1 .abA{transform:translate(var(--dx),var(--dy))}
.mx-antigenic.s2 .mv{transform:translate(-60px,0)}.mx-antigenic.s2 .es{fill:var(--r2)}
.mx-antigenic.s3 .vA{opacity:0}.mx-antigenic.s3 .vB{opacity:1}.mx-antigenic.s3 .abA{transform:translate(var(--ox),var(--oy));opacity:.2}
.mx-antigenic .abB,.mx-antigenic .s4l{opacity:0}.mx-antigenic.s4 .abB{opacity:1;transform:translate(var(--dx),var(--dy));transition-duration:2.4s}.mx-antigenic.s4 .s4l{opacity:1}`
  };

  MX.biofilm = {
    title:() => 'Formación de biopelícula',
    steps:() => [['Adhesión','Bacterias libres (planctónicas) se adhieren a una superficie mediante pili, adhesinas y fuerzas físicas.'],['Microcolonias y quorum sensing','Se multiplican y liberan señales químicas; al alcanzar cierta densidad cambian la expresión de sus genes.'],['Matriz protectora','Producen una matriz de polisacáridos, proteínas y ADN. Los antibióticos penetran mal y muchas células quedan en reposo: pueden tolerar hasta 1000 veces más antibiótico.'],['Dispersión','La biopelícula madura libera bacterias que colonizan nuevos sitios: bacteriemias de repetición.']],
    svg:() => { const R = rnd(29); let s = `<rect x="0" y="300" width="600" height="40" fill="var(--m-cell-s)" fill-opacity=".6"/>` + sv.tx(16,326,'Superficie: catéter, válvula, prótesis o tejido','b');
      for (let i=0;i<6;i++){ const x = 80+i*90, tx = 200+i*40; s += rod(x, 40+R()*60, R()*180, 'pl', `--dx:${f(tx-x)}px;--dy:${f(286-(40+30))}px`); }
      let mc = ''; for (let i=0;i<28;i++){ const t = R(), x = 180+t*240, h = Math.sin(t*Math.PI)*90; mc += rod(x, 290-R()*h, R()*180, 'mc', `transition-delay:${i*60}ms`); } s += mc;
      s += sv.flow('qs',18,300,240,R,{dx:[0,0],dy:[0,0],jx:220,jy:80,fill:['var(--r2)'],r:3.5,gap:.12});
      s += `<path class="mat" d="M150 300C160 200 230 168 300 168C370 168 440 200 450 300Z" fill="var(--r5)"/>`;
      for (let i=0;i<8;i++){ const x = 180+R()*240; s += `<path class="ad" d="M${f(x)} 10l7 12h-14z" fill="var(--accent2)" style="animation-delay:${f(i*.35)}s"/>`; }
      for (let i=0;i<4;i++) s += rod(300+(i-1.5)*20, 176, R()*180, 'dp', `--dx:${f((i-1.5)*90)}px;--dy:-150px;animation-delay:${f(i*.6)}s`);
      return s; },
    css:`.mx-biofilm.s1 .pl{transform:translate(var(--dx),var(--dy))}.mx-biofilm.s2 .pl{opacity:0}
.mx-biofilm :is(.mc,.qs,.mat,.ad,.dp){opacity:0}.mx-biofilm.s2 .mc{opacity:1}.mx-biofilm.s2 .qs{animation:mxPulse 1.6s var(--ease-std) infinite}
.mx-biofilm.s3 .mat{opacity:.28}.mx-biofilm.s3 .ad{animation:mxDrop 2.8s var(--ease-std) infinite}.mx-biofilm.s4 .dp{animation:mxUp 3s var(--ease-std) infinite}`
  };

  MX.cyto = {
    title:() => 'Citoadherencia y secuestro',
    steps:() => [['Glóbulos rojos parasitados','Al madurar dentro del eritrocito, el parásito lo vuelve rígido y exporta sus proteínas a la membrana.'],['Knobs con PfEMP1','En la superficie aparecen protuberancias (knobs) que exponen PfEMP1, una adhesina variable.'],['Citoadherencia','PfEMP1 se une a ICAM-1, CD36 o EPCR del endotelio: los eritrocitos maduros quedan pegados (secuestro) y evitan pasar por el bazo.'],['Obstrucción e inflamación','Eritrocitos adheridos y rosetas obstruyen la microcirculación. En el cerebro causan hipoxia, inflamación y malaria cerebral.']],
    svg:() => { const R = rnd(31); let s = `<rect width="600" height="36" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="2"/>`;
      for (let i=0;i<6;i++) s += `<rect x="${i*100+1}" y="290" width="98" height="50" rx="6" fill="var(--m-cell)" stroke="var(--m-cell-s)" stroke-width="2"/>`;
      s += sv.tx(16,322,'Endotelio de un capilar cerebral') + sv.rec([120,170,220,270,320,370,420,470,520],289,'var(--r4)') + sv.tx(590,262,'ICAM-1 · CD36 · EPCR','b','end');
      const rbc = (x,y,cls,inf,st='') => `<g class="${cls}" style="${st}"><ellipse cx="${x}" cy="${y}" rx="22" ry="9" fill="var(--r1)" fill-opacity=".75"/>${inf ? `<circle cx="${x+6}" cy="${y}" r="4" fill="none" stroke="var(--r3)" stroke-width="2"/><g class="kn">${[-18,-9,0,9,18].map(dx => `<circle cx="${x+dx}" cy="${y-9}" r="2.5" fill="var(--r2)"/><circle cx="${x+dx}" cy="${y+9}" r="2.5" fill="var(--r2)"/>`).join('')}</g>` : ''}</g>`;
      for (let i=0;i<9;i++) s += rbc(-40, 70+R()*150, 'fr', i%3===0, `animation-delay:${f(-i*.8)}s`);
      [[160,274],[260,274],[340,274],[430,274]].forEach(([x,y],i) => { s += rbc(x,y,'st',true,`transition-delay:${i*250}ms`); });
      s += [[236,258],[284,258],[248,240],[272,244]].map(([x,y]) => rbc(x,y,'ro',false)).join('');
      return s + `<rect class="hyp" width="600" height="340" fill="var(--accent2)"/>` + sv.tx(300,24,'Hipoxia e inflamación → malaria cerebral','b hypl','middle') + sv.tx(16,58,'Flujo →','fl0'); },
    css:`.mx-cyto .fr{animation:mxFlow 6s linear infinite}.mx-cyto .kn{opacity:0}.mx-cyto.s2 .kn{opacity:1}
.mx-cyto :is(.st,.ro,.hyp,.hypl){opacity:0}.mx-cyto.s3 .st,.mx-cyto.s4 .ro{opacity:1}.mx-cyto.s4 .hyp{opacity:.12}.mx-cyto.s4 .hypl{opacity:1}`
  };

  MX.r_inact = {
    title:() => 'Resistencia: inactivación enzimática',
    steps:() => [['Entrada','El β-lactámico atraviesa la membrana externa por una porina y llega al periplasma.'],['Captura','Una β-lactamasa (por ejemplo CTX-M, KPC o NDM) lo atrapa en su sitio activo.'],['Hidrólisis','La enzima rompe el anillo β-lactámico: la molécula queda inactiva antes de llegar a su diana.'],['La pared sigue','Las PBP siguen entrecruzando el peptidoglicano y la bacteria sobrevive. Inhibidores como avibactam o tazobactam bloquean algunas β-lactamasas.']],
    svg:() => { let s = sv.mem(0,280,60) + sv.mem(320,600,60) + `<rect x="282" y="52" width="8" height="16" fill="var(--r3)"/><rect x="310" y="52" width="8" height="16" fill="var(--r3)"/>` + sv.tx(16,40,'Membrana externa · porina') + sv.tx(16,110,'Periplasma') + sv.mem(0,600,250) + sv.tx(16,290,'Membrana interna');
      s += `<rect x="430" y="214" width="56" height="28" rx="8" fill="var(--r4)"/>` + sv.tx(458,233,'PBP','b','middle');
      for (let i=0;i<4;i++) s += `<rect x="${336+i*30}" y="178" width="26" height="10" rx="2" fill="var(--r5)" opacity=".85"/>`;
      for (let i=0;i<4;i++) s += `<rect class="br" x="${456+i*30}" y="178" width="26" height="10" rx="2" fill="var(--r5)" style="transition-delay:${i*350}ms"/>`;
      s += `<g class="abx"><rect x="290" y="6" width="20" height="20" fill="var(--r2)"/><path d="M290 6l20 20" stroke="var(--bg)" stroke-width="2"/></g>`;
      s += `<path class="h1" d="M290 118h20l-20 20z" fill="var(--r2)"/><path class="h2" d="M310 120v18h-18z" fill="var(--r2)"/>`;
      s += `<path class="bl" d="M180 140L202 128A24 24 0 1 0 202 152Z" fill="var(--r1)"/>` + sv.tx(150,182,'β-lactamasa','b');
      return s; },
    css:`.mx-r_inact.s1 .abx{transform:translate(0,112px)}.mx-r_inact.s2 .bl{transform:translate(86px,-12px)}
.mx-r_inact :is(.h1,.h2){opacity:0}.mx-r_inact.s3 .abx{opacity:0}.mx-r_inact.s3 .h1{opacity:1;transform:translate(-40px,40px) rotate(-30deg)}.mx-r_inact.s3 .h2{opacity:1;transform:translate(46px,36px) rotate(25deg)}
.mx-r_inact .br{opacity:.12}.mx-r_inact.s4 .br{opacity:1}`
  };

  MX.r_efflux = {
    title:() => 'Resistencia: bombas de eflujo',
    steps:() => [['Entrada','El antibiótico atraviesa la envoltura y empieza a acumularse en la célula.'],['Captura','AcrB, de la familia RND, lo captura desde el periplasma o la membrana interna.'],['Expulsión','Usando la entrada de protones como energía, lo empuja por el canal de TolC directamente al exterior.'],['Sobreexpresión','Mutaciones en reguladores (marR, acrR, mexR) aumentan el número de bombas. Una sola bomba expulsa varias familias de antibióticos.']],
    svg:() => { const R = rnd(37); let s = sv.mem(0,600,60) + sv.mem(0,600,240) + sv.tx(16,40,'Membrana externa') + sv.tx(16,150,'Periplasma') + sv.tx(16,290,'Citoplasma');
      const pump = (x,c='') => `<g class="${c}"><rect x="${x-18}" y="40" width="36" height="110" rx="8" fill="var(--r3)"/><path d="M${x-30} 150H${x+30}L${x+22} 200H${x-22}Z" fill="var(--r5)"/><rect x="${x-34}" y="200" width="68" height="56" rx="12" fill="var(--accent)" opacity=".9"/></g>`;
      s += pump(300) + pump(140,'p2') + pump(460,'p2') + sv.tx(326,96,'TolC') + sv.tx(338,180,'AcrA') + sv.tx(342,234,'AcrB');
      s += sv.flow('ad1',8,300,10,R,{dx:[-220,220],dy:[270,290],jx:400,fill:['var(--r2)'],gap:.35});
      s += sv.flow('ad2',5,300,300,R,{dx:[0,0],dy:[-60,-60],jx:60,fill:['var(--r2)'],gap:.45});
      s += sv.flow('ad3',6,300,230,R,{dx:[0,0],dy:[-240,-230],fill:['var(--r2)'],gap:.4});
      s += sv.flow('hp',4,350,190,R,{shape:'text',txt:'H⁺',dx:[-40,-40],dy:[90,90],fill:['var(--r1)'],gap:.6});
      return s + `<g class="lvl">${sv.tx(590,290,'Antibiótico dentro de la célula','b','end')}<rect x="470" y="300" width="120" height="10" rx="5" fill="var(--m-mem)"/><rect class="lv" x="470" y="300" width="120" height="10" rx="5" fill="var(--r2)"/></g>`; },
    css:`.mx-r_efflux :is(.p2,.ad1,.ad2,.ad3,.hp,.lvl){opacity:0}
.mx-r_efflux.s1 .ad1{animation:mxUp 3s var(--ease-std) infinite}.mx-r_efflux.s2 .ad2{animation:mxUp 2s var(--ease-std) infinite}
.mx-r_efflux.s3 .ad3{animation:mxUp 2.2s var(--ease-std) infinite}.mx-r_efflux.s3 .hp{animation:mxUp 2.4s var(--ease-std) infinite}
.mx-r_efflux.s4 :is(.p2,.lvl){opacity:1}.mx-r_efflux .lv{transform-box:fill-box;transform-origin:left}.mx-r_efflux.s4 .lv{transform:scaleX(.25);transition-duration:2s}`
  };

  MX.r_target = {
    title:() => 'Resistencia: modificación de la diana',
    steps:() => [['Diana normal','El antibiótico encaja en su diana, la PBP, como una llave: la síntesis de pared se detiene y la bacteria muere.'],['Diana alterada','Una mutación o un gen adquirido (como mecA) produce una diana con otra forma.'],['Sin unión','El antibiótico ya no encaja y la enzima sigue trabajando: la bacteria sobrevive.'],['El mismo principio','PBP2a en el SARM, D-Ala-D-Lac en enterococos resistentes a vancomicina, rpoB en tuberculosis resistente a rifampicina y metilación del ARNr 23S frente a macrólidos.']],
    svg:() => { let s = `<path d="M300 20V300" stroke="var(--line2)" stroke-width="2" stroke-dasharray="4 6"/>` + sv.tx(150,24,'Diana normal','b','middle') + sv.tx(450,24,'Diana modificada','b','middle');
      s += sv.mem(20,280,250) + sv.mem(320,580,250);
      s += `<path d="M100 238V180H135V200H165V180H200V238Z" fill="var(--r4)"/><path class="alt" d="M400 238V180H430L445 198L460 180H500V238Z" fill="var(--r4)"/><text class="mut" x="452" y="170" text-anchor="middle" style="fill:var(--accent2);font-size:20px">✱</text>`;
      s += `<rect class="k1" x="137" y="60" width="26" height="20" rx="3" fill="var(--r2)"/><rect class="k2" x="437" y="60" width="26" height="20" rx="3" fill="var(--r2)" style="--dx:0px;--dy:96px"/>`;
      s += sv.tx(150,292,'Síntesis de pared bloqueada','b blk','middle') + sv.tx(450,292,'No encaja: la pared sigue','b ok','middle');
      for (let i=0;i<4;i++) s += `<rect class="br" x="${392+i*30}" y="156" width="26" height="10" rx="2" fill="var(--r5)" style="transition-delay:${i*300}ms"/>`;
      return s + sv.tx(300,328,'PBP2a · D-Ala-D-Lac · rpoB · ARNr 23S metilado','b ex','middle'); },
    css:`.mx-r_target.s1 .k1{transform:translate(0,120px)}.mx-r_target :is(.blk,.ok,.mut,.br,.ex){opacity:0}.mx-r_target.s1 .blk{opacity:1}
.mx-r_target.s2 .mut{opacity:1}.mx-r_target.s2 .alt{fill:var(--accent2)}
.mx-r_target.s3 .k2{animation:mxBounce 2s var(--ease-std) infinite}.mx-r_target.s3 :is(.ok,.br){opacity:1}.mx-r_target.s4 .ex{opacity:1}`
  };

  MX.r_perm = {
    title:() => 'Resistencia: permeabilidad reducida',
    steps:() => [['Porinas abiertas','Los antibióticos hidrofílicos, como los carbapenémicos, entran por canales llamados porinas.'],['Pérdida de porinas','Mutaciones en OprD (Pseudomonas) u OmpK35/36 (Klebsiella) cierran o eliminan la puerta de entrada.'],['Efecto sumado','Las pocas moléculas que entran son destruidas por β-lactamasas o expulsadas por bombas: los mecanismos se suman.'],['Resultado','La CIM sube aunque ningún mecanismo por separado bastaría: resistencia multifactorial.']],
    svg:() => { const R = rnd(41); let s = sv.mem(0,600,120) + sv.tx(16,96,'Membrana externa') + sv.tx(16,200,'Periplasma');
      [100,200,300,400,500].forEach((x,i) => { const lost = i!==2 && i!==4; s += `<rect x="${x-16}" y="110" width="32" height="20" fill="var(--bg)"/><g class="po${lost?' l':''}"><rect x="${x-16}" y="110" width="7" height="20" fill="var(--r3)"/><rect x="${x+9}" y="110" width="7" height="20" fill="var(--r3)"/></g><rect class="pf${lost?' l':''}" x="${x-9}" y="112" width="18" height="16" fill="var(--m-mem)"/>`;
        s += sv.flow('f'+(lost?' l':''),3,x,30,R,{dx:[-30,30],dy:[180,200],fill:['var(--r2)'],gap:.7}); });
      s += `<path class="bl" d="M300 220L318 210A20 20 0 1 0 318 230Z" fill="var(--r1)"/><path class="bl" d="M500 210L518 200A20 20 0 1 0 518 220Z" fill="var(--r1)"/>`;
      return s + `<g class="lvl">${sv.tx(590,290,'Entrada de antibiótico','b','end')}<rect x="470" y="300" width="120" height="10" rx="5" fill="var(--m-mem)"/><rect class="lv" x="470" y="300" width="120" height="10" rx="5" fill="var(--r2)"/></g>`; },
    css:`.mx-r_perm .f{animation:mxUp 2.6s var(--ease-std) infinite}.mx-r_perm .pf{opacity:0}
.mx-r_perm.s2 .f.l{animation:none;opacity:0}.mx-r_perm.s2 .po.l{opacity:.08}.mx-r_perm.s2 .pf.l{opacity:1}
.mx-r_perm :is(.bl,.lvl){opacity:0}.mx-r_perm.s3 .bl{opacity:1}.mx-r_perm.s4 .lvl{opacity:1}
.mx-r_perm .lv{transform-box:fill-box;transform-origin:left}.mx-r_perm.s4 .lv{transform:scaleX(.2);transition-duration:2s}`
  };
})(window.ATLAS);
