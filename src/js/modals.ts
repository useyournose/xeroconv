
  // Functions to open and close a modal
export function openModal($el:Element) {
  $el.classList.add('is-active');
}

export function closeModal($el:Element) {
  $el.classList.remove('is-active');
}

export function closeAllModals() {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
  });
}