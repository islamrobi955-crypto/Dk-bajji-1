/* =========================================================
   BIKASH12 BAJI — Complete app.js
   ========================================================= */

"use strict";

const SUPABASE_URL = "https://yfvntswzolcagfauxons.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_TPjwrOvBZBPffBbfGg2g_A_Zws001wL";
const ADMIN_UID = "1470dafc-ecc1-49b7-afc3-6b9662f00015";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

let currentUser = null;
let currentPlayer = null;
let isAdmin = false;
let isBlocked = false;
let currentPage = "home";
let walletSettings = { virtual_a_number: "", virtual_b_number: "" };

const $ = (id) => document.getElementById(id);

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
}[c]));

const money = (value) =>
  "৳ " + Number(value || 0).toLocaleString("en-US");

const dateText = (value) =>
  value ? new Date(value).toLocaleString("en-BD") : "—";

function notify(message, type = "info") {
  let box = $("appToast");

  if (!box) {
    box = document.createElement("div");
    box.id = "appToast";
    box.style.cssText =
      "position:fixed;z-index:99999;left:16px;right:16px;bottom:22px;padding:13px 16px;border-radius:12px;background:#151515;color:#fff;border:1px solid #d6a600;box-shadow:0 5px 25px #000;text-align:center;font-weight:600";
    document.body.appendChild(box);
  }

  box.textContent = message;
  box.style.borderColor =
    type === "error" ? "#ff5555" :
    type === "success" ? "#20c997" : "#d6a600";

  box.style.display = "block";
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => box.style.display = "none", 3500);
}

function setMessage(id, message, error = false) {
  const el = $(id);
  if (!el) return;
  el.textContent = message || "";
  el.style.color = error ? "#ff7777" : "#18c98b";
}

function showAuth() {
  if ($("authSection")) $("authSection").style.display = "";
  if ($("appSection")) $("appSection").style.display = "none";
}

function showApplication() {
  if ($("authSection")) $("authSection").style.display = "none";
  if ($("appSection")) $("appSection").style.display = "";
}

function showAuthTab(tab) {
  const login = $("loginForm");
  const register = $("registerForm");
  const reset = $("resetForm");

  if (login) login.style.display = tab === "login" ? "" : "none";
  if (register) register.style.display = tab === "register" ? "" : "none";
  if (reset) reset.style.display = tab === "reset" ? "" : "none";

  if ($("loginTab")) $("loginTab").classList.toggle("active", tab === "login");
  if ($("registerTab")) $("registerTab").classList.toggle("active", tab === "register");

  setMessage("authMessage", "");
}

async function registerPlayer(event) {
  event?.preventDefault();

  const name = $("registerName")?.value.trim();
  const mobile = $("registerMobile")?.value.trim();
  const email = $("registerEmail")?.value.trim();
  const password = $("registerPassword")?.value || "";
  const confirm = $("confirmPassword")?.value || "";

  if (!name || !mobile || !email || !password) {
    return setMessage("authMessage", "সব তথ্য পূরণ করুন।", true);
  }

  if (!/^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/.test(mobile.replace(/[ -]/g, ""))) {
    return setMessage("authMessage", "সঠিক বাংলাদেশি মোবাইল নম্বর দিন।", true);
  }

  if (password.length < 6) {
    return setMessage("authMessage", "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", true);
  }

  if (password !== confirm) {
    return setMessage("authMessage", "দুইটি পাসওয়ার্ড মিলছে না।", true);
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
        mobile_number: mobile
      }
    }
  });

  if (error) return setMessage("authMessage", error.message, true);

  if (data.session) {
    currentUser = data.user;
    await loadApplication();
  } else {
    setMessage(
      "authMessage",
      "Registration সফল। Gmail-এ পাঠানো verification link দিয়ে Email Confirm করুন, তারপর Login করুন।"
    );
  }
}

async function loginPlayer(event) {
  event?.preventDefault();

  const email = $("loginEmail")?.value.trim();
  const password = $("loginPassword")?.value || "";

  if (!email || !password) {
    return setMessage("authMessage", "Email ও Password দিন।", true);
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) return setMessage("authMessage", error.message, true);

  currentUser = data.user;
  await loadApplication();
}

async function sendPasswordReset(event) {
  event?.preventDefault();

  const email = $("resetEmail")?.value.trim();

  if (!email) {
    return setMessage("authMessage", "আপনার Gmail দিন।", true);
  }

  const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });

  if (error) return setMessage("authMessage", error.message, true);

  setMessage("authMessage", "Password reset link আপনার Gmail-এ পাঠানো হয়েছে।");
}

