import ApiService from "../../data/api-service";
import AuthStorage from "../../data/auth-storage";

export default class AddStoryPresenter {
  constructor() {}

  isUserLoggedIn() {
    return AuthStorage.isLoggedIn();
  }

  async submitStory({ description, photo, lat, lon }) {
    if (!description || !photo) {
      throw new Error("Description and photo are required.");
    }
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat && lon) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }
    const auth = AuthStorage.getAuth();
    if (auth) {
      ApiService.setToken(auth.token);
      await ApiService.addStory(formData);
    } else {
      await ApiService.addStoryAsGuest(formData);
    }
  }
}
