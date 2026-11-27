/* =========================================
   BIKASH12 BAJI
   Royal Neon Premium Edition
   Supabase Authentication
========================================= */

// SUPABASE CONNECTION
const SUPABASE_URL = "https://yfvntswzolcagfauxons.supabase.co";

// সর্বশেষ দেওয়া Publishable Key
const SUPABASE_KEY = "sb_publishable_TPjwrOvBZBPffBbfGg2g_A_Zws001wL";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// AUTHORIZED ADMIN
const ADMIN_UID = "1470dafc-ecc1-49b7-afc3-6b9662f00015";

// APP STATE
let currentUser = null;
let currentPlayer = null;
let isAdmin = false;
let isBlocked = false;


// =========================================
// ELEMENT HELPERS
// =========================================

const $ = (id) => document.getElementById(id);

function showMessage(message, type = "info") {
  const el = $("authMessage");

  if (el) {
    el.textContent = message;
    el.className = "auth-message " + type;
  }
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

function showAuthForm(formName) {
  ["loginForm", "registerForm", "resetForm"].forEach(id => {
    const form = $(id);
    if (form) form.hidden = id !== formName;
  });

  $("loginTab")?.classList.toggle(
    "active",
    formName === "loginForm"
  );

  $("registerTab")?.classList.toggle(
    "active",
    formName === "registerForm"
  );

  showMessage("");
}


// =========================================
// AUTH TABS
// =========================================

$("loginTab")?.addEventListener("click", () => {
  showAuthForm("loginForm");
});

$("registerTab")?.addEventListener("click", () => {
  showAuthForm("registerForm");
});

$("forgotPasswordBtn")?.addEventListener("click", () => {
  showAuthForm("resetForm");
});

$("backToLogin")?.addEventListener("click", () => {
  showAuthForm("loginForm");
});


// =========================================
// REGISTRATION
// =========================================

$("registerForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = $("registerName").value.trim();
  const mobile = $("registerMobile").value.trim();
  const email = $("registerEmail").value.trim();
  const password = $("registerPassword").value;
  const confirmPassword = $("confirmPassword").value;

  if (name.length < 2) {
    return showMessage("সঠিক Player Name লিখুন।", "error");
  }

  if (!/^01[3-9]\d{8}$/.test(mobile)) {
    return showMessage(
      "সঠিক ১১ সংখ্যার বাংলাদেশি Mobile Number দিন।",
      "error"
    );
  }

  if (password.length < 6) {
    return showMessage(
      "Password কমপক্ষে ৬ অক্ষরের হতে হবে।",
      "error"
    );
  }

  if (password !== confirmPassword) {
    return showMessage(
      "দুটি Password মিলছে না।",
      "error"
    );
  }

  const button = $("registerForm").querySelector(
    'button[type="submit"]'
  );

  button.disabled = true;
  button.textContent = "PLEASE WAIT...";

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

    if (data.session) {
      showMessage(
        "Account তৈরি হয়েছে। আপনার Account চালু হচ্ছে...",
        "success"
      );

      await loadApplication(data.user);

    } else {
      $("registerForm").reset();

      showAuthForm("loginForm");

      showMessage(
        "Registration সফল! Email-এ Verification Link পাঠানো হয়েছে। Email Verify করে Login করুন।",
        "success"
      );
    }

  } catch (error) {
    showMessage(
      error.message || "Registration করা যায়নি।",
      "error"
    );

  } finally {
    button.disabled = false;
    button.textContent = "CREATE ACCOUNT";
  }
});


// =========================================
// LOGIN
// =========================================

$("loginForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = $("loginEmail").value.trim();
  const password = $("loginPassword").value;

  const button = $("loginForm").querySelector(
    'button[type="submit"]'
  );

  button.disabled = true;
  button.textContent = "LOGGING IN...";

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

    if (error) throw error;

    await loadApplication(data.user);

  } catch (error) {
    showMessage(
      error.message || "Login করা যায়নি।",
      "error"
    );

  } finally {
    button.disabled = false;
    button.textContent = "LOGIN NOW";
  }
});


// =========================================
// FORGOT PASSWORD
// =========================================

$("resetForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = $("resetEmail").value.trim();

  const button = $("resetForm").querySelector(
    'button[type="submit"]'
  );

  button.disabled = true;
  button.textContent = "SENDING...";

  try {
    const { error } =
      await supabaseClient.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            window.location.origin +
            window.location.pathname
        }
      );

    if (error) throw error;

    showMessage(
      "Password Reset Link আপনার Email-এ পাঠানো হয়েছে।",
      "success"
    );

  } catch (error) {
    showMessage(
      error.message || "Reset Link পাঠানো যায়নি।",
      "error"
    );

  } finally {
    button.disabled = false;
    button.textContent = "SEND RESET LINK";
  }
});


