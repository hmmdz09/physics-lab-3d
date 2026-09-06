import { audioManager } from './audio.js';

export class HudManager {
  constructor(controls, lightingSystem, modalManager) {
    this.controls = controls;
    this.lighting = lightingSystem;
    this.modal = modalManager;

    this.btnWalk  = document.getElementById('btn-mode-walk');
    this.btnOrbit = document.getElementById('btn-mode-orbit');
    this.btnAudio = document.getElementById('btn-audio');
    this.audioIcon = document.getElementById('audio-icon');

    this.btnLightDay      = document.getElementById('light-day');
    this.btnLightLab      = document.getElementById('light-lab');
    this.btnLightCinematic = document.getElementById('light-cinematic');

    this.radarCanvas  = document.getElementById('radar-canvas');
    this.radarCtx     = this.radarCanvas?.getContext('2d');
    this.coordsDisplay = document.getElementById('coords-display');

    this.toast     = document.getElementById('interaction-toast');
    this.toastText = document.getElementById('toast-text');

    // Radar throttle: update only every 6th call (~10 fps radar)
    this._radarFrame = 0;

    this.initEvents();
  }

  initEvents() {
    this.btnWalk?.addEventListener('click', () => {
      audioManager.playClick();
      this.controls.setMode('walk');
      this.btnWalk.classList.add('active');
      this.btnOrbit?.classList.remove('active');
    });

    this.btnOrbit?.addEventListener('click', () => {
      audioManager.playClick();
      this.controls.setMode('orbit');
      this.btnOrbit.classList.add('active');
      this.btnWalk?.classList.remove('active');
    });

    this.btnAudio?.addEventListener('click', () => {
      audioManager.init();
      const isMuted = audioManager.toggleMute();
      this.audioIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    const lightBtns = [this.btnLightDay, this.btnLightLab, this.btnLightCinematic];
    const setLighting = (mode, btn) => {
      audioManager.playClick();
      this.lighting.setLightingMode(mode);
      lightBtns.forEach(b => b?.classList.remove('active'));
      btn.classList.add('active');
    };
    this.btnLightDay?.addEventListener('click', () => setLighting('day', this.btnLightDay));
    this.btnLightLab?.addEventListener('click', () => setLighting('lab', this.btnLightLab));
    this.btnLightCinematic?.addEventListener('click', () => setLighting('cinematic', this.btnLightCinematic));

    document.querySelectorAll('.teleport-dock button').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        this.handleTeleport(target);
      });
    });
  }

  handleTeleport(target) {
    audioManager.init();
    const map = {
      demo:        { x: 0,    z: -4.2, ly: Math.PI   },
      table1:      { x: -0.5, z: -2.5, ly: -Math.PI/2 },
      table6:      { x: 0.5,  z: 2.5,  ly:  Math.PI/2 },
      optics:      { x: -0.7, z: 3.8,  ly: -Math.PI/2 },
      oscilloscope:{ x: -0.7, z: 1.9,  ly: -Math.PI/2 },
      prep:        { x: -7.2, z: 0.0,  ly: -Math.PI/2 },
      safety:      { x: 2.0,  z: 6.2,  ly: 0          },
    };
    const t = map[target];
    if (t) this.controls.teleportTo({ x: t.x, z: t.z }, { x: 0, y: t.ly });
  }

  showToast(message) {
    if (!this.toast) return;
    this.toastText.textContent = message;
    this.toast.classList.add('visible');
  }

  hideToast() {
    this.toast?.classList.remove('visible');
  }

  update(cameraPos, cameraEuler) {
    // Coords: update every frame (cheap string op)
    if (this.coordsDisplay) {
      this.coordsDisplay.textContent = `X: ${cameraPos.x.toFixed(1)}m | Z: ${cameraPos.z.toFixed(1)}m`;
    }

    // Radar: throttled to every 6th frame (save canvas2D cost)
    this._radarFrame++;
    if (this._radarFrame % 6 !== 0) return;
    this._drawRadar(cameraPos, cameraEuler);
  }

  _drawRadar(cameraPos, cameraEuler) {
    const ctx = this.radarCtx;
    const canvas = this.radarCanvas;
    if (!ctx || !canvas) return;

    const w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#070b14';
    ctx.fillRect(0, 0, w, h);

    const originX = w * 0.62, originY = h * 0.5, scale = 6.2;

    // Main hall
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(originX - 4*scale, originY - 7.5*scale, 8*scale, 15*scale);
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
    ctx.strokeRect(originX - 4*scale, originY - 7.5*scale, 8*scale, 15*scale);

    // Prep room
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(originX - 10*scale, originY - 2*scale, 6*scale, 4*scale);
    ctx.strokeStyle = '#60a5fa';
    ctx.strokeRect(originX - 10*scale, originY - 2*scale, 6*scale, 4*scale);
    ctx.fillStyle = '#94a3b8'; ctx.font = '7px sans-serif';
    ctx.fillText('GUDANG', originX - 10*scale + 3, originY - 2*scale + 12);

    // 10 Student tables
    ctx.fillStyle = '#2563eb';
    const xC = [-2, 2], zR = [-3.8, -1.9, 0, 1.9, 3.8];
    for (const xc of xC) {
      for (const zr of zR) {
        ctx.fillRect(originX + (xc-1)*scale, originY + (zr-0.5)*scale, 2*scale, 1*scale);
      }
    }

    // Demo table
    ctx.fillStyle = '#059669';
    ctx.fillRect(originX + -1.4*scale, originY + -6.3*scale, 2.8*scale, scale);

    // APAR dot
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(originX + 3.2*scale, originY + 7.2*scale, 3, 0, Math.PI*2);
    ctx.fill();

    // Player FOV cone
    const px = originX + cameraPos.x*scale;
    const py = originY + cameraPos.z*scale;
    const yaw = cameraEuler.y;
    ctx.fillStyle = 'rgba(56,189,248,0.2)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, 20, -yaw - Math.PI/2 - 0.45, -yaw - Math.PI/2 + 0.45);
    ctx.closePath();
    ctx.fill();

    // Player dot
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI*2);
    ctx.fill(); ctx.stroke();
  }
}
