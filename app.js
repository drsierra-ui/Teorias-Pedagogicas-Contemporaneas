document.documentElement.classList.add('js');

// Content visibility is never dependent on JavaScript animations.
// When a hash link is activated, explicitly expose its scene before scrolling.
function revealScene(target) {
  if (!target) return;
  target.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
}

for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href');
    if (!selector || selector === '#') return;
    const target = document.querySelector(selector);
    if (!target) return;
    revealScene(target);

    // In presentation mode, normal anchor scrolling cannot work because only one
    // slide is displayed. Internal links therefore activate the target scene.
    if (presentationMode) {
      const scene = target.classList.contains('scene') ? target : target.closest('.scene');
      const index = scene ? scenes.indexOf(scene) : -1;
      if (index >= 0) {
        event.preventDefault();
        activatePresentationScene(index);
      }
    }
  });
}

window.addEventListener('hashchange', () => {
  if (location.hash) revealScene(document.querySelector(location.hash));
});
if (location.hash) revealScene(document.querySelector(location.hash));

// -------- Tabs: each button has an explicit, visible action --------
for (const group of document.querySelectorAll('[data-panel-group]')) {
  const tabs = [...group.querySelectorAll('.panel-tab')];
  const panels = [...group.querySelectorAll('.panel-content')];
  const status = group.querySelector('.panel-status');

  tabs.forEach((tab, index) => {
    const selected = tab.classList.contains('active');
    tab.setAttribute('tabindex', selected ? '0' : '-1');
    if (!tab.id) tab.id = `${tab.dataset.panel}-tab`;
    const panel = group.querySelector(`#${tab.dataset.panel}`);
    if (panel) panel.setAttribute('aria-labelledby', tab.id);
  });

  const activate = (tab, focus = false) => {
    const targetId = tab.dataset.panel;
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-selected', String(selected));
      item.setAttribute('tabindex', selected ? '0' : '-1');
    });
    panels.forEach((panel) => {
      const visible = panel.id === targetId;
      panel.hidden = !visible;
      panel.classList.toggle('active', visible);
      if (visible) {
        panel.style.animation = 'none';
        void panel.offsetWidth;
        panel.style.animation = '';
      }
    });
    if (status) status.textContent = `Mostrando: ${tab.textContent.trim()}`;
    if (focus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      activate(tabs[next], true);
    });
  });
}

// -------- Interactive connectivist network --------
const networkMessage = document.getElementById('networkMessage');
for (const node of document.querySelectorAll('.node-button')) {
  node.addEventListener('click', () => {
    document.querySelectorAll('.node-button').forEach((item) => item.classList.remove('active'));
    node.classList.add('active');
    if (networkMessage) networkMessage.textContent = node.dataset.message;
  });
}

// -------- Comparative explorer --------
const comparisons = {
  aprendizaje: {
    build: ['Construyendo y reconstruyendo', 'La experiencia, la interacción y la resolución de problemas transforman las representaciones del aprendiz.'],
    relate: ['Integrando significados', 'La nueva información se vincula de forma sustantiva con conocimientos previos relevantes.'],
    connect: ['Gestionando redes', 'El aprendizaje incluye crear, valorar y actualizar conexiones entre múltiples nodos.']
  },
  conocimiento: {
    build: ['Construcción situada', 'El conocimiento se reorganiza en la actividad del sujeto y en su interacción con el contexto social y cultural.'],
    relate: ['Estructura cognitiva', 'Los significados se integran y reorganizan mediante relaciones entre conocimientos nuevos y saberes previos.'],
    connect: ['Distribución en redes', 'Parte del conocimiento puede residir en personas, comunidades, repositorios, bases de datos y otros nodos.']
  },
  docente: {
    build: ['Mediador', 'Diseña experiencias, formula preguntas, organiza interacción y ajusta apoyos durante la construcción del aprendizaje.'],
    relate: ['Organizador conceptual', 'Explora saberes previos, secuencia contenidos y facilita relaciones conceptuales comprensibles.'],
    connect: ['Facilitador y curador', 'Ayuda a construir redes, evaluar fuentes y sostener conexiones pertinentes y actualizadas.']
  },
  estudiante: {
    build: ['Constructor activo', 'Explora, argumenta, colabora, prueba explicaciones y revisa sus propias representaciones.'],
    relate: ['Constructor de relaciones', 'Activa, compara, jerarquiza, diferencia y reconcilia conceptos para comprender con sentido.'],
    connect: ['Gestor de su red', 'Busca, filtra, contrasta, comparte y actualiza conexiones con criterio y autonomía.']
  },
  tecnologia: {
    build: ['Entorno de acción y colaboración', 'Puede apoyar problemas auténticos, simulaciones, producción conjunta y discusión, si el diseño pedagógico lo exige.'],
    relate: ['Soporte para representar relaciones', 'Puede ayudar a activar saberes previos, organizar conceptos y ofrecer representaciones múltiples.'],
    connect: ['Infraestructura de la red', 'Facilita acceso, circulación, actualización y enlace entre personas, recursos, datos y comunidades.']
  },
  evidencia: {
    build: ['Cambio en el desempeño y las explicaciones', 'Se observa en soluciones, argumentos, productos, decisiones y revisión de ideas iniciales.'],
    relate: ['Reorganización conceptual y transferencia', 'Se evidencia al explicar relaciones, integrar conceptos y usar lo aprendido en nuevas situaciones.'],
    connect: ['Calidad y pertinencia de conexiones', 'Se observa en la selección de fuentes, diversidad de nodos, trazabilidad y actualización de la red.']
  }
};