async function logoutPlayer() {
  await supabaseClient.auth.signOut();

  currentUser = null;
  currentPlayer = null;
  isAdmin = false;
  isBlocked = false;

  showAuth();
  showAuthTab("login");
}

async function loadApplication() {
  if (!currentUser) return showAuth();

  isAdmin = currentUser.id === ADMIN_UID;

  const { data, error } = await supabaseClient
    .from("players")
    .select("*")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (error) {
    notify("Player profile load হয়নি: " + error.message, "error");
    return;
  }

  currentPlayer = data;

  if (!currentPlayer && !isAdmin) {
    notify("Player profile পাওয়া যায়নি।", "error");
    return;
  }

  isBlocked = !!currentPlayer && currentPlayer.is_active === false;

  showApplication();
  updateHeader();

  if ($("adminMenuBtn")) {
    $("adminMenuBtn").style.display = isAdmin ? "" : "none";
  }

  if (isBlocked) {
    notify(
      "আপনার Account সাময়িকভাবে Restricted। Support-এ যোগাযোগ করতে পারবেন।",
      "error"
    );
    showPage("support");
  } else {
    showPage("home");
  }
}

function updateHeader() {
  const name = isAdmin
    ? "Administrator"
    : (currentPlayer?.display_name || "Player");

  const coins = currentPlayer?.coins || 0;

  if ($("homePlayerInfo")) {
    $("homePlayerInfo").innerHTML = `
      <div class="player-welcome">
        <div>Welcome, <b>${esc(name)}</b></div>
        <div class="coin-balance">${money(coins)}</div>
        <small>${isAdmin ? "ADMINISTRATOR" : "ROYAL PLAYER"}</small>
      </div>`;
  }

  if ($("headerPlayerName")) {
    $("headerPlayerName").textContent = name;
  }

  if ($("headerCoinBalance")) {
    $("headerCoinBalance").textContent = money(coins);
  }
}

function pageElement(page) {
  const map = {
    home: "homePage",
    profile: "profilePage",
    wallet: "walletPage",
    security: "securityPage",
    bonus: "bonusPage",
    history: "historyPage",
    support: "supportPage",
    about: "aboutPage",
    admin: "adminPage"
  };

  return $(map[page]);
}

async function showPage(page) {
  if (!isAdmin && isBlocked && page !== "support") {
    page = "support";
  }

  if (page === "admin" && !isAdmin) {
    page = "home";
  }

  currentPage = page;

  document.querySelectorAll("#appSection [id$='Page']")
    .forEach(el => el.style.display = "none");

  const target = pageElement(page);
  if (target) target.style.display = "";

  if ($("sideMenu")) {
    $("sideMenu").classList.remove("open");
  }

  const loaders = {
    home: loadHome,
    profile: loadProfile,
    wallet: loadWallet,
    security: loadSecurity,
    bonus: loadBonus,
    history: loadHistory,
    support: loadSupport,
    about: loadAbout,
    admin: loadAdminPanel
  };

  if (loaders[page]) await loaders[page]();
}

async function loadHome() {
  if (!isAdmin) {
    const { data } = await supabaseClient
      .from("players")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    if (data) currentPlayer = data;
  }

  updateHeader();
}

async function loadProfile() {
  if (!currentPlayer) return;

  const el = $("profileContent");
  if (!el) return;

  el.innerHTML = `
    <section class="panel">
      <h2>♛ My Profile</h2>
      <div class="profile-avatar">♛</div>
      <p><b>${esc(currentPlayer.display_name)}</b></p>
      <p>
        Player ID: <small>${esc(currentUser.id)}</small>
        <button type="button" onclick="copyText('${currentUser.id}')">Copy</button>
      </p>
      <p>Email: ${esc(currentUser.email || "")}</p>
      <p>Mobile: ${esc(currentPlayer.mobile_number || "Not set")}</p>
      <h3>${money(currentPlayer.coins)}</h3>

      <form id="profileEditForm">
        <label>Player Name</label>
        <input id="editPlayerName" value="${esc(currentPlayer.display_name)}" required>

        <label>Mobile Number</label>
        <input id="editPlayerMobile" value="${esc(currentPlayer.mobile_number || "")}" required>

        <button class="primary-btn" type="submit">Save Profile</button>
      </form>
    </section>`;

  $("profileEditForm")?.addEventListener("submit", saveProfile);
}

async function saveProfile(event) {
  event.preventDefault();

  const name = $("editPlayerName")?.value.trim();
  const mobile = $("editPlayerMobile")?.value.trim();

  if (!name || !mobile) {
    return notify("নাম ও মোবাইল নম্বর দিন।", "error");
  }

  const { error } = await supabaseClient.rpc("update_player_profile", {
    p_display_name: name,
    p_mobile_number: mobile
  });

  if (error) return notify(error.message, "error");

  currentPlayer.display_name = name;
  currentPlayer.mobile_number = mobile;

  updateHeader();
  notify("Profile updated successfully", "success");
  loadProfile();
}

