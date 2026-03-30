// ui-sync.js (safe, non-invasive)
(function(){
  'use strict';
  const MAP = { 'tgBtn':'telegram', 'btn-twitter':'twitter_follow', 'btn-invite':'invite' };

  function safeParse(s){ try{ return JSON.parse(s); }catch(e){return null;} }
  function readState(){ return safeParse(localStorage.getItem('taskState')) || null; }
  function readBalance(){ const b = parseFloat(localStorage.getItem('balance')); return Number.isFinite(b)?b:0; }

  function applyToButton(btnId, state){
    const btn = document.getElementById(btnId);
    if(!btn) return;
    const startText = btn.getAttribute('data-start-text') || 'Start';
    const claimText = btn.getAttribute('data-claim-text') || 'Claim';
    const doneText  = btn.getAttribute('data-done-text')  || 'Done';

    if(!state){
      btn.dataset.state = btn.dataset.state || '';
      btn.disabled = btn.disabled || false;
      // do not change innerText to avoid conflict with app.js
      return;
    }

    if(state.claimed){
      btn.dataset.state = 'done';
      if(!btn.disabled) btn.disabled = true;
      // do not override innerText if app.js already set it
      if(!btn.innerText || btn.innerText.trim() === '') btn.innerText = doneText;
    } else if(state.started){
      btn.dataset.state = 'claim';
      if(btn.disabled) btn.disabled = false;
      if(!btn.innerText || btn.innerText.trim() === '') btn.innerText = claimText;
    } else {
      btn.dataset.state = '';
      if(btn.disabled) btn.disabled = false;
      if(!btn.innerText || btn.innerText.trim() === '') btn.innerText = startText;
    }
  }

  function applyAll(){
    const ts = readState();

    // Backward compatibility: if ts has only telegram object (legacy), map it
    const legacyTelegram = ts && ts.telegram && !ts.telegram_channel && !ts.twitter_follow && !ts.invite;
    const mapped = {
      telegram: legacyTelegram ? ts.telegram : (ts && ts.telegram),
      telegram_channel: ts && ts.telegram_channel,
      twitter_follow: ts && ts.twitter_follow,
      invite: ts && ts.invite
    };

    Object.keys(MAP).forEach(btnId=>{
      const taskKey = MAP[btnId];
      const btn = document.getElementById(btnId);
      let stateObj = null;
      if(taskKey === 'telegram') stateObj = mapped.telegram || mapped.telegram_channel || ts && ts.telegram;
      else stateObj = mapped[taskKey] || null;
      applyToButton(btnId, stateObj);
    });

    const balEl = document.getElementById('balance');
    if(balEl) balEl.innerText = readBalance().toFixed(2) + ' TON';
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyAll);
  else applyAll();

  window.addEventListener('storage', (e)=>{
    if(e.key === 'taskState' || e.key === 'balance' || e.key === null) setTimeout(applyAll, 50);
  });

  // Poll same-tab changes (lightweight)
  let last = localStorage.getItem('taskState') + '|' + localStorage.getItem('balance');
  setInterval(()=>{
    const cur = localStorage.getItem('taskState') + '|' + localStorage.getItem('balance');
    if(cur !== last){ last = cur; applyAll(); }
  }, 800);
})();
