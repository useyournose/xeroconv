import { showSuccess,showError } from "./messages";

export default function download(files:File[]):Promise<boolean|string> {
  return new Promise(async (resolve,reject) => {
    var success = 0
    var failure = 0
    //inspired from https://stackoverflow.com/a/18197341
    await Promise.allSettled(files.map(async (file) => {
      try {
        await file.text().then((value) => {
          const element = document.createElement('a');
          element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(value));
          element.setAttribute('download', file.name);
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          console.log("[download]: file "+ file.name +" saved.");
          showSuccess("Saved " + file.name + ".");
          success++
          return Promise.resolve
        })
      } catch(err) {
        console.error("[download]: " + err);
        failure++
        return Promise.reject
        /*if (Object.hasOwn(err,'message')) {
          reject(err.message)
        } else {
          reject(err);
        }*/
      }
    }))
    .then((results) => {
      if (success == files.length) {
        return resolve(true)
      } else {
        showError("[download]: " + success + " successful and " + failure + " unsuccessful downloads." )
        return reject("[download]: " + success + " successful and " + failure + " unsuccessful downloads." )
      }
    })
  })
}