async function getWalletSettings() {
  const { data, error } = await supabaseClient
    .from("virtual_credit_settings")
    .select("virtual_a_number,virtual_b_number")
    .eq("id", 1)
    .maybeSingle();

  if (!error && data) walletSettings = data;

  return walletSettings;
}
async function loadWallet() {
  const el = $("walletContent");
  if (!el) return;

  if (!currentPlayer) {
    const { data } = await supabaseClient
      .from("players")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();

    currentPlayer = data;
  }

  await getWalletSettings();

  el.innerHTML = `
    <section class="panel">
      <h2>♢ Wallet</h2>

      <div class="wallet-balance">
        Available Balance
        <h2>${money(currentPlayer?.coins)}</h2>
      </div>

      <h3>Deposit / Add Coins</h3>

      <form id="depositForm">
        <label>Payment Method</label>
        <select id="depositMethod" required>
          <option value="virtual_a">bKash</option>
          <option value="virtual_b">Nagad</option>
        </select>

        <div class="payment-number-box">
          <span id="walletPaymentNumber">
            ${esc(walletSettings.virtual_a_number || "Number not set")}
          </span>
          <button type="button" id="copyPaymentNumberBtn">Copy Number</button>
        </div>

        <label>Deposit Amount</label>
        <input id="depositAmount" type="number" min="1" step="1" required>

        <label>Transaction ID / Reference (Optional)</label>
        <input id="depositReference" maxlength="100">

        <button class="primary-btn" type="submit">
          Submit Deposit Request
        </button>
      </form>

      <hr>

      <h3>Withdrawal</h3>

      <form id="withdrawalForm">
        <label>Your Mobile Number</label>
        <input id="withdrawMobile" type="tel"
          value="${esc(currentPlayer?.mobile_number || "")}" required>

        <label>Amount</label>
        <input id="withdrawAmount" type="number" min="1" step="1" required>

        <label>Transaction PIN</label>
        <input id="withdrawPin" type="password"
          inputmode="numeric" maxlength="6" required>

        <button class="primary-btn" type="submit">
          Submit Withdrawal Request
        </button>
      </form>

      <hr>
      <h3>Deposit History</h3>
      <div id="depositHistoryList">Loading...</div>

      <h3>Withdrawal History</h3>
      <div id="withdrawalHistoryList">Loading...</div>
    </section>`;

  $("depositMethod")?.addEventListener("change", updateWalletPaymentNumber);

  $("copyPaymentNumberBtn")?.addEventListener("click", () => {
    copyText($("walletPaymentNumber")?.textContent || "");
  });

  $("depositForm")?.addEventListener("submit", submitDeposit);
  $("withdrawalForm")?.addEventListener("submit", submitWithdrawal);

  loadPlayerDepositHistory();
  loadPlayerWithdrawalHistory();
}

function updateWalletPaymentNumber() {
  const method = $("depositMethod")?.value;

  const number = method === "virtual_b"
    ? walletSettings.virtual_b_number
    : walletSettings.virtual_a_number;

  if ($("walletPaymentNumber")) {
    $("walletPaymentNumber").textContent = number || "Number not set";
  }
}

async function submitDeposit(event) {
  event.preventDefault();

  const amount = Number($("depositAmount")?.value);
  const method = $("depositMethod")?.value;
  const reference = $("depositReference")?.value.trim();

  if (!Number.isInteger(amount) || amount <= 0) {
    return notify("সঠিক Amount দিন।", "error");
  }

  const { error } = await supabaseClient.rpc("submit_deposit_request", {
    p_amount: amount,
    p_payment_method: method,
    p_reference_id: reference || null
  });

  if (error) return notify(error.message, "error");

  notify("Deposit request Admin-এর কাছে পাঠানো হয়েছে।", "success");

  $("depositForm").reset();
  updateWalletPaymentNumber();
  loadPlayerDepositHistory();
}

async function submitWithdrawal(event) {
  event.preventDefault();

  const mobile = $("withdrawMobile")?.value.trim();
  const amount = Number($("withdrawAmount")?.value);
  const pin = $("withdrawPin")?.value || "";

  if (
    !mobile ||
    !Number.isInteger(amount) ||
    amount <= 0 ||
    !/^\d{4}(\d{2})?$/.test(pin)
  ) {
    return notify("সঠিক মোবাইল, Amount এবং ৪/৬ সংখ্যার PIN দিন।", "error");
  }

  const { error } = await supabaseClient.rpc("submit_withdrawal_request", {
    p_mobile_number: mobile,
    p_amount: amount,
    p_pin: pin
  });

  if (error) return notify(error.message, "error");

  notify("Withdrawal request পাঠানো হয়েছে।", "success");

  $("withdrawalForm").reset();
  loadPlayerWithdrawalHistory();
}

