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
  closeMenu();
}

// Listen for clicks on [data-nav] elements
document.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest("[data-nav]");
  if (target) {
    e.preventDefault();
    const path = target.getAttribute("data-nav");
    if (path) navigate(path);
  }
});

// Handle browser back/forward
window.addEventListener("popstate", () => {
  const route = routes.find((r) => r.path === location.pathname);
  if (!route) return;

  const main = document.querySelector("main");
  if (main) main.innerHTML = route.render();
  document.title = `${route.title} - A2 Forum`;
});

// Load initial route on page load
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
  return `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Diễn đàn</h1>
      <p>Xin chào đã đến với diễn đàn</p>
    </div>
  `;
}

function renderKienThuc(): string {
  return `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Kiến thức</h1>
      <p>Nội dung kiến thức sẽ được cập nhật sau.</p>
    </div>
  `;
}
//#endregion

function handleButtonClick() {
  alert("Button clicked!");
}
(window as any).handleButtonClick = handleButtonClick;

//#region MOBILE
const openBtn = document.getElementById("openMenu");
const closeBtn = document.getElementById("closeMenu");
const menuOverlay = document.getElementById("menuOverlay");
const menuContent = document.getElementById("menuContent");

openBtn?.addEventListener("click", () => {
  menuOverlay?.classList.remove("opacity-0", "pointer-events-none");
  menuOverlay?.classList.add("opacity-100", "pointer-events-auto");

  menuContent?.classList.remove("translate-y-full", "opacity-0");
  menuContent?.classList.add("translate-y-0", "opacity-100");
});

closeBtn?.addEventListener("click", () => closeMenu());
menuOverlay?.addEventListener("click", () => closeMenu());

function closeMenu() {
  menuOverlay?.classList.add("opacity-0", "pointer-events-none");
  menuOverlay?.classList.remove("opacity-100", "pointer-events-auto");

  menuContent?.classList.add("translate-y-full", "opacity-0");
  menuContent?.classList.remove("translate-y-0", "opacity-100");
}
//#endregion
