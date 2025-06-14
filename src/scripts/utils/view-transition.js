const ViewTransition = {
  isSupported() {
    return Boolean(document.startViewTransition);
  },
  async transition(updateCallback) {
    if (!this.isSupported()) {
      return updateCallback();
    }
    try {
      const transition = document.startViewTransition(async () => {
        await updateCallback();
      });
      await transition.finished;
    } catch (error) {
      console.error("View Transition error:", error);
      await updateCallback();
    }
  },
};

export default ViewTransition;
