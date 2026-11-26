/* =========================================
   BIKASH12 BAJI - APP.JS
========================================= */

const STORAGE = {
  user: "bikash12_user",
  balance: "bikash12_balance",
  requests: "bikash12_requests",
  history: "bikash12_history",
  numbers: "bikash12_numbers",
  tickets: "bikash12_tickets"
};

function readData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let currentUser = readData(STORAGE.user, null);
let virtualBalance = Number(readData(STORAGE.balance, 0)) || 0;
let requests = readData(STORAGE.requests, []);
let history = readData(STORAGE.history, []);
let supportTickets = readData(STORAGE.tickets, []);
let virtualNumbers = readData(STORAGE.numbers, {
  a: "",
  b: ""
});

let selectedPayment = "Virtual Credit A";

const providers = [
  {
    name: "PG",
    games: ["Fortune Tiger", "Fortune Rabbit", "Fortune Ox", "Fortune Mouse"]
  },
  {
    name: "JILI",
    games: ["Super Ace", "Lucky Star", "Fortune Gems", "Dragon Treasure", "Golden Empire"]
  },
  {
    name: "Pragmatic Play",
    games: ["Gates of Olympus", "Sweet Bonanza", "Big Bass Bonanza"]
  },
  {
    name: "CQ9",
    games: ["Jump High", "Thor 2", "Lucky Bats"]
  },
  {
    name: "Habanero",
    games: ["Hot Hot Fruit", "Koi Gate", "Fa Cai Shen"]
  },
  {
    name: "Evolution",
    games: ["Live Casino", "Blackjack", "Roulette"]
  },
  {
    name: "Microgaming",
    games: ["Mega Moolah", "Immortal Romance"]
  },
  {
    name: "Playtech",
    games: ["Age of the Gods", "Buffalo Blitz"]
  },
  {
    name: "NetEnt",
    games: ["Starburst", "Gonzo's Quest"]
  },
  {
    name: "Play'n GO",
    games: ["Book of Dead", "Reactoonz"]
  },
  {
    name: "Spadegaming",
    games: ["Heroes", "Golden Queen"]
  },
  {
    name: "KA Gaming",
    games: ["Dragon's Gate", "Lucky God"]
  }
];

/* BASIC HELPERS */

function getElement(id) {
  return document.getElementById(id);
}

function getValue(id) {
  return getElement(id)?.value?.trim() || "";
}

function setText(id, value) {
  const el = getElement(id);
  if (el) el.textContent = value;
}

function money(value) {
  return "৳ " + Number(value || 0).toLocaleString("en-US");
}

function makeId(prefix = "B12") {
  return prefix + Date.now().toString().slice(-8) +
    Math.floor(Math.random() * 900 + 100);
}

function showMessage(message) {
  alert(message);
}

function saveAll() {
  saveData(STORAGE.user, currentUser);
  saveData(STORAGE.balance, virtualBalance);
  saveData(STORAGE.requests, requests);
  saveData(STORAGE.history, history);
  saveData(STORAGE.numbers, virtualNumbers);
  saveData(STORAGE.tickets, supportTickets);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function addHistory(type, amount, details = "") {
  history.unshift({
    id: makeId("TX"),
    type,
    amount: Number(amount) || 0,
    details,
    date: new Date().toLocaleString("bn-BD"),
    status: "Pending"
  });
  saveAll();
}

/* NAVIGATION */

function hideAllPages() {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.add("hidden");
  });
}

function showPage(pageId) {
  if (pageId === "jili") pageId = "pg";

  hideAllPages();

  const page = getElement(pageId);
  if (page) page.classList.remove("hidden");

  const menu = getElement("sideMenu");
  if (menu) menu.classList.add("hidden");

  updateBalance();
  updateProfile();

  if (pageId === "pg") renderProviderCatalog();
  if (pageId === "admin") {
    updateNumbersDisplay();
    renderAdminRequests();
  }
  if (pageId === "withdraw") updateWithdrawalNumber();
  if (pageId === "wallet") renderWalletTransactions();
  if (pageId === "history" || pageId === "transactions") renderHistory();
  if (pageId === "vip") updateVIP();
}

