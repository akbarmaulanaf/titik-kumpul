import SavedStoriesPresenter from "./saved-stories-presenter.js";

export default class SavedStoriesPage {
  constructor() {
    this.presenter = new SavedStoriesPresenter(this);
  }

  async render() {
    return `
      <section class="container">
        <h1 class="page-title"><i class="fas fa-bookmark"></i> Saved Stories</h1>
        <div id="saved-stories-list"></div>
        <div id="saved-stories-error" class="error-container"></div>
      </section>
    `;
  }

  async afterRender() {
    this.presenter.getAllSavedStories();
  }

  displaySavedStories(stories) {
    const listContainer = document.getElementById("saved-stories-list");
    if (!stories.length) {
      listContainer.innerHTML = "<p>No saved stories found.</p>";
      return;
    }
    listContainer.innerHTML = `
      <div class="stories-list">
        ${stories
          .map(
            (story) => `
          <article class="story-card" data-id="${story.id}" style="view-transition-name: story-card-${story.id}">
            <div class="story-content" style="view-transition-name: story-content-${story.id}">
              <h2>From: ${story.name}</h2>
              ${story.lat && story.lon ? `<p class="story-location"><i class="fas fa-map-marker-alt"></i> Location: ${story.lat}, ${story.lon}</p>` : ""}
            </div>
            <div class="story-image" style="view-transition-name: story-image-${story.id}">
              <img src="${story.offlineImage || story.photoUrl || ""}" alt="Story from ${story.name}: ${story.description ? story.description.substring(0, 50) : ""}${
              story.description && story.description.length > 50 ? "..." : ""
            }" loading="lazy">
            </div>
            <div class="story-content-bottom" style="view-transition-name: story-content-bottom-${story.id}">
              <p class="story-desc">${story.description || ""}</p>
              <p class="story-date"><i class="far fa-clock"></i> <time datetime="${story.createdAt}">${story.createdAt ? new Date(story.createdAt).toLocaleString() : ""}</time></p>
              <div style="display: flex; gap: 8px; align-items: center;">
                <a href="#/saved-detail/${story.id}" class="story-link button" aria-label="View details of saved story from ${story.name}"><i class="fas fa-eye"></i> View Details</a>
                <button class="button button-danger remove-saved-story-btn story-card-delete-btn" data-id="${story.id}" aria-label="Remove saved story"><i class="fas fa-trash"></i></button>
              </div>
            </div>
          </article>
        `
          )
          .join("")}
      </div>
    `;
    this.setupRemoveButtons();
    this.setupSavedDetailLinks(stories);
  }

  displaySavedStoriesError(message) {
    const errorContainer = document.getElementById("saved-stories-error");
    errorContainer.textContent = message;
  }

  setupRemoveButtons() {
    const removeButtons = document.querySelectorAll(".remove-saved-story-btn");
    removeButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = btn.dataset.id;
        this.presenter.removeStory(id);
      });
    });
  }

  setupSavedDetailLinks(stories) {
    const detailLinks = document.querySelectorAll(".story-link");
    detailLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.closest(".story-card").dataset.id;
        const story = stories.find((s) => s.id === id);
        if (story) {
          sessionStorage.setItem("offline-detail-story", JSON.stringify(story));
          window.location.hash = `#/saved-detail/${id}`;
        }
      });
    });
  }
}
