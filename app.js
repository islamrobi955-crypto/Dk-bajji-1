/* ==================================================
   BIKASH12 BAJI
   ROYAL NEON PREMIUM EDITION
   AUTH + PROFILE + WALLET + SECURITY + HISTORY
   ADMIN PAYMENT NUMBER MANAGEMENT
================================================== */

// ==================================================
// SUPABASE CONNECTION
// ==================================================

const SUPABASE_URL = "https://yfvntswzolcagfauxons.supabase.co";
const SUPABASE_KEY = "sb_publishable_TPjwrOvBZBPffBbfGg2g_A_Zws001wL";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// ONLY AUTHORIZED ADMIN
const ADMIN_UID = "1470dafc-ecc1-49b7-afc3-6b9662f00015";

// APP STATE
let currentUser = null;
let currentPlayer = null;
let isAdmin = false;
let isBlocked = false;
let isEditingProfile = false;


// ==================================================
// COMMON HELPERS
// ==================================================

const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[c]);
}

function money(value) {
  return "৳ " + Number(value || 0).toLocaleString("en-US");
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function showMessage(message, type = "info") {
  const el = $("authMessage");
  if (!el) return;

  el.textContent = message;
  el.className = "auth-message " + type;
}

function showResult(id, message, type = "info") {
  const el = $(id);
  if (!el) return;

  el.textContent = message;
  el.style.color =
    type === "error" ? "#ff7777" :
    type === "success" ? "#75e6a0" : "#ffe49a";
}

function setButtonLoading(button, loading, loadingText, normalText) {
  if (!button) return;

  button.disabled = loading;
  button.textContent = loading ? loadingText : normalText;
}

function panelHeading(title) {
  return `<h3 style="color:#ffe49a;margin-top:0;">${title}</h3>`;
}

function statusText(status) {
  const labels = {
    pending: "Pending",
    approved: "Approved",
    completed: "Completed",
    paid: "Paid",
    rejected: "Rejected",
    cancelled: "Cancelled"
  };

  const key = String(status || "").toLowerCase();
  return labels[key] || escapeHTML(status || "Unknown");
}

function showAuthForm(formName) {
  ["loginForm", "registerForm", "resetForm"].forEach(id => {
    if ($(id)) $(id).hidden = id !== formName;
  });

  $("loginTab")?.classList.toggle("active", formName === "loginForm");
  $("registerTab")?.classList.toggle("active", formName === "registerForm");

  showMessage("");
}


// ==================================================
// AUTH NAVIGATION
// ==================================================

$("loginTab")?.addEventListener("click", () => showAuthForm("loginForm"));
$("registerTab")?.addEventListener("click", () => showAuthForm("registerForm"));
$("forgotPasswordBtn")?.addEventListener("click", () => showAuthForm("resetForm"));
$("backToLogin")?.addEventListener("click", () => showAuthForm("loginForm"));


// ==================================================
// REGISTRATION
// ==================================================

$("registerForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const name = $("registerName").value.trim();
  const mobile = $("registerMobile").value.trim();
  const email = $("registerEmail").value.trim();
  const password = $("registerPassword").value;
  const confirmPassword = $("confirmPassword").value;

  if (name.length < 2 || name.length > 40) {
    return showMessage("Player Name ২ থেকে ৪০ অক্ষরের মধ্যে দিন।", "error");
  }

  if (!/^01[3-9]\d{8}$/.test(mobile)) {
    return showMessage("সঠিক ১১ সংখ্যার বাংলাদেশি Mobile Number দিন।", "error");
  }

  if (password.length < 6) {
    return showMessage("Password কমপক্ষে ৬ অক্ষরের হতে হবে।", "error");
  }

  if (password !== confirmPassword) {
    return showMessage("দুটি Password মিলছে না।", "error");
  }

  const button = $("registerForm").querySelector('[type="submit"]');

  setButtonLoading(button, true, "PLEASE WAIT...", "CREATE ACCOUNT");

  try {
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

    if (error) throw error;

    if (data.session && data.user) {
      showMessage("Account তৈরি হয়েছে।", "success");
      await loadApplication(data.user);
    } else {
      $("registerForm").reset();
      showAuthForm("loginForm");

      showMessage(
        "Registration সফল! Email Verification Link পাঠানো হয়েছে। Email Verify করে Login করুন।",
        "success"
      );
    }

  } catch (error) {
    showMessage(error.message || "Registration করা যায়নি।", "error");
  } finally {
    setButtonLoading(button, false, "PLEASE WAIT...", "CREATE ACCOUNT");
  }
});


// ==================================================
// LOGIN
// ==================================================

$("loginForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;
  const button = $("loginForm").querySelector('[type="submit"]');

  setButtonLoading(button, true, "LOGGING IN...", "LOGIN NOW");

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    await loadApplication(data.user);

  } catch (error) {
    showMessage(error.message || "Login করা যায়নি।", "error");
  } finally {
    setButtonLoading(button, false, "LOGGING IN...", "LOGIN NOW");
  }
});


// ==================================================
// FORGOT PASSWORD
// ==================================================

$("resetForm")?.addEventListener("submit", async event => {
  event.preventDefault();

  const email = $("resetEmail").value.trim();
  const button = $("resetForm").querySelector('[type="submit"]');

  setButtonLoading(button, true, "SENDING...", "SEND RESET LINK");

  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: window.location.origin + window.location.pathname
      }
    );

    if (error) throw error;

    showMessage("Password Reset Link আপনার Email-এ পাঠানো হয়েছে।", "success");

  } catch (error) {
    showMessage(error.message || "Reset Link পাঠানো যায়নি।", "error");
  } finally {
    setButtonLoading(button, false, "SENDING...", "SEND RESET LINK");
  }
});