function toggleMenu() {
  getElement("sideMenu")?.classList.toggle("hidden");
}

/* PLAYER PROFILE */

function playerLogin() {
  const name = prompt("আপনার প্লেয়ার নাম লিখুন:");
  if (!name || !name.trim()) return;

  currentUser = {
    name: name.trim(),
    playerId: makeId("PLAYER")
  };

  saveAll();
  updateProfile();
  updateBalance();
  showMessage("স্বাগতম, " + currentUser.name);
}

function playerLogout() {
  if (!confirm("আপনি কি লগআউট করতে চান?")) return;

  currentUser = null;
  saveAll();
  showPage("home");
  showMessage("লগআউট সম্পন্ন হয়েছে।");
}

function updateProfile() {
  setText("profileName", currentUser?.name || "Guest Player");
  setText("playerId", currentUser?.playerId || "—");
}

function updateBalance() {
  setText("topBalance", Number(virtualBalance).toLocaleString("en-US"));
  setText("walletBalance", Number(virtualBalance).toLocaleString("en-US"));
}

/* GAME PROVIDERS */

function renderProviderCatalog() {
  const container = getElement("providerCatalog");
  if (!container) return;

  container.innerHTML = `
    <div class="provider-grid">
      ${providers.map((provider, index) => `
        <button class="provider-card" onclick="openProvider(${index})">
          <strong>${escapeHTML(provider.name)}</strong>
          <small>${provider.games.length} Games</small>
        </button>
      `).join("")}
    </div>
  `;
}

function openProvider(index) {
  const provider = providers[index];
  const container = getElement("providerCatalog");
  if (!provider || !container) return;

  container.innerHTML = `
    <div class="section-heading">
      <h2>${escapeHTML(provider.name)}</h2>
      <button onclick="renderProviderCatalog()">‹ ফিরে যান</button>
    </div>
    <div class="game-grid">
      ${provider.games.map((game, i) => `
        <button class="game-card" onclick="openGame('${escapeHTML(game).replace(/'/g, "\\'")}')">
          <span class="game-art art-${["one","two","three","four","five","six"][i % 6]}">🎮</span>
          <strong>${escapeHTML(game)}</strong>
          <small>${escapeHTML(provider.name)}</small>
        </button>
      `).join("")}
    </div>
  `;
}

function filterGames(category, button) {
  document.querySelectorAll(".category-tabs button").forEach(btn => {
    btn.classList.remove("active");
  });
  button?.classList.add("active");

  document.querySelectorAll(".game-grid .game-card").forEach(card => {
    card.style.display =
      category === "all" || card.dataset.category === category
        ? ""
        : "none";
  });
}

function openGame(gameName) {
  setText("selectedGame", gameName);
  showPage("gameView");
}

/* VIRTUAL NUMBER SETTINGS */

function updateNumbers() {
  const numberA = getValue("newBkash");
  const numberB = getValue("newNagad");

  virtualNumbers = {
    a: numberA,
    b: numberB
  };

  saveAll();
  updateNumbersDisplay();
  updateWithdrawalNumber();

  showMessage("ভার্চুয়াল নম্বর সংরক্ষণ হয়েছে।");
}

function updateNumbersDisplay() {
  const inputA = getElement("newBkash");
  const inputB = getElement("newNagad");

  if (inputA) inputA.value = virtualNumbers.a || "";
  if (inputB) inputB.value = virtualNumbers.b || "";

  const status = getElement("numberSettingsStatus");
  if (status) {
    status.textContent = "নম্বর সেটিংস সংরক্ষিত";
  }
}

function updateWithdrawalNumber() {
  const display = getElement("withdrawVirtualNumber");
  const type = getElement("withdrawNumberType");

  if (!display) return;

  const available = [];

  if (virtualNumbers.a) {
    available.push("A: " + virtualNumbers.a);
  }
  if (virtualNumbers.b) {
    available.push("B: " + virtualNumbers.b);
  }

  display.textContent = available.length
    ? available.join("  |  ")
    : "অ্যাডমিন এখনো নম্বর যোগ করেনি";

  if (type) type.textContent = "অ্যাডমিন নির্ধারিত ভার্চুয়াল নম্বর";
}

