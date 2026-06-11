import "./style.css";

//#region ROUTER
interface Route {
  path: string;
  title: string;
  render: () => string;
}

const routes: Route[] = [
  { path: "/", title: "Trang chủ", render: () => "" },
  { path: "/thong-bao", title: "Thông báo", render: renderThongBao },
  { path: "/dien-dan", title: "Diễn đàn", render: renderDienDan },
  { path: "/kien-thuc", title: "Kiến thức", render: renderKienThuc },
];

function navigate(path: string) {
  const route = routes.find((r) => r.path === path);
  if (!route) return;

  const main = document.querySelector("main");
  if (main) main.innerHTML = route.render();

  document.title = `${route.title} - A2 Forum`;
  history.pushState({ path }, "", path);
  closeAll();
}

document.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest("[data-nav]");
  if (target) {
    e.preventDefault();
    const path = target.getAttribute("data-nav");
    if (path) navigate(path);
  }
});

window.addEventListener("popstate", () => {
  const route = routes.find((r) => r.path === location.pathname);
  if (!route) return;
  const main = document.querySelector("main");
  if (main) main.innerHTML = route.render();
  document.title = `${route.title} - A2 Forum`;
});

const initialRoute = routes.find((r) => r.path === location.pathname);
if (initialRoute) {
  const main = document.querySelector("main");
  if (main) main.innerHTML = initialRoute.render();
  document.title = `${initialRoute.title} - A2 Forum`;
}
//#endregion

//#region PAGE RENDERERS
function renderThongBao(): string {
  return `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Thông báo</h1>
      <button onclick="handleButtonClick()" class="bg-accent text-white px-4 py-2 rounded cursor-pointer">OK</button>
    </div>
  `;
}
function renderDienDan(): string {
  return ` <div class="p-4"><h1 class="text-2xl font-bold mb-4">Diễn đàn</h1><p>Xin chào đã đến với diễn đàn</p></div>`;
}
function renderKienThuc(): string {
  return ` <div class="p-4"><h1 class="text-2xl font-bold mb-4">Kiến thức</h1><p>Nội dung kiến thức sẽ được cập nhật sau.</p></div>`;
}
//#endregion

function handleButtonClick() {
  alert("Button clicked!");
}
(window as any).handleButtonClick = handleButtonClick;

//#region OVERLAY
const menuOverlay = document.getElementById("menuOverlay") as HTMLElement;
menuOverlay.addEventListener("click", (e) => {
  if (e.target === menuOverlay) closeAll();
});
//#endregion

//#region MOBILE MENU
const openBtn = document.getElementById("openMenu");
const closeBtn = document.getElementById("closeMenu");
const menuContent = document.getElementById("menuContent");
openBtn?.addEventListener("click", () => {
  menuContent?.classList.remove("hidden");
  showOverlay();
});
closeBtn?.addEventListener("click", () => closeAll());
//#endregion

//#region ACCOUNT POPUP
const accBtn = document.getElementById("accountBtn");
const accountContent = document.getElementById("accountContent");
const closeAccount = document.getElementById("closeAccount");
const tabSignUp = document.getElementById("tabSignUp");
const tabLogIn = document.getElementById("tabLogIn");
const signUpForm = document.getElementById("signUpForm");
const logInForm = document.getElementById("logInForm");
const accountTitle = document.getElementById("accountTitle");

accBtn?.addEventListener("click", () => {
  accountContent?.classList.remove("hidden");
  showOverlay();

  // Nếu đã đăng nhập thì show panel, không thì show form đăng ký
  const user = getLoggedInUser();
  if (user) {
    showAccountPanel(user);
  } else {
    // Reset về tab đăng ký
    switchTab("signup");
  }
});
closeAccount?.addEventListener("click", () => closeAll());

tabSignUp?.addEventListener("click", () => switchTab("signup"));
tabLogIn?.addEventListener("click", () => switchTab("login"));

function switchTab(tab: "signup" | "login") {
  tabSignUp?.classList.remove("border-accent", "font-semibold");
  tabLogIn?.classList.remove("border-accent", "font-semibold");
  tabSignUp?.classList.add(
    "border-transparent",
    "text-dark/50",
    "dark:text-light/50",
  );
  tabLogIn?.classList.add(
    "border-transparent",
    "text-dark/50",
    "dark:text-light/50",
  );

  signUpForm?.classList.add("hidden");
  logInForm?.classList.add("hidden");

  if (tab === "signup") {
    tabSignUp?.classList.remove(
      "border-transparent",
      "text-dark/50",
      "dark:text-light/50",
    );
    tabSignUp?.classList.add("border-accent", "font-semibold");
    signUpForm?.classList.remove("hidden");
    if (accountTitle) accountTitle.textContent = "Đăng ký";
  } else {
    tabLogIn?.classList.remove(
      "border-transparent",
      "text-dark/50",
      "dark:text-light/50",
    );
    tabLogIn?.classList.add("border-accent", "font-semibold");
    logInForm?.classList.remove("hidden");
    if (accountTitle) accountTitle.textContent = "Đăng nhập";
  }
}
//#endregion

