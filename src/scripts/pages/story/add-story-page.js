import AuthStorage from "../../data/auth-storage";
import MapHelper from "../../utils/map-helper";
import AddStoryPresenter from "./add-story-presenter.js";

export default class AddStoryPage {
  constructor() {
    this.presenter = null;
  }

  async render() {
    let isLoggedIn = false;

    try {
      isLoggedIn = AuthStorage.isLoggedIn();
    } catch (error) {
      console.error("Error checking login status:", error);
    }

    return `
      <section class="container">
        <h1 class="page-title"><i class="fas fa-plus-circle"></i> Add New Story</h1>
        ${
          !isLoggedIn
            ? `
          <div class="guest-notice" role="alert">
            <p><i class="fas fa-info-circle"></i> You are adding a story as a guest. <a href="#/login">Login</a> to save stories to your account.</p>
          </div>
        `
            : ""
        }
        <div id="error-container" class="error-container" role="alert" aria-live="assertive"></div>
        
        <form id="add-story-form" class="story-form" aria-labelledby="form-title">
          <p id="form-title" class="sr-only">Form to add a new story with photo and optional location</p>
          
          <div class="form-group">
            <label for="description" id="description-label">Description</label>
            <textarea 
              id="description" 
              name="description" 
              required 
              placeholder="Enter your story description" 
              rows="4"
              aria-labelledby="description-label"
              aria-required="true"></textarea>
          </div>
          
          <div class="form-group">
            <p id="photo-label">Photo</p>
            <div class="photo-capture-container" role="group" aria-labelledby="photo-label">
              <div class="photo-option-buttons">
                <button type="button" id="start-camera-button" class="button button-secondary" aria-label="Take a photo with camera">
                  <i class="fas fa-camera"></i> Take Photo with Camera
                </button>
                <span class="or-divider" aria-hidden="true">or</span>
                <label for="photo" class="upload-label">
                  <i class="fas fa-upload"></i> Upload from Device
                </label>
              </div>
              
              <input 
                type="file" 
                id="photo" 
                name="photo" 
                accept="image/*" 
                style="display: none;" 
                aria-label="Upload photo from device">
              
              <!-- Camera elements -->
              <div id="camera-container" style="display: none;" aria-live="polite">
                <video id="camera-preview" autoplay playsinline style="width: 100%; max-height: 300px;" aria-label="Camera preview"></video>
                <div class="camera-controls">
                  <button type="button" id="capture-button" class="button" aria-label="Take photo">
                    <i class="fas fa-camera"></i> Capture Photo
                  </button>
                  <button type="button" id="stop-camera-button" class="button button-secondary" aria-label="Cancel camera">
                    <i class="fas fa-times"></i> Cancel
                  </button>
                </div>
              </div>
              
              <p class="file-size-info"><i class="fas fa-info-circle"></i> Max file size: 1MB</p>
              <div class="image-preview-container">
                <canvas id="photo-canvas" style="display: none; max-width: 100%; max-height: 200px;" aria-label="Captured photo preview"></canvas>
                <img id="image-preview" src="#" alt="Preview of selected photo" style="display: none; max-width: 100%; max-height: 200px;">
              </div>
              <div id="image-size-info" class="image-size-info" aria-live="polite"></div>
            </div>
          </div>
          
          <div class="form-group location-inputs">
            <div class="checkbox-wrapper">
              <input type="checkbox" id="location-checkbox" aria-controls="location-fields">
              <label for="location-checkbox"><i class="fas fa-map-marker-alt"></i> Include my location</label>
            </div>
            
            <div id="location-fields" style="display: none;" role="group" aria-labelledby="location-group-label">
              <p id="location-group-label" class="sr-only">Location information</p>
              <div id="map" class="location-map" tabindex="0" aria-label="Interactive map to select location"></div>
              <p class="map-instructions"><i class="fas fa-info-circle"></i> Click on the map to set your location or use the button below</p>
              
              <div class="location-field">
                <label for="lat">Latitude</label>
                <input type="number" id="lat" name="lat" step="any" placeholder="e.g. -6.2088" aria-label="Latitude coordinate">
              </div>
              <div class="location-field">
                <label for="lon">Longitude</label>
                <input type="number" id="lon" name="lon" step="any" placeholder="e.g. 106.8456" aria-label="Longitude coordinate">
              </div>
              <button type="button" id="get-location" class="button button-secondary" aria-label="Get current location">
                <i class="fas fa-crosshairs"></i> Use My Current Location
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <a href="#/" class="button button-secondary">
              <i class="fas fa-times"></i> Cancel
            </a>
            <button type="submit" class="button button-primary" id="submit-button">
              <i class="fas fa-paper-plane"></i> Submit Story
            </button>
          </div>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const elements = {
      addStoryForm: document.getElementById("add-story-form"),
      errorContainer: document.getElementById("error-container"),
      descriptionInput: document.getElementById("description"),
      photoInput: document.getElementById("photo"),
      photoCanvas: document.getElementById("photo-canvas"),
      imagePreview: document.getElementById("image-preview"),
      imageSizeInfo: document.getElementById("image-size-info"),
      uploadLabel: document.querySelector(".upload-label"),
      startCameraButton: document.getElementById("start-camera-button"),
      stopCameraButton: document.getElementById("stop-camera-button"),
      cameraContainer: document.getElementById("camera-container"),
      cameraPreview: document.getElementById("camera-preview"),
      captureButton: document.getElementById("capture-button"),
      locationCheckbox: document.getElementById("location-checkbox"),
      locationFields: document.getElementById("location-fields"),
      getLocationButton: document.getElementById("get-location"),
      latInput: document.getElementById("lat"),
      lonInput: document.getElementById("lon"),
      submitButton: document.getElementById("submit-button"),
    };

    this.presenter = new AddStoryPresenter();

    // Form submit handler
    elements.addStoryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      this.clearErrors();
      this.showSubmitLoading(true);
      try {
        const description = elements.descriptionInput.value;
        let photo = elements.photoInput.files[0];
        let lat = elements.latInput.value;
        let lon = elements.lonInput.value;
        // Compress image if needed
        if (photo && photo.size > 1024 * 1024) {
          photo = await this.compressImage(photo);
        }
        await this.presenter.submitStory({ description, photo, lat, lon });
        this.showSuccessMessage();
        this.resetForm();
      } catch (error) {
        this.showSubmitError(error.message);
      } finally {
        this.showSubmitLoading(false);
      }
    });

    // Photo input preview
    elements.uploadLabel.addEventListener("click", () => {
      elements.photoInput.click();
    });
    elements.photoInput.addEventListener("change", () => {
      if (elements.photoInput.files && elements.photoInput.files[0]) {
        const file = elements.photoInput.files[0];
        this.showPhotoPreview(file);
      } else {
        this.hidePhotoPreview();
      }
    });

    // Camera logic
    let cameraStream = null;
    this._cleanupHandler = () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        cameraStream = null;
      }
    };
    window.addEventListener("hashchange", this._cleanupHandler);
    window.addEventListener("beforeunload", this._cleanupHandler);
    if (elements.startCameraButton && elements.cameraContainer && elements.cameraPreview) {
      elements.startCameraButton.addEventListener("click", async () => {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "environment" },
            audio: false,
          });
          elements.cameraPreview.srcObject = cameraStream;
          elements.cameraContainer.style.display = "block";
          elements.startCameraButton.style.display = "none";
          elements.photoInput.style.display = "none";
          elements.uploadLabel.style.display = "none";
        } catch (error) {
          this.showError(`Error accessing camera: ${error.message}`);
        }
      });
      elements.stopCameraButton.addEventListener("click", () => {
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          cameraStream = null;
        }
        elements.cameraContainer.style.display = "none";
        elements.startCameraButton.style.display = "inline-block";
        elements.photoInput.style.display = "none";
        elements.uploadLabel.style.display = "inline-block";
      });
      elements.captureButton.addEventListener("click", () => {
        const video = elements.cameraPreview;
        const canvas = elements.photoCanvas;
        const imagePreview = elements.imagePreview;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.style.display = "block";
        imagePreview.style.display = "none";
        document.getElementById("image-size-info").textContent = "Photo captured from camera";
        canvas.toBlob((blob) => {
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          elements.photoInput.files = dataTransfer.files;
        }, "image/jpeg");
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          cameraStream = null;
        }
        elements.cameraContainer.style.display = "none";
        elements.startCameraButton.style.display = "inline-block";
        elements.photoInput.style.display = "none";
        elements.uploadLabel.style.display = "inline-block";
      });
    }

    // Location logic
    let map = null;
    let marker = null;
    elements.locationCheckbox.addEventListener("change", async () => {
      this.toggleLocationFields(elements.locationCheckbox.checked);
      if (elements.locationCheckbox.checked && !map) {
        try {
          const { map: newMap, marker: newMarker } = await this.initMap();
          map = newMap;
          marker = newMarker;
        } catch (error) {
          this.showError(`Error initializing map: ${error.message}`);
        }
      }
    });
    elements.getLocationButton.addEventListener("click", () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            this.setLocationCoordinates(latitude, longitude, map, marker);
          },
          (error) => {
            this.showError(`Error getting location: ${error.message}`);
          }
        );
      } else {
        this.showError("Geolocation is not supported by this browser.");
      }
    });
    elements.latInput.addEventListener("change", () => this.updateMapFromInputs(map, marker));
    elements.lonInput.addEventListener("change", () => this.updateMapFromInputs(map, marker));
  }

  showError(message) {
    const errorContainer = document.getElementById("error-container");
    errorContainer.innerHTML = `<p>${message}</p>`;
  }

  clearErrors() {
    const errorContainer = document.getElementById("error-container");
    errorContainer.innerHTML = "";
  }

  showSubmitLoading(isLoading) {
    const submitButton = document.getElementById("submit-button");
    submitButton.disabled = isLoading;
    submitButton.innerHTML = isLoading ? '<i class="fas fa-spinner fa-spin"></i> Processing...' : '<i class="fas fa-paper-plane"></i> Submit Story';
  }

  showSubmitError(message) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: `Failed to add story: ${message}`,
      confirmButtonColor: "#3498db",
    });
  }

  showSuccessMessage() {
    Swal.fire({
      icon: "success",
      title: "Success!",
      text: "Your story has been added successfully",
      confirmButtonText: "View Stories",
      confirmButtonColor: "#3498db",
      showCancelButton: true,
      cancelButtonText: "Add Another Story",
      cancelButtonColor: "#7f8c8d",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.hash = "#/";
      } else {
        this.resetForm();
      }
    });
  }

  resetForm() {
    const form = document.getElementById("add-story-form");
    form.reset();

    const imagePreview = document.getElementById("image-preview");
    const photoCanvas = document.getElementById("photo-canvas");
    const imageSizeInfo = document.getElementById("image-size-info");

    imagePreview.style.display = "none";
    photoCanvas.style.display = "none";
    imageSizeInfo.textContent = "";

    this.showSubmitLoading(false);
  }

  showPhotoPreview(file) {
    const photoCanvas = document.getElementById("photo-canvas");
    const imagePreview = document.getElementById("image-preview");
    const imageSizeInfo = document.getElementById("image-size-info");

    photoCanvas.style.display = "none";

    const fileSizeInMB = file.size / (1024 * 1024);
    imageSizeInfo.textContent = `File size: ${fileSizeInMB.toFixed(2)} MB`;

    if (fileSizeInMB > 1) {
      imageSizeInfo.style.color = "red";
      imageSizeInfo.textContent += " (Warning: File exceeds 1MB limit and will be compressed)";
    } else {
      imageSizeInfo.style.color = "green";
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  hidePhotoPreview() {
    const imagePreview = document.getElementById("image-preview");
    const imageSizeInfo = document.getElementById("image-size-info");

    imagePreview.style.display = "none";
    imageSizeInfo.textContent = "";
  }

  showCameraPreview(stream) {
    const cameraPreview = document.getElementById("camera-preview");
    const cameraContainer = document.getElementById("camera-container");
    const startCameraButton = document.getElementById("start-camera-button");

    cameraPreview.srcObject = stream;
    cameraContainer.style.display = "block";
    startCameraButton.style.display = "none";
    document.getElementById("photo").style.display = "none";
    document.querySelector(".upload-label").style.display = "none";
  }

  resetCameraUI() {
    const cameraContainer = document.getElementById("camera-container");
    const startCameraButton = document.getElementById("start-camera-button");

    cameraContainer.style.display = "none";
    startCameraButton.style.display = "inline-block";
    document.getElementById("photo").style.display = "none";
    document.querySelector(".upload-label").style.display = "inline-block";
  }

  capturePhoto() {
    const cameraPreview = document.getElementById("camera-preview");
    const photoCanvas = document.getElementById("photo-canvas");
    const imagePreview = document.getElementById("image-preview");
    const photoInput = document.getElementById("photo");

    photoCanvas.width = cameraPreview.videoWidth;
    photoCanvas.height = cameraPreview.videoHeight;

    const context = photoCanvas.getContext("2d");
    context.drawImage(cameraPreview, 0, 0, photoCanvas.width, photoCanvas.height);

    photoCanvas.style.display = "block";
    imagePreview.style.display = "none";

    document.getElementById("image-size-info").textContent = "Photo captured from camera";

    photoCanvas.toBlob((blob) => {
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      photoInput.files = dataTransfer.files;
    }, "image/jpeg");
  }

  destroy() {
    if (this._cleanupHandler) {
      window.removeEventListener("hashchange", this._cleanupHandler);
      window.removeEventListener("beforeunload", this._cleanupHandler);
      this._cleanupHandler();
    }
  }

  toggleLocationFields(show) {
    const locationFields = document.getElementById("location-fields");
    locationFields.style.display = show ? "block" : "none";
  }

  async initMap() {
    const defaultLat = -6.2088;
    const defaultLon = 106.8456;

    if (!window.L) {
      await MapHelper.loadLeaflet();
    }

    const map = await MapHelper.initMap("map", defaultLat, defaultLon);
    let marker = null;

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;

      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }

      document.getElementById("lat").value = lat.toFixed(6);
      document.getElementById("lon").value = lng.toFixed(6);
    });

    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return { map, marker };
  }

  updateMapFromInputs(map, marker) {
    const lat = parseFloat(document.getElementById("lat").value);
    const lon = parseFloat(document.getElementById("lon").value);

    if (!isNaN(lat) && !isNaN(lon) && map) {
      map.setView([lat, lon], 15);

      if (marker) {
        marker.setLatLng([lat, lon]);
      } else {
        marker = L.marker([lat, lon]).addTo(map);
      }
    }
  }

  setLocationCoordinates(latitude, longitude, map, marker) {
    const latInput = document.getElementById("lat");
    const lonInput = document.getElementById("lon");

    latInput.value = latitude;
    lonInput.value = longitude;

    if (map) {
      map.setView([latitude, longitude], 15);

      if (marker) {
        marker.setLatLng([latitude, longitude]);
      } else {
        marker = L.marker([latitude, longitude]).addTo(map);
      }
    }
  }

  async compressImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width));
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height));
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          let quality = 0.8;
          let compressedFile = null;
          const compressWithQuality = (q) => {
            return new Promise((resolveCompress) => {
              canvas.toBlob(
                (blob) => {
                  resolveCompress(
                    new File([blob], file.name, {
                      type: "image/jpeg",
                      lastModified: Date.now(),
                    })
                  );
                },
                "image/jpeg",
                q
              );
            });
          };
          const tryCompression = async () => {
            compressedFile = await compressWithQuality(quality);
            const fileSizeMB = compressedFile.size / (1024 * 1024);
            if (fileSizeMB <= 1 || quality <= 0.1) {
              resolve(compressedFile);
            } else {
              quality -= 0.1;
              tryCompression();
            }
          };
          tryCompression();
        };
        img.onerror = (error) => {
          reject(error);
        };
      };
      reader.onerror = (error) => {
        reject(error);
      };
    });
  }
}