// ==================================================
// LOAD APPLICATION
// ==================================================

async function loadApplication(user) {
  if (!user) return;

  currentUser = user;
  isAdmin = user.id === ADMIN_UID;
  currentPlayer = null;
  isBlocked = false;
  isEditingProfile = false;

  if (!isAdmin) {
    const { data, error } = await supabaseClient
      .from("players")
      .select("user_id,display_name,coins,mobile_number,is_active,created_at,pin_created_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error(error);
      showMessage("Player তথ্য লোড করা যায়নি: " + error.message, "error");
      return;
    }

    if (!data) {
      showMessage("Player Account পাওয়া যায়নি। Admin-এর সঙ্গে যোগাযোগ করুন।", "error");
      return;
    }

    currentPlayer = data;
    isBlocked = data.is_active === false;

    if (!data.mobile_number && user.user_metadata?.mobile_number && !isBlocked) {
      const { error: mobileError } = await supabaseClient.rpc(
        "set_player_mobile_number",
        { p_mobile_number: user.user_metadata.mobile_number }
      );

      if (!mobileError) {
        currentPlayer.mobile_number = user.user_metadata.mobile_number;
      }
    }
  }

  if ($("authSection")) $("authSection").hidden = true;
  if ($("appSection")) $("appSection").hidden = false;
  if ($("adminMenuBtn")) $("adminMenuBtn").hidden = !isAdmin;

  renderPlayerInfo();

  showPage(isBlocked ? "support" : "home");
}


// ==================================================
// PLAYER ID COPY
// ==================================================

async function copyPlayerId() {
  if (!currentUser) return;

  try {
    await navigator.clipboard.writeText(currentUser.id);
    alert("Player ID Copy হয়েছে!");
  } catch {
    const area = document.createElement("textarea");
    area.value = currentUser.id;
    document.body.appendChild(area);
    area.select();

    const copied = document.execCommand("copy");
    area.remove();

    alert(copied ? "Player ID Copy হয়েছে!" : "Copy করা যায়নি।");
  }
}


// ==================================================
// PROFILE EDIT
// ==================================================

function renderProfileEditForm() {
  if (!currentPlayer || isAdmin || isBlocked) return;

  const content = $("profileContent");
  if (!content) return;

  content.innerHTML = `
    <div class="premium-panel">
      <h3>♛ EDIT PLAYER PROFILE</h3>

      <form id="editProfileForm">
        <label>Player Name</label>
        <input id="editPlayerName" type="text"
          minlength="2" maxlength="40"
          value="${escapeHTML(currentPlayer.display_name || "")}" required>

        <label>Mobile Number</label>
        <input id="editPlayerMobile" type="tel"
          inputmode="numeric" maxlength="11"
          pattern="01[3-9][0-9]{8}"
          value="${escapeHTML(currentPlayer.mobile_number || "")}" required>

        <button class="royal-button" id="saveProfileBtn" type="submit">SAVE CHANGES</button>
        <button class="royal-button" id="cancelProfileBtn" type="button">CANCEL</button>

        <p id="profileEditResult" aria-live="polite"></p>
      </form>
    </div>
  `;

  $("cancelProfileBtn")?.addEventListener("click", () => {
    isEditingProfile = false;
    renderPlayerInfo();
  });

  $("editProfileForm")?.addEventListener("submit", savePlayerProfile);
}

async function savePlayerProfile(event) {
  event.preventDefault();

  if (!currentUser || !currentPlayer || isBlocked) return;

  const name = $("editPlayerName").value.trim();
  const mobile = $("editPlayerMobile").value.trim();
  const button = $("saveProfileBtn");

  if (name.length < 2 || name.length > 40) {
    return showResult("profileEditResult", "নাম ২ থেকে ৪০ অক্ষরের মধ্যে দিন।", "error");
  }

  if (!/^01[3-9]\d{8}$/.test(mobile)) {
    return showResult("profileEditResult", "সঠিক ১১ সংখ্যার Mobile Number দিন।", "error");
  }

  setButtonLoading(button, true, "SAVING...", "SAVE CHANGES");

  try {
    const { data, error } = await supabaseClient.rpc("update_player_profile", {
      p_display_name: name,
      p_mobile_number: mobile
    });

    if (error) throw error;
    if (data !== true) throw new Error("Profile update নিশ্চিত করা যায়নি।");

    currentPlayer.display_name = name;
    currentPlayer.mobile_number = mobile;
    isEditingProfile = false;

    renderPlayerInfo();
    alert("আপনার Profile Update হয়েছে!");

  } catch (error) {
    showResult("profileEditResult", "Update করা যায়নি: " + error.message, "error");
    setButtonLoading(button, false, "SAVING...", "SAVE CHANGES");
  }
}


// ==================================================
// PLAYER INFORMATION
// ==================================================

