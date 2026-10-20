/* Atlas de Microbiología GERMEN · modelos 3D de bacterias (medidas en micrómetros) */
(function (A) {
  A.organismBuilders1 = function (T) {
    const {THREE, V, Y, ru, shade, wob, smooth, rodGeo, sphGeo, rodPoint, HelixY, dot} = T;

    function entero(ctx, R, o, {len, r, flag, flagL=4.2, t3=6, tail=false, fimb=50}){
      const g = new THREE.Group(), body = new THREE.Mesh(rodGeo(len, r, R), ctx.M(o.hue)); g.add(body); ctx.bodies.push(body);
      let f0 = null; const fm = ctx.M(shade(o.hue,-.05), 'app', {roughness:.55, clearcoat:.2});
      for (let i=0;i<flag;i++){ const s = rodPoint(len,r,R); const n = s.n.clone().lerp(new V(0,-1,0), .45).normalize(); const f = ctx.flag(flagL,.16,1,.015,fm,R); ctx.place(f.holder, s.p, n); g.add(f.holder); f0 = f0 || f; }
      if (fimb) ctx.pili(g, Array.from({length:fimb}, () => rodPoint(len,r,R)), .16, .006, ctx.M(shade(o.hue,.08),'app'), R);
      const nm = ctx.M('#ffd27a','detail',{emissiveIntensity:.2}), ng = new THREE.CylinderGeometry(.01,.014,.17,8); ng.translate(0,.085,0);
      const bg = new THREE.TorusGeometry(.035,.012,8,18); let n0 = null;
      for (let i=0;i<t3;i++){ const s = rodPoint(len,r,R); g.add(ctx.place(new THREE.Mesh(ng,nm), s.p, s.n, Y)); g.add(ctx.place(new THREE.Mesh(bg,nm), s.p, s.n)); n0 = n0 || s.p.clone().addScaledVector(s.n,.22); }
      let tailMid = null;
      if (tail){
        const tm = ctx.M('#ff8f6b','detail',{transparent:true,opacity:.5,depthWrite:false}), tg = new THREE.CylinderGeometry(.012,.012,1,4,1,true); tg.translate(0,.5,0);
        const N = 180, list = [], q = new THREE.Quaternion(), pole = new V(0,-(len/2+r),0);
        for (let i=0;i<N;i++){ const dir = new V((R()-.5)*.7,-1,(R()-.5)*.7).normalize(); q.setFromUnitVectors(Y, dir); list.push(new THREE.Matrix4().compose(pole.clone().add(new V((R()-.5)*.5,0,(R()-.5)*.5)), q, new V(1,.6+R()*R()*4,1))); }
        g.add(ctx.inst(tg, tm, list)); tailMid = pole.clone().add(new V(.3,-1.4,0));
      }
      return {g, f0, n0, tailMid};
    }

    function neisseria(ctx, R, o, {cap, nPili, ves}){
      const g = new THREE.Group(), mat = ctx.M(o.hue);
      let geo = new THREE.SphereGeometry(.42,48,32); const p = geo.attributes.position;
      for (let i=0;i<p.count;i++){ let x = p.getX(i); const y = p.getY(i), z = p.getZ(i); if (x<0){ x *= .4; x += .04*(1-(y*y+z*z)/(.42*.42)); } p.setX(i, x); }
      geo.computeVertexNormals(); geo = smooth(wob(geo,.01,6,R()*9));
      const pm = ctx.M(shade(o.hue,.1),'app');
      const pair = (pos, rot) => { const gp = new THREE.Group(); gp.position.copy(pos); gp.rotation.set(...rot);
        const a = new THREE.Mesh(geo,mat); a.position.x = .21; const b = new THREE.Mesh(geo,mat); b.rotation.y = Math.PI; b.position.x = -.21; gp.add(a,b); ctx.bodies.push(a,b);
        [a,b].forEach(c => { const sm = []; while (sm.length < nPili){ const n = ru(R); if (n.x < .1) continue; sm.push({p:n.clone().multiplyScalar(.42), n}); } ctx.pili(c, sm, .9, .006, pm, R); });
        if (cap){ const sh = new THREE.Mesh(new THREE.SphereGeometry(1,40,28), ctx.shell('#d8f3ff')); sh.scale.set(.95,.66,.66); sh.renderOrder = 2; gp.add(sh); }
        g.add(gp); return gp; };
      const p1 = pair(new V(), [0,0,.1]); pair(new V(1.2,-.95,-.8), [.4,.7,-.5]);
      let v0 = null;
      if (ves){ const vm = ctx.M(shade(o.hue,.2),'detail'); for (let i=0;i<16;i++){ const d = ru(R); const v = new THREE.Mesh(new THREE.SphereGeometry(.045,12,8), vm); v.position.copy(d.multiplyScalar(.75+R()*.35)); v.position.y *= .8; g.add(v); v0 = v0 || v.position.clone(); } }
      return {g, p1, v0};
    }

    return {
      saureus(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue), pos = [new V()];
        for (let k=0; pos.length<17 && k<5000; k++){ const b = pos[Math.floor(R()*pos.length)]; const p = b.clone().add(ru(R).multiplyScalar(.97)); if (p.length() > 1.6) continue; if (pos.every(q => q.distanceTo(p) > .93)) pos.push(p); }
        const geo = sphGeo(.5,R,.025);
        pos.forEach(p => { const m = new THREE.Mesh(geo,mat); m.position.copy(p); m.rotation.set(R()*6,R()*6,R()*6); m.scale.setScalar(.92+R()*.14); g.add(m); ctx.bodies.push(m); });
        const ext = d => { d = d.clone().normalize(); let bi=0, bv=-1e9; pos.forEach((p,i) => { const v = p.dot(d); if (v > bv){ bv = v; bi = i; } }); return pos[bi].clone().add(d.multiplyScalar(.56)); };
        ctx.hs('pared',g,ext(new V(1,.2,.6))); ctx.hs('proteinaA',g,ext(new V(-.8,.3,.6))); ctx.hs('racimo',g,ext(new V(.1,1,.3)));
        return g;
      },
      spneumo(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue), cap = ctx.shell('#d6f2ff');
        let geo = new THREE.SphereGeometry(.42,48,32); const p = geo.attributes.position;
        for (let i=0;i<p.count;i++){ let x=p.getX(i), y=p.getY(i), z=p.getZ(i); const t=y/.42; if (t>0){ const f=1-.55*t*t; x*=f; z*=f; } p.setXYZ(i,x,y*1.45,z); }
        geo.computeVertexNormals(); geo = smooth(wob(geo,.012,6,R()*9));
        const pair = () => { const gp = new THREE.Group(); const a = new THREE.Mesh(geo,mat); a.position.y = .63; const b = new THREE.Mesh(geo,mat); b.rotation.z = Math.PI; b.position.y = -.63; const sh = new THREE.Mesh(new THREE.SphereGeometry(1,48,32), cap); sh.scale.set(.8,1.62,.8); sh.renderOrder = 2; gp.add(a,b,sh); ctx.bodies.push(a,b); return gp; };
        const p1 = pair(); g.add(p1); const p2 = pair(); p2.position.set(1.85,-.8,-1.4); p2.rotation.set(.3,.6,-.6); g.add(p2);
        ctx.hs('capsula',p1,new V(.78,.6,.1)); ctx.hs('diplo',p1,new V(.44,0,.12)); ctx.hs('pared',p1,new V(0,1.3,0));
        return g;
      },
      efaecalis(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue); let geo = new THREE.SphereGeometry(.45,48,32); geo.scale(1.28,1,1); geo = smooth(wob(geo,.01,6,R()*9));
        const cells = []; let x = -3.1;
        for (let i=0;i<6;i++){ const m = new THREE.Mesh(geo,mat); m.position.set(x, Math.sin(i*.9)*.25, Math.cos(i*.7)*.2); m.rotation.z = Math.sin(i*.9)*.2; g.add(m); ctx.bodies.push(m); cells.push(m); x += i%2===0 ? 1.12 : 1.38; }
        const pm = ctx.M(shade(o.hue,.1),'app');
        cells.forEach(c => { const sm = []; for (let k=0;k<10;k++){ const n = ru(R); sm.push({p:new V(n.x*.57,n.y*.45,n.z*.45), n}); } ctx.pili(c, sm, .32, .006, pm, R); });
        ctx.hs('pared',cells[0],new V(0,.5,0)); ctx.hs('cadena',g,cells[1].position.clone().add(new V(.69,.55,0))); ctx.hs('pili',cells[4],new V(.3,.6,.3));
        return g;
      },
      cdiff(ctx,R,o){
        const g = new THREE.Group(), len = 5, r = .42, body = new THREE.Mesh(rodGeo(len,r,R), ctx.M(o.hue)); g.add(body); ctx.bodies.push(body);
        const sp = new THREE.Mesh(sphGeo(.5,R,.02), ctx.M('#f5ead0','detail',{emissiveIntensity:.22,roughness:.3})); sp.scale.set(1,1.45,1); sp.position.y = 1.85; g.add(sp); ctx.bodies.push(sp);
        const fm = ctx.M(shade(o.hue,-.05),'app',{roughness:.55}); let f0;
        for (let i=0;i<11;i++){ const s = rodPoint(len,r,R); const n = s.n.clone().lerp(ru(R),.35).normalize(); const f = ctx.flag(3.6,.14,.9,.014,fm,R); ctx.place(f.holder,s.p,n); g.add(f.holder); f0 = f0 || f; }
        const tp = []; for (let i=0;i<70;i++){ const p = new V((R()-.5)*2.6, -2.2+R()*2.4, (R()-.5)*2.6); if (Math.hypot(p.x,p.z) < .7) continue; tp.push(...p.toArray()); }
        const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.Float32BufferAttribute(tp,3));
        const tox = new THREE.Points(tg, new THREE.PointsMaterial({size:.13,map:dot,color:0xff9b72,transparent:true,opacity:.8,depthWrite:false})); g.add(tox); ctx.decor.push(tox);
        ctx.hs('espora',g,new V(.56,1.85,.1)); ctx.hs('flagelos',f0.holder,new V(0,0,1.8)); ctx.hs('toxinas',g,new V(.2,-1.1,r+.05));
        return g;
      },
      ecoli(ctx,R,o){
        const e = entero(ctx,R,o,{len:1.3,r:.42,flag:7,flagL:4.4,t3:0,fimb:170});
        ctx.hs('flagelo',e.f0.holder,new V(0,0,2.2)); ctx.hs('fimbrias',e.g,new V(.3,.75,.3)); ctx.hs('lps',e.g,new V(0,.2,.45));
        return e.g;
      },
      kpneumo(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue), cap = ctx.shell(shade(o.hue,.25,.1)), pm = ctx.M(shade(o.hue,.1),'app');
        [[new V(-.75,.35,0),[.2,.1,.5]],[new V(.85,-.25,.35),[-.3,.4,-.9]],[new V(.05,-.6,-1.1),[1.1,.2,.1]]].forEach(([p,e],i) => {
          const c = new THREE.Group(); c.position.copy(p); c.rotation.set(...e); const b = new THREE.Mesh(rodGeo(1.05,.38,R),mat); c.add(b); ctx.bodies.push(b);
          const sh = new THREE.Mesh(new THREE.CapsuleGeometry(.74,1.15,10,28), cap); sh.renderOrder = 2; c.add(sh);
          const sm = Array.from({length:40}, () => rodPoint(1.05,.38,R)); ctx.pili(c,sm,.16,.006,pm,R); g.add(c);
          if (i===0){ ctx.hs('capsula',c,new V(.74,.3,0)); ctx.hs('lps',c,new V(0,-.2,.42)); }
          if (i===1) ctx.hs('fimbrias',c,sm[0].p.clone().add(sm[0].n.clone().multiplyScalar(.18)));
        });
        return g;
      },
      salmonella(ctx,R,o){
        const e = entero(ctx,R,o,{len:1.7,r:.4,flag:8});
        ctx.hs('flagelo',e.f0.holder,new V(0,0,2)); ctx.hs('t3ss',e.g,e.n0); ctx.hs('lps',e.g,new V(0,.35,.43));
        return e.g;
      },
      shigella(ctx,R,o){
        const e = entero(ctx,R,o,{len:1.5,r:.38,flag:0,tail:true,fimb:30});
        ctx.hs('t3ss',e.g,e.n0); ctx.hs('actina',e.g,e.tailMid); ctx.hs('lps',e.g,new V(0,.4,.41));
        return e.g;
      },
      yersinia(ctx,R,o){
        const e = entero(ctx,R,o,{len:.9,r:.42,flag:6,flagL:3,fimb:40});
        ctx.hs('flagelo',e.f0.holder,new V(0,0,1.5)); ctx.hs('ysc',e.g,e.n0); ctx.hs('invasina',e.g,new V(0,.2,.45));
        return e.g;
      },
      paeru(ctx,R,o){
        const g = new THREE.Group(), len = 1.9, r = .33, body = new THREE.Mesh(rodGeo(len,r,R), ctx.M(o.hue)); g.add(body); ctx.bodies.push(body);
        const f = ctx.flag(5.2,.24,1.35,.024, ctx.M(shade(o.hue,-.06),'app',{roughness:.5}), R); ctx.place(f.holder, new V(0,len/2+r-.02,0), Y); g.add(f.holder);
        const sm = []; while (sm.length < 10){ const n = ru(R); if (n.y < .75) continue; sm.push({p:new V(n.x*r, n.y*r+len/2, n.z*r), n:n.clone().lerp(Y,.2)}); }
        ctx.pili(g, sm, .95, .006, ctx.M(shade(o.hue,.1),'app'), R);
        ctx.hs('flagelo',f.holder,new V(0,0,2.6)); ctx.hs('pili',g,sm[0].p.clone().add(sm[0].n.clone().multiplyScalar(.6))); ctx.hs('membrana',g,new V(r+.03,-.4,0));
        return g;
      },
      abaum(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue), pm = ctx.M(shade(o.hue,.1),'app'); let first;
        [[new V(0,0,0),[0,0,.2]],[new V(1.6,-.5,-.9),[.6,.3,-.7]]].forEach(([p,e]) => {
          const pr = new THREE.Group(); pr.position.copy(p); pr.rotation.set(...e);
          [.67,-.67].forEach(y => { const c = new THREE.Group(); c.position.y = y; const b = new THREE.Mesh(rodGeo(.32,.5,R),mat); c.add(b); ctx.bodies.push(b); ctx.pili(c, Array.from({length:70}, () => rodPoint(.32,.5,R)), .3, .006, pm, R); pr.add(c); });
          g.add(pr); first = first || pr;
        });
        ctx.hs('par',first,new V(.44,0,.25)); ctx.hs('pili',first,new V(-.62,.9,.3)); ctx.hs('membrana',first,new V(0,-.75,.53));
        return g;
      },
      vchol(ctx,R,o){
        const g = new THREE.Group(), len = 1.5, r = .3, c = .33, body = new THREE.Mesh(rodGeo(len,r,R,c), ctx.M(o.hue)); g.add(body); ctx.bodies.push(body);
        const yt = len/2+r-.02, f = ctx.flag(4.5,.2,1.2,.03, ctx.M(shade(o.hue,-.06),'app',{roughness:.5}), R);
        ctx.place(f.holder, new V(c*yt*yt, yt, 0), new V(2*c*yt, 1, 0)); g.add(f.holder);
        const sm = []; while (sm.length < 8){ const s = rodPoint(len,r,R); if (s.n.x > -.4 || Math.abs(s.p.y) > .5) continue; s.p.x += c*s.p.y*s.p.y; s.n.lerp(new V(-1,-.3,.4),.5); sm.push(s); }
        ctx.pili(g, sm, 1.1, .008, ctx.M(shade(o.hue,.12),'app'), R);
        ctx.hs('flagelo',f.holder,new V(0,0,2.2)); ctx.hs('coma',g,new V(.05,0,r+.04)); ctx.hs('tcp',g,sm[0].p.clone().add(sm[0].n.clone().normalize().multiplyScalar(.7)));
        return g;
      },
      hpylori(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue), tr = .28, curve = new HelixY(.32,1.4,3);
        const body = new THREE.Mesh(new THREE.TubeGeometry(curve,90,tr,24,false), mat); g.add(body); ctx.bodies.push(body);
        [0,1].forEach(t => { const s = new THREE.Mesh(new THREE.SphereGeometry(tr,24,16), mat); s.position.copy(curve.getPoint(t)); g.add(s); ctx.bodies.push(s); });
        const fm = ctx.M(shade(o.hue,-.08),'app',{roughness:.5}), bm = ctx.M(shade(o.hue,.1),'app');
        const p1 = curve.getPoint(1), tan = curve.getTangent(1); let f0;
        for (let i=0;i<5;i++){ const f = ctx.flag(3.2,.18,1,.03,fm,R); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.06,12,8), bm); bulb.position.copy(f.curve.getPoint(1)); f.mesh.add(bulb); ctx.place(f.holder, p1.clone().add(tan.clone().multiplyScalar(.2)), tan.clone().add(ru(R).multiplyScalar(.4))); g.add(f.holder); f0 = f0 || f; }
        const cp = []; for (let i=0;i<260;i++){ const b = curve.getPoint(R()); cp.push(...b.add(ru(R).multiplyScalar(.45+R()*.9)).toArray()); }
        const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(cp,3));
        const cloud = new THREE.Points(cg, new THREE.PointsMaterial({size:.09,map:dot,color:0xbff4ff,transparent:true,opacity:.55,depthWrite:false})); g.add(cloud); ctx.decor.push(cloud);
        const c = curve.getPoint(.45), rad = new V(c.x,0,c.z).normalize(), base = c.clone().add(rad.clone().multiplyScalar(tr-.02));
        const ng = new THREE.CylinderGeometry(.022,.045,.34,10); ng.translate(0,.17,0); g.add(ctx.place(new THREE.Mesh(ng, ctx.M('#ff8f6b','detail')), base, rad, Y));
        ctx.hs('flagelos',f0.holder,new V(0,0,1.6)); ctx.hs('ureasa',g,curve.getPoint(.2).add(new V(0,.2,1.1))); ctx.hs('cag',g,base.clone().add(rad.clone().multiplyScalar(.4)));
        return g;
      },
      nmen(ctx,R,o){
        const n = neisseria(ctx,R,o,{cap:true,nPili:8,ves:true});
        ctx.hs('capsula',n.p1,new V(0,.66,.1)); ctx.hs('diplo',n.p1,new V(0,.36,.12)); ctx.hs('pili',n.p1,new V(.8,.45,.1)); ctx.hs('ves',n.g,n.v0);
        return n.g;
      },
      ngon(ctx,R,o){
        const n = neisseria(ctx,R,o,{cap:false,nPili:22,ves:false});
        ctx.hs('pili',n.p1,new V(.85,.5,.1)); ctx.hs('diplo',n.p1,new V(0,.36,.12)); ctx.hs('membrana',n.p1,new V(-.64,0,.12));
        return n.g;
      },
      mtb(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue,'body',{roughness:.22,clearcoat:1,clearcoatRoughness:.15});
        const path = new THREE.CatmullRomCurve3([new V(-5,-1.4,0),new V(-2.5,1,.5),new V(0,0,-.3),new V(2.5,-1,.4),new V(5,1.2,0)]);
        const geos = [0,1,2].map(() => rodGeo(2.4,.2,R,.03*(R()-.5))), rods = [];
        for (let i=0;i<10;i++) for (const lane of [-1,0,1]){
          const t = Math.min(.98, Math.max(.02, i/9.2 + lane*.025 + (R()-.5)*.02)), b = path.getPointAt(t), tan = path.getTangentAt(t);
          const perp = new V().crossVectors(tan, new V(0,0,1)).normalize();
          const m = new THREE.Mesh(geos[Math.floor(R()*3)], mat); m.position.copy(b).add(perp.multiplyScalar(lane*.42)).add(new V(0,0,(R()-.5)*.5));
          m.quaternion.setFromUnitVectors(Y, tan.clone().add(ru(R).multiplyScalar(.12)).normalize()); g.add(m); ctx.bodies.push(m); rods.push(m);
        }
        ctx.hs('cordon',g,path.getPointAt(.5).add(new V(0,.75,.3))); ctx.hs('micolicos',rods[13],new V(.22,.3,0)); ctx.hs('esx',rods[22],new V(0,.8,.22));
        return g;
      },
      tpall(ctx,R,o){
        const g = new THREE.Group(), curve = new HelixY(.16,8,10), mat = ctx.M(o.hue);
        const body = new THREE.Mesh(new THREE.TubeGeometry(curve,520,.075,10,false), mat); g.add(body); ctx.bodies.push(body);
        const shm = ctx.shell(shade(o.hue,.25,.1)), sheath = new THREE.Mesh(new THREE.TubeGeometry(curve,520,.115,12,false), shm); sheath.renderOrder = 2; g.add(sheath);
        [0,1].forEach(t => { const s = new THREE.Mesh(new THREE.SphereGeometry(.115,16,12), shm); s.position.copy(curve.getPoint(t)); g.add(s); });
        const endoC = new HelixY(.2,8,9.2,.15); g.add(new THREE.Mesh(new THREE.TubeGeometry(endoC,520,.016,6,false), ctx.M('#7fe9ff','app',{emissiveIntensity:.5})));
        g.rotation.z = .55;
        const m = curve.getPoint(.62), rad = new V(m.x,0,m.z).normalize();
        ctx.hs('endoflagelos',g,endoC.getPoint(.3)); ctx.hs('membrana',g,m.add(rad.multiplyScalar(.14))); ctx.hs('extremo',g,curve.getPoint(1).add(new V(0,.15,0)));
        return g;
      }
    };
  };
})(window.ATLAS);
