// ================= LOAD DATA =================
let balance = parseFloat(localStorage.getItem("balance")) || 0;

let taskState = JSON.parse(localStorage.getItem("taskState")) || {
  telegram: {
    started: false,
    claimed: false
  }
};

// ================= SAVE =================
function saveData() {
  localStorage.setItem("balance", balance);
  localStorage.setItem("taskState", JSON.stringify(taskState));
}

// ================= NAV =================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ================= BALANCE =================
function updateBalance() {
  document.getElementById('balance').innerText = balance.toFixed(2) + ' TON';
}

// ================= TELEGRAM TASK =================
function startTask(url, amount) {

  // ==== TELEGRAM ====
  if (url.includes("t.me")) {

    const btn = document.querySelectorAll('.card button')[0];

    // START
    if (!taskState.telegram.started) {

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

    // CLAIM
    if (!taskState.telegram.claimed) {

      let confirmJoin = confirm("Sudah join channel?");

      if (!confirmJoin) {
        alert("❌ Kamu belum join!");
        return;
      }

      taskState.telegram.claimed = true;

      balance += 0.25;
      saveData();
      updateBalance();

      btn.innerText = "Done";
      btn.disabled = true;

      alert("✅ Reward +0.25 TON");
      return;
    }

    return;
  }

  // ==== TWITTER ====
  window.open(url, '_blank');

  setTimeout(() => {
    balance += amount;
    saveData();
    updateBalance();
    alert('Reward +' + amount + ' TON');
  }, 1500);
}

// ================= INVITE =================
function inviteTask() {
  const link = "https://t.me/your_bot?start=ref123";

  navigator.clipboard.writeText(link);
  alert("Link referral disalin!");

  balance += 0.1;
  saveData();
  updateBalance();
}

// ================= WITHDRAW =================
function withdraw() {
  let val = parseFloat(document.getElementById('wd').value);

  if (isNaN(val)) return alert('Masukkan angka');
  if (val <= 0) return alert('Harus lebih dari 0');
  if (val > balance) return alert('Saldo tidak cukup');

  balance -= val;
  saveData();
  updateBalance();

  alert('Withdraw berhasil');
}

// ================= INIT =================
function initApp() {
  updateBalance();

  const btn = document.querySelectorAll('.card button')[0];

  if (taskState.telegram.claimed) {
    btn.innerText = "Done";
    btn.disabled = true;
  } else if (taskState.telegram.started) {
    btn.innerText = "Claim";
  }
}

initApp();

// ================= TELEGRAM USER =================
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
