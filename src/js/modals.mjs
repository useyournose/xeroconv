
  // Functions to open and close a modal
export function openModal($el) {
  $el.classList.add('is-active');
}

export function closeModal($el) {
  $el.classList.remove('is-active');
}

export function closeAllModals() {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
  });
}