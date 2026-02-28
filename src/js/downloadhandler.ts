import { showSuccess,showError } from "./messages";
import { closeModal, openModal } from "./modals";
import downloadFiles  from "./downloadFiles";

export default function download(files:File[]):Promise<boolean|string> {

  function cleanfiles() {
    var junk
    while (files.length > 0) {
      junk = files.pop()
    }
    return true
  }

  var sharing = false

  return new Promise(async (resolve,reject) => {
    /*if (navigator.canShare && navigator.canShare({files}) && sharing === false) {
      console.log('Sharing files is supported');
      const target = document.getElementById('modal-download');
      const shareButton = document.getElementById('dl-share');
      const dlButton = document.getElementById('dl-store');
      sharing = true
      shareButton.addEventListener('click', async () => {
        try{
          await navigator.share({title : "Open Files", text : "with your preferred app", files})
          .then((res) => {
            console.log("[download]: file saved.", res);
            showSuccess("Saved via fileshare.");
            return resolve(true);
            sharing = false
          })
          .catch((err) => {
            cleanfiles()
            showError(`The file could not be shared: ${err}`)
            console.error(`The file could not be shared: ${err}`);
            sharing = false
            return reject(err)
          })
          .finally(() => {closeModal(target); cleanfiles()})
        } catch (err) {
          showError(`The file could not be shared: ${err}`)
          console.error(`The file could not be shared: ${err}`);
          closeModal(target);
          sharing = false
          return reject(err);   
        }
      })
        
      dlButton.addEventListener('click', () => {
        downloadFiles(files)
        closeModal(target)
      })

      target.addEventListener('close', cleanfiles)

      openModal(target);
    } else {
      console.info('Sharing files is not supported');*/
      //inspired from https://stackoverflow.com/a/18197341
      return downloadFiles(files).then(() => {cleanfiles;true})
    //}
  })
}