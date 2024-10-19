import { showSuccess } from "./messages";

export default function download(text:string,filename:string):Promise<boolean|string> {
  return new Promise((resolve,reject) => {
    try {
      //inspired from https://stackoverflow.com/a/18197341
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
    
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      console.log("[download]: file "+ filename +" saved.");
      showSuccess("Saved " + filename + ".");
      resolve(true)
    } catch(err) {
      console.error("[download]: " + err);
      if (Object.hasOwn(err,'message')) {
        reject(err.message)
      } else {
        reject(err);
      }
    }
  }
)}