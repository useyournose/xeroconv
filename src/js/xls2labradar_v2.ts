import XLSX from "xlsx";
import csv2labradar from "./csv2labradar";
import { showError } from "./messages";

export default function xls2labradar(fileData:ArrayBuffer,ofilename:string):Promise<string> {
  return new Promise((resolve,reject) => {
    const xlsfile = XLSX.read(fileData, {type:"array"});
    Promise.all(xlsfile.SheetNames.map((sheetname) => {
      const worksheet = xlsfile.Sheets[sheetname]
      const csvdata = XLSX.utils.sheet_to_csv(worksheet);
      const title = csvdata.split('\n')[0].replace(/,{2,}/g,'').replace(/"/g,'');
      //const title = sheetname;
      const result:Promise<string> = csv2labradar(csvdata,title+'.csv')
      result
      .then((value) => {console.log("[xls2labradar]: "+value);resolve})
      .catch((value) => {console.warn("[xls2labradar]: "+value); showError(value);reject})
      console.log("[xls2labradar]: parsed "+sheetname);
    })).then((values) =>resolve(values.toString()))
  })
}