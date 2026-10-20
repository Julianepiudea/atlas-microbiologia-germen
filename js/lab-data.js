/* Atlas de Microbiología GERMEN · Laboratorio virtual: datos por aislamiento (coherentes con las fichas del atlas).
   Los valores son ilustrativos y didácticos; los puntos de corte siguen CLSI M100 (verifique la edición vigente). */
(function (A) {
  const LAB = A.LAB = {sims:{}, order:['maldi','bioq','kb','bmd','auto','pcr','film']};

  /* ---------- Antibióticos ---------- */
  LAB.AB = {
    AMP:['Ampicilina','10 µg'], AMC:['Amoxicilina-clavulánico','20/10 µg'], SAM:['Ampicilina-sulbactam','10/10 µg'],
    TZP:['Piperacilina-tazobactam','100/10 µg'], CTX:['Cefotaxima','30 µg'], CRO:['Ceftriaxona','30 µg'], CAZ:['Ceftazidima','30 µg'],
    FEP:['Cefepima','30 µg'], FOX:['Cefoxitina','30 µg'], CZA:['Ceftazidima-avibactam',''], MEM:['Meropenem','10 µg'], IPM:['Imipenem','10 µg'],
    ETP:['Ertapenem','10 µg'], CIP:['Ciprofloxacina','5 µg'], PEF:['Pefloxacina','5 µg'], LVX:['Levofloxacina','5 µg'], GEN:['Gentamicina','10 µg'],
    HLG:['Gentamicina de alta carga','120 µg'], AMK:['Amikacina',''], TOB:['Tobramicina',''], SXT:['Trimetoprim-sulfametoxazol','1,25/23,75 µg'],
    PEN:['Penicilina','10 U'], OXA:['Oxacilina','1 µg'], ERY:['Eritromicina','15 µg'], CLI:['Clindamicina','2 µg'], LZD:['Linezolid','30 µg'],
    VAN:['Vancomicina','30 µg'], TEI:['Teicoplanina',''], DAP:['Daptomicina',''], RIF:['Rifampicina',''], MIN:['Minociclina',''], COL:['Colistina',''],
    FLC:['Fluconazol',''], VRC:['Voriconazol',''], MCF:['Micafungina',''], AND:['Anidulafungina',''], CAS:['Caspofungina',''], AMB:['Anfotericina B','']
  };

  /* Puntos de corte de difusión en disco (mm): [S ≥, R ≤]; null = sin categoría */
  LAB.KBP = {
    ENT:{AMP:[17,13],AMC:[18,13],CTX:[26,22],CRO:[23,19],CAZ:[21,17],FEP:[25,18,'SDD'],FOX:[18,14],MEM:[23,19],IPM:[23,19],ETP:[22,18],CIP:[26,21],GEN:[18,14],SXT:[16,10]},
    SAL:{AMP:[17,13],CRO:[23,19],CIP:[31,20],PEF:[24,23],SXT:[16,10]},
    PSA:{CAZ:[18,14],FEP:[18,14],TZP:[22,17],MEM:[19,15],IPM:[19,15],CIP:[25,18]},
    ACB:{MEM:[18,14],IPM:[22,18],CAZ:[18,14],FEP:[18,14],SAM:[15,11],CIP:[21,15]},
    SAU:{FOX:[22,21],PEN:[29,28],ERY:[23,13],CLI:[21,14],SXT:[16,10],LZD:[21,20]},
    EFC:{AMP:[17,16],VAN:[17,14],HLG:[10,6],LZD:[23,20]},
    SPN:{OXA:[20,null],ERY:[21,15],SXT:[19,15],LVX:[17,13],LZD:[21,null],VAN:[17,null]}
  };
  LAB.KBSTD = {ENT:'Enterobacterales', SAL:'Salmonella spp.', PSA:'Pseudomonas aeruginosa', ACB:'Acinetobacter spp.', SAU:'Staphylococcus aureus', EFC:'Enterococcus spp.', SPN:'Streptococcus pneumoniae'};

  /* Posiciones de discos en placa de 150 mm (coordenadas en mm desde el centro) */
  const ring = (n, r, a0 = -90) => Array.from({length:n}, (_,k) => { const a = (a0 + k*360/n)*Math.PI/180; return [Math.round(r*Math.cos(a)*10)/10, Math.round(r*Math.sin(a)*10)/10]; });
  const L_ESBL = [[0,0], ...ring(3,27), ...ring(6,52,-60)];

  /* ---------- MALDI-TOF ---------- */
  LAB.MALDI = {
    saureus:{s:2.34, alt:[['Staphylococcus argenteus',1.86],['Staphylococcus schweitzeri',1.72]], prep:'Extensión directa de la colonia', note:'S. argenteus y S. schweitzeri forman el «complejo S. aureus»; solo las bases de datos actualizadas los separan con seguridad.'},
    spneumo:{s:2.09, lvlTxt:'Requiere confirmación (grupo mitis)', alt:[['Streptococcus mitis',2.04],['Streptococcus oralis',1.97]], warn:true, prep:'Extensión directa + 1 µL de ácido fórmico al 70 %', note:'Limitación conocida: S. pneumoniae y el grupo mitis/oralis tienen espectros casi idénticos. Confirme con optoquina o solubilidad en bilis.'},
    efaecalis:{s:2.41, alt:[['Enterococcus faecium',1.58],['Enterococcus casseliflavus',1.42]], prep:'Extensión directa de la colonia', note:'Identificación fiable a nivel de especie; la resistencia a vancomicina debe estudiarse aparte (fenotipo o PCR vanA/vanB).'},
    cdiff:{s:2.18, alt:[['Clostridium sordellii',1.47],['Clostridium bifermentans',1.39]], prep:'Extensión directa + ácido fórmico (colonia anaerobia)', note:'El MALDI-TOF identifica la especie, pero no distingue cepas toxigénicas: hace falta detectar toxinas o el gen tcdB.'},
    ecoli:{s:2.28, lvlTxt:'Especie, si la bioquímica descarta Shigella', alt:[['Shigella sonnei',2.21],['Shigella flexneri',2.14]], warn:true, prep:'Extensión directa de la colonia', note:'E. coli y Shigella son casi la misma especie genómica y el MALDI-TOF no los separa. Use lactosa, movilidad, indol y serología.'},
    kpneumo:{s:2.30, alt:[['Klebsiella variicola',2.08],['Klebsiella quasipneumoniae',2.01]], prep:'Extensión directa de la colonia', note:'Se reporta como complejo K. pneumoniae; K. variicola y K. quasipneumoniae se confunden con frecuencia.'},
    salmonella:{s:2.25, rep:'Salmonella sp.', lvlTxt:'Se reporta solo a nivel de género', alt:[['Citrobacter freundii',1.62],['Escherichia coli',1.41]], prep:'Extensión directa de la colonia', note:'El MALDI-TOF llega solo a género: el serovar (Typhi, Enteritidis, Typhimurium…) se define con antisueros (White-Kauffmann-Le Minor).'},
    shigella:{s:2.24, rep:'Escherichia coli / Shigella', lvlTxt:'No concluyente: no se reporta sin pruebas adicionales', alt:[['Escherichia coli',2.22],['Shigella flexneri',2.19]], warn:true, prep:'Extensión directa de la colonia', note:'Resultado no concluyente: el espectro coincide con E. coli. Shigella se confirma con bioquímica (lactosa −, inmóvil) y aglutinación con antisueros A–D.'},
    yersinia:{s:2.19, alt:[['Yersinia kristensenii',1.91],['Yersinia frederiksenii',1.84]], prep:'Extensión directa de la colonia', note:'Las especies «enterocolitica-like» son cercanas; el biotipo y el serotipo (O:3, O:9, O:8) indican la patogenicidad.'},
    paeru:{s:2.45, alt:[['Pseudomonas otitidis',1.55],['Pseudomonas putida',1.38]], prep:'Extensión directa de la colonia', note:'Identificación excelente; los mucoides de pacientes con fibrosis quística pueden requerir extracción.'},
    abaum:{s:2.27, alt:[['Acinetobacter nosocomialis',1.98],['Acinetobacter pittii',1.93]], prep:'Extensión directa de la colonia', note:'Las especies del complejo A. calcoaceticus-baumannii son muy parecidas; las bases de datos recientes las separan.'},
    vchol:{s:2.15, alt:[['Vibrio mimicus',1.89],['Vibrio albensis',1.77]], prep:'Extensión directa (colonia de agar no selectivo)', note:'Confirme siempre con aglutinación O1/O139 y notifique: es un evento de salud pública.'},
    hpylori:{s:2.08, alt:[['Helicobacter cinaedi',1.37],['Campylobacter jejuni',1.21]], prep:'Extracción con ácido fórmico (cultivo microaerófilo de 3–5 días)', note:'Útil sobre el aislamiento; el diagnóstico rutinario se hace con aliento, antígeno o biopsia.'},
    nmen:{s:2.22, alt:[['Neisseria polysaccharea',1.81],['Neisseria lactamica',1.66]], prep:'Extensión directa en cabina de bioseguridad clase II', note:'Riesgo de infección adquirida en el laboratorio: manipule siempre en cabina. N. polysaccharea puede confundirse con el meningococo.'},
    ngon:{s:2.25, alt:[['Neisseria meningitidis',1.70],['Neisseria cinerea',1.52]], prep:'Extensión directa de la colonia (Thayer-Martin)', note:'Identificación fiable; el antibiograma sigue requiriendo cultivo, porque las NAAT no dan sensibilidad.'},
    mtb:{s:2.05, rep:'Complejo Mycobacterium tuberculosis', lvlTxt:'Se reporta como complejo', alt:[['Mycobacterium bovis',2.03],['Mycobacterium africanum',2.01]], warn:true, prep:'Inactivación por calor + etanol, perlas de sílice, ácido fórmico y acetonitrilo (BSL-3)', note:'No distingue las especies del complejo MTB entre sí; requiere biblioteca de micobacterias y protocolo de inactivación validado.'},
    calb:{s:2.11, alt:[['Candida dubliniensis',1.78],['Candida africana',1.71]], prep:'Extracción con ácido fórmico (en el pocillo o en tubo)', note:'Las levaduras necesitan romper la pared con ácido fórmico para liberar las proteínas.'},
    aspergillus:{s:2.02, alt:[['Aspergillus lentulus',1.74],['Aspergillus fischeri',1.62]], prep:'Cultivo líquido + extracción con etanol, ácido fórmico y acetonitrilo', note:'Los hongos filamentosos requieren biblioteca específica. A. lentulus (sección Fumigati) es intrínsecamente menos sensible a azoles.'}
  };

  /* ---------- Series bioquímicas ---------- */
  /* Paneles: 'ent' (gramnegativos), 'gpc' (cocos grampositivos), 'nei' (Neisseria), 'yst' (levaduras) */
  LAB.BQ = {
    ecoli:{p:'ent', ox:0, tsi:['A','A',1,0], ind:1, mot:1, cit:0, ure:0, lia:['K','K'], mr:1, vp:0},
    kpneumo:{p:'ent', ox:0, tsi:['A','A',1,0], ind:0, mot:0, cit:1, ure:1, lia:['K','K'], mr:0, vp:1},
    salmonella:{p:'ent', ox:0, tsi:['K','A',1,1], ind:0, mot:1, cit:1, ure:0, lia:['K','K'], mr:1, vp:0},
    shigella:{p:'ent', ox:0, tsi:['K','A',0,0], ind:0, mot:0, cit:0, ure:0, lia:['K','A'], mr:1, vp:0, note:'El indol es variable entre especies de Shigella (S. sonnei es indol negativa).'},
    yersinia:{p:'ent', ox:0, tsi:['A','A',0,0], ind:0, mot:1, cit:0, ure:1, lia:['K','A'], mr:1, vp:1, note:'Incubada a 25 °C: móvil y VP positiva; a 37 °C es inmóvil y VP negativa.'},
    paeru:{p:'ent', ox:1, tsi:['K','K',0,0], ind:0, mot:1, cit:1, ure:0, lia:['K','K'], mr:0, vp:0, note:'No fermentador: el TSI no cambia (K/K).'},
    abaum:{p:'ent', ox:0, tsi:['K','K',0,0], ind:0, mot:0, cit:1, ure:0, lia:['K','K'], mr:0, vp:0, note:'No fermentador, oxidasa negativo e inmóvil: la tríada que orienta a Acinetobacter.'},
    vchol:{p:'ent', ox:1, tsi:['A','A',0,0], ind:1, mot:1, cit:1, ure:0, lia:['K','K'], mr:0, vp:1, note:'Fermenta sacarosa (TSI A/A, colonias amarillas en TCBS); VP positiva en el biotipo El Tor.'},
    saureus:{p:'gpc', cat:1, coa:1, hem:'b', opt:0, bil:0, be:0, nacl:1, pyr:0},
    spneumo:{p:'gpc', cat:0, coa:0, hem:'a', opt:1, bil:1, be:0, nacl:0, pyr:0},
    efaecalis:{p:'gpc', cat:0, coa:0, hem:'g', opt:0, bil:0, be:1, nacl:1, pyr:1},
    nmen:{p:'nei', ox:1, cat:1, glu:1, mal:1, lac:0, sac:0},
    ngon:{p:'nei', ox:1, cat:1, glu:1, mal:0, lac:0, sac:0},
    calb:{p:'yst', gt:1, cla:1, chr:'verde', ure:0}
  };

  /* ---------- Kirby-Bauer (zonas en mm) ---------- */
  LAB.KB = {
    ecoli:{std:'ENT', disks:[['AMC',17],['CTX',12],['CAZ',17],['FEP',18],['AMP',6],['FOX',22],['MEM',28],['CIP',16],['GEN',19],['SXT',6]], pos:L_ESBL,
      pheno:{type:'esbl', from:'AMC', to:['CTX','CAZ','FEP']}, concl:'Fenotipo BLEE: sinergia entre el clavulánico y las cefalosporinas de 3.ª y 4.ª generación («huevo» o «tapón de champaña»). Concuerda con CTX-M.'},
    kpneumo:{std:'ENT', disks:[['AMC',6],['CTX',6],['CAZ',10],['FEP',11],['AMP',6],['MEM',14],['ETP',9],['IPM',15],['CIP',8],['GEN',19]], pos:L_ESBL,
      concl:'Resistencia a carbapenémicos: sospecha de carbapenemasa. Confirme con mCIM/eCIM, inmunocromatografía (KPC, NDM, OXA-48, VIM, IMP) o PCR. La ampicilina es resistencia intrínseca (SHV-1).'},
    salmonella:{std:'SAL', disks:[['AMP',22],['CRO',28],['CIP',25],['PEF',18],['SXT',24]], pos:ring(5,46),
      concl:'Pefloxacina resistente con ciprofloxacina intermedia: mutación en gyrA. Reporte disminución de sensibilidad a fluoroquinolonas, aunque el halo de ciprofloxacina parezca amplio.'},
    paeru:{std:'PSA', disks:[['CAZ',24],['FEP',25],['TZP',26],['MEM',28],['IPM',25],['CIP',30],['CRO',14]], pos:[[0,0], ...ring(6,48)], intr:['CRO'],
      concl:'Fenotipo salvaje. La ceftriaxona no se interpreta: P. aeruginosa es intrínsecamente resistente (AmpC inducible, impermeabilidad y bombas MexAB-OprM).'},
    abaum:{std:'ACB', disks:[['MEM',6],['IPM',8],['CAZ',6],['FEP',8],['SAM',9],['CIP',6]], pos:ring(6,46),
      concl:'Resistencia extendida (XDR) compatible con OXA-23. Quedan pocas opciones: la colistina solo se puede evaluar por microdilución en caldo.'},
    saureus:{std:'SAU', disks:[['ERY',6],['CLI',24],['FOX',15],['PEN',9],['SXT',27],['LZD',26]], pos:[[-13,0],[13,0],[0,-48],[41.6,-24],[0,48],[-41.6,24]],
      pheno:{type:'dtest', from:'ERY', to:'CLI'}, concl:'SARM (cefoxitina ≤21 mm = mecA/PBP2a) con prueba D positiva: resistencia inducible a clindamicina (erm). Reporte clindamicina como resistente. La vancomicina NO se evalúa por disco en S. aureus: requiere CIM.'},
    efaecalis:{std:'EFC', disks:[['AMP',24],['VAN',18],['HLG',6],['LZD',26]], pos:ring(4,40,-45), haze:'VAN', hours:24,
      concl:'Ampicilina sensible. Crecimiento tenue dentro del halo de vancomicina (lea con luz transmitida, a las 24 h): repórtela como resistente y confirme con CIM (fenotipo VanB). Alta resistencia a gentamicina: se pierde la sinergia con β-lactámicos.'},
    spneumo:{std:'SPN', disks:[['OXA',12],['ERY',6],['SXT',22],['LVX',22],['LZD',30],['VAN',21]], pos:ring(6,46), blood:true, hours:'20–24',
      concl:'Oxacilina ≤19 mm: no permite afirmar sensibilidad a penicilina; determine la CIM de penicilina y ceftriaxona (microdilución). Eritromicina resistente (erm(B) o mef(A)).'}
  };

  /* ---------- Microdilución en caldo (CIM en µg/mL) ---------- */
  /* fila: [código, concentración máxima, CIM (número; '>' o '≤' fuera de rango), S ≤, R ≥, nota] */
  LAB.BMD = {
    saureus:{med:'Caldo Mueller-Hinton ajustado en cationes · 35 °C · 16–20 h (oxacilina y vancomicina: 24 h)', rows:[
      ['OXA',64,32,2,4,'SARM'],['VAN',32,1,2,16],['DAP',16,.5,1,null,'Solo categoría «sensible»'],['LZD',64,2,4,8],['ERY',64,'>',.5,8],['CLI',64,.125,.5,4,'Prueba D positiva: reportar R'],['GEN',64,.5,4,16],['RIF',32,'≤',1,4]]},
    ecoli:{med:'Caldo Mueller-Hinton ajustado en cationes · 35 °C · 16–20 h', rows:[
      ['AMP',64,'>',8,32],['CTX',64,64,1,4],['CAZ',64,16,4,16],['FEP',64,16,2,16,'4–8 = sensible dependiente de la dosis'],['MEM',16,'≤',1,4],['CIP',32,8,.25,1],['GEN',64,1,2,8],['COL',32,.5,null,4,'Sin categoría S: ≤2 = intermedio']]},
    kpneumo:{med:'Caldo Mueller-Hinton ajustado en cationes · 35 °C · 16–20 h', rows:[
      ['MEM',64,32,1,4],['IPM',64,16,1,4],['CZA',64,2,8,16,'El avibactam inhibe KPC'],['CAZ',64,'>',4,16],['CIP',32,'>',.25,1],['GEN',64,1,2,8],['AMK',64,4,4,16],['COL',32,.5,null,4,'Sin categoría S: ≤2 = intermedio']]},
    paeru:{med:'Caldo Mueller-Hinton ajustado en cationes · 35 °C · 16–20 h', rows:[
      ['CAZ',64,2,8,32],['FEP',64,4,8,32],['TZP',128,8,16,64],['MEM',32,.5,2,8],['IPM',32,2,2,8],['CIP',16,.25,.5,2],['TOB',32,1,1,4],['COL',32,1,null,4,'Sin categoría S: ≤2 = intermedio']]},
    abaum:{med:'Caldo Mueller-Hinton ajustado en cationes · 35 °C · 20–24 h', rows:[
      ['MEM',64,64,2,8],['IPM',64,'>',2,8],['CAZ',64,'>',8,32],['SAM',128,32,8,32],['CIP',32,'>',1,4],['AMK',64,8,16,64],['MIN',32,2,4,16],['COL',32,.5,null,4,'Sin categoría S: ≤2 = intermedio']]},
    spneumo:{med:'Caldo Mueller-Hinton ajustado en cationes con 2,5–5 % de sangre lisada de caballo · 35 °C · 20–24 h', rows:[
      ['PEN',16,2,null,null,'Meningitis: S ≤0,06 / R ≥0,12 · Otros sitios: S ≤2 / R ≥8'],['CRO',16,.5,.5,2,'Meningitis: S ≤0,5 · Otros sitios: S ≤1'],['VAN',16,.25,1,null],['ERY',32,'>',.25,1],['LVX',32,1,2,8],['SXT',16,.5,.5,4],['LZD',16,1,2,null]], dual:'PEN'},
    efaecalis:{med:'Caldo Mueller-Hinton ajustado en cationes · 35 °C · 24 h para vancomicina', rows:[
      ['AMP',64,1,8,16],['VAN',128,32,4,32,'Fenotipo VanB'],['TEI',32,.5,8,32,'Teicoplanina sensible: típico de vanB'],['LZD',32,2,2,8],['DAP',32,1,2,8]]},
    calb:{med:'RPMI-1640 con MOPS (CLSI M27) · 35 °C · 24 h · azoles y equinocandinas: lectura al 50 % de inhibición', fungi:true, rows:[
      ['FLC',64,.5,2,8,'4 = sensible dependiente de la dosis'],['VRC',16,.03125,.125,1],['MCF',8,.015625,.25,1],['AND',8,.03125,.25,1],['CAS',8,.125,.25,1],['AMB',16,.5,null,null,'Sin punto de corte: punto de corte epidemiológico 2 µg/mL']]}
  };

  /* ---------- Equipo automatizado ---------- */
  LAB.AUTO = {
    saureus:{card:'GP', ast:'AST-GP', prob:99, lvl:'Excelente', idh:4.5, asth:9, aes:['Resistencia a meticilina: mecA/PBP2a (cefoxitina screen +)','Resistencia inducible a clindamicina (prueba ICR +)']},
    efaecalis:{card:'GP', ast:'AST-GP', prob:97, lvl:'Excelente', idh:5, asth:12, aes:['Resistencia adquirida a vancomicina, teicoplanina sensible: fenotipo VanB','Alta resistencia a gentamicina (HLAR): sin sinergia con β-lactámicos']},
    spneumo:{card:'GP', ast:'AST-ST', prob:95, lvl:'Muy buena', idh:6, asth:11, aes:['Penicilina: CIM 2 µg/mL (resistente si meningitis)','Resistencia a macrólidos (erm/mef)'], tip:'Confirme optoquina y solubilidad en bilis: el grupo mitis puede dar perfiles parecidos.'},
    ecoli:{card:'GN', ast:'AST-N', prob:99, lvl:'Excelente', idh:4, asth:8, aes:['β-lactamasa de espectro extendido (prueba BLEE +)','Fluoroquinolonas: mutaciones gyrA/parC probables']},
    kpneumo:{card:'GN', ast:'AST-N', prob:98, lvl:'Excelente', idh:4, asth:9, aes:['Carbapenemasa probable (KPC si la ceftazidima-avibactam es sensible)','Confirmar con prueba fenotípica o molecular']},
    paeru:{card:'GN', ast:'AST-N', prob:99, lvl:'Excelente', idh:5, asth:10, aes:['Fenotipo salvaje (sin resistencia adquirida)']},
    abaum:{card:'GN', ast:'AST-N', prob:96, lvl:'Excelente', idh:5, asth:10, aes:['Carbapenemasa probable (OXA-23 en el contexto local)','Resistencia extendida (XDR)']},
    calb:{card:'YST', ast:'AST-YS', prob:99, lvl:'Excelente', idh:18, asth:15, aes:['Fenotipo salvaje para azoles y equinocandinas']}
  };
  LAB.CARDS = {
    GN:'APPA ADO PyrA IARL dCEL BGAL H2S BNAG AGLTp dGLU GGT OFF BGLU dMAL dMAN dMNE BXYL BAlap ProA LIP PLE TyrA URE dSOR SAC dTAG dTRE CIT MNT 5KG lLATk AGLU SUCT NAGA AGAL PHOS GlyA ODC LDC lHISa CMT BGUR O129R GGAA lMLTa ELLM lLATa'.split(' '),
    GP:'AMY PIPLC dXYL ADH1 BGAL AGLU APPA CDEX AspA BGAR AMAN PHOS LeuA ProA BGURr AGAL PyrA BGUR AlaA TyrA dSOR URE POLYB dGAL dRIB lLATk LAC NAG dMAL BACI NOVO NC6.5 dMAN dMNE MBdG PUL dRAF O129R SAL SAC dTRE ADH2s OPTO'.split(' '),
    YST:'LysA IMLTa LeuA ARG ERYa GLYLa TyrA BNAG ARBa AMYa dGALa GENa dGLUa LACa MAdGa dCELa GGT dMALa dRAFa NAGA1 dMNEa dMELa dMLZa lSBEa lRHAa XLTa dSORa SACa URE AGLU dTURa dTREa NO3a lARAa dGATa ESC lGLTa dXYLa LATa ACEa CITa GRTas lPROa 2KGa NAGa dGNTa'.split(' ')
  };
  /* reacciones ancla conocidas por aislamiento (el resto se simula) */
  LAB.CARDKEY = {
    ecoli:{BGAL:1,BGUR:1,LDC:1,ODC:1,URE:0,CIT:0,H2S:0,dMAN:1,SAC:0}, kpneumo:{BGAL:1,URE:1,CIT:1,LDC:1,ODC:0,H2S:0,SAC:1,dMAN:1},
    paeru:{OFF:0,dGLU:0,CIT:1,BGAL:0,H2S:0,URE:0}, abaum:{OFF:0,BGAL:0,URE:0,CIT:1},
    saureus:{PIPLC:0,'NC6.5':1,dMAN:1,URE:1,OPTO:0,BACI:0}, efaecalis:{PyrA:1,'NC6.5':1,dMAN:1,OPTO:0,URE:0}, spneumo:{OPTO:1,'NC6.5':0,dMAN:0},
    calb:{URE:0,dGLUa:1,dMALa:1,SACa:1,LACa:0}
  };

  /* ---------- PCR convencional ---------- */
  /* bp: tamaño del amplicón según pares de cebadores publicados de uso frecuente (puede variar con otros cebadores) */
  LAB.PCR = {
    saureus:{gene:'mecA', bp:533, what:'PBP2a: resistencia a meticilina (SARM)', tm:56},
    efaecalis:{gene:'vanB', bp:635, what:'Ligasa D-Ala-D-Lac: resistencia a vancomicina', tm:58},
    ecoli:{gene:'blaCTX-M', bp:593, what:'β-lactamasa de espectro extendido (grupo CTX-M)', tm:56},
    kpneumo:{gene:'blaKPC', bp:798, what:'Carbapenemasa KPC', tm:60},
    salmonella:{gene:'invA', bp:284, what:'Invasión de células epiteliales (marcador de género)', tm:64},
    shigella:{gene:'ipaH', bp:620, what:'Antígeno plasmidial de invasión (Shigella y EIEC)', tm:60, approx:true},
    vchol:{gene:'ctxA', bp:564, what:'Subunidad A de la toxina colérica', tm:58},
    paeru:{gene:'oprL', bp:504, what:'Lipoproteína de membrana externa (marcador de especie)', tm:57},
    abaum:{gene:'blaOXA-51-like', bp:353, what:'Oxacilinasa intrínseca (marcador de especie)', tm:52},
    mtb:{gene:'IS6110', bp:123, what:'Secuencia de inserción del complejo M. tuberculosis', tm:62},
    nmen:{gene:'ctrA', bp:110, what:'Transporte de la cápsula (marcador de especie)', tm:60, approx:true},
    hpylori:{gene:'ureA', bp:411, what:'Subunidad A de la ureasa', tm:55, approx:true}
  };

  /* ---------- PCR multiplex tipo FilmArray (BioFire) ---------- */
  LAB.PANELS = {
    BCID2:{name:'BCID2 · Hemocultivo positivo', sample:'Hemocultivo positivo', min:60, targets:'Enterococcus faecalis|Enterococcus faecium|Listeria monocytogenes|Staphylococcus spp.|Staphylococcus aureus|Staphylococcus epidermidis|Staphylococcus lugdunensis|Streptococcus spp.|Streptococcus agalactiae|Streptococcus pneumoniae|Streptococcus pyogenes|Complejo A. calcoaceticus-baumannii|Bacteroides fragilis|Enterobacterales|Complejo Enterobacter cloacae|Escherichia coli|Klebsiella aerogenes|Klebsiella oxytoca|Grupo K. pneumoniae|Proteus spp.|Salmonella spp.|Serratia marcescens|Haemophilus influenzae|Neisseria meningitidis|Pseudomonas aeruginosa|Stenotrophomonas maltophilia|Candida albicans|Candida auris|Candida glabrata|Candida krusei|Candida parapsilosis|Candida tropicalis|Cryptococcus neoformans/gattii|CTX-M|IMP|KPC|mcr-1|NDM|OXA-48-like|VIM|mecA/C|mecA/C y MREJ (SARM)|vanA/B'.split('|'), res:10},
    GI:{name:'Panel gastrointestinal', sample:'Heces en medio Cary-Blair', min:60, targets:'Campylobacter spp.|Clostridioides difficile (toxina A/B)|Plesiomonas shigelloides|Salmonella spp.|Yersinia enterocolitica|Vibrio spp.|Vibrio cholerae|E. coli enteroagregativa (EAEC)|E. coli enteropatógena (EPEC)|E. coli enterotoxigénica (ETEC) lt/st|E. coli productora de Shiga (STEC) stx1/stx2|E. coli O157|Shigella/E. coli enteroinvasiva (EIEC)|Cryptosporidium spp.|Cyclospora cayetanensis|Entamoeba histolytica|Giardia lamblia|Adenovirus F40/41|Astrovirus|Norovirus GI/GII|Rotavirus A|Sapovirus'.split('|')},
    ME:{name:'Panel de meningitis/encefalitis', sample:'Líquido cefalorraquídeo (0,2 mL)', min:60, targets:'Escherichia coli K1|Haemophilus influenzae|Listeria monocytogenes|Neisseria meningitidis|Streptococcus agalactiae|Streptococcus pneumoniae|Citomegalovirus|Enterovirus|Herpes simple 1|Herpes simple 2|Herpesvirus humano 6|Parechovirus humano|Varicela-zóster|Cryptococcus neoformans/gattii'.split('|')},
    RP:{name:'Panel respiratorio RP2.1', sample:'Hisopado nasofaríngeo en medio de transporte', min:45, targets:'Adenovirus|Coronavirus 229E|Coronavirus HKU1|Coronavirus NL63|Coronavirus OC43|SARS-CoV-2|Metapneumovirus humano|Rinovirus/enterovirus|Influenza A|Influenza A H1|Influenza A H1-2009|Influenza A H3|Influenza B|Parainfluenza 1|Parainfluenza 2|Parainfluenza 3|Parainfluenza 4|Virus sincitial respiratorio|Bordetella parapertussis|Bordetella pertussis|Chlamydia pneumoniae|Mycoplasma pneumoniae'.split('|')}
  };
  LAB.FILM = {
    saureus:{p:'BCID2', hit:['Staphylococcus spp.','Staphylococcus aureus','mecA/C y MREJ (SARM)']},
    spneumo:{p:'ME', hit:['Streptococcus pneumoniae']},
    efaecalis:{p:'BCID2', hit:['Enterococcus faecalis','vanA/B']},
    ecoli:{p:'BCID2', hit:['Enterobacterales','Escherichia coli','CTX-M']},
    kpneumo:{p:'BCID2', hit:['Enterobacterales','Grupo K. pneumoniae','KPC']},
    salmonella:{p:'GI', hit:['Salmonella spp.']},
    shigella:{p:'GI', hit:['Shigella/E. coli enteroinvasiva (EIEC)']},
    yersinia:{p:'GI', hit:['Yersinia enterocolitica']},
    vchol:{p:'GI', hit:['Vibrio spp.','Vibrio cholerae']},
    cdiff:{p:'GI', hit:['Clostridioides difficile (toxina A/B)']},
    paeru:{p:'BCID2', hit:['Pseudomonas aeruginosa']},
    abaum:{p:'BCID2', hit:['Complejo A. calcoaceticus-baumannii'], note:'El panel no incluye OXA-23: un resultado sin genes de resistencia no descarta la resistencia a carbapenémicos de Acinetobacter. Espere el antibiograma.'},
    nmen:{p:'ME', hit:['Neisseria meningitidis']},
    calb:{p:'BCID2', hit:['Candida albicans']},
    giardia:{p:'GI', hit:['Giardia lamblia']},
    sars:{p:'RP', hit:['SARS-CoV-2']},
    flu:{p:'RP', hit:['Influenza A','Influenza A H1-2009']}
  };

  /* qué aislamientos admite cada estación */
  LAB.for = key => ({maldi:LAB.MALDI, bioq:LAB.BQ, kb:LAB.KB, bmd:LAB.BMD, auto:LAB.AUTO, pcr:LAB.PCR, film:LAB.FILM})[key];

  /* utilidades deterministas */
  LAB.seed = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const CLSI = [[.125,'0,12'],[.0625,'0,06'],[.03125,'0,03'],[.015625,'0,015'],[.0078125,'0,008'],[.00390625,'0,004']];
  LAB.fmtC = v => { const k = CLSI.find(([x]) => Math.abs(x - v) < x*1e-6); return k ? k[1] : v >= 1 ? String(+v.toFixed(2)).replace('.',',') : String(+v.toPrecision(2)).replace('.',','); };
})(window.ATLAS);
