import NavbarPresenter from "./navbar-presenter.js";
import ApiService from "../data/api-service";
import CONFIG from "../config";

const NavbarPage = {
  init() {
    this.presenter = new NavbarPresenter();
    this.renderAuthInfo();
    this.setupLogoutButton();
    this.setupSubscribeButton();
  },

  renderAuthInfo() {
    const authButtons = document.getElementById("auth-buttons");
    const userInfo = document.getElementById("user-info");
    const userName = document.getElementById("user-name");
    const subscribeBtn = document.getElementById("subscribe-notification-btn");
    const auth = this.presenter.getAuth();
    if (auth && auth.token) {
      authButtons.style.display = "none";
      userInfo.style.display = "block";
      userName.innerHTML = `<i class="fas fa-user-circle"></i> Logged in as: ${auth.name || "User"}`;
      if (subscribeBtn) subscribeBtn.style.display = "inline-block";
    } else {
      authButtons.style.display = "block";
      userInfo.style.display = "none";
      userName.textContent = "";
      if (subscribeBtn) subscribeBtn.style.display = "none";
    }
  },

  setupLogoutButton() {
    const logoutButton = document.getElementById("logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        this.presenter.logout();
        Swal.fire({
          icon: "success",
          title: "Logged Out Successfully!",
          text: "Come back soon!",
          confirmButtonColor: "#8b4513",
          timer: 2000,
          timerProgressBar: true,
        });
        Swal.getPopup().addEventListener("click", () => {
          window.location.hash = "#/";
          this.renderAuthInfo();
        });
        setTimeout(() => {
          window.location.hash = "#/";
          this.renderAuthInfo();
        }, 2100);
      });
    }
  },

  async setupSubscribeButton() {
    const subscribeBtn = document.getElementById("subscribe-notification-btn");
    if (!subscribeBtn) return;
    const newBtn = subscribeBtn.cloneNode(true);
    subscribeBtn.parentNode.replaceChild(newBtn, subscribeBtn);
    function setSubscribedUI(btn) {
      btn.innerHTML = '<i class="fas fa-bell-slash"></i>';
      btn.classList.add("unsubscribe");
    }
    function setUnsubscribedUI(btn) {
      btn.innerHTML = '<i class="fas fa-bell"></i>';
      btn.classList.remove("unsubscribe");
    }
    let isSubscribed = false;
    let currentSubscription = null;
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        await navigator.serviceWorker.register("/service-worker.js");
        const registration = await navigator.serviceWorker.ready;
        currentSubscription = await registration.pushManager.getSubscription();
        if (currentSubscription) {
          isSubscribed = true;
          setSubscribedUI(newBtn);
        } else {
          setUnsubscribedUI(newBtn);
        }
      } catch (e) {
        setUnsubscribedUI(newBtn);
      }
    }
    newBtn.addEventListener("click", async () => {
      if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
        Swal.fire({
          icon: "error",
          title: "Notifications not supported",
          text: "Your browser does not support push notifications.",
          confirmButtonColor: "#8b4513",
        });
        return;
      }
      try {
        await navigator.serviceWorker.register("/service-worker.js");
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          const endpoint = subscription.endpoint;
          await subscription.unsubscribe();
          await ApiService.unsubscribeNotification(endpoint);
          setUnsubscribedUI(newBtn);
          Swal.fire({
            icon: "success",
            title: "Unsubscribed!",
            text: "You will no longer receive notifications.",
            confirmButtonColor: "#8b4513",
            timer: 2000,
            timerProgressBar: true,
          });
        } else {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") {
            Swal.fire({
              icon: "error",
              title: "Permission Denied",
              text: "You denied notification permissions.",
              confirmButtonColor: "#8b4513",
            });
            return;
          }
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY),
          });
          const subscriptionObj = subscription.toJSON();
          delete subscriptionObj.expirationTime;
          await ApiService.subscribeNotification(subscriptionObj);
          setSubscribedUI(newBtn);
          Swal.fire({
            icon: "success",
            title: "Subscribed!",
            text: "You will receive notifications.",
            confirmButtonColor: "#8b4513",
            timer: 2000,
            timerProgressBar: true,
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: isSubscribed ? "Unsubscribe Failed" : "Subscription Failed",
          text: error.message || (isSubscribed ? "Failed to unsubscribe." : "Failed to subscribe for notifications."),
          confirmButtonColor: "#8b4513",
        });
      }
    });
  },
};

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default NavbarPage;
