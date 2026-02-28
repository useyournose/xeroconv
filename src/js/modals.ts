
  // Functions to open and close a modal
export function openModal($el:Element) {
  $el.classList.add('is-active');
}

export function closeModal($el:Element) {
  if ($el.id =='modal-download') {
    var shareButton = document.getElementById('dl-share');
    shareButton.replaceWith(shareButton.cloneNode(true) as HTMLElement)
    var dlButton = document.getElementById('dl-store');
    dlButton.replaceWith(dlButton.cloneNode(true) as HTMLElement)
  }
  $el.classList.remove('is-active');
}

export function closeAllModals() {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
      closeModal($modal);
  });
}