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
    (document.getElementById('NavAnalyse') as HTMLElement).classList.remove('is-hidden');
  }
  
  // Add a click event on buttons to open a specific modal
  document.querySelectorAll<HTMLElement>('.js-modal-trigger').forEach(($trigger) => {
    const modalId = $trigger.dataset.target;
    if (!modalId) return;

    const $target = document.getElementById(modalId);
    if (!$target) return;

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  document.querySelectorAll<HTMLElement>('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button').forEach(($close) => {
    const $target = $close.closest('.modal') as HTMLElement | null;
    if (!$target) return;

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
  document.querySelectorAll<HTMLElement>('.navbar-burger').forEach((el) => {
    el.addEventListener('click', () => {
      // Get the target from the "data-target" attribute
      const target = el.dataset.target;
      if (!target) return;

      const $target = document.getElementById(target);
      if (!$target) return;

      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      el.classList.toggle('is-active');
      $target.classList.toggle('is-active');
    });
  });

  //install button handling https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt
  let installPrompt: BeforeInstallPromptEvent | null = null;
  const installButton = document.querySelector<HTMLElement>('#install');

  if (!installButton) {
    return;
  }

  window.addEventListener("beforeinstallprompt", (event: Event) => {
    const beforeInstallEvent = event as BeforeInstallPromptEvent;
    event.preventDefault();
    installPrompt = beforeInstallEvent;
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

  document.querySelectorAll<HTMLElement>('.js-page-trigger').forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.dataset.target;
      if (!target) return;

      const $target = document.getElementById(target);
      if (!$target) return;

      document.querySelectorAll<HTMLElement>('.js-page-trigger').forEach((elem) => {
        elem.classList.remove("is-active");
        const elemTarget = elem.dataset.target;
        const $elemTarget = elemTarget ? document.getElementById(elemTarget) : null;
        if ($elemTarget) {
          $elemTarget.classList.add("is-hidden");
        }
      });

      el.classList.toggle('is-active');
      $target.classList.remove("is-hidden");
    });
  });


  //register Eventlisteners
  const xeroInput = document.getElementById('xero2labradar') as HTMLInputElement | null;
  xeroInput?.addEventListener("change", (event) => {
      const input = event.target as HTMLInputElement;
      const files = input.files ?? [];
      handleFiles(files, feature_IndexedDB)
      .finally(() => { input.value = ''; });
  }, false);

  const rangecraftInput = document.getElementById('rangecraft2labradar') as HTMLInputElement | null;
  rangecraftInput?.addEventListener("change", (event) => {
      const input = event.target as HTMLInputElement;
      const files = input.files ?? [];
      handleFiles(files, feature_IndexedDB, 1)
      .finally(() => { input.value = ''; });
  }, false);

  const renderTableButton = document.getElementById('table');
  renderTableButton?.addEventListener('change', (e) => {
    const target = e.target as HTMLElement | null;
    const unitsImperial = (document.getElementById('units-imperial') as HTMLInputElement | null)?.checked ?? false;
    if (!target) return;
    if (target instanceof HTMLInputElement && target.type === 'checkbox') {
      const checked = target.checked;
      const row = target.closest('tr');
      const fileId = row?.dataset.fileid;
      if (!fileId) return;

      let check;
      if (checked) {
        check = MarkFileAsChecked(Number(fileId));
      } else {
        check = MarkFileAsUnchecked(Number(fileId));
      }
      check
      .then(() => renderTable())
      .then(() => GetCheckedShots(unitsImperial))
      //.then( shots => autoBinDatasets(shots))
      //.then( result => renderHistogramOverlay('histogramCanvas', result.labels, result.datasets))
      .then(shots => renderKDEOverlay('histogramCanvas', shots));
    }
  });

  //radio button to switch units
  const unitsRadio = document.getElementById('units-radio');
  unitsRadio?.addEventListener('change', () => {
    const targetunits = (document.getElementById('units-imperial') as HTMLInputElement | null)?.checked ?? false;
    GetCheckedShots(targetunits)
    .then(shots => renderKDEOverlay('histogramCanvas', shots));
    //.then( shots => autoBinDatasets(shots))
    //.then( result => renderHistogramOverlay('histogramCanvas', result.labels, result.datasets))
  });


  // drag and drop files
  const x2l = document.getElementById("x2l");
  x2l?.addEventListener("drop", (event) => {
      event.preventDefault();
      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) return;

      const files = [...dataTransfer.items]
      .map((item) => item.getAsFile())
      .filter((file): file is File => !!file)
      .filter((file) => allowedFileTypes.includes(file.type) || allowedFileExtensions.includes(file.name.split('.').pop() ?? ''));
      handleFiles(files, feature_IndexedDB)
      .finally(() => {
        const input = event.target as HTMLInputElement | null;
        if (input) input.value = '';
      });
  });

  x2l?.addEventListener("dragover", (e) => {
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;

    const fileItems = [...dataTransfer.items].filter(
      (item) => item.kind === "file",
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      //if (fileItems.some((item) => allowedFileTypes.includes(item.type))) {
      dataTransfer.dropEffect = "copy";
      //} else {
      //  fileItems.some((item) => console.log(item.kind))
      //  dataTransfer.dropEffect = "none";
      //}
    }
  });

  window.addEventListener("dragover", (e) => {
    const dataTransfer = e.dataTransfer;
    if (!dataTransfer) return;

    const fileItems = [...dataTransfer.items].filter(
      (item) => item.kind === "file",
    );
    if (fileItems.length > 0) {
      e.preventDefault();
      const x2lTarget = document.getElementById("x2l");
      if (x2lTarget && !x2lTarget.contains(e.target as Node)) {
        dataTransfer.dropEffect = "none";
      }
    }
  });

  // prevent the browser from it's default bahaviour of downloading drag&dropped files
  window.addEventListener("drop", (e) => {
    const dataTransfer = e.dataTransfer;
    if (dataTransfer && [...dataTransfer.items].some((item) => item.kind === "file")) {
      e.preventDefault();
    }
  });

});



