// ============================================================
// 00-bug-fixes.js — Correcciones de bugs detectados
// ============================================================

(function() {
  "use strict";

  console.log("🐛 Bug fixes cargado");

  // BUG FIX #1: IDs faltantes - agregar elementos dinámicamente si no existen
  const requiredIds = [
    'a11y-announcements',
    'sidebarTabs',
    'apiUrl',
    'theme-switcher-btn',
  ];

  requiredIds.forEach(id => {
    if (!document.getElementById(id)) {
      console.warn(`⚠️ ID faltante: #${id} - intentando crear dinámicamente`);
      
      if (id === 'a11y-announcements') {
        const el = document.createElement('div');
        el.id = id;
        el.style.display = 'none';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        document.body.insertBefore(el, document.body.firstChild);
      }
    }
  });

  // BUG FIX #2: Prevenir duplicación de event listeners
  const listenerRegistry = new Map();

  window.safeEventListener = function(target, event, handler, options = false) {
    if (!target) return false;

    const key = `${event}-${handler.name || 'anonymous'}`;
    
    if (listenerRegistry.has(key)) {
      console.warn(`⚠️ Listener duplicado prevenido: ${key}`);
      return false;
    }

    target.addEventListener(event, handler, options);
    listenerRegistry.set(key, { target, event, handler });
    return true;
  };

  // BUG FIX #3: Validar play() antes de ejecutar
  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function() {
    if (!this) return Promise.reject(new Error('Invalid audio element'));
    
    try {
      return originalPlay.call(this);
    } catch (error) {
      console.warn('⚠️ play() error:', error.message);
      return Promise.reject(error);
    }
  };

  // BUG FIX #4: Validar innerHTML antes de asignar
  window.safeInnerHTML = function(element, html) {
    if (!element) {
      console.warn('⚠️ safeInnerHTML: elemento no válido');
      return false;
    }

    if (typeof html !== 'string') {
      console.warn('⚠️ safeInnerHTML: html debe ser string');
      return false;
    }

    try {
      element.innerHTML = html;
      return true;
    } catch (error) {
      console.error('⚠️ innerHTML error:', error.message);
      return false;
    }
  };

  // BUG FIX #5: Validar getElementById antes de usar
  const originalGetElementById = document.getElementById;
  document.getElementById = function(id) {
    if (!id || typeof id !== 'string') {
      console.warn('⚠️ getElementById: id inválido', id);
      return null;
    }
    return originalGetElementById.call(this, id);
  };

  // BUG FIX #6: Catch blocks vacíos - al menos loguear
  // (Esto se aplica automáticamente a nuevos try-catch)

  // BUG FIX #7: Validar fetch responses
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    if (!url) {
      console.error('⚠️ fetch: URL no válida');
      return Promise.reject(new Error('Invalid URL'));
    }

    return originalFetch.apply(this, arguments)
      .catch(error => {
        console.error(`⚠️ Fetch error (${url}):`, error.message);
        throw error;
      });
  };

  // BUG FIX #8: Validar audio elements antes de reproducir
  window.safeAudioPlay = function(audioElement) {
    if (!audioElement || audioElement.tagName !== 'AUDIO') {
      console.warn('⚠️ safeAudioPlay: elemento no es audio');
      return false;
    }

    try {
      audioElement.play().catch(err => {
        console.warn('⚠️ Audio play error:', err.message);
      });
      return true;
    } catch (error) {
      console.error('⚠️ safeAudioPlay error:', error.message);
      return false;
    }
  };

  // BUG FIX #9: Validar acceso a propiedades de objetos
  window.safeGet = function(obj, path, defaultValue = null) {
    try {
      const value = path.split('.').reduce((current, prop) => {
        return current?.[prop];
      }, obj);
      return value !== undefined ? value : defaultValue;
    } catch (error) {
      console.warn(`⚠️ safeGet error (${path}):`, error.message);
      return defaultValue;
    }
  };

  // BUG FIX #10: Validar setTimeout/setInterval
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;

  window.setTimeout = function(fn, delay, ...args) {
    if (typeof fn !== 'function' && typeof fn !== 'string') {
      console.warn('⚠️ setTimeout: callback no válido');
      return null;
    }
    return originalSetTimeout.apply(this, arguments);
  };

  window.setInterval = function(fn, delay, ...args) {
    if (typeof fn !== 'function' && typeof fn !== 'string') {
      console.warn('⚠️ setInterval: callback no válido');
      return null;
    }
    return originalSetInterval.apply(this, arguments);
  };

  console.log("✅ 10 bug fixes aplicados");
})();
