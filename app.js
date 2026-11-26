/* =====================================================
   BIKASH12 BAJI
   COMPLETE PROVIDER EDITION
   VIRTUAL CREDITS ONLY — NO CASH VALUE
===================================================== */

/* 1. STORAGE */

const STORAGE = {
  user: "bikash12_user",
  balance: "bikash12_balance",
  requests: "bikash12_requests",
  history: "bikash12_history",
  numbers: "bikash12_numbers",
  tickets: "bikash12_tickets"
};

function getData(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let currentUser = getData(STORAGE.user, null);
let virtualBalance = Number(getData(STORAGE.balance, 0)) || 0;
let requests = getData(STORAGE.requests, []);
let history = getData(STORAGE.history, []);
let supportTickets = getData(STORAGE.tickets, []);

let paymentNumbers = getData(STORAGE.numbers, {
  bkash: "",
  nagad: ""
});

let selectedPaymentMethod = "";
let selectedProvider = "";
let selectedGameName = "";


/* 2. PROVIDERS */

const providers = [
  {
    id: "pg",
    name: "PG",
    icon: "🎮",
    games: [
      "Fortune Tiger",
      "Fortune Ox",
      "Fortune Rabbit",
      "Fortune Mouse",
      "Fortune Dragon"
    ]
  },
  {
    id: "jili",
    name: "JILI",
    icon: "🎰",
    games: [
      "Super Ace",
      "Golden Empire",
      "Crazy Hunter",
      "Boxing King",
      "Money Coming"
    ]
  },
  {
    id: "pragmatic",
    name: "Pragmatic Play",
    icon: "⭐",
    games: [
      "Sweet Bonanza",
      "Gates of Olympus",
      "Big Bass Bonanza",
      "The Dog House"
    ]
  },
  {
    id: "cq9",
    name: "CQ9",
    icon: "🎲",
    games: [
      "Rave Jump",
      "Thor 2",
      "Good Fortune",
      "Dragon Heart"
    ]
  },
  {
    id: "habanero",
    name: "Habanero",
    icon: "🔥",
    games: [
      "Hot Hot Fruit",
      "Koi Gate",
      "Fa Cai Shen",
      "Wild Trucks"
    ]
  },
  {
    id: "evolution",
    name: "Evolution",
    icon: "🎡",
    games: [
      "Lightning Roulette",
      "Dream Catcher",
      "Crazy Time",
      "Monopoly Live"
    ]
  },
  {
    id: "microgaming",
    name: "Microgaming",
    icon: "💎",
    games: [
      "Immortal Romance",
      "Thunderstruck",
      "Break da Bank"
    ]
  },
  {
    id: "playtech",
    name: "Playtech",
    icon: "🏆",
    games: [
      "Age of the Gods",
      "Buffalo Blitz",
      "Fire Blaze"
    ]
  },
  {
    id: "netent",
    name: "NetEnt",
    icon: "🌟",
    games: [
      "Starburst",
      "Gonzo's Quest",
      "Dead or Alive"
    ]
  },
  {
    id: "playngo",
    name: "Play'n GO",
    icon: "🚀",
    games: [
      "Book of Dead",
      "Reactoonz",
      "Rise of Olympus"
    ]
  },
  {
    id: "spade",
    name: "Spadegaming",
    icon: "♠️",
    games: [
      "Fishing War",
      "Brothers Kingdom",
      "Golden Lotus"
    ]
  },
  {
    id: "ka",
    name: "KA Gaming",
    icon: "🃏",
    games: [
      "Lucky Twins",
      "Dragon Treasure",
      "Golden Dragon"
    ]
  }
];


/* 3. HELPERS */

function getElement(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const element = getElement(id);
  return element ? element.value.trim() : "";
}

function setText(id, value) {
  const element = getElement(id);
  if (element) element.textContent = value;
}

function money(value) {
  return "৳" + Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function makeId() {
  return "REQ-" + Date.now() + "-" +
    Math.floor(Math.random() * 1000);
}

function showMessage(message) {
  alert(message);
}

function saveAll() {
  saveData(STORAGE.user, currentUser);
  saveData(STORAGE.balance, virtualBalance);
  saveData(STORAGE.requests, requests);
  saveData(STORAGE.history, history);
  saveData(STORAGE.numbers, paymentNumbers);
  saveData(STORAGE.tickets, supportTickets);
}


/* 4. PAGE NAVIGATION */

function hideAllPages() {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
    page.classList.add("hidden");
    page.style.display = "none";
  });
}

