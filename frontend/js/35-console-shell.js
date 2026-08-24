/* LGMDM — Console Shell
 * Layout controller para el nuevo grid de 3 paneles de la consola
 * (#cnsBody: plugins disponibles | consola central | rack activo).
 * Solo maneja el resize de los handles y el puente del mini-chat
 * hacia el asistente real (aiPanel/aiInput/aiSend) — no duplica
 * lógica de IA, no simula nada.
 */
(function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function setupHandle(handleId, cssVar, minVar, maxVar, fromRight) {
    const handle = byId(handleId);
    const shell = document.querySelector('.cns-shell');
    if (!handle || !shell) return;

    const root = shell;
    let dragging = false;
    let startX = 0;
    let startW = 0;

    function currentWidth() {
      const val = getComputedStyle(root).getPropertyValue(cssVar).trim();
      return parseFloat(val) || 0;
    }
    function bounds() {
      const min = parseFloat(getComputedStyle(root).getPropertyValue(minVar)) || 160;
      const max = parseFloat(getComputedStyle(root).getPropertyValue(maxVar)) || 480;
      return [min, max];
    }
    function onMove(e) {
      if (!dragging) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      let dx = x - startX;
      if (fromRight) dx = -dx;
      const [min, max] = bounds();
      const next = clamp(startW + dx, min, max);
      root.style.setProperty(cssVar, next + 'px');
    }
    function onUp() {
      dragging = false;
      handle.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }
    function onDown(e) {
      dragging = true;
      handle.classList.add('dragging');
      startX = e.touches ? e.touches[0].clientX : e.clientX;
      startW = currentWidth();
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
      e.preventDefault();
    }
    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: false });
  }

  function setupAgentBridge() {
    const quickInput = byId('cnsAgentQuickInput');
    const quickSend = byId('cnsAgentQuickSend');
    const preview = byId('cnsAgentPreview');
    const fab = byId('aiFab');
    const realInput = byId('aiInput');
    const realSend = byId('aiSend');
    const realPanel = byId('aiPanel');
    const realMessages = byId('aiMessages');
    if (!quickInput || !quickSend) return;

    function forward() {
      const text = quickInput.value.trim();
      if (!text || !realInput || !realSend || !fab) return;
      if (realPanel && realPanel.classList.contains('hidden')) fab.click();
      realInput.value = text;
      realInput.dispatchEvent(new Event('input', { bubbles: true }));
      realSend.click();
      quickInput.value = '';
    }
    quickSend.addEventListener('click', forward);
    quickInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); forward(); }
    });

    // Espeja el último mensaje del asistente real en la preview de la consola,
    // así el card no queda con el texto fijo apenas hay conversación.
    if (realMessages && preview && 'MutationObserver' in window) {
      const mirror = () => {
        const last = realMessages.lastElementChild;
        const text = last ? last.textContent.trim() : '';
        if (text) preview.textContent = text;
      };
      new MutationObserver(mirror).observe(realMessages, { childList: true, subtree: true });
    }
  }

  function install() {
    if (!document.querySelector('.cns-shell')) return;
    setupHandle('cnsHandleLeft', '--cns-left-w', '--cns-left-min', '--cns-left-max', false);
    setupHandle('cnsHandleRight', '--cns-right-w', '--cns-right-min', '--cns-right-max', true);
    setupAgentBridge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
