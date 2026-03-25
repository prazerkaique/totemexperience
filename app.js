/* CONFIGURATIONS */
const CONFIG = {
  WEBHOOK_ENVIO_CODIGO: 'https://webhook.site/envio-codigo', // RENDER MOCK OR REAL URL
  WEBHOOK_VALIDA_CODIGO: 'https://webhook.site/valida-codigo',
  WEBHOOK_SURPRESA: 'https://webhook.site/surpresa',
  SESSION_TIMEOUT_MS: 60000
};

/* PRODUCT DATA */
const PRODUCTS = [
  {
    id: '1',
    name: 'Top Performance Roxo',
    code: 'TOP-001',
    category: 'Tops',
    gender: 'Feminino',
    description: 'Feito para ir além. Alças largas com detalhe cruzado nas costas, média compressão e tecido com brilho acetinado que sustenta cada movimento sem perder o estilo.',
    tech: 'EMANA® · UV 80+ · Antiodor permanente · Dispensa passadoria',
    materials: '88% Poliamida · 12% Elastano',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    price: 'R$ 236,90',
    colors: ['#4A3ABA'],
    image: 'public/Produto 1 /Fotos/Top Cropped Esportivo Azul BAZ - product-studio - Top Cropped Esportivo Azul BAZ - Frente - Original.png',
    video: 'public/Produto 1 /Videos/Gdxgd-scrub.mp4',
    slot: 'top'
  },
  {
    id: '2',
    name: 'Shorts Ciclista Azul',
    code: 'SHR-001',
    category: 'Shorts',
    gender: 'Feminino',
    description: 'Shorts ciclista de alta compressão com cós largo que modela sem apertar. Tecido acetinado com toque gelado e secagem ultra-rápida.',
    tech: 'EMANA® · UV 80+ · Antiodor permanente · Dispensa passadoria',
    materials: '88% Poliamida · 12% Elastano',
    sizes: ['PP', 'P', 'M', 'G', 'GG'],
    price: 'R$ 189,90',
    colors: ['#4A3ABA'],
    image: 'public/Produto 2/Fotos/Shorts Ciclistas Frente- VProductStudio - Frente - Original.png',
    video: 'public/Produto 2/Videos/shorts-scrub.mp4',
    slot: 'bottom'
  }
];

const CATEGORIES = ['Todos', 'Tops', 'Shorts'];

/* STATE MANAGEMENT */
const appState = {
  currentScreen: 1,
  timeoutId: null,
  user: {
    empresa: '',
    nome: '',
    whatsapp: '',
    site: ''
  },
  validationCode: '1234', // Mock code
  attempts: 3,
  gender: '',
  catalogCategory: 'Todos',
  activeInput: null,
  keyboardMode: 'alpha',
  shiftActive: false,
  look: {
    top: null, // Holds product ID
    bottom: null
  },
  composerActiveSlot: null, // 'top' or 'bottom'
  currentDetailProductId: null,
  secretClicks: 0,
  secretTimer: null,
  countdownInterval: null,
  modelViewFront: true,
  modelImages: {
    Feminino: {
      none:   { front: 'public/Modelo Feminino/vizzu-1774116725426.png', back: 'public/Modelo Feminino/vizzu-1774116729659.png' },
      top:    { front: 'public/Produto 1 /Modelo com produto 1/Modelo com Top Sem Shorts Front.png', back: 'public/Produto 1 /Modelo com produto 1/Modelo com Top Sem Shorts Back.png' },
      bottom: { front: 'public/Produto 2/Modelo com Produto 2/freepik__aplique-o-shorts-da-img2-na-imagem-no-mude-nada-al__8313.png', back: 'public/Produto 2/Modelo com Produto 2/freepik__aplique-o-shorts-img2-a-na-imagem-no-mude-nada-alm__8314.png' },
      both:   { front: 'public/Produto 2/Look Completo/freepik__coloque-o-img1-na-img2-mude-apenas-o-shorts-no-mud__68885.png', back: 'public/Produto 2/Look Completo/freepik__coloque-o-img2-na-img1-mude-apenas-o-shorts-no-mud__68886.png' }
    },
    Masculino: {
      none:   { front: 'public/Modelo Feminino/vizzu-1774116725426.png', back: 'public/Modelo Feminino/vizzu-1774116729659.png' },
      top:    { front: 'public/Modelo Feminino/vizzu-1774116725426.png', back: 'public/Modelo Feminino/vizzu-1774116729659.png' },
      bottom: { front: 'public/Modelo Feminino/vizzu-1774116725426.png', back: 'public/Modelo Feminino/vizzu-1774116729659.png' },
      both:   { front: 'public/Modelo Feminino/vizzu-1774116725426.png', back: 'public/Modelo Feminino/vizzu-1774116729659.png' }
    }
  }
};

