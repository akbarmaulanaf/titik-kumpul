import ApiService from "../../data/api-service";
import AuthStorage from "../../data/auth-storage";

export default class LoginPresenter {
  constructor() {}

  async login({ email, password }) {
    const loginResult = await ApiService.login({ email, password });
    AuthStorage.saveAuth(loginResult);
    return loginResult;
  }
}