function showPage(pageName) {
  hideAllPages();

  const target = getElement(pageName);

  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
    target.style.display = "block";
  }

  const menu = document.querySelector(".side-menu");

  if (menu) {
    menu.classList.remove("show");
    menu.classList.add("hidden");
  }

  updateBalance();
  updateProfile();

  if (pageName === "pg") {
    renderProviderCatalog();
  }

  if (pageName === "jili") {
    openProvider("jili");
  }

  if (pageName === "admin") {
    renderAdminRequests();
    updateNumbersDisplay();
  }

  if (
    pageName === "history" ||
    pageName === "transactions"
  ) {
    renderHistory();
  }

  if (pageName === "vip") {
    updateVipProgress();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function toggleMenu() {
  const menu = document.querySelector(".side-menu");
  if (!menu) return;

  menu.classList.remove("hidden");
  menu.classList.toggle("show");
}


/* 5. PROVIDER CATALOG */

function renderProviderCatalog() {
  const page = getElement("pg");
  if (!page) return;

  let catalog = getElement("providerCatalog");

  if (!catalog) {
    catalog = document.createElement("div");
    catalog.id = "providerCatalog";
    page.prepend(catalog);
  }

  catalog.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = "ALL GAME PROVIDERS";

  const subtitle = document.createElement("p");
  subtitle.textContent =
    "আপনার পছন্দের Provider নির্বাচন করুন";

  const grid = document.createElement("div");
  grid.className = "provider-grid";

  providers.forEach(provider => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "provider-card";

    const icon = document.createElement("span");
    icon.className = "provider-icon";
    icon.textContent = provider.icon;

    const name = document.createElement("strong");
    name.textContent = provider.name;

    const count = document.createElement("small");
    count.textContent = provider.games.length + " Games";

    card.append(icon, name, count);

    card.addEventListener("click", () => {
      openProvider(provider.id);
    });

    grid.appendChild(card);
  });

  const gameArea = document.createElement("div");
  gameArea.id = "providerGameArea";

  catalog.append(
    heading,
    subtitle,
    grid,
    gameArea
  );
}


/* 6. OPEN PROVIDER LOBBY */

