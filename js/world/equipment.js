import * as THREE from 'three';

export class EquipmentBuilder {
  constructor(scene) {
    this.scene = scene;
    this.interactiveEquipments = [];
    this.animatedOscilloscope = null;
    this.animatedLaser = null;
  }

  build() {
    const equipGroup = new THREE.Group();

    // 1. DIGITAL OSCILLOSCOPE & POWER SUPPLY (At Table #7: X = -2.0, Z = 1.9)
    const oscStation = this.createOscilloscopeStation();
    oscStation.position.set(-2.0, 0.8, 1.9);
    equipGroup.add(oscStation);
    this.interactiveEquipments.push(oscStation);

    // 2. OPTICAL BENCH, LASER & PRISM (At Table #5: X = -2.0, Z = 3.8)
    const opticsStation = this.createOpticsStation();
    opticsStation.position.set(-2.0, 0.8, 3.8);
    equipGroup.add(opticsStation);
    this.interactiveEquipments.push(opticsStation);

    // 3. DYNAMICS PRECISION TRACK & TICKER TIMER (At Table #1: X = -2.0, Z = -3.8)
    const mechanicsStation = this.createMechanicsStation();
    mechanicsStation.position.set(-2.0, 0.8, -3.8);
    equipGroup.add(mechanicsStation);
    this.interactiveEquipments.push(mechanicsStation);

    // 4. JOULE CALORIMETER & THERMODYNAMICS (At Table #9: X = 2.0, Z = 3.8)
    const thermoStation = this.createThermodynamicsStation();
    thermoStation.position.set(2.0, 0.8, 3.8);
    equipGroup.add(thermoStation);
    this.interactiveEquipments.push(thermoStation);

    // 5. DEMONSTRATION MULTIMETER & RHEOSTAT (At Teacher Desk: X = -0.7, Z = -5.8)
    const demoEquip = this.createDemoApparatus();
    demoEquip.position.set(-0.7, 0.15 + 0.85, -5.8);
    equipGroup.add(demoEquip);
    this.interactiveEquipments.push(demoEquip);

    this.scene.add(equipGroup);
    return equipGroup;
  }

