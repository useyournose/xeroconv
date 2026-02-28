import db from "./js/db";
import {handleFiles} from "./js/handleFiles-json";
import { openModal, closeModal, closeAllModals } from "./js/modals";
import {autoBinDatasets, renderHistogram, renderHistogramOverlay, renderKDEOverlay } from "./js/histogram";
import {renderTable} from "./js/renderTable"
import { GetCheckedShots, MarkFileAsChecked, MarkFileAsUnchecked } from "./js/services/queryService";
import { allowedFileExtensions, allowedFileTypes } from "./js/_types";

document.addEventListener('DOMContentLoaded', () => {
  const feature_IndexedDB = 'indexedDB' in window;

  if (feature_IndexedDB) {
    //wipe indexedDB
    (db.delete().then(async () => await db.open()));
    (document.getElementById('NavAnalyse')).classList.remove('is-hidden');
  }
  
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

  //install button handling https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
  let installPrompt :BeforeInstallPromptEvent = null;
  const installButton = document.querySelector("#install");

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.removeAttribute("hidden");
    //return false;
  });
  
  installButton.addEventListener("click", async () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    disableInAppInstallPrompt();
    /*const result = await installPrompt.prompt();
    console.log(`Install prompt was: ${result.outcome}`);
    disableInAppInstallPrompt();
    installPrompt = null;*/
  });
  
  function disableInAppInstallPrompt() {
    installPrompt = null;
    installButton.setAttribute("hidden", "");
  }

  (document.querySelectorAll('.js-page-trigger') || []).forEach( el => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      const $target = document.getElementById(target);
      (document.querySelectorAll('.js-page-trigger') || []).forEach( elem =>  {
        elem.classList.remove("is-active")
        const target = elem.dataset.target;
        const $target = document.getElementById(target);
        $target.classList.add("is-hidden")
      })
      el.classList.toggle('is-active');
      $target.classList.remove("is-hidden");
    });
  });


  //register Eventlisteners
  (document.getElementById('xero2labradar') as HTMLFormElement)
  .addEventListener("change",(event) => {
      handleFiles((event.target as HTMLInputElement).files, feature_IndexedDB)
      .finally(() => {(event.target as HTMLInputElement).value = ''})
  }, false);

  renderTable;

  (document.getElementById('table'))
  .addEventListener('change', (e) => {
    const target = e.target as HTMLElement | null;
    const targetunits = (document.getElementById('units-imperial') as HTMLFormElement).checked
    if (!target) return;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const checked = target.checked;
      let check
      if (checked) {
        check = MarkFileAsChecked( Number(target.parentElement.parentElement.dataset.fileid))
      } else {
        check = MarkFileAsUnchecked( Number(target.parentElement.parentElement.dataset.fileid))
      }
      check
      .then(() => renderTable)
      .then(() => GetCheckedShots(targetunits))
      //.then( shots => autoBinDatasets(shots))
      //.then( result => renderHistogramOverlay('histogramCanvas', result.labels, result.datasets))
      .then(shots => renderKDEOverlay('histogramCanvas', shots))
    }
  })

  //radio button to switch units
  document.getElementById('units-radio').addEventListener('change', () => {
    const targetunits = (document.getElementById('units-imperial') as HTMLFormElement).checked
    GetCheckedShots(targetunits)
    .then(shots => renderKDEOverlay('histogramCanvas', shots))
    //.then( shots => autoBinDatasets(shots))
    //.then( result => renderHistogramOverlay('histogramCanvas', result.labels, result.datasets))
  });


  // drag and drop files

  document.getElementById("x2l").addEventListener("drop", (event) => {
      event.preventDefault();
      const files = [...event.dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file) => allowedFileTypes.includes(file.type) || allowedFileExtensions.includes(file.name.split('.').pop()))
      handleFiles(files, feature_IndexedDB)
      .finally(() => {(event.target as HTMLInputElement).value = ''})
  });

  document.getElementById("x2l").addEventListener("dragover", (e) => {
  const fileItems = [...e.dataTransfer.items].filter(
    (item) => item.kind === "file",
  );
  if (fileItems.length > 0) {
    e.preventDefault();
    //if (fileItems.some((item) => allowedFileTypes.includes(item.type))) {
      e.dataTransfer.dropEffect = "copy";
    //} else {
    //  fileItems.some((item) => console.log(item.kind))
    //  e.dataTransfer.dropEffect = "none";
    //}
  }
  });

  window.addEventListener("dragover", (e) => {
    const fileItems = [...e.dataTransfer.items].filter(
      (item) => item.kind === "file",
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      if (!(document.getElementById("x2l")).contains(e.target as HTMLInputElement)) {
        e.dataTransfer.dropEffect = "none";
      }
    }
  });

  // prevent the browser from it's default bahaviour of downloading drag&dropped files
  window.addEventListener("drop", (e) => {
    if ([...e.dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  });

});



