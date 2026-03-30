// ui-sync.js
document.addEventListener('DOMContentLoaded', () => {
  function loadTaskState() {
    try {
      return JSON.parse(localStorage.getItem('taskState')) || null;
    } catch (e) {
      return null;
    }
  }

  function applyStateToBtn(btnId, stateObj) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (stateObj?.claimed) {
      btn.dataset.state = 'done';
      btn.disabled = true;
      btn.innerText = btn.getAttribute('data-done-text') || 'Done';
    } else if (stateObj?.started) {
      btn.dataset.state = 'claim';
      btn.disabled = false;
      btn.innerText = btn.getAttribute('data-claim-text') || 'Claim';
    } else {
      btn.dataset.state = '';
      btn.disabled = false;
      btn.innerText = btn.getAttribute('data-start-text') || 'Start';
    }
  }

  const ts = loadTaskState();
  if (!ts) return;

  // adapt to both shapes: keyed by taskId or legacy telegram object
  if (ts.telegram && !ts.telegram_channel) {
    applyStateToBtn('tgBtn', ts.telegram);
  } else {
    applyStateToBtn('tgBtn', ts.telegram_channel || ts.telegram);
    applyStateToBtn('btn-twitter', ts.twitter_follow || {});
    applyStateToBtn('btn-invite', ts.invite || {});
  }

  // update balance display
  const bal = parseFloat(localStorage.getItem('balance')) || 0;
  const el = document.getElementById('balance');
  if (el) el.innerText = bal.toFixed(2) + ' TON';
});