function renderPlayerInfo() {
  if (!currentUser) return;

  const name = isAdmin
    ? "Administrator"
    : currentPlayer?.display_name || "Player";

  const coins = isAdmin
    ? "Unlimited"
    : money(currentPlayer?.coins || 0);

  if ($("homePlayerInfo")) {
    $("homePlayerInfo").innerHTML = `
      <div class="premium-panel">
        <h3>Welcome, ${escapeHTML(name)}</h3>
        <p>Player ID</p>
        <strong style="word-break:break-all;">${escapeHTML(currentUser.id)}</strong>
        <p>Virtual Coins</p>
        <h2>${coins}</h2>
        ${isBlocked ? "<p>Account inactive. Support is available.</p>" : ""}
      </div>
    `;
  }

  if ($("profileContent")) {
    if (isEditingProfile && !isAdmin && !isBlocked) {
      renderProfileEditForm();
      return;
    }

    const avatar = escapeHTML((name || "P").trim().charAt(0).toUpperCase());

    $("profileContent").innerHTML = `
      <div class="premium-panel">
        <div style="text-align:center;padding:15px 5px;">
          <div style="width:82px;height:82px;margin:auto;border-radius:50%;
            display:flex;align-items:center;justify-content:center;
            font-size:34px;font-weight:bold;color:#080808;
            background:linear-gradient(135deg,#ffe49a,#d4af37,#9c7415);
            border:3px solid #ffe49a;box-shadow:0 0 18px rgba(212,175,55,.65);">
            ${avatar}
          </div>

          <h2 style="color:#ffe49a;">${escapeHTML(name)}</h2>

          <div style="display:inline-block;padding:6px 15px;border:1px solid #d4af37;
            border-radius:20px;color:#ffe49a;">♛ ROYAL PLAYER</div>
        </div>

        <hr style="border-color:rgba(212,175,55,.3)">

        <p><strong>Player ID:</strong></p>
        <p style="font-size:12px;word-break:break-all;">${escapeHTML(currentUser.id)}</p>

        <button class="royal-button" id="copyPlayerIdBtn" type="button">COPY ID</button>

        <p><strong>Email:</strong> ${escapeHTML(currentUser.email || "-")}</p>
        <p><strong>Mobile:</strong> ${escapeHTML(currentPlayer?.mobile_number || "Not set")}</p>
        <p><strong>Virtual Coins:</strong> ${coins}</p>
        <p><strong>Account Status:</strong> ${isAdmin ? "Admin" : isBlocked ? "Inactive" : "Active"}</p>
        <p><strong>Joined:</strong> ${currentPlayer?.created_at ? new Date(currentPlayer.created_at).toLocaleDateString("en-GB") : "-"}</p>

        ${!isAdmin && !isBlocked ? `
          <button class="royal-button" id="editProfileBtn"
            type="button" style="width:100%;margin-top:12px;">
            ✎ EDIT PROFILE
          </button>` : ""}
      </div>
    `;

    $("copyPlayerIdBtn")?.addEventListener("click", copyPlayerId);

    $("editProfileBtn")?.addEventListener("click", () => {
      isEditingProfile = true;
      renderPlayerInfo();
    });
  }

  if ($("walletContent")) {
    $("walletContent").innerHTML = `
      <div class="premium-panel">
        <h3>♛ VIRTUAL WALLET</h3>
        <p>Available Balance</p>
        <h2>${coins}</h2>
      </div>
    `;
  }

  if ($("securityContent")) {
    $("securityContent").innerHTML = `
      <div class="premium-panel">
        <h3>SECURITY CENTER</h3>
        <p>Transaction PIN পরিচালনা করতে Security Center খুলুন।</p>
      </div>
    `;
  }

  if ($("bonusContent")) {
    $("bonusContent").innerHTML = `
      <div class="premium-panel">
        <h3>VIP & BONUS</h3>
        <p>Bonus information will appear here.</p>
      </div>
    `;
  }

  if ($("historyContent")) {
    $("historyContent").innerHTML = `
      <div class="premium-panel">
        <p>Transaction History দেখতে History পেজ খুলুন।</p>
      </div>
    `;
  }

  if ($("aboutContent")) {
    $("aboutContent").innerHTML = `
      <div class="premium-panel">
        <h3>BIKASH12 BAJI</h3>
        <p>Royal Neon Premium Edition</p>
        <p>Welcome to BIKASH12 BAJI.</p>
      </div>
    `;
  }
}


// ==================================================
// ADMIN PAYMENT NUMBER MANAGEMENT
// ==================================================

async function renderAdminPanel() {
  if (!isAdmin || !currentUser || currentUser.id !== ADMIN_UID) return;

  const content = $("adminContent");
  if (!content) return;

  content.innerHTML = `
    <div class="premium-panel">
      <h3>♛ ADMIN PANEL</h3>

      <h3 style="color:#ffe49a;">PAYMENT NUMBER SETTINGS</h3>
      <p>Player Wallet-এর জন্য বিকাশ ও নগদ নম্বর আলাদাভাবে নিয়ন্ত্রণ করুন।</p>

      <div style="border:1px solid rgba(212,175,55,.4);border-radius:12px;padding:14px;margin:15px 0;">
        <h3 style="color:#ff8ab5;">বিকাশ (bKash)</h3>

        <label>বিকাশ নম্বর</label>
        <input id="adminBkashNumber" type="tel"
          inputmode="tel" maxlength="14"
          placeholder="01XXXXXXXXX">

        <button class="royal-button" id="saveBkashBtn" type="button">
          SAVE / CHANGE BKASH
        </button>

        <button class="royal-button" id="deleteBkashBtn" type="button"
          style="background:#6e2020;">
          DELETE BKASH NUMBER
        </button>

        <p id="bkashAdminResult" aria-live="polite"></p>
      </div>

      <div style="border:1px solid rgba(212,175,55,.4);border-radius:12px;padding:14px;margin:15px 0;">
        <h3 style="color:#ff9c55;">নগদ (Nagad)</h3>

        <label>নগদ নম্বর</label>
        <input id="adminNagadNumber" type="tel"
          inputmode="tel" maxlength="14"
          placeholder="01XXXXXXXXX">

        <button class="royal-button" id="saveNagadBtn" type="button">
          SAVE / CHANGE NAGAD
        </button>

        <button class="royal-button" id="deleteNagadBtn" type="button"
          style="background:#6e2020;">
          DELETE NAGAD NUMBER
        </button>

        <p id="nagadAdminResult" aria-live="polite"></p>
      </div>

      <p id="adminSettingsLoadResult" aria-live="polite"></p>
    </div>
  `;

  $("saveBkashBtn")?.addEventListener("click", () => saveAdminPaymentNumber("bkash"));
  $("saveNagadBtn")?.addEventListener("click", () => saveAdminPaymentNumber("nagad"));

  $("deleteBkashBtn")?.addEventListener("click", () => deleteAdminPaymentNumber("bkash"));
  $("deleteNagadBtn")?.addEventListener("click", () => deleteAdminPaymentNumber("nagad"));

  await loadAdminPaymentNumbers();
}


