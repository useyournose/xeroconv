import fit2labradar from "./fit2labradar";
import csv2labradar from "./csv2labradar";
//import xls2labradar from "./xls2labradar";
import xls2labradar from "./xls2labradar_v2";
import { showError } from "./messages";

export default function handleFiles() {
  const fileList = this.files;
  const sourceid = this.id;
  if (fileList.length == 0) {
    console.log("[handlefiles]: no Files in " + sourceid);
    return;
  }

  for (const file of fileList) {
    const fileReader = new FileReader();
    const filename = file.name;
    
    fileReader.onload = async function (event) {
      if (event.target) {
        const FileData = event.target.result as ArrayBuffer;
        if (sourceid == 'fit2labradar') {
          const result_f:Promise<string> = fit2labradar(FileData, filename)
          result_f.then((value) => {console.log("[handlefiles]: success")},(error) => {showError(error)});
        } else if (sourceid == 'csv2labradar') {
          const result_c:Promise<string> = csv2labradar(FileData, filename);
          result_c.then((value) => {console.log("[handlefiles]: success")},(error) => {showError(error)});
        } else if (sourceid == 'xls2labradar') {
          const result_x:Promise<string> = xls2labradar(FileData, filename);
          result_x.then((value) => {console.log("[handlefiles]: success")},(error) => {showError(error)});
        } else {
          console.error('[handlefiles]: what is ' + sourceid + ' doing here?');
        }
      }
    };
    fileReader.readAsArrayBuffer(file);
  }
  (document.getElementById(sourceid) as HTMLFormElement).value = "";
}