async function loadPlayerDepositHistory() {
  const box = $("depositHistoryList");
  if (!box || !currentUser) return;

  const { data, error } = await supabaseClient
    .from("deposit_requests")
    .select("id,amount,payment_method,reference_id,status,created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    box.textContent = error.message;
    return;
  }

  box.innerHTML = data?.length
    ? data.map(row => `
      <div class="history-row">
        <b>${money(row.amount)}</b> • ${esc(row.payment_method)}
        <span>${esc(row.status)}</span>
        <small>
          ${esc(row.reference_id || "No reference")}
          • ${dateText(row.created_at)}
        </small>
      </div>`).join("")
    : "<p>No deposit history</p>";
}

async function loadPlayerWithdrawalHistory() {
  const box = $("withdrawalHistoryList");
  if (!box || !currentUser) return;

  const { data, error } = await supabaseClient
    .from("withdrawal_requests")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    box.textContent = error.message;
    return;
  }

  box.innerHTML = data?.length
    ? data.map(row => `
      <div class="history-row">
        <b>${money(row.amount)}</b> • ${esc(row.status)}
        <small>
          ${esc(row.mobile_number || "")}
          • ${dateText(row.created_at)}
        </small>
      </div>`).join("")
    : "<p>No withdrawal history</p>";
}

async function loadSecurity() {
  const el = $("securityContent");
  if (!el) return;

  el.innerHTML = `
    <section class="panel">
      <h2>Security Center</h2>

      <h3>Create / Change Transaction PIN</h3>

      <form id="pinForm">
        <label>New PIN (4 or 6 digits)</label>
        <input id="newPin" type="password"
          inputmode="numeric" maxlength="6" required>

        <label>Confirm PIN</label>
        <input id="confirmPin" type="password"
          inputmode="numeric" maxlength="6" required>

        <button class="primary-btn">Save PIN</button>
      </form>

      <hr>

      <h3>Forgot PIN?</h3>

      <form id="pinResetForm">
        <label>Registered Mobile Number</label>
        <input id="pinResetMobile" type="tel"
          value="${esc(currentPlayer?.mobile_number || "")}" required>

        <button class="primary-btn">Request PIN Reset</button>
      </form>
    </section>`;

  $("pinForm")?.addEventListener("submit", setPlayerPin);
  $("pinResetForm")?.addEventListener("submit", requestPinReset);
}

async function setPlayerPin(event) {
  event.preventDefault();

  const pin = $("newPin")?.value || "";
  const confirm = $("confirmPin")?.value || "";

  if (!/^\d{4}(\d{2})?$/.test(pin)) {
    return notify("PIN অবশ্যই ৪ অথবা ৬ সংখ্যার হতে হবে।", "error");
  }

  if (pin !== confirm) {
    return notify("PIN মিলছে না।", "error");
  }

  const { error } = await supabaseClient.rpc("set_transaction_pin", {
    p_pin: pin
  });

  if (error) return notify(error.message, "error");

  notify("Transaction PIN saved", "success");
  $("pinForm").reset();
}

async function requestPinReset(event) {
  event.preventDefault();

  const mobile = $("pinResetMobile")?.value.trim();

  const { error } = await supabaseClient.rpc("submit_pin_reset_request", {
    p_mobile_number: mobile
  });

  if (error) return notify(error.message, "error");

  notify("PIN reset request Admin-এর কাছে পাঠানো হয়েছে।", "success");
  $("pinResetForm").reset();
}

async function loadBonus() {
  const el = $("bonusContent");
  if (!el) return;

  const { data } = await supabaseClient
    .from("app_download_bonus")
    .select("*")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  el.innerHTML = `
    <section class="panel">
      <h2>VIP & Bonus</h2>
      <h3>App Download Bonus</h3>

      <p>
        App Download-এর Screenshot জমা দিন।
        Admin যাচাই করে অনুমোদন করলে ১৯৯ Coins যোগ হবে।
      </p>

      ${data ? `
        <p>Application Status:
          <b>${esc(data.status || "submitted")}</b>
        </p>
      ` : `
        <form id="downloadBonusForm">
          <label>Screenshot Image</label>
          <input id="bonusScreenshot" type="file"
            accept="image/*" required>

          <button class="primary-btn">Submit Screenshot</button>
        </form>
      `}
    </section>`;

  $("downloadBonusForm")?.addEventListener("submit", submitDownloadBonus);
}

