import LoginPresenter from "./login-presenter.js";

export default class LoginPage {
  constructor() {
    this.presenter = null;
  }

  async render() {
    return `
      <section class="container auth-container">
        <h1>Login</h1>
        <div id="error-container" class="error-container"></div>
        
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email">
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="Enter your password">
          </div>
          
          <button type="submit" class="button button-primary">Login</button>
          
          <p class="form-footer">
            Don't have an account? <a href="#/register">Register here</a>
          </p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const elements = {
      loginForm: document.getElementById("login-form"),
      errorContainer: document.getElementById("error-container"),
      emailInput: document.getElementById("email"),
      passwordInput: document.getElementById("password"),
    };

    this.presenter = new LoginPresenter();

    elements.loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = elements.emailInput.value;
      const password = elements.passwordInput.value;
      try {
        const loginResult = await this.presenter.login({ email, password });
        this.showSuccessMessage(loginResult.name);
        const redirect = () => {
          window.location.hash = "#/";
        };
        Swal.getPopup()?.addEventListener("click", redirect);
        setTimeout(redirect, 2100);
      } catch (error) {
        this.showError(error.message);
        console.error("Login error:", error);
      }
    });
  }

  showError(message) {
    const errorContainer = document.getElementById("error-container");
    errorContainer.innerHTML = `<p>Login failed: ${message}</p>`;
  }

  showSuccessMessage(name) {
    Swal.fire({
      icon: "success",
      title: "Login Successful!",
      text: `Welcome back, ${name}!`,
      confirmButtonColor: "#8b4513",
      timer: 2000,
      timerProgressBar: true,
    });
  }
}
