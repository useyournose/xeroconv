import XLSX from "xlsx";
import csv2labradar from "./csv2labradar";
import { showError } from "./messages";

export default async function xls2labradar(fileData:ArrayBuffer,ofilename:string) {
  const xlsfile = XLSX.read(fileData, {type:"array"});
  for (const sheetname of xlsfile.SheetNames) {
    const worksheet = xlsfile.Sheets[sheetname]
    const csvdata = XLSX.utils.sheet_to_csv(worksheet);
    const title = csvdata.split('\n')[0].replace(/,{2,}/g,'').replace(/"/g,'');
    //const title = sheetname;
    const result:Promise<string> = csv2labradar(csvdata,title+'.csv')
    result
    .then((value) => {console.log("[xls2labradar]: "+value)})
    .catch((value) => {console.warn("[xls2labradar]: "+value); showError(value)})
    console.log("[xls2labradar]: parsed "+sheetname);
  }
}