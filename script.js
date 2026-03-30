// LOAD (AMAN)
let balance = parseFloat(localStorage.getItem("balance")) || 0;

let taskState;
try {
  taskState = JSON.parse(localStorage.getItem("taskState"));
} catch (e) {
  taskState = null;
}

if (!taskState) {
  taskState = {
    telegram: {
      started: false,
      claimed: false
    }
  };
}

// SAVE
function saveData() {
  try {
    localStorage.setItem("balance", balance);
    localStorage.setItem("taskState", JSON.stringify(taskState));
    console.log('saveData', { balance, taskState });
  } catch (e) {
    console.error('Gagal menyimpan ke localStorage', e);
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

// ================= TASK =================
window.startTask = function(url, amount) {
  console.log('startTask called', { url, amount, taskState });

  // TELEGRAM ONLY
  if (typeof url === 'string' && url.includes("t.me")) {
    const btn = document.getElementById("tgBtn");

    // 🔒 SUDAH SELESAI → STOP TOTAL
    if (taskState.telegram.claimed === true) {
      if (btn) { btn.innerText = "Done"; btn.disabled = true; }
      return;
    }

    // 🚀 START (HANYA SEKALI)
    if (taskState.telegram.started === false) {
      if (window.Telegram?.WebApp) {
        try { Telegram.WebApp.openTelegramLink(url); } catch (e) { window.open(url, '_blank'); }
      } else {
        window.open(url, '_blank');
      }

      taskState.telegram.started = true;
      saveData();

      if (btn) btn.innerText = "Claim";
      return;
    }

    // 🎯 CLAIM (HANYA SEKALI)
    if (taskState.telegram.started === true && taskState.telegram.claimed === false) {
      let confirmJoin = confirm("Sudah join channel?");
      if (!confirmJoin) return;

      taskState.telegram.claimed = true;
      balance += 0.25;

      saveData();
      updateBalance();

      if (btn) { btn.innerText = "Done"; btn.disabled = true; }
      return;
    }

    return;
  }

  // TWITTER / LAINNYA
  try { window.open(url, '_blank'); } catch (e) { console.error('Gagal membuka url', e); }

  setTimeout(() => {
    balance += (typeof amount === 'number' ? amount : 0);
    saveData();
    updateBalance();
  }, 1500);
};

// INVITE
function inviteTask() {
  const link = "https://t.me/your_bot?start=ref123";
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(link).then(() => {
      console.log('Referral copied');
    }).catch(() => {
      console.warn('Clipboard write failed');
    });
  }
  balance += 0.1;
  saveData();
  updateBalance();
}

// WITHDRAW
function withdraw() {
  const input = document.getElementById('wd');
  if (!input) return;
  let val = parseFloat(input.value);

  if (isNaN(val)) return;
  if (val <= 0) return;
  if (val > balance) return;

  balance -= val;
  saveData();
  updateBalance();
}

// INIT
function initApp() {
  updateBalance();

  const btn = document.getElementById("tgBtn");
  if (!btn) {
    console.warn('tgBtn tidak ditemukan');
    return;
  }

  if (taskState.telegram.claimed === true) {
    btn.innerText = "Done";
    btn.disabled = true;
  } else if (taskState.telegram.started === true) {
    btn.innerText = "Claim";
    btn.disabled = false;
  } else {
    btn.innerText = "Start";
    btn.disabled = false;
  }
}

// Pastikan dijalankan setelah DOM siap
document.addEventListener('DOMContentLoaded', () => {
  initApp();

  // TELEGRAM USER
  if (window.Telegram?.WebApp) {
    const tg = window.Telegram.WebApp;
    try { tg.expand(); } catch (e) { /* ignore */ }

    const user = tg.initDataUnsafe?.user;
    if (user) {
      const uname = document.getElementById('username');
      if (uname) uname.innerText = '@' + (user.username || user.first_name);
      if (user.photo_url) {
        const avatar = document.getElementById('avatar');
        if (avatar) avatar.src = user.photo_url;
      }
    }
  }
});
