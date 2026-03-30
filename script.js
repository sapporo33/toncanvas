// app.js

// LOAD
let balance = parseFloat(localStorage.getItem("balance")) || 0;

let taskState;
try {
  taskState = JSON.parse(localStorage.getItem("taskState"));
} catch (e) {
  taskState = null;
}
if (!taskState) {
  taskState = { telegram: { started: false, claimed: false } };
}

// SAVE
function saveData() {
  try {
    localStorage.setItem("balance", balance);
    localStorage.setItem("taskState", JSON.stringify(taskState));
    console.log('saved', { balance, taskState });
  } catch (e) {
    console.error('saveData error', e);
  }
}

// NAV
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

// BALANCE
function updateBalance() {
  const el = document.getElementById('balance');
  if (el) el.innerText = balance.toFixed(2) + ' TON';
}

/*
  startTask supports two call styles:
  1) startTask(url, amount)                <-- original
  2) startTask(taskId, url, amount)        <-- newer HTML patterns
*/
window.startTask = function(url, amount) {
  // detect if caller used (taskId, url, amount)
  let taskId = null;
  let realUrl = url;
  let realAmount = amount;

  // If second argument is a string and looks like a URL, then caller likely used (taskId, url, amount)
  if (typeof amount === 'string' && (amount.startsWith('http') || amount.includes('t.me') || amount.includes('x.com') || amount.includes('twitter.com'))) {
    taskId = url;           // first param is taskId
    realUrl = amount;       // second param is url
    realAmount = arguments[2]; // third param is amount (may be undefined)
  }

  // If still no taskId, default to 'telegram' (keeps original behavior)
  if (!taskId) taskId = 'telegram';

  console.log('startTask', { taskId, realUrl, realAmount, taskState });

  // TELEGRAM-like tasks (detect by t.me or taskId === 'telegram' or taskId contains 'telegram')
  const isTelegramLink = typeof realUrl === 'string' && realUrl.includes('t.me');
  const isTelegramTaskId = typeof taskId === 'string' && taskId.toLowerCase().includes('telegram');

  if (isTelegramLink || isTelegramTaskId) {
    // try to find button: prefer btn-<taskId> if exists, fallback to tgBtn
    const btnById = document.getElementById('btn-' + taskId);
    const btnFallback = document.getElementById('tgBtn');
    const btn = btnById || btnFallback;

    // HARD LOCK
    if (taskState.telegram.claimed) {
      if (btn) { btn.innerText = 'Done'; btn.disabled = true; }
      alert('Task sudah selesai');
      return;
    }

    // START
    if (!taskState.telegram.started) {
      if (isTelegramLink && window.Telegram?.WebApp) {
        try { Telegram.WebApp.openTelegramLink(realUrl); } catch (e) { window.open(realUrl, '_blank'); }
      } else if (isTelegramLink) {
        window.open(realUrl, '_blank');
      } else {
        // no link available, just proceed to mark started (keeps behavior safe)
      }

      taskState.telegram.started = true;
      saveData();

      if (btn) btn.innerText = 'Claim';
      return;
    }

    // CLAIM
    if (taskState.telegram.started === true && taskState.telegram.claimed === false) {
      if (!confirm('Sudah join channel?')) {
        alert('Kamu belum join!');
        return;
      }

      taskState.telegram.claimed = true;
      balance += 0.25;
      saveData();
      updateBalance();

      if (btn) { btn.innerText = 'Done'; btn.disabled = true; }

      alert('Reward +0.25 TON');
      return;
    }

    return;
  }

  // fallback (twitter/others)
  try { window.open(realUrl, '_blank'); } catch (e) { console.error(e); }
  setTimeout(() => {
    balance += (typeof realAmount === 'number' ? realAmount : 0);
    saveData();
    updateBalance();
    alert('Reward +' + (realAmount || 0) + ' TON');
  }, 1500);
};

// INVITE
function inviteTask() {
  const link = 'https://t.me/your_bot?start=ref123';
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).catch(()=>{});
  balance += 0.1;
  saveData();
  updateBalance();
}

// WITHDRAW
function withdraw() {
  const input = document.getElementById('wd');
  if (!input) return alert('Input withdraw tidak ditemukan');
  let val = parseFloat(input.value);
  if (isNaN(val)) return alert('Masukkan angka');
  if (val <= 0) return alert('Harus lebih dari 0');
  if (val > balance) return alert('Saldo tidak cukup');
  balance -= val;
  saveData();
  updateBalance();
  alert('Withdraw berhasil');
}

// INIT
function initApp() {
  updateBalance();
  const btn = document.getElementById('tgBtn');
  if (!btn) return console.warn('tgBtn tidak ditemukan di DOM');
  if (taskState.telegram.claimed === true) {
    btn.innerText = 'Done';
    btn.disabled = true;
  } else if (taskState.telegram.started === true) {
    btn.innerText = 'Claim';
    btn.disabled = false;
  } else {
    btn.innerText = 'Start';
    btn.disabled = false;
  }
}

// Run after DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();

  if (window.Telegram?.WebApp) {
    try { window.Telegram.WebApp.expand(); } catch (e) {}
    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    if (user) {
      const uname = document.getElementById('username');
      if (uname) uname.innerText = '@' + (user.username || user.first_name);
      const avatar = document.getElementById('avatar');
      if (avatar && user.photo_url) avatar.src = user.photo_url;
    }
  }
});
