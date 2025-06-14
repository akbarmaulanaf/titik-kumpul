import RegisterPresenter from "./register-presenter.js";

export default class RegisterPage {
  constructor() {
    this.presenter = null;
  }

  async render() {
    return `
      <section class="container auth-container">
        <h1>Register</h1>
        <div id="error-container" class="error-container"></div>
        <div id="success-container" class="success-container" style="display: none;"></div>
        
        <form id="register-form" class="auth-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" required placeholder="Enter your name">
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email">
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required placeholder="Enter your password (min 8 characters)" minlength="8">
          </div>
          
          <button type="submit" class="button button-primary">Register</button>
          
          <p class="form-footer">
            Already have an account? <a href="#/login">Login here</a>
          </p>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const elements = {
      registerForm: document.getElementById("register-form"),
      errorContainer: document.getElementById("error-container"),
      successContainer: document.getElementById("success-container"),
      nameInput: document.getElementById("name"),
      emailInput: document.getElementById("email"),
      passwordInput: document.getElementById("password"),
    };

    this.presenter = new RegisterPresenter();

    elements.registerForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = elements.nameInput.value;
      const email = elements.emailInput.value;
      const password = elements.passwordInput.value;
      try {
        await this.presenter.register({ name, email, password });
        this.showSuccess();
      } catch (error) {
        this.showError(error.message);
        console.error("Registration error:", error);
      }
    });
  }

  showError(message) {
    const errorContainer = document.getElementById("error-container");
    const successContainer = document.getElementById("success-container");

    successContainer.style.display = "none";
    errorContainer.innerHTML = `<p>Registration failed: ${message}</p>`;
  }

  showSuccess() {
    const errorContainer = document.getElementById("error-container");
    const successContainer = document.getElementById("success-container");
    const registerForm = document.getElementById("register-form");

    errorContainer.innerHTML = "";
    successContainer.style.display = "block";
    successContainer.innerHTML = `
      <p>Registration successful! Please <a href="#/login">login</a> to continue.</p>
    `;

    registerForm.reset();
  }
}
