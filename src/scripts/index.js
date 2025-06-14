// CSS imports
import "../styles/styles.css";

import App from "./pages/app";
import NavbarPage from "./utils/navbar-page";
import ViewTransition from "./utils/view-transition";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize navbar with authentication controls
  NavbarPage.init();

  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });
  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
    NavbarPage.init();
  });

  console.log("View Transitions API support:", ViewTransition.isSupported() ? "Yes" : "No");
});
