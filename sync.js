// ui-sync.js
(function () {
  'use strict';

  // Daftar tombol yang ingin disinkronkan: id tombol => task key di localStorage
  const BUTTON_MAP = {
    'tgBtn': 'telegram',        // kompatibel dengan app.js lama
    'btn-twitter': 'twitter_follow',
    'btn-invite': 'invite'
  };

  function safeParse(json) {
    try { return JSON.parse(json); } catch (e) { return null; }
  }

  function readTaskState() {
    const raw = localStorage.getItem('taskState');
    const ts = safeParse(raw);
    return ts || null;
  }

  function readBalance() {
    const b = parseFloat(localStorage.getItem('balance'));
    return Number.isFinite(b) ? b : 0;
  }

  function applyStateToButton(btn, state) {
    if (!btn) return;
    // prefer explicit attributes for texts, fallback ke default
    const startText = btn.getAttribute('data-start-text') || 'Start';
    const claimText = btn.getAttribute('data-claim-text') || 'Claim';
    const doneText  = btn.getAttribute('data-done-text')  || 'Done';

    if (!state) {
      btn.dataset.state = '';
      btn.disabled = false;
      btn.innerText = startText;
      return;
    }

    if (state.claimed) {
      btn.dataset.state = 'done';
      btn.disabled = true;
      btn.innerText = doneText;
    } else if (state.started) {
      btn.dataset.state = 'claim';
      btn.disabled = false;
      btn.innerText = claimText;
    } else {
      btn.dataset.state = '';
      btn.disabled = false;
      btn.innerText = startText;
    }
  }

  function applyAll() {
    const ts = readTaskState();

    // Backward compatibility: if ts has only telegram object (legacy), map it
    const legacyTelegram = ts && ts.telegram && !ts.telegram_channel && !ts.twitter_follow && !ts.invite;
    const mapped = {
      telegram: legacyTelegram ? ts.telegram : (ts && ts.telegram),
      telegram_channel: ts && ts.telegram_channel,
      twitter_follow: ts && ts.twitter_follow,
      invite: ts && ts.invite
    };

    // Update each button according to BUTTON_MAP
    Object.keys(BUTTON_MAP).forEach(btnId => {
      const taskKey = BUTTON_MAP[btnId];
      const btn = document.getElementById(btnId);
      // Resolve which state object to use:
      // prefer explicit taskKey in mapped, else fallback to legacy telegram
      let stateObj = mapped[taskKey] || mapped.telegram || null;
      // For btn-twitter map to twitter_follow explicitly if present
      if (taskKey === 'twitter_follow' && ts && ts.twitter_follow) stateObj = ts.twitter_follow;
      if (taskKey === 'invite' && ts && ts.invite) stateObj = ts.invite;
      applyStateToButton(btn, stateObj);
    });

    // Update balance display
    const balEl = document.getElementById('balance');
    if (balEl) {
      const b = readBalance();
      balEl.innerText = b.toFixed(2) + ' TON';
    }
  }

  // Apply on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }

  // Listen to storage events (sync across tabs)
  window.addEventListener('storage', (e) => {
    if (e.key === 'taskState' || e.key === 'balance' || e.key === null) {
      // small debounce to avoid thrash
      setTimeout(applyAll, 50);
    }
  });

  // Optional: observe local changes to task buttons triggered by other scripts
  // If app.js updates localStorage via saveData(), storage event won't fire in same tab,
  // so we poll localStorage periodically to catch same-tab updates.
  let lastTaskStateJson = localStorage.getItem('taskState');
  let lastBalance = localStorage.getItem('balance');

  setInterval(() => {
    const curTaskJson = localStorage.getItem('taskState');
    const curBal = localStorage.getItem('balance');
    if (curTaskJson !== lastTaskStateJson || curBal !== lastBalance) {
      lastTaskStateJson = curTaskJson;
      lastBalance = curBal;
      applyAll();
    }
  }, 700);

})();
