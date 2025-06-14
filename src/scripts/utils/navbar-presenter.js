import AuthService from "./auth-service";

class NavbarPresenter {
  getAuth() {
    return AuthService.getAuth();
  }

  logout() {
    AuthService.removeAuth();
    AuthService.setToken(null);
  }
}

export default NavbarPresenter;
