let timeoutid;

function showNotification(message,classlist) {
  // inspired from https://www.w3schools.com/howto/howto_js_snackbar.asp
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
  var elem = document.createElement('div');
  elem.classList=classlist;
  elem.id=crypto.randomUUID();
  elem.innerText=message
  x.appendChild(elem)
  setTimeout(function(){document.getElementById(elem.id).remove();}, 3000);
  // Add the "show" class to DIV
  x.className = "show";
  clearTimeout(timeoutid)
  // After 3 seconds, remove the show class from DIV
  timeoutid = setTimeout(function(){ x.className = x.className.replace("show", "")}, 3000);
}

function showError(message) {
  showNotification(message,'notification is-danger')
}

function showSuccess(message) {
  showNotification(message,'notification is-success')
}

module.exports = {showError, showSuccess};