import Database from "../../data/database.js";

class SavedStoriesPresenter {
  constructor(view) {
    this.view = view;
  }

  async getAllSavedStories() {
    try {
      const stories = await Database.getAllStories();
      this.view.displaySavedStories(stories);
    } catch (error) {
      this.view.displaySavedStoriesError(error.message);
    }
  }

  async removeStory(id) {
    try {
      await Database.removeStory(id);
      this.getAllSavedStories();
    } catch (error) {
      this.view.displaySavedStoriesError(error.message);
    }
  }
}

export default SavedStoriesPresenter;
