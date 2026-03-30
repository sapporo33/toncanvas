// =======================
// GLOBAL STATE
// =======================
let balance = 0;

// =======================
// NAVIGATION
// =======================
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// =======================
// UPDATE BALANCE
// =======================
function updateBalance() {
  document.getElementById('balance').innerText = balance.toFixed(2) + ' TON';
  localStorage.setItem('balance', balance);
}

// =======================
// TASK SYSTEM
// =======================
function startTask(amount) {
  alert('Task completed! +' + amount + ' TON');

  balance += amount;
  updateBalance();
}

// =======================
// WITHDRAW
// =======================
function withdraw() {
  let val = parseFloat(document.getElementById('wd').value);

  if (isNaN(val)) return alert('Masukkan jumlah yang valid');
  if (val <= 0) return alert('Jumlah harus lebih dari 0');
  if (val > balance) return alert('Saldo tidak cukup');

  balance -= val;
  updateBalance();

  alert('Withdraw berhasil!');
}

// =======================
// LOAD DATA (LOCAL STORAGE)
// =======================
function loadData() {
  let saved = localStorage.getItem('balance');
  if (saved) {
    balance = parseFloat(saved);
    updateBalance();
  }
}

// =======================
// TELEGRAM INTEGRATION
// =======================
function initTelegram() {
  if (window.Telegram && window.Telegram.WebApp) {
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
}

// =======================
// INIT APP
// =======================
window.onload = () => {
  loadData();
  initTelegram();
};