/* APP LOGIC */
const app = {
  init() {
    this.setupInteractivityForTimeout();
    this.goToScreen(1);
    this.renderCatalogFilters();

    // Close keyboard when tapping outside
    document.addEventListener('click', (e) => {
      const kb = document.getElementById('virtual-keyboard');
      if (kb && !kb.classList.contains('hidden')) {
        const isInput = e.target.closest('.input-wrap, .pin-input, input');
        const isKeyboard = e.target.closest('#virtual-keyboard');
        if (!isInput && !isKeyboard) {
          this.closeKeyboard();
        }
      }
    });

    // Force background video autoplay
    const bgVideo = document.querySelector('.global-bg-video');
    if (bgVideo) {
      bgVideo.load();
      bgVideo.play().catch(e => console.warn('BG video play failed:', e));
      bgVideo.addEventListener('error', e => console.error('BG video error:', bgVideo.error));
    }
  },

  // State & Navigation
  resetTimer() {
    if(appState.timeoutId) clearTimeout(appState.timeoutId);
    if(appState.countdownInterval) { clearInterval(appState.countdownInterval); appState.countdownInterval = null; }
    this.hideCountdown();
    // Only run timeout if not on welcome screen
    if(appState.currentScreen === 1) return;
    appState.timeoutId = setTimeout(() => {
      this.startCountdown();
    }, CONFIG.SESSION_TIMEOUT_MS);
  },

  startCountdown() {
    let seconds = 10;
    const overlay = document.getElementById('countdown-overlay');
    const numEl = document.getElementById('countdown-number');
    overlay.classList.remove('hidden');
    numEl.textContent = seconds;

    appState.countdownInterval = setInterval(() => {
      seconds--;
      numEl.textContent = seconds;
      if(seconds <= 0) {
        clearInterval(appState.countdownInterval);
        appState.countdownInterval = null;
        this.hideCountdown();
        this.resetProtocol();
      }
    }, 1000);
  },

  hideCountdown() {
    const overlay = document.getElementById('countdown-overlay');
    if(overlay) overlay.classList.add('hidden');
  },

  toggleTheme() {
    const isLight = document.body.getAttribute('data-theme') === 'light';
    const logoEl = document.getElementById('main-logo');
    if(isLight) {
      document.body.removeAttribute('data-theme');
      document.querySelector('.btn-theme-toggle').innerHTML = '<i class="ph ph-sun"></i>';
      if(logoEl) logoEl.src = 'public/Logo2White.png';
    } else {
      document.body.setAttribute('data-theme', 'light');
      document.querySelector('.btn-theme-toggle').innerHTML = '<i class="ph ph-moon"></i>';
      if(logoEl) logoEl.src = 'public/Logo2Black.png';
    }
    document.querySelector('.btn-theme-toggle').classList.add('hidden');
    appState.secretClicks = 0;
  },

  handleSecretClick() {
    appState.secretClicks++;
    // Start 3s window on first click only — don't reset the timer
    if(!appState.secretTimer) {
      appState.secretTimer = setTimeout(() => {
        appState.secretClicks = 0;
        appState.secretTimer = null;
      }, 3000);
    }

    if(appState.secretClicks >= 10) {
      document.querySelector('.btn-theme-toggle').classList.toggle('hidden');
      appState.secretClicks = 0;
      clearTimeout(appState.secretTimer);
      appState.secretTimer = null;
    }
  },

  setupInteractivityForTimeout() {
    const events = ['touchstart', 'click', 'scroll', 'input'];
    events.forEach(event => document.addEventListener(event, () => this.resetTimer()));
    document.body.addEventListener('click', () => this.handleSecretClick());
  },

  resetProtocol() {
    appState.user = { empresa: '', nome: '', whatsapp: '', site: '' };
    appState.gender = '';
    appState.look = { top: null, bottom: null };
    appState.attempts = 3;
    sessionStorage.clear();
    
    // Clear inputs
    const inputs = document.querySelectorAll('input');
    inputs.forEach(inp => inp.value = '');
    
    this.closeKeyboard();
    this.goToScreen(1);
  },

  goToScreen(num) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(`screen-${num}`).classList.add('active');
    appState.currentScreen = num;

    // Ensure bg video plays when returning to screen 1
    if (num === 1) {
      const bgVideo = document.querySelector('.global-bg-video');
      if (bgVideo) bgVideo.play().catch(() => {});
    }

    if(num === 5) this.renderCatalog();
    if(num === 6) {
      this.checkFinishLookReady();
      this.loadModelImage();
    }
  },

  /* VIRTUAL KEYBOARD */
  focusInput(el, isPin = false) {
    document.querySelectorAll('.input-wrap, .pin-input').forEach(i => i.classList.remove('actived'));
    if(isPin) {
      el.classList.add('actived');
      this.openKeyboard('num');
    } else {
      el.parentElement.classList.add('actived');
      if (el.id === 'inp-whatsapp') {
        this.openKeyboard('num');
      } else {
        this.openKeyboard('alpha');
      }
    }
    appState.activeInput = el;
  },

  openKeyboard(mode) {
    appState.keyboardMode = mode;
    appState.shiftActive = false;
    document.getElementById('virtual-keyboard').classList.remove('hidden');
    this.renderKeyboard();
  },

  closeKeyboard() {
    document.getElementById('virtual-keyboard').classList.add('hidden');
    document.querySelectorAll('.input-wrap, .pin-input').forEach(i => i.classList.remove('actived'));
    appState.activeInput = null;
  },

  renderKeyboard() {
    const container = document.getElementById('vk-keys');
    const isShift = appState.shiftActive;
    
    let html = '';
    if (appState.keyboardMode === 'alpha') {
      const rows = [
        ['1','2','3','4','5','6','7','8','9','0'],
        ['q','w','e','r','t','y','u','i','o','p'],
        ['a','s','d','f','g','h','j','k','l','ç'],
        ['z','x','c','v','b','n','m', '.', '@', '.com']
      ];
      html = rows.map(r => `
        <div class="vk-row">
          ${r.map(k => {
            const val = (isShift && k.length === 1 && /[a-zç]/.test(k)) ? k.toUpperCase() : k;
            return `<button class="vk-key" onclick="app.typeKey('${val}')">${val}</button>`;
          }).join('')}
        </div>
      `).join('');
      html += `
        <div class="vk-row">
          <button class="vk-key vk-key-action vk-key-wide" onclick="app.toggleShift()"><i class="ph ph-arrow-fat-up${isShift ? '-fill' : ''}"></i> Shift</button>
          <button class="vk-key vk-key-space" onclick="app.typeKey(' ')">Espaço</button>
          <button class="vk-key vk-key-action vk-key-wide" onclick="app.typeKey('BACKSPACE')"><i class="ph ph-backspace"></i></button>
          <button class="vk-key vk-key-primary vk-key-wide" onclick="app.closeKeyboard()">OK</button>
        </div>
      `;
    } else {
      html = `
        <div class="vk-row"><button class="vk-key" onclick="app.typeKey('1')">1</button><button class="vk-key" onclick="app.typeKey('2')">2</button><button class="vk-key" onclick="app.typeKey('3')">3</button></div>
        <div class="vk-row"><button class="vk-key" onclick="app.typeKey('4')">4</button><button class="vk-key" onclick="app.typeKey('5')">5</button><button class="vk-key" onclick="app.typeKey('6')">6</button></div>
        <div class="vk-row"><button class="vk-key" onclick="app.typeKey('7')">7</button><button class="vk-key" onclick="app.typeKey('8')">8</button><button class="vk-key" onclick="app.typeKey('9')">9</button></div>
        <div class="vk-row"><button class="vk-key vk-key-action" onclick="app.typeKey('BACKSPACE')"><i class="ph ph-backspace"></i></button><button class="vk-key" onclick="app.typeKey('0')">0</button><button class="vk-key vk-key-primary" onclick="app.closeKeyboard()">OK</button></div>
      `;
    }
    container.innerHTML = html;
  },

  toggleShift() {
    appState.shiftActive = !appState.shiftActive;
    this.renderKeyboard();
  },

  typeKey(key) {
    if (!appState.activeInput) return;
    const inp = appState.activeInput;
    
    if (key === 'BACKSPACE') {
      if (inp.classList.contains('pin-input')) {
        // PIN: if current box is empty, move to previous and clear it
        const pins = Array.from(document.querySelectorAll('.pin-input'));
        const index = pins.indexOf(inp);
        if (inp.value.length === 0 && index > 0) {
          pins[index - 1].value = '';
          this.focusInput(pins[index - 1], true);
        } else {
          inp.value = '';
        }
      } else {
        inp.value = inp.value.slice(0, -1);
      }
    } else {
      if(inp.maxLength && inp.maxLength > 0 && inp.value.length >= inp.maxLength) return;
      inp.value += key;
    }

    if (inp.id === 'inp-whatsapp') {
      this.maskWhatsApp(inp);
    }
    if (inp.classList.contains('pin-input') && key !== 'BACKSPACE' && inp.value.length === 1) {
      this.handlePinInput(inp);
    }
  },

  // TELA 2: Data Capture
  maskWhatsApp(el) {
    let raw = el.value.replace(/\D/g, '');
    if (raw.length > 11) raw = raw.substring(0, 11);
    
    let formatted = raw;
    if (raw.length > 2) formatted = `(${raw.substring(0, 2)}) ` + raw.substring(2);
    if (raw.length > 7) formatted = formatted.substring(0, 10) + '-' + formatted.substring(10);
    
    el.value = formatted;
  },

  handleCaptureSubmit(e) {
    e.preventDefault();
    appState.user.empresa = document.getElementById('inp-empresa').value;
    appState.user.nome = document.getElementById('inp-nome').value;
    appState.user.whatsapp = document.getElementById('inp-whatsapp').value;
    appState.user.site = document.getElementById('inp-site').value;

    document.getElementById('display-whatsapp').innerText = appState.user.whatsapp;
    appState.attempts = 3;
    document.getElementById('attempt-count').innerText = appState.attempts;
    document.getElementById('pin-error').classList.add('hidden');
    document.querySelectorAll('.pin-input').forEach(inp => inp.value = '');

    this.closeKeyboard();

    this.sendValidationWebhook();
    this.goToScreen(3);
  },

  // TELA 3: Validation
  async sendValidationWebhook() {
    console.log("Chamando WEBHOOK_ENVIO_CODIGO:", appState.user);
    // await fetch(...).catch(...)
  },

  handlePinInput(el) {
    el.value = el.value.replace(/[^0-9]/g, '');
    const pins = Array.from(document.querySelectorAll('.pin-input'));
    const index = pins.indexOf(el);
    if (el.value.length === 1 && index < 3) {
      // Auto-advance to next pin box
      document.querySelectorAll('.pin-input').forEach(i => i.classList.remove('actived'));
      pins[index + 1].classList.add('actived');
      appState.activeInput = pins[index + 1];
    } else if (el.value.length === 1 && index === 3) {
      // Last digit entered — auto-validate
      this.validatePin();
    }
  },

  async validatePin() {
    const pins = document.querySelectorAll('.pin-input');
    const code = Array.from(pins).map(i => i.value).join('');
    
    if (code.length < 4) return;

    console.log("Validating code via webhooks...");
    // Mock simulation:
    if (code === appState.validationCode) {
      this.closeKeyboard();
      this.goToScreen(4);
    } else {
      appState.attempts--;
      document.getElementById('attempt-count').innerText = appState.attempts;
      document.getElementById('pin-error').classList.remove('hidden');
      pins.forEach(p => { p.value = ''; p.classList.remove('actived'); });
      pins[0].classList.add('actived');
      appState.activeInput = pins[0];

      if (appState.attempts <= 0) {
        alert("Máximo de tentativas excedido."); // Fallback
        this.goToScreen(2);
      }
    }
  },

  // TELA 4: Gender
  selectGender(gender) {
    appState.gender = gender;
    appState.modelViewFront = true;
    sessionStorage.setItem('totem_gender', gender);
    this.goToScreen(6);
  },

  loadModelImage() {
    const genderSet = appState.modelImages[appState.gender] || appState.modelImages['Feminino'];
    // Pick variant based on equipped look
    const hasTop = !!appState.look.top;
    const hasBottom = !!appState.look.bottom;
    let variant = 'none';
    if (hasTop && hasBottom) variant = 'both';
    else if (hasTop) variant = 'top';
    else if (hasBottom) variant = 'bottom';
    const imgs = genderSet[variant];
    const imgEl = document.getElementById('composer-model-img');
    const label = document.getElementById('view-toggle-label');
    if (imgEl) imgEl.src = appState.modelViewFront ? imgs.front : imgs.back;
    if (label) label.textContent = appState.modelViewFront ? 'Ver costas' : 'Ver frente';
  },

  toggleModelView() {
    appState.modelViewFront = !appState.modelViewFront;
    this.loadModelImage();
  },

  // TELA 5: Catalog
  renderCatalogFilters() {
    const container = document.getElementById('catalog-filters');
    if (!container) return;
    container.innerHTML = CATEGORIES.map(cat =>
      `<div class="filter-tab ${appState.catalogCategory === cat ? 'active' : ''}" onclick="app.setCategory('${cat}')">${cat}</div>`
    ).join('');
  },

  setCategory(cat) {
    appState.catalogCategory = cat;
    this.renderCatalogFilters();
    this.renderCatalog();
  },

  getFilteredProducts() {
    return PRODUCTS.filter(p => {
      // Unissex appears in both.
      const matchGender = p.gender === 'Unissex' || p.gender === appState.gender;
      const matchCategory = appState.catalogCategory === 'Todos' || p.category === appState.catalogCategory;
      return matchGender && matchCategory;
    });
  },

  renderProductHTML(p, actionClickStr) {
    return `
      <div class="product-card" onclick="${actionClickStr}">
        <div class="prod-img" style="background-image: url('${p.image}')"></div>
        <div class="prod-info">
          <h4>${p.name}</h4>
          <p>${p.code} - ${p.category}</p>
        </div>
      </div>
    `;
  },

  renderCatalog() {
    const prods = this.getFilteredProducts();
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = prods.map(p => this.renderProductHTML(p, `app.openProductModal('${p.id}')`)).join('');
  },

  /* Modals */
  openProductModal(id) {
    const p = PRODUCTS.find(x => x.id === id);
    const content = `
      <div class="modal-img" style="background-image: url('${p.image}')"></div>
      <div class="modal-desc" style="padding-left: 48px; flex: 1;">
        <span class="m-tag">${p.category}</span>
        <span class="m-tag">${p.gender}</span>
        <h3>${p.name}</h3>
        <p class="desc mb-huge">REF: ${p.code}</p>
        <h4>Materiais</h4>
        <p class="desc mt-large mb-huge">${p.materials}</p>
        <h4>Cores Disponíveis</h4>
        <div class="mt-large">
          ${p.colors.map(c => `<div class="color-swatch" style="background-color: ${c}"></div>`).join('')}
        </div>
      </div>
    `;
    document.getElementById('modal-product-content').innerHTML = content;
    document.getElementById('modal-product').classList.remove('hidden');
  },

  closeModal(divId) {
    document.getElementById(divId).classList.add('hidden');
  },

  // TELA 6: Look Composer Overlay Interactions
  openPartModal(slot) {
    appState.composerActiveSlot = slot;
    document.getElementById('modal-select-title').innerText = slot === 'top' ? 'Itens Superiores' : 'Itens Inferiores';
    
    // Filter matching slot and gender
    const eligible = PRODUCTS.filter(p => {
      const isSlot = (slot === 'top' && ['top', 'all'].includes(p.slot)) || (slot === 'bottom' && ['bottom', 'all'].includes(p.slot));
      const matchGender = p.gender === 'Unissex' || p.gender === appState.gender;
      return isSlot && matchGender;
    });

    const grid = document.getElementById('modal-select-grid');
    grid.innerHTML = eligible.map(p => this.renderProductHTML(p, `app.openProductDetail('${p.id}')`)).join('');
    document.getElementById('modal-select').classList.remove('hidden');
  },

  openProductDetail(id) {
    this.currentDetailProductId = id;
    const p = PRODUCTS.find(x => x.id === id);

    // Render specs
    const specsEl = document.getElementById('detail-specs-content');

    // Map tech features to icons
    const techIcons = {
      'EMANA®': 'ph-lightning',
      'UV 80+': 'ph-sun-horizon',
      'Antiodor permanente': 'ph-wind',
      'Dispensa passadoria': 'ph-t-shirt'
    };
    const techItems = (p.tech || '').split('·').map(t => t.trim()).filter(Boolean);
    const techHTML = techItems.map(t => {
      const icon = techIcons[t] || 'ph-star';
      return `<div class="tech-badge"><i class="ph ${icon}"></i><span>${t}</span></div>`;
    }).join('');

    // Sizes as e-commerce pills
    const sizesHTML = (p.sizes || []).map(s =>
      `<button class="size-pill" onclick="this.parentElement.querySelectorAll('.size-pill').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${s}</button>`
    ).join('');

    // Composition breakdown
    const materialsHTML = (p.materials || '').split('·').map(m => {
      const parts = m.trim().match(/^(\d+%)\s*(.+)$/);
      if (parts) {
        return `<div class="comp-row"><span class="comp-pct">${parts[1]}</span><span class="comp-name">${parts[2]}</span></div>`;
      }
      return `<div class="comp-row"><span class="comp-name">${m.trim()}</span></div>`;
    }).join('');

    specsEl.innerHTML = `
      <div class="detail-header-row">
        <div>
          <h3 class="detail-product-name">${p.name}</h3>
          <span class="detail-product-code">${p.code}</span>
        </div>
        <div class="detail-price">${p.price || ''}</div>
      </div>
      <p class="detail-product-desc">${p.description || ''}</p>

      <div class="detail-section">
        <h4 class="detail-section-label"><i class="ph ph-cpu"></i> Tecnologias</h4>
        <div class="tech-badges">${techHTML}</div>
      </div>

      <div class="detail-section">
        <h4 class="detail-section-label"><i class="ph ph-ruler"></i> Tamanhos</h4>
        <div class="size-pills">${sizesHTML}</div>
      </div>

      <div class="detail-section">
        <h4 class="detail-section-label"><i class="ph ph-yarn"></i> Composição</h4>
        <div class="comp-card">${materialsHTML}</div>
      </div>
    `;

    // Setup video scrubber + auto-play ping-pong
    const video = document.getElementById('detail-video');
    if (p.video) {
      video.src = p.video;
      video.load();
      video.addEventListener('loadedmetadata', () => { video.currentTime = 0; this.startDetailPingPong(video); }, { once: true });
      this.setupVideoScrubber(video);
    }

    this.closeModal('modal-select');

    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById('screen-detail').classList.add('active');
  },

  startDetailPingPong(video) {
    if (this._detailAnimId) cancelAnimationFrame(this._detailAnimId);
    const cycleDuration = 16000;
    let startTs = null;
    this._detailPaused = false;

    const tick = (ts) => {
      if (this._detailPaused || !video.duration) {
        this._detailAnimId = requestAnimationFrame(tick);
        return;
      }
      if (!startTs) startTs = ts;
      const elapsed = (ts - startTs) % cycleDuration;
      const t = elapsed / cycleDuration;
      const eased = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
      video.currentTime = eased * video.duration;
      this._detailAnimId = requestAnimationFrame(tick);
    };
    this._detailAnimId = requestAnimationFrame(tick);
  },

  setupVideoScrubber(video) {
    const dragArea = document.querySelector('.detail-layout');
    const hint = document.querySelector('.detail-scrub-hint');
    let isDragging = false;
    let startX = 0;
    let startTime = 0;

    const onStart = (x) => {
      isDragging = true;
      this._detailPaused = true;
      startX = x;
      startTime = video.currentTime;
      video.pause();
      if (hint) hint.style.opacity = '0';
    };
    const onMove = (x) => {
      if (!isDragging || !video.duration) return;
      const delta = x - startX;
      const sensitivity = (video.duration / dragArea.clientWidth) * -3;
      let newTime = startTime + (delta * sensitivity);
      newTime = ((newTime % video.duration) + video.duration) % video.duration;
      video.currentTime = newTime;
    };
    const onEnd = () => {
      isDragging = false;
      this._detailPaused = false;
    };

    dragArea.onmousedown = (e) => { if (!e.target.closest('button')) onStart(e.clientX); };
    dragArea.onmousemove = (e) => onMove(e.clientX);
    dragArea.onmouseup = onEnd;
    dragArea.onmouseleave = onEnd;
    dragArea.ontouchstart = (e) => { if (!e.target.closest('button')) { e.preventDefault(); onStart(e.touches[0].clientX); } };
    dragArea.ontouchmove = (e) => { if (isDragging) { e.preventDefault(); onMove(e.touches[0].clientX); } };
    dragArea.ontouchend = onEnd;
  },

  goBackFromDetail() {
    if (this._detailAnimId) { cancelAnimationFrame(this._detailAnimId); this._detailAnimId = null; }
    this.goToScreen(6);
    this.openPartModal(appState.composerActiveSlot);
  },

  applyComponentFromDetail() {
    this.applyComponent(this.currentDetailProductId, appState.composerActiveSlot);
    this.goToScreen(6);
  },

  applyComponent(id, slot) {
    appState.look[slot] = id;
    this.closeModal('modal-select');
    
    // Update Node UI
    const nodeClass = slot === 'top' ? '.top-node .node-btn' : '.bottom-node .node-btn';
    const btn = document.querySelector(nodeClass);
    btn.classList.add('has-item');
    btn.innerHTML = `<i class="ph ph-check"></i>`;

    this.checkFinishLookReady();
    this.loadModelImage();
  },

  checkFinishLookReady() {
    const btn = document.getElementById('btn-finish-look');
    if (appState.look.top || appState.look.bottom) {
      btn.disabled = false;
      
      // Update Tela 7 Summary
      const topProd = PRODUCTS.find(p => p.id === appState.look.top);
      const botProd = PRODUCTS.find(p => p.id === appState.look.bottom);
      
      document.getElementById('summary-top').innerText = topProd ? topProd.name : 'Nenhum Top';
      document.getElementById('summary-bottom').innerText = botProd ? botProd.name : 'Nenhum Bottom';
    } else {
      btn.disabled = true;
    }
  },

  // TELA 7
  finishSession(wantsSurprise) {
    if (wantsSurprise) {
      this.goToScreen(8);
      this.generateSurpriseQR();
    } else {
      this.resetProtocol();
    }
  },

  generateSurpriseQR() {
    const phone = '5544997607545';
    const msg = encodeURIComponent(`Oi! Vim do totem e quero minha surpresa! 🎁\nNome: ${appState.user.nome}\nEmpresa: ${appState.user.empresa}`);
    const url = `https://wa.me/${phone}?text=${msg}`;
    const container = document.getElementById('qr-container');
    container.innerHTML = '';
    new QRCode(container, {
      text: url,
      width: 320,
      height: 320,
      colorDark: '#111216',
      colorLight: '#FFFFFF',
      correctLevel: QRCode.CorrectLevel.M
    });
  },

  finishFromQR() {
    this.resetProtocol();
  }
};

/* THREE.JS — removed (using photo viewer + video scrubber now) */

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  app.init();
});