// =========================================
// LOAD PLAYER / ADMIN
// =========================================

async function loadApplication(user) {
  if (!user) return;

  currentUser = user;
  isAdmin = user.id === ADMIN_UID;
  currentPlayer = null;
  isBlocked = false;

  if (!isAdmin) {

    const { data, error } = await supabaseClient
      .from("players")
      .select(
        "user_id,display_name,coins,mobile_number,is_active,created_at"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Player load error:", error);

      showMessage(
        "Player তথ্য লোড করা যায়নি: " + error.message,
        "error"
      );

      return;
    }

    if (!data) {
      showMessage(
        "Player Account পাওয়া যায়নি। Admin-এর সঙ্গে যোগাযোগ করুন।",
        "error"
      );

      return;
    }

    currentPlayer = data;
    isBlocked = data.is_active === false;

    // Registration-এর Mobile Number সেট করার চেষ্টা
    if (
      !data.mobile_number &&
      user.user_metadata?.mobile_number &&
      !isBlocked
    ) {
      const { error: mobileError } =
        await supabaseClient.rpc(
          "set_player_mobile_number",
          {
            p_mobile_number: user.user_metadata.mobile_number
          }
        );

      if (!mobileError) {
        currentPlayer.mobile_number =
          user.user_metadata.mobile_number;
      }
    }
  }

  $("authSection").hidden = true;
  $("appSection").hidden = false;

  $("adminMenuBtn").hidden = !isAdmin;

  renderPlayerInfo();

  if (isBlocked) {
    showPage("support");
  } else {
    showPage("home");
  }
}


// =========================================
// PLAYER INFORMATION
// =========================================

