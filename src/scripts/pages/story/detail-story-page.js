import AuthStorage from "../../data/auth-storage";
import MapHelper from "../../utils/map-helper";
import DetailStoryPresenter from "./detail-story-presenter";

export default class DetailStoryPage {
  constructor(id) {
    this.id = id;
    this.presenter = new DetailStoryPresenter();
  }

  async render() {
    return `
      <section class="container">
        <div class="story-detail-header" style="display: flex; align-items: center; gap: 8px;">
          <h1 class="page-title"><i class="fas fa-book-open"></i> Story Details</h1>
          <a href="#/" class="button button-secondary" id="back-to-stories-btn"><i class="fas fa-arrow-left"></i> Back to Stories</a>
        </div>
        <div class="loading-indicator">Loading story...</div>
        <div id="story-container" class="story-detail-container"></div>
        <div id="error-container" class="error-container"></div>
      </section>
    `;
  }

  async afterRender() {
    await MapHelper.loadLeaflet();

    const storyContainer = document.getElementById("story-container");
    const errorContainer = document.getElementById("error-container");
    const loadingIndicator = document.querySelector(".loading-indicator");

    if (this.id.startsWith("guest-")) {
      loadingIndicator.style.display = "none";
      errorContainer.innerHTML = `
        <div class="auth-message">
          <p>This is a sample story for guest users.</p>
          <p>Please <a href="#/login">login</a> to view real story details.</p>
        </div>
      `;
      return;
    }

    loadingIndicator.style.display = "block";
    errorContainer.innerHTML = "";
    storyContainer.innerHTML = "";
    try {
      const story = await this.presenter.getStoryDetail(this.id);
      this.displayStoryDetail(story);
    } catch (error) {
      if (error.message === "Not authenticated") {
        this.showAuthMessage();
      } else if (error.message === "Story not found") {
        this.showStoryNotFound();
      } else {
        this.showError(error.message);
      }
    }
    this._renderSaveButtonOnHeader && this._renderSaveButtonOnHeader();
  }

  showAuthMessage() {
    const errorContainer = document.getElementById("error-container");
    const loadingIndicator = document.querySelector(".loading-indicator");
    loadingIndicator.style.display = "none";
    errorContainer.innerHTML = `
      <div class="auth-message">
        <p>You need to be logged in to view story details.</p>
        <p><a href="#/login">Login</a> or <a href="#/register">register</a> to access all features.</p>
      </div>
    `;
  }

  showStoryNotFound() {
    const storyContainer = document.getElementById("story-container");
    const loadingIndicator = document.querySelector(".loading-indicator");
    loadingIndicator.style.display = "none";
    storyContainer.innerHTML = "<p>Story not found</p>";
  }

  displayStoryDetail(story) {
    const storyContainer = document.getElementById("story-container");
    const loadingIndicator = document.querySelector(".loading-indicator");
    loadingIndicator.style.display = "none";
    storyContainer.innerHTML = this._renderStoryDetail(story);
    if (story.lat && story.lon) {
      this._initMap(story.lat, story.lon, story.name);
    }
    this._renderSaveButtonBottom && this._renderSaveButtonBottom(story);
  }

  async _renderSaveButton(story) {
    const saveContainer = document.getElementById("save-story-actions");
    saveContainer.innerHTML = "";
    const isSaved = await this.presenter.isStorySaved(story.id);
    const btn = document.createElement("button");
    btn.className = "bookmark-btn";
    btn.title = isSaved ? "Remove from Saved Stories" : "Save Story Offline";
    btn.innerHTML = isSaved ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
    btn.style.color = isSaved ? "#1976d2" : "#1976d2";
    btn.style.background = "none";
    btn.style.border = "none";
    btn.style.fontSize = "2rem";
    btn.style.cursor = "pointer";
    btn.onclick = async () => {
      if (isSaved) {
        await this.presenter.removeSavedStory(story.id);
      } else {
        await this.presenter.saveStoryOffline(story);
      }
      this._renderSaveButton(story);
    };
    saveContainer.appendChild(btn);
  }

  async _renderSaveButtonBottom(story) {
    let container = document.getElementById("save-story-actions-bottom");
    if (!container) {
      container = document.createElement("div");
      container.id = "save-story-actions-bottom";
      container.style.display = "flex";
      container.style.justifyContent = "center";
      container.style.margin = "32px auto 0 auto";
      container.style.width = "100%";
      const main = document.querySelector(".story-detail-container");
      if (main) main.appendChild(container);
    }
    container.innerHTML = "";
    const isSaved = await this.presenter.isStorySaved(story.id);
    const btn = document.createElement("button");
    btn.className = "bookmark-btn save-stories-btn";
    btn.title = isSaved ? "Remove from Saved Stories" : "Save Story Offline";
    btn.innerHTML = isSaved
      ? '<span style="display:inline-flex;align-items:center;"><i class="fas fa-bookmark"></i><span style="width:10px;display:inline-block;"></span>Story saved</span>'
      : '<span style="display:inline-flex;align-items:center;"><i class="far fa-bookmark"></i><span style="width:10px;display:inline-block;"></span>Save Stories</span>';
    btn.style.color = "#fff";
    btn.style.background = "#1976d2";
    btn.style.border = "none";
    btn.style.fontSize = "1.2rem";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "6px";
    btn.style.padding = "10px 24px";
    btn.style.width = "100%";
    btn.style.maxWidth = "600px";
    btn.style.margin = "0 auto";
    btn.onmouseover = () => {
      btn.style.background = "#1565c0";
    };
    btn.onmouseout = () => {
      btn.style.background = "#1976d2";
    };
    btn.onclick = async () => {
      if (isSaved) {
        await this.presenter.removeSavedStory(story.id);
      } else {
        await this.presenter.saveStoryOffline(story);
      }
      this._renderSaveButtonBottom(story);
    };
    container.appendChild(btn);
  }

