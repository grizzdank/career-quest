// main.js - Browser glue: input (mouse and touch via pointer events), HUD, screens, music.
(function (CQ) {
  const SPEEDS = [1, 2, 3];
  const SLOT_HIT_RADIUS = 36;

  class App {
    constructor() {
      this.stage = document.getElementById('stage');
      this.canvas = document.getElementById('gameCanvas');
      this.elements = {};
      for (const id of ['hudBuffer', 'hudFocus', 'hudWave', 'info', 'popover', 'sellButton', 'towerButtons',
        'startWaveButton', 'speedButton', 'muteButton', 'titleScreen', 'endScreen', 'endTitle', 'endSummary',
        'endAiLine', 'links', 'playButton', 'replayButton']) {
        this.elements[id] = document.getElementById(id);
      }

      this.images = { office: null, ticket: null };
      this.renderer = new CQ.Renderer(this.canvas, this.images);
      this.game = new CQ.Game();
      this.ui = { selectedType: null, selectedSlot: null, hoverSlot: null };
      this.playing = false;
      this.speedIndex = 0;
      this.message = null;
      this.lastFrame = 0;
      this.music = null;
      this.muted = this.readMuted();
      this.cache = {}; // last text written to each HUD element, to avoid needless DOM writes
    }

    start() {
      this.loadImage('office', 'assets/backgrounds/office-small.jpg');
      this.loadImage('ticket', 'assets/sprites/jiraMonster.png');
      this.createTowerButtons();
      this.createLinks();
      this.bindEvents();
      this.resizeStage();
      this.updateMuteButton();
      requestAnimationFrame(time => this.runFrame(time));
    }

    loadImage(name, src) {
      const img = new Image();
      img.onload = () => {
        this.images[name] = img;
        this.renderer.backdrop = null; // repaint the static layer with the new image
      };
      img.onerror = () => console.error('Career Quest: could not load image', src, '- using drawn fallback');
      img.src = src;
    }

    readMuted() {
      try {
        return localStorage.getItem('cq-muted') === '1';
      } catch (err) {
        return false; // storage can be blocked in private windows; default to sound on
      }
    }

    createTowerButtons() {
      for (const type of CQ.TOWER_ORDER) {
        const def = CQ.TOWERS[type];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'bar__tower';
        button.dataset.type = type;

        const icon = document.createElement('canvas');
        icon.className = 'bar__tower-icon';
        icon.width = 92;
        icon.height = 92;
        CQ.drawTowerIcon(icon.getContext('2d'), type, 46, 46, 92);

        const label = document.createElement('span');
        const name = document.createElement('span');
        name.className = 'bar__tower-name';
        name.textContent = def.name;
        const cost = document.createElement('span');
        cost.className = 'bar__tower-cost';
        cost.textContent = def.cost + ' focus';
        label.append(name, cost);

        button.append(icon, label);
        button.addEventListener('click', () => this.selectTowerType(type));
        this.elements.towerButtons.append(button);
      }
    }

    createLinks() {
      for (const link of CQ.LINKS) {
        const item = document.createElement(link.url ? 'a' : 'div');
        item.className = 'links__item' + (link.url ? '' : ' links__item--pending');
        if (link.url) {
          item.href = link.url;
          item.target = '_blank';
          item.rel = 'noopener';
        }
        const parts = [
          ['links__title', link.title],
          ['links__text', link.text],
          ['links__url', link.url ? link.url.replace('https://', '') + ' ↗' : 'link coming soon']
        ];
        for (const [className, text] of parts) {
          const span = document.createElement('span');
          span.className = className;
          span.textContent = text;
          item.append(span);
        }
        this.elements.links.append(item);
      }
    }

    bindEvents() {
      const el = this.elements;
      window.addEventListener('resize', () => this.resizeStage());
      window.addEventListener('orientationchange', () => this.resizeStage());
      document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

      this.canvas.addEventListener('pointerdown', event => this.handlePointerDown(event));
      this.canvas.addEventListener('pointermove', event => this.handlePointerMove(event));
      this.canvas.addEventListener('pointerleave', () => { this.ui.hoverSlot = null; });

      el.playButton.addEventListener('click', () => this.startGame());
      el.replayButton.addEventListener('click', () => this.startGame());
      el.startWaveButton.addEventListener('click', () => this.startWave());
      el.sellButton.addEventListener('click', () => this.sellSelectedTower());
      el.speedButton.addEventListener('click', () => {
        this.speedIndex = (this.speedIndex + 1) % SPEEDS.length;
        el.speedButton.textContent = SPEEDS[this.speedIndex] + 'x';
      });
      el.muteButton.addEventListener('click', () => this.toggleMute());
    }

    resizeStage() {
      const scale = Math.min(window.innerWidth / CQ.WIDTH, window.innerHeight / CQ.HEIGHT);
      this.stage.style.transform = 'translate(-50%, -50%) scale(' + scale + ')';
      this.renderer.resizeCanvas(Math.min(3, Math.max(1, scale * (window.devicePixelRatio || 1))));
    }

    handleVisibilityChange() {
      this.lastFrame = 0; // do not fast-forward the game after the tab was hidden
      if (!this.music) return;
      if (document.hidden) this.music.pause();
      else if (this.playing && !this.muted) this.playMusic();
    }

    // --- Music -------------------------------------------------------------

    playMusic() {
      if (!this.music) {
        this.music = new Audio('audio/soundtrack.mp3');
        this.music.loop = true;
        this.music.volume = 0.45;
      }
      this.music.muted = this.muted;
      if (this.muted) return;
      this.music.play().catch(err => console.error('Career Quest: music could not start', err));
    }

    toggleMute() {
      this.muted = !this.muted;
      try {
        localStorage.setItem('cq-muted', this.muted ? '1' : '0');
      } catch (err) {
        console.error('Career Quest: could not save mute setting', err);
      }
      this.updateMuteButton();
      if (this.music) this.music.muted = this.muted;
      if (!this.muted && this.playing) this.playMusic();
    }

    updateMuteButton() {
      this.elements.muteButton.textContent = this.muted ? 'Music off' : 'Music on';
      this.elements.muteButton.setAttribute('aria-pressed', String(this.muted));
    }

    // --- Game flow ---------------------------------------------------------

    startGame() {
      this.game = new CQ.Game();
      this.ui = { selectedType: null, selectedSlot: null, hoverSlot: null };
      this.playing = true;
      this.message = null;
      this.elements.titleScreen.hidden = true;
      this.elements.endScreen.hidden = true;
      this.playMusic(); // inside the tap handler, so browsers allow audio to start
    }

    startWave() {
      if (this.game.startNextWave()) this.showMessage(null);
    }

    showMessage(text) {
      this.message = text ? { text, until: performance.now() + 2600 } : null;
    }

    selectTowerType(type) {
      this.ui.selectedSlot = null;
      this.ui.selectedType = this.ui.selectedType === type ? null : type;
      this.showMessage(null);
    }

    sellSelectedTower() {
      const tower = this.game.getTowerAt(this.ui.selectedSlot);
      if (!tower) return;
      const value = this.game.getSellValue(tower);
      this.game.sellTower(tower.slotIndex);
      this.ui.selectedSlot = null;
      this.showMessage('Sold ' + tower.def.name + ' for ' + value + ' focus.');
    }

    getStagePoint(event) {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * CQ.WIDTH,
        y: ((event.clientY - rect.top) / rect.height) * CQ.HEIGHT
      };
    }

    findSlotAt(point) {
      let best = null;
      let bestDistance = SLOT_HIT_RADIUS;
      CQ.SLOTS.forEach((slot, index) => {
        const d = CQ.getDistance(slot, point);
        if (d <= bestDistance) {
          best = index;
          bestDistance = d;
        }
      });
      return best;
    }

    handlePointerMove(event) {
      if (event.pointerType !== 'mouse') return; // range preview is a mouse nicety only
      this.ui.hoverSlot = this.findSlotAt(this.getStagePoint(event));
    }

    handlePointerDown(event) {
      if (!this.playing) return;
      event.preventDefault();
      const slotIndex = this.findSlotAt(this.getStagePoint(event));
      if (slotIndex === null) {
        this.ui.selectedSlot = null;
        return;
      }
      if (this.game.getTowerAt(slotIndex)) {
        this.ui.selectedType = null;
        this.ui.selectedSlot = this.ui.selectedSlot === slotIndex ? null : slotIndex;
        return;
      }
      this.ui.selectedSlot = null;
      const type = this.ui.selectedType;
      if (!type) {
        this.showMessage('Pick a tower from the bar below first, then tap a + spot.');
        return;
      }
      const def = CQ.TOWERS[type];
      if (this.game.focus < def.cost) {
        this.showMessage('Not enough focus: ' + def.name + ' needs ' + (def.cost - this.game.focus) + ' more.');
        return;
      }
      this.game.buildTower(type, slotIndex);
    }

    endGame() {
      const game = this.game;
      const el = this.elements;
      const stats = game.stats;
      const won = game.state === 'won';
      this.playing = false;
      this.ui.selectedType = null;
      this.ui.selectedSlot = null;

      el.endTitle.textContent = won ? 'Shipped on time.' : 'The launch slipped.';
      el.endSummary.textContent = won
        ? game.buffer + ' of ' + CQ.START_BUFFER + ' buffer days left. ' + stats.shipped + ' things shipped, ' +
          stats.reopened + ' reopened and shipped again.'
        : 'You reached wave ' + (game.waveIndex + 1) + ' of ' + CQ.WAVES.length + ' and shipped ' + stats.shipped +
          ' things. It happens. The fix is usually a clearer brief.';
      el.endAiLine.textContent = stats.misfires > 0
        ? 'Your AI assistant was confidently wrong ' + stats.misfires + (stats.misfires === 1 ? ' time' : ' times') +
          '. Knowing where AI fits, and what it needs around it, is the real job.'
        : 'The AI Assistant is the strongest tower in the game, and it still needs a clear brief. That part is not a joke.';
      el.endScreen.hidden = false;
    }

    // --- Per-frame ---------------------------------------------------------

    setText(id, text) {
      if (this.cache[id] === text) return;
      this.cache[id] = text;
      this.elements[id].textContent = text;
    }

    getInfoText() {
      const game = this.game;
      if (this.message && performance.now() < this.message.until) return this.message.text;
      if (this.ui.selectedType) {
        const def = CQ.TOWERS[this.ui.selectedType];
        return def.name + ': ' + def.blurb;
      }
      const tower = game.getTowerAt(this.ui.selectedSlot);
      if (tower) return tower.def.name + ': ' + tower.def.blurb;
      const next = CQ.WAVES[game.state === 'wave' ? game.waveIndex : game.waveIndex + 1];
      if (!next) return '';
      if (game.state === 'wave') return next.intro;
      if (!game.towers.length) return 'Pick a tower below, tap a + spot to place it, then start the wave.';
      return 'Next: ' + next.name + '. ' + next.intro;
    }

    updateHud() {
      const game = this.game;
      const el = this.elements;
      this.setText('hudBuffer', String(game.buffer));
      this.setText('hudFocus', String(game.focus));
      el.hudBuffer.parentElement.classList.toggle('hud__stat--danger', game.buffer <= 3);

      const wave = CQ.WAVES[Math.max(0, game.waveIndex)];
      this.setText('hudWave', game.waveIndex < 0
        ? 'Project kickoff'
        : 'Wave ' + (game.waveIndex + 1) + '/' + CQ.WAVES.length + ': ' + wave.name);

      const inWave = game.state !== 'building';
      el.startWaveButton.disabled = inWave;
      this.setText('startWaveButton', inWave
        ? 'Wave ' + (game.waveIndex + 1) + ' of ' + CQ.WAVES.length
        : 'Start wave ' + (game.waveIndex + 2));

      for (const button of el.towerButtons.children) {
        const type = button.dataset.type;
        button.classList.toggle('bar__tower--selected', this.ui.selectedType === type);
        button.classList.toggle('bar__tower--poor', game.focus < CQ.TOWERS[type].cost);
      }

      const info = this.getInfoText();
      this.setText('info', info);
      el.info.classList.toggle('info--alert', !!this.message && info === this.message.text);

      const tower = game.getTowerAt(this.ui.selectedSlot);
      el.popover.hidden = !tower;
      if (tower) {
        this.setText('sellButton', 'Sell +' + game.getSellValue(tower));
        el.popover.style.left = tower.x + 'px';
        el.popover.style.top = (tower.y < 250 ? tower.y + 32 : tower.y - 100) + 'px';
      }
    }

    runFrame(time) {
      // Slow frames still advance real time: the simulation uses a fixed step, so this is safe.
      const dt = this.lastFrame ? Math.min(0.4, (time - this.lastFrame) / 1000) : 0;
      this.lastFrame = time;
      if (this.playing) {
        this.game.advance(dt * SPEEDS[this.speedIndex]);
        if (this.game.state === 'won' || this.game.state === 'lost') this.endGame();
      }
      this.renderer.render(this.game, this.ui);
      this.updateHud();
      requestAnimationFrame(next => this.runFrame(next));
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    CQ.app = app; // handy in the browser console
    app.start();
  });
})(globalThis.CQ = globalThis.CQ || {});
