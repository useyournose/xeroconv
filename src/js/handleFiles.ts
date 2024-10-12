import fit2labradar from "./fit2labradar";
import csv2labradar from "./csv2labradar";
import xls2labradar from "./xls2labradar";

export default function handleFiles() {
  let fileList = this.files;
  let sourceid = this.id;
  if (fileList.length == 0) {
    console.log("no Files in " + sourceid);
    return;
  }

  for (const file of fileList) {
    let fileReader = new FileReader();
    const filename = file.name;
    
    fileReader.onload = function (event) {
      if (event.target) {
        let FileData = event.target.result as ArrayBuffer;
        if (sourceid == 'fit2labradar') {
          fit2labradar(FileData, filename);        
        } else if (sourceid == 'csv2labradar') {
          csv2labradar(FileData, filename);
        } else if (sourceid == 'xls2labradar') {
          xls2labradar(FileData, filename);
        } else {
          console.error('what is ' + sourceid + ' doing here?');
        }
      }
    };
    fileReader.readAsArrayBuffer(file);
  }
  (document.getElementById(sourceid) as HTMLFormElement).value = "";
}
