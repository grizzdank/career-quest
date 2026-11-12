// sim.js - Game rules. No DOM, no canvas: runs in a browser or under node for balance checks.
(function (CQ) {
  const STEP = 1 / 60;

  function createRandom(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getDistance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  class Path {
    constructor(points) {
      this.points = points;
      this.segments = [];
      this.length = 0;
      for (let i = 0; i < points.length - 1; i++) {
        const len = getDistance(points[i], points[i + 1]);
        this.segments.push({ from: points[i], to: points[i + 1], start: this.length, len });
        this.length += len;
      }
    }

    getPointAt(dist) {
      const d = Math.max(0, Math.min(this.length, dist));
      for (const seg of this.segments) {
        if (d <= seg.start + seg.len) {
          const t = (d - seg.start) / seg.len;
          return {
            x: seg.from.x + (seg.to.x - seg.from.x) * t,
            y: seg.from.y + (seg.to.y - seg.from.y) * t
          };
        }
      }
      return { ...this.points[this.points.length - 1] };
    }
  }

  class Entity {
    constructor(type, x, y) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.dead = false;
    }
  }

  class Enemy extends Entity {
    constructor(game, type, dist, options = {}) {
      super(type, 0, 0);
      this.game = game;
      this.def = CQ.ENEMIES[type];
      this.dist = dist;
      this.baseHp = this.def.hp * game.getWaveScale();
      this.maxHp = this.baseHp * (options.hpShare || 1);
      this.hp = this.maxHp;
      this.speed = this.def.speed;
      this.revived = !!options.revived;
      this.timer = this.def.pulseEvery || this.def.reviveEvery || 0;
      this.phase = 0;
      this.shield = 0;
      this.slow = 1;
      this.briefed = false;
      this.movePosition();
    }

    getGrowth() {
      return this.maxHp / this.baseHp;
    }

    movePosition() {
      const p = this.game.path.getPointAt(this.dist);
      this.x = p.x;
      this.y = p.y;
    }

    update(dt) {
      const def = this.def;
      if (this.shield > 0) this.shield -= dt;

      if (def.growRate && !this.briefed && this.getGrowth() < def.growMax) {
        const gain = this.baseHp * def.growRate * dt;
        this.maxHp += gain;
        this.hp += gain;
      }

      if (def.pulseEvery) {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.timer = def.pulseEvery;
          this.game.freezeTowersNear(this);
        }
      }

      if (def.reviveEvery) {
        this.timer -= dt;
        if (this.timer <= 0) {
          this.timer = this.game.reviveCorpseNear(this) ? def.reviveEvery : 0.5;
        }
      }

      this.dist += this.speed * this.slow * dt;
      this.movePosition();
      if (this.dist >= this.game.path.length) this.game.leakEnemy(this);
    }

    takeDamage(amount) {
      if (this.dead || this.shield > 0) return;
      this.hp -= amount;
      if (this.hp <= 0) this.game.killEnemy(this);
    }
  }

  class Tower extends Entity {
    constructor(game, type, slotIndex) {
      const slot = CQ.SLOTS[slotIndex];
      super(type, slot.x, slot.y);
      this.game = game;
      this.def = CQ.TOWERS[type];
      this.slotIndex = slotIndex;
      this.cooldown = 0.3;
      this.frozen = 0;
      this.frozenReason = '';
      this.pulse = 0; // seconds since last shot, for draw animation
    }

    isBriefed() {
      return this.game.towers.some(t =>
        t.type === 'brief' && t.frozen <= 0 && getDistance(t, this) <= CQ.BRIEF_LINK_DISTANCE);
    }

    freeze(seconds, reason) {
      if (this.type === 'async') return false;
      this.frozen = Math.max(this.frozen, seconds);
      this.frozenReason = reason;
      return true;
    }

    update(dt) {
      this.pulse += dt;
      if (this.frozen > 0) {
        this.frozen -= dt;
        return;
      }
      if (this.type === 'brief') return; // aura only, applied in Game.applyAuras()
      this.cooldown -= dt;
      if (this.cooldown > 0) return;

      const game = this.game;
      if (this.type === 'async') {
        const inRange = game.enemies.filter(e => !e.dead && getDistance(e, this) <= this.def.range);
        if (!inRange.length) return;
        for (const e of inRange) {
          e.takeDamage(this.def.damage * (e.type === 'sync' ? this.def.meetingMultiplier : 1));
        }
        game.addEffect({ kind: 'ring', x: this.x, y: this.y, radius: this.def.range, color: this.def.color, life: 0.45 });
      } else {
        const target = game.findTarget(this);
        if (!target) return;
        if (this.type === 'ai' && game.random() < (this.isBriefed() ? this.def.misfireBriefed : this.def.misfire)) {
          game.fireMisfire(this);
        } else {
          game.projectiles.push(new Projectile(this, target, null));
        }
      }
      this.cooldown = this.def.cooldown;
      this.pulse = 0;
    }
  }

  class Projectile extends Entity {
    constructor(tower, enemy, wrongTower) {
      super(tower.type, tower.x, tower.y);
      this.game = tower.game;
      this.tower = tower;
      this.enemy = enemy;
      this.wrongTower = wrongTower; // set when the AI picks one of your own towers by mistake
      this.speed = 520;
    }

    update(dt) {
      const target = this.wrongTower || this.enemy;
      if (!this.wrongTower && target.dead) {
        this.dead = true;
        return;
      }
      const d = getDistance(this, target);
      const move = this.speed * dt;
      if (d <= move) {
        this.dead = true;
        if (this.wrongTower) {
          if (!this.wrongTower.dead && this.wrongTower.freeze(this.tower.def.glitchTime, 'glitch')) {
            this.game.addText(target.x, target.y - 26, 'not a target!', '#ff9d3c');
          }
        } else {
          target.takeDamage(this.tower.def.damage);
        }
        return;
      }
      this.x += ((target.x - this.x) / d) * move;
      this.y += ((target.y - this.y) / d) * move;
    }
  }

  class Game {
    constructor(seed) {
      this.random = createRandom(seed === undefined ? Date.now() : seed);
      this.path = new Path(CQ.PATH_POINTS);
      this.state = 'building'; // building | wave | won | lost
      this.focus = CQ.START_FOCUS;
      this.buffer = CQ.START_BUFFER;
      this.waveIndex = -1;
      this.waveTime = 0;
      this.time = 0;
      this.accumulator = 0;
      this.spawnQueue = [];
      this.enemies = [];
      this.towers = [];
      this.projectiles = [];
      this.corpses = [];
      this.effects = [];
      this.stats = { shipped: 0, misfires: 0, reopened: 0, towersBuilt: 0 };
    }

    getWaveScale() {
      return CQ.WAVES[Math.max(0, this.waveIndex)].hpScale;
    }

    getTowerAt(slotIndex) {
      return this.towers.find(t => t.slotIndex === slotIndex) || null;
    }

    getSellValue(tower) {
      return Math.floor(tower.def.cost * CQ.SELL_REFUND);
    }

    addEffect(effect) {
      effect.age = 0;
      this.effects.push(effect);
    }

    addText(x, y, text, color) {
      this.addEffect({ kind: 'text', x, y, text, color: color || '#ffffff', life: 1.1 });
    }

    startNextWave() {
      if (this.state !== 'building' || this.waveIndex >= CQ.WAVES.length - 1) return false;
      this.waveIndex++;
      this.waveTime = 0;
      this.spawnQueue = [];
      for (const group of CQ.WAVES[this.waveIndex].groups) {
        for (let i = 0; i < group.count; i++) {
          this.spawnQueue.push({ time: group.delay + i * group.gap, type: group.type });
        }
      }
      this.spawnQueue.sort((a, b) => a.time - b.time);
      this.state = 'wave';
      return true;
    }

    buildTower(type, slotIndex) {
      const def = CQ.TOWERS[type];
      if (!def || !CQ.SLOTS[slotIndex] || this.getTowerAt(slotIndex)) return false;
      if (this.focus < def.cost || this.state === 'won' || this.state === 'lost') return false;
      this.focus -= def.cost;
      this.towers.push(new Tower(this, type, slotIndex));
      this.stats.towersBuilt++;
      return true;
    }

    sellTower(slotIndex) {
      const tower = this.getTowerAt(slotIndex);
      if (!tower) return false;
      tower.dead = true;
      this.focus += this.getSellValue(tower);
      this.towers = this.towers.filter(t => t !== tower);
      return true;
    }

    findTarget(tower) {
      let best = null;
      for (const e of this.enemies) {
        if (e.dead || getDistance(e, tower) > tower.def.range) continue;
        if (!best || e.dist > best.dist) best = e;
      }
      return best;
    }

    fireMisfire(tower) {
      this.stats.misfires++;
      const others = this.towers.filter(t => t !== tower);
      this.addText(tower.x, tower.y - 30, 'confidently wrong', '#ff9d3c');
      if (!others.length) return;
      const wrong = others[Math.floor(this.random() * others.length)];
      this.projectiles.push(new Projectile(tower, null, wrong));
    }

    freezeTowersNear(enemy) {
      const def = enemy.def;
      this.addEffect({ kind: 'ring', x: enemy.x, y: enemy.y, radius: def.pulseRange, color: '#9fd0ff', life: 0.5 });
      for (const tower of this.towers) {
        if (getDistance(tower, enemy) > def.pulseRange) continue;
        if (tower.freeze(def.freezeTime, 'sync')) {
          this.addText(tower.x, tower.y - 26, 'got a sec?', '#9fd0ff');
        }
      }
    }

    reviveCorpseNear(zombie) {
      const def = zombie.def;
      const corpse = this.corpses.find(c => getDistance(c, zombie) <= def.reviveRange);
      if (!corpse) return false;
      this.corpses = this.corpses.filter(c => c !== corpse);
      const revived = new Enemy(this, corpse.type, corpse.dist, { revived: true, hpShare: def.reviveHp });
      this.enemies.push(revived);
      this.stats.reopened++;
      this.addEffect({ kind: 'beam', x: zombie.x, y: zombie.y, x2: revived.x, y2: revived.y, color: '#8fe08a', life: 0.5 });
      this.addText(revived.x, revived.y - 22, 'reopened!', '#8fe08a');
      return true;
    }

    leakEnemy(enemy) {
      enemy.dead = true;
      this.buffer = Math.max(0, this.buffer - enemy.def.leak);
      const end = this.path.getPointAt(this.path.length);
      const days = enemy.def.leak === 1 ? '1 day' : enemy.def.leak + ' days';
      this.addText(end.x - 10, end.y - 40, 'launch slips ' + days, '#ff6b6b');
    }

    killEnemy(enemy) {
      const def = enemy.def;
      if (enemy.type === 'boss' && enemy.phase < def.phases.length - 1) {
        enemy.phase++;
        enemy.hp = enemy.maxHp;
        enemy.speed *= def.phaseSpeedUp;
        enemy.shield = def.phaseShield;
        this.addText(enemy.x, enemy.y - 52, 'just one more thing...', '#ffd166');
        this.enemies.push(new Enemy(this, 'creep', Math.max(0, enemy.dist - 30)));
        this.enemies.push(new Enemy(this, 'creep', enemy.dist + 30));
        return;
      }

      enemy.dead = true;
      this.stats.shipped++;
      const bounty = enemy.revived ? Math.ceil(def.bounty * 0.4) : def.bounty;
      if (bounty) {
        this.focus += bounty;
        this.addText(enemy.x, enemy.y - 18, '+' + bounty, '#ffe066');
      }
      if (def.splitsInto) {
        this.enemies.push(new Enemy(this, def.splitsInto, Math.max(0, enemy.dist - 12)));
        this.enemies.push(new Enemy(this, def.splitsInto, enemy.dist + 12));
      }
      if (def.leavesCorpse && !enemy.revived) {
        this.corpses.push({ type: enemy.type, dist: enemy.dist, x: enemy.x, y: enemy.y, age: 0, life: 7 });
      }
    }

    applyAuras() {
      const briefs = this.towers.filter(t => t.type === 'brief' && t.frozen <= 0);
      for (const e of this.enemies) {
        e.slow = 1;
        e.briefed = false;
        for (const t of briefs) {
          if (getDistance(t, e) <= t.def.range) {
            e.slow = 1 - t.def.slow;
            e.briefed = true;
          }
        }
      }
    }

    step(dt) {
      if (this.state === 'won' || this.state === 'lost') return;
      this.time += dt;

      if (this.state === 'wave') {
        this.waveTime += dt;
        while (this.spawnQueue.length && this.spawnQueue[0].time <= this.waveTime) {
          this.enemies.push(new Enemy(this, this.spawnQueue.shift().type, 0));
        }
      }

      this.applyAuras();
      // Loops use a snapshot: kills and revives add enemies mid-update.
      for (const e of this.enemies.slice()) if (!e.dead) e.update(dt);
      for (const t of this.towers) t.update(dt);
      for (const p of this.projectiles) p.update(dt);
      for (const c of this.corpses) c.age += dt;
      for (const fx of this.effects) fx.age += dt;

      this.enemies = this.enemies.filter(e => !e.dead);
      this.projectiles = this.projectiles.filter(p => !p.dead);
      this.corpses = this.corpses.filter(c => c.age < c.life);
      this.effects = this.effects.filter(fx => fx.age < fx.life);

      if (this.buffer <= 0) {
        this.state = 'lost';
      } else if (this.state === 'wave' && !this.spawnQueue.length && !this.enemies.length) {
        if (this.waveIndex >= CQ.WAVES.length - 1) {
          this.state = 'won';
        } else {
          this.state = 'building';
          const bonus = 15 + 5 * (this.waveIndex + 1);
          this.focus += bonus;
          this.corpses = [];
          this.addText(CQ.WIDTH / 2, 230, 'Wave cleared: +' + bonus + ' focus', '#ffe066');
        }
      }
    }

    // Advance by real seconds using a fixed timestep, so speed-up and slow frames stay deterministic.
    advance(seconds) {
      this.accumulator += Math.min(seconds, 1.5);
      while (this.accumulator >= STEP) {
        this.step(STEP);
        this.accumulator -= STEP;
      }
    }
  }

  CQ.Game = Game;
  CQ.Path = Path;
  CQ.getDistance = getDistance;
})(globalThis.CQ = globalThis.CQ || {});
