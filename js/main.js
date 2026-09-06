import * as THREE from 'three';
import { EngineScene } from './engine/scene.js';
import { LightingSystem } from './engine/lighting.js';
import { ControllerManager } from './engine/controls.js';
import { RoomBuilder } from './world/room.js';
import { FurnitureBuilder } from './world/furniture.js';
import { EquipmentBuilder } from './world/equipment.js';
import { SafetyBuilder } from './world/safety.js';
import { MarkerManager } from './world/markers.js';
import { audioManager } from './ui/audio.js';

class PhysicsLabApp {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this._prev = performance.now();
    this._frame = 0;
    this._nearbyData = null;

    this._showLoad(true);
    try {
      this._init();
      this._showLoad(false);
    } catch(e) {
      console.error('[Lab]', e);
      this._showLoad(false);
    }
  }

  _showLoad(v) {
    const el = document.getElementById('loading-overlay');
    if (el) el.style.display = v ? 'flex' : 'none';
  }

  _init() {
    this.engine   = new EngineScene(this.canvas);
    this.lighting = new LightingSystem(this.engine.scene);
    this.controls = new ControllerManager(this.engine.camera, this.canvas, this.engine.scene);

    // Build world
    try { new RoomBuilder(this.engine.scene).build(); } catch(e) { console.warn('Room:', e); }
    try {
      this.furniture = new FurnitureBuilder(this.engine.scene, this.controls);
      this.furniture.build();
    } catch(e) { console.warn('Furniture:', e); }
    try {
      this.equipment = new EquipmentBuilder(this.engine.scene);
      this.equipment.build();
    } catch(e) { console.warn('Equipment:', e); }
    try {
      this.safety = new SafetyBuilder(this.engine.scene, this.controls);
      this.safety.build();
    } catch(e) { console.warn('Safety:', e); }

    // Markers
    this.markers = new MarkerManager(this.engine.scene, this.engine.camera);
    this._addHotspots();

    // UI refs
    this.fpsEl        = null;
    this.coordsEl     = document.getElementById('coords-display');
    this.radarCtx     = document.getElementById('radar-canvas')?.getContext('2d');

    this._bindButtons();
    this._setupFps();
    setInterval(() => this._nearbyCheck(), 220);
    this._animate();
  }

  _addHotspots() {
    const add = (id, title, pos, desc, icon = '🔬') =>
      this.markers.addMarker(id, title, pos, { title, desc, icon });

    add('demo',        'Meja Demonstrasi Guru',     {x:0,    y:1.12,z:-5.8}, 'Panggung elevasi 15cm · catu daya sentral · wastafel demo · 2.8m × 0.9m', '👨‍🏫');
    add('mechanics',   'Rel Dinamika & Ticker Timer',{x:-2,   y:1.12,z:-3.8}, 'Hukum Newton II (F=ma) · GLB & GLBB · Pita ketik 50Hz · Beban gantung variabel', '⚙️');
    add('oscilloscope','Osiloskop Digital + PSU',   {x:-2,   y:1.12,z:1.9 }, 'Dual Channel · 0–12V DC · Ukur frekuensi, periode & Vp-p · AC/DC waveform', '📈');
    add('optics',      'Bangku Optik & Laser Prisma',{x:-2,  y:1.12,z:3.8 }, 'Hukum Snellius · Dispersi cahaya prisma · Sudut deviasi minimum · Laser merah', '🌈');
    add('thermo',      'Kalorimeter Joule',          {x:2,    y:1.12,z:3.8 }, 'Asas Black · Kalor jenis tembaga/aluminium/kuningan · Tara kalor mekanik', '🌡️');
    add('prep',        'Ruang Persiapan Guru',       {x:-7.5, y:1.12,z:0  }, '24 m² · 4 lemari kaca terkunci · Kit Mekanika, Optik, Listrik, Termofisika', '🚪');
    add('wash',        'Wastafel Cuci Tangan (3 Keran)', {x:-2.4, y:1.1, z:6.8}, 'Stasiun cuci tangan luas 2.6m · 3 wastafel stainless · keran angsa · cermin dinding · sabun antiseptik', '🚰');
    add('k3',          'Papan SOP & Prosedur K3 Lab',    {x:-3.8, y:1.8, z:5.0}, 'Pedoman K3 resmi di dinding · Aturan jas lab & APD · Pencegahan sengatan listrik · Penanganan darurat', '🛡️');
    add('apar',        'Pos K3 & APAR ABC 6kg',      {x:3.2,  y:1.4, z:7.0}, 'APAR kimia kering ABC · P3K · Eye Wash · E-Stop master · Standar Kemendikbud', '🧯');
    add('estop',       'Master Emergency Power Off', {x:3.2,  y:1.5, z:-7.2},'Tombol jamur merah · Putus daya ke 10 meja (50 siswa) seketika · Tipe NC', '⚡');
  }

  _bindButtons() {
    const $ = id => document.getElementById(id);

    $('btn-mode-walk')?.addEventListener('click', () => {
      audioManager.playClick?.();
      this.controls.setMode('walk');
      $('btn-mode-walk')?.classList.add('active');
      $('btn-mode-orbit')?.classList.remove('active');
    });
    $('btn-mode-orbit')?.addEventListener('click', () => {
      audioManager.playClick?.();
      this.controls.setMode('orbit');
      $('btn-mode-orbit')?.classList.add('active');
      $('btn-mode-walk')?.classList.remove('active');
    });

    $('btn-audio')?.addEventListener('click', () => {
      audioManager.init?.();
      const muted = audioManager.toggleMute?.();
      const icon = $('audio-icon');
      if (icon) icon.textContent = muted ? '🔇' : '🔊';
    });

    // Lighting
    const lightMap = { 'light-day':'day', 'light-lab':'lab', 'light-cinematic':'cinematic' };
    Object.entries(lightMap).forEach(([id, mode]) => {
      $(id)?.addEventListener('click', () => {
        audioManager.playClick?.();
        this.lighting.setLightingMode(mode);
        Object.keys(lightMap).forEach(k => $(k)?.classList.remove('active'));
        $(id)?.classList.add('active');
      });
    });

    // Teleport / POV dock
    document.querySelectorAll('.tp-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        audioManager.init?.();
        document.querySelectorAll('.tp-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._teleport(btn.dataset.target);
      });
    });
  }

  _teleport(target) {
    const map = {
      // POV Pintu Masuk
      entrance:    { x: 0,    z: 6.8,  y: Math.PI },
      // POV Guru (Meja Demonstrasi Guru menghadap murid)
      demo:        { x: 0,    z: -6.4, y: 0 },
      // POV Murid tiap meja praktikum (menghadap ke guru & papan tulis)
      table1:      { x: -2.0, z: -3.0, y: Math.PI },
      table2:      { x: -2.0, z: -1.1, y: Math.PI },
      table3:      { x: -2.0, z: 0.8,  y: Math.PI },
      table4:      { x: -2.0, z: 2.7,  y: Math.PI },
      table5:      { x: -2.0, z: 4.6,  y: Math.PI },
      table6:      { x: 2.0,  z: -3.0, y: Math.PI },
      table7:      { x: 2.0,  z: -1.1, y: Math.PI },
      table8:      { x: 2.0,  z: 0.8,  y: Math.PI },
      table9:      { x: 2.0,  z: 2.7,  y: Math.PI },
      table10:     { x: 2.0,  z: 4.6,  y: Math.PI },
    };
    const t = map[target];
    if (t) this.controls.teleportTo({x:t.x, z:t.z}, {x:0, y:t.y});
  }

  _setupFps() {
    const el = document.createElement('div');
    el.id = 'fps-counter';
    document.body.appendChild(el);
    this.fpsEl = el;
  }

  _nearbyCheck() {
    const cam = this.engine.camera.position;
    let near = null, minD = 3.0;
    for (const m of (this.markers?.markers ?? [])) {
      const p = m.group.position;
      const d = Math.hypot(cam.x - p.x, cam.z - p.z);
      if (d < minD) { minD = d; near = m.group.userData; }
    }

    const cross = document.getElementById('crosshair');
    if (near?.targetData) {
      cross?.classList.add('interactable');
    } else {
      cross?.classList.remove('interactable');
    }
  }

  _drawRadar() {
    const ctx = this.radarCtx;
    if (!ctx) return;
    const W = 180, H = 112;
    ctx.fillStyle = '#040810'; ctx.fillRect(0, 0, W, H);

    const ox = W * 0.64, oy = H * 0.5, sc = 5.8;

    // Main hall
    ctx.fillStyle = '#0d1627';
    ctx.fillRect(ox - 4*sc, oy - 7.5*sc, 8*sc, 15*sc);
    ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 1;
    ctx.strokeRect(ox - 4*sc, oy - 7.5*sc, 8*sc, 15*sc);

    // Prep room
    ctx.fillStyle = '#0a1220';
    ctx.fillRect(ox - 10*sc, oy - 2*sc, 6*sc, 4*sc);
    ctx.strokeStyle = '#1e3a5f';
    ctx.strokeRect(ox - 10*sc, oy - 2*sc, 6*sc, 4*sc);

    // Tables
    ctx.fillStyle = 'rgba(37,99,235,0.7)';
    for (const xc of [-2,2]) {
      for (const zr of [-3.8,-1.9,0,1.9,3.8]) {
        ctx.fillRect(ox+(xc-1)*sc, oy+(zr-.5)*sc, 2*sc, 1*sc);
      }
    }

    // Demo table
    ctx.fillStyle = 'rgba(5,150,105,0.8)';
    ctx.fillRect(ox-1.4*sc, oy-6.5*sc, 2.8*sc, sc);

    // Large Wash Station (back-left)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(ox - 3.7*sc, oy + 6.6*sc, 2.6*sc, 0.65*sc);

    // K3 Wall Board on left wall
    ctx.fillStyle = '#10b981';
    ctx.fillRect(ox - 4.15*sc, oy + 3.4*sc, 0.25*sc, 3.2*sc);

    // Right Windows on right exterior wall
    ctx.fillStyle = 'rgba(56,189,248,0.7)';
    ctx.fillRect(ox + 3.9*sc, oy - 6.25*sc, 0.25*sc, 12.5*sc);

    // APAR
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(ox+3.2*sc, oy+7*sc, 3, 0, Math.PI*2); ctx.fill();

    // Camera
    const cam = this.engine.camera.position;
    const yaw = this.controls?.euler?.y ?? 0;
    const px = ox + cam.x*sc, py = oy + cam.z*sc;

    ctx.fillStyle = 'rgba(56,189,248,0.12)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, 18, -yaw-Math.PI/2-.5, -yaw-Math.PI/2+.5);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();

    // Grid
    ctx.strokeStyle = 'rgba(56,189,248,0.04)'; ctx.lineWidth = .5;
    for (let x = 0; x < W; x += 15) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 15) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  }

  _animate() {
    requestAnimationFrame(() => this._animate());
    const now = performance.now();
    const dt  = Math.min((now - this._prev) / 1000, 0.05);
    this._prev = now;
    const t = this.engine.clock.getElapsedTime();

    this.controls?.update(dt);
    this.equipment?.update(dt);
    this.markers?.update(dt, t);

    // Coords
    const cam = this.engine.camera.position;
    if (this.coordsEl)
      this.coordsEl.textContent = `X: ${cam.x.toFixed(1)} | Z: ${cam.z.toFixed(1)}`;

    // Radar every 5 frames
    this._frame++;
    if (this._frame % 5 === 0) this._drawRadar();

    this.engine.render();

    // FPS every 30 frames
    if (this._frame % 30 === 0 && this.fpsEl) {
      const fps = Math.round(1/dt);
      this.fpsEl.textContent = `${fps} FPS`;
      this.fpsEl.style.color = fps >= 50 ? '#10b981' : fps >= 30 ? '#f59e0b' : '#ef4444';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const gl = document.createElement('canvas').getContext('webgl2')
          || document.createElement('canvas').getContext('webgl');
  if (!gl) {
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#050810;color:#38bdf8;font-family:Orbitron,monospace;font-size:1rem;text-align:center;padding:2rem">WebGL tidak tersedia.<br>Aktifkan hardware acceleration di browser.</div>';
    return;
  }
  new PhysicsLabApp();
});
