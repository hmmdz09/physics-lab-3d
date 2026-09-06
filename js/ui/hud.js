import { audioManager } from './audio.js';

export class HudManager {
  constructor(controls, lightingSystem, modalManager) {
    this.controls = controls;
    this.lighting = lightingSystem;
    this.modal = modalManager;

    // Elements
    this.btnWalk = document.getElementById('btn-mode-walk');
    this.btnOrbit = document.getElementById('btn-mode-orbit');
    this.btnAudio = document.getElementById('btn-audio');
    this.audioIcon = document.getElementById('audio-icon');

    this.btnLightDay = document.getElementById('light-day');
    this.btnLightLab = document.getElementById('light-lab');
    this.btnLightCinematic = document.getElementById('light-cinematic');

    this.radarCanvas = document.getElementById('radar-canvas');
    this.radarCtx = this.radarCanvas?.getContext('2d');
    this.coordsDisplay = document.getElementById('coords-display');

    this.toast = document.getElementById('interaction-toast');
    this.toastText = document.getElementById('toast-text');

    this.initEvents();
  }

  initEvents() {
    // Mode Switcher
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

    // Audio Mute Toggle
    this.btnAudio?.addEventListener('click', () => {
      audioManager.init();
      const isMuted = audioManager.toggleMute();
      this.audioIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // Lighting Modes
    const lightBtns = [this.btnLightDay, this.btnLightLab, this.btnLightCinematic];
    this.btnLightDay?.addEventListener('click', () => {
      audioManager.playClick();
      this.lighting.setLightingMode('day');
      lightBtns.forEach(b => b?.classList.remove('active'));
      this.btnLightDay.classList.add('active');
    });

    this.btnLightLab?.addEventListener('click', () => {
      audioManager.playClick();
      this.lighting.setLightingMode('lab');
      lightBtns.forEach(b => b?.classList.remove('active'));
      this.btnLightLab.classList.add('active');
    });

    this.btnLightCinematic?.addEventListener('click', () => {
      audioManager.playClick();
      this.lighting.setLightingMode('cinematic');
      lightBtns.forEach(b => b?.classList.remove('active'));
      this.btnLightCinematic.classList.add('active');
    });

    // Teleport Dock Buttons
    document.querySelectorAll('.teleport-dock button').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        this.handleTeleport(target);
      });
    });
  }

  handleTeleport(target) {
    audioManager.init();
    if (target === 'demo') {
      this.controls.teleportTo({ x: 0, z: -4.2 }, { x: 0, y: Math.PI }); // Look towards demo desk
    } else if (target === 'table1') {
      this.controls.teleportTo({ x: -0.5, z: -2.5 }, { x: 0, y: -Math.PI / 2 });
    } else if (target === 'table6') {
      this.controls.teleportTo({ x: 0.5, z: 2.5 }, { x: 0, y: Math.PI / 2 });
    } else if (target === 'optics') {
      this.controls.teleportTo({ x: -0.7, z: 3.8 }, { x: 0, y: -Math.PI / 2 });
    } else if (target === 'oscilloscope') {
      this.controls.teleportTo({ x: -0.7, z: 1.9 }, { x: 0, y: -Math.PI / 2 });
    } else if (target === 'prep') {
      this.controls.teleportTo({ x: -7.2, z: 0.0 }, { x: 0, y: -Math.PI / 2 });
    } else if (target === 'safety') {
      this.controls.teleportTo({ x: 2.0, z: 6.2 }, { x: 0, y: 0 });
    }
  }

  showToast(message) {
    if (!this.toast || !this.toastText) return;
    this.toastText.textContent = message;
    this.toast.classList.add('visible');
  }

  hideToast() {
    if (this.toast) {
      this.toast.classList.remove('visible');
    }
  }

  update(cameraPos, cameraEuler) {
    // Update Coordinates Label
    if (this.coordsDisplay) {
      this.coordsDisplay.textContent = `X: ${cameraPos.x.toFixed(1)}m | Z: ${cameraPos.z.toFixed(1)}m`;
    }

    // Render Minimap Radar
    if (this.radarCtx && this.radarCanvas) {
      const ctx = this.radarCtx;
      const w = this.radarCanvas.width;
      const h = this.radarCanvas.height;

      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, w, h);

      // Scale: 1 meter = 6 pixels
      // Center of main hall (0, 0) is at (w * 0.62, h * 0.5)
      const originX = w * 0.62;
      const originY = h * 0.5;
      const scale = 6.2;

      // 1. Draw Main Hall: 8m wide (X: -4 to 4), 15m long (Z: -7.5 to 7.5)
      const mainLeft = originX - 4.0 * scale;
      const mainTop = originY - 7.5 * scale;
      const mainW = 8.0 * scale;
      const mainH = 15.0 * scale;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(mainLeft, mainTop, mainW, mainH);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(mainLeft, mainTop, mainW, mainH);

      // 2. Draw Prep Room: 6m wide (X: -10 to -4), 4m long (Z: -2 to 2)
      const prepLeft = originX - 10.0 * scale;
      const prepTop = originY - 2.0 * scale;
      const prepW = 6.0 * scale;
      const prepH = 4.0 * scale;

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(prepLeft, prepTop, prepW, prepH);
      ctx.strokeStyle = '#60a5fa';
      ctx.strokeRect(prepLeft, prepTop, prepW, prepH);

      // Label Prep Room
      ctx.fillStyle = '#94a3b8';
      ctx.font = '8px sans-serif';
      ctx.fillText('GUDANG', prepLeft + 4, prepTop + 14);

      // 3. Draw 10 Student Tables
      const xCols = [-2.0, 2.0];
      const zRows = [-3.8, -1.9, 0.0, 1.9, 3.8];
      ctx.fillStyle = '#2563eb';

      for (let c = 0; c < xCols.length; c++) {
        for (let r = 0; r < zRows.length; r++) {
          const tx = originX + (xCols[c] - 1.0) * scale;
          const ty = originY + (zRows[r] - 0.5) * scale;
          ctx.fillRect(tx, ty, 2.0 * scale, 1.0 * scale);
        }
      }

      // 4. Draw Teacher Demonstration Table
      const demoX = originX + (-1.4) * scale;
      const demoY = originY + (-5.8 - 0.5) * scale;
      ctx.fillStyle = '#059669';
      ctx.fillRect(demoX, demoY, 2.8 * scale, 1.0 * scale);

      // 5. Draw Exit Doors & APAR
      ctx.fillStyle = '#ef4444';
      // APAR #1
      ctx.beginPath();
      ctx.arc(originX + 3.2 * scale, originY + 7.2 * scale, 3, 0, Math.PI * 2);
      ctx.fill();

      // 6. Draw Player Indicator & FOV View Cone
      const px = originX + cameraPos.x * scale;
      const py = originY + cameraPos.z * scale;
      const yaw = cameraEuler.y;

      // View cone
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.moveTo(px, py);
      const fovAngle = 0.5;
      ctx.arc(px, py, 22, -yaw - Math.PI / 2 - fovAngle, -yaw - Math.PI / 2 + fovAngle);
      ctx.closePath();
      ctx.fill();

      // Player point
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}
