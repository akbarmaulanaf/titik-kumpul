import ApiService from "../../data/api-service";
import AuthStorage from "../../data/auth-storage";
import Database from "../../data/database";

class DetailStoryPresenter {
  constructor() {}

  async getStoryDetail(id) {
    const auth = AuthStorage.getAuth();
    if (!auth) {
      throw new Error("Not authenticated");
    }
    ApiService.setToken(auth.token);
    const story = await ApiService.getStoryDetail(id);
    if (!story) {
      throw new Error("Story not found");
    }
    return story;
  }

  async saveStoryOffline(story) {
    let imageData = null;
    if (story.photoUrl) {
      try {
        const response = await fetch(story.photoUrl);
        const blob = await response.blob();
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        imageData = null;
      }
    }
    const storyToSave = { ...story, offlineImage: imageData };
    await Database.putStory(storyToSave);
  }

  async removeSavedStory(id) {
    await Database.removeStory(id);
  }

  async isStorySaved(id) {
    return !!(await Database.getStoryById(id));
  }
}

export default DetailStoryPresenter;
