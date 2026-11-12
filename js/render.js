// render.js - Draws the game state to a canvas. All art is drawn in code except the
// office backdrop and the ticket sprite, which are reused from the original shooter.
(function (CQ) {
  const FONT = 'ui-monospace, Menlo, Consolas, "Courier New", monospace';
  const TAU = Math.PI * 2;

  function drawRoundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawLabel(ctx, text, x, y, size, color, align) {
    ctx.font = 'bold ' + size + 'px ' + FONT;
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(12, 11, 40, 0.85)';
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  // Tower art is shared by the playfield and the build buttons.
  function drawTowerIcon(ctx, type, x, y, size) {
    const s = size / 44;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    ctx.lineJoin = 'round';
    if (type === 'no') {
      ctx.fillStyle = '#e5484d';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = TAU / 16 + (i * TAU) / 8;
        ctx.lineTo(Math.cos(a) * 17, Math.sin(a) * 17);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('NO', 0, 1);
    } else if (type === 'brief') {
      ctx.fillStyle = '#fff4cf';
      ctx.strokeStyle = '#8a6d1f';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, -12, -16, 24, 32, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#8a6d1f';
      ctx.fillRect(-6, -19, 12, 6);
      ctx.strokeStyle = '#2f9e44';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) {
        const ly = -6 + i * 8;
        ctx.beginPath();
        ctx.moveTo(-8, ly);
        ctx.lineTo(-6, ly + 2);
        ctx.lineTo(-3, ly - 2);
        ctx.stroke();
        ctx.fillStyle = '#b9a56a';
        ctx.fillRect(0, ly - 1, 8, 2);
      }
    } else if (type === 'async') {
      ctx.fillStyle = '#2fbfb1';
      ctx.strokeStyle = '#eafffb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-16, -12);
      ctx.lineTo(16, -12);
      ctx.lineTo(16, 7);
      ctx.lineTo(-3, 7);
      ctx.lineTo(-10, 15);
      ctx.lineTo(-9, 7);
      ctx.lineTo(-16, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#eafffb';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(i * 8, -2.5, 2.4, 0, TAU);
        ctx.fill();
      }
    } else if (type === 'ai') {
      ctx.fillStyle = '#2a2a4a';
      ctx.strokeStyle = '#ff9d3c';
      ctx.lineWidth = 2;
      drawRoundRect(ctx, -16, -16, 32, 32, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffb65c';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * TAU) / 8 - Math.PI / 2;
        const r = i % 2 === 0 ? 12 : 3.5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  class Renderer {
    constructor(canvas, images) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.images = images; // { office, ticket } - either may be null if loading failed
      this.backdrop = null;
    }

    resizeCanvas(pixelScale) {
      this.canvas.width = Math.round(CQ.WIDTH * pixelScale);
      this.canvas.height = Math.round(CQ.HEIGHT * pixelScale);
      this.pixelScale = this.canvas.width / CQ.WIDTH;
    }

    // The static layer (office, timeline, milestones) is painted once and reused.
    buildBackdrop(path) {
      const scale = 2;
      const layer = document.createElement('canvas');
      layer.width = CQ.WIDTH * scale;
      layer.height = CQ.HEIGHT * scale;
      const ctx = layer.getContext('2d');
      ctx.scale(scale, scale);

      ctx.fillStyle = '#211f52';
      ctx.fillRect(0, 0, CQ.WIDTH, CQ.HEIGHT);
      const office = this.images.office;
      if (office) {
        // Lower part of the square office scene: the desks, without the baked-in title.
        const sw = office.width;
        const sh = (sw * CQ.HEIGHT) / CQ.WIDTH;
        ctx.globalAlpha = 0.5;
        ctx.drawImage(office, 0, office.height - sh, sw, sh, 0, 0, CQ.WIDTH, CQ.HEIGHT);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(24, 22, 66, 0.55)';
        ctx.fillRect(0, 0, CQ.WIDTH, CQ.HEIGHT);
      }

      const trace = () => {
        ctx.beginPath();
        path.points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      };
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      trace();
      ctx.strokeStyle = '#7f7be0';
      ctx.lineWidth = 50;
      ctx.stroke();
      trace();
      ctx.strokeStyle = '#17163f';
      ctx.lineWidth = 44;
      ctx.stroke();

      // Week ticks along the timeline.
      for (let d = 30, week = 1; d < path.length - 40; d += 100, week++) {
        const p = path.getPointAt(d);
        ctx.fillStyle = 'rgba(160, 156, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, TAU);
        ctx.fill();
      }
      for (const m of CQ.MILESTONES) {
        const p = path.getPointAt(m.dist);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = '#17163f';
        ctx.strokeStyle = '#c9c6ff';
        ctx.lineWidth = 2;
        ctx.fillRect(-7, -7, 14, 14);
        ctx.strokeRect(-7, -7, 14, 14);
        ctx.restore();
        drawLabel(ctx, m.label, p.x, p.y - 34, 11, '#c9c6ff');
      }

      // Launch date: the thing you are defending.
      const end = path.getPointAt(path.length);
      ctx.fillStyle = '#ffd166';
      ctx.strokeStyle = '#17163f';
      ctx.lineWidth = 3;
      drawRoundRect(ctx, end.x - 12, end.y - 36, 62, 72, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#e5484d';
      ctx.fillRect(end.x - 12, end.y - 36, 62, 8);
      ctx.fillRect(end.x - 12, end.y - 30, 62, 12);
      ctx.fillStyle = '#17163f';
      ctx.font = 'bold 11px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('LAUNCH', end.x + 19, end.y - 26);
      ctx.fillStyle = '#17163f';
      ctx.font = 'bold 30px ' + FONT;
      ctx.fillText('★', end.x + 19, end.y + 10);

      this.backdrop = layer;
    }

    render(game, ui) {
      const ctx = this.ctx;
      ctx.setTransform(this.pixelScale, 0, 0, this.pixelScale, 0, 0);
      if (!this.backdrop) this.buildBackdrop(game.path);
      ctx.drawImage(this.backdrop, 0, 0, CQ.WIDTH, CQ.HEIGHT);

      this.drawSlots(game, ui);
      this.drawCorpses(game);
      for (const tower of game.towers) this.drawTower(game, tower, ui);
      const ordered = game.enemies.slice().sort((a, b) => a.y - b.y || a.dist - b.dist);
      for (const enemy of ordered) this.drawEnemy(game, enemy);
      for (const p of game.projectiles) this.drawProjectile(p);
      for (const fx of game.effects) this.drawEffect(fx);
    }

    drawRange(x, y, radius, color) {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 0.7;
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    drawSlots(game, ui) {
      const ctx = this.ctx;
      CQ.SLOTS.forEach((slot, index) => {
        if (game.getTowerAt(index)) return;
        const armed = !!ui.selectedType;
        const pulse = armed ? 0.5 + 0.5 * Math.sin(game.time * 5 + index) : 0;
        ctx.save();
        ctx.fillStyle = armed ? 'rgba(255, 224, 102, ' + (0.12 + 0.12 * pulse) + ')' : 'rgba(23, 22, 63, 0.55)';
        ctx.strokeStyle = armed ? '#ffe066' : 'rgba(201, 198, 255, 0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        drawRoundRect(ctx, slot.x - 24, slot.y - 24, 48, 48, 8);
        ctx.fill();
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = armed ? '#ffe066' : 'rgba(201, 198, 255, 0.7)';
        ctx.fillRect(slot.x - 8, slot.y - 1.5, 16, 3);
        ctx.fillRect(slot.x - 1.5, slot.y - 8, 3, 16);
        ctx.restore();
        if (armed && ui.hoverSlot === index) {
          const def = CQ.TOWERS[ui.selectedType];
          this.drawRange(slot.x, slot.y, def.range, def.color);
          ctx.globalAlpha = 0.6;
          drawTowerIcon(ctx, ui.selectedType, slot.x, slot.y, 44);
          ctx.globalAlpha = 1;
        }
      });
    }

    drawCorpses(game) {
      const ctx = this.ctx;
      for (const c of game.corpses) {
        ctx.save();
        ctx.globalAlpha = 0.75 * (1 - c.age / c.life);
        ctx.translate(c.x, c.y);
        ctx.rotate(-0.2);
        ctx.strokeStyle = '#8fe08a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-19, -7, 38, 14);
        ctx.fillStyle = '#8fe08a';
        ctx.font = 'bold 8px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SHIPPED', 0, 0.5);
        ctx.restore();
      }
    }

    drawTower(game, tower, ui) {
      const ctx = this.ctx;
      const def = tower.def;
      const selected = ui.selectedSlot === tower.slotIndex;

      if (selected) this.drawRange(tower.x, tower.y, def.range, def.color);
      if (tower.type === 'brief' && tower.frozen <= 0) {
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = def.color;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, def.range, 0, TAU);
        ctx.fill();
        ctx.restore();
      }

      let briefed = false;
      if (tower.type === 'ai') {
        // Visible link to the Clear Brief that keeps this AI on target.
        for (const other of game.towers) {
          if (other.type !== 'brief' || other.frozen > 0) continue;
          if (CQ.getDistance(other, tower) > CQ.BRIEF_LINK_DISTANCE) continue;
          briefed = true;
          ctx.save();
          ctx.strokeStyle = '#8fe08a';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 6]);
          ctx.lineDashOffset = -game.time * 20;
          ctx.beginPath();
          ctx.moveTo(other.x, other.y);
          ctx.lineTo(tower.x, tower.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      ctx.fillStyle = '#17163f';
      ctx.strokeStyle = selected ? '#ffffff' : def.color;
      ctx.lineWidth = selected ? 3 : 2;
      drawRoundRect(ctx, tower.x - 24, tower.y - 24, 48, 48, 8);
      ctx.fill();
      ctx.stroke();

      const kick = tower.pulse < 0.12 ? 1.12 : 1;
      drawTowerIcon(ctx, tower.type, tower.x, tower.y, 44 * kick);

      if (tower.type === 'ai') {
        ctx.fillStyle = briefed ? '#2f9e44' : '#f08c00';
        ctx.beginPath();
        ctx.arc(tower.x + 19, tower.y - 19, 8, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(briefed ? '✓' : '?', tower.x + 19, tower.y - 18.5);
      }

      if (tower.frozen > 0) {
        const glitch = tower.frozenReason === 'glitch';
        ctx.fillStyle = glitch ? 'rgba(255, 157, 60, 0.55)' : 'rgba(159, 208, 255, 0.6)';
        drawRoundRect(ctx, tower.x - 24, tower.y - 24, 48, 48, 8);
        ctx.fill();
        drawLabel(ctx, glitch ? '?!' : 'IN A SYNC', tower.x, tower.y, glitch ? 18 : 9, '#ffffff');
      }
    }

    drawHealthBar(enemy, top, width) {
      const ctx = this.ctx;
      const share = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = 'rgba(12, 11, 40, 0.85)';
      ctx.fillRect(enemy.x - width / 2 - 1, top - 1, width + 2, 6);
      ctx.fillStyle = share > 0.5 ? '#69db7c' : share > 0.25 ? '#ffd43b' : '#ff6b6b';
      ctx.fillRect(enemy.x - width / 2, top, width * share, 4);
    }

    drawEnemy(game, enemy) {
      const ctx = this.ctx;
      const t = game.time;
      const bob = Math.sin(t * 6 + enemy.dist * 0.05) * 1.5;
      const x = enemy.x;
      const y = enemy.y + bob;
      let top = y - 24;
      let barWidth = 28;
      ctx.save();

      if (enemy.type === 'creep') {
        const r = enemy.def.radius * Math.sqrt(enemy.getGrowth());
        ctx.fillStyle = enemy.briefed ? '#9775fa' : '#cc5de8';
        ctx.strokeStyle = '#3b1d5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) {
          const a = (i / 16) * TAU;
          const wobble = r + Math.sin(a * 4 + t * 4) * r * 0.12;
          ctx.lineTo(x + Math.cos(a) * wobble, y + Math.sin(a) * wobble);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - r * 0.4, y - r * 0.25, r * 0.28, r * 0.36);
        ctx.fillRect(x + r * 0.15, y - r * 0.25, r * 0.28, r * 0.36);
        if (!enemy.briefed && enemy.getGrowth() < enemy.def.growMax) {
          drawLabel(ctx, '+', x + r + 4, y - r, 12, '#f3d9fa');
        }
        top = y - r - 10;
        barWidth = Math.max(22, r * 2);
      } else if (enemy.type === 'sync') {
        const charge = 1 - enemy.timer / enemy.def.pulseEvery;
        ctx.strokeStyle = 'rgba(159, 208, 255, ' + (0.25 + 0.6 * charge) + ')';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 19, -Math.PI / 2, -Math.PI / 2 + TAU * charge);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#1c3d6e';
        drawRoundRect(ctx, x - 13, y - 13, 26, 26, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#4dabf7';
        ctx.fillRect(x - 12, y - 12, 24, 7);
        ctx.strokeStyle = '#1c3d6e';
        ctx.beginPath();
        ctx.arc(x, y + 4, 6, 0, TAU);
        ctx.moveTo(x, y + 4);
        ctx.lineTo(x, y);
        ctx.moveTo(x, y + 4);
        ctx.lineTo(x + 3, y + 5);
        ctx.stroke();
      } else if (enemy.type === 'ticket' || enemy.type === 'subticket') {
        const size = enemy.type === 'ticket' ? 30 : 19;
        const sprite = this.images.ticket;
        if (sprite) {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
          ctx.imageSmoothingEnabled = true;
        } else {
          ctx.fillStyle = '#339af0';
          ctx.translate(x, y);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-size / 3, -size / 3, size / 1.5, size / 1.5);
          ctx.setTransform(this.pixelScale, 0, 0, this.pixelScale, 0, 0);
        }
        top = y - size / 2 - 9;
        barWidth = size - 4;
      } else if (enemy.type === 'zombie') {
        ctx.translate(x, y);
        ctx.rotate(Math.sin(t * 3 + enemy.dist) * 0.12);
        ctx.fillStyle = '#74b86f';
        ctx.strokeStyle = '#1f4a1c';
        ctx.lineWidth = 2;
        drawRoundRect(ctx, -17, -12, 34, 24, 3);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-17, -11);
        ctx.lineTo(0, 3);
        ctx.lineTo(17, -11);
        ctx.stroke();
        ctx.fillStyle = '#1f4a1c';
        ctx.font = 'bold 9px ' + FONT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('RE:RE:', 0, 7);
        ctx.setTransform(this.pixelScale, 0, 0, this.pixelScale, 0, 0);
      } else if (enemy.type === 'boss') {
        const flash = enemy.shield > 0 && Math.floor(t * 12) % 2 === 0;
        ctx.translate(x, y);
        ctx.rotate(Math.sin(t * 2) * 0.05);
        ctx.fillStyle = flash ? '#ffd166' : '#fdfcf5';
        ctx.strokeStyle = '#3d2c00';
        ctx.lineWidth = 2.5;
        drawRoundRect(ctx, -24, -31, 48, 62, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#b9b5a0';
        for (let i = 0; i < 6; i++) ctx.fillRect(-17, -22 + i * 9, 34 - (i % 3) * 7, 3);
        ctx.strokeStyle = '#e03131';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(-2, -10, 15, 7, -0.2, 0, TAU);
        ctx.moveTo(-17, 10);
        ctx.lineTo(8, 14);
        ctx.moveTo(-17, 19);
        ctx.lineTo(13, 17);
        ctx.stroke();
        const notes = ['#ffe066', '#ff8787', '#74c0fc'];
        for (let i = 0; i <= enemy.phase; i++) {
          ctx.fillStyle = notes[i];
          ctx.fillRect(12 - i * 4, -38 + i * 20, 20, 17);
        }
        ctx.setTransform(this.pixelScale, 0, 0, this.pixelScale, 0, 0);
        drawLabel(ctx, enemy.def.phases[enemy.phase], x, y - 57, 10, '#ffd166');
        top = y - 48;
        barWidth = 56;
      }

      ctx.restore();
      if (enemy.revived) {
        ctx.strokeStyle = '#8fe08a';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(x, y, enemy.def.radius + 6, 0, TAU);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      if (enemy.hp < enemy.maxHp || enemy.type === 'boss') this.drawHealthBar(enemy, top, barWidth);
    }

    drawProjectile(p) {
      const ctx = this.ctx;
      ctx.fillStyle = p.type === 'ai' ? '#ffb65c' : '#ff8787';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.type === 'ai' ? 5 : 4, 0, TAU);
      ctx.fill();
      if (p.wrongTower) drawLabel(ctx, '?', p.x, p.y - 10, 12, '#ffb65c');
    }

    drawEffect(fx) {
      const ctx = this.ctx;
      const k = fx.age / fx.life;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - k);
      if (fx.kind === 'text') {
        drawLabel(ctx, fx.text, fx.x, fx.y - k * 22, 12, fx.color);
      } else if (fx.kind === 'ring') {
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.radius * (0.2 + 0.8 * k), 0, TAU);
        ctx.stroke();
      } else if (fx.kind === 'beam') {
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fx.x, fx.y);
        ctx.lineTo(fx.x2, fx.y2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  CQ.Renderer = Renderer;
  CQ.drawTowerIcon = drawTowerIcon;
})(globalThis.CQ = globalThis.CQ || {});
