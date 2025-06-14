import HomePresenter from "./home-presenter.js";
import MapHelper from "../../utils/map-helper";
import CardBookmarkPresenter from "./card-bookmark-presenter.js";

if (!window.MapHelper) {
  window.MapHelper = MapHelper;
}

export default class HomePage {
  constructor() {
    this.presenter = null;
  }

  async render() {
    return `
      <section class="container">
        <h1 class="page-title"><i class="fas fa-book"></i> Titik Kumpul</h1>
        <div class="story-controls">
          <button id="add-story-button" class="button" aria-label="Add your own story"><i class="fas fa-plus"></i> Add Your Own Story</button>
        </div>
        <section id="map-section" style="margin: 32px 0;">
          <div id="main-map" style="width: 100%; height: 400px; display: none;"></div>
        </section>
        <div class="auth-message" id="auth-message" role="alert" style="display:none"></div>
        <div class="loading-indicator" aria-live="polite" style="display:none">Loading stories...</div>
        <div id="stories-container" class="data-container" aria-live="polite"></div>
        <div id="error-container" class="error-container" role="alert" aria-live="assertive"></div>
      </section>
    `;
  }

  async afterRender() {
    const elements = {
      storiesContainer: document.getElementById("stories-container"),
      errorContainer: document.getElementById("error-container"),
      loadingIndicator: document.querySelector(".loading-indicator"),
      addStoryButton: document.getElementById("add-story-button"),
      authMessage: document.getElementById("auth-message"),
    };
    this.presenter = new HomePresenter();
    const isGuest = this.presenter.isGuest();
    this.showAuthMessage(isGuest);
    this.showLoading(true);
    elements.errorContainer.innerHTML = "";
    elements.storiesContainer.innerHTML = "";
    try {
      const stories = await this.presenter.getStories();
      await this.displayStories(stories);
      if (!isGuest) {
        await this.showMainMap(stories);
      } else {
        this.hideMainMap();
      }
    } catch (error) {
      this.displayError(error.message);
      this.hideMainMap();
    }
    elements.addStoryButton.onclick = () => {
      window.location.hash = "#/add";
    };
  }

  async displayStories(stories) {
    const storiesContainer = document.getElementById("stories-container");
    const loadingIndicator = document.querySelector(".loading-indicator");
    if (loadingIndicator) loadingIndicator.style.display = "none";
    storiesContainer.innerHTML = await this.renderStories(stories);
    this._setupStoryCardListeners();
    this._setupBookmarkButtons(stories);
  }

  displayError(message) {
    const errorContainer = document.getElementById("error-container");
    errorContainer.innerHTML = `<p>Error loading stories: ${message}</p>`;
  }

  async renderStories(stories) {
    if (!stories || stories.length === 0) {
      return `<p>No stories available. Be the first to create one!</p>`;
    }
    const storyCards = await Promise.all(
      stories.map(async (story) => {
        const isSaved = await CardBookmarkPresenter.isStorySaved(story.id);
        return `
          <article class="story-card" data-id="${story.id}" style="view-transition-name: story-card-${story.id}">
            <div class="story-content" style="view-transition-name: story-content-${story.id}">
              <h2>From: ${story.name}</h2>
              ${story.lat && story.lon ? `<p class="story-location"><i class="fas fa-map-marker-alt"></i> Location: ${story.lat}, ${story.lon}</p>` : ""}
            </div>
            <div class="story-image" style="view-transition-name: story-image-${story.id}">
              <img src="${story.photoUrl}" alt="Story from ${story.name}: ${story.description.substring(0, 50)}${story.description.length > 50 ? "..." : ""}" loading="lazy">
            </div>
            <div class="story-content-bottom" style="view-transition-name: story-content-bottom-${story.id}">
              <p class="story-desc">${story.description}</p>
              <p class="story-date"><i class="far fa-clock"></i> <time datetime="${story.createdAt}">${this._formatDate(story.createdAt)}</time></p>
              <div style="display: flex; gap: 8px; align-items: center;">
                ${story.id.startsWith("guest-") ? "" : `<a href="#/detail/${story.id}" class="story-link button" aria-label="View details of story from ${story.name}"><i class="fas fa-eye"></i> View Details</a>`}
                <button class="bookmark-btn" data-id="${story.id}" title="${isSaved ? "Remove from Saved Stories" : "Save Story Offline"}" style="color: #1976d2; background: none; border: none; font-size: 1.5rem; cursor: pointer;">
                  ${isSaved ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>'}
                </button>
              </div>
            </div>
          </article>
        `;
      })
    );
    return `<div class="stories-list">${storyCards.join("")}</div>`;
  }

