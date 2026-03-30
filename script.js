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

// TASK (exposed globally so HTML onclick works)
window.startTask = function(url, amount) {
  console.log('startTask', { url, amount, taskState });

  if (typeof url === 'string' && url.includes('t.me')) {
    const btn = document.getElementById('tgBtn');

    if (taskState.telegram.claimed === true) {
      if (btn) { btn.innerText = 'Done'; btn.disabled = true; }
      alert('Task sudah selesai');
      return;
    }

    if (taskState.telegram.started === false) {
      if (window.Telegram?.WebApp) {
        try { Telegram.WebApp.openTelegramLink(url); } catch (e) { window.open(url, '_blank'); }
      } else {
        window.open(url, '_blank');
      }
      taskState.telegram.started = true;
      saveData();
      if (btn) btn.innerText = 'Claim';
      return;
    }

    if (taskState.telegram.started === true && taskState.telegram.claimed === false) {
      if (!confirm('Sudah join channel?')) return alert('Kamu belum join!');
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
  try { window.open(url, '_blank'); } catch (e) { console.error(e); }
  setTimeout(() => {
    balance += (typeof amount === 'number' ? amount : 0);
    saveData();
    updateBalance();
    alert('Reward +' + amount + ' TON');
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
