import ApiService from "../../data/api-service";
import AuthStorage from "../../data/auth-storage";
import GuestStories from "../../data/guest-stories";

export default class HomePresenter {
  constructor() {}

  async getStories() {
    let stories = [];
    const auth = AuthStorage.getAuth();
    if (auth) {
      ApiService.setToken(auth.token);
      stories = await ApiService.getAllStories(1, 10);
    } else {
      stories = GuestStories;
    }
    return stories;
  }

  isGuest() {
    return !AuthStorage.isLoggedIn();
  }
}
