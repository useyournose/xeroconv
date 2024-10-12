import XLSX from "xlsx";
import csv2labradar from "./csv2labradar";

export default function xls2labradar(fileData:ArrayBuffer,ofilename:string) {
    const xlsfile = XLSX.read(fileData, {type:"array"});
    for (const sheetname of xlsfile.SheetNames) {
      var worksheet = xlsfile.Sheets[sheetname]
      const csvdata = XLSX.utils.sheet_to_csv(worksheet);
      var title = csvdata.split('\n')[0].replace(',','');
      csv2labradar(csvdata,title+'.csv')
      console.log(sheetname);
    }
}