import MapHelper from "../../utils/map-helper.js";
import Database from "../../data/database.js";

export default class SavedDetailStoryPage {
  constructor(id) {
    this.id = id;
  }

  async render() {
    return `
      <section class="container">
        <div class="story-detail-header">
          <h1 class="page-title"><i class="fas fa-book-open"></i> Saved Story Details</h1>
          <a href="#/saved-stories" class="button button-secondary"><i class="fas fa-arrow-left"></i> Back to Saved Stories</a>
        </div>
        <div id="story-container" class="story-detail-container"></div>
      </section>
    `;
  }

  async afterRender() {
    const storyContainer = document.getElementById("story-container");
    let story = null;
    const storyData = sessionStorage.getItem("offline-detail-story");
    if (storyData) {
      story = JSON.parse(storyData);
    } else {
      story = await Database.getStoryById(this.id);
    }
    if (!story) {
      storyContainer.innerHTML = "<p>Story not found or unavailable offline.</p>";
      return;
    }
    storyContainer.innerHTML = this._renderStoryDetail(story);
    if (story.lat && story.lon) {
      await MapHelper.loadLeaflet();
      this._initMap(story.lat, story.lon, story.name);
    }
    const deleteBtn = document.getElementById("delete-saved-story-btn");
    if (deleteBtn) {
      deleteBtn.onclick = async () => {
        await Database.removeStory(story.id);
        if (sessionStorage.getItem("offline-detail-story")) {
          sessionStorage.removeItem("offline-detail-story");
        }
        window.location.hash = "#/saved-stories";
      };
    }
  }

  _renderStoryDetail(story) {
    const dateOptions = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    const formattedDate = new Date(story.createdAt).toLocaleDateString(undefined, dateOptions);
    return `
      <div class="story-detail">
        <div class="story-detail-meta">
          <h2>From: ${story.name}</h2>
          ${story.lat && story.lon ? `<p class="story-location"><i class="fas fa-map-marker-alt"></i> Location: ${story.lat}, ${story.lon}</p>` : ""}
        </div>
        <div class="story-detail-image">
          <img src="${story.offlineImage || story.photoUrl || ""}" alt="Story from ${story.name}">
        </div>
        <div class="story-detail-content">
          <div class="story-description">
            <p>${story.description}</p>
          </div>
          <p class="story-date"><i class="far fa-clock"></i> ${formattedDate}</p>
          ${story.lat && story.lon ? `<div class="story-location"><h3><i class="fas fa-map-marker-alt"></i> Detailed Location</h3><div id="map" class="story-map"></div></div>` : ""}
        </div>
        <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
          <button id="delete-saved-story-btn" class="button button-danger"><i class="fas fa-trash"></i> Delete</button>
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