// ==================================================
// LOAD ADMIN PAYMENT NUMBERS
// ==================================================

async function loadAdminPaymentNumbers() {
  if (!isAdmin || !currentUser || currentUser.id !== ADMIN_UID) return;

  const { data, error } = await supabaseClient
    .from("virtual_credit_settings")
    .select("virtual_a_number,virtual_b_number")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    showResult(
      "adminSettingsLoadResult",
      "নম্বর লোড করা যায়নি: " + error.message,
      "error"
    );
    return;
  }

  if (!data) {
    showResult(
      "adminSettingsLoadResult",
      "Settings record পাওয়া যায়নি।",
      "error"
    );
    return;
  }

  $("adminBkashNumber").value = data.virtual_a_number || "";
  $("adminNagadNumber").value = data.virtual_b_number || "";

  showResult(
    "adminSettingsLoadResult",
    "বর্তমান Payment Number লোড হয়েছে।",
    "success"
  );
}


// ==================================================
// SAVE / CHANGE PAYMENT NUMBER
// ==================================================

function validBangladeshNumber(number) {
  return /^(01[3-9][0-9]{8}|\+8801[3-9][0-9]{8})$/.test(
    String(number || "").replace(/[ -]/g, "")
  );
}

async function saveAdminPaymentNumber(method) {
  if (!isAdmin || !currentUser || currentUser.id !== ADMIN_UID) return;

  const isBkash = method === "bkash";
  const inputId = isBkash ? "adminBkashNumber" : "adminNagadNumber";
  const resultId = isBkash ? "bkashAdminResult" : "nagadAdminResult";
  const buttonId = isBkash ? "saveBkashBtn" : "saveNagadBtn";

  const button = $(buttonId);
  const newNumber = $(inputId).value.trim();

  if (!validBangladeshNumber(newNumber)) {
    return showResult(resultId, "সঠিক বাংলাদেশি Mobile Number লিখুন।", "error");
  }

  setButtonLoading(button, true, "SAVING...", isBkash ? "SAVE / CHANGE BKASH" : "SAVE / CHANGE NAGAD");

  try {
    const { data: currentSettings, error: readError } = await supabaseClient
      .from("virtual_credit_settings")
      .select("virtual_a_number,virtual_b_number")
      .eq("id", 1)
      .maybeSingle();

    if (readError) throw readError;
    if (!currentSettings) throw new Error("Settings record পাওয়া যায়নি।");

    const bkash = isBkash
      ? newNumber
      : currentSettings.virtual_a_number || "";

    const nagad = isBkash
      ? currentSettings.virtual_b_number || ""
      : newNumber;

    const { data, error } = await supabaseClient.rpc(
      "admin_update_virtual_credit_numbers",
      {
        p_virtual_a_number: bkash,
        p_virtual_b_number: nagad
      }
    );

    if (error) throw error;

    showResult(
      resultId,
      data || "নম্বর সফলভাবে Save হয়েছে।",
      "success"
    );

  } catch (error) {
    showResult(resultId, "Save করা যায়নি: " + error.message, "error");
  } finally {
    setButtonLoading(
      button,
      false,
      "SAVING...",
      isBkash ? "SAVE / CHANGE BKASH" : "SAVE / CHANGE NAGAD"
    );
  }
}


// ==================================================
// DELETE PAYMENT NUMBER
// ==================================================

async function deleteAdminPaymentNumber(method) {
  if (!isAdmin || !currentUser || currentUser.id !== ADMIN_UID) return;

  const isBkash = method === "bkash";
  const inputId = isBkash ? "adminBkashNumber" : "adminNagadNumber";
  const resultId = isBkash ? "bkashAdminResult" : "nagadAdminResult";
  const buttonId = isBkash ? "deleteBkashBtn" : "deleteNagadBtn";

  const label = isBkash ? "বিকাশ" : "নগদ";

  if (!$(inputId).value.trim()) {
    return showResult(resultId, "এই নম্বরটি আগে থেকেই খালি আছে।", "info");
  }

  if (!confirm("আপনি কি " + label + " নম্বরটি মুছে ফেলতে চান?")) return;

  const button = $(buttonId);

  setButtonLoading(button, true, "DELETING...", isBkash ? "DELETE BKASH NUMBER" : "DELETE NAGAD NUMBER");

  try {
    const { data: currentSettings, error: readError } = await supabaseClient
      .from("virtual_credit_settings")
      .select("virtual_a_number,virtual_b_number")
      .eq("id", 1)
      .maybeSingle();

    if (readError) throw readError;
    if (!currentSettings) throw new Error("Settings record পাওয়া যায়নি।");

    const bkash = isBkash
      ? ""
      : currentSettings.virtual_a_number || "";

    const nagad = isBkash
      ? currentSettings.virtual_b_number || ""
      : "";

    const { data, error } = await supabaseClient.rpc(
      "admin_update_virtual_credit_numbers",
      {
        p_virtual_a_number: bkash,
        p_virtual_b_number: nagad
      }
    );

    if (error) throw error;

    $(inputId).value = "";

    showResult(
      resultId,
      data || label + " নম্বর মুছে ফেলা হয়েছে।",
      "success"
    );

  } catch (error) {
    showResult(resultId, "Delete করা যায়নি: " + error.message, "error");
  } finally {
    setButtonLoading(
      button,
      false,
      "DELETING...",
      isBkash ? "DELETE BKASH NUMBER" : "DELETE NAGAD NUMBER"
    );
  }
}


