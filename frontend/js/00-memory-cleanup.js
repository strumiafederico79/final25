// ============================================================
// 00-memory-cleanup.js — Cleanup de memory leaks
// Fix #2: Fetch timeout + Fix #3: Listener cleanup
// ============================================================

(function() {
  "use strict";

  // FIX #2: Fetch con timeout automático
  const originalFetch = window.fetch;
  window.fetch = function(url, options = {}) {
    const timeoutMs = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return originalFetch.call(this, url, {
      ...options,
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        return response;
      })
      .catch(error => {
        clearTimeout(timeoutId);
        console.error(`[Fetch] ${url} failed:`, error.message);
        throw error;
      });
  };

  // FIX #3: Registry de listeners para cleanup
  const listenerRegistry = new Map();
  let listenerId = 0;

  window.safeListener = function(element, event, handler, options = false) {
    if (!element) return null;

    const id = ++listenerId;
    const wrappedHandler = function(e) {
      try {
        handler.call(this, e);
      } catch (error) {
        console.error(`[Listener Error] ${event}:`, error);
      }
    };

    element.addEventListener(event, wrappedHandler, options);
    listenerRegistry.set(id, { element, event, handler: wrappedHandler });
    
    return id;
  };

  window.removeListener = function(id) {
    const listener = listenerRegistry.get(id);
    if (listener) {
      listener.element.removeEventListener(listener.event, listener.handler);
      listenerRegistry.delete(id);
      return true;
    }
    return false;
  };

  window.cleanupAllListeners = function() {
    listenerRegistry.forEach(({ element, event, handler }) => {
      try {
        element.removeEventListener(event, handler);
      } catch (e) {}
    });
    listenerRegistry.clear();
    console.log(`✅ Cleaned up ${listenerRegistry.size} listeners`);
  };

  // Cleanup al descargar
  window.addEventListener('beforeunload', () => {
    window.cleanupAllListeners();
  });

  console.log("✅ Memory cleanup cargado");
})();
