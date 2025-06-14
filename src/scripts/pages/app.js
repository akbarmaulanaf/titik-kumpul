import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import ViewTransition from "../utils/view-transition";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupAccessibility();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      const isOpen = this.#navigationDrawer.classList.toggle("open");

      // ARIA attributes for accessibility
      this.#drawerButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.body.addEventListener("click", (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove("open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
          this.#drawerButton.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  _setupAccessibility() {
    this.#drawerButton.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.#drawerButton.click();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.#navigationDrawer.classList.contains("open")) {
        this.#navigationDrawer.classList.remove("open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
        this.#drawerButton.focus();
      }
    });

    this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
      link.setAttribute("tabindex", "0");
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url];
    if (!page) {
      page = routes["*"];
    }

    await ViewTransition.transition(async () => {
      this.#content.style.viewTransitionName = "page";

      this.#content.innerHTML = await page.render();

      if (location.hash.includes("#main-content")) {
        this.#content.focus();
      }
    });

    await page.afterRender();
  }
}

export default App;
