import { defineStore } from "pinia";

export const useNotifications = defineStore("notification", {
  state: () => ({}),
  actions: {
    createNotification(message) {
      const container = document.createElement("div");
      container.classList.add("fixed", "bottom-20", "right-5");
      document.body.appendChild(container); // Append the container to the body element

      const notif = document.createElement("div");
      notif.classList.add("bg-green-100", "text-dark", "py-2", "px-2", "mr-3");
      notif.style.borderRadius = "5px";
      notif.style.width = "400px";
      notif.style.height = "65px";
      // Add a media query to adjust the width on smaller screens
      const mq = window.matchMedia("(max-width: 640px)");
      if (mq.matches) {
        notif.style.width = "300px";
      }

      // Create close button
      const closeBtn = document.createElement("span");
      closeBtn.textContent = '✕';
      closeBtn.classList.add(
        "cursor-pointer",
        "ml-12",
        "absolute",
        "top-4",
        "right-7"
      );

      const timeoutId = setTimeout(() => {
        notif.remove();
        container.remove(); // Remove the container after the notification is removed
      }, 3000);

      closeBtn.addEventListener("click", () => {
        clearTimeout(timeoutId);
        notif.remove();
        container.remove(); // Remove the container after the notification is removed
      });

      // Add close button to notification element
      notif.appendChild(closeBtn);

      // Add message to notification element
      const messageEl = document.createElement("h2");
      messageEl.textContent = message;
      messageEl.classList.add("mt-2");

      // Add message to notification element
      notif.appendChild(messageEl);

      // Add notification element to the container
      container.appendChild(notif);
    },
  },
});
