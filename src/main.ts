import "./style.css";

//#region LINKER

document.querySelectorAll('a[href^="/"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const url = link.getAttribute("href");
    if (url) {
      loadContent(url);
    }
  });
});

function loadContent(url: string) {
  fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.text();
    })
    .then((html) => {
      const mainElement = document.querySelector("main") as HTMLElement | null;
      if (mainElement) {
        mainElement.innerHTML = html;
      }
      history.pushState(null, "", url);
    })
    .catch((error) => {
      console.error("Error loading content:", error);
    });
}

//#endregion

//#region MENU (MOBILE)
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

function handleButtonClick() {
  alert("Button clicked!");
}
(window as any).handleButtonClick = handleButtonClick;

window.addEventListener("popstate", () => {
  const url = location.pathname;
  loadContent(url);
});