const compareTargets = {
  buildTitle: document.getElementById('compareBuildTitle'),
  buildText: document.getElementById('compareBuildText'),
  relateTitle: document.getElementById('compareRelateTitle'),
  relateText: document.getElementById('compareRelateText'),
  connectTitle: document.getElementById('compareConnectTitle'),
  connectText: document.getElementById('compareConnectText')
};

for (const button of document.querySelectorAll('.compare-btn')) {
  button.addEventListener('click', () => {
    document.querySelectorAll('.compare-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const item = comparisons[button.dataset.compare];
    compareTargets.buildTitle.textContent = item.build[0];
    compareTargets.buildText.textContent = item.build[1];
    compareTargets.relateTitle.textContent = item.relate[0];
    compareTargets.relateText.textContent = item.relate[1];
    compareTargets.connectTitle.textContent = item.connect[0];
    compareTargets.connectText.textContent = item.connect[1];
  });
}

// -------- One situation, three perspectives --------
const scenarios = {
  constructivismo: {
    label: 'Constructivismo',
    title: 'Aprender resolviendo un problema auténtico',
    text: 'Los estudiantes analizan publicaciones reales, confrontan criterios, argumentan y construyen colaborativamente una guía de verificación. El docente organiza el problema y acompaña el proceso sin sustituir la actividad del grupo.',
    steps: ['Analizar', 'Debatir', 'Contrastar', 'Construir']
  },
  significativo: {
    label: 'Aprendizaje significativo',
    title: 'Relacionar el problema con saberes previos',
    text: 'El proceso inicia recuperando ideas sobre fuente, evidencia y confiabilidad. Después se incorporan conceptos nuevos y se reconstruye un mapa conceptual que muestre cómo cambió la comprensión del fenómeno.',
    steps: ['Evocar', 'Relacionar', 'Reorganizar', 'Explicar']
  },
  conectivismo: {
    label: 'Conectivismo',
    title: 'Construir una red de verificación y aprendizaje',
    text: 'Los estudiantes conectan verificadores, medios, expertos, repositorios y herramientas; comparan criterios, justifican la confiabilidad de los nodos y documentan una red personal que pueda actualizarse.',
    steps: ['Buscar', 'Filtrar', 'Conectar', 'Actualizar']
  }
};

const scenarioContent = document.getElementById('scenarioContent');
for (const button of document.querySelectorAll('.scenario-btn')) {
  button.addEventListener('click', () => {
    document.querySelectorAll('.scenario-btn').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const data = scenarios[button.dataset.scenario];
    scenarioContent.innerHTML = `
      <span class="scenario-label">${data.label}</span>
      <h3>${data.title}</h3>
      <p>${data.text}</p>
      <div class="scenario-steps">${data.steps.map((step) => `<span>${step}</span>`).join('')}</div>
    `;
    scenarioContent.style.animation = 'none';
    void scenarioContent.offsetWidth;
    scenarioContent.style.animation = 'panelIn .32s ease both';
  });
}

// -------- Reading progress + presentation mode --------
const progressBar = document.getElementById('progressBar');
const toTop = document.getElementById('toTop');
const navLinks = [...document.querySelectorAll('.nav-link')];
const scenes = [...document.querySelectorAll('.scene')];

// Presentation controls are initialized BEFORE the first scroll-state calculation.
// This avoids a Temporal Dead Zone error that previously stopped the script
// before the presentation button listeners were attached.
const presentationToggle = document.getElementById('presentationToggle');
const presentationToolbar = document.getElementById('presentationToolbar');
const presentationChrome = document.querySelector('.presentation-chrome');
const homeScene = document.getElementById('homeScene');
const prevScene = document.getElementById('prevScene');
const nextScene = document.getElementById('nextScene');
const exitPresentation = document.getElementById('exitPresentation');
const sceneCounter = document.getElementById('sceneCounter');

let currentSceneIndex = 0;
let presentationMode = false;

function updatePresentationCounter() {
  if (!sceneCounter || !scenes.length) return;
  const scene = scenes[currentSceneIndex];
  sceneCounter.textContent = `${currentSceneIndex + 1} / ${scenes.length} · ${scene?.dataset.sceneTitle || ''}`;
  if (prevScene) prevScene.disabled = currentSceneIndex === 0;
  if (nextScene) nextScene.disabled = currentSceneIndex === scenes.length - 1;
}

function activatePresentationScene(index) {
  if (!scenes.length) return;
  currentSceneIndex = Math.max(0, Math.min(scenes.length - 1, index));
  scenes.forEach((scene, i) => {
    const active = i === currentSceneIndex;
    scene.classList.toggle('presentation-active', active);
    scene.setAttribute('aria-hidden', String(!active));
    if (active) revealScene(scene);
  });
  updatePresentationCounter();
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

function setPresentationMode(enabled) {
  presentationMode = Boolean(enabled);
  document.documentElement.classList.toggle('presentation-mode', presentationMode);

  if (presentationToggle) {
    presentationToggle.setAttribute('aria-pressed', String(presentationMode));
    presentationToggle.textContent = presentationMode ? '■ Salir de presentación' : '▶ Modo presentación';
  }
  if (presentationChrome) presentationChrome.setAttribute('aria-hidden', String(!presentationMode));

  // Presentation always begins on the cover, regardless of the section that
  // was visible when the user pressed the button.
  currentSceneIndex = 0;

  if (presentationMode) {
    if (presentationToolbar) presentationToolbar.hidden = false;
    activatePresentationScene(0);
    document.body.focus?.();
  } else {
    if (presentationToolbar) presentationToolbar.hidden = true;
    scenes.forEach((scene) => {
      scene.classList.remove('presentation-active');
      scene.removeAttribute('aria-hidden');
    });
    const cover = document.getElementById('portada');
    requestAnimationFrame(() => {
      cover?.scrollIntoView({ behavior: 'auto', block: 'start' });
      try { history.replaceState(null, '', '#portada'); } catch (_) { location.hash = 'portada'; }
      updateScrollUI();
    });
  }
}

function detectCurrentScene() {
  if (!scenes.length || presentationMode) return;
  const marker = window.scrollY + Math.min(220, window.innerHeight * .35);
  let index = 0;
  scenes.forEach((scene, i) => {
    if (scene.offsetTop <= marker) index = i;
  });
  currentSceneIndex = index;
  const currentId = scenes[index]?.id;
  navLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${currentId}`;
    link.classList.toggle('active', active);
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  updatePresentationCounter();
}

function updateScrollUI() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  if (progressBar) progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  if (toTop) toTop.classList.toggle('visible', window.scrollY > 700 && !presentationMode);
  detectCurrentScene();
}

// Attach presentation listeners before any initial state calculation.
if (presentationToggle) {
  presentationToggle.addEventListener('click', () => setPresentationMode(!presentationMode));
}
window.__presentationReady = Boolean(presentationToggle);
if (exitPresentation) exitPresentation.addEventListener('click', () => setPresentationMode(false));
if (homeScene) homeScene.addEventListener('click', () => activatePresentationScene(0));
if (prevScene) prevScene.addEventListener('click', () => activatePresentationScene(currentSceneIndex - 1));
if (nextScene) nextScene.addEventListener('click', () => activatePresentationScene(currentSceneIndex + 1));

window.addEventListener('scroll', updateScrollUI, { passive: true });
window.addEventListener('resize', updateScrollUI);
if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

document.addEventListener('keydown', (event) => {
  if (!presentationMode) return;
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;

  if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
    event.preventDefault();
    activatePresentationScene(currentSceneIndex + 1);
  } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
    event.preventDefault();
    activatePresentationScene(currentSceneIndex - 1);
  } else if (event.key === 'Escape') {
    event.preventDefault();
    setPresentationMode(false);
  }
});

// Safe initial calculation: every presentation dependency is already initialized.
updateScrollUI();

// -------- Reveal animations with reduced-motion respect --------
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}
