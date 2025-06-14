import AuthStorage from "../data/auth-storage";
import ApiService from "../data/api-service";

const AuthService = {
  getAuth() {
    return AuthStorage.getAuth();
  },

  setToken(token) {
    ApiService.setToken(token);
  },

  removeAuth() {
    AuthStorage.removeAuth();
  },
};

export default AuthService;
