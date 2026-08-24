/**
 * CLEANUP MODULE
 * Handles teardown of event listeners, Web Audio contexts, and memory
 * to prevent leaks when components unmount or mode switches.
 */
(function(global) {
  'use strict';
  
  const LGMDM = global.LGMDM = global.LGMDM || {};
  const cleanup = LGMDM.cleanup = LGMDM.cleanup || {};
  
  // Track all active listeners for cleanup
  const listeners = [];
  const timers = [];
  const audioResources = [];
  
  /**
   * Safe addEventListener with automatic cleanup tracking
   * @param {Element|Window|Document} target
   * @param {string} event
   * @param {Function} handler
   * @param {Object} options
   * @returns {Function} unsubscribe function
   */
  function on(target, event, handler, options = {}) {
    if (!target || !event || !handler) return () => {};
    
    const safeHandler = (e) => {
      try {
        handler(e);
      } catch (err) {
        console.error(`[Cleanup] Error in listener for ${event}:`, err);
      }
    };
    
    target.addEventListener(event, safeHandler, options);
    
    const unsubscribe = () => {
      target.removeEventListener(event, safeHandler, options);
      const idx = listeners.indexOf(unsubscribe);
      if (idx !== -1) listeners.splice(idx, 1);
    };
    
    listeners.push(unsubscribe);
    return unsubscribe;
  }
  
  /**
   * Safe setTimeout with automatic cleanup tracking
   * @param {Function} fn
   * @param {number} delay
   * @returns {number} timeoutId
   */
  function timeout(fn, delay) {
    const id = global.setTimeout(() => {
      try { fn(); } catch (err) { console.error('[Cleanup] Timeout error:', err); }
      const idx = timers.indexOf(id);
      if (idx !== -1) timers.splice(idx, 1);
    }, delay);
    timers.push(id);
    return id;
  }
  
  /**
   * Safely disconnect Web Audio node
   * @param {AudioNode} node
   */
  function disconnectAudioNode(node) {
    if (!node) return;
    try {
      if (typeof node.disconnect === 'function') {
        node.disconnect();
      }
    } catch (err) {
      console.warn('[Cleanup] Error disconnecting audio node:', err);
    }
  }
  
  /**
   * Safely close Web Audio context
   * @param {AudioContext|OfflineAudioContext} ctx
   */
  function closeAudioContext(ctx) {
    if (!ctx) return;
    try {
      if (ctx.state !== 'closed') {
        // Cancel all scheduled events
        if (ctx.currentTime !== undefined) {
          // Cannot actually cancel, but we can close
        }
        ctx.close();
      }
    } catch (err) {
      console.warn('[Cleanup] Error closing audio context:', err);
    }
  }
  
  /**
   * Register an audio resource for cleanup
   * @param {AudioNode|AudioContext} resource
   * @returns {Function} cleanup function
   */
  function registerAudioResource(resource) {
    audioResources.push(resource);
    return () => {
      const idx = audioResources.indexOf(resource);
      if (idx !== -1) audioResources.splice(idx, 1);
    };
  }
  
  /**
   * Revoke all object URLs created by URL.createObjectURL
   */
  function revokeObjectURLs(urls = []) {
    urls.forEach(url => {
      try { URL.revokeObjectURL(url); } catch (err) {}
    });
  }
  
  /**
   * Nuclear option: cleanup everything
   */
  function purgeAll() {
    // Remove all event listeners
    listeners.forEach(unsub => unsub());
    listeners.length = 0;
    
    // Clear all timeouts
    timers.forEach(id => global.clearTimeout(id));
    timers.length = 0;
    
    // Disconnect all audio nodes
    audioResources.forEach(resource => {
      if (resource.disconnect) disconnectAudioNode(resource);
      else if (resource.close) closeAudioContext(resource);
    });
    audioResources.length = 0;
  }
  
  Object.assign(cleanup, {
    on,
    timeout,
    disconnectAudioNode,
    closeAudioContext,
    registerAudioResource,
    revokeObjectURLs,
    purgeAll,
  });
  
  // Auto-cleanup on page unload
  on(global, 'beforeunload', purgeAll);
  on(global, 'unload', purgeAll);
  
})(window);