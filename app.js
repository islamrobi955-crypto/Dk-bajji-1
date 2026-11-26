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
    return value !== null ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Storage error:", error);
  }
}

let currentUser = getData(STORAGE.user, null);
let virtualBalance = Number(getData(STORAGE.balance, 0)) || 0;
let requests = getData(STORAGE.requests, []);
let history = getData(STORAGE.history, []);
let supportTickets = getData(STORAGE.tickets, []);

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

  if (!element || !("value" in element)) {
    return "";
  }

  return String(element.value || "").trim();
}

function setText(id, value) {
  const element = getElement(id);

  if (element) {
    element.textContent = value;
  }
}

function money(value) {
  return "৳" + Number(value || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function makeId() {
  return "REQ-" + Date.now() + "-" +
    Math.floor(Math.random() * 10000);
}

function showMessage(message) {
  alert(message);
}

function saveAll() {
  saveData(STORAGE.user, currentUser);
  saveData(STORAGE.balance, virtualBalance);
  saveData(STORAGE.requests, requests);
  saveData(STORAGE.history, history);
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
  // JILI and PG buttons both open the complete provider catalog.
  if (pageName === "jili") {
    pageName = "pg";
  }

  hideAllPages();

  const target = getElement(pageName);

  if (target) {
    target.classList.remove("hidden");
    target.classList.add("active");
    target.style.display = "block";
  } else {
    console.warn("Page not found:", pageName);
  }

  const menu = getElement("sideMenu") ||
    document.querySelector(".side-menu");

  if (menu) {
    menu.classList.remove("show");
    menu.classList.add("hidden");
  }

  updateBalance();
  updateProfile();

  if (pageName === "pg") {
    renderProviderCatalog();
  }

  if (pageName === "admin") {
    renderAdminRequests();
  }

  if (
    pageName === "history" ||
    pageName === "transactions" ||
    pageName === "wallet"
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
  const menu = getElement("sideMenu") ||
    document.querySelector(".side-menu");

  if (!menu) return;

  const isHidden = menu.classList.contains("hidden");

  if (isHidden) {
    menu.classList.remove("hidden");
    menu.classList.add("show");
  } else {
    menu.classList.remove("show");
    menu.classList.add("hidden");
  }
}


/* 5. PROVIDER CATALOG */

function renderProviderCatalog() {
  const page = getElement("pg");
  if (!page) return;

  let catalog = getElement("providerCatalog");

  if (!catalog) {
    catalog = document.createElement("div");
    catalog.id = "providerCatalog";
    catalog.className = "provider-catalog";
    page.prepend(catalog);
  }

  catalog.replaceChildren();

  const heading = document.createElement("h2");
  heading.textContent = "ALL GAME PROVIDERS";

  const subtitle = document.createElement("p");
  subtitle.textContent =
    "আপনার পছন্দের Provider নির্বাচন করুন";

  const grid = document.createElement("div");
  grid.id = "allProviderGrid";
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

  const grid = getElement("allProviderGrid");
  const area = getElement("providerGameArea");

  if (grid) {
    grid.style.display = "none";
  }

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
  subtitle.textContent =
    provider.games.length + " Virtual Games";

  const gameGrid = document.createElement("div");
  gameGrid.className = "game-grid";

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
    gameGrid.appendChild(card);
  });

  area.append(
    back,
    title,
    subtitle,
    gameGrid
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* 7. HOME GAME FILTER */

function filterGames(category, button) {
  const home = getElement("home");
  if (!home) return;

  home.querySelectorAll(".game-card").forEach(card => {
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
    " — এই গেমের বাস্তব Provider সংযোগ যুক্ত করা হয়নি।";
}


/* 9. PLAYER LOGIN */

function playerLogin() {
  let name =
    getValue("playerName") ||
    getValue("loginName") ||
    getValue("userName");

  // HTML-এ নামের ইনপুট না থাকলে prompt দিয়ে নাম নেওয়া হবে।
  if (!name) {
    name = prompt("আপনার Player Name লিখুন:");
  }

  if (!name || !String(name).trim()) {
    showMessage("আপনার নাম লিখুন।");
    return;
  }

  currentUser = {
    name: String(name).trim(),
    playerId: "P-" + Date.now(),
    loginTime: new Date().toISOString()
  };

  saveAll();
  updateProfile();

  showMessage("লগইন সফল হয়েছে।");
  showPage("home");
}

function playerLogout() {
  if (!currentUser) {
    showMessage("আপনি আগে থেকেই Guest হিসেবে আছেন।");
    return;
  }

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

  setText(
    "profileBalance",
    money(virtualBalance)
  );
}


/* 10. VIRTUAL BALANCE */

function updateBalance() {
  setText("topBalance", money(virtualBalance));
  setText("walletBalance", money(virtualBalance));
  setText("profileBalance", money(virtualBalance));
}


/* 11. PAYMENT METHOD SELECTION */

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

  // paymentType HTML-এ input না হয়ে p হলেও কাজ করবে।
  const paymentType = getElement("paymentType");

  if (paymentType) {
    if ("value" in paymentType) {
      paymentType.value = selectedPaymentMethod;
    } else {
      paymentType.textContent =
        selectedPaymentMethod.toUpperCase();
    }
  }

  // কোনো বাস্তব পেমেন্ট নম্বর দেখানো হবে না।
  setText(
    "paymentNumber",
    "শুধুমাত্র ভার্চুয়াল ক্রেডিট অনুরোধ — কোনো টাকা পাঠাবেন না।"
  );
}


/* 12. VIRTUAL REQUEST SYSTEM */

function sendRequest(type) {
  if (!currentUser) {
    showMessage("আগে লগইন করুন।");
    showPage("profile");
    return;
  }

  type = String(type || "").toLowerCase().trim();

  if (type === "send money") {
    type = "send";
  }

  if (type === "deposit") {
    type = "deposit";
  }

  if (type === "withdrawal") {
    type = "withdraw";
  }

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
    method = selectedPaymentMethod || "virtual";
    reference = getValue("depositRef");
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
    "আপনার ভার্চুয়াল অনুরোধ জমা হয়েছে। এটি কোনো বাস্তব টাকা লেনদেন নয়।"
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

    if (element && "value" in element) {
      element.value = "";
    }
  });
}


/* 13. ADMIN REQUEST LIST */

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
      approve.type = "button";
      approve.textContent = "Approve";

      approve.addEventListener("click", () => {
        updateRequest(request.id, "approved");
      });

      const reject = document.createElement("button");
      reject.type = "button";
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


/* 14. APPROVE / REJECT REQUEST */

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

  // Deposit approval শুধু ভার্চুয়াল ক্রেডিট যোগ করে।
  // Send/Withdrawal approval কোনো বাস্তব টাকা পাঠায় না
  // এবং ভার্চুয়াল ব্যালেন্সও পরিবর্তন করে না।
  if (
    status === "approved" &&
    request.type === "deposit"
  ) {
    virtualBalance += Number(request.amount) || 0;
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
      ? "অনুরোধ Approve হয়েছে।"
      : "অনুরোধ Reject হয়েছে।"
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


/* 16. OLD PAYMENT NUMBER SETTINGS */

function updateNumbers() {
  // বাস্তব bKash/Nagad পেমেন্ট নম্বর সংরক্ষণ করা হয় না।
  const bkash = getElement("newBkash");
  const nagad = getElement("newNagad");

  if (bkash) bkash.value = "";
  if (nagad) nagad.value = "";

  showMessage(
    "এই ভার্চুয়াল সংস্করণে বাস্তব পেমেন্ট নম্বর ব্যবহার করা হয় না।"
  );
}

function updateNumbersDisplay() {
  // পুরোনো HTML-এর ইনপুট থাকলে সেগুলো খালি রাখা হবে।
  const bkash = getElement("newBkash");
  const nagad = getElement("newNagad");

  if (bkash) bkash.value = "";
  if (nagad) nagad.value = "";
}


/* 17. HISTORY */

function renderHistory() {
  const containerIds = [
    "history",
    "historyList",
    "transactionHistory",
    "transactionList",
    "transactionsList",
    "gameHistory"
  ];

  const containers = containerIds
    .map(id => getElement(id))
    .filter(Boolean);

  if (!containers.length) return;

  containers.forEach(container => {
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
      title.textContent = String(item.type || "Request").toUpperCase();

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
  });
}


/* 18. VIP PROGRESS */

function updateVipProgress() {
  const progress = getElement("vipProgress");
  if (!progress) return;

  const percent = Math.min(
    100,
    Math.max(0, virtualBalance)
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
    showPage("profile");
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
    playerId: currentUser.playerId,
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

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );
} else {
  initializeApp();
                        }
