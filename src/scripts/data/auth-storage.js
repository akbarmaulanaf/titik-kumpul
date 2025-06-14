const AUTH_KEY = "tikum_story_auth";

const AuthStorage = {
  saveAuth({ userId, name, token }) {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({
        userId,
        name,
        token,
      })
    );
  },

  getAuth() {
    const authString = localStorage.getItem(AUTH_KEY);
    if (!authString) {
      return null;
    }

    return JSON.parse(authString);
  },

  removeAuth() {
    localStorage.removeItem(AUTH_KEY);
  },

  isLoggedIn() {
    return !!this.getAuth();
  },
};

export default AuthStorage;
