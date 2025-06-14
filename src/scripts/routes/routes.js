import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/auth/login-page";
import RegisterPage from "../pages/auth/register-page";
import AddStoryPage from "../pages/story/add-story-page";
import DetailStoryPage from "../pages/story/detail-story-page";
import SavedStoriesPage from "../pages/story/saved-stories-page";
import SavedDetailStoryPage from "../pages/story/saved-detail-story-page";
import NotFoundPage from "../pages/not-found-page";
import { parseActivePathname } from "./url-parser";

const routes = {
  "/": new HomePage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/add": new AddStoryPage(),
  "/add-story": new AddStoryPage(),
  "/detail/:id": {
    render: async () => {
      const { id } = parseActivePathname();
      return new DetailStoryPage(id).render();
    },
    afterRender: async () => {
      const { id } = parseActivePathname();
      return new DetailStoryPage(id).afterRender();
    },
  },
  "/saved-detail/:id": {
    render: async () => {
      const { id } = parseActivePathname();
      return new SavedDetailStoryPage(id).render();
    },
    afterRender: async () => {
      const { id } = parseActivePathname();
      return new SavedDetailStoryPage(id).afterRender();
    },
  },
  "/saved-stories": new SavedStoriesPage(),
  "*": new NotFoundPage(), // Fallback for unknown routes
};

export default routes;
