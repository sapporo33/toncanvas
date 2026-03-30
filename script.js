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
  localStorage.setItem("balance", balance);
  localStorage.setItem("taskState", JSON.stringify(taskState));
}

// NAV
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// BALANCE
function updateBalance() {
  document.getElementById('balance').innerText = balance.toFixed(2) + ' TON';
}

// ================= TASK =================
function startTask(url, amount) {

  // TELEGRAM ONLY
  if (url.includes("t.me")) {

    const btn = document.getElementById("tgBtn");

    // 🔒 SUDAH SELESAI → STOP TOTAL
    if (taskState.telegram.claimed === true) {
      return;
    }

    // 🚀 START (HANYA SEKALI)
    if (taskState.telegram.started === false) {

      if (window.Telegram?.WebApp) {
        Telegram.WebApp.openTelegramLink(url);
      } else {
        window.open(url, '_blank');
      }

      taskState.telegram.started = true;
      saveData();

      btn.innerText = "Claim";
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

      btn.innerText = "Done";
      btn.disabled = true;

      return;
    }

    return;
  }

  // TWITTER
  window.open(url, '_blank');

  setTimeout(() => {
    balance += amount;
    saveData();
    updateBalance();
  }, 1500);
}

// INVITE
function inviteTask() {
  const link = "https://t.me/your_bot?start=ref123";

  navigator.clipboard.writeText(link);

  balance += 0.1;
  saveData();
  updateBalance();
}

// WITHDRAW
function withdraw() {
  let val = parseFloat(document.getElementById('wd').value);

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

  if (!btn) return;

  if (taskState.telegram.claimed === true) {
    btn.innerText = "Done";
    btn.disabled = true;
  } else if (taskState.telegram.started === true) {
    btn.innerText = "Claim";
  }
}

initApp();

// TELEGRAM USER
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.expand();

  const user = tg.initDataUnsafe?.user;

  if (user) {
    document.getElementById('username').innerText =
      '@' + (user.username || user.first_name);

    if (user.photo_url) {
      document.getElementById('avatar').src = user.photo_url;
    }
  }
}