//#region API CALLS
async function apiPost(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function showStatus(el: HTMLElement | null, msg: string, ok: boolean) {
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden", "text-green-600", "text-red-600");
  el.classList.add(ok ? "text-green-600" : "text-red-600");
}

// Send verification code
document.getElementById("sendCodeBtn")?.addEventListener("click", async () => {
  const email = (
    document.getElementById("signupEmail") as HTMLInputElement
  )?.value.trim();
  const status = document.getElementById("signupStatus");
  const btn = document.getElementById("sendCodeBtn") as HTMLButtonElement;

  if (!email) {
    showStatus(status, "Vui lòng nhập email", false);
    return;
  }

  btn.disabled = true;
  btn.textContent = "Đang gửi...";
  showStatus(status, "", true);

  const data = await apiPost("/api/send-code", { email });

  if (data.success) {
    showStatus(status, "✅ Mã xác nhận đã được gửi đến email!", true);
    document.getElementById("codeSection")?.classList.remove("hidden");
  } else {
    showStatus(status, "❌ " + (data.error || "Gửi mã thất bại"), false);
  }

  btn.disabled = false;
  btn.textContent = "Gửi mã";
});

// Sign up
document.getElementById("signupSubmit")?.addEventListener("click", async () => {
  const name = (
    document.getElementById("signupName") as HTMLInputElement
  )?.value.trim();
  const email = (
    document.getElementById("signupEmail") as HTMLInputElement
  )?.value.trim();
  const code = (
    document.getElementById("signupCode") as HTMLInputElement
  )?.value.trim();
  const password = (
    document.getElementById("signupPassword") as HTMLInputElement
  )?.value;
  const rePassword = (
    document.getElementById("signupRePassword") as HTMLInputElement
  )?.value;
  const dob = (document.getElementById("signupDob") as HTMLInputElement)?.value;
  const status = document.getElementById("signupStatus");
  const btn = document.getElementById("signupSubmit") as HTMLButtonElement;

  if (!name || !email || !password || !code) {
    showStatus(status, "Vui lòng điền đầy đủ thông tin", false);
    return;
  }
  if (password !== rePassword) {
    showStatus(status, "Mật khẩu nhập lại không khớp", false);
    return;
  }
  if (password.length < 6) {
    showStatus(status, "Mật khẩu phải có ít nhất 6 ký tự", false);
    return;
  }

  btn.disabled = true;
  btn.textContent = "Đang xử lý...";
  showStatus(status, "", true);

  const data = await apiPost("/api/signup", {
    name,
    email,
    password,
    code,
    dateOfBirth: dob || null,
  });

  if (data.success) {
    showStatus(status, "✅ " + data.message, true);
    setLoggedInUser(data.user);
    showAccountPanel(data.user);
  } else {
    showStatus(status, "❌ " + (data.error || "Đăng ký thất bại"), false);
  }

  btn.disabled = false;
  btn.textContent = "Đăng ký";
});

// Login
document.getElementById("loginSubmit")?.addEventListener("click", async () => {
  const email = (
    document.getElementById("loginEmail") as HTMLInputElement
  )?.value.trim();
  const password = (
    document.getElementById("loginPassword") as HTMLInputElement
  )?.value;
  const status = document.getElementById("loginStatus");
  const btn = document.getElementById("loginSubmit") as HTMLButtonElement;

  if (!email || !password) {
    showStatus(status, "Vui lòng nhập email và mật khẩu", false);
    return;
  }

  btn.disabled = true;
  btn.textContent = "Đang xử lý...";
  showStatus(status, "", true);

  const data = await apiPost("/api/login", { email, password });

  if (data.success) {
    showStatus(status, "✅ Đăng nhập thành công!", true);
    setLoggedInUser(data.user);
    showAccountPanel(data.user);
  } else {
    showStatus(status, "❌ " + (data.error || "Đăng nhập thất bại"), false);
  }

  btn.disabled = false;
  btn.textContent = "Đăng nhập";
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("a2forum_user");
  switchTab("signup");
  closeAll();
});
//#endregion

//#region USER STATE
interface UserInfo {
  id: number;
  name: string;
  email: string;
}

function setLoggedInUser(user: UserInfo) {
  localStorage.setItem("a2forum_user", JSON.stringify(user));
}

function getLoggedInUser(): UserInfo | null {
  const raw = localStorage.getItem("a2forum_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function showAccountPanel(user: UserInfo) {
  const nameEl = document.getElementById("accountName");
  const emailEl = document.getElementById("accountEmail");
  const panel = document.getElementById("accountPanel");
  const tabs = document.querySelector(".flex.border-b");
  if (nameEl) nameEl.textContent = user.name;
  if (emailEl) emailEl.textContent = user.email;
  signUpForm?.classList.add("hidden");
  logInForm?.classList.add("hidden");
  tabs?.classList.add("hidden");
  panel?.classList.remove("hidden");
  if (accountTitle) accountTitle.textContent = "Tài khoản";
}

// Restore session on page load
const savedUser = getLoggedInUser();
if (savedUser && accountContent) {
  // Only show panel if account popup is opened later, don't auto-open
  // Just save that user is logged in
}
//#endregion

//#region OVERLAY HELPERS
function showOverlay() {
  menuOverlay?.classList.remove("opacity-0", "pointer-events-none");
  menuOverlay?.classList.add("opacity-100", "pointer-events-auto");
}
function closeAll() {
  menuContent?.classList.add("hidden");
  accountContent?.classList.add("hidden");
  menuOverlay?.classList.add("opacity-0", "pointer-events-none");
  menuOverlay?.classList.remove("opacity-100", "pointer-events-auto");
}
//#endregion
