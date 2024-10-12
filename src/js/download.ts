import { showSuccess } from "./messages";

function download(text:string,filename:string):void {
    //inspired from https://stackoverflow.com/a/18197341
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    console.log("file "+ filename +" saved.");
    showSuccess("Saved " + filename + ".");
  }

export default download;