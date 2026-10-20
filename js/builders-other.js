/* Atlas de Microbiología GERMEN · modelos 3D de hongos, protozoos y virus (medidas en micrómetros) */
(function (A) {
  A.organismBuilders2 = function (T) {
    const {THREE, V, Y, ru, shade, wob, smooth, sphGeo, HelixY} = T;
    const one = new V(1,1,1);

    return {
      calb(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue), yGeo = sphGeo(2,R,.025), bGeo = sphGeo(1.1,R,.025);
        const yeast = (p,e,bud) => { const c = new THREE.Group(); c.position.copy(p); c.rotation.set(...e); const m = new THREE.Mesh(yGeo,mat); m.scale.set(1,1.22,1); c.add(m); ctx.bodies.push(m);
          if (bud){ const b = new THREE.Mesh(bGeo,mat); b.position.y = 2.44+.82; c.add(b); ctx.bodies.push(b); } g.add(c); return c; };
        yeast(new V(), [0,0,0], false);
        const hp = new THREE.CatmullRomCurve3([new V(0,1.9,0),new V(.3,4,.2),new V(1.2,6.5,-.2),new V(2.6,8.8,.2),new V(4.4,10.6,0)]);
        const hy = new THREE.Mesh(new THREE.TubeGeometry(hp,90,.8,24,false), mat); g.add(hy); ctx.bodies.push(hy);
        const tip = new THREE.Mesh(new THREE.SphereGeometry(.8,24,16), mat); tip.position.copy(hp.getPoint(1)); g.add(tip);
        const sm = ctx.M(shade(o.hue,-.15),'detail');
        [.38,.72].forEach(t => g.add(ctx.place(new THREE.Mesh(new THREE.TorusGeometry(.82,.09,10,40), sm), hp.getPointAt(t), hp.getTangentAt(t))));
        const b = yeast(new V(-4.6,-1.2,.8),[0,0,.9],true), c = yeast(new V(4.2,-2.6,-1.2),[.4,0,-1.2],true); yeast(new V(-.8,-4.9,-.6),[1.2,.3,0],false);
        ctx.hs('gemacion',b,new V(0,2.44+.82+1.15,0)); ctx.hs('hifa',g,hp.getPointAt(.55).add(new V(.86,0,.2))); ctx.hs('pared',c,new V(0,-.4,2.05));
        return g;
      },
      aspergillus(ctx,R,o){
        const g = new THREE.Group(), mat = ctx.M(o.hue), cm = ctx.M(o.hue2,'detail');
        const st = new THREE.CatmullRomCurve3([new V(1.5,-39,0),new V(.8,-24,.5),new V(0,-9,0)]);
        const stalk = new THREE.Mesh(new THREE.TubeGeometry(st,40,2.6,20,false), mat); g.add(stalk); ctx.bodies.push(stalk);
        const ves = new THREE.Mesh(sphGeo(10,R,.015), mat); ves.scale.set(1,1.08,1); g.add(ves); ctx.bodies.push(ves);
        const phG = new THREE.CylinderGeometry(.9,1.4,7,12); phG.translate(0,3.5,0);
        const con = [], q = new THREE.Quaternion(); let n = 0, tipA;
        for (let i=0; i<400 && n<64; i++){ const d = ru(R); if (d.y < .05) continue; n++;
          const p = new V(d.x*9.6, d.y*10.4, d.z*9.6), dir = d.clone().add(new V(0,.7,0)).normalize();
          g.add(ctx.place(new THREE.Mesh(phG,mat), p, dir, Y));
          let c = p.clone().addScaledVector(dir, 8.3);
          for (let k=0;k<5;k++){ con.push(new THREE.Matrix4().compose(c.clone(), q, one)); c = c.clone().addScaledVector(dir.clone().add(ru(R).multiplyScalar(.08)).normalize(), 2.55); }
          if (n === 5) tipA = c.clone(); }
        g.add(ctx.inst(sphGeo(1.3,R,.04), cm, con));
        const hp = new THREE.CatmullRomCurve3([new V(-30,-40,0),new V(-10,-39,1),new V(10,-40,0),new V(30,-39,-1)]);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(hp,60,2.2,16,false), mat));
        const br = new THREE.CatmullRomCurve3([new V(-14,-39.5,.5),new V(-22,-31,1.5),new V(-30,-22,2)]);
        g.add(new THREE.Mesh(new THREE.TubeGeometry(br,30,2,16,false), mat));
        [hp.getPoint(0),hp.getPoint(1)].forEach(p => { const s = new THREE.Mesh(new THREE.SphereGeometry(2.2,16,12), mat); s.position.copy(p); g.add(s); });
        const s3 = new THREE.Mesh(new THREE.SphereGeometry(2,16,12), mat); s3.position.copy(br.getPoint(1)); g.add(s3);
        const sm = ctx.M(shade(o.hue,-.2),'detail');
        [[hp,.15],[hp,.6],[hp,.85],[br,.6]].forEach(([c,t]) => g.add(ctx.place(new THREE.Mesh(new THREE.TorusGeometry(2.25,.3,10,32), sm), c.getPointAt(t), c.getTangentAt(t))));
        ctx.hs('vesicula',g,new V(10.3,1.5,1)); ctx.hs('conidios',g,tipA.add(new V(0,1.5,0))); ctx.hs('hifa',g,hp.getPointAt(.75).add(new V(0,2.8,0)));
        return g;
      },
      giardia(ctx,R,o){
        const g = new THREE.Group(), pts = [];
        for (let i=0;i<=48;i++){ const t = i/48; pts.push(new THREE.Vector2(Math.max(.001, 3.1*Math.pow(Math.sin(Math.PI*Math.pow(t,1.5)),.7)), -7+14*t)); }
        let geo = new THREE.LatheGeometry(pts,72); geo.scale(1,1,.5); geo = smooth(geo);
        const body = new THREE.Mesh(geo, ctx.M(o.hue,'body',{transparent:true,opacity:.5,depthWrite:false,roughness:.18,clearcoat:1})); body.renderOrder = 2; g.add(body);
        const nm = ctx.M(shade(o.hue,-.25,.05),'detail',{emissiveIntensity:.25});
        [-1,1].forEach(s => { const n = new THREE.Mesh(new THREE.SphereGeometry(.85,32,20), nm); n.scale.set(1,1.3,.7); n.position.set(s*1.08,3.6,.15); g.add(n);
          const mb = new THREE.Mesh(new THREE.CapsuleGeometry(.17,.9,6,12), nm); mb.position.set(s*.55,-.6,0); mb.rotation.z = s*.5; g.add(mb); });
        const disc = new THREE.Mesh(new THREE.TorusGeometry(2.1,.16,12,64), ctx.M(shade(o.hue,.15),'detail',{transparent:true,opacity:.7})); disc.position.set(0,3.1,-1.3); g.add(disc);
        const fm = ctx.M(shade(o.hue,-.05),'app',{roughness:.5}); let caud;
        [-1,1].forEach(s => {
          [[[s*1.2,4.8,0],[s*.9,-1,0]],[[s*1.4,-1.5,0],[s*.35,-1,0]],[[s*.35,-2.2,-.9],[s*.1,-1,-.3]],[[s*.15,-6.6,0],[s*.05,-1,0]]].forEach(([p,d],k) => {
            const f = ctx.flag(8,.35,2.6,.07,fm,R); f.mesh.userData.speed *= .35; ctx.place(f.holder, new V(...p), new V(...d)); g.add(f.holder); if (k===3 && s===1) caud = f; });
        });
        ctx.hs('nucleos',g,new V(1.08,3.6,1.5)); ctx.hs('disco',g,new V(-2.1,3.1,-1.3)); ctx.hs('flagelos',caud.holder,new V(0,0,4.5));
        return g;
      },
      plasmodium(ctx,R,o){
        const g = new THREE.Group(), R0 = 3.91, h = s => Math.sqrt(Math.max(0,1-s*s))*(.81+7.83*s*s-4.39*s**4)/2, pts = [];
        for (let i=0;i<=40;i++){ const s = i/40; pts.push(new THREE.Vector2(Math.max(.0001,R0*s), -h(s))); }
        for (let i=39;i>=0;i--){ const s = i/40; pts.push(new THREE.Vector2(Math.max(.0001,R0*s), h(s))); }
        const geo = smooth(new THREE.LatheGeometry(pts,72));
        const rm = ctx.M(o.hue,'body',{transparent:true,opacity:.6,depthWrite:false,roughness:.3,side:THREE.DoubleSide});
        const main = new THREE.Mesh(geo, rm); main.renderOrder = 2; g.add(main);
        const kl = [], q = new THREE.Quaternion(); let k0;
        for (let i=0;i<280;i++){ const s = Math.sqrt(R())*.97, a = R()*Math.PI*2, sg = R()<.5?-1:1; const p = new V(R0*s*Math.cos(a), sg*(h(s)+.03), R0*s*Math.sin(a)); kl.push(new THREE.Matrix4().compose(p,q,one)); if (!k0 && sg>0 && s>.6) k0 = p.clone(); }
        g.add(ctx.inst(new THREE.SphereGeometry(.075,10,8), ctx.M(shade(o.hue,.15),'knob'), kl));
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.62,.13,14,48,Math.PI*1.7), ctx.M('#7fd8ff','detail')); ring.rotation.x = Math.PI/2; ring.position.set(1.3,.05,.4); g.add(ring);
        const ch = new THREE.Mesh(new THREE.SphereGeometry(.21,20,14), ctx.M('#ff5fa2','chrom',{emissiveIntensity:.2})); const a = Math.PI*1.85;
        ch.position.set(1.3+.62*Math.cos(a), .05, .4+.62*Math.sin(a)); g.add(ch);
        [[new V(5.6,-1.2,-3),[1.1,.3,.5]],[new V(-5.4,1.1,-3.4),[-.9,.2,-.3]]].forEach(([p,e]) => { const m = new THREE.Mesh(geo, rm); m.position.copy(p); m.rotation.set(...e); m.renderOrder = 2; g.add(m); });
        ctx.hs('knobs',g,k0.add(new V(0,.2,0))); ctx.hs('anillo',g,new V(1.3,.3,1.05)); ctx.hs('membrana',g,new V(-R0-.05,0,.3));
        return g;
      },
      sars(ctx,R,o){
        const g = new THREE.Group(), r = .045;
        const body = new THREE.Mesh(sphGeo(r,R,.04), ctx.clip(ctx.M(o.hue))); g.add(body); ctx.bodies.push(body);
        g.add(new THREE.Mesh(new THREE.SphereGeometry(r*.9,48,32), ctx.clip(ctx.M(shade(o.hue,.2),'detail'))));
        const N = 42, stalkG = new THREE.CylinderGeometry(.0013,.0018,.012,6); stalkG.translate(0,.006,0);
        const headG = new THREE.SphereGeometry(.0058,14,10); headG.scale(1,1.3,1); headG.translate(0,.0165,0);
        const q = new THREE.Quaternion(), sl = []; let tip0, mid0;
        for (let i=0;i<N;i++){ const y = 1-2*(i+.5)/N, rr = Math.sqrt(1-y*y), th = i*2.39996+R()*.2; const d = new V(Math.cos(th)*rr, y, Math.sin(th)*rr); q.setFromUnitVectors(Y,d); sl.push(new THREE.Matrix4().compose(d.clone().multiplyScalar(r*.97), q, one)); if (i === Math.floor(N*.45)){ tip0 = d.clone().multiplyScalar(r+.025); mid0 = d; } }
        g.add(ctx.inst(stalkG, ctx.clip(ctx.M(shade(o.hue2,-.05),'detail')), sl), ctx.inst(headG, ctx.clip(ctx.M(o.hue2,'detail',{emissiveIntensity:.15})), sl));
        const ml = []; for (let i=0;i<180;i++) ml.push(new THREE.Matrix4().compose(ru(R).multiplyScalar(r*.99), q.identity(), one));
        g.add(ctx.inst(new THREE.SphereGeometry(.0022,8,6), ctx.clip(ctx.M(shade(o.hue,-.2),'detail')), ml));
        const rp = []; for (let i=0;i<34;i++) rp.push(ru(R).multiplyScalar(r*.7*Math.cbrt(R())));
        const rc = new THREE.CatmullRomCurve3(rp); g.add(new THREE.Mesh(new THREE.TubeGeometry(rc,400,.0012,6,false), ctx.M('#ffd36a','detail')));
        const nl = []; for (let i=0;i<110;i++){ const p = rc.getPointAt(i/110).add(ru(R).multiplyScalar(.0022)); nl.push(new THREE.Matrix4().compose(p, q.identity(), one)); }
        g.add(ctx.inst(new THREE.SphereGeometry(.0034,10,8), ctx.M('#6fd3a8','detail'), nl));
        ctx.hs('espicula',g,mid0.clone().applyAxisAngle(Y,1.8).multiplyScalar(r+.012)); ctx.hs('rbd',g,tip0); ctx.hs('envoltura',g,new V(-.6,.3,.75).normalize().multiplyScalar(r+.004));
        ctx.hs('genoma',g,rc.getPointAt(.3),{deep:true}); ctx.hs('nucleocapside',g,rc.getPointAt(.7).add(new V(0,.004,0)),{deep:true,side:'l'}); ctx.hs('bicapa',g,new V(),{deep:true,rim:r*.95});
        return g;
      },
      hiv(ctx,R,o){
        const g = new THREE.Group(), r = .05;
        const body = new THREE.Mesh(sphGeo(r,R,.03), ctx.clip(ctx.M(o.hue))); g.add(body); ctx.bodies.push(body);
        g.add(new THREE.Mesh(new THREE.SphereGeometry(r*.9,48,32), ctx.clip(ctx.M('#9ad08f','detail'))));
        const sm = ctx.clip(ctx.M(shade(o.hue2,-.1),'detail')), hm = ctx.clip(ctx.M(o.hue2,'detail',{emissiveIntensity:.15}));
        let tip;
        for (let i=0;i<12;i++){ const y = 1-2*(i+.5)/12, rr = Math.sqrt(1-y*y), th = i*2.39996; const d = new V(Math.cos(th)*rr, y, Math.sin(th)*rr);
          const sp = new THREE.Group(); sp.position.copy(d.clone().multiplyScalar(r*.98)); sp.quaternion.setFromUnitVectors(Y,d);
          const st = new THREE.Mesh(new THREE.CylinderGeometry(.0017,.0021,.009,8), sm); st.position.y = .0045; sp.add(st);
          for (let k=0;k<3;k++){ const a = k/3*Math.PI*2; const l = new THREE.Mesh(new THREE.SphereGeometry(.0042,12,8), hm); l.position.set(Math.cos(a)*.0036,.0115,Math.sin(a)*.0036); sp.add(l); }
          g.add(sp); if (i===5) tip = sp; }
        const pts = [[.0001,-.034],[.007,-.032],[.0105,-.027],[.0235,.022],[.021,.03],[.0001,.034]].map(([x,y]) => new THREE.Vector2(x,y));
        const cap = new THREE.Group(); cap.rotation.set(.3,.2,.75); g.add(cap);
        cap.add(new THREE.Mesh(new THREE.LatheGeometry(pts,8), ctx.M('#ffb36b','detail',{flatShading:true,transparent:true,opacity:.55,depthWrite:false,side:THREE.DoubleSide})));
        const strand = (ph,col) => { const c = []; for (let i=0;i<=24;i++){ const t = i/24, y = -.026+t*.05, rad = (.004+.009*t)*.6; c.push(new V(Math.cos(t*14+ph)*rad, y, Math.sin(t*14+ph)*rad)); } return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(c),120,.0011,6,false), ctx.M(col,'detail')); };
        cap.add(strand(0,'#ffd36a'), strand(Math.PI,'#ffe9a8'));
        let e0; for (let i=0;i<7;i++){ const e = new THREE.Mesh(new THREE.SphereGeometry(.0028,12,8), ctx.M('#ff7aa8','detail')); e.position.set((R()-.5)*.008, -.02+R()*.04, (R()-.5)*.008); cap.add(e); e0 = e0 || e.position.clone(); }
        ctx.hs('gp120',tip,new V(0,.017,0)); ctx.hs('gp41',tip,new V(.003,.005,0),{side:'l'}); ctx.hs('envoltura',g,new V(-.6,-.4,.7).normalize().multiplyScalar(r+.003));
        ctx.hs('capside',cap,new V(.022,.02,0),{deep:true}); ctx.hs('arn',cap,new V(0,.006,0),{deep:true,side:'l'}); ctx.hs('rt',cap,e0,{deep:true}); ctx.hs('matriz',g,new V(),{deep:true,rim:r*.9});
        return g;
      },
      flu(ctx,R,o){
        const g = new THREE.Group(), r = .05;
        const body = new THREE.Mesh(sphGeo(r,R,.05), ctx.clip(ctx.M(o.hue))); g.add(body); ctx.bodies.push(body);
        g.add(new THREE.Mesh(new THREE.SphereGeometry(r*.92,48,32), ctx.clip(ctx.M('#9fb8ff','detail'))));
        const q = new THREE.Quaternion(), ha = [], na = [], nah = [], m2 = []; let haT, naT, m2T;
        const N = 150; for (let i=0;i<N;i++){ const y = 1-2*(i+.5)/N, rr = Math.sqrt(1-y*y), th = i*2.39996; const d = new V(Math.cos(th)*rr, y, Math.sin(th)*rr); q.setFromUnitVectors(Y,d); const base = d.clone().multiplyScalar(r*.98);
          if (i%37===3){ m2.push(new THREE.Matrix4().compose(base,q,one)); m2T = m2T || base.clone().addScaledVector(d,.004); }
          else if (i%5===0){ na.push(new THREE.Matrix4().compose(base,q,one)); for (const [ox,oz] of [[.0022,.0022],[-.0022,.0022],[.0022,-.0022],[-.0022,-.0022]]) nah.push(new THREE.Matrix4().compose(base.clone().add(new V(ox,.0115,oz).applyQuaternion(q)), q, one)); naT = naT || base.clone().addScaledVector(d,.016); }
          else { ha.push(new THREE.Matrix4().compose(base,q,one)); if (i===61) haT = base.clone().addScaledVector(d,.014); } }
        const hs = new THREE.CylinderGeometry(.0011,.0014,.008,6); hs.translate(0,.004,0); const hh = new THREE.SphereGeometry(.0027,10,8); hh.scale(1,1.6,1); hh.translate(0,.0105,0);
        const ns = new THREE.CylinderGeometry(.0005,.0005,.01,5); ns.translate(0,.005,0);
        const hmS = ctx.clip(ctx.M(shade(o.hue2,-.1),'detail')), hmH = ctx.clip(ctx.M(o.hue2,'detail',{emissiveIntensity:.15})), nmH = ctx.clip(ctx.M('#ffd27a','detail'));
        g.add(ctx.inst(hs,hmS,ha), ctx.inst(hh,hmH,ha), ctx.inst(ns,hmS,na), ctx.inst(new THREE.SphereGeometry(.0021,8,6),nmH,nah), ctx.inst(new THREE.CylinderGeometry(.0013,.0013,.004,6), ctx.clip(ctx.M('#ff7aa8','detail')), m2));
        const rg = new THREE.Group(); rg.rotation.set(.25,0,.35); g.add(rg);
        const pos = [[0,0]]; for (let k=0;k<7;k++){ const a = k/7*Math.PI*2; pos.push([Math.cos(a)*.0105, Math.sin(a)*.0105]); }
        const lens = [.056,.054,.05,.046,.042,.038,.034,.03], np = [], pol = [];
        const core = ctx.M('#ffd36a','detail'); let rnpT, polT;
        pos.forEach(([cx,cz],i) => { const Ls = lens[i]; const c = new THREE.Mesh(new THREE.CylinderGeometry(.0008,.0008,Ls,6), core); c.position.set(cx,0,cz); rg.add(c);
          for (let t=-Ls/2; t<Ls/2; t+=.0028) for (const ph of [0,Math.PI]){ const a = t/.0028*.9+ph; np.push(new THREE.Matrix4().compose(new V(cx+Math.cos(a)*.0024, t, cz+Math.sin(a)*.0024), q.identity(), one)); }
          pol.push(new V(cx,Ls/2+.002,cz)); if (i===1){ rnpT = new V(cx+.003,0,cz); polT = new V(cx,Ls/2+.004,cz); } });
        rg.add(ctx.inst(new THREE.SphereGeometry(.0019,8,6), ctx.M('#6fd3a8','detail'), np));
        const pc = ['#ff8f6b','#ffd27a','#c79cf2'];
        pol.forEach(p => pc.forEach((c,k) => { const b = new THREE.Mesh(new THREE.SphereGeometry(.0024,10,8), ctx.M(c,'detail')); b.position.copy(p).add(new V((k-1)*.0022,0,0)); rg.add(b); }));
        ctx.hs('ha',g,haT); ctx.hs('na',g,naT,{side:'l'}); ctx.hs('m2',g,m2T);
        ctx.hs('rnp',rg,rnpT,{deep:true}); ctx.hs('pol',rg,polT,{deep:true,side:'l'}); ctx.hs('m1',g,new V(),{deep:true,rim:r*.92});
        return g;
      },
      phage(ctx,R,o){
        const g = new THREE.Group();
        const head = new THREE.Mesh(new THREE.IcosahedronGeometry(1,0), ctx.clip(ctx.M(o.hue,'body',{flatShading:true,roughness:.2,clearcoat:1,metalness:.1}))); head.scale.set(.043,.06,.043); head.position.y = .1; g.add(head); ctx.bodies.push(head);
        const tm = ctx.clip(ctx.M(o.hue2,'detail',{roughness:.35})), tm2 = ctx.clip(ctx.M(shade(o.hue2,-.15),'detail'));
        const collar = new THREE.Mesh(new THREE.CylinderGeometry(.017,.014,.008,16), tm2); collar.position.y = .036; g.add(collar);
        const sheath = new THREE.Mesh(new THREE.CylinderGeometry(.011,.011,.095,20), tm); sheath.position.y = -.015; g.add(sheath); ctx.bodies.push(sheath);
        for (let i=0;i<14;i++){ const t = new THREE.Mesh(new THREE.TorusGeometry(.0115,.0016,6,24), tm2); t.rotation.x = Math.PI/2; t.position.y = .03-i*.0068; g.add(t); }
        const tube = new THREE.Mesh(new THREE.CylinderGeometry(.0045,.0045,.1,12), ctx.M('#ffe7a3','detail')); tube.position.y = -.016; g.add(tube);
        const plate = new THREE.Mesh(new THREE.CylinderGeometry(.026,.021,.009,6), ctx.M(shade(o.hue2,-.15),'detail')); plate.position.y = -.067; g.add(plate); ctx.bodies.push(plate);
        const fm = ctx.M(shade(o.hue2,.05),'app'); let k0;
        for (let i=0;i<6;i++){ const a = i/6*Math.PI*2+.26, dx = Math.cos(a), dz = Math.sin(a);
          const p0 = new V(dx*.024,-.067,dz*.024), p1 = p0.clone().add(new V(dx*.052,.03,dz*.052)), p2 = p1.clone().add(new V(dx*.035,-.085,dz*.035));
          const cp = new THREE.CurvePath(); cp.add(new THREE.LineCurve3(p0,p1)); cp.add(new THREE.LineCurve3(p1,p2));
          g.add(new THREE.Mesh(new THREE.TubeGeometry(cp,24,.0017,6,false), fm)); if (i===1) k0 = p1;
          const pin = new THREE.Mesh(new THREE.ConeGeometry(.003,.012,6), plate.material); pin.position.set(dx*.018,-.076,dz*.018); pin.rotation.x = Math.PI; g.add(pin); }
        const dp = []; for (let L=0; L<5; L++){ const rad = .031-L*.0055, up = L%2===0; for (let k=0;k<=168;k++){ const t = k/168, a = t*6*Math.PI*2; dp.push(new V(Math.cos(a)*rad, up ? .068+t*.064 : .132-t*.064, Math.sin(a)*rad)); } }
        g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dp), dp.length*2, .0014, 5, false), ctx.M('#ffd36a','detail')));
        ctx.hs('cabeza',g,new V(.045,.12,.01)); ctx.hs('vaina',g,new V(.013,-.01,.004)); ctx.hs('fibras',g,k0.clone().add(new V(0,.004,0))); ctx.hs('placa',g,new V(-.027,-.067,.01),{side:'l'});
        ctx.hs('adn',g,new V(.031,.1,0),{deep:true}); ctx.hs('tubo',g,new V(.0047,-.03,0),{deep:true}); ctx.hs('cuello',g,new V(-.017,.036,0),{deep:true,side:'l'});
        return g;
      }
    };
  };
})(window.ATLAS);