function openProvider(providerId) {
  const provider = providers.find(
    item => item.id === providerId
  );

  if (!provider) {
    showMessage("Provider পাওয়া যায়নি।");
    return;
  }

  selectedProvider = provider.id;

  const page = getElement("pg");
  if (!page) return;

  hideAllPages();

  page.classList.remove("hidden");
  page.classList.add("active");
  page.style.display = "block";

  if (!getElement("providerCatalog")) {
    renderProviderCatalog();
  }

  const area = getElement("providerGameArea");
  if (!area) return;

  area.replaceChildren();

  const back = document.createElement("button");
  back.type = "button";
  back.className = "provider-back";
  back.textContent = "← All Providers";

  back.addEventListener("click", () => {
    renderProviderCatalog();
  });

  const title = document.createElement("h2");
  title.textContent = provider.icon + " " + provider.name;

  const subtitle = document.createElement("p");
  subtitle.textContent = "Virtual Games";

  const grid = document.createElement("div");
  grid.className = "game-grid";

  provider.games.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";

    const picture = document.createElement("div");
    picture.className = "game-picture";
    picture.textContent = provider.icon;

    const name = document.createElement("h3");
    name.textContent = game;

    const play = document.createElement("button");
    play.type = "button";
    play.textContent = "PLAY";

    play.addEventListener("click", () => {
      openGame(game);
    });

    card.append(picture, name, play);
    grid.appendChild(card);
  });

  area.append(
    back,
    title,
    subtitle,
    grid
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* 7. GAME FILTER */

function filterGames(category, button) {
  document.querySelectorAll(".game-card").forEach(card => {
    const cardCategory =
      card.dataset.category || "all";

    card.style.display =
      category === "all" ||
      cardCategory === category
        ? ""
        : "none";
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.remove("selected", "active");
  });

  if (button) {
    button.classList.add("selected", "active");
  }
}


/* 8. GAME SCREEN */

function openGame(gameName) {
  selectedGameName = gameName || "Virtual Game";

  showPage("gameView");

  setText("gameTitle", selectedGameName);
  setText("selectedGame", selectedGameName);

  const gameView = getElement("gameView");
  if (!gameView) return;

  let message = getElement("virtualGameMessage");

  if (!message) {
    message = document.createElement("div");
    message.id = "virtualGameMessage";
    message.className = "virtual-game-message";
    gameView.appendChild(message);
  }

  message.textContent =
    selectedGameName +
    " — ভার্চুয়াল গেমের স্ক্রিন";
}


/* 9. PLAYER LOGIN */

function playerLogin() {
  const name =
    getValue("playerName") ||
    getValue("loginName") ||
    getValue("userName");

  const playerId = getValue("playerId");

  if (!name) {
    showMessage("আপনার নাম লিখুন।");
    return;
  }

  currentUser = {
    name: name,
    playerId: playerId || "P-" + Date.now(),
    loginTime: new Date().toISOString()
  };

  saveAll();
  updateProfile();

  showMessage("লগইন সফল হয়েছে।");
  showPage("home");
}

function playerLogout() {
  if (!confirm("আপনি কি লগআউট করতে চান?")) {
    return;
  }

  currentUser = null;
  saveAll();
  updateProfile();
  showPage("home");

  showMessage("আপনি লগআউট করেছেন।");
}

function updateProfile() {
  setText(
    "profileName",
    currentUser ? currentUser.name : "Guest Player"
  );

  setText(
    "playerId",
    currentUser ? currentUser.playerId : "Not Logged In"
  );
}


/* 10. VIRTUAL BALANCE */

function updateBalance() {
  setText("topBalance", money(virtualBalance));
  setText("walletBalance", money(virtualBalance));
  setText("profileBalance", money(virtualBalance));
}


/* 11. PAYMENT METHOD */

function selectPayment(method, button) {
  selectedPaymentMethod =
    String(method || "").toLowerCase();

  document.querySelectorAll(
    ".payment-methods button"
  ).forEach(btn => {
    btn.classList.remove("selected", "active");
  });

  if (button) {
    button.classList.add("selected");
  }

  const number =
    paymentNumbers[selectedPaymentMethod] || "";

  setText(
    "paymentNumber",
    number || "ভার্চুয়াল অনুরোধের জন্য নম্বর সেট করা হয়নি"
  );

  const input = getElement("paymentType");

  if (input) {
    input.value = selectedPaymentMethod;
  }
}


/* 12. REQUEST SYSTEM */

function sendRequest(type) {
  if (!currentUser) {
    showMessage("আগে লগইন করুন।");
    showPage("profile");
    return;
  }

  type = String(type || "").toLowerCase();

  if (!["deposit", "send", "withdraw"].includes(type)) {
    showMessage("অনুরোধের ধরন সঠিক নয়।");
    return;
  }

  let amount = 0;
  let method = "";
  let reference = "";
  let receiver = "";

  if (type === "deposit") {
    amount = Number(getValue("depositAmount"));

    method =
      selectedPaymentMethod ||
      getValue("paymentType");

    reference = getValue("depositRef");

    if (!method || !reference) {
      showMessage(
        "পদ্ধতি নির্বাচন ও Reference লিখুন।"
      );
      return;
    }
  }

  if (type === "send") {
    amount = Number(getValue("sendAmount"));
    receiver = getValue("receiver");
    method = "virtual";

    if (!receiver) {
      showMessage("প্রাপকের Player ID লিখুন।");
      return;
    }
  }

  if (type === "withdraw") {
    amount = Number(getValue("withdrawAmount"));
    method = "virtual";
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 1000000
  ) {
    showMessage("সঠিক পরিমাণ লিখুন।");
    return;
  }

  if (
    type !== "deposit" &&
    amount > virtualBalance
  ) {
    showMessage("ভার্চুয়াল ক্রেডিট যথেষ্ট নেই।");
    return;
  }

  const request = {
    id: makeId(),
    user: currentUser.name,
    playerId: currentUser.playerId,
    type: type,
    amount: amount,
    method: method,
    reference: reference,
    receiver: receiver,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  requests.unshift(request);

  history.unshift({
    id: request.id,
    type: type,
    amount: amount,
    status: "pending",
    date: request.createdAt
  });

  saveAll();
  clearRequestInputs();
  updateAdminCount();

  showMessage(
    "আপনার ভার্চুয়াল অনুরোধ জমা হয়েছে।"
  );

  showPage("history");
}

function clearRequestInputs() {
  [
    "depositRef",
    "depositAmount",
    "sendAmount",
    "receiver",
    "withdrawAmount"
  ].forEach(id => {
    const element = getElement(id);
    if (element) element.value = "";
  });
}


/* 13. ADMIN REQUESTS */

function renderAdminRequests() {
  const container = getElement("adminRequests");
  if (!container) return;

  container.replaceChildren();

  if (!requests.length) {
    const empty = document.createElement("p");
    empty.textContent = "কোনো অনুরোধ নেই।";
    container.appendChild(empty);
    updateAdminCount();
    return;
  }

  requests.forEach(request => {
    const card = document.createElement("div");
    card.className = "request-card";

    const title = document.createElement("h3");
    title.textContent = request.type.toUpperCase();

    const details = document.createElement("p");
    details.textContent =
      "Player: " + request.user +
      " | ID: " + request.playerId +
      " | Amount: " + money(request.amount) +
      " | Status: " + request.status;

    const date = document.createElement("small");
    date.textContent =
      new Date(request.createdAt).toLocaleString();

    card.append(title, details, date);

    if (request.reference) {
      const ref = document.createElement("p");
      ref.textContent =
        "Reference: " + request.reference;
      card.appendChild(ref);
    }

    if (request.receiver) {
      const receiver = document.createElement("p");
      receiver.textContent =
        "Receiver: " + request.receiver;
      card.appendChild(receiver);
    }

    if (request.status === "pending") {
      const approve = document.createElement("button");
      approve.textContent = "Approve";

      approve.addEventListener("click", () => {
        updateRequest(request.id, "approved");
      });

      const reject = document.createElement("button");
      reject.textContent = "Reject";

      reject.addEventListener("click", () => {
        updateRequest(request.id, "rejected");
      });

      card.append(approve, reject);
    }

    container.appendChild(card);
  });

  updateAdminCount();
}


/* 14. APPROVE / REJECT */

function updateRequest(requestId, status) {
  if (!["approved", "rejected"].includes(status)) {
    return;
  }

  const request = requests.find(
    item => item.id === requestId
  );

  if (!request || request.status !== "pending") {
    showMessage("অনুরোধটি পরিবর্তন করা যাচ্ছে না।");
    return;
  }

  if (status === "approved") {
    if (request.type === "deposit") {
      virtualBalance += request.amount;
    } else {
      if (request.amount > virtualBalance) {
        showMessage("ভার্চুয়াল ব্যালেন্স যথেষ্ট নেই।");
        return;
      }

      virtualBalance -= request.amount;
    }
  }

  request.status = status;
  request.updatedAt = new Date().toISOString();

  const item = history.find(
    entry => entry.id === requestId
  );

  if (item) {
    item.status = status;
  }

  saveAll();
  updateBalance();
  renderAdminRequests();
  renderHistory();

  showMessage(
    status === "approved"
      ? "Approve হয়েছে।"
      : "Reject হয়েছে।"
  );
}


/* 15. ADMIN COUNTS */

function updateAdminCount() {
  setText(
    "pendingCount",
    requests.filter(
      item => item.status === "pending"
    ).length
  );

  setText(
    "approvedCount",
    requests.filter(
      item => item.status === "approved"
    ).length
  );
}


/* 16. ADMIN NUMBER SETTINGS */

function updateNumbers() {
  paymentNumbers = {
    bkash: getValue("newBkash"),
    nagad: getValue("newNagad")
  };

  saveData(STORAGE.numbers, paymentNumbers);
  updateNumbersDisplay();

  showMessage("লোকাল সেটিংস আপডেট হয়েছে।");
}

function updateNumbersDisplay() {
  const bkash = getElement("newBkash");
  const nagad = getElement("newNagad");

  if (bkash && !bkash.value) {
    bkash.value = paymentNumbers.bkash || "";
  }

  if (nagad && !nagad.value) {
    nagad.value = paymentNumbers.nagad || "";
  }
}


/* 17. HISTORY */

function renderHistory() {
  const container =
    getElement("historyList") ||
    getElement("transactionList") ||
    getElement("transactionsList");

  if (!container) return;

  container.replaceChildren();

  if (!history.length) {
    const empty = document.createElement("p");
    empty.textContent = "এখনো কোনো History নেই।";
    container.appendChild(empty);
    return;
  }

  history.forEach(item => {
    const row = document.createElement("div");
    row.className = "history-item";

    const title = document.createElement("strong");
    title.textContent = item.type.toUpperCase();

    const amount = document.createElement("p");
    amount.textContent = money(item.amount);

    const status = document.createElement("p");
    status.textContent = "Status: " + item.status;

    const date = document.createElement("small");
    date.textContent =
      new Date(item.date).toLocaleString();

    row.append(title, amount, status, date);
    container.appendChild(row);
  });
}


/* 18. VIP PROGRESS */

function updateVipProgress() {
  const progress = getElement("vipProgress");
  if (!progress) return;

  const percent = Math.min(
    100,
    virtualBalance / 100
  );

  if (progress.tagName === "PROGRESS") {
    progress.value = percent;
  } else {
    progress.style.width = percent + "%";
  }
}


/* 19. CUSTOMER SUPPORT */

function sendSupport() {
  if (!currentUser) {
    showMessage("আগে লগইন করুন।");
    return;
  }

  const subject = getValue("supportSubject");
  const message = getValue("supportMessage");

  if (!subject || !message) {
    showMessage("Subject ও Message লিখুন।");
    return;
  }

  supportTickets.unshift({
    id: makeId(),
    user: currentUser.name,
    subject: subject,
    message: message,
    status: "pending",
    date: new Date().toISOString()
  });

  saveData(STORAGE.tickets, supportTickets);

  const subjectInput = getElement("supportSubject");
  const messageInput = getElement("supportMessage");

  if (subjectInput) subjectInput.value = "";
  if (messageInput) messageInput.value = "";

  showMessage("আপনার Support Message সংরক্ষণ হয়েছে।");
}


/* 20. INITIALIZE */

function initializeApp() {
  updateBalance();
  updateProfile();
  updateAdminCount();
  updateNumbersDisplay();
  renderHistory();
  updateVipProgress();
  renderProviderCatalog();

  hideAllPages();

  const home = getElement("home");

  if (home) {
    home.classList.remove("hidden");
    home.classList.add("active");
    home.style.display = "block";
  }

  console.log("BIKASH12 BAJI initialized.");
}

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);
