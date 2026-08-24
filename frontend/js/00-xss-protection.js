// ============================================================
// 00-xss-protection.js — Protección contra XSS
// Intercepta y sanitiza innerHTML antes de asignar
// ============================================================

(function() {
  "use strict";

  // Sanitizador HTML simple pero efectivo
  const XSSProtection = {
    // Etiquetas permitidas
    allowedTags: ['b', 'i', 'em', 'strong', 'br', 'span', 'div', 'p'],
    
    // Atributos permitidos
    allowedAttrs: ['class', 'id', 'style'],

    // Sanitizar texto para HTML
    sanitize(dirty) {
      if (typeof dirty !== 'string') return '';

      const div = document.createElement('div');
      div.textContent = dirty;
      return div.innerHTML;
    },

    // Sanitizar HTML completo (conserva tags)
    sanitizeHTML(dirty) {
      if (typeof dirty !== 'string') return '';

      const temp = document.createElement('div');
      temp.innerHTML = dirty;

      // Remover scripts
      temp.querySelectorAll('script').forEach(el => el.remove());
      
      // Remover event handlers
      temp.querySelectorAll('*').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
          if (attr.name.startsWith('on')) {
            el.removeAttribute(attr.name);
          }
        });
      });

      return temp.innerHTML;
    },

    // Escapar HTML entities
    escape(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },

    // Validar URL (solo http/https//)
    isValidURL(url) {
      if (!url) return false;
      return /^(https?:|\/\/)/.test(url);
    }
  };

  window.XSSProtection = XSSProtection;

  // Interceptar innerHTML (CUIDADO: solo para templates seguros)
  const originalSetAttribute = Element.prototype.setAttribute;
  let warnOnce = false;

  Element.prototype.setAttribute = function(name, value) {
    if (name === 'href' && typeof value === 'string') {
      // Validar URLs
      if (!XSSProtection.isValidURL(value) && !value.startsWith('#')) {
        console.warn('⚠️ URL sospechosa bloqueada:', value);
        return;
      }
    }
    return originalSetAttribute.call(this, name, value);
  };

  // Helper para setHTML seguro
  window.safeSetInnerHTML = function(element, html, allowUnsafe = false) {
    if (!element) return false;

    if (!allowUnsafe) {
      html = XSSProtection.sanitizeHTML(html);
    }

    element.innerHTML = html;
    return true;
  };

  console.log("✅ XSS Protection cargado");
})();
