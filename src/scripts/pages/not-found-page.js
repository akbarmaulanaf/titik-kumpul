export default class NotFoundPage {
  async render() {
    return `
      <section style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh;">
        <h1 style="color: #8b4513; font-weight: bold; font-size: 2.5rem; text-align: center;">Not Found</h1>
        <p style="color: #8b4513; font-size: 0.95rem; text-align: center; margin-top: 0.5rem; font-style: italic;">maybe false path or the letter?</p>
      </section>
    `;
  }
  async afterRender() {}
}
