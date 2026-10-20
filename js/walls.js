/* Atlas de Microbiología GERMEN · vista molecular de la pared y la envoltura (medidas en nanómetros) */
(function (A) {
  A.wallBuilders = function (T) {
    const {THREE, V, Y, ru} = T;
    const C = {head:'#e8d08a',tail:'#9aa6b2',nag:'#6fd3a8',nam:'#4fb3d9',pep:'#f08a6e',lipA:'#ff8f6b',core:'#f4b860',oag:'#c79cf2',porin:'#5fc8f0',wta:'#b5e36b',lta:'#f0d36a',sprot:'#ff7aa8',cap:'#bfe9ff',myc:'#e3a06b',myt:'#d9b48f',ag:'#9ad08f',lam:'#ff9fce',erg:'#ffd36a',chit:'#e4ddcf',glc:'#7fd1c7',man:'#c9a8ff',spec:'#ff8a8a',pfemp:'#ffd27a',vsp:'#7fe0c8',mt:'#9fb8ff',pump:'#ff9b72',bla:'#ffd36a',mel:'#5a4636',rod:'#b8c4cc',lpp:'#f7a8c4'};

    /* Agrupa miles de esferas y cilindros en mallas instanciadas por color */
    function kit(ctx){
      const sph = new THREE.SphereGeometry(1,10,8), cyl = new THREE.CylinderGeometry(1,1,1,6,1), bins = new Map();
      const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V();
      const put = (geo, color, opa) => { const k = (geo===sph?'s':'c') + color + (opa||''); if (!bins.has(k)) bins.set(k, {geo, color, opa, list:[]}); bins.get(k).list.push(m4.clone()); };
      const K = {
        ball(p, r, color, opa){ m4.compose(p, q.identity(), sc.set(r,r,r)); put(sph, color, opa); },
        ell(p, rx, ry, rz, color){ m4.compose(p, q.identity(), sc.set(rx,ry,rz)); put(sph, color); },
        rod(a, b, r, color, opa){ const d = new V().subVectors(b,a), L = d.length(); if (L < 1e-6) return; q.setFromUnitVectors(Y, d.normalize()); m4.compose(new V().addVectors(a,b).multiplyScalar(.5), q, sc.set(r,L,r)); put(cyl, color, opa); },
        chain(p, dir, n, step, r, color, R, {wig=.3, alt, bias, box}={}){
          p = p.clone(); const d = dir.clone().normalize();
          for (let i=0;i<n;i++){
            K.ball(p, r, alt && i%2 ? alt : color);
            d.add(ru(R).multiplyScalar(wig)); if (bias) d.add(bias); d.normalize();
            const nx = p.clone().addScaledVector(d, step);
            if (box){ if (Math.abs(nx.x) > box.x) d.x *= -1; if (Math.abs(nx.z) > box.z) d.z *= -1; if (box.y0 !== undefined && (nx.y < box.y0 || nx.y > box.y1)) d.y *= -1; }
            p.addScaledVector(d, step);
          }
          return p;
        },
        build(parent){ bins.forEach(b => { const mat = ctx.M(b.color, 'w', {roughness:.45, clearcoat:.3, sheen:0, emissiveIntensity:.1, ...(b.opa ? {transparent:true, opacity:b.opa, depthWrite:false} : {})}); parent.add(ctx.inst(b.geo, mat, b.list)); }); }
      };
      return K;
    }

    /* Bicapa: cabezas polares y dos colas por lípido; la hoja externa puede ser LPS o LOS */
    function membrane(K, R, y0, {W, D, step=2.2, skip, outer='pl', hr=.95}){
      for (let x=-W/2+step/2; x<W/2; x+=step) for (let z=-D/2+step/2; z<D/2; z+=step){
        const jx = x+(R()-.5)*.5, jz = z+(R()-.5)*.5; if (skip && skip(jx,jz)) continue;
        K.ball(new V(jx,y0+1,jz), hr, C.head);
        K.rod(new V(jx-.35,y0+1.6,jz), new V(jx-.35,y0+3.8,jz), .2, C.tail); K.rod(new V(jx+.35,y0+1.6,jz), new V(jx+.35,y0+3.8,jz), .2, C.tail);
        if (outer === 'pl'){
          K.ball(new V(jx,y0+7,jz), hr, C.head);
          K.rod(new V(jx-.35,y0+6.4,jz), new V(jx-.35,y0+4.2,jz), .2, C.tail); K.rod(new V(jx+.35,y0+6.4,jz), new V(jx+.35,y0+4.2,jz), .2, C.tail);
        } else {
          K.ball(new V(jx,y0+7.1,jz), 1.15, C.lipA);
          for (const dx of [-.5,.5]) for (const dz of [-.4,.4]) K.rod(new V(jx+dx,y0+6.3,jz+dz), new V(jx+dx,y0+4.2,jz+dz), .17, C.tail);
          const top = K.chain(new V(jx,y0+8.6,jz), Y, outer==='los'?3:4, 1.1, .55, C.core, R, {wig:.15});
          if (outer === 'lps' && R() < .75) K.chain(top, Y, 8+Math.floor(R()*9), 1.05, .48, C.oag, R, {wig:.28, bias:new V(0,.25,0)});
        }
      }
    }
    /* Capa de peptidoglicano: cadenas NAG-NAM alternas y puentes peptídicos */
    function pg(K, R, y, {W, D, sp=2.6, dirX=true}){
      const A1 = dirX ? D : W, B1 = dirX ? W : D, strands = [];
      for (let a=-A1/2+sp/2; a<A1/2; a+=sp){ let i = 0; for (let b=-B1/2; b<B1/2; b+=1.05, i++) K.ball(dirX ? new V(b,y,a) : new V(a,y,b), .48, i%2 ? C.nag : C.nam); strands.push(a); }
      for (let s=0; s<strands.length-1; s++) for (let b=-B1/2+1; b<B1/2; b+=2+R()*4){ K.rod(dirX ? new V(b,y,strands[s]) : new V(strands[s],y,b), dirX ? new V(b,y,strands[s+1]) : new V(strands[s+1],y,b), .22, C.pep); }
    }
    function capsuleLayer(K, R, ctx, g, y0, W, D, h=40){
      for (let i=0;i<220;i++) K.chain(new V((R()-.5)*(W-2), y0+R()*6, (R()-.5)*(D-2)), Y, 20, 1.4, .36, C.cap, R, {wig:.5, bias:new V(0,.12,0), box:{x:W/2, z:D/2, y0, y1:y0+h}});
      const gel = new THREE.Mesh(new THREE.BoxGeometry(W, h, D), ctx.M(C.cap, 'w', {transparent:true, opacity:.07, depthWrite:false})); gel.position.y = y0 + h/2; g.add(gel);
    }
    const anchorer = (ctx, g, W, D) => (key, y, side='r') => ctx.hs(key, g, new V(side==='r' ? W/2+.6 : -W/2-.6, y, D/2+.6), {side, deep:true});

    return {
      gneg(ctx, R, o, opt){
        const g = new THREE.Group(), K = kit(ctx), W = 70, D = 40, Ah = anchorer(ctx,g,W,D);
        const por = [[-16,6],[4,-9],[20,9],[-2,11]], pu = [-26,-6], nearP = (x,z,r) => por.some(([a,b]) => Math.hypot(x-a,z-b) < r);
        membrane(K, R, 0, {W, D, skip:(x,z) => Math.hypot(x-pu[0],z-pu[1]) < 4.4});
        membrane(K, R, 25, {W, D, outer:opt.los ? 'los' : 'lps', skip:(x,z) => nearP(x,z,3.4) || Math.hypot(x-pu[0],z-pu[1]) < 2.6});
        pg(K, R, 17.5, {W, D});
        for (let i=0;i<22;i++){ const x = (R()-.5)*(W-4), z = (R()-.5)*(D-4); if (nearP(x,z,4)) continue; K.rod(new V(x,17.9,z), new V(x,25.4,z), .3, C.lpp); K.ball(new V(x,25.6,z), .55, C.lpp); }
        for (let i=0;i<9;i++) K.ball(new V((R()-.5)*(W-8), 11+R()*3.5, (R()-.5)*(D-8)), 1.6, C.bla);
        const pm = ctx.M(C.porin, 'w', {side:THREE.DoubleSide, roughness:.35});
        por.forEach(([x,z]) => { for (let k=0;k<3;k++){ const a = k/3*Math.PI*2; const c = new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,8.6,14,1,true), pm); c.position.set(x+Math.cos(a)*1.3, 29, z+Math.sin(a)*1.3); g.add(c); } });
        const pmat = ctx.M(C.pump, 'w', {roughness:.4}), [px,pz] = pu;
        for (let k=0;k<3;k++){ const a = k/3*Math.PI*2; const b = new THREE.Mesh(new THREE.SphereGeometry(2.3,20,14), pmat); b.position.set(px+Math.cos(a)*1.6, 4, pz+Math.sin(a)*1.6); g.add(b); }
        const ab = new THREE.Mesh(new THREE.CylinderGeometry(2.4,3.4,7,20), pmat); ab.position.set(px,10.5,pz); g.add(ab);
        const tol = new THREE.Mesh(new THREE.CylinderGeometry(1.9,1.9,20,20,1,true), ctx.M('#ffc6a8','w',{side:THREE.DoubleSide})); tol.position.set(px,24,pz); g.add(tol);
        for (let k=0;k<6;k++){ const a = k/6*Math.PI*2; K.rod(new V(px+Math.cos(a)*3.2,13,pz+Math.sin(a)*3.2), new V(px+Math.cos(a)*2.3,19,pz+Math.sin(a)*2.3), .55, '#ffd27a'); }
        if (opt.cap) capsuleLayer(K, R, ctx, g, opt.los ? 34 : 37, W, D);
        K.build(g);
        Ah('im',4); Ah('pg',17.5); Ah('om',28.5); if (opt.los) Ah('los',36); else Ah('ag',44); if (opt.cap) Ah('cap',66);
        Ah('peri',12.5,'l'); Ah('lpp',21.5,'l'); Ah('lipA',32,'l');
        ctx.hs('porin', g, new V(por[2][0],34,por[2][1]), {deep:true}); ctx.hs('pump', g, new V(px,35,pz), {deep:true, side:'l'});
        return g;
      },
      gpos(ctx, R, o, opt){
        const g = new THREE.Group(), K = kit(ctx), W = 70, D = 40, Ah = anchorer(ctx,g,W,D), pb = [[12,-6],[-20,7]];
        membrane(K, R, 0, {W, D, skip:(x,z) => pb.some(([a,b]) => Math.hypot(x-a,z-b) < 3.2)});
        pb.forEach(([x,z]) => { K.ball(new V(x,4,z),2.5,C.pump); K.ball(new V(x,9.6,z),2.3,C.pump); K.ball(new V(x+1.6,11.4,z),1.5,C.pump); });
        for (let l=0;l<12;l++) pg(K, R, 11+l*2.8, {W, D, dirX:l%2===0, sp:2.8});
        for (let l=0;l<11;l++) for (let i=0;i<55;i++){ const x = (R()-.5)*(W-2), z = (R()-.5)*(D-2), y = 11+l*2.8; K.rod(new V(x,y,z), new V(x,y+2.8,z), .22, C.pep); }
        for (let i=0;i<70;i++) K.chain(new V((R()-.5)*(W-4), 30+R()*12, (R()-.5)*(D-4)), Y, 14, 1.2, .45, C.wta, R, {wig:.25, bias:new V(0,.3,0), box:{x:W/2, z:D/2}});
        for (let i=0;i<34;i++) K.chain(new V((R()-.5)*(W-4), 8, (R()-.5)*(D-4)), Y, 36, 1.15, .36, C.lta, R, {wig:.12, bias:new V(0,.5,0), box:{x:W/2, z:D/2}});
        for (let i=0;i<26;i++){ const x = (R()-.5)*(W-6), z = (R()-.5)*(D-6); K.rod(new V(x,43,z), new V(x,46,z), .3, C.sprot); K.chain(new V(x,46.5,z), Y, 3, 1.6, 1.15, C.sprot, R, {wig:.5}); }
        if (opt.slayer) for (let x=-W/2+2; x<W/2; x+=3.7) for (let z=-D/2+2, r=0; z<D/2; z+=3.2, r++){ const xx = x+(r%2)*1.85; if (xx > W/2-1) continue; K.rod(new V(xx,48.2,z), new V(xx,49.8,z), 1.75, '#9fe0ff'); }
        if (opt.cap) capsuleLayer(K, R, ctx, g, 52, W, D);
        K.build(g);
        Ah('im',4); Ah('pg',27); Ah('wta',55); if (opt.slayer) Ah('slayer',49.5); if (opt.cap) Ah('cap',72);
        Ah('lta',38,'l'); Ah('prot',48,'l'); ctx.hs('pbp', g, new V(12,13.5,-6), {deep:true});
        return g;
      },
      myco(ctx, R){
        const g = new THREE.Group(), K = kit(ctx), W = 70, D = 40, Ah = anchorer(ctx,g,W,D), box = {x:W/2, z:D/2};
        membrane(K, R, 0, {W, D});
        pg(K, R, 11.2, {W, D}); pg(K, R, 13.6, {W, D, dirX:false});
        for (let i=0;i<70;i++){ const p = new V((R()-.5)*(W-4),14.6,(R()-.5)*(D-4)); K.chain(p, Y, 7, 1.3, .5, C.ag, R, {wig:.35, bias:new V(0,.3,0), box}); for (let b=0;b<2;b++) K.chain(p.clone().add(new V(0,3+b*3,0)), new V(R()-.5,.5,R()-.5), 4, 1.2, .45, C.ag, R, {wig:.3, box}); }
        for (let x=-W/2+.8; x<W/2; x+=1.7) for (let z=-D/2+.8; z<D/2; z+=1.7){ const jx = x+(R()-.5)*.4, jz = z+(R()-.5)*.4; K.ball(new V(jx,25.6,jz), .62, C.myc); K.rod(new V(jx-.3,26.2,jz), new V(jx-.3,36.4,jz), .19, C.myt); K.rod(new V(jx+.3,26.2,jz), new V(jx+.3,31.5,jz), .19, C.myt); }
        const fl = ['#ffcf8a','#f5a3a3','#c9e38f'];
        for (let x=-W/2+1; x<W/2; x+=2.1) for (let z=-D/2+1; z<D/2; z+=2.1){ const jx = x+(R()-.5)*.4, jz = z+(R()-.5)*.4; K.ball(new V(jx,44,jz), .9, fl[Math.floor(R()*3)]); K.rod(new V(jx-.35,43.3,jz), new V(jx-.35,37.2,jz), .19, C.myt); K.rod(new V(jx+.35,43.3,jz), new V(jx+.35,38.4,jz), .19, C.myt); }
        for (let i=0;i<14;i++){ const top = K.chain(new V((R()-.5)*(W-6),7.5,(R()-.5)*(D-6)), Y, 40, 1.12, .4, C.lam, R, {wig:.08, bias:new V(0,.6,0), box}); for (let b=0;b<5;b++) K.chain(top, new V(R()-.5,.4,R()-.5), 3, 1, .42, C.lam, R, {wig:.3}); }
        capsuleLayer(K, R, ctx, g, 46, W, D, 14);
        K.build(g);
        Ah('im',4); Ah('pg',12.4); Ah('ag',20); Ah('myc',31); Ah('outer',41.5); Ah('cap',55); Ah('lam',50,'l');
        return g;
      },
      spiro(ctx, R){
        const g = new THREE.Group(), K = kit(ctx), W = 70, D = 40, Ah = anchorer(ctx,g,W,D), om = [[-14,4],[18,-8]];
        membrane(K, R, 0, {W, D});
        for (let i=0;i<30;i++){ const x = (R()-.5)*(W-4), z = (R()-.5)*(D-4); K.rod(new V(x,8,z), new V(x,11,z), .25, C.lpp); K.ball(new V(x,12.2,z), 1.4, C.lpp); }
        pg(K, R, 15, {W, D});
        const core = new THREE.Mesh(new THREE.CylinderGeometry(6.2,6.2,W+4,28), ctx.M('#5fbcd6','w')); core.rotation.z = Math.PI/2; core.position.set(0,27,0); g.add(core);
        for (let x=-W/2-1; x<W/2+2; x+=1.6) for (let k=0;k<11;k++){ const a = k/11*Math.PI*2 + x*.25; K.ball(new V(x, 27+Math.cos(a)*6.6, Math.sin(a)*6.6), 1, '#7fe9ff'); }
        membrane(K, R, 38, {W, D, skip:(x,z) => om.some(([a,b]) => Math.hypot(x-a,z-b) < 2.6)});
        const pm = ctx.M(C.porin, 'w', {side:THREE.DoubleSide});
        om.forEach(([x,z]) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.5,8.6,14,1,true), pm); c.position.set(x,42,z); g.add(c); });
        K.build(g);
        Ah('im',4); Ah('pg',15); Ah('endo',27); Ah('om',42); Ah('lipo',12,'l');
        ctx.hs('omp', g, new V(18,47.5,-8), {deep:true, side:'l'});
        return g;
      },
      fungal(ctx, R, o, opt){
        const g = new THREE.Group(), K = kit(ctx), W = 90, D = 50, Ah = anchorer(ctx,g,W,D), fk = [[20,-8],[-25,10]], top = opt.asp ? 54 : 58;
        membrane(K, R, 0, {W, D, step:2.4, skip:(x,z) => fk.some(([a,b]) => Math.hypot(x-a,z-b) < 3.4)});
        for (let i=0;i<260;i++){ const x = (R()-.5)*(W-2), z = (R()-.5)*(D-2), up = R() < .5; K.rod(new V(x,up?4.6:1.6,z), new V(x,up?6.6:3.6,z), .42, C.erg); }
        fk.forEach(([x,z]) => { K.ball(new V(x,4,z),2.8,C.pump); K.ball(new V(x,7.6,z),1.8,C.pump); K.chain(new V(x,9.4,z), Y, 10, 1.3, .5, C.glc, R, {wig:.2, bias:new V(0,.3,0)}); });
        for (let z=-D/2+.8; z<D/2; z+=1.5) for (const y of [10.5,12,13.5,15]) K.rod(new V(-W/2,y,z+(R()-.5)*.4), new V(W/2,y,z+(R()-.5)*.4), .55, C.chit);
        for (let i=0;i<260;i++){ const a = R()*Math.PI*2; K.chain(new V((R()-.5)*W, 17+R()*(top-20), (R()-.5)*D), new V(Math.cos(a),(R()-.5)*.3,Math.sin(a)), 22, 1.3, .5, C.glc, R, {wig:.22, box:{x:W/2, z:D/2, y0:16.5, y1:top}}); }
        if (!opt.asp){
          for (let i=0;i<150;i++){ const e = K.chain(new V((R()-.5)*(W-4), top-2, (R()-.5)*(D-4)), Y, 12, 1.4, .45, C.man, R, {wig:.12, bias:new V(0,.35,0), box:{x:W/2, z:D/2}}); for (let b=0;b<4;b++) K.chain(e, new V(R()-.5,.6,R()-.5), 4, 1.1, .55, C.man, R, {wig:.3}); }
        } else {
          for (let i=0;i<150;i++){ const a = R()*Math.PI*2; K.chain(new V((R()-.5)*W, top+1+R()*9, (R()-.5)*D), new V(Math.cos(a),0,Math.sin(a)), 14, 1.3, .5, C.man, R, {wig:.25, box:{x:W/2, z:D/2, y0:top, y1:top+11}}); }
          for (let i=0;i<420;i++) K.ball(new V((R()-.5)*(W-2), top+13+R()*5, (R()-.5)*(D-2)), 1.5+R()*.8, C.mel);
          for (let i=0;i<260;i++){ const x = (R()-.5)*(W-4), z = (R()-.5)*(D-4), a = R()*Math.PI; K.rod(new V(x-Math.cos(a)*3, top+21.5, z-Math.sin(a)*3), new V(x+Math.cos(a)*3, top+21.5, z+Math.sin(a)*3), .7, C.rod); }
        }
        K.build(g);
        Ah('mem',4); Ah('chit',12.7); Ah('glc',36);
        if (!opt.asp) Ah('man',top+12); else { Ah('out',top+6); Ah('mel',top+15.5); Ah('rod',top+22); }
        Ah('erg',5.6,'l'); ctx.hs('fks', g, new V(20,11,-8), {deep:true});
        return g;
      },
      proto(ctx, R){
        const g = new THREE.Group(), K = kit(ctx), W = 100, D = 60, Ah = anchorer(ctx,g,W,D);
        membrane(K, R, 0, {W, D, step:2.6});
        for (let x=-W/2+1.6; x<W/2; x+=3.2) for (let z=-D/2+1.6; z<D/2; z+=3.2) K.ell(new V(x+(R()-.5)*.6, 13, z+(R()-.5)*.6), 1.45, 4.6, 1.45, C.vsp);
        const rbm = ctx.M('#c7d4ff', 'w', {transparent:true, opacity:.7});
        for (const zc of [-21,-7,7,21]){
          for (let x=-W/2+2; x<W/2; x+=4) for (let k=0;k<13;k++){ const a = k/13*Math.PI*2 + x*.05; K.ball(new V(x, -18+Math.cos(a)*10.5, zc+Math.sin(a)*10.5), 2.05, (Math.round(x/4)+k)%2 ? C.mt : '#7f9cf0'); }
          const rb = new THREE.Mesh(new THREE.BoxGeometry(W,8,1.2), rbm); rb.position.set(0,-3.5,zc); g.add(rb);
        }
        K.build(g);
        Ah('mem',4); Ah('vsp',14); Ah('mt',-18); Ah('rib',-3.5,'l');
        return g;
      },
      knob(ctx, R){
        const g = new THREE.Group(), K = kit(ctx), W = 200, D = 120, Ah = anchorer(ctx,g,W,D), kn = [[-55,-20],[12,24],[62,-28]];
        membrane(K, R, 0, {W, D, step:4, hr:1.6, skip:(x,z) => kn.some(([a,b]) => Math.hypot(x-a,z-b) < 20)});
        const dm = ctx.M(C.head, 'w', {roughness:.4}); let pf;
        kn.forEach(([x,z], i) => {
          const d = new THREE.Mesh(new THREE.SphereGeometry(20,40,20,0,Math.PI*2,0,Math.PI/2), dm); d.scale.y = .55; d.position.set(x,7.5,z); g.add(d);
          for (let k=0;k<30;k++){ const a = R()*Math.PI*2, r = R()*15; K.ball(new V(x+Math.cos(a)*r, 1+R()*7, z+Math.sin(a)*r), 2.2, '#ff9fce'); }
          for (let k=0;k<3;k++){ const a = k/3*Math.PI*2+R(), r = 5; const p = new V(x+Math.cos(a)*r, 7.5+.55*Math.sqrt(400-r*r), z+Math.sin(a)*r);
            const e = K.chain(p, new V(Math.cos(a)*.2,1,Math.sin(a)*.2), 16, 2.1, 1.25, C.pfemp, R, {wig:.12, bias:new V(0,.4,0)}); K.chain(e, Y, 3, 2.6, 2.6, '#ffb347', R, {wig:.4}); if (i===1 && k===0) pf = e; }
        });
        const nodes = []; for (let x=-W/2+12; x<W/2; x+=46) for (let z=-D/2+12, r=0; z<D/2; z+=40, r++) nodes.push(new V(x+(r%2)*23, -14, z));
        nodes.forEach(n => { K.ball(n, 3, '#ff6f6f'); K.rod(n, new V(n.x,0,n.z), .7, '#d9a8ff'); });
        nodes.forEach((a,i) => nodes.forEach((b,j) => { if (j <= i) return; const d = a.distanceTo(b); if (d > 56) return; const st = Math.round(d/2.2); for (let s=1;s<st;s++){ const t = s/st, p = a.clone().lerp(b,t); p.y += Math.sin(t*Math.PI*6)*1.6; p.x += Math.cos(t*Math.PI*5)*1.2; K.ball(p, .9, C.spec); } }));
        K.build(g);
        Ah('mem',4); Ah('spec',-14); ctx.hs('knob', g, new V(12,19.5,24), {deep:true}); ctx.hs('pfemp', g, pf.clone().add(new V(0,5,0)), {deep:true, side:'l'});
        return g;
      }
    };
  };
})(window.ATLAS);
