(function(){
  'use strict';
  function mirror(fromId, toId){
    const from=document.getElementById(fromId), to=document.getElementById(toId);
    if(!from||!to) return;
    const sync=()=>{ to.textContent=(from.textContent||'').trim() || '—'; };
    sync();
    new MutationObserver(sync).observe(from,{childList:true,subtree:true,characterData:true});
  }
  const boot=()=>{
    mirror('consoleTrackTitle','consoleTrackTitleTop');
    mirror('consoleTrackMeta','consoleTrackMetaTop');
    mirror('consoleLufs','healthLufs');
    mirror('consoleTruePeak','healthPeak');
    mirror('consoleMeterMode','healthMode');
    document.getElementById('quickAI')?.addEventListener('click',()=>document.getElementById('aiFab')?.click());
    document.getElementById('quickPitch')?.addEventListener('click',()=>document.getElementById('btnPitchCorrection')?.click());
    document.getElementById('quickMeter')?.addEventListener('click',()=>document.querySelector('[data-pane="pane-salida"]')?.click());
    document.getElementById('quickReference')?.addEventListener('click',()=>document.getElementById('btnOpenRefLib')?.click());
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