  createOscilloscopeStation() {
    const group = new THREE.Group();

    // Bench main body (Oscilloscope chassis)
    const bodyGeo = new THREE.BoxGeometry(0.38, 0.22, 0.26);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(-0.4, 0.11, 0);
    body.castShadow = true;
    group.add(body);

    // Oscilloscope Screen (Live Animated CanvasTexture!)
    const oscCanvas = document.createElement('canvas');
    oscCanvas.width = 256;
    oscCanvas.height = 192;
    const oscCtx = oscCanvas.getContext('2d');

    const oscTexture = new THREE.CanvasTexture(oscCanvas);
    const screenGeo = new THREE.PlaneGeometry(0.24, 0.16);
    const screenMat = new THREE.MeshBasicMaterial({ map: oscTexture });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.set(-0.45, 0.12, 0.132);
    group.add(screen);

    this.animatedOscilloscope = {
      canvas: oscCanvas,
      ctx: oscCtx,
      texture: oscTexture,
      time: 0,
      frequency: 2,
      amplitude: 50,
      waveType: 'sine'
    };

    // Rotary Knobs on Oscilloscope
    const knobGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.02, 12);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });

    [-0.27, -0.24].forEach((kx, i) => {
      [0.08, 0.14].forEach((ky, j) => {
        const knob = new THREE.Mesh(knobGeo, knobMat);
        knob.rotation.x = Math.PI / 2;
        knob.position.set(kx, ky, 0.135);
        group.add(knob);
      });
    });

    // DC Power Supply next to oscilloscope
    const psGeo = new THREE.BoxGeometry(0.28, 0.18, 0.22);
    const psMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5 });
    const ps = new THREE.Mesh(psGeo, psMat);
    ps.position.set(0.3, 0.09, 0);
    group.add(ps);

    // Digital readout for 12.00 V
    const psCanvas = document.createElement('canvas');
    psCanvas.width = 128;
    psCanvas.height = 64;
    const psCtx = psCanvas.getContext('2d');
    psCtx.fillStyle = '#022c22';
    psCtx.fillRect(0, 0, 128, 64);
    psCtx.fillStyle = '#10b981';
    psCtx.font = 'bold 24px monospace';
    psCtx.fillText('12.00 V', 12, 38);
    psCtx.font = 'bold 14px monospace';
    psCtx.fillText('0.85 A', 12, 56);
    const psTex = new THREE.CanvasTexture(psCanvas);
    const psDisplay = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), new THREE.MeshBasicMaterial({ map: psTex }));
    psDisplay.position.set(0.3, 0.12, 0.112);
    group.add(psDisplay);

    group.userData = {
      id: 'oscilloscope',
      type: 'equipment',
      name: 'Osiloskop Digital Dual Channel & Catu Daya',
      category: 'Kit Listrik & Elektronika',
      description: 'Instrumen visualisasi bentuk gelombang listrik AC/DC, pengukuran frekuensi, periode, dan tegangan puncak-ke-puncak (Vp-p). Dilengkapi catu daya DC stabil 0–12V.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir C (Peralatan Pendidikan Fisika).'
    };

    return group;
  }

  createOpticsStation() {
    const group = new THREE.Group();

    // 1. Precision Optical Rail (1.2m long)
    const railGeo = new THREE.BoxGeometry(1.4, 0.03, 0.08);
    const railMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.set(0, 0.015, 0);
    rail.castShadow = true;
    group.add(rail);

    // 2. Red Diode Laser Source (at -0.6m on rail)
    const laserBodyGeo = new THREE.BoxGeometry(0.12, 0.08, 0.08);
    const laserMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.5 });
    const laserSource = new THREE.Mesh(laserBodyGeo, laserMat);
    laserSource.position.set(-0.55, 0.07, 0);
    group.add(laserSource);

    // 3. Triangular Glass Prism (at 0m on rail)
    const prismGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.12, 3);
    const prismMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.92,
      opacity: 0.7,
      transparent: true,
      roughness: 0.05,
      ior: 1.52
    });
    const prism = new THREE.Mesh(prismGeo, prismMat);
    prism.position.set(0, 0.09, 0);
    prism.rotation.y = Math.PI / 6;
    group.add(prism);

    // 4. Incident Red Laser Beam (Glowing line from laser to prism)
    const beamMat = new THREE.LineBasicMaterial({ color: 0xff0044, linewidth: 3 });
    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.49, 0.07, 0),
      new THREE.Vector3(0, 0.07, 0)
    ]);
    const incidentBeam = new THREE.Line(beamGeo, beamMat);
    group.add(incidentBeam);

    // 5. Refracted / Split Rainbow Beams exiting the prism!
    const colors = [0xff0000, 0xff7700, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0x8b00ff];
    colors.forEach((c, idx) => {
      const angle = (idx - 3) * 0.035;
      const endX = 0.55;
      const endZ = 0.15 + angle * 1.2;

      const splitGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0.07, 0),
        new THREE.Vector3(endX, 0.07, endZ)
      ]);
      const splitLine = new THREE.Line(splitGeo, new THREE.LineBasicMaterial({ color: c }));
      group.add(splitLine);
    });

    // 6. Projection Screen at End (+0.55m)
    const scrGeo = new THREE.BoxGeometry(0.02, 0.18, 0.35);
    const scrMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
    const scr = new THREE.Mesh(scrGeo, scrMat);
    scr.position.set(0.55, 0.11, 0.15);
    group.add(scr);

    group.userData = {
      id: 'optics',
      type: 'equipment',
      name: 'Bangku Optik Presisi & Percobaan Prisma Laser',
      category: 'Kit Optik & Gelombang',
      description: 'Digunakan untuk menyelidiki hukum pembiasan cahaya Snellius, dispersi prisma menghasilkan spektrum pelangi, dan penentuan sudut deviasi minimum.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir C (Alat Percobaan Optik).'
    };

    return group;
  }

  createMechanicsStation() {
    const group = new THREE.Group();

    // 1. Dynamics Track Rail (1.2m)
    const trackGeo = new THREE.BoxGeometry(1.3, 0.04, 0.12);
    const trackMat = new THREE.MeshStandardMaterial({ color: 0xc084fc, metalness: 0.8, roughness: 0.3 });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.position.set(0, 0.02, 0);
    track.castShadow = true;
    group.add(track);

    // 2. Dynamics Cart
    const cartGeo = new THREE.BoxGeometry(0.2, 0.06, 0.1);
    const cartMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const cart = new THREE.Mesh(cartGeo, cartMat);
    cart.position.set(-0.1, 0.07, 0);
    cart.castShadow = true;
    group.add(cart);

    // Cart wheels
    const wheelGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    [[-0.16, -0.05], [-0.16, 0.05], [-0.04, -0.05], [-0.04, 0.05]].forEach(wp => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wp[0], 0.04, wp[1]);
      group.add(wheel);
    });

    // 3. Ticker Timer at -0.55m
    const timerGeo = new THREE.BoxGeometry(0.1, 0.08, 0.08);
    const timerMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const timer = new THREE.Mesh(timerGeo, timerMat);
    timer.position.set(-0.55, 0.06, 0);
    group.add(timer);

    // Paper Tape connecting timer to cart
    const tapeGeo = new THREE.PlaneGeometry(0.45, 0.015);
    const tapeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const tape = new THREE.Mesh(tapeGeo, tapeMat);
    tape.rotation.x = Math.PI / 2;
    tape.position.set(-0.32, 0.06, 0);
    group.add(tape);

    // 4. Pulley & Hanging Slotted Mass at +0.65m
    const pulleyGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.015, 16);
    const pulley = new THREE.Mesh(pulleyGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 }));
    pulley.rotation.x = Math.PI / 2;
    pulley.position.set(0.66, 0.05, 0);
    group.add(pulley);

    const stringLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.0, 0.07, 0),
        new THREE.Vector3(0.66, 0.07, 0),
        new THREE.Vector3(0.66, -0.15, 0)
      ]),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    group.add(stringLine);

    const massGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.05, 12);
    const mass = new THREE.Mesh(massGeo, new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9 }));
    mass.position.set(0.66, -0.18, 0);
    group.add(mass);

    group.userData = {
      id: 'mechanics',
      type: 'equipment',
      name: 'Rel Dinamika Presisi & Pewaktu Ketik (Ticker Timer)',
      category: 'Kit Mekanika',
      description: 'Eksperimen pembuktian Hukum II Newton (F = m·a), Gerak Lurus Beraturan (GLB), dan GLBB dengan rekaman pita ketik 50 Hz.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir C (Alat Percobaan Mekanika).'
    };

    return group;
  }

  createThermodynamicsStation() {
    const group = new THREE.Group();

    // 1. Joule Calorimeter Double Wall Cylinder
    const outerGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.18, 20);
    const outerMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
    const outerVessel = new THREE.Mesh(outerGeo, outerMat);
    outerVessel.position.set(-0.2, 0.09, 0);
    outerVessel.castShadow = true;
    group.add(outerVessel);

    // Lid & Stirrer
    const lidGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.02, 20);
    const lid = new THREE.Mesh(lidGeo, new THREE.MeshStandardMaterial({ color: 0x334155 }));
    lid.position.set(-0.2, 0.19, 0);
    group.add(lid);

    // Thermometer Probe sticking out of lid
    const probeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.22, 10);
    const probe = new THREE.Mesh(probeGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
    probe.position.set(-0.23, 0.26, 0);
    group.add(probe);

    // 2. Set of Metal Cylinders (Copper, Aluminium, Brass)
    const metals = [
      { color: 0xb45309, name: "Tembaga (Cu)", x: 0.1 },
      { color: 0xd1d5db, name: "Aluminium (Al)", x: 0.2 },
      { color: 0xeab308, name: "Kuningan (Brass)", x: 0.3 }
    ];

    metals.forEach(m => {
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.07, 16),
        new THREE.MeshStandardMaterial({ color: m.color, metalness: 0.9, roughness: 0.2 })
      );
      cyl.position.set(m.x, 0.035, 0);
      group.add(cyl);
    });

    group.userData = {
      id: 'thermo',
      type: 'equipment',
      name: 'Kalorimeter Joule & Silinder Kalor Jenis',
      category: 'Kit Termofisika',
      description: 'Eksperimen Asas Black, pengukuran pertukaran kalor Q_lepas = Q_terima, penentuan kalor jenis berbagai logam, dan tara kalor mekanik.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV Butir C (Alat Percobaan Kalor).'
    };

    return group;
  }

  createDemoApparatus() {
    const group = new THREE.Group();

    // High Precision Digital Multimeter on Teacher Desk
    const mmGeo = new THREE.BoxGeometry(0.12, 0.04, 0.2);
    const mmMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const mm = new THREE.Mesh(mmGeo, mmMat);
    mm.position.set(0, 0.02, 0);
    group.add(mm);

    // Rheostat (Slide Wire Resistor)
    const rheoGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 16);
    const rheo = new THREE.Mesh(rheoGeo, new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 }));
    rheo.rotation.z = Math.PI / 2;
    rheo.position.set(0.3, 0.04, 0);
    group.add(rheo);

    group.userData = {
      id: 'demo_kit',
      type: 'equipment',
      name: 'Multimeter Demonstrasi Guru & Hambatan Geser',
      category: 'Stasiun Guru',
      description: 'Multimeter layar besar untuk demonstrasi pengukuran arus dan tegangan kelas, serta hambatan geser untuk memvariasikan arus eksperimen.',
      regulationCitation: 'Permendikbud No. 24/2007 Lampiran IV (Peralatan Demonstrasi Guru).'
    };

    return group;
  }

  update(delta) {
    // Update live waveform on oscilloscope
    if (this.animatedOscilloscope) {
      const osc = this.animatedOscilloscope;
      osc.time += delta * osc.frequency * 8;
      const ctx = osc.ctx;
      const w = osc.canvas.width;
      const h = osc.canvas.height;

      // Dark oscilloscope green CRT background with grid
      ctx.fillStyle = '#011a11';
      ctx.fillRect(0, 0, w, h);

      // CRT Grid (10x8 divisions)
      ctx.strokeStyle = '#044326';
      ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 25.6) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Live Oscilloscope Waveform Line
      ctx.strokeStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const midY = h / 2;
      for (let x = 0; x < w; x++) {
        let y = midY;
        if (osc.waveType === 'sine') {
          y = midY + Math.sin((x * 0.05) + osc.time) * osc.amplitude;
        } else if (osc.waveType === 'square') {
          y = midY + (Math.sin((x * 0.05) + osc.time) > 0 ? osc.amplitude : -osc.amplitude);
        } else if (osc.waveType === 'triangle') {
          y = midY + (Math.asin(Math.sin((x * 0.05) + osc.time)) * (2 / Math.PI)) * osc.amplitude;
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Status text
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`CH1: ${(osc.amplitude * 0.1).toFixed(1)}V/DIV  ${(osc.frequency * 50).toFixed(0)}Hz`, 8, 16);

      osc.texture.needsUpdate = true;
    }
  }
}