  async _renderSaveButtonOnHeader() {
    const story = await this.presenter.getStoryDetail(this.id).catch(() => null);
    if (!story) return;
    const saveContainer = document.getElementById("save-story-actions");
    if (!saveContainer) return;
    saveContainer.innerHTML = "";
    const isSaved = await this.presenter.isStorySaved(story.id);
    const btn = document.createElement("button");
    btn.className = "bookmark-btn";
    btn.title = isSaved ? "Remove from Saved Stories" : "Save Story Offline";
    btn.innerHTML = isSaved ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
    btn.style.color = isSaved ? "#fff" : "#fff";
    btn.style.background = isSaved ? "#1976d2" : "#1976d2";
    btn.style.border = "none";
    btn.style.fontSize = "1.7rem";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "6px";
    btn.style.padding = "6px 12px";
    btn.style.marginRight = "0px";
    btn.onclick = async () => {
      if (isSaved) {
        await this.presenter.removeSavedStory(story.id);
      } else {
        await this.presenter.saveStoryOffline(story);
      }
      this._renderSaveButtonOnHeader();
    };
    saveContainer.appendChild(btn);
  }

  showError(message) {
    const errorContainer = document.getElementById("error-container");
    const loadingIndicator = document.querySelector(".loading-indicator");
    loadingIndicator.style.display = "none";
    errorContainer.innerHTML = `<p>Error loading story: ${message}</p>`;
  }

  _renderStoryDetail(story) {
    const dateOptions = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    const formattedDate = new Date(story.createdAt).toLocaleDateString(undefined, dateOptions);
    return `
      <div class="story-detail" style="view-transition-name: story-card-${story.id}">
        <div class="story-detail-meta" style="view-transition-name: story-content-${story.id}">
          <h2>From: ${story.name}</h2>
          ${story.lat && story.lon ? `<p class="story-location"><i class="fas fa-map-marker-alt"></i> Location: ${story.lat}, ${story.lon}</p>` : ``}
        </div>
        <div class="story-detail-image" style="view-transition-name: story-image-${story.id}">
          <img src="${story.photoUrl}" alt="Story from ${story.name}">
        </div>
        <div class="story-detail-content" style="view-transition-name: story-content-bottom-${story.id}">
          <div class="story-description">
            <p>${story.description}</p>
          </div>
          <p class="story-date"><i class="far fa-clock"></i> ${formattedDate}</p>
          ${story.lat && story.lon ? `<div class="story-location"><h3><i class="fas fa-map-marker-alt"></i> Detailed Location</h3><div id="map" class="story-map"></div></div>` : ``}
        </div>
      </div>
    `;
  }

  async _initMap(lat, lon, name) {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) return;
    const map = await MapHelper.initMap("map", lat, lon);
    const customIcon = MapHelper.getStandardMarkerIcon();
    const marker = L.marker([lat, lon], { icon: customIcon }).addTo(map);
    const popupContent = `
      <div style="text-align: center;">
        <div style="background: linear-gradient(to bottom, #8B4513, #654321);color: #fff;padding: 8px 12px;border-radius: 6px;box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2);margin-bottom: 10px;text-shadow: 0 -1px 0 rgba(0,0,0,0.3);border: 1px solid #543210;"><h3 style="margin: 0; font-weight: 600;">${name}'s Location</h3></div>
        <div style="background: #f8f4e6;border: 1px solid #e5dac3;border-radius: 6px;padding: 8px;margin-bottom: 8px;box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);"><p style="margin: 0; color: #654321;">This is where the author was when they posted this story.</p></div>
        <div style="background: linear-gradient(to bottom, #f9f9f9, #efefef);border: 1px solid #ddd;border-radius: 6px;padding: 8px 12px;box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);"><strong style="color: #8B4513;">Coordinates:</strong><span style="font-family: monospace; background: #fff; padding: 2px 5px; border-radius: 3px; border: 1px solid #ddd; display: inline-block; margin-top: 3px; box-shadow: inset 0 1px 2px rgba(0,0,0,0.07);">${lat.toFixed(
          6
        )}, ${lon.toFixed(6)}</span></div>
      </div>
    `;
    marker.bindPopup(popupContent, { maxWidth: 300, className: "custom-popup" }).openPopup();
  }
}