// ==================================================
// WALLET PAGE
// ==================================================

function paymentMethodLabel(method) {
  if (method === "virtual_a") return "বিকাশ";
  if (method === "virtual_b") return "নগদ";

  return escapeHTML(method || "Unknown");
}

async function renderWalletPage() {
  const content = $("walletContent");

  if (!content || !currentPlayer || isBlocked) return;

  content.innerHTML = `<div class="premium-panel">Wallet লোড হচ্ছে...</div>`;

  const results = await Promise.all([
    supabaseClient.from("virtual_credit_settings")
      .select("virtual_a_number,virtual_b_number")
      .eq("id", 1)
      .maybeSingle(),

    supabaseClient.from("deposit_requests")
      .select("id,amount,payment_method,reference_id,status,created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(10),

    supabaseClient.from("withdrawal_requests")
      .select("id,mobile_number,amount,status,created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  const settings = results[0].error ? null : results[0].data;
  const deposits = results[1].error ? [] : results[1].data || [];
  const withdrawals = results[2].error ? [] : results[2].data || [];

  if (results.some(r => r.error)) {
    console.error("Wallet load errors:", results.filter(r => r.error));
  }

  content.innerHTML = `
    <div class="wallet-hero">
      <div class="wallet-hero-top">
        <span>♛ BIKASH12 BAJI</span>
        <span>ROYAL WALLET</span>
      </div>

      <p>AVAILABLE BALANCE</p>
      <h1>${money(currentPlayer.coins)}</h1>

      <div class="wallet-hero-bottom">
        <span>✦ PLAYER WALLET</span>
        <span>SECURE ACCOUNT</span>
      </div>
    </div>

    <div class="wallet-section">
      <h3>＋ ADD COINS</h3>
      <p class="wallet-subtitle">আপনার Payment Method নির্বাচন করুন</p>

      <div class="wallet-methods">
        <button type="button" class="wallet-method selected"
          data-method="virtual_a">
          <span class="wallet-method-icon bkash-icon">b</span>
          <strong>বিকাশ</strong>
          <small>bKash</small>
        </button>

        <button type="button" class="wallet-method"
          data-method="virtual_b">
          <span class="wallet-method-icon nagad-icon">N</span>
          <strong>নগদ</strong>
          <small>Nagad</small>
        </button>
      </div>

      <div class="wallet-payment-number">
        <span id="depositNumberLabel">বিকাশ নম্বর</span>

        <strong id="depositNumberValue">
          ${escapeHTML(settings?.virtual_a_number || "Admin এখনো নম্বর সেট করেননি")}
        </strong>

        <button type="button" class="wallet-copy-btn"
          id="copyDepositNumberBtn">COPY NUMBER</button>
      </div>

      <form id="depositForm" class="wallet-form">
        <label>কত কয়েন নিতে চান?</label>

        <input id="depositAmount" type="number"
          min="1" step="1" inputmode="numeric"
          placeholder="Amount লিখুন" required>

        <label>Reference ID (Optional)</label>

        <input id="depositReference" type="text"
          maxlength="100" placeholder="Reference ID লিখুন">

        <button class="wallet-submit deposit-submit" type="submit">
          ＋ SUBMIT DEPOSIT REQUEST
        </button>

        <p id="depositResult" aria-live="polite"></p>
      </form>
    </div>

    <div class="wallet-section withdrawal-section">
      <h3>－ WITHDRAW COINS</h3>

      <p class="wallet-subtitle">
        Withdrawal Request-এর জন্য আপনার Transaction PIN প্রয়োজন।
      </p>

      <form id="withdrawalForm" class="wallet-form">
        <label>Your Mobile Number</label>

        <input id="withdrawalMobile" type="tel"
          inputmode="numeric" maxlength="11"
          pattern="01[3-9][0-9]{8}"
          value="${escapeHTML(currentPlayer.mobile_number || "")}"
          placeholder="01XXXXXXXXX" required>

        <label>Withdrawal Amount</label>

        <input id="withdrawalAmount" type="number"
          min="1" step="1" inputmode="numeric"
          placeholder="Amount লিখুন" required>

        <label>Transaction PIN</label>

        <input id="withdrawalPin" type="password"
          inputmode="numeric" maxlength="6"
          pattern="[0-9]{4}|[0-9]{6}"
          placeholder="৪ অথবা ৬ সংখ্যার PIN" required>

        <button class="wallet-submit withdrawal-submit" type="submit">
          － SUBMIT WITHDRAWAL REQUEST
        </button>

        <p id="withdrawalResult" aria-live="polite"></p>
      </form>
    </div>

    <div class="wallet-section">
      <h3>▤ DEPOSIT HISTORY</h3>

      ${deposits.length ? deposits.map(item => `
        <div class="wallet-history-item">
          <div>
            <strong>${money(item.amount)}</strong>
            <p>${paymentMethodLabel(item.payment_method)}</p>

            ${item.reference_id
              ? `<small>Ref: ${escapeHTML(item.reference_id)}</small>`
              : ""}
          </div>

          <div class="wallet-history-right">
            <span class="wallet-status">${statusText(item.status)}</span>
            <small>${formatDate(item.created_at)}</small>
          </div>
        </div>
      `).join("") : "<p>এখনো কোনো Deposit Request নেই।</p>"}
    </div>

    <div class="wallet-section">
      <h3>▤ WITHDRAWAL HISTORY</h3>

      ${withdrawals.length ? withdrawals.map(item => `
        <div class="wallet-history-item">
          <div>
            <strong>${money(item.amount)}</strong>
            <p>${escapeHTML(item.mobile_number)}</p>
          </div>

          <div class="wallet-history-right">
            <span class="wallet-status">${statusText(item.status)}</span>
            <small>${formatDate(item.created_at)}</small>
          </div>
        </div>
      `).join("") : "<p>এখনো কোনো Withdrawal Request নেই।</p>"}
    </div>
  `;

  let selectedMethod = "virtual_a";

  const methodField = document.createElement("input");
  methodField.type = "hidden";
  methodField.id = "depositMethod";
  methodField.value = selectedMethod;

  $("depositForm").appendChild(methodField);

  function updatePaymentMethod(method) {
    selectedMethod = method;
    methodField.value = method;

    document.querySelectorAll(".wallet-method").forEach(btn => {
      btn.classList.toggle("selected", btn.dataset.method === method);
    });

    const isNagad = method === "virtual_b";

    const number = isNagad
      ? settings?.virtual_b_number
      : settings?.virtual_a_number;

    $("depositNumberLabel").textContent =
      isNagad ? "নগদ নম্বর" : "বিকাশ নম্বর";

    $("depositNumberValue").textContent =
      number || "Admin এখনো নম্বর সেট করেননি";
  }

  document.querySelectorAll(".wallet-method").forEach(btn => {
    btn.addEventListener("click", () => {
      updatePaymentMethod(btn.dataset.method);
    });
  });

  $("copyDepositNumberBtn")?.addEventListener("click", async () => {
    const number = $("depositNumberValue").textContent.trim();

    if (!number || number.includes("সেট করেননি")) {
      return showResult(
        "depositResult",
        "Admin এখনো Payment Number সেট করেননি।",
        "error"
      );
    }

    try {
      await navigator.clipboard.writeText(number);

      showResult("depositResult", "Number Copy হয়েছে।", "success");

    } catch {
      showResult("depositResult", "Copy করা যায়নি।", "error");
    }
  });

  $("depositForm")?.addEventListener("submit", submitDepositRequest);
  $("withdrawalForm")?.addEventListener("submit", submitWithdrawalRequest);
}


// ==================================================
// DEPOSIT REQUEST
// ==================================================

async function submitDepositRequest(event) {
  event.preventDefault();

  if (!currentUser || isBlocked) return;

  const amount = Number($("depositAmount").value);
  const method = $("depositMethod").value;
  const reference = $("depositReference").value.trim();

  const button = $("depositForm").querySelector('[type="submit"]');

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return showResult("depositResult", "সঠিক Amount লিখুন।", "error");
  }

  setButtonLoading(button, true, "SUBMITTING...", "＋ SUBMIT DEPOSIT REQUEST");

  try {
    const { data, error } = await supabaseClient.rpc("submit_deposit_request", {
      p_amount: amount,
      p_payment_method: method,
      p_reference_id: reference || null
    });

    if (error) throw error;

    await renderWalletPage();

    alert(data || "Deposit Request সফলভাবে জমা হয়েছে।");

  } catch (error) {
    showResult("depositResult", "Request জমা হয়নি: " + error.message, "error");

    setButtonLoading(
      button,
      false,
      "SUBMITTING...",
      "＋ SUBMIT DEPOSIT REQUEST"
    );
  }
}


// ==================================================
// WITHDRAWAL REQUEST
// ==================================================

async function submitWithdrawalRequest(event) {
  event.preventDefault();

  if (!currentUser || isBlocked) return;

  const mobile = $("withdrawalMobile").value.trim();
  const amount = Number($("withdrawalAmount").value);
  const pin = $("withdrawalPin").value.trim();

  const button = $("withdrawalForm").querySelector('[type="submit"]');

  if (!/^01[3-9]\d{8}$/.test(mobile)) {
    return showResult("withdrawalResult", "সঠিক ১১ সংখ্যার Mobile Number দিন।", "error");
  }

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return showResult("withdrawalResult", "সঠিক Amount লিখুন।", "error");
  }

  if (!/^(?:\d{4}|\d{6})$/.test(pin)) {
    return showResult("withdrawalResult", "PIN অবশ্যই ৪ অথবা ৬ সংখ্যার হতে হবে।", "error");
  }

  setButtonLoading(button, true, "SUBMITTING...", "－ SUBMIT WITHDRAWAL REQUEST");

  try {
    const { data, error } = await supabaseClient.rpc("submit_withdrawal_request", {
      p_mobile_number: mobile,
      p_amount: amount,
      p_pin: pin
    });

    if (error) throw error;

    await renderWalletPage();

    alert(data || "Withdrawal Request জমা হয়েছে।");

  } catch (error) {
    showResult("withdrawalResult", "Request জমা হয়নি: " + error.message, "error");

    setButtonLoading(
      button,
      false,
      "SUBMITTING...",
      "－ SUBMIT WITHDRAWAL REQUEST"
    );
  }
}


// ==================================================
// SECURITY CENTER
// ==================================================

async function renderSecurityPage() {
  const content = $("securityContent");

  if (!content || !currentPlayer || isBlocked) return;

  const hasPin = Boolean(currentPlayer.pin_created_at);

  content.innerHTML = `
    <div class="premium-panel">
      ${panelHeading("♛ SECURITY CENTER")}

      <p>Transaction PIN আপনার Withdrawal Request নিরাপদ রাখে।</p>

      <p>PIN Status:
        <strong style="color:#ffe49a;">
          ${hasPin ? "PIN CREATED" : "PIN NOT SET"}
        </strong>
      </p>

      ${!hasPin ? `
        <h3>CREATE TRANSACTION PIN</h3>

        <form id="createPinForm">
          <label>New PIN</label>

          <input id="newPin" type="password"
            inputmode="numeric" maxlength="6"
            pattern="[0-9]{4}|[0-9]{6}" required>

          <label>Confirm PIN</label>

          <input id="confirmPin" type="password"
            inputmode="numeric" maxlength="6"
            pattern="[0-9]{4}|[0-9]{6}" required>

          <button class="royal-button" type="submit">CREATE PIN</button>

          <p id="createPinResult" aria-live="polite"></p>
        </form>
      ` : `
        <p style="color:#75e6a0;">আপনার Transaction PIN তৈরি করা আছে।</p>

        <h3>FORGOT TRANSACTION PIN?</h3>

        <p>Profile-এ থাকা Mobile Number দিয়ে Admin-এর কাছে PIN Reset Request পাঠান।</p>

        <form id="pinResetForm">
          <label>Profile Mobile Number</label>

          <input id="pinResetMobile" type="tel"
            inputmode="numeric" maxlength="11"
            value="${escapeHTML(currentPlayer.mobile_number || "")}" required>

          <button class="royal-button" type="submit">
            SEND PIN RESET REQUEST
          </button>

          <p id="pinResetResult" aria-live="polite"></p>
        </form>
      `}

      <hr style="border-color:rgba(212,175,55,.3);margin:20px 0;">

      <p>Password পরিবর্তন করতে Login পেজের Forgot Password ব্যবহার করুন।</p>
    </div>
  `;

  $("createPinForm")?.addEventListener("submit", createTransactionPin);
  $("pinResetForm")?.addEventListener("submit", submitPinResetRequest);
}


// ==================================================
// CREATE TRANSACTION PIN
// ==================================================

async function createTransactionPin(event) {
  event.preventDefault();

  if (!currentUser || isBlocked || !currentPlayer) return;

  const pin = $("newPin").value.trim();
  const confirmPin = $("confirmPin").value.trim();

  const button = $("createPinForm").querySelector('[type="submit"]');

  if (!/^(?:\d{4}|\d{6})$/.test(pin)) {
    return showResult("createPinResult", "PIN অবশ্যই ৪ অথবা ৬ সংখ্যার হতে হবে।", "error");
  }

  if (pin !== confirmPin) {
    return showResult("createPinResult", "দুটি PIN মিলছে না।", "error");
  }

  setButtonLoading(button, true, "CREATING...", "CREATE PIN");

  try {
    const { data, error } = await supabaseClient.rpc("set_transaction_pin", {
      p_new_pin: pin
    });

    if (error) throw error;

    currentPlayer.pin_created_at = new Date().toISOString();

    await renderSecurityPage();

    alert(data || "Transaction PIN তৈরি হয়েছে।");

  } catch (error) {
    showResult("createPinResult", "PIN তৈরি হয়নি: " + error.message, "error");

    setButtonLoading(button, false, "CREATING...", "CREATE PIN");
  }
}


// ==================================================
// PIN RESET REQUEST
// ==================================================

async function submitPinResetRequest(event) {
  event.preventDefault();

  if (!currentUser || isBlocked) return;

  const mobile = $("pinResetMobile").value.trim();
  const button = $("pinResetForm").querySelector('[type="submit"]');

  if (!/^01[3-9]\d{8}$/.test(mobile)) {
    return showResult("pinResetResult", "সঠিক ১১ সংখ্যার Mobile Number দিন।", "error");
  }

  setButtonLoading(button, true, "SENDING...", "SEND PIN RESET REQUEST");

  try {
    const { data, error } = await supabaseClient.rpc("submit_pin_reset_request", {
      p_mobile_number: mobile
    });

    if (error) throw error;

    showResult(
      "pinResetResult",
      data || "PIN Reset Request Admin-এর কাছে পাঠানো হয়েছে।",
      "success"
    );

    $("pinResetForm").reset();

  } catch (error) {
    showResult("pinResetResult", "Request পাঠানো যায়নি: " + error.message, "error");
  } finally {
    setButtonLoading(button, false, "SENDING...", "SEND PIN RESET REQUEST");
  }
}


// ==================================================
// TRANSACTION HISTORY
// ==================================================

async function renderHistoryPage() {
  const content = $("historyContent");

  if (!content || !currentUser || !currentPlayer || isBlocked) return;

  content.innerHTML = `<div class="premium-panel">Transaction History লোড হচ্ছে...</div>`;

  try {
    const { data, error } = await supabaseClient
      .from("coin_transactions")
      .select("id,transaction_type,amount,balance_before,balance_after,note,created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const transactions = data || [];

    content.innerHTML = `
      <div class="premium-panel">
        ${panelHeading("♛ TRANSACTION HISTORY")}

        <h2 style="color:#ffe49a;">${money(currentPlayer.coins)}</h2>
        <p>Current Wallet Balance</p>

        <hr style="border-color:rgba(212,175,55,.3);">

        ${transactions.length ? transactions.map(item => `
          <div style="padding:12px 0;border-bottom:1px solid rgba(212,175,55,.25);">
            <strong>${escapeHTML(item.transaction_type)}</strong>
            <p>Amount: ${money(item.amount)}</p>
            <p>Previous Balance: ${money(item.balance_before)}</p>
            <p>New Balance: ${money(item.balance_after)}</p>

            ${item.note ? `<p>Note: ${escapeHTML(item.note)}</p>` : ""}

            <small>${formatDate(item.created_at)}</small>
          </div>
        `).join("") : "<p>এখনো কোনো Transaction History নেই।</p>"}
      </div>
    `;

  } catch (error) {
    console.error(error);

    content.innerHTML = `
      <div class="premium-panel">
        <p style="color:#ff7777;">
          History লোড করা যায়নি: ${escapeHTML(error.message)}
        </p>
      </div>
    `;
  }
}


// ==================================================
// SUPPORT
// BLOCKED PLAYER CAN STILL CONTACT ADMIN
// ==================================================

function renderSupport() {
  const content = $("supportContent");
  if (!content) return;

  content.innerHTML = `
    <div class="premium-panel">
      <h3>Contact Admin</h3>

      ${isBlocked
        ? "<p>Your account is inactive. You can still contact Support.</p>"
        : ""}

      <form id="supportForm">
        <label>Subject</label>

        <input id="supportSubject" type="text"
          minlength="2" maxlength="100"
          placeholder="সমস্যার বিষয় লিখুন" required>

        <label>Message</label>

        <textarea id="supportMessage"
          minlength="5" maxlength="3000"
          placeholder="আপনার সমস্যাটি লিখুন" required></textarea>

        <button class="royal-button" type="submit">SEND MESSAGE</button>
      </form>

      <div id="supportResult" aria-live="polite"></div>
    </div>
  `;

  $("supportForm")?.addEventListener("submit", async event => {
    event.preventDefault();

    const subject = $("supportSubject").value.trim();
    const message = $("supportMessage").value.trim();

    const result = $("supportResult");
    const button = $("supportForm").querySelector('[type="submit"]');

    setButtonLoading(button, true, "SENDING...", "SEND MESSAGE");

    result.textContent = "Sending...";

    try {
      const { error } = await supabaseClient.rpc("submit_support_message", {
        p_subject: subject,
        p_message: message
      });

      if (error) throw error;

      result.textContent = "আপনার Message Admin-এর কাছে পাঠানো হয়েছে।";
      $("supportForm").reset();

    } catch (error) {
      result.textContent = "Message পাঠানো যায়নি: " + error.message;
    } finally {
      setButtonLoading(button, false, "SENDING...", "SEND MESSAGE");
    }
  });
}


// ==================================================
// PAGE NAVIGATION
// ==================================================

function showPage(pageName) {
  if (!currentUser) return;

  // BLOCKED PLAYER: SUPPORT ONLY
  if (!isAdmin && isBlocked && pageName !== "support") {
    pageName = "support";
  }

  // Admin page is available only to authorized Admin
  if (pageName === "admin" && !isAdmin) {
    pageName = "home";
  }

  document.querySelectorAll(".app-page").forEach(page => {
    page.hidden = true;
  });

  const target = $(pageName + "Page");
  if (target) target.hidden = false;

  if (pageName === "profile") {
    isEditingProfile = false;
    renderPlayerInfo();
  }

  if (pageName === "wallet" && !isAdmin) {
    renderWalletPage();
  }

  if (pageName === "security" && !isAdmin) {
    renderSecurityPage();
  }

  if (pageName === "history" && !isAdmin) {
    renderHistoryPage();
  }

  if (pageName === "support") {
    renderSupport();
  }

  if (pageName === "admin" && isAdmin) {
    renderAdminPanel();
  }

  if ($("sideMenu")) $("sideMenu").hidden = true;
}


// ==================================================
// PAGE BUTTONS
// ==================================================

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

$("menuBtn")?.addEventListener("click", () => {
  if ($("sideMenu")) {
    $("sideMenu").hidden = !$("sideMenu").hidden;
  }
});


// ==================================================
// LOGOUT
// ==================================================

async function logoutUser() {
  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Logout করা যায়নি: " + error.message);
    return;
  }

  currentUser = null;
  currentPlayer = null;
  isAdmin = false;
  isBlocked = false;
  isEditingProfile = false;

  if ($("appSection")) $("appSection").hidden = true;
  if ($("authSection")) $("authSection").hidden = false;

  showAuthForm("loginForm");
}

$("logoutBtn")?.addEventListener("click", logoutUser);


// ==================================================
// AUTH SESSION RESTORE
// ==================================================

async function initializeApp() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) throw error;

    if (data.session?.user) {
      await loadApplication(data.session.user);
    } else {
      if ($("authSection")) $("authSection").hidden = false;
      if ($("appSection")) $("appSection").hidden = true;

      showAuthForm("loginForm");
    }

  } catch (error) {
    console.error("Initialization error:", error);

    showMessage("App চালু করা যায়নি: " + error.message, "error");
  }
}


// ==================================================
// AUTH STATE LISTENER
// ==================================================

supabaseClient.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_OUT") {
    currentUser = null;
    currentPlayer = null;
    isAdmin = false;
    isBlocked = false;
    isEditingProfile = false;

    if ($("appSection")) $("appSection").hidden = true;
    if ($("authSection")) $("authSection").hidden = false;

    showAuthForm("loginForm");
  }

  if (event === "PASSWORD_RECOVERY") {
    alert("Password Recovery চালু হয়েছে। নতুন Password সেট করার ব্যবস্থা পরবর্তী ধাপে যুক্ত করতে হবে।");
  }
});


// ==================================================
// START APPLICATION
// ==================================================

initializeApp();