async function submitDownloadBonus(event) {
  event.preventDefault();

  const file = $("bonusScreenshot")?.files?.[0];

  if (!file) {
    return notify("Screenshot নির্বাচন করুন।", "error");
  }

  if (file.size > 5 * 1024 * 1024) {
    return notify("ছবির সাইজ ৫ MB-এর কম হতে হবে।", "error");
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${currentUser.id}/${Date.now()}.${ext}`;

  const { data: upload, error: uploadError } =
    await supabaseClient.storage
      .from("app-download-screenshots")
      .upload(path, file, { upsert: false });

  if (uploadError) {
    return notify("Screenshot upload failed: " + uploadError.message, "error");
  }

  const { data: publicData } = supabaseClient.storage
    .from("app-download-screenshots")
    .getPublicUrl(upload.path);

  const { error } = await supabaseClient.rpc("submit_app_download_bonus", {
    p_screenshot_url: publicData.publicUrl
  });

  if (error) return notify(error.message, "error");

  notify("Screenshot submitted for Admin review", "success");
  loadBonus();
}

async function loadHistory() {
  const el = $("historyContent");
  if (!el) return;

  const { data, error } = await supabaseClient
    .from("coin_transactions")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    el.textContent = error.message;
    return;
  }

  el.innerHTML = `
    <section class="panel">
      <h2>Transaction History</h2>

      ${
        data?.length
          ? data.map(row => `
            <div class="history-row">
              <b>${esc(row.transaction_type || row.type || "Transaction")}</b>
              <strong>${money(row.amount)}</strong>
              <small>
                ${esc(row.description || "")}
                • ${dateText(row.created_at)}
              </small>
            </div>
          `).join("")
          : "<p>No transactions yet</p>"
      }
    </section>`;
}

async function loadSupport() {
  const el = $("supportContent");
  if (!el) return;

  const { data, error } = await supabaseClient
    .from("support_messages")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false })
    .limit(50);

  el.innerHTML = `
    <section class="panel">
      <h2>Support / Contact Admin</h2>

      <form id="supportForm">
        <label>Message</label>
        <textarea id="supportMessage" rows="4" required></textarea>
        <button class="primary-btn">Send Message</button>
      </form>

      <hr>
      <h3>Messages</h3>

      ${
        error
          ? `<p>${esc(error.message)}</p>`
          : data?.length
            ? data.map(row => `
              <div class="history-row">
                <p>${esc(row.message || row.player_message || "")}</p>
                ${row.admin_reply
                  ? `<p><b>Admin:</b> ${esc(row.admin_reply)}</p>`
                  : ""}
                <small>
                  ${esc(row.status || "sent")}
                  • ${dateText(row.created_at)}
                </small>
              </div>
            `).join("")
            : "<p>No messages</p>"
      }
    </section>`;

  $("supportForm")?.addEventListener("submit", submitSupportMessage);
}

async function submitSupportMessage(event) {
  event.preventDefault();

  const message = $("supportMessage")?.value.trim();
  if (!message) return;

  const { error } = await supabaseClient.rpc("submit_support_message", {
    p_message: message
  });

  if (error) return notify(error.message, "error");

  notify("Message sent to Admin", "success");
  loadSupport();
}

async function loadAbout() {
  const el = $("aboutContent");

  if (el) {
    el.innerHTML = `
      <section class="panel">
        <h2>♛ BIKASH12 BAJI</h2>
        <p>Royal Player Experience</p>
        <p>Version 1.0</p>
      </section>`;
  }
                           }

/* ======================= ADMIN PANEL ======================= */

async function loadAdminPanel() {
  const el = $("adminContent");
  if (!el) return;

  if (!isAdmin || currentUser.id !== ADMIN_UID) {
    el.textContent = "Access denied";
    return;
  }

  await getWalletSettings();

  el.innerHTML = `
    <section class="panel">
      <h2>♛ Admin Panel</h2>

      <h3>Payment Number Settings</h3>

      <div class="admin-payment">
        <label>bKash Number</label>
        <input id="adminBkashNumber" type="tel"
          value="${esc(walletSettings.virtual_a_number)}"
          placeholder="01XXXXXXXXX">

        <button type="button"
          onclick="saveAdminPaymentNumber('virtual_a')">
          Set / Change bKash
        </button>

        <button type="button" class="danger-btn"
          onclick="deleteAdminPaymentNumber('virtual_a')">
          Delete bKash
        </button>

        <hr>

        <label>Nagad Number</label>
        <input id="adminNagadNumber" type="tel"
          value="${esc(walletSettings.virtual_b_number)}"
          placeholder="01XXXXXXXXX">

        <button type="button"
          onclick="saveAdminPaymentNumber('virtual_b')">
          Set / Change Nagad
        </button>

        <button type="button" class="danger-btn"
          onclick="deleteAdminPaymentNumber('virtual_b')">
          Delete Nagad
        </button>
      </div>

      <hr>

      <h3>Pending Deposit Requests</h3>
      <div id="adminPendingDeposits">Loading pending requests...</div>

      <hr>

      <h3>Player Search</h3>
      <form id="adminPlayerSearchForm">
        <input id="adminPlayerSearch"
          placeholder="Player email / name / ID">
        <button type="submit">Search</button>
      </form>
      <div id="adminPlayerSearchResults"></div>

      <hr>

      <h3>Pending Withdrawal Requests</h3>
      <div id="adminPendingWithdrawals">Loading...</div>

      <hr>

      <h3>Pending PIN Reset Requests</h3>
      <div id="adminPendingPinResets">Loading...</div>

      <hr>

      <h3>Support Inbox</h3>
      <div id="adminSupportInbox">Loading...</div>
    </section>`;

  $("adminPlayerSearchForm")?.addEventListener(
    "submit",
    searchAdminPlayers
  );

  loadAdminPendingDeposits();
  loadAdminPendingWithdrawals();
  loadAdminPendingPinResets();
  loadAdminSupportInbox();
}

async function saveAdminPaymentNumber(method) {
  if (!isAdmin || currentUser.id !== ADMIN_UID) {
    return notify("Access denied", "error");
  }

  const a = method === "virtual_a";

  const input = $(a ? "adminBkashNumber" : "adminNagadNumber");
  const value = input?.value.trim() || "";

  const other = a
    ? walletSettings.virtual_b_number
    : walletSettings.virtual_a_number;

  const { error } = await supabaseClient.rpc(
    "admin_update_virtual_credit_numbers",
    {
      p_virtual_a_number: a ? value : other,
      p_virtual_b_number: a ? other : value
    }
  );

  if (error) return notify(error.message, "error");

  walletSettings[a ? "virtual_a_number" : "virtual_b_number"] = value;

  notify(
    (a ? "bKash" : "Nagad") + " number updated",
    "success"
  );
}

async function deleteAdminPaymentNumber(method) {
  if (!isAdmin || currentUser.id !== ADMIN_UID) {
    return notify("Access denied", "error");
  }

  const a = method === "virtual_a";

  const other = a
    ? walletSettings.virtual_b_number
    : walletSettings.virtual_a_number;

  const { error } = await supabaseClient.rpc(
    "admin_update_virtual_credit_numbers",
    {
      p_virtual_a_number: a ? "" : other,
      p_virtual_b_number: a ? other : ""
    }
  );

  if (error) return notify(error.message, "error");

  walletSettings[a ? "virtual_a_number" : "virtual_b_number"] = "";

  const input = $(a ? "adminBkashNumber" : "adminNagadNumber");
  if (input) input.value = "";

  notify(
    (a ? "bKash" : "Nagad") + " number deleted",
    "success"
  );
}

/* -------- PENDING DEPOSIT MANAGEMENT -------- */

async function loadAdminPendingDeposits() {
  const box = $("adminPendingDeposits");

  if (!box || !isAdmin) return;

  const { data, error } = await supabaseClient
    .from("deposit_requests")
    .select("id,user_id,amount,payment_method,reference_id,status,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    box.innerHTML = `<p class="error">${esc(error.message)}</p>`;
    return;
  }

  if (!data?.length) {
    box.innerHTML = "<p>No pending deposit requests.</p>";
    return;
  }

  box.innerHTML = data.map(row => `
    <div class="admin-request-card"
      style="border:1px solid #555;border-radius:12px;padding:12px;margin:10px 0">

      <p><b>Request #${row.id}</b></p>

      <p>
        Player ID:
        <small>${esc(row.user_id)}</small>
      </p>

      <p>
        Amount:
        <b>${money(row.amount)}</b>
      </p>

      <p>Method: ${esc(row.payment_method)}</p>

      <p>
        Reference:
        ${esc(row.reference_id || "Not provided")}
      </p>

      <p>Status: <b>${esc(row.status)}</b></p>

      <small>${dateText(row.created_at)}</small>
      <br>

      <button type="button"
        onclick="reviewDepositRequest(${Number(row.id)},'approve',this)">
        Approve
      </button>

      <button type="button" class="danger-btn"
        onclick="reviewDepositRequest(${Number(row.id)},'reject',this)">
        Reject
      </button>

    </div>
  `).join("");
}

async function reviewDepositRequest(requestId, action, button) {
  if (!isAdmin || currentUser.id !== ADMIN_UID) {
    return notify("Access denied", "error");
  }

  const actionText = action === "approve" ? "Approve" : "Reject";

  if (!confirm(`${actionText} this deposit request?`)) return;

  const card = button?.closest(".admin-request-card");

  if (card) {
    card.querySelectorAll("button").forEach(b => b.disabled = true);
  }

  const rpc = action === "approve"
    ? "approve_deposit_request"
    : "reject_deposit_request";

  const { error } = await supabaseClient.rpc(rpc, {
    p_request_id: Number(requestId)
  });

  if (error) {
    if (card) {
      card.querySelectorAll("button").forEach(b => b.disabled = false);
    }

    return notify(error.message, "error");
  }

  notify(
    action === "approve"
      ? "Deposit approved. Coins added."
      : "Deposit request rejected.",
    "success"
  );

  loadAdminPendingDeposits();
}

/* -------- WITHDRAWAL MANAGEMENT -------- */

async function loadAdminPendingWithdrawals() {
  const box = $("adminPendingWithdrawals");

  if (!box || !isAdmin) return;

  const { data, error } = await supabaseClient
    .from("withdrawal_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    box.textContent = error.message;
    return;
  }

  box.innerHTML = data?.length
    ? data.map(row => `
      <div class="admin-request-card"
        style="border:1px solid #555;padding:10px;margin:8px 0;border-radius:10px">

        <p><b>${money(row.amount)}</b> • ${esc(row.mobile_number || "")}</p>

        <p>Player: ${esc(row.user_id)}</p>

        <small>${dateText(row.created_at)}</small>

        <p>
          <button onclick="reviewAdminRequest(
            'withdrawal_requests',
            ${Number(row.id)},
            'approve'
          )">
            Mark Paid
          </button>

          <button class="danger-btn"
            onclick="reviewAdminRequest(
              'withdrawal_requests',
              ${Number(row.id)},
              'reject'
            )">
            Reject
          </button>
        </p>
      </div>
    `).join("")
    : "<p>No pending withdrawal requests.</p>";
}

/* -------- PIN RESET MANAGEMENT -------- */

async function loadAdminPendingPinResets() {
  const box = $("adminPendingPinResets");

  if (!box || !isAdmin) return;

  const { data, error } = await supabaseClient
    .from("pin_reset_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    box.textContent = error.message;
    return;
  }

  box.innerHTML = data?.length
    ? data.map(row => `
      <div class="admin-request-card"
        style="border:1px solid #555;padding:10px;margin:8px 0;border-radius:10px">

        <p>Player: ${esc(row.user_id)}</p>
        <p>Mobile: ${esc(row.mobile_number || "")}</p>

        <small>${dateText(row.created_at)}</small>

        <p>
          <button onclick="reviewAdminRequest(
            'pin_reset_requests',
            ${Number(row.id)},
            'approve'
          )">
            Approve Reset
          </button>

          <button class="danger-btn"
            onclick="reviewAdminRequest(
              'pin_reset_requests',
              ${Number(row.id)},
              'reject'
            )">
            Reject
          </button>
        </p>
      </div>
    `).join("")
    : "<p>No pending PIN reset requests.</p>";
}

async function reviewAdminRequest(table, id, action) {
  if (!isAdmin || currentUser.id !== ADMIN_UID) {
    return notify("Access denied", "error");
  }

  const map = {
    withdrawal_requests:
      action === "approve"
        ? "approve_withdrawal_request"
        : "reject_withdrawal_request",

    pin_reset_requests:
      action === "approve"
        ? "approve_pin_reset_request"
        : "reject_pin_reset_request"
  };

  const rpc = map[table];

  if (!rpc || !confirm("Continue?")) return;

  const { error } = await supabaseClient.rpc(rpc, {
    p_request_id: Number(id)
  });

  if (error) return notify(error.message, "error");

  notify("Request updated", "success");

  if (table === "withdrawal_requests") {
    loadAdminPendingWithdrawals();
  }

  if (table === "pin_reset_requests") {
    loadAdminPendingPinResets();
  }
}

/* -------- SUPPORT INBOX -------- */

async function loadAdminSupportInbox() {
  const box = $("adminSupportInbox");

  if (!box || !isAdmin) return;

  const { data, error } = await supabaseClient
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    box.textContent = error.message;
    return;
  }

  box.innerHTML = data?.length
    ? data.map(row => `
      <div class="admin-request-card"
        style="border:1px solid #555;padding:10px;margin:8px 0;border-radius:10px">

        <p>Player: ${esc(row.user_id)}</p>

        <p>${esc(row.message || row.player_message || "")}</p>

        <p>Reply: ${esc(row.admin_reply || "No reply")}</p>

        <textarea id="reply-${row.id}"
          placeholder="Write Admin reply"></textarea>

        <button onclick="replyAdminSupport(${Number(row.id)})">
          Send Reply
        </button>
      </div>
    `).join("")
    : "<p>No support messages.</p>";
}

async function replyAdminSupport(id) {
  if (!isAdmin || currentUser.id !== ADMIN_UID) {
    return notify("Access denied", "error");
  }

  const message = $(`reply-${id}`)?.value.trim();

  if (!message) {
    return notify("Reply লিখুন।", "error");
  }

  const { error } = await supabaseClient.rpc(
    "admin_reply_support_message",
    {
      p_message_id: Number(id),
      p_reply: message
    }
  );

  if (error) return notify(error.message, "error");

  notify("Reply sent", "success");
  loadAdminSupportInbox();
}

/* -------- PLAYER SEARCH -------- */

async function searchAdminPlayers(event) {
  event.preventDefault();

  if (!isAdmin) return;

  const term = $("adminPlayerSearch")?.value.trim();
  const box = $("adminPlayerSearchResults");

  if (!term || !box) return;

  let query = supabaseClient
    .from("players")
    .select("user_id,display_name,coins,mobile_number,is_active,created_at")
    .limit(30);

  if (/^[0-9a-f-]{30,}$/i.test(term)) {
    query = query.eq("user_id", term);
  } else {
    query = query.or(
      `display_name.ilike.%${term}%,mobile_number.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    box.textContent = error.message;
    return;
  }

  box.innerHTML = data?.length
    ? data.map(p => `
      <div class="history-row">
        <b>${esc(p.display_name)}</b> • ${money(p.coins)}
        <small>
          ${esc(p.user_id)}
          • ${esc(p.mobile_number || "")}
          • ${p.is_active ? "Active" : "Blocked"}
        </small>
      </div>
    `).join("")
    : "<p>No player found</p>";
}

