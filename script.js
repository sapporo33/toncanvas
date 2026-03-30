let balance = 0;

// STATE TASK (anti spam basic)
let taskState = {
  telegram: {
    started: false,
    claimed: false
  }
};

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function updateBalance() {
  document.getElementById('balance').innerText = balance.toFixed(2) + ' TON';
}

// ================= TELEGRAM TASK =================
function startTask(url, amount) {

  // ==== TELEGRAM TASK ====
  if (url.includes("t.me")) {

    const buttons = document.querySelectorAll('.card button');
    const btn = buttons[0]; // tombol pertama = telegram

    // START
    if (!taskState.telegram.started) {

      if (window.Telegram?.WebApp) {
        Telegram.WebApp.openTelegramLink(url);
      } else {
        window.open(url, '_blank');
      }

      taskState.telegram.started = true;

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
      updateBalance();

      btn.innerText = "Done";
      btn.disabled = true;

      alert("✅ Reward +0.25 TON");
      return;
    }

    return;
  }

  // ==== TWITTER TASK (BIARKAN SIMPLE) ====
  window.open(url, '_blank');

  setTimeout(() => {
    balance += amount;
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
  updateBalance();
}

// ================= WITHDRAW =================
function withdraw() {
  let val = parseFloat(document.getElementById('wd').value);

  if (isNaN(val)) return alert('Masukkan angka');
  if (val <= 0) return alert('Harus lebih dari 0');
  if (val > balance) return alert('Saldo tidak cukup');

  balance -= val;
  updateBalance();
  alert('Withdraw berhasil');
}

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
