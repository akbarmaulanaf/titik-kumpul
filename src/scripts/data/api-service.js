import CONFIG from "../config";

class ApiService {
  static _token = null;

  static setToken(token) {
    this._token = token;
  }

  static getToken() {
    return this._token;
  }

  static _headers(additionalHeaders = {}) {
    const headers = {
      ...additionalHeaders,
    };

    if (this._token) {
      headers.Authorization = `Bearer ${this._token}`;
    }

    return headers;
  }

  static async register({ name, email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  static async login({ email, password }) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      this.setToken(responseJson.loginResult.token);

      return responseJson.loginResult;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async getAllStories(page = 1, size = 10, withLocation = 0) {
    try {
      const url = new URL(`${CONFIG.BASE_URL}/stories`);
      url.searchParams.append("page", page);
      url.searchParams.append("size", size);
      url.searchParams.append("location", withLocation);

      const response = await fetch(url, {
        headers: this._headers(),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson.listStory;
    } catch (error) {
      console.error("Get stories error:", error);
      throw error;
    }
  }

  static async getStoryDetail(id) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
        headers: this._headers(),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson.story;
    } catch (error) {
      console.error("Get story detail error:", error);
      throw error;
    }
  }

  static async addStory(formData) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
        method: "POST",
        headers: this._headers(),
        body: formData,
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error("Add story error:", error);
      throw error;
    }
  }

  static async addStoryAsGuest(formData) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
        method: "POST",
        body: formData,
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error("Add guest story error:", error);
      throw error;
    }
  }

  static async subscribeNotification(subscription) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: "POST",
        headers: {
          ...this._headers(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error("Subscribe notification error:", error);
      throw error;
    }
  }

  static async unsubscribeNotification(endpoint) {
    try {
      const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
        method: "DELETE",
        headers: {
          ...this._headers(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint }),
      });

      const responseJson = await response.json();

      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.error("Unsubscribe notification error:", error);
      throw error;
    }
  }
}

export default ApiService;
