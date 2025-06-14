import ApiService from "../../data/api-service";

export default class RegisterPresenter {
  constructor() {}

  async register({ name, email, password }) {
    return await ApiService.register({ name, email, password });
  }
}
