import fit2labradar from "./fit2labradar.mjs";
import csv2labradar from "./csv2labradar.mjs";
import xls2labradar from "./xls2labradar.mjs";

export default function handleFiles() {
  let fileList = this.files;
  let sourceid = this.id;
  if (fileList.length == 0) {
    console.log("no Files in " + source);
    return;
  }

  for (const file of fileList) {
    let fileReader = new FileReader();
    fileReader.onload = function (event) {
      let FileData = event.target.result;
      let filename = event.target.fileName;
      if (event.target.sourceid == 'fit2labradar') {
        fit2labradar(FileData, filename);
      } else if (event.target.sourceid == 'csv2labradar') {
        csv2labradar(FileData, filename);
      } else if (event.target.sourceid == 'xls2labradar') {
        xls2labradar(FileData, filename);
      } else {
        console.error('what is ' + event.target.sourceid + ' doing here?');
      }
    };
    fileReader.fileName = file.name;
    fileReader.readAsArrayBuffer(file);
    fileReader.sourceid = sourceid;
  }
  document.getElementById(sourceid).value = "";
}