/* -------- COPY TEXT -------- */

async function copyText(value) {
  if (!value || value === "Number not set") {
    return notify("Copy করার মতো নম্বর নেই।", "error");
  }

  try {
    await navigator.clipboard.writeText(value);
    notify("Copied successfully", "success");
  } catch {
    const input = document.createElement("textarea");

    input.value = value;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();

    notify("Copied successfully", "success");
  }
}

/* ======================= EVENT BINDINGS ======================= */

function bindAppEvents() {
  $("loginForm")?.addEventListener("submit", loginPlayer);
  $("registerForm")?.addEventListener("submit", registerPlayer);
  $("resetForm")?.addEventListener("submit", sendPasswordReset);

  $("loginTab")?.addEventListener("click", () => showAuthTab("login"));
  $("registerTab")?.addEventListener("click", () => showAuthTab("register"));
  $("forgotPasswordBtn")?.addEventListener("click", () => showAuthTab("reset"));
  $("backToLogin")?.addEventListener("click", () => showAuthTab("login"));

  $("logoutBtn")?.addEventListener("click", logoutPlayer);

  $("menuBtn")?.addEventListener("click", () => {
    $("sideMenu")?.classList.toggle("open");
  });

  $("adminMenuBtn")?.addEventListener("click", () => showPage("admin"));

  document.querySelectorAll("[data-page]").forEach(link => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showPage(link.dataset.page);
    });
  });
}

/* ======================= INITIALIZE APP ======================= */

async function initializeApp() {
  bindAppEvents();
  showAuth();

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session?.user) {
    currentUser = session.user;
    await loadApplication();
  } else {
    showAuthTab("login");
  }

  supabaseClient.auth.onAuthStateChange(async (_event, sessionNow) => {
    if (
      sessionNow?.user &&
      (!currentUser || currentUser.id !== sessionNow.user.id)
    ) {
      currentUser = sessionNow.user;
      await loadApplication();
    }

    if (!sessionNow) {
      currentUser = null;
      currentPlayer = null;
      showAuth();
    }
  });
}

/* Global functions used by inline Admin buttons */

window.showPage = showPage;
window.copyText = copyText;
window.saveAdminPaymentNumber = saveAdminPaymentNumber;
window.deleteAdminPaymentNumber = deleteAdminPaymentNumber;
window.reviewDepositRequest = reviewDepositRequest;
window.reviewAdminRequest = reviewAdminRequest;
window.replyAdminSupport = replyAdminSupport;

document.addEventListener("DOMContentLoaded", initializeApp);

