/* =====================================
   BIKASH12 BAJI
   FRONTEND DEMO JAVASCRIPT
   VIRTUAL CREDITS ONLY
===================================== */

let player = localStorage.getItem("bikash12_player") || "";
let requests = JSON.parse(
  localStorage.getItem("bikash12_requests") || "[]"
);

let bkashNumber = "DEMO NUMBER";
let nagadNumber = "DEMO NUMBER";

function showPage(page) {
  document.querySelectorAll(".page").forEach(section => {
    section.classList.add("hidden");
  });

  const selected = document.getElementById(page);

  if (selected) {
    selected.classList.remove("hidden");
    window.scrollTo(0, 0);
  }

  if (page === "profile") updateProfile();
  if (page === "wallet") updateBalance();
  if (page === "admin") renderRequests();
}

function playerLogin() {
  const name = document.getElementById("playerName").value.trim();

  if (!name) {
    document.getElementById("loginMessage").textContent =
      "আপনার নাম লিখুন।";
    return;
  }

  player = name;
  localStorage.setItem("bikash12_player", player);

  updateProfile();
  updateBalance();

  document.getElementById("loginBtn").textContent = player;

  showPage("home");
}

function playerLogout() {
  localStorage.removeItem("bikash12_player");
  player = "";

  document.getElementById("loginBtn").textContent = "Login";
  showPage("login");
}

function updateProfile() {
  document.getElementById("profileName").textContent =
    player || "Guest";
}

function updateBalance() {
  const balance = 1000;

  document.getElementById("balance").textContent = balance;
  document.getElementById("walletBalance").textContent = balance;
}

function sendRequest(type) {
  if (!player) {
    alert("প্রথমে Login করুন।");
    showPage("login");
    return;
  }

  let amount = 0;
  let reference = "";

  if (type === "Deposit") {
    amount = Number(
      document.getElementById("depositAmount").value
    );
    reference = document.getElementById("depositRef").value.trim();
  }

  if (type === "Send Money") {
    amount = Number(
      document.getElementById("sendAmount").value
    );
    reference = document.getElementById("receiver").value.trim();
  }

  if (type === "Withdrawal") {
    amount = Number(
      document.getElementById("withdrawAmount").value
    );
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    alert("সঠিক পরিমাণ লিখুন।");
    return;
  }

  if (amount > 100000) {
    alert("Demo Request সীমা অতিক্রম করেছে।");
    return;
  }

  if (
    (type === "Deposit" && !reference) ||
    (type === "Send Money" && !reference)
  ) {
    alert("প্রয়োজনীয় তথ্য পূরণ করুন।");
    return;
  }

  const request = {
    id: Date.now(),
    player: player,
    type: type,
    amount: amount,
    reference: reference,
    status: "Pending",
    date: new Date().toLocaleString("bn-BD")
  };

  requests.push(request);

  localStorage.setItem(
    "bikash12_requests",
    JSON.stringify(requests)
  );

  alert("Demo Request তৈরি হয়েছে।");

  renderHistory();
  showPage("wallet");
}

function renderHistory() {
  const history = document.getElementById("history");

  if (!history) return;

  if (requests.length === 0) {
    history.textContent = "এখনো কোনো Request নেই।";
    return;
  }

  history.innerHTML = "";

  requests
    .filter(item => item.player === player)
    .slice()
    .reverse()
    .forEach(item => {
      const div = document.createElement("div");
      div.className = "card";

      const title = document.createElement("strong");
      title.textContent = item.type;

      const details = document.createElement("p");
      details.textContent =
        "৳" + item.amount + " | " + item.status;

      const date = document.createElement("small");
      date.textContent = item.date;

      div.append(title, details, date);
      history.appendChild(div);
    });
}

function renderRequests() {
  const container = document.getElementById("adminRequests");

  if (!container) return;

  container.innerHTML = "";

  if (requests.length === 0) {
    container.textContent = "কোনো Demo Request নেই।";
    return;
  }

  requests.slice().reverse().forEach(item => {
    const div = document.createElement("div");
    div.className = "card";

    const title = document.createElement("strong");
    title.textContent = item.player + " — " + item.type;

    const details = document.createElement("p");
    details.textContent =
      "৳" + item.amount + " | " + item.status;

    const approve = document.createElement("button");
    approve.textContent = "Demo Approve";
    approve.onclick = () => updateRequest(item.id, "Approved");

    const reject = document.createElement("button");
    reject.textContent = "Demo Reject";
    reject.onclick = () => updateRequest(item.id, "Rejected");

    div.append(title, details, approve, reject);
    container.appendChild(div);
  });
}

function updateRequest(id, status) {
  requests = requests.map(item =>
    item.id === id
      ? { ...item, status: status }
      : item
  );

  localStorage.setItem(
    "bikash12_requests",
    JSON.stringify(requests)
  );

  renderRequests();
  renderHistory();
}

function updateNumbers() {
  const bkash = document.getElementById("newBkash").value.trim();
  const nagad = document.getElementById("newNagad").value.trim();

  if (!bkash || !nagad) {
    alert("দুটি Demo Number লিখুন।");
    return;
  }

  bkashNumber = bkash;
  nagadNumber = nagad;

  document.getElementById("bkashNumber").textContent = bkash;
  document.getElementById("nagadNumber").textContent = nagad;

  document.getElementById("adminMessage").textContent =
    "Demo Number আপডেট হয়েছে।";
}

function loadDemoNumbers() {
  document.getElementById("bkashNumber").textContent =
    bkashNumber;

  document.getElementById("nagadNumber").textContent =
    nagadNumber;
}

document.addEventListener("DOMContentLoaded", () => {
  updateBalance();
  loadDemoNumbers();

  if (player) {
    document.getElementById("loginBtn").textContent = player;
  }

  updateProfile();
  renderHistory();
});

if (player) {
  // Login information is only a local demo.
}
