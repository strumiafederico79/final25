// ============================================================
// 00-error-wrapper.js — Error handling wrapper
// FIX #5: Logguear en catch blocks vacíos
// ============================================================

(function() {
  "use strict";

  // Wrapper para funciones con manejo de errores
  window.wrapFunction = function(fn, fnName = 'anonymous') {
    return function(...args) {
      try {
        return fn.apply(this, args);
      } catch (error) {
        console.error(`[Function Error] ${fnName}:`, error.message);
        console.debug(error.stack);
        return null;
      }
    };
  };

  // Wrapper para promesas
  window.wrapPromise = function(promise, context = 'Promise') {
    return promise
      .catch(error => {
        console.error(`[Promise Error] ${context}:`, error.message);
        console.debug(error.stack);
        return null;
      });
  };

  // Global error handler mejorado
  window.addEventListener('error', (event) => {
    console.error('[Uncaught Error]', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Rejection]', {
      reason: event.reason?.toString?.() || String(event.reason),
      stack: event.reason?.stack
    });
  });

  console.log("✅ Error wrapper cargado");
})();
