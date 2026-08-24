/**
 * SIMPLIFIED STATE MANAGEMENT
 * Replaces 01-state.js (manual global variables) with a cleaner pattern.
 * Compatible with current code, but foundation for Zustand migration.
 */
(function(global) {
  'use strict';
  
  const LGMDM = global.LGMDM = global.LGMDM || {};
  
  // Canonical state object
  const state = {
    // File & Session
    selectedFile: null,
    cachedFileBuffer: null,
    previewSessionId: null,
    previewLibraryId: null,
    currentJobId: null,
    downloadUrl: null,
    
    // Analysis & AI
    lastAnalysisData: null,
    aiChatHistory: [],
    aiAvailable: null,
    
    // Theme & UI
    themeColorsCache: null,
    currentTheme: 'dark',
    
    // Mixer
    mixer: {
      stems: {},
      sessionId: null,
      jobId: null,
      polling: null,
      stemLibrary: [],
      stemLibraryLoaded: false,
    },
    
    // Preview & Metering
    preview: {
      debounceTimer: null,
      abortController: null,
      audioUrl: null,
      ws: null,
    },
    meters: {
      audioCtx: null,
      sourceNode: null,
      analyserL: null,
      analyserR: null,
      rafId: null,
      splitter: null,
      lufsRingBuffer: [],
    },
  };
  
  // Subscribers for reactive updates (simple pub/sub)
  const subscribers = new Map();
  
  function subscribe(key, callback) {
    if (!subscribers.has(key)) {
      subscribers.set(key, []);
    }
    subscribers.get(key).push(callback);
    
    // Return unsubscribe function
    return () => {
      const subs = subscribers.get(key);
      const idx = subs.indexOf(callback);
      if (idx !== -1) subs.splice(idx, 1);
    };
  }
  
  function notify(key, value) {
    if (!subscribers.has(key)) return;
    subscribers.get(key).forEach(cb => {
      try { cb(value); } catch (err) {
        console.error(`[State] Subscriber error for key "${key}":`, err);
      }
    });
  }
  
  function setValue(key, value) {
    const old = state[key];
    if (old === value) return; // No change
    state[key] = value;
    notify(key, value);
  }
  
  // Proxy for backward compatibility with window.selectedFile etc.
  function createBackwardCompatProxy(key) {
    Object.defineProperty(global, key, {
      get: () => state[key],
      set: (value) => setValue(key, value),
      configurable: true,
    });
  }
  
  createBackwardCompatProxy('selectedFile');
  createBackwardCompatProxy('lastAnalysisData');
  
  LGMDM.state = state;
  LGMDM.subscribe = subscribe;
  LGMDM.notify = notify;
  LGMDM.setValue = setValue;
  
})(window);