  _formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  _setupStoryCardListeners() {
    const storyCards = document.querySelectorAll(".story-card");
    storyCards.forEach((card) => {
      card.style.cursor = "default";
      card.onclick = null;
      card.onkeydown = null;
      card.removeAttribute("tabindex");
    });
  }

  _setupBookmarkButtons(stories) {
    const bookmarkBtns = document.querySelectorAll(".bookmark-btn");
    bookmarkBtns.forEach((btn) => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const story = stories.find((s) => s.id === id);
        if (!story) return;
        const isSaved = await CardBookmarkPresenter.isStorySaved(id);
        if (isSaved) {
          await CardBookmarkPresenter.removeStory(id);
        } else {
          await CardBookmarkPresenter.saveStory(story);
        }
        btn.innerHTML = (await CardBookmarkPresenter.isStorySaved(id)) ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
        btn.title = (await CardBookmarkPresenter.isStorySaved(id)) ? "Remove from Saved Stories" : "Save Story Offline";
      };
    });
  }

  showAuthMessage(isGuest) {
    const authMessage = document.getElementById("auth-message");
    if (isGuest) {
      authMessage.innerHTML = `
        <div class="auth-message" role="alert">
          <p><i class="fas fa-info-circle"></i> You are currently browsing as a guest. <a href="#/login">Login</a> for a personalized experience.</p>
          <p>As a guest, you can add stories but can only see sample content. Login to view all stories!</p>
        </div>
      `;
      authMessage.style.display = "block";
    } else {
      authMessage.style.display = "none";
    }
  }

  hideAuthMessage() {
    const authMessage = document.getElementById("auth-message");
    authMessage.style.display = "none";
  }

  showLoading(isLoading) {
    const loadingIndicator = document.querySelector(".loading-indicator");
    loadingIndicator.style.display = isLoading ? "block" : "none";
  }

  hideMainMap() {
    const mapContainer = document.getElementById("main-map");
    if (mapContainer) {
      mapContainer.style.display = "none";
      if (this._mainMapInstance) {
        this._mainMapInstance.remove();
        this._mainMapInstance = null;
      }
    }
  }

  async showMainMap(stories) {
    const mapContainer = document.getElementById("main-map");
    if (!mapContainer) return;
    await window.MapHelper?.loadLeaflet?.();
    mapContainer.style.display = "block";
    if (this._mainMapInstance) {
      this._mainMapInstance.remove();
    }
    const storyWithLocation = stories.filter((s) => s.lat && s.lon);
    let centerLat = -2.5,
      centerLon = 118;
    let zoomLevel = 5;
    if (storyWithLocation.length > 0) {
      centerLat = storyWithLocation[0].lat;
      centerLon = storyWithLocation[0].lon;
    }
    const map = await window.MapHelper.initMap("main-map", centerLat, centerLon, zoomLevel);
    this._mainMapInstance = map;
    const customIcon = window.MapHelper.getStandardMarkerIcon?.() || undefined;
    storyWithLocation.forEach((story) => {
      const marker = customIcon ? L.marker([story.lat, story.lon], { icon: customIcon }) : L.marker([story.lat, story.lon]);
      marker.addTo(map).bindPopup(`
        <div style="min-width:180px">
          <b>${story.name}</b><br>
          <span>${story.description}</span>
        </div>
      `);
    });
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }
}
