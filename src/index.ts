//import handleFiles from "./js/handleFiles";
import { openModal, closeModal, closeAllModals } from "./js/modals";
import { BeforeInstallPromptEvent, LaunchParams } from "./js/_types";
import { handleFilesPwa } from "./js/handlefiles-pwa";

document.addEventListener('DOMContentLoaded', () => {

  // Add a click event on buttons to open a specific modal
  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);
    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');
    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });

  // Add a keyboard event to close all modals
  document.addEventListener('keydown', (event) => {
    if(event.key === "Escape") {
      closeAllModals();
    }
  });

  // Get all "navbar-burger" elements
  (document.querySelectorAll('.navbar-burger') || []).forEach( el => {
    el.addEventListener('click', () => {
      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      const $target = document.getElementById(target);
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');
    });
  });

  // handle launch queue when started via file-handler
  if ('launchQueue' in window) {
    console.log('File Handling API is supported!');
      if ('setConsumer' in window.launchQueue) {
      window.launchQueue.setConsumer((launchParams) => {
          console.log(launchParams.files)
          if (launchParams.files.length > 0) {
            handleFilesPwa(launchParams.files);
          }
      });
    }
  } else {
      console.error('File Handling API is not supported!');
  }


  //install button handling https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
  let installPrompt:BeforeInstallPromptEvent = null;
  const installButton = document.querySelector("#install");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.removeAttribute("hidden");
  });
  
  installButton.addEventListener("click", async () => {
    if (!installPrompt) {
      return;
    }
    const result = await installPrompt.prompt();
    console.log(`Install prompt was: ${result.outcome}`);
    disableInAppInstallPrompt();
  });
  
  function disableInAppInstallPrompt() {
    installPrompt = null;
    installButton.setAttribute("hidden", "");
  }


  /*total
  failed
  */
  if (localStorage.total) {
    console.log("total process: ", localStorage.total)
  } else {
    console.log("no storage there, creating it.");
    localStorage.total = "0"
  }

});

//registetr Eventlisteners
(document.querySelectorAll('#fit2labradar, #csv2labradar, #xls2labradar')).forEach((element) => {
  element.addEventListener("change",(event) => {
    handleFilesPwa((event.target as HTMLInputElement).files)
  }, false);
});