/* DEPOSIT METHOD */

function selectPayment(method, button) {
  selectedPayment = method;

  document.querySelectorAll(".payment-methods button").forEach(btn => {
    btn.classList.remove("active");
  });

  button?.classList.add("active");

  const number = method === "Virtual Credit A"
    ? virtualNumbers.a
    : virtualNumbers.b;

  setText(
    "paymentNumber",
    number || "অ্যাডমিন নম্বর যোগ করেনি"
  );
  setText("paymentType", method);
}

/* REQUEST CREATION */

function sendRequest(type) {
  if (!currentUser) {
    playerLogin();
    if (!currentUser) return;
  }

  let amount = 0;
  let details = {};

  if (type === "Deposit") {
    amount = Number(getValue("depositAmount"));
    details.method = selectedPayment;
    details.referenceId = getValue("depositRef");

    if (!amount || amount < 1) {
      showMessage("সঠিক পরিমাণ লিখুন।");
      return;
    }
  }

  if (type === "Send Money") {
    amount = Number(getValue("sendAmount"));
    details.receiver = getValue("receiver");

    if (!details.receiver) {
      showMessage("প্রাপকের Player ID লিখুন।");
      return;
    }
    if (!amount || amount < 1) {
      showMessage("সঠিক পরিমাণ লিখুন।");
      return;
    }
    if (amount > virtualBalance) {
      showMessage("আপনার ব্যালেন্স পর্যাপ্ত নয়।");
      return;
    }
  }

  if (type === "Withdrawal") {
    amount = Number(getValue("withdrawAmount"));
    details.playerNumber = getValue("withdrawNumber");
    details.transactionId = getValue("withdrawTransactionId");

    if (!details.playerNumber) {
      showMessage("আপনার নম্বর লিখুন।");
      return;
    }
    if (!details.transactionId) {
      showMessage("Transaction ID লিখুন।");
      return;
    }
    if (!amount || amount < 1) {
      showMessage("সঠিক পরিমাণ লিখুন।");
      return;
    }
    if (amount > virtualBalance) {
      showMessage("আপনার ভার্চুয়াল ব্যালেন্স পর্যাপ্ত নয়।");
      return;
    }
  }

  const request = {
    id: makeId("REQ"),
    playerName: currentUser.name,
    playerId: currentUser.playerId,
    type,
    amount,
    details,
    status: "Pending",
    date: new Date().toLocaleString("bn-BD")
  };

  requests.unshift(request);
  addHistory(type, amount, "Request ID: " + request.id);
  saveAll();

  if (type === "Deposit") {
    getElement("depositAmount").value = "";
    getElement("depositRef").value = "";
  }

  if (type === "Send Money") {
    getElement("sendAmount").value = "";
    getElement("receiver").value = "";
  }

  if (type === "Withdrawal") {
    getElement("withdrawAmount").value = "";
    getElement("withdrawNumber").value = "";
    getElement("withdrawTransactionId").value = "";
  }

  updateBalance();
  renderAdminRequests();

  showMessage("আপনার রিকুয়েস্ট পাঠানো হয়েছে।");
}

/* ADMIN REQUEST MANAGEMENT */

function renderAdminRequests() {
  const container = getElement("adminRequests");
  if (!container) return;

  const pending = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;

  setText("pendingCount", pending);
  setText("approvedCount", approved);

  if (!requests.length) {
    container.innerHTML = "কোনো রিকুয়েস্ট নেই।";
    return;
  }

  container.innerHTML = requests.map(request => `
    <div class="card request-card">
      <h3>${escapeHTML(request.type)}</h3>
      <p>Player: ${escapeHTML(request.playerName)}</p>
      <p>Player ID: ${escapeHTML(request.playerId)}</p>
      <p>পরিমাণ: ${money(request.amount)}</p>
      <p>তারিখ: ${escapeHTML(request.date)}</p>

      ${request.details?.receiver
        ? `<p>প্রাপক: ${escapeHTML(request.details.receiver)}</p>` : ""}

      ${request.details?.method
        ? `<p>পদ্ধতি: ${escapeHTML(request.details.method)}</p>` : ""}

      ${request.details?.playerNumber
        ? `<p>প্লেয়ার নম্বর: ${escapeHTML(request.details.playerNumber)}</p>` : ""}

      ${request.details?.transactionId
        ? `<p>Transaction ID: ${escapeHTML(request.details.transactionId)}</p>` : ""}

      ${request.details?.referenceId
        ? `<p>Reference ID: ${escapeHTML(request.details.referenceId)}</p>` : ""}

      <p>স্ট্যাটাস: <strong>${escapeHTML(request.status)}</strong></p>

      ${request.status === "Pending" ? `
        <button class="gold-button" onclick="updateRequest('${request.id}','Approved')">
          অনুমোদন
        </button>
        <button onclick="updateRequest('${request.id}','Rejected')">
          বাতিল
        </button>
      ` : ""}
    </div>
  `).join("");
}

