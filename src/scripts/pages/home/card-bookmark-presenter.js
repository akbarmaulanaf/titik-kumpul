import Database from "../../data/database.js";

class CardBookmarkPresenter {
  async isStorySaved(id) {
    return !!(await Database.getStoryById(id));
  }
  async saveStory(story) {
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
  async removeStory(id) {
    await Database.removeStory(id);
  }
}

export default new CardBookmarkPresenter();