function renderPlayerInfo() {
  if (!currentUser) return;

  const name = isAdmin
    ? "Administrator"
    : currentPlayer?.display_name || "Player";

  const coins = isAdmin
    ? "Unlimited"
    : Number(
        currentPlayer?.coins || 0
      ).toLocaleString("en-US");

  const playerId = currentUser.id;

  if ($("homePlayerInfo")) {
    $("homePlayerInfo").innerHTML = `
      <div class="premium-panel">
        <h3>Welcome, ${escapeHTML(name)}</h3>
        <p>Player ID</p>
        <strong>${escapeHTML(playerId)}</strong>
        <p>Virtual Coins</p>
        <h2>${coins}</h2>
        ${
          isBlocked
            ? "<p>Account inactive. Support is available.</p>"
            : ""
        }
      </div>
    `;
  }

  if ($("profileContent")) {
    $("profileContent").innerHTML = `
      <div class="premium-panel">
        <h3>${escapeHTML(name)}</h3>
        <p>Player ID: ${escapeHTML(playerId)}</p>
        <p>Email: ${escapeHTML(currentUser.email)}</p>
        <p>Mobile: ${escapeHTML(
          currentPlayer?.mobile_number || "Not set"
        )}</p>
        <p>Virtual Coins: ${coins}</p>
        <p>Account Status: ${
          isAdmin
            ? "Admin"
            : isBlocked
              ? "Inactive"
              : "Active"
        }</p>
        <p>Joined: ${
          currentPlayer?.created_at
            ? new Date(
                currentPlayer.created_at
              ).toLocaleDateString("en-GB")
            : "-"
        }</p>
      </div>
    `;
  }

  if ($("walletContent")) {
    $("walletContent").innerHTML = `
      <div class="premium-panel">
        <h3>Virtual Wallet</h3>
        <h2>${coins} Coins</h2>
        <p>Wallet balance is managed by the secure system.</p>
        <p>Deposit and Withdrawal features will be connected in the next steps.</p>
      </div>
    `;
  }

  if ($("securityContent")) {
    $("securityContent").innerHTML = `
      <div class="premium-panel">
        <h3>Security Center</h3>
        <p>Transaction PIN settings will be connected in the next step.</p>
        <p>Password পরিবর্তন করতে Forgot Password ব্যবহার করুন।</p>
      </div>
    `;
  }

  if ($("bonusContent")) {
    $("bonusContent").innerHTML = `
      <div class="premium-panel">
        <h3>VIP & Bonus</h3>
        <p>Bonus information will appear here.</p>
      </div>
    `;
  }

  if ($("historyContent")) {
    $("historyContent").innerHTML = `
      <div class="premium-panel">
        <p>Transaction history will appear here.</p>
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


// =========================================
// PAGE NAVIGATION
// =========================================

function showPage(pageName) {
  if (!currentUser) return;

  // Blocked Player: শুধু Support ব্যবহার করতে পারবে
  if (
    !isAdmin &&
    isBlocked &&
    pageName !== "support"
  ) {
    pageName = "support";
  }

  document.querySelectorAll(".app-page").forEach(page => {
    page.hidden = true;
  });

  const target = $(pageName + "Page");

  if (target) {
    target.hidden = false;
  }

  if (pageName === "support") {
    renderSupport();
  }

  if (pageName === "admin" && isAdmin) {
    $("adminContent").innerHTML = `
      <div class="premium-panel">
        <h3>Admin Panel</h3>
        <p>Admin controls will be connected in the next step.</p>
      </div>
    `;
  }

  if ($("sideMenu")) {
    $("sideMenu").hidden = true;
  }
}


// PAGE BUTTONS

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(button.dataset.page);
  });
});

$("menuBtn")?.addEventListener("click", () => {
  $("sideMenu").hidden = !$("sideMenu").hidden;
});


// =========================================
// SUPPORT
// Blocked Player can still contact Admin
// =========================================

function renderSupport() {
  const content = $("supportContent");

  if (!content) return;

  content.innerHTML = `
    <div class="premium-panel">
      <h3>Contact Admin</h3>

      ${
        isBlocked
          ? "<p>Your account is inactive. You can still contact Support.</p>"
          : ""
      }

      <form id="supportForm">

        <label>Subject</label>

        <input
          id="supportSubject"
          type="text"
          minlength="2"
          maxlength="100"
          placeholder="সমস্যার বিষয় লিখুন"
          required
        >

        <label>Message</label>

        <textarea
          id="supportMessage"
          minlength="5"
          maxlength="3000"
          placeholder="আপনার সমস্যাটি লিখুন"
          required
        ></textarea>

        <button class="royal-button" type="submit">
          SEND MESSAGE
        </button>

      </form>

      <div id="supportResult" aria-live="polite"></div>
    </div>
  `;

  $("supportForm")?.addEventListener(
    "submit",
    async (event) => {
      event.preventDefault();

      const subject = $("supportSubject").value.trim();
      const message = $("supportMessage").value.trim();
      const result = $("supportResult");

      result.textContent = "Sending...";

      try {
        const { error } = await supabaseClient.rpc(
          "submit_support_message",
          {
            p_subject: subject,
            p_message: message
          }
        );

        if (error) throw error;

        result.textContent =
          "আপনার Message Admin-এর কাছে পাঠানো হয়েছে।";

        $("supportForm").reset();

      } catch (error) {
        result.textContent =
          "Message পাঠানো যায়নি: " + error.message;
      }
    }
  );
}


// =========================================
// LOGOUT
// =========================================

$("logoutBtn")?.addEventListener("click", async () => {

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    alert("Logout করা যায়নি: " + error.message);
    return;
  }

  currentUser = null;
  currentPlayer = null;
  isAdmin = false;
  isBlocked = false;

  $("appSection").hidden = true;
  $("authSection").hidden = false;

  showAuthForm("loginForm");
});


// =========================================
// AUTH SESSION RESTORE
// =========================================

async function initializeApp() {
  try {
    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error) throw error;

    if (data.session?.user) {
      await loadApplication(data.session.user);
    } else {
      $("authSection").hidden = false;
      $("appSection").hidden = true;

      showAuthForm("loginForm");
    }

  } catch (error) {
    console.error("Initialization error:", error);

    showMessage(
      "App চালু করা যায়নি: " + error.message,
      "error"
    );
  }
}


// AUTH STATE LISTENER

supabaseClient.auth.onAuthStateChange(
  (event, session) => {

    if (event === "SIGNED_OUT") {
      currentUser = null;
      currentPlayer = null;
      isAdmin = false;
      isBlocked = false;

      $("appSection").hidden = true;
      $("authSection").hidden = false;

      showAuthForm("loginForm");
    }

    if (event === "PASSWORD_RECOVERY") {
      alert(
        "Password recovery session চালু হয়েছে। নতুন Password সেট করার ব্যবস্থা পরের ধাপে যুক্ত করব।"
      );
    }
  }
);


// START APP
initializeApp();
