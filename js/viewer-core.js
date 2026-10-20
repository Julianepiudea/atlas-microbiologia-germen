/* Atlas de Microbiología GERMEN · visor 3D: escena, cámara, zoom a vista molecular, etiquetas y escala */
(function (A) {
  A.createViewer = function (L, ui) {
    const {THREE, OrbitControls, RoomEnvironment, mergeVertices} = L;
    const V = THREE.Vector3, Z = new V(0,0,1), Y = new V(0,1,0);
    const {stage, cw, hsl, hint, scaleBar, scaleTxt, stTop, stBot} = ui.els;
    const state = ui.state, reduce = ui.reduce;

    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true, powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
    cw.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
    const camera = new THREE.PerspectiveCamera(35, 1, .05, 120);
    const controls = new OrbitControls(camera, renderer.domElement);
    Object.assign(controls, {enableDamping:true, dampingFactor:.08, enablePan:false, minDistance:2.6, maxDistance:18, autoRotate:state.rotate, autoRotateSpeed:.7, rotateSpeed:.8});
    scene.add(new THREE.HemisphereLight(0xe2f8ff, 0x0b1a1f, .55));
    const key = new THREE.DirectionalLight(0xffffff, 1.7); key.position.set(4,6,5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x6ef0c6, 1.3); rim.position.set(-5,-2,-6); scene.add(rim);
    const root = new THREE.Group(); scene.add(root);
    const clipPlane = new THREE.Plane(new V(0,0,-1), 4);

    /* utilidades compartidas con los constructores */
    const dot = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const gr = g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.4,'rgba(255,255,255,.35)'); gr.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0,0,64,64); return new THREE.CanvasTexture(c); })();
    const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const hashStr = s => [...s].reduce((h,c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261);
    const ru = R => { const u = R()*2-1, t = R()*Math.PI*2, s = Math.sqrt(1-u*u); return new V(s*Math.cos(t), u, s*Math.sin(t)); };
    const shade = (h, l=-.12, s=-.05) => '#' + new THREE.Color(h).offsetHSL(0, s, l).getHexString();
    function wob(geo, amp, f, s=0){ const p = geo.attributes.position, n = geo.attributes.normal; for (let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const d = amp*(Math.sin(x*f+s)+Math.sin(y*f*1.31+s*1.7)+Math.sin(z*f*.83+s*2.3))/3; p.setXYZ(i, x+n.getX(i)*d, y+n.getY(i)*d, z+n.getZ(i)*d); } return geo; }
    function bend(geo, c){ const p = geo.attributes.position; for (let i=0;i<p.count;i++){ const y = p.getY(i); p.setX(i, p.getX(i)+c*y*y); } return geo; }
    function smooth(geo){ geo.deleteAttribute('normal'); geo.deleteAttribute('uv'); const g = mergeVertices(geo, 1e-6); g.computeVertexNormals(); return g; }
    const rodGeo = (len, r, R, c=0) => { const g = wob(new THREE.CapsuleGeometry(r, len, 12, 32), r*.035, 2.2/r, R()*10); if (c) bend(g, c); return smooth(g); };
    const sphGeo = (r, R, a=.03) => smooth(wob(new THREE.SphereGeometry(r, 48, 32), r*a, 2.5/r, R()*10));
    function rodPoint(len, r, R){ const side = 2*Math.PI*r*len, cap = 4*Math.PI*r*r; if (R()*(side+cap) < side){ const y=(R()-.5)*len, t=R()*Math.PI*2, n=new V(Math.cos(t),0,Math.sin(t)); return {p:new V(r*n.x,y,r*n.z), n}; } const n = ru(R), s = n.y>=0?1:-1; return {p:new V(n.x*r, n.y*r+s*len/2, n.z*r), n}; }
    class Helix extends THREE.Curve { constructor(L,a,lam){ super(); this.L=L; this.a=a; this.lam=lam; } getPoint(t, v=new V()){ const r=this.a*Math.min(1,t*4), w=2*Math.PI*t*this.L/this.lam; return v.set(r*Math.cos(w), r*Math.sin(w), t*this.L); } }
    class HelixY extends THREE.Curve { constructor(a,turns,len,ph=0){ super(); this.a=a; this.turns=turns; this.len=len; this.ph=ph; } getPoint(t, v=new V()){ const w=t*this.turns*2*Math.PI+this.ph; return v.set(this.a*Math.cos(w), (t-.5)*this.len, this.a*Math.sin(w)); } }

    function makeCtx(){
      const ctx = {mats:[], spin:[], anchors:[], bodies:[], decor:[]};
      ctx.M = (color, role='body', extra={}) => { const c = new THREE.Color(color); const m = new THREE.MeshPhysicalMaterial({color:c, roughness:.42, clearcoat:.6, clearcoatRoughness:.3, sheen:.5, sheenRoughness:.5, sheenColor:c.clone(), emissive:c.clone(), emissiveIntensity:.07, ...extra}); m.userData = {role, base:c.clone(), op:m.opacity, tr:m.transparent}; ctx.mats.push(m); return m; };
      ctx.shell = color => ctx.M(color, 'capsule', {transparent:true, opacity:.17, depthWrite:false, roughness:.12, clearcoat:1, sheen:0, emissiveIntensity:.12});
      ctx.clip = m => { m.clippingPlanes = [clipPlane]; m.side = THREE.DoubleSide; return m; };
      ctx.hs = (key, obj, p, opt={}) => ctx.anchors.push({key, obj, p, side:opt.side||'r', deep:!!opt.deep, rim:opt.rim});
      ctx.flag = (L, a, lam, th, mat, R) => { const curve = new Helix(L,a,lam); const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(48, Math.round(L/lam*30)), th, 6, false), mat); mesh.userData.speed = (R()>.5?1:-1)*(7+R()*4); const holder = new THREE.Group(); holder.add(mesh); ctx.spin.push(mesh); return {holder, mesh, curve}; };
      ctx.place = (o, p, n, up=Z) => { o.position.copy(p); o.quaternion.setFromUnitVectors(up, n.clone().normalize()); return o; };
      ctx.pili = (parent, samples, len, r, mat, R) => { const geo = new THREE.CylinderGeometry(r*.7, r, len, 5, 1, true); geo.translate(0, len/2, 0); const im = new THREE.InstancedMesh(geo, mat, samples.length); const q = new THREE.Quaternion(), s = new V(), m4 = new THREE.Matrix4(); samples.forEach((sm,i) => { q.setFromUnitVectors(Y, sm.n.clone().normalize()); s.set(1, .65+R()*.7, 1); m4.compose(sm.p, q, s); im.setMatrixAt(i, m4); }); parent.add(im); return im; };
      ctx.inst = (geo, mat, list) => { const im = new THREE.InstancedMesh(geo, mat, list.length); list.forEach((m,i) => im.setMatrixAt(i, m)); return im; };
      return ctx;
    }

    const T = {THREE, V, Y, Z, ru, shade, wob, bend, smooth, rodGeo, sphGeo, rodPoint, Helix, HelixY, dot};
    const B = Object.assign({}, A.organismBuilders1(T), A.organismBuilders2(T));
    const WALL = A.wallBuilders(T);

    /* polvo en suspensión */
    const dustGeo = new THREE.BufferGeometry(), dp = [];
    for (let i=0;i<520;i++){ const u=Math.random()*2-1, t=Math.random()*Math.PI*2, r=4+Math.random()*9, s=Math.sqrt(1-u*u); dp.push(s*Math.cos(t)*r, u*r*.7, s*Math.sin(t)*r); }
    dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
    const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({size:.07, map:dot, transparent:true, opacity:.5, depthWrite:false, color:0x6ef0c6}));
    scene.add(dust);

    let cur = null, W = 1, H = 1, frame = 0, camGoal = null, cut = 4, cutGoal = 4, busy = false, coolUntil = 0, lastD = 0, topR = 90, botR = 90;
    const ray = new THREE.Raycaster(), tmp = new V(), tmp2 = new V();
    const ENTER = 2.95, EXIT = 13.5;

    function dispose(o){ o.traverse(n => { n.geometry?.dispose(); const m = n.material; if (m) (Array.isArray(m)?m:[m]).forEach(x => x.dispose()); }); }
    function homeDist(){ const t = Math.tan(THREE.MathUtils.degToRad(camera.fov/2)), band = Math.max(140, H-topR-botR), Rr = 2.4*1.08; return Math.max(5.2, Rr*H/(t*band), Rr*H/(t*Math.max(200, W-32))); }
    function reframe(){
      topR = stTop.offsetHeight + 26; botR = stBot.offsetHeight + 26;
      stage.style.setProperty('--botR', botR + 'px');
      const center = (topR + (H - botR)) / 2;
      camera.setViewOffset(W, H, 0, H/2 - center, W, H); camera.updateProjectionMatrix();
    }
    function reset(){
      camGoal = null; controls.target.set(0,0,0);
      const d = homeDist();
      if (cur && cur.wallScene) camera.position.set(d*.34, d*.3, d*.89); else camera.position.set(0, .9, d);
      controls.update(); lastD = camera.position.distanceTo(controls.target);
    }

    function build(o, deep){
      if (cur){ root.remove(cur.holder); dispose(cur.holder); }
      const ctx = makeCtx(), R = rng(hashStr(o.id + (deep?'w':'')));
      let g, units = 'um', info = o.hs, wallScene = false;
      if (deep && o.wall !== 'cut'){ g = WALL[o.wall](ctx, R, o, o.wallOpt||{}); units = 'nm'; info = A.WALL_INFO[o.wall]; wallScene = true; }
      else g = B[o.id](ctx, R, o);
      const sph = new THREE.Box3().setFromObject(g).getBoundingSphere(new THREE.Sphere());
      const k = 2.4/sph.radius, holder = new THREE.Group(); g.position.sub(sph.center); holder.add(g); holder.scale.setScalar(k); root.add(holder);
      holder.updateMatrixWorld(true);
      cur = {holder, ctx, k: units==='nm' ? k*1000 : k, o, info, wallScene};
      hsl.innerHTML = '';
      cur.els = ctx.anchors.map(a => {
        const t = (info[a.key] || ['', ''])[0];
        const b = document.createElement('button'); b.type = 'button'; b.className = 'hs' + (a.side==='l' ? ' l' : ''); b.dataset.key = a.key; b.setAttribute('aria-label', t);
        b.innerHTML = `<span class="hs-in"><span class="hs-dot"></span><span class="hs-tag">${t}</span></span>`;
        b.onclick = () => { ui.onHs(a.key); focus(a.key); };
        hsl.appendChild(b); return b;
      });
      applyStain(state.stain && !wallScene);
      cut = cutGoal = (state.deep && o.wall === 'cut') ? 0 : 4;
      reset();
    }
    function load(o){ build(o, false); }

    function applyStain(on){
      if (!cur) return; const s = cur.o.stain, sc = new THREE.Color(s.color);
      cur.ctx.mats.forEach(m => { const u = m.userData;
        if (!on){ m.color.copy(u.base); m.emissive.copy(u.base); m.emissiveIntensity = u.role==='capsule' ? .12 : u.role==='w' ? .1 : .07; m.opacity = u.op; m.transparent = u.tr; }
        else if (u.role === 'capsule'){ m.color.set('#ffffff'); m.emissive.set('#ffffff'); m.opacity = .1; }
        else {
          const c = new THREE.Color(s.roles?.[u.role] || (u.role==='detail' ? (s.detail || s.color) : s.color));
          if (u.role==='detail' && !s.detail) c.offsetHSL(0,0,.12);
          m.color.copy(c); m.emissive.copy(c); m.emissiveIntensity = s.dark ? .55 : s.bg==='em' ? .04 : .02;
          if (u.role==='app' && s.bg!=='em'){ m.transparent = true; m.opacity = .14; } else { m.opacity = u.op; m.transparent = u.tr; }
        }
        m.needsUpdate = true; });
      cur.ctx.decor.forEach(d => d.visible = !on);
      dust.visible = !on || s.dark || s.bg === 'em';
    }

    function setDeep(on, focusKey){
      if (!cur || busy || on === state.deep) return;
      const o = cur.o;
      state.deep = on; coolUntil = performance.now() + 1400; ui.onDeepChange();
      if (o.wall === 'cut'){
        cutGoal = on ? 0 : 4;
        if (on){ const dir = camera.position.clone().sub(controls.target).normalize(); camGoal = controls.target.clone().add(dir.multiplyScalar(homeDist()*.85)); }
        if (focusKey) focus(focusKey);
        return;
      }
      busy = true; cw.classList.add('defocus');
      setTimeout(() => {
        build(o, on); busy = false;
        requestAnimationFrame(() => requestAnimationFrame(() => cw.classList.remove('defocus')));
        if (focusKey) focus(focusKey);
      }, reduce ? 0 : 260);
    }

    function anchorWorld(a, out){
      if (a.rim){
        const c = a.obj.localToWorld(new V()), e = a.obj.localToWorld(new V(a.rim,0,0)), wr = c.distanceTo(e);
        const right = new V(1,0,0).applyQuaternion(camera.quaternion), up = new V(0,1,0).applyQuaternion(camera.quaternion);
        return out.copy(c).addScaledVector(right, wr*Math.cos(.45)).addScaledVector(up, wr*Math.sin(.45));
      }
      return a.obj.localToWorld(out.copy(a.p));
    }
    function focus(key){
      if (!cur) return;
      const a = cur.ctx.anchors.find(x => x.key === key);
      if (!a){ if (state.deep) setDeep(false, key); return; }
      if (a.deep && !state.deep && cur.o.wall === 'cut'){ setDeep(true, key); return; }
      anchorWorld(a, tmp);
      const d = camera.position.distanceTo(controls.target), dir = tmp.clone().sub(controls.target);
      if (dir.lengthSq() < 1e-6) dir.set(0,0,1);
      camGoal = controls.target.clone().add(dir.normalize().multiplyScalar(d).add(new V(0,.25,0)));
      state.rotate = false; controls.autoRotate = false; ui.onRotate(false);
    }

    function theme(){ const a = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6ef0c6'; dust.material.color.set(a); rim.color.set(a); }
    theme();

    const NICE = [.001,.002,.005,.01,.02,.05,.1,.2,.5,1,2,5,10,20,50];
    let lastScale = '', lastHint = null;
    function overlay(){
      if (!cur) return;
      const d = camera.position.distanceTo(controls.target), ppw = H/(2*d*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))), ppu = ppw*cur.k;
      let best = NICE[0]; for (const n of NICE) if (n*ppu <= 140) best = n;
      const lbl = best < 1 ? `${Math.round(best*1000)} nm` : `${best} µm`, w = Math.round(best*ppu);
      if (lbl+w !== lastScale){ scaleBar.style.width = w + 'px'; scaleTxt.textContent = lbl; lastScale = lbl + w; }
      const o = cur.o, verb = o.wall==='cut' ? 'abrir el virión' : (o.wall==='proto'||o.wall==='knob') ? 'ver la membrana' : 'ver la pared celular';
      let h = '';
      if (state.deep) h = o.wall==='cut' ? 'Interior del virión · aleja para cerrarlo' : 'Vista molecular · aleja para volver a la célula';
      else if (d < 4.8) h = `Sigue acercando para ${verb}`;
      if (!ui.cardOpen() && h !== lastHint){ hint.textContent = h; hint.hidden = !h; lastHint = h; }
      if (ui.cardOpen() && !hint.hidden){ hint.hidden = true; lastHint = null; }
      const check = frame % 6 === 0, occl = !state.deep && cur.ctx.bodies.length;
      cur.ctx.anchors.forEach((a, i) => {
        const el = cur.els[i], show = cur.wallScene || a.deep === state.deep;
        if (el.hidden === show) el.hidden = !show;
        if (!show) return;
        anchorWorld(a, tmp); tmp2.copy(tmp).project(camera);
        el.style.transform = `translate(${((tmp2.x*.5+.5)*W).toFixed(1)}px,${((-tmp2.y*.5+.5)*H).toFixed(1)}px)`;
        if (check){ let hid = tmp2.z > 1; if (!hid && occl){ const dir = tmp.clone().sub(camera.position), dist = dir.length(); ray.set(camera.position, dir.normalize()); const hh = ray.intersectObjects(cur.ctx.bodies, false); hid = hh.length > 0 && hh[0].distance < dist - .06; } el.classList.toggle('hid', hid); }
      });
    }

    function resize(){ W = stage.clientWidth; H = stage.clientHeight; renderer.setSize(W, H, false); camera.aspect = W/Math.max(1,H); reframe(); }
    new ResizeObserver(resize).observe(stage); resize();
    controls.addEventListener('start', () => { camGoal = null; });

    const clock = new THREE.Clock(), camDir = new V();
    (function loop(){
      requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), .05); frame++;
      if (!reduce && cur){ cur.ctx.spin.forEach(m => m.rotation.z += dt*m.userData.speed); dust.rotation.y += dt*.012; if (!cur.wallScene) cur.holder.position.y = Math.sin(clock.elapsedTime*.8)*.04; }
      if (camGoal){ camera.position.lerp(camGoal, 1-Math.pow(.02, dt)); if (camera.position.distanceTo(camGoal) < .01) camGoal = null; }
      cut += (cutGoal - cut) * (1 - Math.pow(.05, dt));
      camDir.copy(camera.position).sub(controls.target).normalize();
      clipPlane.normal.copy(camDir).negate(); clipPlane.constant = cut;
      controls.update();
      const d = camera.position.distanceTo(controls.target), now = performance.now();
      if (cur && !camGoal && !busy && now > coolUntil){
        if (!state.deep && d < ENTER && d < lastD - 1e-4) setDeep(true);
        else if (state.deep && d > EXIT && d > lastD + 1e-4) setDeep(false);
      }
      lastD = d;
      renderer.render(scene, camera); overlay();
    })();

    return {load, stain:applyStain, rotate:on => { controls.autoRotate = on; }, reset, focus, theme, setDeep, reframe,
      info: key => cur?.info?.[key], isWall: () => !!cur?.wallScene};
  };
})(window.ATLAS);