function updateRequest(requestId, newStatus) {
  const request = requests.find(r => r.id === requestId);
  if (!request || request.status !== "Pending") return;

  if (newStatus !== "Approved" && newStatus !== "Rejected") return;

  if (newStatus === "Approved") {
    if (request.type === "Deposit") {
      virtualBalance += Number(request.amount);
    }

    if (request.type === "Withdrawal" || request.type === "Send Money") {
      if (Number(request.amount) > virtualBalance) {
        showMessage("বর্তমান ভার্চুয়াল ব্যালেন্স পর্যাপ্ত নয়।");
        return;
      }
      virtualBalance -= Number(request.amount);
    }
  }

  request.status = newStatus;
  request.updatedAt = new Date().toLocaleString("bn-BD");

  const historyItem = history.find(
    item => item.details === "Request ID: " + request.id
  );

  if (historyItem) historyItem.status = newStatus;

  saveAll();
  updateBalance();
  renderAdminRequests();
  renderHistory();

  showMessage(
    newStatus === "Approved"
      ? "রিকুয়েস্ট অনুমোদন হয়েছে।"
      : "রিকুয়েস্ট বাতিল হয়েছে।"
  );
}

/* TRANSACTION AND GAME HISTORY */

function renderHistory() {
  const transactionHTML = history.length
    ? history.map(item => `
        <div class="history-item">
          <strong>${escapeHTML(item.type)}</strong>
          <p>${money(item.amount)}</p>
          <small>${escapeHTML(item.date)}</small>
          <p>স্ট্যাটাস: ${escapeHTML(item.status)}</p>
        </div>
      `).join("")
    : "কোনো লেনদেন নেই।";

  const transactionContainer = getElement("transactionHistory");
  const walletContainer = getElement("walletRecentTransactions");

  if (transactionContainer) {
    transactionContainer.innerHTML = transactionHTML;
  }
  if (walletContainer) {
    walletContainer.innerHTML = transactionHTML;
  }

  const gameContainer = getElement("gameHistory");
  if (gameContainer) {
    gameContainer.innerHTML = "এখনো কোনো গেম ইতিহাস নেই।";
  }
}

function renderWalletTransactions() {
  renderHistory();
}

/* VIP */

function updateVIP() {
  const progress = getElement("vipProgress");
  if (progress) progress.style.width = "25%";
}

/* SUPPORT */

function sendSupport() {
  if (!currentUser) {
    playerLogin();
    if (!currentUser) return;
  }

  const subject = getValue("supportSubject");
  const message = getValue("supportMessage");

  if (!subject || !message) {
    showMessage("বিষয় ও মেসেজ লিখুন।");
    return;
  }

  supportTickets.unshift({
    id: makeId("SUP"),
    playerId: currentUser.playerId,
    subject,
    message,
    date: new Date().toLocaleString("bn-BD")
  });

  saveAll();

  getElement("supportSubject").value = "";
  getElement("supportMessage").value = "";

  showMessage("আপনার Support Ticket পাঠানো হয়েছে।");
}

/* INITIALIZE */

function initializeApp() {
  updateBalance();
  updateProfile();
  renderProviderCatalog();
  renderHistory();
  updateNumbersDisplay();
  updateWithdrawalNumber();
  renderAdminRequests();
  updateVIP();

  showPage("home");
}

document.addEventListener("DOMContentLoaded", initializeApp);
