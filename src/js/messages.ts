let timeoutid:Timer;

function showNotification(message:string,classlist:string) {
  // inspired from https://www.w3schools.com/howto/howto_js_snackbar.asp
  // Get the snackbar DIV
  const x = document.getElementById("snackbar");
  if (null != x) {
    const elem = document.createElement("div");
    elem.classList.value = classlist;
    elem.id=crypto.randomUUID();
    elem.innerText=message
    x.appendChild(elem)
    setTimeout(function(){document.getElementById(elem.id)?.remove();}, 3000);
    // Add the "show" class to DIV
    x.className = "show";
    clearTimeout(timeoutid)
    // After 3 seconds, remove the show class from DIV
    timeoutid = setTimeout(function(){ x.className = x.className.replace("show", "")}, 3000);
  }
}

export function showError(message:string) {
  showNotification(message,'notification is-danger')
}

export function showSuccess(message:string) {
  showNotification(message,'notification is-success')
}