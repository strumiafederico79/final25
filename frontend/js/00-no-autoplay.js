// ============================================================
// 00-no-autoplay.js — Bloqueo total de autoplay
// Debe cargar PRIMERO en index.html
// ============================================================

(function() {
  "use strict";

  // Interceptar creación de elementos audio
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName, ...args) {
    const element = originalCreateElement.call(document, tagName, ...args);
    
    if (tagName.toLowerCase() === 'audio') {
      // Nunca autoplay
      Object.defineProperty(element, 'autoplay', {
        set: function() { /* ignorar */ },
        get: function() { return false; }
      });
    }
    
    return element;
  };

  // Interceptar innerHTML assignments
  const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  const originalSetter = descriptor.set;

  Object.defineProperty(Element.prototype, 'innerHTML', {
    set: function(html) {
      if (typeof html === 'string' && html.includes('autoplay')) {
        // Remover autoplay del HTML string
        html = html.replace(/\s*autoplay\s*/gi, '');
        console.warn('⚠️ autoplay removido de innerHTML');
      }
      return originalSetter.call(this, html);
    },
    get: descriptor.get,
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable
  });

  // Bloquear setAttribute autoplay
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    if (name.toLowerCase() === 'autoplay') {
      console.warn('⚠️ Intento de setAttribute autoplay bloqueado');
      return;
    }
    return originalSetAttribute.call(this, name, value);
  };

  // Al cargar, remover todos los autoplay existentes
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('audio[autoplay]').forEach(audio => {
      audio.removeAttribute('autoplay');
      audio.pause();
      console.log('✅ autoplay removido de audio element');
    });
  });

  // Interceptar también en caso de que se cree después
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element
            if (node.tagName === 'AUDIO' && node.hasAttribute('autoplay')) {
              node.removeAttribute('autoplay');
              console.log('✅ autoplay removido de audio creado dinámicamente');
            }
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  console.log('✅ No-autoplay lock activado (bloqueo total)');
})();
